# 生产环境部署手册（自托管通道）

自托管通道把官网跑在自己的服务器上：`web`（Nuxt/Nitro 镜像）+ 入口 nginx（TLS 终止）

- `acme-companion`（证书签发/续期）。**与 Vercel 通道并存**，域名分工固定：
  自托管 = `kaup-ai.com`，Vercel = `kaup.ai`。

命令一律在仓库根执行。入口的变量全表、conf 渲染机制、证书细节与排障见 [../nginx/README.md](../nginx/README.md)；
本地开发见 [deploy-dev.md](deploy-dev.md)。

## 1. 前置条件（上线前逐项确认）

| 项            | 要求                                                                                | 自查                              |
| ------------- | ----------------------------------------------------------------------------------- | --------------------------------- |
| 服务器        | Linux x86_64/arm64，2C4G 起，磁盘 ≥ 10GB                                            | `df -h`                           |
| Docker        | Engine 24+，**Compose ≥ 2.24.4**（`!override` 语法）                                | `docker compose version`          |
| 端口          | 公网放行 **80** 与 **443**（HTTP-01 需 80 回源；80 还承担 301 跳转）                | `ss -lntp \| grep -E ':80\|:443'` |
| 域名          | `kaup-ai.com` 与 `www.kaup-ai.com` 的 A 记录指向本机公网 IP                         | `dig +short kaup-ai.com`          |
| 备案          | 境内服务器需已完成 ICP 备案（页脚备案号 `辽ICP备2026013176号-1`）                   | 服务商控制台                      |
| 邮箱          | ACME 账号邮箱（到期与恢复通知）                                                     | —                                 |
| 应用密钥      | 飞书 6 个变量（见 `.env.example` 的应用段落）；缺失时仅表单提交报 500，页面不受影响 | —                                 |
| DNS API 凭证  | 仅 **DNS-01** 档需要（80 不可达或前置 CDN 吞挑战路径时）                            | —                                 |
| GHCR 只读凭据 | `web` 镜像来自私有包，需 GitHub classic PAT（勾 `read:packages`）                   | 见「从 GHCR 拉取私有镜像」        |

> 域名分工：**不要把自托管档绑到 `kaup.ai`**（那是 Vercel 通道的域名）。

### 从 GHCR 拉取私有镜像（`web` 镜像）

`web` 镜像**不在服务器上构建**：CI（`.github/workflows/docker-image.yml`）每次推送到 `main`
都会构建并推 `ghcr.io/kaup-ai/kaup-ai-website:latest`。该包是**私有**的 ⇒ 拉取必须带凭据。

1. **建 token**：GitHub → Settings → Developer settings → **Personal access tokens (classic)** →
   Generate new token，只勾 **`read:packages`**（给服务器单独建一个，标注用途与有效期）。
2. **登录**（`-u` 写 **GitHub 用户名**，不是组织名 —— 这是最常见的踩坑）：

   ```bash
   echo "$GHCR_PAT" | docker login ghcr.io -u <你的GitHub用户名> --password-stdin
   ```

   凭据落在 `~/.docker/config.json`（base64，非加密）⇒ 用**专用只读** token，别用带写权限的。

3. **拉取 / 更新**：

   ```bash
   docker compose pull web     # 或 docker compose pull（连两个入口镜像一起）
   docker compose up -d
   ```

**排障**

| 现象                                    | 处置                                                           |
| --------------------------------------- | -------------------------------------------------------------- |
| `unauthorized: authentication required` | 没登录 / token 缺 `read:packages` / `-u` 误写成组织名          |
| `denied: permission_denied`             | token 所属账号对该包无读权限（组织包需账号是组织成员并被授权） |
| `manifest unknown`                      | 包还没推成功（先看 Actions 是否绿）或 tag 写错                 |
| 不想用个人账号                          | 建机器账号 + 只读 token，避免人员变动后服务器拉不动            |
| GHCR 在你那台很慢                       | 回退离线搬运：`docker save/load`（见「境内网络」一节末尾）     |

