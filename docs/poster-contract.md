# 服务器记录海报重构契约

## 状态

本文是已实现的服务器记录海报契约。当前运行时、migration 和回归均以本文为海报边界的单一真相源。

本文是服务器记录海报重构的单一真相源。管理台布局与动作入口见 [管理台契约](admin-console.md)，实施和发布门禁见 [开发与验证](development.md)。

## 范围与边界

- 只覆盖“服务器记录”卡片中的最近观看海报，不扩展到其他管理台页面或 Emby `/web`。
- 节点代理透传不干预海报。播放写入、scheduled、普通服务器记录读取和普通刷新都不解析、获取或预取海报。
- 播放透传只被动记录请求或已有响应中可确认的 `ItemId`、媒体类型、系列名或电影名、原始名称、年份和观看时间；不得为海报额外请求 Emby。
- 剧集使用系列名称，电影使用电影名称。`ItemId` 可以保存和参与浏览器缓存身份，但不参与供应商搜索或候选匹配。
- 缺少名称或媒体类型时不使用 `ItemId` 主动补读，直接进入占位图状态。年份缺失时允许按唯一名称和类型精确匹配。

## Worker 与浏览器职责

- `getServerRecordsSnapshot` 的海报输入为 `posterSearch`：`itemId`、`mediaType`、`title`、`originalTitle`、`year`、`watchedAt`。响应不包含 `posterUrl` 或供应商 ID。
- 只有已登录的浏览器在海报卡片进入可视区域后才开始解析。前端使用原生 `IntersectionObserver`，同时最多处理 16 张海报。
- 搜索请求与图片请求各自最长 8 秒。卡片移除、离开服务器记录页面或退出登录时取消未完成请求。
- Worker 不搜索供应商、不获取图片、不转发图片字节。浏览器通过 CORS 直接请求供应商 API 和图片，并在本地校验后创建 Blob URL。
- 新增已登录动作 `getPosterBrowserConfig`。该响应使用 `Cache-Control: no-store`，只在首次需要解析海报时返回浏览器专用配置。

## 浏览器凭据

- 管理台保存字段为 `tmdbBrowserToken`、`doubanBrowserOrigin`、`doubanBrowserToken`；同名用途的 `TMDB_BROWSER_TOKEN`、`DOUBAN_BROWSER_ORIGIN`、`DOUBAN_BROWSER_TOKEN` binding 作为逐项备用。管理台值非空时优先，清空后自动回退 binding；两处都缺少时只禁用对应供应商。
- TMDB 使用支持 `Authorization` 请求头的 API Read Access Token；保存时允许用户粘贴一次可选的 `Bearer ` 前缀并将其移除。32 位 v3 API Key 只适用于 `api_key` 查询参数，本链路明确拒绝将其保存或作为 Bearer Token 发送；豆瓣使用 Bearer Token。管理台值保存在 Worker KV，按需下发后只驻留当前页面内存；Token 不写入 URL、`localStorage`、D1、快照、导出、日志、错误文案或遥测。
- 已登录用户可以通过浏览器开发者工具读取和复制这些浏览器凭据；这是本契约明确接受的信任边界。现有服务端 `TMDB_API_KEY`、KV `tmdbApiKey` 和 `DOUBAN_SCRAPER_TOKEN` 不得下发或复用。
- TMDB、豆瓣解析接口和图片接口必须允许管理台来源的 CORS。CORS、网络或浏览器安全策略阻止读取时按供应商失败处理。
- 管理台允许保存三个浏览器字段并显示当前来源是管理台还是 Cloudflare Dashboard；Token 不明文回显，设置 bootstrap、快照和导出不返回 Token。旧 `TMDB_API_KEY`、`DOUBAN_SCRAPER_ORIGIN` 和 `DOUBAN_SCRAPER_TOKEN` 不再参与海报运行时。

## 名称与匹配

- 搜索优先使用中文名称，无结果后再使用原始名称；不拆词、不删除词语、不做相似度或模糊匹配。
- 精确比较前只执行 Unicode NFKC、首尾清理、连续空白合并和拉丁字母大小写归一。
- 有年份时要求规范化名称、媒体类型和年份全部一致。无年份时只接受唯一的名称与类型精确匹配；多个精确候选视为歧义。
- 电影年份来自上映日期，剧集年份来自首播日期。供应商缺少可验证年份时不能满足带年份的搜索。

## TMDB

- TMDB 是第一供应商。电影调用 `/3/search/movie`，剧集调用 `/3/search/tv`，固定 `language=zh-CN`、`include_adult=true`。
- 有年份时分别提交 `year` 或 `first_air_date_year`。每个名称只检查响应中的前 3 项候选。
- 匹配阶段只读取候选名称、原始名称、媒体类型、上映或首播日期和 `poster_path`；不保存 TMDB ID。
- 没有 `poster_path` 的精确候选继续检查。存在多个带海报的精确候选时仍按歧义失败，不按热度擅自选择。
- 选定后只缓存 `poster_path`。图片固定从 TMDB 官方 HTTPS 图片 origin 获取，尺寸固定为 `w500`。
- TMDB 无有效匹配，或匹配后的图片获取、大小、MIME、签名校验失败时，继续豆瓣流程。

## 豆瓣

