# Especificação Funcional e Técnica — Aplicativo Web de Calistenia

**Versão:** 1.1 (MVP simplificado)
**Status:** Pronta para desenvolvimento
**Idioma da interface:** Português (Brasil)
**Plataforma:** Aplicação web responsiva (mobile-first), instalável como PWA básico
**Persistência:** Local (`localStorage`), sem conta de usuário e sem backend

> **O que mudou em relação à v1.0:** navegação reduzida a 4 abas; agenda unificada (meta semanal derivada); 3 estados de sessão; 2 tipos de medição; um descanso por exercício; modelo de dados com 3 entidades; progressão com uma única regra; progresso com 3 indicadores; backup sem preview; sem edição de sessões finalizadas; sem runner de migrações até existir a v2. **Adições:** treinos prontos, catálogo com tamanho definido, PWA básico e tela sempre ligada durante o treino.

---

## 1. Visão geral

Aplicativo web de calistenia para o usuário organizar a semana, montar seus treinos, executar sessões guiadas e acompanhar a evolução. Sem cadastro, sem login e sem servidor: preferências, treinos e histórico ficam no navegador do dispositivo.

Equipamentos considerados: peso corporal, elástico de resistência, corda de pular e barra fixa.

### 1.1 Objetivos

- Montar e manter uma rotina semanal com poucos toques.
- Permitir treinos personalizáveis, com opção de partir de modelos prontos.
- Guiar a execução de cada sessão, inclusive com o celular no chão ou apoiado.
- Registrar o que foi realmente feito, sem alterar o passado quando o treino-base mudar.
- Mostrar consistência e evolução de forma honesta (só dados reais).
- Sugerir progressões simples, explicáveis e opcionais.
- Proteger os dados locais com backup e funcionar sem conexão.

### 1.2 Princípios

1. **Local-first:** os dados pertencem ao usuário e ficam no dispositivo.
2. **Mobile-first:** todos os fluxos principais funcionam bem no celular, com uma mão.
3. **Personalizável:** modelos prontos são ponto de partida, nunca restrição.
4. **Histórico confiável:** sessão concluída não muda quando o treino é editado.
5. **Progressão prudente:** sugestão simples, explicada e nunca automática.
6. **Simplicidade:** se uma função exige muita regra de borda para entregar pouco valor, ela fica para depois.

---

## 2. Escopo

### 2.1 Incluído no MVP

- Sem cadastro e sem login.
- Onboarding curto (equipamentos e nível).
- Biblioteca de ~40 exercícios com busca e filtros.
- 4 treinos prontos copiáveis e editáveis.
- Criar, editar, duplicar, reordenar e excluir treinos.
- Agenda semanal (dia → treino) na tela Hoje.
- Execução guiada com cronômetro de descanso e exercícios por tempo.
- Salvamento automático e restauração da sessão em andamento.
- Histórico de sessões (concluídas e parciais).
- Progresso: meta semanal, frequência e evolução por exercício, com recorde.
- Sugestão de progressão (uma regra).
- Exportar/importar backup JSON (restauração por substituição) e apagar dados.
- PWA básico (instalável e utilizável offline).
- Tela ligada durante o treino (Screen Wake Lock, quando suportado).

### 2.2 Fora do MVP

- Login, sincronização, backend, painel administrativo.
- Rede social, rankings, compartilhamento.
- Planos pagos e IA para gerar treinos.
- Integração com relógios, sensores e plataformas de saúde.
- Vídeos próprios (a biblioteca usa ilustração/imagem/texto).
- Notificações push.
- Exercícios personalizados criados pelo usuário.
- Metas diferentes por série.
- Edição de sessões finalizadas (só exclusão).
- Mesclagem de backups.
- Esforço percebido (RPE) e múltiplos tipos de recorde.
- Migração para IndexedDB (avaliar quando houver necessidade real).

---

## 3. Nível e equipamentos

### 3.1 Nível

