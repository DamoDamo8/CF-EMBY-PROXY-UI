# 开发与验证

## 任务分类

开始工作前先把任务归入一个主要边界：

- `Frontend App`
- `Worker Shell`
- `Worker API / Proxy`
- `Build & Publish`
- `Cache / Delivery`
- `Debug / Regression`

鉴权、代理、KV/D1、scheduled、缓存一致性、资源路由和响应头属于高风险区域。展示层、Vite 配置、发布校验脚本和测试脚本通常风险较低，但仍需按正式入口验证。

任务对应的阅读路径见根 [AGENTS.md](../AGENTS.md)。

## 开始前

- 先读根 `worker.md` 和任务对应的专题文档。
- 优先检查根 `worker.js` 与根 `frontend/`，不要从历史目录推断当前行为。
- 涉及管理台边界时，先核对页面入口、启动动作、五个主视图、八个设置视觉分区和五个保存分组。
- 涉及 Cache API、`ctx.waitUntil()`、Request/Response、`compatibility_flags` 或平台限制时，先查 `developers.cloudflare.com`，重点核对 Workers Cache API、缓存工作方式、Runtime Context 和平台限制。

## Windows 开发环境

正式开发环境使用 Windows PowerShell，不依赖 WSL：

- Node.js 版本由 `frontend/.nvmrc` 与 `frontend/package.json#engines` 约束。
- Python 版本由根 `.python-version` 约束；当前基线为 Python 3.14.6。`scripts/extract-ui-from-js.py` 的最低语法要求为 Python 3.10。
- Git 使用 Windows 版 Git。
- Wrangler 不要求全局安装，通过 `npx wrangler@latest` 调用。

首次进入仓库后验证工具链并安装锁定依赖：

```powershell
node --version
npm --version
python --version
py --version
git --version
npx wrangler@latest --version
npm --prefix frontend ci
```

Python UI 提取工具可通过以下命令验证：

```powershell
python scripts/extract-ui-from-js.py --help
```

## 实施顺序

跨边界工作默认按以下顺序推进：

1. 对齐正式路径和当前事实。
2. 收口前端入口与同步约定。
3. 核对 `/admin -> KV 本地 index.html -> Worker 壳返回` 契约。
4. 校准 Cache API SWR、vendor 路径和发布变量。
5. 完成本地调试与回归。
6. 最后处理 GitHub 发布。

只涉及单一边界的修改不必机械执行无关步骤。

## 本地调试

从 `.dev.vars.example` 创建根 `.dev.vars`，最小配置：

```dotenv
JWT_SECRET=<secret>
ADMIN_PASS=<password>
```

在第一个 Windows PowerShell 终端启动 Worker：

```powershell
Copy-Item .dev.vars.example .dev.vars
npx wrangler@latest dev --local --ip 127.0.0.1 --port 8787 --env-file .dev.vars
```

在第二个 Windows PowerShell 终端启动前端：

```powershell
Set-Location frontend
npm run dev
```

地址：

- 前端：`http://localhost:5173`
- Worker：`http://localhost:8787`

`npm run dev` 会先运行管理台同步脚本，再由 `frontend/scripts/dev-server.mjs` 使用当前 Node 进程启动项目内的 Vite CLI。该入口不依赖全局 Vite 或平台专用的 `.cmd` 启动器。

## D1 schema 迁移

- 正式 migration 位于根 `migrations/`，由 `wrangler.toml` 的 `migrations_dir` 与 `migrations_table` 管理。不要只修改 `worker.js` 的运行时兜底 DDL；schema 或索引契约变化必须同时新增 migration。
- 当前 v5 migration 顺序固定为 `0001_d1_fresh_baseline.sql`（新库基础表）、`0002_d1_historical_compatibility.sql`（历史库兼容表）和 `0003_d1_schema_v5_indexes.sql`（索引收口）。先发布能够同时读取旧、新 schema 的 expand 代码，在预发执行 `initD1Schema` 并检查 `getD1SchemaStatus`，再应用远端 migration。基础 migration 不包含可重建的 `proxy_logs_fts`。
- 历史库的未知列组合不得由静态 migration 猜测。运行时兼容初始化必须严格读取 `sqlite_master`/`PRAGMA table_info`，逐项补齐已知列后再创建依赖索引；PRAGMA 失败、半初始化结构或未知结构均 fail-closed。
- 本地验证由用户在已配置 Wrangler 的环境中执行，代理不得自动安装依赖或直接应用远端 migration：

