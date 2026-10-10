# 生产环境部署手册（自托管通道）

自托管通道把官网跑在自己的服务器上：`web`（Nuxt/Nitro 镜像）+ 入口 nginx（TLS 终止）

- `acme-companion`（证书签发/续期）。**与 Vercel 通道并存**，域名分工固定：
  自托管 = `kaup-ai.com`，Vercel = `kaup.ai`。

命令一律在仓库根执行。入口的变量全表、conf 渲染机制、证书细节与排障见 [../nginx/README.md](../nginx/README.md)；
本地开发见 [deploy-dev.md](deploy-dev.md)。

## 1. 前置条件（上线前逐项确认）

| 项           | 要求                                                                                | 自查                              |
| ------------ | ----------------------------------------------------------------------------------- | --------------------------------- |
| 服务器       | Linux x86_64/arm64，2C4G 起，磁盘 ≥ 10GB                                            | `df -h`                           |
| Docker       | Engine 24+，**Compose ≥ 2.24.4**（`!override` 语法）                                | `docker compose version`          |
| 端口         | 公网放行 **80** 与 **443**（HTTP-01 需 80 回源；80 还承担 301 跳转）                | `ss -lntp \| grep -E ':80\|:443'` |
| 域名         | `kaup-ai.com` 与 `www.kaup-ai.com` 的 A 记录指向本机公网 IP                         | `dig +short kaup-ai.com`          |
| 备案         | 境内服务器需已完成 ICP 备案（页脚备案号 `辽ICP备2026013176号-1`）                   | 服务商控制台                      |
| 邮箱         | ACME 账号邮箱（到期与恢复通知）                                                     | —                                 |
| 应用密钥     | 飞书 6 个变量（见 `.env.example` 的应用段落）；缺失时仅表单提交报 500，页面不受影响 | —                                 |
| DNS API 凭证 | 仅 **DNS-01** 档需要（80 不可达或前置 CDN 吞挑战路径时）                            | —                                 |

> 域名分工：**不要把自托管档绑到 `kaup.ai`**（那是 Vercel 通道的域名）。

### 镜像来源：境内/受限网络要「统一改成一个来源」

本栈用到三个镜像，它们**不在同一个发布渠道**，所以不存在"全官方 + 单一来源"的选项：

| 镜像                                 | Docker Hub        | GHCR                       | 说明                    |
| ------------------------------------ | ----------------- | -------------------------- | ----------------------- |
| `node:24-alpine`（web 基础镜像）     | ✅ `library/node` | ❌ 无                      | 官方发布只在 Docker Hub |
| `nginxproxy/nginx-proxy:1.11-alpine` | ✅                | ✅ `ghcr.io/nginx-proxy/…` | 两边同一制成品          |
| `nginxproxy/acme-companion:2.8`      | ✅                | ✅ `ghcr.io/nginx-proxy/…` | 两边同一制成品          |

⇒ 只能二选一作为唯一来源：**① 商业镜像加速站**（最省事）或 **② 自持阿里云 ACR**（生产推荐）。
两种做法都是「三个变量一起改」；**不要混用来源**（GHCR 覆盖不了 `node`，混用等于基础镜像的问题没解决）。

**选项 ①：三个镜像统一走商业镜像加速站**

示例用 `docker.1ms.run`（站点自述为「毫秒镜像」，国内商业 Docker 镜像加速服务：基础服务免费 +
按量计费，匿名可拉）。属第三方服务，我不掌握其运营主体与长期可用性；**实测三个镜像的
摘要/ID 与官方完全一致**（`node:24-alpine` digest = `sha256:ebfe2f90…`，两个入口镜像的
image ID 与 Docker Hub / GHCR 相同）⇒ 换源不引入内容差异。

```bash
# .env（三行一起设）
NODE_IMAGE=docker.1ms.run/library/node:24-alpine
ENTRY_NGINX_IMAGE=docker.1ms.run/nginxproxy/nginx-proxy:1.11-alpine
ACME_COMPANION_IMAGE=docker.1ms.run/nginxproxy/acme-companion:2.8

# 先单独拉三个镜像（把大下载与本地构建解耦，失败可单步重试），再起站
docker pull docker.1ms.run/library/node:24-alpine
docker pull docker.1ms.run/nginxproxy/nginx-proxy:1.11-alpine
docker pull docker.1ms.run/nginxproxy/acme-companion:2.8
docker compose up -d --build
```