Três valores: **iniciante**, **intermediário** e **avançado**. O nível é apenas uma preferência: define o filtro padrão da biblioteca e dos treinos prontos exibidos. O usuário pode usar qualquer exercício.

### 3.2 Equipamentos

Seleção múltipla: **Nenhum**, **Elástico**, **Corda de pular**, **Barra fixa**.

- Exercícios que exigem equipamento não selecionado ficam ocultos por padrão no seletor de exercícios.
- Existe a opção "Mostrar todos", que exibe esses exercícios com a indicação do equipamento necessário.
- A biblioteca (aba Exercícios) permite filtrar por equipamento livremente.

---

## 4. Navegação e telas

### 4.1 Estrutura

Navegação inferior com **4 abas**: **Hoje · Treinos · Exercícios · Progresso**.
Configurações ficam em um ícone no cabeçalho. Em telas largas, a navegação pode ser lateral, mantendo a mesma hierarquia.

### 4.2 Mapa de telas (13)

| # | Tela | Observação |
|---|---|---|
| 1 | Onboarding | 2 passos: equipamentos e nível |
| 2 | Hoje | Semana, treino do dia, meta, última sessão |
| 3 | Treinos (lista) | Inclui seção "Treinos prontos" |
| 4 | Editor de treino | Nome e lista de exercícios configuráveis |
| 5 | Seletor de exercícios | Modal/sheet reaproveitando a biblioteca |
| 6 | Exercícios (biblioteca) | Busca e filtros |
| 7 | Detalhe do exercício | Instruções, variações, recorde |
| 8 | Resumo pré-treino | Bottom sheet antes de iniciar |
| 9 | Execução | Variantes: série, descanso, exercício cronometrado |
| 10 | Resumo final | Concluída ou parcial |
| 11 | Progresso | Meta, frequência, evolução por exercício, histórico |
| 12 | Detalhe da sessão | Planejado vs realizado; excluir |
| 13 | Configurações | Preferências, backup, apagar dados |

### 4.3 Tela Hoje

- Faixa dos 7 dias da semana (segunda a domingo) com estado de cada dia: treino agendado, descanso, concluído.
- Toque em um dia para atribuir, trocar ou remover o treino.
- Treino do dia com botão principal **Iniciar** ou **Retomar** (quando há sessão em andamento).
- Progresso da meta semanal (ex.: "2 de 4 treinos").
- Última sessão realizada.
- Estado vazio com ação clara ("Escolha um treino pronto" / "Crie seu primeiro treino").
- Não exibir estatísticas sem dados.

### 4.4 Agenda (dentro da tela Hoje)

- Cada dia da semana pode ter **no máximo um treino** atribuído; o mesmo treino pode estar em vários dias.
- **Meta semanal = quantidade de dias com treino atribuído.** Não existe meta independente.
- A agenda é planejamento futuro: alterá-la não modifica o histórico.
- O usuário pode iniciar qualquer treino em qualquer dia; a sessão concluída conta para a semana corrente.
- A semana começa na **segunda-feira**, no horário local do dispositivo (constante de domínio).
- Se nenhum dia estiver agendado, exibir "Sem meta definida" com convite para agendar.

### 4.5 Lista de treinos

Cada item mostra: nome, quantidade de exercícios, duração estimada (identificada como aproximada "~"), dias em que está agendado e ações **Iniciar**, **Editar**, **Duplicar**, **Agendar** e **Excluir** (com confirmação).

A seção **Treinos prontos** lista os modelos da seção 5.6 filtrados pelo nível e equipamentos. Tocar em **Usar** copia o modelo para "Meus treinos".

### 4.6 Biblioteca de exercícios

- Busca por nome.
- Filtros: **equipamento** e **grupo muscular**. O nível é aplicado como filtro padrão removível.
- Detalhe do exercício: nome, medição, nível, grupos musculares, equipamento, instruções, dicas de segurança, variação mais fácil e mais difícil (quando existirem) e o **recorde pessoal** do usuário naquele exercício.

