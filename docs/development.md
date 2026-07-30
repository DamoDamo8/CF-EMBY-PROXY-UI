# 开发与验证

## 任务分类

开始工作前先把任务归入一个主要边界：

- `Frontend App`
- `Worker Shell`
- `Worker API / Proxy`
- `Poster / Server Records`
- `Build & Publish`
- `Cache / Delivery`
- `Debug / Regression`

鉴权、代理、KV/D1、scheduled、缓存一致性、资源路由和响应头属于高风险区域。展示层、Vite 配置、发布校验脚本和测试脚本通常风险较低，但仍需按正式入口验证。

任务对应的阅读路径见根 [AGENTS.md](../AGENTS.md)。

海报和服务器记录任务还必须读取已实现的 [服务器记录海报重构契约](poster-contract.md)。

## 开始前

- 先读根 `worker.md` 和任务对应的专题文档。
- Worker 修改优先检查根 `worker/` ESM 源码；发布与部署核对根 `worker.js` 生成产物。前端检查根 `frontend/`，不要从历史目录推断当前行为。
- 涉及管理台边界时，先核对页面入口、启动动作、六个主视图、八个设置视觉分区和五个保存分组。
- 涉及 Cache API、`ctx.waitUntil()`、Request/Response、`compatibility_flags` 或平台限制时，先查 `developers.cloudflare.com`，重点核对 Workers Cache API、缓存工作方式、Runtime Context 和平台限制。

## Windows 开发环境

正式开发环境使用 Windows PowerShell，不依赖 WSL：

- Node.js 版本由根 `package.json#engines`、`frontend/.nvmrc` 与 `frontend/package.json#engines` 共同约束，当前最低版本为 24.15.0。
- Python 版本由根 `.python-version` 约束；当前基线为 Python 3.14.6。`scripts/extract-ui-from-js.py` 的最低语法要求为 Python 3.10。
- Git 使用 Windows 版 Git。
- Wrangler 不要求全局安装，由根 workspace 锁定并通过 `npx wrangler` 调用。

首次进入仓库后验证工具链并安装锁定依赖：

