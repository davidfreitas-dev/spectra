<script setup lang="ts">
import { ref, computed } from 'vue'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { AppButton, AppInput, AppChip, AppCheckbox, AppModal } from '@/components'
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
</script>

<template>
  <AppModal
    :is-open="isOpen"
    eyebrow="Biblioteca de Movimentos"
    title="Selecionar Exercício"
    max-width="xl"
    @close="emit('close')"
  >
    <!-- Search & Filters Strip -->
    <div class="p-4 sm:p-5 border-b border-border-grid bg-bg-alternate/50 space-y-3 shrink-0">
      <AppInput
        v-model="searchQuery"
        placeholder="Buscar exercício pelo nome..."
        class="w-full"
      />

      <!-- Filter chips horizontal scroll -->
      <div class="space-y-2">
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span class="text-[10px] font-eyebrow font-bold uppercase text-ink-muted shrink-0 mr-1">
            Músculo:
          </span>
          <AppChip
            v-for="muscle in muscleGroupsList"
            :key="muscle"
            :label="muscle === 'all' ? 'Todos' : muscle"
            :selected="selectedMuscle === muscle"
            class="shrink-0"
            @click="selectedMuscle = muscle"
          />
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span class="text-[10px] font-eyebrow font-bold uppercase text-ink-muted shrink-0 mr-1">
            Equipamento:
          </span>
          <AppChip
            v-for="eq in equipmentList"
            :key="eq.value"
            :label="eq.label"
            :selected="selectedEquipment === eq.value"
            class="shrink-0"
            @click="selectedEquipment = eq.value"
          />
        </div>
      </div>

      <!-- Quick toggle: Show all vs only compatible -->
      <div class="flex items-center justify-between pt-1 text-xs">
        <label class="flex items-center gap-2 cursor-pointer text-ink-muted select-none">
          <AppCheckbox v-model="showAllExercises" size="sm" />
          <span>Exibir também exercícios para equipamentos que não possuo</span>
        </label>

        <button
          v-if="hasActiveFilters"
          type="button"
          class="text-xs text-primary-container font-bold hover:underline cursor-pointer"
          @click="clearFilters"
        >
          Limpar filtros
        </button>
      </div>
    </div>

    <!-- Exercise Items List -->
    <div class="p-4 sm:p-5 space-y-2">
      <div
        v-if="filteredExercises.length === 0"
        class="py-12 text-center text-ink-muted space-y-2"
      >
        <AppIcon name="search" :size="32" class="mx-auto text-ink-muted/50" />
        <p class="text-sm font-medium">Nenhum exercício encontrado para os filtros selecionados.</p>
        <p class="text-xs">Tente buscar por outro termo ou desmarque o filtro de equipamento.</p>
      </div>

      <button
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        type="button"
        class="w-full text-left p-3.5 rounded-xl border border-border-grid bg-surface hover:border-border-primary hover:bg-bg-alternate transition-all flex items-center justify-between group cursor-pointer"
        @click="handleSelect(exercise)"
      >
        <div>
          <div class="font-bold text-sm text-ink group-hover:text-primary-container transition-colors">
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
    <template #footer>
      <div class="flex justify-end">
        <AppButton variant="outline" size="sm" @click="emit('close')">
          Cancelar
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>