---

## 5. Treinos

### 5.1 Criar e salvar

- Nome obrigatório (até 60 caracteres).
- Lista ordenada de exercícios (até 30).
- Só é possível salvar com nome e **pelo menos 1 exercício**. Não existe rascunho.
- Alterações no editor são salvas automaticamente após confirmação de gravação.

### 5.2 Configuração de cada exercício

| Campo | Regra |
|---|---|
| Séries | Inteiro de 1 a 10 |
| Meta | Repetições (1–100) **ou** duração em segundos (5–600), conforme a medição do exercício |
| Descanso | Segundos entre séries e ao fim do exercício (0–600; 0 é permitido) |

A configuração é uniforme para todas as séries do exercício (ex.: 3 × 10, descanso 60 s).

### 5.3 Tipos de medição

- **Repetições** (flexão, agachamento).
- **Duração** (prancha, sustentações, corda de pular).

A interface mostra apenas o campo compatível com o tipo.

### 5.4 Operações

Renomear, duplicar (novo id, original preservado), reordenar, substituir exercício, remover exercício e excluir o treino (com confirmação).

Se um treino referenciar exercício que não existe mais no catálogo, ele aparece como "Exercício indisponível" e o treino não pode ser iniciado até que seja substituído ou removido.

### 5.5 Limites como constantes de domínio

Todos os limites numéricos desta especificação (séries, repetições, duração, descanso, tamanho de nome, exercícios por treino, início da semana) ficam em um único módulo de constantes, testado, e nunca repetidos em componentes.

### 5.6 Treinos prontos

Modelos estáticos versionados no código, copiados para o armazenamento local quando o usuário toca em **Usar**. Sugestão inicial (a validar com o catálogo final):

| Modelo | Nível | Equipamento | Foco |
|---|---|---|---|
| Full body iniciante | Iniciante | Nenhum | Agachamento, flexão inclinada, ponte de glúteos, prancha |
| Full body intermediário | Intermediário | Nenhum | Agachamento búlgaro, flexão, avanço, prancha lateral, core |
| Empurrar e puxar | Intermediário | Barra fixa | Flexões, barra, remada, dips/variações, core |
| Core e cardio com corda | Qualquer | Corda | Corda de pular em blocos, prancha, polichinelo, mountain climber |

Os modelos prontos são cópias independentes: editar a cópia não altera o modelo original.

---

## 6. Execução guiada

### 6.1 Resumo pré-treino

Bottom sheet com nome do treino, lista de exercícios com séries e metas, duração estimada (~) e botão **Começar**. Se houver **sugestão de progressão** (seção 8), ela aparece aqui.

Ao começar, cria-se uma sessão com **snapshot** do treino (nome, exercícios, metas, descansos).

### 6.2 Tela de execução

- Exercício atual com instruções resumidas.
- Série atual / total.
- Meta planejada e campo de resultado real (stepper com +/−), **pré-preenchido com a meta**.
- Botão principal **Concluir série**.
- Navegar para exercício anterior/seguinte e indicador de progresso da sessão.
- Cronômetro de descanso após cada série.
- Botão **Encerrar treino**.
- Áreas de toque grandes; sem gestos obrigatórios.

Pular uma série significa simplesmente avançar sem registrá-la.

### 6.3 Registro

Para cada série registra-se: valor planejado, valor realizado e horário. Uma série não registrada fica com valor realizado vazio. Uma série concluída pode ser ajustada antes de confirmar; o valor planejado nunca é assumido como realizado sem possibilidade de correção.

### 6.4 Cronômetros

Dois conceitos separados:

1. **Descanso:** contagem regressiva após a série/exercício. Ações: **Pular** e **+30 s**.
2. **Exercício por duração:** contagem regressiva com botão **Iniciar**; ao terminar, a série é marcada pronta para confirmar o resultado.

Regras técnicas:

