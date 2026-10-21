<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { CircleAlert } from '@lucide/vue'
import { iconMap, type AppIconName } from './icons'

interface Props {
  name: AppIconName
  size?: number | string
  strokeWidth?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  size: 18,
  strokeWidth: 2,
})

const resolvedIcon = computed<Component | undefined>(() => {
  return iconMap[props.name] ?? CircleAlert
})
</script>

<template>
  <component
    :is="resolvedIcon"
    :size="size"
    :stroke-width="strokeWidth"
    aria-hidden="true"
    class="shrink-0 inline-flex"
  />
</template>
