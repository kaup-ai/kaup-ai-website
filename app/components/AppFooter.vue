<script setup lang="ts">
const year = new Date().getFullYear()

const nav = [
  { label: '首页', to: '/' },
  { label: '平台能力', to: '/capabilities' },
  { label: '服务与合作', to: '/services' },
  { label: '关于我们', to: '/about' },
  { label: '联系我们', to: '/contact' }
]

const capabilities = [
  { label: '智能拓客与触达', to: '/capabilities#acquisition' },
  { label: 'Agent 自主决策与 HITL 安全', to: '/capabilities#agent' },
  { label: '客户全生命周期管理', to: '/capabilities#crm' },
  { label: '本地部署 / 私有化', to: '/capabilities#deploy' }
]

const contact = [
  { label: '(0411)8830-9999', to: 'tel:+8641188309999', mono: true },
  { label: 'sales@kaup.ai', to: 'mailto:sales@kaup.ai', mono: true },
  { label: '公众号 / 微信二维码', to: '/contact', mono: false }
]
</script>

<template>
  <!-- 顶缘凹槽：暗线 + 内亮线（与页眉底缘同一语言） -->
  <footer class="border-t border-default shadow-[inset_0_1px_0_var(--edge-hi)]">
    <UContainer class="py-16">
      <div class="grid gap-10 md:grid-cols-[1.5fr_1fr_1.4fr_1fr]">
        <div>
          <AppLogo class="h-12 w-auto" />
          <p class="mt-4 max-w-60 text-sm leading-relaxed text-muted">
            以 AI 助力企业超越能力和效率的边界，重新定义无限可能。
          </p>
        </div>
        <nav aria-label="页脚导航">
          <h4 class="text-sm font-semibold">导航</h4>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li v-for="l in nav" :key="l.to">
              <ULink :to="l.to" class="text-muted hover:text-default">{{ l.label }}</ULink>
            </li>
          </ul>
        </nav>
        <nav aria-label="核心能力">
          <h4 class="text-sm font-semibold">核心能力</h4>
          <ul class="mt-4 space-y-2.5 text-sm">
            <li v-for="l in capabilities" :key="l.to">
              <ULink :to="l.to" class="text-muted hover:text-default">{{ l.label }}</ULink>
            </li>
          </ul>
        </nav>
        <div>
          <h4 class="text-sm font-semibold">联系</h4>
          <ul class="mt-4 space-y-2.5 text-sm text-muted">
            <li v-for="c in contact" :key="c.to">
              <ULink
                :to="c.to"
                :class="c.mono ? 'font-mono' : undefined"
                class="hover:text-default"
                >{{ c.label }}</ULink
              >
            </li>
            <li>辽宁 · 大连</li>
          </ul>
        </div>
      </div>
    </UContainer>
    <div class="border-t border-default">
      <UContainer
        class="flex flex-wrap items-center justify-between gap-2 py-6 text-xs text-dimmed"
      >
        <span>© {{ year }} 智御无疆 · Kaup. 保留所有权利。</span>
        <span>智以为御，无疆为境 · Kaup Your Trade</span>
      </UContainer>
    </div>
  </footer>
</template>
