import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createTestApplication } from "../worker/testing/hooks.js";
import {
  AdminConsoleFacade,
  Config,
  NodeProxyFacade,
  ScheduledMaintenanceFacade,
  buildCanonicalWorkerMetadataCacheKey,
  buildDailyTelegramSummaryMessage,
  buildDnsIpWorkspaceSummary,
  buildMediaAggregationIdentity,
  buildMediaAggregationMatchFingerprintHash,
  buildMediaAggregationSourceId,
  buildMediaAggregationSourceIdV2,
  buildPosterBrowserConfig,
  buildProbeUpstreamUrl,
  buildProxyAccessRuleProfile,
  buildResolvedAdminIndexState,
  buildServerRecordExpiry,
  buildServerRecordPosterMetadata,
  buildUpstreamProxyUrl,
  buildWorkerMetadataCacheIdentityPartition,
  buildWorkerMetadataCacheLookupRequest,
  buildWorkerMetadataCachePolicyRevision,
  buildWorkerMetadataPrewarmIdentityPartition,
  createTargetRecord,
  createWorkerApplication,
  defineAnalyticsCacheMethods,
  defineDatabaseStatusMethods,
  defineNodeRepositoryMethods,
  getDueScheduledClockSlots,
  getRuntimeConfig,
  hasWorkerMetadataPrivateIdentity,
  invalidateNodesRevisionCache,
  invalidateRuntimeConfigCache,
  isEmbyWebProxyPath,
  isolateState,
  matchMediaAggregationIdentities,
  mediaAggregationProviderIdsMatch,
  normalizeMediaAggregationTitle,
  normalizePosterBrowserOrigin,
  normalizeTmdbBrowserToken,
  parseMediaAggregationSourceId,
  resolveEffectiveRoutingDecisionMode,
  resolveMediaAggregationCredentials,
  resolvePlaybackInfoRewriteUrlMode,
  resolveRoutingDecisionMode,
  runSingleFlight,
  runWithConcurrency,
  sanitizeRuntimeConfig,
  serializeBoundedLogDetailJson,
  verifyMediaAggregationSourceSignature
} from "../worker/runtime/application-facades.js";

const hooks = createTestApplication();
assert.ok(hooks, "worker.js must expose Node test hooks");

const {
  adminConsole,
  nodeProxy,
  scheduledMaintenance,
  testPlatform,
  workerHandler
} = hooks;
const {
  adminActions,
  adminShell,
  logger,
  proxyService,
  routeTesting
} = testPlatform.fetch;
const {
  buildAdminLocalIndexUploadRecord,
  buildAdminRemoteShellErrorContent,
  buildAdminRemoteShellCacheKeyRequest,
  buildAdminRemoteShellLegacyCacheKeyRequest,
  buildAdminRemoteShellStoredResponse,
  buildAdminWarmSubrequest,
  ensureAdminRemoteTailwindConfigGlobal,
  fetchAdminRemoteShellStoredResponse,
  isAcceptedAdminHtmlDocumentContentType,
  isAdminWarmResponseSuccessful,
  isAdminIndexSetupForced,
  isAdminWarmRoute,
  isMutableJsdelivrGithubAssetUrl,
  patchAdminShellRuntimeStatus,
  renderAdminLoginPage,
  renderAdminPage,
  renderAdminReleaseVendorAsset,
  renderAdminRemoteShellErrorPage,
  renderRemoteAdminPage,
  warmAdminReleaseVendorEntries
} = adminShell;
const kernel = testPlatform.kv;
const cachePort = testPlatform.cache;

assert.ok(routeTesting && typeof routeTesting === "object", "missing route test adapter");

test("workflow facades replace capability ports and compatibility composition", () => {
  const facades = createWorkerApplication();
  assert.equal(Object.isFrozen(facades), true);
  assert.ok(facades.adminConsole instanceof AdminConsoleFacade);
  assert.ok(facades.nodeProxy instanceof NodeProxyFacade);
  assert.ok(facades.scheduledMaintenance instanceof ScheduledMaintenanceFacade);
  assert.equal("capabilityPorts" in facades, false);
  assert.equal("compatibilityOperations" in facades, false);
  assert.equal("testingSupport" in facades, false);
  assert.equal(typeof facades.adminConsole.handle, "function");
  assert.equal(typeof facades.nodeProxy.handle, "function");
  assert.equal(typeof facades.scheduledMaintenance.handle, "function");
  for (const facade of [facades.adminConsole, facades.nodeProxy, facades.scheduledMaintenance]) {
    assert.deepEqual(
      Object.getOwnPropertyNames(Object.getPrototypeOf(facade)).filter(name => name !== "constructor"),
      ["handle"]
    );
  }
});

test("test composition exposes the production facades and handler", () => {
  assert.deepEqual(Object.keys(hooks).sort(), [
    "adminConsole",
    "nodeProxy",
    "scheduledMaintenance",
    "testPlatform",
    "workerHandler"
  ]);
  assert.deepEqual(Object.keys(testPlatform).sort(), ["cache", "clock", "d1", "fetch", "kv"]);
  assert.ok(adminConsole instanceof AdminConsoleFacade);
  assert.ok(nodeProxy instanceof NodeProxyFacade);
  assert.ok(scheduledMaintenance instanceof ScheduledMaintenanceFacade);
  assert.notStrictEqual(testPlatform.kv, testPlatform.d1);
  assert.equal(typeof testPlatform.fetch.fetchRequest, "function");
  assert.equal(typeof testPlatform.clock.now, "function");
  assert.equal(typeof workerHandler.fetch, "function");
  assert.equal(typeof workerHandler.scheduled, "function");
  assert.equal(Object.isFrozen(workerHandler), true);
});

test("node proxy facade consumes a precomputed route context", async () => {
  const request = new Request("https://worker.test/");
  const env = {};
  const ctx = { waitUntil() {} };
  const routeContext = routeTesting.buildFetchRouteContext(request, env);

  const response = await nodeProxy.handle(request, env, ctx, routeContext);

  assert.equal(response.status, 404);
  assert.equal(routeContext.hostPrefixMatch, null);
  await assert.rejects(nodeProxy.handle(request, env, ctx, null), {
    name: "TypeError",
    message: "NodeProxyFacade.handle requires routeContext"
  });
});

test("production handler dispatches ordinary node routes without entering the admin facade", async () => {
  const application = createWorkerApplication();
  application.adminConsole.handle = async () => {
    throw new Error("ordinary node route entered AdminConsoleFacade");
  };

  const response = await application.workerHandler.fetch(
    new Request("https://worker.test/missing-node/System/Info"),
    {},
    { waitUntil() {} }
  );

  assert.equal(response.status, 404);
});

test("direct Admin facade and production handler reject unauthenticated read and write actions", async () => {
  const env = {
    ADMIN_PATH: "/admin",
    ADMIN_PASS: "admin-password",
    JWT_SECRET: "admin-secret"
  };
  const ctx = { waitUntil() {} };
  const buildRequest = action => new Request("https://worker.test/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data: action === "saveConfig" ? { rateLimitRpm: 30 } : {} })
  });

  for (const action of ["getConfig", "saveConfig"]) {
    const direct = await adminConsole.handle(buildRequest(action), env, ctx);
    const production = await workerHandler.fetch(buildRequest(action), env, ctx);
    assert.equal(direct.status, 401, `${action} direct facade status`);
    assert.equal(production.status, 401, `${action} production status`);
    assert.deepEqual(await direct.json(), await production.json());
  }
});

test("production scheduled handler owns waitUntil for empty and busy bindings", async () => {
  const emptyTasks = [];
  workerHandler.scheduled(
    { scheduledTime: Date.UTC(2026, 6, 30, 0, 0, 0) },
    {},
    { waitUntil(task) { emptyTasks.push(task); } }
  );
  assert.equal(emptyTasks.length, 1);
  await emptyTasks[0];

  const originals = {
    getDB: kernel.getDB,
    getKV: kernel.getKV,
    patchOpsStatus: kernel.patchOpsStatus,
    tryAcquireScheduledLeaseWithDb: kernel.tryAcquireScheduledLeaseWithDb
  };
  const statusPatches = [];
  try {
    kernel.getDB = () => ({});
    kernel.getKV = () => null;
    kernel.tryAcquireScheduledLeaseWithDb = async () => ({
      acquired: false,
      backend: "d1",
      reason: "lease_busy",
      lock: { expiresAt: "2026-07-30T00:05:00.000Z" }
    });
    kernel.patchOpsStatus = async (_env, patch) => {
      statusPatches.push(patch);
      return patch;
    };
    const busyTasks = [];
    workerHandler.scheduled(
      { scheduledTime: Date.UTC(2026, 6, 30, 0, 1, 0) },
      {},
      { waitUntil(task) { busyTasks.push(task); } }
    );
    assert.equal(busyTasks.length, 1);
    await busyTasks[0];
    assert.equal(statusPatches.length, 1);
    assert.equal(statusPatches[0].scheduled.lock.status, "busy");
    assert.equal(statusPatches[0].scheduled.lock.backend, "d1");
  } finally {
    for (const [name, value] of Object.entries(originals)) kernel[name] = value;
  }
});

test("formal Worker source tree omits legacy composition and public service forwarders", async () => {
  const facadeSource = await readFile(new URL("../worker/runtime/application-facades.js", import.meta.url), "utf8");
  assert.match(facadeSource, /class \{[\s\S]*AdminConsoleFacade|AdminConsoleFacade = class/);
  for (const relativePath of [
    "../worker/runtime/capabilities.js",
    "../worker/runtime/compat-facades.js",
    "../worker/features/admin/public/actions/service.js"
  ]) {
    await assert.rejects(readFile(new URL(relativePath, import.meta.url), "utf8"), { code: "ENOENT" });
  }
});

function createStatusTestService(db) {
  return defineDatabaseStatusMethods({
    bindingPort: {
      getDB: () => db,
      getKV: () => null
    },
    schemaReadinessPort: {
      isD1SchemaReadyCached: () => true,
      markD1SchemaReady() {}
    },
    statusPersistence: {
      buildOpsStatusRootPatch: patch => patch,
      cacheOpsStatusPayload() {},
      ensureSysStatusTable: async () => true,
      flushOpsStatusShadow: async () => ({}),
      getOpsStatusDbScope: sectionName => sectionName
        ? kernel.OPS_STATUS_SECTION_SCOPES[sectionName]
        : kernel.OPS_STATUS_DB_SCOPE_ROOT,
      getOpsStatusPayloadCache: () => null,
      getOpsStatusShadowPatch: activeDb => isolateState.OpsStatusShadowCache.get(activeDb)?.pendingPatch || {},
      getOpsStatusShadowState: () => null,
      resolveOpsStatusStores: value => ({ db: value, kv: null })
    }
  });
}

test("DNS IP workspace summary includes current-host and combined rows", () => {
  const summary = buildDnsIpWorkspaceSummary(
    [{ ipType: "IPv4", countryCode: "US", coloCode: "SJC" }],
    [{ ipType: "IPv6", countryCode: "DE", coloCode: "FRA" }]
  );

  assert.deepEqual(summary.currentHost, {
    ipCount: 1,
    ipv4Count: 1,
    ipv6Count: 0,
    countryCount: 1,
    coloCount: 1
  });
  assert.equal(summary.sharedPool.ipv6Count, 1);
  assert.deepEqual(summary.combined, {
    ipCount: 2,
    ipv4Count: 1,
    ipv6Count: 1,
    countryCount: 2,
    coloCount: 2
  });
});

test("PlaybackInfo URL mode is emitted only for rewrite mode", () => {
  assert.equal(resolvePlaybackInfoRewriteUrlMode("rewrite"), "relative");
  assert.equal(resolvePlaybackInfoRewriteUrlMode("passthrough"), "");
  assert.equal(resolvePlaybackInfoRewriteUrlMode("unknown"), "");
});

test("routing decision mode honors global config and node inheritance", () => {
  assert.equal(resolveRoutingDecisionMode({ routingDecisionMode: "legacy" }), "legacy");
  assert.equal(resolveRoutingDecisionMode({ routingDecisionMode: "simplified" }), "simplified");
  assert.equal(resolveEffectiveRoutingDecisionMode({ routingDecisionMode: "inherit" }, { routingDecisionMode: "legacy" }), "legacy");
  assert.equal(resolveEffectiveRoutingDecisionMode({ routingDecisionMode: "simplified" }, { routingDecisionMode: "legacy" }), "simplified");

  const requestTraits = {
    legacyEntryOffloadEnabled: true,
    legacyEntryOffloadReason: "legacy_direct",
    nodeDirectMedia: false,
    directStaticAssets: false,
    directHlsDash: false
  };
  assert.equal(proxyService.getEntryRoutingDecision({ routingDecisionMode: "legacy", requestTraits }).action, "DIRECT");
  assert.equal(proxyService.getEntryRoutingDecision({ routingDecisionMode: "simplified", requestTraits }).action, "PROXY");
});

test("runtime config sanitization migrates aliases once and drops retired fields", () => {
  const sanitized = sanitizeRuntimeConfig({
    directSourceNodes: ["Alpha"],
    enableH2: true,
    tmdbApiKey: "retired",
    releaseRepo: "retired/repo",
    tgDailyReportTime: "08:30"
  });

  assert.deepEqual(sanitized.sourceDirectNodes, ["Alpha"]);
  assert.equal(sanitized.protocolStrategy, "balanced");
  assert.deepEqual(sanitized.tgDailyReportClockTimes, ["08:30"]);
  for (const key of ["directSourceNodes", "enableH2", "tmdbApiKey", "releaseRepo", "tgDailyReportTime"]) {
    assert.equal(Object.prototype.hasOwnProperty.call(sanitized, key), false);
  }
});

test("runWithConcurrency preserves order and enforces normalized limits", async () => {
  const measure = async (limit) => {
    let active = 0;
    let peak = 0;
    const values = await runWithConcurrency([1, 2, 3, 4, 5], limit, async value => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise(resolve => setTimeout(resolve, 2));
      active -= 1;
      return value * 2;
    });
    return { peak, values };
  };

  assert.deepEqual(await measure(2), { peak: 2, values: [2, 4, 6, 8, 10] });
  assert.deepEqual(await measure(Number.NaN), { peak: 1, values: [2, 4, 6, 8, 10] });
});

test("node probes preserve target base paths and require a successful response", async () => {
  const rootTarget = createTargetRecord("https://origin.example");
  const embyTarget = createTargetRecord("https://origin.example/emby");
  const mixedCaseTarget = createTargetRecord("https://origin.example/Emby");
  const nestedTarget = createTargetRecord("https://origin.example/proxy/emby");
  const mediaTarget = createTargetRecord("https://origin.example/media");
  assert.ok(rootTarget);
  assert.ok(embyTarget);
  assert.ok(mixedCaseTarget);
  assert.ok(nestedTarget);
  assert.ok(mediaTarget);
  assert.equal(
    buildProbeUpstreamUrl(rootTarget, "/emby/System/Info/Public").toString(),
    "https://origin.example/emby/System/Info/Public"
  );
  assert.equal(
    buildProbeUpstreamUrl(embyTarget, "/emby/System/Info/Public").toString(),
    "https://origin.example/emby/System/Info/Public"
  );
  assert.equal(
    buildProbeUpstreamUrl(embyTarget, "/System/Info/Public").toString(),
    "https://origin.example/emby/System/Info/Public"
  );
  assert.equal(
    buildProbeUpstreamUrl(mixedCaseTarget, "/emby/system/ping").toString(),
    "https://origin.example/Emby/system/ping"
  );
  assert.equal(
    buildProbeUpstreamUrl(embyTarget, "/EMBY/system/ping").toString(),
    "https://origin.example/emby/system/ping"
  );
  assert.equal(
    buildProbeUpstreamUrl(nestedTarget, "/emby/system/ping").toString(),
    "https://origin.example/proxy/emby/system/ping"
  );
  assert.equal(
    buildProbeUpstreamUrl(nestedTarget, "/proxy/emby/system/ping").toString(),
    "https://origin.example/proxy/emby/system/ping"
  );
  assert.equal(
    buildProbeUpstreamUrl(nestedTarget, "/PROXY/EMBY/system/ping").toString(),
    "https://origin.example/proxy/emby/system/ping"
  );
  assert.equal(
    buildProbeUpstreamUrl(mediaTarget, "/emby/system/ping").toString(),
    "https://origin.example/media/emby/system/ping"
  );
  assert.equal(
    buildUpstreamProxyUrl(embyTarget, "/System/Info/Public").toString(),
    "https://origin.example/emby/System/Info/Public"
  );
  assert.equal(
    buildUpstreamProxyUrl(nestedTarget, "/emby/system/ping").toString(),
    "https://origin.example/proxy/emby/emby/system/ping"
  );

  const responses = [404, 204, 405, 204, 501, 503, 503];
  const requests = [];
  await withWorkerGlobals({
    fetch: async (url, init = {}) => {
      requests.push({ url: String(url), method: String(init.method || "GET") });
      return new Response(null, { status: responses.shift() });
    }
  }, async () => {
    assert.equal(await kernel.pingTarget("https://origin.example/emby", 1000), 9999);
    const successLatency = await kernel.pingTarget("https://origin.example", 1000, {
      probePath: "/emby/System/Info/Public"
    });
    assert.ok(successLatency >= 0 && successLatency < 9999);
    const fallbackLatency = await kernel.pingTarget("https://origin.example/emby", 1000);
    assert.ok(fallbackLatency >= 0 && fallbackLatency < 9999);
    assert.equal(await kernel.pingTarget("https://origin.example/emby", 1000), 9999);
    assert.equal(await kernel.pingTarget("https://origin.example/emby", 1000), 9999);
  });
  assert.deepEqual(requests, [
    { url: "https://origin.example/emby/system/info/public", method: "HEAD" },
    { url: "https://origin.example/emby/System/Info/Public", method: "HEAD" },
    { url: "https://origin.example/emby/system/info/public", method: "HEAD" },
    { url: "https://origin.example/emby/system/info/public", method: "GET" },
    { url: "https://origin.example/emby/system/info/public", method: "HEAD" },
    { url: "https://origin.example/emby/system/info/public", method: "GET" },
    { url: "https://origin.example/emby/system/info/public", method: "HEAD" }
  ]);
});

test("failover probes reuse the base-aware probe URL and accept all 2xx responses", async () => {
  const originalProbeRequest = proxyService.performFailoverProbeRequest;
  const requests = [];
  proxyService.performFailoverProbeRequest = async (_execution, probeUrl, method) => {
    requests.push({ url: probeUrl.toString(), method });
    return new Response(null, { status: method === "HEAD" ? 405 : 204 });
  };
  try {
    const result = await proxyService.runFailoverProbeCandidate({
      failoverContext: { probePath: "/emby/system/ping", probeTimeoutMs: 1000 }
    }, createTargetRecord("https://origin.example/emby"));
    assert.equal(result.ok, true);
    assert.equal(result.status, 204);
    assert.equal(result.methodUsed, "GET");
    assert.deepEqual(requests, [
      { url: "https://origin.example/emby/system/ping", method: "HEAD" },
      { url: "https://origin.example/emby/system/ping", method: "GET" }
    ]);
  } finally {
    proxyService.performFailoverProbeRequest = originalProbeRequest;
  }
});

test("media aggregation source IDs are stateless and provider matching is exact", () => {
  const sourceId = buildMediaAggregationSourceId("backup-2", "98765", "abc_4k");
  assert.match(sourceId, /^AGG1\*/);
  assert.deepEqual(parseMediaAggregationSourceId(sourceId), {
    nodeName: "backup-2",
    itemId: "98765",
    mediaSourceId: "abc_4k"
  });
  assert.equal(parseMediaAggregationSourceId("AGG1*bad*id"), null);
  assert.equal(mediaAggregationProviderIdsMatch({ TMDB: "123" }, { tmdb: "123", imdb: "tt1" }), true);
  assert.equal(mediaAggregationProviderIdsMatch({ imdb: "tt1" }, { imdb: "tt2" }), false);
  assert.equal(mediaAggregationProviderIdsMatch({ tmdb: "123", imdb: "tt1" }, { tmdb: "999", imdb: "tt1" }), false);
});

test("AGG2 source IDs reject tampering and bind the content fingerprint", async () => {
  const secret = "test-jwt-secret";
  const sourceId = await buildMediaAggregationSourceIdV2(secret, "backup", "98765", "abc", "identity_hash_1234567890");
  assert.match(sourceId, /^AGG2\*/);
  const parsed = parseMediaAggregationSourceId(sourceId);
  assert.equal(parsed.version, "AGG2");
  assert.equal(parsed.nodeName, "backup");
  assert.equal(parsed.identityHash, "identity_hash_1234567890");
  assert.equal(await verifyMediaAggregationSourceSignature(parsed, secret), true);
  const tampered = parseMediaAggregationSourceId(sourceId.replace("identity_hash_1234567890", "identity_hash_0987654321"));
  assert.equal(await verifyMediaAggregationSourceSignature(tampered, secret), false);
});

test("media aggregation identity matching is strict across providers, titles, years, types, and episodes", () => {
  assert.equal(normalizeMediaAggregationTitle("Spider-Man: Homecoming"), "spidermanhomecoming");
  const movie = buildMediaAggregationIdentity({ Type: "Movie", Name: "Spider-Man", ProductionYear: 2017, ProviderIds: { Tmdb: "10", Imdb: "tt10" } });
  const conflictingMovie = buildMediaAggregationIdentity({ Type: "Movie", Name: "Spider Man", ProductionYear: 2017, ProviderIds: { Tmdb: "99", Imdb: "tt10" } });
  assert.equal(matchMediaAggregationIdentities(movie, conflictingMovie, "title_year"), null);
  const titleMovie = buildMediaAggregationIdentity({ Type: "Movie", Name: "SPIDER MAN", ProductionYear: 2017 });
  assert.equal(matchMediaAggregationIdentities(movie, titleMovie, "title_year")?.status, "matched_title_year");
  assert.equal(matchMediaAggregationIdentities(movie, buildMediaAggregationIdentity({ Type: "Movie", Name: "Spider Man", ProductionYear: 2018 }), "title_year"), null);
  assert.equal(matchMediaAggregationIdentities(movie, buildMediaAggregationIdentity({ Type: "Series", Name: "Spider Man", ProductionYear: 2017 }), "title_year"), null);

  const primaryEpisode = buildMediaAggregationIdentity({ Type: "Episode", ParentIndexNumber: 2, IndexNumber: 4, IndexNumberEnd: 5, SeriesId: "s1" }, {
    Type: "Series", Name: "The Show", ProductionYear: 2020, ProviderIds: { Tmdb: "22" }
  });
  const candidateEpisode = buildMediaAggregationIdentity({ Type: "Episode", ParentIndexNumber: 2, IndexNumber: 4, IndexNumberEnd: 5, SeriesId: "s2" }, {
    Type: "Series", Name: "Other title", ProductionYear: 2020, ProviderIds: { Tmdb: "22" }
  });
  assert.equal(matchMediaAggregationIdentities(primaryEpisode, candidateEpisode, "title_year")?.status, "matched_episode");
  const wrongEpisode = { ...candidateEpisode, indexNumber: 6 };
  assert.equal(matchMediaAggregationIdentities(primaryEpisode, wrongEpisode, "title_year"), null);
});

test("media aggregation credentials prefer node usernames and allow empty passwords", () => {
  assert.deepEqual(
    resolveMediaAggregationCredentials({
      mediaAggregationEmbyUsername: "node-user",
      mediaAggregationEmbyPassword: "node-password"
    }, {
      mediaAggregationEmbyUsername: "global-user",
      mediaAggregationEmbyPassword: "global-password"
    }),
    {
      username: "node-user",
      password: "node-password",
      configured: true,
      partial: false,
      source: "node"
    }
  );
  assert.deepEqual(resolveMediaAggregationCredentials({
    mediaAggregationEmbyUsername: "partial-node"
  }, {
    mediaAggregationEmbyUsername: "global-user",
    mediaAggregationEmbyPassword: "global-password"
  }), {
    username: "partial-node",
    password: "",
    configured: true,
    partial: false,
    source: "node"
  });
  assert.equal(resolveMediaAggregationCredentials({
    mediaAggregationEmbyPassword: "orphan-password"
  }, {
    mediaAggregationEmbyUsername: "global-user"
  }).source, "global");
  assert.equal(resolveMediaAggregationCredentials({}, {}).configured, false);
});

test("poster browser bindings expose status separately from authenticated values", () => {
  assert.equal(normalizePosterBrowserOrigin("https://douban.example"), "https://douban.example");
  assert.equal(normalizePosterBrowserOrigin("https://douban.example/base"), "");
  assert.equal(normalizeTmdbBrowserToken("Bearer tmdb-browser-token"), "tmdb-browser-token");
  assert.equal(normalizeTmdbBrowserToken("0123456789abcdef0123456789abcdef"), "");
  assert.deepEqual(buildPosterBrowserConfig({
    TMDB_BROWSER_TOKEN: "tmdb-browser-token",
    DOUBAN_BROWSER_ORIGIN: "https://douban.example",
    DOUBAN_BROWSER_TOKEN: "douban-browser-token"
  }), {
    tmdbTokenConfigured: true,
    tmdbTokenSource: "binding",
    doubanOriginConfigured: true,
    doubanOriginSource: "binding",
    doubanTokenConfigured: true,
    doubanTokenSource: "binding"
  });
  assert.deepEqual(buildPosterBrowserConfig({
    TMDB_BROWSER_TOKEN: "tmdb-browser-token",
    DOUBAN_BROWSER_ORIGIN: "https://douban.example",
    DOUBAN_BROWSER_TOKEN: "douban-browser-token"
  }, {
    tmdbBrowserToken: "saved-tmdb-token",
    doubanBrowserOrigin: "https://saved-douban.example",
    doubanBrowserToken: "saved-douban-token"
  }, true), {
    tmdb: { configured: true, token: "saved-tmdb-token" },
    douban: {
      configured: true,
      origin: "https://saved-douban.example",
      token: "saved-douban-token"
    }
  });
});

