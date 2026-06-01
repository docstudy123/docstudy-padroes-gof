// ============================================================
// XPEngine — Motor central de pontuação do Docstudy
//
// Orquestra os 3 padrões GoF:
//   1. STRATEGY  → delega o cálculo de XP à estratégia correta
//   2. OBSERVER  → notifica todos os módulos após conceder XP
//   3. FACTORY   → delega criação de troféus ao TrophyFactory
//
// Corresponde à Edge Function "complete-lesson" do Docstudy real.
// ============================================================

import type { XPContext, UserProfile } from "../types/index.js";
import { getXPStrategy } from "../patterns/strategy.js";
import {
  XPEventBus,
  StreakTrackerObserver,
  MissionEngineObserver,
  RankingObserver,
  TrophyObserver,
} from "../patterns/observer.js";
import { TrophyFactory } from "../patterns/factory.js";

export class XPEngine {
  private eventBus: XPEventBus;

  constructor() {
    this.eventBus = new XPEventBus();

    // Registra todos os observers — adicionar novos é O(1), sem tocar no engine
    this.eventBus.subscribe(new StreakTrackerObserver());
    this.eventBus.subscribe(new MissionEngineObserver());
    this.eventBus.subscribe(new RankingObserver());
    this.eventBus.subscribe(new TrophyObserver());
  }

  /**
   * Concede XP ao usuário conforme o contexto da atividade.
   * Retorna o perfil atualizado com o novo XP e nível.
   */
  grant(profile: UserProfile, context: XPContext): UserProfile {
    // 1. STRATEGY — calcula o XP usando a estratégia correta para o contexto
    const strategy = getXPStrategy(context);
    const xpEarned = strategy.calculate(context);

    if (xpEarned === 0) {
      console.log(`[XPEngine] Nenhum XP concedido (resposta errada ou contexto inválido)`);
      return profile;
    }

    // 2. Atualiza o perfil em memória (em produção: UPDATE profiles SET xp_total = ...)
    const updatedProfile: UserProfile = {
      ...profile,
      xp_total: profile.xp_total + xpEarned,
      level: this.calculateLevel(profile.xp_total + xpEarned),
    };

    console.log(`[XPEngine] +${xpEarned} XP → total: ${updatedProfile.xp_total} XP`);

    // 3. OBSERVER — publica evento para todos os módulos inscritos
    this.eventBus.notify({
      userId: context.userId,
      amount: xpEarned,
      activityType: context.activityType,
      missionKey: context.missionKey,
      updatedProfile,
    });

    // 4. FACTORY — verifica troféus de streak após notificar observers
    const trophyMilestones = [7, 30, 100];
    if (trophyMilestones.includes(updatedProfile.daily_streak)) {
      TrophyFactory.createAndGrant(updatedProfile.daily_streak, context.userId);
    }

    return updatedProfile;
  }

  /**
   * Calcula o nível com base no XP total.
   * Espelha a tabela de níveis de RF-04 da especificação.
   */
  private calculateLevel(xp: number): number {
    if (xp >= 9001) return 6; // Attending
    if (xp >= 5001) return 5; // Chefe de Clínica
    if (xp >= 2501) return 4; // Especialista
    if (xp >= 1201) return 3; // Residente
    if (xp >= 501)  return 2; // Interno
    return 1;                 // Acadêmico
  }
}