```powershell
npx wrangler@latest d1 migrations list <DATABASE_NAME> --local
npx wrangler@latest d1 migrations apply <DATABASE_NAME> --local
npx wrangler@latest d1 execute <DATABASE_NAME> --local --command="SELECT name, type FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') ORDER BY type, name"
```

- 生产应用前先记录 D1 Time Travel bookmark，并检查远端 migration 列表；应用后复查表、索引、日志查询、DNS IP 工作区、scheduled 租约和 tidy。Wrangler migration 不提供 down 流程，普通回滚采用 forward-fix，灾难恢复使用 Time Travel。

## 验证

### 统一检查入口

`tests/` 保存自动化断言，`scripts/` 保存可执行工程工具。两者保持独立目录，通过以下只读入口统一执行常用提交前检查：

```bash
node scripts/check-project.mjs
```

该命令依次运行 Worker 语法检查、Worker 防御边界回归、配置/KV 安全回归、D1 migration SQLite fixture、前端增强 VM 回归、管理台组合一致性、CDN 路径检查和 `git diff --check`。正式前端构建仍按下文单独执行，因为构建会改写 `frontend/dist/`。

### Worker

修改 `worker.js` 后至少运行：

```bash
node --check worker.js
```

涉及管理台防御边界、全局设置、KV 整理、D1 schema、HTML 壳缓存、isolate 内存缓存或 OpsStatus 读取收口时，还要运行聚焦回归：

```bash
node --test tests/worker-defensive-boundaries.test.mjs tests/config-kv-safety.test.mjs tests/d1-migrations.test.mjs tests/frontend-runtime-enhancements.test.mjs
git diff --check
```

Dashboard 月流量回归必须确认三点：连续读取由 single-flight/内存缓存合并，清空 isolate 缓存后可命中 Cache API，并且传入任何访问都会失败的 D1 binding 时 `getMonthlyTrafficStats` 仍成功。前端增强回归同时检查 `repeat-2` 切换图标、按需动作名及今日/本月文案。

涉及 isolate 内存边界时，聚焦回归必须确认：PlaybackInfo 超过 256 KiB 不进入缓存、总响应体预算不超过 4 MiB；未知长度控制请求保持流式；节点/路由/故障状态/进度会话/日志与限流默认上限不被放大；轮转清理覆盖 PlaybackInfo、故障转移、进度转发和月流量 Map。媒体反代响应不得新增 `text()` 或 `arrayBuffer()` 整包读取，相关优化不得通过提高 D1 flush 或查询频率换取内存下降。

日志 `detail_json` 超过 8 KiB 时仍必须保持可 `JSON.parse` 的合法值。

聚焦回归需要保持以下 I/O 边界：同代配置与节点 revision 并发刷新各只访问一次 KV；同节点、同失效代次的代理冷读取只访问一次节点实体，代理热节点和有效期内的短期负缓存不重复读取节点实体；一次完整 OpsStatus 聚合只读取一次 root 和每个 section 一次。D1 频率回归还要确认同 binding 的 schema 热调用只执行一轮 DDL、显式失效后会重新检查，OpsStatus 在 15 秒窗口复用 root/section 读取且写后不全量反读，Dashboard/runtime stale fallback 只查询一次缓存表，相同管理壳热命中状态只写一次而状态变化立即写。并发节点摘要 upsert 必须合并而不丢项，索引重建必须串行覆盖实体加载与提交，旧 revision 候选不得覆盖当前 meta。节点 `/web` 子树必须在上游请求前固定拒绝，Playback relay、同节点重定向和 `__pb_abs` 回退不得绕过；同时不能误伤 `/websocket`、`/webhooks`、普通 API 或媒体路径。

节点 metadata 自动化覆盖不同 Token、Cookie、用户和会话参数的 SHA-256 身份分区、目标预热 URL 的敏感 query 分区、原始凭据不进入缓存 URL、TTL/资源类别 revision 和条件请求 lookup。匿名/私有缓存头及真实 Cache API `206`/`304` 行为仍需浏览器或预发 smoke；metadata 上游必须保持 `cache: no-store`。

域名前缀 CNAME 自动化覆盖三层目标优先级、主机名清洗、非法值拒绝、计划前向/回滚、全局 active plan 补偿、真实 CNAME 分步失败与 history 写失败的完整 host snapshot 恢复、手动单记录创建/更新的 history 失败补偿、DNS 失败后节点 KV 仍回滚，以及 rename 的部分 KV 写补偿。节点新建、清空覆盖、删除、批量导入和管理台回显仍需预发 smoke；DNS 断言必须确认记录名仍为 `<节点名>.<HOST>`，记录为 `ttl: 1`、`proxied: false`。

