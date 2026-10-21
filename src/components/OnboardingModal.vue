<script setup lang="ts">
import { ref, toRef } from 'vue'
import { AppButton, AppCheckbox } from '@/components'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import AppIcon from './AppIcon.vue'
import type { AppIconName } from './icons'
import type { UserLevel, Equipment } from '@/types/domain'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'complete', data: { level: UserLevel; equipment: Equipment[] }): void
}>()

useBodyScrollLock(toRef(props, 'isOpen'))

const step = ref<1 | 2>(1)
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

  // Remove 'none' se escolher outro equipamento
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

function handleFinish() {
  emit('complete', {
    level: selectedLevel.value,
    equipment: selectedEquipment.value,
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
        class="modal-card bg-surface border-2 border-border-primary rounded-2xl w-full max-w-lg shadow-[0_8px_0_0_#111111] overflow-hidden"
      >
      <!-- Header -->
      <div class="p-5 border-b border-border-grid bg-bg-alternate">
        <div class="flex items-center justify-between">
          <span class="font-eyebrow text-[10px] text-primary-container font-bold uppercase tracking-wider">
            Boas-vindas ao Spectra • Passo {{ step }} de 2
          </span>
          <span class="font-metric-number text-xs font-bold text-ink">
            {{ step }}/2
          </span>
        </div>
        <h2 class="font-display text-xl font-bold text-ink mt-1">
          {{ step === 1 ? 'Qual o seu nível atual?' : 'Quais equipamentos você tem?' }}
        </h2>
      </div>

      <!-- Step 1: Nível -->
      <div v-if="step === 1" class="p-5 space-y-3">
        <p class="text-xs text-ink-muted mb-2">
          Seu nível define os filtros iniciais da biblioteca e treinos recomendados. Você pode alterar a qualquer momento.
        </p>

        <button
          v-for="lvl in levels"
          :key="lvl.value"
          type="button"
          class="w-full text-left p-4 rounded-xl border transition-all cursor-pointer"
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
              :size="20"
              class="text-primary-container"
            />
          </div>
          <p class="text-xs text-ink-muted mt-1 font-normal">
            {{ lvl.desc }}
          </p>
        </button>

        <div class="pt-4 flex justify-end">
          <AppButton variant="fill" @click="step = 2">
            Avançar
            <AppIcon name="arrow_right" :size="16" />
          </AppButton>
        </div>
      </div>

      <!-- Step 2: Equipamentos -->
      <div v-else class="p-5 space-y-3">
        <p class="text-xs text-ink-muted mb-2">
          Selecione o que você tem disponível. A calistenia funciona perfeitamente apenas com o chão!
        </p>

        <div
          v-for="eq in equipmentOptions"
          :key="eq.value"
          class="w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer"
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
          <div class="flex items-center gap-3">
            <AppIcon :name="eq.icon" :size="20" class="text-ink-muted" />
            <span class="font-bold text-sm text-ink">{{ eq.label }}</span>
          </div>

          <AppCheckbox
            :model-value="selectedEquipment.includes(eq.value)"
            size="md"
            class="pointer-events-none"
            tabindex="-1"
            aria-hidden="true"
          />
        </div>

        <div class="pt-4 flex items-center justify-between">
          <AppButton variant="outline" @click="step = 1">
            Voltar
          </AppButton>
          <AppButton variant="fill" @click="handleFinish">
            Concluir Configuração
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</Transition>
</template>
