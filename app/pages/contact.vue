<script setup lang="ts">
useKaupSeo(
  {
    title: '联系我们 — 智御无疆 Kaup',
    description:
      '以 AI 助力企业超越能力和效率的边界，重新定义无限可能。在线表单提交定制开发与本地部署需求，商务联系人一个工作日内回电；也可邮件 sales@kaup.ai 或扫码添加微信。',
    ogDescription: '在线表单提交定制开发与本地部署需求，商务联系人一个工作日内回电。'
  },
  '/contact'
)

const steps = [
  { n: '01', h: '需求沟通', p: '了解行业属性与合规要求' },
  { n: '02', h: '方案设计', p: '确定定制范围与交付边界' },
  { n: '03', h: '定制开发', p: '组合、裁剪 Agent 能力' },
  { n: '04', h: '部署交付', p: '私有化部署与环境交付' },
  { n: '05', h: '运维支持', p: '持续运维与迭代培训' }
]

const qrs = [
  {
    src: '/qr/official-account.jpg',
    alt: '智御无疆 微信公众号二维码',
    h: '关注公众号',
    p: '获取智御无疆的产品更新与外贸 AI Agent 实践内容。'
  },
  {
    src: '/qr/contact-wechat.png',
    alt: '智御无疆 商务微信二维码',
    h: '添加联系人微信',
    p: '扫码添加商务联系人，沟通定制开发与部署方案。'
  }
]
</script>

<template>
  <div>
    <!-- 页头 -->
    <section class="py-16 md:py-24">
      <UContainer>
        <div class="max-w-3xl">
          <KEyebrow text="联系我们" />
          <h1
            class="metal-ink mt-4 text-3xl font-semibold tracking-tight text-highlighted md:text-5xl"
          >
            沟通定制开发与本地部署事宜
          </h1>
          <p class="mt-6 text-lg text-muted md:text-xl">
            以 AI 助力企业超越能力和效率的边界，重新定义无限可能
          </p>
          <p class="mt-4 leading-relaxed text-toned">
            填写下方表单，商务联系人会在一个工作日内回电；也可以直接发邮件或扫码添加微信，我们会就行业属性、业务流程与合规要求做一次需求沟通。
          </p>
        </div>
      </UContainer>
    </section>

    <!-- 表单 + 其他联系方式 -->
    <section class="pb-24">
      <UContainer>
        <div class="grid gap-10 lg:grid-cols-2">
          <div>
            <KEyebrow text="在线提交" class="mb-4" />
            <!-- 表单提交到 server/api/contact.ts（契约见 contact.contract.md） -->
            <KCard v-reveal class="p-6 md:p-8">
              <ContactForm />
            </KCard>
          </div>

          <div class="lg:pt-9">
            <!-- kicker 变体（无琥珀点）：本屏琥珀预算已留给「在线提交」1 处 -->
            <KEyebrow :amber="false" text="其他联系方式" class="mb-4" />
            <ul class="space-y-3 text-sm">
              <li class="flex gap-4">
                <span class="w-20 shrink-0 text-muted">邮箱</span>
                <a href="mailto:sales@kaup.ai" class="font-mono text-primary hover:underline"
                  >sales@kaup.ai</a
                >
              </li>
              <li class="flex gap-4">
                <span class="w-20 shrink-0 text-muted">所在地</span>
                <span>辽宁 · 大连</span>
              </li>
              <li class="flex gap-4">
                <span class="w-20 shrink-0 text-muted">服务范围</span>
                <span>AI Agent 定制开发 · 本地部署 / 私有化 · 运维支持</span>
              </li>
            </ul>

            <KCard v-reveal class="mt-8 p-6">
              <h3 class="font-semibold">提交后会发生什么</h3>
              <ol class="mt-4 space-y-3 text-sm text-toned">
                <li class="flex gap-3">
                  <span class="font-mono text-xs text-dimmed">01</span
                  ><span>一个工作日内，商务联系人按你留的电话回电</span>
                </li>
                <li class="flex gap-3">
                  <span class="font-mono text-xs text-dimmed">02</span
                  ><span>一次需求沟通，聚焦行业属性、业务流程与合规要求</span>
                </li>
                <li class="flex gap-3">
                  <span class="font-mono text-xs text-dimmed">03</span
                  ><span>沟通后给出可行的落地顺序与部署方式建议</span>
                </li>
              </ol>
            </KCard>
          </div>
        </div>

        <!-- 二维码 -->
        <div class="mt-12 grid gap-6 sm:grid-cols-2">
          <KCard
            v-for="qr in qrs"
            :key="qr.src"
            v-reveal
            as="article"
            hover
            class="p-6 text-center"
          >
            <div
              class="mx-auto size-[260px] max-w-full overflow-hidden rounded-lg border border-default bg-default p-2"
            >
              <img
                :src="qr.src"
                :alt="qr.alt"
                width="260"
                height="260"
                loading="lazy"
                class="size-full object-contain"
              />
            </div>
            <h3 class="mt-5 font-semibold">
              {{ qr.h }}
            </h3>
            <p class="mt-2 text-sm text-muted">
              {{ qr.p }}
            </p>
          </KCard>
        </div>
      </UContainer>
    </section>

    <!-- 合作流程 -->
    <section class="pb-24">
      <UContainer>
        <div class="mb-10 max-w-3xl">
          <KEyebrow :amber="false" text="合作流程" />
          <h2
            class="metal-ink mt-4 text-2xl font-semibold tracking-tight text-highlighted md:text-4xl"
          >
            从一次沟通开始
          </h2>
        </div>
        <ol class="grid gap-8 border-t border-default pt-8 sm:grid-cols-3 lg:grid-cols-5">
          <li v-for="s in steps" :key="s.n" class="relative">
            <span class="font-mono text-xs text-dimmed">{{ s.n }}</span>
            <h3 class="mt-3 flex items-center gap-2 text-base font-medium">
              {{ s.h }}
            </h3>
            <p class="mt-1.5 text-sm text-muted">
              {{ s.p }}
            </p>
          </li>
        </ol>
      </UContainer>
    </section>
  </div>
</template>
