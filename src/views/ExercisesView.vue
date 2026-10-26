<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  AppCard,
  AppInput,
  AppChip,
  AppPageHeader,
  AppStatusBadge,
  ExerciseDetailModal,
} from '@/components'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { useSessionsStore } from '@/stores/sessionsStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import type { ExerciseCatalogItem, Equipment } from '@/types/domain'

const sessionsStore = useSessionsStore()
const preferencesStore = usePreferencesStore()
const route = useRoute()

const searchQuery = ref('')
const selectedMuscle = ref('todos')
const selectedLevel = ref('todos')
const selectedEquipment = ref('todos')

// Modal de detalhes
const showDetailModal = ref(false)
const selectedExercise = ref<ExerciseCatalogItem | null>(null)

onMounted(() => {
  sessionsStore.load()
  preferencesStore.load()
  if (route.query.q && typeof route.query.q === 'string') {
    searchQuery.value = route.query.q
  }
  // Se o usuário tem nível definido nas preferências, usa como padrão
  if (preferencesStore.preferences.level) {
    selectedLevel.value = preferencesStore.preferences.level
  }
})

watch(
  () => route.query.q,
  (newQ) => {
    if (typeof newQ === 'string') {
      searchQuery.value = newQ
    }
  }
)

const muscleFilters = [
  { id: 'todos', label: 'Todos os Músculos' },
  { id: 'Peito', label: 'Peito' },
  { id: 'Costas', label: 'Costas' },
  { id: 'Tríceps', label: 'Tríceps' },
  { id: 'Bíceps', label: 'Bíceps' },
  { id: 'Pernas', label: 'Pernas' },
  { id: 'Glúteos', label: 'Glúteos' },
  { id: 'Ombros', label: 'Ombros' },
  { id: 'Core', label: 'Core / Abdômen' },
  { id: 'Cardio', label: 'Cardio' },
]

const levelFilters = [
  { id: 'todos', label: 'Todos os Níveis' },
  { id: 'beginner', label: 'Iniciante' },
  { id: 'intermediate', label: 'Intermediário' },
  { id: 'advanced', label: 'Avançado' },
]

const equipmentFilters = [
  { id: 'todos', label: 'Qualquer Equipamento' },
  { id: 'none', label: 'Peso Corporal' },
  { id: 'bar', label: 'Barra Fixa' },
  { id: 'band', label: 'Elástico' },
  { id: 'rope', label: 'Corda' },
]

const filteredExercises = computed<ExerciseCatalogItem[]>(() => {
  return EXERCISE_CATALOG.filter((ex) => {
    // Busca por texto
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchName = ex.name.toLowerCase().includes(q)
      const matchMuscles = ex.muscleGroups.some((m) => m.toLowerCase().includes(q))
      if (!matchName && !matchMuscles) return false
    }

    // Filtro por músculo
    if (selectedMuscle.value !== 'todos') {
      if (!ex.muscleGroups.some((m) => m.toLowerCase() === selectedMuscle.value.toLowerCase())) {
        return false
      }
    }

    // Filtro por nível
    if (selectedLevel.value !== 'todos') {
      if (ex.level !== selectedLevel.value) return false
    }

    // Filtro por equipamento
    if (selectedEquipment.value !== 'todos') {
      if (!ex.equipment.includes(selectedEquipment.value as Equipment)) {
        return false
      }
    }

    return true
  })
})

function openDetail(exercise: ExerciseCatalogItem) {
  selectedExercise.value = exercise
  showDetailModal.value = true
}

function handleSelectVariation(variation: ExerciseCatalogItem) {
  selectedExercise.value = variation
}
</script>

