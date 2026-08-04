import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import {
  inspectRuntimeAssets,
  isForbiddenRuntimeAsset
} from '../frontend/scripts/check-cdn-paths.mjs';
import {
  ADMIN_RUNTIME_ENHANCEMENT_STYLE,
  ADMIN_RUNTIME_ENHANCEMENT_SCRIPT
} from '../frontend/scripts/admin-runtime-enhancements.mjs';
import {
  destroyTrendChart,
  renderTrendChart
} from '../frontend/src/lib/chart.js';

function loadEnhancementTestHooks(documentOverrides = {}, windowOverrides = {}) {
  const inlineScript = ADMIN_RUNTIME_ENHANCEMENT_SCRIPT
    .replace(/^<script[^>]*>\n?/, '')
    .replace(/<\/script>$/, '');
  const closureEnd = inlineScript.lastIndexOf('})();');
  assert.notEqual(closureEnd, -1, 'enhancement script must use the expected closure');
  const instrumentedScript = inlineScript.slice(0, closureEnd)
    + 'window.__enhancementTestHooks = { formatD1SchemaStatus, formatD1InitializationResult, formatD1RepairPlan, formatD1RepairError, patchSafetyContractMethods, getDashboardMonthPeriodKey, isDashboardMonthlyTrafficCacheFresh, toggleDashboardTrafficPeriod, dashboardTrafficState, normalizeHeadProbeResult, formatHeadProbeResult, normalizeHostPrefixDnsHostname, isHostPrefixNodeLinkActive, runWithConcurrency, NODE_GET_PROBE_CONCURRENCY };\n'
    + inlineScript.slice(closureEnd);
  const window = {
    addEventListener() {},
    crypto: globalThis.crypto,
    fetch: globalThis.fetch,
    setTimeout() { return 1; },
    clearTimeout() {},
    prompt() { return 'recent-admin-password'; },
    ...windowOverrides
  };
  const document = {
    readyState: 'loading',
    addEventListener() {},
    getElementById() { return null; },
    querySelector() { return null; },
    ...documentOverrides
  };
  vm.runInNewContext(instrumentedScript, {
    AbortController,
    Blob,
    console: windowOverrides.console || { error() {} },
    crypto: globalThis.crypto,
    document,
    Headers,
    Response,
    TextEncoder,
    Uint8Array,
    URL: windowOverrides.URL || URL,
    window
  });
  return window.__enhancementTestHooks;
}

test('admin runtime enhancement observes lazily mounted logs view', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /shellHookSelector = '[^']*#view-logs/);
});

test('host-prefix node links follow the effective runtime mode and strict hostname', async () => {
  const { normalizeHostPrefixDnsHostname, patchSafetyContractMethods } = loadEnhancementTestHooks({}, {
    location: { origin: 'https://proxy.example' }
  });
  assert.equal(normalizeHostPrefixDnsHostname(' Proxy.Example. '), 'proxy.example');
  for (const invalidHost of [
    'https://proxy.example/',
    'proxy.example:443',
    'proxy.example/path',
    'proxy_example',
    '*.proxy.example',
    '192.0.2.1',
    'proxy..example'
  ]) {
    assert.equal(normalizeHostPrefixDnsHostname(invalidHost), '', invalidHost);
  }

  const app = {
    hostDomain: 'proxy.example',
    runtimeConfig: { enableHostPrefixProxy: true },
    buildNodeLinkPath(node, kind = 'main') {
      const variant = kind === 'main' ? '' : '/' + kind;
      return node.entryMode === 'host_prefix' ? variant : '/' + node.name + variant;
    }
  };
  patchSafetyContractMethods(app);
  const node = { name: 'alpha', entryMode: 'host_prefix' };

  assert.equal(app.buildNodeLink(node), 'https://alpha.proxy.example');
  assert.equal(app.buildNodeLink(node, 'proxy_a'), 'https://alpha.proxy.example/proxy_a');

  app.runtimeConfig.enableHostPrefixProxy = false;
  assert.equal(app.buildNodeLink(node), 'https://proxy.example/alpha');
  assert.equal(app.buildNodeLink(node, 'proxy_b'), 'https://proxy.example/alpha/proxy_b');

  app.runtimeConfig.enableHostPrefixProxy = true;
  app.hostDomain = 'https://proxy.example/';
  assert.equal(app.buildNodeLink(node), 'https://proxy.example/alpha');

  const nodesPanel = await readFile(new URL('../frontend/src/features/nodes/NodesPanel.vue', import.meta.url), 'utf8');
  assert.match(nodesPanel, /const hostPrefixProxyEnabled = computed/);
  assert.match(nodesPanel, /hostPrefixActive \? 'Host Prefix 入口' : '主域入口'/);
  assert.match(nodesPanel, /normalizeHostPrefixDnsHostname\(hostDomain\.value\)/);
});

