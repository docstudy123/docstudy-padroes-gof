// ============================================================
// Padrão GoF: FACTORY METHOD
// Problema resolvido: Troféus possuem tipos distintos (streak_7,
// streak_30, streak_100) com atributos diferentes. Instanciar
// diretamente acopla a criação ao uso e dificulta extensão.
//
// Referência: https://refactoring.guru/design-patterns/factory-method
// ============================================================

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

// ── Produtos concretos ───────────────────────────────────────

export class StreakTrophy7 implements Trophy {
  type = "streak_7";
  title = "Primeira Semana";
  description = "Você estudou 7 dias consecutivos. Consistência é a chave!";
  iconEmoji = "🔥";
  streakRequired = 7;
  xpBonus = 50;

  unlock(userId: string): void {
    console.log(`[TrophyFactory] 🔥 Troféu "${this.title}" desbloqueado para usuário ${userId}`);
    // Em produção: INSERT INTO user_trophies (user_id, trophy_type, unlocked_at)
  }
}

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
  // Factory Method — cada subclasse decide qual Trophy criar
  abstract createTrophy(): Trophy;

  // Método de template: cria e desbloqueia
  grantTrophy(userId: string): Trophy {
    const trophy = this.createTrophy();
    trophy.unlock(userId);
    return trophy;
  }
}

// ── Creators concretos ───────────────────────────────────────
export class StreakTrophy7Creator extends TrophyCreator {
  createTrophy(): Trophy {
    return new StreakTrophy7();
  }
}

export class StreakTrophy30Creator extends TrophyCreator {
  createTrophy(): Trophy {
    return new StreakTrophy30();
  }
}

export class StreakTrophy100Creator extends TrophyCreator {
  createTrophy(): Trophy {
    return new StreakTrophy100();
  }
}

// ── TrophyFactory: ponto de entrada único ────────────────────
// Encapsula a seleção do creator com base no streak atual
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
