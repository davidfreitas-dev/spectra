<script setup lang="ts">
import { ref } from 'vue'
import {
  AppButton,
  AppInput,
  AppStepper,
  AppSelect,
  AppToggle,
  AppSegmentedControl,
  AppProgressBar,
  AppChip,
  AppStatusBadge,
  AppCard,
  AppSpinner,
  AppCheckbox,
} from '@/components'
import type { SegmentedOption, SelectOption } from '@/types'

// Form & workout state
const workoutName = ref('')
const athleteIdentifier = ref('alex.calistenia')
const targetReps = ref('-5 reps')
const repsCount = ref(12)
const checkboxSelected = ref(true)
const checkboxUnselected = ref(false)

const muscleGroupOptions: SelectOption[] = [
  { value: 'back_biceps', label: 'Costas & Bíceps (Puxada)' },
  { value: 'chest_triceps', label: 'Peito & Tríceps (Empurrada)' },
  { value: 'legs_core', label: 'Pernas & Abdômen (Core)' },
]
const selectedMuscleGroup = ref('back_biceps')

const equipmentDisabledOptions: SelectOption[] = [
  { value: 'rings', label: 'Argolas Olímpicas (Requer Nível Avançado)' },
]
const selectedEquipmentDisabled = ref('rings')

// Toggles state
const autoRecord = ref(true)
const wakeLockActive = ref(true)
const audioCountdown = ref(false)

// Segmented controls state
const metricOptions: SegmentedOption[] = [
  { value: 'reps', label: 'Repetições (Reps)' },
  { value: 'duration', label: 'Duração (Segundos)' },
]
const selectedMetric = ref('reps')

const periodOptions: SegmentedOption[] = [
  { value: 'week', label: 'Semana Atual' },
  { value: 'month', label: 'Mês Completo' },
  { value: 'year', label: 'Histórico Total' },
]
const selectedPeriod = ref('week')

// Filter chips state
const selectedLevel = ref('iniciante')

const selectedEquipments = ref<string[]>(['bar', 'parallels'])
function toggleEquipment(item: string) {
  const index = selectedEquipments.value.indexOf(item)
  if (index > -1) {
    selectedEquipments.value.splice(index, 1)
  } else {
    selectedEquipments.value.push(item)
  }
}

const selectedMuscles = ref<string[]>(['peito'])
function toggleMuscle(muscle: string) {
  const index = selectedMuscles.value.indexOf(muscle)
  if (index > -1) {
    selectedMuscles.value.splice(index, 1)
  } else {
    selectedMuscles.value.push(muscle)
  }
}

// Swatches catalog
const swatches = [
  {
    name: 'Sunburst',
    hex: '#F26A21',
    token: '--primary-container',
    tag: 'Ação Principal',
    note: '≤ 10%',
    colorClass: 'bg-primary-container',
    tagClass: 'bg-ink text-surface',
  },
  {
    name: 'Apricot Soft',
    hex: '#FDE9DC',
    token: '--primary-soft',
    tag: 'Destaque Suave',
    note: 'Fundo Badge',
    colorClass: 'bg-primary-soft',
    tagClass: 'bg-primary text-on-primary',
  },
  {
    name: 'Ink Core',
    hex: '#111111',
    token: '--border-primary',
    tag: 'Contorno & Texto',
    note: 'Borda 1.5px',
    colorClass: 'bg-ink',
    tagClass: 'bg-surface text-ink',
  },
  {
    name: 'Warm Canvas',
    hex: '#F5F2EC',
    token: '--bg-alternate',
    tag: 'Superfície Tátil',
    note: 'Fundo Alternado',
    colorClass: 'bg-bg-alternate',
    tagClass: 'bg-ink text-surface',
  },
  {
    name: 'Grid Gray',
    hex: '#E4DFD6',
    token: '--border-grid',
    tag: 'Linha Divisória',
    note: 'Grid 24px',
    colorClass: 'bg-border-grid',
    tagClass: 'bg-ink text-surface',
  },
  {
    name: 'Pure White',
    hex: '#FFFFFF',
    token: '--bg-canvas',
    tag: 'Card de Treino',
    note: 'Superfície Base',
    colorClass: 'bg-surface',
    tagClass: 'bg-ink text-surface',
  },
]
</script>

