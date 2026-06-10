import type { XPContext } from "../types/index.js";

// ── Interface da Estratégia ──────────────────────────────────
export interface XPStrategy {
  calculate(context: XPContext): number;
}

// ── Estratégia 1: Questão respondida ────────────────────────
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
export class MissionXPStrategy implements XPStrategy {
  private readonly XP_PER_MISSION = 25;
  private readonly BONUS_ALL_MISSIONS = 50;

  calculate(context: XPContext): number {
    if (context.missionKey === undefined) return 0;
    return this.XP_PER_MISSION + (context.activityType === "mission" ? 0 : this.BONUS_ALL_MISSIONS);
  }
}

// ── Estratégia 3: Bônus de streak ───────────────────────────
export class StreakBonusXPStrategy implements XPStrategy {
  private readonly BASE_BONUS = 5;

  calculate(context: XPContext): number {
    return this.BASE_BONUS;
  }
}

// ── Seletor de estratégia ────────────────────────────────────
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
