<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useTourStore, type TourStepKey } from '@/stores/tourStore'
import { AppButton } from '@/components'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  stepKey: TourStepKey
}>()

const emit = defineEmits<{
  (e: 'target-click'): void
  (e: 'next'): void
}>()

const tourStore = useTourStore()

interface RectBox {
  top: number
  left: number
  width: number
  height: number
  bottom: number
  right: number
}

const targetRect = ref<RectBox | null>(null)
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

const isCurrentStep = computed(() => {
  return tourStore.isTourActive && tourStore.currentStepKey === props.stepKey
})

const currentConfig = computed(() => {
  if (!isCurrentStep.value) return null
  return tourStore.currentStep
})

function updateTargetRect() {
  if (!isCurrentStep.value || !currentConfig.value) {
    targetRect.value = null
    return
  }

  const el = document.querySelector(currentConfig.value.targetSelector)
  if (!el) {
    targetRect.value = null
    return
  }

  // Scroll smoothly into view if needed
  const elRect = el.getBoundingClientRect()
  const isOutOfView = elRect.top < 60 || elRect.bottom > window.innerHeight - 60
  if (isOutOfView) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const r = el.getBoundingClientRect()
  // Add 6px breathing room padding around target
  const padding = 6
  targetRect.value = {
    top: Math.max(0, r.top - padding),
    left: Math.max(0, r.left - padding),
    width: r.width + padding * 2,
    height: r.height + padding * 2,
    bottom: r.bottom + padding,
    right: r.right + padding,
  }
}

let checkTimer: ReturnType<typeof setInterval> | null = null

function scheduleCheck() {
  nextTick(() => {
    updateTargetRect()
    let attempts = 0
    if (checkTimer) clearInterval(checkTimer)
    checkTimer = setInterval(() => {
      attempts++
      updateTargetRect()
      if (targetRect.value || attempts > 15) {
        if (checkTimer) clearInterval(checkTimer)
      }
    }, 100)
  })
}

function handleResize() {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
  updateTargetRect()
}

watch(
  () => [tourStore.isTourActive, tourStore.currentStepKey],
  () => {
    scheduleCheck()
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('resize', handleResize, { passive: true })
  window.addEventListener('scroll', updateTargetRect, { passive: true })
  scheduleCheck()
})

onUnmounted(() => {
  if (checkTimer) clearInterval(checkTimer)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', updateTargetRect)
})

// Tooltip positioning (prefer bottom, fallback to top if close to screen bottom)
const tooltipStyle = computed(() => {
  if (!targetRect.value) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }

  const target = targetRect.value
  const spaceBelow = windowHeight.value - target.bottom
  const spaceAbove = target.top
  const preferTop = currentConfig.value?.position === 'top' || (spaceBelow < 200 && spaceAbove > spaceBelow)

  const leftPos = Math.max(16, Math.min(windowWidth.value - 336, target.left + (target.width / 2) - 160))

  if (preferTop) {
    return {
      bottom: `${windowHeight.value - target.top + 14}px`,
      left: `${leftPos}px`,
    }
  } else {
    return {
      top: `${target.bottom + 14}px`,
      left: `${leftPos}px`,
    }
  }
})

const isPositionedAbove = computed(() => {
  if (!targetRect.value) return false
  const target = targetRect.value
  const spaceBelow = windowHeight.value - target.bottom
  const spaceAbove = target.top
  return currentConfig.value?.position === 'top' || (spaceBelow < 200 && spaceAbove > spaceBelow)
})

function handleOverlayTargetClick() {
  emit('target-click')
  // Trigger click on underlying element
  if (currentConfig.value) {
    const el = document.querySelector(currentConfig.value.targetSelector) as HTMLElement | null
    if (el) {
      el.click()
    }
  }
}

