# Repository AGENTS

## 作用范围

- 本文件约束仓库根目录及其所有子目录。
- 正式代码路径是根 `frontend/` 与根 `worker.js`。
- 正式治理入口是根 `worker.md`；详细契约位于 `docs/`。

## 文档牵引

开始任何任务前先读 `worker.md`，再按任务边界读取专题文档：

| 任务边界 | 必读文档 |
| --- | --- |
| Frontend App | `docs/admin-console.md`、`docs/development.md` |
| Worker Shell | `docs/architecture.md`、`docs/development.md` |
| Worker API / Proxy | `docs/architecture.md`、`docs/admin-console.md`、`docs/development.md` |
| Cache / Delivery | `docs/architecture.md`、`docs/release.md` |
| Build & Publish | `docs/release.md`、`docs/development.md` |
| Debug / Regression | `docs/development.md`，再读取与故障边界对应的专题文档 |

`worker.md` 中的核心约束始终生效。专题文档只在其职责范围内维护细节：

- `docs/architecture.md`：运行时拓扑、路由职责、绑定和两层缓存。
- `docs/admin-console.md`：管理台入口、视图、动作目录和前端同步契约。
- `docs/development.md`：任务分类、开发顺序、本地调试和验证。
- `docs/release.md`：固定发布源、Release 资产、URL 推导和发布门禁。

修改代码导致契约变化时，必须在同一任务中更新负责该事实的专题文档。不要在多份文档复制同一段规则；其他位置使用链接。代码与文档冲突时先查明原因并一起修正，不得静默选择其中一份。

## 正式路径约束

1. 远端正式代码树不再包含 `prompts/` 与 `banker/`。
2. 任何仍需参与正式发布链的脚本，必须位于根级正式目录，例如 `scripts/`、`frontend/scripts/`。
3. 发布源固定为 `axuitomo/CF-EMBY-PROXY-UI`；前后端都不再接受自定义 GitHub repo。
4. 不创建或维护 wiki、知识库镜像和额外文档站点。

## 强制校验

- 修改 `worker.js` 后至少运行：
  - `node --check worker.js`
- 涉及正式前端构建时必须运行：
  - `cd frontend && npm run build`
  - `cd frontend && npm run build:cdn`
- 推送标签或创建 Release 前还必须运行：
  - `node scripts/check-publish-cdn.mjs --repo axuitomo/CF-EMBY-PROXY-UI --ref <target-ref> --index-url <INDEX_URL> --worker-url <WORKER_SOURCE_URL>`

## Push / Publish 规则

1. 推送到具体标签或创建 Release 前，先根据目标 `ref` 推导 GitHub Release 资产链接。
2. 校验 `INDEX_URL`、`WORKER_SOURCE_URL`、`frontend/dist/index.html` 与构建产物引用。
3. 目标 Release 资产链接与构建产物不一致时，禁止继续推送或发布。

## 修改顺序

1. 读 `worker.md` 和任务对应的 `docs/` 专题文档。
2. 优先修改正式工程路径下的代码与脚本。
3. 同步更新负责该事实的专题文档。
4. 运行任务对应的校验。
5. 校验通过后再推送、打 tag 或发布。
