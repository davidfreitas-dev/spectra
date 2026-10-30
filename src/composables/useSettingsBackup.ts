import { ref } from 'vue'
import { z } from 'zod'
import { CURRENT_SCHEMA_VERSION } from '@/constants/domain'
import { PreferencesSchema, WorkoutSchema, SessionSchema } from '@/types/domain'
import { StorageService } from '@/services/storageService'
import type { Preferences } from '@/types/domain'

export const BackupSchema = z.object({
  app: z.string().optional(),
  schemaVersion: z.number().int().max(CURRENT_SCHEMA_VERSION),
  exportedAt: z.string(),
  preferences: PreferencesSchema,
  workouts: z.array(WorkoutSchema),
  sessions: z.array(SessionSchema),
})

export type BackupData = z.infer<typeof BackupSchema>

export interface UseSettingsBackupOptions {
  onFeedback: (message: string, type?: 'success' | 'error') => void
}

export function useSettingsBackup(options: UseSettingsBackupOptions) {
  const isExporting = ref(false)
  const isImporting = ref(false)
  const fileInputRef = ref<HTMLInputElement | null>(null)

  async function exportBackup(preferences: Preferences) {
    isExporting.value = true
    try {
      const data: BackupData = {
        app: 'calistenia',
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        preferences,
        workouts: StorageService.getWorkouts(),
        sessions: StorageService.getSessions(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const downloadAnchor = document.createElement('a')
      downloadAnchor.href = url
      downloadAnchor.download = `spectra-backup-${new Date().toISOString().slice(0, 10)}.json`
      downloadAnchor.click()
      URL.revokeObjectURL(url)

      options.onFeedback('Backup JSON exportado com sucesso!')
    } finally {
      setTimeout(() => {
        isExporting.value = false
      }, 400)
    }
  }

  function setFileInput(el: HTMLInputElement | null) {
    fileInputRef.value = el
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

      const validation = BackupSchema.safeParse(json)
      if (!validation.success) {
        options.onFeedback('Arquivo de backup inválido ou incompatível com esta versão.', 'error')
        target.value = ''
        isImporting.value = false
        return
      }

      const confirmed = window.confirm(
        'Atenção: A restauração substituirá todos os seus treinos, histórico e preferências atuais pelos dados deste backup. Deseja prosseguir?'
      )

      if (!confirmed) {
        target.value = ''
        isImporting.value = false
        return
      }

      const { preferences, workouts, sessions } = validation.data
      StorageService.savePreferences(preferences)
      StorageService.saveWorkouts(workouts)
      StorageService.saveSessions(sessions)

      options.onFeedback('Backup restaurado com sucesso! Recarregando...')
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch {
      options.onFeedback('Falha ao processar o arquivo. Verifique o formato JSON.', 'error')
      isImporting.value = false
    } finally {
      target.value = ''
    }
  }

  return {
    isExporting,
    isImporting,
    fileInputRef,
    setFileInput,
    exportBackup,
    triggerImport,
    handleFileSelected,
  }
}