- Calcular o tempo restante a partir de **timestamps** (`restEndsAt`, `exerciseEndsAt`), nunca por contagem incremental de `setInterval`.
- Recalcular ao voltar para a aba ou reabrir o app.
- Sinal sonoro e vibração em um único controle **Som e vibração** (ligado por padrão). Informar nas configurações que alertas podem não funcionar com o navegador em segundo plano.
- Manter a tela ligada durante a sessão via Screen Wake Lock, quando suportado (falha silenciosa se não for).

### 6.5 Interromper, retomar e encerrar

- A sessão em andamento é gravada a cada série registrada e a cada mudança de exercício/cronômetro, e **restaurada** ao reabrir o app (a tela Hoje mostra **Retomar**).
- Só existe uma sessão em andamento por vez.
- **Encerrar treino** oferece: **Salvar como parcial** (disponível se há pelo menos 1 série registrada) ou **Descartar** (com confirmação).
- Ao concluir a última série do último exercício, a sessão vai ao resumo final e é salva como **concluída** após confirmação.
- Sessões finalizadas **não são editadas**; podem ser excluídas.
- Duração total = horário de fim − horário de início (pausas não são descontadas).

### 6.6 Resumo final

Estado (concluída/parcial), duração, séries realizadas, planejado vs realizado por exercício, **recordes batidos** e campo opcional de nota da sessão.

---

## 7. Histórico e progresso

### 7.1 Estados da sessão

`in_progress` → `completed` | `partial`. Não há estado "abandonada" persistido (descartar remove a sessão em andamento).

### 7.2 Aba Progresso

Três blocos mais o histórico:

1. **Meta da semana:** concluídas vs dias agendados.
2. **Frequência:** barras com as sessões concluídas nas últimas 8 semanas.
3. **Evolução por exercício:** o usuário escolhe um exercício e vê o melhor valor de cada sessão ao longo do tempo, com o recorde em destaque.
4. **Histórico:** lista por data (agrupada por mês) com treino, estado, duração e séries; toque abre o detalhe; permite excluir.

Sem dados, mostrar uma explicação breve e a ação para iniciar o primeiro treino. Sem gráficos vazios e sem valores fictícios. Nunca somar grandezas incompatíveis (repetições com segundos).

### 7.3 Recorde pessoal

Definição única: **maior valor realizado em uma única série** de um exercício (repetições ou segundos), considerando séries registradas de sessões concluídas e parciais. Calculado a partir do histórico, sem armazenamento próprio, e comparado apenas entre registros do mesmo `exerciseId`.

---

## 8. Progressão

Regra única, transparente e opcional:

> Se, nas **2 últimas sessões** (concluídas ou parciais) em que o exercício apareceu em um treino, **todas as séries previstas foram registradas com valor realizado maior ou igual à meta**, sugerir **+1 repetição** (ou **+5 segundos**) na meta desse exercício no treino.

Comportamento:

- Sem dados suficientes: não sugerir nada.
- A sugestão aparece no resumo pré-treino, com o motivo ("Você bateu 3×10 nas duas últimas sessões") e ações **Aceitar**, **Editar** e **Ignorar**.
- **Aceitar** altera a meta no treino (não em sessões passadas). **Ignorar** guarda a data no item do treino e a regra só considera sessões posteriores.
- Nunca aumenta dificuldade automaticamente.
- Variações mais fáceis/difíceis ficam acessíveis no detalhe do exercício e durante a execução, mas não geram sugestões automáticas no MVP.

### 8.1 Segurança

- Incentivar execução controlada.
- Avisar que o usuário deve interromper o exercício em caso de dor ou desconforto relevante.
- Não oferecer diagnóstico, tratamento ou alegações médicas.

---

## 9. Persistência, backup e privacidade

### 9.1 Armazenamento

`localStorage` isolado em uma **camada de persistência** única (os componentes nunca acessam o armazenamento diretamente). Chaves sugeridas:

