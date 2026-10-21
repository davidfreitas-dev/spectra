<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { AppButton, AppInput, AppChip, AppCheckbox } from '@/components'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import AppIcon from './AppIcon.vue'
import type { ExerciseCatalogItem, Equipment } from '@/types/domain'

const props = defineProps<{
  isOpen: boolean
  userEquipment?: Equipment[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', exercise: ExerciseCatalogItem): void
}>()

useBodyScrollLock(toRef(props, 'isOpen'))

const searchQuery = ref('')
const selectedMuscle = ref<string>('all')
const selectedEquipment = ref<string>('all')
const showAllExercises = ref(false)

const hasActiveFilters = computed(() => {
  return (
    selectedMuscle.value !== 'all' ||
    selectedEquipment.value !== 'all' ||
    searchQuery.value.trim() !== '' ||
    showAllExercises.value
  )
})

function clearFilters() {
  selectedMuscle.value = 'all'
  selectedEquipment.value = 'all'
  searchQuery.value = ''
  showAllExercises.value = false
}

const muscleGroupsList = [
  'all',
  'Peito',
  'Costas',
  'Pernas',
  'Glúteos',
  'Ombros',
  'Tríceps',
  'Bíceps',
  'Core',
  'Cardio',
]

const equipmentList: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'none', label: 'Peso Corporal' },
  { value: 'bar', label: 'Barra Fixa' },
  { value: 'band', label: 'Elástico' },
  { value: 'rope', label: 'Corda' },
]

const filteredExercises = computed(() => {
  return EXERCISE_CATALOG.filter((ex) => {
    // Busca por nome
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      if (!ex.name.toLowerCase().includes(q)) return false
    }

    // Filtro por grupo muscular
    if (selectedMuscle.value !== 'all') {
      if (!ex.muscleGroups.some((m) => m.toLowerCase() === selectedMuscle.value.toLowerCase())) {
        return false
      }
    }

    // Filtro por equipamento selecionado no chip
    if (selectedEquipment.value !== 'all') {
      if (!ex.equipment.includes(selectedEquipment.value as Equipment)) {
        return false
      }
    } else if (!showAllExercises.value && props.userEquipment && props.userEquipment.length > 0) {
      // Quando em 'Todos', restringe aos equipamentos cadastrados no perfil a menos que 'showAllExercises' esteja marcado
      const hasEquipment = ex.equipment.every((eq) => props.userEquipment?.includes(eq))
      if (!hasEquipment) return false
    }

    return true
  })
})

function handleSelect(exercise: ExerciseCatalogItem) {
  emit('select', exercise)
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
  <Transition name="modal-sheet">
    <div
      v-if="isOpen"
      class="modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/50 backdrop-blur-xs select-none"
      @mousedown="handleBackdropMouseDown"
      @mouseup="handleBackdropMouseUp"
      @click="handleBackdropClick"
      @touchmove.self.prevent
    >
      <div
        class="modal-card bg-surface border-t-2 sm:border-2 border-border-primary rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[88vh] sm:max-h-[85vh] flex flex-col shadow-[0_8px_0_0_#111111] overflow-hidden"
        @mousedown.stop
        @click.stop
      >
      <!-- Modal Header -->
      <div class="p-4 sm:p-5 border-b border-border-grid flex items-center justify-between bg-bg-alternate">
        <div>
          <span class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider block">
            Biblioteca de Movimentos
          </span>
          <h2 class="font-display text-xl font-bold text-ink">
            Selecionar Exercício
          </h2>
        </div>
        <button
          type="button"
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-border-grid bg-surface hover:bg-bg-alternate text-ink font-bold cursor-pointer transition-colors"
          @click="emit('close')"
        >
          <AppIcon name="close" :size="18" />
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="p-4 border-b border-border-grid space-y-3 bg-surface">
        <AppInput
          v-model="searchQuery"
          placeholder="Buscar exercício por nome..."
        />

        <!-- Muscle Group Section -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="font-eyebrow text-[10px] text-ink-subtle uppercase font-bold tracking-wider">
              Grupo Muscular:
            </span>
            <button
              v-if="hasActiveFilters"
              type="button"
              class="text-[10px] font-bold text-primary-container hover:underline cursor-pointer"
              @click="clearFilters"
            >
              Limpar filtros
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-1.5">
            <AppChip
              v-for="muscle in muscleGroupsList"
              :key="muscle"
              :label="muscle === 'all' ? 'Todos' : muscle"
              :selected="selectedMuscle === muscle"
              @click="selectedMuscle = muscle"
            />
          </div>
        </div>

        <!-- Equipment Section -->
        <div class="pt-2 border-t border-border-grid space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="font-eyebrow text-[10px] text-ink-subtle uppercase font-bold tracking-wider">
              Equipamento:
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-1.5">
            <AppChip
              v-for="eq in equipmentList"
              :key="eq.value"
              :label="eq.label"
              :selected="selectedEquipment === eq.value"
              @click="selectedEquipment = eq.value"
            />
          </div>
        </div>
      </div>

      <!-- Results Meta Sub-bar -->
      <div class="px-4 py-2 bg-bg-alternate border-b border-border-grid flex items-center justify-between text-[11px] select-none">
        <span class="font-eyebrow text-ink-muted uppercase tracking-wider font-bold">
          {{ filteredExercises.length }} {{ filteredExercises.length === 1 ? 'exercício' : 'exercícios' }}
        </span>

        <AppCheckbox
          v-if="userEquipment && userEquipment.length > 0"
          v-model="showAllExercises"
          size="sm"
          label="Incluir outros equipamentos"
        />
      </div>

      <!-- Exercise List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-2.5">
        <div
          v-if="filteredExercises.length === 0"
          class="py-12 text-center text-ink-muted text-sm"
        >
          Nenhum exercício encontrado com os filtros atuais.
        </div>

        <button
          v-for="exercise in filteredExercises"
          :key="exercise.id"
          type="button"
          class="w-full text-left p-3.5 rounded-xl border border-border-grid bg-surface hover:bg-bg-alternate hover:border-border-primary transition-all flex items-center justify-between group cursor-pointer"
          @click="handleSelect(exercise)"
        >
          <div>
            <div class="font-bold text-ink group-hover:text-primary-container transition-colors">
              {{ exercise.name }}
            </div>
            <div class="flex items-center gap-2 mt-1 text-xs text-ink-muted">
              <span>{{ exercise.muscleGroups.join(', ') }}</span>
              <span>•</span>
              <span class="font-medium text-ink">
                {{ exercise.measurementType === 'reps' ? 'Repetições' : 'Duração' }}
              </span>
            </div>
          </div>

          <AppIcon
            name="plus"
            :size="20"
            class="text-ink-muted group-hover:text-primary-container transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <!-- Footer -->
      <div class="p-3 border-t border-border-grid bg-bg-alternate flex justify-end">
        <AppButton variant="outline" size="sm" @click="emit('close')">
          Cancelar
        </AppButton>
      </div>
    </div>
  </div>
</Transition>
</template>
