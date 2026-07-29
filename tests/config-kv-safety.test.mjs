import assert from "node:assert/strict";
import test from "node:test";

await import("../worker.js");

const hooks = globalThis.__EMBY_PROXY_NODE_TEST_HOOKS__;
assert.ok(hooks, "worker.js must expose Node test hooks");

const { Database, buildAdminLocalIndexUploadRecord, invalidateRuntimeConfigCache } = hooks;

function createDeferred() {
  let resolve;
  const promise = new Promise(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function createKv(initialValues = {}) {
  const values = new Map(Object.entries(initialValues).map(([key, value]) => [
    key,
    typeof value === "string" ? value : JSON.stringify(value)
  ]));
  const operations = [];
  return {
    values,
    operations,
    kv: {
      async get(key, options = {}) {
        const value = values.get(key);
        if (value === undefined) return null;
        return options.type === "json" ? JSON.parse(value) : value;
      },
      async put(key, value) {
        operations.push({ type: "put", key, value: String(value) });
        values.set(key, String(value));
      },
      async delete(key) {
        operations.push({ type: "delete", key });
        values.delete(key);
      },
      async list(options = {}) {
        const prefix = String(options.prefix || "");
        return {
          keys: [...values.keys()].filter(key => key.startsWith(prefix)).map(name => ({ name })),
          list_complete: true
        };
      }
    }
  };
}

test("persistRuntimeConfig rejects writes when KV is not configured", async () => {
  await assert.rejects(
    Database.persistRuntimeConfig({ rateLimitRpm: 20 }, { env: {} }),
    error => error?.code === "KV_NOT_CONFIGURED" && error?.status === 503
  );
});

test("applyKvMutationsWithRollback restores only mutations that completed", async () => {
  const { kv, values, operations } = createKv({ first: "old-first", second: "old-second" });
  kv.put = async (key, value) => {
    operations.push({ type: "put", key, value: String(value) });
    if (key === "second") throw new Error("second write failed");
    values.set(key, String(value));
  };

  await assert.rejects(
    Database.applyKvMutationsWithRollback(kv, [
      { type: "put", key: "first", value: "new-first" },
      { type: "put", key: "second", value: "new-second" }
    ]),
    /second write failed/
  );

  assert.equal(values.get("first"), "old-first");
  assert.equal(values.get("second"), "old-second");
  assert.deepEqual(operations.map(operation => operation.key), ["first", "second", "first"]);
});

test("applyKvMutationsWithRollback preserves concurrent values and reports conflicts", async () => {
  const { kv, values } = createKv({ first: "old-first", second: "old-second" });
  kv.put = async (key, value) => {
    if (key === "second") {
      values.set("first", "concurrent-first");
      throw new Error("second write failed");
    }
    values.set(key, String(value));
  };

  await assert.rejects(
    Database.applyKvMutationsWithRollback(kv, [
      { type: "put", key: "first", value: "new-first" },
      { type: "put", key: "second", value: "new-second" }
    ]),
    error => error?.code === "KV_MUTATION_ROLLBACK_CONFLICT"
      && error?.status === 409
      && error?.details?.rollbackConflicts?.includes("first")
  );
  assert.equal(values.get("first"), "concurrent-first");
  assert.equal(values.get("second"), "old-second");
});

test("listKvKeysStrict fails closed for missing and repeated cursors", async () => {
  await assert.rejects(
    Database.listKvKeysStrict({
      async list() {
        return { keys: [{ name: "node:a" }], list_complete: false };
      }
    }),
    error => error?.code === "KV_SCAN_INCOMPLETE" && error?.details?.reason === "missing_cursor"
  );

  let page = 0;
  await assert.rejects(
    Database.listKvKeysStrict({
      async list() {
        page += 1;
        return { keys: [], list_complete: false, cursor: "same-cursor" };
      }
    }),
    error => error?.code === "KV_SCAN_INCOMPLETE" && error?.details?.reason === "repeated_cursor"
  );
  assert.equal(page, 2);
});

test("readRepairableRuntimeConfig fails closed when the config read fails", async () => {
  await assert.rejects(
    Database.readRepairableRuntimeConfig({
      async get() {
        throw new Error("temporary KV outage");
      }
    }),
    error => error?.code === "KV_TIDY_CONFIG_READ_FAILED"
      && error?.status === 503
      && error?.details?.key === Database.CONFIG_KEY
  );
});

test("KV tidy plan tokens verify signatures and reject tampering and expiry", async () => {
  const env = { JWT_SECRET: "test-tidy-secret" };
  const plan = {
    scannedKeys: ["node:a", Database.CONFIG_KEY],
    mutationPlan: [{ type: "put", key: Database.CONFIG_KEY, value: "{}" }],
    rebuiltNodeSummaries: [{ name: "a", target: "https://a.example" }]
  };
  plan.planHash = Database.buildKvTidyPlanHash(plan);
  const token = await Database.createKvTidyPlanToken(env, plan, { nowMs: 1_000, ttlMs: 60_000 });

  const payload = await Database.verifyKvTidyPlanToken(env, token, { nowMs: 30_000 });
  assert.equal(payload.planHash, plan.planHash);

  const [payloadPart, signature] = token.split(".");
  const tamperedToken = `${payloadPart}.${signature.slice(0, -1)}${signature.endsWith("a") ? "b" : "a"}`;
  await assert.rejects(
    Database.verifyKvTidyPlanToken(env, tamperedToken, { nowMs: 30_000 }),
    error => error?.code === "TIDY_PLAN_INVALID" && error?.status === 409
  );
  await assert.rejects(
    Database.verifyKvTidyPlanToken(env, token, { nowMs: 61_000 }),
    error => error?.code === "TIDY_PLAN_STALE"
      && error?.details?.reason === "expired"
  );
});

test("KV tidy plan hashes bind config and snapshot revisions", () => {
  const basePlan = {
    scannedKeys: [Database.CONFIG_KEY, Database.CONFIG_SNAPSHOTS_KEY],
    mutationPlan: [],
    rebuiltNodeSummaries: [],
    revisions: {
      configRevision: "config-r1",
      configContentHash: "config-h1",
      snapshotsRevision: "snapshots-r1",
      snapshotsContentHash: "snapshots-h1"
    }
  };
  const previewHash = Database.buildKvTidyPlanHash(basePlan);
  assert.notEqual(Database.buildKvTidyPlanHash({
    ...basePlan,
    revisions: { ...basePlan.revisions, configRevision: "config-r2" }
  }), previewHash);
  assert.notEqual(Database.buildKvTidyPlanHash({
    ...basePlan,
    revisions: { ...basePlan.revisions, snapshotsContentHash: "snapshots-h2" }
  }), previewHash);
});

test("tidyKvData rejects a signed preview when the rebuilt plan hash changes", async () => {
  const env = { JWT_SECRET: "test-tidy-secret" };
  const previewPlan = { planHash: "preview-hash" };
  const planToken = await Database.createKvTidyPlanToken(env, previewPlan);
  const database = Object.create(Database);
  database.buildKvTidyPlan = async () => ({ planHash: "current-hash", quotaBudget: { blocked: false } });
  database.applyKvTidyPlan = async () => assert.fail("stale plans must not be applied");

  await assert.rejects(
    database.tidyKvData(env, { planToken }),
    error => error?.code === "TIDY_PLAN_STALE"
      && error?.details?.reason === "plan_changed"
      && error?.details?.previewPlanHash === "preview-hash"
      && error?.details?.currentPlanHash === "current-hash"
  );
});

test("KV tidy quota includes puts, deletes, rollback writes, and rollback deletes", async () => {
  const { kv } = createKv({ existing: "old-value" });
  const budget = await Database.resolveKvTidyQuotaBudget({}, [
    { type: "put", key: "existing", value: "new-value" },
    { type: "delete", key: "missing", value: "" }
  ], { kv, config: {} });

  assert.equal(budget.estimatedPutCount, 1);
  assert.equal(budget.estimatedDeleteCount, 1);
  assert.equal(budget.estimatedRollbackWriteCount, 1);
  assert.equal(budget.estimatedRollbackDeleteCount, 1);
  assert.equal(budget.estimatedWorstCaseWriteCount, 4);
});

test("config snapshots redact secrets and snapshot restoration preserves current secrets", async () => {
  const previousConfig = {
    rateLimitRpm: 10,
    cfApiToken: "previous-cf-secret",
    tgBotToken: "previous-tg-secret",
    tmdbBrowserToken: "previous-tmdb-browser-token",
    doubanBrowserToken: "previous-douban-browser-token",
    mediaAggregationEmbyPassword: "previous-emby-secret"
  };
  const currentConfig = {
    rateLimitRpm: 20,
    cfApiToken: "current-cf-secret",
    tgBotToken: "current-tg-secret",
    tmdbBrowserToken: "current-tmdb-browser-token",
    doubanBrowserToken: "current-douban-browser-token",
    mediaAggregationEmbyPassword: "current-emby-secret"
  };
  const { kv } = createKv({
    [Database.CONFIG_KEY]: currentConfig,
    [Database.CONFIG_SNAPSHOTS_KEY]: []
  });
  const mutationPlan = await Database.buildRuntimeConfigMutationPlan(
    kv,
    previousConfig,
    currentConfig,
    { reason: "test_snapshot" }
  );
  const snapshotsMutation = mutationPlan.find(mutation => mutation.key === Database.CONFIG_SNAPSHOTS_KEY);
  const [snapshot] = JSON.parse(snapshotsMutation.value);
  assert.equal(snapshot.config.cfApiToken, undefined);
  assert.equal(snapshot.config.tgBotToken, undefined);
  assert.equal(snapshot.config.tmdbBrowserToken, undefined);
  assert.equal(snapshot.config.doubanBrowserToken, undefined);
  assert.equal(snapshot.config.mediaAggregationEmbyPassword, undefined);

  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-snapshot-restore"
  };
  invalidateRuntimeConfigCache();
  try {
    const restoredConfig = await Database.restoreTidyKvMigrationSnapshot({
      id: "snapshot-1",
      config: { rateLimitRpm: 5 },
      rollbackPayload: { version: 1, kvEntries: [] }
    }, { env, kv });
    assert.equal(restoredConfig.rateLimitRpm, 5);
    assert.equal(restoredConfig.cfApiToken, "current-cf-secret");
    assert.equal(restoredConfig.tgBotToken, "current-tg-secret");
    assert.equal(restoredConfig.tmdbBrowserToken, "current-tmdb-browser-token");
    assert.equal(restoredConfig.doubanBrowserToken, "current-douban-browser-token");
    assert.equal(restoredConfig.mediaAggregationEmbyPassword, "current-emby-secret");

    const restoredFromRollback = await Database.restoreTidyKvMigrationSnapshot({
      id: "snapshot-2",
      config: { rateLimitRpm: 4 },
      rollbackPayload: {
        version: 1,
        kvEntries: [
          {
            key: Database.CONFIG_KEY,
            exists: true,
            value: JSON.stringify({
              rateLimitRpm: 3,
              cfApiToken: "redacted-old-cf-secret",
              tgBotToken: "redacted-old-tg-secret"
            })
          },
          {
            key: Database.CONFIG_SNAPSHOTS_KEY,
            exists: true,
            value: JSON.stringify([{ id: "old", config: { rateLimitRpm: 2, cfApiToken: "leaked-secret" } }])
          }
        ]
      }
    }, { env, kv });
    assert.equal(restoredFromRollback.rateLimitRpm, 3);
    assert.equal(restoredFromRollback.cfApiToken, "current-cf-secret");
    assert.equal(restoredFromRollback.tgBotToken, "current-tg-secret");
    const persistedSnapshots = JSON.parse(await kv.get(Database.CONFIG_SNAPSHOTS_KEY));
    assert.ok(persistedSnapshots.length >= 1);
    assert.ok(persistedSnapshots.every(item => item?.config?.cfApiToken === undefined && item?.config?.tgBotToken === undefined));
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("redacted settings backup roundtrip preserves current secrets", async () => {
  const currentConfig = {
    rateLimitRpm: 20,
    cfApiToken: "current-cf-secret",
    tgBotToken: "current-tg-secret",
    tmdbBrowserToken: "current-tmdb-browser-token",
    doubanBrowserToken: "current-douban-browser-token",
    mediaAggregationEmbyUsername: "current-emby-user",
    mediaAggregationEmbyPassword: "current-emby-password"
  };
  const { kv } = createKv({ [Database.CONFIG_KEY]: currentConfig });
  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-settings-roundtrip"
  };
  invalidateRuntimeConfigCache();
  try {
    const exportedResponse = await Database.ApiHandlers.exportSettings({}, {
      env,
      request: new Request("https://worker.test/admin")
    });
    const backup = await exportedResponse.json();
    assert.equal(backup.secretsRedacted, true);
    assert.equal(backup.config.cfApiToken, undefined);
    assert.equal(backup.config.tgBotToken, undefined);
    assert.equal(backup.config.tmdbBrowserToken, undefined);
    assert.equal(backup.config.doubanBrowserToken, undefined);
    assert.equal(backup.config.mediaAggregationEmbyUsername, undefined);
    assert.equal(backup.config.mediaAggregationEmbyPassword, undefined);

    await Database.ApiHandlers.importSettings(backup, { env, ctx: null, kv, meta: {} });
    const restored = await kv.get(Database.CONFIG_KEY, { type: "json" });
    assert.equal(restored.cfApiToken, "current-cf-secret");
    assert.equal(restored.tgBotToken, "current-tg-secret");
    assert.equal(restored.tmdbBrowserToken, "current-tmdb-browser-token");
    assert.equal(restored.doubanBrowserToken, "current-douban-browser-token");
    assert.equal(restored.mediaAggregationEmbyUsername, "current-emby-user");
    assert.equal(restored.mediaAggregationEmbyPassword, "current-emby-password");
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("legacy tmdbApiKey is permanently removed by save, export, import, and KV tidy", async () => {
  const legacySecret = "legacy-tmdb-secret";
  const { kv } = createKv({ [Database.CONFIG_KEY]: { rateLimitRpm: 20, tmdbApiKey: legacySecret } });
  const env = {
    ENI_KV: kv,
    JWT_SECRET: "legacy-tmdb-tidy-secret",
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-retired-tmdb-key"
  };
  invalidateRuntimeConfigCache();
  try {
    const saveResponse = await Database.ApiHandlers.saveConfig({
      config: { rateLimitRpm: 25, tmdbApiKey: "ignored-replacement" }
    }, { env, ctx: null, kv, meta: { section: "account", source: "ui" } });
    assert.equal(saveResponse.status, 200);
    assert.equal((await kv.get(Database.CONFIG_KEY, { type: "json" })).tmdbApiKey, undefined);

    await kv.put(Database.CONFIG_KEY, JSON.stringify({ rateLimitRpm: 30, tmdbApiKey: legacySecret }));
    invalidateRuntimeConfigCache();
    const defaultExport = await Database.ApiHandlers.exportSettings({}, {
      env,
      request: new Request("https://worker.test/admin")
    });
    const secretExport = await Database.ApiHandlers.exportSettings({ includeSecrets: true }, {
      env,
      request: new Request("https://worker.test/admin", { headers: { "X-Admin-Confirm": "exportSettings" } })
    });
    assert.equal((await defaultExport.json()).config.tmdbApiKey, undefined);
    assert.equal((await secretExport.json()).config.tmdbApiKey, undefined);

    const imported = await Database.ApiHandlers.importSettings({
      config: { rateLimitRpm: 35, tmdbApiKey: "imported-legacy-secret" }
    }, { env, ctx: null, kv, meta: {} });
    assert.equal(imported.status, 200);
    assert.equal((await kv.get(Database.CONFIG_KEY, { type: "json" })).tmdbApiKey, undefined);

    await kv.put(Database.CONFIG_KEY, JSON.stringify({ rateLimitRpm: 40, tmdbApiKey: legacySecret }));
    invalidateRuntimeConfigCache();
    const plan = await Database.buildKvTidyPlan(env, { kv });
    assert.ok(plan.mutationPlan.some(mutation => mutation.type === "put" && mutation.key === Database.CONFIG_KEY));
    const planToken = await Database.createKvTidyPlanToken(env, plan);
    await Database.tidyKvData(env, { kv, planToken });
    assert.equal((await kv.get(Database.CONFIG_KEY, { type: "json" })).tmdbApiKey, undefined);
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("full backup requires confirmation before retaining Emby credentials", async () => {
  const adminIndexRecord = await buildAdminLocalIndexUploadRecord(
    '<!doctype html><html><body><div id="app"></div></body></html>',
    "index.html"
  );
  const currentConfig = {
    rateLimitRpm: 30,
    cfApiToken: "current-cf-secret",
    tgBotToken: "current-tg-secret",
    tmdbBrowserToken: "current-tmdb-browser-token",
    doubanBrowserToken: "current-douban-browser-token",
    mediaAggregationEmbyUsername: "global-user",
    mediaAggregationEmbyPassword: "global-password",
    indexUrl: adminIndexRecord.sourceUrl
  };
  const currentNode = {
    name: "backup",
    target: "https://backup.test",
    lines: [{ id: "main", name: "Main", target: "https://backup.test" }],
    activeLineId: "main",
    mediaAggregationEmbyUsername: "node-user",
    mediaAggregationEmbyPassword: "node-password",
    serverRecordEmbyUsername: "record-user",
    serverRecordEmbyPassword: "record-password"
  };
  const uploadKey = Database.buildAdminIndexUploadKey(adminIndexRecord.revision);
  const { kv } = createKv({
    [Database.CONFIG_KEY]: currentConfig,
    [Database.NODES_INDEX_KEY]: ["backup"],
    [`${Database.PREFIX}backup`]: currentNode,
    [uploadKey]: adminIndexRecord
  });
  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-full-roundtrip"
  };
  invalidateRuntimeConfigCache();
  try {
    const rejectedResponse = await Database.ApiHandlers.exportConfig({ includeEmbyCredentials: true }, {
      env,
      ctx: null,
      request: new Request("https://worker.test/admin")
    });
    assert.equal(rejectedResponse.status, 428);
    assert.equal((await rejectedResponse.json()).error.code, "CONFIRMATION_REQUIRED");

    const redactedResponse = await Database.ApiHandlers.exportConfig({}, {
      env,
      ctx: null,
      request: new Request("https://worker.test/admin")
    });
    const redactedBackup = await redactedResponse.json();
    assert.equal(redactedBackup.secretsRedacted, true);
    assert.equal(redactedBackup.containsSecrets, false);
    assert.equal(redactedBackup.config.mediaAggregationEmbyUsername, undefined);
    assert.equal(redactedBackup.config.mediaAggregationEmbyPassword, undefined);
    assert.equal(redactedBackup.nodes[0].mediaAggregationEmbyUsername, undefined);
    assert.equal(redactedBackup.nodes[0].mediaAggregationEmbyPassword, undefined);
    assert.equal(redactedBackup.nodes[0].serverRecordEmbyUsername, undefined);
    assert.equal(redactedBackup.nodes[0].serverRecordEmbyPassword, undefined);

    const exportedResponse = await Database.ApiHandlers.exportConfig({ includeEmbyCredentials: true }, {
      env,
      ctx: null,
      request: new Request("https://worker.test/admin", {
        headers: { "X-Admin-Confirm": "exportConfig" }
      })
    });
    const backup = await exportedResponse.json();
    assert.equal(backup.secretsRedacted, false);
    assert.equal(backup.containsSecrets, true);
    assert.equal(backup.config.cfApiToken, undefined);
    assert.equal(backup.config.tgBotToken, undefined);
    assert.equal(backup.config.tmdbBrowserToken, undefined);
    assert.equal(backup.config.doubanBrowserToken, undefined);
    assert.equal(backup.config.mediaAggregationEmbyUsername, "global-user");
    assert.equal(backup.config.mediaAggregationEmbyPassword, "global-password");
    assert.equal(backup.nodes.length, 1);
    assert.equal(backup.nodes[0].mediaAggregationEmbyUsername, "node-user");
    assert.equal(backup.nodes[0].mediaAggregationEmbyPassword, "node-password");
    assert.equal(backup.nodes[0].serverRecordEmbyUsername, "record-user");
    assert.equal(backup.nodes[0].serverRecordEmbyPassword, "record-password");
    assert.equal(backup.adminIndexUpload.revision, adminIndexRecord.revision);
    assert.equal(backup.adminIndexUpload.html, adminIndexRecord.html);

    await kv.delete(uploadKey);
    await Database.ApiHandlers.importFull(backup, { env, ctx: null, kv });
    const restored = await kv.get(Database.CONFIG_KEY, { type: "json" });
    assert.equal(restored.cfApiToken, "current-cf-secret");
    assert.equal(restored.tgBotToken, "current-tg-secret");
    assert.equal(restored.tmdbBrowserToken, "current-tmdb-browser-token");
    assert.equal(restored.doubanBrowserToken, "current-douban-browser-token");
    assert.equal(restored.mediaAggregationEmbyUsername, "global-user");
    assert.equal(restored.mediaAggregationEmbyPassword, "global-password");
    const restoredNode = await kv.get(`${Database.PREFIX}backup`, { type: "json" });
    assert.equal(restoredNode.mediaAggregationEmbyUsername, "node-user");
    assert.equal(restoredNode.mediaAggregationEmbyPassword, "node-password");
    assert.equal(restoredNode.serverRecordEmbyUsername, "record-user");
    assert.equal(restoredNode.serverRecordEmbyPassword, "record-password");
    assert.equal((await Database.getAdminIndexUploadRecord(kv, adminIndexRecord.revision)).html, adminIndexRecord.html);
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("full import rejects a server record password without a username before writing", async () => {
  const { kv, operations } = createKv({ [Database.CONFIG_KEY]: {} });
  const env = {
    ENI_KV: kv,
    HOST: "proxy.example",
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-server-record-credentials"
  };
  invalidateRuntimeConfigCache();
  try {
    const response = await Database.ApiHandlers.importFull({
      nodes: [{
        name: "orphan-password",
        target: "https://origin.example",
        serverRecordEmbyPassword: "secret-without-user"
      }]
    }, { env, ctx: null, kv });
    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "SERVER_RECORD_CREDENTIALS_INCOMPLETE");
    assert.equal(await kv.get(`${Database.PREFIX}orphan-password`, { type: "json" }), null);
    assert.deepEqual(operations, []);
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("media aggregation shortcut requires usernames and accepts an empty global password", async () => {
  const primaryNode = {
    name: "primary",
    target: "https://primary.test",
    lines: [{ id: "main", target: "https://primary.test" }],
    activeLineId: "main",
    mediaAggregationEmbyUsername: "node-user",
    mediaAggregationEmbyPassword: "node-password"
  };
  const backupNode = {
    name: "backup",
    target: "https://backup.test",
    lines: [{ id: "main", target: "https://backup.test" }],
    activeLineId: "main"
  };
  const { kv } = createKv({
    [Database.CONFIG_KEY]: {},
    [Database.NODES_INDEX_KEY]: ["primary", "backup"],
    [`${Database.PREFIX}primary`]: primaryNode,
    [`${Database.PREFIX}backup`]: backupNode
  });
  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-media-aggregation-credentials"
  };
  invalidateRuntimeConfigCache();
  try {
    const response = await Database.ApiHandlers.saveMediaAggregationPolicyShortcuts({
      selectedNodeNames: ["primary", "backup"],
      username: "",
      password: ""
    }, { env, ctx: null, kv });
    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.equal(payload.error.code, "MEDIA_AGGREGATION_CREDENTIALS_REQUIRED");
    assert.deepEqual(payload.error.details.nodeNames, ["backup"]);

    const successResponse = await Database.ApiHandlers.saveMediaAggregationPolicyShortcuts({
      selectedNodeNames: ["primary", "backup"],
      username: "global-user",
      password: "",
      matchMode: "strict",
      firstResultTimeoutMs: 2200,
      gracePeriodMs: 600
    }, { env, ctx: null, kv });
    const successPayload = await successResponse.json();
    assert.equal(successResponse.status, 200);
    assert.equal(successPayload.success, true);
    const savedConfig = await kv.get(Database.CONFIG_KEY, { type: "json" });
    assert.equal(savedConfig.mediaAggregationEmbyUsername, "global-user");
    assert.equal(savedConfig.mediaAggregationEmbyPassword, "");
    assert.equal(savedConfig.mediaAggregationMatchMode, "strict");
    assert.equal(savedConfig.mediaAggregationFirstResultTimeoutMs, 2200);
    assert.equal(savedConfig.mediaAggregationGracePeriodMs, 600);
    const managedPrimary = await kv.get(`${Database.PREFIX}primary`, { type: "json" });
    const managedBackup = await kv.get(`${Database.PREFIX}backup`, { type: "json" });
    assert.equal(managedPrimary.playbackInfoMode, "rewrite");
    assert.equal(managedPrimary.mediaAggregationManagedRewrite, true);
    assert.equal(managedBackup.mediaAggregationManagedRewrite, true);

    await kv.put(`${Database.PREFIX}backup`, JSON.stringify({
      ...managedBackup,
      playbackInfoMode: "rewrite",
      mediaAggregationManagedRewrite: false
    }));
    const disabledResponse = await Database.ApiHandlers.saveMediaAggregationPolicyShortcuts({
      selectedNodeNames: [],
      username: "global-user"
    }, { env, ctx: null, kv });
    assert.equal(disabledResponse.status, 200);
    const disabledConfig = await kv.get(Database.CONFIG_KEY, { type: "json" });
    assert.equal(disabledConfig.mediaAggregationMatchMode, "strict");
    assert.equal(disabledConfig.mediaAggregationFirstResultTimeoutMs, 2200);
    assert.equal(disabledConfig.mediaAggregationGracePeriodMs, 600);
    const restoredPrimary = await kv.get(`${Database.PREFIX}primary`, { type: "json" });
    const preservedBackup = await kv.get(`${Database.PREFIX}backup`, { type: "json" });
    assert.equal(restoredPrimary.playbackInfoMode, "inherit");
    assert.equal(restoredPrimary.mediaAggregationManagedRewrite, false);
    assert.equal(preservedBackup.playbackInfoMode, "rewrite");
    assert.equal(preservedBackup.mediaAggregationManagedRewrite, false);
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("full backup export rejects payloads that cannot fit the import request limit", async () => {
  const { kv } = createKv({ [Database.CONFIG_KEY]: { rateLimitRpm: 30 } });
  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-full-export-limit"
  };
  const originalLoadAllNodeEntitiesFromKvStrict = Database.loadAllNodeEntitiesFromKvStrict;
  Database.loadAllNodeEntitiesFromKvStrict = async () => [{
    name: "oversized",
    target: "https://origin.test",
    remark: "x".repeat(12 * 1024 * 1024)
  }];
  invalidateRuntimeConfigCache();

  try {
    const response = await Database.ApiHandlers.exportConfig({}, {
      env,
      ctx: null,
      request: new Request("https://worker.test/admin")
    });
    const payload = await response.json();
    assert.equal(response.status, 413);
    assert.equal(payload.error.code, "FULL_BACKUP_TOO_LARGE");
    assert.ok(payload.error.details.importRequestBytes > payload.error.details.maxBytes);
    assert.equal(payload.error.details.nodeCount, 1);
  } finally {
    Database.loadAllNodeEntitiesFromKvStrict = originalLoadAllNodeEntitiesFromKvStrict;
    invalidateRuntimeConfigCache();
  }
});

test("Worker HTML rollback preserves settings saved after activation", async () => {
  const previousIndex = await buildAdminLocalIndexUploadRecord(
    '<!doctype html><html><body><div id="app">previous</div></body></html>',
    "index.html"
  );
  const activatedIndex = await buildAdminLocalIndexUploadRecord(
    '<!doctype html><html><body><div id="app">activated</div></body></html>',
    "index.html"
  );
  const previousConfig = { uiRadiusPx: 8, indexUrl: previousIndex.sourceUrl };
  const activatedConfig = { uiRadiusPx: 8, indexUrl: activatedIndex.sourceUrl };
  const concurrentlySavedConfig = { uiRadiusPx: 33, indexUrl: activatedIndex.sourceUrl };
  const { kv } = createKv({
    [Database.CONFIG_KEY]: concurrentlySavedConfig,
    [Database.buildAdminIndexUploadKey(previousIndex.revision)]: previousIndex,
    [Database.buildAdminIndexUploadKey(activatedIndex.revision)]: activatedIndex
  });
  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-worker-html-rollback"
  };
  invalidateRuntimeConfigCache();

  try {
    const rollback = await Database.rollbackAdminIndexUploadActivation(
      previousConfig,
      activatedConfig,
      { env, kv, ctx: null }
    );
    const finalConfig = await kv.get(Database.CONFIG_KEY, { type: "json" });
    assert.equal(rollback.skipped, false);
    assert.equal(finalConfig.uiRadiusPx, 33);
    assert.equal(finalConfig.indexUrl, previousIndex.sourceUrl);
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("local HTML activation retains only versions referenced by config and snapshots", async () => {
  const { kv, values } = createKv({ [Database.CONFIG_KEY]: {} });
  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-admin-index-retention"
  };
  invalidateRuntimeConfigCache();

  try {
    for (let index = 0; index < 8; index += 1) {
      const record = await buildAdminLocalIndexUploadRecord(
        `<!doctype html><html><body><div id="app">version-${index}</div></body></html>`,
        "index.html"
      );
      await Database.persistAdminIndexUpload(record, { env, kv, ctx: null });
    }

    const config = await kv.get(Database.CONFIG_KEY, { type: "json" });
    const snapshots = await Database.getConfigSnapshotsForRead(kv, { withConfig: true });
    const referencedRevisions = Database.collectReferencedAdminIndexUploadRevisions(config, snapshots);
    const storedUploadKeys = [...values.keys()]
      .filter(key => key.startsWith(Database.ADMIN_INDEX_UPLOAD_PREFIX));
    assert.equal(snapshots.length, 5);
    assert.equal(referencedRevisions.size, 6);
    assert.equal(storedUploadKeys.length, 6);
    assert.deepEqual(
      new Set(storedUploadKeys),
      new Set([...referencedRevisions].map(revision => Database.buildAdminIndexUploadKey(revision)))
    );
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("KV tidy removes orphaned local HTML records and preserves referenced versions", async () => {
  const referencedIndex = await buildAdminLocalIndexUploadRecord(
    '<!doctype html><html><body><div id="app">referenced</div></body></html>',
    "index.html"
  );
  const orphanedIndex = await buildAdminLocalIndexUploadRecord(
    '<!doctype html><html><body><div id="app">orphaned</div></body></html>',
    "index.html"
  );
  const referencedKey = Database.buildAdminIndexUploadKey(referencedIndex.revision);
  const orphanedKey = Database.buildAdminIndexUploadKey(orphanedIndex.revision);
  const { kv } = createKv({
    [Database.CONFIG_KEY]: { indexUrl: referencedIndex.sourceUrl },
    [referencedKey]: referencedIndex,
    [orphanedKey]: orphanedIndex
  });
  const env = {
    ENI_KV: kv,
    JWT_SECRET: "tidy-admin-index-secret",
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-admin-index-tidy"
  };
  invalidateRuntimeConfigCache();

  try {
    const plan = await Database.buildKvTidyPlan(env, { kv });
    const deletedKeys = plan.mutationPlan
      .filter(mutation => mutation.type === "delete")
      .map(mutation => mutation.key);
    const uploadDeleteGroup = plan.preview.deleteGroups.find(group => group.key === "admin_index_uploads");
    assert.ok(deletedKeys.includes(orphanedKey));
    assert.ok(!deletedKeys.includes(referencedKey));
    assert.equal(plan.summary.deletedAdminIndexUploadCount, 1);
    assert.equal(uploadDeleteGroup?.count, 1);
    assert.deepEqual(uploadDeleteGroup?.samples, [orphanedKey]);
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("KV tidy preserves D1-owned legacy keys until D1 compatibility is ready", async () => {
  const legacyKeys = [
    Database.LEGACY_DNS_IP_POOL_SOURCES_KEY,
    Database.LEGACY_OPS_STATUS_KEY,
    Database.LEGACY_TELEGRAM_ALERT_STATE_KEY
  ];
  const { kv } = createKv({
    [Database.CONFIG_KEY]: {},
    [Database.LEGACY_DNS_IP_POOL_SOURCES_KEY]: [{ id: "legacy-source" }],
    [Database.LEGACY_OPS_STATUS_KEY]: { scheduled: { status: "legacy" } },
    [Database.LEGACY_TELEGRAM_ALERT_STATE_KEY]: { lastAlertAt: "2026-07-25T00:00:00.000Z" }
  });

  const plan = await Database.buildKvTidyPlan({ ENI_KV: kv }, { kv });
  const deletedKeys = plan.mutationPlan
    .filter(mutation => mutation.type === "delete")
    .map(mutation => mutation.key);
  const preserveGroup = plan.preview.preserveGroups.find(group => group.key === "d1_legacy_keys_pending");

  assert.deepEqual(legacyKeys.filter(key => deletedKeys.includes(key)), []);
  assert.equal(plan.summary.preservedD1LegacyKeyCount, 3);
  assert.equal(preserveGroup?.count, 3);
  assert.deepEqual(new Set(preserveGroup?.samples || []), new Set(legacyKeys));
  assert.equal(plan.d1Compatibility.runtimeCompatibilityReady, false);
});

test("KV tidy performs no KV deletes when the D1 compatibility copy fails", async () => {
  const { kv, operations, values } = createKv({ legacy: { status: "old" } });
  const originalApplyKvD1LegacyMigrations = Database.applyKvD1LegacyMigrations;
  Database.applyKvD1LegacyMigrations = async () => {
    throw new Error("d1 copy failed");
  };
  try {
    await assert.rejects(
      Database.applyKvTidyPlan({
        mutationPlan: [{ type: "delete", key: "legacy" }],
        d1LegacyMigrations: [{ key: "legacy", kind: "ops_status_root", payload: { status: "old" } }],
        summary: {},
        preview: { scope: "kv" }
      }, { kv, db: {} }),
      /d1 copy failed/
    );
    assert.equal(values.has("legacy"), true);
    assert.deepEqual(operations, []);
  } finally {
    Database.applyKvD1LegacyMigrations = originalApplyKvD1LegacyMigrations;
  }
});

test("KV tidy rejects malformed D1-owned legacy payloads before any KV delete", async () => {
  const legacyKey = Database.LEGACY_OPS_STATUS_KEY;
  const { kv, operations, values } = createKv({
    [legacyKey]: ["unexpected-array-state"]
  });

  await assert.rejects(
    Database.applyKvTidyPlan({
      mutationPlan: [{ type: "delete", key: legacyKey }],
      d1LegacyMigrations: [{
        key: legacyKey,
        kind: "ops_status_root",
        payload: ["unexpected-array-state"]
      }],
      summary: {},
      preview: { scope: "kv" }
    }, { kv, db: {} }),
    error => error?.code === "D1_LEGACY_PAYLOAD_INVALID"
      && error?.details?.reason === "expected_object"
  );

  assert.equal(values.has(legacyKey), true);
  assert.deepEqual(operations, []);
});

test("KV legacy DNS migration rejects lossy source normalization", async () => {
  assert.throws(
    () => Database.normalizeKvD1LegacyMigrationPayload(
      "dns_ip_pool_sources",
      [{ url: "https://missing-id.example/ips.txt" }],
      Database.LEGACY_DNS_IP_POOL_SOURCES_KEY
    ),
    error => error?.code === "D1_LEGACY_PAYLOAD_INVALID"
      && error?.details?.reason === "missing_source_id:0"
  );
  assert.throws(
    () => Database.normalizeKvD1LegacyMigrationPayload(
      "dns_ip_pool_sources",
      [{ id: "missing-target", name: "Broken source" }],
      Database.LEGACY_DNS_IP_POOL_SOURCES_KEY
    ),
    error => error?.code === "D1_LEGACY_PAYLOAD_INVALID"
      && error?.details?.reason === "missing_source_target:0"
  );
  assert.throws(
    () => Database.normalizeKvD1LegacyMigrationPayload(
      "dns_ip_pool_sources",
      [
        { id: "duplicate", url: "https://one.example/ips.txt" },
        { id: "duplicate", url: "https://two.example/ips.txt" }
      ],
      Database.LEGACY_DNS_IP_POOL_SOURCES_KEY
    ),
    error => error?.code === "D1_LEGACY_PAYLOAD_INVALID"
      && error?.details?.reason === "duplicate_or_missing_source_id"
  );
});

test("full import keeps a competing config save queued until rollback completes", async () => {
  const currentConfig = {
    rateLimitRpm: 10,
    cfApiToken: "current-cf-secret",
    tgBotToken: "current-tg-secret"
  };
  const { kv } = createKv({
    [Database.CONFIG_KEY]: currentConfig,
    [`${Database.PREFIX}alpha`]: {
      target: "https://origin.test",
      entryMode: "kv_route"
    }
  });
  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-full-import-chain"
  };
  const nodeMutationStarted = createDeferred();
  const releaseNodeMutation = createDeferred();
  const originalApplyPreparedNodeMutations = Database.applyPreparedNodeMutations;
  Database.applyPreparedNodeMutations = async () => {
    nodeMutationStarted.resolve();
    await releaseNodeMutation.promise;
    throw new Error("node_mutation_failed");
  };
  invalidateRuntimeConfigCache();

  try {
    const importPromise = Database.ApiHandlers.importFull({
      config: { ...currentConfig, rateLimitRpm: 20 },
      nodes: [{
        name: "alpha",
        target: "https://imported-origin.test",
        entryMode: "kv_route"
      }]
    }, { env, ctx: null, kv });
    await nodeMutationStarted.promise;

    let competingSaveSettled = false;
    const competingSave = Database.persistRuntimeConfig({
      ...currentConfig,
      rateLimitRpm: 30
    }, { env, kv, ctx: null }).finally(() => {
      competingSaveSettled = true;
    });
    await Promise.resolve();
    assert.equal(competingSaveSettled, false);

    releaseNodeMutation.resolve();
    await assert.rejects(importPromise, /node_mutation_failed/);
    await competingSave;

    const finalConfig = await kv.get(Database.CONFIG_KEY, { type: "json" });
    assert.equal(finalConfig.rateLimitRpm, 30);
    assert.equal(finalConfig.cfApiToken, "current-cf-secret");
    assert.equal(finalConfig.tgBotToken, "current-tg-secret");
  } finally {
    releaseNodeMutation.resolve();
    Database.applyPreparedNodeMutations = originalApplyPreparedNodeMutations;
    invalidateRuntimeConfigCache();
  }
});

test("full import keeps a competing node save queued and the later node value wins", async () => {
  const currentConfig = { rateLimitRpm: 10 };
  const { kv } = createKv({
    [Database.CONFIG_KEY]: currentConfig,
    [`${Database.PREFIX}alpha`]: {
      target: "https://old-origin.test",
      entryMode: "kv_route"
    }
  });
  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-full-import-node-chain"
  };
  const indexRebuildStarted = createDeferred();
  const releaseIndexRebuild = createDeferred();
  const originalRebuildNodeIndexesFromKv = Database.rebuildNodeIndexesFromKv;
  let indexRebuildCallCount = 0;
  Database.rebuildNodeIndexesFromKv = async (...args) => {
    indexRebuildCallCount += 1;
    if (indexRebuildCallCount === 1) {
      indexRebuildStarted.resolve();
      await releaseIndexRebuild.promise;
      throw new Error("import_node_index_rebuild_failed");
    }
    return await originalRebuildNodeIndexesFromKv.apply(Database, args);
  };
  invalidateRuntimeConfigCache();

  try {
    const importPromise = Database.ApiHandlers.importFull({
      config: { rateLimitRpm: 20 },
      nodes: [{
        name: "alpha",
        target: "https://imported-origin.test",
        entryMode: "kv_route"
      }]
    }, { env, ctx: null, kv });
    await indexRebuildStarted.promise;

    const importedNode = await kv.get(`${Database.PREFIX}alpha`, { type: "json" });
    assert.equal(importedNode.target, "https://imported-origin.test:443");

    let competingSaveSettled = false;
    const competingSave = Database.ApiHandlers.saveOrImport({
      name: "alpha",
      originalName: "alpha",
      target: "https://concurrent-origin.test",
      entryMode: "kv_route"
    }, { action: "save", env, ctx: null, kv }).finally(() => {
      competingSaveSettled = true;
    });
    await Promise.resolve();
    assert.equal(competingSaveSettled, false);

    releaseIndexRebuild.resolve();
    await assert.rejects(importPromise, /import_node_index_rebuild_failed/);
    const competingResponse = await competingSave;
    assert.equal(competingResponse.status, 200);

    const finalConfig = await kv.get(Database.CONFIG_KEY, { type: "json" });
    const finalNode = await kv.get(`${Database.PREFIX}alpha`, { type: "json" });
    assert.equal(finalConfig.rateLimitRpm, 10);
    assert.equal(finalNode.target, "https://concurrent-origin.test:443");
  } finally {
    releaseIndexRebuild.resolve();
    Database.rebuildNodeIndexesFromKv = originalRebuildNodeIndexesFromKv;
    invalidateRuntimeConfigCache();
  }
});

test("settings import honors an explicitly cleared secret", async () => {
  const { kv } = createKv({
    [Database.CONFIG_KEY]: {
      cfApiToken: "current-cf-secret",
      tgBotToken: "current-tg-secret"
    }
  });
  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-explicit-clear"
  };
  invalidateRuntimeConfigCache();
  try {
    await Database.ApiHandlers.importSettings({
      config: { cfApiToken: "", tgBotToken: "replacement-tg-secret" }
    }, { env, ctx: null, kv, meta: {} });
    const restored = await kv.get(Database.CONFIG_KEY, { type: "json" });
    assert.equal(restored.cfApiToken, "");
    assert.equal(restored.tgBotToken, "replacement-tg-secret");
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("config and DNS restoration still restores raw KV when DNS compensation fails", async () => {
  const database = Object.create(Database);
  let rawStateRestored = false;
  database.commitRuntimeConfig = async () => {
    throw new Error("dns_restore_failed");
  };
  database.restoreCapturedRuntimeConfigState = async () => {
    rawStateRestored = true;
    return { rateLimitRpm: 10 };
  };

  await assert.rejects(
    database.restoreCapturedRuntimeConfigAndDnsState({ config: { rateLimitRpm: 10 } }, {}),
    error => error?.code === "CONFIG_DNS_RESTORE_FAILED"
      && error?.details?.dnsRestoreError === "dns_restore_failed"
      && error?.details?.kvRestoreError === ""
  );
  assert.equal(rawStateRestored, true);
});
