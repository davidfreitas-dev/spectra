<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import { AppButton, AppCheckbox } from '@/components'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import { DAYS_OF_WEEK } from '@/constants/domain'
import { PRESET_WORKOUTS } from '@/data/presetWorkouts'
import AppIcon from './AppIcon.vue'
import type { AppIconName } from './icons'
import type { UserLevel, Equipment } from '@/types/domain'

export interface OnboardingCompleteEvent {
  level: UserLevel
  equipment: Equipment[]
  selectedDays: string[]
  startChoice: 'recommended' | 'presets' | 'custom'
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'complete', data: OnboardingCompleteEvent): void
}>()

useBodyScrollLock(toRef(props, 'isOpen'))

const step = ref<1 | 2 | 3 | 4>(1)
const selectedLevel = ref<UserLevel>('beginner')
const selectedEquipment = ref<Equipment[]>(['none'])
const selectedDays = ref<string[]>(['monday', 'wednesday', 'friday'])

const levels: { value: UserLevel; label: string; desc: string }[] = [
  {
    value: 'beginner',
    label: 'Iniciante',
    desc: 'Começando agora ou retornando aos treinos com peso corporal.',
  },
  {
    value: 'intermediate',
    label: 'Intermediário',
    desc: 'Já domina flexões, agachamentos e busca evolução consistente.',
  },
  {
    value: 'advanced',
    label: 'Avançado',
    desc: 'Executa barras, paralelas e movimentos com alto volume de repetições.',
  },
]

const equipmentOptions: { value: Equipment; label: string; icon: AppIconName }[] = [
  { value: 'none', label: 'Apenas Peso Corporal', icon: 'body' },
  { value: 'bar', label: 'Barra Fixa', icon: 'minus' },
  { value: 'band', label: 'Elástico de Resistência', icon: 'rope' },
  { value: 'rope', label: 'Corda de Pular', icon: 'flame' },
]

// Treino recomendado baseado no nível
const recommendedPreset = computed(() => {
  if (selectedLevel.value === 'beginner') {
    return PRESET_WORKOUTS[0] || null // Full Body Iniciante
  } else if (selectedLevel.value === 'intermediate') {
    return PRESET_WORKOUTS[1] || PRESET_WORKOUTS[0] // Empurrada Intermediária
  } else {
    return PRESET_WORKOUTS[2] || PRESET_WORKOUTS[0] // Puxada & Core
  }
})

function toggleEquipment(eq: Equipment) {
  if (eq === 'none') {
    selectedEquipment.value = ['none']
    return
  }

  let list: Equipment[] = selectedEquipment.value.filter((e) => e !== 'none')
  if (list.includes(eq)) {
    list = list.filter((e) => e !== eq)
  } else {
    list.push(eq)
  }

  if (list.length === 0) {
    list = ['none']
  }
  selectedEquipment.value = list
}

function toggleDay(dayKey: string) {
  if (selectedDays.value.includes(dayKey)) {
    if (selectedDays.value.length > 1) {
      selectedDays.value = selectedDays.value.filter((d) => d !== dayKey)
    }
  } else {
    selectedDays.value.push(dayKey)
  }
}

function handleFinish(startChoice: 'recommended' | 'presets' | 'custom') {
  emit('complete', {
    level: selectedLevel.value,
    equipment: selectedEquipment.value,
    selectedDays: selectedDays.value,
    startChoice,
  })
}
</script>

