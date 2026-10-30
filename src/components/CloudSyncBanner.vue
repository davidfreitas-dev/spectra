<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import AppIcon from './AppIcon.vue'
import AppSpinner from './AppSpinner.vue'

interface Props {
  variant?: 'card' | 'banner'
  title: string
  description: string
  buttonText?: string
  contextKey: 'workout_summary' | 'workout_created' | 'progress_view'
  showDismissButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'card',
  buttonText: 'Salvar com Google',
  showDismissButton: true,
})

const emit = defineEmits<{
  (e: 'dismiss'): void
  (e: 'success'): void
}>()

const authStore = useAuthStore()
const preferencesStore = usePreferencesStore()
const isDismissed = ref(false)

async function handleGoogleConnect() {
  const success = await authStore.signInWithGoogle()
  if (success) {
    emit('success')
  }
}

function handleDismiss() {
  isDismissed.value = true
  preferencesStore.dismissCloudPrompt(props.contextKey)
  emit('dismiss')
}
</script>

<template>
  <div
    v-if="!authStore.isAuthenticated && !isDismissed"
    class="relative transition-all duration-200"
    :class="variant === 'banner'
      ? 'p-4 rounded-2xl border-2 border-border-primary bg-surface shadow-[0_4px_0_0_#111111]'
      : 'p-4 sm:p-5 rounded-2xl border-2 border-border-primary bg-bg-alternate/80 shadow-[0_4px_0_0_#111111]'"
  >
    <!-- Dismiss Button (X) -->
    <button
      v-if="showDismissButton"
      type="button"
      class="absolute top-3 right-3 w-7 h-7 rounded-lg border border-border-grid bg-surface hover:bg-bg-alternate text-ink-muted hover:text-ink flex items-center justify-center cursor-pointer transition-colors"
      title="Lembrar mais tarde"
      aria-label="Lembrar mais tarde"
      @click="handleDismiss"
    >
      <AppIcon name="close" :size="14" />
    </button>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-6 sm:pr-8">
      <!-- Info Left -->
      <div class="space-y-1.5 min-w-0">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <AppIcon name="cloud" :size="14" />
          </div>
          <span class="font-eyebrow text-[10px] uppercase font-bold text-primary-container tracking-wider">
            Backup em Nuvem
          </span>
        </div>

        <h3 class="font-display text-sm sm:text-base font-bold text-ink leading-snug">
          {{ title }}
        </h3>

        <p class="font-sans text-xs text-ink-muted leading-relaxed max-w-xl">
          {{ description }}
        </p>
      </div>

      <!-- Actions Right -->
      <div class="flex items-center gap-2.5 shrink-0 pt-1 sm:pt-0">
        <button
          type="button"
          class="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-ink bg-surface hover:bg-surface-elevated font-button-text font-bold text-xs sm:text-sm text-ink shadow-[0_2.5px_0_0_#111111] transition-all active:translate-y-0.5 active:shadow-[0_1px_0_0_#111111] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          :disabled="authStore.isAuthActionLoading"
          @click="handleGoogleConnect"
        >
          <template v-if="authStore.isAuthActionLoading">
            <AppSpinner size="xs" />
            <span>Conectando...</span>
          </template>
          <template v-else>
            <!-- Google 4-Color SVG Icon -->
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{{ buttonText }}</span>
          </template>
        </button>

        <button
          v-if="showDismissButton"
          type="button"
          class="sm:hidden text-xs font-semibold text-ink-muted hover:text-ink px-2 py-1"
          @click="handleDismiss"
        >
          Agora não
        </button>
      </div>
    </div>
  </div>
</template>
