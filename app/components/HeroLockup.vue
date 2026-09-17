<!-- hero 主视觉 lockup —— 与 legacy index.html 内联 SVG 1:1（光学对齐注释见 legacy 原文）。
     构图：mark + 「智御无疆」为单元一，「Kaup」从属于 CN 词标中轴居中；
     viewBox 中轴 = 整块墨迹中轴，容器居中即整体墨迹居中。
     呼吸灯：motion-safe: 前缀让 reduced-motion 用户拿到静止版（光晕 opacity=0 = 隐藏）。 -->
<template>
  <svg
    viewBox="31.89 38 407.5 73.75"
    role="img"
    aria-label="智御无疆 Kaup"
    class="block w-full text-primary dark:text-highlighted"
  >
    <g transform="translate(231.03 74.77) scale(0.87) translate(-231.03 -74.77)">
      <g transform="translate(68 19.37)">
        <g transform="rotate(-15 50 50)">
          <path
            class="fill-current"
            d="M 15 15 C 25 20, 55 35, 80 50 C 55 65, 25 80, 15 85 L 40 85 C 50 78, 75 65, 85 50 C 75 35, 50 22, 40 15 Z"
          />
          <!-- 光晕在核心点下层：同一条 4.2s 呼吸曲线；opacity 属性兜底 0（reduced-motion = 隐藏） -->
          <circle
            class="motion-safe:kaup-dot-glow"
            cx="76"
            cy="50"
            r="11"
            fill="#E89B3C"
            opacity="0"
          />
          <circle class="motion-safe:kaup-dot" cx="76" cy="50" r="5" fill="#E89B3C" />
        </g>
      </g>
      <!-- anchor:start + 显式 x：消除 Chromium/WebKit 对「middle + 尾随字距」的口径差异 -->
      <text
        x="170.97"
        y="78"
        class="fill-current"
        style="font-size: 48px; font-weight: 600; letter-spacing: 0.18em; text-anchor: start"
      >
        智御无疆
      </text>
      <text
        x="258.09"
        y="110"
        class="fill-[var(--ui-text-muted)]"
        style="
          font-family:
            'Inter',
            -apple-system,
            'SF Pro Display',
            system-ui,
            sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.4em;
          text-anchor: start;
        "
      >
        Kaup
      </text>
    </g>
  </svg>
</template>
