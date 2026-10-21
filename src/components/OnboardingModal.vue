<script setup lang="ts">
import { ref, toRef } from 'vue'
import { AppButton, AppCheckbox } from '@/components'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import AppIcon from './AppIcon.vue'
import type { AppIconName } from './icons'
import type { UserLevel, Equipment } from '@/types/domain'

export interface OnboardingCompleteEvent {
  level: UserLevel
  equipment: Equipment[]
  action: 'interactive-tour' | 'explore'
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'complete', data: OnboardingCompleteEvent): void
}>()

useBodyScrollLock(toRef(props, 'isOpen'))

const step = ref<1 | 2 | 3>(1)
const selectedLevel = ref<UserLevel>('beginner')
const selectedEquipment = ref<Equipment[]>(['none'])

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

function handleFinish(action: 'interactive-tour' | 'explore') {
  emit('complete', {
    level: selectedLevel.value,
    equipment: selectedEquipment.value,
    action,
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
              Boas-vindas ao Spectra • Passo {{ step }} de 3
            </span>
            <span class="font-metric-number text-xs font-bold text-ink">
              {{ step }}/3
            </span>
          </div>
          <h2 class="font-display text-lg sm:text-xl font-bold text-ink mt-1">
            <template v-if="step === 1">Qual é o seu nível atual?</template>
            <template v-else-if="step === 2">Quais equipamentos você tem?</template>
            <template v-else>Tudo Pronto para o 1º Treino!</template>
          </h2>
        </div>

        <!-- Body Scrollable Container -->
        <div class="p-5 overflow-y-auto space-y-4">
          <!-- Passo 1: Nível -->
          <div v-if="step === 1" class="space-y-3 animate-in fade-in duration-150">
            <p class="text-xs text-ink-muted">
              Seu nível personaliza os treinos recomendados e os filtros da biblioteca. Você poderá alterar quando quiser.
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

          <!-- Passo 3: Decisão & Início do Tour -->
          <div v-else class="space-y-5 animate-in fade-in duration-150 text-center py-2">
            <div class="flex flex-col items-center gap-2">
              <span class="w-14 h-14 rounded-2xl bg-primary-container/15 border-2 border-primary-container flex items-center justify-center text-primary-container shadow-[0_3px_0_0_#f26a21]">
                <AppIcon name="zap" :size="28" />
              </span>
              <h3 class="font-display font-bold text-lg text-ink pt-1">
                Rotina Pronta para Você!
              </h3>
              <p class="text-xs text-ink-muted max-w-sm leading-relaxed">
                Vamos te guiar com um holofote na tela indicando exatamente onde clicar para iniciar e registrar sua primeira série.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer / Navigation -->
        <div class="p-5 border-t border-border-grid bg-bg-alternate shrink-0">
          <!-- Passos 1 e 2 -->
          <div v-if="step < 3" class="flex items-center justify-between">
            <div v-if="step === 1">
              <span class="text-[11px] text-ink-muted">Leva apenas 30 segundos</span>
            </div>
            <div v-else>
              <AppButton variant="outline" size="sm" @click="step--">
                Voltar
              </AppButton>
            </div>

            <AppButton variant="fill" size="md" @click="step++">
              Avançar
              <AppIcon name="arrow_right" :size="16" />
            </AppButton>
          </div>

          <!-- Passo 3: Sem botão voltar, botões empilhados 100% largura -->
          <div v-else class="flex flex-col gap-2.5 w-full">
            <AppButton
              variant="fill"
              size="md"
              class="w-full"
              @click="handleFinish('interactive-tour')"
            >
              <AppIcon name="play" :size="16" />
              Iniciar Tour Prático Agora
            </AppButton>

            <AppButton
              variant="outline"
              size="md"
              class="w-full"
              @click="handleFinish('explore')"
            >
              Explorar Sem o Tour
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
