# 官网 Docker 化：nginx 入口（TLS 终止 + 证书轮换）+ compose 编排

## Goal

官网在保留现有 **Vercel 部署通道**的前提下，**新增自托管通道**：`docker compose up -d`
一条命令拉起 Nuxt/Nitro 生产镜像（web）+ nginx 入口（TLS 终止、证书自动签发/续期/reload）
+ ACME 自动化组件。两条通道**并存**（同一份应用代码、同一套环境变量语义），**域名分工固定**：
自托管（Docker）＝ `kaup-ai.com`（+ `www.`），Vercel ＝ `kaup.ai`（+ `www.`）；
入口机制与 `kaup-core/infra/domestic` 同源，运维心智不分裂。

## Requirements

- **R1 生产镜像**：多阶段 Dockerfile 构建 Nuxt 4（Nitro node-server）运行时镜像；非 root 运行；
  镜像内只有运行所需产物（`.output`），不含源码、依赖目录与构建工具。
- **R2 nginx 入口 + TLS 终止**：`nginxproxy/nginx-proxy` 承担 443 TLS 终止、安全响应头、限流、
  `X-Request-Id`、结构化访问日志；路由显式落在自管 conf（不依赖 `VIRTUAL_HOST` 标签）。
- **R3 证书轮换**：`nginxproxy/acme-companion`（内置 acme.sh）负责首签 + 到期自动续期 + reload nginx；
  证书落持久化卷（不进镜像层，容器重建不重签）。HTTP-01 为默认档，DNS-01 为可选档。
- **R4 compose 编排**：`docker-compose.yml` 一条命令起 web + nginx + acme；
  `docker-compose.dev.yml` 提供本地档（非 80/443 端口、可选自签证书、不签发公共 CA）。
- **R5 配置与密钥不入仓**：域名/邮箱/ACME 凭证/飞书密钥均经 `.env` 注入，提供 `.env.example`；
  ACME 与 DNS 凭证不得进入 web 容器环境。
- **R6 可验证**：渲染后的 conf 能被真实 nginx 加载；SSL 终止与「换证书 + reload 即生效」有可复跑判据；
  容器与入口都有健康检查。
- **R7 应用行为不变**：`/api/contact` 的客户端 IP 判定（`x-real-ip` → `x-forwarded-for` 末段）
  在入口之后仍取真实客户端 IP；既有 301 路由与静态产物行为不受影响。
- **R8 Vercel 通道不退化**：不改 `nuxt.config.ts` 与 `app/`、`server/` 代码；Vercel 项目设置与
  `.env.local` 不受影响；新增的 Dockerfile / compose 对 Vercel 构建为惰性文件（Vercel 走 Nuxt preset，
  不读根 Dockerfile）。两条通道的环境变量差异有清单可依。
- **R9 域名分工**：自托管档的 `ENTRY_HOST` 默认 `kaup-ai.com`（附加域 `www.kaup-ai.com`），
  证书与 vhost 均围绕该域名；自托管档不得绑到 `kaup.ai`。
- **R10 站点 URL 可配置**：canonical / `og:url` / JSON-LD 与 `robots.txt`、`sitemap.xml`、`llms.txt` 的绝对 URL
  收敛到单一变量 `NUXT_PUBLIC_SITE_URL`，两条通道各自"自引用"；应用侧不得再出现硬编码域名。

## Acceptance Criteria

- [ ] AC1 `docker build` 成功产出镜像，容器内以非 root 用户运行 Nitro 并监听 3000。
- [ ] AC2 `docker compose config` 在提供 `.env` 后可解析（含与 `docker-compose.dev.yml` 的组合档）。
- [ ] AC3 入口渲染出的 conf 通过 `nginx -t`；`/`、`/_nuxt/`、`/entry-health`、`/api/contact` 行为符合设计。
- [ ] AC4 dev 档 `up -d` 后：`http://127.0.0.1:8080/` 返回 200，`/api/contact` 返回 405 JSON。
- [ ] AC5 TLS 档（自签证书）`https://127.0.0.1:8443/` 握手成功且返回 200，证书按 SNI 出示。
- [ ] AC6 判据脚本证明「证书更换 + `nginx -s reload` ⇒ 服务端出示的证书指纹改变」。
- [ ] AC7 prod 档 80 端口 vhost 含 ACME 挑战 location + 301 跳 HTTPS；`/entry-health` 不经 web 即可 200。
- [ ] AC8 web 容器环境不含 ACME/DNS 凭证（只注入 `FEISHU_*` 与 `NITRO_*` / `NODE_ENV`）。
- [ ] AC9 Vercel 通道可继续部署：`nuxt.config.ts` / `app/` / `server/` 无改动，
  本地 `pnpm build` 仍产出与部署形态一致的 `.output`（node-server 与 vercel preset 由各自平台决定）。
- [ ] AC10 自托管档以 `kaup-ai.com` 起站：80 → 301 到 `https://kaup-ai.com/`，443 按 SNI 出示该域证书；
  新增文件中除说明性文字外不出现把自托管绑到 `kaup.ai` 的配置值。
- [ ] AC11 站点 URL 跟随 `NUXT_PUBLIC_SITE_URL`：以 `https://kaup-ai.com` 构建时，
  预渲染产物的 canonical / og:url / JSON-LD 与 robots、sitemap、llms.txt 全为 `kaup-ai.com`；
  不设该变量时全部回退 `kaup.ai`（Vercel 通道不退化）。`app/` 内不得残留硬编码绝对站点 URL。
  同一变量还决定**商务邮箱域名**（`sales@kaup-ai.com` / `sales@kaup.ai`），
  覆盖页脚、联系页、JSON-LD、`/api/contact` 报错文案与 llms.txt。

## Notes

- 机制对齐 `kaup-core/infra/domestic`（同镜像形态、同 conf 渲染机制、同续期-reload 机制）；
  差异项（挑战类型默认值、站点化 location）与理由见 `design.md`，运维手册见 `nginx/README.md`。
- 真实公网签发/续期属部署面动作（需域名解析 + 80/443 可达），本任务只交付可部署物 + 本地可复跑判据。
- **双通道边界**：同一时刻同一域名只能由一条通道解析（DNS 决定）；本任务不在代码层引入
  "仅自托管可用"的分支，任何新能力都需两条通道各自可验证。
- **站点 URL 可配置（已实现，见 R10 / AC11）**：`shared/utils/site-url.ts` 为唯一来源；
  `public/robots.txt`、`public/sitemap.xml` 改成 `server/routes/robots.txt.ts`、
  `server/routes/sitemap.xml.ts`，`public/llms.txt` 改走 `server/assets/llms.txt` +
  `server/routes/llms.txt.ts`；三者均由 `nitro.prerender.routes` 预渲染成静态文件。
  因页面预渲染，该值在**构建期**定稿（自托管 `Dockerfile` ARG 默认 `https://kaup-ai.com`；
  Vercel 取 `nuxt.config.ts` 默认 `https://kaup.ai`）。
