# Docstudy — Padrões de Projeto GoF (Etapa 3)

Plataforma de estudos gamificada para médicos.  
Este repositório contém a **implementação funcional dos padrões GoF** aplicados ao domínio real do Docstudy.

---

## 📋 Sobre o Projeto

O **Docstudy** é uma plataforma de estudos gamificada inspirada no Duolingo, voltada para estudantes de medicina. O usuário percorre trilhas de questões por área médica, acumula XP, mantém streaks e sobe de nível com títulos da carreira médica (Acadêmico → Interno → Residente → Especialista → Chefe de Clínica → Attending).

**Stack do app principal:** React + TypeScript (Lovable), Supabase (PostgreSQL + Edge Functions), TanStack Router.

**Este módulo:** implementação isolada dos padrões GoF em TypeScript puro, sem dependências externas, para demonstração acadêmica (Etapa 3 — Arquitetura de Software).

---

## 🏗️ Arquitetura

O projeto adota o padrão **MVC em camadas**:

```
src/
├── types/          # Tipos compartilhados do domínio
│   └── index.ts
├── patterns/       # Implementação dos padrões GoF
│   ├── strategy.ts     # STRATEGY — cálculo de XP
│   ├── observer.ts     # OBSERVER — notificações reativas
│   └── factory.ts      # FACTORY METHOD — criação de troféus
├── engine/
│   └── XPEngine.ts     # Orquestrador — usa os 3 padrões
└── main.ts         # Demonstração dos 3 cenários
```

---

## 🎯 Padrões GoF Implementados

### 1. Strategy — Cálculo de XP por Tipo de Atividade

**Arquivo:** `src/patterns/strategy.ts`

**Problema:** O XP concedido varia conforme o tipo de atividade: questão respondida, missão concluída ou bônus de streak. Um único método com múltiplos `if/else` tornaria o `XPEngine` frágil e difícil de estender.

**Solução:** Interface `XPStrategy` com método `calculate(context)`. Cada tipo de atividade tem sua estratégia concreta:

| Estratégia | Atividade | XP |
|---|---|---|
| `QuestionXPStrategy` | Questão correta | Easy: 10 / Medium: 20 / Hard: 30 |
| `MissionXPStrategy` | Missão diária concluída | +25 XP por missão |
| `StreakBonusXPStrategy` | Streak mantida | +5 XP/dia |

**Vantagem:** adicionar novo tipo de pontuação = criar nova classe, sem tocar no `XPEngine`.

```typescript
// Uso no XPEngine
const strategy = getXPStrategy(context); // seleciona a estratégia correta
const xpEarned = strategy.calculate(context);
```

---

### 2. Observer — Notificações Reativas ao Conceder XP

**Arquivo:** `src/patterns/observer.ts`

**Problema:** Ao conceder XP, múltiplos módulos precisam reagir: o ranking precisa ser atualizado, as missões precisam verificar progresso, o streak precisa ser registrado e os troféus precisam ser verificados. Sem Observer, o `XPEngine` teria que chamar cada módulo diretamente, gerando alto acoplamento.

**Solução:** `XPEventBus` (Subject) publica o evento `XPGrantedEvent`. Cada módulo implementa `XPObserver` e se inscreve no bus:

| Observer | Responsabilidade |
|---|---|
| `StreakTrackerObserver` | Registra atividade do dia e atualiza streak |
| `MissionEngineObserver` | Verifica e marca missões diárias como concluídas |
| `RankingObserver` | Atualiza XP semanal na view materializada |
| `TrophyObserver` | Verifica marcos de streak para desbloqueio de troféus |

**Vantagem:** adicionar sistema de notificação push no futuro = criar novo Observer e registrar no `XPEngine`, sem tocar nos outros módulos.

```typescript
// No XPEngine — publicação do evento
this.eventBus.notify({ userId, amount, activityType, updatedProfile });
// Todos os observers são notificados automaticamente
```

**Conexão com o código real:** o `dashboardStore.ts` do Docstudy já implementa este padrão de forma simplificada:
```typescript
const listeners = new Set<() => void>();
export function subscribeDashboard(fn: () => void) { listeners.add(fn); ... }
```

---

### 3. Factory Method — Criação de Troféus por Marco de Streak