**包可见性**：本仓库是公开仓库，但**本包实测为 private**（判据见下）。workflow 每次运行都会校验，
一旦变成匿名可拉就直接报红。确实需要改可见性时（例如新建的同名包默认为 public）走 UI：
组织 → **Packages** → `kaup-ai-website` → **Package settings** → Danger Zone →
Change visibility → **Private**。

自己怎么验（`401` = 私有；公开包会返回 `200` 并给出 token）：

```bash
# 本包（私有）
curl -s -o /dev/null -w '%{http_code}\n' \
  "https://ghcr.io/token?scope=repository:kaup-ai/kaup-ai-website:pull&service=ghcr.io"   # 401
# 对照：公开包
curl -s -o /dev/null -w '%{http_code}\n' \
  "https://ghcr.io/token?scope=repository:nginx-proxy/nginx-proxy:pull&service=ghcr.io"   # 200
```

> 注：用 API 改可见性需要带 `packages:write` 的 PAT（且需包管理员权限）；`GITHUB_TOKEN` 调
> `PATCH /orgs/{org}/packages/container/{pkg}` 会返回 404，所以这一步没有放进 CI。

### 境内网络：镜像拉取在 daemon 层配置

服务器上要从 Docker Hub 拉的只有两个入口镜像（`nginxproxy/nginx-proxy:1.11-alpine`、
`nginxproxy/acme-companion:2.8`）；`web` 镜像来自 GHCR，走登录拉取（见上一节）。
Docker Hub 的加速在 **Docker daemon** 层做，`/etc/docker/daemon.json`
（注意保留你已有的 `log-driver` 等设置）：

```json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "registry-mirrors": ["https://docker.1ms.run"]
}
```

```bash
sudo systemctl restart docker
```

- **只列一个可用加速站**：加速器是 Docker Hub 的被动缓存，未缓存的 tag 会直接回 `not found`
  （现象是"tag 不存在"，其实 tag 是好的），所以别把拿不准的源排在前面。
- **服务器不构建**，所以不需要 `node:24-alpine`。只有在**本地 / CI 构建**时才需要基础镜像与 npm 源
  （见下一节）；本地构建时若报 `load metadata for docker.io/library/node:24-alpine ... i/o timeout`，
  先 `docker pull node:24-alpine` 再构建即可（这一步会走上面的 `registry-mirrors`）。

- 加速站只是通路，不改变镜像内容；需要核对时可自行比对摘要：
  `docker buildx imagetools inspect node:24-alpine`。

### 境内网络：npm 源（仅本地/CI 构建需要）

镜像拉取与 npm 依赖下载是**两条独立通路**：镜像走 daemon 的 `registry-mirrors` 或 GHCR 登录（上面两节），
而 `Dockerfile` 里 `corepack` 下载 pnpm 本体、`pnpm install` 拉依赖走的是 **npm 源**
（生产服务器不构建，故这一步只在本地构建或 CI 里发生）。
`registry.npmjs.org` 在境内常不可达，典型报错：

```
Error when performing the request to https://registry.npmjs.org/pnpm/-/pnpm-12.4.1.tgz
  [cause]: AggregateError [ETIMEDOUT] ... connect ETIMEDOUT 104.16.x.x:443
```

本仓已把**镜像内构建**的 npm 源默认设为 npmmirror（只影响 `docker build`，不影响本地
`pnpm dev` 与 Vercel 通道）：

```bash
docker compose up -d --build        # 默认即走 https://registry.npmmirror.com

# 需要官方源时（例如海外构建机）：
docker build --build-arg NPM_REGISTRY=https://registry.npmjs.org -t kaup-ai-website:latest .
```

兜底（服务器连 npm 源也不通时）：在能构建的机器上构建好 `web` 镜像搬过去，服务器直接用本地镜像
（`docker compose up -d` **不加** `--build`）：

```bash
# 能构建的机器
docker save kaup-ai-website:latest | gzip > kaup-web-image.tgz
scp kaup-web-image.tgz admin@<ecs-ip>:~/

# 服务器
gunzip -c ~/kaup-web-image.tgz | docker load
docker compose up -d
```

