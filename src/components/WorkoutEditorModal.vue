<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DOMAIN_LIMITS } from '@/constants/domain'
import { EXERCISE_CATALOG } from '@/data/exercises'
import {
  AppButton,
  AppInput,
  AppStepper,
} from '@/components'
import ExerciseSelectorModal from './ExerciseSelectorModal.vue'
import type { Workout, WorkoutItem, ExerciseCatalogItem, Equipment } from '@/types/domain'

const props = defineProps<{
  isOpen: boolean
  workoutToEdit?: Workout | null
  userEquipment?: Equipment[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: { id?: string; name: string; items: WorkoutItem[] }): void
}>()

const workoutName = ref('')
const items = ref<WorkoutItem[]>([])
const showSelector = ref(false)
const errorMessage = ref('')

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.workoutToEdit) {
        workoutName.value = props.workoutToEdit.name
        items.value = props.workoutToEdit.items.map((it) => ({ ...it }))
      } else {
        workoutName.value = 'Novo Treino'
        // Item inicial padrão (flexão ou primeiro exercício do catálogo)
        const defaultEx = EXERCISE_CATALOG[0]
        items.value = [
          {
            id: `item-${Date.now()}`,
            exerciseId: defaultEx.id,
            sets: DOMAIN_LIMITS.SETS.DEFAULT,
            target: DOMAIN_LIMITS.REPS.DEFAULT,
            restSeconds: DOMAIN_LIMITS.REST_SECONDS.DEFAULT,
          },
        ]
      }
      errorMessage.value = ''
    }
  },
  { immediate: true }
)

function getCatalogExercise(exerciseId: string): ExerciseCatalogItem | undefined {
  return EXERCISE_CATALOG.find((e) => e.id === exerciseId)
}

function handleAddExercise(exercise: ExerciseCatalogItem) {
  if (items.value.length >= DOMAIN_LIMITS.EXERCISES_PER_WORKOUT.MAX) {
    errorMessage.value = `O treino pode ter no máximo ${DOMAIN_LIMITS.EXERCISES_PER_WORKOUT.MAX} exercícios.`
    return
  }

  const isDuration = exercise.measurementType === 'duration'
  const defaultTarget = isDuration
    ? DOMAIN_LIMITS.DURATION_SECONDS.DEFAULT
    : DOMAIN_LIMITS.REPS.DEFAULT

  items.value.push({
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    exerciseId: exercise.id,
    sets: DOMAIN_LIMITS.SETS.DEFAULT,
    target: defaultTarget,
    restSeconds: DOMAIN_LIMITS.REST_SECONDS.DEFAULT,
  })
}

function removeItem(index: number) {
  if (items.value.length <= 1) {
    errorMessage.value = 'O treino deve conter pelo menos 1 exercício.'
    return
  }
  items.value.splice(index, 1)
}

function moveUp(index: number) {
  if (index > 0) {
    const temp = items.value[index]
    items.value[index] = items.value[index - 1]
    items.value[index - 1] = temp
  }
}

function moveDown(index: number) {
  if (index < items.value.length - 1) {
    const temp = items.value[index]
    items.value[index] = items.value[index + 1]
    items.value[index + 1] = temp
  }
}

const isValid = computed(() => {
  const nameTrimmed = workoutName.value.trim()
  return (
    nameTrimmed.length >= DOMAIN_LIMITS.WORKOUT_NAME.MIN_LENGTH &&
    nameTrimmed.length <= DOMAIN_LIMITS.WORKOUT_NAME.MAX_LENGTH &&
    items.value.length >= DOMAIN_LIMITS.EXERCISES_PER_WORKOUT.MIN &&
    items.value.length <= DOMAIN_LIMITS.EXERCISES_PER_WORKOUT.MAX
  )
})