**选项 ②（生产推荐）：三个镜像统一走自持阿里云 ACR**

单一来源、同云内网、无第三方依赖；代价是首次把三个镜像搬进自己的命名空间（在能直连的机器上做一次）：

```bash
ACR=registry.cn-hangzhou.aliyuncs.com/<你的命名空间>
docker login "$ACR"      # 容器镜像服务的凭证
for r in library/node:24-alpine nginxproxy/nginx-proxy:1.11-alpine nginxproxy/acme-companion:2.8; do
  t="$ACR/${r#*/}"
  docker pull "docker.io/$r" && docker tag "docker.io/$r" "$t" && docker push "$t"
done
```

```bash
# 服务器 .env（三行一起设；同地域可用 VPC 端点，内网拉取不计公网流量）
NODE_IMAGE=registry-vpc.cn-hangzhou.aliyuncs.com/<命名空间>/node:24-alpine
ENTRY_NGINX_IMAGE=registry-vpc.cn-hangzhou.aliyuncs.com/<命名空间>/nginx-proxy:1.11-alpine
ACME_COMPANION_IMAGE=registry-vpc.cn-hangzhou.aliyuncs.com/<命名空间>/acme-companion:2.8
```

**两个必须知道的坑**

1. **BuildKit 解析 `FROM` 基础镜像时不保证走 daemon 的 `registry-mirrors`。**
   典型报错 `load metadata for docker.io/library/node:24-alpine ... i/o timeout` —— 它直接打了
   `registry-1.docker.io`，你在 `daemon.json` 里配的加速器根本没参与。这正是 `NODE_IMAGE`
   也要一起换源的原因。
2. **会回 404 的镜像站不要放在 `registry-mirrors` 靠前位置。** 阿里云加速器
   （`*.mirror.aliyuncs.com`）是 Docker Hub 的被动缓存，未缓存的 tag 直接回 `not found`；
   Docker 客户端收到 404 **不会**回落到 Docker Hub ⇒ 现象是"tag 不存在"，其实 tag 是好的。

**兜底：离线搬运**（最确定，不受任何镜像源影响）

```bash
# 能直连的机器
docker save node:24-alpine nginxproxy/nginx-proxy:1.11-alpine nginxproxy/acme-companion:2.8 \
  | gzip > kaup-entry-images.tgz     # 约 108MB
scp kaup-entry-images.tgz admin@<ecs-ip>:~/

# 服务器
gunzip -c ~/kaup-entry-images.tgz | docker load
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

# 3) 构建并启动（web + 入口 + ACME）
docker compose up -d --build

# 4) 看首次签发过程（HTTP-01 需 80 可达）
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

```bash
git pull
docker compose up -d --build      # 重新构建镜像 + 滚动重建容器
docker compose ps
curl -s -o /dev/null -w '%{http_code}\n' https://kaup-ai.com/
```

要点与代价：

- **页面与站点级文件都是预渲染的**（`/`、`/capabilities`、`/services`、`/about`、`/contact`、
  `/robots.txt`、`/sitemap.xml`、`/llms.txt`），所以**改内容必须重建镜像**，只 `restart` 不生效。
- `web` 容器重建期间入口会短暂返回 502（秒级）。当前为**单副本**部署，要消除这个窗口需要
  多副本 / 蓝绿（登记为后续项；注意 `/api/contact` 的限流状态在进程内，多副本前需改共享存储）。
- 只改了入口 conf / `.env`（未改应用）时：`docker compose up -d nginx-proxy`（会重建入口并重跑渲染）。
- 域名（`NUXT_PUBLIC_SITE_URL`）变化必须**重建镜像**：`docker build --build-arg NUXT_PUBLIC_SITE_URL=https://新域名 .`

## 4. 回滚

| 场景                       | 动作                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新版有问题                 | `git checkout <上一个提交>` → `docker compose up -d --build`（重建是发版动作，回滚同样走重建）                                                          |
| 想立即止血（保留上一镜像） | 发布前先给镜像打标签：`docker tag kaup-ai-website:latest kaup-ai-website:prev`；回滚时 `docker compose up -d` 前把 compose 的 `image:` 临时指向 `:prev` |
| 摘除整条自托管通道         | `docker compose down`（容器停、证书卷保留）；把 DNS 切回 Vercel，线上即回到 Vercel 通道                                                                 |
| 彻底清理                   | `docker compose down -v`（**会删证书卷与 ACME 账号状态**，需重新签发；非必要不执行）                                                                    |

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