| Chave | Conteúdo |
|---|---|
| `calistenia:schemaVersion` | Número da versão do esquema (inicia em `1`) |
| `calistenia:preferences` | Preferências e agenda |
| `calistenia:workouts` | Treinos do usuário |
| `calistenia:sessions` | Sessões finalizadas |
| `calistenia:activeSession` | Sessão em andamento e estado dos cronômetros |

O catálogo de exercícios e os treinos prontos **não** são copiados para o armazenamento: vivem no código com ids estáveis.

### 9.2 Requisitos

- Gravar após alterações relevantes, sem gravar a cada atualização visual (autosave do editor com debounce de ~500 ms).
- Tratar exceções de leitura e gravação, detectar quota excedida e informar o usuário.
- **Nunca exibir sucesso antes de confirmar a gravação.**
- Validar os dados lidos em tempo de execução com um schema (ex.: Zod/Valibot).
- Se uma chave estiver corrompida, copiá-la bruta para `calistenia:corrupt:<chave>:<timestamp>`, abrir o app com estado vazio nesse domínio e exibir aviso com opção de exportar o dado bruto.
- Gravar `schemaVersion = 1`. O mecanismo de migração só é implementado quando existir a versão 2; até lá, rejeitar backups com versão maior que a suportada.

### 9.3 Backup JSON

**Exportar** gera um arquivo baixável com:

```json
{
  "app": "calistenia",
  "schemaVersion": 1,
  "exportedAt": "2026-10-20T12:00:00.000Z",
  "preferences": {},
  "workouts": [],
  "sessions": []
}
```

**Importar** (restauração por substituição):

1. Ler o arquivo.
2. Validar estrutura, versão e tipos.
3. Se inválido, rejeitar e preservar os dados atuais, com mensagem clara.
4. Se válido, pedir confirmação explicando que os dados atuais serão **substituídos**.
5. Gravar, confirmar a gravação e informar o resultado.

### 9.4 Apagar dados

Ação em Configurações com confirmação explícita, avisando que não pode ser desfeita sem backup.

### 9.5 Privacidade

- Nenhum dado pessoal exigido; nada enviado a servidores.
- Sem analytics de terceiros que transmitam dados pessoais.
- Nenhum segredo guardado no navegador.
- Informar que os dados são específicos do navegador e do dispositivo, e que limpar dados do site, usar navegação privada ou trocar de aparelho pode torná-los indisponíveis.

---

## 10. Dados

### 10.1 Catálogo de exercícios (estático)

Meta: **~40 exercícios** em PT-BR no lançamento, com a distribuição aproximada:

| Grupo | Qtde |
|---|---|
| Pernas e glúteos | 8 |
| Empurrar (peito, ombros, tríceps) | 9 |
| Puxar (costas, bíceps) | 7 |
| Core | 8 |
| Corpo todo / cardio (inclui corda) | 6 |
| Mobilidade / aquecimento | 2 |

Cada exercício possui:

| Campo | Observação |
|---|---|
| `id` | Slug estável e imutável (ex.: `flexao-padrao`) |
| `name` | Nome exibido |
| `measurementType` | `reps` ou `duration` |
| `level` | `beginner`, `intermediate` ou `advanced` |
| `muscleGroups` | Lista de grupos (principal primeiro) |
| `equipment` | Lista; vazia = só peso corporal |
| `instructions` | Passos curtos de execução |
| `safetyNote` | Dica de segurança, opcional |
| `easierId` / `harderId` | Ids de variação, opcionais |
| `deprecated` | Boolean; exercícios nunca são removidos, apenas marcados |

### 10.2 Preferências

```
schemaVersion
level: beginner | intermediate | advanced
equipment: string[]               // none | band | rope | bar
schedule: { mon?: workoutId, tue?: ..., ... sun?: ... }
soundEnabled: boolean
onboardingDone: boolean
```

A meta semanal é calculada a partir de `schedule`.

