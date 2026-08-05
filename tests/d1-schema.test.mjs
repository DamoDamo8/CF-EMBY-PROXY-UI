import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { Miniflare } from "miniflare";

import { createTestApplication } from "../worker/testing/hooks.js";

const { testPlatform, workerHandler } = createTestApplication();
const kernel = testPlatform.d1;
const logger = testPlatform.fetch.logger;
const adminActions = testPlatform.fetch.adminActions;

const CURRENT_TABLES = [
  "d1_schema_meta",
  "sys_status",
  "sys_locks",
  "auth_failures",
  "cf_dashboard_cache",
  "cf_runtime_cache",
  "dns_ip_pool_items",
  "dns_ip_pool_sources",
  "dns_ip_pool_fetch_cache",
  "dns_ip_probe_cache",
  "proxy_logs",
  "proxy_stats_hourly",
  "proxy_logs_fts"
];

const RETIRED_TABLES = [
  ["d1", "migrations"].join("_"),
  ["server", "last", "watch"].join("_"),
  ["server", "record", "snapshots"].join("_"),
  ["server", "record", "poster", "cache"].join("_")
];

function createD1Adapter(database, options = {}) {
  let batchTail = Promise.resolve();
  const events = options.events || [];
  const adapter = {
    prepare(sql) {
      const sqlText = String(sql);
      let bindings = [];
      const prepared = {
        bind(...values) {
          bindings = values;
          return prepared;
        },
        async run() {
          if (options.queryCounter) options.queryCounter.count += 1;
          events.push({ type: "run", sql: sqlText });
          if (typeof options.failRun === "function") options.failRun(sqlText, events);
          return database.prepare(sqlText).run(...bindings);
        },
        async all() {
          if (options.queryCounter) options.queryCounter.count += 1;
          return { results: database.prepare(sqlText).all(...bindings) };
        },
        async first() {
          if (options.queryCounter) options.queryCounter.count += 1;
          return database.prepare(sqlText).get(...bindings) || null;
        }
      };
      return prepared;
    },
    batch(statements) {
      const task = batchTail.then(async () => {
        database.exec("BEGIN");
        try {
          const results = [];
          for (const statement of statements) results.push(await statement.run());
          database.exec("COMMIT");
          return results;
        } catch (error) {
          database.exec("ROLLBACK");
          throw error;
        }
      });
      batchTail = task.catch(() => {});
      return task;
    }
  };
  if (options.sessions !== false) {
    adapter.withSession = () => ({
      prepare: sql => adapter.prepare(sql),
      getBookmark: () => String(options.bookmark || "test-bookmark")
    });
  }
  return adapter;
}

function getTableNames(database) {
  return new Set(database.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(row => row.name));
}

function createKv() {
  const values = new Map();
  return {
    async get(key, options = {}) {
      const value = values.get(key);
      if (value === undefined) return null;
      return options.type === "json" ? JSON.parse(value) : value;
    },
    async put(key, value) {
      values.set(key, String(value));
    },
    async delete(key) {
      values.delete(key);
    },
    async list(options = {}) {
      const prefix = String(options.prefix || "");
      return {
        keys: [...values.keys()].filter(key => key.startsWith(prefix)).map(name => ({ name })),
        list_complete: true
      };
    }
  };
}

async function withDatabase(callback, options = {}) {
  const database = new DatabaseSync(":memory:");
  try {
    return await callback(database, createD1Adapter(database, options));
  } finally {
    database.close();
  }
}

async function prepareDestructiveRepair(db, env = { JWT_SECRET: "schema-repair-test-secret" }) {
  let plan = await kernel.buildD1SchemaRepairPlan(db);
  if (plan.phase === "safe") {
    const preparation = await kernel.initializeD1Database(db, {
      includeFts: true,
      env,
      repairMode: "safe"
    });
    assert.equal(preparation.pendingHighRisk, true);
    plan = await kernel.buildD1SchemaRepairPlan(db);
  }
  assert.equal(plan.phase, "destructive");
  const token = (await kernel.createD1SchemaRepairToken(env, plan)).token;
  return { plan, token };
}