**安全组 / 防火墙**：必须放行 **80** 与 **443**。HTTP-01 由 Let's Encrypt 从公网回源校验，
公网访问 `http://kaup-ai.com/.well-known/acme-challenge/<token>` 拿不到文件就会签发失败
（症状：acme 日志里 `Verification error ... Connection refused` / `Timeout`）。

## 2. 首次部署

```bash
# 1) 取代码
git clone <repo-url> kaup-ai-website && cd kaup-ai-website

# 2) 准备配置（.env 不入库；compose 的插值与 web 容器密钥都从这里来）
cp .env.example .env
vi .env
#   必填：ENTRY_HOST=kaup-ai.com / ENTRY_ALT_HOST=www.kaup-ai.com / ACME_EMAIL=...
#   站点 URL：NUXT_PUBLIC_SITE_URL=https://kaup-ai.com（Dockerfile 已固化为默认值；商务邮箱 sales@kaup-ai.com 随之确定）
#   应用密钥：FEISHU_*（6 个）

# 3) 登录 GHCR（web 镜像是私有包；凭据只读，见上一节）
echo "$GHCR_PAT" | docker login ghcr.io -u <你的GitHub用户名> --password-stdin

# 4) 拉镜像并启动（web 用 CI 产物，不在服务器本地构建）
docker compose pull
docker compose up -d

# 5) 看首次签发过程（HTTP-01 需 80 可达）
docker compose logs -f acme-companion
```

首签成功后证书落在持久化卷 `entry_certs`：

```bash
docker compose exec nginx-proxy ls -l /etc/nginx/certs/kaup-ai.com/   # fullchain.pem / key.pem
```

### 建议：先用 staging CA 演练一次

在 `.env` 里临时设 `ACME_CA_URI="https://acme-staging-v02.api.letsencrypt.org/directory"`
（浏览器会提示证书不受信，属正常），确认 80 回源、挑战路径、落盘、reload 全通后，再改回生产 CA 重新签发。
目的：避开正式环境的失败次数/重复证书速率限制。

### 首次上线的验收清单

```bash
# 容器与健康
docker compose ps                                  # web 应 healthy；入口/acme 应 Up
docker compose exec -T nginx-proxy nginx -t        # 配置语法

# 跳转与 TLS
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -H 'Host: kaup-ai.com' http://127.0.0.1/
curl -s -o /dev/null -w '%{http_code} h%{http_version}\n' https://kaup-ai.com/
openssl s_client -connect kaup-ai.com:443 -servername kaup-ai.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -dates -fingerprint -sha256

# 站点级文件必须是 kaup-ai.com（不是 kaup.ai）
curl -s https://kaup-ai.com/robots.txt | head -1
curl -s https://kaup-ai.com/ | grep -o '<link rel="canonical"[^>]*>'
curl -s https://kaup-ai.com/ | grep -o '"email":"[^"]*"'            # 应为 sales@kaup-ai.com
curl -s https://kaup-ai.com/contact | grep -o 'mailto:[^"]*'        # 同上
curl -s https://kaup-ai.com/sitemap.xml | head -3
curl -s https://kaup-ai.com/llms.txt | head -1

# 应用链路
curl -s -o /dev/null -w '%{http_code}\n' https://kaup-ai.com/entry-health    # 200（入口自身）
curl -s https://kaup-ai.com/api/contact                                       # 405 JSON（仅 POST）
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"company":"测试公司","name":"张三","phone":"13800000000"}' \
  https://kaup-ai.com/api/contact                                             # 200 = 飞书链路通
```

最后一项会真的写入飞书表格并 @all 群，请用测试话术并在事后清理该行。

## 3. 日常发布（更新代码 / 文案）

发版动作在 CI，服务器只负责拉新镜像：

```bash
# 开发机：改完提交推送 → CI 构建并推 GHCR（看 Actions 是否绿）
git push

# 服务器：拉新镜像 + 重建 web 容器
docker compose pull web
docker compose up -d
docker compose ps
curl -s -o /dev/null -w '%{http_code}\n' https://kaup-ai.com/
```

要点与代价：

- **页面与站点级文件都是预渲染的**（`/`、`/capabilities`、`/services`、`/about`、`/contact`、
  `/robots.txt`、`/sitemap.xml`、`/llms.txt`），所以**改内容要等 CI 重新构建镜像**，只 `restart` 不生效。