<template>
  <div class="min-h-screen bg-background font-body text-ink antialiased">
    <!-- Top Technical Sticky Breadcrumb / Meta Bar -->
    <div class="w-full bg-surface-container-lowest border-b border-border-grid px-4 sm:px-6 lg:px-8">
      <div class="max-w-300 mx-auto py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-soft text-primary font-eyebrow text-[10px] uppercase font-bold tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            Spectra Calistenia · UI v1.0
          </span>
          <span class="text-ink-subtle text-xs">/</span>
          <span class="font-button-text text-xs text-ink font-bold">Design System &amp; Biblioteca de Componentes</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-eyebrow text-[10px] text-ink-muted uppercase">Alta Visibilidade &amp; Operação com Uma Mão</span>
        </div>
      </div>
    </div>

    <!-- Hero Header Section (Counters removed) -->
    <section class="w-full bg-background px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-border-grid">
      <div class="max-w-300 mx-auto">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 mb-3">
            <span class="font-eyebrow text-xs uppercase tracking-widest text-primary-container font-bold">
              SPECTRA CALISTENIA · DESIGN SYSTEM
            </span>
            <span class="w-2 h-2 rounded-xs bg-primary-container inline-block" />
          </div>
          <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight font-bold mb-4">
            Biblioteca de Componentes
          </h1>
          <p class="font-body text-sm sm:text-base text-ink-muted leading-relaxed">
            Catálogo completo de componentes UI modulares e táteis desenvolvidos especificamente para o registro e execução de treinos de calistenia.
            Construídos para operação com uma mão, contraste legível ao ar livre e feedback físico instantâneo durante as séries.
          </p>
        </div>
      </div>
    </section>

    <!-- Section 01: Color Tokens & Surfaces -->
    <section class="w-full bg-surface-container-lowest px-4 sm:px-6 lg:px-8 py-12 border-b border-border-grid">
      <div class="max-w-300 mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
          <div>
            <span class="font-eyebrow text-xs uppercase text-primary-container tracking-wider font-bold">01 / FUNDAÇÕES &amp; CORES</span>
            <h2 class="font-headline text-2xl sm:text-3xl text-ink font-bold tracking-tight">Design Tokens &amp; Superfícies de Treino</h2>
          </div>
          <span class="inline-block self-start sm:self-auto px-3 py-1 rounded-full bg-bg-alternate border border-border-primary text-ink-muted font-body text-xs">
            Regra de Alto Contraste · Máximo 10% Laranja
          </span>
        </div>

        <!-- Swatch Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            v-for="swatch in swatches"
            :key="swatch.token"
            class="p-4 rounded-xl border border-border-primary bg-surface shadow-[0_3px_0_0_#111111] flex flex-col justify-between h-48 transition-transform hover:-translate-y-1 select-none"
          >
            <div
              class="w-full h-16 rounded-lg border border-border-primary relative overflow-hidden flex items-end p-1.5"
              :class="swatch.colorClass"
            >
              <span class="font-eyebrow text-[9px] px-1 rounded uppercase font-bold" :class="swatch.tagClass">
                {{ swatch.tag }}
              </span>
            </div>
            <div>
              <div class="font-headline text-sm text-ink font-bold leading-none mt-2">
                {{ swatch.name }}
              </div>
              <div class="font-body text-xs text-ink-muted mt-0.5">
                {{ swatch.hex }}
              </div>
            </div>
            <div class="pt-2 border-t border-border-grid flex items-center justify-between text-ink-subtle font-eyebrow text-[9px]">
              <span>{{ swatch.token }}</span>
              <span class="font-bold text-ink">{{ swatch.note }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 02: Typography System -->
    <section class="w-full bg-background px-4 sm:px-6 lg:px-8 py-12 border-b border-border-grid">
      <div class="max-w-300 mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
          <div>
            <span class="font-eyebrow text-xs uppercase text-primary-container tracking-wider font-bold">02 / SISTEMA TIPOGRÁFICO &amp; HIERARQUIA EDITORIAL</span>
            <h2 class="font-headline text-2xl sm:text-3xl text-ink font-bold tracking-tight">Escala Tipográfica &amp; Execução de Treino</h2>
          </div>
          <span class="inline-block self-start md:self-auto px-3 py-1 rounded-full bg-bg-alternate border border-border-primary text-ink-muted font-body text-xs">
            Space Grotesk + Inter · Grid de 8px
          </span>
        </div>

        <AppCard>
          <div class="divide-y divide-border-grid space-y-6">
            <!-- Display / H1 -->
            <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pt-4 first:pt-0">
              <div class="md:w-56 shrink-0">
                <div class="font-eyebrow text-xs text-primary-container font-bold uppercase tracking-wider">Display / H1</div>
                <div class="font-body text-xs text-ink-muted">Space Grotesk · 48px / 56px</div>
              </div>
              <div class="flex-1">
                <div class="font-display text-2xl sm:text-4xl text-ink font-bold tracking-tight">
                  Força Pura &amp; Domínio do Peso Corporal
                </div>
              </div>
            </div>

            <!-- Headline LG / H2 -->
            <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pt-6">
              <div class="md:w-56 shrink-0">
                <div class="font-eyebrow text-xs text-primary-container font-bold uppercase tracking-wider">Headline LG / H2</div>
                <div class="font-body text-xs text-ink-muted">Space Grotesk · 32px / 38px</div>
              </div>
              <div class="flex-1">
                <div class="font-headline text-xl sm:text-2xl text-ink font-bold tracking-tight">
                  Progressão contínua em barras, paralelas e solo
                </div>
              </div>
            </div>

            <!-- Headline MD / H3 -->
            <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pt-6">
              <div class="md:w-56 shrink-0">
                <div class="font-eyebrow text-xs text-primary-container font-bold uppercase tracking-wider">Headline MD / H3</div>
                <div class="font-body text-xs text-ink-muted">Space Grotesk · 16px / 22px</div>
              </div>
              <div class="flex-1">
                <div class="font-headline text-base sm:text-lg text-ink font-bold">
                  Séries táticas, repetições mecânicas e intervalos precisos
                </div>
              </div>
            </div>

            <!-- Body Text -->
            <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pt-6">
              <div class="md:w-56 shrink-0">
                <div class="font-eyebrow text-xs text-primary-container font-bold uppercase tracking-wider">Texto do Exercício</div>
                <div class="font-body text-xs text-ink-muted">Inter Regular · 14px &amp; 13px</div>
              </div>
              <div class="flex-1 space-y-2">
                <p class="font-body text-sm sm:text-base text-ink leading-relaxed">
                  A interface foi desenhada para registro imediato durante treinos intensos de calistenia, equilibrando clareza operacional na execução de séries com feedback visual instantâneo para praticantes de todos os níveis.
                </p>
                <p class="font-body text-xs text-ink-muted leading-relaxed">
                  Instruções biomecânicas de segurança e notas posturais renderizadas com alto contraste para leitura confortável com o celular apoiado no chão.
                </p>
              </div>
            </div>

            <!-- Eyebrow & Tags -->
            <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pt-6">
              <div class="md:w-56 shrink-0">
                <div class="font-eyebrow text-xs text-primary-container font-bold uppercase tracking-wider">Rótulos &amp; Tags de Série</div>
                <div class="font-body text-xs text-ink-muted">Space Grotesk · 10px / Caps</div>
              </div>
              <div class="flex-1 flex flex-wrap items-center gap-2">
                <span class="font-eyebrow text-[10px] uppercase tracking-widest text-primary font-bold px-2 py-0.5 rounded bg-primary-soft border border-border-grid">
                  STATUS: EM TREINO
                </span>
                <span class="font-eyebrow text-[10px] uppercase tracking-widest text-ink font-bold px-2 py-0.5 rounded bg-bg-alternate border border-border-primary">
                  CARGA: PESO CORPORAL
                </span>
                <span class="font-eyebrow text-[10px] uppercase tracking-widest text-ink-muted font-bold">
                  FASE: PROGRESSÃO ATIVA
                </span>
              </div>
            </div>

            <!-- Large Numeric Display -->
            <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pt-6 pb-2">
              <div class="md:w-56 shrink-0">
                <div class="font-eyebrow text-xs text-primary-container font-bold uppercase tracking-wider">Cronômetro &amp; Métricas</div>
                <div class="font-body text-xs text-ink-muted">Space Grotesk Bold · 30px &amp; 24px</div>
              </div>
              <div class="flex-1 flex items-baseline gap-8">
                <div>
                  <span class="font-metric-number text-3xl font-bold text-ink leading-none">01:45</span>
                  <span class="block font-eyebrow text-[10px] text-ink-muted uppercase mt-1">Tempo de Descanso</span>
                </div>
                <div>
                  <span class="font-metric-number text-2xl font-bold text-primary-container leading-none">+15.2%</span>
                  <span class="block font-eyebrow text-[10px] text-ink-muted uppercase mt-1">Volume de Repetições</span>
                </div>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </section>

    <!-- Section 03: Buttons & Actions Matrix -->
    <section class="w-full bg-bg-alternate px-4 sm:px-6 lg:px-8 py-12 border-b border-border-grid">
      <div class="max-w-300 mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <span class="font-eyebrow text-xs uppercase text-primary-container tracking-wider font-bold">03 / INTERATIVIDADE TÁTIL</span>
            <h2 class="font-headline text-2xl sm:text-3xl text-ink font-bold tracking-tight">Botões &amp; Ações de Treino</h2>
          </div>
          <div class="font-eyebrow text-xs px-3 py-1 rounded-lg bg-surface border border-border-primary shadow-[0_2px_0_0_#111111] text-ink">
            Área de Toque: Mínimo 44px
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8">
          <!-- Playground: Primary CTA Fill -->
          <AppCard title="Ações Primárias (Solid Fill)" dot-color="primary" badge="Execução Ativa">
            <div class="space-y-6">
              <!-- Rounded-XL -->
              <div>
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Padrão Tátil (Rounded-XL)</div>
                <div class="flex flex-wrap items-center gap-3">
                  <AppButton variant="fill" shape="rounded">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-base">play_circle</span>
                    </template>
                    <span>Padrão</span>
                  </AppButton>

                  <AppButton variant="fill" shape="rounded">
                    <span>Com Ícone</span>
                    <template #right-icon>
                      <span class="material-symbols-outlined text-base">arrow_forward</span>
                    </template>
                  </AppButton>

                  <AppButton variant="fill" shape="rounded" :pressed="true">
                    <span>Pressionado</span>
                  </AppButton>

                  <AppButton variant="fill" shape="rounded" :loading="true">
                    <span>Carregando</span>
                  </AppButton>

                  <AppButton variant="fill" shape="rounded" :disabled="true">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-sm">lock</span>
                    </template>
                    <span>Desabilitado</span>
                  </AppButton>
                </div>
              </div>

              <!-- Pill Shape -->
              <div class="pt-4 border-t border-border-grid">
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Ações em Pill (Rounded-Full)</div>
                <div class="flex flex-wrap items-center gap-3">
                  <AppButton variant="fill" shape="pill">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-base">replay</span>
                    </template>
                    <span>Padrão</span>
                  </AppButton>

                  <AppButton variant="fill" shape="pill">
                    <span>Com Ícone</span>
                    <template #right-icon>
                      <span class="material-symbols-outlined text-base">arrow_forward</span>
                    </template>
                  </AppButton>

                  <AppButton variant="fill" shape="pill" :pressed="true">
                    <span>Pressionado</span>
                  </AppButton>

                  <AppButton variant="fill" shape="pill" :loading="true">
                    <span>Carregando</span>
                  </AppButton>

                  <AppButton variant="fill" shape="pill" :disabled="true">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-sm">lock</span>
                    </template>
                    <span>Desabilitado</span>
                  </AppButton>
                </div>
              </div>

              <!-- Icon-Only -->
              <div class="pt-4 border-t border-border-grid">
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Botões Rápidos (Icon-Only)</div>
                <div class="flex flex-wrap items-center gap-4">
                  <div class="flex items-center gap-2">
                    <AppButton variant="fill" shape="rounded" :icon-only="true" title="Padrão">
                      <span class="material-symbols-outlined text-lg">add</span>
                    </AppButton>
                    <AppButton variant="fill" shape="rounded" :icon-only="true" :pressed="true" title="Pressionado">
                      <span class="material-symbols-outlined text-lg">add</span>
                    </AppButton>
                    <AppButton variant="fill" shape="rounded" :icon-only="true" :disabled="true" title="Desabilitado">
                      <span class="material-symbols-outlined text-base">lock</span>
                    </AppButton>
                  </div>
                  <div class="h-6 w-px bg-border-grid" />
                  <div class="flex items-center gap-2">
                    <AppButton variant="fill" shape="circle" :icon-only="true" title="Padrão">
                      <span class="material-symbols-outlined text-lg">arrow_forward</span>
                    </AppButton>
                    <AppButton variant="fill" shape="circle" :icon-only="true" :pressed="true" title="Pressionado">
                      <span class="material-symbols-outlined text-lg">arrow_forward</span>
                    </AppButton>
                    <AppButton variant="fill" shape="circle" :icon-only="true" :disabled="true" title="Desabilitado">
                      <span class="material-symbols-outlined text-base">lock</span>
                    </AppButton>
                  </div>
                </div>
              </div>
            </div>
          </AppCard>

          <!-- Playground: Secondary Outline Tactile -->
          <AppCard title="Ações Secundárias (Tactile Outline)" dot-color="ink" badge="Controles de Apoio">
            <div class="space-y-6">
              <!-- Rounded-XL -->
              <div>
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Padrão Tátil (Rounded-XL)</div>
                <div class="flex flex-wrap items-center gap-3">
                  <AppButton variant="outline" shape="rounded">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-base">tune</span>
                    </template>
                    <span>Padrão</span>
                  </AppButton>

                  <AppButton variant="outline" shape="rounded">
                    <span>Com Ícone</span>
                    <template #right-icon>
                      <span class="material-symbols-outlined text-base">arrow_forward</span>
                    </template>
                  </AppButton>

                  <AppButton variant="outline" shape="rounded" :pressed="true">
                    <span>Pressionado</span>
                  </AppButton>

                  <AppButton variant="outline" shape="rounded" :loading="true">
                    <span>Carregando</span>
                  </AppButton>

                  <AppButton variant="outline" shape="rounded" :disabled="true">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-sm">lock</span>
                    </template>
                    <span>Desabilitado</span>
                  </AppButton>
                </div>
              </div>

              <!-- Pill Shape -->
              <div class="pt-4 border-t border-border-grid">
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Ações em Pill (Rounded-Full)</div>
                <div class="flex flex-wrap items-center gap-3">
                  <AppButton variant="outline" shape="pill">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-base">help_outline</span>
                    </template>
                    <span>Padrão</span>
                  </AppButton>

                  <AppButton variant="outline" shape="pill">
                    <span>Com Ícone</span>
                    <template #right-icon>
                      <span class="material-symbols-outlined text-base">arrow_forward</span>
                    </template>
                  </AppButton>

                  <AppButton variant="outline" shape="pill" :pressed="true">
                    <span>Pressionado</span>
                  </AppButton>

                  <AppButton variant="outline" shape="pill" :loading="true">
                    <span>Carregando</span>
                  </AppButton>

                  <AppButton variant="outline" shape="pill" :disabled="true">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-sm">lock</span>
                    </template>
                    <span>Desabilitado</span>
                  </AppButton>
                </div>
              </div>

              <!-- Icon-Only -->
              <div class="pt-4 border-t border-border-grid">
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Ações de Controle (Icon-Only)</div>
                <div class="flex flex-wrap items-center gap-4">
                  <div class="flex items-center gap-2">
                    <AppButton variant="outline" shape="rounded" :icon-only="true" title="Padrão">
                      <span class="material-symbols-outlined text-lg">add</span>
                    </AppButton>
                    <AppButton variant="outline" shape="rounded" :icon-only="true" :pressed="true" title="Pressionado">
                      <span class="material-symbols-outlined text-lg">add</span>
                    </AppButton>
                    <AppButton variant="outline" shape="rounded" :icon-only="true" :disabled="true" title="Desabilitado">
                      <span class="material-symbols-outlined text-base">lock</span>
                    </AppButton>
                  </div>
                  <div class="h-6 w-px bg-border-grid" />
                  <div class="flex items-center gap-2">
                    <AppButton variant="outline" shape="circle" :icon-only="true" title="Padrão">
                      <span class="material-symbols-outlined text-lg">arrow_forward</span>
                    </AppButton>
                    <AppButton variant="outline" shape="circle" :icon-only="true" :pressed="true" title="Pressionado">
                      <span class="material-symbols-outlined text-lg">arrow_forward</span>
                    </AppButton>
                    <AppButton variant="outline" shape="circle" :icon-only="true" :disabled="true" title="Desabilitado">
                      <span class="material-symbols-outlined text-base">lock</span>
                    </AppButton>
                  </div>
                </div>
              </div>
            </div>
          </AppCard>

          <!-- Playground: Danger Tactile -->
          <AppCard title="Ações Destrutivas (Tactile Danger)" dot-color="error" badge="Atenção &amp; Descarte">
            <div class="space-y-6">
              <!-- Rounded-XL -->
              <div>
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Padrão Tátil (Rounded-XL)</div>
                <div class="flex flex-wrap items-center gap-3">
                  <AppButton variant="danger" shape="rounded">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-base">delete</span>
                    </template>
                    <span>Padrão</span>
                  </AppButton>

                  <AppButton variant="danger" shape="rounded">
                    <span>Com Ícone</span>
                    <template #right-icon>
                      <span class="material-symbols-outlined text-base">delete_forever</span>
                    </template>
                  </AppButton>

                  <AppButton variant="danger" shape="rounded" :pressed="true">
                    <span>Pressionado</span>
                  </AppButton>

                  <AppButton variant="danger" shape="rounded" :loading="true">
                    <span>Carregando</span>
                  </AppButton>

                  <AppButton variant="danger" shape="rounded" :disabled="true">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-sm">lock</span>
                    </template>
                    <span>Desabilitado</span>
                  </AppButton>
                </div>
              </div>

              <!-- Pill Shape -->
              <div class="pt-4 border-t border-border-grid">
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Ações em Pill (Rounded-Full)</div>
                <div class="flex flex-wrap items-center gap-3">
                  <AppButton variant="danger" shape="pill">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-base">close</span>
                    </template>
                    <span>Padrão</span>
                  </AppButton>

                  <AppButton variant="danger" shape="pill">
                    <span>Com Ícone</span>
                    <template #right-icon>
                      <span class="material-symbols-outlined text-base">arrow_forward</span>
                    </template>
                  </AppButton>

                  <AppButton variant="danger" shape="pill" :pressed="true">
                    <span>Pressionado</span>
                  </AppButton>

                  <AppButton variant="danger" shape="pill" :loading="true">
                    <span>Carregando</span>
                  </AppButton>

                  <AppButton variant="danger" shape="pill" :disabled="true">
                    <template #left-icon>
                      <span class="material-symbols-outlined text-sm">lock</span>
                    </template>
                    <span>Desabilitado</span>
                  </AppButton>
                </div>
              </div>

              <!-- Icon-Only -->
              <div class="pt-4 border-t border-border-grid">
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Ações de Exclusão (Icon-Only)</div>
                <div class="flex flex-wrap items-center gap-4">
                  <div class="flex items-center gap-2">
                    <AppButton variant="danger" shape="rounded" :icon-only="true" title="Padrão">
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </AppButton>
                    <AppButton variant="danger" shape="rounded" :icon-only="true" :pressed="true" title="Pressionado">
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </AppButton>
                    <AppButton variant="danger" shape="rounded" :icon-only="true" :disabled="true" title="Desabilitado">
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </AppButton>
                  </div>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </section>

    <!-- Section 04: Forms & Data Entry -->
    <section class="w-full bg-surface-container-lowest px-4 sm:px-6 lg:px-8 py-12 border-b border-border-grid">
      <div class="max-w-300 mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
          <div>
            <span class="font-eyebrow text-xs uppercase text-primary-container tracking-wider font-bold">04 / FORMULÁRIOS &amp; REGISTRO DE DADOS</span>
            <h2 class="font-headline text-2xl sm:text-3xl text-ink font-bold tracking-tight mt-1">Campos de Registro &amp; Estados de Validação</h2>
          </div>
          <span class="inline-block self-start md:self-auto px-3 py-1 rounded-full bg-bg-alternate border border-border-primary text-ink-muted font-body text-xs">
            Padrão, Foco, Erro &amp; Desativado
          </span>
        </div>

        <!-- Inputs Matrix (4 States) -->
        <AppCard title="Entradas de Dados do Treino" dot-color="primary" badge="4 Estados Mapeados" class="mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- State 1: Default -->
            <AppInput
              v-model="workoutName"
              label="Nome do Treino Personalizado"
              placeholder="Ex: Treino A — Puxada & Core"
            />

            <!-- State 2: Focus / Value -->
            <AppInput
              v-model="athleteIdentifier"
              label="Identificador do Treino"
            >
              <template #right>
                <span class="material-symbols-outlined text-ink-muted text-base">edit</span>
              </template>
            </AppInput>

            <!-- State 3: Error -->
            <AppInput
              v-model="targetReps"
              label="Repetições Alvo"
              error="O valor deve ser de 1 a 100 repetições."
            />

            <!-- State 4: Disabled -->
            <AppInput
              model-value="Isometria Fixa: 45s"
              label="Duração Fixa (Travado)"
              :disabled="true"
            />
          </div>
        </AppCard>

        <!-- Advanced Form Elements: Stepper, Select Dropdown, Toggles & Checkbox -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Stepper Numérico -->
          <AppCard title="Controle de Séries &amp; Repetições" dot-color="primary" badge="Tactile Stepper">
            <p class="font-body text-xs text-ink-muted mb-4 leading-relaxed">
              Ajuste mecânico rápido de repetições realizadas ou segundos de isometria da série.
            </p>

            <div class="space-y-4">
              <AppStepper
                v-model="repsCount"
                label="Repetições Realizadas (Série Atual)"
                unit="reps"
                :min="1"
                :max="100"
              />

              <AppStepper
                :model-value="0"
                label="Série Finalizada / Bloqueada"
                unit="reps"
                :disabled="true"
              />
            </div>
          </AppCard>

          <!-- Select Dropdown -->
          <AppCard title="Grupos Musculares &amp; Equipamentos" dot-color="ink" badge="Seletor Tátil">
            <p class="font-body text-xs text-ink-muted mb-4 leading-relaxed">
              Agrupamento anatômico e filtragem de exercícios para a rotina de calistenia.
            </p>

            <div class="space-y-4">
              <AppSelect
                v-model="selectedMuscleGroup"
                label="Grupo Muscular do Treino"
                :options="muscleGroupOptions"
              />

              <AppSelect
                v-model="selectedEquipmentDisabled"
                label="Equipamento Requerido"
                :options="equipmentDisabledOptions"
                :disabled="true"
              />
            </div>
          </AppCard>

          <!-- Switch / Toggles -->
          <AppCard title="Preferências de Execução de Treino" dot-color="primary" badge="Chaves Mecânicas">
            <p class="font-body text-xs text-ink-muted mb-4 leading-relaxed">
              Configurações operacionais durante o treino com feedback háptico e sonoro.
            </p>

            <div class="space-y-3">
              <AppToggle
                v-model="autoRecord"
                label="Auto-registro de Séries"
                description="Inicia o timer de descanso logo após marcar reps"
              />

              <AppToggle
                v-model="wakeLockActive"
                label="Manter Tela Ligada (Wake Lock)"
                description="Impede o bloqueio da tela durante o treino no chão"
              />

              <AppToggle
                v-model="audioCountdown"
                label="Contagem de Voz dos Segundos"
                description="Recurso experimental para exercícios de isometria"
                :disabled="true"
              />
            </div>
          </AppCard>

          <!-- Checkboxes Táteis -->
          <AppCard title="Opções &amp; Seleção Múltipla" dot-color="primary" badge="Caixa de Seleção">
            <p class="font-body text-xs text-ink-muted mb-4 leading-relaxed">
              Caixa de seleção mecânica com elevação 3D para filtros de equipamentos e preferências.
            </p>

            <div class="space-y-3">
              <AppCheckbox
                v-model="checkboxSelected"
                label="Incluir outros equipamentos"
                description="Exibe exercícios além dos cadastrados no perfil"
              />

              <AppCheckbox
                v-model="checkboxUnselected"
                label="Alertas sonoros nos últimos 3 segundos"
                size="sm"
              />

              <AppCheckbox
                :model-value="false"
                label="Opção indisponível"
                description="Bloqueado nas configurações locais deste dispositivo"
                :disabled="true"
              />
            </div>
          </AppCard>
        </div>
      </div>
    </section>

    <!-- Section 05: Controls & Progress -->
    <section class="w-full bg-background px-4 sm:px-6 lg:px-8 py-12 border-b border-border-grid">
      <div class="max-w-300 mx-auto">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-8">
          <div>
            <span class="font-eyebrow text-xs uppercase text-primary-container tracking-wider font-bold">05 / CONTROLES &amp; PROGRESSO</span>
            <h2 class="font-headline text-2xl sm:text-3xl text-ink font-bold tracking-tight mt-1">
              Controles Segmentados &amp; Barras de Progresso de Treino
            </h2>
          </div>
          <p class="max-w-md text-ink-muted font-body text-xs leading-relaxed lg:text-right">
            Indicadores lineares mecânicos para monitoramento de séries concluídas e meta semanal da agenda.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Segmented Controls -->
          <AppCard title="Alternância de Métricas &amp; Histórico" dot-color="primary" badge="Controle Segmentado">
            <div class="space-y-6">
              <AppSegmentedControl
                v-model="selectedMetric"
                label="Visualização de Métrica do Exercício:"
                :options="metricOptions"
              />

              <AppSegmentedControl
                v-model="selectedPeriod"
                label="Período de Análise de Frequência:"
                :options="periodOptions"
              />
            </div>
          </AppCard>

          <!-- Progress Bars -->
          <AppCard title="Progresso da Sessão &amp; Meta Semanal" dot-color="ink" badge="Barras Mecânicas">
            <div class="space-y-6">
              <AppProgressBar
                :value="3"
                :max="5"
                label="Exercício Atual: Série 3 de 5 (60%)"
                status-text="3 séries concluídas"
                variant="primary"
              />

              <AppProgressBar
                :value="75"
                :max="100"
                label="Meta Semanal: 3 de 4 treinos concluídos"
                status-text="75% da meta atingida"
                variant="success"
              />
            </div>
          </AppCard>

          <!-- Spinner Loader -->
          <div class="lg:col-span-2">
            <AppCard title="Indicadores de Carregamento &amp; Spinner Mecânico (AppSpinner)" dot-color="primary" badge="Feedback Assíncrono">
              <div class="space-y-8">
                <!-- Tamanhos e Variantes -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Escala de Tamanhos (xs, sm, md, lg, xl)</div>
                    <div class="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-bg-alternate border border-border-grid">
                      <div class="flex flex-col items-center gap-2">
                        <AppSpinner size="xs" variant="primary" />
                        <span class="font-eyebrow text-[9px] text-ink-subtle uppercase font-bold">xs (14px)</span>
                      </div>
                      <div class="flex flex-col items-center gap-2">
                        <AppSpinner size="sm" variant="primary" />
                        <span class="font-eyebrow text-[9px] text-ink-subtle uppercase font-bold">sm (16px)</span>
                      </div>
                      <div class="flex flex-col items-center gap-2">
                        <AppSpinner size="md" variant="primary" />
                        <span class="font-eyebrow text-[9px] text-ink-subtle uppercase font-bold">md (24px)</span>
                      </div>
                      <div class="flex flex-col items-center gap-2">
                        <AppSpinner size="lg" variant="primary" />
                        <span class="font-eyebrow text-[9px] text-ink-subtle uppercase font-bold">lg (40px)</span>
                      </div>
                      <div class="flex flex-col items-center gap-2">
                        <AppSpinner size="xl" variant="primary" />
                        <span class="font-eyebrow text-[9px] text-ink-subtle uppercase font-bold">xl (56px)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Variantes de Cor Semânticas</div>
                    <div class="flex flex-wrap items-center gap-5 p-4 rounded-xl bg-bg-alternate border border-border-grid">
                      <div class="flex flex-col items-center gap-2">
                        <AppSpinner size="md" variant="primary" />
                        <span class="font-eyebrow text-[9px] text-primary-container uppercase font-bold">primary</span>
                      </div>
                      <div class="flex flex-col items-center gap-2">
                        <AppSpinner size="md" variant="ink" />
                        <span class="font-eyebrow text-[9px] text-ink uppercase font-bold">ink</span>
                      </div>
                      <div class="flex flex-col items-center gap-2">
                        <AppSpinner size="md" variant="muted" />
                        <span class="font-eyebrow text-[9px] text-ink-subtle uppercase font-bold">muted</span>
                      </div>
                      <div class="flex flex-col items-center gap-2">
                        <AppSpinner size="md" variant="error" />
                        <span class="font-eyebrow text-[9px] text-error uppercase font-bold">error</span>
                      </div>
                      <div class="flex flex-col items-center gap-2 px-3 py-1.5 rounded-lg bg-ink">
                        <AppSpinner size="md" variant="surface" />
                        <span class="font-eyebrow text-[9px] text-surface uppercase font-bold">surface</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Labels e Integração com Botões -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-grid">
                  <div>
                    <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Spinners com Rótulo Técnico</div>
                    <div class="space-y-4 p-4 rounded-xl bg-bg-alternate border border-border-grid">
                      <div>
                        <AppSpinner size="sm" variant="primary" label="Carregando Exercícios..." />
                      </div>
                      <div class="pt-3 border-t border-border-grid/60">
                        <AppSpinner size="lg" variant="primary" label="Sincronizando Sessão..." label-position="bottom" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">Integração com AppButton (:loading="true")</div>
                    <div class="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-bg-alternate border border-border-grid">
                      <AppButton variant="fill" size="sm" :loading="true">
                        Carregando (Fill)
                      </AppButton>
                      <AppButton variant="outline" size="sm" :loading="true">
                        Carregando (Outline)
                      </AppButton>
                      <AppButton variant="danger" size="sm" :loading="true">
                        Carregando (Danger)
                      </AppButton>
                    </div>
                  </div>
                </div>
              </div>
            </AppCard>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 06: Filters & Status -->
    <section class="w-full bg-surface-container-lowest px-4 sm:px-6 lg:px-8 py-12 border-b border-border-grid">
      <div class="max-w-300 mx-auto">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-8">
          <div>
            <span class="font-eyebrow text-xs uppercase text-primary-container tracking-wider font-bold">06 / FILTROS &amp; STATUS DA SESSÃO</span>
            <h2 class="font-headline text-2xl sm:text-3xl text-ink font-bold tracking-tight mt-1">Chips de Filtro &amp; Badges de Sessão</h2>
          </div>
          <p class="max-w-md text-ink-muted font-body text-xs leading-relaxed lg:text-right">
            Seleção tátil para filtrar exercícios e badges com ícone e texto para sinalização inequívoca de estado.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Selection Chips -->
          <AppCard title="Filtros de Treino &amp; Equipamentos" dot-color="primary" badge="Filtros Táteis">
            <div class="space-y-6">
              <!-- Single Select Difficulty -->
              <div>
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-2 font-bold tracking-wider">
                  Nível de Dificuldade do Atleta (Seleção Única):
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <AppChip
                    shape="rounded"
                    :selected="selectedLevel === 'iniciante'"
                    @click="selectedLevel = 'iniciante'"
                  >
                    Iniciante
                  </AppChip>
                  <AppChip
                    shape="rounded"
                    :selected="selectedLevel === 'intermediario'"
                    @click="selectedLevel = 'intermediario'"
                  >
                    Intermediário
                  </AppChip>
                  <AppChip
                    shape="rounded"
                    :selected="selectedLevel === 'avancado'"
                    @click="selectedLevel = 'avancado'"
                  >
                    Avançado
                  </AppChip>
                </div>
              </div>

              <!-- Multiple Select Equipment -->
              <div class="pt-3 border-t border-border-grid">
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-2 font-bold tracking-wider">
                  Equipamentos Disponíveis (Seleção Múltipla):
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <AppChip
                    shape="pill"
                    :selected="selectedEquipments.includes('bar')"
                    @click="toggleEquipment('bar')"
                  >
                    Barra Fixa
                  </AppChip>
                  <AppChip
                    shape="pill"
                    :selected="selectedEquipments.includes('parallels')"
                    @click="toggleEquipment('parallels')"
                  >
                    Paralelas
                  </AppChip>
                  <AppChip
                    shape="pill"
                    :selected="selectedEquipments.includes('rings')"
                    @click="toggleEquipment('rings')"
                  >
                    Argolas Olímpicas
                  </AppChip>
                  <AppChip
                    shape="pill"
                    :selected="selectedEquipments.includes('band')"
                    @click="toggleEquipment('band')"
                  >
                    Elástico de Resistência
                  </AppChip>
                  <AppChip
                    shape="pill"
                    :selected="selectedEquipments.includes('floor')"
                    @click="toggleEquipment('floor')"
                  >
                    Solo / Sem Equipamento
                  </AppChip>
                </div>
              </div>

              <!-- Target Muscle Tags -->
              <div class="pt-3 border-t border-border-grid">
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-2 font-bold tracking-wider">
                  Músculos Alvo do Exercício:
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <AppChip
                    shape="tag"
                    color="dark"
                    :selected="selectedMuscles.includes('peito')"
                    @click="toggleMuscle('peito')"
                  >
                    Peito &amp; Tríceps
                  </AppChip>
                  <AppChip
                    shape="tag"
                    color="dark"
                    :selected="selectedMuscles.includes('costas')"
                    @click="toggleMuscle('costas')"
                  >
                    Costas &amp; Bíceps
                  </AppChip>
                  <AppChip
                    shape="tag"
                    color="dark"
                    :selected="selectedMuscles.includes('core')"
                    @click="toggleMuscle('core')"
                  >
                    Core &amp; Abdômen
                  </AppChip>
                  <AppChip
                    shape="tag"
                    color="dark"
                    :selected="selectedMuscles.includes('pernas')"
                    @click="toggleMuscle('pernas')"
                  >
                    Pernas &amp; Panturrilhas
                  </AppChip>
                </div>
              </div>
            </div>
          </AppCard>

          <!-- Status Badges -->
          <AppCard title="Badges de Status da Sessão" dot-color="ink" badge="Sinalização Semântica">
            <p class="font-body text-xs text-ink-muted mb-4 leading-relaxed">
              Estado nunca indicado apenas por cor — sempre acompanhado de ícone vetorial e texto descritivo.
            </p>

            <div class="space-y-4">
              <!-- Session Statuses -->
              <div class="flex flex-wrap items-center gap-2">
                <AppStatusBadge type="completed" />
                <AppStatusBadge type="in_progress" />
                <AppStatusBadge type="partial" />
                <AppStatusBadge type="planned" />
                <AppStatusBadge type="rest" />
                <AppStatusBadge type="abandoned" />
              </div>

              <!-- Informative Badges -->
              <div class="pt-4 border-t border-border-grid">
                <div class="font-eyebrow text-[10px] text-ink-subtle uppercase mb-3 font-bold tracking-wider">
                  Badges Informativos &amp; Metadados de Treino:
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <AppStatusBadge type="pr" />
                  <AppStatusBadge type="bodyweight" />
                  <AppStatusBadge type="weighted" />
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </section>
  </div>
</template>
