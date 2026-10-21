import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePreferencesStore } from './preferencesStore'

export type TourStepKey =
  | 'today-schedule'
  | 'today-weekly-goal'
  | 'today-start'
  | 'pre-summary-start'
  | 'session-exercise'
  | 'session-stepper'
  | 'session-complete-set'
  | 'session-rest'
  | 'completed'

export interface TourStepConfig {
  key: TourStepKey
  stepNumber: number
  totalSteps: number
  targetSelector: string
  title: string
  description: string
  actionHint: string
  position?: 'top' | 'bottom' | 'auto'
}

export const TOUR_STEPS: TourStepConfig[] = [
  {
    key: 'today-schedule',
    stepNumber: 1,
    totalSteps: 8,
    targetSelector: '[data-tour="today-schedule"]',
    title: 'Agenda da Semana',
    description: 'Aqui você visualiza seus dias de treino (Seg a Dom). Toque em qualquer dia para ver ou agendar treinos.',
    actionHint: 'Toque em "Próximo" para avançar',
    position: 'bottom',
  },
  {
    key: 'today-weekly-goal',
    stepNumber: 2,
    totalSteps: 8,
    targetSelector: '[data-tour="today-weekly-goal"]',
    title: 'Meta Semanal',
    description: 'Calculada automaticamente a partir dos treinos agendados na semana. Conforme você conclui treinos, a barra avança.',
    actionHint: 'Toque em "Próximo" para ver o treino de hoje',
    position: 'bottom',
  },
  {
    key: 'today-start',
    stepNumber: 3,
    totalSteps: 8,
    targetSelector: '[data-tour="today-start-btn"]',
    title: 'Treino de Hoje',
    description: 'Aqui fica o treino do dia com a lista de exercícios. Toque em "Iniciar Treino" para abrir os detalhes.',
    actionHint: 'Toque em "Iniciar Treino"',
    position: 'top',
  },
  {
    key: 'pre-summary-start',
    stepNumber: 4,
    totalSteps: 8,
    targetSelector: '[data-tour="pre-summary-start-btn"]',
    title: 'Resumo do Treino',
    description: 'Confira os exercícios, séries e o tempo estimado da rotina antes de começar.',
    actionHint: 'Toque em "Iniciar Treino"',
    position: 'top',
  },
  {
    key: 'session-exercise',
    stepNumber: 5,
    totalSteps: 8,
    targetSelector: '[data-tour="session-exercise-header"]',
    title: 'Exercício & Postura',
    description: 'Veja o exercício atual e as repetições planejadas. Toque no ícone (i) sempre que quiser consultar a postura correta.',
    actionHint: 'Toque em "Próximo" para o contador',
    position: 'bottom',
  },
  {
    key: 'session-stepper',
    stepNumber: 6,
    totalSteps: 8,
    targetSelector: '[data-tour="session-stepper"]',
    title: 'Contador de Repetições',
    description: 'Ao terminar cada série, ajuste nos botões + e - a quantidade que você realizou de verdade.',
    actionHint: 'Ajuste com os botões + e -',
    position: 'top',
  },
  {
    key: 'session-complete-set',
    stepNumber: 7,
    totalSteps: 8,
    targetSelector: '[data-tour="session-complete-btn"]',
    title: 'Concluir Série',
    description: 'Toque aqui para registrar a série. O cronômetro de descanso começará automaticamente em tela cheia!',
    actionHint: 'Toque em "Concluir Série"',
    position: 'top',
  },
  {
    key: 'session-rest',
    stepNumber: 8,
    totalSteps: 8,
    targetSelector: '[data-tour="session-rest-controls"]',
    title: 'Intervalo de Descanso',
    description: 'O cronômetro apita e vibra ao zerar. Você pode somar +30s se precisar de mais fôlego ou pular.',
    actionHint: 'Pronto para treinar!',
    position: 'top',
  },
]

export const useTourStore = defineStore('tour', () => {
  const isTourActive = ref(false)
  const currentStepKey = ref<TourStepKey>('today-schedule')

  const currentStep = computed<TourStepConfig | null>(() => {
    if (!isTourActive.value) return null
    return TOUR_STEPS.find((s) => s.key === currentStepKey.value) || null
  })

  function startTour() {
    isTourActive.value = true
    currentStepKey.value = 'today-schedule'
  }

  function setStep(step: TourStepKey) {
    if (step === 'completed') {
      finishTour()
    } else {
      currentStepKey.value = step
      isTourActive.value = true
    }
  }

  function nextStep() {
    const currentIndex = TOUR_STEPS.findIndex((s) => s.key === currentStepKey.value)
    if (currentIndex !== -1 && currentIndex < TOUR_STEPS.length - 1) {
      currentStepKey.value = TOUR_STEPS[currentIndex + 1].key
    } else {
      finishTour()
    }
  }

  function finishTour() {
    isTourActive.value = false
    currentStepKey.value = 'completed'
    const preferencesStore = usePreferencesStore()
    preferencesStore.completeFirstSessionTour()
  }

  function skipTour() {
    finishTour()
  }

  return {
    isTourActive,
    currentStepKey,
    currentStep,
    startTour,
    setStep,
    nextStep,
    finishTour,
    skipTour,
  }
})