**Arquivo:** `src/patterns/factory.ts`

**Problema:** Troféus possuem tipos distintos (streak_7, streak_30, streak_100) com atributos diferentes (título, descrição, XP bônus, ícone). Instanciar troféus diretamente acopla a criação ao módulo que os usa e dificulta a extensão.

**Solução:** `TrophyCreator` (abstrato) define o Factory Method `createTrophy()`. Subclasses concretas decidem qual `Trophy` criar:

| Creator | Produto | Marco |
|---|---|---|
| `StreakTrophy7Creator` | `StreakTrophy7` | 7 dias 🔥 |
| `StreakTrophy30Creator` | `StreakTrophy30` | 30 dias ⭐ |
| `StreakTrophy100Creator` | `StreakTrophy100` | 100 dias 🏆 |

**Vantagem:** adicionar troféu de 365 dias = criar `StreakTrophy365` + `StreakTrophy365Creator` e registrar na `TrophyFactory`. Nenhum outro código muda.

```typescript
// Uso no XPEngine — sem conhecer a implementação do troféu
TrophyFactory.createAndGrant(updatedProfile.daily_streak, userId);
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 

### Instalação e execução

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/docstudy-patterns.git
cd docstudy-patterns

# Instale as dependências
npm install

# Execute a demonstração
npm start
```

### Saída esperada

```
═══════════════════════════════════════════════════
Cenário 1 — Questão difícil respondida corretamente
═══════════════════════════════════════════════════
[XPEngine] +30 XP → total: 510 XP
[StreakTracker] Usuário usr_diogo_001 — streak atual: 6 dias
[MissionEngine] Usuário usr_diogo_001 — progresso de missão atualizado
[Ranking] Usuário usr_diogo_001 ganhou +30 XP — novo total: 510 XP
→ Perfil após Cenário 1: XP=510, Nível=2

═══════════════════════════════════════════════════
Cenário 2 — Missão diária concluída
═══════════════════════════════════════════════════
[XPEngine] +25 XP → total: 535 XP
[MissionEngine] Usuário usr_diogo_001 — missão concluída: "Completou 1 lição"
[Ranking] Usuário usr_diogo_001 ganhou +25 XP — novo total: 535 XP
→ Perfil após Cenário 2: XP=535, Nível=2

═══════════════════════════════════════════════════
Cenário 3 — Bônus de streak + desbloqueio de troféu
═══════════════════════════════════════════════════
[XPEngine] +5 XP → total: 540 XP
[StreakTracker] Usuário usr_diogo_001 — streak atual: 7 dias
[TrophyModule] 🏆 Usuário usr_diogo_001 desbloqueou troféu de 7 dias de streak!
[TrophyFactory] 🔥 Troféu "Primeira Semana" desbloqueado para usuário usr_diogo_001
→ Perfil final: XP=540, Nível=2, Streak=7 dias

═══════════════════════════════════════════════════
Padrões GoF demonstrados:
  ✅ Strategy  — XP calculado por estratégia (questão, missão, streak)
  ✅ Observer  — Ranking, Streak, Missões e Troféus notificados automaticamente
  ✅ Factory   — Troféu de 7 dias criado pelo TrophyFactory sem acoplamento
═══════════════════════════════════════════════════
```

---

## 🔗 Rastreabilidade Arquitetura → Código

| Decisão Arquitetural (Etapa 2) | Implementação (Etapa 3) |
|---|---|
| XPEngine com Strategy para cálculo de XP | `src/patterns/strategy.ts` |
| Observer para desacoplar XP de Ranking/Missões | `src/patterns/observer.ts` |
| Factory Method para criação de troféus | `src/patterns/factory.ts` |
| XPEngine como orquestrador central | `src/engine/XPEngine.ts` |
| Tabela de níveis RF-04 (Acadêmico → Attending) | `XPEngine.calculateLevel()` |
| Missões diárias RF-06 (25q / 12 acertos / 1 lição) | `MissionEngineObserver` |
| Troféus RF-08 (marcos 7, 30, 100 dias) | `TrophyFactory` + `TrophyObserver` |

---

## 👤 Autor

**Diogo Limongi**  
Disciplina: Arquitetura de Software  
Goiânia/GO — 2026
