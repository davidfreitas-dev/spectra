<script setup lang="ts">
import { computed } from 'vue'
import type { StatusBadgeType } from '@/types'
import AppIcon from './AppIcon.vue'
import type { AppIconName } from './icons'

interface Props {
  type: StatusBadgeType
  label?: string
}

const props = defineProps<Props>()

interface BadgeConfig {
  defaultLabel: string
  icon: AppIconName
  pulse?: boolean
  classes: string
  iconColorClass?: string
  textColorClass?: string
  isEyebrow?: boolean
}

const config = computed<BadgeConfig>(() => {
  switch (props.type) {
    case 'completed':
      return {
        defaultLabel: 'Concluída',
        icon: 'check',
        classes: 'bg-success border-border-primary text-on-success shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-success',
        textColorClass: 'text-on-success',
      }
    case 'in_progress':
      return {
        defaultLabel: 'Em andamento',
        icon: 'play',
        pulse: true,
        classes: 'bg-primary-container border-border-primary text-on-primary shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-primary',
        textColorClass: 'text-on-primary',
      }
    case 'partial':
      return {
        defaultLabel: 'Parcial',
        icon: 'clock',
        classes: 'bg-warning-container border-border-primary text-on-warning shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-warning font-bold',
        textColorClass: 'text-on-warning',
      }
    case 'planned':
      return {
        defaultLabel: 'Planejado',
        icon: 'calendar',
        classes: 'bg-info border-border-primary text-on-info shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-info',
        textColorClass: 'text-on-info',
      }
    case 'rest':
      return {
        defaultLabel: 'Descanso',
        icon: 'moon',
        classes: 'bg-rest border-border-primary text-on-rest shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-rest',
        textColorClass: 'text-on-rest',
      }
    case 'abandoned':
      return {
        defaultLabel: 'Abandonada',
        icon: 'close',
        classes: 'bg-error border-border-primary text-on-error shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-error',
        textColorClass: 'text-on-error',
      }
    case 'pr':
      return {
        defaultLabel: 'Novo Recorde',
        icon: 'star',
        classes: 'bg-warning-container border-border-primary text-on-warning shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-warning font-bold',
        textColorClass: 'text-on-warning',
        isEyebrow: true,
      }
    case 'bodyweight':
      return {
        defaultLabel: 'Peso Corporal',
        icon: 'scale',
        classes: 'bg-bg-alternate border-border-primary text-ink shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-ink',
        textColorClass: 'text-ink',
        isEyebrow: true,
      }
    case 'weighted':
      return {
        defaultLabel: 'Carga Adicional',
        icon: 'zap',
        classes: 'bg-primary-soft border-border-primary text-primary shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-primary',
        textColorClass: 'text-primary',
        isEyebrow: true,
      }
  }
})

const displayLabel = computed(() => props.label || config.value.defaultLabel)
</script>

<template>
  <div
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-transform select-none leading-none"
    :class="[
      config.classes,
      config.isEyebrow
        ? 'font-eyebrow text-[10px] uppercase font-bold tracking-wider'
        : 'font-button-text text-[11px] font-bold'
    ]"
  >
    <slot name="icon">
      <AppIcon
        :name="config.icon"
        :size="13"
        :class="[config.iconColorClass, { 'animate-pulse': config.pulse }]"
      />
    </slot>
    <span :class="config.textColorClass">{{ displayLabel }}</span>
  </div>
</template>