```powershell
node --version
npm --version
python --version
py --version
git --version
npm ci
npx wrangler --version
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
npx wrangler dev --local --ip 127.0.0.1 --port 8787 --env-file .dev.vars
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

- 正式 migration 位于根 `migrations/`，由 `wrangler.toml` 声明目录和记录表；这些文件是版本与结构契约，不代表生产必须优先从 Wrangler 执行。不要只修改 `worker.js` 的运行时兜底 DDL；schema 或索引契约变化必须同时新增 migration。
- 当前 v11 migration 顺序固定为 `0001_d1_fresh_baseline.sql`、`0002_d1_historical_compatibility.sql`、`0003_d1_schema_v5_indexes.sql`、`0004_server_watch_stats.sql`、`0005_server_record_snapshots.sql`、历史海报缓存 `0006_server_record_poster_cache.sql`、播放生命周期 `0007_server_watch_lifecycle.sql`、历史豆瓣字段 `0008_server_record_poster_douban.sql` 和补齐原始标题/年份并删除退役缓存表的 `0009_drop_server_record_poster_cache.sql`。先发布能够读取旧 schema 并识别 v11 缺列/残留表的 expand 代码，再优先在管理台执行“初始化 DB”：该动作自动取得初始化前 Time Travel bookmark，完成兼容修复、结构复检和缺失 migration 基线采纳。Cloudflare Dashboard 是第二操作入口；Wrangler 仅在管理台不可用、Sessions API 不受支持、本地验证或灾难恢复时回退使用。基础 migration 不包含可重建的 `proxy_logs_fts`。
- 历史库的未知列组合不得由静态 migration 猜测。“初始化 DB”必须严格读取 `sqlite_master`、`PRAGMA table_info`、`index_list` 与 `index_xinfo`，先对所有已存在同名表完成主键/唯一键只读预检，再逐项补齐登记的非键列、创建缺表、修复命名普通索引、删除登记的退役索引并重建异常 FTS。PRAGMA 失败、主键/唯一约束漂移、键列缺失或未知结构均在任何 DDL 前 fail-closed，不自动 `DROP TABLE` 重建业务表。FTS 检查必须覆盖 FTS5、`content=proxy_logs`、`content_rowid=id` 和插入触发器字段映射。
- 本地 migration SQL 验证可在已配置 Wrangler 的环境中执行；这些命令不得被自动扩展为远端生产写入：

```powershell
npx wrangler@latest d1 migrations list <DATABASE_NAME> --local
npx wrangler@latest d1 migrations apply <DATABASE_NAME> --local
npx wrangler@latest d1 execute <DATABASE_NAME> --local --command="SELECT name, type FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') ORDER BY type, name"
```

- 生产优先由管理台“初始化 DB”自动记录写入前 bookmark，并在结果中保存 `recoveryBookmark`；也可用旁边的“获取 Bookmark”只读复制当前版本。操作后复查表、索引、日志查询、DNS IP 工作区、scheduled 租约和 tidy。管理台不可用时从 Cloudflare Dashboard 检查或恢复 Time Travel；Wrangler 不提供 down 流程，仅作为回退，普通回滚采用 forward-fix，灾难恢复使用 Time Travel。

## 服务器最后观看记录

- 服务器记录不使用 Durable Object。最近观看只由代理流程中的两个自包含成功响应异步 UPSERT：主路径是带 `EnableImageTypes`、`ImageTypeLimit=1`、`Fields=ProviderIds,ExternalUrls` 和 Emby 授权头的用户 Item GET，保底是已通过 `IsPlayback=true` intent 检查的 PlaybackInfo JSON。两者分别从本次路径和 JSON 读取 ItemId，不使用 intent.itemId 做跨请求关联；`Playing`、`Progress` 与 `Stopped` 继续正常代理和进度转发，但不得写服务器记录观看时间。响应解析限制为 256 KiB，失败不得改变上游正文、请求头或响应。
- 本地/预发必须验证不同 `nodeName` 独立写入，用户路径、三个查询参数、授权头、2xx JSON、路径/正文 ItemId 一致性缺一不可；裸 `/Items/<id>`、图片子资源、缺参数、缺 Token、非 JSON、超限和错误响应均不写。PlaybackInfo 仅在成功 intent 后保底，intent 不保存 ItemId；已观察到的用户 Item 详情优先于迟到的 PlaybackInfo。媒体字段读取 `Name/Type/SeriesName/OriginalTitle/ProductionYear/ImageTags.Primary`，单集供应商搜索仍使用系列身份；快照只返回同源 `posterUrl`，不得返回图片 Tag、供应商 ID、上游 URL 或凭据。手动刷新仍可为当前 ID-only 指针按用户 Item 详情 → PlaybackInfo 补读元数据。
- 浏览器海报回归必须覆盖同源 Emby → TMDB → 豆瓣顺序、中文标题到原始标题、前三项候选与唯一精确匹配、16 路并发、8 秒超时、取消、重定向拒绝、CORS/认证/限流错误，以及 5 MiB、MIME、文件签名和 Blob URL 释放。同源海报成功不得请求浏览器供应商配置；同源失败且卡片可见时才请求一次 `getPosterBrowserConfig`。同源路由必须要求管理鉴权、校验当前 D1 指针并且不泄露节点 Token、Cookie 或上游 URL。
- 浏览器缓存回归必须覆盖 SHA-256 搜索身份、7 天成功/30 分钟失败 TTL、256 项 LRU、损坏存储恢复、旧前缀键清理、手动刷新只绕过失败缓存且不预取不可见卡片，以及缓存图片失败后的单次供应商回退。
- 海报安全回归必须确认 TMDB 只使用固定官方 HTTPS origin，豆瓣只使用配置 origin 下固定的 resolve/poster 路径，所有外部请求拒绝重定向，错误只输出供应商和固定错误码。`getPosterBrowserConfig` 必须鉴权并返回 `no-store`；管理台保存值逐项优先于 `TMDB_BROWSER_TOKEN`、`DOUBAN_BROWSER_ORIGIN`、`DOUBAN_BROWSER_TOKEN` binding，清除后回退 binding。设置 bootstrap 只返回 Token 配置状态和来源，Token 不进入快照或导出；KV 保存、整理、导入、快照与任何导出必须永久移除 `tmdbApiKey`。
- 探测回归必须覆盖 Ping 成功但 System Info 失败仍为在线、活动线路 Ping 返回 HTTP 错误后继续回退、全部线路 Ping 无权限、401/403 与网络或 HTTP 失败混合时不误报无权限、真实 `server_record_timeout` 与 `server_record_network_error` 进入强制刷新退避、普通页面读取零 Emby 请求、单卡片刷新只探测目标节点、全部刷新探测所有启用节点，以及重新启用节点保留标签/完整到期策略和待关联旧记录可选择已启用节点。服务器记录专用或继承账号必须先登录并复用同 isolate 的短期令牌；登录与详情请求不得携带继承的节点代理 Token/Cookie，认证失败时必须跳过三项 `/Items` 统计且不能回退到节点代理认证头。服务器记录密码默认只显示 `********`；仅点击显示按钮时才请求当前节点的有效密码，单纯显示后保存不得把继承凭据复制为服务器记录专用凭据。
- 节点/故障转移探针 URL 回归必须覆盖：根目标 + origin-root 探针、目标 `/emby` 与探针 `/emby/...` 去重、大小写不一致（`/Emby` + `/emby/...`、`/emby` + `/EMBY/...`）、嵌套 base（`/proxy/emby` + 默认 `/emby/system/ping`）去重、整段 base 匹配（`/proxy/emby` + `/proxy/emby/...`）、相对探针 `/System/Ping` 以及业务 `buildUpstreamProxyUrl` 不受探针去重影响。前端普通回读在保留 previous `runtime` 时不得盖住 D1 persisted `counts`。
- 首次上线部署兼容 Worker 后，在管理台执行“初始化 DB”即可创建并登记服务器观看与快照表；`wrangler.toml` 不需要服务器观看相关的 Durable Object binding 或 class migration。
- 过期回归必须覆盖新增记录默认关闭、关闭时卡片不展示到期区且不告警、固定日期不随播放变化、滚动模式使用每节点 `expiryDays`、跨月/跨年/当天/已过期计算、旧合法日期记录兼容为启用固定模式、无效或缺失日期不告警、7/3/1/0 天签名去重、滚动模式播放时间变化或固定日期变化后可再次告警，以及 Telegram 失败只造成 scheduled 部分失败。每日时隙重复执行不得再次探测 Emby、刷新或发送。

## 验证

### 统一检查入口

`tests/` 保存自动化断言，`scripts/` 保存可执行工程工具。两者保持独立目录，通过以下只读入口统一执行常用提交前检查：

```bash
npm run check
```

该命令依次运行全部 Worker ESM 源码语法检查、Facade/循环/导入架构门禁、根 `worker.js` freshness 重建比对、Worker 产物 smoke、Worker 防御边界回归、配置/KV 安全回归、D1 migration SQLite fixture、前端增强 VM 回归、管理台组合一致性、CDN 路径检查和 `git diff --check`。正式前端构建仍按下文单独执行，因为构建会改写 `frontend/dist/`。

前端管理台交互回归至少覆盖：同一资源的后发请求不会被先前响应或错误覆盖，显式全量刷新能够取代普通读取，确认到提交期间的重复动作只产生一次管理 API 写入，失败后控件恢复可用；同时检查异步状态播报、busy 属性和弹窗焦点恢复。优先使用 `tests/frontend-runtime-enhancements.test.mjs` 的 VM/mock 行为测试，字符串断言只用于生成入口、静态可访问性属性和同步链完整性。

### Worker

修改 `worker/` 后先生成根产物并执行源码、架构与 freshness 门禁：

```bash
npm run build:worker
npm run check:worker-syntax
npm run check:worker-architecture
npm run check:worker-bundle
```

根 `worker.js` 顶部带生成标记且不得手工编辑。行为测试通过 `worker/testing/hooks.js` 调用唯一的 `createWorkerApplication()`，取得同一套三个具名 Facade、冻结的生产 Worker handler，以及按 `kv`、`d1`、`cache`、`fetch`、`clock` 分区的测试平台；默认生产组合不公开测试内核。测试不得重建 proxy/runtime 或修改旧操作袋；仅白盒边界断言可从 `worker/runtime/application-facades.js` 具名导入，不得恢复已删除模块或 `globalThis` test hooks。Vite 使用 ES2022、单 ES chunk、不压缩和 hidden source map；`.worker-dist/` 只供本地/CI 使用，不进入 Release。

Facade 连接回归必须确认：直接调用 `AdminConsoleFacade.handle()` 与生产 handler 对未认证管理读写都返回 `401`；普通节点路径不经过管理 Facade，`NodeProxyFacade.handle()` 缺少显式 `routeContext` 时拒绝执行；`ScheduledMaintenanceFacade.handle()` 对每次事件只登记一个 `waitUntil` 任务，空 binding、租约忙、续租失败和部分存储失败均通过同一观测链收口。

涉及管理台防御边界、全局设置、KV 整理、D1 schema、HTML 壳缓存、isolate 内存缓存或 OpsStatus 读取收口时，还要运行聚焦回归：

```bash
node --test tests/worker-defensive-boundaries.test.mjs tests/config-kv-safety.test.mjs tests/d1-migrations.test.mjs tests/frontend-runtime-enhancements.test.mjs
git diff --check
```

Dashboard 月流量回归必须确认：连续读取由 single-flight/内存缓存合并，清空 isolate 缓存后可命中 Cache API，传入任何访问都会失败的 D1 binding 时 `getMonthlyTrafficStats` 仍成功，并且 GraphQL 分片不超过 1 天。前端增强回归同时检查 `repeat-2` 切换图标、按需动作名、今日/本月文案，以及浏览器月缓存的月份/30 分钟失效、失败可重试和同月失败保留成功值。

Dashboard 分层刷新回归还要确认：当前卡片在后台请求期间保持可见，统计与运行状态分别完成，D1 热点只按需加载且不延长主刷新 busy 周期；热点或 Cloudflare 查询失败不能覆盖其他已成功层。服务器记录回归检查顶部全部刷新与卡片右上角单节点刷新各自的 loading、全量刷新完成后较旧单卡响应不能覆盖卡片或节点列表、底部编辑/运行状态/移除顺序、名称/标签搜索与滚动/固定到期方式组合筛选、未手动刷新时的“未检测”状态机、默认未勾选的到期功能、无专用账号旧记录仍可编辑、弹窗关闭立即清理已显示密码、只消费 Worker `expiry.daysRemaining` 与状态且不从浏览器时钟推算、以及不触发 Dashboard 刷新。

涉及 isolate 内存边界时，聚焦回归必须确认：PlaybackInfo 超过 256 KiB 不进入缓存、总响应体预算不超过 4 MiB；聚合实例映射最多 64 项且 5 分钟过期，不包含凭据、Token、线路 URL 或完整 MediaSource；未知长度控制请求保持流式；节点/路由/故障状态/进度会话/日志与限流默认上限不被放大；轮转清理覆盖 PlaybackInfo、聚合实例、故障转移、进度转发和月流量 Map。媒体反代响应不得新增无界 `text()` 或 `arrayBuffer()` 整包读取，相关优化不得通过提高 D1 flush 或查询频率换取内存下降。

影视资源版本聚合回归还应覆盖：节点固定账号优先于全局账号，节点与全局账号均允许空密码且无有效账号的节点不能被快捷勾选；固定 Emby 账号登录请求不会把密码写入日志、缓存键或备份；TMDB/IMDb 共有强 ID 冲突拒绝，标题标点与大小写规范化后精确相等，年份和类型必须一致，Episode 按 Series 身份加季/集/结束集匹配；TMDB 无结果继续 IMDb，`AnyProviderIdEquals` 不兼容时 `SearchTerm` 候选仍需本地严格复核。

线路与时间回归必须使用可控响应覆盖：活动线路网络错误、超时或 5xx 后第二线路成功，全部认证失败，响应超过 256 KiB 和非法 JSON；首个有效结果等待、命中后的宽恕期、后台补全、全部失败提前结束及主服成功降级。存在后台、认证、网络、超时或解析失败时不得写入 PlaybackInfo 短期缓存；后续请求可命中紧凑映射，池成员 `cacheRevision` 或策略变化必须更换缓存键，映射容量不得超过 64。

AGG2 回归必须覆盖 HMAC 篡改、内容身份漂移、目标节点移出池、旧 AGG1 实时复核和所有失效路径清除魔改 MediaSourceId 后回退主服。管理台回归必须确认三个策略字段缺失时保留旧值、自动管理的 `rewrite` 可恢复，而手工 `rewrite` 和旧节点不会被快捷保存覆盖。诊断断言只允许状态、计数、耗时和节点名，不得出现 ProviderId 值、标题、密码、Token 或上游地址。D1 虚拟 ItemId、OtherInstances、跨服库/搜索/Resume/NextUp 属于第二阶段，当前回归不得假设已经实现。

日志 `detail_json` 超过 8 KiB 时仍必须保持可 `JSON.parse` 的合法值。

聚焦回归需要保持以下 I/O 边界：同代配置与节点 revision 并发刷新各只访问一次 KV；同节点、同失效代次的代理冷读取只访问一次节点实体，代理热节点和有效期内的短期负缓存不重复读取节点实体；一次完整 OpsStatus 聚合只读取一次 root 和每个 section 一次。D1 频率回归还要确认同 binding 的 schema 热调用只执行一轮 DDL、`logs-core` 与 `logs-fts` profile 共享 binding 级串行链、显式失效后会重新检查，OpsStatus 在 15 秒窗口复用 root/section 读取且写后不全量反读，Dashboard/runtime stale fallback 只查询一次缓存表，相同管理壳热命中状态只写一次而状态变化立即写。并发节点摘要 upsert 必须合并而不丢项，索引重建必须串行覆盖实体加载与提交，旧 revision 候选不得覆盖当前 meta。节点 `/web` 子树必须在上游请求前固定拒绝，Playback relay、同节点重定向和 `__pb_abs` 回退不得绕过；同时不能误伤 `/websocket`、`/webhooks`、普通 API 或媒体路径。

节点 metadata 自动化覆盖不同 Token、Cookie、用户和会话参数的 SHA-256 身份分区、目标预热 URL 的敏感 query 分区、原始凭据不进入缓存 URL、TTL/资源类别 revision 和条件请求 lookup。匿名/私有缓存头及真实 Cache API `206`/`304` 行为仍需浏览器或预发 smoke；metadata 上游必须保持 `cache: no-store`。

域名前缀 CNAME 自动化覆盖三层目标优先级、主机名清洗、非法值拒绝、计划前向/回滚、全局 active plan 补偿、真实 CNAME 分步失败与 history 写失败的完整 host snapshot 恢复、手动单记录创建/更新的 history 失败补偿、DNS 失败后节点 KV 仍回滚，以及 rename 的部分 KV 写补偿。节点新建、清空覆盖、删除、批量导入和管理台回显仍需预发 smoke；DNS 断言必须确认记录名仍为 `<节点名>.<HOST>`，记录为 `ttl: 1`、`proxied: false`。

D1 schema 自动化覆盖 fresh/v10/重复初始化、完整必需列、主键/唯一键、索引与 FTS、跨 profile 初始化串行、业务行保留、v5 索引、v6 节点最后观看、v7 资源/最近媒体快照、v9 播放生命周期、v11 原始标题/年份补列和退役海报缓存表删除、失败时不登记 `0009`、bookmark 早于首个写入、bookmark 失败零写入、畸形 migration 表 fail-closed、0001–0009 幂等采纳、DNS 来源 batch、100 参数上限和稳定 IP `id`。手动 D1 tidy 覆盖幂等删除意外残留表且不修改 migration 账本，scheduled 与节点生命周期不得读取或修改旧表。D1 实例配额和真实 Time Travel 恢复仍为人工发布检查。

全局设置与备份自动化覆盖无 KV fail-closed、条件补偿与并发冲突、完整导入失败回滚、后发设置与节点保存串行、Worker 部署失败时保留后发设置并只补偿 HTML revision、全局/节点 Emby 凭据的脱敏、确认式完整备份保留全量 Emby 凭据、未确认敏感导出被拒绝、缺字段保存/导入保留当前凭据、不可回导完整备份的导出门禁，以及显式字段覆盖/清空。所有保存、KV tidy、导入和导出路径都必须永久删除 `tmdbApiKey`。含其他密钥或 Emby 凭据导出的浏览器确认交互和真实文件导入下载仍需管理台 smoke。

KV tidy 自动化覆盖缺失/重复游标、签名篡改、过期与计划变化、配置/快照 revision 绑定、条件补偿冲突、最坏补偿配额、D1 未就绪时保留 D1-owned 遗留键、D1 复制失败时零 KV 删除、异常 OpsStatus/Telegram JSON 与缺目标/缺 ID/重复 ID 的 DNS 来源在首个写入前 fail-closed，以及本地 HTML 内容随配置/快照引用淘汰和整理遗留孤立键。1000 页上限、所有 truth-source 读取失败点、每个 mutation 位置、跨存储写入后 KV 失败的重复执行、与设置保存并发及结果分组 UI 对照仍需补充自动化；涉及这些边界的发布必须人工验证零写入失败语义。

D1 migration fixture 当前使用 `node:sqlite` 实际执行九个 migration，覆盖新库、v10 库、缺少兼容日志列的旧库、节点最后观看、资源统计/最近媒体快照、播放生命周期、v11 原始标题/年份、退役海报缓存表删除、Playing/Progress/STOP 接纳、强弱指纹门禁、并发快照联动、旧 schema 降级、旧刷新防回拨、缺列自动补齐、错误索引修复、退役索引清理、错误主键/唯一键 fail-closed、未知同名表零修改、FTS 定义/触发器校验与重建、同 binding 跨 profile 串行、migration 表缺失/落后采纳、`0009` 失败零登记、bookmark 失败零写入、已有 `0005` 业务行保留，以及 KV 遗留状态合并，不需要新增 npm 依赖。D1 tidy 还覆盖手动幂等删除残留表、数据变化 stale、初始化前预览不授权删除，以及 scheduled 不触碰旧表。PRAGMA 失败、逐 step 失败重试及 FTS 创建失败仍需补充自动化；修改这些路径时以预发检查兜底。

D1 管理动作统一以 `initLogsDb` 作为管理台“初始化 DB”入口；它返回最终 status、本次自动调整、`adoptedMigrations` 和写入前 `recoveryBookmark`。只有该显式登录动作可在结构复检通过后采纳 migration；`getD1TimeTravelBookmark` 始终只读，`getD1SchemaStatus`、`initD1Schema` 与 `initLogsFts` 仅保留 API 兼容并不得登记 migration。FTS 失败不得返回 ready，显式状态检查必须复检实际结构。

全局默认 CNAME 自动化已确认只同步继承节点、跳过节点级覆盖、全部 DNS 成功后才持久化，以及 active/已完成计划按逆序补偿。管理台字段显示、留空继承提示和访问链接仍由人工 UI smoke 确认。

高风险 Worker 修改还应覆盖对应的本地或预发 smoke、鉴权、代理、KV/D1、缓存头和 scheduled 回归。

### 正式前端

正式前端构建应在 Windows PowerShell 中运行。在 Windows PowerShell 已定位到仓库根目录时执行：

```powershell
npm run build:frontend
npm run build:release
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
