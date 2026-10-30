<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  AppPageHeader,
  AppCard,
  AppButton,
  AppToggle,
  AppSegmentedControl,
  AppChip,
  AppConfirmDialog,
  AppIcon,
  SettingsAccountCard,
} from '@/components'
import { useSettingsBackup } from '@/composables/useSettingsBackup'
import { StorageService } from '@/services/storageService'
import { SyncService, syncStatus, lastSyncedAt } from '@/services/syncService'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useTourStore } from '@/stores/tourStore'
import { useAuthStore } from '@/stores/authStore'
import type { UserLevel, Equipment } from '@/types/domain'
import type { SegmentedOption } from '@/types/components'

// 1. Stores & Navigation
const router = useRouter()
const preferencesStore = usePreferencesStore()
const tourStore = useTourStore()
const authStore = useAuthStore()

// 2. Reactive State
const isManualSyncing = ref(false)
const isConfirmSignOutOpen = ref(false)
const isConfirmResetOpen = ref(false)
const isResetting = ref(false)

const feedbackMessage = ref<string | null>(null)
const feedbackType = ref<'success' | 'error'>('success')
let feedbackTimer: ReturnType<typeof setTimeout> | null = null

// 3. Composable for Backup & Restore
const {
  isExporting,
  isImporting,
  setFileInput,
  exportBackup,
  triggerImport,
  handleFileSelected,
} = useSettingsBackup({
  onFeedback: showFeedback,
})

// 4. Static / Domain Options
const levelOptions: SegmentedOption[] = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
]

const equipmentOptions: { value: Equipment; label: string }[] = [
  { value: 'none', label: 'Peso Corporal' },
  { value: 'bar', label: 'Barra Fixa' },
  { value: 'band', label: 'Elástico' },
  { value: 'rope', label: 'Corda de Pular' },
]

// 5. Actions & Handlers
function showFeedback(msg: string, type: 'success' | 'error' = 'success') {
  if (feedbackTimer) clearTimeout(feedbackTimer)
  feedbackMessage.value = msg
  feedbackType.value = type
  feedbackTimer = setTimeout(() => {
    feedbackMessage.value = null
  }, 4000)
}

// Account & Cloud Sync Handlers
async function handleManualSync() {
  if (!authStore.userId) return
  isManualSyncing.value = true
  const success = await SyncService.syncOnLogin(authStore.userId, () => {
    preferencesStore.load()
  })
  isManualSyncing.value = false
  if (success) {
    showFeedback('Dados sincronizados com o Firestore!')
  } else {
    showFeedback('Falha ao sincronizar com a nuvem.', 'error')
  }
}

async function executeSignOut() {
  await authStore.signOutUser()
  isConfirmSignOutOpen.value = false
  showFeedback('Conta desconectada com sucesso. Modo visitante ativo.')
}

// Preferences Handlers
function handleLevelChange(val: string | number) {
  preferencesStore.setLevel(val as UserLevel)
  showFeedback('Nível atualizado!')
}

function toggleEquipment(eq: Equipment) {
  let list = [...preferencesStore.preferences.equipment]
  if (eq === 'none') {
    list = ['none']
  } else {
    list = list.filter((e) => e !== 'none')
    if (list.includes(eq)) {
      list = list.filter((e) => e !== eq)
    } else {
      list.push(eq)
    }
    if (list.length === 0) {
      list = ['none']
    }
  }
  preferencesStore.setEquipment(list)
  showFeedback('Equipamentos atualizados!')
}

function handleSoundToggle(val: boolean) {
  preferencesStore.setToggles(val, preferencesStore.preferences.vibrationEnabled)
}

function handleVibrationToggle(val: boolean) {
  preferencesStore.setToggles(preferencesStore.preferences.soundEnabled, val)
}

// Tour & Tutorials Handlers
function handleStartInteractiveTour() {
  preferencesStore.resetSessionTour()
  tourStore.startTour()
  showFeedback('Tour interativo ativado! Redirecionando para a tela Hoje...')
  setTimeout(() => {
    router.push('/')
  }, 700)
}

