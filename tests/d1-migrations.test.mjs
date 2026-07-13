import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

await import("../worker.js");
const { Database } = globalThis.__EMBY_PROXY_NODE_TEST_HOOKS__;

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

function createD1Adapter(database) {
  return {
    prepare(sql) {
      const statement = database.prepare(String(sql));
      let bindings = [];
      const adapter = {
        bind(...values) {
          bindings = values;
          return adapter;
        },
        async run() {
          return statement.run(...bindings);
        },
        async all() {
          return { results: statement.all(...bindings) };
        },
        async first() {
          return statement.get(...bindings) || null;
        }
      };
      return adapter;
    },
    async batch(statements) {
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
    }
  };
}

test("D1 migrations build the fresh v5 baseline in order", async () => {
  const migrations = await loadMigrations();
  assert.deepEqual(migrations.map(migration => migration.filename), [
    "0001_d1_fresh_baseline.sql",
    "0002_d1_historical_compatibility.sql",
    "0003_d1_schema_v5_indexes.sql"
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
      "proxy_stats_hourly"
    ]) {
      assert.ok(tables.has(tableName), `missing table ${tableName}`);
    }

    for (const columnName of REQUIRED_LOG_COLUMNS.keys()) {
      assert.ok(getColumns(database, "proxy_logs").has(columnName), `missing fresh column ${columnName}`);
    }
    assert.ok(getIndexes(database, "proxy_logs").has("idx_proxy_logs_client_time"));
    assert.ok(getIndexes(database, "dns_ip_probe_cache").has("idx_dns_ip_probe_cache_colo_ip_expires"));
    assert.equal(database.prepare("SELECT COUNT(*) AS count FROM d1_migrations").get().count, 3);

    const d1 = createD1Adapter(database);
    const status = await Database.getD1SchemaStatus(d1);
    assert.equal(status.runtimeCompatibilityReady, true);
    assert.equal(status.migrationReady, true);
    assert.equal(status.schemaVersion, 5);
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
