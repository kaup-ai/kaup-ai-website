# 开发环境部署手册

面向**本机开发 / 联调**。生产上线见 [deploy-prod.md](deploy-prod.md)；
入口的配置机制、变量全表与排障见 [../nginx/README.md](../nginx/README.md)。

> 域名分工：本手册的本地档一律**不绑真实域名**（用 `127.0.0.1` + 自签证书）；
> 线上自托管绑 `kaup-ai.com`，Vercel 通道绑 `kaup.ai`。

## 1. 两种开发方式

| 方式              | 命令                                                 | 用途                                                | 适用             |
| ----------------- | ---------------------------------------------------- | --------------------------------------------------- | ---------------- |
| **裸 `pnpm dev`** | `pnpm install && pnpm dev` → `http://localhost:3000` | 改页面/组件/样式的日常循环（HMR 最快）              | 90% 的开发时间   |
| **容器档**        | 见第 3 节                                            | 验证生产镜像、入口 conf、TLS、证书轮换、限流/缓存头 | 改部署物或发布前 |

`pnpm dev` 不需要 Docker，也不需要 `.env`：`NUXT_PUBLIC_SITE_URL` 未设时回退 `https://kaup.ai`
（即 Vercel 通道的规范地址）；页面里的绝对 URL 只在构建期定稿，dev 下不影响本地浏览。

⚠️ Nuxt 会自动读取仓库根的 `.env`（dotenv 行为），而那份文件是为 Docker 档准备的、
样例值就是 `https://kaup-ai.com`。所以只要本机有 `.env`，`pnpm dev` / `pnpm build` 取到的就是
`kaup-ai.com`（含商务邮箱 `sales@kaup-ai.com`）。要复现「Vercel 档」取值，临时移开 `.env` 再构建。

## 2. 前置条件

- Docker Desktop / Docker Engine，**Compose ≥ 2.24.4**（本地档用 `!override` 替换端口映射；`docker compose version` 自查）
- 端口：本地档默认 **8081**（HTTP）与 **8443**（TLS）。8080 通常已被 kaup-core 本地入口占用，
  故本项目刻意避开；冲突时用 `ENTRY_DEV_PUBLISH` / `ENTRY_DEV_TLS_PORT` 改
- `.env`：`cp .env.example .env`（compose 的变量插值在本地档同样要求 `ENTRY_HOST` / `ACME_EMAIL`，
  这两个值给 `kaup-ai.com` / `ops@kaup-ai.com` 即可；本地档不会去签发公共证书）

## 3. 容器档：三种用法

三种档位**共用同一份模板与同一套 entrypoint**，差异只是变量取值（机制不变）。

### 3.1 本地 HTTP 档（默认）

```bash
# web 镜像来自 GHCR（CI 产物）。本地没登录过 GHCR 也没构建过，就先本地构建同一 tag：
docker build -t ghcr.io/kaup-ai/kaup-ai-website:latest .
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8081/     # 200
```

- 入口监听宿主 `8081`（纯 HTTP，无证书），上游 = 容器 `web:3000`
- `acme-companion` 归 `acme` profile ⇒ **不启动**（不签公共 CA）
- 限流放宽为 `100r/s` / `burst=200`（机制保留，取值放宽）

> 也可以不走本地构建、直接拉 CI 的镜像：`docker login ghcr.io -u <GitHub用户名>`（token 勾
> `read:packages`）后 `docker compose pull`。改了代码想验证生产镜像时仍需上面那条 `docker build`。

### 3.2 TLS 档（自签证书；验证 TLS 终止与换证书生效）

```bash
bash scripts/dev-tls-check.sh
```

该脚本会：起入口（宿主 `8443`，挂 `nginx/dev-certs/` 自签证书）→ 读服务端**实际出示**的证书指纹 →
重签证书 → `docker exec kaup-site-entry nginx -s reload` → 再读指纹并断言**已变化**，
同时断言 `GET https://127.0.0.1:8443/` 为 200。

判据口径：只看服务端握手时出示的证书，不看脚本退出码 / `nginx -t` / 容器日志。
这正是生产环境 `acme-companion` 续期后走的那条 reload 通道，所以在本地能把"换证书是否生效"验穿。

手工档（不想跑脚本时）：

```bash
bash scripts/gen-dev-certs.sh                 # 生成 nginx/dev-certs/{site.crt,site.key}（gitignore）
ENTRY_DEV_PUBLISH=8443 ENTRY_DEV_LISTEN_PORT=8443 \
ENTRY_LISTEN_TLS="listen 8443 ssl;" \
ENTRY_TLS_CERT_LINES="ssl_certificate /etc/nginx/dev-tls/site.crt;
ssl_certificate_key /etc/nginx/dev-tls/site.key;" \
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
curl -sk --resolve kaup-ai.com:8443:127.0.0.1 https://kaup-ai.com/ -o /dev/null -w '%{http_code}\n'  # 200
```

### 3.3 HMR 档（入口在容器、应用在宿主）

宿主跑 `pnpm dev`，入口容器把请求转给宿主进程：

```bash
ENTRY_UPSTREAM_WEB=host.docker.internal:3000 \
  docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
# → http://127.0.0.1:8081/ 由入口转发到宿主的 3000
```

`host.docker.internal` 的解析由本地档的 `extra_hosts` 提供（macOS Docker Desktop 实测有 A 记录
`192.168.65.254`，与模板里 `resolver ... ipv6=off` 兼容）。
注意：入口**不透传 WebSocket 升级**（`Connection ""`），HMR 的 WS 只在直连 `localhost:3000` 时生效。

