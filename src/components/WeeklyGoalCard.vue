<script setup lang="ts">
import { computed } from 'vue'
import { AppCard, AppButton, AppProgressBar } from '@/components'
import { useConfetti } from '@/composables/useConfetti'
import { useSound } from '@/composables/useSound'

interface Props {
  completedCount: number
  weeklyGoal: number
  soundEnabled?: boolean
  title?: string
  eyebrow?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  soundEnabled: true,
  title: 'Meta Semanal',
  eyebrow: 'Frequência Baseada na Agenda',
  description: undefined,
})

const emit = defineEmits<{
  (e: 'celebrate'): void
}>()

const { fireCelebrationBurst } = useConfetti()
const { playCelebration } = useSound()

const percentage = computed(() => {
  if (props.weeklyGoal <= 0) return 0
  return Math.min(100, Math.round((props.completedCount / props.weeklyGoal) * 100))
})

const isGoalAchieved = computed(() => {
  return props.weeklyGoal > 0 && props.completedCount >= props.weeklyGoal
})

function handleCelebrate() {
  fireCelebrationBurst()
  if (props.soundEnabled) {
    playCelebration()
  }
  emit('celebrate')
}
</script>

<template>
  <AppCard
    :title="title"
    :eyebrow="eyebrow"
  >
    <div v-if="weeklyGoal > 0" class="space-y-4">
      <AppProgressBar
        :value="completedCount"
        :max="weeklyGoal"
        :label="`Meta da Semana: ${completedCount} de ${weeklyGoal} treinos concluídos`"
        :status-text="`${percentage}% atingido`"
        variant="success"
      />

      <!-- Banner comemorativo de meta semanal batida -->
      <div
        v-if="isGoalAchieved"
        class="p-3.5 rounded-xl border-2 border-border-primary bg-primary-container/10 flex items-center justify-between gap-3 shadow-[0_2px_0_0_#111111]"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-xl">🏆</span>
          <div>
            <span class="font-bold text-xs text-ink block">
              Meta Semanal Conquistada!
            </span>
            <span class="text-[11px] text-ink-muted font-medium block">
              Você completou todos os treinos desta semana.
            </span>
          </div>
        </div>
        <AppButton
          variant="outline"
          size="sm"
          class="shrink-0"
          @click="handleCelebrate"
        >
          Comemorar 🎉
        </AppButton>
      </div>

      <slot name="description">
        <p v-if="description" class="font-body text-xs text-ink-muted leading-relaxed">
          {{ description }}
        </p>
        <p v-else class="font-body text-xs text-ink-muted leading-relaxed">
          Sua meta é calculada automaticamente a partir da sua agenda. Sessões concluídas contam para a semana atual (segunda a domingo).
        </p>
      </slot>
    </div>

    <!-- Estado sem meta agendada -->
    <div v-else class="text-center py-4 space-y-2">
      <p class="text-xs text-ink-muted">
        Nenhum treino agendado para esta semana. Toque em qualquer dia da agenda na aba Hoje para definir sua rotina semanal.
      </p>
    </div>
  </AppCard>
</template>
