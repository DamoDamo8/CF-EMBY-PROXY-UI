import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

await import("../worker.js");

const hooks = globalThis.__EMBY_PROXY_NODE_TEST_HOOKS__;
assert.ok(hooks, "worker.js must expose Node test hooks");

const {
  Config,
  GLOBALS,
  Database,
  CacheManager,
  Proxy,
  RuntimeEntry,
  isEmbyWebProxyPath,
  buildWorkerMetadataCacheIdentityPartition,
  buildWorkerMetadataPrewarmIdentityPartition,
  buildWorkerMetadataCachePolicyRevision,
  buildCanonicalWorkerMetadataCacheKey,
  buildWorkerMetadataCacheLookupRequest,
  hasWorkerMetadataPrivateIdentity,
  buildProxyAccessRuleProfile,
  fetchGithubApiJson,
  serializeBoundedLogDetailJson,
  runSingleFlight,
  getRuntimeConfig,
  invalidateRuntimeConfigCache,
  invalidateNodesRevisionCache,
  buildAdminRemoteShellErrorContent,
  renderAdminRemoteShellErrorPage,
  isAdminIndexSetupForced,
  ensureAdminRemoteTailwindConfigGlobal,
  buildAdminRemoteShellCacheKeyRequest,
  buildAdminRemoteShellLegacyCacheKeyRequest,
  fetchAdminRemoteShellStoredResponse,
  buildAdminRemoteShellStoredResponse,
  patchAdminShellRuntimeStatus,
  renderRemoteAdminPage,
  renderAdminPage,
  isAcceptedAdminHtmlDocumentContentType,
  isMutableJsdelivrGithubAssetUrl,
  renderAdminReleaseVendorAsset,
  isAdminWarmRoute,
  warmAdminReleaseVendorEntries,
  buildAdminWarmSubrequest,
  isAdminWarmResponseSuccessful,
  buildDailyTelegramSummaryMessage
} = hooks;

assert.ok(RuntimeEntry && typeof RuntimeEntry === "object", "missing Node test hook: RuntimeEntry");

const requiredFunctionHooks = {
  runSingleFlight,
  isEmbyWebProxyPath,
  buildWorkerMetadataCacheIdentityPartition,
  buildWorkerMetadataPrewarmIdentityPartition,
  buildWorkerMetadataCachePolicyRevision,
  buildCanonicalWorkerMetadataCacheKey,
  buildWorkerMetadataCacheLookupRequest,
  hasWorkerMetadataPrivateIdentity,
  buildProxyAccessRuleProfile,
  fetchGithubApiJson,
  serializeBoundedLogDetailJson,
  getRuntimeConfig,
  invalidateRuntimeConfigCache,
  invalidateNodesRevisionCache,
  buildAdminRemoteShellErrorContent,
  renderAdminRemoteShellErrorPage,
  isAdminIndexSetupForced,
  ensureAdminRemoteTailwindConfigGlobal,
  buildAdminRemoteShellCacheKeyRequest,
  buildAdminRemoteShellLegacyCacheKeyRequest,
  fetchAdminRemoteShellStoredResponse,
  buildAdminRemoteShellStoredResponse,
  patchAdminShellRuntimeStatus,
  renderRemoteAdminPage,
  renderAdminPage,
  isAcceptedAdminHtmlDocumentContentType,
  isMutableJsdelivrGithubAssetUrl,
  renderAdminReleaseVendorAsset,
  isAdminWarmRoute,
  warmAdminReleaseVendorEntries,
  buildAdminWarmSubrequest,
  isAdminWarmResponseSuccessful,
  buildDailyTelegramSummaryMessage
};

for (const [name, value] of Object.entries(requiredFunctionHooks)) {
  assert.equal(typeof value, "function", `missing Node test hook: ${name}`);
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function withWorkerGlobals(overrides, callback) {
  const originalDescriptors = new Map();
  for (const [name, value] of Object.entries(overrides)) {
    originalDescriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value
    });
  }
  try {
    return await callback();
  } finally {
    for (const [name, descriptor] of originalDescriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
}

function countOccurrences(value, fragment) {
  return String(value).split(fragment).length - 1;
}

function createInMemoryKvStore(initialValues = {}) {
  const storedValues = new Map(
    Object.entries(initialValues).map(([key, value]) => [
      key,
      typeof value === "string" ? value : JSON.stringify(value)
    ])
  );
  const putKeys = [];
  const deleteKeys = [];
  const kv = {
    async get(key, options = {}) {
      const stored = storedValues.get(key);
      if (stored === undefined) return null;
      return options.type === "json" ? JSON.parse(stored) : stored;
    },
    async put(key, value) {
      putKeys.push(key);
      storedValues.set(key, String(value));
    },
    async delete(key) {
      deleteKeys.push(key);
      storedValues.delete(key);
    },
    async list(options = {}) {
      const prefix = String(options.prefix || "");
      return {
        keys: [...storedValues.keys()]
          .filter(key => key.startsWith(prefix))
          .map(name => ({ name })),
        list_complete: true
      };
    }
  };
  return { kv, storedValues, putKeys, deleteKeys };
}

function createCloudflareDnsFetch(initialRecords = [], options = {}) {
  const records = new Map(initialRecords.map(record => [String(record.id), structuredClone(record)]));
  let nextId = initialRecords.length + 1;
  let mutationCount = 0;
  const jsonResponse = payload => new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" }
  });
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = String(init.method || "GET").toUpperCase();
    if (method === "GET" && url.pathname.endsWith("/zones/zone-id")) {
      return jsonResponse({ success: true, result: { id: "zone-id", name: "proxy.example" } });
    }
    if (!url.pathname.includes("/zones/zone-id/dns_records")) {
      throw new Error(`unexpected Cloudflare request: ${method} ${url}`);
    }
    if (method === "GET") {
      const recordPathMatch = /\/dns_records\/([^/]+)$/.exec(url.pathname);
      if (recordPathMatch) {
        const recordId = decodeURIComponent(recordPathMatch[1]);
        return jsonResponse({ success: true, result: records.get(recordId) || null });
      }
      const name = String(url.searchParams.get("name") || "").toLowerCase();
      const result = [...records.values()].filter(record => !name || String(record.name || "").toLowerCase() === name);
      return jsonResponse({ success: true, result, result_info: { total_pages: 1 } });
    }
    mutationCount += 1;
    if (mutationCount === Number(options.failMutationAt)) {
      throw new Error(String(options.failureMessage || "dns_mutation_failed"));
    }
    const recordId = decodeURIComponent(url.pathname.split("/").at(-1) || "");
    if (method === "DELETE") {
      records.delete(recordId);
      return jsonResponse({ success: true, result: { id: recordId } });
    }
    const body = JSON.parse(String(init.body || "{}"));
    if (method === "PUT") {
      records.set(recordId, { id: recordId, ...body });
      return jsonResponse({ success: true, result: records.get(recordId) });
    }
    if (method === "POST") {
      const id = `created-${nextId++}`;
      records.set(id, { id, ...body });
      return jsonResponse({ success: true, result: records.get(id) });
    }
    throw new Error(`unexpected Cloudflare request: ${method} ${url}`);
  };
  return { fetch, records };
}

function getComparableDnsRecords(records) {
  return [...records.values()]
    .map(record => ({
      name: record.name,
      type: record.type,
      content: record.content,
      ttl: record.ttl,
      proxied: record.proxied === true
    }))
    .sort((left, right) => `${left.type}:${left.content}`.localeCompare(`${right.type}:${right.content}`));
}

test("daily Telegram summary places monthly traffic below today's traffic", async () => {
  const originalBuildDashboardStatsPayload = Database.buildDashboardStatsPayload;
  const originalGetDashboardMonthlyTrafficPayload = Database.getDashboardMonthlyTrafficPayload;
  const ctx = { waitUntil() {} };
  try {
    Database.buildDashboardStatsPayload = async () => ({
      requestCountDisplay: "1,234",
      todayTraffic: "12.5 GB",
      playCount: 56,
      infoCount: 78,
      todayRequests: 1234
    });
    Database.getDashboardMonthlyTrafficPayload = async (_env, options = {}) => {
      assert.equal(options.ctx, ctx);
      return { traffic: "345.6 GB" };
    };

    const payload = await Database.buildDailyTelegramSummaryPayload({}, {
      config: { scheduleUtcOffsetMinutes: 480 },
      ctx,
      now: new Date("2026-07-19T04:00:00.000Z")
    });
    assert.equal(payload.monthlyTraffic, "345.6 GB");

    const message = buildDailyTelegramSummaryMessage(payload, { dateKey: "2026-07-19" });
    assert.equal(message, [
      "📊 EMBY-PROXY每日报表 (2026-07-19)",
      "",
      "请求数: 1,234",
      "视频流量 (CF 总计): 12.5 GB",
      "本月流量 (CF 总计): 345.6 GB",
      "请求: 播放请求 56 次 | 获取播放信息 78 次",
      "#Cloudflare #Emby #日报"
    ].join("\n"));
  } finally {
    Database.buildDashboardStatsPayload = originalBuildDashboardStatsPayload;
    Database.getDashboardMonthlyTrafficPayload = originalGetDashboardMonthlyTrafficPayload;
  }
});

test("GitHub API success payloads are bounded and require valid JSON", async () => {
  await withWorkerGlobals({
    fetch: async () => new Response("{}", {
      headers: { "Content-Length": String((4 * 1024 * 1024) + 1) }
    })
  }, async () => {
    await assert.rejects(
      fetchGithubApiJson("/repos/axuitomo/CF-EMBY-PROXY-UI"),
      error => error?.code === "GITHUB_RELEASE_SOURCE_RESPONSE_TOO_LARGE" && error?.status === 502
    );
  });

  await withWorkerGlobals({
    fetch: async () => new Response("not-json")
  }, async () => {
    await assert.rejects(
      fetchGithubApiJson("/repos/axuitomo/CF-EMBY-PROXY-UI"),
      error => error?.code === "GITHUB_RELEASE_SOURCE_RESPONSE_INVALID" && error?.status === 502
    );
  });
});

test("oversized log detail fallback remains valid JSON", () => {
  const serialized = serializeBoundedLogDetailJson({ detail: "x".repeat(9000) });
  assert.ok(serialized.length <= 8192);
  assert.deepEqual(JSON.parse(serialized), { truncated: true });
});

test("monthly traffic stats are on-demand cached without touching D1", async () => {
  const zoneId = `monthly-zone-${Date.now()}`;
  const { kv } = createInMemoryKvStore({
    [Database.CONFIG_KEY]: {
      cfZoneId: zoneId,
      cfApiToken: "monthly-token",
      scheduleUtcOffsetMinutes: 480
    }
  });
  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: `monthly-traffic-${zoneId}`
  };
  const d1 = new globalThis.Proxy({}, {
    get() {
      throw new Error("monthly traffic must not access D1");
    }
  });
  const cacheEntries = new Map();
  const edgeCache = {
    async match(request) {
      return cacheEntries.get(request.url)?.clone() || null;
    },
    async put(request, response) {
      cacheEntries.set(request.url, response.clone());
    }
  };
  let graphqlRequestCount = 0;
  const fetch = async (input, init = {}) => {
    assert.equal(String(input), "https://api.cloudflare.com/client/v4/graphql");
    graphqlRequestCount += 1;
    const body = JSON.parse(String(init.body || "{}"));
    assert.match(body.query, /httpRequestsAdaptiveGroups/);
    assert.match(body.query, /edgeResponseBytes/);
    return new Response(JSON.stringify({
      data: {
        viewer: {
          zones: [{
            series: [
              { sum: { edgeResponseBytes: 1024 } },
              { sum: { edgeResponseBytes: 2048 } }
            ]
          }]
        }
      }
    }), { headers: { "Content-Type": "application/json" } });
  };
  const backgroundTasks = [];
  const ctx = { waitUntil(task) { backgroundTasks.push(Promise.resolve(task)); } };

  invalidateRuntimeConfigCache();
  GLOBALS.DashboardMonthlyTrafficCache.clear();
  await withWorkerGlobals({ fetch, caches: { default: edgeCache } }, async () => {
    const firstResponse = await Database.ApiHandlers.getMonthlyTrafficStats({}, {
      env,
      ctx,
      kv,
      db: d1
    });
    const firstPayload = await firstResponse.json();
    assert.equal(firstPayload.traffic, "3 KB");
    assert.equal(firstPayload.cfAnalyticsLoaded, true);
    assert.equal(firstPayload.period, "month");
    assert.equal(graphqlRequestCount, 1);
    await Promise.all(backgroundTasks.splice(0));

    const memoryResponse = await Database.ApiHandlers.getMonthlyTrafficStats({}, {
      env,
      ctx,
      kv,
      db: d1
    });
    assert.equal((await memoryResponse.json()).cacheStatus, "cache");
    assert.equal(graphqlRequestCount, 1);

    GLOBALS.DashboardMonthlyTrafficCache.clear();
    const edgeResponse = await Database.ApiHandlers.getMonthlyTrafficStats({}, {
      env,
      ctx,
      kv,
      db: d1
    });
    assert.equal((await edgeResponse.json()).cacheStatus, "cache");
    assert.equal(graphqlRequestCount, 1);
  });
});

test("remote shell error responses are no-store and never expose saved secrets", async () => {
  let cacheReadCount = 0;
  let cacheWriteCount = 0;
  const edgeCache = {
    async match() {
      cacheReadCount += 1;
      return null;
    },
    async put() {
      cacheWriteCount += 1;
    }
  };
  const env = { ADMIN_PATH: "/admin" };
  const initHealth = { ok: true, missing: [] };
  const config = {
    cfApiToken: "cf-api-token-must-not-leak",
    tgBotToken: "telegram-token-must-not-leak",
    tgChatId: "chat-id-must-not-leak",
    indexUrl: "https://example.test/releases/v1/index.html"
  };
  const statusOptions = {
    reason: "remote_shell_render_failed: upstream unavailable",
    remoteShellIndexUrl: config.indexUrl
  };

  await withWorkerGlobals({ caches: { default: edgeCache } }, async () => {
    const response = await renderAdminRemoteShellErrorPage(
      new Request("https://worker.test/admin"),
      env,
      null,
      initHealth,
      statusOptions,
      config
    );
    const html = await response.text();

    assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
    assert.match(html, /href="\/admin\?setup=1"/);
    assert.doesNotMatch(html, /saveConfig|currentConfig|cfApiToken|tgBotToken/);
    assert.doesNotMatch(html, /cf-api-token-must-not-leak|telegram-token-must-not-leak|chat-id-must-not-leak/);

    const headResponse = await renderAdminRemoteShellErrorPage(
      new Request("https://worker.test/admin", { method: "HEAD" }),
      env,
      null,
      initHealth,
      statusOptions,
      config
    );
    assert.equal(headResponse.headers.get("Cache-Control"), "no-store, max-age=0");
    assert.equal(await headResponse.text(), "");
  });

  assert.equal(cacheReadCount, 0);
  assert.equal(cacheWriteCount, 0);
});

test("stable admin shell cache-hit status writes are throttled per D1 binding", async () => {
  const db = { prepare() { throw new Error("unexpected D1 query"); } };
  const env = { DB: db, ADMIN_PATH: "/admin" };
  const originalPatchOpsStatus = Database.patchOpsStatus;
  const writes = [];
  Database.patchOpsStatus = async (_envOrStore, patch) => {
    writes.push(patch);
    return patch;
  };
  const baseStatus = {
    shellState: {
      remoteShellConfigured: true,
      embeddedFallbackAvailable: true,
      finalUiHtmlRetired: true,
      remoteShellIndexUrl: "https://example.test/releases/v1/index.html"
    },
    initHealth: { ok: true, missing: [] },
    mode: "remote",
    sourceType: "remote_cache",
    routeState: "remote_active",
    remoteCacheState: "hit",
    lastFetchStatus: "cached",
    reason: "served_cached_remote_shell",
    requestPath: "/admin",
    throttleStableWrites: true
  };

  try {
    await patchAdminShellRuntimeStatus(env, baseStatus);
    await patchAdminShellRuntimeStatus(env, baseStatus);
    assert.equal(writes.length, 1);
    assert.deepEqual(
      Object.keys(GLOBALS.AdminShellStatusWriteState.get(db) || {}).sort(),
      ["fingerprint", "writePromise", "writtenAt"]
    );

    await patchAdminShellRuntimeStatus(env, {
      ...baseStatus,
      remoteCacheState: "stale_hit",
      revalidateDue: true,
      reason: "served_cached_remote_shell_and_scheduled_revalidate"
    });
    assert.equal(writes.length, 2);

    await patchAdminShellRuntimeStatus(env, {
      ...baseStatus,
      throttleStableWrites: false
    });
    assert.equal(writes.length, 3);
  } finally {
    Database.patchOpsStatus = originalPatchOpsStatus;
  }
});

test("error content contains only the manual setup link", () => {
  const html = buildAdminRemoteShellErrorContent(
    { adminPath: "/console", loginPath: "/console/login" },
    { remoteShellIndexUrl: "https://example.test/index.html" },
    {},
    { reason: "upstream unavailable" }
  );

  assert.match(html, /href="\/console\?setup=1"/);
  assert.doesNotMatch(html, /<script|saveConfig|currentConfig/);
});

test("setup query accepts only 1 and true", () => {
  assert.equal(isAdminIndexSetupForced(new Request("https://worker.test/admin?setup=1")), true);
  assert.equal(isAdminIndexSetupForced(new Request("https://worker.test/admin?setup=true")), true);
  assert.equal(isAdminIndexSetupForced(new Request("https://worker.test/admin?setup=TRUE")), true);
  assert.equal(isAdminIndexSetupForced(new Request("https://worker.test/admin?setup=0")), false);
  assert.equal(isAdminIndexSetupForced(new Request("https://worker.test/admin?setup=false")), false);
  assert.equal(isAdminIndexSetupForced(new Request("https://worker.test/admin")), false);
});

test("admin warm route is exact and follows the configured admin path", () => {
  assert.equal(isAdminWarmRoute("/admin/__warm", "/admin"), true);
  assert.equal(isAdminWarmRoute("/console/__warm/", "/console"), true);
  assert.equal(isAdminWarmRoute("/admin", "/admin"), false);
  assert.equal(isAdminWarmRoute("/admin/__warm/asset", "/admin"), false);
});

