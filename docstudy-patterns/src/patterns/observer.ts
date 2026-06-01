// ============================================================
// Padrão GoF: OBSERVER
// Problema resolvido: Ao conceder XP, múltiplos módulos precisam
// reagir (ranking, missões, streak, troféus). Sem Observer, o
// XPEngine precisaria chamar cada módulo diretamente → alto acoplamento.
//
// No Docstudy real, o dashboardStore.ts já esboça este padrão:
//   const listeners = new Set<() => void>();
//   export function subscribeDashboard(fn) { listeners.add(fn); ... }
// Aqui formalizamos com tipagem e eventos de domínio.
//
// Referência: https://refactoring.guru/design-patterns/observer
// ============================================================

import type { MissionKey, UserProfile } from "../types/index.js";

// ── Evento publicado pelo XPEngine ──────────────────────────
export interface XPGrantedEvent {
  userId: string;
  amount: number;
  activityType: "question" | "mission" | "streak_bonus";
  missionKey?: MissionKey;
  updatedProfile: UserProfile;
}

// ── Interface do Observer (Subscriber) ──────────────────────
export interface XPObserver {
  onXPGranted(event: XPGrantedEvent): void;
}

// ── Subject (Publisher): gerencia inscrições e notificações ─
export class XPEventBus {
  private observers: Set<XPObserver> = new Set();

  subscribe(observer: XPObserver): void {
    this.observers.add(observer);
  }

  unsubscribe(observer: XPObserver): void {
    this.observers.delete(observer);
  }

  notify(event: XPGrantedEvent): void {
    this.observers.forEach((obs) => obs.onXPGranted(event));
  }
}

// ── Observer 1: StreakTracker ────────────────────────────────
// Atualiza o streak do usuário ao receber XP por qualquer atividade
export class StreakTrackerObserver implements XPObserver {
  onXPGranted(event: XPGrantedEvent): void {
    const { userId, updatedProfile } = event;
    console.log(
      `[StreakTracker] Usuário ${userId} — streak atual: ${updatedProfile.daily_streak} dias`
    );
    // Em produção: chamaria a Edge Function ou o Supabase
    // para registrar a atividade do dia e incrementar/manter o streak.
  }
}

// ── Observer 2: MissionEngine ────────────────────────────────
// Verifica se alguma missão diária foi concluída com este XP
// Espelha a lógica de missions_newly_completed do complete-lesson Edge Function
export class MissionEngineObserver implements XPObserver {
  private readonly MISSION_LABELS: Record<MissionKey, string> = {
    questions_answered: "Respondeu 25 questões",
    questions_correct: "Acertou 12 questões",
    lessons_completed: "Completou 1 lição",
  };

  onXPGranted(event: XPGrantedEvent): void {
    const { userId, activityType, missionKey } = event;

    if (activityType === "mission" && missionKey) {
      const label = this.MISSION_LABELS[missionKey];
      console.log(`[MissionEngine] Usuário ${userId} — missão concluída: "${label}"`);
      // Em produção: UPDATE daily_missions SET ... WHERE user_id = userId
    } else {
      console.log(`[MissionEngine] Usuário ${userId} — progresso de missão atualizado`);
    }
  }
}

// ── Observer 3: RankingModule ────────────────────────────────
// Atualiza a posição do usuário no ranking semanal
// Corresponde à view materializada weekly_ranking definida na arquitetura
export class RankingObserver implements XPObserver {
  onXPGranted(event: XPGrantedEvent): void {
    const { userId, amount, updatedProfile } = event;
    console.log(
      `[Ranking] Usuário ${userId} ganhou +${amount} XP — novo total: ${updatedProfile.xp_total} XP`
    );
    // Em produção: REFRESH MATERIALIZED VIEW weekly_ranking
    // ou UPDATE weekly_xp SET xp_week = xp_week + amount WHERE user_id = userId
  }
}

// ── Observer 4: TrophyModule ─────────────────────────────────
// Verifica se algum troféu de streak deve ser desbloqueado
// Marcos: 7, 30 e 100 dias (conforme RF-08 da especificação)
export class TrophyObserver implements XPObserver {
  private readonly STREAK_MILESTONES = [7, 30, 100];

  onXPGranted(event: XPGrantedEvent): void {
    const { userId, updatedProfile } = event;
    const streak = updatedProfile.daily_streak;

    if (this.STREAK_MILESTONES.includes(streak)) {
      console.log(
        `[TrophyModule] 🏆 Usuário ${userId} desbloqueou troféu de ${streak} dias de streak!`
      );
      // Em produção: INSERT INTO user_trophies (user_id, trophy_type) ...
    }
  }
}
