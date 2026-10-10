# 官网入口（nginx + ACME）运维手册

官网自托管通道的入口：`nginxproxy/nginx-proxy` 承担 **TLS 终止 + 限流/安全头/`X-Request-Id` +
结构化访问日志**，`nginxproxy/acme-companion`（内置 acme.sh）承担 **证书首签 / 到期续期 / reload**。
机制与 `kaup-core/infra/domestic` 同源（同镜像形态、同 conf 渲染机制、同续期-加载通道）。

> 与 **Vercel 通道并存**：本目录全部内容对 Vercel 构建无副作用；两条通道域名分工固定
> （自托管 `kaup-ai.com` / Vercel `kaup.ai`），各自独立解析。差异清单见
> `.trellis/tasks/10-10-docker-nginx-entry/design.md`。

**文档分工**：本文件是**参考资料**（变量全表 / conf 渲染机制 / 证书与轮换细节 / 可观测性 / 排障）；
按环境的操作步骤在 [../docs/deploy-dev.md](../docs/deploy-dev.md)（开发）与
[../docs/deploy-prod.md](../docs/deploy-prod.md)（生产）。

### 域名分工与站点 URL

- **自托管（本档）绑 `kaup-ai.com`**（含 `www.kaup-ai.com`）；**Vercel 通道绑 `kaup.ai`**。
  两条通道各自独立解析、互不争抢。本档不要把 `ENTRY_HOST` 设成 `kaup.ai`。
- 站点绝对 URL（页面 canonical / `og:url` / JSON-LD，以及 `robots.txt`、`sitemap.xml`、`llms.txt`）已收敛到
  **单一来源** `NUXT_PUBLIC_SITE_URL`（实现：`shared/utils/site-url.ts`，
  `app/composables/useKaupSeo.ts`、`app/app.vue`、`server/routes/robots.txt.ts`、
  `server/routes/sitemap.xml.ts`、`server/routes/llms.txt.ts` 都读它），**不再硬编码域名**，
  故两条通道各自"自引用"。三个站点级文件由 `nitro.prerender.routes` 在构建期预渲染为静态文件，
  对爬虫与静态托管零差别；`llms.txt` 的正文放 `server/assets/llms.txt`（Nitro server asset）。

| 通道                    | 站点 URL 注入点                                                                                   | 取值                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 自托管                  | `Dockerfile` 的 `ARG NUXT_PUBLIC_SITE_URL`（构建期）；compose 的 `NUXT_PUBLIC_SITE_URL`（运行期） | `https://kaup-ai.com`（默认已固化）                 |
| Vercel                  | 项目 Environment Variables（构建期）                                                              | `https://kaup.ai`（nuxt.config 默认值兜底，可不设） |
| 本地 `pnpm dev`/`build` | 环境变量（可选）                                                                                  | 未设 ⇒ 回退 `https://kaup.ai`                       |

- ⚠️ 页面是**预渲染**的：canonical / og / JSON-LD 在**构建期**定稿 ⇒ 换域名要重建镜像
  （`docker build --build-arg NUXT_PUBLIC_SITE_URL=https://其它域名 .`），改运行期 env 只影响非预渲染路径。
- **商务邮箱同源**：`sales@<站点域>`（`shared/utils/site-url.ts` 的 `salesEmailFor`）——
  页脚、联系页、JSON-LD、`/api/contact` 报错文案与 `llms.txt` 都取它；
  于是自托管显示 `sales@kaup-ai.com`、Vercel 显示 `sales@kaup.ai`，无需额外配置。
- 若某条通道**不希望**被收录（例如只作内部镜像），入口侧加 `X-Robots-Tag: noindex` 即可，与上面的取值互不影响。

## 1. 组成