<template>
  <Transition name="modal-pop">
    <div
      v-if="isOpen"
      class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm select-none"
      @touchmove.self.prevent
    >
      <div
        class="modal-card bg-surface border-2 border-border-primary rounded-2xl w-full max-w-lg shadow-[0_8px_0_0_#111111] overflow-hidden flex flex-col max-h-[92vh]"
      >
        <!-- Header -->
        <div class="p-5 border-b border-border-grid bg-bg-alternate shrink-0">
          <div class="flex items-center justify-between">
            <span class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider">
              Boas-vindas ao Spectra • Passo {{ step }} de 4
            </span>
            <span class="font-metric-number text-xs font-bold text-ink">
              {{ step }}/4
            </span>
          </div>
          <h2 class="font-display text-lg sm:text-xl font-bold text-ink mt-1">
            <template v-if="step === 1">Qual é o seu nível atual?</template>
            <template v-else-if="step === 2">Quais equipamentos você tem?</template>
            <template v-else-if="step === 3">Em quais dias pretende treinar?</template>
            <template v-else>Como prefere começar sua rotina?</template>
          </h2>
        </div>

        <!-- Body Scrollable Container -->
        <div class="p-5 overflow-y-auto space-y-4">
          <!-- Passo 1: Nível -->
          <div v-if="step === 1" class="space-y-3 animate-in fade-in duration-150">
            <p class="text-xs text-ink-muted">
              Seu nível calibra as recomendações e os filtros da biblioteca. Você poderá alterar quando quiser nas configurações.
            </p>

            <div class="space-y-2.5">
              <button
                v-for="lvl in levels"
                :key="lvl.value"
                type="button"
                class="w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer"
                :class="selectedLevel === lvl.value
                  ? 'border-border-primary bg-primary-container/10 shadow-[0_2px_0_0_#111111] font-bold'
                  : 'border-border-grid bg-surface hover:bg-bg-alternate'"
                @click="selectedLevel = lvl.value"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-ink">{{ lvl.label }}</span>
                  <AppIcon
                    v-if="selectedLevel === lvl.value"
                    name="check"
                    :size="18"
                    class="text-primary-container"
                  />
                </div>
                <p class="text-xs text-ink-muted mt-1 font-normal leading-relaxed">
                  {{ lvl.desc }}
                </p>
              </button>
            </div>
          </div>

          <!-- Passo 2: Equipamentos -->
          <div v-else-if="step === 2" class="space-y-4 animate-in fade-in duration-150">
            <p class="text-xs text-ink-muted">
              A calistenia funciona perfeitamente apenas com o chão! Selecione se possui itens adicionais:
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                v-for="eq in equipmentOptions"
                :key="eq.value"
                class="p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer"
                :class="selectedEquipment.includes(eq.value)
                  ? 'border-border-primary bg-primary-container/10 shadow-[0_2px_0_0_#111111] font-bold'
                  : 'border-border-grid bg-surface hover:bg-bg-alternate'"
                role="checkbox"
                :aria-checked="selectedEquipment.includes(eq.value)"
                tabindex="0"
                @click="toggleEquipment(eq.value)"
                @keydown.space.prevent="toggleEquipment(eq.value)"
                @keydown.enter.prevent="toggleEquipment(eq.value)"
              >
                <div class="flex items-center gap-2.5">
                  <AppIcon :name="eq.icon" :size="18" class="text-ink-muted" />
                  <span class="font-bold text-xs text-ink">{{ eq.label }}</span>
                </div>

                <AppCheckbox
                  :model-value="selectedEquipment.includes(eq.value)"
                  size="sm"
                  class="pointer-events-none"
                  tabindex="-1"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <!-- Passo 3: Dias da Semana (Agenda) -->
          <div v-else-if="step === 3" class="space-y-4 animate-in fade-in duration-150">
            <p class="text-xs text-ink-muted">
              A consistência é o pilar da calistenia. Selecione os dias em que pretende treinar:
            </p>

            <!-- Grid de Dias da Semana -->
            <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
              <button
                v-for="day in DAYS_OF_WEEK"
                :key="day.key"
                type="button"
                class="flex flex-col items-center justify-center py-3 px-1 rounded-xl border text-center transition-all cursor-pointer"
                :class="selectedDays.includes(day.key)
                  ? 'bg-primary-container text-on-primary border-border-primary shadow-[0_2px_0_0_#111111] font-bold'
                  : 'bg-surface text-ink border-border-grid hover:border-border-primary hover:bg-bg-alternate'"
                @click="toggleDay(day.key)"
              >
                <span
                  class="font-eyebrow text-[9px] uppercase tracking-wider block"
                  :class="selectedDays.includes(day.key) ? 'text-on-primary' : 'text-ink-muted'"
                >
                  {{ day.shortLabel }}
                </span>
                <span class="font-metric-number text-xs font-bold mt-1">
                  {{ day.shortLabel.substring(0, 1) }}
                </span>
              </button>
            </div>

            <!-- Resumo da Meta Semanal Derivada -->
            <div class="p-3.5 rounded-xl border border-border-grid bg-bg-alternate space-y-1.5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <AppIcon name="calendar" :size="16" class="text-primary-container" />
                  <span class="font-bold text-xs text-ink">Sua Meta Semanal:</span>
                </div>
                <span class="font-metric-number text-xs font-bold text-primary-container bg-primary-container/15 px-2 py-0.5 rounded-md border border-primary-container/30">
                  {{ selectedDays.length }} {{ selectedDays.length === 1 ? 'treino' : 'treinos' }} por semana
                </span>
              </div>

              <p class="text-[11px] text-ink-muted leading-relaxed">
                Essa frequência define sua meta automática. Você poderá ajustar os dias e horários da sua agenda quando quiser.
              </p>
            </div>
          </div>

          <!-- Passo 4: Como prefere começar (Liberdade e Escolha) -->
          <div v-else class="space-y-3.5 animate-in fade-in duration-150">
            <p class="text-xs text-ink-muted">
              Você tem total liberdade no Spectra. Escolha como quer dar o primeiro passo:
            </p>

            <!-- Opção 1: Treino Recomendado (Destaque) -->
            <div
              class="p-4 rounded-xl border-2 border-primary-container bg-primary-container/10 shadow-[0_3px_0_0_#f26a21] space-y-3 text-left transition-all"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="inline-flex items-center gap-1 bg-primary-container text-on-primary text-[9px] font-bold px-2 py-0.5 rounded font-eyebrow uppercase tracking-wider mb-1">
                    <AppIcon name="zap" :size="12" />
                    Recomendado
                  </div>
                  <h3 class="font-display font-bold text-sm sm:text-base text-ink">
                    {{ recommendedPreset?.name || 'Iniciante — Corpo Todo' }}
                  </h3>
                  <p class="text-xs text-ink-muted mt-0.5">
                    {{ recommendedPreset?.items.length || 4 }} exercícios estruturados para o seu nível e equipamentos.
                  </p>
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-surface/80 border border-border-grid text-[11px] text-ink-muted flex items-start gap-2">
                <AppIcon name="edit" :size="15" class="text-primary-container shrink-0 mt-0.5" />
                <span>
                  <strong>100% Personalizável:</strong> você poderá alterar séries, repetições e tempos de descanso a qualquer momento no editor.
                </span>
              </div>

              <AppButton
                variant="fill"
                size="md"
                class="w-full"
                @click="handleFinish('recommended')"
              >
                <AppIcon name="play" :size="16" />
                Começar com este Treino
              </AppButton>
            </div>

            <!-- Opção 2: Explorar Modelos Prontos -->
            <button
              type="button"
              class="w-full text-left p-3.5 rounded-xl border border-border-grid bg-surface hover:bg-bg-alternate hover:border-border-primary transition-all cursor-pointer flex items-center justify-between gap-3 group"
              @click="handleFinish('presets')"
            >
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-lg bg-bg-alternate border border-border-grid flex items-center justify-center text-ink shrink-0 mt-0.5 group-hover:bg-surface">
                  <AppIcon name="copy" :size="18" />
                </div>
                <div>
                  <h4 class="font-bold text-xs sm:text-sm text-ink">
                    Explorar Modelos Prontos
                  </h4>
                  <p class="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                    Veja opções de Fullbody, Empurrada, Puxada e Pernas para copiar e ajustar.
                  </p>
                </div>
              </div>

              <AppIcon name="arrow_right" :size="16" class="text-ink-muted group-hover:text-primary-container shrink-0" />
            </button>

            <!-- Opção 3: Montar do Zero -->
            <button
              type="button"
              class="w-full text-left p-3.5 rounded-xl border border-border-grid bg-surface hover:bg-bg-alternate hover:border-border-primary transition-all cursor-pointer flex items-center justify-between gap-3 group"
              @click="handleFinish('custom')"
            >
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-lg bg-bg-alternate border border-border-grid flex items-center justify-center text-ink shrink-0 mt-0.5 group-hover:bg-surface">
                  <AppIcon name="sliders" :size="18" />
                </div>
                <div>
                  <h4 class="font-bold text-xs sm:text-sm text-ink">
                    Montar Meu Próprio Treino do Zero
                  </h4>
                  <p class="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                    Escolha exercícios da nossa biblioteca de +40 movimentos e defina suas metas.
                  </p>
                </div>
              </div>

              <AppIcon name="arrow_right" :size="16" class="text-ink-muted group-hover:text-primary-container shrink-0" />
            </button>
          </div>
        </div>

        <!-- Footer / Navigation -->
        <div class="p-5 border-t border-border-grid bg-bg-alternate shrink-0">
          <div class="flex items-center justify-between">
            <div>
              <span v-if="step === 1" class="text-[11px] text-ink-muted">Leva apenas 1 minuto</span>
              <AppButton
                v-else
                variant="outline"
                size="sm"
                @click="step--"
              >
                Voltar
              </AppButton>
            </div>

            <div v-if="step < 4">
              <AppButton
                variant="fill"
                size="md"
                :disabled="step === 3 && selectedDays.length === 0"
                @click="step++"
              >
                Avançar
                <AppIcon name="arrow_right" :size="16" />
              </AppButton>
            </div>
            <div v-else>
              <span class="text-[11px] text-ink-muted">Escolha uma opção acima</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
