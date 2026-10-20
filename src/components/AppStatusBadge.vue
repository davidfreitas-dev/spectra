<script setup lang="ts">
import { computed } from 'vue'
import type { StatusBadgeType } from '@/types'

interface Props {
  type: StatusBadgeType
  label?: string
}

const props = defineProps<Props>()

interface BadgeConfig {
  defaultLabel: string
  icon: string
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
        icon: 'check_circle',
        classes: 'bg-success border-border-primary text-on-success shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-success',
        textColorClass: 'text-on-success',
      }
    case 'in_progress':
      return {
        defaultLabel: 'Em andamento',
        icon: 'play_circle',
        pulse: true,
        classes: 'bg-primary-container border-border-primary text-on-primary shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-primary',
        textColorClass: 'text-on-primary',
      }
    case 'partial':
      return {
        defaultLabel: 'Parcial',
        icon: 'timelapse',
        classes: 'bg-warning-container border-border-primary text-on-warning shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-warning font-bold',
        textColorClass: 'text-on-warning',
      }
    case 'planned':
      return {
        defaultLabel: 'Planejado',
        icon: 'calendar_today',
        classes: 'bg-info border-border-primary text-on-info shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-info',
        textColorClass: 'text-on-info',
      }
    case 'rest':
      return {
        defaultLabel: 'Descanso',
        icon: 'bedtime',
        classes: 'bg-rest border-border-primary text-on-rest shadow-[0_2px_0_0_#111111]',
        iconColorClass: 'text-on-rest',
        textColorClass: 'text-on-rest',
      }
    case 'abandoned':
      return {
        defaultLabel: 'Abandonada',
        icon: 'cancel',
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
        icon: 'bolt',
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
      <span
        class="material-symbols-outlined !text-[13px] !leading-none w-3.5 h-3.5 flex items-center justify-center shrink-0"
        :class="[config.iconColorClass, { 'animate-pulse': config.pulse }]"
      >
        {{ config.icon }}
      </span>
    </slot>
    <span :class="config.textColorClass">{{ displayLabel }}</span>
  </div>
</template>