| 服务             | 镜像                                   | 端口                        | 卷                                                    |
| ---------------- | -------------------------------------- | --------------------------- | ----------------------------------------------------- |
| `web`            | 本仓 `Dockerfile`（Nitro node-server） | 容器内 3000（不发布到宿主） | —                                                     |
| `nginx-proxy`    | `nginxproxy/nginx-proxy:1.6`           | 宿主 80 / 443               | `entry_certs` `entry_conf` `entry_vhost` `entry_html` |
| `acme-companion` | `nginxproxy/acme-companion:2.5`        | —                           | 上述共享卷 + `acme_state`                             |

- **证书落持久化卷** `entry_certs`（`/etc/nginx/certs/<主域>/`）：不进镜像层，容器重建/重签不会丢。
- **reload 通道**：acme-companion 续期后经 docker socket 在入口容器执行 `nginx -s reload`，
  无需 certbot 式一次性任务；`scripts/dev-tls-check.sh` 用"服务端实际出示的证书指纹变更"验证该通道。

## 2. 启动

```bash
cp .env.example .env          # 必填 ENTRY_HOST / ACME_EMAIL；应用密钥可选
docker compose up -d --build
docker compose logs -f nginx-proxy acme-companion   # 首签过程看这里
```

首次签发需要：域名 A/AAAA 已解析到本机、80 端口对公网可达（HTTP-01 档）。
确认签发结果：`docker compose exec nginx-proxy ls /etc/nginx/certs/<主域>/`（应见 `fullchain.pem`、`key.pem`）。

排空自托管通道：`docker compose down`（加 `-v` 会删证书卷，重新签发即可，非必要不加）。

## 3. 证书轮换

| 档位                | 触发方式                                                            | 需要的凭证                                                               |
| ------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **HTTP-01（默认）** | 需 80 端口可达；80 端口 vhost 已预留 `/.well-known/acme-challenge/` | 无                                                                       |
| **DNS-01（可选）**  | 80 不可达，或经 CDN 吞掉挑战路径时改用                              | DNS 服务商 API 凭证（`ACMESH_DNS_API_CONFIG`，从宿主环境注入，不落仓库） |

```bash
# 切 DNS-01（示例：阿里云 / DNSPod / Cloudflare）
ACME_CHALLENGE=DNS-01 \
ACMESH_DNS_API_CONFIG='{"DNS_API":"dns_ali","Ali_Key":"...","Ali_Secret":"..."}' \
docker compose up -d acme-companion
```

- 首次上线建议先用 **staging CA** 演练（避免正式环境速率限制）：
  `.env` 里设 `ACME_CA_URI="https://acme-staging-v02.api.letsencrypt.org/directory"`
  （浏览器会提示证书不受信，属正常）。
- **续期是自动的**：acme-companion 周期检查到期并续签 + reload。真实公网续期属部署动作，
  上线后按下面的判据自证一次：

  ```bash
  # 服务端实际出示的证书（判据只看这个，不看容器日志/退出码）
  openssl s_client -connect <域名>:443 -servername <主域> </dev/null 2>/dev/null \
    | openssl x509 -noout -subject -dates -fingerprint -sha256
  # 强制一次续期演练后重采指纹，应发生变化
  docker compose exec acme-companion /app/force_renew
  ```

## 4. conf 渲染机制

| 文件                          | 容器内路径                                                                             | 职责                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `entry.conf.template`         | `/etc/nginx/entry.conf.template` → 渲染到 `conf.d/entry.conf`                          | 同源骨架：限流区 / 路由 include / X-Request-Id / 日志格式 / 80 跳转 vhost / TLS server |
| `entry-routing.conf`          | `/etc/nginx/fragments/entry-routing.conf.template` → `/etc/nginx/entry-routing.conf`   | `map $uri → $entry_upstream`（当前单上游，留扩展位）                                   |
| `entry-location.conf`         | `/etc/nginx/fragments/entry-location.conf.template` → `/etc/nginx/entry-location.conf` | `location` 体：探针 / `_nuxt` 长缓存 / 全站转发                                        |
| `entry-security-headers.conf` | `/etc/nginx/fragments/entry-security-headers.conf`（直接挂载）                         | 安全响应头（server 与 `_nuxt` location 各 include 一次）                               |