test("poster search metadata uses movie and series identities without provider ids", () => {
  assert.deepEqual(buildServerRecordPosterMetadata({
    Id: "movie-1",
    Type: "Movie",
    Name: "千与千寻",
    OriginalTitle: "Spirited Away",
    ProductionYear: 2001,
    ProviderIds: { Tmdb: "129", Imdb: "tt0245429" }
  }), {
    mediaKind: "movie",
    itemType: "movie",
    title: "千与千寻",
    originalTitle: "Spirited Away",
    productionYear: 2001
  });
  assert.deepEqual(buildServerRecordPosterMetadata({
    Id: "episode-1",
    Type: "Episode",
    Name: "第一集",
    SeriesName: "漫长的季节",
    SeriesOriginalTitle: "The Long Season",
    SeriesProductionYear: 2023,
    OriginalTitle: "Episode One",
    ProductionYear: 2026,
    SeriesProviderIds: { Tmdb: "209064" }
  }), {
    mediaKind: "tv",
    itemType: "episode",
    title: "漫长的季节",
    originalTitle: "The Long Season",
    productionYear: 2023
  });
  assert.equal(JSON.stringify(buildServerRecordPosterMetadata({ Type: "Movie", Name: "No IDs" })).includes("provider"), false);
});

test("node summaries preserve credential state without exposing passwords", () => {
  const summary = kernel.buildNodeSummary("backup", {
    displayName: "Backup",
    target: "https://backup.test",
    lines: [{ id: "main", name: "Main", target: "https://backup.test" }],
    activeLineId: "main",
    serverRecordEmbyUsername: "stats-user",
    serverRecordEmbyPassword: "stats-password",
    mediaAggregationEmbyUsername: "node-user",
    mediaAggregationEmbyPassword: "node-password"
  }).summary;
  assert.equal(summary.mediaAggregationEmbyCredentialsConfigured, true);
  assert.equal(summary.mediaAggregationEmbyUsername, undefined);
  assert.equal(summary.mediaAggregationEmbyPassword, undefined);
  assert.equal(summary.serverRecordEmbyUsername, "stats-user");
  assert.equal(summary.serverRecordEmbyCredentialsConfigured, true);
  assert.equal(summary.serverRecordEmbyCredentialSource, "record");
  assert.equal(summary.serverRecordEmbyPassword, undefined);
  const normalizedSummary = kernel.normalizeNodeSummaryIndex([summary]).nodes[0];
  assert.equal(normalizedSummary.mediaAggregationEmbyCredentialsConfigured, true);
  assert.equal(normalizedSummary.serverRecordEmbyCredentialsConfigured, true);
  assert.equal(normalizedSummary.serverRecordEmbyUsername, "stats-user");
  assert.equal(normalizedSummary.serverRecordEmbyCredentialSource, "record");
  assert.equal(normalizedSummary.serverRecordEmbyPassword, undefined);

  const inheritedSummary = kernel.buildNodeSummary("node-credentials", {
    target: "https://node-credentials.test",
    lines: [{ id: "main", target: "https://node-credentials.test" }],
    activeLineId: "main",
    mediaAggregationEmbyUsername: "node-user",
    mediaAggregationEmbyPassword: "node-password"
  }).summary;
  assert.equal(inheritedSummary.serverRecordEmbyUsername, "node-user");
  assert.equal(inheritedSummary.serverRecordEmbyCredentialsConfigured, true);
  assert.equal(inheritedSummary.serverRecordEmbyCredentialSource, "node");
  assert.equal(inheritedSummary.serverRecordEmbyPassword, undefined);
});

test("admin node reads expose credential usernames and password states without passwords", async () => {
  const originalGetNodeForRead = kernel.getNodeForRead;
  const originalGetAdminRevisionsForRead = kernel.getAdminRevisionsForRead;
  kernel.getNodeForRead = async () => ({
    target: "https://backup.test",
    lines: [{ id: "main", target: "https://backup.test" }],
    activeLineId: "main",
    serverRecordEmbyUsername: "stats-user",
    serverRecordEmbyPassword: "stats-password",
    mediaAggregationEmbyUsername: "node-user",
    mediaAggregationEmbyPassword: "node-password"
  });
  kernel.getAdminRevisionsForRead = async () => ({});
  try {
    const response = await adminActions.getNode({ name: "backup" }, {
      env: {},
      ctx: null,
      kv: null,
      db: null
    });
    const payload = await response.json();
    assert.equal(payload.node.mediaAggregationEmbyUsername, "node-user");
    assert.equal(payload.node.mediaAggregationEmbyPassword, undefined);
    assert.equal(payload.node.mediaAggregationEmbyCredentialsConfigured, true);
    assert.equal(payload.node.serverRecordEmbyUsername, "stats-user");
    assert.equal(payload.node.serverRecordEmbyPassword, undefined);
    assert.equal(payload.node.serverRecordEmbyCredentialsConfigured, true);
  } finally {
    kernel.getNodeForRead = originalGetNodeForRead;
    kernel.getAdminRevisionsForRead = originalGetAdminRevisionsForRead;
  }
});

test("server record password reveal returns only the requested effective credential", async () => {
  const originalGetNodeForRead = kernel.getNodeForRead;
  kernel.getNodeForRead = async nodeName => String(nodeName).toLowerCase() === "record-node"
    ? {
        serverRecordEmbyUsername: "record-user",
        serverRecordEmbyPassword: "record-password",
        mediaAggregationEmbyUsername: "node-user",
        mediaAggregationEmbyPassword: "node-password"
      }
    : String(nodeName).toLowerCase() === "inherited-node"
      ? {
          mediaAggregationEmbyUsername: "node-user",
          mediaAggregationEmbyPassword: "node-password"
        }
    : null;
  try {
    const context = { env: { ADMIN_PASS: "admin-password" }, ctx: null, request: null };
    const requiredResponse = await adminActions.getServerRecordCredential({ nodeName: "record-node" }, context);
    assert.equal(requiredResponse.status, 428);
    assert.equal((await requiredResponse.json()).error.code, "RECENT_AUTH_REQUIRED");

    const rejectedResponse = await adminActions.getServerRecordCredential({
      nodeName: "record-node",
      adminPassword: "incorrect"
    }, context);
    assert.equal(rejectedResponse.status, 401);
    assert.equal((await rejectedResponse.json()).error.code, "RECENT_AUTH_FAILED");

    const response = await adminActions.getServerRecordCredential({
      nodeName: "record-node",
      adminPassword: "admin-password"
    }, context);
    const payload = await response.json();
    assert.deepEqual(payload, {
      success: true,
      credential: {
        username: "record-user",
        password: "record-password",
        configured: true,
        source: "record"
      }
    });

    const inheritedResponse = await adminActions.getServerRecordCredential({
      nodeName: "inherited-node",
      adminPassword: "admin-password"
    }, context);
    assert.deepEqual(await inheritedResponse.json(), {
      success: true,
      credential: {
        username: "node-user",
        password: "node-password",
        configured: true,
        source: "node"
      }
    });

    const missingResponse = await adminActions.getServerRecordCredential({
      nodeName: "missing-node",
      adminPassword: "admin-password"
    }, context);
    assert.equal(missingResponse.status, 404);
    assert.equal((await missingResponse.json()).error.code, "NODE_NOT_FOUND");
  } finally {
    kernel.getNodeForRead = originalGetNodeForRead;
  }
});

test("PlaybackInfo rewrite decodes object sources and removes invalid entries before client delivery", () => {
  const result = proxyService.rewritePlaybackInfoPayload(
    {
      proxyPath: "/Items/primary/PlaybackInfo",
      requestUrl: new URL("https://proxy.test/node/Items/primary/PlaybackInfo"),
      rawRequestUrl: new URL("https://proxy.test/node/Items/primary/PlaybackInfo"),
      nodeName: "node",
      nodeKey: "secret",
      entryMode: "kv_route"
    },
    {
      MediaSources: [
        JSON.stringify({ Id: "encoded-source" }),
        { Id: "valid-source", Path: "/Videos/primary/stream" },
        "invalid-source"
      ]
    },
    new URL("https://upstream.test"),
    new URL("https://upstream.test/Items/primary/PlaybackInfo")
  );

  assert.equal(result.rewriteState, "applied");
  assert.deepEqual(result.payload.MediaSources.map(source => source.Id), ["encoded-source", "valid-source"]);
  assert.ok(result.payload.MediaSources.every(source => source && typeof source === "object" && !Array.isArray(source)));
});

test("media aggregation appends matched backup sources without a database mapping", async () => {
  const originalGetNode = kernel.getNode;
  const originalAuth = proxyService.getMediaAggregationAuth;
  const originalFetchJson = proxyService.fetchMediaAggregationJson;
  const originalRewrite = proxyService.rewritePlaybackInfoPayload;
  const backupNode = {
    name: "backup",
    secret: "backup-secret",
    entryMode: "kv_route",
    displayName: "备服",
    lines: [{ id: "main", target: "https://backup.test" }],
    activeLineId: "main"
  };
  kernel.getNode = async () => backupNode;
  proxyService.getMediaAggregationAuth = async () => ({ token: "backup-token", userId: "backup-user" });
  proxyService.fetchMediaAggregationJson = async (_execution, _node, proxyPath) => {
    if (String(proxyPath).endsWith("/Items")) {
      return {
        payload: {
          Items: [{
            Id: "98765",
            Type: "Movie",
            Name: "Example Movie",
            ProductionYear: 2024,
            ProviderIds: { Tmdb: "123" },
            MediaSources: [{ Id: "abc", Path: "https://backup.test/Videos/98765/stream" }]
          }]
        },
        targetRecord: { targetUrl: new URL("https://backup.test") },
        finalUrl: new URL("https://backup.test/Items")
      };
    }
    return null;
  };
  proxyService.rewritePlaybackInfoPayload = (execution, payload) => ({
    payload: {
      ...payload,
      MediaSources: payload.MediaSources.map(source => ({
        ...source,
        DirectStreamUrl: `/backup/${execution.nodeKey}/Videos/98765/stream`
      }))
    },
    rewriteState: "applied"
  });
  try {
    const execution = {
      nodeName: "primary",
      env: { ENI_KV: {}, JWT_SECRET: "aggregation-signing-secret" },
      ctx: null,
      finalOrigin: "*",
      currentConfig: {
        mediaAggregationNodes: ["primary", "backup"],
        mediaAggregationEmbyUsername: "fixed-user",
        mediaAggregationEmbyPassword: "fixed-password"
      },
      proxyPath: "/Items/1/PlaybackInfo",
      requestUrl: new URL("https://worker.test/primary/Items/1/PlaybackInfo"),
      rawRequestUrl: new URL("https://worker.test/primary/Items/1/PlaybackInfo")
    };
    const result = await proxyService.aggregateMediaSources(
      execution,
      { Type: "Movie", Name: "Example Movie", ProductionYear: 2024, ProviderIds: { Tmdb: "123" }, MediaSources: [{ Id: "main" }] },
      { activeTargetBase: new URL("https://primary.test") }
    );
    assert.equal(result.state, "applied");
    assert.equal(result.payload.MediaSources.length, 2);
    const parsedSource = parseMediaAggregationSourceId(result.payload.MediaSources[1].Id);
    assert.equal(parsedSource.version, "AGG2");
    assert.equal(parsedSource.nodeName, "backup");
    assert.equal(parsedSource.itemId, "98765");
    assert.equal(parsedSource.mediaSourceId, "abc");
    assert.equal(await verifyMediaAggregationSourceSignature(parsedSource, "aggregation-signing-secret"), true);
  } finally {
    kernel.getNode = originalGetNode;
    proxyService.getMediaAggregationAuth = originalAuth;
    proxyService.fetchMediaAggregationJson = originalFetchJson;
    proxyService.rewritePlaybackInfoPayload = originalRewrite;
  }
});