<template>
  <div class="max-w-225 mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 select-none">
    <!-- View Header -->
    <AppPageHeader
      title="Biblioteca de Exercícios"
      eyebrow="Catálogo Estático &amp; Imutável"
      subtitle="Guia de movimentos calistênicos com instruções posturais, variações e seus recordes pessoais."
    />

    <!-- Search & Filters Container -->
    <AppCard>
      <div class="space-y-4">
        <!-- Search Input -->
        <AppInput
          v-model="searchQuery"
          placeholder="Buscar exercício por nome ou músculo (ex: flexão, barra, core)..."
        />

        <!-- Muscle Group Chips -->
        <div>
          <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-1.5 font-bold tracking-wider">
            Grupo Muscular:
          </div>
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <AppChip
              v-for="filter in muscleFilters"
              :key="filter.id"
              :label="filter.label"
              :selected="selectedMuscle === filter.id"
              @click="selectedMuscle = filter.id"
            />
          </div>
        </div>

        <!-- Level Chips -->
        <div class="pt-2 border-t border-border-grid">
          <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-1.5 font-bold tracking-wider">
            Nível:
          </div>
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <AppChip
              v-for="lvl in levelFilters"
              :key="lvl.id"
              :label="lvl.label"
              :selected="selectedLevel === lvl.id"
              @click="selectedLevel = lvl.id"
            />
          </div>
        </div>

        <!-- Equipment Chips -->
        <div class="pt-2 border-t border-border-grid">
          <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-1.5 font-bold tracking-wider">
            Equipamento:
          </div>
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <AppChip
              v-for="eq in equipmentFilters"
              :key="eq.id"
              :label="eq.label"
              :selected="selectedEquipment === eq.id"
              @click="selectedEquipment = eq.id"
            />
          </div>
        </div>
      </div>
    </AppCard>

    <!-- Results Counter -->
    <div class="flex items-center justify-between text-xs font-eyebrow text-ink-muted">
      <span>{{ filteredExercises.length }} exercícios encontrados</span>
      <span>Toque em um exercício para ver detalhes</span>
    </div>

    <!-- Exercises Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
      <div
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        class="cursor-pointer h-full flex flex-col"
        @click="openDetail(exercise)"
      >
        <AppCard
          :title="exercise.name"
          :eyebrow="exercise.measurementType === 'reps' ? 'Repetições' : 'Isometria / Segundos'"
          dot-color="primary"
          class="h-full hover:border-ink hover:shadow-[0_6px_0_0_#111111] transition-all"
        >
          <div class="flex-1 flex flex-col justify-between space-y-3">
            <div class="space-y-3">
              <!-- Muscle Tags & Level Badge -->
              <div class="flex flex-wrap items-center gap-1.5 min-h-6">
                <span
                  v-for="muscle in exercise.muscleGroups"
                  :key="muscle"
                  class="px-2 py-0.5 rounded bg-bg-alternate border border-border-grid font-eyebrow text-[10px] font-bold text-ink"
                >
                  {{ muscle }}
                </span>
              </div>

              <!-- Level / PR indicator -->
              <div class="flex items-center justify-between pt-4 border-t border-border-grid">
                <div class="flex items-center gap-2">
                  <AppStatusBadge :type="exercise.level" />
                </div>

                <!-- Personal Record Badge if exists -->
                <span
                  v-if="sessionsStore.getPersonalRecord(exercise.id) !== null"
                  class="font-metric-number text-xs font-bold text-primary-container bg-primary-container/10 px-2 py-0.5 rounded border border-border-primary"
                >
                  PR: {{ sessionsStore.getPersonalRecord(exercise.id) }} {{ exercise.measurementType === 'reps' ? 'reps' : 's' }}
                </span>
                <span v-else class="text-[11px] text-ink-muted">
                  Sem PR
                </span>
              </div>
            </div>

            <!-- Instructions preview -->
            <p class="font-body text-xs text-ink-muted leading-relaxed line-clamp-2 mt-auto pt-1">
              {{ exercise.instructions[0] }}
            </p>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- Exercise Detail Modal -->
    <ExerciseDetailModal
      :is-open="showDetailModal"
      :exercise="selectedExercise"
      :personal-record="selectedExercise ? sessionsStore.getPersonalRecord(selectedExercise.id) : null"
      @close="showDetailModal = false"
      @select-variation="handleSelectVariation"
    />
  </div>
</template>