- 三个模板由 compose `entrypoint` 用**同一份 envsubst 白名单**渲染；白名单只含 `ENTRY_*`，
  nginx 自身变量（`$uri` / `$host` / `$scheme` / `$request_id` / `$http_*` …）原样保留。
- 模板挂在 `conf.d` **之外**：`:ro` 单文件挂进 `conf.d` 后若被 `rm` 会 EBUSY/EROFS 并中断 entrypoint；
  渲染产物才落进 `conf.d`，片段渲染到 `conf.d` 外由模板显式 `include`（避免被自动加载成两份）。
- ⚠️ **注释里不得出现带 `$` 的白名单变量名**：envsubst 连注释一起替换，多行值会把注释行拆出
  一个非注释行 ⇒ nginx 解析失败（只在多行变量非空的档暴露，属静默漂移）。
- 改配置后：`docker compose restart nginx-proxy`（entrypoint 重跑渲染）；语法自查
  `docker compose exec nginx-proxy nginx -t`。

## 5. 变量

| 变量                              | 默认                         | 说明                                                   |
| --------------------------------- | ---------------------------- | ------------------------------------------------------ |
| `ENTRY_HOST`                      | 必填                         | 主域名；决定证书落盘目录                               |
| `ENTRY_ALT_HOST`                  | 空                           | 附加域名（与主域共用一张多 SAN 证书）；单域名时留空    |
| `ACME_EMAIL`                      | 必填                         | ACME 账号邮箱                                          |
| `ACME_CHALLENGE`                  | `HTTP-01`                    | 可选 `DNS-01`                                          |
| `ACMESH_DNS_API_CONFIG`           | 空                           | DNS-01 档的凭证 JSON                                   |
| `ACME_CA_URI`                     | LE 生产目录                  | 预演时改 staging 目录                                  |
| `ENTRY_RATE` / `ENTRY_LIMIT_REQ`  | `30r/s` / `burst=60 nodelay` | 入口单 IP 限流（挡未认证洪泛）                         |
| `ENTRY_CONNECT/SEND/READ_TIMEOUT` | `5s` / `30s` / `30s`         | 全站转发超时                                           |
| `ENTRY_CLIENT_MAX_BODY_SIZE`      | `1m`                         | 请求体上限（仅联系表单有写入口）                       |
| `ENTRY_REAL_IP_CONFIG`            | 空                           | 入口前有 CDN/SLB 时填 `set_real_ip_from …` 恢复真实 IP |
| `ENTRY_RESOLVER`                  | `127.0.0.11`                 | 容器内嵌 DNS（解析同网络服务名 + 转发外部域名）        |
| `ENTRY_UPSTREAM_WEB`              | `web:3000`                   | 上游（本地 HMR 档可指宿主进程）                        |

## 6. 本地档与判据

**不改变机制，只改取值**（同一模板 / 同一 entrypoint / 同一续期-加载通道）：

| 档      | 命令                                                                                                                | 入口                  | 上游            |
| ------- | ------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------- |
| HTTP 档 | `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`                                      | 宿主 8081（HTTP）     | `web:3000`      |
| TLS 档  | `bash scripts/dev-tls-check.sh`                                                                                     | 宿主 8443（自签证书） | `web:3000`      |
| HMR 档  | `ENTRY_UPSTREAM_WEB=host.docker.internal:3000 docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d` | 宿主 8081             | 宿主 `pnpm dev` |

- 本地档端口默认 **8081**（`ENTRY_DEV_PUBLISH` 可改）：8080 通常已被 kaup-core 本地入口占用。
- 本地档 `acme-companion` 归 `acme` profile ⇒ 不启（不签公共 CA）；需演练签发时加 `--profile acme`。
- `scripts/gen-dev-certs.sh` 生成自签证书（SAN = 主域 + 附加域 + `localhost` + `127.0.0.1`）到
  `nginx/dev-certs/`（gitignore）。
