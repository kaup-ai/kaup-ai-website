<script setup lang="ts">
/* 表格（源 .table-wrap + table 样式）：
   - 表头/行头 = 拉丝导轨（muted 底 + 机加工细丝线 + 顶缘内亮线）
   - 列宽只约束行头列（tbody th）——若挂在 th 上，thead 列头会分走宽度，
     三列表在窄屏把长文本列挤成竖排单字（site.css 实测坑）
   - plain：行头透明底（services 模式对比 / about 层级定位） */
defineProps<{
  caption: string
  head?: string[]
  rows: { head: string; cells: string[] }[]
  plain?: boolean
}>()
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-default bg-default shadow-[var(--plate-shadow)]"
  >
    <table class="w-full border-collapse text-sm">
      <caption class="sr-only">
        {{
          caption
        }}
      </caption>
      <thead v-if="head">
        <tr>
          <th
            v-for="col in head"
            :key="col"
            scope="col"
            class="border-b border-default bg-muted bg-[image:var(--metal-lines)] px-5 py-4 text-left align-top font-mono text-xs font-medium tracking-[0.02em] text-muted shadow-[inset_0_1px_0_var(--edge-hi)] max-[640px]:px-4 max-[640px]:py-3"
          >
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="row.head">
          <th
            scope="row"
            class="w-[30%] border-b border-default px-5 py-4 text-left align-top font-mono text-xs font-medium tracking-[0.02em] text-muted max-[640px]:w-[38%] max-[640px]:px-4 max-[640px]:py-3"
            :class="[
              i === rows.length - 1 ? 'border-b-0' : undefined,
              plain
                ? undefined
                : 'bg-muted bg-[image:var(--metal-lines)] shadow-[inset_0_1px_0_var(--edge-hi)]'
            ]"
          >
            {{ row.head }}
          </th>
          <td
            v-for="(cell, j) in row.cells"
            :key="j"
            class="border-b border-default px-5 py-4 align-top text-toned max-[640px]:px-4 max-[640px]:py-3"
            :class="i === rows.length - 1 ? 'border-b-0' : undefined"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