function handleSave() {
  const trimmedName = workoutName.value.trim()
  if (!trimmedName) {
    errorMessage.value = 'O nome do treino é obrigatório.'
    return
  }
  if (trimmedName.length > DOMAIN_LIMITS.WORKOUT_NAME.MAX_LENGTH) {
    errorMessage.value = `O nome deve ter no máximo ${DOMAIN_LIMITS.WORKOUT_NAME.MAX_LENGTH} caracteres.`
    return
  }
  if (items.value.length === 0) {
    errorMessage.value = 'Adicione ao menos um exercício.'
    return
  }

  emit('save', {
    id: props.workoutToEdit?.id,
    name: trimmedName,
    items: items.value,
  })
  emit('close')
}

let isBackdropMouseDown = false

function handleBackdropMouseDown(e: MouseEvent) {
  isBackdropMouseDown = e.target === e.currentTarget
}

function handleBackdropMouseUp(e: MouseEvent) {
  if (!isBackdropMouseDown || e.target !== e.currentTarget) {
    isBackdropMouseDown = false
  }
}

function handleBackdropClick(e: MouseEvent) {
  if (isBackdropMouseDown && e.target === e.currentTarget) {
    emit('close')
  }
  isBackdropMouseDown = false
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150"
    @mousedown="handleBackdropMouseDown"
    @mouseup="handleBackdropMouseUp"
    @click="handleBackdropClick"
  >
    <div
      class="bg-surface border-2 border-border-primary rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_8px_0_0_#111111] overflow-hidden"
      @mousedown.stop
      @click.stop
    >
      <!-- Header -->
      <div class="p-4 sm:p-5 border-b border-border-grid flex items-center justify-between bg-bg-alternate">
        <div>
          <span class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider block">
            Estrutura do Treino
          </span>
          <h2 class="font-display text-xl font-bold text-ink">
            {{ workoutToEdit ? 'Editar Treino' : 'Criar Novo Treino' }}
          </h2>
        </div>
        <button
          type="button"
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-border-grid bg-surface hover:bg-bg-alternate text-ink font-bold cursor-pointer transition-colors"
          @click="emit('close')"
        >
          <span class="material-symbols-outlined !text-lg">close</span>
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        <!-- Error alert -->
        <div
          v-if="errorMessage"
          class="p-3 rounded-xl bg-error-container/20 border border-border-error text-error text-xs font-bold flex items-center gap-2"
        >
          <span class="material-symbols-outlined !text-base">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Workout Name Input -->
        <div class="space-y-1.5">
          <label class="block font-bold text-xs uppercase text-ink-muted">
            Nome do Treino (1–60 caracteres)
          </label>
          <AppInput
            v-model="workoutName"
            placeholder="Ex: Treino A — Peito e Tríceps"
            :maxlength="DOMAIN_LIMITS.WORKOUT_NAME.MAX_LENGTH"
          />
        </div>

        <!-- Exercises List Header -->
        <div class="flex items-center justify-between pt-2 border-t border-border-grid">
          <div>
            <h3 class="font-bold text-sm text-ink">
              Exercícios do Treino ({{ items.length }}/{{ DOMAIN_LIMITS.EXERCISES_PER_WORKOUT.MAX }})
            </h3>
            <span class="text-xs text-ink-muted">
              Configure séries, metas e intervalos para cada movimento
            </span>
          </div>

          <AppButton
            variant="outline"
            size="sm"
            :disabled="items.length >= DOMAIN_LIMITS.EXERCISES_PER_WORKOUT.MAX"
            @click="showSelector = true"
          >
            <template #icon>
              <span class="material-symbols-outlined !text-base">add</span>
            </template>
            Adicionar
          </AppButton>
        </div>

        <!-- Items Cards -->
        <div class="space-y-3">
          <div
            v-for="(item, index) in items"
            :key="item.id"
            class="p-4 rounded-xl border border-border-grid bg-surface hover:border-border-primary transition-all shadow-[0_2px_0_0_#111111]"
          >
            <!-- Card Header: Exercise Name & Controls -->
            <div class="flex items-center justify-between pb-3 border-b border-border-grid">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-md bg-bg-alternate border border-border-grid flex items-center justify-center font-metric-number text-xs font-bold text-ink">
                  {{ index + 1 }}
                </span>
                <span class="font-bold text-sm text-ink">
                  {{ getCatalogExercise(item.exerciseId)?.name || 'Exercício' }}
                </span>
              </div>

              <!-- Reorder and Delete Actions -->
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  :disabled="index === 0"
                  class="w-7 h-7 flex items-center justify-center rounded border border-border-grid bg-bg-alternate hover:bg-surface disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Mover para cima"
                  @click="moveUp(index)"
                >
                  <span class="material-symbols-outlined !text-sm text-ink">arrow_upward</span>
                </button>
                <button
                  type="button"
                  :disabled="index === items.length - 1"
                  class="w-7 h-7 flex items-center justify-center rounded border border-border-grid bg-bg-alternate hover:bg-surface disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Mover para baixo"
                  @click="moveDown(index)"
                >
                  <span class="material-symbols-outlined !text-sm text-ink">arrow_downward</span>
                </button>
                <button
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded border border-border-grid bg-bg-alternate hover:bg-error-container/20 text-error cursor-pointer ml-1"
                  title="Remover exercício"
                  @click="removeItem(index)"
                >
                  <span class="material-symbols-outlined !text-sm">delete</span>
                </button>
              </div>
            </div>

            <!-- Configuration Steppers Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <!-- Sets Stepper -->
              <div>
                <label class="block text-[11px] font-bold uppercase text-ink-muted mb-1">
                  Séries
                </label>
                <AppStepper
                  v-model="item.sets"
                  :min="DOMAIN_LIMITS.SETS.MIN"
                  :max="DOMAIN_LIMITS.SETS.MAX"
                  :step="1"
                />
              </div>

              <!-- Target Stepper (Reps or Duration) -->
              <div>
                <label class="block text-[11px] font-bold uppercase text-ink-muted mb-1">
                  {{ getCatalogExercise(item.exerciseId)?.measurementType === 'reps' ? 'Meta (Reps)' : 'Duração (Segundos)' }}
                </label>
                <AppStepper
                  v-if="getCatalogExercise(item.exerciseId)?.measurementType === 'reps'"
                  v-model="item.target"
                  :min="DOMAIN_LIMITS.REPS.MIN"
                  :max="DOMAIN_LIMITS.REPS.MAX"
                  :step="1"
                  unit="reps"
                />
                <AppStepper
                  v-else
                  v-model="item.target"
                  :min="DOMAIN_LIMITS.DURATION_SECONDS.MIN"
                  :max="DOMAIN_LIMITS.DURATION_SECONDS.MAX"
                  :step="5"
                  unit="s"
                />
              </div>

              <!-- Rest Stepper -->
              <div>
                <label class="block text-[11px] font-bold uppercase text-ink-muted mb-1">
                  Descanso
                </label>
                <AppStepper
                  v-model="item.restSeconds"
                  :min="DOMAIN_LIMITS.REST_SECONDS.MIN"
                  :max="DOMAIN_LIMITS.REST_SECONDS.MAX"
                  :step="15"
                  unit="s"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="p-4 border-t border-border-grid bg-bg-alternate flex items-center justify-end gap-3">
        <AppButton variant="outline" @click="emit('close')">
          Cancelar
        </AppButton>
        <AppButton
          variant="fill"
          :disabled="!isValid"
          @click="handleSave"
        >
          Salvar Treino
        </AppButton>
      </div>
    </div>

    <!-- Exercise Selector Modal -->
    <ExerciseSelectorModal
      :is-open="showSelector"
      :user-equipment="userEquipment"
      @close="showSelector = false"
      @select="handleAddExercise"
    />
  </div>
</template>
