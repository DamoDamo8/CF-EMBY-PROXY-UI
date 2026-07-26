# 管理台契约

## 范围

本文负责管理台入口、启动动作、主视图、设置页结构、前后端动作目录和正式前端同步约定。Worker 资源交付见 [运行时架构](architecture.md)。

## 入口与启动

- `GET ADMIN_PATH` 返回管理台壳。
- `POST ADMIN_PATH/login` 登录并签发 `auth_token`。
- 登录壳必须用内嵌脚本拦截表单并以 JSON 调用登录接口；密码按原始字符串精确比较，不得静默裁剪首尾空白。密码错误、剩余尝试次数和锁定状态在页内展示，不得退化为浏览器表单提交后直接显示 JSON 响应。
- `POST ADMIN_PATH` 是登录后的统一管理 API 入口。
- `GET/HEAD ${ADMIN_PATH}/__warm` 仅对已认证请求开放，用于显式预热管理台壳和可缓存依赖；登录成功后立即跳转，并通过 `keepalive` 尽力触发该路径，不等待完整 vendor 预热。
- `GET ADMIN_PATH?setup=1` 的 `Index Source` 启动门只提供本地 `index.html` 上传；文件名必须是 `index.html`，上限 2 MiB，由 Worker 重新校验后写入 KV 并切换当前壳来源。
- 默认首屏调用 `getAdminBootstrap`。
- 当前 hash 为 `#settings` 时优先调用 `getSettingsBootstrap`。

### 手动重设与错误恢复

