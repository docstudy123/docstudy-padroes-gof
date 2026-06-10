// ── Produto: interface Trophy ────────────────────────────────
export interface Trophy {
  type: string;
  title: string;
  description: string;
  iconEmoji: string;
  streakRequired: number;
  xpBonus: number;
  unlock(userId: string): void;
}

// ── Produto concreto 1: Troféu de 7 dias ────────────────────
export class StreakTrophy7 implements Trophy {
  type = "streak_7";
  title = "Primeira Semana";
  description = "Você estudou 7 dias consecutivos. Consistência é a chave!";
  iconEmoji = "🔥";
  streakRequired = 7;
  xpBonus = 50;

  unlock(userId: string): void {
    console.log(`[TrophyFactory] 🔥 Troféu "${this.title}" desbloqueado para usuário ${userId}`);
  }
}

// ── Produto concreto 2: Troféu de 30 dias ───────────────────
export class StreakTrophy30 implements Trophy {
  type = "streak_30";
  title = "Um Mês de Dedicação";
  description = "30 dias de estudo consecutivo. Você é imparável!";
  iconEmoji = "⭐";
  streakRequired = 30;
  xpBonus = 200;

  unlock(userId: string): void {
    console.log(`[TrophyFactory] ⭐ Troféu "${this.title}" desbloqueado para usuário ${userId}`);
  }
}

// ── Produto concreto 3: Troféu de 100 dias ──────────────────
export class StreakTrophy100 implements Trophy {
  type = "streak_100";
  title = "Centenário";
  description = "100 dias consecutivos. Você é um exemplo para todos os estudantes!";
  iconEmoji = "🏆";
  streakRequired = 100;
  xpBonus = 1000;

  unlock(userId: string): void {
    console.log(`[TrophyFactory] 🏆 Troféu "${this.title}" desbloqueado para usuário ${userId}`);
  }
}

// ── Creator abstrato ─────────────────────────────────────────
export abstract class TrophyCreator {
  abstract createTrophy(): Trophy;

  grantTrophy(userId: string): Trophy {
    const trophy = this.createTrophy();
    trophy.unlock(userId);
    return trophy;
  }
}

// ── Creator concreto 1 ───────────────────────────────────────
export class StreakTrophy7Creator extends TrophyCreator {
  createTrophy(): Trophy {
    return new StreakTrophy7();
  }
}

// ── Creator concreto 2 ───────────────────────────────────────
export class StreakTrophy30Creator extends TrophyCreator {
  createTrophy(): Trophy {
    return new StreakTrophy30();
  }
}

// ── Creator concreto 3 ───────────────────────────────────────
export class StreakTrophy100Creator extends TrophyCreator {
  createTrophy(): Trophy {
    return new StreakTrophy100();
  }
}

// ── TrophyFactory: ponto de entrada único ────────────────────
export class TrophyFactory {
  private static readonly creators: Map<number, TrophyCreator> = new Map([
    [7, new StreakTrophy7Creator()],
    [30, new StreakTrophy30Creator()],
    [100, new StreakTrophy100Creator()],
  ]);

  static forStreak(streak: number): TrophyCreator | null {
    return this.creators.get(streak) ?? null;
  }

  static createAndGrant(streak: number, userId: string): Trophy | null {
    const creator = this.forStreak(streak);
    if (!creator) return null;
    return creator.grantTrophy(userId);
  }
}
