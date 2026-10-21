<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppButton from './AppButton.vue'
import AppIcon from './AppIcon.vue'

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
  (e: 'sign-up'): void
  (e: 'user-click'): void
  (e: 'start-today'): void
}>()

const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)

function isItemActive(item: NavItem): boolean {
  if (item.active !== undefined) return item.active
  if (item.to) {
    if (item.to === '/') return route?.path === '/'
    return route?.path === item.to || route?.path?.startsWith(item.to + '/')
  }
  return false
}

function handleSignUp() {
  emit('sign-up')
  router.push('/workouts')
  mobileMenuOpen.value = false
}

function goToSettings() {
  mobileMenuOpen.value = false
  emit('user-click')
  router.push('/settings')
}

function handleStartTodayWorkout() {
  mobileMenuOpen.value = false
  emit('start-today')
  router.push({ path: '/', query: { start: 'true', _t: Date.now().toString() } })
}

// Bloqueia o scroll do body quando o menu mobile estiver aberto
watch(mobileMenuOpen, (isOpen) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

// Fecha o menu móvel ao mudar de rota
watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
  }
)
</script>

<template>
  <header class="sticky top-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-xl border-b border-border-grid z-50 select-none px-4 sm:px-6 lg:px-8">
    <div :class="[maxWidth, 'relative mx-auto h-full flex items-center justify-between gap-4']">
      <!-- Left: Mobile Hamburger & Logo & Navigation -->
      <div class="flex items-center gap-2.5 sm:gap-6 lg:gap-8">
        <!-- Mobile Menu Toggle Button (Left of Logo on Mobile) -->
        <button
          type="button"
          class="md:hidden w-8 h-8 rounded-lg bg-bg-alternate border border-border-primary flex items-center justify-center text-ink shadow-[0_1px_0_0_#111111] active:translate-y-px transition-all cursor-pointer"
          :aria-expanded="mobileMenuOpen"
          aria-label="Abrir menu de navegação"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <AppIcon :name="mobileMenuOpen ? 'close' : 'menu'" :size="18" />
        </button>

        <!-- Brand Logo (Centered on Mobile, Flowing on Desktop) -->
        <RouterLink to="/" class="flex items-center gap-2 group outline-none md:static absolute left-1/2 -translate-x-1/2 md:translate-x-0">
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
              class="px-3.5 py-1 rounded-full font-button-text text-xs transition-all"
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
              class="px-3.5 py-1 rounded-full font-button-text text-xs transition-all"
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
            @click="handleSignUp"
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
            @click="handleSignUp"
          >
            <AppIcon name="play" :size="18" />
          </AppButton>
        </div>

        <!-- Settings Button (Secondary Outline Variant, Icon-Only) -->
        <AppButton
          v-if="showUser"
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

    <!-- Fullscreen Mobile Menu Overlay (Matching Reference Design) -->
    <teleport to="body">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-[0.98]"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-[0.98]"
      >
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-50 bg-surface flex flex-col justify-between p-6 sm:p-8 select-none overflow-y-auto"
        >
          <!-- Top Row: Close (Orange), Title/Logo (Centered), Icon (Orange) -->
          <div class="flex items-center justify-between">
            <button
              type="button"
              class="w-10 h-10 flex items-center justify-start text-primary-container hover:opacity-75 transition-opacity cursor-pointer outline-none"
              aria-label="Fechar menu"
              @click="mobileMenuOpen = false"
            >
              <AppIcon name="close" :size="24" stroke-width="2.5" />
            </button>

            <!-- Brand Logo (Same as Standard Navbar) -->
            <RouterLink to="/" class="flex items-center gap-2 group outline-none" @click="mobileMenuOpen = false">
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

            <button
              type="button"
              class="w-10 h-10 flex items-center justify-end text-primary-container hover:opacity-75 transition-opacity cursor-pointer outline-none"
              aria-label="Configurações"
              @click="goToSettings"
            >
              <AppIcon name="settings" :size="24" />
            </button>
          </div>

          <!-- Center Content: Primary Nav Links -->
          <div class="my-auto py-8 flex flex-col items-center text-center space-y-7">
            <!-- Primary Navigation Links (Spacious, Uppercase, Centered) -->
            <nav class="flex flex-col items-center space-y-6">
              <RouterLink
                v-for="item in navItems"
                :key="item.label"
                :to="item.to || '/'"
                class="font-display text-sm tracking-[0.28em] font-bold uppercase transition-colors"
                :class="isItemActive(item)
                  ? 'text-primary-container font-black'
                  : 'text-ink hover:text-primary-container'"
                @click="mobileMenuOpen = false"
              >
                {{ item.label }}
              </RouterLink>
            </nav>
          </div>

          <!-- Bottom: Iniciar Treino do Dia Action Button -->
          <div class="w-full max-w-xs mx-auto pb-4">
            <AppButton
              variant="fill"
              size="lg"
              class="w-full"
              @click="handleStartTodayWorkout"
            >
              <AppIcon name="play" :size="20" />
              Iniciar Treino do Dia
            </AppButton>
          </div>
        </div>
      </transition>
    </teleport>
  </header>
</template>