test("manual setup renders GET and HEAD as no-store with the recovery reason", async () => {
  const statusPatches = [];
  const originalPatchOpsStatus = Database.patchOpsStatus;
  Database.patchOpsStatus = async (_env, patch) => {
    statusPatches.push(patch);
    return patch;
  };

  try {
    const getResponse = await renderAdminPage(
      new Request("https://worker.test/console?setup=1"),
      { ADMIN_PATH: "/console" },
      null,
      { ok: true, missing: [] },
      { indexUrl: "https://example.test/releases/v1/index.html" }
    );
    assert.equal(getResponse.status, 200);
    assert.equal(getResponse.headers.get("Cache-Control"), "no-store, max-age=0");
    assert.match(await getResponse.text(), /class="admin-gate-shell"/);

    const headResponse = await renderAdminPage(
      new Request("https://worker.test/console?setup=true", { method: "HEAD" }),
      { ADMIN_PATH: "/console" },
      null,
      { ok: true, missing: [] },
      { indexUrl: "https://example.test/releases/v1/index.html" }
    );
    assert.equal(headResponse.status, 200);
    assert.equal(headResponse.headers.get("Cache-Control"), "no-store, max-age=0");
    assert.equal(await headResponse.text(), "");
  } finally {
    Database.patchOpsStatus = originalPatchOpsStatus;
  }

  assert.deepEqual(
    statusPatches.map(patch => patch.adminShell.reason),
    ["manual_setup_requested", "manual_setup_requested"]
  );
});

test("Tailwind compatibility prelude is targeted and idempotent", () => {
  const legacyShell = "<!doctype html><html><head><script src=\"https://cdn.tailwindcss.com\"></script><script nonce=\"abc\">tailwind.config={darkMode:'class'}</script></head><body><div id=\"app\"></div></body></html>";
  const migratedShell = ensureAdminRemoteTailwindConfigGlobal(legacyShell);
  const prelude = '<script id="admin-tailwind-prelude">window.tailwind=window.tailwind||{};</script>';

  assert.equal(countOccurrences(migratedShell, prelude), 1);
  assert.ok(migratedShell.indexOf(prelude) < migratedShell.indexOf("tailwind.config"));

  const currentShell = `<!doctype html><html><head>${prelude}<script>tailwind.config={}</script></head><body><div id="app"></div></body></html>`;
  assert.equal(ensureAdminRemoteTailwindConfigGlobal(currentShell), currentShell);

  const shellWithoutTailwindConfig = "<!doctype html><html><head><script src=\"/app.js\"></script></head><body><div id=\"app\"></div></body></html>";
  assert.equal(ensureAdminRemoteTailwindConfigGlobal(shellWithoutTailwindConfig), shellWithoutTailwindConfig);
  assert.equal(ensureAdminRemoteTailwindConfigGlobal(migratedShell), migratedShell);
});

test("Tailwind compatibility distinguishes real attributes from data attributes", () => {
  const prelude = '<script id="admin-tailwind-prelude">window.tailwind=window.tailwind||{};</script>';
  const dataAttributeShell = '<!doctype html><html><head><script data-id="admin-tailwind-prelude"></script><script data-src="legacy.js">tailwind.config={}</script></head><body><div id="app"></div></body></html>';
  const migratedShell = ensureAdminRemoteTailwindConfigGlobal(dataAttributeShell);

  assert.equal(countOccurrences(migratedShell, prelude), 1);
  assert.ok(migratedShell.indexOf(prelude) < migratedShell.indexOf("tailwind.config"));

  const existingSingleQuotedPrelude = "<script id = 'admin-tailwind-prelude'>window.tailwind={};</script><script>tailwind.config={}</script>";
  assert.equal(ensureAdminRemoteTailwindConfigGlobal(existingSingleQuotedPrelude), existingSingleQuotedPrelude);

  const quotedAttributeShell = '<script title=" id=\'admin-tailwind-prelude\' "></script><script title=" src=legacy.js ">tailwind.config={}</script>';
  assert.equal(countOccurrences(ensureAdminRemoteTailwindConfigGlobal(quotedAttributeShell), prelude), 1);
});

test("remote shell cache identity separates legacy, transform, and full bootstrap variants", () => {
  const request = new Request("https://worker.test/admin?ignored=1");
  const sourceUrl = "https://example.test/releases/v1/index.html";
  const bootstrapA = {
    adminPath: "/admin",
    contract: { primaryViews: ["dashboard", "settings"] },
    initHealth: { ok: true, detail: { revision: "a" } }
  };
  const bootstrapB = {
    ...bootstrapA,
    initHealth: { ok: true, detail: { revision: "b" } }
  };

  const legacyUrl = new URL(buildAdminRemoteShellLegacyCacheKeyRequest(request, sourceUrl).url);
  const currentAUrl = new URL(buildAdminRemoteShellCacheKeyRequest(request, sourceUrl, bootstrapA).url);
  const currentBUrl = new URL(buildAdminRemoteShellCacheKeyRequest(request, sourceUrl, bootstrapB).url);

  assert.equal(legacyUrl.searchParams.has("transform"), false);
  assert.equal(legacyUrl.searchParams.has("bootstrap"), false);
  assert.ok(currentAUrl.searchParams.get("transform"));
  assert.ok(currentAUrl.searchParams.get("bootstrap"));
  assert.notEqual(currentAUrl.href, legacyUrl.href);
  assert.notEqual(currentAUrl.href, currentBUrl.href);
  assert.equal(currentAUrl.pathname, "/admin");
});

test("legacy stale cache migrates to the current key before one failing SWR task", async () => {
  GLOBALS.SingleFlightTasks.clear();
  GLOBALS.AdminRemoteShellCacheMutationChains.clear();
  const remoteShellIndexUrl = "https://example.test/releases/v1/index.html";
  const legacyHtml = '<!doctype html><html><head><script id="admin-bootstrap" type="application/json">{"old":true}</script><script>tailwind.config={}</script></head><body><div id="app"></div></body></html>';
  const legacyResponse = buildAdminRemoteShellStoredResponse(legacyHtml, {
    variantEtag: "legacy-browser-etag",
    lastModified: "Wed, 01 Jul 2026 12:00:00 GMT",
    originEtag: "legacy-upstream-etag",
    originLastModified: "Tue, 30 Jun 2026 12:00:00 GMT",
    sourceUrl: remoteShellIndexUrl,
    cachedAt: 1
  });
  const events = [];
  const storedWrites = [];
  const storedResponses = new Map();
  const backgroundTasks = [];
  const reportedWarnings = [];
  const edgeCache = {
    async match(request) {
      const url = new URL(request.url);
      events.push(`match:${url.searchParams.has("transform") ? "current" : "legacy"}`);
      return url.searchParams.has("transform") ? null : legacyResponse.clone();
    },
    async put(request, response) {
      const url = new URL(request.url);
      events.push(`put:${url.searchParams.has("transform") ? "current" : "legacy"}`);
      storedResponses.set(url.href, response.clone());
      storedWrites.push({
        url,
        cachedAt: response.headers.get("X-Admin-Shell-Cached-At"),
        html: await response.clone().text()
      });
    }
  };
  const ctx = {
    waitUntil(task) {
      backgroundTasks.push(Promise.resolve(task));
    }
  };
  const quietConsole = Object.assign(Object.create(console), {
    warn(...args) {
      reportedWarnings.push(args);
    }
  });

  await withWorkerGlobals({
    caches: { default: edgeCache },
    console: quietConsole,
    fetch: async () => {
      events.push("revalidate");
      throw new Error("revalidation unavailable");
    }
  }, async () => {
    const response = await renderRemoteAdminPage(
      new Request("https://worker.test/admin"),
      { ADMIN_PATH: "/admin" },
      ctx,
      { ok: true, missing: [] },
      remoteShellIndexUrl,
      { indexUrl: remoteShellIndexUrl, releaseTag: "v1.0.0" }
    );
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, /id="admin-tailwind-prelude"/);
    assert.doesNotMatch(html, /\{"old":true\}/);
    assert.equal(storedWrites.length, 1);
    assert.equal(backgroundTasks.length, 1);
    await Promise.all(backgroundTasks);
  });

  assert.deepEqual(events, ["match:current", "match:legacy", "match:current", "put:current", "revalidate"]);
  assert.equal(storedWrites.length, 1);
  assert.ok(storedWrites[0].url.searchParams.get("transform"));
  assert.ok(storedWrites[0].url.searchParams.get("bootstrap"));
  assert.equal(storedWrites[0].cachedAt, "1");
  assert.match(storedWrites[0].html, /id="admin-tailwind-prelude"/);
  assert.equal(storedResponses.has(storedWrites[0].url.href), true);
  assert.equal(reportedWarnings.length, 1);
  assert.equal(GLOBALS.SingleFlightTasks.size, 0);
  assert.equal(GLOBALS.AdminRemoteShellCacheMutationChains.size, 0);
});

test("concurrent legacy migration cannot overwrite a fresh revalidation in one isolate", async () => {
  GLOBALS.SingleFlightTasks.clear();
  GLOBALS.AdminRemoteShellCacheMutationChains.clear();
  const remoteShellIndexUrl = "https://example.test/releases/v1/index.html";
  const legacyHtml = '<!doctype html><html><head><script>tailwind.config={}</script></head><body><div id="app">legacy-marker</div></body></html>';
  const legacyResponse = buildAdminRemoteShellStoredResponse(legacyHtml, {
    variantEtag: "legacy-etag",
    lastModified: "Wed, 01 Jul 2026 12:00:00 GMT",
    originEtag: "legacy-upstream-etag",
    originLastModified: "Tue, 30 Jun 2026 12:00:00 GMT",
    sourceUrl: remoteShellIndexUrl,
    cachedAt: 1
  });
  const freshCommitted = createDeferred();
  const backgroundTasks = [];
  let currentMatchCount = 0;
  let legacyMatchCount = 0;
  let staleWriteCount = 0;
  let freshWriteCount = 0;
  let revalidationFetchCount = 0;
  let currentStoredResponse = null;
  const edgeCache = {
    async match(request) {
      const currentKey = new URL(request.url).searchParams.has("transform");
      if (currentKey) {
        currentMatchCount += 1;
        return null;
      }
      legacyMatchCount += 1;
      return legacyResponse.clone();
    },
    async put(_request, response) {
      const html = await response.clone().text();
      if (html.includes("legacy-marker")) {
        staleWriteCount += 1;
        if (staleWriteCount > 1) await freshCommitted.promise;
      } else if (html.includes("fresh-marker")) {
        freshWriteCount += 1;
      } else {
        throw new Error("unexpected remote shell cache write");
      }
      currentStoredResponse = response.clone();
      if (html.includes("fresh-marker")) freshCommitted.resolve();
    }
  };
  const ctx = {
    waitUntil(task) {
      backgroundTasks.push(Promise.resolve(task));
    }
  };

  await withWorkerGlobals({
    caches: { default: edgeCache },
    fetch: async () => {
      revalidationFetchCount += 1;
      if (revalidationFetchCount > 1) throw new Error("duplicate revalidation");
      return new Response('<!doctype html><html><body><div id="app">fresh-marker</div></body></html>', {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          ETag: '"fresh-upstream-etag"',
          "Last-Modified": "Thu, 02 Jul 2026 12:00:00 GMT"
        }
      });
    }
  }, async () => {
    const render = () => renderRemoteAdminPage(
      new Request("https://worker.test/admin"),
      { ADMIN_PATH: "/admin" },
      ctx,
      { ok: true, missing: [] },
      remoteShellIndexUrl,
      { indexUrl: remoteShellIndexUrl, releaseTag: "v1.0.0" }
    );
    const responses = await Promise.all([render(), render()]);
    const responseBodies = await Promise.all(responses.map(response => response.text()));
    assert.equal(responseBodies.length, 2);
    for (const responseBody of responseBodies) assert.match(responseBody, /legacy-marker/);
    await Promise.all(backgroundTasks);
  });

  assert.equal(currentMatchCount, 2);
  assert.equal(legacyMatchCount, 1);
  assert.equal(staleWriteCount, 1);
  assert.equal(freshWriteCount, 1);
  assert.equal(revalidationFetchCount, 1);
  assert.match(await currentStoredResponse.text(), /fresh-marker/);
  assert.equal(GLOBALS.SingleFlightTasks.size, 0);
  assert.equal(GLOBALS.AdminRemoteShellCacheMutationChains.size, 0);
});

