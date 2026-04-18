import { type Difficulty, type Subject, SUBJECTS } from "./schema";

export interface SubjectStats {
  correct: number;
  total: number;
  difficulty: Difficulty;
  recent: boolean[]; // last 5 answers, true = correct
}

export type AllStats = Record<Subject, SubjectStats>;

export function freshStats(): AllStats {
  return {
    math: { correct: 0, total: 0, difficulty: 1, recent: [] },
    english: { correct: 0, total: 0, difficulty: 1, recent: [] },
    science: { correct: 0, total: 0, difficulty: 1, recent: [] },
  };
}

const MAX_RECENT = 5;

/**
 * Pure update: returns a new stats object with the answer recorded and
 * difficulty potentially adjusted.
 */
export function recordAnswer(
  stats: AllStats,
  subject: Subject,
  isCorrect: boolean,
): AllStats {
  const prev = stats[subject];
  const recent = [...prev.recent, isCorrect].slice(-MAX_RECENT);

  let difficulty = prev.difficulty;
  // Bump up: 3+ in a row correct
  const last3 = recent.slice(-3);
  if (last3.length === 3 && last3.every((x) => x)) {
    difficulty = Math.min(3, difficulty + 1) as Difficulty;
  }
  // Drop down: 2+ in a row wrong
  const last2 = recent.slice(-2);
  if (last2.length === 2 && last2.every((x) => !x)) {
    difficulty = Math.max(1, difficulty - 1) as Difficulty;
  }

  return {
    ...stats,
    [subject]: {
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      difficulty,
      recent,
    },
  };
}

/**
 * Choose the subject for the next card.
 * 60% bias toward the weakest subject (lowest accuracy with min 3 attempts);
 * 40% rotation among all subjects.
 */
export function pickNextSubject(stats: AllStats, lastSubject?: Subject): Subject {
  const candidates = SUBJECTS.filter((s) => s !== lastSubject);
  const choices = candidates.length > 0 ? candidates : [...SUBJECTS];

  if (Math.random() < 0.6) {
    const tried = choices.filter((s) => stats[s].total >= 3);
    if (tried.length > 0) {
      const weakest = tried.reduce((a, b) =>
        stats[a].correct / stats[a].total <= stats[b].correct / stats[b].total
          ? a
          : b,
      );
      return weakest;
    }
  }
  return choices[Math.floor(Math.random() * choices.length)];
}

/**
 * If the student is struggling on this subject (last 2 wrong), surface
 * the explanation right after they answer.
 */
export function shouldShowExplanationForSubject(
  stats: AllStats,
  subject: Subject,
): boolean {
  const recent = stats[subject].recent.slice(-2);
  return recent.length === 2 && recent.every((x) => !x);
}
