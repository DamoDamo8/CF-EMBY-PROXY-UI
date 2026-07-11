import assert from "node:assert/strict";
import test from "node:test";

await import("../worker.js");

const hooks = globalThis.__EMBY_PROXY_NODE_TEST_HOOKS__;
assert.ok(hooks, "worker.js must expose Node test hooks");

const {
  GLOBALS,
  Database,
  Proxy,
  RuntimeEntry,
  isEmbyWebProxyPath,
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
  renderRemoteAdminPage,
  renderAdminPage,
  isAcceptedAdminHtmlDocumentContentType,
  isMutableJsdelivrGithubAssetUrl,
  renderAdminReleaseVendorAsset,
  isAdminWarmRoute,
  warmAdminReleaseVendorEntries,
  buildAdminWarmSubrequest,
  isAdminWarmResponseSuccessful
} = hooks;

assert.ok(RuntimeEntry && typeof RuntimeEntry === "object", "missing Node test hook: RuntimeEntry");

const requiredFunctionHooks = {
  runSingleFlight,
  isEmbyWebProxyPath,
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
  renderRemoteAdminPage,
  renderAdminPage,
  isAcceptedAdminHtmlDocumentContentType,
  isMutableJsdelivrGithubAssetUrl,
  renderAdminReleaseVendorAsset,
  isAdminWarmRoute,
  warmAdminReleaseVendorEntries,
  buildAdminWarmSubrequest,
  isAdminWarmResponseSuccessful
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

test("runtime config writes prime the new value before metadata maintenance", async () => {
  GLOBALS.SingleFlightTasks.clear();
  invalidateRuntimeConfigCache();
  let configWriteCount = 0;
  const kv = {
    async get(key) {
      assert.equal(key, Database.CONFIG_KEY);
      return { rateLimitRpm: 10 };
    },
    async put(key) {
      assert.equal(key, Database.CONFIG_KEY);
      configWriteCount += 1;
    }
  };
  const env = { ENI_KV: kv, __CONFIG_CACHE_NAMESPACE: "runtime-config-prime" };
  await getRuntimeConfig(env);

  const database = Object.create(Database);
  database.recordConfigSnapshot = async () => null;
  database.ensureConfigMeta = async () => {
    throw new Error("metadata maintenance failed");
  };
  await assert.rejects(
    database.persistRuntimeConfig({ rateLimitRpm: 20 }, { env, kv }),
    /metadata maintenance failed/
  );

  assert.equal(configWriteCount, 1);
  assert.equal(GLOBALS.ConfigCache.data.rateLimitRpm, 20);
  assert.equal(await getRuntimeConfig(env), GLOBALS.ConfigCache.data);
  invalidateRuntimeConfigCache();
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
      "https://github.com/owner/repo/releases/download/v1.0.0/app.js"
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
