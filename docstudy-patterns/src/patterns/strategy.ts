// ============================================================
// Padrão GoF: STRATEGY
// Problema resolvido: O XP concedido varia por tipo de atividade
// (questão, missão, streak). Sem Strategy, um único método com
// vários if/else tornaria o XPEngine frágil e difícil de estender.
//
// Referência: https://refactoring.guru/design-patterns/strategy
// ============================================================

import type { XPContext } from "../types/index.js";

// ── Interface da Estratégia ──────────────────────────────────
export interface XPStrategy {
  calculate(context: XPContext): number;
}

// ── Estratégia 1: Questão respondida ────────────────────────
// Replica exatamente a lógica de xpForDifficulty() em lesson.$lessonId.tsx
export class QuestionXPStrategy implements XPStrategy {
  calculate(context: XPContext): number {
    if (!context.isCorrect) return 0;

    const d = (context.difficulty ?? "easy").toLowerCase();
    if (d === "hard") return 30;
    if (d === "medium") return 20;
    return 10; // easy (default)
  }
}

// ── Estratégia 2: Missão diária concluída ───────────────────
// Cada missão concede XP extra ao ser completada (vide result.tsx)
export class MissionXPStrategy implements XPStrategy {
  private readonly XP_PER_MISSION = 25;
  private readonly BONUS_ALL_MISSIONS = 50; // bonus_just_claimed

  calculate(context: XPContext): number {
    if (context.missionKey === undefined) return 0;
    // Se vier com flag de bônus (todas as missões concluídas), soma bônus
    return this.XP_PER_MISSION + (context.activityType === "mission" ? 0 : this.BONUS_ALL_MISSIONS);
  }
}

// ── Estratégia 3: Bônus de streak ───────────────────────────
// Streak mantida concede XP extra por dia consecutivo
export class StreakBonusXPStrategy implements XPStrategy {
  private readonly BASE_BONUS = 5;

  calculate(context: XPContext): number {
    // Bônus fixo por dia de streak mantida
    return this.BASE_BONUS;
  }
}

// ── Factory de estratégias (utilitário) ─────────────────────
export function getXPStrategy(context: XPContext): XPStrategy {
  switch (context.activityType) {
    case "question":
      return new QuestionXPStrategy();
    case "mission":
      return new MissionXPStrategy();
    case "streak_bonus":
      return new StreakBonusXPStrategy();
  }
}