test("media aggregation logs into a backup with an account-only global credential", async () => {
  isolateState.MediaAggregationAuthCache.clear();
  const requests = [];
  const node = {
    name: "backup",
    target: "https://backup.test",
    lines: [{ id: "main", target: "https://backup.test" }],
    activeLineId: "main",
    headers: {}
  };
  const execution = {
    currentConfig: {
      mediaAggregationEmbyUsername: "fixed-user"
    },
    upstreamTimeoutMs: 1000,
    request: new Request("https://worker.test/Items/1/PlaybackInfo", {
      headers: { "X-Emby-Token": "client-token" }
    }),
    requestUrl: new URL("https://worker.test/Items/1/PlaybackInfo")
  };
  await withWorkerGlobals({
    fetch: async (input, init = {}) => {
      requests.push({ url: String(input), init });
      return new Response(JSON.stringify({ AccessToken: "backup-token", User: { Id: "backup-user" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }, async () => {
    const auth = await proxyService.getMediaAggregationAuth(execution, "backup", node, "");
    assert.equal(auth.token, "backup-token");
    assert.equal(auth.userId, "backup-user");
  });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://backup.test/Users/AuthenticateByName");
  assert.deepEqual(JSON.parse(String(requests[0].init.body)), {
    Username: "fixed-user",
    Pw: ""
  });
  assert.equal(new Headers(requests[0].init.headers).get("X-Emby-Token"), null);
  isolateState.MediaAggregationAuthCache.clear();
});

test("media aggregation login prefers fixed credentials stored on the backup node", async () => {
  isolateState.MediaAggregationAuthCache.clear();
  const requests = [];
  const node = {
    name: "backup",
    target: "https://backup.test",
    lines: [{ id: "main", target: "https://backup.test" }],
    activeLineId: "main",
    headers: {},
    mediaAggregationEmbyUsername: "node-user",
    mediaAggregationEmbyPassword: " node-password "
  };
  const execution = {
    currentConfig: {
      mediaAggregationEmbyUsername: "global-user",
      mediaAggregationEmbyPassword: "global-password"
    },
    upstreamTimeoutMs: 1000,
    request: new Request("https://worker.test/Items/1/PlaybackInfo"),
    requestUrl: new URL("https://worker.test/Items/1/PlaybackInfo")
  };
  await withWorkerGlobals({
    fetch: async (input, init = {}) => {
      requests.push({ url: String(input), init });
      return new Response(JSON.stringify({ AccessToken: "backup-token", User: { Id: "backup-user" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }, async () => {
    assert.ok(await proxyService.getMediaAggregationAuth(execution, "backup", node, ""));
  });
  assert.deepEqual(JSON.parse(String(requests[0].init.body)), {
    Username: "node-user",
    Pw: " node-password "
  });
  isolateState.MediaAggregationAuthCache.clear();
});

test("media aggregation routes a magic PlaybackInfo source to the backup item", async () => {
  const originalGetNode = kernel.getNode;
  const originalAuth = proxyService.getMediaAggregationAuth;
  const originalValidateSource = proxyService.validateMediaAggregationPlaybackSource;
  const originalPrepareExecutionContext = proxyService.prepareExecutionContext;
  const originalParseTargetRecords = proxyService.parseTargetRecords;
  const originalBuildProxyRequestState = proxyService.buildProxyRequestState;
  const backupNode = {
    name: "backup",
    secret: "backup-secret",
    entryMode: "kv_route",
    lines: [{ id: "main", target: "https://backup.test" }],
    activeLineId: "main"
  };
  const magicId = buildMediaAggregationSourceId("backup", "98765", "abc");
  const requestUrl = new URL("https://worker.test/primary/Items/123/PlaybackInfo");
  requestUrl.searchParams.set("ItemId", "123");
  requestUrl.searchParams.set("MediaSourceId", magicId);
  const request = new Request(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Emby-Token": "client-token"
    },
    body: JSON.stringify({ ItemId: "123", MediaSourceId: magicId })
  });
  let preparedRequest = null;
  let preparedPath = "";
  let routedBodyText = "";
  kernel.getNode = async () => backupNode;
  proxyService.getMediaAggregationAuth = async () => ({ token: "backup-token", userId: "backup-user" });
  proxyService.validateMediaAggregationPlaybackSource = async (_execution, parsedSource) => ({
    ok: true,
    auth: { token: "backup-token", userId: "backup-user" },
    targetRecord: {
      targetUrl: new URL("https://backup.test"),
      originText: "https://backup.test"
    },
    source: { ...parsedSource, version: "AGG1", identityHash: "legacy_revalidated_identity" },
    status: "legacy_revalidated"
  });
  proxyService.prepareExecutionContext = async (nextRequest, node, proxyPath, nodeName, nodeKey, env, ctx, options) => {
    preparedRequest = nextRequest;
    preparedPath = proxyPath;
    return {
      request: nextRequest,
      requestUrl: options.requestUrl,
      rawRequestUrl: options.requestUrl,
      requestMethod: nextRequest.method,
      node,
      nodeName,
      nodeKey,
      proxyPath,
      env,
      ctx,
      finalOrigin: "*",
      clientIp: "127.0.0.1",
      requestTraits: { isPlaybackInfoRequest: true },
      forceH1: false,
      effectiveRealClientIpMode: "forward",
      effectiveMediaAuthMode: "auto"
    };
  };
  proxyService.parseTargetRecords = () => ({
    targetRecords: [{
      targetUrl: new URL("https://backup.test"),
      originText: "https://backup.test",
      normalizedBasePath: "",
      absoluteBasePrefix: "https://backup.test"
    }],
    invalidResponse: null
  });
  proxyService.buildProxyRequestState = async (nextRequest) => {
    routedBodyText = await nextRequest.clone().text();
    return {
      newHeaders: new Headers(nextRequest.headers),
      transportTemplate: {}
    };
  };
  try {
    const route = await proxyService.resolveMediaAggregationPlaybackRoute({
      request,
      requestUrl,
      rawRequestUrl: requestUrl,
      requestMethod: "POST",
      requestTraits: { isPlaybackInfoRequest: true },
      effectivePlaybackInfoMode: "rewrite",
      currentConfig: { mediaAggregationNodes: ["primary", "backup"] },
      nodeName: "primary",
      proxyPath: "/Items/123/PlaybackInfo",
      env: {},
      ctx: null,
      finalOrigin: "*"
    }, {
      preparedBodyMode: "buffered",
      preparedBodyText: JSON.stringify({ ItemId: "123", MediaSourceId: magicId }),
      newHeaders: new Headers({ "Content-Type": "application/json" })
    });
    assert.ok(route);
    assert.equal(preparedPath, "/Items/98765/PlaybackInfo");
    assert.equal(preparedRequest.url.includes("ItemId=98765"), true);
    assert.equal(preparedRequest.url.includes("MediaSourceId=abc"), true);
    assert.deepEqual(JSON.parse(routedBodyText), { ItemId: "98765", MediaSourceId: "abc" });
    assert.equal(route.execution.mediaAggregationRouted, true);
    assert.equal(route.transport.newHeaders.get("X-Emby-Token"), "backup-token");
  } finally {
    kernel.getNode = originalGetNode;
    proxyService.getMediaAggregationAuth = originalAuth;
    proxyService.validateMediaAggregationPlaybackSource = originalValidateSource;
    proxyService.prepareExecutionContext = originalPrepareExecutionContext;
    proxyService.parseTargetRecords = originalParseTargetRecords;
    proxyService.buildProxyRequestState = originalBuildProxyRequestState;
  }
});

test("media aggregation mirrors progress to the backup with real source IDs", async () => {
  const originalGetNode = kernel.getNode;
  const originalAuth = proxyService.getMediaAggregationAuth;
  const originalParseTargetRecords = proxyService.parseTargetRecords;
  const originalFetch = proxyService.performFetchWithTimeout;
  const backupNode = {
    name: "backup",
    headers: {},
    lines: [{ id: "main", target: "https://backup.test" }],
    activeLineId: "main"
  };
  const matchHash = await buildMediaAggregationMatchFingerprintHash({ fingerprint: { type: "movie", provider: { key: "tmdb", value: "123" } } });
  const magicId = await buildMediaAggregationSourceIdV2("progress-signing-secret", "backup", "98765", "abc", matchHash);
  const bodyText = JSON.stringify({ ItemId: "123", MediaSourceId: magicId, PositionTicks: 42 });
  const pending = [];
  let mirroredRequest = null;
  kernel.getNode = async () => backupNode;
  proxyService.getMediaAggregationAuth = async () => ({ token: "backup-token", userId: "backup-user" });
  proxyService.parseTargetRecords = () => ({
    targetRecords: [{
      targetUrl: new URL("https://backup.test"),
      originText: "https://backup.test",
      normalizedBasePath: "",
      absoluteBasePrefix: "https://backup.test"
    }]
  });
  proxyService.performFetchWithTimeout = async (targetUrl, buildOptions) => {
    mirroredRequest = { url: targetUrl.toString(), options: await buildOptions() };
    return {
      response: new Response(null, { status: 204 }),
      finalUrl: targetUrl,
      releaseFetchController() {}
    };
  };
  try {
    const requestUrl = new URL("https://worker.test/primary/Sessions/Playing/Progress");
    const request = new Request(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Emby-Token": "client-token" },
      body: bodyText
    });
    await proxyService.maybeScheduleMediaAggregationProgressMirror({
      request,
      requestUrl,
      requestMethod: "POST",
      requestTraits: { isPlaybackSessionControlRequest: true },
      currentConfig: {
        mediaAggregationNodes: ["primary", "backup"],
        mediaAggregationBidirectionalProgressEnabled: true
      },
      nodeName: "primary",
      proxyPath: "/Sessions/Playing/Progress",
      env: { JWT_SECRET: "progress-signing-secret" },
      ctx: { waitUntil(task) { pending.push(task); } },
      finalOrigin: "*",
      upstreamTimeoutMs: 1000
    }, {
      preparedBodyMode: "buffered",
      preparedBodyText: bodyText,
      newHeaders: new Headers({ "Content-Type": "application/json" })
    });
    await Promise.all(pending);
    assert.ok(mirroredRequest);
    const mirroredUrl = new URL(mirroredRequest.url);
    assert.equal(mirroredUrl.pathname, "/Sessions/Playing/Progress");
    assert.equal(mirroredUrl.searchParams.get("ItemId"), "98765");
    assert.equal(mirroredUrl.searchParams.get("MediaSourceId"), "abc");
    assert.equal(mirroredUrl.searchParams.get("UserId"), "backup-user");
    assert.equal(new Headers(mirroredRequest.options.headers).get("X-Emby-Token"), "backup-token");
    assert.deepEqual(JSON.parse(mirroredRequest.options.body), {
      ItemId: "98765",
      MediaSourceId: "abc",
      PositionTicks: 42
    });
  } finally {
    kernel.getNode = originalGetNode;
    proxyService.getMediaAggregationAuth = originalAuth;
    proxyService.parseTargetRecords = originalParseTargetRecords;
    proxyService.performFetchWithTimeout = originalFetch;
  }
});

test("media aggregation foreground collection uses first result plus grace and returns all failures early", async () => {
  const pending = [];
  const startedAt = Date.now();
  const collected = await proxyService.collectMediaAggregationResults([
    async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return { nodeName: "fast", status: "matched_provider", sources: [{ Id: "fast" }] };
    },
    async () => {
      await new Promise(resolve => setTimeout(resolve, 55));
      return { nodeName: "slow", status: "matched_provider", sources: [{ Id: "slow" }] };
    }
  ], {
    nodeNames: ["fast", "slow"],
    firstResultTimeoutMs: 30,
    gracePeriodMs: 15,
    hardDeadlineAt: Date.now() + 200,
    ctx: { waitUntil(task) { pending.push(task); } }
  });
  assert.equal(collected.foregroundResults.some(result => result.nodeName === "fast"), true);
  assert.equal(collected.foregroundResults.some(result => result.nodeName === "slow"), false);
  assert.equal(collected.pendingCount, 1);
  assert.ok(Date.now() - startedAt < 50);
  await Promise.all(pending);

  const failedAt = Date.now();
  const allFailed = await proxyService.collectMediaAggregationResults([
    async () => ({ nodeName: "a", status: "auth_failed", sources: [] }),
    async () => ({ nodeName: "b", status: "no_match", sources: [] })
  ], { firstResultTimeoutMs: 1000, gracePeriodMs: 50, hardDeadlineAt: Date.now() + 1000 });
  assert.equal(allFailed.pendingCount, 0);
  assert.ok(Date.now() - failedAt < 100);
});

test("media aggregation retries a node's next line after the active line fails", async () => {
  const originalGetNode = kernel.getNode;
  const originalAuth = proxyService.getMediaAggregationAuth;
  const originalFind = proxyService.findMediaAggregationCandidate;
  const originalBuild = proxyService.buildMediaAggregationInjectedSources;
  const attemptedTargets = [];
  kernel.getNode = async () => ({
    name: "backup",
    lines: [
      { id: "active", target: "https://offline.test" },
      { id: "fallback", target: "https://online.test" }
    ],
    activeLineId: "active"
  });
  proxyService.getMediaAggregationAuth = async (execution, _name, _node, _prefix, targetRecord) => {
    attemptedTargets.push(targetRecord.targetUrl.hostname);
    if (targetRecord.targetUrl.hostname === "offline.test") {
      execution.mediaAggregationLastAuthStatus = "network_error";
      return null;
    }
    return { token: "token", userId: "user", targetRecord };
  };
  proxyService.findMediaAggregationCandidate = async () => ({
    ok: true,
    item: { Id: "item-2", Type: "Movie" },
    identity: buildMediaAggregationIdentity({ Type: "Movie", ProviderIds: { Tmdb: "2" } }),
    match: { status: "matched_provider", fingerprint: { type: "movie", provider: { key: "tmdb", value: "2" } } }
  });
  proxyService.buildMediaAggregationInjectedSources = async () => ({
    ok: true,
    status: "matched_provider",
    identityHash: "identity_hash_for_fallback",
    sources: [{ Id: "signed-source" }]
  });
  try {
    const result = await proxyService.aggregateMediaAggregationNode({
      env: {},
      ctx: null,
      finalOrigin: "*",
      requestUrl: new URL("https://worker.test/primary/Items/1/PlaybackInfo"),
      rawRequestUrl: new URL("https://worker.test/primary/Items/1/PlaybackInfo")
    }, "backup", buildMediaAggregationIdentity({ Type: "Movie", ProviderIds: { Tmdb: "2" } }), "primary-digest", "", "strict");
    assert.deepEqual(attemptedTargets, ["offline.test", "online.test"]);
    assert.equal(result.status, "matched_provider");
    assert.equal(result.sources.length, 1);
  } finally {
    kernel.getNode = originalGetNode;
    proxyService.getMediaAggregationAuth = originalAuth;
    proxyService.findMediaAggregationCandidate = originalFind;
    proxyService.buildMediaAggregationInjectedSources = originalBuild;
  }
});

test("partial aggregation responses skip PlaybackInfo caching and instance mappings stay compact", async () => {
  isolateState.PlaybackInfoResponseCache.clear();
  isolateState.MediaAggregationInstanceMap.clear();
  const execution = {
    requestTraits: { isPlaybackInfoRequest: true },
    requestMethod: "GET",
    playbackInfoCacheEnabled: true,
    playbackInfoCacheTtlSec: 60,
    playbackInfoCacheKey: "partial-cache-key",
    mediaAggregationCacheable: false
  };
  assert.equal(await proxyService.storePlaybackInfoResponseCache(execution, new Response("{}", { headers: { "Content-Type": "application/json" } })), false);
  assert.equal(isolateState.PlaybackInfoResponseCache.size, 0);
  assert.equal(execution.playbackInfoCacheState, "skip_partial_aggregation");

  for (let index = 0; index < 70; index += 1) {
    proxyService.cacheMediaAggregationInstance(`primary-${index}`, `node-${index}`, `revision-${index}`, `item-${index}`, `hash-${index}`, "matched_provider");
  }
  assert.equal(isolateState.MediaAggregationInstanceMap.size, Config.Defaults.MediaAggregationInstanceMapMax);
  assert.doesNotMatch(JSON.stringify([...isolateState.MediaAggregationInstanceMap.values()]), /token|password|https?:\/\//i);
  isolateState.MediaAggregationInstanceMap.clear();
});

test("tampered AGG2 PlaybackInfo selections are cleared before primary fallback", async () => {
  const originalGetNode = kernel.getNode;
  const identityHash = await buildMediaAggregationMatchFingerprintHash({ fingerprint: { type: "movie", provider: { key: "tmdb", value: "123" } } });
  const validId = await buildMediaAggregationSourceIdV2("valid-secret", "backup", "98765", "abc", identityHash);
  const tamperedId = `${validId.slice(0, -1)}${validId.endsWith("A") ? "B" : "A"}`;
  const requestUrl = new URL("https://worker.test/primary/Items/123/PlaybackInfo");
  requestUrl.searchParams.set("MediaSourceId", tamperedId);
  const bodyText = JSON.stringify({ ItemId: "123", MediaSourceId: tamperedId });
  const transport = {
    preparedBodyMode: "buffered",
    preparedBodyText: bodyText,
    preparedBody: new TextEncoder().encode(bodyText),
    newHeaders: new Headers({ "Content-Type": "application/json" }),
    transportTemplate: { baseHeaderEntries: [] }
  };
  kernel.getNode = async () => ({ name: "backup", lines: [{ id: "main", target: "https://backup.test" }], activeLineId: "main" });
  try {
    const route = await proxyService.resolveMediaAggregationPlaybackRoute({
      request: new Request(requestUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: bodyText }),
      requestUrl,
      rawRequestUrl: requestUrl,
      requestMethod: "POST",
      requestTraits: { isPlaybackInfoRequest: true },
      effectivePlaybackInfoMode: "rewrite",
      currentConfig: { mediaAggregationNodes: ["primary", "backup"] },
      nodeName: "primary",
      node: { lines: [{ id: "main", target: "https://primary.test" }], activeLineId: "main" },
      proxyPath: "/Items/123/PlaybackInfo",
      env: { JWT_SECRET: "valid-secret" },
      ctx: null,
      finalOrigin: "*"
    }, transport);
    assert.equal(route, null);
    assert.equal(requestUrl.searchParams.has("MediaSourceId"), false);
    assert.deepEqual(JSON.parse(transport.preparedBodyText), { ItemId: "123" });
  } finally {
    kernel.getNode = originalGetNode;
  }
});

test("media aggregation JSON requests classify unsupported, retryable, oversized, and invalid responses", async () => {
  const originalFetch = proxyService.performFetchWithTimeout;
  const responses = [
    new Response("{}", { status: 400, headers: { "Content-Type": "application/json" } }),
    new Response("{}", { status: 503, headers: { "Content-Type": "application/json" } }),
    new Response("not-json", { status: 200, headers: { "Content-Type": "application/json" } }),
    new Response("x".repeat(Config.Defaults.MediaAggregationResponseMaxBytes + 1), { status: 200, headers: { "Content-Type": "application/json" } })
  ];
  proxyService.performFetchWithTimeout = async (targetUrl) => ({
    response: responses.shift(),
    finalUrl: targetUrl,
    releaseFetchController() {}
  });
  const execution = {
    request: new Request("https://worker.test/primary/Items"),
    requestUrl: new URL("https://worker.test/primary/Items"),
    finalOrigin: "*",
    upstreamTimeoutMs: 1000
  };
  const node = { headers: {}, lines: [{ id: "main", target: "https://backup.test" }], activeLineId: "main" };
  try {
    const unsupported = await proxyService.fetchMediaAggregationJson(execution, node, "/Items", "");
    const retryable = await proxyService.fetchMediaAggregationJson(execution, node, "/Items", "");
    const invalid = await proxyService.fetchMediaAggregationJson(execution, node, "/Items", "");
    const oversized = await proxyService.fetchMediaAggregationJson(execution, node, "/Items", "");
    assert.equal(unsupported.status, "query_unsupported");
    assert.equal(retryable.status, "network_error");
    assert.equal(retryable.retryable, true);
    assert.equal(invalid.status, "invalid_json");
    assert.equal(oversized.status, "response_too_large");
  } finally {
    proxyService.performFetchWithTimeout = originalFetch;
  }
});

test("AGG2 identity drift is rejected while a legacy source requires live revalidation", async () => {
  const originalPrimary = proxyService.resolveMediaAggregationPrimaryRouteIdentity;
  const originalAuth = proxyService.getMediaAggregationAuth;
  const originalItemIdentity = proxyService.fetchMediaAggregationItemIdentity;
  const primaryIdentity = buildMediaAggregationIdentity({ Type: "Movie", Name: "Primary", ProductionYear: 2024, ProviderIds: { Tmdb: "123" } });
  const validCandidate = buildMediaAggregationIdentity({ Type: "Movie", Name: "Backup", ProductionYear: 2024, ProviderIds: { Tmdb: "123" } });
  const driftedCandidate = buildMediaAggregationIdentity({ Type: "Movie", Name: "Backup", ProductionYear: 2024, ProviderIds: { Tmdb: "999" } });
  const match = matchMediaAggregationIdentities(primaryIdentity, validCandidate, "strict");
  const identityHash = await buildMediaAggregationMatchFingerprintHash(match);
  const signedId = await buildMediaAggregationSourceIdV2("identity-secret", "backup", "98765", "abc", identityHash);
  const targetRecord = createTargetRecord("https://backup.test");
  proxyService.resolveMediaAggregationPrimaryRouteIdentity = async () => primaryIdentity;
  proxyService.getMediaAggregationAuth = async () => ({ token: "token", userId: "user", targetRecord });
  proxyService.fetchMediaAggregationItemIdentity = async () => ({
    ok: true,
    item: { Id: "98765", MediaSources: [{ Id: "abc" }] },
    identity: driftedCandidate
  });
  const execution = {
    env: { JWT_SECRET: "identity-secret" },
    currentConfig: { mediaAggregationMatchMode: "strict" },
    node: { lines: [{ id: "main", target: "https://primary.test" }], activeLineId: "main" },
    proxyPath: "/Items/123/PlaybackInfo",
    finalOrigin: "*"
  };
  const targetNode = { lines: [{ id: "main", target: "https://backup.test" }], activeLineId: "main" };
  try {
    const drifted = await proxyService.validateMediaAggregationPlaybackSource(execution, parseMediaAggregationSourceId(signedId), "123", targetNode);
    assert.equal(drifted.ok, false);
    proxyService.fetchMediaAggregationItemIdentity = async () => ({
      ok: true,
      item: { Id: "98765", MediaSources: [{ Id: "abc" }] },
      identity: validCandidate
    });
    const legacy = await proxyService.validateMediaAggregationPlaybackSource(
      execution,
      parseMediaAggregationSourceId(buildMediaAggregationSourceId("backup", "98765", "abc")),
      "123",
      targetNode
    );
    assert.equal(legacy.ok, true);
    assert.equal(legacy.status, "legacy_revalidated");
  } finally {
    proxyService.resolveMediaAggregationPrimaryRouteIdentity = originalPrimary;
    proxyService.getMediaAggregationAuth = originalAuth;
    proxyService.fetchMediaAggregationItemIdentity = originalItemIdentity;
  }
});

test("PlaybackInfo aggregation cache identity changes with every pool member revision", async () => {
  const originalGetNodesList = cachePort.getNodesList;
  let backupRevision = "backup-r1";
  cachePort.getNodesList = async () => [
    { name: "primary", cacheRevision: "primary-r1" },
    { name: "backup", cacheRevision: backupRevision }
  ];
  const buildExecution = () => ({
    env: {},
    ctx: null,
    nodeName: "primary",
    nodeDerivedCacheRevision: "primary-r1",
    requestTraits: { isPlaybackInfoRequest: true },
    playbackInfoCacheEnabled: true,
    playbackInfoCacheTtlSec: 60,
    requestMethod: "GET",
    proxyPath: "/Items/123/PlaybackInfo",
    requestUrl: new URL("https://worker.test/primary/Items/123/PlaybackInfo"),
    request: new Request("https://worker.test/primary/Items/123/PlaybackInfo"),
    effectivePlaybackInfoMode: "rewrite",
    playbackInfoRewriteUrlMode: "relative",
    currentConfig: { mediaAggregationNodes: ["primary", "backup"], mediaAggregationMatchMode: "title_year" }
  });
  try {
    const first = buildExecution();
    await proxyService.prepareMediaAggregationPlaybackInfoCacheRevision(first);
    const firstKey = proxyService.buildPlaybackInfoCacheKey(first);
    backupRevision = "backup-r2";
    const second = buildExecution();
    await proxyService.prepareMediaAggregationPlaybackInfoCacheRevision(second);
    const secondKey = proxyService.buildPlaybackInfoCacheKey(second);
    assert.notEqual(firstKey, secondKey);
  } finally {
    cachePort.getNodesList = originalGetNodesList;
  }
});

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
  serializeBoundedLogDetailJson,
  getRuntimeConfig,
  invalidateRuntimeConfigCache,
  invalidateNodesRevisionCache,
  buildResolvedAdminIndexState,
  buildAdminLocalIndexUploadRecord,
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
  renderAdminLoginPage,
  renderAdminPage,
  isAcceptedAdminHtmlDocumentContentType,
  isMutableJsdelivrGithubAssetUrl,
  renderAdminReleaseVendorAsset,
  isAdminWarmRoute,
  warmAdminReleaseVendorEntries,
  buildAdminWarmSubrequest,
  isAdminWarmResponseSuccessful,
  buildDailyTelegramSummaryMessage,
  buildServerRecordExpiry,
  getDueScheduledClockSlots
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

test("server record expiry prefers manual dates and derives calendar-safe automatic dates", () => {
  const config = { serverRecordExpiryDays: 30, scheduleUtcOffsetMinutes: 480 };

  assert.deepEqual(
    buildServerRecordExpiry(
      { expiresAt: "2027-02-01" },
      "2026-12-31T20:00:00.000Z",
      config,
      new Date("2027-01-01T04:00:00.000Z")
    ),
    { enabled: true, state: "valid", daysRemaining: 31, expiresAt: "2027-02-01", source: "fixed", mode: "fixed", expiryDays: null }
  );

  assert.deepEqual(
    buildServerRecordExpiry(
      { expiryEnabled: true, expiryMode: "rolling", expiryDays: 30 },
      "2026-12-31T20:00:00.000Z",
      config,
      new Date("2027-01-01T04:00:00.000Z")
    ),
    { enabled: true, state: "valid", daysRemaining: 30, expiresAt: "2027-01-31", source: "last_watched", mode: "rolling", expiryDays: 30 }
  );

  assert.deepEqual(
    buildServerRecordExpiry({ expiresAt: "2027-01-01" }, "", config, new Date("2027-01-01T04:00:00.000Z")),
    { enabled: true, state: "expiring", daysRemaining: 0, expiresAt: "2027-01-01", source: "fixed", mode: "fixed", expiryDays: null }
  );
  assert.equal(
    buildServerRecordExpiry({ expiresAt: "2026-12-31" }, "", config, new Date("2027-01-01T04:00:00.000Z")).daysRemaining,
    -1
  );
  assert.deepEqual(
    buildServerRecordExpiry({ expiryEnabled: true, expiresAt: "invalid" }, "not-a-date", config, new Date("2027-01-01T04:00:00.000Z")),
    { enabled: true, state: "unset", daysRemaining: null, expiresAt: "", source: "unset", mode: "rolling", expiryDays: 30 }
  );
  assert.deepEqual(
    buildServerRecordExpiry({ expiryMode: "rolling", expiryDays: 30 }, "2026-12-31T20:00:00.000Z", config),
    { enabled: false, state: "disabled", daysRemaining: null, expiresAt: "", source: "disabled", mode: "rolling", expiryDays: 30 }
  );

  const rolling45 = buildServerRecordExpiry(
    { expiryEnabled: true, expiryMode: "rolling", expiryDays: 45, expiresAt: "2027-01-02" },
    "2026-12-31T20:00:00.000Z",
    config,
    new Date("2027-01-01T04:00:00.000Z")
  );
  assert.equal(rolling45.expiresAt, "2027-02-15");
  assert.equal(rolling45.expiryDays, 45);

  const fixedAfterLaterPlayback = buildServerRecordExpiry(
    { expiryMode: "fixed", expiresAt: "2027-02-01" },
    "2027-01-20T20:00:00.000Z",
    config,
    new Date("2027-01-21T04:00:00.000Z")
  );
  assert.equal(fixedAfterLaterPlayback.expiresAt, "2027-02-01");
  assert.equal(fixedAfterLaterPlayback.mode, "fixed");
});

test("daily server expiry slot is due once per configured local day", () => {
  const now = new Date("2026-07-21T16:00:00.000Z");
  const first = getDueScheduledClockSlots({}, ["00:00"], 480, now);
  assert.equal(first.due, true);
  assert.deepEqual(first.dueSlots, ["00:00"]);

  const repeated = getDueScheduledClockSlots({
    fixedQueue: { localDateKey: first.context.dateKey, executedSlots: ["00:00"] }
  }, ["00:00"], 480, new Date("2026-07-22T03:00:00.000Z"));
  assert.equal(repeated.due, false);
  assert.equal(repeated.reason, "slot_already_processed");
});

test("server expiry Telegram milestones are deduplicated and playback changes renew signatures", async () => {
  const originalMethods = {
    getServerRecordsSnapshotPayload: kernel.getServerRecordsSnapshotPayload,
    getOpsStatusPayloadFromDb: kernel.getOpsStatusPayloadFromDb,
    putOpsStatusPayloadToDb: kernel.putOpsStatusPayloadToDb,
    sendTelegramMessage: kernel.sendTelegramMessage
  };
  let storedState = null;
  let sendCount = 0;
  let rollingWatchedRevision = "2026-06-28T00:00:00.000Z";
  let fixedWatchedRevision = "2026-06-27T00:00:00.000Z";
  try {
    kernel.getServerRecordsSnapshotPayload = async () => ({
      records: [7, 3, 1, 0].map((days, index) => ({
        nodeName: `node-${days}`,
        displayName: `Node ${days}`,
        watch: {
          lastWatchedAt: index === 0
            ? fixedWatchedRevision
            : (index === 1 ? rollingWatchedRevision : `2026-06-${20 + index}T00:00:00.000Z`)
        },
        expiry: {
          daysRemaining: days,
          expiresAt: `2026-07-${String(29 - index).padStart(2, "0")}`,
          source: index === 0 ? "fixed" : "last_watched",
          mode: index === 0 ? "fixed" : "rolling"
        }
      }))
    });
    kernel.getOpsStatusPayloadFromDb = async () => storedState;
    kernel.putOpsStatusPayloadToDb = async (_db, _scope, payload) => {
      storedState = payload;
      return true;
    };
    kernel.sendTelegramMessage = async () => {
      sendCount += 1;
      return { ok: true };
    };

    const env = { DB: {}, ENI_KV: {} };
    const config = {
      tgServerExpiryWarningEnabled: true,
      tgServerExpiryWarningDays: [7, 3, 1, 0],
      tgBotToken: "token",
      tgChatId: "chat"
    };
    const first = await kernel.maybeSendServerExpiryWarnings(env, { config });
    assert.equal(first.sent, true);
    assert.equal(first.issueCount, 4);
    assert.equal(sendCount, 1);

    const repeated = await kernel.maybeSendServerExpiryWarnings(env, { config });
    assert.equal(repeated.sent, false);
    assert.equal(repeated.reason, "already_sent");
    assert.equal(sendCount, 1);

    fixedWatchedRevision = "2026-06-29T00:00:00.000Z";
    rollingWatchedRevision = "2026-06-29T00:00:00.000Z";
    const renewed = await kernel.maybeSendServerExpiryWarnings(env, { config });
    assert.equal(renewed.sent, true);
    assert.equal(renewed.issueCount, 1);
    assert.equal(sendCount, 2);

    kernel.sendTelegramMessage = async () => {
      throw new Error("telegram unavailable");
    };
    rollingWatchedRevision = "2026-06-30T00:00:00.000Z";
    await assert.rejects(
      kernel.maybeSendServerExpiryWarnings(env, { config }),
      /telegram unavailable/
    );
    assert.equal(storedState.signatures.some((signature) => signature.includes(rollingWatchedRevision)), false);
  } finally {
    Object.assign(kernel, originalMethods);
  }
});

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
  const originalBuildDashboardStatsPayload = kernel.buildDashboardStatsPayload;
  const originalGetDashboardMonthlyTrafficPayload = kernel.getDashboardMonthlyTrafficPayload;
  const ctx = { waitUntil() {} };
  try {
    kernel.buildDashboardStatsPayload = async () => ({
      requestCountDisplay: "1,234",
      todayTraffic: "12.5 GB",
      playCount: 56,
      infoCount: 78,
      todayRequests: 1234
    });
    kernel.getDashboardMonthlyTrafficPayload = async (_env, options = {}) => {
      assert.equal(options.ctx, ctx);
      return { traffic: "345.6 GB" };
    };

    const payload = await kernel.buildDailyTelegramSummaryPayload({}, {
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
    kernel.buildDashboardStatsPayload = originalBuildDashboardStatsPayload;
    kernel.getDashboardMonthlyTrafficPayload = originalGetDashboardMonthlyTrafficPayload;
  }
});

test("oversized log detail fallback remains valid JSON", () => {
  const serialized = serializeBoundedLogDetailJson({ detail: "x".repeat(9000) });
  assert.ok(serialized.length <= 8192);
  assert.deepEqual(JSON.parse(serialized), { truncated: true });
});

test("monthly traffic stats are on-demand cached without touching D1", async () => {
  const zoneId = `monthly-zone-${Date.now()}`;
  const { kv } = createInMemoryKvStore({
    [kernel.CONFIG_KEY]: {
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
  isolateState.DashboardMonthlyTrafficCache.clear();
  await withWorkerGlobals({ fetch, caches: { default: edgeCache } }, async () => {
    const firstResponse = await adminActions.getMonthlyTrafficStats({}, {
      env,
      ctx,
      kv,
      db: d1
    });
    const firstPayload = await firstResponse.json();
    assert.equal(firstPayload.cfAnalyticsLoaded, true);
    assert.equal(firstPayload.period, "month");
    assert.ok(graphqlRequestCount > 1);
    assert.equal(firstPayload.totalBytes, graphqlRequestCount * 3072);
    const liveRequestCount = graphqlRequestCount;
    await Promise.all(backgroundTasks.splice(0));

    const memoryResponse = await adminActions.getMonthlyTrafficStats({}, {
      env,
      ctx,
      kv,
      db: d1
    });
    assert.equal((await memoryResponse.json()).cacheStatus, "cache");
    assert.equal(graphqlRequestCount, liveRequestCount);

    isolateState.DashboardMonthlyTrafficCache.clear();
    const edgeResponse = await adminActions.getMonthlyTrafficStats({}, {
      env,
      ctx,
      kv,
      db: d1
    });
    assert.equal((await edgeResponse.json()).cacheStatus, "cache");
    assert.equal(graphqlRequestCount, liveRequestCount);
  });
});

test("monthly traffic splits GraphQL windows to one day while preserving edge response bytes", async () => {
  const dayMs = 24 * 60 * 60 * 1000;
  const monthWindow = {
    monthKey: "2026-07",
    periodLabel: "2026年7月",
    startTs: Date.parse("2026-07-01T00:00:00.000Z"),
    endTs: Date.parse("2026-07-03T12:00:00.000Z")
  };
  const ranges = [];
  const fetch = async (input, init = {}) => {
    assert.equal(String(input), "https://api.cloudflare.com/client/v4/graphql");
    const query = String(JSON.parse(String(init.body || "{}")).query || "");
    const startMatch = /datetime_geq:\s*"([^"]+)"/.exec(query);
    const endMatch = /datetime_leq:\s*"([^"]+)"/.exec(query);
    assert.ok(startMatch);
    assert.ok(endMatch);
    const startTs = Date.parse(startMatch[1]);
    const endTs = Date.parse(endMatch[1]);
    assert.ok(endTs - startTs < dayMs);
    ranges.push({ startTs, endTs });
    return new Response(JSON.stringify({
      data: {
        viewer: {
          zones: [{ series: [{ sum: { edgeResponseBytes: 1024 } }] }]
        }
      }
    }), { headers: { "Content-Type": "application/json" } });
  };

  await withWorkerGlobals({ fetch }, async () => {
    const payload = await kernel.buildDashboardMonthlyTrafficPayload({}, {
      config: {
        cfZoneId: "monthly-zone",
        cfApiToken: "monthly-token",
        scheduleUtcOffsetMinutes: 0
      },
      monthWindow,
      nowMs: monthWindow.endTs
    });
    assert.equal(payload.totalBytes, 3 * 1024);
    assert.equal(payload.traffic, "3 KB");
  });
  assert.equal(ranges.length, 3);
  assert.deepEqual(ranges.map(range => range.startTs), [
    monthWindow.startTs,
    monthWindow.startTs + dayMs,
    monthWindow.startTs + 2 * dayMs
  ]);
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
  const originalPatchOpsStatus = kernel.patchOpsStatus;
  const writes = [];
  kernel.patchOpsStatus = async (_envOrStore, patch) => {
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
      Object.keys(isolateState.AdminShellStatusWriteState.get(db) || {}).sort(),
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
    kernel.patchOpsStatus = originalPatchOpsStatus;
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

test("admin login page emits valid submit interception script", async () => {
  const response = await renderAdminLoginPage(
    new Request("https://worker.test/console/login"),
    {
      ADMIN_PATH: "/console/",
      ADMIN_PASS: "test-password",
      JWT_SECRET: "test-secret"
    },
    { ok: true, missing: [] }
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
  const html = await response.text();
  const loginScript = html.match(/<script>\s*(const ADMIN_LOGIN_RUNTIME[\s\S]*?)<\/script>/)?.[1] || "";
  assert.ok(loginScript, "login submit script must be present");
  assert.match(loginScript, /\.replace\(\/\\\/\+\$\/, ""\)/);
  assert.match(loginScript, /payload\?\.remain/);
  assert.match(loginScript, /还可尝试/);
  assert.doesNotThrow(() => new Function(loginScript));
});

test("admin login preserves leading and trailing password whitespace", async () => {
  const response = await workerHandler.fetch(
    new Request("https://worker.test/console/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "  exact password  " })
    }),
    {
      ADMIN_PATH: "/console",
      ADMIN_PASS: "  exact password  ",
      JWT_SECRET: "test-secret"
    },
    { waitUntil() {} }
  );

  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.match(response.headers.get("Set-Cookie") || "", /auth_token=/);
});

test("admin warm route is exact and follows the configured admin path", () => {
  assert.equal(isAdminWarmRoute("/admin/__warm", "/admin"), true);
  assert.equal(isAdminWarmRoute("/console/__warm/", "/console"), true);
  assert.equal(isAdminWarmRoute("/admin", "/admin"), false);
  assert.equal(isAdminWarmRoute("/admin/__warm/asset", "/admin"), false);
});

test("server record poster routes are exact, authenticated, and delegated by node", async () => {
  const env = { ADMIN_PATH: "/console", ADMIN_PASS: "poster-password", JWT_SECRET: "poster-jwt-secret" };
  const login = await workerHandler.fetch(new Request("https://worker.test/console/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "poster-password" })
  }), env, { waitUntil() {} });
  const authCookie = (login.headers.get("Set-Cookie") || "").match(/auth_token=[^;]+/)?.[0] || "";
  const originalGetPoster = kernel.getServerRecordPosterResponse;
  const posterRequests = [];
  kernel.getServerRecordPosterResponse = async (_env, nodeName, method) => {
    posterRequests.push({ nodeName, method });
    return new Response(new Uint8Array([255, 216, 255]), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=300" }
    });
  };
  try {
    const unauthorized = await workerHandler.fetch(new Request(
      "https://worker.test/console/__server-record-poster/server-a"
    ), env, { waitUntil() {} });
    assert.equal(unauthorized.status, 401);
    assert.equal(unauthorized.headers.get("Cache-Control"), "no-store, max-age=0");

    await workerHandler.fetch(new Request(
      "https://worker.test/console/__server-record-poster/server-a/extra",
      { headers: { Cookie: authCookie } }
    ), env, { waitUntil() {} });
    assert.equal(posterRequests.length, 0);

    const response = await workerHandler.fetch(new Request(
      "https://worker.test/console/__server-record-poster/server-a",
      { headers: { Cookie: authCookie } }
    ), env, { waitUntil() {} });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Content-Type"), "image/jpeg");
    assert.deepEqual(posterRequests, [{ nodeName: "server-a", method: "GET" }]);
  } finally {
    kernel.getServerRecordPosterResponse = originalGetPoster;
  }
});

test("server record poster retrieval binds the current item and image tag without leaking credentials", async () => {
  const watchedAt = "2026-07-30T05:00:00.000Z";
  const originals = {
    getServerRecordSnapshots: kernel.getServerRecordSnapshots,
    getServerLastWatch: kernel.getServerLastWatch,
    getNodeForRead: kernel.getNodeForRead
  };
  let upstreamRequest = null;
  kernel.getServerRecordSnapshots = async () => new Map([["server-a", {
    lastItem: { itemId: "248122", imageTag: "primary-image-tag", watchedAt }
  }]]);
  kernel.getServerLastWatch = async () => new Map([["server-a", { lastWatchedAt: watchedAt }]]);
  kernel.getNodeForRead = async () => ({
    target: "https://origin.example/emby",
    headers: { "X-Emby-Token": "upstream-private-token" },
    serverRecord: { enabled: true }
  });
  try {
    await withWorkerGlobals({
      fetch: async (url, options) => {
        upstreamRequest = { url: new URL(url), headers: new Headers(options.headers) };
        return new Response(new Uint8Array([255, 216, 255]), {
          headers: { "Content-Type": "image/jpeg" }
        });
      }
    }, async () => {
      const response = await kernel.getServerRecordPosterResponse({ DB: {} }, "server-a", "GET");
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("Content-Type"), "image/jpeg");
      assert.equal(response.headers.get("Vary"), "Cookie");
      assert.doesNotMatch(JSON.stringify([...response.headers]), /upstream-private-token|origin\.example/i);
    });
    assert.equal(upstreamRequest.url.pathname, "/emby/Items/248122/Images/Primary");
    assert.equal(upstreamRequest.url.searchParams.get("tag"), "primary-image-tag");
    assert.equal(upstreamRequest.headers.get("X-Emby-Token"), "upstream-private-token");
  } finally {
    kernel.getServerRecordSnapshots = originals.getServerRecordSnapshots;
    kernel.getServerLastWatch = originals.getServerLastWatch;
    kernel.getNodeForRead = originals.getNodeForRead;
  }
});

test("poster browser config action is authenticated, no-store, and isolated from legacy bindings", async () => {
  const { kv } = createInMemoryKvStore({ [kernel.CONFIG_KEY]: {
    tmdbBrowserToken: "admin-tmdb-token",
    doubanBrowserOrigin: "https://admin-douban.example",
    doubanBrowserToken: "admin-douban-token"
  } });
  const env = {
    ENI_KV: kv,
    ADMIN_PATH: "/console",
    ADMIN_PASS: "poster-password",
    JWT_SECRET: "poster-jwt-secret",
    TMDB_BROWSER_TOKEN: "browser-tmdb-token",
    DOUBAN_BROWSER_ORIGIN: "https://douban.example",
    DOUBAN_BROWSER_TOKEN: "browser-douban-token",
    TMDB_API_KEY: "legacy-tmdb-key",
    DOUBAN_SCRAPER_ORIGIN: "https://legacy-douban.example",
    DOUBAN_SCRAPER_TOKEN: "legacy-douban-token"
  };
  const request = (cookie, action = "getPosterBrowserConfig", data = {}) => new Request("https://worker.test/console", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify({ action, ...data })
  });
  assert.equal((await workerHandler.fetch(request(""), env, { waitUntil() {} })).status, 401);
  const login = await workerHandler.fetch(new Request("https://worker.test/console/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "poster-password" })
  }), env, { waitUntil() {} });
  const authCookie = (login.headers.get("Set-Cookie") || "").match(/auth_token=[^;]+/)?.[0] || "";
  const response = await workerHandler.fetch(request(authCookie), env, { waitUntil() {} });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
  assert.deepEqual(await response.json(), {
    tmdb: { configured: true, token: "admin-tmdb-token" },
    douban: { configured: true, origin: "https://admin-douban.example", token: "admin-douban-token" }
  });

  const cleared = await workerHandler.fetch(request(authCookie, "savePosterBrowserSettings", {
    clearTmdbToken: true,
    doubanOrigin: "",
    clearDoubanToken: true
  }), env, { waitUntil() {} });
  assert.equal(cleared.status, 200);
  const clearedPayload = await cleared.json();
  assert.equal(clearedPayload.config.tmdbBrowserToken, undefined);
  assert.equal(clearedPayload.config.doubanBrowserToken, undefined);
  assert.equal(clearedPayload.posterBrowserBindings.tmdbTokenSource, "binding");
  assert.equal(clearedPayload.posterBrowserBindings.doubanOriginSource, "binding");
  assert.equal(clearedPayload.posterBrowserBindings.doubanTokenSource, "binding");

  const fallback = await workerHandler.fetch(request(authCookie), env, { waitUntil() {} });
  assert.deepEqual(await fallback.json(), {
    tmdb: { configured: true, token: "browser-tmdb-token" },
    douban: { configured: true, origin: "https://douban.example", token: "browser-douban-token" }
  });

  const rejectedApiKey = await workerHandler.fetch(request(authCookie, "savePosterBrowserSettings", {
    tmdbToken: "0123456789abcdef0123456789abcdef"
  }), env, { waitUntil() {} });
  assert.equal(rejectedApiKey.status, 400);
  const rejectedApiKeyPayload = await rejectedApiKey.json();
  assert.equal(rejectedApiKeyPayload.error.code, "POSTER_TMDB_TOKEN_INVALID");
  assert.match(rejectedApiKeyPayload.error.message, /API 读取访问令牌/);

  const saved = await workerHandler.fetch(request(authCookie, "savePosterBrowserSettings", {
    tmdbToken: "Bearer new-admin-tmdb-token",
    doubanOrigin: "https://new-admin-douban.example",
    doubanToken: "new-admin-douban-token"
  }), env, { waitUntil() {} });
  assert.equal(saved.status, 200);
  const savedPayload = await saved.json();
  assert.equal(savedPayload.config.tmdbBrowserToken, undefined);
  assert.equal(savedPayload.config.doubanBrowserToken, undefined);
  assert.equal(savedPayload.config.doubanBrowserOrigin, "https://new-admin-douban.example");
  const configured = await workerHandler.fetch(request(authCookie), env, { waitUntil() {} });
  assert.deepEqual(await configured.json(), {
    tmdb: { configured: true, token: "new-admin-tmdb-token" },
    douban: { configured: true, origin: "https://new-admin-douban.example", token: "new-admin-douban-token" }
  });
});













test("server watch media extracts passive original titles and years", () => {
  const bodyText = JSON.stringify({
    SessionId: "session-a",
    ItemId: "episode-1",
    Item: {
      Name: "第 1 集",
      Type: "Episode",
      SeriesName: "机智的一休",
      SeriesOriginalTitle: "Ikkyu-san",
      SeriesProductionYear: 1975,
      OriginalTitle: "Episode Original Title",
      ProductionYear: 2026,
      SeriesId: "series-1",
      ImageTags: {},
      SeriesPrimaryImageTag: "series-poster-tag"
    }
  });
  const execution = {
    nodeName: "server-a",
    requestMethod: "POST",
    requestUrl: new URL("https://worker.test/Sessions/Playing"),
    request: new Request("https://worker.test/Sessions/Playing", { method: "POST" })
  };
  const transport = {
    preparedBodyMode: "buffered",
    preparedBodyText: bodyText,
    newHeaders: new Headers({ "Content-Type": "application/json" })
  };
  assert.deepEqual(proxyService.resolveServerLastWatchMedia(execution, transport), {
    itemId: "episode-1",
    itemName: "第 1 集",
    itemType: "Episode",
    seriesName: "机智的一休",
    originalTitle: "Ikkyu-san",
    year: 1975,
    imageTag: ""
  });
  assert.deepEqual(
    proxyService.buildServerRecordPlaybackContextMedia({
      Id: "episode-1",
      Name: "第 1 集",
      Type: "Episode",
      SeriesName: "机智的一休",
      SeriesOriginalTitle: "Ikkyu-san",
      SeriesProductionYear: 1975,
      OriginalTitle: "Episode Original Title",
      ProductionYear: 2026,
      ImageTags: { Primary: "episode-poster-tag" }
    }, "episode-1"),
    {
      itemId: "episode-1",
      itemName: "第 1 集",
      itemType: "Episode",
      seriesName: "机智的一休",
      originalTitle: "Ikkyu-san",
      year: 1975,
      imageTag: "episode-poster-tag"
    }
  );
  assert.deepEqual(
    proxyService.buildServerRecordPlaybackContextMedia({
      Id: "episode-2",
      Name: "第 2 集",
      Type: "Episode",
      SeriesName: "机智的一休",
      OriginalTitle: "Episode Original Title",
      ProductionYear: 2026
    }, "episode-2"),
    {
      itemId: "episode-2",
      itemName: "第 2 集",
      itemType: "Episode",
      seriesName: "机智的一休",
      originalTitle: "",
      year: null,
      imageTag: ""
    }
  );
  const oversized = "x".repeat(300);
  const boundedContext = proxyService.buildServerRecordPlaybackContextMedia({
    Id: oversized,
    Name: oversized,
    Type: "t".repeat(100),
    SeriesName: oversized,
    OriginalTitle: oversized,
    PrimaryImageTag: oversized
  }, oversized);
  assert.deepEqual({
    itemId: boundedContext.itemId.length,
    itemName: boundedContext.itemName.length,
    itemType: boundedContext.itemType.length,
    seriesName: boundedContext.seriesName.length,
    originalTitle: boundedContext.originalTitle.length
  }, { itemId: 256, itemName: 256, itemType: 64, seriesName: 256, originalTitle: 0 });

  const boundedEvent = proxyService.resolveServerLastWatchMedia({
    ...execution,
    playbackSessionControlPayload: undefined
  }, {
    preparedBodyMode: "buffered",
    preparedBodyText: JSON.stringify({
      ItemId: oversized,
      Item: {
        Name: oversized,
        Type: "t".repeat(100),
        SeriesName: oversized,
        OriginalTitle: oversized,
        PrimaryImageTag: oversized
      }
    }),
    newHeaders: new Headers({ "Content-Type": "application/json" })
  });
  assert.deepEqual({
    itemId: boundedEvent.itemId.length,
    itemName: boundedEvent.itemName.length,
    itemType: boundedEvent.itemType.length,
    seriesName: boundedEvent.seriesName.length,
    originalTitle: boundedEvent.originalTitle.length
  }, { itemId: 256, itemName: 256, itemType: 64, seriesName: 256, originalTitle: 0 });

  isolateState.ServerRecordPlaybackContexts.clear();
  const oversizedPlaybackUrl = `https://worker.test/Items/${oversized}/PlaybackInfo?IsPlayback=true`;
  assert.equal(proxyService.recordServerRecordPlaybackInfoIntent({
    nodeName: "server-a",
    node: { serverRecord: { enabled: true } },
    requestMethod: "POST",
    proxyPath: `/Items/${oversized}/PlaybackInfo`,
    requestUrl: new URL(oversizedPlaybackUrl),
    request: new Request(oversizedPlaybackUrl, {
      method: "POST",
      headers: { "X-Emby-Device-Id": "device-a" }
    }),
    requestTraits: { isPlaybackInfoRequest: true }
  }), true);
  assert.equal([...isolateState.ServerRecordPlaybackContexts.values()][0]?.intent?.itemId.length, 256);
  isolateState.ServerRecordPlaybackContexts.clear();

  assert.equal(
    proxyService.observeServerRecordPlaybackItemDetails(
      {
        nodeName: "server-a",
        node: { serverRecord: { enabled: true } },
        requestMethod: "GET",
        proxyPath: "/Items/episode-1",
        requestUrl: new URL("https://worker.test/Items/episode-1?DeviceId=device-a"),
        request: new Request("https://worker.test/Items/episode-1?DeviceId=device-a"),
        ctx: { waitUntil() {} }
      },
      new Response(JSON.stringify({ Id: "episode-1", Name: "第 1 集" }), {
        headers: { "Content-Type": "application/json" }
      })
    ),
    true
  );
  assert.equal(
    proxyService.observeServerRecordPlaybackItemDetails(
      {
        nodeName: "server-a",
        node: { serverRecord: { enabled: true } },
        requestMethod: "GET",
        proxyPath: "/Items/episode-1/Images/Primary",
        requestUrl: new URL("https://worker.test/Items/episode-1/Images/Primary"),
        request: new Request("https://worker.test/Items/episode-1/Images/Primary"),
        ctx: { waitUntil() {} }
      },
      new Response("image", { headers: { "Content-Type": "image/jpeg" } })
    ),
    false
  );
});

test("server record metadata recovery prefers HAR item details and falls back to PlaybackInfo Name", async () => {
  const originalFetchEndpoint = kernel.fetchServerRecordEndpoint;
  const originalAuthenticate = kernel.authenticateServerRecord;
  const requests = [];
  const node = {
    target: "https://origin.example/emby",
    serverRecordEmbyUsername: "record-user",
    serverRecordEmbyPassword: "record-password",
    serverRecord: { enabled: true }
  };
  try {
    kernel.authenticateServerRecord = async () => ({ token: "short-lived-token", userId: "user-har" });
    kernel.fetchServerRecordEndpoint = async (_target, path, _headers, options = {}) => {
      requests.push({ path, options });
      return {
        ok: true,
        parseError: false,
        json: {
          Id: "248122",
          Name: "摩登家庭 - S01E01",
          Type: "Episode",
          SeriesName: "摩登家庭",
          ImageTags: { Primary: "har-primary-tag" }
        }
      };
    };
    const preferred = await kernel.recoverServerRecordMediaMetadata("nay", node, { itemId: "248122" });
    assert.equal(preferred.itemName, "摩登家庭 - S01E01");
    assert.equal(preferred.imageTag, "har-primary-tag");
    assert.equal(requests.length, 1);
    assert.equal(requests[0].path, "/Users/user-har/Items/248122");
    assert.deepEqual(requests[0].options.query, {
      EnableImageTypes: "Primary,Backdrop,Thumb,Logo",
      ImageTypeLimit: "1",
      Fields: "ProviderIds,ExternalUrls"
    });

    requests.length = 0;
    kernel.fetchServerRecordEndpoint = async (_target, path, _headers, options = {}) => {
      requests.push({ path, options });
      if (!path.endsWith("/PlaybackInfo")) return { ok: true, parseError: false, json: { Id: "248122", Name: "" } };
      return {
        ok: true,
        parseError: false,
        json: {
          Id: "248122",
          Name: "摩登家庭 - S01E01",
          Type: "Episode",
          ImageTags: { Primary: "playback-primary-tag" }
        }
      };
    };
    const fallback = await kernel.recoverServerRecordMediaMetadata("nay", node, { itemId: "248122" });
    assert.equal(fallback.itemName, "摩登家庭 - S01E01");
    assert.equal(fallback.imageTag, "playback-primary-tag");
    assert.deepEqual(requests.map(({ path }) => path), ["/Users/user-har/Items/248122", "/Items/248122/PlaybackInfo"]);
    assert.equal(requests[1].options.method, "POST");
    assert.equal(requests[1].options.expectJson, true);
    assert.deepEqual(requests[1].options.query, { UserId: "user-har" });
  } finally {
    kernel.fetchServerRecordEndpoint = originalFetchEndpoint;
    kernel.authenticateServerRecord = originalAuthenticate;
  }
});

test("HAR item details remain primary when PlaybackInfo JSON arrives later", () => {
  isolateState.ServerRecordPlaybackContexts.clear();
  const execution = {
    nodeName: "nay",
    node: { serverRecord: { enabled: true } },
    requestMethod: "POST",
    proxyPath: "/Items/248122/PlaybackInfo",
    requestUrl: new URL("https://proxy.test/Items/248122/PlaybackInfo?IsPlayback=true&DeviceId=device-a"),
    request: new Request("https://proxy.test/Items/248122/PlaybackInfo?IsPlayback=true&DeviceId=device-a", { method: "POST" }),
    requestTraits: { isPlaybackInfoRequest: true }
  };
  assert.equal(proxyService.recordServerRecordPlaybackInfoIntent(execution), true);
  assert.equal(proxyService.observeServerRecordPlaybackInfoPayload(execution, {
    Id: "248122",
    Name: "PlaybackInfo fallback",
    ImageTags: { Primary: "fallback-tag" }
  }), true);
  assert.equal(proxyService.getServerRecordPlaybackContextMedia(execution, null, "248122")?.itemName, "PlaybackInfo fallback");

  assert.equal(proxyService.recordServerRecordPlaybackItemDetails(execution, {
    itemId: "248122",
    itemName: "摩登家庭 - S01E01",
    itemType: "Episode",
    seriesName: "摩登家庭",
    originalTitle: "Modern Family",
    year: 2009,
    imageTag: "har-primary-tag"
  }, "item_details"), true);
  assert.equal(proxyService.observeServerRecordPlaybackInfoPayload(execution, {
    Id: "248122",
    Name: "Late fallback must not replace detail",
    ImageTags: { Primary: "late-fallback-tag" }
  }), true);
  assert.deepEqual(proxyService.getServerRecordPlaybackContextMedia(execution, null, "248122"), {
    itemId: "248122",
    itemName: "摩登家庭 - S01E01",
    itemType: "Episode",
    seriesName: "摩登家庭",
    originalTitle: "Modern Family",
    year: 2009,
    imageTag: "har-primary-tag"
  });
  isolateState.ServerRecordPlaybackContexts.clear();
});




test("manual setup renders GET and HEAD as no-store with the recovery reason", async () => {
  const statusPatches = [];
  const originalPatchOpsStatus = kernel.patchOpsStatus;
  kernel.patchOpsStatus = async (_env, patch) => {
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
    const setupHtml = await getResponse.text();
    assert.match(setupHtml, /class="admin-gate-shell"/);
    assert.match(setupHtml, /id="admin-gate-local-file"/);
    assert.match(setupHtml, /action: "uploadAdminIndex"/);
    assert.doesNotMatch(setupHtml, /GitHub Release|getGithubReleaseSourceOptions|saveConfig|currentConfig|INDEX_URL/);
    const gateScript = setupHtml.match(/<script>\s*(const ADMIN_INDEX_GATE_RUNTIME[\s\S]*?)<\/script>/)?.[1] || "";
    assert.ok(gateScript, "setup gate script must be present");
    assert.doesNotThrow(() => new Function(gateScript));

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
    kernel.patchOpsStatus = originalPatchOpsStatus;
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
  isolateState.SingleFlightTasks.clear();
  isolateState.AdminRemoteShellCacheMutationChains.clear();
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
  assert.equal(isolateState.SingleFlightTasks.size, 0);
  assert.equal(isolateState.AdminRemoteShellCacheMutationChains.size, 0);
});

test("concurrent legacy migration cannot overwrite a fresh revalidation in one isolate", async () => {
  isolateState.SingleFlightTasks.clear();
  isolateState.AdminRemoteShellCacheMutationChains.clear();
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
  assert.equal(isolateState.SingleFlightTasks.size, 0);
  assert.equal(isolateState.AdminRemoteShellCacheMutationChains.size, 0);
});

test("legacy migration waits for an in-flight fresh write after current-cache eviction", async () => {
  isolateState.SingleFlightTasks.clear();
  isolateState.AdminRemoteShellCacheMutationChains.clear();
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
  assert.equal(isolateState.SingleFlightTasks.size, 0);
  assert.equal(isolateState.AdminRemoteShellCacheMutationChains.size, 0);
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
  isolateState.SingleFlightTasks.clear();
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
  assert.equal(isolateState.SingleFlightTasks.size, 0);
});

test("remote shell does not reuse source Last-Modified for transformed representations", async () => {
  isolateState.SingleFlightTasks.clear();
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
  isolateState.SingleFlightTasks.clear();
  const remoteShellIndexUrl = "https://example.test/releases/v1/index.html";
  const fetchGate = createDeferred();
  let upstreamFetchCount = 0;
  let cacheWriteCount = 0;
  const originalPatchOpsStatus = kernel.patchOpsStatus;
  kernel.patchOpsStatus = async () => null;

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
    kernel.patchOpsStatus = originalPatchOpsStatus;
  }

  assert.equal(upstreamFetchCount, 1);
  assert.equal(cacheWriteCount, 1);
  assert.equal(isolateState.SingleFlightTasks.size, 0);
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
  const privateHeaders = proxyService.buildProxyResponseHeaders(
    new Response("image"),
    privateRequest,
    {},
    "*",
    requestTraits,
    { imageCacheMaxAge: 3600 }
  );
  const publicHeaders = proxyService.buildProxyResponseHeaders(
    new Response("image"),
    publicRequest,
    {},
    "*",
    requestTraits,
    { imageCacheMaxAge: 3600 }
  );
  assert.equal(privateHeaders.get("Cache-Control"), "private, max-age=3600");
  assert.equal(publicHeaders.get("Cache-Control"), "public, max-age=3600");

  const buildFetchOptions = proxyService.createBuildFetchOptions({
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
  isolateState.SingleFlightTasks.clear();
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
  isolateState.SingleFlightTasks.clear();
  let loadCount = 0;
  await assert.rejects(
    runSingleFlight("test:retry", async () => {
      loadCount += 1;
      throw new Error("first attempt failed");
    }),
    /first attempt failed/
  );
  assert.equal(isolateState.SingleFlightTasks.has("test:retry"), false);

  const retriedValue = await runSingleFlight("test:retry", async () => {
    loadCount += 1;
    return "recovered";
  });
  assert.equal(retriedValue, "recovered");
  assert.equal(loadCount, 2);
  assert.equal(isolateState.SingleFlightTasks.has("test:retry"), false);
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
    const routeContext = routeTesting.buildFetchRouteContext(request, {
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

    const response = routeTesting.buildRouteCorsResponse(request, {}, "Not Found", 404);
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
    proxyService.resolveCorsOrigin(runtimeConfig, new Request("https://worker.test", {
      headers: { Origin: "https://client-b.test" }
    })),
    "https://client-b.test"
  );
  assert.equal(proxyService.evaluateFirewall(runtimeConfig, "198.51.100.1", "US", "*")?.status, 403);
  assert.equal(proxyService.evaluateFirewall(runtimeConfig, "203.0.113.1", "US", "*"), null);
  assert.equal(proxyService.evaluateFirewall(runtimeConfig, "203.0.113.1", "FR", "*")?.status, 403);

  runtimeConfig.geoBlocklist = "US";
  const updatedProfile = buildProxyAccessRuleProfile(runtimeConfig);
  assert.notEqual(updatedProfile, firstProfile);
  assert.equal(proxyService.evaluateFirewall(runtimeConfig, "203.0.113.1", "US", "*")?.status, 403);
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
    assert.equal(routeTesting.isPlaybackCriticalRouteContext({ segments }), true, segments.join("/"));
  }
  for (const segments of nonPlaybackRoutes) {
    assert.equal(routeTesting.isPlaybackCriticalRouteContext({ segments }), false, segments.join("/"));
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
      const response = await proxyService.handle(
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
      const response = await proxyService.handle(request, null, "/web", "node", "secret", {}, null, {
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
      const response = await proxyService.handle(
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
    const response = await proxyService.handle(
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
    const response = await proxyService.handle(
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
    const response = await proxyService.handle(
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
    const response = await proxyService.handle(
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
  isolateState.SingleFlightTasks.clear();
  invalidateRuntimeConfigCache();
  const loadGate = createDeferred();
  const loadStarted = createDeferred();
  let configReadCount = 0;
  let configWriteCount = 0;
  const kv = {
    async get(key) {
      assert.equal(key, kernel.CONFIG_KEY);
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
  assert.equal(isolateState.SingleFlightTasks.size, 0);
  invalidateRuntimeConfigCache();
});

test("runtime config invalidation prevents an older load from restoring stale cache", async () => {
  isolateState.SingleFlightTasks.clear();
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
  assert.equal(isolateState.ConfigCache.data.rateLimitRpm, 200);
  assert.equal(configReadCount, 2);
  invalidateRuntimeConfigCache();
});

test("runtime config writes roll back when metadata persistence fails", async () => {
  isolateState.SingleFlightTasks.clear();
  invalidateRuntimeConfigCache();
  const storedValues = new Map([[kernel.CONFIG_KEY, JSON.stringify({ rateLimitRpm: 10 })]]);
  let metadataFailurePending = true;
  const kv = {
    async get(key, options = {}) {
      const value = storedValues.get(key);
      if (value === undefined) return null;
      return options.type === "json" ? JSON.parse(value) : value;
    },
    async put(key, value) {
      if (key === kernel.CONFIG_META_KEY && metadataFailurePending) {
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
    kernel.persistRuntimeConfig({ rateLimitRpm: 20 }, { env, kv }),
    /metadata maintenance failed/
  );

  assert.equal(JSON.parse(storedValues.get(kernel.CONFIG_KEY)).rateLimitRpm, 10);
  assert.equal(storedValues.has(kernel.CONFIG_SNAPSHOTS_KEY), false);
  assert.equal(storedValues.has(kernel.CONFIG_SNAPSHOTS_META_KEY), false);
  invalidateRuntimeConfigCache();
  assert.equal((await getRuntimeConfig(env)).rateLimitRpm, 10);
  invalidateRuntimeConfigCache();
});

test("host-prefix CNAME targets normalize at config and node boundaries", async () => {
  const { kv } = createInMemoryKvStore({ [kernel.CONFIG_KEY]: {} });
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "host-prefix-normalize" };
  const config = await kernel.persistRuntimeConfig({
    defaultHostPrefixCnameTarget: "  Global.Target.Example.  "
  }, { env, kv });
  assert.equal(config.defaultHostPrefixCnameTarget, "global.target.example");

  const hostPrefixNode = kernel.normalizeNode("alpha", {
    target: "https://origin.test",
    entryMode: "host_prefix",
    hostPrefixCnameTarget: "  Node.Target.Example.  "
  }).data;
  assert.equal(hostPrefixNode.hostPrefixCnameTarget, "node.target.example");

  const kvRouteNode = kernel.normalizeNode("alpha", {
    target: "https://origin.test",
    entryMode: "kv_route",
    hostPrefixCnameTarget: "node.target.example"
  }).data;
  assert.equal(kvRouteNode.hostPrefixCnameTarget, "");
});

test("invalid global host-prefix CNAME targets are rejected before persistence", async () => {
  const { kv } = createInMemoryKvStore({ [kernel.CONFIG_KEY]: {} });
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
      kernel.persistRuntimeConfig({ defaultHostPrefixCnameTarget }, { env, kv }),
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

  const nodeOverridePlan = kernel.buildHostPrefixDnsSyncPlan(
    "",
    null,
    "alpha",
    overriddenNode,
    hostRoot,
    { nextConfig: { defaultHostPrefixCnameTarget: "global.target.example" } }
  );
  assert.equal(nodeOverridePlan.nextCnameTarget, "node.target.example");

  const globalDefaultPlan = kernel.buildHostPrefixDnsSyncPlan(
    "",
    null,
    "alpha",
    inheritedNode,
    hostRoot,
    { nextConfig: { defaultHostPrefixCnameTarget: "global.target.example" } }
  );
  assert.equal(globalDefaultPlan.nextCnameTarget, "global.target.example");

  const hostFallbackPlan = kernel.buildHostPrefixDnsSyncPlan(
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
  const plan = kernel.buildHostPrefixDnsSyncPlan(
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
  const firstSummary = kernel.buildNodeSummary("alpha", {
    ...baseNode,
    hostPrefixCnameTarget: "First.Target.Example."
  }).summary;
  const secondSummary = kernel.buildNodeSummary("alpha", {
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
    [kernel.CONFIG_KEY]: previousConfig,
    [`${kernel.PREFIX}inherited`]: {
      target: "https://inherited-origin.test",
      entryMode: "host_prefix"
    },
    [`${kernel.PREFIX}overridden`]: {
      target: "https://overridden-origin.test",
      entryMode: "host_prefix",
      hostPrefixCnameTarget: "node.target.example"
    },
    [`${kernel.PREFIX}path-node`]: {
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
  const originalPersistHostPrefixDnsSyncPlan = kernel.persistHostPrefixDnsSyncPlan;
  kernel.persistHostPrefixDnsSyncPlan = async (plan) => {
    dnsPlans.push(structuredClone(plan));
    return { changed: true };
  };
  invalidateRuntimeConfigCache();

  try {
    const savedConfig = await kernel.persistRuntimeConfig({
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
      JSON.parse(storedValues.get(kernel.CONFIG_KEY)).defaultHostPrefixCnameTarget,
      "new.target.example"
    );
  } finally {
    kernel.persistHostPrefixDnsSyncPlan = originalPersistHostPrefixDnsSyncPlan;
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
    [kernel.CONFIG_KEY]: previousConfig,
    [`${kernel.PREFIX}alpha`]: {
      target: "https://alpha-origin.test",
      entryMode: "host_prefix"
    },
    [`${kernel.PREFIX}beta`]: {
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
  const originalPersistHostPrefixDnsSyncPlan = kernel.persistHostPrefixDnsSyncPlan;
  kernel.persistHostPrefixDnsSyncPlan = async (plan) => {
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
      kernel.persistRuntimeConfig({
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
      JSON.parse(storedValues.get(kernel.CONFIG_KEY)).defaultHostPrefixCnameTarget,
      "old.target.example"
    );
    assert.equal(storedValues.has(kernel.CONFIG_SNAPSHOTS_KEY), false);
    assert.equal(putKeys.includes(kernel.CONFIG_KEY), false);
    assert.equal(putKeys.includes(kernel.CONFIG_SNAPSHOTS_KEY), false);
  } finally {
    kernel.persistHostPrefixDnsSyncPlan = originalPersistHostPrefixDnsSyncPlan;
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
      kernel.upsertHostPrefixDnsRecord("alpha.proxy.example", {
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
  const historyKey = kernel.getDnsRecordHistoryKey("zone-id", kernel.getDnsHostHistoryRecordId("alpha.proxy.example"));
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
      kernel.upsertHostPrefixDnsRecord("alpha.proxy.example", {
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
  const historyKey = kernel.getDnsRecordHistoryKey("zone-id", kernel.getDnsHostHistoryRecordId("alpha.proxy.example"));
  const { kv, putKeys } = createInMemoryKvStore();
  const originalGet = kv.get;
  kv.get = async (key, options) => {
    if (key === historyKey) throw new Error("history_read_failed");
    return await originalGet(key, options);
  };

  await withWorkerGlobals({ fetch: dns.fetch }, async () => {
    await assert.rejects(
      kernel.upsertHostPrefixDnsRecord("alpha.proxy.example", {
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
  const historyKey = kernel.getDnsRecordHistoryKey("zone-id", kernel.getDnsHostHistoryRecordId("alpha.proxy.example"));
  const { kv } = createInMemoryKvStore({
    [kernel.CONFIG_KEY]: { cfZoneId: "zone-id", cfApiToken: "api-token" },
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
    const response = await withWorkerGlobals({ fetch: dns.fetch }, () => adminActions.updateDnsRecord({
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
  const historyKey = kernel.getDnsRecordHistoryKey("zone-id", kernel.getDnsHostHistoryRecordId("alpha.proxy.example"));
  const { kv } = createInMemoryKvStore({
    [kernel.CONFIG_KEY]: { cfZoneId: "zone-id", cfApiToken: "api-token" },
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
    const response = await withWorkerGlobals({ fetch: dns.fetch }, () => adminActions.updateDnsRecord({
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
  const historyKey = kernel.getDnsRecordHistoryKey("zone-id", kernel.getDnsHostHistoryRecordId("alpha.proxy.example"));
  const { kv } = createInMemoryKvStore({
    [kernel.CONFIG_KEY]: { cfZoneId: "zone-id", cfApiToken: "api-token" }
  });
  const originalPut = kv.put;
  kv.put = async (key, value) => {
    if (key === historyKey) throw new Error("history_write_failed");
    return await originalPut(key, value);
  };
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "single-dns-create-history-rollback" };
  invalidateRuntimeConfigCache();

  try {
    const response = await withWorkerGlobals({ fetch: dns.fetch }, () => adminActions.updateDnsRecord({
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
    [`${kernel.PREFIX}alpha`]: { target: "https://new-origin.test", entryMode: "host_prefix" }
  });
  const mutation = {
    previousName: "alpha",
    previousNode: { target: "https://old-origin.test", entryMode: "host_prefix" },
    nextName: "alpha",
    nextNode: { target: "https://new-origin.test", entryMode: "host_prefix" },
    nodeChanged: true,
    dnsPlan: { changed: true, rollbackSteps: [{ type: "upsert", host: "alpha.proxy.example", cnameTarget: "old.target.example" }] }
  };
  const originalPersistHostPrefixDnsSyncPlan = kernel.persistHostPrefixDnsSyncPlan;
  kernel.persistHostPrefixDnsSyncPlan = async () => {
    throw new Error("dns_rollback_failed");
  };
  try {
    await assert.rejects(
      kernel.rollbackPreparedNodeMutations([mutation], {
        kv,
        config: { cfZoneId: "zone-id", cfApiToken: "api-token" }
      }),
      /dns:dns_rollback_failed/
    );
  } finally {
    kernel.persistHostPrefixDnsSyncPlan = originalPersistHostPrefixDnsSyncPlan;
  }

  assert.equal(JSON.parse(storedValues.get(`${kernel.PREFIX}alpha`)).target, "https://old-origin.test");
});

test("active rename mutation rolls back a partial KV write", async () => {
  const previousNode = { target: "https://old-origin.test", entryMode: "kv_route" };
  const nextNode = { target: "https://new-origin.test", entryMode: "kv_route" };
  const { kv, storedValues } = createInMemoryKvStore({
    [`${kernel.PREFIX}alpha`]: previousNode
  });
  const originalDelete = kv.delete;
  let deleteFailurePending = true;
  kv.delete = async key => {
    if (key === `${kernel.PREFIX}alpha` && deleteFailurePending) {
      deleteFailurePending = false;
      throw new Error("rename_delete_failed");
    }
    return await originalDelete(key);
  };

  await assert.rejects(
    kernel.applyPreparedNodeMutations([{
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

  assert.deepEqual(JSON.parse(storedValues.get(`${kernel.PREFIX}alpha`)), previousNode);
  assert.equal(storedValues.has(`${kernel.PREFIX}beta`), false);
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
    [kernel.CONFIG_KEY]: previousConfig,
    [`${kernel.PREFIX}alpha`]: previousNode
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
  const originalRebuildNodeIndexesFromKv = kernel.rebuildNodeIndexesFromKv;
  let rebuildCount = 0;
  kernel.rebuildNodeIndexesFromKv = async (...args) => {
    rebuildCount += 1;
    if (rebuildCount === 1) throw new Error("node_index_rebuild_failed");
    return await originalRebuildNodeIndexesFromKv.apply(kernel, args);
  };
  invalidateRuntimeConfigCache();

  try {
    await withWorkerGlobals({ fetch: dns.fetch }, async () => {
      await assert.rejects(
        adminActions.importFull({
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

    const restoredConfig = JSON.parse(storedValues.get(kernel.CONFIG_KEY));
    const restoredNode = JSON.parse(storedValues.get(`${kernel.PREFIX}alpha`));
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
    kernel.rebuildNodeIndexesFromKv = originalRebuildNodeIndexesFromKv;
    invalidateRuntimeConfigCache();
  }
});

test("node revision refresh coalesces and hot node reads stay in memory", async () => {
  isolateState.SingleFlightTasks.clear();
  isolateState.NodeCache.clear();
  invalidateNodesRevisionCache();
  const revisionGate = createDeferred();
  const revisionReadStarted = createDeferred();
  let revisionReadCount = 0;
  const kv = {
    async get(key) {
      assert.equal(key, kernel.NODES_INDEX_META_KEY);
      revisionReadCount += 1;
      revisionReadStarted.resolve();
      await revisionGate.promise;
      return { revision: "nodes-r1" };
    }
  };

  const firstRevision = kernel.getNodesRevision(kv);
  const secondRevision = kernel.getNodesRevision(kv);
  await revisionReadStarted.promise;
  assert.equal(revisionReadCount, 1);
  revisionGate.resolve();
  assert.deepEqual(await Promise.all([firstRevision, secondRevision]), ["nodes-r1", "nodes-r1"]);

  isolateState.NodeCache.set("alpha", {
    data: { target: "https://origin.test" },
    exp: Date.now() + 60000,
    nodesRevision: "nodes-r1"
  });
  const cachedNode = await kernel.getNode("alpha", { ENI_KV: kv }, null);
  assert.equal(cachedNode.target, "https://origin.test");
  assert.equal(revisionReadCount, 1);
  isolateState.NodeCache.clear();
  invalidateNodesRevisionCache();
});

test("node revision read failures are retried instead of negative-cached", async () => {
  isolateState.SingleFlightTasks.clear();
  invalidateNodesRevisionCache();
  let revisionReadCount = 0;
  const kv = {
    async get(key) {
      assert.equal(key, kernel.NODES_INDEX_META_KEY);
      revisionReadCount += 1;
      if (revisionReadCount === 1) throw new Error("transient revision failure");
      return { revision: "nodes-r2" };
    }
  };

  assert.equal(await kernel.getNodesRevision(kv), "");
  assert.equal(isolateState.NodesRevisionCache, null);
  assert.equal(await kernel.getNodesRevision(kv), "nodes-r2");
  assert.equal(revisionReadCount, 2);
  invalidateNodesRevisionCache();
});

test("node writes prevent older positive and negative reads from refilling memory", async () => {
  for (const [nodeName, storedNode] of [
    ["stale-positive", { target: "https://old-origin.test" }],
    ["stale-negative", null]
  ]) {
    isolateState.NodeCache.clear();
    invalidateNodesRevisionCache();
    const entityReadStarted = createDeferred();
    const entityReadGate = createDeferred();
    const kv = {
      async get(key) {
        if (key === `${kernel.PREFIX}${nodeName}`) {
          entityReadStarted.resolve();
          await entityReadGate.promise;
          return storedNode;
        }
        throw new Error(`unexpected KV read: ${key}`);
      }
    };

    const staleRead = kernel.getNode(nodeName, { ENI_KV: kv }, null);
    await entityReadStarted.promise;
    kernel.invalidateNodeCaches(nodeName, { invalidateList: true });
    entityReadGate.resolve();

    assert.equal(await staleRead, null);
    assert.equal(isolateState.NodeCache.has(nodeName), false);
  }
  invalidateNodesRevisionCache();
});

test("evicted node generations cannot revive an older cold read", async () => {
  isolateState.SingleFlightTasks.clear();
  isolateState.NodeCache.clear();
  isolateState.NodeCacheGenerations.clear();
  const entityReadStarted = createDeferred();
  const entityReadGate = createDeferred();
  const kv = {
    async get(key) {
      if (key === `${kernel.PREFIX}alpha`) {
        entityReadStarted.resolve();
        await entityReadGate.promise;
        return { target: "https://stale-origin.test" };
      }
      if (key === kernel.NODES_INDEX_META_KEY) return { revision: "nodes-r1" };
      throw new Error(`unexpected KV read: ${key}`);
    }
  };
  const database = { ...kernel };
  database.upsertNodeSummaryEntry = async () => null;

  const staleRead = database.getNode("alpha", { ENI_KV: kv }, null);
  await entityReadStarted.promise;
  database.invalidateNodeCaches([
    "alpha",
    ...Array.from({ length: 5000 }, (_, index) => `generation-churn-${index}`)
  ]);
  assert.equal(isolateState.NodeCacheGenerations.has("alpha"), false);
  entityReadGate.resolve();

  assert.equal(await staleRead, null);
  assert.equal(isolateState.NodeCache.has("alpha"), false);
  isolateState.SingleFlightTasks.clear();
  isolateState.NodeCache.clear();
  isolateState.NodeCacheGenerations.clear();
});

test("unrelated node invalidation does not cancel another node's cold read", async () => {
  isolateState.SingleFlightTasks.clear();
  isolateState.NodeCache.clear();
  isolateState.NodeCacheGenerations.clear();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  const entityReadStarted = createDeferred();
  const entityReadGate = createDeferred();
  const kv = {
    async get(key) {
      if (key === `${kernel.PREFIX}alpha`) {
        entityReadStarted.resolve();
        await entityReadGate.promise;
        return { target: "https://origin.test" };
      }
      if (key === kernel.NODES_INDEX_META_KEY) return { revision: "nodes-r1" };
      throw new Error(`unexpected KV read: ${key}`);
    },
    async put() {}
  };
  const nodeOperations = { ...kernel };
  Object.assign(nodeOperations, defineNodeRepositoryMethods({}, nodeOperations));
  nodeOperations.upsertNodeSummaryEntry = async () => null;

  const alphaRead = nodeOperations.getNode("alpha", { ENI_KV: kv }, null);
  await entityReadStarted.promise;
  nodeOperations.invalidateNodeCaches("beta", { invalidateList: true });
  entityReadGate.resolve();

  const alphaNode = await alphaRead;
  assert.equal(new URL(alphaNode.target).hostname, "origin.test");
  assert.equal(isolateState.NodeCache.get("alpha")?.data, alphaNode);
  isolateState.NodeCache.clear();
  isolateState.NodeCacheGenerations.clear();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("stale node-summary reads cannot refill invalidated list caches", async () => {
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  const summaryReadStarted = createDeferred();
  const summaryReadGate = createDeferred();
  const alphaSummary = kernel.buildNodeSummary("alpha", { target: "https://origin.test" }).summary;
  assert.ok(alphaSummary);
  const kv = {
    async get(key) {
      assert.equal(key, kernel.NODES_SUMMARY_INDEX_KEY);
      summaryReadStarted.resolve();
      await summaryReadGate.promise;
      return [alphaSummary];
    }
  };

  const staleRead = kernel.getNodesSummaryIndex(kv, { useCache: false });
  await summaryReadStarted.promise;
  invalidateNodesRevisionCache();
  summaryReadGate.resolve();

  const summaries = await staleRead;
  assert.deepEqual(summaries.map(node => node.name), ["alpha"]);
  assert.equal(isolateState.NodesListCache, null);
  assert.equal(isolateState.NodesIndexCache, null);
  invalidateNodesRevisionCache();
});

test("node-index mutations serialize so final KV and memory revisions match", async () => {
  isolateState.NodeIndexMutationChain = Promise.resolve();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
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
  const database = { ...kernel };
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
    kernel.NODES_INDEX_KEY,
    kernel.NODES_INDEX_META_KEY,
    kernel.NODES_INDEX_KEY,
    kernel.NODES_INDEX_META_KEY
  ]);
  assert.deepEqual(JSON.parse(storedValues.get(kernel.NODES_INDEX_KEY)), ["fresh"]);
  const storedMeta = JSON.parse(storedValues.get(kernel.NODES_INDEX_META_KEY));
  assert.equal(isolateState.NodesRevisionCache?.revision, storedMeta.revision);
  assert.deepEqual(isolateState.NodesIndexCache?.data, ["fresh"]);
  isolateState.NodeIndexMutationChain = Promise.resolve();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("concurrent node-summary upserts merge inside the mutation chain", async () => {
  isolateState.NodeIndexMutationChain = Promise.resolve();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  const storedValues = new Map([
    [kernel.NODES_SUMMARY_INDEX_KEY, JSON.stringify([])],
    [kernel.NODES_INDEX_META_KEY, JSON.stringify(kernel.buildNodesIndexMeta([], [], {
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
    kernel.upsertNodeSummaryEntry("alpha", { target: "https://alpha-origin.test" }, { kv }),
    kernel.upsertNodeSummaryEntry("beta", { target: "https://beta-origin.test" }, { kv })
  ]);

  assert.deepEqual([alpha.name, beta.name], ["alpha", "beta"]);
  const storedNames = JSON.parse(storedValues.get(kernel.NODES_SUMMARY_INDEX_KEY)).map(node => node.name);
  assert.deepEqual(storedNames, ["alpha", "beta"]);
  assert.deepEqual(isolateState.NodesListCache?.data.map(node => node.name), ["alpha", "beta"]);
  isolateState.NodeIndexMutationChain = Promise.resolve();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("node-index rebuilds serialize entity loading with their commit", async () => {
  isolateState.NodeIndexMutationChain = Promise.resolve();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  const firstListStarted = createDeferred();
  const firstListGate = createDeferred();
  const storedValues = new Map([
    [`${kernel.PREFIX}alpha`, JSON.stringify({ target: "https://alpha-origin.test" })],
    [kernel.NODES_SUMMARY_INDEX_KEY, JSON.stringify([])],
    [kernel.NODES_INDEX_META_KEY, JSON.stringify(kernel.buildNodesIndexMeta([], [], {
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

  const olderRebuild = kernel.rebuildNodeIndexesFromKv(kv);
  await firstListStarted.promise;
  storedValues.set(`${kernel.PREFIX}beta`, JSON.stringify({ target: "https://beta-origin.test" }));
  const fresherRebuild = kernel.rebuildNodeIndexesFromKv(kv);
  assert.equal(listCount, 1);
  firstListGate.resolve();

  const [olderState, fresherState] = await Promise.all([olderRebuild, fresherRebuild]);
  assert.deepEqual(olderState.index, ["alpha"]);
  assert.deepEqual(fresherState.index, ["alpha", "beta"]);
  const storedNames = JSON.parse(storedValues.get(kernel.NODES_SUMMARY_INDEX_KEY)).map(node => node.name);
  assert.deepEqual(storedNames, ["alpha", "beta"]);
  isolateState.NodeIndexMutationChain = Promise.resolve();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("node-index writes reject incomplete entity truth-source reads", async () => {
  const runRejectedWrite = async (operation) => {
    isolateState.NodeIndexMutationChain = Promise.resolve();
    isolateState.NodesListCache = null;
    isolateState.NodesIndexCache = null;
    invalidateNodesRevisionCache();
    const writes = [];
    const kv = {
      async get(key) {
        if (key === kernel.NODES_SUMMARY_INDEX_KEY) return null;
        if (key === `${kernel.PREFIX}alpha`) return { target: "https://alpha-origin.test" };
        if (key === `${kernel.PREFIX}beta`) throw new Error("temporary kv read failure");
        return null;
      },
      async put(key, value) {
        writes.push([key, value]);
      },
      async list() {
        return {
          keys: [
            { name: `${kernel.PREFIX}alpha` },
            { name: `${kernel.PREFIX}beta` }
          ],
          list_complete: true
        };
      }
    };

    await assert.rejects(operation(kv), error => error?.code === "KV_READ_FAILED");
    assert.deepEqual(writes, []);
  };

  await runRejectedWrite(kv => kernel.rebuildNodeIndexesFromKv(kv));
  await runRejectedWrite(kv => kernel.upsertNodeSummaryEntry("gamma", {
    target: "https://gamma-origin.test"
  }, { kv }));
  isolateState.NodeIndexMutationChain = Promise.resolve();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("stale revision candidates cannot overwrite current node-index metadata", async () => {
  isolateState.NodeIndexMutationChain = Promise.resolve();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
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
  const freshSummary = kernel.buildNodeSummary("fresh", { target: "https://fresh-origin.test" }).summary;
  const staleSummary = kernel.buildNodeSummary("stale", { target: "https://stale-origin.test" }).summary;
  await kernel.persistNodesSummaryIndex([freshSummary], { kv });
  const freshMeta = JSON.parse(storedValues.get(kernel.NODES_INDEX_META_KEY));

  const ensuredMeta = await kernel.ensureNodesIndexMeta(kv, {
    index: ["stale"],
    nodes: [staleSummary]
  });

  const storedMeta = JSON.parse(storedValues.get(kernel.NODES_INDEX_META_KEY));
  assert.equal(ensuredMeta.revision, freshMeta.revision);
  assert.equal(storedMeta.revision, freshMeta.revision);
  assert.equal(isolateState.NodesRevisionCache?.revision, freshMeta.revision);
  isolateState.NodeIndexMutationChain = Promise.resolve();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("concurrent proxy cold reads share one node entity load", async () => {
  isolateState.SingleFlightTasks.clear();
  isolateState.NodeCache.clear();
  isolateState.NodeCacheGenerations.clear();
  invalidateNodesRevisionCache();
  const entityReadStarted = createDeferred();
  const entityReadGate = createDeferred();
  let entityReadCount = 0;
  const kv = {
    async get(key) {
      if (key === `${kernel.PREFIX}alpha`) {
        entityReadCount += 1;
        entityReadStarted.resolve();
        await entityReadGate.promise;
        return { target: "https://origin.test" };
      }
      if (key === kernel.NODES_INDEX_META_KEY) return { revision: "nodes-r1" };
      throw new Error(`unexpected KV read: ${key}`);
    },
    async put() {}
  };
  const nodeOperations = { ...kernel };
  Object.assign(nodeOperations, defineNodeRepositoryMethods({}, nodeOperations));
  nodeOperations.upsertNodeSummaryEntry = async () => null;

  const coldReads = Array.from({ length: 10 }, () => nodeOperations.getNode("alpha", { ENI_KV: kv }, null));
  await entityReadStarted.promise;
  assert.equal(entityReadCount, 1);
  entityReadGate.resolve();

  const nodes = await Promise.all(coldReads);
  assert.equal(nodes.every(node => new URL(node.target).hostname === "origin.test"), true);
  assert.equal(entityReadCount, 1);
  isolateState.SingleFlightTasks.clear();
  isolateState.NodeCache.clear();
  isolateState.NodeCacheGenerations.clear();
  invalidateNodesRevisionCache();
});

test("proxy node misses use the short-lived node cache", async () => {
  isolateState.SingleFlightTasks.clear();
  isolateState.NodeCache.clear();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  let nodeReadCount = 0;
  const kv = {
    async get(key) {
      if (key === `${kernel.PREFIX}missing`) {
        nodeReadCount += 1;
        return null;
      }
      if (key === kernel.NODES_SUMMARY_INDEX_KEY) return [];
      if (key === kernel.NODES_INDEX_META_KEY) return { revision: "nodes-r1" };
      throw new Error(`unexpected KV read: ${key}`);
    }
  };
  const env = { ENI_KV: kv };

  assert.equal(await kernel.getNode("missing", env, null), null);
  assert.equal(await kernel.getNode("missing", env, null), null);
  assert.equal(nodeReadCount, 1);
  assert.equal(isolateState.NodeCache.get("missing")?.data, null);
  isolateState.NodeCache.get("missing").exp = Date.now() - 1;
  assert.equal(await kernel.getNode("missing", env, null), null);
  assert.equal(nodeReadCount, 2);
  isolateState.NodeCache.clear();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("strict admin node reads bypass the proxy negative cache", async () => {
  isolateState.SingleFlightTasks.clear();
  isolateState.NodeCache.clear();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
  let nodeExists = false;
  let nodeReadCount = 0;
  const kv = {
    async get(key) {
      if (key === `${kernel.PREFIX}alpha`) {
        nodeReadCount += 1;
        return nodeExists ? { target: "https://origin.test" } : null;
      }
      if (key === kernel.NODES_SUMMARY_INDEX_KEY) return [];
      if (key === kernel.NODES_INDEX_META_KEY) return { revision: "nodes-r1" };
      throw new Error(`unexpected KV read: ${key}`);
    }
  };
  const env = { ENI_KV: kv };

  assert.equal(await kernel.getNode("alpha", env, null), null);
  assert.equal(nodeReadCount, 1);
  assert.equal(isolateState.NodeCache.get("alpha")?.data, null);

  nodeExists = true;
  const node = await kernel.getNodeForRead("alpha", env);
  assert.equal(new URL(node.target).hostname, "origin.test");
  assert.equal(nodeReadCount, 2);

  isolateState.NodeCache.clear();
  isolateState.NodesListCache = null;
  isolateState.NodesIndexCache = null;
  invalidateNodesRevisionCache();
});

test("proxy preparation reuses the runtime config loaded by the entry route", async () => {
  let configReadCount = 0;
  const runtimeConfig = { rateLimitRpm: 0 };
  const execution = await proxyService.prepareExecutionContext(
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
  const plainExecution = await proxyService.prepareExecutionContext(
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
  const fallbackExecution = await proxyService.prepareExecutionContext(
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
  const relayExecution = await proxyService.prepareExecutionContext(
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
  const buildExecution = (token, cacheTtlImages) => proxyService.prepareExecutionContext(
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
  isolateState.OpsStatusShadowCache.set(db, {
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

  const database = createStatusTestService(db);
  database.getOpsStatusSectionEntries = () => [["log", kernel.OPS_STATUS_SECTION_SCOPES.log]];
  database.getOpsStatusPayloadFromDb = async (_db, scope) => {
    if (scope === kernel.OPS_STATUS_DB_SCOPE_ROOT) return rootStatus;
    if (scope === kernel.OPS_STATUS_SECTION_SCOPES.log) return partitionStatus;
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
  const database = createStatusTestService(db);
  database.getOpsStatusPayloadFromDb = async (_db, scope) => {
    readCounts.set(scope, (readCounts.get(scope) || 0) + 1);
    return {};
  };

  await database.getOpsStatus(db);
  assert.deepEqual(Object.fromEntries(readCounts), {
    [kernel.OPS_STATUS_DB_SCOPE_ROOT]: 1,
    [kernel.OPS_STATUS_SECTION_SCOPES.log]: 1,
    [kernel.OPS_STATUS_SECTION_SCOPES.scheduled]: 1,
    [kernel.OPS_STATUS_SECTION_SCOPES.dnsIpPool]: 1
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
      "https://raw.githubusercontent.com./owner/repo/main/app.js",
      "https://github.com/owner/repo/releases/download/v1.0.0/app.js",
      "https://github.com/owner/repo/releases/download/v1.0.0/runtime",
      "https://github.com./owner/repo/releases/download/v1.0.0/runtime",
      "https://esm.sh./vue@3/dist/vue.runtime.esm-browser.js"
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

test("local index uploads use the remote shell policy and a content-addressed source", async () => {
  const validHtml = `<!doctype html><html><head>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="modulepreload" href="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.prod.js">
  </head><body><div id="app"></div></body></html>`;
  const record = await buildAdminLocalIndexUploadRecord(validHtml, "C:\\exports\\index.html");
  assert.match(record.sourceUrl, /^https:\/\/admin-local-index\.invalid\/[a-f0-9]{64}\/index\.html$/);
  assert.match(record.assetRevision, /^local-[a-f0-9]{64}$/);
  assert.equal(record.fileName, "index.html");
  assert.equal(record.manifest.entries.length, 2);

  await assert.rejects(
    buildAdminLocalIndexUploadRecord('<!doctype html><html><body><div id="app"></div><script src="/assets/app.js"></script></body></html>'),
    /asset policy invalid/
  );
  await assert.rejects(
    buildAdminLocalIndexUploadRecord('<!doctype html><html><head><script type="importmap">{}</script></head><body><div id="app"></div></body></html>'),
    /asset policy invalid/
  );
  await assert.rejects(
    buildAdminLocalIndexUploadRecord('<!doctype html><html><body><div id="app"></div><script>void import("https://evil.test/runtime.js")</script></body></html>'),
    /动态 import/
  );
});

test("admin index resolution ignores Release fields and environment INDEX_URL", () => {
  const resolved = buildResolvedAdminIndexState(
    { INDEX_URL: "https://example.test/index.html" },
    {
      releaseRepo: "axuitomo/CF-EMBY-PROXY-UI",
      releaseBranch: "main",
      releaseTag: "v1.0.0",
      indexUrl: "https://example.test/index.html"
    }
  );
  assert.equal(resolved.indexUrl, "");
  assert.equal(resolved.indexUrlSource, "unset");
  assert.equal(resolved.hasGithubRelease, false);
  assert.equal(resolved.gateState, "setup_required");
});

test("Worker and HTML update requires both uploaded files", async () => {
  const { kv } = createInMemoryKvStore({ [kernel.CONFIG_KEY]: {} });
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "worker-html-files-required" };
  invalidateRuntimeConfigCache();
  const validHtml = '<!doctype html><html><body><div id="app"></div></body></html>';
  const cases = [
    {
      workerFileName: "worker.js",
      workerScriptContent: "export default { fetch() { return new Response('ok'); } }"
    },
    {
      indexFileName: "index.html",
      indexHtml: validHtml
    }
  ];

  for (const data of cases) {
    const response = await adminActions.updateWorkerAndAdminIndex(data, {
      env,
      kv,
      ctx: null,
      request: new Request("https://worker.test/admin")
    });
    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "WORKER_HTML_FILES_REQUIRED");
  }
});

test("local index source persists in KV and renders through the same-origin vendor path", async () => {
  const { kv } = createInMemoryKvStore({ "sys:theme": {} });
  const env = { ADMIN_PATH: "/admin", ENI_KV: kv };
  const html = '<!doctype html><html><head><script src="https://cdn.example.test/app.js"></script></head><body><div id="app"></div></body></html>';
  const record = await buildAdminLocalIndexUploadRecord(html, "index.html");
  const persisted = await kernel.persistAdminIndexUpload(record, { env, kv });
  const resolved = buildResolvedAdminIndexState({}, persisted.config);
  assert.equal(resolved.indexUrlSource, "local_upload");
  assert.equal(resolved.localUploadRevision, record.revision);
  assert.equal((await kernel.getAdminIndexUploadRecord(kv, record.revision)).html, html);

  const response = await renderAdminPage(
    new Request("https://worker.test/admin"),
    env,
    null,
    { ok: true, missing: [] },
    persisted.config
  );
  const rendered = await response.text();
  assert.equal(response.status, 200);
  assert.doesNotMatch(rendered, /https:\/\/cdn\.example\.test\/app\.js/);
  assert.match(rendered, new RegExp(`/admin/__release/${record.assetRevision}/vendor/`));

  await withWorkerGlobals({
    fetch: async (url) => {
      assert.equal(url, "https://cdn.example.test/app.js");
      return new Response("window.localVendorLoaded=true;", {
        headers: { "Content-Type": "application/javascript" }
      });
    }
  }, async () => {
    const vendorResponse = await renderAdminReleaseVendorAsset(
      new Request(`https://worker.test/admin/__release/${record.assetRevision}/vendor/${record.manifest.entries[0].assetKey}`),
      env,
      null,
      { releaseTag: record.assetRevision, assetKey: record.manifest.entries[0].assetKey },
      persisted.config
    );
    assert.equal(vendorResponse.status, 200);
    assert.match(await vendorResponse.text(), /localVendorLoaded/);
  });
});

test("local index upload replaces a corrupted record under the same revision", async () => {
  const html = '<!doctype html><html><body><div id="app"></div></body></html>';
  const record = await buildAdminLocalIndexUploadRecord(html, "index.html");
  const uploadKey = kernel.buildAdminIndexUploadKey(record.revision);
  const corruptedRecord = {
    ...record,
    html: '<!doctype html><html><body><div id="app">corrupted</div></body></html>'
  };
  const { kv, storedValues, putKeys } = createInMemoryKvStore({
    [kernel.CONFIG_KEY]: {},
    [uploadKey]: corruptedRecord
  });
  const env = {
    ADMIN_PATH: "/admin",
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "local-index-corrupt-record"
  };
  invalidateRuntimeConfigCache();

  const persisted = await kernel.persistAdminIndexUpload(record, { env, kv });

  assert.equal(persisted.record.html, html);
  assert.equal(JSON.parse(storedValues.get(uploadKey)).html, html);
  assert.ok(putKeys.includes(uploadKey));
  assert.equal((await kernel.getAdminIndexUploadRecord(kv, record.revision)).html, html);
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
  const indexRecord = await buildAdminLocalIndexUploadRecord(
    `<!doctype html><html><head><script src="${upstreamUrl}"></script></head><body><div id="app"></div></body></html>`,
    "index.html"
  );
  const manifestEntry = indexRecord.manifest.entries[0];
  const { kv } = createInMemoryKvStore({
    [kernel.buildAdminIndexUploadKey(indexRecord.revision)]: indexRecord
  });
  const env = { ENI_KV: kv };
  const cacheReads = [];
  const cacheWrites = [];
  const edgeCache = {
    async match(request) {
      const url = new URL(request.url);
      cacheReads.push(url.hostname);
      if (url.hostname === "admin-release-vendor-manifest.invalid") {
        return new Response(JSON.stringify({
          ...indexRecord.manifest,
          entries: [manifestEntry]
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
      new Request(`https://worker.test/admin/__release/${indexRecord.assetRevision}/vendor/${manifestEntry.assetKey}`),
      env,
      null,
      { releaseTag: indexRecord.assetRevision, assetKey: manifestEntry.assetKey },
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
  const indexRecord = await buildAdminLocalIndexUploadRecord(
    `<!doctype html><html><head><script src="${upstreamUrl}"></script></head><body><div id="app"></div></body></html>`,
    "index.html"
  );
  const manifestEntry = indexRecord.manifest.entries[0];
  const { kv } = createInMemoryKvStore({
    [kernel.buildAdminIndexUploadKey(indexRecord.revision)]: indexRecord
  });
  const env = { ENI_KV: kv };
  const cacheReads = [];
  const cacheWrites = [];
  const edgeCache = {
    async match(request) {
      const url = new URL(request.url);
      cacheReads.push(url.hostname);
      if (url.hostname === "admin-release-vendor-manifest.invalid") {
        return new Response(JSON.stringify({
          ...indexRecord.manifest,
          entries: [manifestEntry]
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
      new Request(`https://worker.test/admin/__release/${indexRecord.assetRevision}/vendor/${manifestEntry.assetKey}`),
      env,
      null,
      { releaseTag: indexRecord.assetRevision, assetKey: manifestEntry.assetKey },
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
  isolateState.PlaybackInfoResponseCache.clear();
  const execution = {
    requestTraits: { isPlaybackInfoRequest: true },
    playbackInfoCacheKey: "playback-info:oversized",
    requestMethod: "POST",
    playbackInfoCacheTtlSec: 60,
    nodeName: "alpha",
    nodeDerivedCacheRevision: "rev-1"
  };
  const oversizedBody = "x".repeat(Config.Defaults.PlaybackInfoCacheEntryMaxBytes + 1);
  const stored = await proxyService.storePlaybackInfoResponseCache(execution, new Response(oversizedBody, {
    headers: { "Content-Type": "application/json" }
  }));
  assert.equal(stored, false);
  assert.equal(isolateState.PlaybackInfoResponseCache.size, 0);
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
  const result = await proxyService.maybeRewritePlaybackInfoResponse(execution, upstreamState);
  assert.equal(result, upstreamState);
  assert.equal(execution.playbackInfoRewrite, "not_needed");
  assert.equal((await response.text()).length, oversizedBody.length);
});

test("PlaybackInfo passthrough decodes nested object fields and removes invalid entries", async () => {
  const execution = {
    requestTraits: { isPlaybackInfoRequest: true },
    effectivePlaybackInfoMode: "passthrough",
    requestMethod: "POST",
    playbackInfoRewrite: ""
  };
  const upstreamState = {
    response: new Response(JSON.stringify({
      PlaySessionId: "session-1",
      MediaSources: JSON.stringify([
        JSON.stringify({
          Id: "encoded-source",
          MediaStreams: [JSON.stringify({ Index: 0, Codec: "h264" }), "invalid-stream"],
          MediaAttachments: JSON.stringify([{ Codec: "srt" }, null]),
          RequiredHttpHeaders: JSON.stringify({ "X-Media-Token": "token" })
        }),
        {
          Id: "valid-source",
          Path: "/Videos/1/stream",
          MediaStreams: "invalid-streams",
          MediaAttachments: null,
          RequiredHttpHeaders: "invalid-headers"
        },
        null,
        ["array-source"]
      ])
    }), {
      headers: {
        "Content-Type": "application/json",
        "Content-Length": "999",
        "ETag": "stale-etag",
        "Digest": "sha-256=stale",
        "X-Upstream": "preserved"
      }
    })
  };

  const result = await proxyService.maybeRewritePlaybackInfoResponse(execution, upstreamState);
  assert.notEqual(result, upstreamState);
  assert.equal(execution.playbackInfoRewrite, "applied");
  assert.deepEqual(await result.response.json(), {
    PlaySessionId: "session-1",
    MediaSources: [
      {
        Id: "encoded-source",
        MediaStreams: [{ Index: 0, Codec: "h264" }],
        MediaAttachments: [{ Codec: "srt" }],
        RequiredHttpHeaders: { "X-Media-Token": "token" }
      },
      {
        Id: "valid-source",
        Path: "/Videos/1/stream",
        MediaStreams: [],
        MediaAttachments: [],
        RequiredHttpHeaders: {}
      }
    ]
  });
  assert.equal(result.response.headers.get("Content-Length"), null);
  assert.equal(result.response.headers.get("ETag"), null);
  assert.equal(result.response.headers.get("Digest"), null);
  assert.equal(result.response.headers.get("X-Upstream"), "preserved");
});

test("PlaybackInfo passthrough replaces an invalid media source container with an empty array", async () => {
  const execution = {
    requestTraits: { isPlaybackInfoRequest: true },
    effectivePlaybackInfoMode: "passthrough",
    requestMethod: "POST",
    playbackInfoRewrite: ""
  };
  const upstreamState = {
    response: new Response(JSON.stringify({ MediaSources: "invalid-sources" }), {
      headers: { "Content-Type": "application/json" }
    })
  };

  const result = await proxyService.maybeRewritePlaybackInfoResponse(execution, upstreamState);
  assert.deepEqual((await result.response.json()).MediaSources, []);
  assert.equal(execution.playbackInfoRewrite, "applied");
});

test("valid PlaybackInfo passthrough keeps the original response unchanged", async () => {
  const bodyText = '{\n  "MediaSources": [{"Id":"valid-source","MediaStreams":[{"Index":0}],"MediaAttachments":[],"RequiredHttpHeaders":{}}],\n  "Marker": "original-bytes"\n}';
  const execution = {
    requestTraits: { isPlaybackInfoRequest: true },
    effectivePlaybackInfoMode: "passthrough",
    requestMethod: "POST",
    playbackInfoRewrite: ""
  };
  const upstreamState = {
    response: new Response(bodyText, {
      headers: { "Content-Type": "application/json", "ETag": "preserved-etag" }
    })
  };

  const result = await proxyService.maybeRewritePlaybackInfoResponse(execution, upstreamState);
  assert.equal(result, upstreamState);
  assert.equal(result.response, upstreamState.response);
  assert.equal(execution.playbackInfoRewrite, "passthrough");
  assert.equal(result.response.headers.get("ETag"), "preserved-etag");
  assert.equal(await result.response.text(), bodyText);
});

test("non-JSON and oversized PlaybackInfo passthrough responses remain untouched", async () => {
  const makeExecution = () => ({
    requestTraits: { isPlaybackInfoRequest: true },
    effectivePlaybackInfoMode: "passthrough",
    requestMethod: "POST",
    playbackInfoRewrite: ""
  });
  const textState = {
    response: new Response("upstream text", { headers: { "Content-Type": "text/plain" } })
  };
  const textExecution = makeExecution();
  assert.equal(await proxyService.maybeRewritePlaybackInfoResponse(textExecution, textState), textState);
  assert.equal(textExecution.playbackInfoRewrite, "passthrough");
  assert.equal(await textState.response.text(), "upstream text");

  const oversizedBody = "x".repeat(Config.Defaults.PlaybackInfoCacheEntryMaxBytes + 1);
  const oversizedState = {
    response: new Response(oversizedBody, { headers: { "Content-Type": "application/json" } })
  };
  const oversizedExecution = makeExecution();
  assert.equal(await proxyService.maybeRewritePlaybackInfoResponse(oversizedExecution, oversizedState), oversizedState);
  assert.equal(oversizedExecution.playbackInfoRewrite, "passthrough");
  assert.equal((await oversizedState.response.text()).length, oversizedBody.length);
});

test("PlaybackInfo rewrite reuses its bounded body snapshot for isolate caching", async () => {
  isolateState.PlaybackInfoResponseCache.clear();
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

    const rewrittenState = await proxyService.maybeRewritePlaybackInfoResponse(execution, upstreamState);
    assert.equal(cloneCount, 1);
    assert.equal(execution.playbackInfoCacheBodyResolved, true);
    assert.ok(execution.playbackInfoCacheBody?.bytes > 0);

    const stored = await proxyService.storePlaybackInfoResponseCache(execution, rewrittenState.response);
    assert.equal(stored, true);
    assert.equal(cloneCount, 1, "cache storage must reuse the rewrite snapshot");
    assert.equal(isolateState.PlaybackInfoResponseCache.get("playback-info:single-read")?.bodyText, execution.playbackInfoCacheBody.text);
  } finally {
    Object.defineProperty(Response.prototype, "clone", originalCloneDescriptor);
    isolateState.PlaybackInfoResponseCache.clear();
  }
});

test("PlaybackInfo cache evicts oldest entries at its total byte budget", () => {
  isolateState.PlaybackInfoResponseCache.clear();
  const entryBytes = Config.Defaults.PlaybackInfoCacheEntryMaxBytes;
  const entryCount = Math.floor(Config.Defaults.PlaybackInfoCacheTotalMaxBytes / entryBytes) + 1;
  for (let index = 0; index < entryCount; index += 1) {
    isolateState.PlaybackInfoResponseCache.set(`entry-${index}`, {
      bodyText: "",
      bodyBytes: entryBytes,
      expiresAt: Date.now() + 60000
    });
  }
  proxyService.cleanupPlaybackInfoResponseCache();
  assert.equal(isolateState.PlaybackInfoResponseCache.has("entry-0"), false);
  assert.equal(isolateState.PlaybackInfoResponseCache.has(`entry-${entryCount - 1}`), true);
  const retainedBytes = [...isolateState.PlaybackInfoResponseCache.values()]
    .reduce((total, entry) => total + entry.bodyBytes, 0);
  assert.ok(retainedBytes <= Config.Defaults.PlaybackInfoCacheTotalMaxBytes);
  isolateState.PlaybackInfoResponseCache.clear();
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
  const transport = await proxyService.buildProxyRequestState(
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
  const execution = {
    requestMethod: "POST",
    requestUrl: new URL("https://worker.test/Sessions/Playing/Progress?ItemId=query-item"),
    request
  };
  const parsed = proxyService.parsePlaybackSessionControlPayload(execution, transport);
  assert.equal(parsed.parseError, true);
  assert.equal(parsed.parseMode, "stream");
  assert.equal(parsed.parseErrorReason, "unbuffered_body");
  assert.equal(parsed.query.itemid, "query-item");

  const oversizedRequest = new Request("https://worker.test/Sessions/Playing?ItemId=oversized-query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(256 * 1024 + 1)
    },
    body: JSON.stringify({ ItemId: "body-item" })
  });
  const oversizedTransport = await proxyService.buildProxyRequestState(
    oversizedRequest,
    {},
    "/Sessions/Playing",
    new URL(oversizedRequest.url),
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
  assert.equal(oversizedTransport.preparedBodyMode, "stream");
  const oversizedParsed = proxyService.parsePlaybackSessionControlPayload({
    requestMethod: "POST",
    requestUrl: new URL(oversizedRequest.url),
    request: oversizedRequest
  }, oversizedTransport);
  assert.equal(oversizedParsed.parseErrorReason, "unbuffered_body");
  assert.equal(oversizedParsed.query.itemid, "oversized-query");
});

test("Hills text/plain playback controls parse bounded JSON without changing transport", () => {
  const bodyText = JSON.stringify({
    SessionId: "hills-session",
    ItemId: "episode-86802",
    Item: { Name: "Episode 1", Type: "Episode", SeriesName: "Series 1" }
  });
  const execution = {
    nodeName: "nay",
    requestMethod: "POST",
    requestUrl: new URL("https://worker.test/Sessions/Playing"),
    request: new Request("https://worker.test/Sessions/Playing", { method: "POST" })
  };
  const transport = {
    preparedBodyMode: "buffered",
    preparedBodyText: bodyText,
    preparedBody: new TextEncoder().encode(bodyText),
    newHeaders: new Headers({ "Content-Type": "text/plain", "Content-Length": String(bodyText.length) })
  };
  const parsed = proxyService.parsePlaybackSessionControlPayload(execution, transport);
  const media = proxyService.resolveServerLastWatchMedia(execution, transport);
  assert.equal(parsed.parseError, false);
  assert.equal(parsed.parseMode, "text_plain_json");
  assert.deepEqual(media, {
    itemId: "episode-86802",
    itemName: "Episode 1",
    itemType: "Episode",
    seriesName: "Series 1",
    originalTitle: "",
    year: null,
    imageTag: ""
  });
  assert.equal(transport.preparedBodyText, bodyText);
  assert.equal(transport.newHeaders.get("Content-Type"), "text/plain");

  const invalidExecution = {
    ...execution,
    playbackSessionControlPayload: null,
    requestUrl: new URL("https://worker.test/Sessions/Playing?ItemId=query-fallback")
  };
  const invalid = proxyService.parsePlaybackSessionControlPayload(invalidExecution, {
    ...transport,
    preparedBodyText: "not-json"
  });
  assert.equal(invalid.parseError, true);
  assert.equal(invalid.parseMode, "text_plain_invalid");
  assert.equal(invalid.query.itemid, "query-fallback");

  const arrayExecution = {
    ...execution,
    playbackSessionControlPayload: null
  };
  const arrayPayload = proxyService.parsePlaybackSessionControlPayload(arrayExecution, {
    ...transport,
    preparedBodyText: JSON.stringify([{ ItemId: "array-item" }])
  });
  assert.equal(arrayPayload.parseError, true);
  assert.equal(arrayPayload.parseMode, "text_plain_invalid");
  assert.deepEqual(arrayPayload.body, {});
});

test("playback progress relay enforces its bounded session table on insertion", () => {
  const relayMap = isolateState.PlaybackProgressRelay;
  relayMap.clear();
  const maxEntries = Config.Defaults.VideoProgressForwardSessionMax;
  const execution = {
    videoProgressForwardIntervalSec: 3,
    nodeName: "alpha",
    nodeDerivedCacheRevision: "rev-1",
    ctx: { waitUntil() {} }
  };
  for (let index = 0; index < maxEntries + 1; index += 1) {
    proxyService.markPlaybackProgressRelayStopped(`session-${index}`, execution);
  }
  assert.equal(relayMap.size, maxEntries);
  assert.equal(relayMap.has("session-0"), false);
  assert.equal(relayMap.has(`session-${maxEntries}`), true);
  relayMap.clear();
});

test("incremental isolate cleanup covers nonessential proxy-adjacent caches", () => {
  const now = Date.now();
  const staleCases = [
    [5, isolateState.PlaybackInfoResponseCache, "stale-playback", { expiresAt: now - 1 }],
    [6, isolateState.ProxyFailoverStateCache, "stale-failover", {
      preferredTargetExpiresAt: now - 1,
      failingTargets: new Map(),
      inFlightProbe: null,
      lastProbeResult: null
    }],
    [7, isolateState.PlaybackProgressRelay, "stale-progress", { lastTouchedAt: now - 120000 }],
    [8, isolateState.ServerRecordWatchSessions, "stale-watch", { lastSeenAt: now - 31 * 60 * 1000 }],
    [9, isolateState.DashboardMonthlyTrafficCache, "stale-month", { staleUntil: now - 1 }]
  ];
  for (const [phase, cache, key, value] of staleCases) {
    cache.clear();
    cache.set(key, value);
    isolateState.CleanupState.phase = phase;
    isolateState.CleanupState.lastRunAt = 0;
    isolateState.CleanupState.iterators = {};
    cachePort.maybeCleanup();
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
  const scope = kernel.OPS_STATUS_DB_SCOPE_ROOT;

  assert.equal(await kernel.getOpsStatusPayloadFromDb(recorder.db, scope), null);
  assert.equal(await kernel.getOpsStatusPayloadFromDb(recorder.db, scope), null);
  assert.equal(recorder.prepared.filter(record => /^SELECT payload FROM sys_status/i.test(record.sql.trim())).length, 1);
  assert.equal(recorder.prepared.filter(record => /^CREATE TABLE IF NOT EXISTS sys_status/i.test(record.sql.trim())).length, 1);

  await kernel.putOpsStatusPayloadToDb(recorder.db, scope, { log: { status: "ready" } }, Date.now());
  assert.deepEqual(await kernel.getOpsStatusPayloadFromDb(recorder.db, scope), { log: { status: "ready" } });
  const selectCountBeforePatch = recorder.prepared.filter(record => /^SELECT payload FROM sys_status/i.test(record.sql.trim())).length;
  await kernel.patchOpsStatus(recorder.db, { log: { lastFlushStatus: "success" } });
  assert.equal(
    recorder.prepared.filter(record => /^SELECT payload FROM sys_status/i.test(record.sql.trim())).length,
    selectCountBeforePatch,
    "a hot status patch must not reread root or all section scopes"
  );
  assert.equal(recorder.prepared.filter(record => /^INSERT INTO sys_status/i.test(record.sql.trim())).length, 2);
});

test("Cloudflare runtime stale fallback performs one D1 cache lookup", async () => {
  const cacheOperations = { ...kernel };
  Object.assign(cacheOperations, defineAnalyticsCacheMethods({}, cacheOperations));
  let cacheReadCount = 0;
  cacheOperations.getCfRuntimeCacheEntry = async () => {
    cacheReadCount += 1;
    return {
      payload: { cached: true },
      cachedAt: 1,
      expiresAt: 2,
      updatedAt: 1
    };
  };
  await assert.rejects(
    cacheOperations.loadCfRuntimeCachePayload({}, {
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
    kernel.ensureLogsBaseSchema(logRecorder.db),
    kernel.ensureLogsBaseSchema(logRecorder.db)
  ]);
  await kernel.ensureLogsBaseSchema(logRecorder.db);
  await Promise.all([
    kernel.ensureStatsHourlySchema(logRecorder.db),
    kernel.ensureStatsHourlySchema(logRecorder.db)
  ]);

  assert.equal(logRecorder.prepared.filter(record => /CREATE TABLE IF NOT EXISTS proxy_logs \(/.test(record.sql)).length, 1);
  assert.equal(logRecorder.prepared.filter(record => /CREATE TABLE IF NOT EXISTS proxy_stats_hourly \(/.test(record.sql)).length, 1);
  assert.ok(logRecorder.prepared.some(record => /idx_proxy_logs_client_time/.test(record.sql)));
  kernel.invalidateD1SchemaReadiness(logRecorder.db, "logs");
  await kernel.ensureLogsBaseSchema(logRecorder.db);
  assert.equal(logRecorder.prepared.filter(record => /CREATE TABLE IF NOT EXISTS proxy_logs \(/.test(record.sql)).length, 2);

  const dnsRecorder = createD1Recorder();
  await Promise.all([
    kernel.ensureDnsIpWorkspaceSchema(dnsRecorder.db),
    kernel.ensureDnsIpWorkspaceSchema(dnsRecorder.db)
  ]);
  await kernel.ensureDnsIpWorkspaceSchema(dnsRecorder.db);

  assert.equal(dnsRecorder.prepared.filter(record => /CREATE TABLE IF NOT EXISTS dns_ip_pool_items \(/.test(record.sql)).length, 1);
  assert.ok(dnsRecorder.prepared.some(record => /idx_dns_ip_pool_items_updated_ip/.test(record.sql)));
  assert.ok(dnsRecorder.prepared.some(record => /idx_dns_ip_probe_cache_colo_ip_expires/.test(record.sql)));
  kernel.invalidateD1SchemaReadiness(dnsRecorder.db, "all");
  await kernel.ensureDnsIpWorkspaceSchema(dnsRecorder.db);
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
  await kernel.upsertDnsIpPoolItems(recorder.db, [{
    id: "item-v2",
    ip: "203.0.113.10",
    sourceKind: "manual",
    sourceLabel: "manual"
  }]);
  const itemUpsertSql = recorder.prepared.find(record => /INSERT INTO dns_ip_pool_items/.test(record.sql))?.sql || "";
  assert.doesNotMatch(itemUpsertSql, /id\s*=\s*excluded\.id/);

  await kernel.persistDnsIpPoolSources({ db: recorder.db }, [{
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
  await kernel.getDnsIpProbeCacheEntries(recorder.db, ips, "SJC");
  const bulkQueries = recorder.prepared.filter(record => /WHERE entry_colo = \? AND expires_at > \? AND ip IN/.test(record.sql));
  assert.equal(bulkQueries.length, 2);
  assert.ok(bulkQueries.every(record => record.bindings.length <= 100));
  assert.equal(Math.max(...bulkQueries.map(record => record.bindings.length)), 100);
});

test("playback session keys are partitioned by node even when Emby session ids match", () => {
  const makeExecution = (nodeName) => ({
    nodeName,
    requestMethod: "POST",
    requestUrl: new URL("https://proxy.test/Sessions/Playing/Progress"),
    proxyPath: "/Sessions/Playing/Progress",
    clientIp: "203.0.113.10",
    request: new Request("https://proxy.test/Sessions/Playing/Progress", { method: "POST" }),
    requestTraits: { isPlaybackProgressRequest: true }
  });
  const transport = {
    preparedBodyMode: "buffered",
    preparedBodyText: JSON.stringify({ SessionId: "shared-session", PlaySessionId: "shared-play", ItemId: "movie-1" }),
    newHeaders: new Headers({ "Content-Type": "application/json" })
  };
  const first = proxyService.resolvePlaybackProgressSessionKey(makeExecution("server-a"), transport);
  const second = proxyService.resolvePlaybackProgressSessionKey(makeExecution("server-b"), transport);
  assert.equal(first.sessionKey, "server-a|session:shared-session");
  assert.equal(second.sessionKey, "server-b|session:shared-session");
  assert.notEqual(first.sessionKey, second.sessionKey);
  assert.match(first.sessionIdentityFingerprint, /^[0-9a-f]{16}$/);
  assert.match(first.sessionFingerprint, /^[0-9a-f]{16}$/);
  assert.notEqual(first.sessionFingerprint, second.sessionFingerprint);

  const deviceTransport = {
    preparedBodyMode: "buffered",
    preparedBodyText: JSON.stringify({ DeviceId: "device-strong-value", ItemId: "movie-device" }),
    newHeaders: new Headers({ "Content-Type": "application/json" })
  };
  const device = proxyService.resolvePlaybackProgressSessionKey(makeExecution("server-a"), deviceTransport);
  assert.equal(device.sessionStrength, "weak");
  assert.match(device.sessionIdentityFingerprint, /^[0-9a-f]{16}$/);
  assert.match(device.sessionFingerprint, /^[0-9a-f]{16}$/);
  assert.doesNotMatch(`${device.sessionIdentityFingerprint}:${device.sessionFingerprint}`, /device-strong-value|movie-device/);

  const makeFallbackExecution = (proxyPath) => ({
    ...makeExecution("server-a"),
    proxyPath,
    requestUrl: new URL(`https://proxy.test${proxyPath}`),
    request: new Request(`https://proxy.test${proxyPath}`, {
      method: "POST",
      headers: { Authorization: "MediaBrowser Token=private", "X-Emby-Device-Id": "device-1" }
    })
  });
  const fallbackTransport = {
    preparedBodyMode: "buffered",
    preparedBodyText: JSON.stringify({ ItemId: "movie-1" }),
    newHeaders: new Headers({ "Content-Type": "application/json" })
  };
  const started = proxyService.resolvePlaybackProgressSessionKey(makeFallbackExecution("/Sessions/Playing"), fallbackTransport);
  const stopped = proxyService.resolvePlaybackProgressSessionKey(makeFallbackExecution("/Sessions/Playing/Stopped"), fallbackTransport);
  assert.equal(started.sessionKey, stopped.sessionKey);
  assert.doesNotMatch(started.sessionKey, /private|device-1|movie-1/);
  assert.match(started.sessionIdentityFingerprint, /^[0-9a-f]{16}$/);
  assert.match(started.sessionFingerprint, /^[0-9a-f]{16}$/);
  assert.doesNotMatch(`${started.sessionIdentityFingerprint}:${started.sessionFingerprint}`, /private|device-1|movie-1/);
});

test("server record playback context requires matching PlaybackInfo and item details", async () => {
  const tasks = [];
  const writes = [];
  const originalUpsert = kernel.upsertServerWatchLifecycle;
  kernel.upsertServerWatchLifecycle = async (_db, event) => {
    writes.push(event);
    return { admitted: true, schemaVersion: 9 };
  };
  isolateState.ServerRecordWatchSessions.clear();
  isolateState.ServerRecordPlaybackContexts.clear();
  const makeExecution = (nodeName, method, proxyPath, search = "", traits = {}) => {
    const url = `https://proxy.test${proxyPath}${search}`;
    return {
      nodeName,
      node: { serverRecord: { enabled: true } },
      startTime: 123_456,
      requestMethod: method,
      proxyPath,
      requestUrl: new URL(url),
      request: new Request(url, {
        method,
        headers: { "X-Emby-Device-Id": "device-context" }
      }),
      requestTraits: traits,
      env: { DB: {} },
      ctx: { waitUntil(task) { tasks.push(task); } }
    };
  };
  const detailPayload = {
    Id: "episode-context",
    Name: "Context episode",
    Type: "Episode",
    SeriesName: "Context series",
    SeriesOriginalTitle: "Original context series",
    SeriesProductionYear: 2024,
    ImageTags: { Primary: "context-poster" }
  };
  const detailExecution = () => makeExecution(
    "server-a",
    "GET",
    "/Users/user-a/Items/episode-context",
    "?DeviceId=device-context"
  );
  const playbackExecution = () => makeExecution(
    "server-a",
    "POST",
    "/Items/episode-context/PlaybackInfo",
    "?IsPlayback=true&DeviceId=device-context",
    { isPlaybackInfoRequest: true }
  );
  const lifecycleExecution = () => makeExecution(
    "server-a",
    "POST",
    "/Sessions/Playing",
    "?DeviceId=device-context",
    { isPlaybackStartedRequest: true }
  );
  const lifecycleTransport = {
    preparedBodyMode: "buffered",
    preparedBodyText: JSON.stringify({ SessionId: "context-session", DeviceId: "device-context" }),
    newHeaders: new Headers({ "Content-Type": "text/plain" })
  };
  try {
    assert.equal(
      proxyService.observeServerRecordPlaybackItemDetails(
        detailExecution(),
        new Response(JSON.stringify(detailPayload), { headers: { "Content-Type": "application/json; charset=utf-8" } })
      ),
      true
    );
    await Promise.all(tasks.splice(0));
    assert.equal(proxyService.getServerRecordPlaybackContextMedia(lifecycleExecution(), lifecycleTransport), null);

    assert.equal(proxyService.recordServerRecordPlaybackInfoIntent(playbackExecution(), null, 503), false);
    assert.equal(proxyService.getServerRecordPlaybackContextMedia(lifecycleExecution(), lifecycleTransport), null);
    assert.equal(proxyService.recordServerRecordPlaybackInfoIntent(playbackExecution()), true);
    const verified = proxyService.getServerRecordPlaybackContextMedia(lifecycleExecution(), lifecycleTransport);
    assert.deepEqual(verified, {
      itemId: "episode-context",
      itemName: "Context episode",
      itemType: "Episode",
      seriesName: "Context series",
      originalTitle: "Original context series",
      year: 2024,
      imageTag: "context-poster"
    });
    const lifecycle = lifecycleExecution();
    assert.equal(proxyService.scheduleServerWatchLifecycle(lifecycle, lifecycleTransport), true);
    await Promise.all(tasks.splice(0));
    assert.equal(writes.length, 1);
    assert.deepEqual(writes[0].media, verified);
    assert.equal(lifecycle.serverWatchLifecycleDiagnostic.decision, "fallback_playback_context");

    const directLifecycle = lifecycleExecution();
    const directTransport = {
      ...lifecycleTransport,
      preparedBodyText: JSON.stringify({
        SessionId: "context-session-direct",
        DeviceId: "device-context",
        ItemId: "episode-context",
        ItemName: "Event title"
      })
    };
    assert.equal(proxyService.scheduleServerWatchLifecycle(directLifecycle, directTransport), true);
    await Promise.all(tasks.splice(0));
    assert.equal(writes.length, 2);
    assert.deepEqual(writes[1].media, {
      ...verified,
      itemName: "Event title"
    });
    assert.equal(directLifecycle.serverWatchLifecycleDiagnostic.decision, "scheduled");

    isolateState.ServerRecordPlaybackContexts.clear();
    assert.equal(proxyService.recordServerRecordPlaybackInfoIntent(playbackExecution()), true);
    assert.equal(
      proxyService.observeServerRecordPlaybackItemDetails(
        detailExecution(),
        new Response(JSON.stringify(detailPayload), { headers: { "Content-Type": "application/json; charset=utf-8" } })
      ),
      true
    );
    await Promise.all(tasks.splice(0));
    assert.equal(proxyService.getServerRecordPlaybackContextMedia(lifecycleExecution(), lifecycleTransport)?.itemId, "episode-context");

    isolateState.ServerRecordPlaybackContexts.clear();
    assert.equal(
      proxyService.observeServerRecordPlaybackItemDetails(
        detailExecution(),
        new Response(JSON.stringify(detailPayload), { headers: { "Content-Type": "application/json; charset=utf-8" } })
      ),
      true
    );
    assert.equal(
      proxyService.observeServerRecordPlaybackItemDetails(
        makeExecution("server-a", "GET", "/Items/episode-context/Images/Primary", "?DeviceId=device-context"),
        new Response("image", { headers: { "Content-Type": "image/jpeg" } })
      ),
      false
    );
    await Promise.all(tasks.splice(0));
    assert.equal(proxyService.recordServerRecordPlaybackInfoIntent(playbackExecution()), true);
    assert.equal(
      proxyService.getServerRecordPlaybackContextMedia(
        makeExecution("server-b", "POST", "/Sessions/Playing", "?DeviceId=device-context", { isPlaybackStartedRequest: true }),
        lifecycleTransport
      ),
      null
    );
    assert.equal(
      proxyService.getServerRecordPlaybackContextMedia(
        makeExecution("server-a", "POST", "/Sessions/Playing", "?DeviceId=other-device", { isPlaybackStartedRequest: true }),
        { ...lifecycleTransport, preparedBodyText: JSON.stringify({ DeviceId: "other-device" }) }
      ),
      null
    );
    assert.equal(
      proxyService.observeServerRecordPlaybackItemDetails(
        detailExecution(),
        new Response("not-json", { headers: { "Content-Type": "text/plain" } })
      ),
      false
    );
  } finally {
    kernel.upsertServerWatchLifecycle = originalUpsert;
    isolateState.ServerRecordWatchSessions.clear();
    isolateState.ServerRecordPlaybackContexts.clear();
  }
});

test("server watch lifecycle records Playing, dedupes Progress, and finalizes STOP", async () => {
  const tasks = [];
  const writes = [];
  const originalUpsert = kernel.upsertServerWatchLifecycle;
  kernel.upsertServerWatchLifecycle = async (_db, event) => {
    writes.push(event);
    return { admitted: true, schemaVersion: 9 };
  };
  isolateState.ServerRecordWatchSessions.clear();
  const makeExecution = (nodeName, phase, options = {}) => {
    const path = phase === "started" ? "/Sessions/Playing"
      : phase === "progress" ? "/Sessions/Playing/Progress"
        : phase === "stopped" ? "/Sessions/Playing/Stopped" : "/Sessions/Ping";
    return {
      nodeName,
      node: { serverRecord: { enabled: options.enabled !== false } },
      startTime: options.startTime || 123_456,
      requestMethod: options.requestMethod || "POST",
      requestUrl: new URL(`https://proxy.test${path}`),
      request: new Request(`https://proxy.test${path}`, { method: options.requestMethod || "POST" }),
      requestTraits: {
        isPlaybackStartedRequest: phase === "started",
        isPlaybackProgressRequest: phase === "progress",
        isPlaybackStoppedRequest: phase === "stopped"
      },
      env: options.withDb === false ? {} : { DB: {} },
      ctx: { waitUntil(task) { tasks.push(task); } }
    };
  };
  const transport = body => ({
    preparedBodyMode: "buffered",
    newHeaders: new Headers({ "Content-Type": "text/plain" }),
    preparedBodyText: JSON.stringify(body)
  });
  try {
    assert.equal(proxyService.scheduleServerWatchLifecycle(makeExecution("server-a", "ping")), false);
    assert.equal(proxyService.scheduleServerWatchLifecycle(makeExecution("server-a", "stopped", { requestMethod: "GET" })), false);
    assert.equal(proxyService.scheduleServerWatchLifecycle(makeExecution("server-a", "started", { enabled: false })), false);
    assert.equal(proxyService.scheduleServerWatchLifecycle(makeExecution("server-a", "started", { withDb: false })), false);
    const startedBody = {
      SessionId: "session-a",
      ItemId: "episode-1",
      Item: {
        Name: "Episode one",
        Type: "Episode",
        SeriesName: "Series one",
        ImageTags: { Primary: "poster-1" }
      }
    };
    const startedExecution = makeExecution("server-a", "started");
    assert.equal(proxyService.scheduleServerWatchLifecycle(startedExecution, transport(startedBody)), true);
    for (let index = 0; index < 200; index += 1) {
      assert.equal(proxyService.scheduleServerWatchLifecycle(
        makeExecution("server-a", "progress", { startTime: 124_456 + index }),
        transport(startedBody)
      ), false);
    }
    const changedItemBody = {
      ...startedBody,
      ItemId: "episode-2",
      Item: { ...startedBody.Item, Name: "Episode two", ImageTags: { Primary: "poster-2" } }
    };
    assert.equal(proxyService.scheduleServerWatchLifecycle(makeExecution("server-a", "progress", { startTime: 130_000 }), transport(changedItemBody)), true);
    assert.equal(proxyService.scheduleServerWatchLifecycle(makeExecution("server-a", "stopped", { startTime: 234_567 }), transport({ SessionId: "session-a" })), true);
    assert.equal(proxyService.scheduleServerWatchLifecycle(makeExecution("server-a", "progress", { startTime: 235_567 }), transport(changedItemBody)), false);
    const nextItemBody = {
      ...startedBody,
      ItemId: "episode-3",
      Item: { ...startedBody.Item, Name: "Episode three", ImageTags: { Primary: "poster-3" } }
    };
    assert.equal(proxyService.scheduleServerWatchLifecycle(makeExecution("server-a", "progress", { startTime: 235_568 }), transport(nextItemBody)), true);
    assert.equal(proxyService.scheduleServerWatchLifecycle(makeExecution("server-b", "progress", { startTime: 345_678 }), transport({
      PlaySessionId: "play-b",
      ItemId: "movie-2",
      ItemName: "Movie two",
      ItemType: "Movie"
    })), true);
    await Promise.all(tasks);
    assert.equal(writes.length, 5);
    assert.deepEqual(writes.map(write => [write.nodeName, write.phase, write.eventAt]), [
      ["server-a", "started", new Date(123_456).toISOString()],
      ["server-a", "progress", new Date(130_000).toISOString()],
      ["server-a", "stopped", new Date(234_567).toISOString()],
      ["server-a", "progress", new Date(235_568).toISOString()],
      ["server-b", "progress", new Date(345_678).toISOString()]
    ]);
    assert.notEqual(writes[0].sessionFingerprint, writes[1].sessionFingerprint);
    assert.deepEqual(writes[2].media, writes[1].media);
    assert.notEqual(writes[2].sessionFingerprint, writes[3].sessionFingerprint);
    assert.match(writes[3].sessionFingerprint, /^[0-9a-f]{16}$/);
    assert.equal(writes[0].sessionStrength, "strong");
    assert.equal(writes[4].sessionStrength, "strong");
    const watchLogDetail = proxyService.buildStructuredLogDetail(startedExecution, { statusCode: 200 });
    assert.equal(watchLogDetail.watchPhase, "started");
    assert.equal(watchLogDetail.watchDecision, "scheduled");
    assert.equal(watchLogDetail.watchParseMode, "text_plain_json");
    assert.equal(watchLogDetail.watchSessionStrength, "strong");
    assert.doesNotMatch(JSON.stringify(watchLogDetail), /session-a|episode-1|Episode one|poster-1/);
    const handleSource = proxyService.handle.toString();
    const transportPosition = handleSource.indexOf("transport = await kernel.buildProxyRequestState");
    const schedulePosition = handleSource.indexOf("kernel.scheduleServerWatchLifecycle(execution, transport)");
    const upstreamPosition = handleSource.indexOf("kernel.executeUpstreamFlow");
    assert.ok(transportPosition >= 0 && transportPosition < schedulePosition);
    assert.ok(schedulePosition < upstreamPosition);
  } finally {
    kernel.upsertServerWatchLifecycle = originalUpsert;
    isolateState.ServerRecordWatchSessions.clear();
  }
});

test("server watch access logs wait for final D1 decisions without blocking scheduling", async () => {
  const originalUpsert = kernel.upsertServerWatchLifecycle;
  const originalLoggerRecord = logger.record;
  const originalConsoleError = console.error;
  const recorded = [];
  logger.record = (_env, _ctx, logData) => { recorded.push(logData); };
  console.error = () => {};
  isolateState.ServerRecordWatchSessions.clear();
  const cases = [
    {
      nodeName: "watch-log-v8",
      settle(deferred) { deferred.resolve({ admitted: true, schemaVersion: 8, reason: "schema_v8_fallback" }); },
      expectedDecision: "schema_v8_fallback"
    },
    {
      nodeName: "watch-log-deduped",
      settle(deferred) { deferred.resolve({ admitted: false, schemaVersion: 9, reason: "deduped_or_stale" }); },
      expectedDecision: "deduped"
    },
    {
      nodeName: "watch-log-failed",
      settle(deferred) { deferred.reject(new Error("d1 failed")); },
      expectedDecision: "d1_unavailable"
    }
  ];
  try {
    for (const [index, testCase] of cases.entries()) {
      const deferred = createDeferred();
      kernel.upsertServerWatchLifecycle = () => deferred.promise;
      const tasks = [];
      const startTime = Date.now() - 25;
      const execution = {
        nodeName: testCase.nodeName,
        node: { serverRecord: { enabled: true } },
        startTime,
        requestMethod: "POST",
        proxyPath: "/Sessions/Playing",
        requestUrl: new URL("https://proxy.test/Sessions/Playing"),
        request: new Request("https://proxy.test/Sessions/Playing", { method: "POST" }),
        requestTraits: { isPlaybackStartedRequest: true },
        env: { DB: {} },
        ctx: { waitUntil(task) { tasks.push(task); } }
      };
      const transport = {
        preparedBodyMode: "buffered",
        preparedBodyText: JSON.stringify({ SessionId: `session-${index}`, ItemId: `item-${index}` }),
        newHeaders: new Headers({ "Content-Type": "application/json" })
      };
      const beforeCount = recorded.length;
      assert.equal(proxyService.scheduleServerWatchLifecycle(execution, transport), true);
      assert.ok(execution.serverWatchLifecycleTask instanceof Promise);
      proxyService.recordAccessLog(execution, {
        statusCode: 200,
        detailJson: proxyService.buildStructuredLogDetail(execution, { statusCode: 200 })
      });
      proxyService.recordAccessLog(execution, {
        statusCode: 200,
        detailJson: proxyService.buildStructuredLogDetail(execution, { statusCode: 200 })
      });
      assert.equal(recorded.length, beforeCount);
      const capturedResponseTime = Date.now() - startTime;
      testCase.settle(deferred);
      await Promise.all(tasks);
      assert.equal(recorded.length, beforeCount + 1);
      assert.equal(recorded.at(-1).detailJson.watchDecision, testCase.expectedDecision);
      assert.ok(recorded.at(-1).responseTime <= capturedResponseTime + 10);
    }
  } finally {
    kernel.upsertServerWatchLifecycle = originalUpsert;
    logger.record = originalLoggerRecord;
    console.error = originalConsoleError;
    isolateState.ServerRecordWatchSessions.clear();
  }
});

test("last-watch D1 failures stay detached from the proxy response path", async () => {
  const tasks = [];
  const originalUpsert = kernel.upsertServerWatchLifecycle;
  const originalConsoleError = console.error;
  kernel.upsertServerWatchLifecycle = async () => { throw new Error("d1 unavailable"); };
  console.error = () => {};
  try {
    const execution = {
      nodeName: "server-a",
      node: { serverRecord: { enabled: true } },
      startTime: 123_456,
      requestMethod: "POST",
      requestTraits: { isPlaybackStoppedRequest: true },
      env: { DB: {} },
      ctx: { waitUntil(task) { tasks.push(task); } }
    };
    const scheduled = proxyService.scheduleServerWatchLifecycle(execution);
    assert.equal(scheduled, true);
    await assert.doesNotReject(Promise.all(tasks));
    assert.equal(execution.serverWatchLifecycleDiagnostic.decision, "d1_unavailable");
  } finally {
    kernel.upsertServerWatchLifecycle = originalUpsert;
    console.error = originalConsoleError;
  }
});

test("server record probes keep node tokens isolated and report partial counts", async () => {
  const requests = [];
  await withWorkerGlobals({
    fetch: async (url, options = {}) => {
      const parsed = new URL(url);
      const token = new Headers(options.headers).get("X-Emby-Token") || "";
      requests.push({ url: parsed.toString(), token });
      if (/\/System\/Ping$/i.test(parsed.pathname)) return new Response("pong", { status: 200 });
      if (/\/System\/Info$/i.test(parsed.pathname)) {
        return new Response(JSON.stringify({ Id: parsed.hostname === "a.example" ? "server-a-id" : "server-b-id", Version: "4.9.5", IsInMaintenanceMode: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (/\/Items$/i.test(parsed.pathname)) {
        const itemType = parsed.searchParams.get("IncludeItemTypes");
        if (token === "token-b" && itemType === "Episode") return new Response("failed", { status: 503 });
        const totals = { Movie: 10, Series: 20, Episode: 30 };
        return new Response(JSON.stringify({ Items: [], TotalRecordCount: totals[itemType] }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(null, { status: 404 });
    }
  }, async () => {
    const first = await kernel.probeServerRecord("server-a", {
      target: "https://a.example/emby",
      headers: { "X-Emby-Token": "token-a" }
    });
    const second = await kernel.probeServerRecord("server-b", {
      target: "https://b.example/emby",
      headers: { "X-Emby-Token": "token-b" }
    });
    assert.equal(first.runtime.state, "online");
    assert.deepEqual(first.counts, { movies: 10, series: 20, episodes: 30, state: "ok", errors: {} });
    assert.equal(second.counts.state, "partial");
    assert.equal(second.counts.episodes, null);
    assert.equal(second.counts.errors.episodes, "http_503");
    assert.ok(requests.filter(request => request.url.includes("a.example")).every(request => request.token === "token-a"));
    assert.ok(requests.filter(request => request.url.includes("b.example")).every(request => request.token === "token-b"));
    assert.doesNotMatch(JSON.stringify(first), /token-a|a\.example/);
    assert.doesNotMatch(JSON.stringify(second), /token-b|b\.example/);
  });
});

test("server record credentials authenticate before resource statistics and never leak", async () => {
  const requests = [];
  isolateState.ServerRecordAuthCache.clear();
  await withWorkerGlobals({
    fetch: async (url, options = {}) => {
      const parsed = new URL(url);
      const headers = new Headers(options.headers);
      const request = {
        method: String(options.method || "GET"),
        path: parsed.pathname,
        token: headers.get("X-Emby-Token") || "",
        body: String(options.body || "")
      };
      requests.push(request);
      if (/\/System\/Ping$/i.test(parsed.pathname)) return new Response("pong", { status: 200 });
      if (/\/Users\/AuthenticateByName$/i.test(parsed.pathname)) {
        assert.equal(request.method, "POST");
        const credentials = JSON.parse(request.body);
        const token = credentials.Username === "node-user" ? "node-token" : "stats-token";
        if (credentials.Username === "node-user") assert.deepEqual(credentials, { Username: "node-user", Pw: "node-password" });
        else assert.deepEqual(credentials, { Username: "stats-user", Pw: "" });
        return new Response(JSON.stringify({ AccessToken: token, User: { Id: "user-1" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (/\/System\/Info$/i.test(parsed.pathname)) {
        assert.match(request.token, /^(?:stats|node)-token$/);
        return new Response(JSON.stringify({ Id: "server-id", Version: "4.9.5" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (/\/Items$/i.test(parsed.pathname)) {
        assert.match(request.token, /^(?:stats|node)-token$/);
        return new Response(JSON.stringify({ TotalRecordCount: 12 }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(null, { status: 404 });
    }
  }, async () => {
    const result = await kernel.probeServerRecord("credential-node", {
      target: "https://credential.example/emby",
      serverRecordEmbyUsername: "stats-user"
    });
    assert.equal(result.runtime.state, "online");
    assert.deepEqual(result.counts, { movies: 12, series: 12, episodes: 12, state: "ok", errors: {} });
    const cachedResult = await kernel.probeServerRecord("credential-node", {
      target: "https://credential.example/emby",
      serverRecordEmbyUsername: "stats-user"
    });
    assert.deepEqual(cachedResult.counts, { movies: 12, series: 12, episodes: 12, state: "ok", errors: {} });
    const inheritedResult = await kernel.probeServerRecord("inherited-node", {
      target: "https://inherited.example/emby",
      mediaAggregationEmbyUsername: "node-user",
      mediaAggregationEmbyPassword: "node-password"
    });
    assert.deepEqual(inheritedResult.counts, { movies: 12, series: 12, episodes: 12, state: "ok", errors: {} });
    assert.equal(requests.filter(request => /AuthenticateByName/i.test(request.path)).length, 2);
    assert.ok([...isolateState.ServerRecordAuthCache.values()].some(entry => entry?.nodeName === "credential-node"));
    assert.doesNotMatch(JSON.stringify([result, inheritedResult]), /stats-user|node-user|node-password|(?:stats|node)-token|(?:credential|inherited)\.example/);
  });
  isolateState.ServerRecordAuthCache.clear();
});

test("server record authentication failures do not reuse a node proxy token", async () => {
  const requests = [];
  isolateState.ServerRecordAuthCache.clear();
  await withWorkerGlobals({
    fetch: async (url, options = {}) => {
      const parsed = new URL(url);
      const headers = new Headers(options.headers);
      const request = {
        path: parsed.pathname,
        token: headers.get("X-Emby-Token") || ""
      };
      requests.push(request);
      if (/\/System\/Ping$/i.test(parsed.pathname)) {
        assert.equal(request.token, "legacy-node-token");
        return new Response("pong", { status: 200 });
      }
      if (/\/Users\/AuthenticateByName$/i.test(parsed.pathname)) {
        assert.equal(request.token, "");
        return new Response(null, { status: 401 });
      }
      if (/\/System\/Info$/i.test(parsed.pathname)) {
        assert.equal(request.token, "");
        return new Response(JSON.stringify({ Id: "server-id", Version: "4.9.5" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (/\/Items$/i.test(parsed.pathname)) {
        assert.fail("failed dedicated authentication must skip resource statistics");
      }
      return new Response(null, { status: 404 });
    }
  }, async () => {
    const result = await kernel.probeServerRecord("credential-node", {
      target: "https://credential.example/emby",
      headers: { "X-Emby-Token": "legacy-node-token" },
      serverRecordEmbyUsername: "stats-user"
    });
    assert.equal(result.runtime.state, "online");
    assert.equal(result.counts.state, "unavailable");
    assert.deepEqual(result.counts.errors, {
      movies: "http_401",
      series: "http_401",
      episodes: "http_401"
    });
    assert.equal(requests.filter(request => /\/Items$/i.test(request.path)).length, 0);
    assert.doesNotMatch(JSON.stringify(result), /legacy-node-token|credential\.example/);
  });
  isolateState.ServerRecordAuthCache.clear();
});

test("dedicated server record authentication single-flights independently from aggregation", async () => {
  isolateState.ServerRecordAuthCache.clear();
  isolateState.MediaAggregationAuthCache.clear();
  let loginCalls = 0;
  await withWorkerGlobals({
    fetch: async (url) => {
      const parsed = new URL(url);
      if (/\/Users\/AuthenticateByName$/i.test(parsed.pathname)) {
        loginCalls += 1;
        return new Response(JSON.stringify({ AccessToken: "record-token", User: { Id: "record-user" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(null, { status: 404 });
    }
  }, async () => {
    const node = {
      target: "https://record-auth.example/emby",
      serverRecordEmbyUsername: "record-user",
      serverRecordEmbyPassword: "record-password"
    };
    const targetRecord = createTargetRecord(node.target);
    const [first, second] = await Promise.all([
      kernel.authenticateServerRecord("record-auth", node, targetRecord),
      kernel.authenticateServerRecord("record-auth", node, targetRecord)
    ]);
    assert.equal(first?.token, "record-token");
    assert.equal(second?.token, "record-token");
    assert.equal(loginCalls, 1);
    assert.equal(isolateState.ServerRecordAuthCache.size, 1);
    assert.equal(isolateState.MediaAggregationAuthCache.size, 0);
  });
  isolateState.ServerRecordAuthCache.clear();
  isolateState.MediaAggregationAuthCache.clear();
});

test("media aggregation authentication single-flights concurrent logins", async () => {
  isolateState.MediaAggregationAuthCache.clear();
  let loginCalls = 0;
  await withWorkerGlobals({
    fetch: async (url) => {
      const parsed = new URL(url);
      if (/\/Users\/AuthenticateByName$/i.test(parsed.pathname)) {
        loginCalls += 1;
        return new Response(JSON.stringify({ AccessToken: "aggregation-token", User: { Id: "aggregation-user" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(null, { status: 404 });
    }
  }, async () => {
    const node = { target: "https://aggregation-auth.example/emby" };
    const execution = {
      currentConfig: {
        mediaAggregationEmbyUsername: "aggregation-user",
        mediaAggregationEmbyPassword: "aggregation-password"
      },
      upstreamTimeoutMs: 1000,
      request: new Request("https://worker.test/Items/1/PlaybackInfo"),
      requestUrl: new URL("https://worker.test/Items/1/PlaybackInfo")
    };
    const [first, second] = await Promise.all([
      proxyService.getMediaAggregationAuth(execution, "aggregation-auth", node),
      proxyService.getMediaAggregationAuth(execution, "aggregation-auth", node)
    ]);
    assert.equal(first?.token, "aggregation-token");
    assert.equal(second?.token, "aggregation-token");
    assert.equal(loginCalls, 1);
    assert.equal(isolateState.MediaAggregationAuthCache.size, 1);
  });
  isolateState.MediaAggregationAuthCache.clear();
});

test("server record probes coalesce concurrent refreshes and back off retryable failures", async () => {
  const originalProbeServerRecord = kernel.probeServerRecord;
  const node = { target: "https://probe-backoff.example/emby" };
  let probeCalls = 0;
  isolateState.ServerRecordsSnapshotCache.clear();
  isolateState.ServerRecordProbeBackoff.clear();
  kernel.probeServerRecord = async () => {
    probeCalls += 1;
    return {
      runtime: { state: "timeout", checkedAt: "", errorCode: "server_record_timeout" },
      counts: { movies: null, series: null, episodes: null, state: "unavailable", errors: {} }
    };
  };
  try {
    const [first, second] = await Promise.all([
      kernel.getServerRecordProbe("probe-backoff", node, { forceRefresh: true }),
      kernel.getServerRecordProbe("probe-backoff", node, { forceRefresh: true })
    ]);
    assert.equal(first.probe.source, "live");
    assert.equal(second.probe.source, "live");
    assert.equal(probeCalls, 1);

    const throttled = await kernel.getServerRecordProbe("probe-backoff", node, { forceRefresh: true });
    assert.equal(throttled.probe.source, "backoff");
    assert.match(throttled.probe.retryAt, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(probeCalls, 1);

    kernel.invalidateNodeCaches("probe-backoff");
    const afterInvalidation = await kernel.getServerRecordProbe("probe-backoff", node, { forceRefresh: true });
    assert.equal(afterInvalidation.probe.source, "live");
    assert.equal(probeCalls, 2);
  } finally {
    kernel.probeServerRecord = originalProbeServerRecord;
    isolateState.ServerRecordsSnapshotCache.clear();
    isolateState.ServerRecordProbeBackoff.clear();
  }
});

test("node invalidation clears server record auth and watch sessions without a PlaybackInfo cache entry", () => {
  isolateState.PlaybackInfoResponseCache.clear();
  isolateState.ServerRecordAuthCache.clear();
  isolateState.ServerRecordWatchSessions.clear();
  isolateState.ServerRecordAuthCache.set("server-record-auth:alpha", {
    nodeName: "alpha",
    token: "short-lived-token",
    expiresAt: Date.now() + 60000
  });
  isolateState.ServerRecordWatchSessions.set("watch-alpha", { nodeName: "alpha", lastSeenAt: Date.now() });
  isolateState.ServerRecordWatchSessions.set("watch-beta", { nodeName: "beta", lastSeenAt: Date.now() });
  try {
    kernel.invalidateNodeCaches("alpha");
    assert.equal(isolateState.ServerRecordAuthCache.has("server-record-auth:alpha"), false);
    assert.equal(isolateState.ServerRecordWatchSessions.has("watch-alpha"), false);
    assert.equal(isolateState.ServerRecordWatchSessions.has("watch-beta"), true);
  } finally {
    isolateState.PlaybackInfoResponseCache.clear();
    isolateState.ServerRecordAuthCache.clear();
    isolateState.ServerRecordWatchSessions.clear();
  }
});

test("server record probes derive status from Ping without using System Info flags or authorization", async () => {
  await withWorkerGlobals({
    fetch: async (url) => {
      const parsed = new URL(url);
      if (/\/System\/Ping$/i.test(parsed.pathname)) {
        if (parsed.hostname === "ping-forbidden.example") return new Response(null, { status: 403 });
        return new Response("pong", { status: 200 });
      }
      if (/\/System\/Info$/i.test(parsed.pathname)) {
        if (parsed.hostname === "unauthorized.example") return new Response(null, { status: 401 });
        return new Response(JSON.stringify({
          IsInMaintenanceMode: parsed.hostname === "maintenance.example",
          IsShuttingDown: parsed.hostname === "shutdown.example"
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (/\/Items$/i.test(parsed.pathname)) {
        if (parsed.hostname === "unauthorized.example") return new Response(null, { status: 401 });
        return new Response(JSON.stringify({ TotalRecordCount: 1 }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(null, { status: 404 });
    }
  }, async () => {
    const maintenance = await kernel.probeServerRecord("maintenance", { target: "https://maintenance.example" });
    const shutdown = await kernel.probeServerRecord("shutdown", { target: "https://shutdown.example" });
    const unauthorized = await kernel.probeServerRecord("unauthorized", { target: "https://unauthorized.example" });
    const pingForbidden = await kernel.probeServerRecord("ping-forbidden", { target: "https://ping-forbidden.example" });
    assert.equal(maintenance.runtime.state, "online");
    assert.equal(shutdown.runtime.state, "online");
    assert.equal(unauthorized.runtime.state, "online");
    assert.equal(unauthorized.runtime.detailsLimited, true);
    assert.equal(unauthorized.counts.state, "unavailable");
    assert.equal(pingForbidden.runtime.state, "unauthorized");
  });
});

test("server record probes report unauthorized only when every target rejects credentials", async () => {
  const pingHosts = [];
  await withWorkerGlobals({
    fetch: async (url) => {
      const parsed = new URL(url);
      if (/\/System\/Ping$/i.test(parsed.pathname)) {
        pingHosts.push(parsed.hostname);
        return parsed.hostname === "unauthorized.example"
          ? new Response(null, { status: 401 })
          : new Response(null, { status: 503 });
      }
      return new Response(null, { status: 500 });
    }
  }, async () => {
    const mixed = await kernel.probeServerRecord("mixed", {
      activeLineId: "unauthorized",
      lines: [
        { id: "unauthorized", target: "https://unauthorized.example" },
        { id: "unavailable", target: "https://unavailable.example" }
      ]
    });
    assert.deepEqual(pingHosts, ["unauthorized.example", "unavailable.example"]);
    assert.equal(mixed.runtime.state, "offline");
    assert.equal(mixed.runtime.errorCode, "http_503");
  });
});

test("server record probe backoff recognizes actual network failures", async () => {
  const node = { target: "https://network-failure.example" };
  let fetchCalls = 0;
  isolateState.ServerRecordsSnapshotCache.clear();
  isolateState.ServerRecordProbeBackoff.clear();
  try {
    await withWorkerGlobals({
      fetch: async () => {
        fetchCalls += 1;
        throw new Error("network down");
      }
    }, async () => {
      const first = await kernel.getServerRecordProbe("network-failure", node, { forceRefresh: true });
      assert.equal(first.runtime.state, "offline");
      assert.equal(first.runtime.errorCode, "server_record_network_error");
      assert.equal(first.probe.source, "live");
      const second = await kernel.getServerRecordProbe("network-failure", node, { forceRefresh: true });
      assert.equal(second.probe.source, "backoff");
      assert.equal(fetchCalls, 1);
    });
  } finally {
    isolateState.ServerRecordsSnapshotCache.clear();
    isolateState.ServerRecordProbeBackoff.clear();
  }
});

test("server record probe backoff recognizes actual timeout failures", async () => {
  const node = { target: "https://timeout-failure.example" };
  let fetchCalls = 0;
  isolateState.ServerRecordsSnapshotCache.clear();
  isolateState.ServerRecordProbeBackoff.clear();
  try {
    await withWorkerGlobals({
      fetch: async () => {
        fetchCalls += 1;
        const error = new Error("request aborted");
        error.name = "AbortError";
        throw error;
      }
    }, async () => {
      const first = await kernel.getServerRecordProbe("timeout-failure", node, { forceRefresh: true });
      assert.equal(first.runtime.state, "timeout");
      assert.equal(first.runtime.errorCode, "server_record_timeout");
      const second = await kernel.getServerRecordProbe("timeout-failure", node, { forceRefresh: true });
      assert.equal(second.probe.source, "backoff");
      assert.equal(fetchCalls, 1);
    });
  } finally {
    isolateState.ServerRecordsSnapshotCache.clear();
    isolateState.ServerRecordProbeBackoff.clear();
  }
});

test("server record probes follow active-line fallback order after Ping HTTP failures", async () => {
  const hosts = [];
  await withWorkerGlobals({
    fetch: async (url) => {
      const parsed = new URL(url);
      hosts.push(parsed.hostname);
      if (/\/System\/Ping$/i.test(parsed.pathname)) {
        return parsed.hostname === "active.example"
          ? new Response(null, { status: 503 })
          : new Response("pong", { status: 200 });
      }
      if (/\/System\/Info$/i.test(parsed.pathname)) {
        return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (/\/Items$/i.test(parsed.pathname)) {
        return new Response(JSON.stringify({ TotalRecordCount: 2 }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(null, { status: 404 });
    }
  }, async () => {
    const result = await kernel.probeServerRecord("fallback", {
      activeLineId: "active",
      lines: [
        { id: "backup", target: "https://backup.example" },
        { id: "active", target: "https://active.example" }
      ]
    });
    assert.equal(result.runtime.state, "online");
    assert.deepEqual(hosts.slice(0, 2), ["active.example", "backup.example"]);
    assert.ok(hosts.slice(1).every(host => host === "backup.example"));
    assert.equal(kernel.normalizeServerRecordRuntimeError({ code: "SERVER_RECORD_TIMEOUT" }), "timeout");
  });
});

test("server record probe cache is reused unless forceRefresh is requested", async () => {
  let requestCount = 0;
  isolateState.ServerRecordsSnapshotCache.clear();
  await withWorkerGlobals({
    fetch: async (url) => {
      requestCount += 1;
      const parsed = new URL(url);
      if (/\/System\/Ping$/i.test(parsed.pathname)) return new Response("pong", { status: 200 });
      if (/\/System\/Info$/i.test(parsed.pathname)) {
        return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ TotalRecordCount: 3 }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }, async () => {
    const node = { target: "https://cache.example", headers: { "X-Emby-Token": "private-token" } };
    await kernel.getServerRecordProbe("cached-node", node);
    await kernel.getServerRecordProbe("cached-node", node);
    assert.equal(requestCount, 5);
    await kernel.getServerRecordProbe("cached-node", node, { forceRefresh: true });
    assert.equal(requestCount, 10);
    assert.doesNotMatch(JSON.stringify(isolateState.ServerRecordsSnapshotCache.get("cached-node")?.value), /private-token|cache\.example/);
  });
  isolateState.ServerRecordsSnapshotCache.clear();
});

test("server record snapshots persist counts and expose matching last-watch media", async () => {
  const nodes = [
    {
      name: "server-a",
      displayName: "Server A",
      target: "https://origin-a.example/emby",
      headers: { "X-Emby-Token": "private-token-a" },
      serverRecord: { enabled: true, expiresAt: "2027-01-31" }
    },
    {
      name: "server-b",
      displayName: "Server B",
      target: "https://origin-b.example/emby",
      headers: { "X-Emby-Token": "private-token-b" },
      serverRecord: { enabled: true, expiresAt: null }
    }
  ];
  const probedNodeNames = [];
  const originals = {
    getNodesListStrict: cachePort.getNodesListStrict,
    getNodeForRead: kernel.getNodeForRead,
    getServerRecordProbe: kernel.getServerRecordProbe,
    getServerLastWatch: kernel.getServerLastWatch,
    getServerRecordSnapshots: kernel.getServerRecordSnapshots,
    persistServerRecordProbeSnapshots: kernel.persistServerRecordProbeSnapshots,
    consoleError: console.error
  };
  cachePort.getNodesListStrict = async () => nodes;
  kernel.getNodeForRead = async (name) => nodes.find(node => node.name === name) || null;
  kernel.getServerRecordProbe = async (name) => {
    probedNodeNames.push(name);
    return {
    runtime: { state: "online", checkedAt: "2026-07-21T00:00:00.000Z" },
    counts: name === "server-b"
      ? { movies: null, series: null, episodes: null, state: "unavailable", errors: { movies: "offline" } }
      : { movies: 1, series: 2, episodes: 3, state: "ok", errors: {} }
    };
  };
  kernel.getServerLastWatch = async () => new Map([
    ["server-a", { lastWatchedAt: "2026-07-21T12:34:56.000Z" }]
  ]);
  const persistedProbeEntries = [];
  kernel.persistServerRecordProbeSnapshots = async (_db, entries) => {
    persistedProbeEntries.push(...entries);
    return entries.length;
  };
  kernel.getServerRecordSnapshots = async (_db, names) => new Map(names.map(name => [name, name === "server-a"
    ? {
        counts: { movies: 8, series: 9, episodes: 10, state: "ok", errors: {}, checkedAt: "2026-07-20T00:00:00.000Z", source: "persisted" },
        lastItem: {
          itemId: "episode-1",
          itemName: "Episode one",
          itemType: "Episode",
          seriesName: "Series one",
          originalTitle: "Original Series One",
          year: 2025,
          imageTag: "episode-poster-tag",
          watchedAt: "2026-07-21T12:31:00.000Z"
        }
      }
    : {
        counts: { movies: 11, series: 12, episodes: 13, state: "ok", errors: {}, checkedAt: "2026-07-20T00:00:00.000Z", source: "persisted" },
        lastItem: {}
      }]));
  console.error = () => {};
  try {
    const options = {
      db: {},
      ctx: {},
      request: new Request("https://admin.example/admin")
    };
    const available = await kernel.getServerRecordsSnapshotPayload({ HOST: "proxy.example" }, options);
    assert.deepEqual(probedNodeNames, ["server-a", "server-b"]);
    assert.equal(persistedProbeEntries.length, 2);
    assert.ok(available.records.every(record => record.counts.persisted === true));
    assert.match(available.records[0].watch.posterUrl, /^\/admin\/__server-record-poster\/server-a\?v=[a-z0-9]+$/);
    assert.deepEqual(available.records[0].watch, {
      lastWatchedAt: "2026-07-21T12:34:56.000Z",
      state: "ok",
      itemId: "episode-1",
      itemName: "Episode one",
      itemType: "Episode",
      seriesName: "Series one",
      posterUrl: available.records[0].watch.posterUrl,
      posterSearch: {
        itemId: "episode-1",
        mediaType: "tv",
        title: "Series one",
        originalTitle: "Original Series One",
        year: 2025,
        watchedAt: "2026-07-21T12:31:00.000Z"
      }
    });
    assert.equal(available.records[1].watch.itemId, "");
    assert.equal(available.records[1].watch.posterUrl, "");
    assert.deepEqual(available.availableNodes.map(record => record.expiryEnabled), [true, false]);
    assert.doesNotMatch(JSON.stringify(available), /totalSeconds|private-token|origin-[ab]\.example/);

    const getCompleteSnapshots = kernel.getServerRecordSnapshots;
    kernel.getServerRecordSnapshots = async (_db, names) => new Map(names.map(name => [name, {
      counts: {},
      lastItem: name === "server-a"
        ? { itemId: "incomplete-item", watchedAt: "2026-07-21T12:34:56.000Z" }
        : {}
    }]));
    const incompleteMedia = await kernel.getServerRecordsSnapshotPayload({ HOST: "proxy.example" }, { ...options, skipProbe: true });
    assert.match(incompleteMedia.records[0].watch.posterUrl, /^\/admin\/__server-record-poster\/server-a\?v=[a-z0-9]+$/);
    assert.deepEqual(incompleteMedia.records[0].watch, {
      lastWatchedAt: "2026-07-21T12:34:56.000Z",
      state: "ok",
      itemId: "incomplete-item",
      itemName: "",
      itemType: "",
      seriesName: "",
      posterUrl: incompleteMedia.records[0].watch.posterUrl,
      posterSearch: {
        itemId: "incomplete-item",
        mediaType: "",
        title: "",
        originalTitle: "",
        year: null,
        watchedAt: "2026-07-21T12:34:56.000Z"
      }
    });
    kernel.getServerRecordSnapshots = getCompleteSnapshots;

    probedNodeNames.length = 0;
    const metadataOnly = await kernel.getServerRecordsSnapshotPayload({ HOST: "proxy.example" }, { ...options, skipProbe: true });
    assert.deepEqual(probedNodeNames, []);
    assert.ok(metadataOnly.records.every(record => record.runtime.state === "not_checked"));
    assert.ok(metadataOnly.records.every(record => record.runtime.errorCode === "manual_refresh_required"));
    assert.deepEqual(metadataOnly.records.map(record => [record.counts.movies, record.counts.source]), [[8, "persisted"], [11, "persisted"]]);

    const targeted = await kernel.getServerRecordsSnapshotPayload({ HOST: "proxy.example" }, { ...options, refreshNodeName: "server-b" });
    assert.deepEqual(probedNodeNames, ["server-b"]);
    assert.deepEqual(targeted.records.map(record => record.nodeName), ["server-b"]);
    assert.deepEqual(targeted.records.map(record => record.runtime.state), ["online"]);

    kernel.persistServerRecordProbeSnapshots = async () => { throw new Error("snapshot unavailable"); };
    const persistenceDegraded = await kernel.getServerRecordsSnapshotPayload({ HOST: "proxy.example" }, options);
    assert.equal(persistenceDegraded.persistence.state, "unavailable");
    assert.deepEqual(persistenceDegraded.records.map(record => record.counts.movies), [1, null]);

    kernel.persistServerRecordProbeSnapshots = originals.persistServerRecordProbeSnapshots;
    kernel.getServerLastWatch = async () => { throw new Error("d1 unavailable"); };
    const unavailable = await kernel.getServerRecordsSnapshotPayload({ HOST: "proxy.example" }, options);
    assert.ok(unavailable.records.every(record => record.watch.state === "unavailable"));
    assert.ok(unavailable.records.every(record => record.watch.lastWatchedAt === ""));
  } finally {
    cachePort.getNodesListStrict = originals.getNodesListStrict;
    kernel.getNodeForRead = originals.getNodeForRead;
    kernel.getServerRecordProbe = originals.getServerRecordProbe;
    kernel.getServerLastWatch = originals.getServerLastWatch;
    kernel.getServerRecordSnapshots = originals.getServerRecordSnapshots;
    kernel.persistServerRecordProbeSnapshots = originals.persistServerRecordProbeSnapshots;
    console.error = originals.consoleError;
  }
});

test("server record settings preserve node routes and credentials while normalizing legacy tags", () => {
  const existingNode = {
    target: "https://origin.example/emby",
    lines: [{
      id: "primary",
      target: "https://origin.example/emby",
      transportPolicy: { responseCompatibility: "flutter" },
      extensionFlags: ["preserve"]
    }],
    activeLineId: "primary",
    headers: { "X-Emby-Token": "private-token", "X-Custom-Route": "route-a" },
    serverRecordEmbyUsername: "stats-user",
    serverRecordEmbyPassword: "stats-password",
    mediaAggregationEmbyUsername: "node-user",
    mediaAggregationEmbyPassword: " node-password ",
    tag: "高码服"
  };
  const normalized = kernel.normalizeNode("server-a", existingNode).data;
  assert.deepEqual(normalized.tags, ["高码服"]);
  assert.equal(normalized.tag, "高码服");

  const updated = kernel.buildNodeRecord("server-a", {
    tags: ["低码服", "低码服", " 备用服 "],
    tag: "低码服",
    serverRecord: { enabled: true, expiresAt: "2027-01-31" }
  }, existingNode);
  assert.deepEqual(updated.tags, ["低码服", "备用服"]);
  assert.equal(updated.tag, "低码服");
  assert.deepEqual(updated.lines, normalized.lines);
  assert.deepEqual(updated.headers, normalized.headers);
  assert.equal(updated.mediaAggregationEmbyUsername, "node-user");
  assert.equal(updated.mediaAggregationEmbyPassword, " node-password ");
  assert.equal(updated.serverRecordEmbyUsername, "stats-user");
  assert.equal(updated.serverRecordEmbyPassword, "stats-password");
  assert.deepEqual(updated.serverRecord, {
    enabled: true,
    expiryEnabled: true,
    expiryMode: "fixed",
    expiresAt: "2027-01-31",
    expiryDays: 30
  });

  const rolling = kernel.buildNodeRecord("server-a", {
    serverRecord: { enabled: true, expiryEnabled: true, expiryMode: "rolling", expiresAt: "2027-01-31", expiryDays: 45 }
  }, existingNode);
  assert.deepEqual(rolling.serverRecord, {
    enabled: true,
    expiryEnabled: true,
    expiryMode: "rolling",
    expiresAt: null,
    expiryDays: 45
  });

  const extensionState = {
    responseCompatibility: { playbackInfoItemShape: "object" },
    customProxyFlags: ["preserve", "server-record-save"]
  };
  const patched = kernel.buildPreparedServerRecordSettingsMutation("server-a", {
    ...existingNode,
    ...extensionState
  }, {
    tags: ["观察中"],
    serverRecordEmbyUsername: existingNode.serverRecordEmbyUsername,
    serverRecordEmbyPassword: existingNode.serverRecordEmbyPassword,
    serverRecord: { enabled: true, expiryEnabled: false }
  });
  assert.deepEqual(patched.nextNode.responseCompatibility, extensionState.responseCompatibility);
  assert.deepEqual(patched.nextNode.customProxyFlags, extensionState.customProxyFlags);
  assert.deepEqual(patched.previousNode, { ...existingNode, ...extensionState });
  assert.deepEqual(patched.nextNode.lines, existingNode.lines);
  assert.deepEqual(patched.nextNode.headers, existingNode.headers);
  assert.equal(patched.nextNode.serverRecordEmbyCredentialsConfigured, true);
  assert.equal(patched.nextNode.serverRecord.enabled, true);
});