## 4. 判据脚本（可复跑）

| 脚本                                      | 判据                                                                                                                                                                  | 代价        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `bash scripts/render-check.sh`            | 复现容器内 `envsubst` 渲染（白名单来自 compose 的 entrypoint，单一事实源）；断言无 `ENTRY_*` 残留、nginx 自身变量保留、各档要素齐备；daemon 可用时再跑真实 `nginx -t` | 秒级        |
| `bash scripts/dev-tls-check.sh`           | TLS 终止可用 + 换证书后 reload 即生效（服务端出示指纹变化）                                                                                                           | 起容器 ~15s |
| `bash scripts/gen-dev-certs.sh [--force]` | 生成/重签本地自签证书（SAN = 主域 + 附加域 + localhost + 127.0.0.1）                                                                                                  | 秒级        |

## 5. 联调冒烟清单

```bash
b=http://127.0.0.1:8081
for p in / /robots.txt /sitemap.xml /llms.txt /entry-health; do
  printf '%-14s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' $b$p)"
done
curl -s $b/api/contact                    # 405 JSON（契约 C1：仅 POST）
curl -s -X POST -H 'Content-Type: application/json' -d '{}' $b/api/contact   # 400 校验提示
curl -sI $b/ | rg -i 'strict-transport|x-content-type|x-frame|referrer'
asset=$(curl -s $b/ | grep -o '/_nuxt/[A-Za-z0-9_.-]*\.js' | head -1)
curl -sI "$b$asset" | rg -i cache-control     # public, max-age=31536000, immutable
curl -s $b/robots.txt | head -1               # # KAUP Website - https://kaup-ai.com
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec -T nginx-proxy nginx -t
```

> `/api/contact` 的限流是**进程内**滑动窗口（单 IP 5 条/小时）：本地连打 5 次以上会看到 429，
> 这是预期行为，不是入口限流。重启 `web` 容器即可重置计数。

## 6. 站点 URL（本地怎么取值）

页面 canonical / `og:url` / JSON-LD 与 `robots.txt`、`sitemap.xml`、`llms.txt` 都读
`NUXT_PUBLIC_SITE_URL`（单一来源：`shared/utils/site-url.ts`）。**页面是预渲染的 ⇒ 该值在构建期定稿**：

```bash
pnpm build                                                    # 无 .env 且未注入 ⇒ 回退 https://kaup.ai
NUXT_PUBLIC_SITE_URL=https://kaup-ai.com pnpm build            # 模拟自托管档（Dockerfile 的 ARG 默认值）
```

容器档由 `Dockerfile` 的 `ARG NUXT_PUBLIC_SITE_URL=https://kaup-ai.com` 固化，改域名要重建镜像。

**商务邮箱同源**：页脚、联系页、JSON-LD、`/api/contact` 报错文案与 `llms.txt` 里的邮箱都是
`sales@<站点域>`（`salesEmailFor`）。所以本地默认档下页面显示 `sales@kaup.ai`；
要按自托管档看，就带 `NUXT_PUBLIC_SITE_URL=https://kaup-ai.com` 构建。

## 7. 常见问题

| 现象                                                      | 处置                                                                                                   |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Bind for 0.0.0.0:8081 failed: port is already allocated` | 换端口：`ENTRY_DEV_PUBLISH=18081 ENTRY_DEV_LISTEN_PORT=18081 ... up -d`；确认是否 kaup-core 本地档在跑 |
| 入口反复重启 / entrypoint 报错                            | `docker logs kaup-site-entry`；多为模板注释里混入了带 `$` 的白名单变量（`render-check.sh` 会提前抓到） |
| `502 host not found in upstream`                          | `docker compose ... exec -T nginx-proxy getent hosts web`；确认 `ENTRY_UPSTREAM_WEB` 值                |
| TLS 档起不来                                              | 证书是否生成（`nginx/dev-certs/`）、`ENTRY_TLS_CERT_LINES` 是否指向 `/etc/nginx/dev-tls/...`           |
| 改了 `.env` 不生效                                        | compose 变量要重新 `up -d`（入口 env 变化会重建容器）；模板改动需 `restart nginx-proxy` 重跑渲染       |
| 想彻底清干净                                              | `docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v`（会删本地证书卷，重新签即可） |

## 8. 与生产档的差异（同机制、仅取值不同）

| 维度     | 开发档（本手册）                        | 生产档（[deploy-prod.md](deploy-prod.md)）       |
| -------- | --------------------------------------- | ------------------------------------------------ |
| 入口端口 | 宿主 `8081`（HTTP）/ `8443`（TLS 自签） | 宿主 `80` / `443`（真实证书）                    |
| 证书     | `scripts/gen-dev-certs.sh` 自签         | `acme-companion` 向 Let's Encrypt 签发并自动续期 |
| ACME     | 不启（`acme` profile）                  | 启动；HTTP-01（默认）或 DNS-01                   |
| 域名     | `127.0.0.1` / 自签 SAN                  | `kaup-ai.com` + `www.kaup-ai.com`                |
| 限流     | `100r/s` burst 200                      | `30r/s` burst 60                                 |
| 站点 URL | 回退 `https://kaup.ai`（或按需注入）    | 构建期固化 `https://kaup-ai.com`                 |
