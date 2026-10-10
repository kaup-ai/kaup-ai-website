# 执行计划

## 交付物

- [ ] `Dockerfile`、`.dockerignore`
- [ ] `docker-compose.yml`（web + nginx-proxy + acme-companion）、`docker-compose.dev.yml`（本地档）
- [ ] `nginx/entry.conf.template`、`nginx/entry-routing.conf`、`nginx/entry-location.conf`、`nginx/entry-security-headers.conf`
- [ ] `.env.example`；`.gitignore` 放行 `.env.example`
- [ ] `scripts/gen-dev-certs.sh`、`scripts/dev-tls-check.sh`
- [ ] `nginx/README.md`（运维手册）；`README.md` 增「Docker 部署」入口
- [ ] 按环境拆分的部署手册：`docs/deploy-dev.md`（开发）、`docs/deploy-prod.md`（生产）
- [ ] 站点 URL 可配置：`shared/utils/site-url.ts`、`server/routes/robots.txt.ts`、
      `server/routes/sitemap.xml.ts`（删除 `public/robots.txt`、`public/sitemap.xml`），
      Dockerfile ARG / compose env / `.env.example` 三处注入 `NUXT_PUBLIC_SITE_URL`

## 步骤

1. 静态层：写镜像与 conf；`docker compose config` 校验 prod / prod+dev 两档解析。
2. 渲染层：用宿主 `envsubst` 复现容器内渲染，核对白名单只替换 ENTRY_*、nginx 自身变量保留。
3. 镜像层：`docker build` 产出镜像；确认镜像内非 root 且 `.output` 就位。
4. 联调层（dev 档）：`up -d` 后 curl `/`、`/robots.txt`、`/_nuxt/…`、`/api/contact`（405）、`/entry-health`。
5. TLS 层：生成自签证书 → TLS 档起 8443 → `curl -k` 200 且能按 SNI 出证。
6. 轮换层：`scripts/dev-tls-check.sh` —— 重签 → `nginx -s reload` → 指纹变更判据通过。
7. 收尾：`docker compose down`；确认无遗留容器/网络。
8. 双通道回归：确认未改 `nuxt.config.ts` / `app/` / `server/`（`git status` 只含新增部署物），
   即 Vercel 通道构建输入不变。

## 验证命令（可复跑）

```bash
cp .env.example .env            # 填 ENTRY_HOST / ACME_EMAIL
docker compose config -q
docker compose -f docker-compose.yml -f docker-compose.dev.yml config -q
docker build -t kaup-ai-website:local .
bash scripts/dev-tls-check.sh

# 站点 URL 跟随构建取值（AC11）：默认档 ⇒ kaup.ai；覆盖档 ⇒ kaup-ai.com
pnpm build && rg -o '<link rel="canonical"[^>]*>' .output/public/index.html
NUXT_PUBLIC_SITE_URL=https://kaup-ai.com pnpm build && head -1 .output/public/robots.txt
```

## 回滚点

- 未改应用代码；删除新增文件即回到纯 Vercel 通道形态（两条通道本来就并存，自托管停用不影响 Vercel）。
- `docker compose down -v` 会删证书卷（重新签发即可），非必要不执行。
