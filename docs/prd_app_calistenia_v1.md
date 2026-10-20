# PRD — Aplicativo Web de Calistenia (MVP)

**Versão:** 1.0
**Base técnica:** `specs_app_calistenia_v1.1.md`
**Idioma:** Português (Brasil)
**Status:** Pronto para design e desenvolvimento

---

## 1. Resumo

Um aplicativo web de calistenia, mobile-first e **sem login**, que permite ao usuário montar treinos, planejar a semana, executar sessões guiadas e acompanhar a evolução. Tudo funciona no dispositivo (dados locais, uso offline) e o usuário pode fazer backup em JSON.

**Em uma frase:** *"Monte seu treino de calistenia, siga passo a passo e veja sua evolução, sem criar conta."*

---

## 2. Problema

Quem treina calistenia em casa, no parque ou na academia ao ar livre costuma enfrentar:

- **Falta de estrutura:** treinos em notas, prints ou memória, sem rotina semanal clara.
- **Apps pesados:** exigem cadastro, assinatura, internet constante e trazem funções que a pessoa não usa.
- **Registro frágil ou inexistente:** é difícil saber se evoluiu, porque o que foi feito não fica guardado de forma confiável.
- **Cronometragem manual:** descansos e exercícios isométricos pedem alternar entre cronômetro e anotações.
- **Primeira tela vazia:** iniciantes não sabem por onde começar.

---

## 3. Público-alvo (hipóteses)

| Persona | Contexto | Necessidade principal |
|---|---|---|
| **Iniciante em casa** | Sem equipamento ou com elástico; quer começar uma rotina | Um treino pronto simples, guiado e fácil de seguir |
| **Praticante com barra fixa** | Treina 3 a 5 vezes por semana; já tem treino próprio | Montar seus treinos, registrar o real e ver evolução por exercício |

Ambos usam principalmente o **celular**, muitas vezes com internet ruim e em pé ou no chão, com poucos toques e áreas grandes.

---

## 4. Proposta de valor

1. **Zero atrito:** abre e usa, sem cadastro, e-mail ou senha.
2. **Treino guiado de verdade:** série atual, meta, cronômetro de descanso e exercícios por tempo.
3. **Registro honesto:** o que você fez de fato fica no histórico, e editar o treino depois não altera o passado.
4. **Privacidade por padrão:** seus dados ficam no seu aparelho.
5. **Funciona offline:** instalável e utilizável sem conexão.

---

## 5. Objetivos e métricas de sucesso

O app não terá telemetria de terceiros no MVP; as metas abaixo são **verificáveis por teste e uso real**.

| Objetivo | Como medir | Meta |
|---|---|---|
| Começar rápido | Tempo do primeiro acesso até iniciar um treino (usando treino pronto) | ≤ 2 minutos |
| Montar treino próprio | Tempo para criar um treino de 4 exercícios | ≤ 3 minutos |
| Confiança nos dados | Sessão interrompida por recarga/fechamento é restaurada corretamente | 100% nos cenários testados |
| Execução sem fricção | Nº de toques para registrar uma série com valor igual à meta | 1 toque |
| Segurança dos dados | Backup exportado e restaurado preserva treinos e histórico | 100% dos casos válidos; importação inválida nunca apaga dados |
| Uso real | O autor/primeiros usuários treinam com o app por 4 semanas seguidas | Sem perda de dados e sem bloqueios que façam abandonar o app |

---

## 6. Escopo

### 6.1 Dentro do MVP

- Onboarding (equipamentos e nível).
- Biblioteca de ~40 exercícios, com busca e filtros.
- 4 treinos prontos copiáveis.
- Criação e gestão de treinos próprios.
- Agenda semanal na tela Hoje, com meta semanal derivada.
- Execução guiada com cronômetros.
- Histórico de sessões (concluídas e parciais).
- Progresso: meta semanal, frequência (8 semanas), evolução por exercício e recorde.
- Sugestão de progressão (regra única).
- Backup JSON (exportar, importar por substituição) e apagar dados.
- PWA básico e tela ligada durante o treino.

### 6.2 Fora do MVP

Login e sincronização, backend, rede social, planos pagos, IA geradora de treinos, integrações com relógios e saúde, vídeos próprios, notificações push, exercícios personalizados, metas por série, edição de sessões finalizadas, mesclagem de backups, esforço percebido e IndexedDB.

---

## 7. Jornadas principais

### 7.1 Primeiro uso
1. Abre o app e escolhe equipamentos e nível (2 passos).
2. Cai na tela **Hoje** vazia, com a ação "Escolha um treino pronto".
3. Usa um treino pronto, agenda em alguns dias e inicia o primeiro treino.

### 7.2 Treino do dia
1. Em **Hoje**, vê o treino do dia e toca em **Iniciar**.
2. Revisa o resumo (e a sugestão de progressão, se houver) e toca em **Começar**.
3. Para cada série: faz, ajusta o valor se necessário e toca em **Concluir série**; segue o descanso.
4. Finaliza e vê o resumo com recordes batidos.

