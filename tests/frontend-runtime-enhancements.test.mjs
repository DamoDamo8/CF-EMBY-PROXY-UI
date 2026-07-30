import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import {
  inspectRuntimeAssets,
  isForbiddenRuntimeAsset
} from '../frontend/scripts/check-cdn-paths.mjs';
import {
  ADMIN_RUNTIME_ENHANCEMENT_SCRIPT,
  ADMIN_RUNTIME_ENHANCEMENT_STYLE
} from '../frontend/scripts/admin-runtime-enhancements.mjs';

function loadEnhancementTestHooks(documentOverrides = {}, windowOverrides = {}) {
  const inlineScript = ADMIN_RUNTIME_ENHANCEMENT_SCRIPT
    .replace(/^<script[^>]*>\n?/, '')
    .replace(/<\/script>$/, '');
  const closureEnd = inlineScript.lastIndexOf('})();');
  assert.notEqual(closureEnd, -1, 'enhancement script must use the expected closure');
  const instrumentedScript = inlineScript.slice(0, closureEnd)
    + 'window.__enhancementTestHooks = { formatD1SchemaStatus, formatD1InitializationResult, patchSafetyContractMethods, getServerRecordSelectableNodes, buildServerRecordDialogDraft, normalizeServerRecord, buildServerRecordCard, refreshServerRecordPosters, getServerRecordExpiryStatus, formatServerRecordExpiry, matchesServerRecordFilters, loadServerRecords, refreshSingleServerRecord, deleteServerRecord, activateServerRecordsRoute, hydrateMediaAggregationState, saveMediaAggregationState, markMediaAggregationDraftDirty, readPosterMetadataState, hydratePosterMetadataState, savePosterMetadataSettings, posterMetadataState, normalizePosterSearch, normalizePosterSearchText, hashPosterSearchIdentity, initializePosterCacheStorage, readPosterCache, readPosterCacheEntry, writePosterCacheEntry, selectTmdbBrowserPosterCandidate, sniffPosterImageMime, readValidatedPosterBlob, fetchPosterResource, searchTmdbBrowserPoster, resolveDoubanBrowserPoster, resolvePosterBlob, fetchPosterImage, normalizePosterBrowserConfig, posterBrowserState, runPosterJob, drainPosterQueue, releasePosterElement, releasePosterElements, clearPosterBrowserSession, restoreServerRecordDialogFocus, mediaAggregationState, invalidateServerRecordCredentialRequest, isServerRecordCredentialRevealCurrent, handleServerRecordCredentialUsernameInput, bindServerRecordPasswordReveal, scheduleServerRecordCredentialConceal, concealServerRecordCredential, getDashboardMonthPeriodKey, isDashboardMonthlyTrafficCacheFresh, toggleDashboardTrafficPeriod, dashboardTrafficState, serverRecordsUiState };\n'
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

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]));
  return {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    values
  };
}

test('admin runtime enhancement observes lazily mounted logs view', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /shellHookSelector = '[^']*#view-logs/);
});

function createPosterMetadataAccountTestApp(options = {}) {
  const calls = [];
  const confirmations = [];
  const messages = [];
  const app = {
    runtimeConfig: { cfAccountId: options.currentAccountId || 'account-before' },
    confirmResult: options.confirmResult !== false,
    failSave: options.failSave === true,
    getConfigPanelFieldKeys() {
      return ['cfAccountId'];
    },
    collectConfigSectionFromForm() {
      return { cfAccountId: options.nextAccountId || this.runtimeConfig.cfAccountId };
    },
    formatConfigPreviewValue(field, value) {
      return String(value ?? '');
    },
    async prepareConfigChangePreview(section, currentConfig, nextConfig) {
      const sanitizedConfig = { ...nextConfig };
      delete sanitizedConfig.tmdbApiKey;
      const accountChanged = currentConfig.cfAccountId !== sanitizedConfig.cfAccountId;
      return {
        sanitizedConfig,
        migration: null,
        preview: {
          hasChanges: accountChanged,
          message: accountChanged ? '即将保存「账号设置」以下变更：\n• Cloudflare 账号 ID：更新' : '当前分区没有检测到变更，无需保存。'
        }
      };
    },
    async askConfirm(message) {
      confirmations.push(message);
      return this.confirmResult;
    },
    async apiCall(action, payload) {
      calls.push({ action, payload });
      if (action !== 'saveConfig') return {};
      if (this.failSave) throw new Error('save failed');
      const hasTmdbMutation = Object.prototype.hasOwnProperty.call(payload.config, 'tmdbApiKey');
      const removingTmdbKey = hasTmdbMutation && payload.config.tmdbApiKey === '';
      const redactedConfig = { ...payload.config, tmdbApiKeyConfigured: !removingTmdbKey };
      delete redactedConfig.tmdbApiKey;
      return {
        config: redactedConfig,
        posterMetadata: {
          tmdb: {
            configured: true,
            storage: removingTmdbKey ? 'worker_secret' : 'kv_config'
          }
        }
      };
    },
    async saveSettings(section, panel = section) {
      try {
        const currentConfig = { ...this.runtimeConfig };
        const fieldKeys = this.getConfigPanelFieldKeys(panel, section);
        const nextConfig = {
          ...currentConfig,
          ...this.collectConfigSectionFromForm(section, { fieldKeys })
        };
        const { sanitizedConfig, preview } = await this.prepareConfigChangePreview(section, currentConfig, nextConfig, panel);
        this.lastPreview = preview;
        if (!preview.hasChanges || !(await this.askConfirm(preview.message))) return null;
        const result = await this.apiCall('saveConfig', {
          config: sanitizedConfig,
          meta: { section: panel, source: 'ui' }
        });
        this.runtimeConfig = result.config;
        return result;
      } catch (error) {
        this.showMessage('账号设置保存失败: ' + error.message, { tone: 'error' });
        return null;
      }
    },
    showMessage(message, optionsArg) {
      messages.push({ message, options: optionsArg });
    }
  };
  return { app, calls, confirmations, messages };
}

function resetPosterMetadataTestState(posterMetadataState, inputValue = '', storage = 'none') {
  const input = {
    value: inputValue,
    focused: false,
    focus() { this.focused = true; }
  };
  posterMetadataState.root = {
    querySelector(selector) {
      return selector === '[data-poster-metadata-tmdb-key="1"]' ? input : null;
    }
  };
  posterMetadataState.tmdbConfigured = storage !== 'none';
  posterMetadataState.tmdbStorage = storage;
  posterMetadataState.draftKey = '';
  posterMetadataState.removeRequested = false;
  posterMetadataState.pending = false;
  posterMetadataState.hydrated = true;
  posterMetadataState.loading = false;
  return input;
}

test('poster settings edit admin values with Cloudflare bindings as fallback', async () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /function syncPosterMetadataPanel[\s\S]*?getElementById\('set-account'\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-poster-metadata-tmdb-token/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-poster-metadata-douban-origin/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-poster-metadata-douban-token/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('savePosterBrowserSettings'/);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /tmdbApiKey/);

  const { readPosterMetadataState, hydratePosterMetadataState, savePosterMetadataSettings, posterMetadataState, posterBrowserState } = loadEnhancementTestHooks();
  assert.deepEqual({ ...readPosterMetadataState({ posterBrowserBindings: {
    tmdbTokenConfigured: true,
    tmdbTokenSource: 'admin',
    doubanOriginConfigured: false,
    doubanOriginSource: 'none',
    doubanTokenConfigured: true,
    doubanTokenSource: 'binding'
  }, config: { doubanBrowserOrigin: 'https://saved.example' } }) }, {
    tmdbTokenConfigured: true,
    tmdbTokenSource: 'admin',
    doubanOriginConfigured: false,
    doubanOriginSource: 'none',
    doubanTokenConfigured: true,
    doubanTokenSource: 'binding',
    doubanOrigin: 'https://saved.example'
  });

  const calls = [];
  posterMetadataState.tmdbToken = 'new-tmdb-token';
  posterMetadataState.doubanOrigin = 'https://poster.example';
  posterMetadataState.doubanToken = '';
  posterMetadataState.clearTmdbToken = false;
  posterMetadataState.clearDoubanToken = true;
  posterMetadataState.hydrated = true;
  posterBrowserState.config = { tmdb: { token: 'old-token' } };
  posterBrowserState.configPromise = Promise.resolve(posterBrowserState.config);
  await savePosterMetadataSettings({
    askConfirm: async () => true,
    apiCall: async (action, payload) => {
      calls.push({ action, payload });
      return {
        config: { doubanBrowserOrigin: 'https://poster.example' },
        posterBrowserBindings: {
          tmdbTokenConfigured: true,
          tmdbTokenSource: 'admin',
          doubanOriginConfigured: true,
          doubanOriginSource: 'admin',
          doubanTokenConfigured: true,
          doubanTokenSource: 'binding'
        }
      };
    },
    showMessage() {}
  });
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [{ action: 'savePosterBrowserSettings', payload: {
    tmdbToken: 'new-tmdb-token',
    doubanOrigin: 'https://poster.example',
    clearTmdbToken: false,
    clearDoubanToken: true
  } }]);
  assert.equal(posterBrowserState.config, null);
  assert.equal(posterBrowserState.configPromise, null);

  let resolveHydration;
  const pendingHydration = new Promise(resolve => { resolveHydration = resolve; });
  const hydration = hydratePosterMetadataState({ apiCall: async () => pendingHydration }, true);
  posterMetadataState.doubanOrigin = 'https://draft.example';
  posterMetadataState.dirty = true;
  resolveHydration({
    config: { doubanBrowserOrigin: 'https://stale.example' },
    posterBrowserBindings: { doubanOriginConfigured: true, doubanOriginSource: 'admin' }
  });
  await hydration;
  assert.equal(posterMetadataState.doubanOrigin, 'https://draft.example');
});