D1 schema 自动化覆盖 fresh/旧日志 migration、完整必需列、主键/唯一键、同名错误索引、partial/expression 索引、畸形 FTS、v5 索引与正式查询、DNS 来源 batch、100 参数上限和稳定 IP `id`。D1 实例上的配额、Time Travel 和远端 migration apply 仍为人工发布检查。

全局设置与备份自动化覆盖无 KV fail-closed、条件补偿与并发冲突、完整导入失败回滚、后发设置与节点保存串行、快照脱敏、settings/full 默认脱敏备份往返保留当前密钥，以及显式字段覆盖/清空。含密钥导出的浏览器确认交互和真实文件导入下载仍需管理台 smoke。

KV tidy 自动化覆盖缺失/重复游标、签名篡改、过期与计划变化、配置/快照 revision 绑定、条件补偿冲突和最坏补偿配额。1000 页上限、所有 truth-source 读取失败点、每个 mutation 位置、与设置保存并发及结果分组 UI 对照仍需补充自动化；涉及这些边界的发布必须人工验证零写入失败语义。

D1 migration fixture 当前使用 `node:sqlite` 实际执行三个 migration，覆盖新库、缺少兼容日志列的旧库、缺列、错误索引、错误主键/唯一键和畸形 FTS，不需要新增 npm 依赖。migration 表缺失/落后、PRAGMA 失败、逐 step 失败重试、同 binding 结构漂移及 FTS 创建失败仍需补充自动化；修改这些路径时以预发检查兜底。

D1 管理动作的职责边界保持不变：`initLogsDb` 只补日志与小时统计，`initD1Schema` 不伪造 migration 记录，`initLogsFts` 失败不得返回 ready，显式状态检查必须复检实际结构。当前自动化只覆盖其中的初始化 single-flight 与 FTS 重建成功路径，其余在预发逐项验证。

全局默认 CNAME 自动化已确认只同步继承节点、跳过节点级覆盖、全部 DNS 成功后才持久化，以及 active/已完成计划按逆序补偿。管理台字段显示、留空继承提示和访问链接仍由人工 UI smoke 确认。

高风险 Worker 修改还应覆盖对应的本地或预发 smoke、鉴权、代理、KV/D1、缓存头和 scheduled 回归。

### 正式前端

正式前端构建应在 Windows PowerShell 中运行。在 Windows PowerShell 已定位到仓库根目录时执行：

```powershell
Set-Location frontend
npm run build
npm run build:cdn
```

重点检查：

- `GET /` 仍返回静态说明页。
- `GET ADMIN_PATH` 只返回管理台壳和 KV 中已上传的 `index.html`；未上传时进入本地上传启动门。
- 已认证的 `GET/HEAD ADMIN_PATH?setup=1` 返回 `no-store` 本地上传页，`HEAD` body 为空，页面不含 Release 选择和 `INDEX_URL` 配置。
- 浏览器侧依赖使用 `${ADMIN_PATH}/__release/<local-revision>/vendor/*` 同源路径。
- `script[src]`、stylesheet/modulepreload 和 script/style preload/prefetch 都能被识别；无扩展脚本不能漏检，协议相对及尾点主机名禁止源不能绕过，正式 HTML 不含 importmap、任何 inline 动态 `import()` 或 `dnsAutoUpload*`。
- `frontend/index.html` 与 `frontend/dist/index.html` 字节一致，证明同步输入已进入正式 Release 资产。
- 上游引用符合不可变规则的 vendor 资源使用 `immutable`；可变或省略 jsDelivr GitHub ref 的资源使用 `no-store` 并跳过 Cache API。
- HTML 保留 `ETag` 或 `Last-Modified` 协商缓存。
- stale HTML 可在后台刷新。
- 已认证的 `GET/HEAD ${ADMIN_PATH}/__warm` 能完成 HTML、vendor manifest 与不可变 JS/CSS 预热，未认证请求不能触发上游加载。
- 同一 isolate 内并发冷 miss 只执行一次缓存复查、KV 本地 `index.html` 读取和缓存提交，热命中不等待 OpsStatus 写入。
- 备份与恢复中的更新面板只有同时选择 `worker.js` 与 `index.html` 才能提交，并调用 `updateWorkerAndAdminIndex`。
- 登录成功不等待完整预热；vendor 预热最多保持 3 路并发。
- `scheduled()` 不参与前端刷新。

### 发布

发布校验命令和门禁见 [构建与发布](release.md)。

## 交付说明

任务完成时说明：

- 修改了什么。
- 影响哪个边界。
- 执行了哪些验证，哪些未执行。
- 仍有哪些风险。
- 下一步最自然的动作。