- 豆瓣是 TMDB 失败后的备用供应商，可在独立服务内部执行复杂匹配。
- 浏览器向 `DOUBAN_BROWSER_ORIGIN` 的 `/v1/posters/resolve` 提交媒体类型、名称、原始名称和年份，再通过 `/v1/posters/<subjectId>` 取图。
- resolve 返回的 subject ID 可用于当次取图并写入浏览器缓存，但不得写入 Worker 的观看记录或 D1。
- 豆瓣图片保留服务返回的原始分辨率，并继续受统一大小、格式、签名和重定向门禁约束。

## 网络与图片校验

- TMDB API 与图片只允许官方 HTTPS origin；豆瓣只允许配置的 `DOUBAN_BROWSER_ORIGIN`。所有请求使用 `redirect: "error"`。
- 图片上限为 5 MiB，只接受 JPEG、PNG、WebP、AVIF 和 GIF；必须同时校验响应 MIME 与文件签名。
- 校验通过后才创建 Blob URL。海报替换、卡片移除、离开页面或退出登录时立即调用 `URL.revokeObjectURL()`。
- 无结果、歧义、认证失败、CORS、限流、超时、重定向、响应超限、MIME 或签名错误都不能回退 Emby 图片。

## 浏览器缓存

- 缓存使用版本化 `localStorage` 键 `server-record-poster:v1`。新版首次运行时删除旧版浏览器海报缓存。
- 搜索字段组合包含媒体类型、规范化名称、原始名称、年份和允许参与身份的 `ItemId`；浏览器使用 Web Crypto SHA-256 生成实际缓存键，不把这些原始字段直接用作键。
- 单条缓存可保存 `ItemId`、搜索指纹、供应商、TMDB `poster_path` 或豆瓣 subject ID、成功或失败状态、过期时间和最近访问时间；不得保存任何凭据。
- 最多保留 256 项，按最近访问时间淘汰。成功结果缓存 7 天，最终失败结果缓存 30 分钟。
- 普通加载复用成功和失败缓存。手动单卡或全部刷新绕过失败缓存，但仍复用未过期的成功缓存；刷新本身不预取不可见卡片。
- 缓存的 TMDB 路径或豆瓣 subject 取图失败时，本次请求将其视为供应商失败并继续回退；不得在同一次解析中重复请求同一失败资源。

## 展示与诊断

- 卡片进入可视区后先显示加载占位，成功后替换为 `2:3` 海报；失败显示固定占位图。
- 占位图区域显示供应商和简短错误原因，浏览器控制台输出同一份脱敏结构。不得显示凭据、请求头、完整 URL 或响应正文。
- 错误状态固定区分：缺少元数据、未配置凭据、认证失败、CORS、超时、限流、无结果、歧义、重定向、响应超限、MIME 错误和签名错误。
- 失败缓存仍有效时，重新进入页面不重复输出同一错误。加载与失败状态必须提供可访问名称和礼貌状态播报。

## 删除旧 Worker 与存储契约

- 删除 Worker 海报解析、供应商调用、D1 海报缓存和图片转发路径。旧前端请求已删除的同源海报路由时返回普通 `404`，不提供兼容转发。
- 删除账号设置中的旧 TMDB API Key 输入、预览和保存流程，并删除兼容动作 `savePosterMetadataSettings`。现有 KV `tmdbApiKey` 在配置保存或 KV 整理时直接清除，不进入备份。
- 节点改名、删除、KV/D1 整理和 scheduled 不再维护海报缓存记录。
- 历史 `0006_server_record_poster_cache.sql` 和 `0008_server_record_poster_douban.sql` 作为已发布 migration 账本保留；新增 `0009_drop_server_record_poster_cache.sql`，执行 `DROP TABLE IF EXISTS server_record_poster_cache`，目标 D1 schema 为 v11。
- `initLogsDb` 在取得 Time Travel bookmark 后执行并登记 0009；删除失败时不得登记 migration 或报告 schema v11 就绪。
- D1 整理可以幂等删除该表且不迁移、不备份海报缓存数据。KV 整理只删除已知的废弃海报 KV 键，不跨边界操作 D1。

## 实现门禁

自动化至少覆盖：

- 电影名、系列名、原始名称、年份、类型和缺失元数据规则。
- 中文名称到原始名称回退、TMDB 到豆瓣回退、成人内容和最多 3 页候选。
- 唯一精确匹配、歧义拒绝、无海报候选和 TMDB 图片失败后继续豆瓣。
- 浏览器 16 路并发、8 秒超时、取消、CORS 和禁止重定向。
- 图片 5 MiB 上限、允许格式、MIME 与文件签名双重校验。
- 7 天成功缓存、30 分钟失败缓存、256 项淘汰、SHA-256 键、手动刷新和旧缓存清理。
- 管理台 Token 只保存在 KV 与按需下发后的页面内存，bootstrap、快照、导出和诊断不泄露敏感内容。
- Blob URL 释放、加载与错误可访问状态、占位图和供应商错误详情。
- Worker 海报路由、解析器、旧设置动作及 D1 读写删除。
- 0009 在新库、v10 旧库、重复初始化和 D1 整理中幂等删除表，bookmark 失败时零写入。

修改该链路后至少运行 [开发与验证](development.md#验证) 规定的统一检查、Worker 聚焦回归和正式前端构建。
