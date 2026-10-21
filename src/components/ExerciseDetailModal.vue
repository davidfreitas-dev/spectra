<script setup lang="ts">
import { computed, toRef } from 'vue'
import { EXERCISE_CATALOG } from '@/data/exercises'
import { AppButton } from '@/components'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
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

useBodyScrollLock(toRef(props, 'isOpen'))

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
  <Transition name="modal-sheet">
    <div
      v-if="isOpen && exercise"
      class="modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/50 backdrop-blur-xs select-none"
      @click.self="emit('close')"
      @touchmove.self.prevent
    >
      <div
        class="modal-card bg-surface border-t-2 sm:border-2 border-border-primary rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[88vh] sm:max-h-[85vh] flex flex-col shadow-[0_8px_0_0_#111111] overflow-hidden"
      >
      <!-- Header -->
      <div class="p-4 sm:p-5 border-b border-border-grid flex items-center justify-between bg-bg-alternate">
        <div>
          <span class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider block">
            Detalhes do Exercício
          </span>
          <h2 class="font-display text-xl font-bold text-ink">
            {{ exercise.name }}
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

      <!-- Content -->
      <div class="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
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
        <div v-if="easierExercise || harderExercise" class="space-y-2 pt-2 border-t border-border-grid">
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
      <div class="p-3 border-t border-border-grid bg-bg-alternate flex justify-end">
        <AppButton variant="outline" size="sm" @click="emit('close')">
          Fechar
        </AppButton>
      </div>
    </div>
  </div>
</Transition>
</template>
