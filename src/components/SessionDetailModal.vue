<script setup lang="ts">
import { computed } from 'vue'
import { AppButton, AppStatusBadge } from '@/components'
import type { Session } from '@/types/domain'

const props = defineProps<{
  isOpen: boolean
  session: Session | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'delete', sessionId: string): void
}>()

const formattedDuration = computed(() => {
  if (!props.session || !props.session.endedAt) return '—'
  const start = new Date(props.session.startedAt).getTime()
  const end = new Date(props.session.endedAt).getTime()
  const diffSec = Math.max(0, Math.floor((end - start) / 1000))
  const mins = Math.floor(diffSec / 60)
  const secs = diffSec % 60
  return `${mins} min ${secs} s`
})

const formattedDate = computed(() => {
  if (!props.session) return ''
  const d = new Date(props.session.startedAt)
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<template>
  <div
    v-if="isOpen && session"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150"
    @click.self="emit('close')"
  >
    <div
      class="bg-surface border-2 border-border-primary rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-[0_8px_0_0_#111111] overflow-hidden"
    >
      <!-- Header -->
      <div class="p-4 sm:p-5 border-b border-border-grid flex items-center justify-between bg-bg-alternate">
        <div>
          <span class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider block">
            Registro Histórico
          </span>
          <h2 class="font-display text-xl font-bold text-ink">
            {{ session.workoutName }}
          </h2>
          <span class="text-xs text-ink-muted capitalize">
            {{ formattedDate }}
          </span>
        </div>
        <button
          type="button"
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-border-grid bg-surface hover:bg-bg-alternate text-ink font-bold cursor-pointer transition-colors"
          @click="emit('close')"
        >
          <span class="material-symbols-outlined !text-lg">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
        <!-- Status & Stats Banner -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 rounded-xl border border-border-grid bg-bg-alternate text-center">
            <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Status</span>
            <div class="mt-1 flex justify-center">
              <AppStatusBadge
                :type="session.status === 'completed' ? 'completed' : 'partial'"
                :label="session.status === 'completed' ? 'Concluída' : 'Parcial'"
              />
            </div>
          </div>

          <div class="p-3 rounded-xl border border-border-grid bg-bg-alternate text-center">
            <span class="font-eyebrow text-[10px] uppercase text-ink-muted block">Duração Total</span>
            <span class="font-metric-number text-base font-bold text-ink mt-0.5 block">
              {{ formattedDuration }}
            </span>
          </div>
        </div>

        <!-- Note (if exists) -->
        <div
          v-if="session.note"
          class="p-3.5 rounded-xl border border-border-grid bg-surface text-xs text-ink space-y-1"
        >
          <span class="font-bold uppercase text-[10px] text-ink-muted block">Anotação:</span>
          <p class="leading-relaxed italic">"{{ session.note }}"</p>
        </div>

        <!-- Exercises and Sets Detailed Breakdown -->
        <div class="space-y-3">
          <h3 class="font-bold text-xs uppercase text-ink-muted tracking-wider">
            Detalhamento por Exercício
          </h3>

          <div
            v-for="ex in session.exercises"
            :key="ex.exerciseId"
            class="p-3 rounded-xl border border-border-grid bg-surface space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm text-ink">{{ ex.name }}</span>
              <span class="text-xs text-ink-muted font-bold font-metric-number">
                Meta: {{ ex.plannedSets }} × {{ ex.target }} {{ ex.measurementType === 'reps' ? 'reps' : 's' }}
              </span>
            </div>

            <!-- Sets badges -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <div
                v-for="s in ex.sets"
                :key="s.number"
                class="px-2.5 py-1 rounded-lg text-xs font-metric-number font-bold border"
                :class="s.actualValue !== null
                  ? (s.actualValue >= s.plannedValue ? 'bg-success/15 border-border-success text-success' : 'bg-warning-container/15 border-border-warning text-warning')
                  : 'bg-bg-alternate border-border-grid text-ink-muted line-through'"
              >
                Série {{ s.number }}: {{ s.actualValue !== null ? `${s.actualValue} ${ex.measurementType === 'reps' ? 'reps' : 's'}` : 'Não realizada' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with Delete Session -->
      <div class="p-4 border-t border-border-grid bg-bg-alternate flex items-center justify-between">
        <AppButton variant="danger" size="sm" @click="emit('delete', session.id)">
          <template #left-icon>
            <span class="material-symbols-outlined text-base!">delete</span>
          </template>
          Excluir Sessão
        </AppButton>

        <AppButton variant="outline" size="sm" @click="emit('close')">
          Fechar
        </AppButton>
      </div>
    </div>
  </div>
</template>
