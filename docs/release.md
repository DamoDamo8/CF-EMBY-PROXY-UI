# 构建与发布

## 范围

本文负责固定发布源、Release 资产、URL 推导、构建产物和推送门禁。运行时缓存语义见 [运行时架构](architecture.md)。

## 发布模型

- 正式发布仓库固定为 `axuitomo/CF-EMBY-PROXY-UI`。
- 正式发布版本以 GitHub Release tag 为锚点，但 `releaseRepo`、`releaseBranch`、`releaseTag` 不再是 Worker 运行时配置字段。
- 管理台启动门只接受本地 `index.html`；备份与恢复中的更新动作只接受同一批次的 `worker.js` 与 `index.html` 双文件上传，缺一不可。
- Worker 运行时不读取 Release 列表，不使用环境 `INDEX_URL`，也不从 GitHub 拉取管理台或 Worker 更新内容。
- Release 顶层资产固定为 `index.html` 与 `worker.js`，不依赖 `dist/` 目录或额外资产包。
- `prompts/`、`banker/` 和历史构建副本不进入发布链。

## 发布校验 URL

两个资产 URL 必须由同一个 Release tag 派生：

```text
indexUrl = https://github.com/<repo>/releases/download/<releaseTag>/index.html
workerSourceUrl = https://github.com/<repo>/releases/download/<releaseTag>/worker.js
```

这两个 URL 只属于发布前校验和 CI，不进入 Worker 运行时来源选择。发布校验脚本的命令行参数是 `--index-url` 和 `--worker-url`，对应的 CI 环境变量别名是 `INDEX_URL` 和 `WORKER_SOURCE_URL`。

## 构建

根 npm workspace 使用唯一的根 `package-lock.json`。Worker 构建从 `worker/index.js` 开始，以 ES2022、单 ES chunk、不压缩和 hidden source map 输出到 `.worker-dist/`，再原子更新根 `worker.js`。构建必须恰好产生一个入口 chunk且没有静态/动态外部 import；根生成产物必须提交 Git，但 `.worker-dist/` 和 source map 不进入 Release。

正式前端构建读取 `frontend/admin-runtime.template.html` 与 `frontend/scripts/admin-runtime-enhancements.mjs`，确定性组合到 `frontend/index.html` 后再由 Vite 生成产物。统一 Release 构建会先强制重建 Worker，再构建并检查前端 CDN 产物：

```powershell
npm ci
npm run check
npm run build:release
npm run check:worker-bundle
```

Windows PowerShell 环境要求见 [开发与验证](development.md#正式前端)。`build:release` 调用前端 `build:cdn`，后者必须通过 `frontend/scripts/check-cdn-paths.mjs`，确认入口占位符、bootstrap、`#app` 和外部资源策略符合顶层资产 + Worker proxy 约束。连续两次 Worker 构建必须字节一致，`check:worker-bundle` 会拒绝陈旧或手改的根产物。

### Release 资产来源

| Release 顶层资产 | 仓库来源 |
| --- | --- |
| `index.html` | `frontend/dist/index.html` |
| `worker.js` | 根 `worker.js` |

上传的是这两个文件本身，不是 `frontend/dist/`、`.worker-dist/` 或 source map。Wrangler 的 `main` 继续指向根 `worker.js`，其自定义 build command 会在 `wrangler dev/deploy` 前运行 `npm run build:worker`；Vite 不负责 Cloudflare 运行时模拟或部署。当前仓库没有创建 Release 或上传资产的自动化流程；发布工具或人工流程负责创建 tag/Release 并上传文件，本仓库脚本负责构建和发布前校验。

## 发布前校验

先根据目标 tag 推导 `INDEX_URL` 与 `WORKER_SOURCE_URL`，再运行：

```bash
node scripts/check-publish-cdn.mjs \
  --repo axuitomo/CF-EMBY-PROXY-UI \
  --ref <release-tag> \
  --index-url <INDEX_URL> \
  --worker-url <WORKER_SOURCE_URL>
```

校验必须覆盖：

- `INDEX_URL` 与目标 Release tag 一致。
- `WORKER_SOURCE_URL` 与同一 Release tag 一致。
- `frontend/dist/index.html` 的资源引用符合 Worker 同源代理策略。
- 构建产物不引用 `dist/assets/**` 或浏览器直连发布源的资源。
- 上传 HTML 中的 `script[src]`、stylesheet/modulepreload 和 script/style preload/prefetch 可被 Worker 重写，单双引号与无扩展 URL 均纳入检查。
- 正式 HTML 不含 importmap 或任何 inline 动态 `import()`；发布门禁与 Worker 上传门都拒绝无法安全改写的依赖形式。禁止源与 jsDelivr GitHub 可变 ref 在绝对 URL 规范化后判断，协议相对及尾点主机名写法不能绕过发布门禁。
- 发布检查先通过 `sync-admin-runtime.mjs --check`，并要求 `frontend/dist/index.html` 与同步后的 `frontend/index.html` 字节一致，陈旧 dist 不得发布。
- `npm run check:worker-bundle` 通过，根 `worker.js` 与 `worker/` 当前源码字节一致；动态导入产物后只暴露有效的默认 `{ fetch, scheduled }` 入口。
- `npx wrangler deploy --dry-run --outdir <temporary-dir>` 通过，并证明上传模型是单个 ESM Worker。

## Push 与 Release 门禁

1. 在推送具体 tag 或创建 Release 前执行 `npm run build:release`、统一检查、Worker freshness、Wrangler dry-run 与 URL 校验。
2. Release 中的 `index.html`、`worker.js` 与目标 tag 必须一致。
3. 任一 URL、ref 或构建引用不一致时停止发布。
4. 发布后如需部署到现有站点，使用“Worker 和 HTML 更新”同时上传该 Release 的两个顶层资产，再按 [开发与验证](development.md) 验证 `/admin`、vendor 路径、缓存头和 stale 回退。
