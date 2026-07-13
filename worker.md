# Repository Runtime Guide

版本：13.2

默认语言：中文

## 用途

本文件是仓库运行时治理入口，只保留当前基线、核心约束和文档导航。具体契约由 `docs/` 下的专题文档维护。

正式代码与治理真相源：

- `worker.js`：Cloudflare Worker 单入口、API、代理、鉴权、KV/D1、日志与 scheduled 任务。
- `frontend/`：管理台模板、同步脚本、唯一入口和 Vite 构建。
- `worker.md`：核心约束与阅读入口。
- `docs/`：按职责拆分的详细契约。

历史对比目录、临时迁移目录和构建副本不是正式工程路径。

## 文档导航

| 文档 | 负责内容 |
| --- | --- |
| [运行时架构](docs/architecture.md) | Worker 壳、路由职责、运行时绑定、缓存和资源代理 |
| [管理台契约](docs/admin-console.md) | 管理台入口、主视图、动作目录、设置页和前端同步链 |
| [开发与验证](docs/development.md) | 任务分类、开发顺序、本地调试、验证和交付要求 |
| [构建与发布](docs/release.md) | 固定 GitHub Release 源、资产 URL、构建产物和发布门禁 |

任务阅读顺序由 [AGENTS.md](AGENTS.md) 规定。

## 当前基线

系统采用 `Worker Shell + frontend admin runtime sync + GitHub Release-only + Worker vendor proxy + Cache API SWR`：

- `GET /` 返回静态说明页。
- `GET ADMIN_PATH` 由 Worker 从 GitHub Release 拉取并返回唯一管理台入口 `index.html`。
- `POST ADMIN_PATH/login` 与 `POST ADMIN_PATH` 保持既有登录和管理 API 契约，细节见 [管理台契约](docs/admin-console.md)。
- 浏览器使用 Worker 同源 vendor 路径加载依赖；Worker 负责源站重写和 Cache API 缓冲。
- Emby 节点代理只承载 API、WebSocket 与媒体请求，不反代 `/web` 子树；该边界不影响管理台 `/admin` 的资源交付。
- 前端开发和构建先把 `frontend/admin-runtime.template.html` 与显式 runtime enhancements 确定性组合为 `frontend/index.html`。

## 核心约束

1. 保持 `worker.js` 单入口和 JSDoc 风格。没有明确批准，不迁移为全量 TypeScript 或多 Worker 架构。
2. 不把完整前端运行时代码重新内嵌进 `worker.js`；Worker 只保留壳、后端能力和极小降级内容。
3. `frontend/index.html` 是唯一管理台入口，不新增第二套首页或替代入口。
4. 管理台保持现有 SaaS 控制台信息架构。未经批准，不改成官网、内容站、文档页或另一套管理台。
5. 浏览器不得直连 GitHub Release、raw GitHub 或相对 bundle 资源。远端壳按标签语义识别 JS/CSS（包括无扩展脚本）并改写为 Worker 同源 vendor 路径；禁止源判断先规范化绝对 URL，协议相对及尾点主机名写法不得绕过。正式壳不接受 importmap 或任何 inline 动态 `import()`。
6. 前端更新由请求触发，不依赖 `scheduled()` 或 CRON。
7. 浏览器缓存和 Worker Cache API 是两层独立缓存，不得混为一谈。
8. 不破坏现有鉴权、代理、KV/D1、日志和 scheduled 语义，除非任务明确要求。
9. `prompts/`、`banker/` 和历史对比文件只可用于比对，不进入正式构建或发布链。
10. 正式发布源固定为 `axuitomo/CF-EMBY-PROXY-UI`，正式版本只认 GitHub Release。
11. 不在仓库内创建或维护 wiki、知识库镜像及额外文档站点；管理台可以引用外部 WIKI 教程入口。
12. D1 schema 变更以根 `migrations/` 的 Wrangler 版本化迁移为真相源；`worker.js` 中的运行时建表与补列只承担旧库兼容和首次启动兜底，不得替代正式迁移流程。

## 默认工作上下文

处理前端任务时，以 `frontend/admin-runtime.template.html + frontend/scripts/admin-runtime-enhancements.mjs -> frontend/index.html` 组合链为准。`App.vue`、`src/features/*` 和 `src/composables/*` 仍在仓库中，但不是当前正式管理台首屏入口。

处理 Worker 或发布任务时，先判断改动属于 Worker 壳、API/代理、缓存交付还是构建发布，再按 `AGENTS.md` 读取对应专题文档。涉及 Cloudflare Cache API、`ctx.waitUntil()`、Request/Response 或兼容性标志时，先核对 Cloudflare 官方文档。
