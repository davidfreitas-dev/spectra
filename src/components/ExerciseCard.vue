<script setup lang="ts">
import { computed } from 'vue'
import { AppCard, AppStatusBadge } from '@/components'
import { formatEquipmentLabel } from '@/utils/workoutMetrics'
import type { ExerciseCatalogItem } from '@/types/domain'

interface Props {
  exercise: ExerciseCatalogItem
  personalRecord?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  personalRecord: null,
})

const emit = defineEmits<{
  (e: 'click', exercise: ExerciseCatalogItem): void
}>()

const eyebrow = computed(() => {
  return props.exercise.measurementType === 'reps' ? 'Repetições' : 'Isometria / Segundos'
})

const hasPersonalRecord = computed(() => {
  return props.personalRecord !== null && props.personalRecord !== undefined
})

const personalRecordUnit = computed(() => {
  return props.exercise.measurementType === 'reps' ? 'reps' : 's'
})
</script>

<template>
  <div
    class="cursor-pointer h-full flex flex-col group select-none"
    role="button"
    tabindex="0"
    :aria-label="`Ver detalhes de ${exercise.name}`"
    @click="emit('click', exercise)"
    @keydown.enter.prevent="emit('click', exercise)"
    @keydown.space.prevent="emit('click', exercise)"
  >
    <AppCard
      :title="exercise.name"
      :eyebrow="eyebrow"
      dot-color="primary"
      class="h-full group-hover:border-ink group-hover:shadow-[0_6px_0_0_#111111] transition-all"
    >
      <div class="flex-1 flex flex-col justify-between space-y-3">
        <div class="space-y-3">
          <!-- Muscle Tags & Equipment Badge -->
          <div class="flex flex-wrap items-center gap-1.5 min-h-6">
            <span
              v-for="eq in exercise.equipment"
              :key="eq"
              class="px-2 py-0.5 rounded bg-primary-container/10 border border-border-primary/40 font-eyebrow text-[10px] font-bold text-primary-container uppercase"
            >
              {{ formatEquipmentLabel(eq) }}
            </span>
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
              v-if="hasPersonalRecord"
              class="font-metric-number text-xs font-bold text-primary-container bg-primary-container/10 px-2 py-0.5 rounded border border-border-primary"
            >
              PR: {{ personalRecord }} {{ personalRecordUnit }}
            </span>
            <span v-else class="text-[11px] text-ink-muted">
              Sem PR
            </span>
          </div>
        </div>

        <!-- Instructions preview -->
        <p
          v-if="exercise.instructions.length > 0"
          class="font-body text-xs text-ink-muted leading-relaxed line-clamp-2 mt-auto pt-1"
        >
          {{ exercise.instructions[0] }}
        </p>
      </div>
    </AppCard>
  </div>
</template>
