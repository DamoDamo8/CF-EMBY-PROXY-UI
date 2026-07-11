# 构建与发布

## 范围

本文负责固定发布源、Release 资产、URL 推导、构建产物和推送门禁。运行时缓存语义见 [运行时架构](architecture.md)。

## 发布模型

- 正式发布仓库固定为 `axuitomo/CF-EMBY-PROXY-UI`。
- `releaseRepo` 只保留为固定仓库的兼容镜像字段，不能用来选择其他仓库。
- 正式版本只认 GitHub Release，唯一版本锚点是 `releaseTag`。
- `releaseBranch` 只保留为 `target_commitish` 兼容镜像字段。
- `effectiveRef = releaseTag`。
- Release 顶层资产固定为 `index.html` 与 `worker.js`，不依赖 `dist/` 目录或额外资产包。
- `prompts/`、`banker/` 和历史构建副本不进入发布链。

## URL 推导

`getGithubReleaseSourceOptions` 返回：

- `repo`
- `releases[]`
- `selectedBranch`
- `selectedTag`
- `effectiveRef`
- `indexUrl`
- `workerSourceUrl`

两个资产 URL 必须由同一个 Release tag 派生：

```text
indexUrl = https://github.com/<repo>/releases/download/<releaseTag>/index.html
workerSourceUrl = https://github.com/<repo>/releases/download/<releaseTag>/worker.js
```

Worker 壳使用解析后的 `indexUrl` 读取入口 HTML；内部 `workerSourceUrl` 指向同一 tag 的 `worker.js`。

`indexUrl` 的来源优先级是 Release tag 派生 URL、已保存的 `indexUrl`、Worker 环境变量 `INDEX_URL`。`WORKER_SOURCE_URL` 不是 Worker 运行时环境变量；发布校验脚本的命令行参数是 `--index-url` 和 `--worker-url`，对应的 CI 环境变量别名是 `INDEX_URL` 和 `WORKER_SOURCE_URL`。

固定仓库的 Release 列表默认匿名读取 GitHub API。遇到 `403` 或 `429` 时，为 Worker 配置 `GITHUB_TOKEN`；兼容旧名 `GITHUB_API_TOKEN`。请求必须携带明确的 `User-Agent`。

## 构建

正式前端构建读取 `frontend/admin-runtime.template.html` 与 `frontend/scripts/admin-runtime-enhancements.mjs`，确定性组合到 `frontend/index.html` 后再由 Vite 生成产物。

```bash
cd frontend && npm run build
cd frontend && npm run build:cdn
```

`build:cdn` 必须通过 `frontend/scripts/check-cdn-paths.mjs`，确认入口占位符、bootstrap、`#app` 和外部资源策略符合 Release-only + Worker proxy 约束。

### Release 资产来源

| Release 顶层资产 | 仓库来源 |
| --- | --- |
| `index.html` | `frontend/dist/index.html` |
| `worker.js` | 根 `worker.js` |

上传的是这两个文件本身，不是 `frontend/dist/` 目录。当前仓库没有创建 Release 或上传资产的自动化流程；发布工具或人工流程负责创建 tag/Release 并上传文件，本仓库脚本负责构建和发布前校验。

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
- 远端壳中的外部依赖可被 Worker 重写。

## Push 与 Release 门禁

1. 在推送具体 tag 或创建 Release 前完成构建与 URL 校验。
2. Release 中的 `index.html`、`worker.js` 与目标 tag 必须一致。
3. 任一 URL、ref 或构建引用不一致时停止发布。
4. 发布后按 [开发与验证](development.md) 的检查项验证 `/admin`、vendor 路径、缓存头和 stale 回退。
