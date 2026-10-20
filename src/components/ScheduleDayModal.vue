<script setup lang="ts">
import { computed } from 'vue'
import { AppButton } from '@/components'
import { DAYS_OF_WEEK } from '@/constants/domain'
import type { Workout } from '@/types/domain'

const props = defineProps<{
  isOpen: boolean
  dayKey: string | null
  currentWorkoutId: string | null
  workouts: Workout[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'assign', workoutId: string | null): void
  (e: 'explore-workouts'): void
}>()

const dayInfo = computed(() => {
  return DAYS_OF_WEEK.find((d) => d.key === props.dayKey)
})

function handleSelect(workoutId: string | null) {
  emit('assign', workoutId)
  emit('close')
}

function handleExplore() {
  emit('explore-workouts')
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen && dayKey"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150"
    @click.self="emit('close')"
  >
    <div
      class="bg-surface border-2 border-border-primary rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-[0_8px_0_0_#111111] overflow-hidden"
    >
      <!-- Header -->
      <div class="p-4 sm:p-5 border-b border-border-grid flex items-center justify-between bg-bg-alternate">
        <div>
          <span class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider block">
            Agenda Semanal
          </span>
          <h2 class="font-display text-xl font-bold text-ink">
            Treino para {{ dayInfo?.label || dayKey }}
          </h2>
        </div>
        <button
          type="button"
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-border-grid bg-surface hover:bg-bg-alternate text-ink font-bold cursor-pointer transition-colors"
          @click="emit('close')"
        >
          <span class="material-symbols-outlined text-lg!">close</span>
        </button>
      </div>

      <!-- Workout Options -->
      <div class="p-4 sm:p-5 space-y-2 flex-1 overflow-y-auto">
        <!-- Rest Option -->
        <button
          type="button"
          class="w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer"
          :class="!currentWorkoutId
            ? 'border-border-primary bg-primary-container/10 font-bold shadow-[0_2px_0_0_#111111]'
            : 'border-border-grid bg-surface hover:bg-bg-alternate'"
          @click="handleSelect(null)"
        >
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-lg bg-bg-alternate border border-border-grid flex items-center justify-center text-ink-muted">
              <span class="material-symbols-outlined text-lg!">bedtime</span>
            </span>
            <div>
              <span class="font-bold text-sm text-ink block">Descanso</span>
              <span class="text-xs text-ink-muted">Sem treino agendado neste dia</span>
            </div>
          </div>
          <span
            v-if="!currentWorkoutId"
            class="material-symbols-outlined text-primary-container text-xl!"
          >
            check_circle
          </span>
        </button>

        <div class="pt-2 pb-1">
          <span class="font-eyebrow text-[10px] uppercase text-ink-muted font-bold tracking-wider">
            Seus Treinos
          </span>
        </div>

        <!-- Empty state when user has no workouts yet -->
        <div
          v-if="workouts.length === 0"
          class="p-4 text-center space-y-3 bg-bg-alternate rounded-xl border border-dashed border-border-grid"
        >
          <div class="w-9 h-9 mx-auto rounded-full bg-surface border border-border-grid flex items-center justify-center text-ink-muted">
            <span class="material-symbols-outlined text-lg!">fitness_center</span>
          </div>
          <div>
            <div class="font-bold text-xs text-ink">Nenhum treino criado</div>
            <p class="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
              Copie um modelo pronto de calistenia ou crie uma rotina personalizada para agendar na semana.
            </p>
          </div>
          <div class="pt-1">
            <AppButton variant="fill" size="sm" @click="handleExplore">
              <template #left-icon>
                <span class="material-symbols-outlined text-base!">content_copy</span>
              </template>
              Explorar Treinos Prontos
            </AppButton>
          </div>
        </div>

        <!-- Available workouts list -->
        <template v-else>
          <button
            v-for="workout in workouts"
            :key="workout.id"
            type="button"
            class="w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer"
            :class="currentWorkoutId === workout.id
              ? 'border-border-primary bg-primary-container/10 font-bold shadow-[0_2px_0_0_#111111]'
              : 'border-border-grid bg-surface hover:bg-bg-alternate'"
            @click="handleSelect(workout.id)"
          >
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-lg bg-bg-alternate border border-border-grid flex items-center justify-center text-primary-container">
                <span class="material-symbols-outlined text-lg!">fitness_center</span>
              </span>
              <div>
                <span class="font-bold text-sm text-ink block">{{ workout.name }}</span>
                <span class="text-xs text-ink-muted">{{ workout.items.length }} exercícios</span>
              </div>
            </div>
            <span
              v-if="currentWorkoutId === workout.id"
              class="material-symbols-outlined text-primary-container text-xl!"
            >
              check_circle
            </span>
          </button>
        </template>
      </div>

      <!-- Footer -->
      <div class="p-3 border-t border-border-grid bg-bg-alternate flex justify-end">
        <AppButton variant="outline" size="sm" @click="emit('close')">
          Cancelar
        </AppButton>
      </div>
    </div>
  </div>
</template>
