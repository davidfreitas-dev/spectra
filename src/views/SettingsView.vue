<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  AppCard,
  AppButton,
  AppToggle,
  AppSegmentedControl,
  AppStatusBadge,
  AppChip,
  AppConfirmDialog,
  AppIcon,
} from '@/components'
import { StorageService } from '@/services/storageService'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { CURRENT_SCHEMA_VERSION } from '@/constants/domain'
import { PreferencesSchema, WorkoutSchema, SessionSchema } from '@/types/domain'
import { z } from 'zod'
import type { UserLevel, Equipment } from '@/types/domain'
import type { SegmentedOption } from '@/types/components'

const router = useRouter()
const preferencesStore = usePreferencesStore()

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

const feedbackMessage = ref<string | null>(null)
const feedbackType = ref<'success' | 'error'>('success')
const fileInputRef = ref<HTMLInputElement | null>(null)
const isExporting = ref(false)
const isImporting = ref(false)
const isResetting = ref(false)
const isConfirmResetOpen = ref(false)

onMounted(() => {
  preferencesStore.load()
})

function showFeedback(msg: string, type: 'success' | 'error' = 'success') {
  feedbackMessage.value = msg
  feedbackType.value = type
  setTimeout(() => {
    feedbackMessage.value = null
  }, 4000)
}

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

// Backup Schema para validação rigorosa na importação
const BackupSchema = z.object({
  app: z.string().optional(),
  schemaVersion: z.number().int().max(CURRENT_SCHEMA_VERSION),
  exportedAt: z.string(),
  preferences: PreferencesSchema,
  workouts: z.array(WorkoutSchema),
  sessions: z.array(SessionSchema),
})

async function exportBackup() {
  isExporting.value = true
  try {
    const data = {
      app: 'calistenia',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      preferences: preferencesStore.preferences,
      workouts: StorageService.getWorkouts(),
      sessions: StorageService.getSessions(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spectra-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)

    showFeedback('Backup JSON exportado com sucesso!')
  } finally {
    setTimeout(() => {
      isExporting.value = false
    }, 400)
  }
}

function triggerImport() {
  fileInputRef.value?.click()
}

async function handleFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isImporting.value = true
  try {
    const text = await file.text()
    const json = JSON.parse(text)

    // Validação de schema
    const validation = BackupSchema.safeParse(json)
    if (!validation.success) {
      showFeedback('Arquivo de backup inválido ou incompatível com esta versão.', 'error')
      target.value = ''
      isImporting.value = false
      return
    }

    // Confirmação explícita de substituição
    const confirm = window.confirm(
      'Atenção: A restauração substituirá todos os seus treinos, histórico e preferências atuais pelos dados deste backup. Deseja prosseguir?'
    )

    if (!confirm) {
      target.value = ''
      isImporting.value = false
      return
    }

    const { preferences, workouts, sessions } = validation.data
    StorageService.savePreferences(preferences)
    StorageService.saveWorkouts(workouts)
    StorageService.saveSessions(sessions)

    showFeedback('Backup restaurado com sucesso! Recarregando...')
    setTimeout(() => {
      window.location.reload()
    }, 1200)
  } catch {
    showFeedback('Falha ao processar o arquivo. Verifique o formato JSON.', 'error')
    isImporting.value = false
  } finally {
    target.value = ''
  }
}

function openResetConfirm() {
  isConfirmResetOpen.value = true
}

function handleConfirmReset() {
  isResetting.value = true
  StorageService.clearAll()
  isConfirmResetOpen.value = false
  window.location.reload()
}
</script>

<template>
  <div class="max-w-200 mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 select-none">
    <!-- View Header -->
    <div class="flex items-center justify-between pb-4 border-b border-border-grid">
      <div>
        <div class="inline-flex items-center gap-1.5 font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider mb-1">
          <span class="w-2 h-2 rounded-xs bg-primary-container inline-block" />
          <span>Preferências &amp; Dados</span>
        </div>
        <h1 class="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Configurações
        </h1>
      </div>

      <AppStatusBadge type="bodyweight" label="100% Local-first" />
    </div>

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
          <AppButton variant="fill" size="sm" :loading="isExporting" @click="exportBackup">
            <AppIcon name="download" :size="16" />
            Exportar Backup JSON
          </AppButton>

          <AppButton variant="outline" size="sm" :loading="isImporting" @click="triggerImport">
            <AppIcon name="upload" :size="16" />
            Restaurar Backup JSON
          </AppButton>

          <!-- Hidden File Input for import -->
          <input
            ref="fileInputRef"
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
          <AppButton variant="danger" size="sm" :loading="isResetting" @click="openResetConfirm">
            <AppIcon name="trash" :size="16" />
            Apagar Todos os Dados
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- Dialogo Modal de Confirmação Crítica -->
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
  </div>
</template>