- `web` 容器重建期间入口会短暂返回 502（秒级）。当前为**单副本**部署，要消除这个窗口需要
  多副本 / 蓝绿（登记为后续项；注意 `/api/contact` 的限流状态在进程内，多副本前需改共享存储）。
- 只改了入口 conf / `.env`（未改应用）时：`docker compose up -d nginx-proxy`（会重建入口并重跑渲染）。
- 服务器上**不需要** `git pull`（compose 只用 `image:`）；拉代码只是为了看文档/脚本。
- 域名（`NUXT_PUBLIC_SITE_URL`）变化要改 workflow 里的 `SITE_URL` 再让它重建（预渲染页面在构建期定稿）。
- 本地想验证生产镜像：`docker build -t ghcr.io/kaup-ai/kaup-ai-website:latest .`（同一 tag，compose 直接用本地镜像）。

## 4. 回滚

| 场景                       | 动作                                                                                                                                                                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新版有问题                 | 回滚到上一个提交的镜像（CI 每次推送都留了不可变 tag `sha-<commit>`）：`docker pull ghcr.io/kaup-ai/kaup-ai-website:sha-<上一提交>` → `docker tag ghcr.io/kaup-ai/kaup-ai-website:sha-<上一提交> ghcr.io/kaup-ai/kaup-ai-website:latest` → `docker compose up -d` |
| 想立即止血（保留上一镜像） | 更新前先留底：`docker tag ghcr.io/kaup-ai/kaup-ai-website:latest ghcr.io/kaup-ai/kaup-ai-website:prev`；回滚时 `docker tag …:prev …:latest` 再 `docker compose up -d`                                                                                            |
| 摘除整条自托管通道         | `docker compose down`（容器停、证书卷保留）；把 DNS 切回 Vercel，线上即回到 Vercel 通道                                                                                                                                                                          |
| 彻底清理                   | `docker compose down -v`（**会删证书卷与 ACME 账号状态**，需重新签发；非必要不执行）                                                                                                                                                                             |

## 5. 证书与轮换

- **自动**：`acme-companion` 周期检查到期 → 续签 → 在入口容器执行 `nginx -s reload`。无需 cron、无需人工。
- **挑战方式**：默认 HTTP-01（零密钥，只需 80 可达）；前置有 CDN/WAF 吞掉
  `/.well-known/acme-challenge/`、或 80 不可达时切 DNS-01：

  ```bash
  # .env 里改，然后只重建 acme
  ACME_CHALLENGE=DNS-01
  ACMESH_DNS_API_CONFIG='{"DNS_API":"dns_ali","Ali_Key":"...","Ali_Secret":"..."}'
  docker compose up -d acme-companion
  ```

- **自证续期通道**（上线后至少做一次）：

  ```bash
  openssl s_client -connect kaup-ai.com:443 -servername kaup-ai.com </dev/null 2>/dev/null \
    | openssl x509 -noout -fingerprint -sha256        # 记下旧指纹
  docker compose exec acme-companion /app/force_renew # 强制续期一次
  openssl s_client -connect kaup-ai.com:443 -servername kaup-ai.com </dev/null 2>/dev/null \
    | openssl x509 -noout -fingerprint -sha256        # 应已变化
  ```

- **证书卷要备份**：`entry_certs`（证书）与 `acme_state`（ACME 账号/续期状态）丢失不会导致停服，
  但需要重新签发（受 CA 速率限制约束）。备份方法见第 7 节。

## 6. 监控与告警

| 信号     | 建议阈值                                | 采集方式                                                                |
| -------- | --------------------------------------- | ----------------------------------------------------------------------- |
| 站点存活 | `/` 或 `/entry-health` 非 200 连续 2 次 | 外部拨测（`/entry-health` 只打入口，不消耗应用限流）                    |
| 证书到期 | 剩余 < 30 天告警，< 7 天紧急            | 外部 `openssl s_client` 取 `notAfter`（**外部 vantage**，不看容器日志） |
| 5xx 率   | 5 分钟窗口 > 1%                         | 入口 JSON 访问日志的 `status` 字段                                      |
| 上游健康 | `upstream_addr` 为空或 502 突增         | 同上                                                                    |
| 磁盘     | ≥ 80%                                   | 宿主 agent；镜像与 docker 日志是主要增长项                              |

