<script setup lang="ts">
const colorMode = useColorMode()
const src = computed(() => colorMode.value === 'dark' ? '/brand/logo-horizontal-dark.svg' : '/brand/logo-horizontal.svg')
</script>

<template>
  <img :src="src" alt="智御无疆 Kaup" class="h-8 w-auto" height="32">
</template>
