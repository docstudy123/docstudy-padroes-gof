// ============================================================
// Docstudy — Tipos compartilhados
// ============================================================

export type Difficulty = "easy" | "medium" | "hard";

export type MissionKey =
  | "questions_answered"
  | "questions_correct"
  | "lessons_completed";

export interface UserProfile {
  id: string;
  nome_exibicao: string;
  xp_total: number;
  level: number;
  daily_streak: number;
}

export interface Question {
  id: string;
  difficulty: Difficulty;
  is_correct: boolean;
}

export interface LessonResult {
  xp_earned: number;
  accuracy: number;
  new_streak: number;
  missions_newly_completed: MissionKey[];
  bonus_just_claimed: boolean;
}

export interface XPContext {
  userId: string;
  activityType: "question" | "mission" | "streak_bonus";
  difficulty?: Difficulty;
  isCorrect?: boolean;
  missionKey?: MissionKey;
}