test("legacy migration waits for an in-flight fresh write after current-cache eviction", async () => {
  GLOBALS.SingleFlightTasks.clear();
  GLOBALS.AdminRemoteShellCacheMutationChains.clear();
  const remoteShellIndexUrl = "https://example.test/releases/v1/index.html";
  const staleResponse = buildAdminRemoteShellStoredResponse(
    '<!doctype html><html><body><div id="app">stale-marker</div></body></html>',
    {
      variantEtag: "stale-etag",
      sourceUrl: remoteShellIndexUrl,
      cachedAt: 1
    }
  );
  const legacyResponse = buildAdminRemoteShellStoredResponse(
    '<!doctype html><html><body><div id="app">legacy-marker</div></body></html>',
    {
      variantEtag: "legacy-etag",
      sourceUrl: remoteShellIndexUrl,
      cachedAt: 1
    }
  );
  const revalidationFetchStarted = createDeferred();
  const allowFreshFetch = createDeferred();
  const legacyMatchObserved = createDeferred();
  const freshCommitted = createDeferred();
  const backgroundTasks = [];
  let currentStoredResponse = staleResponse.clone();
  let revalidationFetchCount = 0;
  let legacyMatchCount = 0;
  let staleWriteCount = 0;
  let freshWriteCount = 0;
  const edgeCache = {
    async match(request) {
      if (new URL(request.url).searchParams.has("transform")) {
        return currentStoredResponse ? currentStoredResponse.clone() : null;
      }
      legacyMatchCount += 1;
      legacyMatchObserved.resolve();
      return legacyResponse.clone();
    },
    async put(_request, response) {
      const html = await response.clone().text();
      if (html.includes("fresh-marker")) {
        freshWriteCount += 1;
        currentStoredResponse = response.clone();
        freshCommitted.resolve();
        return;
      }
      if (html.includes("legacy-marker")) {
        staleWriteCount += 1;
        await freshCommitted.promise;
        currentStoredResponse = response.clone();
        return;
      }
      throw new Error("unexpected remote shell cache write");
    }
  };
  const ctx = {
    waitUntil(task) {
      backgroundTasks.push(Promise.resolve(task));
    }
  };
  const render = () => renderRemoteAdminPage(
    new Request("https://worker.test/admin"),
    { ADMIN_PATH: "/admin" },
    ctx,
    { ok: true, missing: [] },
    remoteShellIndexUrl,
    { indexUrl: remoteShellIndexUrl, releaseTag: "v1.0.0" }
  );

  await withWorkerGlobals({
    caches: { default: edgeCache },
    fetch: async () => {
      revalidationFetchCount += 1;
      revalidationFetchStarted.resolve();
      await allowFreshFetch.promise;
      return new Response('<!doctype html><html><body><div id="app">fresh-marker</div></body></html>', {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
  }, async () => {
    const firstResponse = await render();
    assert.match(await firstResponse.text(), /stale-marker/);
    await revalidationFetchStarted.promise;

    currentStoredResponse = null;
    const secondResponsePromise = render();
    await legacyMatchObserved.promise;
    allowFreshFetch.resolve();

    const secondResponse = await secondResponsePromise;
    assert.match(await secondResponse.text(), /fresh-marker/);
    await Promise.all(backgroundTasks);
  });

  assert.equal(revalidationFetchCount, 1);
  assert.equal(legacyMatchCount, 1);
  assert.equal(staleWriteCount, 0);
  assert.equal(freshWriteCount, 1);
  assert.match(await currentStoredResponse.text(), /fresh-marker/);
  assert.equal(GLOBALS.SingleFlightTasks.size, 0);
  assert.equal(GLOBALS.AdminRemoteShellCacheMutationChains.size, 0);
});

test("304 refresh preserves representation and upstream validators", async () => {
  const previousHtml = '<!doctype html><html><head><script id="admin-tailwind-prelude">window.tailwind=window.tailwind||{};</script></head><body><div id="app"></div></body></html>';
  const previousResponse = buildAdminRemoteShellStoredResponse(previousHtml, {
    variantEtag: "browser-representation-v1",
    lastModified: "Wed, 01 Jul 2026 12:00:00 GMT",
    originEtag: "upstream-v1",
    originLastModified: "Tue, 30 Jun 2026 12:00:00 GMT",
    sourceUrl: "https://example.test/index.html",
    cachedAt: 1
  });
  const previousHeaders = new Headers(previousResponse.headers);
  let sentHeaders = null;

  await withWorkerGlobals({
    fetch: async (_url, init) => {
      sentHeaders = new Headers(init?.headers);
      return new Response(null, {
        status: 304,
        headers: {
          ETag: '"different-upstream-etag"',
          "Last-Modified": "Thu, 02 Jul 2026 12:00:00 GMT"
        }
      });
    }
  }, async () => {
    const payload = await fetchAdminRemoteShellStoredResponse(
      "https://example.test/index.html",
      { adminPath: "/admin" },
      { ok: true, missing: [] },
      previousResponse
    );
    const refreshedResponse = payload.storedResponse;

    assert.equal(await refreshedResponse.clone().text(), previousHtml);
    assert.equal(refreshedResponse.headers.get("ETag"), previousHeaders.get("ETag"));
    assert.equal(refreshedResponse.headers.get("Last-Modified"), previousHeaders.get("Last-Modified"));
    assert.equal(refreshedResponse.headers.get("X-Admin-Shell-Source-Etag"), previousHeaders.get("X-Admin-Shell-Source-Etag"));
    assert.equal(refreshedResponse.headers.get("X-Admin-Shell-Source-Last-Modified"), previousHeaders.get("X-Admin-Shell-Source-Last-Modified"));
    assert.notEqual(refreshedResponse.headers.get("X-Admin-Shell-Cached-At"), previousHeaders.get("X-Admin-Shell-Cached-At"));
  });

  assert.equal(sentHeaders.get("If-None-Match"), "upstream-v1");
  assert.equal(sentHeaders.get("If-Modified-Since"), "Tue, 30 Jun 2026 12:00:00 GMT");
});

test("cached remote shell route returns a stable conditional 304", async () => {
  GLOBALS.SingleFlightTasks.clear();
  const remoteShellIndexUrl = "https://example.test/releases/v1/index.html";
  const cachedResponse = buildAdminRemoteShellStoredResponse(
    '<!doctype html><html><body><div id="app">cached</div></body></html>',
    {
      variantEtag: "route-representation-etag",
      lastModified: "Wed, 01 Jul 2026 12:00:00 GMT",
      originEtag: "route-upstream-etag",
      originLastModified: "Tue, 30 Jun 2026 12:00:00 GMT",
      sourceUrl: remoteShellIndexUrl,
      cachedAt: Date.now()
    }
  );
  let cacheReadCount = 0;
  let fetchCount = 0;

  await withWorkerGlobals({
    caches: {
      default: {
        async match() {
          cacheReadCount += 1;
          return cachedResponse.clone();
        }
      }
    },
    fetch: async () => {
      fetchCount += 1;
      throw new Error("fresh cache must not revalidate");
    }
  }, async () => {
    const response = await renderRemoteAdminPage(
      new Request("https://worker.test/admin", {
        headers: { "If-None-Match": '"route-representation-etag"' }
      }),
      { ADMIN_PATH: "/admin" },
      null,
      { ok: true, missing: [] },
      remoteShellIndexUrl,
      { indexUrl: remoteShellIndexUrl, releaseTag: "v1.0.0" }
    );

    assert.equal(response.status, 304);
    assert.equal(response.headers.get("ETag"), '"route-representation-etag"');
    assert.equal(response.headers.get("Last-Modified"), null);
    assert.equal(await response.text(), "");
  });

  assert.equal(cacheReadCount, 1);
  assert.equal(fetchCount, 0);
  assert.equal(GLOBALS.SingleFlightTasks.size, 0);
});

test("remote shell does not reuse source Last-Modified for transformed representations", async () => {
  GLOBALS.SingleFlightTasks.clear();
  const remoteShellIndexUrl = "https://example.test/releases/v1/index.html";
  const cachedResponse = buildAdminRemoteShellStoredResponse(
    '<!doctype html><html><body><div id="app">new-bootstrap</div></body></html>',
    {
      variantEtag: "new-representation-etag",
      lastModified: "Wed, 01 Jul 2026 12:00:00 GMT",
      originLastModified: "Wed, 01 Jul 2026 12:00:00 GMT",
      sourceUrl: remoteShellIndexUrl,
      cachedAt: Date.now()
    }
  );

  await withWorkerGlobals({
    caches: {
      default: {
        async match() {
          return cachedResponse.clone();
        }
      }
    }
  }, async () => {
    const response = await renderRemoteAdminPage(
      new Request("https://worker.test/admin", {
        headers: { "If-Modified-Since": "Wed, 01 Jul 2026 12:00:00 GMT" }
      }),
      { ADMIN_PATH: "/admin" },
      null,
      { ok: true, missing: [] },
      remoteShellIndexUrl,
      { indexUrl: remoteShellIndexUrl, releaseTag: "v1.0.0" }
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Last-Modified"), null);
    assert.match(await response.text(), /new-bootstrap/);
  });
});

test("concurrent remote shell cold loads share one upstream fetch", async () => {
  GLOBALS.SingleFlightTasks.clear();
  const remoteShellIndexUrl = "https://example.test/releases/v1/index.html";
  const fetchGate = createDeferred();
  let upstreamFetchCount = 0;
  let cacheWriteCount = 0;
  const originalPatchOpsStatus = Database.patchOpsStatus;
  Database.patchOpsStatus = async () => null;

  try {
    await withWorkerGlobals({
      caches: {
        default: {
          async match() {
            return null;
          },
          async put() {
            cacheWriteCount += 1;
          }
        }
      },
      fetch: async () => {
        upstreamFetchCount += 1;
        await fetchGate.promise;
        return new Response('<!doctype html><html><body><div id="app"></div></body></html>', {
          headers: { "Content-Type": "text/html", ETag: '"v1"' }
        });
      }
    }, async () => {
      const requests = Array.from({ length: 6 }, () => renderRemoteAdminPage(
        new Request("https://worker.test/admin"),
        { ADMIN_PATH: "/admin" },
        null,
        { ok: true, missing: [] },
        remoteShellIndexUrl,
        { indexUrl: remoteShellIndexUrl, releaseTag: "v1.0.0" }
      ));
      await Promise.resolve();
      fetchGate.resolve();
      const responses = await Promise.all(requests);
      assert.deepEqual(responses.map(response => response.status), [200, 200, 200, 200, 200, 200]);
    });
  } finally {
    Database.patchOpsStatus = originalPatchOpsStatus;
  }

  assert.equal(upstreamFetchCount, 1);
  assert.equal(cacheWriteCount, 1);
  assert.equal(GLOBALS.SingleFlightTasks.size, 0);
});

test("vendor warmup preserves order and limits concurrency", async () => {
  let activeCount = 0;
  let peakActiveCount = 0;
  const releaseNext = [];
  const entries = Array.from({ length: 8 }, (_, index) => ({ assetKey: `asset-${index}` }));
  const warmTask = warmAdminReleaseVendorEntries(entries, async (entry) => {
    activeCount += 1;
    peakActiveCount = Math.max(peakActiveCount, activeCount);
    await new Promise(resolve => releaseNext.push(resolve));
    activeCount -= 1;
    return entry.assetKey;
  });

  await Promise.resolve();
  assert.equal(activeCount, 3);
  while (releaseNext.length > 0) {
    releaseNext.shift()();
    await Promise.resolve();
  }
  const responses = await warmTask;

  assert.equal(peakActiveCount, 3);
  assert.deepEqual(responses, entries.map(entry => entry.assetKey));
});

test("admin warm subrequests are unconditional and treat cached 304 responses as success", () => {
  const request = buildAdminWarmSubrequest(new URL("https://worker.test/admin"));
  assert.equal(request.method, "HEAD");
  assert.equal(request.cache, "no-store");
  assert.equal(request.headers.get("If-None-Match"), null);
  assert.equal(request.headers.get("If-Modified-Since"), null);
  assert.equal(request.headers.get("Range"), null);
  assert.equal(isAdminWarmResponseSuccessful(new Response(null, { status: 200 })), true);
  assert.equal(isAdminWarmResponseSuccessful(new Response(null, { status: 304 })), true);
  assert.equal(isAdminWarmResponseSuccessful(new Response(null, { status: 502 })), false);
});

test("metadata cache keys partition identities without exposing credentials", async () => {
  const anonymousRequest = new Request("https://worker.test/nodes/alpha/Images/Primary?tag=v1");
  const firstIdentityRequest = new Request("https://worker.test/nodes/alpha/Images/Primary?api_key=secret-a&UserId=user-a&tag=v1", {
    headers: {
      "X-Emby-Token": "header-secret-a",
      "Cookie": "auth_token=admin-cookie; emby_session=session-a"
    }
  });
  const secondIdentityRequest = new Request("https://worker.test/nodes/alpha/Images/Primary?api_key=secret-b&UserId=user-b&tag=v1", {
    headers: { "X-Emby-Token": "header-secret-b" }
  });
  const [anonymousPartition, firstPartition, secondPartition] = await Promise.all([
    buildWorkerMetadataCacheIdentityPartition(anonymousRequest),
    buildWorkerMetadataCacheIdentityPartition(firstIdentityRequest),
    buildWorkerMetadataCacheIdentityPartition(secondIdentityRequest)
  ]);

  assert.match(anonymousPartition, /^[a-f0-9]{64}$/);
  assert.notEqual(firstPartition, secondPartition);
  assert.equal(hasWorkerMetadataPrivateIdentity(anonymousRequest), false);
  assert.equal(hasWorkerMetadataPrivateIdentity(firstIdentityRequest), true);

  const policyRevision = buildWorkerMetadataCachePolicyRevision("/Items/1/Images/Primary", {
    imageCacheMaxAge: 3600,
    prewarmCacheTtl: 120
  });
  const firstKey = buildCanonicalWorkerMetadataCacheKey(
    new URL(firstIdentityRequest.url),
    "alpha",
    "node-key",
    "/Items/1/Images/Primary",
    {
      search: new URL(firstIdentityRequest.url).search,
      nodeCacheRevision: "node-r1",
      entryMode: "kv_route",
      identityPartition: firstPartition,
      cachePolicyRevision: policyRevision
    }
  );
  const secondKey = buildCanonicalWorkerMetadataCacheKey(
    new URL(secondIdentityRequest.url),
    "alpha",
    "node-key",
    "/Items/1/Images/Primary",
    {
      search: new URL(secondIdentityRequest.url).search,
      nodeCacheRevision: "node-r1",
      entryMode: "kv_route",
      identityPartition: secondPartition,
      cachePolicyRevision: policyRevision
    }
  );

  assert.ok(firstKey instanceof Request);
  assert.ok(secondKey instanceof Request);
  assert.notEqual(firstKey.url, secondKey.url);
  assert.doesNotMatch(firstKey.url, /secret-a|header-secret-a|session-a|user-a/);
  assert.equal(buildCanonicalWorkerMetadataCacheKey(firstIdentityRequest.url, "alpha", "node-key", "/Items/1/Images/Primary"), null);
});

test("metadata prewarm partitions each target's sensitive query", async () => {
  const sourceRequest = new Request("https://worker.test/alpha/Items", {
    headers: {
      "X-Emby-Token": "shared-header-secret",
      "Cookie": "emby_session=shared-session"
    }
  });
  const [firstPartition, secondPartition] = await Promise.all([
    buildWorkerMetadataPrewarmIdentityPartition(
      sourceRequest,
      new URL("https://origin.test/Items/1/Images/Primary?api_key=target-secret-a&tag=v1")
    ),
    buildWorkerMetadataPrewarmIdentityPartition(
      sourceRequest,
      new URL("https://origin.test/Items/1/Images/Primary?api_key=target-secret-b&tag=v1")
    )
  ]);

  assert.match(firstPartition, /^[a-f0-9]{64}$/);
  assert.notEqual(firstPartition, secondPartition);
  assert.doesNotMatch(firstPartition, /target-secret|shared-header-secret|shared-session/);
});

test("metadata cache policy revisions change with TTL and asset kind", () => {
  const imageHour = buildWorkerMetadataCachePolicyRevision("/Items/1/Images/Primary", {
    imageCacheMaxAge: 3600,
    prewarmCacheTtl: 120
  });
  const imageDisabled = buildWorkerMetadataCachePolicyRevision("/Items/1/Images/Primary", {
    imageCacheMaxAge: 0,
    prewarmCacheTtl: 120
  });
  const manifest = buildWorkerMetadataCachePolicyRevision("/Videos/1/main.m3u8", {
    imageCacheMaxAge: 3600,
    prewarmCacheTtl: 120
  });

  assert.notEqual(imageHour, imageDisabled);
  assert.notEqual(imageHour, manifest);
});

test("metadata cache lookups preserve supported request conditions and bypass If-Range", () => {
  const cacheKey = new Request("https://worker-cache.test/item?identity=abc");
  const sourceRequest = new Request("https://worker.test/item", {
    headers: {
      "Range": "bytes=10-19",
      "If-None-Match": '"etag-v1"',
      "If-Modified-Since": "Sun, 12 Jul 2026 00:00:00 GMT"
    }
  });
  const lookupRequest = buildWorkerMetadataCacheLookupRequest(cacheKey, sourceRequest);

  assert.ok(lookupRequest instanceof Request);
  assert.equal(lookupRequest.url, cacheKey.url);
  assert.equal(lookupRequest.headers.get("Range"), "bytes=10-19");
  assert.equal(lookupRequest.headers.get("If-None-Match"), '"etag-v1"');
  assert.equal(lookupRequest.headers.get("If-Modified-Since"), "Sun, 12 Jul 2026 00:00:00 GMT");
  assert.equal(buildWorkerMetadataCacheLookupRequest(cacheKey, new Request("https://worker.test/item", {
    headers: { "If-Range": '"etag-v1"', "Range": "bytes=10-19" }
  })), null);
});

test("private metadata responses stay browser-private and upstream fetch bypasses shared cache", async () => {
  const privateRequest = new Request("https://worker.test/Items/1/Images/Primary", {
    headers: { "X-Emby-Token": "secret-token" }
  });
  const publicRequest = new Request("https://worker.test/Items/1/Images/Primary");
  const requestTraits = {
    isImage: true,
    isStaticFile: false,
    isSubtitle: false,
    isManifest: false,
    isMetadataCacheable: true,
    isBigStream: false,
    isSmartStrmMedia: false,
    isSegment: false
  };
  const privateHeaders = Proxy.buildProxyResponseHeaders(
    new Response("image"),
    privateRequest,
    {},
    "*",
    requestTraits,
    { imageCacheMaxAge: 3600 }
  );
  const publicHeaders = Proxy.buildProxyResponseHeaders(
    new Response("image"),
    publicRequest,
    {},
    "*",
    requestTraits,
    { imageCacheMaxAge: 3600 }
  );
  assert.equal(privateHeaders.get("Cache-Control"), "private, max-age=3600");
  assert.equal(publicHeaders.get("Cache-Control"), "public, max-age=3600");

  const buildFetchOptions = Proxy.createBuildFetchOptions({
    request: privateRequest,
    requestMethod: "GET",
    requestTraits,
    protocolFallback: true
  }, {
    newHeaders: new Headers(privateRequest.headers),
    adminCustomHeaders: new Set(),
    preparedBody: null,
    preparedBodyMode: "none"
  });
  const fetchOptions = await buildFetchOptions(new URL("https://origin.test/Items/1/Images/Primary"));
  assert.equal(fetchOptions.cache, "no-store");
  assert.equal(Object.hasOwn(fetchOptions, "cf"), false);
});

test("single-flight deduplicates equal keys while distinct keys run independently", async () => {
  GLOBALS.SingleFlightTasks.clear();
  const sharedGate = createDeferred();
  let sharedLoadCount = 0;
  const first = runSingleFlight("test:shared", async () => {
    sharedLoadCount += 1;
    return sharedGate.promise;
  });
  const second = runSingleFlight("test:shared", async () => {
    sharedLoadCount += 1;
    return "unexpected";
  });
  await Promise.resolve();
  assert.equal(sharedLoadCount, 1);
  sharedGate.resolve("shared-result");
  assert.deepEqual(await Promise.all([first, second]), ["shared-result", "shared-result"]);

  const runningKeys = [];
  const [left, right] = await Promise.all([
    runSingleFlight("test:left", async () => {
      runningKeys.push("left");
      await Promise.resolve();
      return "left";
    }),
    runSingleFlight("test:right", async () => {
      runningKeys.push("right");
      await Promise.resolve();
      return "right";
    })
  ]);
  assert.deepEqual(new Set(runningKeys), new Set(["left", "right"]));
  assert.deepEqual([left, right], ["left", "right"]);
});

test("single-flight rejection clears the key for a later retry", async () => {
  GLOBALS.SingleFlightTasks.clear();
  let loadCount = 0;
  await assert.rejects(
    runSingleFlight("test:retry", async () => {
      loadCount += 1;
      throw new Error("first attempt failed");
    }),
    /first attempt failed/
  );
  assert.equal(GLOBALS.SingleFlightTasks.has("test:retry"), false);

  const retriedValue = await runSingleFlight("test:retry", async () => {
    loadCount += 1;
    return "recovered";
  });
  assert.equal(retriedValue, "recovered");
  assert.equal(loadCount, 2);
  assert.equal(GLOBALS.SingleFlightTasks.has("test:retry"), false);
});

test("runtime route context normalizes hostnames once and defers CORS headers", async () => {
  const request = new Request("https://Node.Media.Example.COM./Videos/1/stream", {
    headers: { Origin: "https://client.test" }
  });
  const NativeHeaders = Headers;
  let headersConstructionCount = 0;

  await withWorkerGlobals({
    Headers: class CountingHeaders extends NativeHeaders {
      constructor(init) {
        super(init);
        headersConstructionCount += 1;
      }
    }
  }, async () => {
    const routeContext = RuntimeEntry.buildFetchRouteContext(request, {
      HOST: "Media.Example.COM.",
      LEGACY_HOST: "Legacy.Example.COM.",
      ADMIN_PASS: "test-password",
      JWT_SECRET: "test-secret"
    });

    assert.equal(routeContext.requestHost, "node.media.example.com");
    assert.equal(routeContext.configuredHost, "media.example.com");
    assert.equal(routeContext.configuredLegacyHost, "legacy.example.com");
    assert.equal(Object.hasOwn(routeContext, "requestHostLower"), false);
    assert.equal(Object.hasOwn(routeContext, "dynamicCors"), false);
    assert.equal(headersConstructionCount, 0);

    const response = RuntimeEntry.buildRouteCorsResponse(request, {}, "Not Found", 404);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://client.test");
    assert.equal(response.headers.get("Vary"), "Origin");
    assert.equal(headersConstructionCount, 1);
  });
});

test("proxy access rules reuse one parsed profile per runtime config object", () => {
  const runtimeConfig = {
    corsOrigins: " https://client-a.test, https://client-b.test,https://client-a.test ",
    ipBlacklist: "198.51.100.1, 198.51.100.2",
    geoAllowlist: "us, ca",
    geoBlocklist: "kp"
  };
  const firstProfile = buildProxyAccessRuleProfile(runtimeConfig);
  const secondProfile = buildProxyAccessRuleProfile(runtimeConfig);

  assert.equal(secondProfile, firstProfile);
  assert.deepEqual(firstProfile.corsOrigins, ["https://client-a.test", "https://client-b.test"]);
  assert.equal(
    Proxy.resolveCorsOrigin(runtimeConfig, new Request("https://worker.test", {
      headers: { Origin: "https://client-b.test" }
    })),
    "https://client-b.test"
  );
  assert.equal(Proxy.evaluateFirewall(runtimeConfig, "198.51.100.1", "US", "*")?.status, 403);
  assert.equal(Proxy.evaluateFirewall(runtimeConfig, "203.0.113.1", "US", "*"), null);
  assert.equal(Proxy.evaluateFirewall(runtimeConfig, "203.0.113.1", "FR", "*")?.status, 403);

  runtimeConfig.geoBlocklist = "US";
  const updatedProfile = buildProxyAccessRuleProfile(runtimeConfig);
  assert.notEqual(updatedProfile, firstProfile);
  assert.equal(Proxy.evaluateFirewall(runtimeConfig, "203.0.113.1", "US", "*")?.status, 403);
});

test("playback-critical route detection preserves encoded and link-variant paths", () => {
  const playbackRoutes = [
    ["node", "Videos", "1", "stream"],
    ["node", "__proxy-a", "Videos", "1", "stream.m3u8"],
    ["node", "__PROXY-B", "Items", "1", "download"],
    ["node", "Videos", "1", "stream%2Em3u8"],
    ["legacy", "node", "Videos", "1", "stream"]
  ];
  const nonPlaybackRoutes = [
    ["node", "webhooks", "events"],
    ["node", "Items", "1"],
    ["node", "__proxy-a", "api", "system", "info"]
  ];

  for (const segments of playbackRoutes) {
    assert.equal(RuntimeEntry.isPlaybackCriticalRouteContext({ segments }), true, segments.join("/"));
  }
  for (const segments of nonPlaybackRoutes) {
    assert.equal(RuntimeEntry.isPlaybackCriticalRouteContext({ segments }), false, segments.join("/"));
  }
});

test("Emby Web proxy boundary rejects only the exact web subtree", async () => {
  const webPaths = [
    "/web",
    "/web/",
    "/WEB/index.html",
    "/web/app.js",
    "/web/image.png",
    "/web%2Findex.html",
    "/web%5Cindex.html",
    "/%57eb/index.html",
    "/%2557eb%252Findex.html",
    "/%252557eb/index.html",
    "/web%25252Findex.html",
    "/foo/%2e%2e/web/index.html",
    "/web%2Findex%ZZ.html",
    "/%77eb/%ZZ/app.js"
  ];
  const nonWebPaths = [
    "/websocket",
    "/websocket/events",
    "/webhooks",
    "/webhooks/events",
    "/web-api",
    "/webby",
    "/api/web",
    "/Items",
    "/Videos/1/stream"
  ];
  for (const proxyPath of webPaths) assert.equal(isEmbyWebProxyPath(proxyPath), true, proxyPath);
  for (const proxyPath of nonWebPaths) assert.equal(isEmbyWebProxyPath(proxyPath), false, proxyPath);

  let upstreamFetchCount = 0;
  await withWorkerGlobals({
    fetch: async () => {
      upstreamFetchCount += 1;
      return new Response("unexpected upstream response");
    }
  }, async () => {
    for (const proxyPath of webPaths) {
      const request = new Request("https://worker.test/node/secret?backup=1", {
        headers: {
          Cookie: "emby_web_bypass=1",
          Origin: "https://client.test"
        }
      });
      const response = await Proxy.handle(
        request,
        null,
        proxyPath,
        "node",
        "secret",
        {},
        null,
        { runtimeConfig: { rateLimitRpm: 0 } }
      );
      assert.equal(response.status, 404, proxyPath);
      assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
      assert.equal(response.headers.get("Location"), null);
      assert.equal(response.headers.get("Set-Cookie"), null);
      assert.equal(response.headers.get("Vary"), "Origin");
      assert.equal(await response.text(), "Not Found");
    }

    for (const method of ["HEAD", "OPTIONS", "POST"]) {
      const request = new Request("https://worker.test/node/secret?backup=1", {
        method,
        headers: { Cookie: "emby_web_bypass=1" }
      });
      const response = await Proxy.handle(request, null, "/web", "node", "secret", {}, null, {
        runtimeConfig: { rateLimitRpm: 0 }
      });
      assert.equal(response.status, 404, method);
      assert.equal(await response.text(), method === "HEAD" ? "" : "Not Found");
    }
  });
  assert.equal(upstreamFetchCount, 0);

  const encodedWebRelayTarget = Buffer.from("https://origin.test/web/index.html", "utf8").toString("base64url");
  let relayFetchCount = 0;
  await withWorkerGlobals({
    fetch: async () => {
      relayFetchCount += 1;
      return new Response("unexpected relay response");
    }
  }, async () => {
    for (const relayVisiblePath of ["/web/index.html", "/Items/1"]) {
      const proxyPath = `/__playback-relay${relayVisiblePath}`;
      const request = new Request(
        `https://worker.test/node/secret${proxyPath}?__pb_target=${encodeURIComponent(encodedWebRelayTarget)}`
      );
      const response = await Proxy.handle(
        request,
        { target: "https://origin.test" },
        proxyPath,
        "node",
        "secret",
        {},
        { waitUntil() {} },
        { requestUrl: new URL(request.url), runtimeConfig: { rateLimitRpm: 0 } }
      );
      assert.equal(response.status, 404, relayVisiblePath);
      assert.equal(await response.text(), "Not Found");
    }
  });
  assert.equal(relayFetchCount, 0);

  let redirectFetchCount = 0;
  await withWorkerGlobals({
    fetch: async (url) => {
      redirectFetchCount += 1;
      assert.equal(new URL(url).pathname, redirectFetchCount === 1 ? "/emby/" : "/web/index.html");
      if (redirectFetchCount === 1) return new Response(null, { status: 302, headers: { Location: "/web/index.html" } });
      return new Response("unexpected web response");
    }
  }, async () => {
    const request = new Request("https://worker.test/node/secret/");
    const response = await Proxy.handle(
      request,
      { target: "https://origin.test/emby" },
      "/",
      "node",
      "secret",
      {},
      { waitUntil() {} },
      { requestUrl: new URL(request.url), runtimeConfig: { rateLimitRpm: 0 } }
    );
    assert.equal(response.status, 404);
    assert.match(response.headers.get("Cache-Control") || "", /^no-store/);
    assert.equal(await response.text(), "Not Found");
  });
  assert.equal(redirectFetchCount, 1);

  let playbackFallbackFetchCount = 0;
  await withWorkerGlobals({
    fetch: async (url) => {
      playbackFallbackFetchCount += 1;
      assert.equal(new URL(url).pathname, "/Videos/1/stream");
      return new Response(null, { status: 302, headers: { Location: "/web/index.html" } });
    }
  }, async () => {
    const request = new Request("https://worker.test/node/secret/Videos/1/stream?__pb_abs=1");
    const response = await Proxy.handle(
      request,
      { target: "https://origin.test" },
      "/Videos/1/stream",
      "node",
      "secret",
      {},
      { waitUntil() {} },
      { requestUrl: new URL(request.url), runtimeConfig: { rateLimitRpm: 0 } }
    );
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("Location"), null);
    assert.equal(await response.text(), "Not Found");
  });
  assert.equal(playbackFallbackFetchCount, 1);

  let rangeProbeFetchCount = 0;
  let rangeProbeBodyCancelCount = 0;
  await withWorkerGlobals({
    fetch: async (url, init = {}) => {
      rangeProbeFetchCount += 1;
      assert.equal(new URL(url).pathname, "/Videos/1/stream");
      assert.equal(init.method, "HEAD");
      const body = new ReadableStream({
        cancel() { rangeProbeBodyCancelCount += 1; }
      });
      return new Response(body, { status: 302, headers: { Location: "/web/index.html" } });
    }
  }, async () => {
    const request = new Request("https://worker.test/node/secret/Videos/1/stream", {
      headers: { Range: "bytes=0-1023" }
    });
    const response = await Proxy.handle(
      request,
      { target: "https://origin.test", mainVideoStreamMode: "direct" },
      "/Videos/1/stream",
      "node",
      "secret",
      {},
      { waitUntil() {} },
      { requestUrl: new URL(request.url), runtimeConfig: { rateLimitRpm: 0 } }
    );
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("Location"), null);
    assert.equal(await response.text(), "Not Found");
  });
  assert.equal(rangeProbeFetchCount, 1);
  assert.equal(rangeProbeBodyCancelCount, 1);

  let allowedRedirectFetchCount = 0;
  await withWorkerGlobals({
    fetch: async (url) => {
      allowedRedirectFetchCount += 1;
      const pathname = new URL(url).pathname;
      if (allowedRedirectFetchCount === 1) {
        assert.equal(pathname, "/");
        return new Response(null, { status: 302, headers: { Location: "/webhooks/events" } });
      }
      assert.equal(pathname, "/webhooks/events");
      return new Response("allowed non-web redirect");
    }
  }, async () => {
    const request = new Request("https://worker.test/node/secret/");
    const response = await Proxy.handle(
      request,
      { target: "https://origin.test" },
      "/",
      "node",
      "secret",
      {},
      { waitUntil() {} },
      { requestUrl: new URL(request.url), runtimeConfig: { rateLimitRpm: 0 } }
    );
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "allowed non-web redirect");
  });
  assert.equal(allowedRedirectFetchCount, 2);
});

test("runtime config refresh is single-flight and cached by namespace", async () => {
  GLOBALS.SingleFlightTasks.clear();
  invalidateRuntimeConfigCache();
  const loadGate = createDeferred();
  const loadStarted = createDeferred();
  let configReadCount = 0;
  let configWriteCount = 0;
  const kv = {
    async get(key) {
      assert.equal(key, Database.CONFIG_KEY);
      configReadCount += 1;
      loadStarted.resolve();
      await loadGate.promise;
      return { rateLimitRpm: 321, enableH2: true };
    },
    async put() { configWriteCount += 1; }
  };
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "runtime-config-single-flight" };

  const firstLoad = getRuntimeConfig(env);
  const secondLoad = getRuntimeConfig(env);
  await loadStarted.promise;
  assert.equal(configReadCount, 1);
  loadGate.resolve();

  const [firstConfig, secondConfig] = await Promise.all([firstLoad, secondLoad]);
  assert.equal(firstConfig, secondConfig);
  assert.equal(firstConfig.rateLimitRpm, 321);
  assert.equal(await getRuntimeConfig(env), firstConfig);
  assert.equal(configReadCount, 1);
  assert.equal(configWriteCount, 0);
  assert.equal(GLOBALS.SingleFlightTasks.size, 0);
  invalidateRuntimeConfigCache();
});