test("empty D1 initializes the current schema directly", async () => {
  const events = [];
  await withDatabase(async (database, db) => {
    const result = await kernel.initializeD1Database(db, { includeFts: true });
    const status = await kernel.getD1SchemaStatus(db);
    const tables = getTableNames(database);

    assert.equal(result.schemaReady, true);
    assert.deepEqual(Object.keys(result).sort(), [
      "addedColumns",
      "bookmarkCapturedAt",
      "completed",
      "contractHash",
      "contractVersion",
      "createdIndexes",
      "createdTables",
      "ftsRebuilt",
      "ftsRecreated",
      "pendingHighRisk",
      "phase",
      "planHash",
      "profile",
      "rebuiltTables",
      "recoveryBookmark",
      "repairedIndexes",
      "risk",
      "schemaMeta",
      "schemaReady",
      "status",
      "steps",
      "uniqueIndexesCreated"
    ]);
    assert.equal(status.schemaReady, true);
    for (const tableName of CURRENT_TABLES) assert.equal(tables.has(tableName), true, tableName);
    for (const tableName of RETIRED_TABLES) assert.equal(tables.has(tableName), false, tableName);

    const firstSchemaWrite = events.findIndex(event => /^(?:CREATE|INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(String(event.sql || "").trim()));
    assert.ok(firstSchemaWrite >= 0);
  }, { events });
});

test("repeated current-schema initialization is idempotent", async () => {
  await withDatabase(async (database, db) => {
    const first = await kernel.initializeD1Database(db, { includeFts: true });
    const tablesAfterFirst = [...getTableNames(database)].sort();
    const second = await kernel.initializeD1Database(db, { includeFts: true });

    assert.equal(first.schemaReady, true);
    assert.equal(second.schemaReady, true);
    assert.deepEqual([...getTableNames(database)].sort(), tablesAfterFirst);
    assert.deepEqual(second.createdTables, []);
  });
});

test("runtime config persistence is KV-only", async () => {
  const kv = createKv();
  await kv.put(kernel.CONFIG_KEY, JSON.stringify({ rateLimitRpm: 12 }));
  const env = { ENI_KV: kv };

  const saved = await kernel.persistRuntimeConfig({ rateLimitRpm: 20 }, { env, kv });
  assert.equal(saved.rateLimitRpm, 20);
  assert.equal((await kv.get(kernel.CONFIG_KEY, { type: "json" })).rateLimitRpm, 20);
});

test("a true affinity conflict fails before schema writes", async () => {
  const events = [];
  await withDatabase(async (database, db) => {
    database.exec("CREATE TABLE proxy_logs (id TEXT PRIMARY KEY)");
    events.length = 0;

    await assert.rejects(
      kernel.initializeD1Database(db, { includeFts: true }),
      error => error?.code === "D1_SCHEMA_REPAIR_BLOCKED"
        && error?.details?.blockingIssues?.includes("invalid_column_affinity:proxy_logs.id")
    );
    assert.equal(events.some(event => /^(?:CREATE|INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(String(event.sql || "").trim())), false);
    assert.deepEqual(database.prepare("PRAGMA table_info(proxy_logs)").all().map(row => row.name), ["id"]);
  }, { events });
});

test("repairable primary and unique key contracts are repaired without data loss", async t => {
  await t.test("primary key requires a signed high-risk confirmation", async () => {
    await withDatabase(async (database, db) => {
      database.exec("CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL DEFAULT 0)");
      database.exec("INSERT INTO sys_status (scope, payload, updated_at) VALUES ('runtime', '{}', 1)");
      const initialPlan = await kernel.buildD1SchemaRepairPlan(db);
      assert.equal(initialPlan.phase, "safe");
      const env = { JWT_SECRET: "schema-repair-test-secret" };
      const preparation = await kernel.initializeD1Database(db, { includeFts: true, env, repairMode: "safe" });
      assert.equal(preparation.pendingHighRisk, true);
      const plan = await kernel.buildD1SchemaRepairPlan(db);
      assert.equal(plan.phase, "destructive");
      assert.ok(plan.highRiskIssues.includes("invalid_primary_key:sys_status"));
      await assert.rejects(
        kernel.initializeD1Database(db, { includeFts: true }),
        error => error?.code === "D1_SCHEMA_REPAIR_CONFIRMATION_REQUIRED"
      );
      const token = (await kernel.createD1SchemaRepairToken(env, plan)).token;
      const result = await kernel.initializeD1Database(db, { includeFts: true, env, repairToken: token, confirmHighRisk: true });
      assert.equal(result.schemaReady, true);
      assert.deepEqual(result.rebuiltTables, [{ table: "sys_status", rowCount: 1 }]);
      assert.equal(result.recoveryBookmark, "test-bookmark");
      assert.equal(database.prepare("SELECT payload FROM sys_status WHERE scope = 'runtime'").get().payload, "{}");
      assert.deepEqual(database.prepare("PRAGMA table_info(sys_status)").all().filter(row => row.pk > 0).map(row => row.name), ["scope"]);
    });
  });

  await t.test("unique key", async () => {
    await withDatabase(async (database, db) => {
      database.exec(`CREATE TABLE dns_ip_pool_items (
        id TEXT PRIMARY KEY,
        ip TEXT NOT NULL,
        ip_type TEXT NOT NULL DEFAULT '',
        source_kind TEXT NOT NULL DEFAULT '',
        source_label TEXT,
        line_label TEXT NOT NULL DEFAULT '',
        remark TEXT,
        created_at TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT ''
      )`);
      database.exec("INSERT INTO dns_ip_pool_items (id, ip, ip_type, source_kind, line_label, created_at, updated_at) VALUES ('one', '203.0.113.1', 'IPv4', 'manual', '', 'now', 'now')");
      const result = await kernel.initializeD1Database(db, { includeFts: true });
      assert.equal(result.schemaReady, true);
      assert.ok(result.uniqueIndexesCreated.includes("ux_dns_ip_pool_items_ip"));
      assert.equal(database.prepare("SELECT ip FROM dns_ip_pool_items WHERE id = 'one'").get().ip, "203.0.113.1");
    });
  });
});

test("wrong column types and existing index definitions fail before writes", async t => {
  await t.test("column type", async () => {
    const events = [];
    await withDatabase(async (database, db) => {
      database.exec("CREATE TABLE sys_status (scope TEXT PRIMARY KEY, payload INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL DEFAULT 0)");
      events.length = 0;
      await assert.rejects(
        kernel.initializeD1Database(db, { includeFts: true }),
        error => error?.code === "D1_SCHEMA_REPAIR_BLOCKED" && error?.details?.blockingIssues?.includes("invalid_column_affinity:sys_status.payload")
      );
      assert.equal(events.some(event => /^(?:CREATE|INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(String(event.sql || "").trim())), false);
    }, { events });
  });

  await t.test("index columns", async () => {
    const events = [];
    await withDatabase(async (database, db) => {
      await kernel.initializeD1Database(db, { includeFts: true });
      database.exec("DROP INDEX idx_proxy_logs_category_time");
      database.exec("CREATE INDEX idx_proxy_logs_category_time ON proxy_logs (node_name)");
      events.length = 0;
      const result = await kernel.initializeD1Database(db, { includeFts: true });
      assert.equal(result.schemaReady, true);
      assert.ok(result.repairedIndexes.includes("idx_proxy_logs_category_time"));
      assert.deepEqual(database.prepare("PRAGMA index_info(idx_proxy_logs_category_time)").all().map(row => row.name), ["category", "timestamp"]);
      assert.equal(events.some(event => /^DROP INDEX/i.test(String(event.sql || "").trim())), true);
    }, { events });
  });
});

test("safe historical columns are added and affinity aliases remain compatible", async () => {
  await withDatabase(async (database, db) => {
    database.exec(`CREATE TABLE proxy_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INT NOT NULL,
      node_name VARCHAR NOT NULL,
      request_path TEXT NOT NULL,
      request_method TEXT NOT NULL,
      status_code INT NOT NULL,
      response_time INT NOT NULL,
      client_ip TEXT NOT NULL,
      user_agent TEXT,
      referer TEXT,
      created_at VARCHAR NOT NULL
    )`);
    database.exec("INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, created_at) VALUES (1, 'alpha', '/Items', 'GET', 200, 5, '', 'old')");
    const result = await kernel.initializeD1Database(db, { includeFts: true });
    assert.equal(result.schemaReady, true);
    assert.ok(result.addedColumns.includes("proxy_logs.category"));
    assert.equal(database.prepare("SELECT category FROM proxy_logs WHERE id = 1").get().category, "api");
  });
});

test("unique-key data conflicts block all schema writes", async () => {
  const events = [];
  await withDatabase(async (database, db) => {
    database.exec(`CREATE TABLE dns_ip_pool_items (
      id TEXT PRIMARY KEY, ip TEXT NOT NULL, ip_type TEXT NOT NULL, source_kind TEXT NOT NULL,
      source_label TEXT, line_label TEXT NOT NULL DEFAULT '', remark TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    )`);
    database.exec("INSERT INTO dns_ip_pool_items (id, ip, ip_type, source_kind, line_label, created_at, updated_at) VALUES ('one', '203.0.113.1', 'IPv4', 'manual', '', 'now', 'now'), ('two', '203.0.113.1', 'IPv4', 'manual', '', 'now', 'now')");
    events.length = 0;
    await assert.rejects(
      kernel.initializeD1Database(db, { includeFts: true }),
      error => error?.code === "D1_SCHEMA_REPAIR_BLOCKED" && error?.details?.blockingIssues?.includes("unique_key_duplicate:dns_ip_pool_items.ip")
    );
    assert.equal(events.some(event => /^(?:CREATE|INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(String(event.sql || "").trim())), false);
  }, { events });
});

test("unsafe primary-key differences block without schema writes", async t => {
  for (const [name, setupSql, expectedIssue] of [
    ["empty key", "CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL); INSERT INTO sys_status VALUES (NULL, '{}', 1)", "primary_key_empty:sys_status"],
    ["duplicate key", "CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL); INSERT INTO sys_status VALUES ('same', '{}', 1), ('same', '{}', 2)", "primary_key_duplicate:sys_status"],
    ["unknown column", "CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL, legacy_value TEXT); INSERT INTO sys_status VALUES ('runtime', '{}', 1, 'keep')", "unsupported_extra_columns:sys_status:legacy_value"],
    ["unknown trigger", "CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL); CREATE TRIGGER legacy_status_update AFTER UPDATE ON sys_status BEGIN SELECT 1; END", "unsupported_triggers:sys_status:legacy_status_update"]
  ]) {
    await t.test(name, async () => {
      const events = [];
      await withDatabase(async (database, db) => {
        database.exec(setupSql);
        events.length = 0;
        await assert.rejects(
          kernel.initializeD1Database(db, { includeFts: true }),
          error => error?.code === "D1_SCHEMA_REPAIR_BLOCKED" && error?.details?.blockingIssues?.includes(expectedIssue)
        );
        assert.equal(events.some(event => /^(?:CREATE|INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(String(event.sql || "").trim())), false);
      }, { events });
    });
  }

  await t.test("row limit", async () => {
    const events = [];
    await withDatabase(async (database, db) => {
      database.exec("CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL); WITH RECURSIVE seq(value) AS (VALUES(1) UNION ALL SELECT value + 1 FROM seq WHERE value < 10001) INSERT INTO sys_status SELECT 'scope-' || value, '{}', value FROM seq");
      events.length = 0;
      await assert.rejects(
        kernel.initializeD1Database(db, { includeFts: true }),
        error => error?.code === "D1_SCHEMA_REPAIR_BLOCKED"
          && error?.details?.blockingIssues?.includes("rebuild_row_limit_exceeded:sys_status:10001")
      );
      assert.equal(events.some(event => /^(?:CREATE|INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(String(event.sql || "").trim())), false);
    }, { events });
  });
});

test("proxy log primary-key repair atomically recreates the table without scanning or copying logs", async () => {
  const events = [];
  await withDatabase(async (database, db) => {
    database.exec("CREATE TABLE proxy_logs (id INTEGER, legacy_value TEXT); CREATE TRIGGER legacy_proxy_logs_insert AFTER INSERT ON proxy_logs BEGIN SELECT 1; END; WITH RECURSIVE seq(value) AS (VALUES(1) UNION ALL SELECT value + 1 FROM seq WHERE value < 10001) INSERT INTO proxy_logs SELECT 1, 'legacy-' || value FROM seq");
    const env = { JWT_SECRET: "schema-repair-test-secret" };
    const { plan, token } = await prepareDestructiveRepair(db, env);
    const rebuildStep = plan.steps.find(step => step.kind === "recreate_log_table" && step.target === "proxy_logs");
    assert.equal(plan.phase, "destructive");
    assert.equal(plan.blockingIssues.length, 0);
    assert.equal(rebuildStep.allowsDataLoss, true);
    assert.equal(rebuildStep.willDiscardData, true);
    assert.equal(rebuildStep.dataMode, "discard");
    assert.equal(rebuildStep.estimatedRows, null);
    assert.equal(rebuildStep.rowCountMeasured, false);

    events.length = 0;
    const result = await kernel.initializeD1Database(db, {
      includeFts: true,
      env,
      repairToken: token,
      confirmHighRisk: true
    });

    assert.equal(result.schemaReady, true);
    assert.deepEqual(result.rebuiltTables, [{
      table: "proxy_logs",
      rowCount: 0,
      rowCountMeasured: false,
      discardedRows: null,
      discardedRowsIsLowerBound: false,
      allowsDataLoss: true,
      willDiscardData: true,
      dataMode: "discard"
    }]);
    assert.equal(result.recoveryBookmark, "test-bookmark");
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM proxy_logs").get().total, 0);
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM sqlite_master WHERE type = 'trigger' AND name = 'legacy_proxy_logs_insert'").get().total, 0);
    assert.equal(events.some(event => /(?:COUNT\(\*\)|SELECT\s+.+\s+FROM)\s+proxy_logs/i.test(event.sql.trim())), false);
    assert.equal(events.some(event => /__d1_(?:repair|backup)_proxy_logs_/i.test(event.sql.trim())), false);
    assert.equal(events.some(event => /INSERT\s+INTO\s+"?proxy_logs"?.*SELECT/i.test(event.sql.trim())), false);
    assert.equal(events.some(event => /VALUES\s*\(\s*'rebuild'\s*\)/i.test(event.sql.trim())), false);
    assert.equal((await kernel.getD1SchemaStatus(db)).schemaReady, true);
  }, { events });
});

test("destructive proxy log plans remain stable while new logs arrive", async () => {
  await withDatabase(async (database, db) => {
    database.exec("CREATE TABLE proxy_logs (id INTEGER, legacy_value TEXT); INSERT INTO proxy_logs VALUES (1, 'first')");
    const env = { JWT_SECRET: "schema-repair-test-secret" };
    await kernel.initializeD1Database(db, { includeFts: true, env, repairMode: "safe" });
    const firstPlan = await kernel.buildD1SchemaRepairPlan(db);
    database.exec("INSERT INTO proxy_logs VALUES (2, 'second'), (3, 'third')");
    const secondPlan = await kernel.buildD1SchemaRepairPlan(db);

    assert.equal(firstPlan.phase, "destructive");
    assert.equal(firstPlan.planHash, secondPlan.planHash);
    assert.equal(firstPlan.steps.find(step => step.kind === "recreate_log_table")?.estimatedRows, null);
  });
});

test("destructive proxy log recreation rolls back the whole batch on failure", async () => {
  let injected = false;
  await withDatabase(async (database, db) => {
    database.exec("CREATE TABLE proxy_logs (id INTEGER, legacy_value TEXT); INSERT INTO proxy_logs VALUES (1, 'kept')");
    const env = { JWT_SECRET: "schema-repair-test-secret" };
    const { token } = await prepareDestructiveRepair(db, env);

    await assert.rejects(
      kernel.initializeD1Database(db, { includeFts: true, env, repairToken: token, confirmHighRisk: true }),
      error => error?.code === "D1_SCHEMA_REPAIR_FAILED" && error?.details?.recoveryBookmark === "atomic-bookmark"
    );
    assert.equal(database.prepare("SELECT legacy_value FROM proxy_logs WHERE id = 1").get().legacy_value, "kept");
    assert.deepEqual(database.prepare("PRAGMA table_info(proxy_logs)").all().map(row => row.name), ["id", "legacy_value"]);
  }, {
    bookmark: "atomic-bookmark",
    failRun(sql) {
      if (!injected && /^CREATE INDEX idx_proxy_logs_status_time\b/i.test(sql.trim())) {
        injected = true;
        throw new Error("injected destructive batch failure");
      }
    }
  });
});

test("schema metadata attestation trusts only unchanged verified schemas", async () => {
  await withDatabase(async (database, db) => {
    const env = { JWT_SECRET: "schema-attestation-secret" };
    const initialized = await kernel.initializeD1Database(db, { includeFts: true, env });
    assert.equal(initialized.schemaMeta.written, true);

    const fast = await kernel.getD1SchemaReadiness(db, { allowAttestedFastPath: true, env });
    assert.equal(fast.schemaReady, true);
    assert.equal(fast.fastPath, true);

    database.exec("CREATE TABLE unrelated_history (id TEXT)");
    const changed = await kernel.getD1SchemaReadiness(db, { allowAttestedFastPath: true, env });
    assert.equal(changed.schemaReady, true);
    assert.equal(changed.fastPath, false);

    await kernel.initializeD1Database(db, { includeFts: true, env });
    const refreshed = await kernel.getD1SchemaReadiness(db, { allowAttestedFastPath: true, env });
    assert.equal(refreshed.fastPath, true);

    database.exec("UPDATE d1_schema_meta SET attestation = 'tampered' WHERE scope = 'main'");
    const tampered = await kernel.getD1SchemaReadiness(db, { allowAttestedFastPath: true, env });
    assert.equal(tampered.schemaReady, true);
    assert.equal(tampered.fastPath, false);
  });
});

test("a database schema version newer than the worker is blocked", async () => {
  await withDatabase(async (database, db) => {
    const env = { JWT_SECRET: "schema-version-secret" };
    await kernel.initializeD1Database(db, { includeFts: true, env });
    database.exec("UPDATE d1_schema_meta SET contract_version = 999 WHERE scope = 'main'");

    const plan = await kernel.buildD1SchemaRepairPlan(db);
    assert.equal(plan.phase, "blocked");
    assert.ok(plan.blockingIssues.includes("schema_version_ahead:999"));
    await assert.rejects(
      kernel.initializeD1Database(db, { includeFts: true, env }),
      error => error?.code === "D1_SCHEMA_REPAIR_BLOCKED"
    );
  });
});

test("cross-isolate schema repair leases block competing mutations until released", async () => {
  await withDatabase(async (database, db) => {
    const env = { JWT_SECRET: "schema-lease-secret" };
    await kernel.initializeD1Database(db, { includeFts: true, env });
    database.exec("DROP INDEX idx_sys_locks_expires_at");
    await kernel.acquireD1SchemaRepairLease(db, "other-isolate");

    await assert.rejects(
      kernel.initializeD1Database(db, { includeFts: true, env, repairMode: "safe" }),
      error => error?.code === "D1_SCHEMA_REPAIR_IN_PROGRESS"
    );
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM sqlite_master WHERE type = 'index' AND name = 'idx_sys_locks_expires_at'").get().total, 0);

    await kernel.releaseD1SchemaRepairLease(db, "other-isolate");
    const repaired = await kernel.initializeD1Database(db, { includeFts: true, env, repairMode: "safe" });
    assert.equal(repaired.schemaReady, true);
  });
});

test("proxy log lossy rebuild still blocks affinity conflicts and foreign keys", async t => {
  await t.test("affinity conflict", async () => {
    const events = [];
    await withDatabase(async (database, db) => {
      database.exec("CREATE TABLE proxy_logs (id TEXT, legacy_value TEXT)");
      events.length = 0;
      await assert.rejects(
        kernel.initializeD1Database(db, { includeFts: true }),
        error => error?.code === "D1_SCHEMA_REPAIR_BLOCKED"
          && error?.details?.blockingIssues?.includes("invalid_column_affinity:proxy_logs.id")
      );
      assert.equal(events.some(event => /^(?:CREATE|INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(String(event.sql || "").trim())), false);
    }, { events });
  });

  await t.test("foreign key", async () => {
    const events = [];
    await withDatabase(async (database, db) => {
      database.exec("CREATE TABLE legacy_parent (id TEXT PRIMARY KEY); CREATE TABLE proxy_logs (id INTEGER, parent_id TEXT REFERENCES legacy_parent(id))");
      events.length = 0;
      await assert.rejects(
        kernel.initializeD1Database(db, { includeFts: true }),
        error => error?.code === "D1_SCHEMA_REPAIR_BLOCKED"
          && error?.details?.blockingIssues?.includes("unsupported_foreign_keys:proxy_logs")
      );
      assert.equal(events.some(event => /^(?:CREATE|INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(String(event.sql || "").trim())), false);
    }, { events });
  });
});

test("high-risk repair rejects missing recovery and stale tokens before writes", async t => {
  await t.test("bookmark unavailable", async () => {
    const events = [];
    await withDatabase(async (database, db) => {
      database.exec("CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL); INSERT INTO sys_status VALUES ('runtime', '{}', 1)");
      const env = { JWT_SECRET: "schema-repair-test-secret" };
      const { token } = await prepareDestructiveRepair(db, env);
      events.length = 0;
      await assert.rejects(
        kernel.initializeD1Database(db, { includeFts: true, env, repairToken: token, confirmHighRisk: true }),
        error => error?.code === "D1_SCHEMA_REPAIR_RECOVERY_UNAVAILABLE"
      );
      assert.equal(events.some(event => /^(?:CREATE|INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(String(event.sql || "").trim())), false);
    }, { events, sessions: false });
  });

  await t.test("expired and tampered tokens", async () => {
    await withDatabase(async (database, db) => {
      database.exec("CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL); INSERT INTO sys_status VALUES ('runtime', '{}', 1)");
      const env = { JWT_SECRET: "schema-repair-test-secret" };
      const { plan } = await prepareDestructiveRepair(db, env);
      const issued = await kernel.createD1SchemaRepairToken(env, plan, { nowMs: 1000 });
      await assert.rejects(
        kernel.verifyD1SchemaRepairToken(env, issued.token, plan, { nowMs: 601000 }),
        error => error?.code === "D1_SCHEMA_REPAIR_PLAN_STALE" && error?.details?.reason === "expired"
      );
      await assert.rejects(
        kernel.verifyD1SchemaRepairToken(env, issued.token + "tampered", plan, { nowMs: 2000 }),
        error => error?.code === "D1_SCHEMA_REPAIR_PLAN_STALE" && error?.details?.reason === "invalid_signature"
      );
    });
  });

  await t.test("schema fingerprint changed", async () => {
    const events = [];
    await withDatabase(async (database, db) => {
      database.exec("CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL); INSERT INTO sys_status VALUES ('runtime', '{}', 1)");
      const env = { JWT_SECRET: "schema-repair-test-secret" };
      const { token } = await prepareDestructiveRepair(db, env);
      database.exec("CREATE INDEX legacy_status_payload ON sys_status (payload)");
      events.length = 0;
      await assert.rejects(
        kernel.initializeD1Database(db, { includeFts: true, env, repairToken: token, confirmHighRisk: true }),
        error => error?.code === "D1_SCHEMA_REPAIR_PLAN_STALE" && error?.details?.reason === "schema_changed"
      );
      assert.equal(events.some(event => /^(?:CREATE|INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(String(event.sql || "").trim())), false);
    }, { events });
  });
});

test("high-risk repair preserves extra indexes and rolls back on a later failure", async t => {
  await t.test("preserves an extra index", async () => {
    await withDatabase(async (database, db) => {
      database.exec("CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL); CREATE INDEX legacy_status_payload ON sys_status (payload); INSERT INTO sys_status VALUES ('runtime', '{}', 1)");
      const env = { JWT_SECRET: "schema-repair-test-secret" };
      const { token } = await prepareDestructiveRepair(db, env);
      const result = await kernel.initializeD1Database(db, { includeFts: true, env, repairToken: token, confirmHighRisk: true });
      assert.equal(result.schemaReady, true);
      assert.equal(database.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = 'legacy_status_payload'").get().tbl_name, "sys_status");
    });
  });

  await t.test("rolls back switched tables", async () => {
    let injected = false;
    await withDatabase(async (database, db) => {
      database.exec("CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL); INSERT INTO sys_status VALUES ('runtime', '{\"kept\":true}', 1)");
      const env = { JWT_SECRET: "schema-repair-test-secret" };
      const { token } = await prepareDestructiveRepair(db, env);
      await assert.rejects(
        kernel.initializeD1Database(db, { includeFts: true, env, repairToken: token, confirmHighRisk: true }),
        error => error?.code === "D1_SCHEMA_REPAIR_FAILED"
          && error?.details?.recoveryBookmark === "rollback-bookmark"
          && error?.details?.executedSteps?.some(step => step.kind === "rebuild_table" && step.target === "sys_status")
      );
      assert.equal(database.prepare("SELECT payload FROM sys_status WHERE scope = 'runtime'").get().payload, "{\"kept\":true}");
      assert.deepEqual(database.prepare("PRAGMA table_info(sys_status)").all().filter(row => row.pk > 0), []);
      assert.equal([...getTableNames(database)].some(name => name.startsWith("__d1_backup_sys_status_")), false);
    }, {
      bookmark: "rollback-bookmark",
      failRun(sql) {
        if (!injected && /^DROP TABLE IF EXISTS "__d1_backup_sys_status_/i.test(sql.trim())) {
          injected = true;
          throw new Error("injected index failure");
        }
      }
    });
  });
});

test("incompatible FTS is recreated and historical logs remain searchable", async () => {
  await withDatabase(async (database, db) => {
    await kernel.initializeD1Database(db, { includeFts: true });
    database.exec("INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, category, created_at) VALUES (1, 'historic-node', '/Items', 'GET', 200, 5, '', 'api', 'old'); DROP TABLE proxy_logs_fts; CREATE VIRTUAL TABLE proxy_logs_fts USING fts5(node_name)");
    const result = await kernel.initializeD1Database(db, { includeFts: true });
    assert.equal(result.schemaReady, true);
    assert.equal(result.ftsRecreated, true);
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM proxy_logs_fts WHERE proxy_logs_fts MATCH 'historic'").get().total, 1);
  });
});

test("concurrent high-risk initialization executes one shadow switch per plan", async () => {
  const events = [];
  await withDatabase(async (database, db) => {
    database.exec("CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL); INSERT INTO sys_status VALUES ('runtime', '{}', 1)");
    const env = { JWT_SECRET: "schema-repair-test-secret" };
    const { plan } = await prepareDestructiveRepair(db, env);
    const baseNow = Date.now();
    const firstToken = (await kernel.createD1SchemaRepairToken(env, plan, { nowMs: baseNow })).token;
    const secondToken = (await kernel.createD1SchemaRepairToken(env, plan, { nowMs: baseNow + 1000 })).token;
    const results = await Promise.all([
      kernel.initializeD1Database(db, { includeFts: true, env, repairToken: firstToken, confirmHighRisk: true }),
      kernel.initializeD1Database(db, { includeFts: true, env, repairToken: secondToken, confirmHighRisk: true })
    ]);
    assert.equal(results.every(result => result.schemaReady === true), true);
    assert.equal(events.filter(event => /^ALTER TABLE "sys_status" RENAME TO /i.test(event.sql.trim())).length, 1);
  }, { events });
});

test("admin D1 schema API preserves repair plans, confirmation errors, and bookmarks", async () => {
  await withDatabase(async (database, db) => {
    database.exec("CREATE TABLE sys_status (scope TEXT, payload TEXT NOT NULL, updated_at INTEGER NOT NULL); INSERT INTO sys_status VALUES ('runtime', '{}', 1)");
    const baseEnv = {
      ADMIN_PATH: "/admin",
      ADMIN_PASS: "admin-password",
      JWT_SECRET: "schema-api-secret"
    };
    const login = await workerHandler.fetch(
      new Request("https://worker.test/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: baseEnv.ADMIN_PASS })
      }),
      baseEnv,
      { waitUntil() {} }
    );
    assert.equal(login.status, 200);
    const cookie = String(login.headers.get("Set-Cookie") || "").split(";", 1)[0];
    const env = { ...baseEnv, DB: db, KV: createKv() };
    const callAdmin = (body, headers = {}) => workerHandler.fetch(
      new Request("https://worker.test/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie, ...headers },
        body: JSON.stringify(body)
      }),
      env,
      { waitUntil() {} }
    );

    const previewBeforeResponse = await callAdmin({ action: "previewTidyData", scope: "d1" });
    assert.equal(previewBeforeResponse.status, 200);
    const previewBefore = await previewBeforeResponse.json();
    assert.equal(previewBefore.requiresSchemaInitialization, true);
    assert.equal(previewBefore.planToken, "");

    const statusResponse = await callAdmin({ action: "getD1SchemaStatus" });
    const statusPayload = await statusResponse.json();
    assert.equal(statusResponse.status, 200, JSON.stringify(statusPayload));
    assert.equal(statusPayload.repairPlan.phase, "safe");
    assert.ok(statusPayload.repairPlan.highRiskIssues.includes("invalid_primary_key:sys_status"));
    assert.equal(statusPayload.repairPlan.repairToken, "");

    const preparationResponse = await callAdmin({ action: "initLogsDb", repairMode: "safe" });
    assert.equal(preparationResponse.status, 200);
    const preparationPayload = await preparationResponse.json();
    assert.equal(preparationPayload.pendingHighRisk, true);
    assert.equal(preparationPayload.schemaReady, false);

    const destructiveStatusResponse = await callAdmin({ action: "getD1SchemaStatus" });
    const destructiveStatusPayload = await destructiveStatusResponse.json();
    assert.equal(destructiveStatusPayload.repairPlan.phase, "destructive");
    assert.ok(destructiveStatusPayload.repairPlan.repairToken);

    const confirmationResponse = await callAdmin({
      action: "initLogsDb",
      repairMode: "confirmed-destructive",
      repairToken: destructiveStatusPayload.repairPlan.repairToken
    });
    assert.equal(confirmationResponse.status, 428);
    const confirmationPayload = await confirmationResponse.json();
    assert.equal(confirmationPayload.error.code, "D1_SCHEMA_REPAIR_CONFIRMATION_REQUIRED");
    assert.equal(confirmationPayload.error.details.repairPlan.planHash, destructiveStatusPayload.repairPlan.planHash);

    const repairedResponse = await callAdmin(
      { action: "initLogsDb", repairMode: "confirmed-destructive", repairToken: destructiveStatusPayload.repairPlan.repairToken },
      { "X-Admin-Confirm": "repairD1Schema" }
    );
    assert.equal(repairedResponse.status, 200);
    const repairedPayload = await repairedResponse.json();
    assert.equal(repairedPayload.schemaReady, true);
    assert.equal(repairedPayload.initialization.recoveryBookmark, "test-bookmark");
    assert.deepEqual(repairedPayload.initialization.rebuiltTables, [{ table: "sys_status", rowCount: 1 }]);

    const previewAfterResponse = await callAdmin({ action: "previewTidyData", scope: "d1" });
    assert.equal(previewAfterResponse.status, 200);
    const previewAfter = await previewAfterResponse.json();
    assert.equal(previewAfter.requiresSchemaInitialization, false);
    assert.ok(previewAfter.planToken);
  });
});

test("admin D1 schema API returns blocking details with zero writes", async () => {
  const events = [];
  await withDatabase(async (database, db) => {
    database.exec("CREATE TABLE dns_ip_pool_items (id TEXT PRIMARY KEY, ip TEXT NOT NULL, ip_type TEXT NOT NULL, source_kind TEXT NOT NULL, source_label TEXT, line_label TEXT NOT NULL DEFAULT '', remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL); INSERT INTO dns_ip_pool_items VALUES ('one', '203.0.113.1', 'IPv4', 'manual', NULL, '', NULL, 'now', 'now'), ('two', '203.0.113.1', 'IPv4', 'manual', NULL, '', NULL, 'now', 'now')");
    const baseEnv = { ADMIN_PATH: "/admin", ADMIN_PASS: "admin-password", JWT_SECRET: "schema-api-secret" };
    const login = await workerHandler.fetch(
      new Request("https://worker.test/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: baseEnv.ADMIN_PASS })
      }),
      baseEnv,
      { waitUntil() {} }
    );
    const cookie = String(login.headers.get("Set-Cookie") || "").split(";", 1)[0];
    events.length = 0;
    const response = await workerHandler.fetch(
      new Request("https://worker.test/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ action: "initLogsDb" })
      }),
      { ...baseEnv, DB: db, KV: createKv() },
      { waitUntil() {} }
    );
    const payload = await response.json();
    assert.equal(response.status, 409, JSON.stringify(payload));
    assert.equal(payload.error.code, "D1_SCHEMA_REPAIR_BLOCKED");
    assert.ok(payload.error.details.blockingIssues.includes("unique_key_duplicate:dns_ip_pool_items.ip"));
    assert.equal(events.some(event => /^(?:CREATE|INSERT|UPDATE|DELETE|DROP|ALTER)\b/i.test(String(event.sql || "").trim())), false);
  }, { events });
});

test("extra legacy tables remain untouched and do not affect readiness", async () => {
  await withDatabase(async (database, db) => {
    database.exec("CREATE TABLE legacy_unused (id INTEGER PRIMARY KEY, payload TEXT)");
    database.exec("INSERT INTO legacy_unused (payload) VALUES ('preserved')");

    const result = await kernel.initializeD1Database(db, { includeFts: true });
    assert.equal(result.schemaReady, true);
    assert.equal(database.prepare("SELECT payload FROM legacy_unused").get().payload, "preserved");
    assert.equal(getTableNames(database).has("legacy_unused"), true);
  });
});

test("schema status exposes only current contract fields", async () => {
  await withDatabase(async (_database, db) => {
    await kernel.initializeD1Database(db, { includeFts: true });
    const status = await kernel.getD1SchemaStatus(db);

    assert.deepEqual(Object.keys(status).sort(), [
      "columns",
      "constraints",
      "fts",
      "ftsReady",
      "indexes",
      "issues",
      "schemaReady",
      "tables"
    ]);
    assert.equal(status.schemaReady, true);
    for (const key of ["migrationReady", "runtimeCompatibilityReady", "appliedMigrations", "missingMigrations", "schemaVersion"]) {
      assert.equal(Object.hasOwn(status, key), false, key);
    }
  });
});

test("current logs, statistics, DNS, status, cache, lock, auth, and FTS structures accept data", async () => {
  await withDatabase(async (database, db) => {
    await kernel.initializeD1Database(db, { includeFts: true });
    database.exec(`
      INSERT INTO sys_status (scope, payload, updated_at) VALUES ('runtime', '{}', 1);
      INSERT INTO sys_locks (scope, token, owner, acquired_at, expires_at) VALUES ('tidy', 'token', 'test', 1, 2);
      INSERT INTO auth_failures (ip, fail_count, expires_at, updated_at) VALUES ('203.0.113.1', 1, 2, 1);
      INSERT INTO cf_dashboard_cache (cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at) VALUES ('dash', 'zone', '2026-07-31', '{}', 1, 1, 2, 1);
      INSERT INTO cf_runtime_cache (cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at) VALUES ('runtime', 'quota', 'id', '{}', 1, 2, 1);
      INSERT INTO dns_ip_pool_items (id, ip, ip_type, source_kind, line_label, created_at, updated_at) VALUES ('ip-1', '203.0.113.2', 'IPv4', 'manual', '', 'now', 'now');
      INSERT INTO dns_ip_pool_sources (id, name, url, source_type, source_kind, enabled, sort_order, ip_limit, created_at, updated_at) VALUES ('source-1', 'source', 'https://example.test/ips', 'url', 'custom', 1, 0, 5, 'now', 'now');
      INSERT INTO dns_ip_pool_fetch_cache (signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at) VALUES ('sig', '[]', '[]', 0, 1, 1, 2, 'now', 'now');
      INSERT INTO dns_ip_probe_cache (ip, entry_colo, probe_status, probed_at, expires_at) VALUES ('203.0.113.2', 'SJC', 'ok', 'now', 2);
      INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, category, created_at) VALUES (1, 'alpha', '/Items', 'GET', 200, 5, '203.0.113.3', 'api', 'now');
      INSERT INTO proxy_stats_hourly (bucket_date, bucket_hour, request_count, play_count, playback_info_count, updated_at) VALUES ('2026-07-31', 12, 1, 0, 0, 'now');
    `);

    assert.equal(database.prepare("SELECT COUNT(*) AS count FROM proxy_logs").get().count, 1);
    assert.equal(database.prepare("SELECT COUNT(*) AS count FROM proxy_stats_hourly").get().count, 1);
    assert.equal(database.prepare("SELECT COUNT(*) AS count FROM proxy_logs_fts WHERE proxy_logs_fts MATCH 'alpha'").get().count, 1);
    assert.equal((await kernel.getD1SchemaStatus(db)).schemaReady, true);
  });
});

test("bulk DNS writes preserve all normalized rows", async () => {
  await withDatabase(async (database, db) => {
    await kernel.initializeD1Database(db, { includeFts: true });
    const items = Array.from({ length: 250 }, (_, index) => ({
      id: `item-${index}`,
      ip: `10.0.${Math.floor(index / 250)}.${index % 250 + 1}`,
      sourceKind: "manual",
      sourceLabel: "bulk"
    }));
    const sources = Array.from({ length: 250 }, (_, index) => ({
      id: `source-${index}`,
      name: `Source ${index}`,
      url: `https://example.test/${index}.txt`,
      sourceType: "url",
      sourceKind: "custom",
      enabled: true,
      sortOrder: index,
      ipLimit: 5
    }));

    await kernel.upsertDnsIpPoolItems(db, items);
    await kernel.persistDnsIpPoolSources({ db }, sources);

    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM dns_ip_pool_items").get().total, 250);
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM dns_ip_pool_sources").get().total, 250);
  });
});

test("D1 free-plan query budgets cover initialization, scheduled tidy, log flush, and DNS deletion", async () => {
  const queryCounter = { count: 0 };
  await withDatabase(async (database, db) => {
    const env = { DB: db, JWT_SECRET: "d1-query-budget-test" };
    const initialization = await kernel.initializeD1Database(db, { includeFts: true, env });
    await kernel.bumpLogsRevision(db, { schemaReady: true, ftsReady: true, statsReady: true, categoryEnabled: true });
    assert.equal(initialization.schemaReady, true);
    assert.ok(queryCounter.count <= 50, `initialization used ${queryCounter.count} D1 queries`);

    queryCounter.count = 0;
    const scheduledTasks = [];
    workerHandler.scheduled({ scheduledTime: Date.now() }, env, {
      waitUntil(task) {
        scheduledTasks.push(task);
      }
    });
    assert.equal(scheduledTasks.length, 1);
    await scheduledTasks[0];
    assert.ok(queryCounter.count <= 50, `scheduled handler used ${queryCounter.count} D1 queries`);

    queryCounter.count = 0;
    await kernel.tidyD1Data(env, {
      db,
      mode: "scheduled",
      maintenanceMode: "smart",
      config: { logRetentionDays: 30, scheduleUtcOffsetMinutes: 480 },
      scheduledNow: new Date()
    });
    assert.ok(queryCounter.count <= 50, `scheduled tidy used ${queryCounter.count} D1 queries`);

    queryCounter.count = 0;
    const runtimeConfig = {
      logEnabled: true,
      logWriteMode: "all",
      logFlushCountThreshold: 1000,
      logWriteDelayMinutes: 1000,
      logBatchChunkSize: 50,
      logBatchRetryCount: 0
    };
    for (let index = 0; index < 50; index += 1) logger.record(env, { waitUntil() {} }, {
      runtimeConfig,
      requestMethod: "GET",
      requestPath: `/api/${index}`,
      statusCode: 200,
      category: "api"
    });
    await logger.flush(env);
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM proxy_logs").get().total, 50);
    assert.ok(queryCounter.count <= 50, `50-row log flush used ${queryCounter.count} D1 queries`);

    await kernel.upsertDnsIpPoolItems(db, Array.from({ length: 250 }, (_, index) => ({
      ip: `10.2.0.${index + 1}`,
      sourceKind: "manual"
    })));
    queryCounter.count = 0;
    const deletedCount = await kernel.deleteDnsIpPoolItems(db, Array.from({ length: 250 }, (_, index) => `10.2.0.${index + 1}`));
    assert.equal(deletedCount, 250);
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM dns_ip_pool_items").get().total, 0);
    assert.ok(queryCounter.count <= 50, `250-row DNS deletion used ${queryCounter.count} D1 queries`);

    queryCounter.count = 0;
    const probeEntries = await kernel.upsertDnsIpProbeCacheEntries(db, Array.from({ length: 250 }, (_, index) => ({
      ip: `10.3.0.${index + 1}`,
      entryColo: "LAX",
      probeStatus: "ok",
      expiresAt: Date.now() + 60_000
    })));
    assert.equal(probeEntries.length, 250);
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM dns_ip_probe_cache").get().total, 250);
    assert.ok(queryCounter.count <= 50, `250-row DNS probe cache write used ${queryCounter.count} D1 queries`);
  }, { queryCounter });
});

test("schema readiness rejects write-breaking extra columns, unique indexes, and triggers", async () => {
  await withDatabase(async (database, db) => {
    database.exec("CREATE TABLE sys_status (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL, legacy_required TEXT NOT NULL)");
    const status = await kernel.getD1SchemaStatus(db);
    assert.equal(status.schemaReady, false);
    assert.ok(status.issues.includes("unsupported_required_columns:sys_status:legacy_required"));
  });

  for (const fixture of [
    ["CREATE UNIQUE INDEX legacy_unique_status_payload ON sys_status(payload)", "unsupported_unique_indexes:sys_status:legacy_unique_status_payload"],
    ["CREATE TRIGGER legacy_block_status BEFORE INSERT ON sys_status BEGIN SELECT RAISE(ABORT, 'legacy blocked'); END", "unsupported_triggers:sys_status:legacy_block_status"]
  ]) await withDatabase(async (database, db) => {
    await kernel.initializeD1Database(db, { includeFts: true });
    database.exec(fixture[0]);
    const status = await kernel.getD1SchemaStatus(db);
    assert.equal(status.schemaReady, false);
    assert.ok(status.issues.includes(fixture[1]));
    const plan = await kernel.buildD1SchemaRepairPlan(db);
    assert.equal(plan.phase, "blocked");
    assert.ok(plan.blockingIssues.includes(fixture[1]));
  });
});

test("DNS persistence enforces D1 serialized value and row limits", async () => {
  await withDatabase(async (_database, db) => {
    await kernel.initializeD1Database(db, { includeFts: true });
    await assert.rejects(
      kernel.persistDnsIpPoolSources(db, [{ name: "x".repeat(1_900_000), url: "https://example.com/list.txt" }]),
      error => error?.code === "D1_VALUE_TOO_LARGE" && error?.status === 400
    );

    const largeRemark = "x".repeat(1_000_000);
    const cached = await kernel.upsertDnsIpPoolFetchCacheEntry(db, {
      signature: "oversized-cache",
      items: [{ ip: "203.0.113.1", remark: largeRemark }],
      sourceResults: [{ id: "source", status: "success", items: [{ ip: "203.0.113.1", remark: largeRemark }] }]
    });
    assert.equal(cached, null);

    const oversizedPayload = { value: "x".repeat(1_900_000) };
    assert.equal(await kernel.putCfDashboardCacheEntry(db, {
      cacheKey: "oversized-dashboard",
      payload: { runtimeStatus: oversizedPayload }
    }), null);
    assert.equal(await kernel.putCfRuntimeCacheEntry(db, {
      cacheKey: "oversized-runtime",
      payload: oversizedPayload
    }), null);
    assert.equal(await kernel.putOpsStatusPayloadToDb(db, "oversized-status", oversizedPayload), false);
  });
});

test("LIKE log search rejects patterns above the D1 byte limit", async () => {
  await withDatabase(async (_database, db) => {
    await kernel.initializeD1Database(db, { includeFts: true });
    const response = await adminActions.getLogs({
      filters: { keyword: "x".repeat(60), searchMode: "like" }
    }, { db, env: { DB: db }, kv: null });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, "LOG_QUERY_KEYWORD_TOO_LONG");
  });
});

test("current schema initializes against the workerd D1 API", { timeout: 30_000 }, async () => {
  const miniflare = new Miniflare({
    modules: true,
    script: "export default { fetch() { return new Response('ok'); } }",
    compatibilityDate: "2026-03-13",
    d1Databases: ["DB"]
  });
  try {
    const db = await miniflare.getD1Database("DB");
    const env = { DB: db, JWT_SECRET: "workerd-d1-schema-test-secret" };
    const initialized = await kernel.initializeD1Database(db, { includeFts: true, env });
    const repeated = await kernel.initializeD1Database(db, { includeFts: true, env });
    await kernel.upsertDnsIpPoolItems(db, Array.from({ length: 120 }, (_, index) => ({
      id: `item-${index}`,
      ip: `10.1.${Math.floor(index / 250)}.${index % 250 + 1}`,
      sourceKind: "manual",
      sourceLabel: "workerd"
    })));
    await kernel.persistDnsIpPoolSources({ db }, Array.from({ length: 120 }, (_, index) => ({
      id: `source-${index}`,
      name: `Source ${index}`,
      url: `https://example.test/${index}.txt`,
      sourceType: "url",
      sourceKind: "custom",
      enabled: true,
      sortOrder: index,
      ipLimit: 5
    })));
    await kernel.upsertDnsIpProbeCacheEntries(db, Array.from({ length: 120 }, (_, index) => ({
      ip: `10.4.0.${index + 1}`,
      entryColo: "LAX",
      probeStatus: "ok",
      expiresAt: Date.now() + 60_000
    })));
    const runtimeConfig = { logEnabled: true, logWriteMode: "all", logFlushCountThreshold: 1000, logWriteDelayMinutes: 1000, logBatchChunkSize: 50, logBatchRetryCount: 0 };
    for (let index = 0; index < 2; index += 1) logger.record(env, { waitUntil() {} }, { runtimeConfig, requestMethod: "GET", requestPath: `/api/${index}`, statusCode: 200, category: "api" });
    await logger.flush(env);
    assert.equal(await kernel.optimizeLogsDb(db), true);

    assert.equal(initialized.completed, true);
    assert.equal(repeated.phase, "ready");
    assert.equal((await kernel.getD1SchemaStatus(db)).schemaReady, true);
    assert.equal((await db.prepare("SELECT COUNT(*) AS total FROM dns_ip_pool_items").first()).total, 120);
    assert.equal((await db.prepare("SELECT COUNT(*) AS total FROM dns_ip_pool_sources").first()).total, 120);
    assert.equal((await db.prepare("SELECT COUNT(*) AS total FROM dns_ip_probe_cache").first()).total, 120);
    assert.equal((await db.prepare("SELECT COUNT(*) AS total FROM proxy_logs").first()).total, 2);
    assert.equal((await db.prepare("SELECT SUM(request_count) AS total FROM proxy_stats_hourly").first()).total, 2);
  } finally {
    await miniflare.dispose();
  }
});

test("scheduled D1 tidy operates on the current schema", async () => {
  await withDatabase(async (_database, db) => {
    await kernel.initializeD1Database(db, { includeFts: true });
    const result = await kernel.tidyD1Data({ DB: db }, {
      db,
      mode: "scheduled",
      maintenanceMode: "light",
      config: { logRetentionDays: 7 },
      nowMs: Date.now()
    });

    assert.match(String(result?.summary?.status || ""), /^(?:success|skipped)$/);
    assert.equal((await kernel.getD1SchemaStatus(db)).schemaReady, true);
  });
});

test("D1 tidy caps previews and drains cleanup scopes fairly within one hard budget", async () => {
  const events = [];
  await withDatabase(async (database, db) => {
    await kernel.initializeD1Database(db, { includeFts: true });
    database.exec(`
      WITH RECURSIVE seq(value) AS (
        VALUES(1)
        UNION ALL SELECT value + 1 FROM seq WHERE value < 10021
      )
      INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, category, created_at)
      SELECT 1, 'alpha', '/Items/' || value, 'GET', 200, 1, '', 'api', 'old' FROM seq;
      INSERT INTO sys_locks (scope, token, owner, acquired_at, expires_at) VALUES ('expired', 'token', 'test', 1, 1);
    `);

    const now = Date.now();
    const plan = await kernel.buildD1TidyPlan({ DB: db }, {
      db,
      mode: "scheduled",
      maintenanceMode: "light",
      config: { logRetentionDays: 7, scheduleUtcOffsetMinutes: 480 },
      nowMs: now
    });
    const logPreview = plan.preview.deleteGroups.find(group => group.key === "proxy_logs");
    assert.equal(logPreview.count, 10000);
    assert.equal(logPreview.countIsLowerBound, true);

    events.length = 0;
    const first = await kernel.tidyD1Data({ DB: db }, { db, mode: "scheduled", plan });
    assert.equal(first.summary.status, "success");
    assert.equal(first.summary.reason, "maintenance_budget_exhausted");
    assert.equal(first.summary.hasMore, true);
    assert.ok(first.summary.remainingScopes.includes("proxy_logs"));
    assert.equal(first.summary.budget.batchSize, 500);
    assert.equal(first.summary.budget.rowLimit, 10000);
    assert.equal(first.summary.budget.timeLimitMs, 25000);
    assert.equal(first.summary.budget.processedRows, 10000);
    assert.equal(first.summary.budget.exhaustedBy, "row_limit");
    assert.equal(database.prepare("SELECT COUNT(*) AS count FROM sys_locks WHERE scope = 'expired'").get().count, 0);
    assert.ok(database.prepare("SELECT COUNT(*) AS count FROM proxy_logs WHERE timestamp = 1").get().count > 0);
    assert.ok(events.some(event => /DELETE FROM proxy_logs WHERE rowid IN \(SELECT rowid FROM proxy_logs WHERE timestamp < \? ORDER BY rowid LIMIT \?\)/.test(event.sql)));

    const second = await kernel.tidyD1Data({ DB: db }, {
      db,
      mode: "scheduled",
      maintenanceMode: "light",
      config: { logRetentionDays: 7, scheduleUtcOffsetMinutes: 480 },
      nowMs: now
    });
    assert.equal(second.summary.hasMore, false);
    assert.equal(database.prepare("SELECT COUNT(*) AS count FROM proxy_logs WHERE timestamp = 1").get().count, 0);
  }, { events });
});

test("D1 statistics reset never scans historical proxy logs and FTS rebuild has a size guard", async () => {
  await withDatabase(async (database, db) => {
    await kernel.initializeD1Database(db, { includeFts: true });
    database.exec(`
      WITH RECURSIVE seq(value) AS (
        VALUES(1)
        UNION ALL SELECT value + 1 FROM seq WHERE value < 10001
      )
      INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, category, created_at)
      SELECT ${Date.now()}, 'alpha', '/Items/' || value, 'GET', 200, 1, '', 'api', 'new' FROM seq;
      INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, category, created_at)
      VALUES (1, 'alpha', '/expired', 'GET', 200, 1, '', 'api', 'old');
      INSERT INTO proxy_stats_hourly (bucket_date, bucket_hour, request_count, play_count, playback_info_count, updated_at)
      VALUES ('2026-01-01', 1, 100, 10, 5, 'old');
    `);

    const plan = await kernel.buildD1TidyPlan({ DB: db }, {
      db,
      mode: "scheduled",
      maintenanceMode: "full",
      config: { logRetentionDays: 7, scheduleUtcOffsetMinutes: 480 },
      nowMs: Date.now(),
      previousCleanupStatus: { lastFtsRebuildAt: "2020-01-01T00:00:00.000Z" }
    });
    assert.equal(plan.flags.rebuildLogsFts, false);
    assert.equal(plan.flags.rebuildLogsFtsDeferred, true);
    assert.equal(plan.flags.ftsRebuildDeferredReason, "deferred_size_guard");
    assert.equal(plan.preview.preserveGroups.find(group => group.key === "proxy_logs_retained")?.countIsLowerBound, true);

    const result = await kernel.tidyD1Data({ DB: db }, { db, mode: "scheduled", plan });
    assert.equal(result.summary.ftsRebuildStatus, "deferred_size_guard");
    assert.equal(result.summary.statsRebuildStatus, "reset_for_new_logs");
    assert.equal(database.prepare("SELECT COUNT(*) AS count FROM proxy_stats_hourly").get().count, 0);
    assert.equal(database.prepare("SELECT COUNT(*) AS count FROM proxy_logs").get().count, 10001);
  });
});
