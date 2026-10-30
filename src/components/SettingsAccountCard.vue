<script setup lang="ts">
import { computed } from 'vue'
import AppCard from './AppCard.vue'
import AppButton from './AppButton.vue'
import AppIcon from './AppIcon.vue'
import AppSpinner from './AppSpinner.vue'
import type { AppIconName } from './icons'
import type { SyncStatus } from '@/services/syncService'

interface Props {
  isAuthenticated: boolean
  userDisplayName?: string
  userEmail?: string
  userPhotoURL?: string | null
  syncStatus: SyncStatus
  lastSyncedAt?: string | null
  isSyncing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  userDisplayName: 'Usuário Spectra',
  userEmail: '',
  userPhotoURL: null,
  lastSyncedAt: null,
  isSyncing: false,
})

const emit = defineEmits<{
  (e: 'sync'): void
  (e: 'sign-out'): void
  (e: 'connect-google'): void
}>()

interface StatusDisplayConfig {
  label: string
  title: string
  badgeClass: string
  icon: AppIconName
  isSpinning: boolean
}

const statusConfig = computed<StatusDisplayConfig>(() => {
  switch (props.syncStatus) {
    case 'synced':
      return {
        label: 'Sincronizado',
        title: 'Nuvem sincronizada',
        badgeClass: 'bg-success text-on-success',
        icon: 'check',
        isSpinning: false,
      }
    case 'syncing':
      return {
        label: 'Sincronizando',
        title: 'Sincronizando com a nuvem...',
        badgeClass: 'bg-primary-container text-on-primary',
        icon: 'sync',
        isSpinning: true,
      }
    case 'error':
      return {
        label: 'Erro',
        title: 'Falha na sincronização',
        badgeClass: 'bg-error-container text-error',
        icon: 'error',
        isSpinning: false,
      }
    default:
      return {
        label: 'Offline',
        title: 'Offline ou aguardando sincronização',
        badgeClass: 'bg-bg-alternate text-ink-muted',
        icon: 'cloud_off',
        isSpinning: false,
      }
  }
})

const formattedLastSyncTime = computed(() => {
  if (!props.lastSyncedAt) return null
  return new Date(props.lastSyncedAt).toLocaleTimeString()
})
</script>

<template>
  <AppCard
    title="Sincronização em Nuvem"
    eyebrow="Conta Google"
    :dot-color="isAuthenticated ? 'primary' : 'none'"
  >
    <!-- Authenticated State -->
    <div v-if="isAuthenticated" class="space-y-4">
      <div class="p-4 rounded-2xl bg-bg-alternate/80 border-2 border-border-primary shadow-[0_3px_0_0_#111111] space-y-3">
        <!-- Profile Header Row -->
        <div class="flex items-center justify-between gap-3">
          <!-- Left: User Avatar & Info -->
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-full border-2 border-border-primary overflow-hidden shrink-0 bg-surface flex items-center justify-center shadow-[0_2px_0_0_#111111]">
              <img
                v-if="userPhotoURL"
                :src="userPhotoURL"
                :alt="userDisplayName"
                class="w-full h-full object-cover"
                referrerpolicy="no-referrer"
              />
              <span v-else class="font-bold text-base text-primary">
                {{ userDisplayName.slice(0, 1).toUpperCase() }}
              </span>
            </div>

            <div class="min-w-0">
              <h4 class="font-display font-bold text-base text-ink leading-tight truncate">
                {{ userDisplayName }}
              </h4>
              <p class="font-mono text-xs text-ink-muted truncate mt-0.5" :title="userEmail">
                {{ userEmail }}
              </p>
            </div>
          </div>

          <!-- Right: Status Badge (Icon-only on mobile, Icon + Label on desktop) -->
          <div
            class="shrink-0 h-7 w-7 sm:w-auto sm:px-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-border-primary select-none shadow-[0_1.5px_0_0_#111111] transition-all"
            :class="statusConfig.badgeClass"
            :title="statusConfig.title"
          >
            <AppSpinner
              v-if="statusConfig.isSpinning"
              size="xs"
              variant="surface"
            />
            <AppIcon
              v-else
              :name="statusConfig.icon"
              :size="13"
              class="shrink-0"
              :class="{ 'font-bold': props.syncStatus === 'synced' }"
            />

            <span class="hidden sm:inline font-eyebrow text-[10px] uppercase font-bold tracking-wider">
              {{ statusConfig.label }}
            </span>
          </div>
        </div>

        <!-- Meta info: Protection guarantee & Timestamp -->
        <div class="flex items-center justify-between text-[11px] pt-2 border-t border-border-grid/70 text-ink-muted flex-wrap gap-2">
          <span class="flex items-center gap-1.5">
            <AppIcon name="lock" :size="12" />
            <span>Protegido na nuvem</span>
          </span>
          <span v-if="formattedLastSyncTime" class="font-mono text-[10px]">
            Atualizado às {{ formattedLastSyncTime }}
          </span>
        </div>
      </div>

      <p class="text-xs text-ink-muted leading-relaxed">
        Seus treinos, histórico de sessões e preferências são sincronizados automaticamente em segundo plano com o Firebase Firestore.
      </p>

      <!-- Sync & Sign Out Actions -->
      <div class="flex flex-wrap items-center gap-2 pt-1">
        <AppButton
          variant="outline"
          size="sm"
          :disabled="isSyncing"
          @click="emit('sync')"
        >
          <AppIcon name="sync" :size="14" :class="{ 'animate-spin': isSyncing }" />
          <span>{{ isSyncing ? 'Sincronizando...' : 'Sincronizar agora' }}</span>
        </AppButton>

        <AppButton
          variant="ghost"
          size="sm"
          class="text-error hover:bg-error-container/20"
          @click="emit('sign-out')"
        >
          <AppIcon name="logout" :size="14" />
          <span>Desconectar conta</span>
        </AppButton>
      </div>
    </div>

    <!-- Guest / Not Authenticated State -->
    <div v-else class="space-y-4">
      <p class="text-xs text-ink-muted leading-relaxed">
        Você está usando o Spectra em <strong class="text-ink">modo visitante</strong>. Seus dados estão salvos apenas neste navegador. Faça login com o Google para habilitar o backup automático em nuvem e acessar em outros aparelhos.
      </p>

      <AppButton
        variant="fill"
        size="sm"
        class="w-full sm:w-auto"
        @click="emit('connect-google')"
      >
        <AppIcon name="cloud" :size="16" />
        <span>Conectar Conta Google</span>
      </AppButton>
    </div>
  </AppCard>
</template>