### 10.3 Treino

```
id, name, createdAt, updatedAt
items: [
  { id, exerciseId, sets, target, restSeconds, suggestionDismissedAt? }
]
```

`target` significa repetições ou segundos conforme o `measurementType` do exercício; a validação impede combinações incompatíveis. A ordem dos itens é a ordem do array.

### 10.4 Sessão

```
id, workoutId?, workoutName
status: in_progress | completed | partial
startedAt, endedAt?, note?
current: { exerciseIndex, setIndex, restEndsAt?, exerciseEndsAt? }   // só em in_progress
exercises: [
  {
    exerciseId, name, measurementType, restSeconds, plannedSets, target,
    sets: [ { number, plannedValue, actualValue | null, recordedAt | null } ]
  }
]
```

A sessão guarda nome e metas copiados no início; o histórico não depende de o treino ou o exercício ainda existirem.

### 10.5 Identificadores e datas

- Ids únicos para treinos, itens e sessões; nunca usar nomes ou índices de array como identidade.
- Datas em ISO 8601.
- Dias da semana e períodos calculados no horário local.

---

## 11. Interface, responsividade e acessibilidade

- Projetar primeiro para celular; sem rolagem horizontal; sem depender de hover.
- Contraste legível, rótulos associados aos campos, foco visível e operação por teclado quando aplicável.
- Estado nunca indicado apenas por cor.
- Respeitar a preferência por movimento reduzido.
- Controles de cronômetro acessíveis a tecnologias assistivas.
- Toda tela que carrega ou altera dados prevê: estado vazio, erro de validação, erro de persistência e confirmação para ações destrutivas.

---

## 12. PWA básico

- Manifesto válido e ícones (192 e 512 px, incluindo maskable).
- Service worker com pré-cache do shell, do catálogo e dos treinos prontos.
- Após o primeiro carregamento, o app abre e funciona completamente sem conexão.
- Quando houver nova versão, exibir um aviso "Nova versão disponível — Atualizar". A atualização não é aplicada durante uma sessão em andamento.
- Testar: fechar e reabrir offline, atualizar o app e restaurar uma sessão em andamento.

---

## 13. Requisitos não funcionais

- **Desempenho:** abertura rápida em celulares comuns; evitar bibliotecas pesadas; o cronômetro não deve causar re-renderizações desnecessárias.
- **Confiabilidade:** falha de leitura não impede a interface de abrir; importação inválida não destrói dados válidos; atualizações do catálogo não quebram históricos.
- **Compatibilidade:** versões atuais dos principais navegadores; testes específicos em Safari iOS e Chrome Android.
- **Manutenibilidade:** regras de domínio e validações centralizadas; componentes pequenos; schema de validação para dados persistidos; testes automatizados para as regras críticas (seção 14).

### 13.1 Testes obrigatórios (regras de domínio)

- Validação dos limites de treino e itens.
- Cálculo de meta semanal e semana corrente (início na segunda).
- Transições de estado da sessão.
- Cálculo de recorde e de evolução por exercício.
- Regra de progressão (inclusive "Ignorar").
- Cálculo do tempo restante por timestamp.
- Exportação/importação (válida, inválida e versão maior).

---

## 14. Critérios de aceite

### Configuração
- [ ] O app é usado sem login e abre sem dados prévios.
- [ ] O onboarding define equipamentos e nível, e eles persistem após recarregar.

### Biblioteca e treinos
- [ ] Busca por nome e filtros de equipamento e grupo muscular funcionam em conjunto.
- [ ] O usuário copia um treino pronto e o edita sem alterar o original.
- [ ] O usuário cria, renomeia, duplica, reordena e exclui treinos.
- [ ] Não é possível salvar treino sem nome ou sem exercício; valores inválidos são rejeitados.
- [ ] Exercício indisponível bloqueia o início do treino.

