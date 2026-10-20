---
name: developer-guidelines
trigger: always_on
---

# Project: Spectra — Aplicativo Web de Calistenia (Developer Guidelines)

Este documento consolida as diretrizes técnicas e arquiteturais do **Spectra**, um aplicativo web de calistenia responsivo (mobile-first), local-first, instalável como PWA e sem dependência de backend ou autenticação.

---

## Sumário

1. [Regras Críticas (Inquebráveis)](#1-regras-críticas-inquebráveis-)
2. [Visão Geral & Stack Técnica](#2-visão-geral--stack-técnica)
3. [Princípios de Domínio](#3-princípios-de-domínio)
4. [Arquitetura de Dados & Persistência Local](#4-arquitetura-de-dados--persistência-local)
5. [Arquitetura de Frontend & Componentização](#5-arquitetura-de-frontend--componentização)
6. [Regras de Execução de Treino & Cronômetros](#6-regras-de-execução-de-treino--cronômetros)
7. [Progressão, Métricas & Histórico](#7-progressão-métricas--histórico)
8. [PWA, Acessibilidade & Mobile-First](#8-pwa-acessibilidade--mobile-first)
9. [Guia Rápido (Checklist)](#9-guia-rápido-checklist)

---

## 1. Regras Críticas (Inquebráveis) ⚠️

Estas regras **NUNCA** devem ser violadas sob nenhuma circunstância:

### Regra #1: Sem Operações Git
**NUNCA** utilize comandos shell como `git add`, `git commit`, `git push`, etc. Todas as operações de Git devem ser realizadas manualmente pelo usuário. O assistente deve apenas criar, editar ou remover arquivos conforme solicitado.

### Regra #2: Local-First e Privacidade Total
- A aplicação é **100% local-first**: sem contas, sem login, sem servidor backend e sem chamadas para APIs externas.
- **Nenhum dado pessoal** ou telemetria intrusiva deve ser transmitido para fora do dispositivo.
- Nunca adicionar credenciais hardcoded, chaves secretas ou tokens no código.

### Regra #3: Vue 3 Composition API Exclusiva (`<script setup lang="ts">`)
- **NUNCA** utilize Options API (`export default { data() {} }`).
- Use estritamente `<script setup lang="ts">`.
- Tipagem TypeScript estrita: evite `any` ou `unknown`. Toda entidade e estado deve ser tipado em `src/types/`.

---

## 2. Visão Geral & Stack Técnica

| Propriedade | Valor |
|---|---|
| Plataforma | Web responsiva (Mobile-first), instalável como PWA básico |
| Framework | Vue 3 |
| Linguagem | TypeScript (Strict mode) |
| Gerenciador de Estado | Pinia |
| Estilização | TailwindCSS (Tailwind 4) |
| Build Tool | Vite |
| Persistência | `localStorage` isolado via Service/Repository com validação de schema (Zod/Valibot) |
| Idioma da Interface | Português do Brasil (PT-BR) |

---

## 3. Princípios de Domínio

1. **Local-first**: Todos os dados (preferências, treinos, histórico e sessão em andamento) pertencem ao usuário e ficam no dispositivo.
2. **Mobile-first**: Todos os fluxos principais são projetados para celular, navegáveis e operáveis com apenas uma mão.
3. **Constantes de Domínio Centralizadas**:
   - Todos os limites numéricos (séries: 1–10, repetições: 1–100, duração: 5–600s, descanso: 0–600s, nome: até 60 chars, exercícios por treino: até 30, início da semana na segunda-feira) vivem em um único módulo (`src/constants/domain.ts`) e **nunca** são repetidos em componentes.
4. **Histórico Imutável**:
   - Ao iniciar uma sessão, cria-se um **snapshot** dos dados do treino.
   - Concluir ou alterar um treino no editor **nunca altera** sessões passadas.
   - Sessões finalizadas não são editadas (apenas excluídas).
5. **Progressão Prudente e Opcional**:
   - Sugestão simples, explicada e nunca automática. O usuário decide aceitar, editar ou ignorar.
6. **Simplicidade e Honestidade de Dados**:
   - Sem gráficos vazios e sem valores fictícios. Sem estatísticas sem histórico prévio. Nunca somar grandezas incompatíveis (repetições com segundos).

---

## 4. Arquitetura de Dados & Persistência Local

### 4.1 Camada de Persistência Isolada
- **Nenhum componente de UI deve acessar `localStorage` diretamente.**
- Todo acesso ao armazenamento passa por um serviço/repositório dedicado (`src/services/storageService.ts` ou stores Pinia correspondentes).
- Toda leitura e escrita em runtime deve ser validada por schema (Zod ou Valibot).
- Chaves padrão no `localStorage`:
  - `calistenia:schemaVersion`: versão do esquema (inicia em `1`).
  - `calistenia:preferences`: nível (`beginner`, `intermediate`, `advanced`), equipamentos, agenda semanal (`schedule`), som/vibração e status de onboarding.
  - `calistenia:workouts`: treinos criados/copiados pelo usuário.
  - `calistenia:sessions`: histórico de sessões finalizadas (`completed` ou `partial`).
  - `calistenia:activeSession`: sessão em andamento e estado dos cronômetros.

### 4.2 Catálogo Estático e Treinos Prontos
- O catálogo de ~40 exercícios e os 4 treinos prontos vivem estaticamente no código (`src/data/exercises.ts` e `src/data/presetWorkouts.ts`) com slugs/IDs estáveis e imutáveis.
- O catálogo nunca é duplicado no `localStorage`; apenas referenciado por `exerciseId`.

### 4.3 Backup e Restauração JSON
- **Exportação**: Gera arquivo JSON estruturado contendo metadados, schema version, preferências, treinos e histórico.
- **Importação**: Restauração por substituição completa com confirmação prévia explícita e validação rigorosa de schema.

---

## 5. Arquitetura de Frontend & Componentização

### 5.1 Estrutura de Navegação (4 Abas)
A navegação principal é composta por 4 abas inferiores:
1. **Hoje**: Semana (segunda a domingo), treino do dia, botão Iniciar/Retomar, meta semanal derivada.
2. **Treinos**: Lista de treinos do usuário + seção "Treinos prontos" para copiar.
3. **Exercícios**: Biblioteca pesquisável por nome, com filtros por grupo muscular e equipamento.
4. **Progresso**: Meta semanal, frequência (últimas 8 semanas), evolução por exercício com recorde pessoal e histórico de sessões.
*Configurações* (backup, preferências, apagar dados) ficam acessíveis via ícone no cabeçalho.

### 5.2 Divisão Smart (Views) vs Dumb (Components)
- **Views (`src/views/`)**: Conhecem rotas, injetam stores Pinia, tratam carregamento, erros e estados vazios, e passam props primitivas para os componentes filhos.
- **Components (`src/components/`)**: Componentes reutilizáveis que apenas recebem `props` e disparam `emits`. Não injetam stores ou serviços diretamente para evitar acoplamento.
- **Composables (`src/composables/`)**: Lógicas reutilizáveis e coesas com prefixo `use` (ex.: `useTimer`, `useWakeLock`, `useProgression`).

### 5.3 TailwindCSS
- Uso exclusivo de classes utilitárias nativas do Tailwind.
- Evitar classes arbitrárias ou tags `<style>` em arquivos `.vue`.
- Suporte nativo ao modo escuro e alto contraste.

---

## 6. Regras de Execução de Treino & Cronômetros

1. **Cálculo Baseado em Timestamps**:
   - Os cronômetros (descanso e exercícios por duração) devem calcular o tempo restante a partir de **timestamps absolutos** (`restEndsAt`, `exerciseEndsAt`), e **NUNCA** por contagem incremental de `setInterval`.
   - Permite que o tempo continue correndo com precisão caso o usuário troque de aba, minimize o navegador ou recarregue a página.
2. **Restauração de Sessão Ativa**:
   - A sessão em andamento é persistida a cada alteração/série registrada (`calistenia:activeSession`). Ao recarregar a aplicação, a tela "Hoje" apresenta o botão **Retomar**.
3. **Screen Wake Lock**:
   - Durante a execução de um treino, manter a tela do celular ligada utilizando a API `navigator.wakeLock` (com fallback e tratamento silencioso caso não seja suportado).
4. **Encerramento de Sessão**:
   - Opções ao encerrar: **Salvar como parcial** (se houver ao menos 1 série registrada) ou **Descartar** (com confirmação).
   - Ao concluir todas as séries do último exercício, direcionar ao resumo final como **concluída**.

---

## 7. Progressão, Métricas & Histórico

1. **Meta Semanal Derivada da Agenda**:
   - A meta semanal é estritamente a quantidade de dias com treino atribuído na agenda (`schedule`). Não existe meta isolada independente.
2. **Recorde Pessoal (PR)**:
   - Calculado dinamicamente a partir do histórico: **maior valor realizado em uma única série** do exercício (repetições ou segundos). Não possui armazenamento redundante.
3. **Regra Única de Progressão**:
   - Se nas **2 últimas sessões** onde o exercício apareceu, todas as séries planejadas foram registradas com valor realizado maior ou igual à meta:
     - Sugerir **+1 repetição** (para exercícios de reps) ou **+5 segundos** (para exercícios de duração).
   - A sugestão aparece no resumo pré-treino com ações **Aceitar**, **Editar** ou **Ignorar**.
   - Ignorar a sugestão grava a data de dispensa e só volta a sugerir após novas sessões posteriores.

---

## 8. PWA, Acessibilidade & Mobile-First

- **PWA Básico**: Manifesto válido, ícones responsivos e Service Worker com pré-cache estático do app shell e catálogo.
- **Funcionamento Offline**: O aplicativo deve abrir e funcionar de forma idêntica com ou sem conexão após o primeiro acesso.
- **Áreas de Toque Amigáveis**: Botões grandes com padding generoso para facilitar a interação com o celular apoiado no chão durante o treino.
- **Acessibilidade**: Contrastes adequados, estados nunca representados unicamente por cor e rótulos acessíveis em cronômetros.

---

## 9. Guia Rápido (Checklist)

✅ **Sem comandos Git** em prompts ou scripts shell  
✅ **Sem backend ou chamadas de API externas**; aplicação 100% local-first  
✅ **Composition API exclusiva** com `<script setup lang="ts">`  
✅ **TypeScript rigoroso** sem `any` ou `unknown`  
✅ **Acesso ao localStorage restrito** à camada de serviços/stores com validação de schema  
✅ **Limites numéricos e regras** centralizados em `src/constants/domain.ts`  
✅ **Timers por timestamp**, nunca por contagem ingênua de segundos  
✅ **Snapshots em sessões** para garantir integridade imutável do histórico  
