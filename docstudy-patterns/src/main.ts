// ============================================================
// main.ts — Demonstração dos 3 padrões GoF aplicados ao Docstudy
//
// Executa 3 cenários reais do app:
//   Cenário 1: Usuário responde questão difícil corretamente
//   Cenário 2: Usuário conclui missão diária
//   Cenário 3: Usuário atinge 7 dias de streak (desbloqueia troféu)
// ============================================================

import { XPEngine } from "./engine/XPEngine.js";
import type { UserProfile } from "./types/index.js";

// ── Perfil inicial simulado (como viria do Supabase) ─────────
let profile: UserProfile = {
  id: "usr_diogo_001",
  nome_exibicao: "Diogo",
  xp_total: 480,    // Próximo de subir de nível (Acadêmico → Interno em 501 XP)
  level: 1,
  daily_streak: 6,  // Um dia antes de atingir o troféu de 7 dias
};

const engine = new XPEngine();

// ── Cenário 1: Questão difícil respondida corretamente ───────
console.log("\n═══════════════════════════════════════════════════");
console.log("Cenário 1 — Questão difícil respondida corretamente");
console.log("═══════════════════════════════════════════════════");

profile = engine.grant(profile, {
  userId: profile.id,
  activityType: "question",
  difficulty: "hard",
  isCorrect: true,
});

console.log(`→ Perfil após Cenário 1: XP=${profile.xp_total}, Nível=${profile.level}\n`);

// ── Cenário 2: Missão diária concluída ───────────────────────
console.log("═══════════════════════════════════════════════════");
console.log("Cenário 2 — Missão diária concluída");
console.log("═══════════════════════════════════════════════════");

profile = engine.grant(profile, {
  userId: profile.id,
  activityType: "mission",
  missionKey: "lessons_completed",
  isCorrect: true,
});

console.log(`→ Perfil após Cenário 2: XP=${profile.xp_total}, Nível=${profile.level}\n`);

// ── Cenário 3: Streak de 7 dias — desbloqueia troféu ────────
console.log("═══════════════════════════════════════════════════");
console.log("Cenário 3 — Bônus de streak + desbloqueio de troféu");
console.log("═══════════════════════════════════════════════════");

// Simula o 7º dia consecutivo de estudo
profile = { ...profile, daily_streak: 7 };

profile = engine.grant(profile, {
  userId: profile.id,
  activityType: "streak_bonus",
  isCorrect: true,
});

console.log(`→ Perfil final: XP=${profile.xp_total}, Nível=${profile.level}, Streak=${profile.daily_streak} dias\n`);

// ── Resumo ───────────────────────────────────────────────────
console.log("═══════════════════════════════════════════════════");
console.log("Padrões GoF demonstrados:");
console.log("  ✅ Strategy  — XP calculado por estratégia (questão, missão, streak)");
console.log("  ✅ Observer  — Ranking, Streak, Missões e Troféus notificados automaticamente");
console.log("  ✅ Factory   — Troféu de 7 dias criado pelo TrophyFactory sem acoplamento");
console.log("═══════════════════════════════════════════════════\n");
