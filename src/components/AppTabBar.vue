<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import type { AppIconName } from './icons'

export interface TabItem {
  label: string
  to: string
  icon: AppIconName
}

interface Props {
  tabs?: TabItem[]
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [
    { label: 'Hoje', to: '/', icon: 'calendar' },
    { label: 'Treinos', to: '/workouts', icon: 'flame' },
    { label: 'Exercícios', to: '/exercises', icon: 'dumbbell' },
    { label: 'Progresso', to: '/progress', icon: 'trending_up' },
  ],
})

const route = useRoute()

function isTabActive(tab: TabItem): boolean {
  if (tab.to === '/') {
    return route?.path === '/'
  }
  return route?.path === tab.to || route?.path?.startsWith(tab.to + '/')
}

const activeIndex = computed(() => {
  return props.tabs.findIndex((tab) => isTabActive(tab))
})
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border-grid md:hidden select-none pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
    aria-label="Navegação móvel inferior"
  >
    <div class="relative grid grid-cols-4 items-center max-w-md mx-auto">
      <!-- Sliding active indicator pill -->
      <div
        class="absolute inset-y-0 left-0 w-1/4 p-0.5 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
        :class="activeIndex === -1 ? 'opacity-0 scale-95' : 'opacity-100 scale-100'"
        :style="{ transform: `translateX(${Math.max(0, activeIndex) * 100}%)` }"
      >
        <div class="w-full h-14 bg-primary-soft rounded-xl shadow-xs" />
      </div>

      <!-- Navigation tab items -->
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="relative z-10 flex items-center justify-center w-full p-0.5 cursor-pointer outline-none group"
        :aria-current="isTabActive(tab) ? 'page' : undefined"
      >
        <div class="flex flex-col items-center justify-center w-full h-14 rounded-xl transition-colors duration-200">
          <AppIcon
            :name="tab.icon"
            :size="22"
            :stroke-width="isTabActive(tab) ? 2.5 : 2"
            class="transition-colors duration-200"
            :class="isTabActive(tab) ? 'text-primary-container' : 'text-ink-muted group-hover:text-ink'"
          />

          <span
            class="font-headline text-[11px] sm:text-xs leading-tight tracking-tight mt-1 text-center transition-colors duration-200"
            :class="isTabActive(tab) ? 'font-bold text-primary-container' : 'font-medium text-ink-muted group-hover:text-ink'"
          >
            {{ tab.label }}
          </span>
        </div>
      </RouterLink>
    </div>
  </nav>
</template>