test('server records view is inserted before logs and uses node-backed admin actions', async () => {
  const syncSource = await readFile(new URL('../frontend/scripts/sync-admin-runtime.mjs', import.meta.url), 'utf8');
  assert.match(syncSource, /'nodes',\s*'server-records',\s*'logs'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /serverRecordsHash = '#server-records'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /insertBefore\(view, document\.getElementById\('view-logs'\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /insertBefore\(link, logsLink\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('getServerRecordsSnapshot'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('saveServerRecordSettings'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /readLegacyServerRecords/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /高码服.*低码服/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /tagQuery[\s\S]*?\.filter\(\(tag\) => tag\.toLowerCase\(\)\.includes/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /serverRecordsUiState\.attempted = true/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /function activateServerRecordsRoute[\s\S]*?serverRecordsUiState\.attempted = false/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /if \(!serverRecordsUiState\.attempted\) void loadServerRecords\(app\)/);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /name="(?:movies|series|episodes|lastWatched|url|state)"/);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /累计观看|totalSeconds|formatServerRecordDuration/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /record\.watch\.state === 'ok' \? formatServerRecordDateTime\(record\.watch\.lastWatchedAt\) : '数据不可用'/);
});

test('server records route releases the desktop settings scroll lock', async () => {
  const { activateServerRecordsRoute } = loadEnhancementTestHooks();
  const syncedRoutes = [];
  const app = {
    currentHash: '#settings',
    pageTitle: '设置',
    sidebarOpen: true,
    isDesktopSettingsLayout: true,
    syncViewportState(hash) {
      syncedRoutes.push(hash);
      this.isDesktopSettingsLayout = hash === '#settings';
    }
  };

  await activateServerRecordsRoute(app, false);

  assert.equal(app.currentHash, '#server-records');
  assert.equal(app.pageTitle, '服务器记录');
  assert.equal(app.sidebarOpen, false);
  assert.equal(app.isDesktopSettingsLayout, false);
  assert.deepEqual(syncedRoutes, ['#server-records']);
});

test('server record dialog preserves node settings and allows legacy records to target enabled nodes', () => {
  const { getServerRecordSelectableNodes, buildServerRecordDialogDraft } = loadEnhancementTestHooks();
  const availableNodes = [
    { nodeName: 'disabled-node', enabled: false, tags: ['high'], expiresAt: '2026-08-10', serverRecordEmbyUsername: 'node-user', serverRecordEmbyCredentialsConfigured: true, serverRecordEmbyCredentialSource: 'node' },
    { nodeName: 'enabled-node', enabled: true, tags: ['low'], expiresAt: '2026-09-20' },
    { nodeName: 'rolling-node', enabled: false, tags: [], expiryEnabled: true, expiryMode: 'rolling', expiryDays: 45, expiresAt: '' }
  ];
  const legacyRecord = { id: 'legacy-1', tags: ['legacy'], expiresAt: '2026-07-30' };

  assert.deepEqual(
    [...getServerRecordSelectableNodes(availableNodes, null, null)].map(node => node.nodeName),
    ['disabled-node', 'rolling-node']
  );
  assert.deepEqual(
    [...getServerRecordSelectableNodes(availableNodes, null, legacyRecord)].map(node => node.nodeName),
    ['disabled-node', 'enabled-node', 'rolling-node']
  );

  const reenabledDraft = buildServerRecordDialogDraft(availableNodes, null, null, 'disabled-node');
  assert.deepEqual([...reenabledDraft.tags], ['high']);
  assert.equal(reenabledDraft.expiresAt, '2026-08-10');
  assert.equal(reenabledDraft.expiryEnabled, false);
  assert.equal(reenabledDraft.expiryMode, 'fixed');
  assert.equal(reenabledDraft.expiryDays, 30);
  assert.equal(reenabledDraft.serverRecordEmbyUsername, 'node-user');
  assert.equal(reenabledDraft.serverRecordEmbyCredentialsConfigured, true);
  assert.equal(reenabledDraft.serverRecordEmbyCredentialSource, 'node');

  const legacyDraft = buildServerRecordDialogDraft(availableNodes, null, legacyRecord, 'enabled-node');
  assert.deepEqual([...legacyDraft.tags], ['low', 'legacy']);
  assert.equal(legacyDraft.expiresAt, '2026-09-20');
  assert.equal(legacyDraft.expiryMode, 'fixed');
  assert.equal(legacyDraft.expiryEnabled, true);

  const rollingDraft = buildServerRecordDialogDraft(availableNodes, null, null, 'rolling-node');
  assert.equal(rollingDraft.expiryMode, 'rolling');
  assert.equal(rollingDraft.expiryEnabled, true);
  assert.equal(rollingDraft.expiryDays, 45);
  assert.equal(rollingDraft.expiresAt, '');
});

test('server record cards use Worker expiry results and expose the compact status action layout', () => {
  const { normalizeServerRecord, buildServerRecordCard, getServerRecordExpiryStatus, formatServerRecordExpiry } = loadEnhancementTestHooks();
  const record = normalizeServerRecord({
    nodeName: 'alpha',
    expiresAt: '',
    counts: { movies: 4, series: 5, episodes: 6, state: 'ok', source: 'persisted', persisted: true, checkedAt: '2026-07-21T01:02:03.000Z' },
    watch: {
      lastWatchedAt: '2026-07-01T00:00:00.000Z',
      state: 'ok',
      itemId: 'episode-1',
      itemName: '摩登家庭 - S01E01',
      itemType: 'Episode',
      seriesName: '摩登家庭',
      posterUrl: '/admin/__server-record-poster/alpha?v=har-primary-tag',
      posterSearch: {
        itemId: 'episode-1', mediaType: 'tv', title: '测试剧集', originalTitle: 'Test Series', year: 2026,
        watchedAt: '2026-07-01T00:00:00.000Z'
      }
    },
    expiryEnabled: true,
    expiryMode: 'rolling',
    expiryDays: 45,
    expiry: { enabled: true, state: 'expiring', daysRemaining: 3, expiresAt: '2026-07-25', source: 'last_watched', mode: 'rolling', expiryDays: 45 }
  });
  const status = getServerRecordExpiryStatus(record);
  assert.equal(status.days, 3);
  assert.equal(formatServerRecordExpiry(record, status), '3 天过期');
  assert.equal(status.mode, 'rolling');
  assert.equal(status.expiryDays, 45);
  assert.equal(record.counts.source, 'persisted');
  assert.equal(record.counts.persisted, true);
  const card = buildServerRecordCard(record);
  assert.match(card, /data-server-record-poster="alpha"/);
  assert.match(card, /data-server-record-poster-placeholder data-state="idle"/);
  assert.match(card, /<img alt="摩登家庭 - S01E01 海报"[^>]* hidden>/);
  assert.match(card, /摩登家庭 - S01E01/);
  assert.equal(record.watch.posterUrl, '/admin/__server-record-poster/alpha?v=har-primary-tag');
  assert.match(card, /已保存的媒体统计/);
  assert.match(card, /server-record-split/);
  assert.match(card, /server-record-info/);
  assert.match(card, /server-record-card-head[\s\S]*?server-record-card-identity[\s\S]*?server-record-card-refresh/);
  assert.match(card, /server-record-split[\s\S]*?server-record-watch-poster[\s\S]*?server-record-info[\s\S]*?server-record-watch[\s\S]*?server-record-metrics/);
  assert.doesNotMatch(card, /server-record-transition/);
  assert.equal(normalizeServerRecord({ nodeName: 'external', watch: { posterUrl: 'https://evil.example/poster.jpg' } }).watch.posterUrl, '');
  assert.equal(normalizeServerRecord({ nodeName: 'relative', watch: { posterUrl: '/admin/__server-record-poster/relative' } }).watch.posterUrl, '/admin/__server-record-poster/relative');
  assert.match(
    buildServerRecordCard(normalizeServerRecord({
      nodeName: 'incomplete',
      watch: { lastWatchedAt: '2026-07-21T01:02:03.000Z', itemId: 'item-without-name' }
    })),
    /媒体 #item-without-name/
  );

  const unset = normalizeServerRecord({ nodeName: 'unset', expiry: { state: 'unset', daysRemaining: null } });
  assert.equal(unset.expiry.daysRemaining, null);
  assert.equal(getServerRecordExpiryStatus(unset).key, 'disabled');
  const missingWorkerExpiry = normalizeServerRecord({
    nodeName: 'fixed-without-worker-expiry',
    expiryEnabled: true,
    expiryMode: 'fixed',
    expiresAt: '2020-01-01'
  });
  const missingWorkerExpiryStatus = getServerRecordExpiryStatus(missingWorkerExpiry);
  assert.equal(missingWorkerExpiryStatus.key, 'unset');
  assert.equal(missingWorkerExpiryStatus.days, null);
  assert.equal(missingWorkerExpiryStatus.expiresAt, '2020-01-01');
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /new Date\(record\.expiresAt/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-server-record-refresh title="刷新服务器状态并保存全部资源统计" aria-label="刷新服务器状态并保存全部资源统计"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-server-record-refresh-one=/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /refreshButton\?\.setAttribute\('aria-busy', 'true'\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('getServerRecordsSnapshot', \{ forceRefresh \}\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('getServerRecordsSnapshot', \{ forceRefresh: true, nodeName: normalizedNodeName \}\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /if \(forceRefresh\) refreshServerRecordPosters\(serverRecordsUiState\.records\.map/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /refreshServerRecordPosters\(\[normalizedNodeName\]\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /name="expiryEnabled" type="checkbox"/);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /name="expiryEnabled" type="checkbox" checked/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-server-record-expiry-mode="fixed"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-server-record-expiry-mode="rolling"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /name="expiryDays" type="number"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /id="server-record-resource-title">资源统计/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /name="serverRecordEmbyUsername" type="text"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /name="serverRecordEmbyPassword" type="password"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /可选，留空继续使用节点密码/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /credentialSource === 'node'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /passwordChanged \|\| serverRecordEmbyUsername !== savedUsername/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /server-record-expiry-date/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /server-record-expiry-remaining/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /server-record-card-head[\s\S]*?server-record-card-refresh[\s\S]*?data-server-record-refresh-one=/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /server-record-card-actions[\s\S]*?data-server-record-edit=[\s\S]*?server-record-runtime-status[\s\S]*?data-server-record-delete=/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /online: \['online', '服务器在线'\]/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /offline: \['offline', '服务器掉线'\]/);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-server-record-open=|打开服务器/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /server-record-filter-row\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(10rem,12rem\);gap:\.75rem;margin-bottom:1\.5rem\}/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /server-record-card-actions\{display:grid;grid-template-columns:2\.5rem minmax\(0,1fr\) 2\.5rem/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /server-record-grid\{[^}]*minmax\(min\(100%,30rem\),1fr\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /server-record-card\{[^}]*border-radius:var\(--ui-radius-px\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /server-record-split\{[^}]*grid-template-columns:minmax\(7\.5rem,4fr\) minmax\(0,8fr\)[^}]*align-items:center/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /server-record-watch-poster\{[^}]*box-sizing:content-box;width:calc\(100% - 2px\);aspect-ratio:2\/3;[^}]*border:1px solid var\(--record-border\);border-radius:0/);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /server-record-watch-poster:after\{/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /server-record-watch-poster img\{[^}]*display:block;[^}]*object-fit:contain/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /server-record-metrics\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /server-record-watch-poster(?:::|:)\w+\{[^}]*gradient/);
});

test('server record posters prefer the authenticated same-origin route with bounded native concurrency', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /POSTER_MAX_CONCURRENCY = 16/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /new window\.IntersectionObserver/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\?\.\('getPosterBrowserConfig'\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /POSTER_REQUEST_TIMEOUT_MS = 8000/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /redirect: 'error'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /clearPosterBrowserSession\(true\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /__server-record-poster|posterUrl/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /credentials: 'same-origin'/);
});

test('same-origin Emby posters bypass provider config and failures continue to TMDB fallback', async () => {
  const createElement = () => {
    const placeholder = { dataset: {}, hidden: false, innerHTML: '' };
    const image = { hidden: true, src: '' };
    return {
      element: {
        isConnected: true,
        dataset: { serverRecordPoster: 'alpha' },
        querySelector(selector) { return selector === 'img' ? image : placeholder; }
      },
      image,
      placeholder
    };
  };
  class PosterTestURL extends URL {
    static createObjectURL() { return 'blob:poster-test'; }
    static revokeObjectURL() {}
  }

  let configCalls = 0;
  const direct = createElement();
  const directHooks = loadEnhancementTestHooks({}, {
    URL: PosterTestURL,
    fetch: async (url, options) => {
      assert.equal(url, '/admin/__server-record-poster/alpha');
      assert.equal(options.credentials, 'same-origin');
      return new Response(new Uint8Array([255, 216, 255]), { headers: { 'Content-Type': 'image/jpeg' } });
    }
  });
  await directHooks.runPosterJob({
    element: direct.element,
    search: {},
    posterUrl: '/admin/__server-record-poster/alpha',
    app: { async apiCall() { configCalls += 1; return {}; } },
    bypassFailure: false,
    refreshToken: 0,
    controller: new AbortController()
  });
  assert.equal(configCalls, 0);
  assert.equal(direct.image.src, 'blob:poster-test');
  assert.equal(direct.image.hidden, false);
  assert.equal(direct.placeholder.dataset.state, 'success');

  const fallbackRequests = [];
  const fallback = createElement();
  const fallbackHooks = loadEnhancementTestHooks({}, {
    URL: PosterTestURL,
    localStorage: createMemoryStorage(),
    fetch: async (url) => {
      fallbackRequests.push(String(url));
      if (String(url).startsWith('/admin/')) return new Response(null, { status: 404 });
      const parsed = new URL(url);
      if (parsed.origin === 'https://api.themoviedb.org') {
        return Response.json({ results: [{ title: '测试电影', poster_path: '/fallback.jpg' }] });
      }
      if (parsed.origin === 'https://image.tmdb.org') {
        return new Response(new Uint8Array([255, 216, 255]), { headers: { 'Content-Type': 'image/jpeg' } });
      }
      throw new Error('unexpected poster request');
    }
  });
  await fallbackHooks.runPosterJob({
    element: fallback.element,
    search: { itemId: 'movie-1', mediaType: 'movie', title: '测试电影', originalTitle: '', year: null },
    posterUrl: '/admin/__server-record-poster/alpha',
    app: {
      async apiCall(action) {
        configCalls += 1;
        assert.equal(action, 'getPosterBrowserConfig');
        return { tmdb: { configured: true, token: 'tmdb-token' }, douban: { configured: false } };
      }
    },
    bypassFailure: false,
    refreshToken: 0,
    controller: new AbortController()
  });
  assert.equal(configCalls, 1);
  assert.ok(fallbackRequests[0].startsWith('/admin/__server-record-poster/alpha'));
  assert.ok(fallbackRequests.some((url) => url.startsWith('https://api.themoviedb.org/')));
  assert.ok(fallbackRequests.some((url) => url.startsWith('https://image.tmdb.org/')));
  assert.equal(fallback.placeholder.dataset.state, 'success');
});

test('TMDB uses Chinese then original title and accepts only one exact top-three match', async () => {
  const requests = [];
  const hooks = loadEnhancementTestHooks({}, {
    fetch: async (url, options) => {
      requests.push({ url: new URL(url), options });
      if (requests.length === 1) return Response.json({ results: [] });
      return Response.json({ results: [{
        name: 'Breaking Bad',
        original_name: 'Breaking Bad',
        first_air_date: '2008-01-20',
        poster_path: '/breaking-bad.jpg'
      }] });
    }
  });
  const descriptor = await hooks.searchTmdbBrowserPoster({
    mediaType: 'tv',
    title: '绝命毒师',
    originalTitle: 'Breaking Bad',
    year: 2008
  }, { tmdb: { configured: true, token: 'tmdb-token' } }, new AbortController().signal);
  assert.deepEqual({ ...descriptor }, { provider: 'tmdb', posterPath: '/breaking-bad.jpg' });
  assert.deepEqual(requests.map(request => request.url.searchParams.get('query')), ['绝命毒师', 'Breaking Bad']);
  assert.ok(requests.every(request => request.url.origin === 'https://api.themoviedb.org'));
  assert.ok(requests.every(request => request.options.headers.Authorization === 'Bearer tmdb-token'));
  assert.ok(requests.every(request => request.url.searchParams.get('include_adult') === 'true'));
  assert.ok(requests.every(request => request.options.redirect === 'error'));

  assert.equal(hooks.selectTmdbBrowserPosterCandidate({
    mediaType: 'movie', title: '目标', originalTitle: '', year: null
  }, [
    { title: '其他', poster_path: '/1.jpg' },
    { title: '其他', poster_path: '/2.jpg' },
    { title: '其他', poster_path: '/3.jpg' },
    { title: '目标', poster_path: '/4.jpg' }
  ]), null);
  assert.throws(() => hooks.selectTmdbBrowserPosterCandidate({
    mediaType: 'movie', title: '目标', originalTitle: '', year: 2026
  }, [
    { title: '目标', release_date: '2026-01-01', poster_path: '/1.jpg' },
    { original_title: '目标', release_date: '2026-02-01', poster_path: '/2.jpg' }
  ]), error => error?.code === 'AMBIGUOUS');
});

test('TMDB failure falls back to configured Douban resolve and poster endpoints', async () => {
  const requests = [];
  const hooks = loadEnhancementTestHooks({}, {
    fetch: async (url, options) => {
      const parsed = new URL(url);
      requests.push({ parsed, options });
      if (parsed.origin === 'https://api.themoviedb.org') return new Response(null, { status: 429 });
      if (parsed.pathname === '/v1/posters/resolve') return Response.json({ subjectId: '1295644' });
      if (parsed.pathname === '/v1/posters/1295644') {
        return new Response(new Uint8Array([255, 216, 255, 0]), { headers: { 'Content-Type': 'image/jpeg' } });
      }
      throw new Error('unexpected request');
    }
  });
  const result = await hooks.resolvePosterBlob({
    itemId: 'movie-1',
    mediaType: 'movie',
    title: '霸王别姬',
    originalTitle: 'Farewell My Concubine',
    year: 1993
  }, {
    tmdb: { configured: true, token: 'tmdb-token' },
    douban: { configured: true, origin: 'https://douban.example', token: 'douban-token' }
  }, new AbortController().signal);
  assert.equal(result.descriptor.provider, 'douban');
  assert.equal(result.descriptor.subjectId, '1295644');
  assert.deepEqual(requests.slice(-2).map(request => request.parsed.pathname), ['/v1/posters/resolve', '/v1/posters/1295644']);
  assert.ok(requests.every(request => request.options.redirect === 'error'));
});

test('TMDB browser config canonicalizes Bearer tokens and rejects v3 API keys', () => {
  const { normalizePosterBrowserConfig } = loadEnhancementTestHooks();
  assert.deepEqual({ ...normalizePosterBrowserConfig({
    tmdb: { configured: true, token: 'Bearer read-access-token' }
  }).tmdb }, {
    configured: true,
    token: 'read-access-token'
  });
  assert.deepEqual({ ...normalizePosterBrowserConfig({
    tmdb: { configured: true, token: '0123456789abcdef0123456789abcdef' }
  }).tmdb }, {
    configured: false,
    token: ''
  });
});

test('poster images enforce size, MIME, and matching signatures', async () => {
  const { readValidatedPosterBlob, sniffPosterImageMime } = loadEnhancementTestHooks();
  assert.equal(sniffPosterImageMime(new Uint8Array([255, 216, 255])), 'image/jpeg');
  assert.equal(sniffPosterImageMime(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])), 'image/png');
  assert.equal((await readValidatedPosterBlob(
    new Response(new Uint8Array([255, 216, 255]), { headers: { 'Content-Type': 'image/jpeg' } }),
    'tmdb'
  )).type, 'image/jpeg');
  await assert.rejects(
    readValidatedPosterBlob(new Response('not jpeg', { headers: { 'Content-Type': 'image/jpeg' } }), 'tmdb'),
    error => error?.code === 'SIGNATURE'
  );
  await assert.rejects(
    readValidatedPosterBlob(new Response(new Uint8Array([255, 216, 255]), {
      headers: { 'Content-Type': 'text/html' }
    }), 'tmdb'),
    error => error?.code === 'MIME'
  );
  await assert.rejects(
    readValidatedPosterBlob(new Response(null, {
      headers: { 'Content-Type': 'image/jpeg', 'Content-Length': String(5 * 1024 * 1024 + 1) }
    }), 'tmdb'),
    error => error?.code === 'TOO_LARGE'
  );
});

test('TMDB image requests use the public CDN without credentials', async () => {
  let request;
  const hooks = loadEnhancementTestHooks({}, {
    fetch: async (url, options) => {
      request = { url: new URL(url), options };
      return new Response(new Uint8Array([255, 216, 255]), { headers: { 'Content-Type': 'image/jpeg' } });
    }
  });
  const blob = await hooks.fetchPosterImage(
    { provider: 'tmdb', posterPath: '/poster.jpg' },
    { tmdb: { configured: true, token: 'tmdb-token' } },
    new AbortController().signal
  );
  assert.equal(blob.type, 'image/jpeg');
  assert.equal(request.url.origin, 'https://image.tmdb.org');
  assert.equal(new Headers(request.options.headers).has('Authorization'), false);
  assert.equal(new Headers(request.options.headers).has('Cookie'), false);
});

test('poster cache uses SHA-256 TTL entries, repairs corruption, and evicts to 256 items', async () => {
  const storage = createMemoryStorage({
    'server-record-poster:v0': '{}',
    'server-record-poster:legacy': '{}'
  });
  const hooks = loadEnhancementTestHooks({}, { localStorage: storage });
  const key = await hooks.hashPosterSearchIdentity({
    itemId: 'movie-1', mediaType: 'movie', title: '霸王别姬', originalTitle: 'Farewell My Concubine', year: 1993
  });
  assert.match(key, /^[a-f0-9]{64}$/);
  hooks.initializePosterCacheStorage(storage);
  assert.equal(storage.getItem('server-record-poster:v0'), null);
  hooks.writePosterCacheEntry(key, { status: 'failure', provider: 'tmdb', code: 'NO_RESULT' }, { storage, now: 1000 });
  assert.equal(hooks.readPosterCacheEntry(key, { storage, now: 1001 })?.status, 'failure');
  assert.equal(hooks.readPosterCacheEntry(key, { storage, now: 1001, bypassFailure: true }), null);
  assert.equal(hooks.readPosterCacheEntry(key, { storage, now: 30 * 60 * 1000 + 1001 }), null);
  for (let index = 0; index < 300; index += 1) {
    hooks.writePosterCacheEntry(index.toString(16).padStart(64, '0'), {
      status: 'success', provider: 'tmdb', posterPath: '/' + index + '.jpg'
    }, { storage, now: 2000 + index });
  }
  assert.equal(Object.keys(hooks.readPosterCache(storage, 2300)).length, 256);
  storage.setItem('server-record-poster:v1', '{broken');
  assert.deepEqual({ ...hooks.readPosterCache(storage, 2300) }, {});
});

test('cached poster failures render without extending TTL or repeating diagnostics', async () => {
  const storage = createMemoryStorage();
  const errors = [];
  const hooks = loadEnhancementTestHooks({}, { localStorage: storage, console: { error: (...args) => errors.push(args) } });
  const search = { itemId: 'movie-a', mediaType: 'movie', title: 'Movie A', originalTitle: '', year: null };
  const key = await hooks.hashPosterSearchIdentity(search);
  const expiresAt = Date.now() + 30 * 60 * 1000;
  storage.setItem('server-record-poster:v1', JSON.stringify({ entries: {
    [key]: { status: 'failure', provider: 'tmdb', code: 'NO_RESULT', expiresAt, accessedAt: 1000 }
  } }));
  let writes = 0;
  const setItem = storage.setItem.bind(storage);
  storage.setItem = (...args) => { writes += 1; return setItem(...args); };
  const placeholder = { dataset: {}, hidden: false, innerHTML: '' };
  const image = { hidden: true, src: '' };
  const element = {
    isConnected: true,
    dataset: { serverRecordPoster: 'node-a' },
    querySelector(selector) { return selector === 'img' ? image : placeholder; }
  };
  await hooks.runPosterJob({
    element,
    search,
    app: { apiCall() { throw new Error('config must not be requested'); } },
    bypassFailure: false,
    refreshToken: 0,
    controller: new AbortController()
  });
  const cached = JSON.parse(storage.getItem('server-record-poster:v1')).entries[key];
  assert.equal(cached.expiresAt, expiresAt);
  assert.equal(cached.accessedAt, 1000);
  assert.equal(writes, 0);
  assert.equal(errors.length, 0);
  assert.equal(placeholder.dataset.state, 'error');
});

test('poster requests classify timeout, cancellation, and redirect failures', async () => {
  const timeoutHooks = loadEnhancementTestHooks({}, {
    setTimeout(callback) { callback(); return 1; },
    fetch: async (_url, options) => {
      assert.equal(options.signal.aborted, true);
      throw new Error('aborted');
    }
  });
  await assert.rejects(timeoutHooks.fetchPosterResource('https://api.themoviedb.org/test', {}, 'tmdb'), error => error?.code === 'TIMEOUT');

  const canceled = new AbortController();
  canceled.abort();
  const cancelHooks = loadEnhancementTestHooks({}, {
    fetch: async (_url, options) => {
      assert.equal(options.signal.aborted, true);
      throw new Error('aborted');
    }
  });
  await assert.rejects(cancelHooks.fetchPosterResource('https://api.themoviedb.org/test', {}, 'tmdb', canceled.signal), error => error?.code === 'CANCELED');

  const redirectHooks = loadEnhancementTestHooks({}, {
    fetch: async () => { throw new Error('redirect mode is set to error'); }
  });
  await assert.rejects(redirectHooks.fetchPosterResource('https://api.themoviedb.org/test', {}, 'tmdb'), error => error?.code === 'REDIRECT');
});

test('leaving server records aborts poster jobs and releases Blob URLs', () => {
  const revoked = [];
  class PosterTestURL extends URL {
    static revokeObjectURL(value) { revoked.push(value); }
  }
  const element = {
    matches() { return false; },
    querySelectorAll() { return []; }
  };
  const hooks = loadEnhancementTestHooks({ querySelectorAll() { return [element]; } }, { URL: PosterTestURL });
  const controller = new AbortController();
  hooks.posterBrowserState.jobs.set(element, { controller });
  hooks.posterBrowserState.objectUrls.set(element, 'blob:poster-a');
  hooks.clearPosterBrowserSession(false);
  assert.equal(controller.signal.aborted, true);
  assert.deepEqual(revoked, ['blob:poster-a']);
  assert.equal(hooks.posterBrowserState.objectUrls.size, 0);
});

test('removing a poster card aborts its job and releases its Blob URL', () => {
  const revoked = [];
  class PosterTestURL extends URL {
    static revokeObjectURL(value) { revoked.push(value); }
  }
  const card = {
    matches(selector) { return selector === '[data-server-record-poster]'; },
    querySelectorAll() { return []; }
  };
  const hooks = loadEnhancementTestHooks({}, { URL: PosterTestURL });
  const controller = new AbortController();
  hooks.posterBrowserState.jobs.set(card, { controller });
  hooks.posterBrowserState.objectUrls.set(card, 'blob:poster-card');
  hooks.posterBrowserState.queue = [{ element: card, controller }];

  hooks.releasePosterElements(card);

  assert.equal(controller.signal.aborted, true);
  assert.deepEqual(revoked, ['blob:poster-card']);
  assert.equal(hooks.posterBrowserState.jobs.has(card), false);
  assert.equal(hooks.posterBrowserState.objectUrls.has(card), false);
  assert.equal(hooks.posterBrowserState.queue.length, 0);
});

test('poster queue never starts more than sixteen card jobs', async () => {
  let releaseConfig;
  const pendingConfig = new Promise(resolve => { releaseConfig = resolve; });
  const hooks = loadEnhancementTestHooks();
  hooks.posterBrowserState.configPromise = pendingConfig;
  hooks.posterBrowserState.queue = [];
  hooks.posterBrowserState.active = 0;
  hooks.serverRecordsUiState.records = Array.from({ length: 20 }, (_, index) => ({
    nodeName: 'node-' + index,
    watch: { posterSearch: { itemId: String(index), mediaType: 'movie', title: 'Movie ' + index, originalTitle: '', year: 2026 } }
  }));
  for (let index = 0; index < 20; index += 1) {
    const element = {
      isConnected: true,
      dataset: { serverRecordPoster: 'node-' + index },
      querySelector() { return null; }
    };
    hooks.posterBrowserState.queue.push({
      element,
      search: hooks.serverRecordsUiState.records[index].watch.posterSearch,
      app: {},
      bypassFailure: false,
      refreshToken: 0,
      controller: new AbortController()
    });
  }
  hooks.drainPosterQueue();
  await Promise.resolve();
  assert.equal(hooks.posterBrowserState.active, 16);
  assert.equal(hooks.posterBrowserState.queue.length, 4);
  for (const job of hooks.posterBrowserState.jobs.values()) job.controller.abort();
  releaseConfig({ tmdb: { configured: false }, douban: { configured: false } });
  await new Promise(resolve => setImmediate(resolve));
});

test('server record expiry mode filter combines with search and excludes disabled expiry policies', () => {
  const { normalizeServerRecord, matchesServerRecordFilters } = loadEnhancementTestHooks();
  const rolling = normalizeServerRecord({ nodeName: 'rolling-node', displayName: '滚动服', tags: ['high'], expiryEnabled: true, expiryMode: 'rolling', expiryDays: 30 });
  const fixed = normalizeServerRecord({ nodeName: 'fixed-node', displayName: '固定服', tags: ['low'], expiryEnabled: true, expiryMode: 'fixed', expiresAt: '2026-09-01' });
  const disabled = normalizeServerRecord({ nodeName: 'disabled-node', displayName: '未启用服', expiryEnabled: false, expiryMode: 'rolling' });

  assert.equal(matchesServerRecordFilters(rolling, '', 'rolling'), true);
  assert.equal(matchesServerRecordFilters(rolling, 'high', 'rolling'), true);
  assert.equal(matchesServerRecordFilters(rolling, 'low', 'rolling'), false);
  assert.equal(matchesServerRecordFilters(rolling, '', 'fixed'), false);
  assert.equal(matchesServerRecordFilters(fixed, '', 'fixed'), true);
  assert.equal(matchesServerRecordFilters(disabled, '', 'rolling'), false);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-server-record-expiry-mode-filter/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /<option value="rolling">滚动天数<\/option><option value="fixed">固定日期<\/option>/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /const visibleLegacy = expiryModeFilter \? \[\]/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /max-width:639px[\s\S]*?server-record-filter-row\{grid-template-columns:minmax\(0,1fr\)\}/);
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

test('formal settings enhancement exposes server expiry and Telegram milestone controls', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /id="cfg-server-record-expiry-days"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /id="cfg-tg-server-expiry-enabled"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /id="cfg-server-expiry-days-list"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /\[7, 3, 1, 0\]\.map/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /settingsForm = \{ \.\.\.app\.settingsForm, serverRecordExpiryDays:/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /settingsForm = \{ \.\.\.app\.settingsForm, tgServerExpiryWarningEnabled:/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /tgServerExpiryWarningDays: selected/);
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

test('media aggregation settings expose fixed credentials and shortcut action', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-media-aggregation-panel/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-media-aggregation-username/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-media-aggregation-password/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-media-aggregation-progress/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-media-aggregation-match-mode/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-media-aggregation-first-timeout/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-media-aggregation-grace-period/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /TMDB → IMDb → 严格标题年份/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-admin-node-media-credentials/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /mediaAggregationEmbyCredentialsConfigured/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /else advancedFields\.insertAdjacentElement\('beforebegin', panel\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /applyNodeModalStateWithMediaCredentials/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /record\.removedNodes/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /checkbox\.disabled = !available/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /节点固定账号优先，全局账号作为默认兜底/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /节点固定 Emby 账号；密码可以留空/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /configured: Boolean\(username\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /username !== originalUsername/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('saveMediaAggregationPolicyShortcuts'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /改写模式/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /透传/);
});

test('sensitive credential inputs use an asterisk placeholder and a Lucide visibility toggle', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /const SENSITIVE_VALUE_PLACEHOLDER = '\*\*\*\*\*\*\*\*';/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /function mountSensitiveInputToggle\(input\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-sensitive-input-toggle/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-lucide="' \+ \(revealed \? 'eye-off' : 'eye'\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /mountSensitiveInputToggle\(passwordInput\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /mountSensitiveInputToggle\(root\.querySelector\('\[data-media-aggregation-password/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /隐藏敏感信息/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /显示敏感信息/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /function syncSensitiveInputPresentation\(input, hint = ''\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /input\.placeholder = SENSITIVE_VALUE_PLACEHOLDER;/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /syncSensitiveInputPresentation\(passwordInput, mediaAggregationState\.hasPassword/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /async function hydrateMediaAggregationState\(app, force = false, options = \{\}\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /options\.allowWhileLoading !== true/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /hydrateMediaAggregationState\(app, true, \{ allowWhileLoading: true, replaceDraft: true \}\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /#server-record-dialog \[data-sensitive-input-toggle="1"\]>button\{position:absolute/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_STYLE, /\[data-sensitive-input-toggle="1"\]>input\{padding-right:2\.75rem!important/);
});

test('Emby credential exports require an explicit confirmed admin action', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /exportNodesWithOptionalEmbyCredentials/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /includeEmbyCredentials: true/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /callConfirmedAdminAction\(this, 'exportConfig', \{ includeEmbyCredentials: true \}, 'exportConfig'\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /exportFullWithEmbyCredentials/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-admin-runtime-action="export-nodes-emby-credentials"/);
});

test('server record passwords are fetched only when the visibility control is used', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /function bindServerRecordPasswordReveal\(form, passwordInput\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /const promptForPassword = typeof window\.prompt === 'function' \? window\.prompt\.bind\(window\) : null/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /promptForPassword\('请输入管理密码以显示 EMBY 密码'\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /app\.apiCall\('getServerRecordCredential', \{ nodeName, adminPassword \}\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /SERVER_RECORD_CREDENTIAL_REVEAL_TTL_MS = 30 \* 1000/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /scheduleServerRecordCredentialConceal\(form, passwordInput, button\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /syncServerRecordCredentialFields\(form, draft, app\);/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /form\.dataset\.serverRecordCredentialPasswordLoaded = 'true';/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /form\.dataset\.serverRecordCredentialPasswordOriginal = password;/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /const passwordChanged = form\.dataset\.serverRecordCredentialPasswordLoaded === 'true'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /credentialSource === 'node' && serverRecordEmbyUsername === savedUsername && !passwordChanged/);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /name="serverRecordEmbyUsername" type="text"[^>]* required/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /if \(!serverRecordEmbyUsername && passwordChanged && serverRecordEmbyPassword\)/);
});

test('concealing a server record credential removes the revealed password from the DOM', () => {
  let clearedTimer = 0;
  const { concealServerRecordCredential } = loadEnhancementTestHooks({}, {
    clearTimeout(timer) { clearedTimer = timer; }
  });
  const attributes = {};
  const button = {
    innerHTML: '',
    setAttribute(name, value) { attributes[name] = value; }
  };
  const wrapper = { querySelector: () => button };
  const passwordInput = {
    value: 'revealed-password',
    type: 'text',
    closest: () => wrapper
  };
  const form = {
    dataset: {
      serverRecordCredentialPasswordLoaded: 'true',
      serverRecordCredentialPasswordOriginal: 'revealed-password',
      serverRecordCredentialPasswordEdited: 'true'
    },
    elements: { serverRecordEmbyPassword: passwordInput },
    __serverRecordCredentialRevealTimer: 37
  };

  concealServerRecordCredential(form);
  assert.equal(clearedTimer, 37);
  assert.equal(form.__serverRecordCredentialRevealTimer, 0);
  assert.equal(passwordInput.value, '');
  assert.equal(passwordInput.type, 'password');
  assert.equal(attributes['aria-pressed'], 'false');
  assert.equal(form.dataset.serverRecordCredentialPasswordLoaded, 'false');
  assert.equal(form.dataset.serverRecordCredentialPasswordOriginal, '');
  assert.equal(form.dataset.serverRecordCredentialPasswordEdited, 'false');
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /dialog\.addEventListener\('close',[\s\S]*?concealServerRecordCredential\(form\)/);
});

test('server record credential reveal rejects stale node and dialog sessions', () => {
  const {
    invalidateServerRecordCredentialRequest,
    isServerRecordCredentialRevealCurrent,
    serverRecordsUiState
  } = loadEnhancementTestHooks();
  const dialog = { open: true };
  const form = {
    elements: { nodeName: { value: 'alpha' } },
    closest: () => dialog
  };
  serverRecordsUiState.editingNodeName = '';

  const alphaRequest = invalidateServerRecordCredentialRequest(form);
  assert.equal(isServerRecordCredentialRevealCurrent(form, alphaRequest, 'alpha'), true);
  form.elements.nodeName.value = 'beta';
  assert.equal(isServerRecordCredentialRevealCurrent(form, alphaRequest, 'alpha'), false);

  const betaRequest = invalidateServerRecordCredentialRequest(form);
  assert.equal(isServerRecordCredentialRevealCurrent(form, alphaRequest, 'beta'), false);
  assert.equal(isServerRecordCredentialRevealCurrent(form, betaRequest, 'beta'), true);
  dialog.open = false;
  assert.equal(isServerRecordCredentialRevealCurrent(form, betaRequest, 'beta'), false);
});

test('typing a password invalidates a pending reveal without leaving the button disabled', async () => {
  const { bindServerRecordPasswordReveal, serverRecordsUiState } = loadEnhancementTestHooks();
  let resolveCredential;
  const credentialPromise = new Promise((resolve) => { resolveCredential = resolve; });
  const passwordListeners = {};
  const buttonListeners = {};
  const button = {
    disabled: false,
    addEventListener(type, listener) { buttonListeners[type] = listener; }
  };
  const wrapper = { querySelector: () => button };
  const passwordInput = {
    value: '',
    type: 'password',
    disabled: false,
    closest: () => wrapper,
    addEventListener(type, listener) { passwordListeners[type] = listener; }
  };
  const form = {
    dataset: { serverRecordCredentialConfigured: 'true' },
    elements: { nodeName: { value: 'alpha' } },
    closest: () => ({ open: true }),
    __serverRecordCredentialApp: { apiCall: () => credentialPromise }
  };
  serverRecordsUiState.editingNodeName = '';
  bindServerRecordPasswordReveal(form, passwordInput);

  const revealPromise = buttonListeners.click({ preventDefault() {}, stopImmediatePropagation() {} });
  assert.equal(button.disabled, true);
  passwordInput.value = 'manual-password';
  passwordListeners.input();
  assert.equal(button.disabled, false);

  resolveCredential({ credential: { password: 'stale-password' } });
  await revealPromise;
  assert.equal(passwordInput.value, 'manual-password');
  assert.equal(form.dataset.serverRecordCredentialPasswordLoaded, undefined);
  assert.equal(form.dataset.serverRecordCredentialPasswordEdited, 'true');
});

test('changing a server record username clears revealed password state without dropping the app', () => {
  const { handleServerRecordCredentialUsernameInput } = loadEnhancementTestHooks();
  const app = {};
  const button = {
    disabled: false,
    innerHTML: '',
    setAttribute() {},
    toggleAttribute() {}
  };
  const wrapper = { querySelector: () => button };
  const passwordInput = {
    value: 'old-password',
    type: 'text',
    disabled: false,
    dataset: {},
    closest: () => wrapper,
    setAttribute() {},
    removeAttribute() {}
  };
  const form = {
    dataset: {
      serverRecordCredentialUsername: 'old-user',
      serverRecordCredentialConfigured: 'true',
      serverRecordCredentialOriginallyConfigured: 'true',
      serverRecordCredentialSource: 'node',
      serverRecordCredentialPasswordLoaded: 'true',
      serverRecordCredentialPasswordOriginal: 'old-password'
    },
    elements: {
      serverRecordEmbyUsername: { value: 'new-user' },
      serverRecordEmbyPassword: passwordInput
    }
  };

  handleServerRecordCredentialUsernameInput(form, app);
  assert.equal(form.__serverRecordCredentialApp, app);
  assert.equal(passwordInput.value, '');
  assert.equal(passwordInput.type, 'password');
  assert.equal(form.dataset.serverRecordCredentialConfigured, 'false');
  assert.equal(form.dataset.serverRecordCredentialPasswordLoaded, 'false');
  assert.equal(form.dataset.serverRecordCredentialPasswordOriginal, '');
});

test('global aggregation credentials resync while the save action is in progress', async () => {
  const { hydrateMediaAggregationState, mediaAggregationState } = loadEnhancementTestHooks();
  mediaAggregationState.loading = true;
  mediaAggregationState.hydrated = true;
  mediaAggregationState.password = 'stale-password';
  mediaAggregationState.hasPassword = true;
  mediaAggregationState.root = null;

  await hydrateMediaAggregationState({
    apiCall: async () => ({
      config: {
        mediaAggregationNodes: ['alpha', 'beta'],
        mediaAggregationEmbyUsername: 'global-user',
        mediaAggregationEmbyPassword: '',
        mediaAggregationBidirectionalProgressEnabled: true
      }
    })
  }, true, { allowWhileLoading: true });

  assert.deepEqual([...mediaAggregationState.selected], ['alpha', 'beta']);
  assert.equal(mediaAggregationState.username, 'global-user');
  assert.equal(mediaAggregationState.password, '');
  assert.equal(mediaAggregationState.hasPassword, false);
  assert.equal(mediaAggregationState.bidirectionalProgressEnabled, true);
  assert.equal(mediaAggregationState.loading, false);
});

test('a manual server-record refresh supersedes an earlier ordinary read', async () => {
  const { loadServerRecords, serverRecordsUiState } = loadEnhancementTestHooks();
  const pending = [];
  const app = {
    apiCall(action, payload) {
      assert.equal(action, 'getServerRecordsSnapshot');
      const request = {};
      request.promise = new Promise((resolve) => { request.resolve = resolve; });
      pending.push({ payload, ...request });
      return request.promise;
    }
  };

  const ordinary = loadServerRecords(app);
  const manualRefresh = loadServerRecords(app, { forceRefresh: true });
  assert.equal(pending.length, 2);
  assert.equal(pending[0].payload.forceRefresh, false);
  assert.equal(pending[1].payload.forceRefresh, true);

  pending[0].resolve({
    records: [{ nodeName: 'stale-node', displayName: 'Stale node' }],
    availableNodes: []
  });
  await ordinary;
  assert.deepEqual([...serverRecordsUiState.records], []);
  assert.equal(serverRecordsUiState.loading, true);

  pending[1].resolve({
    records: [{ nodeName: 'current-node', displayName: 'Current node' }],
    availableNodes: [{ nodeName: 'current-node', displayName: 'Current node' }]
  });
  await manualRefresh;
  assert.deepEqual([...serverRecordsUiState.records].map((record) => record.nodeName), ['current-node']);
  assert.equal(serverRecordsUiState.loading, false);
  assert.equal(serverRecordsUiState.refreshingAll, false);
});

test('a full server-record refresh prevents an older single-card response from overwriting it', async () => {
  const { loadServerRecords, refreshSingleServerRecord, serverRecordsUiState } = loadEnhancementTestHooks();
  const pending = [];
  serverRecordsUiState.records = [{ nodeName: 'alpha', displayName: 'Initial alpha' }];
  const app = {
    apiCall(action, payload) {
      assert.equal(action, 'getServerRecordsSnapshot');
      const request = {};
      request.promise = new Promise((resolve) => { request.resolve = resolve; });
      pending.push({ payload, ...request });
      return request.promise;
    }
  };

  const single = refreshSingleServerRecord(app, 'alpha');
  const full = loadServerRecords(app, { forceRefresh: true });
  assert.equal(JSON.stringify(pending.map((request) => request.payload)), JSON.stringify([
    { forceRefresh: true, nodeName: 'alpha' },
    { forceRefresh: true }
  ]));

  pending[1].resolve({
    records: [{ nodeName: 'alpha', displayName: 'Newer full refresh', counts: { movies: 9 } }],
    availableNodes: [{ nodeName: 'alpha', displayName: 'Newer alpha' }]
  });
  await full;
  pending[0].resolve({
    records: [{ nodeName: 'alpha', displayName: 'Older single refresh', counts: { movies: 1 } }],
    availableNodes: [{ nodeName: 'stale-node', displayName: 'Stale node' }]
  });
  await single;

  assert.equal(serverRecordsUiState.records[0].displayName, 'Newer full refresh');
  assert.equal(serverRecordsUiState.records[0].counts.movies, 9);
  assert.deepEqual(serverRecordsUiState.availableNodes.map((node) => node.nodeName), ['alpha']);
});

test('ordinary server-record reloads keep session runtime but never overlay D1 counts', async () => {
  const { loadServerRecords, serverRecordsUiState } = loadEnhancementTestHooks();
  serverRecordsUiState.records = [{
    nodeName: 'alpha',
    displayName: 'Alpha',
    runtime: { state: 'online', latencyMs: 42, version: '4.8', checkedAt: '2026-07-25T01:00:00.000Z', errorCode: '' },
    counts: {
      movies: 1,
      series: 2,
      episodes: 3,
      state: 'ok',
      errors: {},
      checkedAt: '2026-07-25T01:00:00.000Z',
      source: 'live',
      persisted: false
    },
    watch: { lastWatchedAt: '2026-07-25T00:00:00.000Z', state: 'ok', itemId: 'old', itemName: 'Old', itemType: 'Movie', seriesName: '', posterSearch: { itemId: 'old', mediaType: 'movie', title: 'Old', originalTitle: '', year: null, watchedAt: '2026-07-25T00:00:00.000Z' } },
    tags: [],
    expiryEnabled: false,
    expiryMode: 'rolling',
    expiresAt: '',
    expiryDays: 30
  }];
  const app = {
    async apiCall(action, payload) {
      assert.equal(action, 'getServerRecordsSnapshot');
      assert.equal(payload?.forceRefresh, false);
      return {
        records: [{
          nodeName: 'alpha',
          displayName: 'Alpha',
          runtime: { state: 'not_checked' },
          counts: {
            movies: 10,
            series: 20,
            episodes: 30,
            state: 'ok',
            errors: {},
            checkedAt: '2026-07-25T02:00:00.000Z',
            source: 'persisted',
            persisted: true
          },
          watch: {
            lastWatchedAt: '2026-07-25T01:30:00.000Z',
            state: 'ok',
            itemId: 'new-item',
            itemName: 'New Title',
            itemType: 'Movie',
            seriesName: '',
            posterSearch: { itemId: 'new-item', mediaType: 'movie', title: 'New Title', originalTitle: 'Original New Title', year: 2025, watchedAt: '2026-07-25T01:30:00.000Z' }
          }
        }],
        availableNodes: [{ nodeName: 'alpha', displayName: 'Alpha' }]
      };
    }
  };

  await loadServerRecords(app, { forceRefresh: false });
  const record = serverRecordsUiState.records[0];
  assert.equal(record.runtime.state, 'online');
  assert.equal(record.runtime.latencyMs, 42);
  assert.equal(record.counts.movies, 10);
  assert.equal(record.counts.series, 20);
  assert.equal(record.counts.episodes, 30);
  assert.equal(record.counts.source, 'persisted');
  assert.equal(record.counts.persisted, true);
  assert.equal(record.counts.checkedAt, '2026-07-25T02:00:00.000Z');
  assert.equal(record.watch.itemId, 'new-item');
  assert.equal(record.watch.itemName, 'New Title');
  assert.deepEqual({ ...record.watch.posterSearch }, {
    itemId: 'new-item', mediaType: 'movie', title: 'New Title', originalTitle: 'Original New Title', year: 2025,
    watchedAt: '2026-07-25T01:30:00.000Z'
  });
});

test('server-record removal keeps one confirmation and one write in flight', async () => {
  const { deleteServerRecord, serverRecordsUiState } = loadEnhancementTestHooks();
  let resolveConfirmation;
  const confirmation = new Promise((resolve) => { resolveConfirmation = resolve; });
  let confirmationCount = 0;
  let writeCount = 0;
  const app = {
    askConfirm() {
      confirmationCount += 1;
      return confirmation;
    },
    async apiCall(action) {
      if (action === 'saveServerRecordSettings') {
        writeCount += 1;
        return {};
      }
      assert.equal(action, 'getServerRecordsSnapshot');
      return { records: [], availableNodes: [] };
    },
    showMessage() {}
  };
  const record = { nodeName: 'alpha', displayName: 'Alpha', tags: [], expiryEnabled: false, expiryMode: 'rolling', expiresAt: '', expiryDays: 30 };

  const first = deleteServerRecord(app, record);
  const duplicate = deleteServerRecord(app, record);
  assert.equal(confirmationCount, 1);
  assert.deepEqual([...serverRecordsUiState.deletingNodes], ['alpha']);
  await duplicate;

  resolveConfirmation(true);
  await first;
  assert.equal(writeCount, 1);
  assert.deepEqual([...serverRecordsUiState.deletingNodes], []);
});

test('aggregation save locks the command during confirmation and sends one mutation', async () => {
  const { saveMediaAggregationState, mediaAggregationState } = loadEnhancementTestHooks();
  mediaAggregationState.selected = new Set(['alpha', 'beta']);
  mediaAggregationState.username = 'global-user';
  mediaAggregationState.savedUsername = 'global-user';
  mediaAggregationState.hydrated = true;
  let resolveConfirmation;
  const confirmation = new Promise((resolve) => { resolveConfirmation = resolve; });
  let confirmationCount = 0;
  let saveCount = 0;
  let savedPayload = null;
  const app = {
    nodes: [{ name: 'alpha' }, { name: 'beta' }],
    askConfirm() {
      confirmationCount += 1;
      return confirmation;
    },
    async apiCall(action, payload) {
      if (action === 'saveMediaAggregationPolicyShortcuts') {
        saveCount += 1;
        savedPayload = payload;
        return {};
      }
      assert.equal(action, 'getSettingsBootstrap');
      return { config: { mediaAggregationNodes: ['alpha', 'beta'], mediaAggregationEmbyUsername: 'global-user' } };
    },
    showMessage() {}
  };

  const first = saveMediaAggregationState(app);
  const duplicate = saveMediaAggregationState(app);
  assert.equal(confirmationCount, 1);
  assert.equal(mediaAggregationState.savePending, true);
  await duplicate;

  resolveConfirmation(true);
  await first;
  assert.equal(saveCount, 1);
  assert.equal(savedPayload.matchMode, 'title_year');
  assert.equal(savedPayload.firstResultTimeoutMs, 1500);
  assert.equal(savedPayload.gracePeriodMs, 800);
  assert.equal(mediaAggregationState.savePending, false);
  assert.equal(mediaAggregationState.loading, false);
});

test('stale aggregation hydration does not overwrite a locally edited draft', async () => {
  const { hydrateMediaAggregationState, markMediaAggregationDraftDirty, mediaAggregationState } = loadEnhancementTestHooks();
  let resolveBootstrap;
  const bootstrap = new Promise((resolve) => { resolveBootstrap = resolve; });
  const app = { apiCall: () => bootstrap };

  const hydration = hydrateMediaAggregationState(app, true, { allowWhileLoading: true });
  mediaAggregationState.username = 'local-draft';
  markMediaAggregationDraftDirty();
  resolveBootstrap({ config: { mediaAggregationNodes: ['remote'], mediaAggregationEmbyUsername: 'remote-user' } });
  await hydration;

  assert.equal(mediaAggregationState.username, 'local-draft');
  assert.equal(mediaAggregationState.hydrated, false);
  assert.equal(mediaAggregationState.loading, false);
});

test('only the latest aggregation hydration response can update the draft', async () => {
  const { hydrateMediaAggregationState, mediaAggregationState } = loadEnhancementTestHooks();
  const pending = [];
  const app = {
    apiCall() {
      const request = {};
      request.promise = new Promise((resolve) => { request.resolve = resolve; });
      pending.push(request);
      return request.promise;
    }
  };

  const first = hydrateMediaAggregationState(app, true, { allowWhileLoading: true });
  const second = hydrateMediaAggregationState(app, true, { allowWhileLoading: true });
  assert.equal(pending.length, 2);
  pending[1].resolve({ config: { mediaAggregationNodes: ['new'], mediaAggregationEmbyUsername: 'new-user' } });
  await second;
  pending[0].resolve({ config: { mediaAggregationNodes: ['old'], mediaAggregationEmbyUsername: 'old-user' } });
  await first;

  assert.deepEqual([...mediaAggregationState.selected], ['new']);
  assert.equal(mediaAggregationState.username, 'new-user');
});

test('server-record asynchronous state exposes a polite live summary and focus restoration', async () => {
  const focused = [];
  const trigger = {
    isConnected: true,
    focus(options) { focused.push(options); }
  };
  const { restoreServerRecordDialogFocus, serverRecordsUiState } = loadEnhancementTestHooks(
    { querySelector: () => null },
    { requestAnimationFrame(callback) { callback(); return 1; } }
  );
  serverRecordsUiState.dialogTrigger = trigger;
  restoreServerRecordDialogFocus();
  assert.equal(focused.length, 1);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-server-record-summary role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-server-record-grid aria-busy="false"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /grid\.setAttribute\('aria-busy', serverRecordsUiState\.loading \|\| serverRecordsUiState\.refreshingAll \? 'true' : 'false'\)/);
});

test('backup view exposes only the paired Worker and HTML upload flow', async () => {
  const template = await readFile(new URL('../frontend/admin-runtime.template.html', import.meta.url), 'utf8');
  const adminConsoleDoc = await readFile(new URL('../docs/admin-console.md', import.meta.url), 'utf8');
  const cdnChecker = await readFile(new URL('../frontend/scripts/check-cdn-paths.mjs', import.meta.url), 'utf8');
  const vueRuntimeConfig = await readFile(new URL('../frontend/src/config/runtime.js', import.meta.url), 'utf8');
  const vueAdminConsole = await readFile(new URL('../frontend/src/composables/useAdminConsole.js', import.meta.url), 'utf8');
  assert.match(template, /id:"admin-worker-html-update-root"/);
  assert.doesNotMatch(template, /cfg-release-repo|cfg-release-branch|cfg-release-tag|cfg-index-url/);
  assert.doesNotMatch(template, /releaseRepo|releaseBranch|releaseTag|buildGithubReleaseSourceState/);
  assert.doesNotMatch(template, /updateWorkerScriptContent|从 GitHub 拉取并更新 Worker/);
  assert.match(template, /\\u4fdd\\u5b58\\u9759\\u6001\\u8d44\\u6e90\\u7b56\\u7565/);
  assert.doesNotMatch(template, /\\u4fdd\\u5b58\\u9759\\u6001\\u8d44\\u6e90\\u7b56\\u7565\\u4e0e\\u53d1\\u5e03\\u6e90/);
  assert.doesNotMatch(adminConsoleDoc, /#dashboard\s*->\s*#nodes\s*->\s*#logs\s*->\s*#dns\s*->\s*#settings/);
  assert.doesNotMatch(cdnChecker, /Release-only/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('updateWorkerAndAdminIndex'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /workerFileName: state\.workerFile\.name/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /indexFileName: state\.indexFile\.name/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /必须同时选择 worker\.js 和 index\.html/);
  assert.doesNotMatch(vueRuntimeConfig, /VITE_INDEX_URL|VITE_RELEASE_INDEX_URL/);
  assert.doesNotMatch(vueAdminConsole, /updateWorkerScriptContent|releaseRepo|releaseBranch|releaseTag/);
  assert.match(vueAdminConsole, /callAdminAction\('updateWorkerAndAdminIndex'/);
  assert.match(vueAdminConsole, /workerScriptContent/);
  assert.match(vueAdminConsole, /indexHtml/);
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

test('D1 schema dialog includes migrations, columns, and reported issues', () => {
  const { formatD1SchemaStatus } = loadEnhancementTestHooks();
  const message = formatD1SchemaStatus({
    migrationReady: false,
    runtimeCompatibilityReady: false,
    appliedMigrations: ['0001.sql'],
    missingMigrations: ['0002.sql'],
    latestRequiredMigration: '0002.sql',
    columns: {
      auth_failures: { ip: true, expires_at: false }
    },
    issues: ['missing_column:auth_failures.expires_at']
  });

  assert.match(message, /缺失迁移：0002\.sql/);
  assert.match(message, /auth_failures\.ip：就绪/);
  assert.match(message, /auth_failures\.expires_at：缺失/);
  assert.match(message, /结构问题：\n• missing_column:auth_failures\.expires_at/);
});

test('initialize DB is the single schema mutation action and reports bookmark plus adopted migrations', async () => {
  const { patchSafetyContractMethods, formatD1InitializationResult } = loadEnhancementTestHooks();
  const calls = [];
  const messages = [];
  const result = {
    runtimeCompatibilityReady: true,
    migrationReady: true,
    recoveryBookmark: 'bookmark-before-init',
    adoptedMigrations: ['0004_server_watch_stats', '0005_server_record_snapshots'],
    status: {
      runtimeCompatibilityReady: true,
      migrationReady: true,
      missingMigrations: [],
      issues: []
    },
    initialization: {
      createdTables: ['server_last_watch'],
      adjustedColumns: ['auth_failures.expires_at'],
      createdIndexes: [],
      repairedIndexes: ['idx_auth_failures_expires_at'],
      droppedRetiredIndexes: ['idx_proxy_logs_client_ip'],
      adoptedMigrations: ['0004_server_watch_stats', '0005_server_record_snapshots'],
      migrationTableCreated: true,
      ftsRecreated: true
    }
  };
  const app = {
    async apiCall(action) {
      calls.push(action);
      return result;
    },
    applyAdminRevisions() {},
    showMessage(message, options) {
      messages.push({ message, options });
    }
  };

  patchSafetyContractMethods(app);
  await app.initLogsDbFromUi();

  assert.deepEqual(calls, ['initLogsDb']);
  assert.equal(messages[0].options.title, '初始化 DB 结果');
  assert.equal(messages[0].options.tone, 'success');
  assert.match(messages[0].message, /新建表：server_last_watch/);
  assert.match(messages[0].message, /采纳迁移基线：0004_server_watch_stats、0005_server_record_snapshots/);
  assert.match(messages[0].message, /初始化前 Time Travel Bookmark：\nbookmark-before-init/);
  assert.match(formatD1InitializationResult(result), /移除旧索引：idx_proxy_logs_client_ip/);
  assert.doesNotMatch(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('initD1Schema'|apiCall\('getD1SchemaStatus'/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-admin-runtime-action="d1-schema-bookmark"/);
});

test('bookmark UI action reads and copies the current Time Travel bookmark without schema actions', async () => {
  const copied = [];
  const { patchSafetyContractMethods } = loadEnhancementTestHooks({}, {
    navigator: {
      clipboard: {
        async writeText(value) {
          copied.push(value);
        }
      }
    }
  });
  const calls = [];
  const messages = [];
  const app = {
    async apiCall(action) {
      calls.push(action);
      return { bookmark: 'bookmark-current-primary' };
    },
    async showMessage(message, options) {
      messages.push({ message, options });
    }
  };

  patchSafetyContractMethods(app);
  await app.getD1TimeTravelBookmarkFromUi();

  assert.deepEqual(calls, ['getD1TimeTravelBookmark']);
  assert.deepEqual(copied, ['bookmark-current-primary']);
  assert.equal(messages[0].options.title, 'D1 Time Travel Bookmark');
  assert.equal(messages[0].options.tone, 'success');
  assert.match(messages[0].message, /Bookmark 已复制到剪贴板/);
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
      if (action === 'initLogsDb') {
        return {
          runtimeCompatibilityReady: true,
          migrationReady: true,
          status: { runtimeCompatibilityReady: true, migrationReady: true, issues: [] },
          initialization: { createdTables: ['proxy_logs'], adjustedColumns: [], createdIndexes: [] }
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
    'initLogsDb',
    'previewTidyData',
    'tidyD1Data'
  ]);
  assert.equal(calls.at(-1).payload?.planToken, 'signed-d1-plan');
  assert.deepEqual(Object.keys(calls.at(-1).payload || {}), ['planToken']);
  assert.equal(confirmations.length, 2);
  assert.equal(confirmations[0].options.confirmText, '初始化 DB');
  assert.equal(confirmations[1].options.confirmText, '开始整理 D1');
  assert.equal(messages[0].options.title, '初始化 DB 结果');
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
