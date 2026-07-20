import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import {
  inspectRuntimeAssets,
  isForbiddenRuntimeAsset
} from '../frontend/scripts/check-cdn-paths.mjs';
import { ADMIN_RUNTIME_ENHANCEMENT_SCRIPT } from '../frontend/scripts/admin-runtime-enhancements.mjs';

function loadEnhancementTestHooks(documentOverrides = {}) {
  const inlineScript = ADMIN_RUNTIME_ENHANCEMENT_SCRIPT
    .replace(/^<script[^>]*>\n?/, '')
    .replace(/<\/script>$/, '');
  const closureEnd = inlineScript.lastIndexOf('})();');
  assert.notEqual(closureEnd, -1, 'enhancement script must use the expected closure');
  const instrumentedScript = inlineScript.slice(0, closureEnd)
    + 'window.__enhancementTestHooks = { formatD1SchemaStatus, patchSafetyContractMethods };\n'
    + inlineScript.slice(closureEnd);
  const window = {
    addEventListener() {},
    setTimeout() { return 1; }
  };
  const document = {
    readyState: 'loading',
    addEventListener() {},
    ...documentOverrides
  };
  vm.runInNewContext(instrumentedScript, {
    console: { error() {} },
    document,
    window
  });
  return window.__enhancementTestHooks;
}

test('admin runtime enhancement observes lazily mounted logs view', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /shellHookSelector = '[^']*#view-logs/);
});

test('dashboard traffic card exposes an on-demand day and month toggle', () => {
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-dashboard-traffic-toggle/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /data-lucide="repeat-2"/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /apiCall\('getMonthlyTrafficStats'\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /今日视频流量 \(CF Zone 总流量\)/);
  assert.match(ADMIN_RUNTIME_ENHANCEMENT_SCRIPT, /本月视频流量 \(CF Zone 总流量\)/);
});

test('backup view exposes only the paired Worker and HTML upload flow', async () => {
  const template = await readFile(new URL('../frontend/admin-runtime.template.html', import.meta.url), 'utf8');
  const adminConsoleDoc = await readFile(new URL('../docs/admin-console.md', import.meta.url), 'utf8');
  const cdnChecker = await readFile(new URL('../frontend/scripts/check-cdn-paths.mjs', import.meta.url), 'utf8');
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