function handleReplayOnboarding() {
  preferencesStore.resetOnboarding()
  showFeedback('Tutorial de boas-vindas reiniciado! Redirecionando...')
  setTimeout(() => {
    router.push('/')
  }, 1000)
}

function handleReenableSessionTips() {
  preferencesStore.resetSessionTour()
  showFeedback('Dicas e guia da tela de treino reativados!')
}

// Danger Zone Reset
function handleConfirmReset() {
  isResetting.value = true
  StorageService.clearAll()
  isConfirmResetOpen.value = false
  window.location.reload()
}

// 6. Lifecycle
onMounted(() => {
  preferencesStore.load()
})

onUnmounted(() => {
  if (feedbackTimer) clearTimeout(feedbackTimer)
})
</script>

<template>
  <div class="max-w-200 mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 select-none">
    <!-- View Header -->
    <AppPageHeader
      title="Configurações"
      eyebrow="Preferências &amp; Dados"
    />

    <!-- Alert / Feedback Notification -->
    <div
      v-if="feedbackMessage"
      class="p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
      :class="feedbackType === 'success'
        ? 'bg-success/15 border border-border-success text-success'
        : 'bg-error-container/20 border border-border-error text-error'"
    >
      <AppIcon
        :name="feedbackType === 'success' ? 'check' : 'error'"
        :size="16"
      />
      <span>{{ feedbackMessage }}</span>
    </div>

    <!-- Account & Cloud Sync Card -->
    <SettingsAccountCard
      :is-authenticated="authStore.isAuthenticated"
      :user-display-name="authStore.userDisplayName"
      :user-email="authStore.userEmail"
      :user-photo-u-r-l="authStore.userPhotoURL"
      :sync-status="syncStatus"
      :last-synced-at="lastSyncedAt"
      :is-syncing="isManualSyncing"
      @sync="handleManualSync"
      @sign-out="isConfirmSignOutOpen = true"
      @connect-google="authStore.openAuthModal"
    />

    <!-- Experience Level Card -->
    <AppCard title="Nível de Treino" eyebrow="Preferência Padrão" dot-color="primary">
      <div class="space-y-4">
        <p class="text-xs text-ink-muted leading-relaxed">
          O nível serve de filtro padrão na biblioteca e nos modelos de treinos prontos.
        </p>

        <AppSegmentedControl
          :model-value="preferencesStore.preferences.level"
          :options="levelOptions"
          @update:model-value="handleLevelChange"
        />
      </div>
    </AppCard>

    <!-- Equipment Available Card -->
    <AppCard title="Seus Equipamentos" eyebrow="Filtro de Biblioteca" dot-color="ink">
      <div class="space-y-3">
        <p class="text-xs text-ink-muted leading-relaxed">
          Exercícios que exigem itens não selecionados ficam ocultos por padrão no seletor de exercícios.
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <AppChip
            v-for="eq in equipmentOptions"
            :key="eq.value"
            :label="eq.label"
            :selected="preferencesStore.preferences.equipment.includes(eq.value)"
            @click="toggleEquipment(eq.value)"
          />
        </div>
      </div>
    </AppCard>

    <!-- Operational Preferences (Toggles) -->
    <AppCard title="Feedback &amp; Execução" eyebrow="Durante a Sessão" dot-color="ink">
      <div class="space-y-3">
        <AppToggle
          v-model="preferencesStore.preferences.soundEnabled"
          label="Sinais Sonoros"
          description="Alerta sonoro ao final do descanso e séries cronometradas"
          @update:model-value="handleSoundToggle"
        />

        <AppToggle
          v-model="preferencesStore.preferences.vibrationEnabled"
          label="Vibração Háptica"
          description="Feedback tátil ao registrar séries no celular"
          @update:model-value="handleVibrationToggle"
        />

        <p class="text-[11px] text-ink-muted italic pt-1">
          * Nota: alertas sonoros e vibrações podem ser limitados pelo navegador caso o app seja colocado em segundo plano.
        </p>
      </div>
    </AppCard>

    <!-- Help & Tutorials Card -->
    <AppCard title="Ajuda &amp; Tutoriais" eyebrow="Aprenda a Usar o Spectra" dot-color="ink">
      <div class="space-y-3">
        <p class="text-xs text-ink-muted leading-relaxed">
          Deseja rever as explicações de boas-vindas do app ou reativar as dicas da tela de execução de treino?
        </p>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <AppButton variant="fill" size="sm" @click="handleStartInteractiveTour">
            <AppIcon name="zap" :size="16" />
            Iniciar Tour Prático (Onde Clicar)
          </AppButton>

          <AppButton variant="outline" size="sm" @click="handleReplayOnboarding">
            <AppIcon name="replay" :size="16" />
            Rever Boas-Vindas
          </AppButton>

          <AppButton variant="outline" size="sm" @click="handleReenableSessionTips">
            <AppIcon name="help" :size="16" />
            Reativar Dicas de Treino
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- Backup & Restore Card -->
    <AppCard title="Backup &amp; Portabilidade" eyebrow="Seus Dados Pertencem a Você">
      <div class="space-y-4">
        <p class="text-xs text-ink-muted leading-relaxed">
          O Spectra opera 100% no seu dispositivo. Exporte seu arquivo JSON regularmente para não perder seu histórico ou para transferir para outro aparelho.
        </p>

        <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-border-grid">
          <AppButton
            variant="fill"
            size="sm"
            :loading="isExporting"
            @click="exportBackup(preferencesStore.preferences)"
          >
            <AppIcon name="download" :size="16" />
            Exportar Backup JSON
          </AppButton>

          <AppButton
            variant="outline"
            size="sm"
            :loading="isImporting"
            @click="triggerImport"
          >
            <AppIcon name="upload" :size="16" />
            Restaurar Backup JSON
          </AppButton>

          <!-- Hidden File Input for import -->
          <input
            :ref="(el) => setFileInput(el as HTMLInputElement | null)"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="handleFileSelected"
          />
        </div>
      </div>
    </AppCard>

    <!-- Danger Zone -->
    <AppCard title="Zona de Perigo" eyebrow="Ação Destrutiva">
      <div class="space-y-3">
        <p class="text-xs text-ink-muted leading-relaxed">
          Apaga permanentemente todos os treinos, sessões e configurações do navegador neste dispositivo.
        </p>

        <div class="pt-4 border-t border-border-grid">
          <AppButton
            variant="danger"
            size="sm"
            :loading="isResetting"
            @click="isConfirmResetOpen = true"
          >
            <AppIcon name="trash" :size="16" />
            Apagar Todos os Dados
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- Dialogo Modal de Confirmação Crítica (Reset) -->
    <AppConfirmDialog
      :is-open="isConfirmResetOpen"
      title="Apagar Todos os Dados?"
      eyebrow="Atenção Crítica"
      description="Esta ação apagará permanentemente todos os seus treinos, histórico de sessões, preferências locais e progresso deste dispositivo. Esta operação é irreversível."
      confirm-text="Sim, Apagar Tudo"
      cancel-text="Cancelar"
      variant="danger"
      :loading="isResetting"
      @close="isConfirmResetOpen = false"
      @confirm="handleConfirmReset"
    />

    <!-- Diálogo de Confirmação para Desconectar Conta -->
    <AppConfirmDialog
      :is-open="isConfirmSignOutOpen"
      title="Desconectar Conta?"
      eyebrow="Conta Google"
      description="Ao desconectar, seus dados continuarão salvos normalmente neste navegador, mas as novas alterações deixarão de ser sincronizadas com a nuvem até que você faça login novamente."
      confirm-text="Desconectar"
      cancel-text="Continuar Conectado"
      variant="warning"
      :loading="authStore.isAuthActionLoading"
      @close="isConfirmSignOutOpen = false"
      @confirm="executeSignOut"
    />
  </div>
</template>