### 7.3 Montar um treino
1. Em **Treinos**, toca em **Novo treino** (ou duplica um existente).
2. Dá um nome, adiciona exercícios pelo seletor e define séries, meta e descanso.
3. Reordena, salva automaticamente e agenda em um dia.

### 7.4 Acompanhar evolução
1. Em **Progresso**, vê a meta da semana e a frequência das últimas semanas.
2. Escolhe um exercício e acompanha a evolução e o recorde.
3. Abre uma sessão no histórico para ver planejado vs realizado.

### 7.5 Backup e troca de aparelho
1. Em **Configurações**, exporta o backup JSON.
2. No novo aparelho, importa o arquivo, confirma a substituição e continua de onde parou.

---

## 8. Requisitos funcionais

**Prioridade:** **P0** = essencial para o ciclo completo. **P1** = entra no MVP, mas é o primeiro a sair se o prazo apertar (na ordem listada abaixo, de baixo para cima).

### 8.1 Configuração e navegação
| ID | Requisito | Prior. |
|---|---|---|
| RF-01 | Usar o app sem cadastro ou login | P0 |
| RF-02 | Onboarding de 2 passos: equipamentos e nível | P0 |
| RF-03 | Navegação inferior com 4 abas (Hoje, Treinos, Exercícios, Progresso) e Configurações no cabeçalho | P0 |

### 8.2 Biblioteca e treinos
| ID | Requisito | Prior. |
|---|---|---|
| RF-04 | Biblioteca com busca por nome e filtros de equipamento e grupo muscular | P0 |
| RF-05 | Detalhe do exercício com instruções, equipamento, variações e recorde | P0 |
| RF-06 | Criar, editar, renomear, duplicar, reordenar e excluir treinos | P0 |
| RF-07 | Configurar séries, meta (reps ou segundos) e descanso por exercício | P0 |
| RF-08 | Treinos prontos que o usuário copia e edita | P0 |
| RF-09 | Validação dos limites e bloqueio de treino sem nome ou sem exercício | P0 |

### 8.3 Agenda
| ID | Requisito | Prior. |
|---|---|---|
| RF-10 | Faixa semanal na tela Hoje com estado de cada dia | P0 |
| RF-11 | Atribuir, trocar e remover treino de um dia | P0 |
| RF-12 | Meta semanal derivada dos dias agendados | P0 |

### 8.4 Execução
| ID | Requisito | Prior. |
|---|---|---|
| RF-13 | Resumo pré-treino e criação da sessão com snapshot | P0 |
| RF-14 | Tela de execução com série atual, meta, resultado real e Concluir série | P0 |
| RF-15 | Cronômetro de descanso (pular, +30 s) calculado por timestamp | P0 |
| RF-16 | Exercícios por duração com contagem regressiva | P0 |
| RF-17 | Restaurar a sessão em andamento ao reabrir o app | P0 |
| RF-18 | Encerrar como parcial ou descartar; concluir normalmente | P0 |
| RF-19 | Resumo final com planejado vs realizado e nota opcional | P0 |
| RF-20 | Som e vibração ao fim do descanso, com um único controle | P1 |
| RF-21 | Manter a tela ligada durante a sessão (Wake Lock) | P1 |

### 8.5 Histórico e progresso
| ID | Requisito | Prior. |
|---|---|---|
| RF-22 | Histórico de sessões com detalhe e exclusão | P0 |
| RF-23 | Meta da semana e frequência das últimas 8 semanas | P0 |
| RF-24 | Evolução por exercício e recorde (maior valor em uma série) | P1 |
| RF-25 | Sugestão de progressão com regra única (aceitar, editar, ignorar) | P1 |

### 8.6 Dados e PWA
| ID | Requisito | Prior. |
|---|---|---|
| RF-26 | Salvamento automático, validação de dados e tratamento de erro de gravação | P0 |
| RF-27 | Exportar backup JSON | P0 |
| RF-28 | Importar backup com validação, confirmação e substituição | P0 |
| RF-29 | Apagar todos os dados com confirmação | P0 |
| RF-30 | PWA básico: instalável e utilizável offline | P1 |
| RF-31 | Aviso de nova versão, sem atualizar durante uma sessão | P1 |

---

## 9. Regras de negócio principais

1. **Snapshot:** a sessão guarda cópia do treino; editar ou excluir o treino não altera o histórico.
2. **Agenda ≠ histórico:** mudar a agenda só afeta o planejamento futuro.
3. **Meta semanal:** quantidade de dias com treino atribuído; conta apenas sessões **concluídas** da semana (segunda a domingo, horário local). Sessões parciais aparecem no histórico, mas não contam para a meta.
4. **Um treino por dia** na agenda; o mesmo treino pode ocupar vários dias.
5. **Uma sessão em andamento** por vez.
6. **Série não registrada** significa pulada ou não realizada (valor realizado vazio).
7. **Recorde:** maior valor em uma única série, comparado apenas ao mesmo exercício.
8. **Progressão:** só sugere quando as 2 últimas sessões bateram a meta em todas as séries; nunca altera nada sem aprovação.
9. **Sessão finalizada não é editada**, apenas excluída.
10. **Importação inválida nunca apaga** dados existentes.

