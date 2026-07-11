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
- `fillDnsDraftFromIpPool`

### 日志与告警

- `getLogs`
- `clearLogs`
- `initLogsDb`
- `initLogsFts`
- `testTelegram`
- `sendDailyReport`
- `sendPredictedAlert`

## 正式前端约定

- `frontend/admin-runtime.template.html` 是管理台构建期模板。
- `frontend/scripts/admin-runtime-enhancements.mjs` 是管理台视觉与工具栏增强的显式构建输入。
- `frontend/scripts/sync-admin-runtime.mjs` 确定性组合模板、占位符和增强输入，生成唯一入口 `frontend/index.html`。
- `npm run dev`、`npm run build` 和 `npm run build:cdn` 都必须先执行同步。
- `frontend/index.html` 保留 Tailwind CDN、Vue global、Lucide UMD、Chart.js UMD、模板原始 style/script 顺序和 body class；增强内容固定追加在 `</head>` 前且只能出现一次。
- `App.vue`、`src/features/*`、`src/composables/*` 不是当前首屏启动链。
- 不把 `banker/.admin-ui.html` 或构建副本当作正式模板。
- `check-cdn-paths.mjs` 必须检查占位符清空、`admin-bootstrap`、`#app`、远端壳资源策略，并禁止 `dist/assets/**` 引用。
