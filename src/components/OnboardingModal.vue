<script setup lang="ts">
import { ref, toRef } from 'vue'
import { AppButton, AppCheckbox, AppAlert } from '@/components'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import AppIcon from './AppIcon.vue'
import type { AppIconName } from './icons'
import type { UserLevel, Equipment } from '@/types/domain'

export interface OnboardingCompleteEvent {
  level: UserLevel
  equipment: Equipment[]
  action: 'start-now' | 'explore'
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

const appPillars: { icon: AppIconName; title: string; desc: string }[] = [
  {
    icon: 'lock',
    title: '100% Offline & Privado',
    desc: 'Sem cadastro, sem login e sem servidores. Todos os seus dados ficam estritamente no seu celular.',
  },
  {
    icon: 'timer',
    title: 'Feito para o Chão de Treino',
    desc: 'Botões grandes para manuseio com uma mão, tela sempre ativa e descanso com alertas automáticos.',
  },
  {
    icon: 'trending_up',
    title: 'Evolução Sincera e Própria',
    desc: 'Metas reais, detecção automática de recordes pessoais (PRs) e sugestões prudentes de sobrecarga.',
  },
]

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

const appTabsTour: { icon: AppIconName; label: string; desc: string }[] = [
  {
    icon: 'calendar',
    label: 'Hoje',
    desc: 'Seu treino do dia agendado pronto para iniciar com 1 toque e meta semanal.',
  },
  {
    icon: 'dumbbell',
    label: 'Treinos',
    desc: 'Biblioteca de treinos prontos da metodologia Spectra e editor personalizado.',
  },
  {
    icon: 'activity',
    label: 'Exercícios',
    desc: 'Mais de 40 movimentos com postura passo a passo e caminhos de progressão.',
  },
  {
    icon: 'trophy',
    label: 'Progresso',
    desc: 'Histórico imutável de sessões, consistência semanal e Recordes Pessoais (PRs).',
  },
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

function handleFinish(action: 'start-now' | 'explore') {
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
            <template v-if="step === 1">Calistenia Direto ao Ponto</template>
            <template v-else-if="step === 2">Seu Ponto de Partida</template>
            <template v-else>Como o Spectra Funciona</template>
          </h2>
        </div>

        <!-- Body Scrollable Container -->
        <div class="p-5 overflow-y-auto space-y-4">
          <!-- Passo 1: Boas-vindas & Pilares -->
          <div v-if="step === 1" class="space-y-4 animate-in fade-in duration-150">
            <p class="text-xs sm:text-sm text-ink-muted leading-relaxed">
              O <strong class="text-ink">Spectra</strong> foi desenhado para quem quer treinar calistenia com foco absoluto, sem anúncios, sem login e sem distrações.
            </p>

            <div class="space-y-2.5">
              <div
                v-for="pillar in appPillars"
                :key="pillar.title"
                class="p-3.5 rounded-xl border border-border-grid bg-bg-alternate flex items-start gap-3"
              >
                <div class="w-9 h-9 rounded-lg bg-surface border border-border-grid flex items-center justify-center text-primary-container shrink-0 mt-0.5">
                  <AppIcon :name="pillar.icon" :size="18" />
                </div>
                <div>
                  <h4 class="font-bold text-sm text-ink">{{ pillar.title }}</h4>
                  <p class="text-xs text-ink-muted mt-0.5 leading-relaxed">{{ pillar.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Passo 2: Nível & Equipamentos -->
          <div v-else-if="step === 2" class="space-y-5 animate-in fade-in duration-150">
            <!-- Nível -->
            <div>
              <label class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider block mb-1.5">
                1. Qual é o seu nível de experiência?
              </label>
              <div class="space-y-2">
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

            <!-- Equipamentos -->
            <div>
              <label class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider block mb-1.5">
                2. Quais equipamentos você tem?
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          </div>

          <!-- Passo 3: Conhecendo as Abas & Primeiro Treino -->
          <div v-else class="space-y-4 animate-in fade-in duration-150">
            <p class="text-xs sm:text-sm text-ink-muted leading-relaxed">
              O app é organizado em 4 seções principais na barra inferior. Na primeira sessão de treino, um guia interativo te ensinará a registrar cada série.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                v-for="tab in appTabsTour"
                :key="tab.label"
                class="p-3 rounded-xl border border-border-grid bg-bg-alternate flex items-start gap-2.5"
              >
                <div class="w-8 h-8 rounded-lg bg-surface border border-border-grid flex items-center justify-center text-primary-container shrink-0 mt-0.5">
                  <AppIcon :name="tab.icon" :size="16" />
                </div>
                <div>
                  <h4 class="font-bold text-xs text-ink">{{ tab.label }}</h4>
                  <p class="text-[11px] text-ink-muted mt-0.5 leading-snug">{{ tab.desc }}</p>
                </div>
              </div>
            </div>

            <AppAlert variant="primary">
              Já preparamos uma rotina baseada no seu nível na aba <strong>Hoje</strong>. Você pode começar agora mesmo ou explorar a biblioteca!
            </AppAlert>
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
              @click="handleFinish('start-now')"
            >
              <AppIcon name="play" :size="16" />
              Fazer 1º Treino Agora
            </AppButton>

            <AppButton
              variant="outline"
              size="md"
              class="w-full"
              @click="handleFinish('explore')"
            >
              Explorar App
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