function handleNextClick() {
  emit('next')
  tourStore.nextStep()
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isCurrentStep && currentConfig && targetRect"
      class="fixed inset-0 z-50 overflow-hidden select-none"
    >
      <!-- SVG Mask for cutout spotlight -->
      <svg
        class="absolute inset-0 w-full h-full pointer-events-auto"
        :width="windowWidth"
        :height="windowHeight"
        @click.self.stop="tourStore.nextStep"
      >
        <defs>
          <mask id="spectra-spotlight-mask">
            <!-- White reveals the dark overlay -->
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <!-- Black cuts a transparent hole for the spotlight target -->
            <rect
              v-if="targetRect"
              :x="targetRect.left"
              :y="targetRect.top"
              :width="targetRect.width"
              :height="targetRect.height"
              rx="14"
              ry="14"
              fill="black"
            />
          </mask>
        </defs>

        <!-- Dark backdrop using the mask -->
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(17, 17, 17, 0.78)"
          mask="url(#spectra-spotlight-mask)"
        />

        <!-- Glowing pulsing border around target -->
        <rect
          v-if="targetRect"
          :x="targetRect.left"
          :y="targetRect.top"
          :width="targetRect.width"
          :height="targetRect.height"
          rx="14"
          ry="14"
          fill="none"
          stroke="#f26a21"
          stroke-width="3"
          class="animate-pulse"
        />
      </svg>

      <!-- Clickable proxy area right over target so tapping the highlighted item works directly -->
      <div
        v-if="targetRect"
        class="absolute cursor-pointer z-50 rounded-xl"
        :style="{
          top: `${targetRect.top}px`,
          left: `${targetRect.left}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
        }"
        title="Clique para realizar a ação"
        @click.stop="handleOverlayTargetClick"
      />

      <!-- Floating Coachmark Card -->
      <div
        class="absolute z-50 w-80 max-w-[calc(100vw-32px)] bg-surface border-2 border-border-primary rounded-2xl shadow-[0_5px_0_0_#111111] p-4 space-y-3 pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
        :style="tooltipStyle"
      >
        <!-- Arrow pointer -->
        <div
          class="absolute w-3 h-3 bg-surface border-border-primary rotate-45 transform"
          :class="
            isPositionedAbove
              ? '-bottom-2 border-r-2 border-b-2 left-8'
              : '-top-2 border-l-2 border-t-2 left-8'
          "
        />

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span class="font-eyebrow text-[10px] uppercase font-bold text-primary-container tracking-wider">
              Passo {{ currentConfig.stepNumber }} de {{ currentConfig.totalSteps }}
            </span>
          </div>
          <button
            type="button"
            class="text-[11px] font-bold text-ink-muted hover:text-ink cursor-pointer"
            @click="tourStore.skipTour"
          >
            Pular Tour
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-1">
          <h4 class="font-display font-bold text-sm text-ink flex items-center gap-1.5">
            {{ currentConfig.title }}
          </h4>
          <p class="text-xs text-ink-muted leading-relaxed">
            {{ currentConfig.description }}
          </p>
        </div>

        <!-- Action Hint Box -->
        <div class="p-2 rounded-lg bg-primary-container/10 border border-primary-container flex items-center gap-2 text-xs font-bold text-ink">
          <AppIcon name="zap" :size="16" class="text-primary-container shrink-0" />
          <span>{{ currentConfig.actionHint }}</span>
        </div>

        <!-- Footer Buttons -->
        <div class="flex items-center justify-between pt-3 border-t border-border-grid">
          <button
            type="button"
            class="text-xs font-bold text-ink-muted hover:text-ink cursor-pointer"
            @click="tourStore.skipTour"
          >
            Encerrar
          </button>

          <AppButton
            variant="fill"
            size="sm"
            @click="handleNextClick"
          >
            <template v-if="currentConfig.stepNumber < currentConfig.totalSteps">
              Próximo
              <AppIcon name="arrow_right" :size="14" />
            </template>
            <template v-else>
              Entendi, Treinar!
            </template>
          </AppButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