test("runtime config invalidation prevents an older load from restoring stale cache", async () => {
  GLOBALS.SingleFlightTasks.clear();
  invalidateRuntimeConfigCache();
  const oldLoadGate = createDeferred();
  const oldLoadStarted = createDeferred();
  let configReadCount = 0;
  const kv = {
    async get() {
      configReadCount += 1;
      if (configReadCount === 1) {
        oldLoadStarted.resolve();
        await oldLoadGate.promise;
        return { rateLimitRpm: 100 };
      }
      return { rateLimitRpm: 200 };
    },
    async put() {}
  };
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "runtime-config-invalidation" };

  const oldLoad = getRuntimeConfig(env);
  await oldLoadStarted.promise;
  assert.equal(configReadCount, 1);
  invalidateRuntimeConfigCache();
  const freshConfig = await getRuntimeConfig(env);
  assert.equal(freshConfig.rateLimitRpm, 200);

  oldLoadGate.resolve();
  const oldConfig = await oldLoad;
  assert.equal(oldConfig.rateLimitRpm, 100);
  assert.equal(GLOBALS.ConfigCache.data.rateLimitRpm, 200);
  assert.equal(configReadCount, 2);
  invalidateRuntimeConfigCache();
});

test("runtime config writes roll back when metadata persistence fails", async () => {
  GLOBALS.SingleFlightTasks.clear();
  invalidateRuntimeConfigCache();
  const storedValues = new Map([[Database.CONFIG_KEY, JSON.stringify({ rateLimitRpm: 10 })]]);
  let metadataFailurePending = true;
  const kv = {
    async get(key, options = {}) {
      const value = storedValues.get(key);
      if (value === undefined) return null;
      return options.type === "json" ? JSON.parse(value) : value;
    },
    async put(key, value) {
      if (key === Database.CONFIG_META_KEY && metadataFailurePending) {
        metadataFailurePending = false;
        throw new Error("metadata maintenance failed");
      }
      storedValues.set(key, String(value));
    },
    async delete(key) {
      storedValues.delete(key);
    }
  };
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "runtime-config-prime" };
  await getRuntimeConfig(env);

  await assert.rejects(
    Database.persistRuntimeConfig({ rateLimitRpm: 20 }, { env, kv }),
    /metadata maintenance failed/
  );

  assert.equal(JSON.parse(storedValues.get(Database.CONFIG_KEY)).rateLimitRpm, 10);
  assert.equal(storedValues.has(Database.CONFIG_SNAPSHOTS_KEY), false);
  assert.equal(storedValues.has(Database.CONFIG_SNAPSHOTS_META_KEY), false);
  invalidateRuntimeConfigCache();
  assert.equal((await getRuntimeConfig(env)).rateLimitRpm, 10);
  invalidateRuntimeConfigCache();
});

test("host-prefix CNAME targets normalize at config and node boundaries", async () => {
  const { kv } = createInMemoryKvStore({ [Database.CONFIG_KEY]: {} });
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "host-prefix-normalize" };
  const config = await Database.persistRuntimeConfig({
    defaultHostPrefixCnameTarget: "  Global.Target.Example.  "
  }, { env, kv });
  assert.equal(config.defaultHostPrefixCnameTarget, "global.target.example");

  const hostPrefixNode = Database.normalizeNode("alpha", {
    target: "https://origin.test",
    entryMode: "host_prefix",
    hostPrefixCnameTarget: "  Node.Target.Example.  "
  }).data;
  assert.equal(hostPrefixNode.hostPrefixCnameTarget, "node.target.example");

  const kvRouteNode = Database.normalizeNode("alpha", {
    target: "https://origin.test",
    entryMode: "kv_route",
    hostPrefixCnameTarget: "node.target.example"
  }).data;
  assert.equal(kvRouteNode.hostPrefixCnameTarget, "");
});

test("invalid global host-prefix CNAME targets are rejected before persistence", async () => {
  const { kv } = createInMemoryKvStore({ [Database.CONFIG_KEY]: {} });
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "host-prefix-invalid" };
  const invalidTargets = [
    "https://target.example",
    "target.example:443",
    "target.example/path",
    "*.target.example",
    "target example",
    "192.0.2.1"
  ];

  for (const defaultHostPrefixCnameTarget of invalidTargets) {
    await assert.rejects(
      Database.persistRuntimeConfig({ defaultHostPrefixCnameTarget }, { env, kv }),
      error => error?.code === "HOST_PREFIX_CNAME_TARGET_INVALID"
        && error?.details?.field === "defaultHostPrefixCnameTarget"
    );
  }
});

test("host-prefix CNAME target priority is node then global then HOST", () => {
  const hostRoot = "proxy.example";
  const inheritedNode = { target: "https://origin.test", entryMode: "host_prefix" };
  const overriddenNode = {
    ...inheritedNode,
    hostPrefixCnameTarget: "node.target.example"
  };

  const nodeOverridePlan = Database.buildHostPrefixDnsSyncPlan(
    "",
    null,
    "alpha",
    overriddenNode,
    hostRoot,
    { nextConfig: { defaultHostPrefixCnameTarget: "global.target.example" } }
  );
  assert.equal(nodeOverridePlan.nextCnameTarget, "node.target.example");

  const globalDefaultPlan = Database.buildHostPrefixDnsSyncPlan(
    "",
    null,
    "alpha",
    inheritedNode,
    hostRoot,
    { nextConfig: { defaultHostPrefixCnameTarget: "global.target.example" } }
  );
  assert.equal(globalDefaultPlan.nextCnameTarget, "global.target.example");

  const hostFallbackPlan = Database.buildHostPrefixDnsSyncPlan(
    "",
    null,
    "alpha",
    inheritedNode,
    hostRoot
  );
  assert.equal(hostFallbackPlan.nextCnameTarget, hostRoot);
});

test("host-prefix DNS plans carry forward and rollback CNAME targets", () => {
  const node = { target: "https://origin.test", entryMode: "host_prefix" };
  const plan = Database.buildHostPrefixDnsSyncPlan(
    "alpha",
    node,
    "alpha",
    node,
    "proxy.example",
    {
      previousConfig: { defaultHostPrefixCnameTarget: "old.target.example" },
      nextConfig: { defaultHostPrefixCnameTarget: "new.target.example" }
    }
  );

  assert.equal(plan.previousDnsHost, "alpha.proxy.example");
  assert.equal(plan.nextDnsHost, "alpha.proxy.example");
  assert.equal(plan.previousCnameTarget, "old.target.example");
  assert.equal(plan.nextCnameTarget, "new.target.example");
  assert.deepEqual(plan.steps, [{
    type: "upsert",
    host: "alpha.proxy.example",
    cnameTarget: "new.target.example"
  }]);
  assert.deepEqual(plan.rollbackSteps, [{
    type: "upsert",
    host: "alpha.proxy.example",
    cnameTarget: "old.target.example"
  }]);
});

test("node summaries retain host-prefix CNAME overrides without changing proxy cache revision", () => {
  const baseNode = {
    target: "https://origin.test",
    entryMode: "host_prefix"
  };
  const firstSummary = Database.buildNodeSummary("alpha", {
    ...baseNode,
    hostPrefixCnameTarget: "First.Target.Example."
  }).summary;
  const secondSummary = Database.buildNodeSummary("alpha", {
    ...baseNode,
    hostPrefixCnameTarget: "second.target.example"
  }).summary;

  assert.equal(firstSummary.hostPrefixCnameTarget, "first.target.example");
  assert.equal(secondSummary.hostPrefixCnameTarget, "second.target.example");
  assert.equal(firstSummary.cacheRevision, secondSummary.cacheRevision);
});

