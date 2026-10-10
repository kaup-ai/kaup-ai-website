# Nuxt Landing Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Use this template to build your own landing page with [Nuxt UI](https://ui.nuxt.com) quickly.

- [Live demo](https://landing-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://landing-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/landing-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/landing-light.png">
    <img alt="Nuxt Landing Template" src="https://ui.nuxt.com/assets/templates/nuxt/landing-light.png">
  </picture>
</a>

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t ui/landing
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=landing&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Flanding&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Flanding-dark.png&demo-url=https%3A%2F%2Flanding-template.nuxt.dev%2F&demo-title=Nuxt%20Landing%20Template&demo-description=A%20modern%20landing%20page%20template%20powered%20by%20Nuxt%20Content.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## 部署（两条通道并存）

同一份代码支持两条部署通道，互不依赖，**域名分工固定**：
自托管（Docker）＝ `kaup-ai.com`，Vercel ＝ `kaup.ai`。

| 通道               | 域名          | 构建与运行                                          | 入口 / TLS                                             | 环境变量                          |
| ------------------ | ------------- | --------------------------------------------------- | ------------------------------------------------------ | --------------------------------- |
| **Vercel**（现有） | `kaup.ai`     | Vercel Nuxt preset；Git 推送自动部署                | Vercel 边缘                                            | Vercel 项目 Environment Variables |
| **自托管**（新增） | `kaup-ai.com` | GitHub Actions 构建镜像 → GHCR（私有）→ 服务器 pull | 本仓 nginx + acme-companion（TLS 终止 + 证书自动续期） | 根 `.env`（见 `.env.example`）    |

两条通道的差异只在部署物与变量注入方式，应用代码零分支：不新增"运行在哪个平台"的判断。
根 `Dockerfile` / `docker-compose*.yml` / `nginx/` / `scripts/` 对 Vercel 构建是惰性文件，不影响现有部署。

站点绝对 URL（页面 canonical / `og:url` / JSON-LD 与 `robots.txt`、`sitemap.xml`、`llms.txt`）来自单一变量
`NUXT_PUBLIC_SITE_URL`：自托管镜像已固化为 `https://kaup-ai.com`；Vercel 侧取 `nuxt.config.ts`
默认值 `https://kaup.ai`（也可在项目环境变量里显式设置）。两条通道因此各自"自引用"，
不会再出现"`kaup-ai.com` 的页面声明 `kaup.ai` 为规范地址"的串味。
**商务邮箱域名同样跟随该变量**（`sales@kaup-ai.com` / `sales@kaup.ai`），页面、页脚、JSON-LD、
表单报错与 `llms.txt` 无需二次配置。

### 自托管：起站

```bash
# 服务器：web 镜像来自 GHCR 私有包，先登录（token 在 GitHub 个人账号下生成，只勾 read:packages）
read -rsp 'GHCR PAT: ' GHCR_PAT && echo
echo "$GHCR_PAT" | docker login ghcr.io -u i0r3k --password-stdin
unset GHCR_PAT
cp .env.example .env      # 填 ENTRY_HOST / ACME_EMAIL（应用密钥可选，缺省时仅表单返回 500）
docker compose pull && docker compose up -d
```

镜像由 [.github/workflows/docker-image.yml](.github/workflows/docker-image.yml) 在每次推送到 `main` 时
构建并推送 `ghcr.io/kaup-ai/kaup-ai-website:latest`（同时留一个不可变 `sha-<commit>` tag 便于回滚）。
服务器只拉不构建；本地要构建用 `docker build -t ghcr.io/kaup-ai/kaup-ai-website:latest .`。

上线后自检（只读，逐项 PASS/FAIL）：

```bash
bash scripts/verify-prod.sh              # 服务器内视角
bash scripts/verify-prod.sh --external   # 加验外部视角（网络须能直连域名）
```

入口 nginx 的机制与 `kaup-core/infra/domestic` 同源：`nginxproxy/nginx-proxy` 做 TLS 终止/限流/安全头/
结构化日志，`nginxproxy/acme-companion`（内置 acme.sh）做签发、到期续期与 `nginx -s reload`，
证书落持久化卷（容器重建不重签）；conf 由 `envsubst` 白名单渲染 + 分层片段 `include`。

本地档（监听 8081，不签公共 CA）与 TLS/reload 判据：

```bash
# 本地 HTTP 档（web 镜像先按上一条 docker build 备好，或登录 GHCR 后 pull）
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
bash scripts/dev-tls-check.sh                                                  # TLS 终止 + 换证书 reload 判据
```

部署手册（按环境拆分）：

- 开发环境 → [docs/deploy-dev.md](docs/deploy-dev.md)（裸 `pnpm dev` 与三种本地容器档、判据脚本、冒烟清单）
- 生产环境 → [docs/deploy-prod.md](docs/deploy-prod.md)（前置条件、首次上线、发布/回滚、证书轮换、监控告警、安全清单）

入口的变量全表、conf 渲染机制、证书细节与排障见 [nginx/README.md](nginx/README.md)。

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
