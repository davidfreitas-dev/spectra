<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DOMAIN_LIMITS } from '@/constants/domain'
import { EXERCISE_CATALOG } from '@/data/exercises'
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppInput,
  AppStepper,
  AppIcon,
  AppModal,
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
        workoutName.value = ''
        items.value = []
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

  if (items.value.length === 0) {
    errorMessage.value = 'Adicione pelo menos 1 exercício ao treino.'
    return
  }

  emit('save', {
    id: props.workoutToEdit?.id,
    name: trimmedName,
    items: items.value,
  })
  emit('close')
}
</script>

<template>
  <AppModal
    :is-open="isOpen"
    eyebrow="Estrutura do Treino"
    :title="workoutToEdit ? 'Editar Treino' : 'Criar Novo Treino'"
    max-width="2xl"
    @close="emit('close')"
  >
    <!-- Scrollable Body -->
    <div class="p-4 sm:p-6 space-y-5">
      <!-- Error alert -->
      <div
        v-if="errorMessage"
        class="p-3 rounded-xl bg-error-container/20 border border-border-error text-error text-xs font-bold flex items-center gap-2"
      >
        <AppIcon name="error" :size="16" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Workout Name Field -->
      <div>
        <label class="block font-eyebrow text-xs uppercase font-bold text-ink mb-1.5">
          Nome do Treino
        </label>
        <AppInput
          v-model="workoutName"
          placeholder="Ex: Treino A - Superior, Puxada Avançada..."
          :maxlength="DOMAIN_LIMITS.WORKOUT_NAME.MAX_LENGTH"
        />
        <div class="flex justify-between items-center mt-1 text-[11px] text-ink-muted">
          <span>Nome descritivo para identificar na agenda</span>
          <span>{{ workoutName.length }}/{{ DOMAIN_LIMITS.WORKOUT_NAME.MAX_LENGTH }}</span>
        </div>
      </div>

      <!-- Exercises List Header -->
      <div class="flex items-center justify-between pt-2">
        <div>
          <h3 class="font-eyebrow text-xs uppercase font-bold text-ink tracking-wider">
            Exercícios do Treino ({{ items.length }}/{{ DOMAIN_LIMITS.EXERCISES_PER_WORKOUT.MAX }})
          </h3>
          <span class="text-xs text-ink-muted">
            Configure séries, repetições/tempo e descanso para cada movimento.
          </span>
        </div>

        <AppButton
          variant="outline"
          size="sm"
          :disabled="items.length >= DOMAIN_LIMITS.EXERCISES_PER_WORKOUT.MAX"
          @click="showSelector = true"
        >
          <AppIcon name="plus" :size="16" />
          Adicionar
        </AppButton>
      </div>

      <!-- Empty items state -->
      <AppEmptyState
        v-if="items.length === 0"
        variant="dashed"
        title="Nenhum exercício adicionado"
        description="Toque no botão 'Adicionar' acima para escolher movimentos do catálogo."
        icon="dumbbell"
      />

      <!-- Items List -->
      <TransitionGroup
        v-else
        name="reorder-list"
        tag="div"
        class="space-y-3 relative overflow-x-hidden"
      >
        <AppCard
          v-for="(item, index) in items"
          :key="item.id"
          class="p-4"
        >
          <!-- Exercise header row: number, name, order buttons, delete -->
          <div class="flex items-center justify-between gap-3 pb-3 border-b border-border-grid">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-6 h-6 rounded-md bg-bg-alternate border border-border-grid flex items-center justify-center font-metric-number text-xs font-bold text-ink shrink-0">
                {{ index + 1 }}
              </span>
              <div class="truncate">
                <span class="font-bold text-sm text-ink block truncate">
                  {{ getCatalogExercise(item.exerciseId)?.name || item.exerciseId }}
                </span>
                <span class="text-[11px] text-ink-muted">
                  {{ getCatalogExercise(item.exerciseId)?.measurementType === 'duration' ? 'Isometria / Tempo' : 'Repetições' }}
                </span>
              </div>
            </div>

            <!-- Actions: move up/down, delete -->
            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-md border border-border-grid bg-surface hover:bg-bg-alternate disabled:opacity-30 disabled:cursor-not-allowed text-ink transition-colors cursor-pointer"
                :disabled="index === 0"
                title="Mover para cima"
                @click="moveUp(index)"
              >
                <AppIcon name="arrow_up" :size="14" />
              </button>
              <button
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-md border border-border-grid bg-surface hover:bg-bg-alternate disabled:opacity-30 disabled:cursor-not-allowed text-ink transition-colors cursor-pointer"
                :disabled="index === items.length - 1"
                title="Mover para baixo"
                @click="moveDown(index)"
              >
                <AppIcon name="arrow_down" :size="14" />
              </button>
              <button
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-md border border-border-grid bg-surface hover:bg-error-container/20 hover:text-error text-ink-muted transition-colors cursor-pointer ml-1"
                title="Remover exercício"
                @click="removeItem(index)"
              >
                <AppIcon name="trash" :size="14" />
              </button>
            </div>
          </div>

          <!-- Stepper controls: Sets, Target (reps or s), Rest (s) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            <!-- Sets -->
            <div class="space-y-1">
              <label class="block font-eyebrow text-[10px] uppercase text-ink-muted font-bold">
                Séries
              </label>
              <AppStepper
                v-model="item.sets"
                :min="DOMAIN_LIMITS.SETS.MIN"
                :max="DOMAIN_LIMITS.SETS.MAX"
                :step="1"
              />
            </div>

            <!-- Target (reps or duration) -->
            <div class="space-y-1">
              <label class="block font-eyebrow text-[10px] uppercase text-ink-muted font-bold">
                {{ getCatalogExercise(item.exerciseId)?.measurementType === 'duration' ? 'Duração (s)' : 'Repetições' }}
              </label>
              <AppStepper
                v-if="getCatalogExercise(item.exerciseId)?.measurementType === 'duration'"
                v-model="item.target"
                :min="DOMAIN_LIMITS.DURATION_SECONDS.MIN"
                :max="DOMAIN_LIMITS.DURATION_SECONDS.MAX"
                :step="5"
                unit="s"
              />
              <AppStepper
                v-else
                v-model="item.target"
                :min="DOMAIN_LIMITS.REPS.MIN"
                :max="DOMAIN_LIMITS.REPS.MAX"
                :step="1"
                unit="reps"
              />
            </div>

            <!-- Rest Seconds -->
            <div class="space-y-1">
              <label class="block font-eyebrow text-[10px] uppercase text-ink-muted font-bold">
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
        </AppCard>
      </TransitionGroup>
    </div>

    <!-- Footer Buttons -->
    <template #footer>
      <div class="flex items-center justify-end gap-3">
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
    </template>
  </AppModal>

  <!-- Exercise Selector Modal -->
  <ExerciseSelectorModal
    :is-open="showSelector"
    :user-equipment="userEquipment"
    @close="showSelector = false"
    @select="handleAddExercise"
  />
</template>
