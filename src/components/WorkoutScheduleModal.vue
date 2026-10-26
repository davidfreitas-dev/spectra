<script setup lang="ts">
import { ref, watch } from 'vue'
import { AppButton, AppCheckbox, AppModal } from '@/components'
import { DAYS_OF_WEEK } from '@/constants/domain'
import type { Workout } from '@/types/domain'

interface Props {
  isOpen: boolean
  workout: Workout | null
  schedule?: Record<string, string | null | undefined>
  allWorkouts?: Workout[]
}

const props = withDefaults(defineProps<Props>(), {
  schedule: () => ({}),
  allWorkouts: () => [],
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', selectedDayKeys: string[]): void
}>()

const selectedDayKeys = ref<string[]>([])

// Sincroniza dias selecionados ao abrir o modal
watch(
  () => [props.isOpen, props.workout],
  () => {
    if (props.isOpen && props.workout) {
      const active: string[] = []
      DAYS_OF_WEEK.forEach((d) => {
        if (props.schedule[d.key] === props.workout?.id) {
          active.push(d.key)
        }
      })
      selectedDayKeys.value = active
    }
  },
  { immediate: true }
)

function toggleDay(dayKey: string) {
  if (selectedDayKeys.value.includes(dayKey)) {
    selectedDayKeys.value = selectedDayKeys.value.filter((k) => k !== dayKey)
  } else {
    selectedDayKeys.value.push(dayKey)
  }
}

function getOtherWorkoutName(dayKey: string): string | null {
  const currentAssignedId = props.schedule[dayKey]
  if (!currentAssignedId || currentAssignedId === props.workout?.id) {
    return null
  }
  const found = props.allWorkouts.find((w) => w.id === currentAssignedId)
  return found ? found.name : 'Outro treino'
}

function handleSave() {
  emit('save', selectedDayKeys.value)
  emit('close')
}
</script>

<template>
  <AppModal
    :is-open="isOpen && !!workout"
    eyebrow="Agenda Semanal"
    :title="workout?.name"
    max-width="md"
    @close="emit('close')"
  >
    <!-- Subtitle description -->
    <div class="px-5 pt-4 pb-2 text-xs text-ink-muted leading-relaxed">
      Selecione os dias da semana em que você deseja realizar este treino:
    </div>

    <!-- Days of week list -->
    <div class="p-4 sm:p-5 pt-0 space-y-2">
      <div
        v-for="day in DAYS_OF_WEEK"
        :key="day.key"
        class="w-full p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer"
        :class="selectedDayKeys.includes(day.key)
          ? 'border-border-primary bg-primary-container/10 font-bold shadow-[0_2px_0_0_#111111]'
          : 'border-border-grid bg-surface hover:bg-bg-alternate'"
        @click="toggleDay(day.key)"
      >
        <div class="flex items-center gap-3">
          <span
            class="w-8 h-8 rounded-lg border flex items-center justify-center font-eyebrow text-xs font-bold shrink-0"
            :class="selectedDayKeys.includes(day.key)
              ? 'bg-primary-container text-on-primary border-border-primary'
              : 'bg-bg-alternate text-ink border-border-grid'"
          >
            {{ day.shortLabel }}
          </span>
          <div>
            <span class="font-bold text-sm text-ink block leading-tight">
              {{ day.label }}
            </span>
            <span
              v-if="selectedDayKeys.includes(day.key)"
              class="text-[11px] text-primary-container font-semibold"
            >
              Agendado
            </span>
            <span
              v-else-if="getOtherWorkoutName(day.key)"
              class="text-[11px] text-warning font-medium"
            >
              Atualmente: {{ getOtherWorkoutName(day.key) }}
            </span>
            <span
              v-else
              class="text-[11px] text-ink-muted"
            >
              Descanso
            </span>
          </div>
        </div>

        <AppCheckbox
          :model-value="selectedDayKeys.includes(day.key)"
          size="md"
          class="pointer-events-none"
          tabindex="-1"
          aria-hidden="true"
        />
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between">
        <span class="font-eyebrow text-xs text-ink-muted font-bold">
          {{ selectedDayKeys.length }} {{ selectedDayKeys.length === 1 ? 'dia selecionado' : 'dias selecionados' }}
        </span>

        <div class="flex items-center gap-2">
          <AppButton variant="outline" size="sm" @click="emit('close')">
            Cancelar
          </AppButton>
          <AppButton variant="fill" size="sm" @click="handleSave">
            Salvar Agenda
          </AppButton>
        </div>
      </div>
    </template>
  </AppModal>
</template>
