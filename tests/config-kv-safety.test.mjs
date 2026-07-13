import assert from "node:assert/strict";
import test from "node:test";

await import("../worker.js");

const hooks = globalThis.__EMBY_PROXY_NODE_TEST_HOOKS__;
assert.ok(hooks, "worker.js must expose Node test hooks");

const { Database, invalidateRuntimeConfigCache } = hooks;

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
    tgBotToken: "previous-tg-secret"
  };
  const currentConfig = {
    rateLimitRpm: 20,
    cfApiToken: "current-cf-secret",
    tgBotToken: "current-tg-secret"
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
    tgBotToken: "current-tg-secret"
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

    await Database.ApiHandlers.importSettings(backup, { env, ctx: null, kv, meta: {} });
    const restored = await kv.get(Database.CONFIG_KEY, { type: "json" });
    assert.equal(restored.cfApiToken, "current-cf-secret");
    assert.equal(restored.tgBotToken, "current-tg-secret");
  } finally {
    invalidateRuntimeConfigCache();
  }
});

test("redacted full backup roundtrip preserves current secrets", async () => {
  const currentConfig = {
    rateLimitRpm: 30,
    cfApiToken: "current-cf-secret",
    tgBotToken: "current-tg-secret"
  };
  const { kv } = createKv({ [Database.CONFIG_KEY]: currentConfig });
  const env = {
    ENI_KV: kv,
    __CONFIG_CACHE_NAMESPACE: "config-kv-safety-full-roundtrip"
  };
  invalidateRuntimeConfigCache();
  try {
    const exportedResponse = await Database.ApiHandlers.exportConfig({}, {
      env,
      ctx: null,
      request: new Request("https://worker.test/admin")
    });
    const backup = await exportedResponse.json();
    assert.equal(backup.secretsRedacted, true);
    assert.equal(backup.config.cfApiToken, undefined);
    assert.equal(backup.config.tgBotToken, undefined);

    await Database.ApiHandlers.importFull(backup, { env, ctx: null, kv });
    const restored = await kv.get(Database.CONFIG_KEY, { type: "json" });
    assert.equal(restored.cfApiToken, "current-cf-secret");
    assert.equal(restored.tgBotToken, "current-tg-secret");
  } finally {
    invalidateRuntimeConfigCache();
  }
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