test("global host-prefix CNAME changes sync only nodes that inherit the default", async () => {
  const previousConfig = {
    defaultHostPrefixCnameTarget: "old.target.example",
    cfZoneId: "zone-id",
    cfApiToken: "api-token"
  };
  const { kv, storedValues } = createInMemoryKvStore({
    [Database.CONFIG_KEY]: previousConfig,
    [`${Database.PREFIX}inherited`]: {
      target: "https://inherited-origin.test",
      entryMode: "host_prefix"
    },
    [`${Database.PREFIX}overridden`]: {
      target: "https://overridden-origin.test",
      entryMode: "host_prefix",
      hostPrefixCnameTarget: "node.target.example"
    },
    [`${Database.PREFIX}path-node`]: {
      target: "https://path-origin.test",
      entryMode: "kv_route"
    }
  });
  const env = {
    ENI_KV: kv,
    HOST: "proxy.example",
    __CONFIG_CACHE_NAMESPACE: "cname-global-sync-success"
  };
  const dnsPlans = [];
  const originalPersistHostPrefixDnsSyncPlan = Database.persistHostPrefixDnsSyncPlan;
  Database.persistHostPrefixDnsSyncPlan = async (plan) => {
    dnsPlans.push(structuredClone(plan));
    return { changed: true };
  };
  invalidateRuntimeConfigCache();

  try {
    const savedConfig = await Database.persistRuntimeConfig({
      ...previousConfig,
      defaultHostPrefixCnameTarget: "new.target.example"
    }, { env, kv });

    assert.equal(savedConfig.defaultHostPrefixCnameTarget, "new.target.example");
    assert.deepEqual(dnsPlans.map(plan => plan.steps), [[{
      type: "upsert",
      host: "inherited.proxy.example",
      cnameTarget: "new.target.example"
    }]]);
    assert.equal(
      JSON.parse(storedValues.get(Database.CONFIG_KEY)).defaultHostPrefixCnameTarget,
      "new.target.example"
    );
  } finally {
    Database.persistHostPrefixDnsSyncPlan = originalPersistHostPrefixDnsSyncPlan;
    invalidateRuntimeConfigCache();
  }
});

test("global host-prefix CNAME sync rolls back earlier DNS updates before config persistence", async () => {
  const previousConfig = {
    defaultHostPrefixCnameTarget: "old.target.example",
    cfZoneId: "zone-id",
    cfApiToken: "api-token"
  };
  const { kv, storedValues, putKeys } = createInMemoryKvStore({
    [Database.CONFIG_KEY]: previousConfig,
    [`${Database.PREFIX}alpha`]: {
      target: "https://alpha-origin.test",
      entryMode: "host_prefix"
    },
    [`${Database.PREFIX}beta`]: {
      target: "https://beta-origin.test",
      entryMode: "host_prefix"
    }
  });
  const env = {
    ENI_KV: kv,
    HOST: "proxy.example",
    __CONFIG_CACHE_NAMESPACE: "cname-global-sync-rollback"
  };
  const dnsSteps = [];
  let forwardPlanCount = 0;
  const originalPersistHostPrefixDnsSyncPlan = Database.persistHostPrefixDnsSyncPlan;
  Database.persistHostPrefixDnsSyncPlan = async (plan) => {
    const steps = structuredClone(plan.steps || []);
    dnsSteps.push(steps);
    if (steps[0]?.cnameTarget === "new.target.example") {
      forwardPlanCount += 1;
      if (forwardPlanCount === 2) throw new Error("beta_dns_update_failed");
    }
    return { changed: true };
  };
  invalidateRuntimeConfigCache();

  try {
    await assert.rejects(
      Database.persistRuntimeConfig({
        ...previousConfig,
        defaultHostPrefixCnameTarget: "new.target.example"
      }, { env, kv }),
      error => error?.message === "beta_dns_update_failed"
        && error?.details?.hostPrefixDnsSyncedCount === 1
        && error?.details?.failedHostPrefixDnsHost === "beta.proxy.example"
        && error?.details?.rollbackAttempted === true
        && error?.details?.rollbackSucceeded === true
    );

    assert.deepEqual(dnsSteps, [
      [{
        type: "upsert",
        host: "alpha.proxy.example",
        cnameTarget: "new.target.example"
      }],
      [{
        type: "upsert",
        host: "beta.proxy.example",
        cnameTarget: "new.target.example"
      }],
      [{
        type: "upsert",
        host: "beta.proxy.example",
        cnameTarget: "old.target.example"
      }],
      [{
        type: "upsert",
        host: "alpha.proxy.example",
        cnameTarget: "old.target.example"
      }]
    ]);
    assert.equal(
      JSON.parse(storedValues.get(Database.CONFIG_KEY)).defaultHostPrefixCnameTarget,
      "old.target.example"
    );
    assert.equal(storedValues.has(Database.CONFIG_SNAPSHOTS_KEY), false);
    assert.equal(putKeys.includes(Database.CONFIG_KEY), false);
    assert.equal(putKeys.includes(Database.CONFIG_SNAPSHOTS_KEY), false);
  } finally {
    Database.persistHostPrefixDnsSyncPlan = originalPersistHostPrefixDnsSyncPlan;
    invalidateRuntimeConfigCache();
  }
});

test("CNAME sync restores the complete host snapshot after a partial delete failure", async () => {
  const initialRecords = [
    { id: "a-1", name: "alpha.proxy.example", type: "A", content: "192.0.2.10", ttl: 120, proxied: false },
    { id: "aaaa-1", name: "alpha.proxy.example", type: "AAAA", content: "2001:db8::10", ttl: 300, proxied: false }
  ];
  const dns = createCloudflareDnsFetch(initialRecords, {
    failMutationAt: 2,
    failureMessage: "second_delete_failed"
  });
  const { kv } = createInMemoryKvStore();

  await withWorkerGlobals({ fetch: dns.fetch }, async () => {
    await assert.rejects(
      Database.upsertHostPrefixDnsRecord("alpha.proxy.example", {
        env: { HOST: "proxy.example" },
        kv,
        config: { cfZoneId: "zone-id", cfApiToken: "api-token" },
        cnameTarget: "target.example"
      }),
      error => error?.message === "second_delete_failed"
        && error?.details?.rollbackAttempted === true
        && error?.details?.rollbackSucceeded === true
    );
  });

  assert.deepEqual(getComparableDnsRecords(dns.records), getComparableDnsRecords(new Map(initialRecords.map(record => [record.id, record]))));
});

test("CNAME sync restores DNS when strict history persistence fails", async () => {
  const initialRecords = [
    { id: "cname-1", name: "alpha.proxy.example", type: "CNAME", content: "old.target.example", ttl: 60, proxied: false }
  ];
  const dns = createCloudflareDnsFetch(initialRecords);
  const historyKey = Database.getDnsRecordHistoryKey("zone-id", Database.getDnsHostHistoryRecordId("alpha.proxy.example"));
  const { kv } = createInMemoryKvStore({
    [historyKey]: [{ type: "CNAME", content: "old.target.example" }]
  });
  const originalPut = kv.put;
  kv.put = async (key, value) => {
    if (key === historyKey) throw new Error("history_write_failed");
    return await originalPut(key, value);
  };

  await withWorkerGlobals({ fetch: dns.fetch }, async () => {
    await assert.rejects(
      Database.upsertHostPrefixDnsRecord("alpha.proxy.example", {
        env: { HOST: "proxy.example" },
        kv,
        config: { cfZoneId: "zone-id", cfApiToken: "api-token" },
        cnameTarget: "new.target.example"
      }),
      error => error?.message === "history_write_failed"
        && error?.details?.rollbackAttempted === true
        && error?.details?.rollbackSucceeded === true
    );
  });

  assert.deepEqual(getComparableDnsRecords(dns.records), getComparableDnsRecords(new Map(initialRecords.map(record => [record.id, record]))));
});

test("CNAME history mutation fails closed when the existing history cannot be read", async () => {
  const initialRecords = [
    { id: "cname-1", name: "alpha.proxy.example", type: "CNAME", content: "old.target.example", ttl: 60, proxied: false }
  ];
  const dns = createCloudflareDnsFetch(initialRecords);
  const historyKey = Database.getDnsRecordHistoryKey("zone-id", Database.getDnsHostHistoryRecordId("alpha.proxy.example"));
  const { kv, putKeys } = createInMemoryKvStore();
  const originalGet = kv.get;
  kv.get = async (key, options) => {
    if (key === historyKey) throw new Error("history_read_failed");
    return await originalGet(key, options);
  };

  await withWorkerGlobals({ fetch: dns.fetch }, async () => {
    await assert.rejects(
      Database.upsertHostPrefixDnsRecord("alpha.proxy.example", {
        env: { HOST: "proxy.example" },
        kv,
        config: { cfZoneId: "zone-id", cfApiToken: "api-token" },
        cnameTarget: "new.target.example"
      }),
      error => error?.message === "history_read_failed"
        && error?.details?.rollbackSucceeded === true
    );
  });

  assert.equal(putKeys.includes(historyKey), false);
  assert.deepEqual(getComparableDnsRecords(dns.records), getComparableDnsRecords(new Map(initialRecords.map(record => [record.id, record]))));
});

