import { UserState } from "./questionEngine";

export interface EvaluationResult {
  score: number;
  difficulty: "easier" | "same" | "harder";
  followUpQuestion?: string;
  skillCategory: string;
}

export interface ScoreReport {
  scores: Record<string, number>;
  averageScore: number;
  strongestSkill: string | null;
  weakestSkill: string | null;
  overallLevel: "beginner" | "intermediate" | "advanced" | "expert";
}

export function updateScore(
  state: UserState,
  skillCategory: string,
  result: EvaluationResult
): UserState {
  const existing = state.scores[skillCategory] ?? 0;
  const count = Object.keys(state.scores).filter((k) => k === skillCategory).length;
  const averaged = count > 0 ? (existing + result.score) / 2 : result.score;

  return {
    ...state,
    scores: {
      ...state.scores,
      [skillCategory]: Math.round(averaged * 10) / 10,
    },
  };
}

export function generateScoreReport(state: UserState): ScoreReport {
  const scores = state.scores;
  const entries = Object.entries(scores);

  if (entries.length === 0) {
    return {
      scores,
      averageScore: 0,
      strongestSkill: null,
      weakestSkill: null,
      overallLevel: "beginner",
    };
  }

  const avg = entries.reduce((sum, [, v]) => sum + v, 0) / entries.length;
  const sorted = [...entries].sort(([, a], [, b]) => b - a);

  const overallLevel =
    avg >= 8 ? "expert" : avg >= 6 ? "advanced" : avg >= 4 ? "intermediate" : "beginner";

  return {
    scores,
    averageScore: Math.round(avg * 10) / 10,
    strongestSkill: sorted[0]?.[0] ?? null,
    weakestSkill: sorted[sorted.length - 1]?.[0] ?? null,
    overallLevel,
  };
}

export function getSkillBadgeColor(score: number): string {
  if (score >= 8) return "text-green-400 border-green-500/30 bg-green-500/10";
  if (score >= 6) return "text-blue-400 border-blue-500/30 bg-blue-500/10";
  if (score >= 4) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
  return "text-red-400 border-red-500/30 bg-red-500/10";
}
