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

## 实施顺序

跨边界工作默认按以下顺序推进：

1. 对齐正式路径和当前事实。
2. 收口前端入口与同步约定。
3. 核对 `/admin -> Release index.html -> Worker 壳返回` 契约。
4. 校准 Cache API SWR、vendor 路径和发布变量。
5. 完成本地调试与回归。
6. 最后处理 GitHub 发布。

只涉及单一边界的修改不必机械执行无关步骤。

## 本地调试

WSL 中优先使用 WSL 内的 `npx wrangler@latest`，不要依赖 Windows 全局 wrangler。

从 `.dev.vars.example` 创建根 `.dev.vars`，最小配置：

```dotenv
JWT_SECRET=<secret>
ADMIN_PASS=<password>
```

需要稳定读取固定仓库的分支或 Tag 时，可增加：

```dotenv
GITHUB_TOKEN=<token>
```

启动顺序：

```bash
cp .dev.vars.example .dev.vars
npx wrangler@latest dev --local --ip 127.0.0.1 --port 8787 --env-file .dev.vars
cd frontend && npm run dev
```

地址：

- WSL 前端：`http://127.0.0.1:5173`
- WSL Worker：`http://127.0.0.1:8787`
- Windows 浏览器：`http://localhost:5173`

`npm run dev` 会先运行管理台同步脚本，再由 `frontend/scripts/dev-server.mjs` 启动 Vite 并输出 WSL/Windows 访问提示。

## 验证

### 统一检查入口

`tests/` 保存自动化断言，`scripts/` 保存可执行工程工具。两者保持独立目录，通过以下只读入口统一执行常用提交前检查：

```bash
node scripts/check-project.mjs
```

该命令依次运行 Worker 语法检查、聚焦回归、管理台组合一致性、CDN 路径检查和 `git diff --check`。正式前端构建仍按下文单独执行，因为构建会改写 `frontend/dist/`。

### Worker

修改 `worker.js` 后至少运行：

```bash
node --check worker.js
```

涉及管理台防御边界、远端壳缓存、isolate 内存缓存或 OpsStatus 读取收口时，还要运行聚焦回归：

```bash
node --test tests/worker-defensive-boundaries.test.mjs
git diff --check
```

聚焦回归需要保持以下 I/O 边界：同代配置与节点 revision 并发刷新各只访问一次 KV；同节点、同失效代次的代理冷读取只访问一次节点实体，代理热节点和有效期内的短期负缓存不重复读取节点实体；一次完整 OpsStatus 聚合只读取一次 root 和每个 section 一次。并发节点摘要 upsert 必须合并而不丢项，索引重建必须串行覆盖实体加载与提交，旧 revision 候选不得覆盖当前 meta。节点 `/web` 子树必须在上游请求前固定拒绝，Playback relay、同节点重定向和 `__pb_abs` 回退不得绕过；同时不能误伤 `/websocket`、`/webhooks`、普通 API 或媒体路径。

高风险 Worker 修改还应覆盖对应的本地或预发 smoke、鉴权、代理、KV/D1、缓存头和 scheduled 回归。

### 正式前端

```bash
cd frontend && npm run build
cd frontend && npm run build:cdn
```

重点检查：

- `GET /` 仍返回静态说明页。
- `GET ADMIN_PATH` 只返回管理台壳和 Release `index.html`。
- 已认证的 `GET/HEAD ADMIN_PATH?setup=1` 返回 `no-store` 设置恢复页，`HEAD` body 为空。
- 浏览器侧依赖使用 `${ADMIN_PATH}/__release/<tag>/vendor/*` 同源路径。
- 上游引用符合不可变规则的 vendor 资源使用 `immutable`；可变或省略 jsDelivr GitHub ref 的资源使用 `no-store` 并跳过 Cache API。
- HTML 保留 `ETag` 或 `Last-Modified` 协商缓存。
- stale HTML 可在后台刷新。
- 已认证的 `GET/HEAD ${ADMIN_PATH}/__warm` 能完成 HTML、vendor manifest 与不可变 JS/CSS 预热，未认证请求不能触发上游加载。
- 同一 isolate 内并发冷 miss 只执行一次缓存复查、Release `index.html` 拉取和缓存提交，热命中不等待 OpsStatus 写入。
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
