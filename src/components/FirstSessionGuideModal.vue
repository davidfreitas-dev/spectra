<script setup lang="ts">
import { ref, toRef } from 'vue'
import { AppButton } from '@/components'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import AppIcon from './AppIcon.vue'
import type { AppIconName } from './icons'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'complete'): void
}>()

useBodyScrollLock(toRef(props, 'isOpen'))

const currentStep = ref(1)

interface GuideStep {
  step: number
  eyebrow: string
  title: string
  description: string
  tip: string
  icon: AppIconName
  badge: string
}

const steps: GuideStep[] = [
  {
    step: 1,
    eyebrow: 'Passo 1 de 4',
    title: 'Exercício & Meta da Série',
    description:
      'No centro da tela você vê o exercício atual, o número da série e a meta de repetições ou segundos.',
    tip: 'Dica: Toque em "Ver Detalhes" para revisar a postura e dicas de execução com o corpo apoiado no chão.',
    icon: 'body',
    badge: 'Postura & Meta',
  },
  {
    step: 2,
    eyebrow: 'Passo 2 de 4',
    title: 'Registre o que Você Fez',
    description:
      'Execute a série. Ao terminar, ajuste o valor no contador (+ e -) com o que você realizou de verdade.',
    tip: 'Seja sincero: se a meta era 10 e você fez 8, registre 8. A sua evolução parte da honestidade.',
    icon: 'check',
    badge: 'Contador Rápido',
  },
  {
    step: 3,
    eyebrow: 'Passo 3 de 4',
    title: 'Descanso Automático',
    description:
      'Ao tocar em "Concluir Série", o cronômetro de descanso inicia sozinho com contagem regressiva em tela cheia.',
    tip: 'O app emite som e vibração ao zerar. Você pode somar +30s se precisar respirar mais ou pular.',
    icon: 'timer',
    badge: 'Mãos Livres',
  },
  {
    step: 4,
    eyebrow: 'Passo 4 de 4',
    title: 'Recordes & Histórico Local',
    description:
      'Ao concluir o treino, o Spectra detecta novos Recordes Pessoais (PRs) e alimenta sua consistência semanal.',
    tip: 'Tudo fica salvo 100% no seu dispositivo, sem cadastro e sem depender de internet.',
    icon: 'trophy',
    badge: 'Evolução Real',
  },
]

function handleNext() {
  if (currentStep.value < steps.length) {
    currentStep.value++
  } else {
    emit('complete')
  }
}

function handlePrev() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function handleSkip() {
  emit('complete')
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
        class="modal-card bg-surface border-2 border-border-primary rounded-2xl w-full max-w-lg shadow-[0_8px_0_0_#111111] overflow-hidden flex flex-col"
      >
        <!-- Header -->
        <div class="p-5 border-b border-border-grid bg-bg-alternate flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-primary-container" />
            <span class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider">
              Guia da Sessão de Treino
            </span>
          </div>
          <button
            type="button"
            class="text-xs font-bold text-ink-muted hover:text-ink transition-colors cursor-pointer"
            @click="handleSkip"
          >
            Pular Tutorial
          </button>
        </div>

        <!-- Step Content -->
        <div class="p-6 space-y-6">
          <!-- Step indicator dots -->
          <div class="flex items-center justify-center gap-2">
            <div
              v-for="s in steps"
              :key="s.step"
              class="h-1.5 rounded-full transition-all duration-200"
              :class="
                s.step === currentStep
                  ? 'w-8 bg-primary-container'
                  : s.step < currentStep
                  ? 'w-3 bg-border-primary'
                  : 'w-3 bg-border-grid'
              "
            />
          </div>

          <!-- Active Step Card -->
          <div
            v-for="s in steps"
            v-show="s.step === currentStep"
            :key="s.step"
            class="space-y-4 animate-in fade-in duration-200"
          >
            <!-- Big Feature Icon & Badge -->
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-xl bg-primary-container/15 border border-border-primary flex items-center justify-center text-primary-container shrink-0 shadow-[0_2px_0_0_#111111]"
              >
                <AppIcon :name="s.icon" :size="24" />
              </div>
              <div>
                <span class="font-eyebrow text-[11px] font-bold text-primary-container uppercase tracking-wider block">
                  {{ s.eyebrow }} • {{ s.badge }}
                </span>
                <h3 class="font-display text-lg sm:text-xl font-bold text-ink leading-tight">
                  {{ s.title }}
                </h3>
              </div>
            </div>

            <!-- Description -->
            <p class="text-sm text-ink leading-relaxed">
              {{ s.description }}
            </p>

            <!-- Tip Callout -->
            <div class="p-3.5 rounded-xl bg-bg-alternate border border-border-grid flex items-start gap-3">
              <AppIcon name="info" :size="18" class="text-primary-container shrink-0 mt-0.5" />
              <p class="text-xs text-ink-muted leading-relaxed font-medium">
                {{ s.tip }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer / Navigation -->
        <div class="p-5 border-t border-border-grid bg-bg-alternate flex items-center justify-between">
          <div>
            <AppButton
              v-if="currentStep > 1"
              variant="outline"
              size="sm"
              @click="handlePrev"
            >
              Voltar
            </AppButton>
          </div>

          <div class="flex items-center gap-2">
            <AppButton
              variant="fill"
              size="md"
              @click="handleNext"
            >
              <template v-if="currentStep < steps.length">
                Próximo
                <AppIcon name="arrow_right" :size="16" />
              </template>
              <template v-else>
                <AppIcon name="play" :size="16" />
                Começar Treino!
              </template>
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