- 已认证用户可通过 `GET ADMIN_PATH?setup=1` 手动进入设置恢复页；兼容既有的 `setup=true`，错误页统一链接到 `setup=1`。
- 进入恢复页本身不调用 `saveConfig`，也不清空现有配置；页面只下发 `adminPath`，不下发完整配置对象或密钥。
- 本地 HTML 错误页只提供刷新和重新上传链接，不包含客户端配置回写脚本；`HEAD` 响应保持空 body。页面缓存语义见 [运行时架构](architecture.md#worker-cache-api)。

`GET /` 仍是静态说明页，不属于管理台实时视图。

## 主视图

| 视图 | 导航名称 | 职责 |
| --- | --- | --- |
| `#dashboard` | Dashboard | 仪表盘统计、运行状态、趋势图、D1 热点 |
| `#nodes` | Nodes | 节点列表、搜索筛选、编辑、导入导出、HEAD 测试 |
| `#server-records` | 服务器记录 | 按节点独立展示 Emby 运行状态、媒体库数量、上次观看与到期状态，并支持名称、标签和到期方式筛选；节点元数据写入 KV，最后观看时间写入 D1 |
| `#logs` | Logs | 日志查询、初始化 DB、清空日志 |
| `#dns` | DNS | DNS 草稿、Zone 预览、CNAME 历史、推荐域名、优选 IP 工作台 |
| `#settings` | Settings | 系统 UI、代理与网络、静态资源策略、安全防护、日志设置、监控告警、账号设置、备份与恢复 |

管理台保持现有 SaaS 控制台结构，不新增第二套首页。

Dashboard 的视频流量卡默认显示今日 CF Zone 总流量。卡片右上角的切换图标按需调用 `getMonthlyTrafficStats`，在今日与本月累计之间切换；本月数据不会随首屏自动加载，也不会刷新其他仪表盘卡片。月累计窗口按 `scheduleUtcOffsetMinutes` 从当月 1 日 00:00 计算到当前时刻，统计口径继续使用 Cloudflare `edgeResponseBytes`。浏览器只在返回月份仍为当前月份且查询成功时缓存该卡片，缓存最长 30 分钟；跨月、过期与失败结果必须重新查询，当前月份刷新失败时保留最近一次成功值但不得阻止后续重试。

Dashboard 先按需调用 `getDashboardCachedSnapshot` 应用已有快照，再在后台分别调用 `getDashboardCoreStats` 与 `getRuntimeStatus`；统计或 Cloudflare 查询失败不得覆盖仍可用的运行状态。D1 写入热点仅在启用该卡片并进入 Dashboard 时调用 `getDashboardD1WriteHotspot`，拥有独立的 loading/error 状态，不阻塞主状态与统计卡片。

### 交互一致性与可访问性

- 管理台的读取、刷新和回填遵循“最新用户意图优先”：当同一资源的新请求取代旧请求时，旧响应、旧错误和旧完成回调不得覆盖当前数据、loading 状态、焦点或成功提示。刷新期间保留最近一次可用数据；只有当前请求失败且没有可用数据时才展示空态错误。
- 服务器记录的普通读取可被用户明确发起的“刷新全部”取代；旧的普通读取完成后不得回写卡片或解除新刷新请求的 busy 状态。全量刷新开始后，先前单卡刷新返回的卡片和 `availableNodes` 也不得覆盖全量结果。全量刷新与单卡刷新分别维持自身 busy 状态，且不会触发 Dashboard 刷新。
- 会写入或导出敏感结果的前端动作必须在确认框出现到请求完成的整个周期内保持单操作在途。同一服务器记录不能重复保存或移除，影视资源版本聚合不能重复确认或提交；失败后必须恢复可操作状态，且不丢弃未保存的表单草稿。
- 服务器记录视图的异步摘要使用礼貌状态播报，记录网格在读取或全量刷新时标记为 busy。打开服务器记录弹窗时焦点进入首个可编辑控件；关闭、取消或完成保存后优先恢复到原触发控件，若该控件已被重绘则回退到“新增记录”。图标按钮必须保留可访问名称。

### 服务器记录

- 记录以 `nodeName` 为唯一主键并严格按节点隔离；不同节点即使 Emby `ServerId`、会话 ID 或上游地址相同也不得合并，不建立跨服用户映射。名称使用节点 `displayName || name`，访问地址沿用节点公开入口，Emby 返回的服务器名称只作为探测信息。
- 节点字段 `tags: string[]` 是标签真相源，最多 20 项、每项最多 24 字符；旧 `tag` 继续作为首项兼容镜像。`serverRecord.enabled` 控制是否出现在页面。到期功能由 `serverRecord.expiryEnabled` 显式启用，新记录默认关闭；旧记录未声明该字段但已有合法 `expiresAt` 时兼容为启用固定日期，其余记录按关闭处理。启用后由节点自己的 `serverRecord.expiryMode` 选择策略：`fixed` 保存可编辑的 `expiresAt`，不会随最后播放变化；`rolling` 保存 1 到 3650 的 `expiryDays`，按最后观看时间滚动计算日期。Worker 返回 `expiry.enabled`、`expiry.state`、`expiry.daysRemaining`、`expiry.expiresAt`、`expiry.source`、`expiry.mode` 与 `expiry.expiryDays`；前端只在启用且 Worker 返回可识别状态时展示预计到期日期和相对到期文案，状态缺失或畸形时只显示未设置状态和 Worker 返回的原始日期，不使用浏览器时间重新推导。移除记录只关闭 `enabled`，不删除节点或已有最后观看时间。
- `getServerRecordsSnapshot` 的普通读取只返回节点元数据、D1 已保存媒体计数、最后观看媒体指针与 Worker 到期计算，不请求 Emby。只有显式提交 `forceRefresh: true` 时 Worker 才使用节点自己的活动线路探测 Emby，并把成功或部分成功的计数持久化到 D1；部分成功的持久化统计以 `--` 表示本次未取得的指标，并明确标记为部分统计，不能显示旧值为最新值。凭据优先使用服务器记录专用账号，未设置时继承节点高级设置中的固定 Emby 账号。Worker 调用 `/Users/AuthenticateByName` 换取 isolate 内短期令牌后读取资源统计；专用或继承账号登录及后续详情请求不会携带节点代理 Token/Cookie，认证失败时不再请求三项媒体统计，也不会回退使用节点代理认证头。两处都未配置账号的旧节点继续兼容自定义认证头。可附带 `nodeName` 只刷新并保存该卡片，不附带时刷新并保存全部启用卡片。快照只向浏览器返回公开访问地址、解析后的资源统计账号、凭据来源标记、安全运行状态、媒体计数、保存/检查状态、最近媒体显示字段和同源 `posterUrl`；已认证管理台仅在用户点击服务器记录密码的显示按钮后调用 `getServerRecordCredential`，按节点下发有效密码供当前弹窗展示，不返回短期令牌、上游地址或认证头。运行状态与到期状态是两个独立维度。
- 媒体数分别请求 Emby 官方 [`GET /Items`](https://dev.emby.media/reference/RestAPI/ItemsService/getItems.html)，使用 `IncludeItemTypes=Movie|Series|Episode&Recursive=true&Limit=1` 并读取 `TotalRecordCount`；运行状态和线路选择只使用 [`GET /System/Ping`](https://dev.emby.media/reference/RestAPI/SystemService/getSystemPing.html)。[`GET /System/Info`](https://dev.emby.media/reference/RestAPI/SystemService/getSystemInfo.html) 仅补充版本与 ServerId，失败、无权限或响应中的维护/关机字段都不得改变 Ping 得出的状态。三项计数允许部分成功，手动刷新绕过 60 秒 isolate 缓存。
- 标签编辑器提供搜索、多选及自由输入；其下方的“资源统计”分组提供可选的 `EMBY账号` 与 `EMBY密码` 输入。打开弹窗时先查询并展示服务器记录专用账号；未设置专用账号时展示节点高级设置中的固定 Emby 账号，并继续在 Worker 内使用对应节点密码。已配置密码默认以 `********` 占位，用户点击显示按钮后才按需下发并在当前弹窗展示；显示最长 30 秒，关闭弹窗时必须立即清空 DOM 中的密码值并恢复隐藏状态。只查看后保存不会固化继承凭据或改写原密码。专用凭据按节点保存在 `serverRecordEmbyUsername` / `serverRecordEmbyPassword`；填写密码时账号必填，账号存在时密码允许为空，Worker 会按空密码登录；账号与密码都留空时保留旧节点使用自定义认证头的兼容路径。编辑同一专用账号时密码留空表示保持原值；修改账号且密码留空时清除原密码。继承节点凭据且表单未改动时不复制凭据，后续节点账号变更继续生效。普通设置与默认节点导出移除两项服务器记录凭据；经确认的完整备份会保留它们。到期区域先提供默认未勾选的“启用预计过期”复选框，勾选后再使用“固定日期 / 滚动天数”分段模式控件，并只显示当前模式对应的日期或天数输入。新增记录只能选择尚未启用的节点，选择节点后必须载入其现有标签、资源统计账号来源与完整到期策略，重新启用不得用空值覆盖保留配置。旧 `cf-emby-proxy-ui:server-records:v1` 本地记录按唯一节点名或访问地址迁移，无法唯一匹配的记录保留为“待关联”；人工关联允许选择已启用节点，并把旧标签合并到节点现有标签中。
- 上次观看仅由节点代理收到的 `POST /Sessions/Playing/Stopped` 更新，不累计时长。卡片同时显示该次 STOP 的媒体名称、剧集名和海报；媒体字段只来自代理流程已经有界缓冲的 body/query，指针缺失时保留时间但显示占位海报。海报通过登录鉴权的同源 Worker 路由加载，浏览器不直接访问 Emby，也不会取得 Emby Token；D1 写入与降级语义见 [运行时架构](architecture.md#服务器最后观看记录)。
- 服务器卡片采用 B2 横向双栏布局：顶部横排节点名称、标签、到期状态与单卡刷新；主体左侧使用独立的 `2:3` 标准海报容器完整显示上次观看海报，右侧依次展示上次观看媒体、三项资源统计与到期信息。海报不得拉伸、裁切或叠加渐变；卡片底部继续保留“编辑 / 运行状态 / 移除”的动作顺序。该布局只改变卡片展示，不改变编辑弹窗、字段或保存行为。
- 搜索栏右侧提供到期方式下拉筛选，选项为“全部到期方式”“滚动天数”和“固定日期”；筛选与名称、节点名、标签搜索叠加生效。“滚动天数”与“固定日期”只匹配已启用预计过期且采用对应模式的服务器记录，待关联旧记录只在未筛选到期方式时显示。
- “新增记录”旁的按钮以“刷新服务器状态并保存全部资源统计”为契约；每张卡片右上角另有只刷新当前节点并保存其统计的按钮。卡片底部固定为左侧编辑、中间运行状态机、右侧移除，不提供“打开服务器”动作；状态机在线时显示“服务器在线”，掉线时显示“服务器掉线”。两类刷新按钮分别维护全局和卡片 loading，不触发整页 Dashboard 刷新。进入页面、保存、移除或重新进入路由只从 D1 读取已保存统计和最后观看，不自动访问 Emby；卡片状态机在手动刷新前显示“未检测”。

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

“监控告警”提供新记录默认滚动天数 `serverRecordExpiryDays`、`tgServerExpiryWarningEnabled` 和 `tgServerExpiryWarningDays`。里程碑固定为 7、3、1、0 天，可逐项启用；预警总开关默认关闭。“账号设置”分区底部提供“影视海报来源”面板，用于保存、替换或移除 KV 中的 TMDB v3 API Key；IMDb 只显示为经 TMDB Find 解析的识别入口，不提供独立密钥字段。状态明确区分“KV 优先”“Worker Secret 兼容兜底”和“未配置”，移除 KV 密钥后必须按 Worker 返回的新状态提示兜底是否仍生效。

保存分组固定为五类：`ui`、`proxy`、`security`、`logs`、`account`。

### 影视资源版本聚合

- 设置页在主视频流快捷勾选附近提供“影视资源版本聚合”区。勾选的节点组成聚合池；保存动作调用 `saveMediaAggregationPolicyShortcuts`，原子保存池成员、全局默认 Emby 账号、匹配策略、首结果等待和宽恕期。接口字段为 `matchMode`、`firstResultTimeoutMs`、`gracePeriodMs`，分别回显为 `mediaAggregationMatchMode`、`mediaAggregationFirstResultTimeoutMs`、`mediaAggregationGracePeriodMs`；请求缺少任一字段时保留旧值。节点编辑弹窗的高级设置提供节点固定账号/密码，节点凭据优先于全局凭据；关闭节点凭据后回退全局。
- 快捷保存把新勾选且尚未处于 `rewrite` 的节点标记为 `mediaAggregationManagedRewrite: true`。取消勾选时仅自动管理的节点恢复 `inherit` 并清除标记；已经由用户手工设为 `rewrite` 的节点保持原值。旧节点缺少标记时按手工配置处理，普通节点编辑显式修改 `playbackInfoMode` 时也会清除自动管理所有权。
- 聚合节点选择器只允许勾选具备节点账号或全局账号的节点；节点与全局密码均可留空，Worker 会按空密码登录。编辑同一账号时密码留空保持原值，修改账号且密码留空时清除原密码。账号密码属于敏感字段，普通设置与默认节点导出均脱敏；经确认的完整备份保留全局和节点聚合凭据。管理台敏感输入默认以 `********` 占位并提供显示/隐藏切换，切换仅影响当前浏览器输入控件。Worker 只在 isolate 内缓存短期令牌，不写入 KV/D1。至少选择两个节点才会产生聚合。
- Worker 在 `PlaybackInfo` 响应中按 TMDB → IMDb → 严格标题年份匹配池内其他节点并注入多版本；“仅强 ID”策略关闭标题兜底。默认首结果等待 1500 毫秒、命中后宽恕期 800 毫秒。首次冷请求可能只显示窗口内完成的版本，后台结果只影响后续请求。AGG2 MediaSource ID 在二次 `PlaybackInfo` 前校验签名、池成员和内容身份；失效时回退主服。备服故障不阻断主服版本响应。
- “双向同步播放进度”默认关闭；开启后保存 `mediaAggregationBidirectionalProgressEnabled: true`，主服照常记录，Worker 对携带聚合 MediaSourceId 的播放事件使用固定账号向备服静默镜像。镜像失败不向客户端报错。

### 域名前缀代理与 CNAME

- “域名前缀代理”设置卡片提供“默认 CNAME 指向”，对应 `saveConfig.config.defaultHostPrefixCnameTarget`；留空表示使用 `HOST`。
- 节点新建和编辑弹窗仅在入口模式为 `host_prefix` 时提供“CNAME 指向”，对应节点字段 `hostPrefixCnameTarget`；留空表示继承全局默认值。该入口模式不显示无效的访问密钥输入。
- 节点从 `host_prefix` 切换为 `kv_route` 时必须清空节点级 CNAME 字段，避免保存不可见、无效的覆盖值。
- CNAME 目标优先级固定为“节点指定 > 全局指定 > `HOST`”。管理台显示的节点访问链接仍使用 `<节点名>.<HOST>`，不得使用 CNAME 目标拼接 URL。
- 节点 `save`、`import`、编辑回显、节点导出以及完整备份保留 `hostPrefixCnameTarget`；设置导入导出和完整备份保留 `defaultHostPrefixCnameTarget`。全局值保存成功后，未设置节点级覆盖的现有子域节点应已完成 DNS 同步；失败时展示 Worker 返回的失败节点和回滚状态，不得显示为已保存。

### 设置写入与备份安全

- `previewConfig`、`saveConfig` 和 `importSettings` 共用字段清洗与完整校验链。预览必须执行本地 HTML 内部版本、Host Prefix CNAME、DNS 同步前置条件等正式保存校验，不得把预览成功但保存必然失败的配置交给用户确认。
- `saveConfig` 和 `importSettings` 必须有 KV binding；缺少 `ENI_KV`/兼容 KV binding 时返回 `KV_NOT_CONFIGURED`、HTTP `503`，不得以仅保存在 isolate 内存中的配置返回成功。
- 一次设置写入同时提交配置、配置 meta、设置快照、快照 meta 和遗留键删除，并在单 isolate 的 KV mutation chain 中串行。节点保存/导入、删除、主视频流快捷策略、影视资源版本聚合快捷策略和完整导入共用该链，后发写入等待前序索引提交或补偿完成。失败补偿只恢复仍等于本次写入结果的键；若检测到并发新值，返回 `KV_MUTATION_ROLLBACK_CONFLICT`、HTTP `409`，并通过 `rollbackConflicts`/`rollbackFailures` 说明未覆盖的新值或补偿失败。
- `importFull` 将导入前快照、配置和节点读取、DNS 计划、配置/节点提交及失败补偿作为同一个串行操作。节点阶段失败时先恢复节点和导入前 CNAME，再恢复旧配置及其 DNS；同 isolate 内后发设置保存必须等待导入完成，不能被旧快照覆盖。
- 双文件更新在本地 HTML 激活后才请求 Cloudflare 部署 Worker。部署失败时，回滚重新进入 KV mutation chain，只有当前 `indexUrl` 仍指向本次激活 revision 才恢复激活前的 `indexUrl`；其他并发保存字段必须从当前配置保留，较新的 HTML 已接管时跳过回滚并返回 `htmlRollbackSkipped`/`htmlRollbackReason`，不得写回更新开始时读取的整份旧配置或触发无关 Host Prefix DNS 补偿。
- `exportSettings` 默认移除 `cfApiToken`、`tgBotToken`、`tmdbApiKey`、`mediaAggregationEmbyUsername` 与 `mediaAggregationEmbyPassword`，返回 `secretsRedacted: true`、`containsSecrets: false`。完整设置导出必须同时提交 `includeSecrets: true` 和 `X-Admin-Confirm: exportSettings`；缺少确认头时返回 `CONFIRMATION_REQUIRED`、HTTP `428`，成功结果标记 `containsSecrets: true`。
- `exportConfig` 默认返回可安全交换的脱敏数据：移除 `tmdbApiKey`、全局与所有节点 Emby 凭据，并标记 `secretsRedacted: true`、`containsSecrets: false`。需要迁移凭据时，调用方必须同时提交 `includeEmbyCredentials: true` 与 `X-Admin-Confirm: exportConfig`；Worker 才返回全局 `mediaAggregationEmbyUsername` / `mediaAggregationEmbyPassword`，以及每个节点的 `mediaAggregationEmbyUsername` / `mediaAggregationEmbyPassword`、`serverRecordEmbyUsername` / `serverRecordEmbyPassword` 和对应配置标记。管理台完整备份固定使用该确认式路径，因此完整备份保留全部 Emby 凭据；节点工具栏同时提供默认脱敏导出和确认后的含 Emby 凭据导出。确认式 Emby 导出仍移除 `cfApiToken`、`tgBotToken` 和 `tmdbApiKey`，而 `includeSecrets: true` 与同一确认头才包含全部外部服务密钥。任何包含 Emby 凭据的响应均标记 `secretsRedacted: false`、`containsSecrets: true`。完整备份同时携带当前内容寻址 `index.html`，`importFull` 校验其 SHA-256 与配置版本一致后恢复。Worker 必须按加入 `action: importFull` 后的实际 UTF-8 JSON 字节数预检回导能力，并为前端 `meta` 等包装保留 64 KiB 余量；超过 12 MiB 管理请求上限的安全阈值时，`exportConfig` 返回 `FULL_BACKUP_TOO_LARGE`、HTTP `413`，不得下载一份自身无法恢复的完整备份。普通设置导出仍应调用 `exportSettings`。
- 默认脱敏的 settings 或完整备份，以及历史完整备份回导时，缺少 `cfApiToken`、`tgBotToken`、`tmdbApiKey` 或全局 `mediaAggregationEmbyUsername` / `mediaAggregationEmbyPassword` 表示保留当前凭据；确认式完整备份显式包含的服务密钥、全局/节点聚合和服务器记录凭据会参与恢复，显式空字符串表示清空。普通设置保存缺少 `tmdbApiKey` 时同样保留当前 KV 密钥；正式管理台日常新增、替换和移除统一随 `saveSettings("account") -> previewConfig -> saveConfig` 提交，密钥输入留空时不携带该字段，显式移除时携带空字符串。预览仅显示“新增 / 替换 / 移除 TMDB KV 密钥”，不得回显密钥值。旧版或人为脱敏的完整备份缺少节点凭据字段时保留当前节点值。配置快照及 KV 整理迁移快照只保存脱敏配置；恢复普通快照或整理迁移快照时同样沿用当前凭据。
- Worker 不保存也不消费 `dnsAutoUpload*`。正式模板、生成入口和 Vue 设置源均不得包含或展示这些设置；实现完整 scheduled 能力前不能用占位表单暗示功能已经生效。

### KV / D1 整理确认契约

- `previewTidyData` 的 KV 预览返回 `planHash`、HMAC 签名的 `planToken` 和 `planExpiresAt`。`tidyKvData` 必须携带该 `planToken`；Worker 在同一 mutation chain 中重新扫描并重建计划，只有当前哈希与已确认哈希一致才执行。
- 令牌缺失、格式错误、签名错误或 scope 不匹配返回 `TIDY_PLAN_INVALID`、HTTP `409`；令牌过期或预览后 KV 计划发生变化返回 `TIDY_PLAN_STALE`、HTTP `409`。管理台应提示用户重新预览，不得静默使用新计划继续整理。
- 主配置 `sys:theme`、任一 `node:*`、配置快照、节点索引或 KV key list 读取异常时，预览与执行均为零写入失败。分页缺少游标、重复游标或超过 1000 页返回 `KV_SCAN_INCOMPLETE`，不得把未完成扫描解释为完整键集合。
- 本地 HTML 内容键以当前配置和保留配置快照中的本地 revision 为引用根。配置提交使旧 revision 退出引用集时，必须在同一条件补偿 mutation 中删除对应 `sys:admin_index_upload:v1:<sha256>`；KV 整理还要列出并删除升级前已存在的未引用内容键，预览分组使用 `admin_index_uploads`。
- 旧 DNS IP 池源、OpsStatus 和 Telegram 状态键只有在 D1 通过运行时兼容检查后才进入删除计划。执行先把旧 payload 与 D1 当前值合并，D1 当前值优先；全部 D1 写入成功后才开始 KV mutation。D1 未就绪时预览把这些键列入 `d1_legacy_keys_pending` 保留组。
- 旧 OpsStatus 与 Telegram payload 必须是 plain object；DNS IP 来源必须是每项都有稳定 `id` 和有效目标且无重复 ID 的可规范化数组。任一遗留载荷异常时返回 `D1_LEGACY_PAYLOAD_INVALID`，不得先写 D1 或删除任何 KV 键。
- 预览配额按前向 put/delete 与最坏补偿 put/delete 合计；超过安全写入额度返回 `KV_TIDY_WRITE_LIMIT_EXCEEDED`、HTTP `409`。执行结果继续返回实际 `fieldGroups`、`deleteGroups`、`rewriteGroups`、`preserveGroups`，用于和确认计划对照。
- `previewTidyData(scope: "d1")` 也返回 HMAC 签名计划。若 `requiresSchemaInitialization` 为真，响应不得包含可执行 `planToken`；管理台先单独确认并执行统一“初始化 DB”，展示初始化结果，再重新预览并进行第二次删除确认。只有第二次预览的令牌可提交给 `tidyD1Data`。
- D1 执行会按预览令牌中的固定时间窗口复算结构、计数与数据计划。令牌无效、过期、初始化后未重新预览或期间数据变化时，管理台提示重新预览，不能自动接受新计划继续删除。

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
- `getDashboardCoreStats`
- `getDashboardCachedSnapshot`
- `getDashboardD1WriteHotspot`
- `getMonthlyTrafficStats`
- `getRuntimeStatus`

### 配置、备份与整理

- `loadConfig`
- `previewConfig`
- `previewTidyData`
- `saveConfig`
- `savePosterMetadataSettings`（仅供旧版管理台兼容；正式前端不再调用）
- `uploadAdminIndex`
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
- `updateWorkerAndAdminIndex`
- `purgeCache`

### 节点

- `list`
- `getNode`
- `save`
- `import`
- `delete`
- `pingNode`
- `saveMainVideoStreamPolicyShortcuts`
- `getServerRecordsSnapshot`
- `getServerRecordCredential`
- `saveServerRecordSettings`

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

设置页“保存 DNS 设置”同时保存当前 DNS 配置与发生变化的优选源草稿。只有优选源变化时不重复写入主配置；优选源未变化时不调用 `saveDnsIpPoolSources`，避免无意义地改写 D1 和推进 DNS IP revision。任一保存失败时不得显示整体成功；若主配置已保存但优选源失败，前端应用已持久化的配置、保留优选源草稿供重试，并明确提示部分成功。
- `fillDnsDraftFromIpPool`

### 日志与告警

- `getLogs`
- `clearLogs`
- `getD1SchemaStatus`
- `getD1TimeTravelBookmark`
- `initLogsDb`
- `initLogsFts`
- `initD1Schema`
- `testTelegram`
- `sendDailyReport`
- `sendPredictedAlert`
- `saveMediaAggregationPolicyShortcuts`

`sendDailyReport` 的综合日报在今日 CF Zone 总流量后追加本月累计流量；月累计与 Dashboard 本月流量卡复用同一统计口径和缓存链。

管理台日志页提供“初始化 DB”和“获取 Bookmark”。`getD1TimeTravelBookmark` 只通过 D1 Sessions `first-primary` 读探针取得当前 Time Travel bookmark，前端展示并尝试复制，不执行 DDL/DML。“初始化 DB”调用 `initLogsDb`：先只读预检同名表关键约束及迁移表契约，再在任何写入前取得 bookmark；获取失败时零写入。随后完成缺表创建、已知列补齐、命名索引修复、退役索引清理、异常 FTS 重建和结构复检，最后幂等采纳缺失的 0001–0006 migration 基线。结果弹窗展示最终状态、自动调整、`adoptedMigrations` 和初始化前 bookmark。`getD1SchemaStatus`、`initD1Schema`、`initLogsFts` 保留为 API 兼容动作，但不再追加第二套 schema 操作按钮。

`getD1SchemaStatus` 每次显式检查都重新读取 `sqlite_master` 与 PRAGMA，核对完整必需列、运行时 upsert 依赖的主键/唯一键、命名索引所属表与键列顺序、合法 `d1_migrations`，以及 FTS5 content binding 和插入触发器字段映射，返回 `runtimeCompatibilityVersion`、`runtimeCompatibilityReady`、`appliedMigrations`、`latestRequiredMigration`、`missingMigrations`、`migrationReady`、`schemaVersion`、表/列/索引/约束/FTS readiness、`autoRepairPolicy` 和 `issues`。只有六个要求的 migration 已记录且结构校验通过时 `schemaVersion` 才为 `8`。`migration_table_missing` 与 `missing_migration:*` 表示数据库结构可能已兼容但尚未完成受控基线采纳；点击“初始化 DB”即可在 bookmark 保护下处理。`migration_table_invalid` 不自动修复，必须先人工核对。手动、scheduled 与底层 tidy 仍执行同一兼容门禁，结构不兼容时不得开始删除。

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
- 静态资源策略不展示发布源、Release 或 `INDEX_URL` 配置，保存按钮文案固定为“保存静态资源策略”。备份与恢复中的“Worker 和 HTML 更新”必须同时选择 `worker.js` 与 `index.html`，任一缺失、文件名错误或超出上限时禁用提交；后端动作继续执行同样的双文件强制校验。
- 默认“导出全局设置”和默认节点导出必须明确使用脱敏响应；节点工具栏另提供“导出含 Emby 凭据”，完整备份也必须在下载前确认，二者都通过 `X-Admin-Confirm: exportConfig` 取得凭据。专家模式才显示“导出含密钥设置”，并在请求前进行敏感操作确认。普通管理响应中的 TMDB 状态只包含是否配置及 `kv_config` / `worker_secret` / `none` 来源，不包含密钥；“影视海报来源”是“账号设置”的最后一个设置面板，其下方保留独立的账号设置整体保存栏，统一执行预览、确认和 `saveConfig`，不得把整体保存按钮放进海报面板。日志页所有模式都使用“初始化 DB”和只读“获取 Bookmark”，不再按专家模式追加其他 schema 动作按钮。
- 视频流量卡的今日/本月切换由正式 runtime enhancement 挂载，使用 Lucide `repeat-2` 图标、固定点击区域和加载态；月统计只在用户首次切换时请求，切回今日直接恢复当前仪表盘快照。
- 服务器记录页由正式 runtime enhancement 挂载在日志页之前；卡片数据来自 `getServerRecordsSnapshot`，编辑只提交节点、标签、到期功能开关与到期策略，不提供运行状态、媒体数量、名称、地址或上次观看的手工输入。
- `App.vue`、`src/features/*`、`src/composables/*` 不是当前首屏启动链。
- 不把 `banker/.admin-ui.html` 或构建副本当作正式模板。
- `check-cdn-paths.mjs` 必须按标签语义检查 `script[src]`、stylesheet/modulepreload 和 script/style preload/prefetch，覆盖单双引号、协议相对写法与无扩展 URL；同时检查占位符清空、`admin-bootstrap`、`#app`、禁止 importmap、任何 inline 动态 `import()`、禁止 `dist/assets/**`，并确认 `dist/index.html` 与同步后的 `index.html` 字节一致。
