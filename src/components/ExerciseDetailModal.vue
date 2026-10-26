<script setup lang="ts">
import { computed } from 'vue'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { AppButton, AppModal, AppStatusBadge } from '@/components'
import { formatEquipmentLabel } from '@/utils/workoutMetrics'
import AppIcon from './AppIcon.vue'
import type { ExerciseCatalogItem } from '@/types/domain'

const props = defineProps<{
  isOpen: boolean
  exercise: ExerciseCatalogItem | null
  personalRecord?: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-variation', variationExercise: ExerciseCatalogItem): void
}>()

const easierExercise = computed(() => {
  if (!props.exercise?.easierId) return null
  return EXERCISE_CATALOG.find((e) => e.id === props.exercise?.easierId)
})

const harderExercise = computed(() => {
  if (!props.exercise?.harderId) return null
  return EXERCISE_CATALOG.find((e) => e.id === props.exercise?.harderId)
})
</script>

<template>
  <AppModal
    :is-open="isOpen && !!exercise"
    eyebrow="Detalhes do Exercício"
    :title="exercise?.name"
    max-width="lg"
    @close="emit('close')"
  >
    <!-- Content -->
    <div v-if="exercise" class="p-4 sm:p-6 space-y-4">
      <!-- Tags, Equipment & PR Card -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-border-grid bg-bg-alternate">
        <div class="space-y-1">
          <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Grupo Principal</span>
          <span class="font-bold text-xs sm:text-sm text-ink">{{ exercise.muscleGroups.join(', ') }}</span>
        </div>

        <div class="space-y-1">
          <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Equipamento</span>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="eq in exercise.equipment"
              :key="eq"
              class="font-bold text-xs px-2 py-0.5 rounded bg-surface border border-border-grid text-ink inline-block"
            >
              {{ formatEquipmentLabel(eq) }}
            </span>
          </div>
        </div>

        <div class="space-y-1 sm:text-right">
          <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Recorde Pessoal (PR)</span>
          <span
            v-if="personalRecord !== undefined && personalRecord !== null"
            class="font-metric-number text-base font-bold text-primary-container"
          >
            {{ personalRecord }} {{ exercise.measurementType === 'reps' ? 'reps' : 's' }}
          </span>
          <span v-else class="text-xs text-ink-muted font-bold block pt-0.5">
            Sem registro
          </span>
        </div>
      </div>

      <!-- Instructions -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-xs uppercase text-ink-muted tracking-wider">
            Como Executar
          </h3>
          <AppStatusBadge :type="exercise.level" />
        </div>
        <ol class="space-y-2 list-decimal list-inside text-sm text-ink">
          <li
            v-for="(instruction, idx) in exercise.instructions"
            :key="idx"
            class="leading-relaxed"
          >
            <span class="font-normal">{{ instruction }}</span>
          </li>
        </ol>
      </div>

      <!-- Safety Note -->
      <div
        v-if="exercise.safetyNote"
        class="p-3.5 rounded-xl border border-warning-container bg-warning-container/10 flex items-start gap-2.5 text-xs text-ink"
      >
        <AppIcon name="shield_alert" :size="18" class="text-warning-container shrink-0" />
        <div>
          <span class="font-bold block text-ink">Dica de Segurança</span>
          <span>{{ exercise.safetyNote }}</span>
        </div>
      </div>

      <!-- Variations (Easier / Harder) -->
      <div v-if="easierExercise || harderExercise" class="space-y-2 pt-4 border-t border-border-grid">
        <h3 class="font-bold text-xs uppercase text-ink-muted tracking-wider">
          Progressões &amp; Variações
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <!-- Easier -->
          <button
            v-if="easierExercise"
            type="button"
            class="p-3 rounded-lg border border-border-grid bg-surface hover:bg-bg-alternate hover:border-border-primary transition-all text-left group cursor-pointer"
            @click="emit('select-variation', easierExercise)"
          >
            <div class="flex items-center gap-1.5 text-[11px] font-bold text-success font-eyebrow uppercase mb-1">
              <AppIcon name="arrow_down" :size="14" class="text-success" />
              <span>Variação Mais Fácil</span>
            </div>
            <div class="font-bold text-xs text-ink group-hover:text-primary-container transition-colors">
              {{ easierExercise.name }}
            </div>
          </button>

          <!-- Harder -->
          <button
            v-if="harderExercise"
            type="button"
            class="p-3 rounded-lg border border-border-grid bg-surface hover:bg-bg-alternate hover:border-border-primary transition-all text-left group cursor-pointer"
            @click="emit('select-variation', harderExercise)"
          >
            <div class="flex items-center gap-1.5 text-[11px] font-bold text-primary-container font-eyebrow uppercase mb-1">
              <AppIcon name="arrow_up" :size="14" />
              <span>Próximo Nível (Mais Difícil)</span>
            </div>
            <div class="font-bold text-xs text-ink group-hover:text-primary-container transition-colors">
              {{ harderExercise.name }}
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end">
        <AppButton variant="outline" size="sm" @click="emit('close')">
          Fechar
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>
