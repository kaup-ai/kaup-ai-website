# 技术设计：官网 nginx 入口与 compose 编排

## 机制（与 kaup-core 同源）

| 维度 | 取值 | 说明 |
|---|---|---|
| 入口镜像 | `nginxproxy/nginx-proxy:1.6` | 与 kaup-core domestic/overseas 同一镜像形态 |
| ACME 组件 | `nginxproxy/acme-companion:2.5` | 内置 acme.sh；签发/续期后自动 reload nginx |
| conf 机制 | `envsubst` 白名单渲染 + `include` 分层片段 | 模板挂在 conf.d 之外，渲染产物才进 conf.d |
| 证书存储 | 具名卷 `entry_certs`（`/etc/nginx/certs/<首域>/`） | 不进镜像层；容器重建不重签 |
| 续期-加载 | acme-companion 轮询到期 → 续签 → `nginx -s reload` | 无 certbot 式一次性 cron |
| 路由 | 自管 conf 的 `map $uri → 上游` | 不给 `VIRTUAL_HOST`，避免 docker-gen label vhost 与显式 conf 自环 |

## 分层文件

| 文件 | 渲染目标 | 职责 |
|---|---|---|
| `nginx/entry.conf.template` | `/etc/nginx/conf.d/entry.conf` | 同源骨架：限流区 / 路由 include / X-Request-Id / 日志格式 / 80 跳转 vhost / TLS server |
| `nginx/entry-routing.conf` | `/etc/nginx/entry-routing.conf` | `map $uri → $entry_upstream`（当前单上游，留扩展位） |
| `nginx/entry-location.conf` | `/etc/nginx/entry-location.conf` | `location` 体：探针 / `_nuxt` 长缓存 / 全站转发 |
| `nginx/entry-security-headers.conf` | 直接挂载（无变量，不需渲染） | 安全响应头（server 与 location 各 include 一次） |

## 关键决策与取舍

1. **ACME 挑战默认 HTTP-01（与 kaup-core 的 DNS-01 不同）**
   kaup-core 入口是纯 API、只发布 443，境内 HTTP-01 不可靠，故取 DNS-01。官网是公开站点：
   80 必须发布（用户手输域名要能跳转到 HTTPS），而 HTTP-01 只需 80 可达、零密钥
   （不需要 DNS 服务商 API 凭证，少一处长期凭证）。故默认 HTTP-01，80 端口 vhost 保留
   `/.well-known/acme-challenge/`（与 acme-companion 共享 webroot 卷）；DNS-01 作为可选档，
   一条 env 即可切换。机制不变（同镜像、同卷、同 reload 通道）。
2. **保留 docker.sock（与 kaup-core 一致）**：nginx-proxy 的 docker-gen 需要它，acme-companion 经
   `NGINX_PROXY_CONTAINER` + socket 执行 reload。代价是容器持有 docker 控制面能力；
   如需摘除可换纯 nginx 镜像并保留 acme-companion，本任务不采用以免偏离既有模式（已登记）。
3. **变量上游 + Docker 内嵌 DNS**：`resolver 127.0.0.11` 配 `proxy_pass http://$entry_upstream`，
   web 容器重启换 IP 不必重启入口（静态 `proxy_pass http://web:3000` 会启动期解析并钉死 IP）。
4. **`/_nuxt/` 强制一年 immutable**：构建产物带内容指纹，入口显式覆盖缓存头，不依赖上游是否给头；
   该 location 内的 `add_header` 会使其失去父级头继承，故重复 include 安全头片段（同一份文件，避免漂移）。
5. **`/entry-health` 由入口自身应答**：LB/探活不穿透到应用，探活流量不污染应用侧限流计数。
6. **镜像与运行时**：`node:22-alpine` 多阶段（deps → build → runner）；装依赖用 `--ignore-scripts`
   （`nuxt build` 自带 prepare，且避免 husky 等宿主脚本）；运行期 `USER node`；`/app` 归属 node，
   使 Nuxt Content 惰性 SQLite 可落到容器可写层（与 Vercel 档 `/tmp` 语义等价）。
7. **密钥分层**：`.env` 供 compose 插值；web 容器只显式注入 `FEISHU_*`，ACME/DNS 凭证不进 web 容器。
8. **不缓存 SSR 页面**：本站不做 microcache；`/api/contact` 是写接口，任何共享缓存都会破坏其语义。