### Agenda
- [ ] O usuário atribui, troca e remove treino em qualquer dia da semana.
- [ ] A meta semanal reflete os dias agendados.
- [ ] Alterar a agenda não modifica o histórico.

### Execução
- [ ] O usuário inicia o treino, registra séries com valor diferente da meta e usa o descanso (pular e +30 s).
- [ ] Exercícios por duração têm contagem regressiva.
- [ ] Recarregar a página durante o treino restaura a sessão, inclusive o tempo restante correto.
- [ ] Encerrar permite salvar como parcial ou descartar.
- [ ] A tela permanece ligada durante a sessão nos navegadores compatíveis.

### Histórico e progresso
- [ ] Sessões concluídas e parciais aparecem no histórico.
- [ ] Editar ou excluir um treino não altera registros antigos.
- [ ] Indicadores usam apenas dados reais e há estados vazios claros.
- [ ] O recorde e a evolução por exercício estão corretos.
- [ ] A sugestão de progressão só aparece com 2 sessões que atendam a regra e pode ser aceita, editada ou ignorada.

### Persistência, backup e PWA
- [ ] Os dados são salvos automaticamente e erros de gravação são comunicados.
- [ ] A exportação gera um JSON válido; importação inválida é rejeitada sem apagar dados.
- [ ] A restauração exige confirmação e informa a substituição.
- [ ] Apagar todos os dados exige confirmação.
- [ ] O app é instalável e funciona offline após o primeiro carregamento.

### Responsividade e acessibilidade
- [ ] Fluxos principais funcionam em celular e desktop, sem rolagem horizontal indevida.
- [ ] Ações principais são acessíveis por toque e teclado; estados importantes não dependem só de cor.

---

## 15. Plano de implementação (fatias verticais)

### Fatia 1 — Treinar (núcleo)
- Estrutura do projeto, navegação, tokens e componentes base.
- Catálogo estático e treinos prontos.
- Persistência (camada, validação, `schemaVersion`) e constantes de domínio.
- Treinos: lista, editor e seletor de exercícios.
- Execução completa, cronômetros por timestamp, restauração de sessão e histórico simples.

**Resultado:** o usuário monta ou copia um treino, executa e vê o registro. Já dá para usar de verdade e validar a experiência.

### Fatia 2 — Semana e progresso
- Onboarding, tela Hoje com agenda e meta derivada.
- Aba Progresso (frequência, evolução, recorde) e detalhe da sessão.
- Regra de progressão.

**Resultado:** o ciclo completo configurar → montar → planejar → executar → acompanhar.

### Fatia 3 — Segurança e acabamento
- Exportar, importar e apagar dados.
- PWA básico, aviso de atualização e Wake Lock.
- Testes de dados inválidos, falha de armazenamento e restauração.
- Testes responsivos, de acessibilidade e em Safari iOS/Chrome Android.

**Resultado:** versão utilizável, recuperável, instalável e pronta para publicação.

---

## 16. Decisões de produto

- Treinos manuais e editáveis; modelos prontos como atalho, sem geração automática.
- Progressão com uma regra, opcional e explicável.
- Sem login, backend ou sincronização.
- `localStorage` atrás de uma camada de persistência; IndexedDB só quando houver necessidade.
- Catálogo local, versionado e com ids estáveis.
- Sessões com snapshot do treino e séries aninhadas.
- Meta semanal derivada da agenda.
- Backup em JSON com restauração por substituição.
- Sem edição de sessões finalizadas.
- PWA básico dentro do MVP; política de atualização sofisticada fica para depois.

---

## 17. Definição de pronto

O MVP está pronto quando todos os critérios de aceite forem atendidos, as regras da seção 13.1 tiverem testes, os dados forem preservados entre sessões e após atualização do app, o aplicativo for utilizável em celular e desktop, e o usuário conseguir completar o ciclo:

**configurar preferências → montar (ou copiar) treino → planejar a semana → executar sessão → registrar resultados → consultar progresso → exportar backup.**
