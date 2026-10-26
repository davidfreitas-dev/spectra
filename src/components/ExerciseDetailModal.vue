<script setup lang="ts">
import { computed } from 'vue'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { AppButton, AppModal } from '@/components'
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
      <!-- Tags & PR Card -->
      <div class="flex items-center justify-between gap-3 p-3 rounded-xl border border-border-grid bg-bg-alternate">
        <div class="space-y-1">
          <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Grupo Principal</span>
          <span class="font-bold text-sm text-ink">{{ exercise.muscleGroups.join(', ') }}</span>
        </div>

        <div class="text-right">
          <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Recorde Pessoal (PR)</span>
          <span
            v-if="personalRecord !== undefined && personalRecord !== null"
            class="font-metric-number text-base font-bold text-primary-container"
          >
            {{ personalRecord }} {{ exercise.measurementType === 'reps' ? 'reps' : 's' }}
          </span>
          <span v-else class="text-xs text-ink-muted font-bold">
            Sem registro
          </span>
        </div>
      </div>

      <!-- Instructions -->
      <div>
        <h3 class="font-bold text-xs uppercase text-ink-muted tracking-wider mb-2">
          Como Executar
        </h3>
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
          Variações do Movimento
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            v-if="easierExercise"
            type="button"
            class="text-left p-3 rounded-xl border border-border-grid bg-surface hover:bg-bg-alternate transition-colors cursor-pointer"
            @click="emit('select-variation', easierExercise)"
          >
            <span class="font-eyebrow text-[9px] uppercase text-ink-muted font-bold block">Mais fácil</span>
            <span class="font-bold text-sm text-ink block mt-0.5">{{ easierExercise.name }}</span>
          </button>

          <button
            v-if="harderExercise"
            type="button"
            class="text-left p-3 rounded-xl border border-border-grid bg-surface hover:bg-bg-alternate transition-colors cursor-pointer"
            @click="emit('select-variation', harderExercise)"
          >
            <span class="font-eyebrow text-[9px] uppercase text-ink-muted font-bold block">Mais desafiador</span>
            <span class="font-bold text-sm text-ink block mt-0.5">{{ harderExercise.name }}</span>
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
