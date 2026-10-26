<script setup lang="ts">
import { computed } from 'vue'
import { AppButton, AppEmptyState, AppModal } from '@/components'
import AppIcon from './AppIcon.vue'
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
  <AppModal
    :is-open="isOpen && !!dayKey"
    eyebrow="Agenda Semanal"
    :title="`Treino para ${dayInfo?.label || dayKey}`"
    max-width="md"
    @close="emit('close')"
  >
    <!-- Workout Options -->
    <div class="p-4 sm:p-5 space-y-2">
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
            <AppIcon name="moon" :size="18" />
          </span>
          <div>
            <span class="font-bold text-sm text-ink block">Descanso</span>
            <span class="text-xs text-ink-muted">Sem treino agendado neste dia</span>
          </div>
        </div>
        <AppIcon
          v-if="!currentWorkoutId"
          name="check"
          :size="20"
          class="text-primary-container"
        />
      </button>

      <div class="pt-2 pb-1">
        <span class="font-eyebrow text-[10px] uppercase text-ink-muted font-bold tracking-wider">
          Seus Treinos
        </span>
      </div>

      <!-- Empty state when user has no workouts yet -->
      <AppEmptyState
        v-if="workouts.length === 0"
        variant="dashed"
        title="Nenhum treino criado"
        description="Copie um modelo pronto de calistenia ou crie uma rotina personalizada para agendar na semana."
        icon="dumbbell"
      >
        <template #actions>
          <AppButton variant="fill" size="sm" @click="handleExplore">
            <AppIcon name="copy" :size="16" />
            <span>Explorar Treinos Prontos</span>
          </AppButton>
        </template>
      </AppEmptyState>

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
              <AppIcon name="dumbbell" :size="18" />
            </span>
            <div>
              <span class="font-bold text-sm text-ink block">{{ workout.name }}</span>
              <span class="text-xs text-ink-muted">{{ workout.items.length }} exercícios</span>
            </div>
          </div>
          <AppIcon
            v-if="currentWorkoutId === workout.id"
            name="check"
            :size="20"
            class="text-primary-container"
          />
        </button>
      </template>
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