## 双通道（Vercel 与自托管并存）

| 维度 | Vercel 通道（保留） | 自托管通道（本次新增） |
|---|---|---|
| 域名 | `kaup.ai` | `kaup-ai.com` |
| 站点 URL（canonical/og/JSON-LD/robots/sitemap） | `NUXT_PUBLIC_SITE_URL=https://kaup.ai`（nuxt.config 默认值兜底） | `Dockerfile` ARG 默认 `https://kaup-ai.com` |
| 构建 | Vercel Nuxt preset（自动） | 根 `Dockerfile`（node-server 产物） |
| 运行时 | Vercel Functions（Nitro vercel preset） | `node .output/server/index.mjs`（容器内非 root） |
| TLS / 入口 | Vercel 边缘 | 本仓 nginx 入口 + acme-companion |
| 变量来源 | Vercel 项目 Environment Variables | 根 `.env`（compose 插值 + 显式注入 web） |
| 生效方式 | Git 推送自动部署 | `docker compose up -d --build` |

- **域名分工固定**：自托管绑 `kaup-ai.com`（+ `www.`），Vercel 绑 `kaup.ai`（+ `www.`），
  两条通道各自独立解析、互不争抢；把同一域名同时解析到两边才会互相影响。
- **代码层零分支**：不新增"运行在哪个平台"的判断。差异只落在部署物与变量注入方式上，
  故两条通道都只需各自跑通即可，不存在只在一边成立的行为。
- **惰性文件**：根 `Dockerfile`、`docker-compose*.yml`、`nginx/`、`scripts/` 对 Vercel 构建无副作用
  （Vercel 按 Nuxt preset 构建，不读 Dockerfile）；`.dockerignore` 亦不影响 Vercel。
- **应用侧已兼容**：`server/api/contact.ts` 的 IP 判定（`x-real-ip` → `x-forwarded-for` 末段）
  在 Vercel 边缘与本站 nginx 下都取到真实客户端 IP；Nuxt Content 的 SQLite 在 Vercel 落 `/tmp`、
  在容器落可写 cwd（`/app`），两条路径都不需要改配置。

### 站点 URL：为什么是"单一变量 + 构建期定稿"

- **单一来源**：`shared/utils/site-url.ts` 归一化 `runtimeConfig.public.siteUrl`；
  `app/composables/useKaupSeo.ts`、`app/app.vue`、`server/routes/robots.txt.ts`、
  `server/routes/sitemap.xml.ts` 全部读它。原先 5 处硬编码 `https://kaup.ai`（含 public 两个静态文件）
  ⇒ 双通道下 `kaup-ai.com` 的页面会把 `kaup.ai` 声明为规范地址（SEO 串味），故收敛。
- **robots / sitemap / llms 改为生成式**：从 `public/` 静态文件改为 `server/routes/*.ts` + 加进
  `nitro.prerender.routes`，产物仍是静态文件（对爬虫零差别），但域名随构建取值。
  `llms.txt` 的正文（4.5KB 中文摘要）不放 TS 字面量，而是 `server/assets/llms.txt`
  （Nitro server asset，字节序不变地随产物分发），路由只做 `https://kaup.ai` → 站点 URL 的替换。
- **构建期定稿**：页面与这两个文件都在构建期预渲染 ⇒ 换域名必须重建镜像
  （`--build-arg NUXT_PUBLIC_SITE_URL=...`）。运行期 env 只对未预渲染路径生效——这一点写进
  `nginx/README.md`，避免"改了 env 没生效"的误解。

## 风险与回滚

- 80/443 被占用或未放行 ⇒ HTTP-01 失败；切 `ACME_CHALLENGE=DNS-01` 或释放端口。
- 入口前有 CDN/SLB 时 `$remote_addr` 退化为回源 IP，应用侧 IP 限流会变单桶；
  设 `ENTRY_REAL_IP_CONFIG`（`set_real_ip_from` 等）恢复真实 IP，取值由部署面填。
- 回滚：`docker compose down` 即停用自托管通道（DNS 切回 Vercel 即可完全回到原状态）；
  两条通道互不依赖，任一条可单独启用/停用。
- `/api/contact` 限流状态在 web 进程内 ⇒ 横向扩容 web 前需改共享存储（登记为后续项）。
