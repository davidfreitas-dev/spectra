<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppButton from './AppButton.vue'
import AppIcon from './AppIcon.vue'
import { useAuthStore } from '@/stores/authStore'

interface NavItem {
  label: string
  to?: string
  href?: string
  active?: boolean
}

interface Props {
  brandName?: string
  version?: string
  navItems?: NavItem[]
  signUpText?: string
  showUser?: boolean
  maxWidth?: string
}

withDefaults(defineProps<Props>(), {
  brandName: 'Spectra',
  version: 'v1.0.0',
  navItems: () => [
    { label: 'Hoje', to: '/' },
    { label: 'Treinos', to: '/workouts' },
    { label: 'Exercícios', to: '/exercises' },
    { label: 'Progresso', to: '/progress' },
    // { label: 'Componentes', to: '/components' },
  ],
  signUpText: 'Iniciar Treino',
  showUser: true,
  maxWidth: 'max-w-300',
})

const emit = defineEmits<{
  (e: 'nav-click', item: NavItem): void
  (e: 'user-click'): void
  (e: 'start-today'): void
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

function isItemActive(item: NavItem): boolean {
  if (item.active !== undefined) return item.active
  if (item.to) {
    if (item.to === '/') return route?.path === '/'
    return route?.path === item.to || route?.path?.startsWith(item.to + '/')
  }
  return false
}

function goToSettings() {
  emit('user-click')
  router.push('/settings')
}

function handleStartTodayWorkout() {
  emit('start-today')
  router.push({ path: '/', query: { start: 'true', _t: Date.now().toString() } })
}
</script>

<template>
  <header class="sticky top-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-xl border-b border-border-grid z-50 select-none px-4 sm:px-6 lg:px-8">
    <div :class="[maxWidth, 'mx-auto h-full flex items-center justify-between gap-4']">
      <!-- Left: Logo & Desktop Navigation Links -->
      <div class="flex items-center gap-6 lg:gap-8">
        <!-- Brand Logo (Natural Alignment) -->
        <RouterLink to="/" class="flex items-center gap-2 group outline-none">
          <div class="grid grid-cols-2 gap-0.5 w-5 h-5">
            <span class="w-2 h-2 rounded-xs bg-primary-container transition-transform group-hover:scale-110" />
            <span class="w-2 h-2 rounded-xs bg-primary-container transition-transform group-hover:scale-110" />
            <span class="w-2 h-2 rounded-xs bg-primary-container transition-transform group-hover:scale-110" />
            <span class="w-2 h-2 rounded-xs bg-primary-container transition-transform group-hover:scale-110" />
          </div>
          <span class="font-headline-md text-base sm:text-lg font-bold tracking-tight text-ink">
            {{ brandName }}<span class="text-primary-container">.</span>
          </span>
        </RouterLink>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-1" aria-label="Menu Principal">
          <template v-for="item in navItems" :key="item.label">
            <RouterLink
              v-if="item.to"
              :to="item.to"
              class="px-3.5 py-1 rounded-full font-button-text text-xs transition-all cursor-pointer"
              :class="isItemActive(item)
                ? 'border border-ink bg-surface shadow-[0_2px_0_0_#111111] text-ink font-bold'
                : 'text-ink-muted hover:text-ink font-medium'"
              @click="emit('nav-click', item)"
            >
              {{ item.label }}
            </RouterLink>
            <a
              v-else
              :href="item.href || '#'"
              class="px-3.5 py-1 rounded-full font-button-text text-xs transition-all cursor-pointer"
              :class="isItemActive(item)
                ? 'border border-ink bg-surface shadow-[0_2px_0_0_#111111] text-ink font-bold'
                : 'text-ink-muted hover:text-ink font-medium'"
              @click="emit('nav-click', item)"
            >
              {{ item.label }}
            </a>
          </template>
        </nav>
      </div>

      <!-- Right: Version, Action CTA, Settings -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Version Badge -->
        <div class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-bg-alternate border border-border-grid font-eyebrow text-[10px] text-ink-muted tracking-wider uppercase font-bold">
          {{ version }}
        </div>

        <!-- Action Button (Desktop / Expanded: Full with text) -->
        <div class="hidden md:inline-flex">
          <AppButton
            variant="fill"
            size="sm"
            @click="handleStartTodayWorkout"
          >
            <AppIcon name="play" :size="16" />
            <span>{{ signUpText }}</span>
          </AppButton>
        </div>

        <!-- Action Button (Mobile / Collapsed: Icon-Only) -->
        <div class="inline-flex md:hidden">
          <AppButton
            variant="fill"
            size="sm"
            icon-only
            title="Iniciar Treino"
            aria-label="Iniciar Treino"
            @click="handleStartTodayWorkout"
          >
            <AppIcon name="play" :size="18" />
          </AppButton>
        </div>

        <!-- Settings / Account Button -->
        <!-- Se autenticado: avatar do usuário com indicador de nuvem (substitui o ícone de engrenagem) -->
        <button
          v-if="showUser && authStore.isAuthenticated"
          type="button"
          class="relative flex items-center justify-center w-9 h-9 rounded-full border-2 border-border-primary overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer bg-surface shadow-[0_1.5px_0_0_#111111] shrink-0"
          title="Minha Conta & Configurações"
          aria-label="Minha Conta & Configurações"
          @click="goToSettings"
        >
          <img
            v-if="authStore.userPhotoURL"
            :src="authStore.userPhotoURL"
            :alt="authStore.userDisplayName"
            class="w-full h-full object-cover"
            referrerpolicy="no-referrer"
          />
          <div
            v-else
            class="w-full h-full bg-primary-soft text-primary font-bold text-xs flex items-center justify-center"
          >
            {{ authStore.userDisplayName.slice(0, 1).toUpperCase() }}
          </div>
        </button>

        <!-- Se visitante: botão padrão de engrenagem -->
        <AppButton
          v-else-if="showUser"
          variant="outline"
          size="sm"
          icon-only
          title="Configurações"
          aria-label="Configurações"
          @click="goToSettings"
        >
          <slot name="user-icon">
            <AppIcon name="settings" :size="18" />
          </slot>
        </AppButton>
      </div>
    </div>
  </header>
</template>
