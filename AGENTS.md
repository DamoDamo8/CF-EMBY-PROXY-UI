# Repository AGENTS

> 作用范围：仓库根目录及其所有子目录。本文件只保存始终生效的规则和按需阅读入口。

## 必读入口

- 开始任何任务前先读根 `worker.md`；其中的当前基线与核心约束始终生效。
- Worker 正式源码路径是根 `worker/`；根 `worker.js` 是由 Vite 生成并提交的唯一 Worker 发布产物，不得手工编辑。前端正式路径是根 `frontend/`。历史目录和其他构建副本只能用于比对。
- 参与正式发布链的脚本必须位于根级正式目录，例如 `scripts/`、`frontend/scripts/`。

## 任务路由

读完 `worker.md` 后，只读取当前任务边界对应的专题文档：

| 任务边界 | 必读文档 | 负责事实 |
| --- | --- | --- |
| Frontend App | `docs/admin-console.md`、`docs/development.md` | 管理台入口、视图、动作、同步链和前端验证 |
| Worker Shell | `docs/architecture.md`、`docs/development.md` | Worker 壳、路由、绑定和 Worker 验证 |
| Worker API / Proxy | `docs/architecture.md`、`docs/admin-console.md`、`docs/development.md` | API/代理语义、管理动作和回归 |
| Poster / Server Records | `docs/poster-contract.md`、`docs/admin-console.md`、`docs/development.md` | 海报目标契约、服务器记录展示和实施门禁 |
| Cache / Delivery | `docs/architecture.md`、`docs/release.md` | 两层缓存、资源交付和发布资产 |
| Build & Publish | `docs/release.md`、`docs/development.md` | 构建、固定发布源、URL 校验和发布门禁 |
| Debug / Regression | `docs/development.md`，再读故障边界对应的专题文档 | 调试、测试和相关运行契约 |

## 执行规则

1. 先在正式路径核对当前事实，再修改代码或脚本。
2. 代码改动导致契约变化时，同一任务只更新负责该事实的专题文档；其他文档使用链接，不复制规则。
3. 代码与文档冲突时查明原因并一起修正，不得静默选择其中一份。
4. 按 `docs/development.md` 运行任务验证；涉及发布时再执行 `docs/release.md` 的构建、URL 校验和门禁。
5. 所有要求的校验通过后，才能推送、打 tag 或创建 Release。

## 优先级

1. 用户当前明确要求。
2. 距离目标文件最近的 `AGENTS.md`。
3. 根 `worker.md` 的核心约束。
4. 当前任务对应的专题文档。