test('node line editor stacks its heading and actions on mobile', () => {
  assert.match(
    ADMIN_RUNTIME_ENHANCEMENT_STYLE,
    /@media \(max-width:767px\)\{#node-modal \[data-admin-node-lines-panel="1"\]>div:first-child\{align-items:stretch;flex-direction:column\}/
  );
  assert.match(
    ADMIN_RUNTIME_ENHANCEMENT_STYLE,
    /\[data-admin-node-lines-panel="1"\]>div:first-child>div:last-child\{width:100%\}/
  );
  assert.match(
    ADMIN_RUNTIME_ENHANCEMENT_STYLE,
    /\[data-admin-node-lines-panel="1"\]>div:first-child>div:last-child button\{flex:1 1 0;min-width:0\}/
  );
});

test('node advanced settings stay within the mobile modal width', () => {
  assert.match(
    ADMIN_RUNTIME_ENHANCEMENT_STYLE,
    /#node-modal \[data-admin-node-advanced-content="1"\],#node-modal \[data-admin-node-advanced-fields="1"\],#node-modal \[data-admin-node-advanced-headers="1"\]\{min-width:0;max-width:100%\}/
  );
  assert.match(
    ADMIN_RUNTIME_ENHANCEMENT_STYLE,
    /@media \(max-width:767px\).*\[data-admin-node-advanced-fields="1"\]\{grid-template-columns:minmax\(0,1fr\) !important\}/
  );
  assert.match(
    ADMIN_RUNTIME_ENHANCEMENT_STYLE,
    /\[data-admin-node-advanced-headers="1"\] #headers-container>div>input\{flex:1 1 100%;width:100%\}/
  );
});

test('settings dirty tracking compares normalized state without JSON serialization', async () => {
  const settingsPanel = await readFile(
    new URL('../frontend/src/features/settings/SettingsPanel.vue', import.meta.url),
    'utf8'
  );
  assert.match(settingsPanel, /const baseComparableFormState = computed/);
  assert.match(settingsPanel, /function areComparableFormStatesEqual/);
  assert.doesNotMatch(settingsPanel, /serializeFormState|JSON\.stringify\(\{[\s\S]*settingsExperienceMode/);
});

test('trend charts are isolated per canvas and cancelled after teardown', async () => {
  class FakeChart {
    static instances = [];

    constructor(canvas) {
      this.canvas = canvas;
      this.destroyed = false;
      FakeChart.instances.push(this);
    }

    destroy() {
      this.destroyed = true;
    }
  }

  const firstCanvas = { isConnected: true };
  const secondCanvas = { isConnected: true };
  const firstChart = await renderTrendChart(firstCanvas, [], { Chart: FakeChart });
  const secondChart = await renderTrendChart(secondCanvas, [], { Chart: FakeChart });
  assert.equal(firstChart.destroyed, false);
  assert.equal(secondChart.destroyed, false);

  destroyTrendChart(firstCanvas);
  assert.equal(firstChart.destroyed, true);
  assert.equal(secondChart.destroyed, false);

  let resolveChartModule;
  const detachedCanvas = { isConnected: true };
  const pendingRender = renderTrendChart(detachedCanvas, [], {
    loadChart: () => new Promise(resolve => {
      resolveChartModule = resolve;
    })
  });
  destroyTrendChart(detachedCanvas);
  resolveChartModule({ default: FakeChart });
  assert.equal(await pendingRender, null);
  assert.equal(FakeChart.instances.length, 2);
  destroyTrendChart(secondCanvas);
});

test('overview chart has one lifecycle-driven render path', async () => {
  const overviewPanel = await readFile(
    new URL('../frontend/src/features/overview/OverviewPanel.vue', import.meta.url),
    'utf8'
  );
  assert.match(overviewPanel, /watch\(\[chartPoints, canvasRef\]/);
  assert.doesNotMatch(overviewPanel, /onMounted/);
  assert.match(overviewPanel, /destroyTrendChart\(canvasRef\.value\)/);
});

test('dashboard refresh separates stats, runtime status, and D1 hotspot failures', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('getDashboardCachedSnapshot'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('getDashboardCoreStats'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('getRuntimeStatus'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('getDashboardD1WriteHotspot'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /function retainDashboardD1WriteHotspotInStats/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /d1WriteHotspot: hotspot/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /void this\.apiCall\('getDashboardD1WriteHotspot'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /Promise\.allSettled\(\[statsTask, runtimeTask\]\)/);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /refreshTasks\.push\(hotspotTask\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /已保留其余可用状态/);
});

test('dashboard core stats cannot replace a loaded D1 hotspot with its idle placeholder', () => {
  const { patchSafetyContractMethods } = loadEnhancementTestHooks();
  const loadedHotspot = { status: 'success', summary: 'loaded hotspot' };
  const idleHotspot = { status: 'idle', summary: 'D1 写入热点尚未加载' };
  const app = {
    dashboardD1WriteHotspot: loadedHotspot,
    applyDashboardStatsState(stats) {
      this.dashboardD1WriteHotspot = stats.d1WriteHotspot || idleHotspot;
    }
  };

  patchSafetyContractMethods(app);
  app.applyDashboardStatsState({ d1WriteHotspot: idleHotspot });

  assert.equal(app.dashboardD1WriteHotspot, loadedHotspot);
});

test('dashboard traffic card exposes an on-demand day and month toggle', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-dashboard-traffic-toggle/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-lucide="repeat-2"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('getMonthlyTrafficStats'\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /今日视频流量 \(CF Zone 总流量\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /本月视频流量 \(CF Zone 总流量\)/);
});

test('monthly traffic cache is reusable only for a successful unexpired current-month result', () => {
  const {
    getDashboardMonthPeriodKey,
    isDashboardMonthlyTrafficCacheFresh,
    dashboardTrafficState
  } = loadEnhancementTestHooks();
  const app = { runtimeConfig: { scheduleUtcOffsetMinutes: 480 } };
  const july = Date.parse('2026-07-25T04:00:00.000Z');
  const august = Date.parse('2026-08-01T04:00:00.000Z');

  dashboardTrafficState.monthly = { count: '1 GB' };
  dashboardTrafficState.monthlyPeriodKey = getDashboardMonthPeriodKey(app, july);
  dashboardTrafficState.monthlyExpiresAt = july + 30 * 60 * 1000;
  dashboardTrafficState.monthlyAvailable = true;
  assert.equal(isDashboardMonthlyTrafficCacheFresh(app, july), true);
  assert.equal(isDashboardMonthlyTrafficCacheFresh(app, july + 30 * 60 * 1000), false);
  assert.equal(isDashboardMonthlyTrafficCacheFresh(app, august), false);

  dashboardTrafficState.monthlyPeriodKey = getDashboardMonthPeriodKey(app, august);
  dashboardTrafficState.monthlyExpiresAt = august + 30 * 60 * 1000;
  dashboardTrafficState.monthlyAvailable = false;
  assert.equal(isDashboardMonthlyTrafficCacheFresh(app, august), false);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /String\(payload\?\.cacheStatus \|\| 'live'\)[\s\S]*?!== 'stale'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /querySucceeded \? monthlyView : \(retainedMonthly \|\| monthlyView\)/);
});

test('a stale monthly traffic fallback stays visible but remains retryable', async () => {
  const {
    getDashboardMonthPeriodKey,
    isDashboardMonthlyTrafficCacheFresh,
    toggleDashboardTrafficPeriod,
    dashboardTrafficState
  } = loadEnhancementTestHooks();
  const app = {
    runtimeConfig: { scheduleUtcOffsetMinutes: 480 },
    async apiCall() {
      return {
        periodKey: getDashboardMonthPeriodKey(app),
        traffic: '1 GB',
        totalBytes: 1024 ** 3,
        cfAnalyticsLoaded: true,
        cacheStatus: 'stale',
        warning: 'refresh failed'
      };
    }
  };

  await toggleDashboardTrafficPeriod(app);
  assert.equal(dashboardTrafficState.period, 'month');
  assert.equal(dashboardTrafficState.monthly?.count, '1 GB');
  assert.equal(dashboardTrafficState.monthlyAvailable, false);
  assert.equal(dashboardTrafficState.monthlyExpiresAt, 0);
  assert.equal(isDashboardMonthlyTrafficCacheFresh(app), false);
});

test('backup view exposes only the paired Worker and HTML upload flow', async () => {
  const template = await readFile(new URL('../frontend/admin-runtime.template.html', import.meta.url), 'utf8');
  const cdnChecker = await readFile(new URL('../frontend/scripts/check-cdn-paths.mjs', import.meta.url), 'utf8');
  const vueRuntimeConfig = await readFile(new URL('../frontend/src/config/runtime.js', import.meta.url), 'utf8');
  const vueAdminConsole = await readFile(new URL('../frontend/src/composables/useAdminConsole.js', import.meta.url), 'utf8');
  assert.match(template, /id:"admin-worker-html-update-root"/);
  assert.doesNotMatch(template, /cfg-release-repo|cfg-release-branch|cfg-release-tag|cfg-index-url/);
  assert.doesNotMatch(template, /releaseRepo|releaseBranch|releaseTag|buildGithubReleaseSourceState/);
  assert.doesNotMatch(template, /updateWorkerScriptContent|从 GitHub 拉取并更新 Worker/);
  assert.match(template, /\\u4fdd\\u5b58\\u9759\\u6001\\u8d44\\u6e90\\u7b56\\u7565/);
  assert.doesNotMatch(template, /\\u4fdd\\u5b58\\u9759\\u6001\\u8d44\\u6e90\\u7b56\\u7565\\u4e0e\\u53d1\\u5e03\\u6e90/);
  assert.doesNotMatch(cdnChecker, /Release-only/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('updateWorkerAndAdminIndex'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /workerFileName: state\.workerFile\.name/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /indexFileName: state\.indexFile\.name/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /waitForAdminShellRevision/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /X-Admin-Shell-Revision/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /delays = \[500, 1000, 2000, 4000, 8000\]/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /navigateWithAdminCacheBust/);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /window\.location\.reload\(\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /必须同时选择 worker\.js 和 index\.html/);
  assert.doesNotMatch(vueRuntimeConfig, /VITE_INDEX_URL|VITE_RELEASE_INDEX_URL/);
  assert.doesNotMatch(vueAdminConsole, /updateWorkerScriptContent|releaseRepo|releaseBranch|releaseTag/);
  assert.match(vueAdminConsole, /callAdminAction\('updateWorkerAndAdminIndex'/);
  assert.match(vueAdminConsole, /workerScriptContent/);
  assert.match(vueAdminConsole, /indexHtml/);
});

test('node GET probes use the fixed public-info path without path selectors', async () => {
  const [template, runtimeIndex, nodesPanel, adminConsole, settingsPanel] = await Promise.all([
    readFile(new URL('../frontend/admin-runtime.template.html', import.meta.url), 'utf8'),
    readFile(new URL('../frontend/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../frontend/src/features/nodes/NodesPanel.vue', import.meta.url), 'utf8'),
    readFile(new URL('../frontend/src/composables/useAdminConsole.js', import.meta.url), 'utf8'),
    readFile(new URL('../frontend/src/features/settings/SettingsPanel.vue', import.meta.url), 'utf8')
  ]);
  assert.match(template, /nodeModalProbePath:"\/emby\/system\/info\/public"/);
  assert.doesNotMatch(runtimeIndex, /globalHeadProbePath|nodeModalProbePath/);
  assert.doesNotMatch(runtimeIndex, /aria-label":"\\u5168\\u5c40 HEAD \\u63a2\\u6d4b\\u8def\\u5f84/);
  assert.doesNotMatch(runtimeIndex, /aria-label":"HEAD \\u63a2\\u6d4b\\u8def\\u5f84/);
  assert.match(runtimeIndex, /GET_PROBE_PATH = '\/emby\/system\/info\/public'/);
  assert.match(runtimeIndex, /全局 GET 测试/);
  assert.match(runtimeIndex, /GET \\u5ef6\\u8fdf/);
  assert.doesNotMatch(runtimeIndex, /HEAD \\u5ef6\\u8fdf/);
  assert.match(runtimeIndex, /probePath\s*\}/);
  assert.match(runtimeIndex, /pingTimeout:1e4/);
  assert.match(runtimeIndex, /pingTimeout:\{fallback:1e4,min:1e3,max:18e4\}/);
  assert.match(runtimeIndex, /GET \\u8d85\\u65f6\\u65f6\\u95f4/);
  assert.match(runtimeIndex, /hedgeProbePreferGet:!0/);
  assert.match(runtimeIndex, /"hedgeFailoverEnabled","hedgeProbePreferGet","hedgeProbePath"/);
  assert.match(runtimeIndex, /booleanTrueFields:\[[^\]]*"hedgeProbePreferGet"/);
  assert.match(runtimeIndex, /key:"hedgeProbePreferGet",id:"cfg-hedge-probe-prefer-get",kind:"checkbox",checkboxMode:"defaultTrue"/);
  assert.match(runtimeIndex, /cfg-hedge-probe-prefer-get/);
  assert.doesNotMatch(nodesPanel, /HEAD_PROBE_PATH_OPTIONS|headProbePath/);
  assert.match(nodesPanel, /handleGlobalHeadProbe/);
  assert.match(nodesPanel, /globalHeadProbePending/);
  assert.match(nodesPanel, /全局 GET 测试/);
  assert.match(nodesPanel, /runWithConcurrency\(currentNodes, NODE_GET_PROBE_CONCURRENCY/);
  assert.doesNotMatch(adminConsole, /options\.probePath/);
  assert.match(settingsPanel, /pingTimeout: '10000'/);
  assert.match(settingsPanel, /GET 超时时间 \(ms\)/);
  assert.match(settingsPanel, /hedgeProbePreferGet: true/);
  assert.match(settingsPanel, /优先使用 GET 请求方式/);
});

test('global node GET probes use a bounded concurrent request pool', async () => {
  const { runWithConcurrency, NODE_GET_PROBE_CONCURRENCY } = loadEnhancementTestHooks();
  let activeCount = 0;
  let maxActiveCount = 0;
  const releases = [];
  const started = [];
  const run = runWithConcurrency(
    Array.from({ length: 9 }, (_, index) => index),
    NODE_GET_PROBE_CONCURRENCY,
    async (item) => {
      activeCount += 1;
      maxActiveCount = Math.max(maxActiveCount, activeCount);
      started.push(item);
      await new Promise((resolve) => releases.push(resolve));
      activeCount -= 1;
    }
  );

  await Promise.resolve();
  assert.equal(NODE_GET_PROBE_CONCURRENCY, 4);
  assert.equal(started.length, 4);
  while (releases.length) {
    releases.shift()();
    await Promise.resolve();
  }
  await run;
  assert.equal(maxActiveCount, 4);
  assert.deepEqual(started, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /runWithConcurrency\(nodes, NODE_GET_PROBE_CONCURRENCY/);
});

test('GET probe results distinguish HTTP and transport failures from true timeout', () => {
  const { normalizeHeadProbeResult, formatHeadProbeResult } = loadEnhancementTestHooks();
  const slowSuccess = normalizeHeadProbeResult({
    probe: {
      ok: true,
      reason: 'ok',
      statusCode: 200,
      elapsedMs: 6500,
      methodUsed: 'GET',
      probePath: '/emby/system/info/public'
    }
  });
  assert.equal(slowSuccess.ok, true);
  assert.equal(slowSuccess.elapsedMs, 6500);
  assert.equal(formatHeadProbeResult(slowSuccess), '6500 ms');
  assert.equal(formatHeadProbeResult({
    probe: { ok: false, reason: 'http_error', statusCode: 403, elapsedMs: 120 }
  }), 'HTTP 403 · 120 ms');
  assert.equal(formatHeadProbeResult({
    probe: { ok: false, reason: 'tls_error', elapsedMs: 75 }
  }), 'TLS 错误 · 75 ms');
  assert.equal(formatHeadProbeResult({
    probe: { ok: false, reason: 'network_error', elapsedMs: 90 }
  }), '网络错误 · 90 ms');
  assert.equal(formatHeadProbeResult({
    probe: { ok: false, reason: 'timeout', elapsedMs: 10000 }
  }), '超时 · 10000 ms');
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /elapsedMs\s*>\s*5000[^\n]*Timeout/);
});

test('DNS settings save includes changed preferred sources without redundant source writes', async () => {
  const template = await readFile(new URL('../frontend/admin-runtime.template.html', import.meta.url), 'utf8');
  const runtimeScript = template.match(/<script>(const UI_DEFAULTS=[\s\S]*?)<\/script><\/body>/)?.[1] || '';
  assert.match(template, /hasDnsIpSourceDraftChanges\(\)/);
  assert.match(template, /"dns"===r&&this\.hasDnsIpSourceDraftChanges\(\)/);
  assert.match(template, /f&&!await this\.saveDnsIpPoolSourcesFromSettings\(\{silentSuccess:!0,silentError:!0\}\)/);
  assert.match(template, /"dns"===r&&!g\?\{config:p\}:await this\.apiCall\("saveConfig"/);
  assert.match(template, /g&&this\.applyRuntimeConfig\(u\.config\|\|p\)/);
  assert.match(template, /DNS \\u8bbe\\u7f6e\\u5df2\\u4fdd\\u5b58\\uff0c\\u4f46\\u4f18\\u9009\\u6e90\\u4fdd\\u5b58\\u5931\\u8d25/);
  assert.ok(runtimeScript, 'formal admin runtime script must be extractable');
  assert.doesNotThrow(() => new vm.Script(runtimeScript));
});

test('D1 schema dialog reports only the current schema contract', () => {
  const { formatD1SchemaStatus } = loadEnhancementTestHooks();
  const message = formatD1SchemaStatus({
    schemaReady: false,
    tables: { proxy_logs: true },
    indexes: { idx_proxy_logs_timestamp_id: true },
    ftsReady: false,
    columns: {
      auth_failures: { ip: true, expires_at: false }
    },
    issues: ['missing_column:auth_failures.expires_at']
  });

  assert.match(message, /proxy_logs/);
  assert.match(message, /idx_proxy_logs_timestamp_id/);
  assert.match(message, /FTS/);
  assert.match(message, /auth_failures\.ip/);
  assert.match(message, /auth_failures\.expires_at/);
  assert.match(message, /missing_column:auth_failures\.expires_at/);
  assert.doesNotMatch(message, /migration|version|adopt/i);
});

test('initialize DB is the single schema mutation action', async () => {
  const { patchSafetyContractMethods, formatD1InitializationResult } = loadEnhancementTestHooks();
  const calls = [];
  const confirmations = [];
  const messages = [];
  const snapshot = {
    status: { schemaReady: false, issues: ['missing_table:proxy_logs'] },
    repairPlan: {
      risk: 'low',
      repairableIssues: ['missing_table:proxy_logs'],
      highRiskIssues: [],
      blockingIssues: [],
      steps: [{ kind: 'create_table', target: 'proxy_logs', risk: 'low' }]
    }
  };
  const result = {
    schemaReady: true,
    status: {
      schemaReady: true,
      tables: { proxy_logs: true },
      indexes: { idx_proxy_logs_timestamp_id: true },
      ftsReady: true,
      issues: []
    },
    initialization: {
      createdTables: ['proxy_logs'],
      ftsRebuilt: true
    }
  };
  const app = {
    async apiCall(action) {
      calls.push(action);
      if (action === 'getD1SchemaStatus') return snapshot;
      if (action === 'initLogsDb') return result;
      throw new Error('unexpected action: ' + action);
    },
    async askConfirm(message, options) {
      confirmations.push({ message, options });
      return true;
    },
    applyAdminRevisions() {},
    showMessage(message, options) {
      messages.push({ message, options });
    }
  };

  patchSafetyContractMethods(app);
  await app.initLogsDbFromUi();

  assert.deepEqual(calls, ['getD1SchemaStatus', 'initLogsDb']);
  assert.equal(confirmations.length, 1);
  assert.match(confirmations[0].message, /missing_table:proxy_logs/);
  assert.equal(messages[0].options.tone, 'success');
  assert.match(messages[0].message, /proxy_logs/);
  assert.match(formatD1InitializationResult(result), /FTS/);
  assert.doesNotMatch(messages[0].message, /migration|version|adopt/i);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('initD1Schema'|apiCall\('initLogsFts'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /bookmark|time travel/i);
});

test('high-risk D1 repair requires two confirmations and sends the signed repair request', async () => {
  const fetchCalls = [];
  const { patchSafetyContractMethods } = loadEnhancementTestHooks({}, {
    location: { pathname: '/admin' },
    async fetch(path, init) {
      fetchCalls.push({ path, init });
      return new Response(JSON.stringify({
        schemaReady: true,
        status: { schemaReady: true, issues: [] },
        initialization: {
          rebuiltTables: [{ table: 'sys_status', rowCount: 1 }],
          recoveryBookmark: 'bookmark-1'
        }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  });
  const confirmations = [];
  const messages = [];
  const apiCalls = [];
  let schemaReadCount = 0;
  const app = {
    async apiCall(action, payload = {}) {
      apiCalls.push({ action, payload });
      if (action === 'initLogsDb') return { schemaReady: false, pendingHighRisk: true, status: { schemaReady: false } };
      assert.equal(action, 'getD1SchemaStatus');
      schemaReadCount += 1;
      return schemaReadCount === 1 ? {
        status: { schemaReady: false, issues: ['missing_table:d1_schema_meta', 'invalid_primary_key:sys_status'] },
        repairPlan: {
          phase: 'safe',
          risk: 'high',
          repairToken: '',
          repairableIssues: ['missing_table:d1_schema_meta'],
          highRiskIssues: ['invalid_primary_key:sys_status'],
          blockingIssues: [],
          steps: [
            { kind: 'create_table', target: 'd1_schema_meta', risk: 'low' },
            { kind: 'rebuild_table', target: 'sys_status', risk: 'high', estimatedRows: 1 }
          ]
        }
      } : {
        status: { schemaReady: false, issues: ['invalid_primary_key:sys_status'] },
        repairPlan: {
          phase: 'destructive',
          risk: 'high',
          repairToken: 'signed-repair-token',
          repairableIssues: [],
          highRiskIssues: ['invalid_primary_key:sys_status'],
          blockingIssues: [],
          steps: [{ kind: 'rebuild_table', target: 'sys_status', risk: 'high', estimatedRows: 1 }]
        }
      };
    },
    async askConfirm(message, options) {
      confirmations.push({ message, options });
      return true;
    },
    async showMessage(message, options) {
      messages.push({ message, options });
    },
    applyAdminRevisions() {}
  };

  patchSafetyContractMethods(app);
  await app.initLogsDbFromUi();

  assert.equal(confirmations.length, 2);
  assert.equal(confirmations[0].options.confirmText, '开始安全修复');
  assert.equal(confirmations[1].options.confirmText, '确认重建');
  assert.match(confirmations[1].message, /sys_status.*1 行/);
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].init.headers['X-Admin-Confirm'], 'repairD1Schema');
  assert.deepEqual(JSON.parse(fetchCalls[0].init.body), {
    action: 'initLogsDb',
    repairMode: 'confirmed-destructive',
    repairToken: 'signed-repair-token'
  });
  assert.deepEqual(apiCalls.map(call => call.action), ['getD1SchemaStatus', 'initLogsDb', 'getD1SchemaStatus']);
  assert.equal(apiCalls[1].payload?.repairMode, 'safe');
  assert.match(messages.at(-1).message, /bookmark-1/);
});

test('blocked or cancelled high-risk D1 repair never sends a mutation request', async t => {
  await t.test('blocked plan', async () => {
    let writes = 0;
    const { patchSafetyContractMethods } = loadEnhancementTestHooks({}, {
      async fetch() {
        writes += 1;
        throw new Error('unexpected mutation');
      }
    });
    const messages = [];
    const app = {
      async apiCall() {
        return {
          status: { schemaReady: false },
          repairPlan: {
            risk: 'blocked',
            repairableIssues: [],
            highRiskIssues: [],
            blockingIssues: ['unique_key_duplicate:dns_ip_pool_items.ip'],
            steps: []
          }
        };
      },
      async showMessage(message, options) { messages.push({ message, options }); }
    };
    patchSafetyContractMethods(app);
    await app.initLogsDbFromUi();
    assert.equal(writes, 0);
    assert.match(messages[0].message, /唯一键存在重复数据/);
    assert.match(messages[0].message, /unique_key_duplicate/);
  });

  await t.test('second confirmation cancelled', async () => {
    let writes = 0;
    let confirmationCount = 0;
    const confirmations = [];
    const { patchSafetyContractMethods } = loadEnhancementTestHooks({}, {
      async fetch() {
        writes += 1;
        throw new Error('unexpected mutation');
      }
    });
    const app = {
      async apiCall() {
        return {
          status: { schemaReady: false },
          repairPlan: {
            phase: 'destructive',
            risk: 'high',
            repairToken: 'signed-repair-token',
            repairableIssues: [],
            highRiskIssues: ['invalid_primary_key:proxy_logs'],
            blockingIssues: [],
            steps: [{
              kind: 'recreate_log_table',
              target: 'proxy_logs',
              estimatedRows: null,
              rowCountMeasured: false,
              allowsDataLoss: true,
              willDiscardData: true,
              dataMode: 'discard'
            }]
          }
        };
      },
      async askConfirm(message, options) {
        confirmationCount += 1;
        confirmations.push({ message, options });
        return confirmationCount === 1;
      },
      async showMessage() {}
    };
    patchSafetyContractMethods(app);
    await app.initLogsDbFromUi();
    assert.equal(confirmationCount, 2);
    assert.match(confirmations[1].message, /将清空全部日志/);
    assert.match(confirmations[1].message, /不创建本地备份/);
    assert.match(confirmations[1].message, /只能通过 D1 Time Travel bookmark 恢复/);
    assert.equal(confirmations[1].options.confirmText, '确认重建并清空日志');
    assert.equal(writes, 0);
  });
});

test('D1 tidy initializes, re-previews, and executes only with the second signed plan', async () => {
  const { patchSafetyContractMethods } = loadEnhancementTestHooks();
  const calls = [];
  const confirmations = [];
  const messages = [];
  let previewCount = 0;
  const app = {
    currentHash: '#settings',
    async apiCall(action, payload = {}) {
      calls.push({ action, payload });
      if (action === 'previewTidyData') {
        previewCount += 1;
        return previewCount === 1
          ? { requiresSchemaInitialization: true, summary: {}, warnings: [] }
          : { requiresSchemaInitialization: false, planToken: 'signed-d1-plan', summary: {}, warnings: [] };
      }
      if (action === 'getD1SchemaStatus') {
        return {
          status: { schemaReady: false, issues: ['missing_table:proxy_logs'] },
          repairPlan: {
            phase: 'safe',
            risk: 'low',
            repairableIssues: ['missing_table:proxy_logs'],
            highRiskIssues: [],
            blockingIssues: [],
            steps: [{ kind: 'create_table', target: 'proxy_logs', risk: 'low' }]
          }
        };
      }
      if (action === 'initLogsDb') {
        return {
          schemaReady: true,
          status: { schemaReady: true, issues: [] },
          initialization: { createdTables: ['proxy_logs'] }
        };
      }
      if (action === 'tidyD1Data') {
        return { summary: { status: 'success' }, preview: {} };
      }
      throw new Error('unexpected action: ' + action);
    },
    async askConfirm(message, options) {
      confirmations.push({ message, options });
      return true;
    },
    async showMessage(message, options = {}) {
      messages.push({ message, options });
    },
    applyAdminRevisions() {},
    buildTidyPreviewConfirmDialog() { return { summary: [], sections: [], warnings: [] }; },
    buildTidyPreviewConfirmText() { return 'confirm tidy'; },
    buildD1TidySuccessMessage() { return 'D1 tidy complete'; },
    async loadSettings() {},
    formatTidyPreviewGroupText(group) { return String(group?.label || 'group'); },
    formatTidyFieldGroupText(group) { return String(group?.label || 'field'); }
  };

  patchSafetyContractMethods(app);
  await app.runPreviewedTidy('d1');

  assert.deepEqual(calls.map(call => call.action), [
    'previewTidyData',
    'getD1SchemaStatus',
    'initLogsDb',
    'previewTidyData',
    'tidyD1Data'
  ]);
  assert.equal(calls.at(-1).payload?.planToken, 'signed-d1-plan');
  assert.deepEqual(Object.keys(calls.at(-1).payload || {}), ['planToken']);
  assert.equal(confirmations.length, 2);
  assert.equal(confirmations[0].options.confirmText, '开始安全修复');
  assert.equal(confirmations[1].options.confirmText, '开始整理 D1');
  assert.equal(messages[0].options.title, '初始化 DB 结果');
});

test('bounded D1 counts and oversized node warnings are explicit in the admin runtime', async () => {
  const { patchSafetyContractMethods } = loadEnhancementTestHooks();
  const messages = [];
  const app = {
    async apiCall(action) {
      if (action === 'getNode') return {
        node: { name: 'alpha' },
        warnings: [{ code: 'NODE_RESOURCE_LIMIT_EXCEEDED', field: 'remark', actual: 4097, limit: 4096 }]
      };
      return {};
    },
    showMessage(message, options = {}) { messages.push({ message, options }); },
    formatTidyPreviewGroupText(group) { return `${group.label}: ${group.count}`; },
    buildTidyPreviewConfirmDialog(preview) {
      return { sections: [{ items: preview.deleteGroups.map(group => ({ ...group })) }] };
    }
  };

  patchSafetyContractMethods(app);
  const preview = {
    deleteGroups: [{ key: 'proxy_logs', label: 'logs', count: 10000, countIsLowerBound: true }]
  };
  assert.match(app.formatTidyPreviewGroupText(preview.deleteGroups[0]), /10000\+/);
  assert.match(app.buildTidyPreviewConfirmDialog(preview, 'd1').sections[0].items[0].label, /10000\+/);
  assert.match(app.buildD1TidySuccessMessage({
    hasMore: true,
    remainingScopes: ['proxy_logs'],
    budget: { processedRows: 10000 }
  }), /再次预览并继续执行/);

  const result = await app.apiCall('getNode', { name: 'alpha' });
  assert.equal(result.node.name, 'alpha');
  assert.equal(messages[0].options.tone, 'warning');
  assert.match(messages[0].message, /remark: 4097\/4096/);
  assert.doesNotMatch(messages[0].message, /headers|secret/i);
});

for (const [errorCode, expectedMessage] of [
  ['TIDY_PLAN_STALE', '请重新预览并确认后再执行'],
  ['TIDY_PLAN_INVALID', '请重新预览并确认后再执行']
]) {
  test(errorCode + ' directs the operator to preview KV tidy again', async () => {
    const { patchSafetyContractMethods } = loadEnhancementTestHooks();
    const shownMessages = [];
    const app = {
      async apiCall() {
        const error = new Error(errorCode);
        error.code = errorCode;
        throw error;
      },
      showMessage(message) {
        shownMessages.push(message);
      }
    };
    patchSafetyContractMethods(app);

    await app.runPreviewedTidy('kv');

    assert.equal(shownMessages.length, 1);
    assert.match(shownMessages[0], new RegExp(expectedMessage));
  });
}

test('formal admin runtime sources contain no unsupported scheduled settings or inline dynamic imports', async () => {
  for (const relativePath of [
    '../frontend/admin-runtime.template.html',
    '../frontend/index.html'
  ]) {
    const html = await readFile(new URL(relativePath, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /(?:dnsAutoUpload|DNS_AUTO_UPLOAD)[A-Za-z_]*/, relativePath);
    assert.doesNotMatch(html, /\b(?:let|const|var)\s*;/, relativePath);
    assert.deepEqual(inspectRuntimeAssets(html).inlineDynamicImports, [], relativePath);
  }
});

test('deploy workflow builds and publishes the frontend as Worker static assets', async () => {
  const [wranglerConfig, deployWorkflow] = await Promise.all([
    readFile(new URL('../wrangler.toml', import.meta.url), 'utf8'),
    readFile(new URL('../.github/workflows/deploy-worker.yml', import.meta.url), 'utf8')
  ]);

  assert.match(wranglerConfig, /\[assets\][\s\S]*directory\s*=\s*"\.\/frontend\/dist"/);
  assert.match(wranglerConfig, /\[assets\][\s\S]*binding\s*=\s*"ASSETS"/);
  assert.match(wranglerConfig, /\[assets\][\s\S]*run_worker_first\s*=\s*true/);
  assert.match(wranglerConfig, /\[assets\][\s\S]*html_handling\s*=\s*"none"/);
  assert.match(deployWorkflow, /node-version:\s*24/);
  assert.match(deployWorkflow, /run:\s*npm ci/);
  assert.match(deployWorkflow, /run:\s*npm run build:frontend/);
  assert.match(deployWorkflow, /- "frontend\/\*\*"/);
  assert.ok(deployWorkflow.indexOf('npm ci') < deployWorkflow.indexOf('npm run build:frontend'));
  assert.ok(deployWorkflow.indexOf('npm run build:frontend') < deployWorkflow.indexOf('cloudflare\/wrangler-action@v3'));
});

test('retired server statistics and aggregation UI cannot be reached or rendered', async () => {
  const [template, generatedIndex, generatedDist, ...sources] = await Promise.all([
    readFile(new URL('../frontend/admin-runtime.template.html', import.meta.url), 'utf8'),
    readFile(new URL('../frontend/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../frontend/dist/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../frontend/scripts/admin-runtime-enhancements.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../frontend/src/composables/useAdminConsole.js', import.meta.url), 'utf8'),
    readFile(new URL('../frontend/src/features/settings/SettingsPanel.vue', import.meta.url), 'utf8'),
    readFile(new URL('../frontend/src/features/logs/LogsPanel.vue', import.meta.url), 'utf8')
  ]);
  const source = [template, generatedIndex, generatedDist, ...sources].join('\n');
  const retiredNeedles = [
    ['server', 'records'].join('-'),
    ['server', 'Record'].join(''),
    ['media', 'Aggregation'].join(''),
    ['server', 'Expiry'].join(''),
    ['include', 'EmbyCredentials'].join(''),
    ['init', 'D1Schema'].join(''),
    ['init', 'LogsFts'].join('')
  ];
  for (const needle of retiredNeedles) {
    assert.equal(source.includes(needle), false, needle);
  }

  const viewTitlesMatch = template.match(/VIEW_TITLES=(\{[^;]+?\}),NAV_ITEMS=/);
  assert.ok(viewTitlesMatch, 'VIEW_TITLES must be extractable');
  const viewTitles = JSON.parse(viewTitlesMatch[1]);
  const oldHash = ['#server', 'records'].join('-');
  const normalizeHash = (hash, fallback = '#dashboard') => Object.hasOwn(viewTitles, hash) ? hash : fallback;
  assert.equal(normalizeHash(oldHash), '#dashboard');
  assert.match(template, /function normalizeViewHash[\s\S]*?hasOwnProperty\.call\(VIEW_TITLES,n\)\?n:a/);
});

test('Vue settings source and component tree contain no unsupported scheduled settings', async () => {
  const settingsPanel = await readFile(
    new URL('../frontend/src/features/settings/SettingsPanel.vue', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(settingsPanel, /dnsAutoUpload|DnsAutoUploadPanel/);
  await assert.rejects(readFile(new URL('../frontend/src/features/settings/components/DnsAutoUploadPanel.vue', import.meta.url)));
  await assert.rejects(readFile(new URL('../frontend/src/features/settings/components/dnsAutoUploadPanel.shared.js', import.meta.url)));
});

test('development server launches the local Vite entry through Node on every platform', async () => {
  const source = await readFile(new URL('../frontend/scripts/dev-server.mjs', import.meta.url), 'utf8');
  assert.match(source, /const viteEntry = fileURLToPath\(new URL\('\.\.\/node_modules\/vite\/bin\/vite\.js'/);
  assert.match(source, /spawn\(\s*process\.execPath,\s*\[viteEntry,/);
  assert.doesNotMatch(source, /vite\.cmd/);
});

test('Windows portproxy helper remains compatible with Windows PowerShell', async () => {
  const source = await readFile(new URL('../frontend/scripts/windows-portproxy.ps1', import.meta.url), 'utf8');
  assert.equal([...source].every((character) => character.charCodeAt(0) <= 0x7f), true);
  assert.match(source, /^#Requires -RunAsAdministrator/m);
  assert.match(source, /& wsl\.exe @wslArgs/);
  assert.doesNotMatch(source, /\bawk\b|bash -lc/);
  assert.match(source, /netsh failed to create the Windows portproxy rule/);
});

test('CDN checker recognizes semantic assets and importmaps across attribute styles', () => {
  const inspection = inspectRuntimeAssets(`<!doctype html><html><head>
    <script type='importmap'>{"imports":{}}</script>
    <script data-src="https://ignored.test/fake.js">const fake = '<script src="https://ignored.test/string.js">';</script>
    <script src='https://cdn.tailwindcss.com'></script>
    <link rel="modulepreload" href=https://cdn.example.test/runtime>
    <link href='https://cdn.example.test/theme' as="style" rel="prefetch">
    <link rel="preload" as="image" href="https://cdn.example.test/poster.jpg">
  </head><body></body></html>`);

  assert.equal(inspection.importMapCount, 1);
  assert.deepEqual(inspection.inlineDynamicImports, []);
  assert.deepEqual(inspection.assets, [
    'https://cdn.tailwindcss.com',
    'https://cdn.example.test/runtime',
    'https://cdn.example.test/theme'
  ]);
});

test('CDN checker detects real inline imports without matching inert JavaScript text', () => {
  const inspection = inspectRuntimeAssets([
    '<!doctype html><html><head><script>',
    'const doubleQuoted = "import(\'./fake-double-string.js\')";',
    "const singleQuoted = 'import(\"./fake-single-string.js\")';",
    "// import('./fake-line-comment.js')",
    "/* import('./fake-block-comment.js') */",
    "const staticTemplate = `static import('./fake-template.js')`;",
    "const expressionTemplate = `expression ${import(/* comment */ './template-expression.js')}`;",
    "import /* split comment */ ('./local.js');",
    "const regexLiteral = /import\\(['\"]fake['\"]\\)/;",
    '</script>',
    "<script type='text/template'>import('./not-executable.js')</script>",
    '</head><body></body></html>'
  ].join('\n'));

  assert.deepEqual(inspection.inlineDynamicImports.map((item) => item.reference), [
    'import(',
    'import /* split comment */ ('
  ]);
});

test('CDN checker rejects relative and forbidden release assets', () => {
  for (const assetUrl of [
    '/assets/app.js',
    'https://esm.sh/vue',
    'https://raw.githubusercontent.com/owner/repo/main/app.js',
    'https://github.com/owner/repo/releases/download/v1.0.0/runtime',
    'https://cdn.jsdelivr.net/gh/owner/repo@main/runtime',
    '//esm.sh/vue',
    '//raw.githubusercontent.com/owner/repo/main/app.js',
    '//github.com/owner/repo/releases/download/v1.0.0/runtime',
    '//cdn.jsdelivr.net/gh/owner/repo@main/runtime',
    '//cdn.jsdelivr.net/gh/owner/repo/runtime',
    'https://cdn.jsdelivr.net./gh/owner/repo@main/runtime'
  ]) {
    assert.equal(isForbiddenRuntimeAsset(assetUrl), true, assetUrl);
  }
  assert.equal(isForbiddenRuntimeAsset('https://cdn.tailwindcss.com'), false);
  assert.equal(isForbiddenRuntimeAsset('//cdn.tailwindcss.com'), false);
  assert.equal(isForbiddenRuntimeAsset('https://cdn.jsdelivr.net/npm/vue@3.5.32/dist/vue.global.prod.js'), false);
});
