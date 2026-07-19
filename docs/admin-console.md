# 管理台契约

## 范围

本文负责管理台入口、启动动作、主视图、设置页结构、前后端动作目录和正式前端同步约定。Worker 资源交付见 [运行时架构](architecture.md)。

## 入口与启动

- `GET ADMIN_PATH` 返回管理台壳。
- `POST ADMIN_PATH/login` 登录并签发 `auth_token`。
- `POST ADMIN_PATH` 是登录后的统一管理 API 入口。
- `GET/HEAD ${ADMIN_PATH}/__warm` 仅对已认证请求开放，用于显式预热管理台壳和可缓存依赖；登录成功后立即跳转，并通过 `keepalive` 尽力触发该路径，不等待完整 vendor 预热。
- 默认首屏调用 `getAdminBootstrap`。
- 当前 hash 为 `#settings` 时优先调用 `getSettingsBootstrap`。

### 手动重设与错误恢复

- 已认证用户可通过 `GET ADMIN_PATH?setup=1` 手动进入设置恢复页；兼容既有的 `setup=true`，错误页统一链接到 `setup=1`。
- 进入恢复页本身不调用 `saveConfig`，也不清空现有配置；错误页不下发完整配置对象，恢复页仍按既有设置表单契约加载当前配置。
- 远端壳错误页只提供刷新、登录、远端资产检查和恢复页链接，不包含客户端配置回写脚本；`HEAD` 响应保持空 body。页面缓存语义见 [运行时架构](architecture.md#worker-cache-api)。

管理台视图链固定为：

```text
#dashboard -> #nodes -> #logs -> #dns -> #settings
```

`GET /` 仍是静态说明页，不属于管理台实时视图。

## 主视图

| 视图 | 导航名称 | 职责 |
| --- | --- | --- |
| `#dashboard` | Dashboard | 仪表盘统计、运行状态、趋势图、D1 热点 |
| `#nodes` | Nodes | 节点列表、搜索筛选、编辑、导入导出、HEAD 测试 |
| `#logs` | Logs | 日志查询、初始化 DB、初始化 FTS、清空日志 |
| `#dns` | DNS | DNS 草稿、Zone 预览、CNAME 历史、推荐域名、优选 IP 工作台 |
| `#settings` | Settings | 系统 UI、代理与网络、静态资源策略、安全防护、日志设置、监控告警、账号设置、备份与恢复 |

管理台保持现有 SaaS 控制台结构，不新增第二套首页。

Dashboard 的视频流量卡默认显示今日 CF Zone 总流量。卡片右上角的切换图标按需调用 `getMonthlyTrafficStats`，在今日与本月累计之间切换；本月数据不会随首屏自动加载，也不会刷新其他仪表盘卡片。月累计窗口按 `scheduleUtcOffsetMinutes` 从当月 1 日 00:00 计算到当前时刻，统计口径继续使用 Cloudflare `edgeResponseBytes`。

## 设置页

视觉分区固定为八块：

1. 系统 UI
2. 代理与网络
3. 静态资源策略
4. 安全防护
5. 日志设置
6. 监控告警
7. 账号设置
8. 备份与恢复

保存分组固定为五类：`ui`、`proxy`、`security`、`logs`、`account`。

### 域名前缀代理与 CNAME

- “域名前缀代理”设置卡片提供“默认 CNAME 指向”，对应 `saveConfig.config.defaultHostPrefixCnameTarget`；留空表示使用 `HOST`。
- 节点新建和编辑弹窗仅在入口模式为 `host_prefix` 时提供“CNAME 指向”，对应节点字段 `hostPrefixCnameTarget`；留空表示继承全局默认值。该入口模式不显示无效的访问密钥输入。
- 节点从 `host_prefix` 切换为 `kv_route` 时必须清空节点级 CNAME 字段，避免保存不可见、无效的覆盖值。
- CNAME 目标优先级固定为“节点指定 > 全局指定 > `HOST`”。管理台显示的节点访问链接仍使用 `<节点名>.<HOST>`，不得使用 CNAME 目标拼接 URL。
- 节点 `save`、`import`、编辑回显、节点导出以及完整备份保留 `hostPrefixCnameTarget`；设置导入导出和完整备份保留 `defaultHostPrefixCnameTarget`。全局值保存成功后，未设置节点级覆盖的现有子域节点应已完成 DNS 同步；失败时展示 Worker 返回的失败节点和回滚状态，不得显示为已保存。

### 设置写入与备份安全

- `previewConfig`、`saveConfig` 和 `importSettings` 共用字段清洗与完整校验链。预览必须执行发布源、Host Prefix CNAME、DNS 同步前置条件等正式保存校验，不得把预览成功但保存必然失败的配置交给用户确认。
- `saveConfig` 和 `importSettings` 必须有 KV binding；缺少 `ENI_KV`/兼容 KV binding 时返回 `KV_NOT_CONFIGURED`、HTTP `503`，不得以仅保存在 isolate 内存中的配置返回成功。
- 一次设置写入同时提交配置、配置 meta、设置快照、快照 meta 和遗留键删除，并在单 isolate 的 KV mutation chain 中串行。节点保存/导入、删除、主视频流快捷策略和完整导入共用该链，后发写入等待前序索引提交或补偿完成。失败补偿只恢复仍等于本次写入结果的键；若检测到并发新值，返回 `KV_MUTATION_ROLLBACK_CONFLICT`、HTTP `409`，并通过 `rollbackConflicts`/`rollbackFailures` 说明未覆盖的新值或补偿失败。
- `importFull` 将导入前快照、配置和节点读取、DNS 计划、配置/节点提交及失败补偿作为同一个串行操作。节点阶段失败时先恢复节点和导入前 CNAME，再恢复旧配置及其 DNS；同 isolate 内后发设置保存必须等待导入完成，不能被旧快照覆盖。
- `exportSettings` 默认移除 `cfApiToken`、`tgBotToken`，返回 `secretsRedacted: true`、`containsSecrets: false`。完整设置导出必须同时提交 `includeSecrets: true` 和 `X-Admin-Confirm: exportSettings`；缺少确认头时返回 `CONFIRMATION_REQUIRED`、HTTP `428`，成功结果标记 `containsSecrets: true`。
- `exportConfig` 的默认响应同样脱敏，节点导出不得把配置密钥带回浏览器。只有提交 `includeSecrets: true` 且携带 `X-Admin-Confirm: exportConfig` 时才允许生成包含密钥的完整配置备份；普通设置导出仍应调用 `exportSettings`。
- 默认脱敏的 settings/full 备份回导时，缺少 `cfApiToken` 或 `tgBotToken` 表示保留当前密钥；备份显式包含字段时才允许覆盖，显式空字符串表示清空。配置快照及 KV 整理迁移快照只保存脱敏配置；恢复普通快照或整理迁移快照时同样沿用当前密钥。
- Worker 不保存也不消费 `dnsAutoUpload*`。正式模板、生成入口和 Vue 设置源均不得包含或展示这些设置；实现完整 scheduled 能力前不能用占位表单暗示功能已经生效。

### KV 整理确认契约

- `previewTidyData` 的 KV 预览返回 `planHash`、HMAC 签名的 `planToken` 和 `planExpiresAt`。`tidyKvData` 必须携带该 `planToken`；Worker 在同一 mutation chain 中重新扫描并重建计划，只有当前哈希与已确认哈希一致才执行。
- 令牌缺失、格式错误、签名错误或 scope 不匹配返回 `TIDY_PLAN_INVALID`、HTTP `409`；令牌过期或预览后 KV 计划发生变化返回 `TIDY_PLAN_STALE`、HTTP `409`。管理台应提示用户重新预览，不得静默使用新计划继续整理。
- 主配置 `sys:theme`、任一 `node:*`、配置快照、节点索引或 KV key list 读取异常时，预览与执行均为零写入失败。分页缺少游标、重复游标或超过 1000 页返回 `KV_SCAN_INCOMPLETE`，不得把未完成扫描解释为完整键集合。
- 预览配额按前向 put/delete 与最坏补偿 put/delete 合计；超过安全写入额度返回 `KV_TIDY_WRITE_LIMIT_EXCEEDED`、HTTP `409`。执行结果继续返回实际 `fieldGroups`、`deleteGroups`、`rewriteGroups`、`preserveGroups`，用于和确认计划对照。

## 动作目录

### 页面与启动

- `GET /`
- `GET ADMIN_PATH`
- `GET/HEAD ${ADMIN_PATH}/__warm`
- `POST ADMIN_PATH/login`
- `POST ADMIN_PATH`
- `getAdminBootstrap`
- `getSettingsBootstrap`
- `getDashboardSnapshot`
- `getDashboardStats`
- `getMonthlyTrafficStats`
- `getRuntimeStatus`

### 配置、备份与整理

- `getGithubReleaseSourceOptions`
- `loadConfig`
- `previewConfig`
- `previewTidyData`
- `saveConfig`
- `exportConfig`
- `exportSettings`
- `importSettings`
- `getConfigSnapshots`
- `clearConfigSnapshots`
- `restoreConfigSnapshot`
- `importFull`
- `tidyKvData`
- `tidyD1Data`

### Worker 运维

- `getWorkerPlacementStatus`
- `saveWorkerPlacement`
- `updateWorkerScriptContent`
- `purgeCache`

### 节点

- `list`
- `getNode`
- `save`
- `import`
- `delete`
- `pingNode`
- `saveMainVideoStreamPolicyShortcuts`

`save` 与 `import` 在内部归一到 `saveOrImport`。

### DNS 与优选 IP

- `listDnsRecords`
- `setDnsHistoryFallback`
- `createDnsRecord`
- `updateDnsRecord`
- `saveDnsRecords`
- `getDnsIpWorkspace`
- `importDnsIpPoolItems`
- `saveDnsIpPoolSources`
- `getDnsIpPoolSources`
- `refreshDnsIpPoolFromSources`
- `deleteDnsIpPoolItems`

`createDnsRecord` / `updateDnsRecord` 在 Cloudflare 写入成功但 CNAME history 持久化失败时返回 `CF_DNS_UPDATE_FAILED`，并携带补偿是否尝试、是否成功及错误原因；创建操作删除刚创建的记录，更新操作恢复写入前记录。
- `fillDnsDraftFromIpPool`

### 日志与告警

- `getLogs`
- `clearLogs`
- `getD1SchemaStatus`
- `initLogsDb`
- `initLogsFts`
- `initD1Schema`
- `testTelegram`
- `sendDailyReport`
- `sendPredictedAlert`

`sendDailyReport` 的综合日报在今日 CF Zone 总流量后追加本月累计流量；月累计与 Dashboard 本月流量卡复用同一统计口径和缓存链。

`initLogsDb` 只初始化日志基础表、日志兼容列/索引和小时统计，不因 DNS、鉴权或 Cloudflare cache 表状态阻断；`initLogsFts` 在日志基础结构上重建可派生的 FTS5 表，只有结构复检和重建都成功时才返回 `ftsReady: true`。`initD1Schema` 是显式的全库运行时兼容初始化动作，会逐步补齐运行时表、日志表和小时统计，但不写入 Wrangler migration 记录。

`getD1SchemaStatus` 每次显式检查都重新读取 `sqlite_master` 与 PRAGMA，核对完整必需列、运行时 upsert 依赖的主键/唯一键、命名索引所属表与键列顺序，返回 `runtimeCompatibilityVersion`、`runtimeCompatibilityReady`、`appliedMigrations`、`latestRequiredMigration`、`missingMigrations`、`migrationReady`、`schemaVersion`、表/列/索引/约束/FTS readiness 和 `issues`。只有要求的 migration 已记录且结构校验通过时 `schemaVersion` 才为 `5`；运行时补齐成功但 migration 未应用时只允许 `runtimeCompatibilityReady: true`。`tidyD1Data` 只执行保留期清理、统计/FTS 维护和 `PRAGMA optimize`，不得被用作跳过正式 migration apply 的升级入口。

## 正式前端约定

- `frontend/admin-runtime.template.html` 是管理台构建期模板。
- `frontend/scripts/admin-runtime-enhancements.mjs` 是管理台视觉与工具栏增强的显式构建输入。
- `frontend/scripts/sync-admin-runtime.mjs` 确定性组合模板、占位符和增强输入，生成唯一入口 `frontend/index.html`。
- `npm run dev`、`npm run build` 和 `npm run build:cdn` 都必须先执行同步。
- `frontend/index.html` 保留 Tailwind CDN、Vue global、Lucide UMD、Chart.js UMD、模板原始 style/script 顺序和 body class；增强内容固定追加在 `</head>` 前且只能出现一次。
- 正式模板和产物不得包含未实现的 `dnsAutoUpload*` 状态，也不得包含任何 inline 动态 `import()`；运行时依赖必须通过 Worker 可改写的同源 vendor 代理交付。
- 顶部工具栏的外部入口顺序固定为 GitHub、WIKI 新手教程、主题切换；三个图标使用统一点击区域和紧凑间距。
- 节点工具栏在桌面端保持“新建、标签筛选、搜索”同行，导入、导出和健康检查作为独立操作组；窄屏按控件完整宽度依次堆叠。
- 节点编辑弹窗在线路列表下方提供默认展开、可手动收起的“高级设置”，统一容纳 PlaybackInfo 模式、媒体认证头模式、真实客户端 IP 透传、线路故障转移探针路径和自定义请求头；这些字段继续使用既有节点保存契约。
- 节点编辑弹窗采用紧凑表单密度：入口模式位于节点名称前；标签、备注和主视频流策略同一行，主视频流策略不展示额外说明；同时保持输入控件和线路操作按钮的可点击尺寸。
- 发布源与 Worker 快捷更新设置区按“来源摘要、配置或派生地址、执行动作”分层；长 URL 不得撑破设置面板，主要更新动作与辅助刷新动作保持明确层级。
- 默认“导出全局设置”必须明确提示结果已脱敏；专家模式才显示“导出含密钥设置”，并在请求前进行敏感操作确认。日志页专家模式显示“Schema 状态”和“初始化 Schema”，分别调用 `getD1SchemaStatus` 与 `initD1Schema`。
- 视频流量卡的今日/本月切换由正式 runtime enhancement 挂载，使用 Lucide `repeat-2` 图标、固定点击区域和加载态；月统计只在用户首次切换时请求，切回今日直接恢复当前仪表盘快照。
- `App.vue`、`src/features/*`、`src/composables/*` 不是当前首屏启动链。
- 不把 `banker/.admin-ui.html` 或构建副本当作正式模板。
- `check-cdn-paths.mjs` 必须按标签语义检查 `script[src]`、stylesheet/modulepreload 和 script/style preload/prefetch，覆盖单双引号、协议相对写法与无扩展 URL；同时检查占位符清空、`admin-bootstrap`、`#app`、禁止 importmap、任何 inline 动态 `import()`、禁止 `dist/assets/**`，并确认 `dist/index.html` 与同步后的 `index.html` 字节一致。
