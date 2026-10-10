# =============================================================================
# Kaup 官网生产镜像（Nuxt 4 / Nitro node-server）
#   构建：docker build -t kaup-ai-website:latest .
#   运行：见 docker-compose.yml（由 nginx 入口做 TLS 终止，本容器只暴露 3000）
#   产物：仅 .output（server + 预渲染 public），源码与 devDependencies 不进运行层
#
# 基础镜像来源可覆盖（受限网络/境内主机）：
#   docker build --build-arg NODE_IMAGE=docker.1ms.run/library/node:24-alpine .
#   （BuildKit 解析基础镜像时不保证走 daemon 的 registry-mirrors，故此处留出显式开关；
#     也可先用 daemon 拉好再构建，见 docs/deploy-prod.md「境内主机」一节）
# =============================================================================

ARG NODE_IMAGE=node:24-alpine

# ---------- 依赖层：只装依赖，利用层缓存 ----------
# Node 24（LTS）：Nuxt 4 与 Nuxt Content 的 `sqliteConnector: 'native'`（node:sqlite，>= 22.5）均满足。
FROM ${NODE_IMAGE} AS deps
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
# lockfile 与 workspace 声明先行：源码变更不使依赖层失效
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# --ignore-scripts：postinstall 的 `nuxt prepare` 此时还没有源码；husky 等宿主脚本在镜像里也无意义。
# （构建期需要的 prepare 由 `nuxt build` 内部完成）
RUN pnpm install --frozen-lockfile --ignore-scripts

# ---------- 构建层 ----------
FROM deps AS build
# 站点根 URL：预渲染期写入 canonical / og:url / JSON-LD 与 robots、sitemap（单一事实源见
# shared/utils/site-url.ts）。自托管通道域名 = kaup-ai.com；Vercel 通道在项目环境变量里设 kaup.ai。
ARG NUXT_PUBLIC_SITE_URL=https://kaup-ai.com
ENV NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL}
COPY . .
RUN pnpm build

# ---------- 运行层 ----------
FROM ${NODE_IMAGE} AS runner
ARG NUXT_PUBLIC_SITE_URL=https://kaup-ai.com
ENV NODE_ENV=production \
    NITRO_PORT=3000 \
    NITRO_HOST=0.0.0.0 \
    NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL}
WORKDIR /app
# /app 归属非 root 用户：Nuxt Content 的 SQLite 在运行期按需落盘到 cwd（./contents.sqlite），
# 与 Vercel 档走 /tmp 的语义等价——这里让 cwd 本身可写，避免额外依赖运行时来源。
RUN chown node:node /app
COPY --from=build --chown=node:node /app/.output /app/.output
USER node
EXPOSE 3000
# 探针走静态产物（进程存活即为真），不触发 SSR 与业务逻辑
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:3000/robots.txt || exit 1
CMD ["node", ".output/server/index.mjs"]
