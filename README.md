# Spectra — Calistenia

> Aplicativo web de calistenia progressivo (PWA), responsivo (mobile-first), 100% local-first e sem dependência de contas ou servidores externos.

🚀 **Acesse online:** [https://davidfreitas-dev.github.io/spectra/](https://davidfreitas-dev.github.io/spectra/)

---

## 🎯 Sobre o Spectra

O **Spectra** foi projetado para praticantes de calistenia que desejam organizar suas rotinas semanais, executar treinos guiados com o celular no chão e acompanhar a consistência e recordes pessoais com dados 100% reais — sem cadastros, sem login, sem anúncios e com total privacidade.

### Princípios Fundamentais

- **Local-First & Privacidade Total:** Seus dados (preferências, rotinas, histórico e sessões) nunca saem do seu navegador.
- **Mobile-First & Uso no Chão:** Botões generosos, steppers táteis e navegação pensada para interação rápida durante os exercícios.
- **Histórico Confiável:** Ao iniciar um treino, é gerado um *snapshot* imutável. Alterar ou excluir um treino nunca corrompe registros passados.
- **Precisão Temporal por Timestamps:** Cronômetros de descanso e isometria utilizam timestamps absolutos (`restEndsAt`), não perdendo o tempo caso a aba seja minimizada ou o navegador suspenso.
- **Progresso Honesto:** Sem gráficos vazios ou dados fictícios. Apenas métricas reais baseadas no que foi concluído.

---

## ✨ Funcionalidades Principais

| Módulo | Descrição |
|---|---|
| **📅 Visão do Dia (Hoje)** | Faixa dos 7 dias da semana (Seg–Dom), treino agendado, progresso da meta semanal e botão rápido para Iniciar ou Retomar sessão ativa. |
| **🏋️ Biblioteca de Treinos** | Crie, edite, duplique, ordene e agende seus treinos. Inclui 4 modelos prontos de calistenia (*Full Body Iniciante*, *Full Body Intermediário*, *Empurrada & Puxada*, *Core & Cardio*) prontos para copiar. |
| **📖 Catálogo de Exercícios** | Acervo de movimentos em PT-BR categorizados por nível, equipamento e músculos envolvidos, com instruções posturais passo a passo e recordes pessoais (PR). |
| **⏱️ Execução Guiada** | Telas táteis com séries pré-preenchidas com a meta, cronômetro de descanso (+30s / pular), timer para isometrias, alertas sonoros e vibração háptica. |
| **💡 Screen Wake Lock** | Mantém a tela do celular sempre acesa durante a realização do treino (com fallback silencioso caso não seja suportado). |
| **📈 Progresso & Recordes (PR)** | Meta semanal derivada da agenda, gráfico de consistência (últimas 8 semanas), evolução histórica por exercício e histórico detalhado por data. |
| **⚡ Sugestão de Progressão** | Regra única e opcional: ao bater a meta em todas as séries de um exercício nas 2 últimas sessões, o app sugere `+1 repetição` ou `+5 segundos` no resumo pré-treino (*Aceitar*, *Editar* ou *Ignorar*). |
| **💾 Backup & Restauração JSON** | Exporte seu histórico e treinos em um arquivo JSON padronizado e restaure em qualquer aparelho com validação rigorosa de integridade (Zod). |
| **📱 PWA Offline** | Instalável no celular e desktop, funcionando perfeitamente sem conexão à internet. |

---

## 🧭 Como Usar o Aplicativo

### 1. Primeiro Acesso (Onboarding)
Ao abrir o app pela primeira vez, selecione seu **nível de experiência** (*Iniciante*, *Intermediário* ou *Avançado*) e os **equipamentos disponíveis** (*Apenas Peso Corporal*, *Barra Fixa*, *Elásticos*, *Corda*). Isso calibra os filtros da biblioteca e sugere os treinos mais adequados.

### 2. Escolhendo ou Criando seu Primeiro Treino
Antes de agendar sua semana, você precisa de ao menos uma rotina em **Meus Treinos**. Você tem dois caminhos:
- **Caminho Rápido (Recomendado):** Vá na aba **Treinos** > **Modelos Prontos** e toque em **Copiar para Meus Treinos** (ex.: *Full Body Iniciante* ou *Empurrada & Puxada*). O treino é importado instantaneamente.
- **Caminho Personalizado:** Toque em **Novo Treino**, escolha os movimentos do catálogo de 40 exercícios e personalize séries, metas (repetições ou duração em segundos) e intervalos de descanso.

### 3. Organizando a Agenda Semanal
Com seu treino disponível:
- Toque no botão de **Agendar** (ícone de calendário) diretamente no card do treino na aba **Treinos**; **ou**
- Na aba **Hoje**, toque sobre os dias da semana desejados (Seg–Dom) e vincule o treino correspondente.
- A sua **Meta Semanal** é calculada automaticamente com base na quantidade de dias agendados na semana.

### 4. Executando um Treino
1. Toque em **Iniciar Treino** na aba **Hoje** ou no botão **Iniciar** de qualquer rotina na aba **Treinos**.
2. No resumo pré-treino, confira os exercícios e avalie sugestões de progressão caso disponíveis.
3. Durante a sessão:
   - Execute o movimento e confirme as repetições ou segundos no stepper tátil.
   - Toque em **Concluir Série** para iniciar o cronômetro de descanso automático.
   - Use os botões **+30s** ou **Pular Descanso** conforme sua recuperação.
4. Ao finalizar o último exercício, revise seus recordes pessoais batidos, adicione anotações opcionais e salve o treino concluído.

### 5. Acompanhando a Evolução
Na aba **Progresso**, acompanhe o cumprimento da meta semanal, sua frequência nas últimas 8 semanas e selecione qualquer exercício já praticado para visualizar sua melhor marca histórica (PR) e a evolução ao longo do tempo.

---

## 🛠️ Stack Tecnológica

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API estrita com `<script setup lang="ts">`)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Estilização:** [TailwindCSS 4](https://tailwindcss.com/) (Escala de espaçamento contínua e tokens semânticos)
- **Gerenciamento de Estado:** [Pinia](https://pinia.vuejs.org/)
- **Roteamento:** [Vue Router](https://router.vuejs.org/)
- **Validação de Schema:** [Zod](https://zod.dev/)
- **PWA & Offline:** [Vite Plugin PWA](https://vite-pwa-org.netlify.app/)
- **Build Tool:** [Vite](https://vite.dev/)

---

## 📂 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis (botões, cards, steppers, modais)
├── composables/         # Hooks reativos (useTimer, useWakeLock, useSound)
├── constants/           # Limites de domínio centralizados (DOMAIN_LIMITS, STORAGE_KEYS)
├── data/                # Catálogo estático de exercícios e treinos prontos
├── router/              # Configuração de rotas da aplicação
├── services/            # Camada de armazenamento e persistência isolada (StorageService)
├── stores/              # Stores Pinia (preferences, workouts, sessions)
├── types/               # Tipagem TypeScript estrita e schemas Zod
└── views/               # Telas principais (Hoje, Treinos, Exercícios, Progresso, Execução)
```

---

## 💻 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18+ instalada.
- Gerenciador de pacotes `npm`.

### Instalação

```bash
# Clone o repositório ou acesse a pasta do projeto
cd spectra

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento local
npm run dev
```

Abra seu navegador em `http://localhost:5173`.

### Build de Produção & Verificação de Tipos

```bash
# Executa a checagem TypeScript e gera a build otimizada para produção
npm run build

# Pré-visualize a versão final compilada
npm run preview
```

### Deploy no GitHub Pages

O projeto conta com automação contínua via GitHub Actions em [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). A cada push na branch principal (`main`), a build é gerada e disponibilizada automaticamente em:
👉 **[https://davidfreitas-dev.github.io/spectra/](https://davidfreitas-dev.github.io/spectra/)**

---

## 🔒 Privacidade & Armazenamento

Todos os dados são mantidos exclusivamente no `localStorage` do seu navegador sob a chave de namespace `calistenia:*`. Recomendamos exportar periodicamente um backup JSON na tela de **Configurações** para preservar suas rotinas e histórico ao trocar de dispositivo ou limpar os dados do navegador.