- **`scripts/dev-tls-check.sh` 的判据口径**：换证书 + `nginx -s reload` 后，服务端**握手时实际出示的
  证书指纹**必须变化；同时 `GET /` 为 200。不以脚本退出码、`nginx -t`、容器日志为通过依据。

```bash
# 快速冒烟（本地 HTTP 档）
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8081/            # 200
curl -s http://127.0.0.1:8081/api/contact -X POST | head -c 120            # 405 JSON（仅 POST）
curl -s http://127.0.0.1:8081/entry-health                                 # ok（不经 web）
curl -sI http://127.0.0.1:8081/_nuxt/<文件名> | rg -i cache-control        # immutable
```

## 7. 可观测性与限流

- **访问日志**：一行一 JSON 出到 stdout（字段：`time` / `request_id` / `method` / `uri` /
  `upstream_addr` / `status` / `request_time` / `upstream_response_time` / `bytes_sent` / `remote_addr`），
  `docker logs kaup-site-entry` 可直接被外部采集与告警规则解析。
- **`/entry-health`**：入口自身应答 200，不经 web ⇒ LB/探活不消耗应用侧限流计数。
- **两层限流语义不同**：入口 `limit_req`（单 IP 速率）挡**未认证洪泛**；应用侧 `/api/contact`
  的进程内滑动窗口（单 IP 5 条/小时、全局 30 条/小时）是**业务配额**。入口限流刻意不含 `/_nuxt/` 资产路径。
- **真实客户端 IP**：入口覆盖写 `X-Real-IP`（客户端伪造无效）并追加 `X-Forwarded-For`；
  应用侧优先取 `x-real-ip`。入口前若有 CDN/SLB 且未设 `ENTRY_REAL_IP_CONFIG`，
  所有客户端会塌成一个限流桶（见第 8 节）。

## 8. 排障

| 现象                             | 排查                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 入口起不来 / 反复重启            | `docker logs kaup-site-entry`；渲染失败会停在 entrypoint。重点看模板注释里是否混入了带 `$` 的白名单变量 |
| 502 `host not found in upstream` | `resolver` 与 `ENTRY_UPSTREAM_WEB` 是否匹配；`docker compose exec nginx-proxy getent hosts web`         |
| 证书目录为空                     | 80 是否对公网可达（HTTP-01）；或换 DNS-01；`docker logs kaup-site-entry-acme`                           |
| 表单限流误伤                     | 入口前是否有 CDN/SLB 且未设 `ENTRY_REAL_IP_CONFIG`（应用侧只能看到回源 IP）                             |
| 413                              | `ENTRY_CLIENT_MAX_BODY_SIZE`（默认 1m）与表单体积                                                       |
| 页面正常但样式/图片 404          | 上游是否真为本站构建产物：`docker compose exec web ls /app/.output/public/_nuxt                         | head` |
| 想确认当前生效 conf              | `docker compose exec nginx-proxy cat /etc/nginx/conf.d/entry.conf`                                      |

## 9. 取舍与后续项

- **docker.sock**：`nginx-proxy` 的 docker-gen 与 acme-companion 的 reload 都需要它（`:ro` 挂载）。
  若安全策略不接受，可换纯 `nginx` 镜像 + 保留 acme-companion 的 reload 通道（本次未采用，以保持与
  kaup-core 同一套模式）。
- **无 CSP**：Nuxt 运行时含内联脚本/样式，强 CSP 会打断水合；上 CSP 需先做 nonce/hash 方案。
- **横向扩容**：`/api/contact` 限流状态在 web 进程内 ⇒ 多副本前需改为共享存储。
- **IPv6**：当前只发布 IPv4；宿主有 IPv6 时需补 `[::]` 端口映射。
- **HTTP/3**：未启用（需镜像 nginx 带 QUIC 支持），当前 HTTP/2 已开。