入口访问日志是**一行一 JSON** 到 stdout（字段：`time` / `request_id` / `method` / `uri` /
`upstream_addr` / `status` / `request_time` / `upstream_response_time` / `bytes_sent` / `remote_addr`），
直接用 `docker logs kaup-site-entry` 或宿主日志采集器解析即可；`X-Request-Id` 由入口生成并贯通到应用。

## 7. 日常运维

```bash
docker compose ps                       # 状态与健康
docker compose logs -f --tail=100 nginx-proxy
docker compose logs -f --tail=100 acme-companion
docker compose exec -T nginx-proxy cat /etc/nginx/conf.d/entry.conf   # 当前生效配置
docker compose exec -T nginx-proxy ls -l /etc/nginx/certs/kaup-ai.com/

# 卷备份（证书与 ACME 状态）；恢复时反向 tar 回卷即可
docker run --rm -v kaup-ai-website_entry_certs:/data -v "$PWD:/backup" alpine \
  tar czf /backup/entry_certs.tgz -C /data .
docker run --rm -v kaup-ai-website_acme_state:/data -v "$PWD:/backup" alpine \
  tar czf /backup/acme_state.tgz -C /data .

# 镜像更新（安全补丁）
docker compose build --pull web && docker compose up -d
docker image prune -f
```

调参入口（改 `.env` 后 `docker compose up -d nginx-proxy`）：`ENTRY_RATE` / `ENTRY_LIMIT_REQ`（入口限流）、
`ENTRY_CLIENT_MAX_BODY_SIZE`（默认 1m）、`ENTRY_*_TIMEOUT`、`ENTRY_REAL_IP_CONFIG`（前置 CDN/SLB 时恢复真实客户端 IP）。

## 8. 安全清单

- 只对公网开 80/443（+ SSH）；别把 3000 暴露出去（`web` 只 `expose`，未映射宿主端口）。
- 密钥分层：`.env` 里的 ACME/DNS 凭证**不会**进入 `web` 容器（compose 只显式注入 `FEISHU_*` 与 `NITRO_*`）。
- `nginx-proxy` 与 `acme-companion` 需要 docker socket（`:ro`）：这是为了 docker-gen 与 reload。
  若安全策略不接受，可换纯 `nginx` 镜像并保留 acme-companion 的 reload 通道（与 kaup-core 模式的差异点，见 design 文档）。
- 不要长期启用 `ACME_CA_URI` 的 staging 值（浏览器会报不受信）。
- 需要"不被收录"的通道：入口加 `X-Robots-Tag: noindex`（与站点 URL 取值互不影响）。
- IPv6：当前只发布 IPv4；若域名有 AAAA 记录，需补 `[::]` 端口映射。

## 9. 故障排查

先看 [../nginx/README.md](../nginx/README.md) 第 8 节的通用表，生产高频场景：

| 现象                         | 排查                                                                                                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 首签一直失败                 | 80 是否公网可达（`curl -I http://kaup-ai.com/.well-known/acme-challenge/xxx`）；前置 CDN/WAF 是否放行该路径；`docker compose logs acme-companion`；实在不行切 DNS-01 |
| 签发成功但浏览器仍报证书错误 | 是否在用 staging CA；`openssl s_client` 看实际出示的证书与主机名                                                                                                     |
| 部分访客 429                 | 入口限流 `ENTRY_RATE` 太紧，或前置代理未设 `ENTRY_REAL_IP_CONFIG`（所有访客塌成一个 IP 桶）                                                                          |
| 表单必失败                   | `FEISHU_*` 是否注入（`docker compose exec -T web env \| grep FEISHU`）；飞书机器人密钥/表格权限是否有效                                                              |
| 页面 502                     | `docker compose ps` 看 `web` 是否 healthy；`docker compose logs --tail=50 web`                                                                                       |
| 内容更新没生效               | 是否漏了 `--build`（页面预渲染，必须重建镜像）                                                                                                                       |