test("single-record DNS update restores the previous record when history persistence fails", async () => {
  const initialRecords = [
    { id: "cname-1", name: "alpha.proxy.example", type: "CNAME", content: "old.target.example", ttl: 60, proxied: false }
  ];
  const dns = createCloudflareDnsFetch(initialRecords);
  const historyKey = Database.getDnsRecordHistoryKey("zone-id", Database.getDnsHostHistoryRecordId("alpha.proxy.example"));
  const { kv } = createInMemoryKvStore({
    [Database.CONFIG_KEY]: { cfZoneId: "zone-id", cfApiToken: "api-token" },
    [historyKey]: [{ type: "CNAME", content: "old.target.example" }]
  });
  const originalPut = kv.put;
  kv.put = async (key, value) => {
    if (key === historyKey) throw new Error("history_write_failed");
    return await originalPut(key, value);
  };
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "single-dns-update-history-rollback" };
  invalidateRuntimeConfigCache();

  try {
    const response = await withWorkerGlobals({ fetch: dns.fetch }, () => Database.ApiHandlers.updateDnsRecord({
      recordId: "cname-1",
      host: "alpha.proxy.example",
      type: "CNAME",
      content: "new.target.example"
    }, {
      env,
      kv,
      request: new Request("https://proxy.example/admin", {
        headers: { "X-Admin-Confirm": "updateDnsRecord" }
      })
    }));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "CF_DNS_UPDATE_FAILED");
    assert.equal(payload.error.details.reason, "history_write_failed");
    assert.equal(payload.error.details.rollbackAttempted, true);
    assert.equal(payload.error.details.rollbackSucceeded, true);
    assert.equal(payload.error.details.rollbackError, "");
    assert.deepEqual(getComparableDnsRecords(dns.records), getComparableDnsRecords(new Map(initialRecords.map(record => [record.id, record]))));
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("single-record DNS update reports a failed history compensation", async () => {
  const initialRecords = [
    { id: "cname-1", name: "alpha.proxy.example", type: "CNAME", content: "old.target.example", ttl: 60, proxied: false }
  ];
  const dns = createCloudflareDnsFetch(initialRecords, {
    failMutationAt: 2,
    failureMessage: "dns_rollback_failed"
  });
  const historyKey = Database.getDnsRecordHistoryKey("zone-id", Database.getDnsHostHistoryRecordId("alpha.proxy.example"));
  const { kv } = createInMemoryKvStore({
    [Database.CONFIG_KEY]: { cfZoneId: "zone-id", cfApiToken: "api-token" },
    [historyKey]: [{ type: "CNAME", content: "old.target.example" }]
  });
  const originalPut = kv.put;
  kv.put = async (key, value) => {
    if (key === historyKey) throw new Error("history_write_failed");
    return await originalPut(key, value);
  };
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "single-dns-update-history-rollback-failure" };
  invalidateRuntimeConfigCache();

  try {
    const response = await withWorkerGlobals({ fetch: dns.fetch }, () => Database.ApiHandlers.updateDnsRecord({
      recordId: "cname-1",
      host: "alpha.proxy.example",
      type: "CNAME",
      content: "new.target.example"
    }, {
      env,
      kv,
      request: new Request("https://proxy.example/admin", {
        headers: { "X-Admin-Confirm": "updateDnsRecord" }
      })
    }));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.error.details.reason, "history_write_failed");
    assert.equal(payload.error.details.rollbackAttempted, true);
    assert.equal(payload.error.details.rollbackSucceeded, false);
    assert.equal(payload.error.details.rollbackError, "dns_rollback_failed");
    assert.equal(dns.records.get("cname-1").content, "new.target.example");
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("single-record DNS create deletes the new record when history persistence fails", async () => {
  const dns = createCloudflareDnsFetch([]);
  const historyKey = Database.getDnsRecordHistoryKey("zone-id", Database.getDnsHostHistoryRecordId("alpha.proxy.example"));
  const { kv } = createInMemoryKvStore({
    [Database.CONFIG_KEY]: { cfZoneId: "zone-id", cfApiToken: "api-token" }
  });
  const originalPut = kv.put;
  kv.put = async (key, value) => {
    if (key === historyKey) throw new Error("history_write_failed");
    return await originalPut(key, value);
  };
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "single-dns-create-history-rollback" };
  invalidateRuntimeConfigCache();

  try {
    const response = await withWorkerGlobals({ fetch: dns.fetch }, () => Database.ApiHandlers.updateDnsRecord({
      host: "alpha.proxy.example",
      type: "CNAME",
      content: "new.target.example"
    }, {
      env,
      kv,
      request: new Request("https://proxy.example/admin", {
        headers: { "X-Admin-Confirm": "createDnsRecord" }
      })
    }));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.error.details.rollbackAttempted, true);
    assert.equal(payload.error.details.rollbackSucceeded, true);
    assert.equal(dns.records.size, 0);
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("node rollback restores KV even when DNS compensation fails", async () => {
  const { kv, storedValues } = createInMemoryKvStore({
    [`${Database.PREFIX}alpha`]: { target: "https://new-origin.test", entryMode: "host_prefix" }
  });
  const mutation = {
    previousName: "alpha",
    previousNode: { target: "https://old-origin.test", entryMode: "host_prefix" },
    nextName: "alpha",
    nextNode: { target: "https://new-origin.test", entryMode: "host_prefix" },
    nodeChanged: true,
    dnsPlan: { changed: true, rollbackSteps: [{ type: "upsert", host: "alpha.proxy.example", cnameTarget: "old.target.example" }] }
  };
  const originalPersistHostPrefixDnsSyncPlan = Database.persistHostPrefixDnsSyncPlan;
  Database.persistHostPrefixDnsSyncPlan = async () => {
    throw new Error("dns_rollback_failed");
  };
  try {
    await assert.rejects(
      Database.rollbackPreparedNodeMutations([mutation], {
        kv,
        config: { cfZoneId: "zone-id", cfApiToken: "api-token" }
      }),
      /dns:dns_rollback_failed/
    );
  } finally {
    Database.persistHostPrefixDnsSyncPlan = originalPersistHostPrefixDnsSyncPlan;
  }

  assert.equal(JSON.parse(storedValues.get(`${Database.PREFIX}alpha`)).target, "https://old-origin.test");
});

test("active rename mutation rolls back a partial KV write", async () => {
  const previousNode = { target: "https://old-origin.test", entryMode: "kv_route" };
  const nextNode = { target: "https://new-origin.test", entryMode: "kv_route" };
  const { kv, storedValues } = createInMemoryKvStore({
    [`${Database.PREFIX}alpha`]: previousNode
  });
  const originalDelete = kv.delete;
  let deleteFailurePending = true;
  kv.delete = async key => {
    if (key === `${Database.PREFIX}alpha` && deleteFailurePending) {
      deleteFailurePending = false;
      throw new Error("rename_delete_failed");
    }
    return await originalDelete(key);
  };

  await assert.rejects(
    Database.applyPreparedNodeMutations([{
      previousName: "alpha",
      previousNode,
      nextName: "beta",
      nextNode,
      nodeChanged: true,
      dnsPlan: null
    }], { kv }),
    error => error?.message === "rename_delete_failed"
      && error?.details?.rollbackAttempted === true
      && error?.details?.rollbackSucceeded === true
  );

  assert.deepEqual(JSON.parse(storedValues.get(`${Database.PREFIX}alpha`)), previousNode);
  assert.equal(storedValues.has(`${Database.PREFIX}beta`), false);
});

test("full import restores inherited host-prefix DNS after a node index rebuild failure", async () => {
  const previousConfig = {
    cfZoneId: "zone-id",
    cfApiToken: "api-token",
    defaultHostPrefixCnameTarget: "old.target.example"
  };
  const previousNode = {
    target: "https://old-origin.test",
    entryMode: "host_prefix"
  };
  const { kv, storedValues } = createInMemoryKvStore({
    [Database.CONFIG_KEY]: previousConfig,
    [`${Database.PREFIX}alpha`]: previousNode
  });
  const dns = createCloudflareDnsFetch([{
    id: "cname-1",
    name: "alpha.proxy.example",
    type: "CNAME",
    content: "old.target.example",
    ttl: 1,
    proxied: false
  }]);
  const env = {
    ENI_KV: kv,
    HOST: "proxy.example",
    __CONFIG_CACHE_NAMESPACE: "full-import-node-rebuild-rollback"
  };
  const originalRebuildNodeIndexesFromKv = Database.rebuildNodeIndexesFromKv;
  let rebuildCount = 0;
  Database.rebuildNodeIndexesFromKv = async (...args) => {
    rebuildCount += 1;
    if (rebuildCount === 1) throw new Error("node_index_rebuild_failed");
    return await originalRebuildNodeIndexesFromKv.apply(Database, args);
  };
  invalidateRuntimeConfigCache();

  try {
    await withWorkerGlobals({ fetch: dns.fetch }, async () => {
      await assert.rejects(
        Database.ApiHandlers.importFull({
          config: {
            ...previousConfig,
            defaultHostPrefixCnameTarget: "new.target.example"
          },
          nodes: [{
            name: "alpha",
            target: "https://new-origin.test",
            entryMode: "kv_route"
          }]
        }, { env, ctx: null, kv }),
        error => error?.message === "node_index_rebuild_failed"
          && error?.details?.nodeRollbackError === ""
          && error?.details?.configRollbackError === ""
      );
    });

    const restoredConfig = JSON.parse(storedValues.get(Database.CONFIG_KEY));
    const restoredNode = JSON.parse(storedValues.get(`${Database.PREFIX}alpha`));
    assert.equal(restoredConfig.defaultHostPrefixCnameTarget, "old.target.example");
    assert.equal(restoredNode.entryMode, "host_prefix");
    assert.equal(restoredNode.target, "https://old-origin.test:443");
    assert.deepEqual(getComparableDnsRecords(dns.records), [{
      name: "alpha.proxy.example",
      type: "CNAME",
      content: "old.target.example",
      ttl: 1,
      proxied: false
    }]);
  } finally {
    Database.rebuildNodeIndexesFromKv = originalRebuildNodeIndexesFromKv;
    invalidateRuntimeConfigCache();
  }
});

test("node revision refresh coalesces and hot node reads stay in memory", async () => {
  GLOBALS.SingleFlightTasks.clear();
  GLOBALS.NodeCache.clear();
  invalidateNodesRevisionCache();
  const revisionGate = createDeferred();
  const revisionReadStarted = createDeferred();
  let revisionReadCount = 0;
  const kv = {
    async get(key) {
      assert.equal(key, Database.NODES_INDEX_META_KEY);
      revisionReadCount += 1;
      revisionReadStarted.resolve();
      await revisionGate.promise;
      return { revision: "nodes-r1" };
    }
  };

  const firstRevision = Database.getNodesRevision(kv);
  const secondRevision = Database.getNodesRevision(kv);
  await revisionReadStarted.promise;
  assert.equal(revisionReadCount, 1);
  revisionGate.resolve();
  assert.deepEqual(await Promise.all([firstRevision, secondRevision]), ["nodes-r1", "nodes-r1"]);

  GLOBALS.NodeCache.set("alpha", {
    data: { target: "https://origin.test" },
    exp: Date.now() + 60000,
    nodesRevision: "nodes-r1"
  });
  const cachedNode = await Database.getNode("alpha", { ENI_KV: kv }, null);
  assert.equal(cachedNode.target, "https://origin.test");
  assert.equal(revisionReadCount, 1);
  GLOBALS.NodeCache.clear();
  invalidateNodesRevisionCache();
});

test("node revision read failures are retried instead of negative-cached", async () => {
  GLOBALS.SingleFlightTasks.clear();
  invalidateNodesRevisionCache();
  let revisionReadCount = 0;
  const kv = {
    async get(key) {
      assert.equal(key, Database.NODES_INDEX_META_KEY);
      revisionReadCount += 1;
      if (revisionReadCount === 1) throw new Error("transient revision failure");
      return { revision: "nodes-r2" };
    }
  };

  assert.equal(await Database.getNodesRevision(kv), "");
  assert.equal(GLOBALS.NodesRevisionCache, null);
  assert.equal(await Database.getNodesRevision(kv), "nodes-r2");
  assert.equal(revisionReadCount, 2);
  invalidateNodesRevisionCache();
});

test("node writes prevent older positive and negative reads from refilling memory", async () => {
  for (const [nodeName, storedNode] of [
    ["stale-positive", { target: "https://old-origin.test" }],
    ["stale-negative", null]
  ]) {
    GLOBALS.NodeCache.clear();
    invalidateNodesRevisionCache();
    const entityReadStarted = createDeferred();
    const entityReadGate = createDeferred();
    const kv = {
      async get(key) {
        if (key === `${Database.PREFIX}${nodeName}`) {
          entityReadStarted.resolve();
          await entityReadGate.promise;
          return storedNode;
        }
        throw new Error(`unexpected KV read: ${key}`);
      }
    };

    const staleRead = Database.getNode(nodeName, { ENI_KV: kv }, null);
    await entityReadStarted.promise;
    Database.invalidateNodeCaches(nodeName, { invalidateList: true });
    entityReadGate.resolve();

    assert.equal(await staleRead, null);
    assert.equal(GLOBALS.NodeCache.has(nodeName), false);
  }
  invalidateNodesRevisionCache();
});

test("evicted node generations cannot revive an older cold read", async () => {
  GLOBALS.SingleFlightTasks.clear();
  GLOBALS.NodeCache.clear();
  GLOBALS.NodeCacheGenerations.clear();
  const entityReadStarted = createDeferred();
  const entityReadGate = createDeferred();
  const kv = {
    async get(key) {
      if (key === `${Database.PREFIX}alpha`) {
        entityReadStarted.resolve();
        await entityReadGate.promise;
        return { target: "https://stale-origin.test" };
      }
      if (key === Database.NODES_INDEX_META_KEY) return { revision: "nodes-r1" };
      throw new Error(`unexpected KV read: ${key}`);
    }
  };
  const database = Object.create(Database);
  database.upsertNodeSummaryEntry = async () => null;

  const staleRead = database.getNode("alpha", { ENI_KV: kv }, null);
  await entityReadStarted.promise;
  database.invalidateNodeCaches([
    "alpha",
    ...Array.from({ length: 5000 }, (_, index) => `generation-churn-${index}`)
  ]);
  assert.equal(GLOBALS.NodeCacheGenerations.has("alpha"), false);
  entityReadGate.resolve();

  assert.equal(await staleRead, null);
  assert.equal(GLOBALS.NodeCache.has("alpha"), false);
  GLOBALS.SingleFlightTasks.clear();
  GLOBALS.NodeCache.clear();
  GLOBALS.NodeCacheGenerations.clear();
});

test("unrelated node invalidation does not cancel another node's cold read", async () => {
  GLOBALS.SingleFlightTasks.clear();
  GLOBALS.NodeCache.clear();
  GLOBALS.NodeCacheGenerations.clear();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  const entityReadStarted = createDeferred();
  const entityReadGate = createDeferred();
  const kv = {
    async get(key) {
      if (key === `${Database.PREFIX}alpha`) {
        entityReadStarted.resolve();
        await entityReadGate.promise;
        return { target: "https://origin.test" };
      }
      if (key === Database.NODES_INDEX_META_KEY) return { revision: "nodes-r1" };
      throw new Error(`unexpected KV read: ${key}`);
    },
    async put() {}
  };
  const database = Object.create(Database);
  database.upsertNodeSummaryEntry = async () => null;

  const alphaRead = database.getNode("alpha", { ENI_KV: kv }, null);
  await entityReadStarted.promise;
  database.invalidateNodeCaches("beta", { invalidateList: true });
  entityReadGate.resolve();

  const alphaNode = await alphaRead;
  assert.equal(new URL(alphaNode.target).hostname, "origin.test");
  assert.equal(GLOBALS.NodeCache.get("alpha")?.data, alphaNode);
  GLOBALS.NodeCache.clear();
  GLOBALS.NodeCacheGenerations.clear();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("stale node-summary reads cannot refill invalidated list caches", async () => {
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  const summaryReadStarted = createDeferred();
  const summaryReadGate = createDeferred();
  const alphaSummary = Database.buildNodeSummary("alpha", { target: "https://origin.test" }).summary;
  assert.ok(alphaSummary);
  const kv = {
    async get(key) {
      assert.equal(key, Database.NODES_SUMMARY_INDEX_KEY);
      summaryReadStarted.resolve();
      await summaryReadGate.promise;
      return [alphaSummary];
    }
  };

  const staleRead = Database.getNodesSummaryIndex(kv, { useCache: false });
  await summaryReadStarted.promise;
  invalidateNodesRevisionCache();
  summaryReadGate.resolve();

  const summaries = await staleRead;
  assert.deepEqual(summaries.map(node => node.name), ["alpha"]);
  assert.equal(GLOBALS.NodesListCache, null);
  assert.equal(GLOBALS.NodesIndexCache, null);
  invalidateNodesRevisionCache();
});

test("node-index mutations serialize so final KV and memory revisions match", async () => {
  GLOBALS.NodeIndexMutationChain = Promise.resolve();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  const oldWriteStarted = createDeferred();
  const oldWriteGate = createDeferred();
  const storedValues = new Map();
  const putKeys = [];
  let putCount = 0;
  const kv = {
    async put(key, value) {
      putCount += 1;
      putKeys.push(key);
      if (putCount === 1) {
        oldWriteStarted.resolve();
        await oldWriteGate.promise;
      }
      storedValues.set(key, value);
    }
  };
  const database = Object.create(Database);
  database.readRevisionMeta = async () => ({
    revision: "nodes-base",
    updatedAt: "2026-07-01T00:00:00.000Z",
    hash: "",
    count: 0,
    indexHash: "",
    fullIndexHash: ""
  });

  const oldMutation = database.persistNodesIndex(["old"], { kv });
  await oldWriteStarted.promise;
  const freshMutation = database.persistNodesIndex(["fresh"], { kv });
  assert.equal(putCount, 1);

  oldWriteGate.resolve();
  await Promise.all([oldMutation, freshMutation]);

  assert.deepEqual(putKeys, [
    Database.NODES_INDEX_KEY,
    Database.NODES_INDEX_META_KEY,
    Database.NODES_INDEX_KEY,
    Database.NODES_INDEX_META_KEY
  ]);
  assert.deepEqual(JSON.parse(storedValues.get(Database.NODES_INDEX_KEY)), ["fresh"]);
  const storedMeta = JSON.parse(storedValues.get(Database.NODES_INDEX_META_KEY));
  assert.equal(GLOBALS.NodesRevisionCache?.revision, storedMeta.revision);
  assert.deepEqual(GLOBALS.NodesIndexCache?.data, ["fresh"]);
  GLOBALS.NodeIndexMutationChain = Promise.resolve();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("concurrent node-summary upserts merge inside the mutation chain", async () => {
  GLOBALS.NodeIndexMutationChain = Promise.resolve();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  const storedValues = new Map([
    [Database.NODES_SUMMARY_INDEX_KEY, JSON.stringify([])],
    [Database.NODES_INDEX_META_KEY, JSON.stringify(Database.buildNodesIndexMeta([], [], {
      updatedAt: "2026-07-01T00:00:00.000Z"
    }))]
  ]);
  const kv = {
    async get(key, options = {}) {
      const stored = storedValues.get(key);
      if (options.type === "json" && typeof stored === "string") return JSON.parse(stored);
      return stored ?? null;
    },
    async put(key, value) {
      storedValues.set(key, value);
    }
  };

  const [alpha, beta] = await Promise.all([
    Database.upsertNodeSummaryEntry("alpha", { target: "https://alpha-origin.test" }, { kv }),
    Database.upsertNodeSummaryEntry("beta", { target: "https://beta-origin.test" }, { kv })
  ]);

  assert.deepEqual([alpha.name, beta.name], ["alpha", "beta"]);
  const storedNames = JSON.parse(storedValues.get(Database.NODES_SUMMARY_INDEX_KEY)).map(node => node.name);
  assert.deepEqual(storedNames, ["alpha", "beta"]);
  assert.deepEqual(GLOBALS.NodesListCache?.data.map(node => node.name), ["alpha", "beta"]);
  GLOBALS.NodeIndexMutationChain = Promise.resolve();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("node-index rebuilds serialize entity loading with their commit", async () => {
  GLOBALS.NodeIndexMutationChain = Promise.resolve();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  const firstListStarted = createDeferred();
  const firstListGate = createDeferred();
  const storedValues = new Map([
    [`${Database.PREFIX}alpha`, JSON.stringify({ target: "https://alpha-origin.test" })],
    [Database.NODES_SUMMARY_INDEX_KEY, JSON.stringify([])],
    [Database.NODES_INDEX_META_KEY, JSON.stringify(Database.buildNodesIndexMeta([], [], {
      updatedAt: "2026-07-01T00:00:00.000Z"
    }))]
  ]);
  let listCount = 0;
  const kv = {
    async get(key, options = {}) {
      const stored = storedValues.get(key);
      if (options.type === "json" && typeof stored === "string") return JSON.parse(stored);
      return stored ?? null;
    },
    async put(key, value) {
      storedValues.set(key, value);
    },
    async list({ prefix }) {
      listCount += 1;
      const keys = [...storedValues.keys()]
        .filter(key => key.startsWith(prefix))
        .map(name => ({ name }));
      if (listCount === 1) {
        firstListStarted.resolve();
        await firstListGate.promise;
      }
      return { keys, list_complete: true };
    }
  };

  const olderRebuild = Database.rebuildNodeIndexesFromKv(kv);
  await firstListStarted.promise;
  storedValues.set(`${Database.PREFIX}beta`, JSON.stringify({ target: "https://beta-origin.test" }));
  const fresherRebuild = Database.rebuildNodeIndexesFromKv(kv);
  assert.equal(listCount, 1);
  firstListGate.resolve();

  const [olderState, fresherState] = await Promise.all([olderRebuild, fresherRebuild]);
  assert.deepEqual(olderState.index, ["alpha"]);
  assert.deepEqual(fresherState.index, ["alpha", "beta"]);
  const storedNames = JSON.parse(storedValues.get(Database.NODES_SUMMARY_INDEX_KEY)).map(node => node.name);
  assert.deepEqual(storedNames, ["alpha", "beta"]);
  GLOBALS.NodeIndexMutationChain = Promise.resolve();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("node-index writes reject incomplete entity truth-source reads", async () => {
  const runRejectedWrite = async (operation) => {
    GLOBALS.NodeIndexMutationChain = Promise.resolve();
    GLOBALS.NodesListCache = null;
    GLOBALS.NodesIndexCache = null;
    invalidateNodesRevisionCache();
    const writes = [];
    const kv = {
      async get(key) {
        if (key === Database.NODES_SUMMARY_INDEX_KEY) return null;
        if (key === `${Database.PREFIX}alpha`) return { target: "https://alpha-origin.test" };
        if (key === `${Database.PREFIX}beta`) throw new Error("temporary kv read failure");
        return null;
      },
      async put(key, value) {
        writes.push([key, value]);
      },
      async list() {
        return {
          keys: [
            { name: `${Database.PREFIX}alpha` },
            { name: `${Database.PREFIX}beta` }
          ],
          list_complete: true
        };
      }
    };

    await assert.rejects(operation(kv), error => error?.code === "KV_READ_FAILED");
    assert.deepEqual(writes, []);
  };

  await runRejectedWrite(kv => Database.rebuildNodeIndexesFromKv(kv));
  await runRejectedWrite(kv => Database.upsertNodeSummaryEntry("gamma", {
    target: "https://gamma-origin.test"
  }, { kv }));
  GLOBALS.NodeIndexMutationChain = Promise.resolve();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("stale revision candidates cannot overwrite current node-index metadata", async () => {
  GLOBALS.NodeIndexMutationChain = Promise.resolve();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  const storedValues = new Map();
  const kv = {
    async get(key, options = {}) {
      const stored = storedValues.get(key);
      if (options.type === "json" && typeof stored === "string") return JSON.parse(stored);
      return stored ?? null;
    },
    async put(key, value) {
      storedValues.set(key, value);
    }
  };
  const freshSummary = Database.buildNodeSummary("fresh", { target: "https://fresh-origin.test" }).summary;
  const staleSummary = Database.buildNodeSummary("stale", { target: "https://stale-origin.test" }).summary;
  await Database.persistNodesSummaryIndex([freshSummary], { kv });
  const freshMeta = JSON.parse(storedValues.get(Database.NODES_INDEX_META_KEY));

  const ensuredMeta = await Database.ensureNodesIndexMeta(kv, {
    index: ["stale"],
    nodes: [staleSummary]
  });

  const storedMeta = JSON.parse(storedValues.get(Database.NODES_INDEX_META_KEY));
  assert.equal(ensuredMeta.revision, freshMeta.revision);
  assert.equal(storedMeta.revision, freshMeta.revision);
  assert.equal(GLOBALS.NodesRevisionCache?.revision, freshMeta.revision);
  GLOBALS.NodeIndexMutationChain = Promise.resolve();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("concurrent proxy cold reads share one node entity load", async () => {
  GLOBALS.SingleFlightTasks.clear();
  GLOBALS.NodeCache.clear();
  GLOBALS.NodeCacheGenerations.clear();
  invalidateNodesRevisionCache();
  const entityReadStarted = createDeferred();
  const entityReadGate = createDeferred();
  let entityReadCount = 0;
  const kv = {
    async get(key) {
      if (key === `${Database.PREFIX}alpha`) {
        entityReadCount += 1;
        entityReadStarted.resolve();
        await entityReadGate.promise;
        return { target: "https://origin.test" };
      }
      if (key === Database.NODES_INDEX_META_KEY) return { revision: "nodes-r1" };
      throw new Error(`unexpected KV read: ${key}`);
    },
    async put() {}
  };
  const database = Object.create(Database);
  database.upsertNodeSummaryEntry = async () => null;

  const coldReads = Array.from({ length: 10 }, () => database.getNode("alpha", { ENI_KV: kv }, null));
  await entityReadStarted.promise;
  assert.equal(entityReadCount, 1);
  entityReadGate.resolve();

  const nodes = await Promise.all(coldReads);
  assert.equal(nodes.every(node => new URL(node.target).hostname === "origin.test"), true);
  assert.equal(entityReadCount, 1);
  GLOBALS.SingleFlightTasks.clear();
  GLOBALS.NodeCache.clear();
  GLOBALS.NodeCacheGenerations.clear();
  invalidateNodesRevisionCache();
});

test("proxy node misses use the short-lived node cache", async () => {
  GLOBALS.SingleFlightTasks.clear();
  GLOBALS.NodeCache.clear();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  let nodeReadCount = 0;
  const kv = {
    async get(key) {
      if (key === `${Database.PREFIX}missing`) {
        nodeReadCount += 1;
        return null;
      }
      if (key === Database.NODES_SUMMARY_INDEX_KEY) return [];
      if (key === Database.NODES_INDEX_META_KEY) return { revision: "nodes-r1" };
      throw new Error(`unexpected KV read: ${key}`);
    }
  };
  const env = { ENI_KV: kv };

  assert.equal(await Database.getNode("missing", env, null), null);
  assert.equal(await Database.getNode("missing", env, null), null);
  assert.equal(nodeReadCount, 1);
  assert.equal(GLOBALS.NodeCache.get("missing")?.data, null);
  GLOBALS.NodeCache.get("missing").exp = Date.now() - 1;
  assert.equal(await Database.getNode("missing", env, null), null);
  assert.equal(nodeReadCount, 2);
  GLOBALS.NodeCache.clear();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("strict admin node reads bypass the proxy negative cache", async () => {
  GLOBALS.SingleFlightTasks.clear();
  GLOBALS.NodeCache.clear();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  let nodeExists = false;
  let nodeReadCount = 0;
  const kv = {
    async get(key) {
      if (key === `${Database.PREFIX}alpha`) {
        nodeReadCount += 1;
        return nodeExists ? { target: "https://origin.test" } : null;
      }
      if (key === Database.NODES_SUMMARY_INDEX_KEY) return [];
      if (key === Database.NODES_INDEX_META_KEY) return { revision: "nodes-r1" };
      throw new Error(`unexpected KV read: ${key}`);
    }
  };
  const env = { ENI_KV: kv };

  assert.equal(await Database.getNode("alpha", env, null), null);
  assert.equal(nodeReadCount, 1);
  assert.equal(GLOBALS.NodeCache.get("alpha")?.data, null);

  nodeExists = true;
  const node = await Database.getNodeForRead("alpha", env);
  assert.equal(new URL(node.target).hostname, "origin.test");
  assert.equal(nodeReadCount, 2);

  GLOBALS.NodeCache.clear();
  GLOBALS.NodesListCache = null;
  GLOBALS.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("proxy preparation reuses the runtime config loaded by the entry route", async () => {
  let configReadCount = 0;
  const runtimeConfig = { rateLimitRpm: 0 };
  const execution = await Proxy.prepareExecutionContext(
    new Request("https://worker.test/alpha/Items"),
    { target: "https://origin.test" },
    "/Items",
    "alpha",
    "",
    { ENI_KV: { async get() { configReadCount += 1; return {}; } } },
    { waitUntil() {} },
    { runtimeConfig }
  );

  assert.equal(execution.currentConfig, runtimeConfig);
  assert.equal(configReadCount, 0);
});

test("proxy preparation clones request URLs only when playback parameters mutate", async () => {
  const runtimeConfig = { rateLimitRpm: 0 };
  const node = { target: "https://origin.test" };
  const ctx = { waitUntil() {} };

  const plainUrl = new URL("https://worker.test/alpha/Items?api_key=test");
  const plainExecution = await Proxy.prepareExecutionContext(
    new Request(plainUrl),
    node,
    "/Items",
    "alpha",
    "",
    {},
    ctx,
    { requestUrl: plainUrl, runtimeConfig }
  );
  assert.equal(plainExecution.requestMethod, "GET");
  assert.equal(plainExecution.requestUrl, plainUrl);
  assert.equal(plainUrl.searchParams.get("api_key"), "test");

  const fallbackUrl = new URL("https://worker.test/alpha/Videos/1/stream?__pb_abs=1&api_key=test");
  const fallbackExecution = await Proxy.prepareExecutionContext(
    new Request(fallbackUrl),
    node,
    "/Videos/1/stream",
    "alpha",
    "",
    {},
    ctx,
    { requestUrl: fallbackUrl, runtimeConfig }
  );
  assert.notEqual(fallbackExecution.requestUrl, fallbackUrl);
  assert.equal(fallbackExecution.requestUrl.searchParams.has("__pb_abs"), false);
  assert.equal(fallbackUrl.searchParams.get("__pb_abs"), "1");

  const relayTarget = Buffer.from("https://origin.test/Videos/1/stream", "utf8").toString("base64url");
  const relayUrl = new URL(`https://worker.test/alpha/__playback-relay/Videos/1/stream?__pb_target=${relayTarget}&api_key=test`);
  const relayExecution = await Proxy.prepareExecutionContext(
    new Request(relayUrl),
    node,
    "/__playback-relay/Videos/1/stream",
    "alpha",
    "",
    {},
    ctx,
    { requestUrl: relayUrl, runtimeConfig }
  );
  assert.notEqual(relayExecution.requestUrl, relayUrl);
  assert.equal(relayExecution.requestUrl.searchParams.has("__pb_target"), false);
  assert.equal(relayUrl.searchParams.get("__pb_target"), relayTarget);
});

test("proxy metadata preparation rekeys identity and cache TTL", async () => {
  const node = { target: "https://origin.test" };
  const ctx = { waitUntil() {} };
  const buildExecution = (token, cacheTtlImages) => Proxy.prepareExecutionContext(
    new Request(`https://worker.test/alpha/Items/1/Images/Primary?api_key=${encodeURIComponent(token)}&tag=v1`),
    node,
    "/Items/1/Images/Primary",
    "alpha",
    "node-key",
    {},
    ctx,
    { runtimeConfig: { rateLimitRpm: 0, cacheTtlImages } }
  );

  const [firstIdentity, secondIdentity, disabledCache] = await Promise.all([
    buildExecution("secret-a", 30),
    buildExecution("secret-b", 30),
    buildExecution("secret-a", 0)
  ]);

  assert.ok(firstIdentity.metadataCacheKey instanceof Request);
  assert.notEqual(firstIdentity.metadataCacheKey.url, secondIdentity.metadataCacheKey.url);
  assert.notEqual(firstIdentity.metadataCacheKey.url, disabledCache.metadataCacheKey.url);
  assert.doesNotMatch(firstIdentity.metadataCacheKey.url, /secret-a/);
  assert.notEqual(firstIdentity.metadataCacheIdentityPartition, secondIdentity.metadataCacheIdentityPartition);
  assert.notEqual(firstIdentity.metadataCachePolicyRevision, disabledCache.metadataCachePolicyRevision);
});

test("canonical OpsStatus read merges partition, root, shadow, and latest updatedAt", async () => {
  const db = { prepare() {} };
  const rootStatus = {
    updatedAt: "2026-07-01T00:00:00.000Z",
    log: {
      status: "root",
      rootOnly: true,
      nested: { fromRoot: true },
      updatedAt: "2026-07-02T00:00:00.000Z"
    }
  };
  const partitionStatus = {
    status: "partition",
    partitionOnly: true,
    nested: { fromPartition: true },
    updatedAt: "2026-07-03T00:00:00.000Z"
  };
  GLOBALS.OpsStatusShadowCache.set(db, {
    pendingPatch: {
      log: {
        status: "shadow",
        shadowOnly: true,
        nested: { fromShadow: true },
        updatedAt: "2026-07-04T00:00:00.000Z"
      }
    },
    flushPromise: null
  });

  const database = Object.create(Database);
  database.getOpsStatusSectionEntries = () => [["log", Database.OPS_STATUS_SECTION_SCOPES.log]];
  database.getOpsStatusPayloadFromDb = async (_db, scope) => {
    if (scope === Database.OPS_STATUS_DB_SCOPE_ROOT) return rootStatus;
    if (scope === Database.OPS_STATUS_SECTION_SCOPES.log) return partitionStatus;
    return null;
  };

  const status = await database.getOpsStatus(db);
  assert.equal(status.log.status, "shadow");
  assert.equal(status.log.rootOnly, true);
  assert.equal(status.log.partitionOnly, true);
  assert.equal(status.log.shadowOnly, true);
  assert.deepEqual(status.log.nested, {
    fromPartition: true,
    fromRoot: true,
    fromShadow: true
  });
  assert.equal(status.log.updatedAt, "2026-07-04T00:00:00.000Z");
  assert.equal(status.updatedAt, "2026-07-04T00:00:00.000Z");
});

test("full OpsStatus reads the root and each section exactly once", async () => {
  const db = { prepare() {} };
  const readCounts = new Map();
  const database = Object.create(Database);
  database.getOpsStatusPayloadFromDb = async (_db, scope) => {
    readCounts.set(scope, (readCounts.get(scope) || 0) + 1);
    return {};
  };

  await database.getOpsStatus(db);
  assert.deepEqual(Object.fromEntries(readCounts), {
    [Database.OPS_STATUS_DB_SCOPE_ROOT]: 1,
    [Database.OPS_STATUS_SECTION_SCOPES.log]: 1,
    [Database.OPS_STATUS_SECTION_SCOPES.scheduled]: 1,
    [Database.OPS_STATUS_SECTION_SCOPES.dnsIpPool]: 1
  });
});

test("admin HTML MIME acceptance remains limited to document-capable responses", () => {
  assert.equal(isAcceptedAdminHtmlDocumentContentType("", false), true);
  assert.equal(isAcceptedAdminHtmlDocumentContentType("text/html; charset=utf-8", false), true);
  assert.equal(isAcceptedAdminHtmlDocumentContentType("application/xhtml+xml", false), true);
  assert.equal(isAcceptedAdminHtmlDocumentContentType("text/plain", true), true);
  assert.equal(isAcceptedAdminHtmlDocumentContentType("application/octet-stream", true), true);
  assert.equal(isAcceptedAdminHtmlDocumentContentType("text/plain", false), false);
  assert.equal(isAcceptedAdminHtmlDocumentContentType("application/octet-stream", false), false);
  assert.equal(isAcceptedAdminHtmlDocumentContentType("application/json", true), false);
});

test("fresh remote shell rejects a wrong MIME even when the body is HTML", async () => {
  const html = '<!doctype html><html><body><div id="app"></div></body></html>';
  await withWorkerGlobals({
    fetch: async () => new Response(html, {
      headers: { "Content-Type": "application/json" }
    })
  }, async () => {
    await assert.rejects(
      fetchAdminRemoteShellStoredResponse(
        "https://example.test/index.html",
        { adminPath: "/admin" },
        { ok: true, missing: [] }
      ),
      /content-type invalid/
    );
  });
});

test("fresh remote shell rejects an HTML document without the app root", async () => {
  let html = "";
  await withWorkerGlobals({
    fetch: async () => new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    })
  }, async () => {
    const invalidDocuments = [
      "<!doctype html><html><body><main>missing app root</main></body></html>",
      '<!doctype html><html><body><main data-id="app"></main></body></html>',
      '<!doctype html><html><body><script>const template = \'<div id="app"></div>\';</script></body></html>',
      '<!doctype html><html><body><!-- <div id="app"></div> --></body></html>',
      '<!doctype html><html><body><div title=" id=app "></div></body></html>',
      '<!doctype html><html><body><div title=" id=\'app\' "></div></body></html>',
      '<!doctype html><html><body><div id="App"></div></body></html>',
      '<!doctype html><html><body><template><div id="app"></div></template></body></html>'
    ];
    for (const invalidDocument of invalidDocuments) {
      html = invalidDocument;
      await assert.rejects(
        fetchAdminRemoteShellStoredResponse(
          "https://example.test/index.html",
          { adminPath: "/admin" },
          { ok: true, missing: [] }
        ),
        /missing #app root/
      );
    }
  });
});

test("fresh remote shell recognizes only an exact app id attribute", async () => {
  let html = "";
  await withWorkerGlobals({
    fetch: async () => new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    })
  }, async () => {
    const validDocuments = [
      '<!doctype html><html><body><div title=">"></div><main class="root" ID = \'app\'></main></body></html>',
      '<!doctype html><html><body><div title="<script>"></div><div id="app"></div></body></html>'
    ];
    for (const validDocument of validDocuments) {
      html = validDocument;
      const payload = await fetchAdminRemoteShellStoredResponse(
        "https://example.test/index.html",
        { adminPath: "/admin" },
        { ok: true, missing: [] }
      );
      assert.equal(payload.storedResponse.status, 200);
    }
  });
});

test("fresh remote shell keeps the external asset policy boundary", async () => {
  let assetUrl = "";
  await withWorkerGlobals({
    fetch: async () => new Response(
      `<!doctype html><html><body><div id="app"></div><script src="${assetUrl}"></script></body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    )
  }, async () => {
    const forbiddenAssetUrls = [
      "/assets/app.js",
      "https://esm.sh/vue@3/dist/vue.runtime.esm-browser.js",
      "https://raw.githubusercontent.com/owner/repo/main/app.js",
      "https://github.com/owner/repo/releases/download/v1.0.0/app.js",
      "https://github.com/owner/repo/releases/download/v1.0.0/runtime"
    ];
    for (const forbiddenAssetUrl of forbiddenAssetUrls) {
      assetUrl = forbiddenAssetUrl;
      await assert.rejects(
        fetchAdminRemoteShellStoredResponse(
          "https://example.test/index.html",
          { adminPath: "/admin" },
          { ok: true, missing: [] }
        ),
        /asset policy invalid/
      );
    }
  });
});

test("remote shell rejects importmaps and rewrites semantic assets without extensions", async () => {
  let html = '<!doctype html><html><head><script type="importmap">{"imports":{}}</script></head><body><div id="app"></div></body></html>';
  await withWorkerGlobals({
    fetch: async () => new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    })
  }, async () => {
    await assert.rejects(
      fetchAdminRemoteShellStoredResponse(
        "https://example.test/index.html",
        { adminPath: "/admin" },
        { ok: true, missing: [] }
      ),
      /importmap/
    );

    html = `<!doctype html><html><head>
      <script src='https://cdn.tailwindcss.com'></script>
      <link rel="modulepreload" href="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.prod.js">
      <link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/example@1.0.0/theme">
    </head><body><div id="app"></div></body></html>`;
    const payload = await fetchAdminRemoteShellStoredResponse(
      "https://example.test/index.html",
      { adminPath: "/admin" },
      { ok: true, missing: [] },
      null,
      { adminPath: "/admin", releaseTag: "v1.0.0" }
    );
    const renderedHtml = await payload.storedResponse.text();
    assert.equal(payload.vendorManifest.entries.length, 3);
    assert.doesNotMatch(renderedHtml, /https:\/\/cdn\.tailwindcss\.com/);
    assert.match(renderedHtml, /\/admin\/__release\/v1\.0\.0\/vendor\//);
  });
});

test("fresh remote shell enforces the byte limit after reading the body", async () => {
  const html = `<!doctype html><html><body><div id="app">${"x".repeat(2 * 1024 * 1024)}</div></body></html>`;
  await withWorkerGlobals({
    fetch: async () => new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    })
  }, async () => {
    await assert.rejects(
      fetchAdminRemoteShellStoredResponse(
        "https://example.test/index.html",
        { adminPath: "/admin" },
        { ok: true, missing: [] }
      ),
      /payload invalid: \d+ bytes/
    );
  });
});

test("jsDelivr GitHub mutable-ref classifier distinguishes branches from immutable refs", () => {
  assert.equal(isMutableJsdelivrGithubAssetUrl("https://cdn.jsdelivr.net/gh/owner/repo/app.js"), true);
  assert.equal(isMutableJsdelivrGithubAssetUrl("https://cdn.jsdelivr.net./gh/owner/repo/app.js"), true);
  assert.equal(isMutableJsdelivrGithubAssetUrl("https://cdn.jsdelivr.net/gh/owner/repo@main/app.js"), true);
  assert.equal(isMutableJsdelivrGithubAssetUrl("https://cdn.jsdelivr.net/gh/owner/repo@latest/app.js"), true);
  assert.equal(isMutableJsdelivrGithubAssetUrl("https://cdn.jsdelivr.net/gh/owner/repo@1.2/app.js"), true);
  assert.equal(isMutableJsdelivrGithubAssetUrl("https://cdn.jsdelivr.net/gh/owner/repo@abcdef0/app.js"), false);
  assert.equal(isMutableJsdelivrGithubAssetUrl("https://cdn.jsdelivr.net/gh/owner/repo@v1.2.3-beta.1/app.js"), false);
  assert.equal(isMutableJsdelivrGithubAssetUrl("https://cdn.jsdelivr.net/npm/vue@latest/dist/vue.js"), false);
});

test("mutable vendor assets bypass asset cache and return no-store", async () => {
  const upstreamUrl = "https://cdn.jsdelivr.net./gh/owner/repo/app.js";
  const cacheReads = [];
  const cacheWrites = [];
  const edgeCache = {
    async match(request) {
      const url = new URL(request.url);
      cacheReads.push(url.hostname);
      if (url.hostname === "admin-release-vendor-manifest.invalid") {
        return new Response(JSON.stringify({
          version: 1,
          releaseTag: "v1.0.0",
          sourceUrl: "https://example.test/index.html",
          entries: [{ assetKey: "app.js", assetKind: "script", upstreamUrl }]
        }));
      }
      return null;
    },
    async put(request) {
      cacheWrites.push(new URL(request.url).hostname);
    }
  };

  await withWorkerGlobals({
    caches: { default: edgeCache },
    fetch: async (url) => {
      assert.equal(url, upstreamUrl);
      return new Response("window.mutableAssetLoaded=true;", {
        headers: { "Content-Type": "application/javascript" }
      });
    }
  }, async () => {
    const response = await renderAdminReleaseVendorAsset(
      new Request("https://worker.test/admin/__release/v1.0.0/vendor/app.js"),
      {},
      null,
      { releaseTag: "v1.0.0", assetKey: "app.js" },
      {}
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
    assert.match(await response.text(), /mutableAssetLoaded/);
  });

  assert.deepEqual(cacheReads, ["admin-release-vendor-manifest.invalid"]);
  assert.deepEqual(cacheWrites, []);
});

test("immutable vendor assets use asset cache and immutable browser policy", async () => {
  const upstreamUrl = "https://cdn.jsdelivr.net/gh/owner/repo@v1.2.3/app.js";
  const cacheReads = [];
  const cacheWrites = [];
  const edgeCache = {
    async match(request) {
      const url = new URL(request.url);
      cacheReads.push(url.hostname);
      if (url.hostname === "admin-release-vendor-manifest.invalid") {
        return new Response(JSON.stringify({
          version: 1,
          releaseTag: "v1.0.0",
          sourceUrl: "https://example.test/index.html",
          entries: [{ assetKey: "app.js", assetKind: "script", upstreamUrl }]
        }));
      }
      return null;
    },
    async put(request) {
      cacheWrites.push(new URL(request.url).hostname);
    }
  };

  await withWorkerGlobals({
    caches: { default: edgeCache },
    fetch: async (url) => {
      assert.equal(url, upstreamUrl);
      return new Response("window.immutableAssetLoaded=true;", {
        headers: { "Content-Type": "application/javascript" }
      });
    }
  }, async () => {
    const response = await renderAdminReleaseVendorAsset(
      new Request("https://worker.test/admin/__release/v1.0.0/vendor/app.js"),
      {},
      null,
      { releaseTag: "v1.0.0", assetKey: "app.js" },
      {}
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "public, max-age=31536000, immutable");
    assert.match(await response.text(), /immutableAssetLoaded/);
  });

  assert.deepEqual(cacheReads, [
    "admin-release-vendor-manifest.invalid",
    "admin-release-vendor-cache.invalid"
  ]);
  assert.deepEqual(cacheWrites, ["admin-release-vendor-cache.invalid"]);
});

test("isolate cache defaults preserve bounded proxy headroom", () => {
  assert.ok(Config.Defaults.NodeCacheMax <= 512);
  assert.ok(Config.Defaults.PlaybackRouteHotCacheMax <= 256);
  assert.ok(Config.Defaults.PlaybackInfoCacheMax <= 64);
  assert.ok(Config.Defaults.PlaybackInfoCacheTotalMaxBytes <= 4 * 1024 * 1024);
  assert.ok(Config.Defaults.VideoProgressForwardSessionMax <= 128);
  assert.ok(Config.Defaults.BufferedRetryBodyMaxBytes <= 256 * 1024);
  assert.ok(Config.Defaults.LogQueueMax <= 512);
  assert.ok(Config.Defaults.LogDedupeMax <= 2048);
  assert.ok(Config.Defaults.LogFlushCountThreshold >= 100);
  assert.ok(Config.Defaults.OpsStatusReadCacheTtlMs <= 15 * 1000);
});

test("oversized PlaybackInfo responses are not retained in isolate memory", async () => {
  GLOBALS.PlaybackInfoResponseCache.clear();
  const execution = {
    requestTraits: { isPlaybackInfoRequest: true },
    playbackInfoCacheKey: "playback-info:oversized",
    requestMethod: "POST",
    playbackInfoCacheTtlSec: 60,
    nodeName: "alpha",
    nodeDerivedCacheRevision: "rev-1"
  };
  const oversizedBody = "x".repeat(Config.Defaults.PlaybackInfoCacheEntryMaxBytes + 1);
  const stored = await Proxy.storePlaybackInfoResponseCache(execution, new Response(oversizedBody, {
    headers: { "Content-Type": "application/json" }
  }));
  assert.equal(stored, false);
  assert.equal(GLOBALS.PlaybackInfoResponseCache.size, 0);
});

test("oversized PlaybackInfo rewrite bypasses without blocking its original stream", { timeout: 2000 }, async () => {
  const oversizedBody = "x".repeat(Config.Defaults.PlaybackInfoCacheEntryMaxBytes + 1);
  const response = new Response(oversizedBody, {
    headers: { "Content-Type": "application/json" }
  });
  const upstreamState = { response };
  const execution = {
    requestTraits: { isPlaybackInfoRequest: true },
    effectivePlaybackInfoMode: "rewrite",
    requestMethod: "POST",
    playbackInfoRewrite: ""
  };
  const result = await Proxy.maybeRewritePlaybackInfoResponse(execution, upstreamState);
  assert.equal(result, upstreamState);
  assert.equal(execution.playbackInfoRewrite, "not_needed");
  assert.equal((await response.text()).length, oversizedBody.length);
});

test("PlaybackInfo rewrite reuses its bounded body snapshot for isolate caching", async () => {
  GLOBALS.PlaybackInfoResponseCache.clear();
  const originalCloneDescriptor = Object.getOwnPropertyDescriptor(Response.prototype, "clone");
  const originalClone = originalCloneDescriptor.value;
  let cloneCount = 0;
  Response.prototype.clone = function countedClone() {
    cloneCount += 1;
    return originalClone.call(this);
  };
  try {
    const execution = {
      requestTraits: { isPlaybackInfoRequest: true },
      effectivePlaybackInfoMode: "rewrite",
      requestMethod: "POST",
      playbackInfoRewrite: "",
      playbackInfoRewriteUrlMode: "relative",
      playbackInfoCacheKey: "playback-info:single-read",
      playbackInfoCacheTtlSec: 60,
      nodeName: "alpha",
      nodeKey: "",
      nodeDerivedCacheRevision: "rev-1",
      proxyPath: "/Items/1/PlaybackInfo",
      requestUrl: new URL("https://worker.test/alpha/Items/1/PlaybackInfo"),
      rawRequestUrl: new URL("https://worker.test/alpha/Items/1/PlaybackInfo"),
      entryMode: "kv_route"
    };
    const upstreamState = {
      response: new Response(JSON.stringify({
        MediaSources: [{ Path: "/Videos/1/stream" }]
      }), {
        headers: { "Content-Type": "application/json" }
      }),
      activeTargetBase: new URL("https://origin.test"),
      finalUrl: new URL("https://origin.test/Items/1/PlaybackInfo")
    };

    const rewrittenState = await Proxy.maybeRewritePlaybackInfoResponse(execution, upstreamState);
    assert.equal(cloneCount, 1);
    assert.equal(execution.playbackInfoCacheBodyResolved, true);
    assert.ok(execution.playbackInfoCacheBody?.bytes > 0);

    const stored = await Proxy.storePlaybackInfoResponseCache(execution, rewrittenState.response);
    assert.equal(stored, true);
    assert.equal(cloneCount, 1, "cache storage must reuse the rewrite snapshot");
    assert.equal(GLOBALS.PlaybackInfoResponseCache.get("playback-info:single-read")?.bodyText, execution.playbackInfoCacheBody.text);
  } finally {
    Object.defineProperty(Response.prototype, "clone", originalCloneDescriptor);
    GLOBALS.PlaybackInfoResponseCache.clear();
  }
});

test("PlaybackInfo cache evicts oldest entries at its total byte budget", () => {
  GLOBALS.PlaybackInfoResponseCache.clear();
  const entryBytes = Config.Defaults.PlaybackInfoCacheEntryMaxBytes;
  const entryCount = Math.floor(Config.Defaults.PlaybackInfoCacheTotalMaxBytes / entryBytes) + 1;
  for (let index = 0; index < entryCount; index += 1) {
    GLOBALS.PlaybackInfoResponseCache.set(`entry-${index}`, {
      bodyText: "",
      bodyBytes: entryBytes,
      expiresAt: Date.now() + 60000
    });
  }
  Proxy.cleanupPlaybackInfoResponseCache();
  assert.equal(GLOBALS.PlaybackInfoResponseCache.has("entry-0"), false);
  assert.equal(GLOBALS.PlaybackInfoResponseCache.has(`entry-${entryCount - 1}`), true);
  const retainedBytes = [...GLOBALS.PlaybackInfoResponseCache.values()]
    .reduce((total, entry) => total + entry.bodyBytes, 0);
  assert.ok(retainedBytes <= Config.Defaults.PlaybackInfoCacheTotalMaxBytes);
  GLOBALS.PlaybackInfoResponseCache.clear();
});

test("unknown-length control requests stay streamed instead of being cloned into memory", async () => {
  const request = new Request("https://worker.test/Sessions/Playing/Progress", {
    method: "POST",
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("{}"));
        controller.close();
      }
    }),
    duplex: "half"
  });
  assert.equal(request.headers.has("Content-Length"), false);
  const transport = await Proxy.buildProxyRequestState(
    request,
    {},
    "/Sessions/Playing/Progress",
    new URL(request.url),
    "203.0.113.1",
    {
      isPlaybackInfoRequest: false,
      isPlaybackSessionControlRequest: true,
      isBigStream: false,
      isSmartStrmMedia: false,
      isSegment: false,
      isManifest: false,
      isWsUpgrade: false
    },
    false,
    [],
    {}
  );
  assert.equal(transport.preparedBodyMode, "stream");
});

test("playback progress relay enforces its bounded session table on insertion", () => {
  const relayMap = GLOBALS.PlaybackProgressRelay;
  relayMap.clear();
  const maxEntries = Config.Defaults.VideoProgressForwardSessionMax;
  const execution = {
    videoProgressForwardIntervalSec: 3,
    nodeName: "alpha",
    nodeDerivedCacheRevision: "rev-1",
    ctx: { waitUntil() {} }
  };
  for (let index = 0; index < maxEntries + 1; index += 1) {
    Proxy.markPlaybackProgressRelayStopped(`session-${index}`, execution);
  }
  assert.equal(relayMap.size, maxEntries);
  assert.equal(relayMap.has("session-0"), false);
  assert.equal(relayMap.has(`session-${maxEntries}`), true);
  relayMap.clear();
});

test("incremental isolate cleanup covers nonessential proxy-adjacent caches", () => {
  const now = Date.now();
  const staleCases = [
    [5, GLOBALS.PlaybackInfoResponseCache, "stale-playback", { expiresAt: now - 1 }],
    [6, GLOBALS.ProxyFailoverStateCache, "stale-failover", {
      preferredTargetExpiresAt: now - 1,
      failingTargets: new Map(),
      inFlightProbe: null,
      lastProbeResult: null
    }],
    [7, GLOBALS.PlaybackProgressRelay, "stale-progress", { lastTouchedAt: now - 120000 }],
    [8, GLOBALS.DashboardMonthlyTrafficCache, "stale-month", { staleUntil: now - 1 }]
  ];
  for (const [phase, cache, key, value] of staleCases) {
    cache.clear();
    cache.set(key, value);
    GLOBALS.CleanupState.phase = phase;
    GLOBALS.CleanupState.lastRunAt = 0;
    GLOBALS.CleanupState.iterators = {};
    CacheManager.maybeCleanup();
    assert.equal(cache.has(key), false, `cleanup phase ${phase} should remove stale entry`);
  }
});

function createD1Recorder() {
  const prepared = [];
  const batches = [];
  const schemaColumns = [
    "id", "timestamp", "node_name", "request_path", "request_method", "status_code", "response_time", "client_ip",
    "inbound_colo", "outbound_colo", "user_agent", "referer", "category", "error_detail", "detail_json", "created_at",
    "inbound_ip", "outbound_ip", "ip", "ip_type", "source_kind", "source_label", "line_label", "remark", "updated_at",
    "name", "url", "source_type", "domain", "preset_id", "builtin_id", "enabled", "sort_order", "ip_limit",
    "last_fetch_at", "last_fetch_status", "last_fetch_count"
  ];
  const db = {
    prepare(sql) {
      const record = { sql: String(sql), bindings: [] };
      prepared.push(record);
      const statement = {
        __record: record,
        bind(...bindings) {
          record.bindings = bindings;
          return statement;
        },
        async run() {
          return { success: true };
        },
        async all() {
          if (/^PRAGMA table_info/i.test(record.sql.trim())) {
            return { results: schemaColumns.map(name => ({ name })) };
          }
          return { results: [] };
        },
        async first() {
          return null;
        }
      };
      return statement;
    },
    async batch(statements) {
      batches.push(statements.map(statement => statement.__record));
      return statements.map(() => ({ success: true }));
    }
  };
  return { db, prepared, batches };
}

test("D1 OpsStatus reads and writes reuse the binding-local hot cache", async () => {
  const recorder = createD1Recorder();
  const scope = Database.OPS_STATUS_DB_SCOPE_ROOT;

  assert.equal(await Database.getOpsStatusPayloadFromDb(recorder.db, scope), null);
  assert.equal(await Database.getOpsStatusPayloadFromDb(recorder.db, scope), null);
  assert.equal(recorder.prepared.filter(record => /^SELECT payload FROM sys_status/i.test(record.sql.trim())).length, 1);
  assert.equal(recorder.prepared.filter(record => /^CREATE TABLE IF NOT EXISTS sys_status/i.test(record.sql.trim())).length, 1);

  await Database.putOpsStatusPayloadToDb(recorder.db, scope, { log: { status: "ready" } }, Date.now());
  assert.deepEqual(await Database.getOpsStatusPayloadFromDb(recorder.db, scope), { log: { status: "ready" } });
  const selectCountBeforePatch = recorder.prepared.filter(record => /^SELECT payload FROM sys_status/i.test(record.sql.trim())).length;
  await Database.patchOpsStatus(recorder.db, { log: { lastFlushStatus: "success" } });
  assert.equal(
    recorder.prepared.filter(record => /^SELECT payload FROM sys_status/i.test(record.sql.trim())).length,
    selectCountBeforePatch,
    "a hot status patch must not reread root or all section scopes"
  );
  assert.equal(recorder.prepared.filter(record => /^INSERT INTO sys_status/i.test(record.sql.trim())).length, 2);
});

test("Cloudflare runtime stale fallback performs one D1 cache lookup", async () => {
  const database = Object.create(Database);
  let cacheReadCount = 0;
  database.getCfRuntimeCacheEntry = async () => {
    cacheReadCount += 1;
    return {
      payload: { cached: true },
      cachedAt: 1,
      expiresAt: 2,
      updatedAt: 1
    };
  };
  await assert.rejects(
    database.loadCfRuntimeCachePayload({}, {
      cacheKey: "runtime:test",
      cacheGroup: "test",
      resourceId: "test",
      nowMs: 3,
      loader: async () => { throw new Error("refresh_failed"); },
      allowStale: false
    }),
    /refresh_failed/
  );
  assert.equal(cacheReadCount, 1);
});

test("D1 schema initialization is single-flight and migration indexes match runtime queries", async () => {
  const logRecorder = createD1Recorder();
  await Promise.all([
    Database.ensureLogsBaseSchema(logRecorder.db),
    Database.ensureLogsBaseSchema(logRecorder.db)
  ]);
  await Database.ensureLogsBaseSchema(logRecorder.db);
  await Promise.all([
    Database.ensureStatsHourlySchema(logRecorder.db),
    Database.ensureStatsHourlySchema(logRecorder.db)
  ]);

  assert.equal(logRecorder.prepared.filter(record => /CREATE TABLE IF NOT EXISTS proxy_logs \(/.test(record.sql)).length, 1);
  assert.equal(logRecorder.prepared.filter(record => /CREATE TABLE IF NOT EXISTS proxy_stats_hourly \(/.test(record.sql)).length, 1);
  assert.ok(logRecorder.prepared.some(record => /idx_proxy_logs_client_time/.test(record.sql)));
  Database.invalidateD1SchemaReadiness(logRecorder.db, "logs");
  await Database.ensureLogsBaseSchema(logRecorder.db);
  assert.equal(logRecorder.prepared.filter(record => /CREATE TABLE IF NOT EXISTS proxy_logs \(/.test(record.sql)).length, 2);

  const dnsRecorder = createD1Recorder();
  await Promise.all([
    Database.ensureDnsIpWorkspaceSchema(dnsRecorder.db),
    Database.ensureDnsIpWorkspaceSchema(dnsRecorder.db)
  ]);
  await Database.ensureDnsIpWorkspaceSchema(dnsRecorder.db);

  assert.equal(dnsRecorder.prepared.filter(record => /CREATE TABLE IF NOT EXISTS dns_ip_pool_items \(/.test(record.sql)).length, 1);
  assert.ok(dnsRecorder.prepared.some(record => /idx_dns_ip_pool_items_updated_ip/.test(record.sql)));
  assert.ok(dnsRecorder.prepared.some(record => /idx_dns_ip_probe_cache_colo_ip_expires/.test(record.sql)));
  Database.invalidateD1SchemaReadiness(dnsRecorder.db, "all");
  await Database.ensureDnsIpWorkspaceSchema(dnsRecorder.db);
  assert.equal(dnsRecorder.prepared.filter(record => /CREATE TABLE IF NOT EXISTS dns_ip_pool_items \(/.test(record.sql)).length, 2);

  const migrationSql = await readFile(new URL("../migrations/0003_d1_schema_v5_indexes.sql", import.meta.url), "utf8");
  assert.match(migrationSql, /CREATE INDEX IF NOT EXISTS idx_proxy_logs_category_time/);
  assert.match(migrationSql, /DROP INDEX IF EXISTS idx_proxy_logs_timestamp_id/);
  assert.match(migrationSql, /DROP INDEX IF EXISTS idx_proxy_logs_category/);
  assert.match(migrationSql, /DROP INDEX IF EXISTS idx_proxy_stats_hourly_date/);
  assert.match(migrationSql, /DROP INDEX IF EXISTS idx_dns_ip_pool_items_ip_type/);
  assert.match(migrationSql, /DROP INDEX IF EXISTS idx_sys_status_updated_at/);
});

test("D1 DNS writes keep stable ids and replace sources atomically", async () => {
  const recorder = createD1Recorder();
  await Database.upsertDnsIpPoolItems(recorder.db, [{
    id: "item-v2",
    ip: "203.0.113.10",
    sourceKind: "manual",
    sourceLabel: "manual"
  }]);
  const itemUpsertSql = recorder.prepared.find(record => /INSERT INTO dns_ip_pool_items/.test(record.sql))?.sql || "";
  assert.doesNotMatch(itemUpsertSql, /id\s*=\s*excluded\.id/);

  await Database.persistDnsIpPoolSources({ db: recorder.db }, [{
    id: "source-1",
    name: "Example source",
    url: "https://example.test/ips.txt",
    sourceType: "url",
    sourceKind: "custom",
    enabled: true,
    sortOrder: 0,
    ipLimit: 5
  }]);
  const sourceBatch = recorder.batches.at(-1);
  assert.equal(sourceBatch.length, 2);
  assert.match(sourceBatch[0].sql, /^DELETE FROM dns_ip_pool_sources$/);
  assert.match(sourceBatch[1].sql, /^INSERT INTO dns_ip_pool_sources/);
});

test("D1 probe cache bulk reads stay within the 100 binding limit", async () => {
  const recorder = createD1Recorder();
  const ips = Array.from({ length: 99 }, (_, index) => `203.0.113.${index + 1}`);
  await Database.getDnsIpProbeCacheEntries(recorder.db, ips, "SJC");
  const bulkQueries = recorder.prepared.filter(record => /WHERE entry_colo = \? AND expires_at > \? AND ip IN/.test(record.sql));
  assert.equal(bulkQueries.length, 2);
  assert.ok(bulkQueries.every(record => record.bindings.length <= 100));
  assert.equal(Math.max(...bulkQueries.map(record => record.bindings.length)), 100);
});