---

## 10. Requisitos não funcionais

- **Mobile-first:** áreas de toque confortáveis, sem rolagem horizontal, ações principais acessíveis com uma mão.
- **Desempenho:** abertura rápida em celulares comuns; cronômetro sem re-renderizações desnecessárias.
- **Confiabilidade:** falha de leitura não impede a abertura; dados corrompidos são preservados para exportação; nunca confirmar "salvo" antes da gravação.
- **Privacidade:** nenhum dado sai do dispositivo; sem analytics de terceiros.
- **Acessibilidade:** contraste, foco visível, navegação por teclado, estado nunca só por cor, respeito a movimento reduzido.
- **Compatibilidade:** testes em Safari iOS e Chrome Android.
- **Offline:** o app abre e funciona completamente sem conexão após o primeiro carregamento.

---

## 11. Mapa de telas (13)

Onboarding · Hoje · Treinos · Editor de treino · Seletor de exercícios (sheet) · Exercícios · Detalhe do exercício · Resumo pré-treino (sheet) · Execução (série, descanso, cronometrado) · Resumo final · Progresso · Detalhe da sessão · Configurações.

### 11.1 Direção visual e componentes

A base visual vem do `design.md` (template Spectra): fundo claro quente, texto quase preto, um único acento laranja, contornos pretos finos e sombra sólida em elementos interativos.

Componentes mínimos para a biblioteca de componentes:

- Botão (primário, secundário/outline, ícone) e botão de ação principal da execução.
- Card de treino, card de exercício e card de sessão.
- Chip/filtro e campo de busca.
- Stepper numérico (séries, repetições, segundos).
- Faixa semanal (7 dias com estados).
- Barra de navegação inferior e cabeçalho com ícone de configurações.
- Bottom sheet/modal e diálogo de confirmação.
- Cronômetro circular ou numérico grande.
- Barra de progresso da sessão e da meta semanal.
- Gráficos simples (barras e linha).
- Estados vazios, banners de erro/aviso e toast de confirmação.

---

## 12. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Perda de dados (limpar navegador, trocar de aparelho) | Alto | Backup JSON com lembrete leve em Configurações; aviso claro sobre armazenamento local |
| `localStorage` com limite de espaço | Médio | Tratar quota excedida; sessões compactas; avaliar IndexedDB depois |
| Cronômetro impreciso com a aba em segundo plano | Alto | Cálculo por timestamp; aviso de limitação de alertas em segundo plano |
| Wake Lock e áudio com suporte irregular | Médio | Funções P1 com falha silenciosa; testar em iOS e Android |
| Conteúdo do catálogo demorar mais que o código | Médio | Meta de ~40 exercícios com ficha padrão; começar pelos usados nos treinos prontos |
| Escopo crescer durante a construção | Médio | Seguir as fatias verticais; mover qualquer novidade para o backlog |
| Evolução do esquema de dados sem migração | Médio | `schemaVersion` desde o dia 1; implementar migração só na v2 |
| Segurança do usuário (progressão agressiva ou dor) | Médio | Regra conservadora (+1 rep / +5 s), avisos de execução segura, sem alegações médicas |

---

## 13. Dependências e premissas

- Catálogo de ~40 exercícios com instruções em PT-BR e ilustrações ou imagens (ou apenas texto no lançamento).
- 4 treinos prontos validados contra o catálogo final.
- Navegadores com suporte a `localStorage` e service workers (iOS Safari e Chrome Android atuais).
- Wake Lock e vibração são recursos opcionais.

---

## 14. Roadmap

| Fatia | Entrega | Resultado |
|---|---|---|
| **1 — Treinar** | Catálogo, treinos prontos, editor, execução, restauração de sessão e histórico simples | Já dá para usar de verdade |
| **2 — Semana e progresso** | Onboarding, Hoje com agenda, Progresso, recorde e regra de progressão | Ciclo completo de uso |
| **3 — Segurança e acabamento** | Backup, apagar dados, PWA, Wake Lock, testes de borda, acessibilidade e compatibilidade | Pronto para publicar |

---

## 15. Backlog pós-MVP

Ordem sugerida de avaliação, conforme o uso real mostrar necessidade:

1. Exercícios personalizados criados pelo usuário.
2. Metas diferentes por série.
3. Mesclagem de backups.
4. Edição de sessões finalizadas.
5. Meta semanal independente da agenda.
6. Sugestão automática de variação mais fácil e mais difícil.
7. Notificações (PWA) e lembretes de treino.
8. Migração para IndexedDB e política de atualização do PWA mais elaborada.
9. Sincronização opcional entre dispositivos (com conta).

---

## 16. Questões em aberto

1. **Meta semanal:** a derivação a partir da agenda atende quem treina em dias variáveis, ou vale um número livre nas configurações?
2. **Ilustrações:** o lançamento será só com texto ou com imagens por exercício?
3. **Nome e identidade** do aplicativo.
4. **Hospedagem e domínio** (relevante para o PWA e para o backup/URL de instalação).
5. **Lembrete de backup:** aviso periódico simples dentro do app vale entrar no MVP?
