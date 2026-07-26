import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

await import("../worker.js");
const { Database, GLOBALS, Logger } = globalThis.__EMBY_PROXY_NODE_TEST_HOOKS__;

const MIGRATIONS_URL = new URL("../migrations/", import.meta.url);
const REQUIRED_LOG_COLUMNS = new Map([
  ["inbound_colo", "TEXT"],
  ["outbound_colo", "TEXT"],
  ["inbound_ip", "TEXT"],
  ["outbound_ip", "TEXT"],
  ["category", "TEXT DEFAULT 'api'"],
  ["error_detail", "TEXT"],
  ["detail_json", "TEXT"]
]);

async function loadMigrations() {
  const filenames = (await readdir(MIGRATIONS_URL))
    .filter(filename => /^\d+_.+\.sql$/.test(filename))
    .sort();
  const migrations = [];
  for (const filename of filenames) {
    migrations.push({
      filename,
      sql: await readFile(new URL(filename, MIGRATIONS_URL), "utf8")
    });
  }
  return migrations;
}

function executableSql(sql) {
  return sql.replace(/^\s*--.*$/gm, "");
}

function applyMigrations(database, migrations) {
  database.exec(`CREATE TABLE IF NOT EXISTS d1_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  const recordMigration = database.prepare("INSERT INTO d1_migrations (name) VALUES (?)");
  for (const migration of migrations) {
    database.exec("BEGIN");
    try {
      database.exec(migration.sql);
      recordMigration.run(migration.filename);
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw new Error(`Failed to apply ${migration.filename}: ${error.message}`, { cause: error });
    }
  }
}

function getColumns(database, tableName) {
  return new Set(database.prepare(`PRAGMA table_info(${tableName})`).all().map(column => column.name));
}

function getIndexes(database, tableName) {
  return new Set(database.prepare(`PRAGMA index_list(${tableName})`).all().map(index => index.name));
}

function createD1Adapter(database, options = {}) {
  let batchChain = Promise.resolve();
  const executeBatch = async statements => {
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
  };
  const adapter = {
    prepare(sql) {
      const sqlText = String(sql);
      const statement = database.prepare(sqlText);
      let bindings = [];
      const prepared = {
        bind(...values) {
          bindings = values;
          return prepared;
        },
        async run() {
          options.events?.push({ type: "run", sql: sqlText });
          return statement.run(...bindings);
        },
        async all() {
          return { results: statement.all(...bindings) };
        },
        async first() {
          return statement.get(...bindings) || null;
        }
      };
      return prepared;
    },
    batch(statements) {
      const task = batchChain.then(() => executeBatch(statements));
      batchChain = task.catch(() => {});
      return task;
    }
  };
  if (options.withSession !== false) {
    adapter.withSession = consistency => {
      options.events?.push({ type: "session", consistency: String(consistency || "") });
      if (options.sessionError) throw options.sessionError;
      return {
        prepare(sql) {
          return adapter.prepare(sql);
        },
        getBookmark() {
          if (options.bookmarkError) throw options.bookmarkError;
          return options.bookmark || "test-time-travel-bookmark";
        }
      };
    };
  }
  return adapter;
}

function createDeferred() {
  let resolve;
  const promise = new Promise(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

test("D1 migrations build the fresh v9 baseline in order", async () => {
  const migrations = await loadMigrations();
  assert.deepEqual(migrations.map(migration => migration.filename), [
    "0001_d1_fresh_baseline.sql",
    "0002_d1_historical_compatibility.sql",
    "0003_d1_schema_v5_indexes.sql",
    "0004_server_watch_stats.sql",
    "0005_server_record_snapshots.sql",
    "0006_server_record_poster_cache.sql",
    "0007_server_watch_lifecycle.sql"
  ]);
  assert.ok(migrations.every(migration => !/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS/i.test(executableSql(migration.sql))));

  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, migrations);

    const tables = new Set(database.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(row => row.name));
    for (const tableName of [
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
      "server_last_watch",
      "server_record_snapshots",
      "server_record_poster_cache"
    ]) {
      assert.ok(tables.has(tableName), `missing table ${tableName}`);
    }

    for (const columnName of REQUIRED_LOG_COLUMNS.keys()) {
      assert.ok(getColumns(database, "proxy_logs").has(columnName), `missing fresh column ${columnName}`);
    }
    assert.deepEqual([...getColumns(database, "server_last_watch")].sort(), [
      "last_watched_at",
      "node_name",
      "playback_event_phase",
      "playback_session_fingerprint",
      "playback_session_strength",
      "updated_at"
    ]);
    assert.deepEqual([...getColumns(database, "server_record_snapshots")].sort(), [
      "counts_errors_json",
      "counts_state",
      "episode_count",
      "last_item_id",
      "last_item_image_tag",
      "last_item_name",
      "last_item_series_name",
      "last_item_type",
      "last_item_watched_at",
      "movie_count",
      "node_name",
      "series_count",
      "stats_checked_at",
      "updated_at"
    ]);
    assert.deepEqual([...getColumns(database, "server_record_poster_cache")].sort(), [
      "expires_at",
      "failure_code",
      "image_path",
      "imdb_id",
      "item_id",
      "node_name",
      "provider",
      "resolved_at",
      "retry_after",
      "tmdb_id",
      "updated_at",
      "watched_at"
    ]);
    assert.ok(getIndexes(database, "proxy_logs").has("idx_proxy_logs_client_time"));
    assert.ok(getIndexes(database, "dns_ip_probe_cache").has("idx_dns_ip_probe_cache_colo_ip_expires"));
    assert.ok(getIndexes(database, "server_record_poster_cache").has("idx_server_record_poster_cache_expires_at"));
    assert.equal(database.prepare("SELECT COUNT(*) AS count FROM d1_migrations").get().count, 7);

    const d1 = createD1Adapter(database);
    const status = await Database.getD1SchemaStatus(d1);
    assert.equal(status.runtimeCompatibilityReady, true);
    assert.equal(status.migrationReady, true);
    assert.equal(status.schemaVersion, 9);
  } finally {
    database.close();
  }
});

test("D1 migrations preserve an old proxy_logs table until runtime compatibility adds missing columns", async () => {
  const migrations = await loadMigrations();
  const database = new DatabaseSync(":memory:");
  try {
    database.exec(`CREATE TABLE proxy_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      node_name TEXT NOT NULL,
      request_path TEXT NOT NULL,
      request_method TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      response_time INTEGER NOT NULL,
      client_ip TEXT NOT NULL,
      user_agent TEXT,
      referer TEXT,
      created_at TEXT NOT NULL
    )`);
    database.exec(`INSERT INTO proxy_logs (
      timestamp, node_name, request_path, request_method, status_code,
      response_time, client_ip, created_at
    ) VALUES (1, 'legacy-node', '/Items', 'GET', 200, 5, '203.0.113.8', '2026-01-01T00:00:00.000Z')`);

    applyMigrations(database, migrations.slice(0, 2));

    const columnsBeforeCompatibility = getColumns(database, "proxy_logs");
    for (const columnName of ["category", "detail_json", "inbound_colo", "outbound_colo", "inbound_ip", "outbound_ip"]) {
      assert.equal(columnsBeforeCompatibility.has(columnName), false, `migration guessed missing column ${columnName}`);
    }
    assert.equal(getIndexes(database, "proxy_logs").has("idx_proxy_logs_category_time"), false);
    assert.equal(database.prepare("SELECT node_name FROM proxy_logs WHERE id = 1").get().node_name, "legacy-node");

    const d1 = createD1Adapter(database);
    Database.invalidateD1SchemaReadiness(d1, "logs");
    await Database.ensureLogsBaseSchema(d1);
    await Database.ensureStatsHourlySchema(d1);
    applyMigrations(database, migrations.slice(2));

    for (const columnName of REQUIRED_LOG_COLUMNS.keys()) {
      assert.ok(getColumns(database, "proxy_logs").has(columnName), `runtime compatibility missed ${columnName}`);
    }
    assert.ok(getIndexes(database, "proxy_logs").has("idx_proxy_logs_category_time"));
    assert.equal(database.prepare("SELECT category FROM proxy_logs WHERE id = 1").get().category, "api");
    assert.equal(database.prepare("SELECT node_name FROM proxy_logs WHERE id = 1").get().node_name, "legacy-node");
    assert.equal((await Database.getD1SchemaStatus(d1)).migrationReady, true);
  } finally {
    database.close();
  }
});

test("D1 schema status rejects a malformed FTS table and runtime initialization rebuilds it", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    database.exec("CREATE TABLE proxy_logs_fts (node_name TEXT, request_path TEXT)");
    const d1 = createD1Adapter(database);
    const malformedStatus = await Database.getD1SchemaStatus(d1);
    assert.equal(malformedStatus.ftsReady, false);
    assert.ok(malformedStatus.issues.includes("fts_virtual_table_invalid"));
    assert.ok(malformedStatus.issues.includes("fts_columns_incomplete"));

    const initialized = await Database.ensureLogsFtsSchema(d1);
    assert.equal(initialized.rebuilt, true);
    const readyStatus = await Database.getD1SchemaStatus(d1);
    assert.equal(readyStatus.ftsReady, true);
    assert.equal(readyStatus.fts.virtualTableReady, true);
    assert.equal(readyStatus.fts.triggerReady, true);

    database.exec(`
      DROP TRIGGER proxy_logs_fts_ai;
      CREATE TRIGGER proxy_logs_fts_ai AFTER INSERT ON proxy_logs BEGIN SELECT 1; END;
    `);
    const malformedTriggerStatus = await Database.getD1SchemaStatus(d1);
    assert.equal(malformedTriggerStatus.ftsReady, false);
    assert.equal(malformedTriggerStatus.fts.triggerReady, false);
    assert.ok(malformedTriggerStatus.issues.includes("missing_trigger:proxy_logs_fts_ai"));

    const repaired = await Database.initializeD1Database(d1, { includeFts: true });
    assert.equal(repaired.status.ftsReady, true);
    assert.equal(repaired.ftsRebuilt, true);

    database.exec(`
      DROP TRIGGER proxy_logs_fts_ai;
      CREATE TRIGGER proxy_logs_fts_ai AFTER INSERT ON proxy_logs BEGIN
        INSERT INTO proxy_logs_fts(rowid, node_name, request_path, user_agent, error_detail, detail_json)
        VALUES (new.id, new.request_path, new.node_name, new.user_agent, new.error_detail, new.detail_json);
      END;
    `);
    const wrongTriggerMappingStatus = await Database.getD1SchemaStatus(d1);
    assert.equal(wrongTriggerMappingStatus.ftsReady, false);
    assert.equal(wrongTriggerMappingStatus.fts.triggerReady, false);
    const triggerMappingRepair = await Database.initializeD1Database(d1, { includeFts: true });
    assert.equal(triggerMappingRepair.status.ftsReady, true);
    assert.equal(triggerMappingRepair.ftsRebuilt, true);

    database.exec(`
      DROP TRIGGER proxy_logs_fts_ai;
      DROP TABLE proxy_logs_fts;
      CREATE VIRTUAL TABLE proxy_logs_fts USING fts5(node_name, request_path, user_agent, error_detail, detail_json);
    `);
    const wrongContentBindingStatus = await Database.getD1SchemaStatus(d1);
    assert.equal(wrongContentBindingStatus.ftsReady, false);
    assert.equal(wrongContentBindingStatus.fts.virtualTableReady, false);
    const contentBindingRepair = await Database.initializeD1Database(d1, { includeFts: true });
    assert.equal(contentBindingRepair.ftsRecreated, true);
    assert.equal(contentBindingRepair.status.ftsReady, true);
  } finally {
    database.close();
  }
});

test("D1 schema status rejects missing runtime columns and same-name indexes on wrong columns", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    database.exec(`
      DROP INDEX idx_auth_failures_expires_at;
      DROP TABLE auth_failures;
      CREATE TABLE auth_failures (ip TEXT PRIMARY KEY);
      CREATE INDEX idx_auth_failures_expires_at ON auth_failures (ip);
      DROP INDEX idx_proxy_logs_client_time;
      CREATE INDEX idx_proxy_logs_client_time ON proxy_logs (node_name);
    `);

    const status = await Database.getD1SchemaStatus(createD1Adapter(database));
    assert.equal(status.columns.auth_failures.ip, true);
    assert.equal(status.columns.auth_failures.fail_count, false);
    assert.equal(status.indexes.idx_auth_failures_expires_at, false);
    assert.equal(status.indexes.idx_proxy_logs_client_time, false);
    assert.ok(status.issues.includes("missing_column:auth_failures.fail_count"));
    assert.ok(status.issues.includes("invalid_index:idx_auth_failures_expires_at"));
    assert.ok(status.issues.includes("invalid_index:idx_proxy_logs_client_time"));
    assert.equal(status.runtimeCompatibilityReady, false);
    assert.equal(status.migrationReady, false);
    assert.equal(status.schemaVersion, null);
  } finally {
    database.close();
  }
});

test("initialize DB repairs known columns and named indexes without losing legacy rows", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    database.exec(`
      DROP INDEX idx_auth_failures_expires_at;
      DROP TABLE auth_failures;
      CREATE TABLE auth_failures (ip TEXT PRIMARY KEY);
      INSERT INTO auth_failures (ip) VALUES ('203.0.113.40');
      CREATE INDEX idx_auth_failures_expires_at ON auth_failures (ip);
      DROP INDEX idx_proxy_logs_client_time;
      CREATE INDEX idx_proxy_logs_client_time ON proxy_logs (node_name);
      CREATE INDEX idx_proxy_logs_client_ip ON proxy_logs (client_ip);
      CREATE TABLE proxy_logs_fts (node_name TEXT, request_path TEXT);
    `);

    const d1 = createD1Adapter(database);
    const result = await Database.initializeD1Database(d1, { includeFts: true });
    assert.equal(result.runtimeCompatibilityReady, true);
    assert.equal(result.migrationReady, true);
    assert.ok(result.adjustedColumns.includes("auth_failures.fail_count"));
    assert.ok(result.repairedIndexes.includes("idx_auth_failures_expires_at"));
    assert.ok(result.repairedIndexes.includes("idx_proxy_logs_client_time"));
    assert.ok(result.droppedRetiredIndexes.includes("idx_proxy_logs_client_ip"));
    assert.equal(result.ftsRecreated, true);
    assert.equal(database.prepare("SELECT ip FROM auth_failures").get().ip, "203.0.113.40");
    assert.equal(database.prepare("SELECT fail_count FROM auth_failures").get().fail_count, 0);
    assert.deepEqual(
      database.prepare("PRAGMA index_info(idx_auth_failures_expires_at)").all().map(row => row.name),
      ["expires_at"]
    );
    assert.equal(getIndexes(database, "proxy_logs").has("idx_proxy_logs_client_ip"), false);
  } finally {
    database.close();
  }
});

test("managed initialization captures a bookmark before writes, adopts v9 migrations, and preserves 0005 rows", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    database.exec(await readFile(new URL("0005_server_record_snapshots.sql", MIGRATIONS_URL), "utf8"));
    database.exec(`INSERT INTO server_record_snapshots (
      node_name, movie_count, series_count, episode_count, counts_state,
      counts_errors_json, stats_checked_at, last_item_id, last_item_name,
      last_item_type, last_item_series_name, last_item_image_tag,
      last_item_watched_at, updated_at
    ) VALUES (
      'persisted-node', 12, 4, 88, 'ok', '{}', '2026-07-25T01:00:00.000Z',
      'item-5', 'Persisted Movie', 'Movie', '', 'tag-5',
      '2026-07-25T00:30:00.000Z', '2026-07-25T01:00:00.000Z'
    )`);
    const events = [];
    const d1 = createD1Adapter(database, { events, bookmark: "bookmark-before-managed-init" });

    const initialized = await Database.initializeD1Database(d1, {
      includeFts: true,
      adoptMigrations: true,
      requireBookmark: true,
      failOnIncompatible: true
    });

    const bookmarkProbeIndex = events.findIndex(event => event.type === "run" && /^SELECT 1 AS bookmark_probe/i.test(event.sql));
    const firstMutationIndex = events.findIndex(event => event.type === "run" && /^(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|REPLACE)\b/i.test(event.sql.trim()));
    assert.ok(bookmarkProbeIndex >= 0);
    assert.ok(firstMutationIndex > bookmarkProbeIndex);
    assert.equal(initialized.recoveryBookmark, "bookmark-before-managed-init");
    assert.equal(initialized.migrationTableCreated, true);
    assert.deepEqual(initialized.adoptedMigrations, Database.D1_REQUIRED_MIGRATIONS);
    assert.equal(initialized.runtimeCompatibilityReady, true);
    assert.equal(initialized.migrationReady, true);
    assert.equal(initialized.schemaVersion, 9);
    assert.equal(initialized.status.missingMigrations.length, 0);
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM d1_migrations").get().total, 7);
    const preservedSnapshot = database.prepare("SELECT node_name, movie_count, last_item_id FROM server_record_snapshots").get();
    assert.equal(preservedSnapshot.node_name, "persisted-node");
    assert.equal(preservedSnapshot.movie_count, 12);
    assert.equal(preservedSnapshot.last_item_id, "item-5");

    events.length = 0;
    const repeated = await Database.initializeD1Database(d1, {
      includeFts: true,
      adoptMigrations: true,
      requireBookmark: true,
      failOnIncompatible: true
    });
    assert.deepEqual(repeated.adoptedMigrations, []);
    assert.equal(repeated.migrationTableCreated, false);
    assert.equal(repeated.migrationReady, true);
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM d1_migrations").get().total, 7);
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM server_record_snapshots").get().total, 1);
  } finally {
    database.close();
  }
});

test("managed initialization fails closed with zero mutations when bookmark capture fails", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    const events = [];
    const d1 = createD1Adapter(database, {
      events,
      bookmarkError: new Error("bookmark service unavailable")
    });
    await assert.rejects(
      Database.initializeD1Database(d1, {
        includeFts: true,
        adoptMigrations: true,
        requireBookmark: true,
        failOnIncompatible: true
      }),
      error => error?.code === "D1_TIME_TRAVEL_BOOKMARK_FAILED"
    );
    assert.equal(events.some(event => event.type === "run" && /^(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|REPLACE)\b/i.test(event.sql.trim())), false);
    assert.deepEqual(database.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all(), []);
  } finally {
    database.close();
  }
});

test("managed initialization rejects a malformed migration table before bookmark capture or writes", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    database.exec("CREATE TABLE d1_migrations (name TEXT)");
    const events = [];
    const d1 = createD1Adapter(database, { events });
    await assert.rejects(
      Database.initializeD1Database(d1, {
        includeFts: true,
        adoptMigrations: true,
        requireBookmark: true,
        failOnIncompatible: true
      }),
      error => error?.code === "D1_MIGRATION_TABLE_INVALID"
        && error?.details?.phase === "preflight"
    );
    assert.equal(events.some(event => event.type === "session"), false);
    assert.equal(events.some(event => event.type === "run" && /^(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|REPLACE)\b/i.test(event.sql.trim())), false);
    assert.deepEqual(database.prepare("PRAGMA table_info(d1_migrations)").all().map(column => column.name), ["name"]);
  } finally {
    database.close();
  }
});

test("Time Travel bookmark admin action is read-only", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    const events = [];
    const d1 = createD1Adapter(database, { events, bookmark: "bookmark-from-admin" });
    const response = await Database.ApiHandlers.getD1TimeTravelBookmark({}, { db: d1 });
    const payload = await response.json();

    assert.equal(payload.success, true);
    assert.equal(payload.bookmark, "bookmark-from-admin");
    assert.equal(payload.consistency, "first-primary");
    assert.equal(events.some(event => event.type === "run" && /^(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|REPLACE)\b/i.test(event.sql.trim())), false);
    assert.deepEqual(database.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all(), []);
  } finally {
    database.close();
  }
});

test("initLogsDb admin action returns a managed v9 baseline and recovery bookmark", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    const d1 = createD1Adapter(database, { bookmark: "bookmark-from-init-api" });
    const response = await Database.ApiHandlers.initLogsDb({}, { db: d1 });
    const payload = await response.json();

    assert.equal(payload.success, true);
    assert.equal(payload.runtimeCompatibilityReady, true);
    assert.equal(payload.migrationReady, true);
    assert.equal(payload.schemaVersion, 9);
    assert.equal(payload.recoveryBookmark, "bookmark-from-init-api");
    assert.deepEqual(payload.adoptedMigrations, Database.D1_REQUIRED_MIGRATIONS);
    assert.equal(payload.initialization.migrationTableCreated, true);
    assert.equal(payload.status.missingMigrations.length, 0);
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM d1_migrations").get().total, 7);
  } finally {
    database.close();
  }
});

test("KV legacy state is merged into D1 before its old keys can be removed", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    const d1 = createD1Adapter(database);
    await Database.putOpsStatusPayloadToDb(d1, Database.getOpsStatusDbScope(), {
      scheduled: { status: "current", currentOnly: true }
    }, Date.now());
    await Database.persistDnsIpPoolSources({ db: d1 }, [{
      id: "current-source",
      name: "Current source",
      url: "https://current.example/ips.txt",
      sourceType: "url",
      sourceKind: "custom"
    }]);

    const result = await Database.applyKvD1LegacyMigrations(d1, [{
      key: Database.LEGACY_OPS_STATUS_KEY,
      kind: "ops_status_root",
      payload: { scheduled: { status: "legacy", legacyOnly: true } }
    }, {
      key: Database.LEGACY_DNS_IP_POOL_SOURCES_KEY,
      kind: "dns_ip_pool_sources",
      payload: [{
        id: "legacy-source",
        name: "Legacy source",
        url: "https://legacy.example/ips.txt",
        sourceType: "url",
        sourceKind: "custom"
      }]
    }]);

    assert.equal(result.migratedKeyCount, 2);
    assert.equal(result.migratedDnsIpPoolSourceCount, 1);
    const root = await Database.getOpsStatusPayloadFromDb(d1, Database.getOpsStatusDbScope());
    assert.equal(root.scheduled.status, "current");
    assert.equal(root.scheduled.currentOnly, true);
    assert.equal(root.scheduled.legacyOnly, true);
    assert.deepEqual(
      new Set((await Database.getDnsIpPoolSourcesFromDb(d1)).map(source => source.id)),
      new Set(["legacy-source", "current-source"])
    );
  } finally {
    database.close();
  }
});

test("D1 schema status rejects expression and partial required indexes", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    database.exec(`
      DROP INDEX idx_auth_failures_expires_at;
      CREATE INDEX idx_auth_failures_expires_at ON auth_failures (expires_at, lower(ip));
      DROP INDEX idx_cf_dashboard_cache_expires_at;
      CREATE INDEX idx_cf_dashboard_cache_expires_at
        ON cf_dashboard_cache (expires_at)
        WHERE expires_at > 0;
    `);

    const status = await Database.getD1SchemaStatus(createD1Adapter(database));
    assert.equal(status.indexes.idx_auth_failures_expires_at, false);
    assert.equal(status.indexes.idx_cf_dashboard_cache_expires_at, false);
    assert.ok(status.issues.includes("invalid_index:idx_auth_failures_expires_at"));
    assert.ok(status.issues.includes("invalid_index:idx_cf_dashboard_cache_expires_at"));
    assert.equal(status.runtimeCompatibilityReady, false);
    assert.equal(status.migrationReady, false);
  } finally {
    database.close();
  }
});

test("D1 schema status validates primary and unique keys used by runtime upserts", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    database.exec(`
      DROP INDEX idx_auth_failures_expires_at;
      DROP TABLE auth_failures;
      CREATE TABLE auth_failures (
        ip TEXT,
        fail_count INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX idx_auth_failures_expires_at ON auth_failures (expires_at);

      DROP INDEX idx_dns_ip_pool_items_updated_ip;
      DROP TABLE dns_ip_pool_items;
      CREATE TABLE dns_ip_pool_items (
        id TEXT PRIMARY KEY,
        ip TEXT NOT NULL,
        ip_type TEXT NOT NULL,
        source_kind TEXT NOT NULL,
        source_label TEXT,
        line_label TEXT NOT NULL DEFAULT '',
        remark TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX idx_dns_ip_pool_items_updated_ip ON dns_ip_pool_items (updated_at DESC, ip ASC);
      CREATE UNIQUE INDEX idx_dns_ip_pool_items_ip_partial
        ON dns_ip_pool_items (ip)
        WHERE source_kind = 'custom';
    `);

    const d1 = createD1Adapter(database);
    const partialStatus = await Database.getD1SchemaStatus(d1);
    assert.equal(partialStatus.constraints.primaryKeys.auth_failures, false);
    assert.equal(partialStatus.constraints.uniqueKeys["dns_ip_pool_items.ip"], false);
    assert.ok(partialStatus.issues.includes("invalid_primary_key:auth_failures"));
    assert.ok(partialStatus.issues.includes("missing_unique_key:dns_ip_pool_items.ip"));
    assert.equal(partialStatus.migrationReady, false);

    const initialized = await Database.initializeD1Database(d1, { includeFts: false });
    assert.equal(initialized.runtimeCompatibilityReady, false);
    assert.ok(initialized.status.issues.includes("invalid_primary_key:auth_failures"));
    assert.ok(initialized.status.issues.includes("missing_unique_key:dns_ip_pool_items.ip"));
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM auth_failures").get().total, 0);

    database.exec(`
      DROP INDEX idx_dns_ip_pool_items_ip_partial;
      CREATE UNIQUE INDEX idx_dns_ip_pool_items_ip_expression
        ON dns_ip_pool_items (lower(ip));
    `);
    const expressionStatus = await Database.getD1SchemaStatus(d1);
    assert.equal(expressionStatus.constraints.uniqueKeys["dns_ip_pool_items.ip"], false);
    assert.ok(expressionStatus.issues.includes("missing_unique_key:dns_ip_pool_items.ip"));
    assert.equal(expressionStatus.migrationReady, false);
  } finally {
    database.close();
  }
});

test("initialize DB leaves unknown same-name tables untouched when key contracts are invalid", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    database.exec("CREATE TABLE auth_failures (foreign_column TEXT)");
    const d1 = createD1Adapter(database);
    const initialized = await Database.initializeD1Database(d1, { includeFts: false });

    assert.equal(initialized.runtimeCompatibilityReady, false);
    assert.ok(initialized.status.issues.includes("invalid_primary_key:auth_failures"));
    assert.deepEqual(
      database.prepare("PRAGMA table_info(auth_failures)").all().map(row => row.name),
      ["foreign_column"]
    );
    await assert.rejects(
      Database.initializeD1Database(d1, { includeFts: false, failOnIncompatible: true }),
      error => error?.code === "D1_SCHEMA_INCOMPATIBLE"
        && error?.details?.phase === "preflight"
    );
  } finally {
    database.close();
  }
});

test("D1 initialization serializes core and FTS profiles on one binding", async () => {
  const database = Object.create(Database);
  const binding = {};
  const coreStarted = createDeferred();
  const releaseCore = createDeferred();
  const events = [];
  let active = 0;
  let maxActive = 0;
  database.runD1DatabaseInitialization = async (db, options = {}) => {
    const profile = options.includeFts === true ? "logs-fts" : "logs-core";
    active += 1;
    maxActive = Math.max(maxActive, active);
    events.push(`${profile}:start`);
    if (profile === "logs-core") {
      coreStarted.resolve();
      await releaseCore.promise;
    }
    events.push(`${profile}:end`);
    active -= 1;
    return { profile };
  };

  const coreTask = database.initializeD1Database(binding, { includeFts: false });
  await coreStarted.promise;
  const ftsTask = database.initializeD1Database(binding, { includeFts: true });
  await Promise.resolve();
  assert.equal(maxActive, 1);
  assert.deepEqual(events, ["logs-core:start"]);
  releaseCore.resolve();
  await Promise.all([coreTask, ftsTask]);

  assert.equal(maxActive, 1);
  assert.deepEqual(events, ["logs-core:start", "logs-core:end", "logs-fts:start", "logs-fts:end"]);
});

test("D1 tidy requires a new signed preview when rows change", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    const d1 = createD1Adapter(database);
    const now = Date.parse("2026-07-25T00:00:00.000Z");
    const env = { DB: d1, JWT_SECRET: "d1-tidy-test-secret" };
    const config = { logRetentionDays: 7 };
    const previewPlan = await Database.buildD1TidyPlan(env, {
      db: d1,
      config,
      mode: "manual",
      maintenanceMode: "smart",
      nowMs: now
    });
    const planToken = await Database.createD1TidyPlanToken(env, previewPlan);
    database.exec(`INSERT INTO proxy_logs (
      timestamp, node_name, request_path, request_method, status_code,
      response_time, client_ip, category, created_at
    ) VALUES (1, 'late-expired', '/expired', 'GET', 200, 1, '198.51.100.20', 'api', '1970-01-01T00:00:00.001Z')`);

    await assert.rejects(
      Database.tidyD1Data(env, {
        db: d1,
        config,
        mode: "manual",
        maintenanceMode: "smart",
        planToken
      }),
      error => error?.code === "TIDY_PLAN_STALE"
        && error?.details?.reason === "plan_changed"
    );
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM proxy_logs WHERE node_name = 'late-expired'").get().total, 1);
  } finally {
    database.close();
  }
});

test("D1 tidy executes an unchanged signed preview", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    const d1 = createD1Adapter(database);
    const now = Date.parse("2026-07-25T00:00:00.000Z");
    const env = { DB: d1, JWT_SECRET: "d1-tidy-success-secret" };
    const config = { logRetentionDays: 7 };
    const plan = await Database.buildD1TidyPlan(env, {
      db: d1,
      config,
      mode: "manual",
      maintenanceMode: "smart",
      nowMs: now
    });
    const planToken = await Database.createD1TidyPlanToken(env, plan);
    const result = await Database.tidyD1Data(env, {
      db: d1,
      config,
      mode: "manual",
      maintenanceMode: "smart",
      planToken
    });

    assert.equal(result.summary.status, "success");
    assert.equal(result.compatibility.runtimeCompatibilityReady, true);
  } finally {
    database.close();
  }
});

test("D1 tidy preview cannot authorize deletes until initialization is followed by a new preview", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    database.exec(`
      CREATE TABLE proxy_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, legacy_payload TEXT);
      INSERT INTO proxy_logs (legacy_payload) VALUES ('keep-until-repreview');
    `);
    const d1 = createD1Adapter(database);
    const env = { DB: d1, JWT_SECRET: "d1-tidy-preview-secret" };
    const firstResponse = await Database.ApiHandlers.previewTidyData({ scope: "d1" }, { env, db: d1, kv: null });
    const firstPreview = await firstResponse.json();
    assert.equal(firstPreview.requiresSchemaInitialization, true);
    assert.equal(firstPreview.planToken, "");
    assert.equal(firstPreview.summary.deletedExpiredLogCount, 0);

    const initialized = await Database.initializeD1Database(d1, { includeFts: false, failOnIncompatible: true });
    assert.equal(initialized.runtimeCompatibilityReady, true);
    const secondResponse = await Database.ApiHandlers.previewTidyData({ scope: "d1" }, { env, db: d1, kv: null });
    const secondPreview = await secondResponse.json();
    assert.equal(secondPreview.requiresSchemaInitialization, false);
    assert.ok(secondPreview.planToken);
    assert.equal(secondPreview.summary.deletedExpiredLogCount, 1);
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM proxy_logs").get().total, 1);
  } finally {
    database.close();
  }
});

test("scheduled D1 tidy fails before deletion when key contracts drift", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    database.exec(`
      INSERT INTO proxy_logs (
        timestamp, node_name, request_path, request_method, status_code,
        response_time, client_ip, category, created_at
      ) VALUES (1, 'scheduled-expired', '/expired', 'GET', 200, 1, '198.51.100.30', 'api', '1970-01-01T00:00:00.001Z');
      DROP INDEX idx_auth_failures_expires_at;
      DROP TABLE auth_failures;
      CREATE TABLE auth_failures (ip TEXT, fail_count INTEGER, expires_at INTEGER, updated_at INTEGER);
      CREATE INDEX idx_auth_failures_expires_at ON auth_failures (expires_at);
    `);
    const d1 = createD1Adapter(database);
    await assert.rejects(
      Database.tidyD1Data({ DB: d1 }, {
        db: d1,
        config: { logRetentionDays: 7 },
        mode: "scheduled",
        maintenanceMode: "smart",
        scheduledNow: new Date("2026-07-25T00:00:00.000Z")
      }),
      error => error?.code === "D1_SCHEMA_INCOMPATIBLE"
    );
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM proxy_logs WHERE node_name = 'scheduled-expired'").get().total, 1);
  } finally {
    database.close();
  }
});

test("server watch lifecycle enforces strong and weak D1 admission gates", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    const d1 = createD1Adapter(database);
    const media = (itemId, itemName) => ({ itemId, itemName, itemType: "Movie", imageTag: `${itemId}-poster` });
    const write = (nodeName, eventAt, phase, sessionFingerprint, sessionStrength, itemId, itemName = itemId) => (
      Database.upsertServerWatchLifecycle(d1, {
        nodeName,
        eventAt,
        phase,
        sessionFingerprint,
        sessionStrength,
        media: itemId ? media(itemId, itemName) : {}
      })
    );

    const base = Date.parse("2026-07-26T12:00:00.000Z");
    const at = offsetMs => new Date(base + offsetMs).toISOString();
    assert.equal((await write("strong-node", at(0), "started", "strong-a", "strong", "item-a", "Initial")).admitted, true);
    assert.equal((await write("strong-node", at(1000), "started", "strong-a", "strong", "item-a", "Duplicate")).admitted, false);
    assert.equal((await write("strong-node", at(2000), "progress", "strong-a", "strong", "item-a", "Progress duplicate")).admitted, false);
    assert.equal((await write("strong-node", at(3000), "progress", "strong-b", "strong", "item-b", "Fallback")).admitted, true);
    assert.equal((await write("strong-node", at(4000), "stopped", "strong-b", "strong", "item-b", "Final")).admitted, true);
    assert.equal((await write("strong-node", at(3500), "stopped", "strong-b", "strong", "item-a", "Stale stop")).admitted, false);

    const strongWatch = database.prepare(`SELECT last_watched_at, playback_session_fingerprint,
      playback_session_strength, playback_event_phase FROM server_last_watch WHERE node_name = ?`).get("strong-node");
    assert.deepEqual({ ...strongWatch }, {
      last_watched_at: at(4000),
      playback_session_fingerprint: "strong-b",
      playback_session_strength: "strong",
      playback_event_phase: "stopped"
    });
    const strongSnapshot = database.prepare(`SELECT last_item_id, last_item_name, last_item_watched_at
      FROM server_record_snapshots WHERE node_name = ?`).get("strong-node");
    assert.deepEqual({ ...strongSnapshot }, {
      last_item_id: "item-b",
      last_item_name: "Final",
      last_item_watched_at: at(4000)
    });

    assert.equal((await write("weak-stop-node", at(0), "started", "weak-a", "weak", "item-a")).admitted, true);
    assert.equal((await write("weak-stop-node", at(1000), "started", "weak-a", "weak", "item-a", "Replay")).admitted, true);
    assert.equal((await write("weak-stop-node", at(2000), "stopped", "weak-a", "weak", "item-a")).admitted, true);
    assert.equal((await write("weak-stop-node", at(9 * 60_000), "progress", "weak-a", "weak", "item-a")).admitted, false);
    assert.equal((await write("weak-stop-node", at(2000 + 10 * 60_000), "progress", "weak-a", "weak", "item-a")).admitted, false);
    assert.equal((await write("weak-stop-node", at(11 * 60_000), "progress", "weak-a", "weak", "item-a")).admitted, true);

    assert.equal((await write("weak-open-node", at(0), "progress", "weak-b", "weak", "item-b")).admitted, true);
    assert.equal((await write("weak-open-node", at(11 * 60 * 60_000), "progress", "weak-b", "weak", "item-b")).admitted, false);
    assert.equal((await write("weak-open-node", at(12 * 60 * 60_000), "progress", "weak-b", "weak", "item-b")).admitted, false);
    assert.equal((await write("weak-open-node", at(13 * 60 * 60_000), "progress", "weak-b", "weak", "item-b")).admitted, true);
  } finally {
    database.close();
  }
});

test("server watch lifecycle keeps snapshots coupled to admitted writes across duplicate and concurrent events", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    const d1 = createD1Adapter(database);
    const eventAt = "2026-07-26T13:00:00.000Z";
    const event = itemName => ({
      nodeName: "parallel-node",
      eventAt,
      phase: "progress",
      sessionFingerprint: "parallel-session",
      sessionStrength: "strong",
      media: { itemId: "parallel-item", itemName, itemType: "Movie" }
    });
    const [first, second] = await Promise.all([
      Database.upsertServerWatchLifecycle(d1, event("Accepted media")),
      Database.upsertServerWatchLifecycle(d1, event("Rejected overwrite"))
    ]);
    assert.deepEqual([first.admitted, second.admitted], [true, false]);
    assert.deepEqual(
      { ...database.prepare(`SELECT last_item_name, last_item_watched_at
        FROM server_record_snapshots WHERE node_name = ?`).get("parallel-node") },
      { last_item_name: "Accepted media", last_item_watched_at: eventAt }
    );
  } finally {
    database.close();
  }
});

test("server watch lifecycle falls back safely against a v8 table", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    database.exec(await readFile(new URL("0004_server_watch_stats.sql", MIGRATIONS_URL), "utf8"));
    database.exec(await readFile(new URL("0005_server_record_snapshots.sql", MIGRATIONS_URL), "utf8"));
    const d1 = createD1Adapter(database);
    const startedAt = "2026-07-26T14:00:00.000Z";
    const stoppedAt = "2026-07-26T14:30:00.000Z";
    const common = {
      nodeName: "v8-node",
      sessionFingerprint: "legacy-session",
      sessionStrength: "strong",
      media: { itemId: "legacy-item", itemName: "Legacy movie", itemType: "Movie" }
    };

    const started = await Database.upsertServerWatchLifecycle(d1, { ...common, eventAt: startedAt, phase: "started" });
    const progress = await Database.upsertServerWatchLifecycle(d1, {
      ...common,
      eventAt: "2026-07-26T14:10:00.000Z",
      phase: "progress"
    });
    const stopped = await Database.upsertServerWatchLifecycle(d1, { ...common, eventAt: stoppedAt, phase: "stopped" });
    assert.deepEqual(started, { admitted: true, schemaVersion: 8, reason: "schema_v8_fallback" });
    assert.deepEqual(progress, { admitted: false, schemaVersion: 8, reason: "schema_v8_progress_disabled" });
    assert.deepEqual(stopped, { admitted: true, schemaVersion: 8, reason: "schema_v8_fallback" });
    assert.equal(getColumns(database, "server_last_watch").has("playback_event_phase"), false);
    assert.equal(database.prepare("SELECT last_watched_at FROM server_last_watch WHERE node_name = ?").get("v8-node").last_watched_at, stoppedAt);
    GLOBALS.ServerRecordWatchSessions.set("v8-pending", { nodeName: "v8-node" });
    Database.invalidateD1SchemaReadiness(d1);
    assert.equal(GLOBALS.ServerRecordWatchSessions.size, 0);
  } finally {
    database.close();
  }
});

test("runtime D1 SQL executes against the fresh v9 schema", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    const d1 = createD1Adapter(database);
    const now = Date.now();
    const nowIso = new Date(now).toISOString();

    await Database.upsertServerLastWatch(d1, "server-a", new Date(now + 2000).toISOString());
    await Database.upsertServerLastWatch(d1, "server-a", new Date(now + 1000).toISOString());
    await Promise.all([
      Database.upsertServerLastWatch(d1, "server-a", nowIso),
      Database.upsertServerLastWatch(d1, "server-a", new Date(now + 3000).toISOString(), {
        itemId: "movie-3000",
        itemName: "Latest movie",
        itemType: "Movie",
        imageTag: "poster-3000"
      })
    ]);
    const lastWatch = await Database.getServerLastWatch(d1, ["server-a", "server-b"]);
    assert.equal(lastWatch.get("server-a")?.lastWatchedAt, new Date(now + 3000).toISOString());
    assert.equal(lastWatch.has("server-b"), false);

    await Database.persistServerRecordProbeSnapshots(d1, [{
      nodeName: "server-a",
      counts: { movies: 4, series: 5, episodes: 6, errors: {} },
      checkedAt: new Date(now + 5000).toISOString()
    }]);
    await Database.persistServerRecordProbeSnapshots(d1, [{
      nodeName: "server-a",
      counts: { movies: 1, series: 2, episodes: 3, errors: {} },
      checkedAt: new Date(now + 4000).toISOString()
    }]);
    const snapshots = await Database.getServerRecordSnapshots(d1, ["server-a"]);
    assert.deepEqual(snapshots.get("server-a")?.counts, {
      movies: 4,
      series: 5,
      episodes: 6,
      state: "ok",
      errors: {},
      checkedAt: new Date(now + 5000).toISOString(),
      source: "persisted"
    });
    assert.deepEqual(snapshots.get("server-a")?.lastItem, {
      itemId: "movie-3000",
      itemName: "Latest movie",
      itemType: "Movie",
      seriesName: "",
      imageTag: "poster-3000",
      watchedAt: new Date(now + 3000).toISOString()
    });
    await Database.persistServerRecordProbeSnapshots(d1, [{
      nodeName: "server-a",
      counts: { movies: null, series: 7, episodes: 8, errors: { movies: "http_503" } },
      checkedAt: new Date(now + 6000).toISOString()
    }]);
    assert.deepEqual((await Database.getServerRecordSnapshots(d1, ["server-a"])).get("server-a")?.counts, {
      movies: null,
      series: 7,
      episodes: 8,
      state: "partial",
      errors: { movies: "http_503" },
      checkedAt: new Date(now + 6000).toISOString(),
      source: "persisted"
    });
    assert.equal(await Database.persistServerRecordProbeSnapshots(d1, [{
      nodeName: "server-a",
      counts: { movies: null, series: null, episodes: null, errors: { movies: "offline" } },
      checkedAt: new Date(now + 6000).toISOString()
    }]), 0);

    const bootstrap = await Database.bootstrapD1Schema(d1, "logs-core");
    assert.equal(bootstrap.runtimeTablesReady, true);
    assert.equal(bootstrap.schemaReady, true);
    assert.equal(bootstrap.statsReady, true);
    assert.equal((await Database.ensureLogsFtsSchema(d1)).rebuilt, true);

    await Database.upsertAuthFailureEntry(d1, "203.0.113.10", {
      failCount: 2,
      expiresAt: now + 60_000,
      updatedAt: now
    });
    assert.equal((await Database.getAuthFailureEntry(d1, "203.0.113.10")).failCount, 2);
    assert.equal(await Database.deleteAuthFailureEntry(d1, "203.0.113.10"), true);

    await Database.putCfDashboardCacheEntry(d1, {
      cacheKey: "dashboard:smoke",
      zoneId: "zone-smoke",
      bucketDate: "2026-07-19",
      payload: { stats: { todayRequests: 1 } },
      version: 1,
      cachedAt: now,
      expiresAt: now + 60_000,
      updatedAt: now
    });
    assert.equal((await Database.getCfDashboardCacheEntry(d1, "dashboard:smoke"))?.zoneId, "zone-smoke");
    assert.equal(await Database.deleteCfDashboardCacheEntry(d1, "dashboard:smoke"), true);

    await Database.putCfRuntimeCacheEntry(d1, {
      cacheKey: "runtime:smoke",
      cacheGroup: "smoke",
      resourceId: "resource-smoke",
      payload: { ok: true },
      cachedAt: now,
      expiresAt: now + 60_000,
      updatedAt: now
    });
    assert.equal((await Database.getCfRuntimeCacheEntry(d1, "runtime:smoke"))?.payload?.ok, true);

    await Database.patchOpsStatus({ db: d1 }, {
      log: { schemaReady: true, statsReady: true, ftsReady: true },
      scheduled: { status: "smoke" }
    });
    assert.equal((await Database.getOpsStatusSection({ db: d1 }, "scheduled")).status, "smoke");

    const dnsItems = await Database.upsertDnsIpPoolItems(d1, [{
      id: "ip-smoke",
      ip: "1.1.1.1",
      ipType: "ipv4",
      sourceKind: "custom",
      sourceLabel: "smoke",
      lineLabel: "line-a",
      remark: "runtime SQL smoke",
      createdAt: nowIso,
      updatedAt: nowIso
    }]);
    assert.equal(dnsItems.length, 1);
    assert.equal((await Database.getDnsIpPoolItems(d1)).length, 1);

    await Database.persistDnsIpPoolSources({ db: d1 }, [{
      id: "source-smoke",
      name: "Smoke source",
      url: "https://example.test/ips.txt",
      sourceType: "url",
      sourceKind: "custom",
      enabled: true,
      sortOrder: 0,
      ipLimit: 5,
      createdAt: nowIso,
      updatedAt: nowIso
    }]);
    assert.equal((await Database.getDnsIpPoolSourcesFromDb(d1)).length, 1);
    assert.equal(await Database.updateDnsIpPoolSourceFetchState(d1, "source-smoke", {
      lastFetchAt: nowIso,
      lastFetchStatus: "success",
      lastFetchCount: 1
    }), true);

    await Database.upsertDnsIpPoolFetchCacheEntry(d1, {
      signature: "fetch-smoke",
      items: dnsItems,
      sourceResults: [],
      importedCount: 1,
      enabledSourceCount: 1,
      cachedAtMs: now,
      expiresAtMs: now + 60_000
    });
    assert.equal((await Database.getDnsIpPoolFetchCacheEntry(d1, "fetch-smoke"))?.importedCount, 1);

    await Database.upsertDnsIpProbeCacheEntry(d1, {
      ip: "1.1.1.1",
      entryColo: "HKG",
      probeStatus: "success",
      latencyMs: 12,
      probedAt: nowIso,
      expiresAt: now + 60_000
    });
    assert.equal((await Database.getDnsIpProbeCacheEntry(d1, "1.1.1.1", "HKG"))?.latencyMs, 12);
    assert.equal((await Database.getDnsIpProbeCacheEntries(d1, ["1.1.1.1"], "HKG")).length, 1);

    await Database.upsertStatsHourlyBuckets(d1, [{
      bucketDate: "2026-07-19",
      bucketHour: 12,
      requestCount: 3,
      playCount: 1,
      playbackInfoCount: 1
    }]);
    assert.equal((await Database.getDailyStatsHourly(d1, "2026-07-19"))[0]?.request_count, 3);

    const lease = await Database.tryAcquireScheduledLeaseWithDb(d1, {
      token: "lease-smoke",
      owner: "test",
      leaseMs: 60_000
    });
    assert.equal(lease.acquired, true);
    assert.equal((await Database.renewScheduledLeaseWithDb(d1, "lease-smoke", 60_000, { owner: "test" }))?.token, "lease-smoke");
    assert.equal(await Database.releaseScheduledLeaseWithDb(d1, "lease-smoke"), true);

    GLOBALS.LogQueue.length = 0;
    GLOBALS.LogQueue.push({
      timestamp: now,
      nodeName: "runtime-node",
      requestPath: "/Items/runtime",
      requestMethod: "GET",
      statusCode: 404,
      responseTime: 8,
      clientIp: "203.0.113.20",
      inboundColo: "HKG",
      outboundColo: "SJC",
      userAgent: "runtime-smoke-agent",
      referer: "",
      category: "api",
      errorDetail: "runtime SQL smoke",
      detailJson: JSON.stringify({ deliveryMode: "direct", protocolFailureReason: "timeout" }),
      createdAt: nowIso
    });
    await Logger.flush({ DB: d1 });
    assert.equal(database.prepare("SELECT COUNT(*) AS total FROM proxy_logs WHERE node_name = ?").get("runtime-node").total, 1);

    const likeResponse = await Database.ApiHandlers.getLogs({
      page: 1,
      pageSize: 10,
      paginationMode: "offset",
      filters: {
        keyword: "runtime",
        searchMode: "like",
        requestGroup: "api",
        statusGroup: "4xx",
        deliveryMode: "direct",
        protocolFailureReason: "timeout"
      }
    }, { db: d1, env: { DB: d1 } });
    assert.equal(likeResponse.status, 200);
    assert.equal((await likeResponse.json()).logs.length, 1);

    const ftsResponse = await Database.ApiHandlers.getLogs({
      page: 1,
      pageSize: 10,
      filters: { keyword: "runtime", searchMode: "fts" }
    }, { db: d1, env: { DB: d1 } });
    assert.equal(ftsResponse.status, 200);
    assert.equal((await ftsResponse.json()).logs.length, 1);

    database.exec(`
      INSERT INTO proxy_logs (
        timestamp, node_name, request_path, request_method, status_code, response_time,
        client_ip, category, created_at
      ) VALUES (1, 'expired-node', '/expired', 'GET', 200, 1, '198.51.100.1', 'api', '1970-01-01T00:00:00.001Z');
      INSERT INTO sys_locks (scope, token, owner, acquired_at, expires_at)
        VALUES ('expired-smoke', 'expired', 'test', 1, 1);
      INSERT INTO dns_ip_pool_fetch_cache (
        signature, items_json, source_results_json, imported_count, enabled_source_count,
        cached_at, expires_at, created_at, updated_at
      ) VALUES ('expired-smoke', '[]', '[]', 0, 0, 1, 1, '1970-01-01T00:00:00.001Z', '1970-01-01T00:00:00.001Z');
      INSERT INTO dns_ip_probe_cache (ip, entry_colo, probe_status, probed_at, expires_at)
        VALUES ('198.51.100.2', 'HKG', 'success', '1970-01-01T00:00:00.001Z', 1);
      INSERT INTO auth_failures (ip, fail_count, expires_at, updated_at)
        VALUES ('198.51.100.10', 1, 1, 1);
      INSERT INTO cf_dashboard_cache (
        cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
      ) VALUES ('expired-smoke', 'zone', '1970-01-01', '{}', 1, 1, 1, 1);
      INSERT INTO cf_runtime_cache (
        cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
      ) VALUES ('expired-smoke', 'test', 'test', '{}', 1, 1, 1);
      INSERT INTO server_record_poster_cache (
        node_name, watched_at, item_id, expires_at, updated_at
      ) VALUES ('expired-smoke', '1970-01-01T00:00:00.001Z', 'item-smoke', '1970-01-01T00:00:00.001Z', '1970-01-01T00:00:00.001Z');
    `);
    const tidyPlan = await Database.buildD1TidyPlan({ DB: d1 }, {
      db: d1,
      config: { logRetentionDays: 7 },
      mode: "manual",
      maintenanceMode: "smart",
      nowMs: now
    });
    const tidyResult = await Database.applyD1TidyPlan(tidyPlan, {
      env: { DB: d1 },
      db: d1,
      mode: "manual"
    });
    assert.equal(tidyResult.summary.status, "success");
    for (const [tableName, columnName, value] of [
      ["proxy_logs", "node_name", "expired-node"],
      ["sys_locks", "scope", "expired-smoke"],
      ["dns_ip_pool_fetch_cache", "signature", "expired-smoke"],
      ["dns_ip_probe_cache", "ip", "198.51.100.2"],
      ["auth_failures", "ip", "198.51.100.10"],
      ["cf_dashboard_cache", "cache_key", "expired-smoke"],
      ["cf_runtime_cache", "cache_key", "expired-smoke"],
      ["server_record_poster_cache", "node_name", "expired-smoke"]
    ]) {
      const expiredCount = database.prepare(`SELECT COUNT(*) AS total FROM ${tableName} WHERE ${columnName} = ?`)
        .get(value)
        .total;
      assert.equal(expiredCount, 0, `expired row remained in ${tableName}`);
    }

    assert.equal(await Database.deleteDnsIpPoolItems(d1, ["1.1.1.1"]), 1);
  } finally {
    database.close();
  }
});

test("server-record D1 rows move with node renames, merge by freshness, and are removed on delete", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    applyMigrations(database, await loadMigrations());
    const d1 = createD1Adapter(database);
    const nodeValues = new Map();
    const kv = {
      async put(key, value) { nodeValues.set(key, String(value)); },
      async delete(key) { nodeValues.delete(key); }
    };
    await Database.upsertServerLastWatch(d1, "alpha", "2026-07-25T01:00:00.000Z", {
      itemId: "alpha-item",
      itemName: "Alpha item",
      itemType: "Movie"
    });
    await Database.persistServerRecordProbeSnapshots(d1, [{
      nodeName: "alpha",
      counts: { movies: 1, series: 2, episodes: 3, errors: {} },
      checkedAt: "2026-07-25T01:30:00.000Z"
    }]);
    await Database.upsertServerLastWatch(d1, "beta", "2026-07-25T02:00:00.000Z", {
      itemId: "beta-item",
      itemName: "Beta item",
      itemType: "Episode",
      seriesName: "Beta series"
    });
    await Database.persistServerRecordProbeSnapshots(d1, [{
      nodeName: "beta",
      counts: { movies: 4, series: 5, episodes: 6, errors: {} },
      checkedAt: "2026-07-25T02:30:00.000Z"
    }]);
    await Database.setServerRecordPosterCache(d1, {
      nodeName: "alpha",
      watchedAt: "2026-07-25T01:00:00.000Z",
      itemId: "alpha-item",
      tmdbId: "100",
      provider: "tmdb_direct",
      imagePath: "/alpha-poster.jpg",
      expiresAt: "2026-08-01T01:00:00.000Z"
    });
    await Database.setServerRecordPosterCache(d1, {
      nodeName: "beta",
      watchedAt: "2026-07-25T02:00:00.000Z",
      itemId: "beta-item",
      tmdbId: "200",
      provider: "tmdb_direct",
      imagePath: "/beta-poster.jpg",
      expiresAt: "2026-08-01T02:00:00.000Z"
    });
    assert.equal(await Database.getServerRecordPosterCache(d1, "alpha", "2026-07-25T01:00:01.000Z", "alpha-item"), null);

    const rename = {
      previousName: "alpha",
      previousNode: { target: "https://alpha.example" },
      nextName: "beta",
      nextNode: { target: "https://beta.example" },
      nodeChanged: true
    };
    await Database.applyPreparedNodeMutation(rename, { kv, db: d1 });
    assert.equal(nodeValues.has(`${Database.PREFIX}alpha`), false);
    assert.equal(nodeValues.has(`${Database.PREFIX}beta`), true);
    const renamedWatch = await Database.getServerLastWatch(d1, ["alpha", "beta"]);
    const renamedSnapshots = await Database.getServerRecordSnapshots(d1, ["alpha", "beta"]);
    assert.equal(renamedWatch.has("alpha"), false);
    assert.equal(renamedWatch.get("beta")?.lastWatchedAt, "2026-07-25T02:00:00.000Z");
    assert.equal(renamedSnapshots.has("alpha"), false);
    assert.deepEqual(renamedSnapshots.get("beta")?.counts, {
      movies: 4,
      series: 5,
      episodes: 6,
      state: "ok",
      errors: {},
      checkedAt: "2026-07-25T02:30:00.000Z",
      source: "persisted"
    });
    assert.deepEqual(renamedSnapshots.get("beta")?.lastItem, {
      itemId: "beta-item",
      itemName: "Beta item",
      itemType: "Episode",
      seriesName: "Beta series",
      imageTag: "",
      watchedAt: "2026-07-25T02:00:00.000Z"
    });
    assert.equal(await Database.getServerRecordPosterCache(d1, "alpha", "2026-07-25T01:00:00.000Z", "alpha-item"), null);
    assert.equal(await Database.getServerRecordPosterCache(d1, "beta", "2026-07-25T02:00:00.000Z", "beta-item"), null);

    await Database.rollbackPreparedNodeMutation(rename, { kv, db: d1 });
    assert.equal(nodeValues.has(`${Database.PREFIX}alpha`), true);
    assert.equal(nodeValues.has(`${Database.PREFIX}beta`), false);
    const restoredWatch = await Database.getServerLastWatch(d1, ["alpha", "beta"]);
    assert.equal(restoredWatch.get("alpha")?.lastWatchedAt, "2026-07-25T01:00:00.000Z");
    assert.equal(restoredWatch.get("beta")?.lastWatchedAt, "2026-07-25T02:00:00.000Z");
    assert.equal((await Database.getServerRecordPosterCache(d1, "alpha", "2026-07-25T01:00:00.000Z", "alpha-item"))?.imagePath, "/alpha-poster.jpg");
    assert.equal((await Database.getServerRecordPosterCache(d1, "beta", "2026-07-25T02:00:00.000Z", "beta-item"))?.imagePath, "/beta-poster.jpg");

    await Database.applyPreparedNodeMutation({
      previousName: "alpha",
      previousNode: { target: "https://alpha.example" },
      nextName: "alpha",
      nextNode: null,
      nodeChanged: true
    }, { kv, db: d1 });
    const deletedWatch = await Database.getServerLastWatch(d1, ["alpha"]);
    const deletedSnapshots = await Database.getServerRecordSnapshots(d1, ["alpha"]);
    assert.equal(nodeValues.has(`${Database.PREFIX}alpha`), false);
    assert.equal(deletedWatch.has("alpha"), false);
    assert.equal(deletedSnapshots.has("alpha"), false);
    assert.equal(await Database.getServerRecordPosterCache(d1, "alpha", "2026-07-25T01:00:00.000Z", "alpha-item"), null);
  } finally {
    database.close();
  }
});
