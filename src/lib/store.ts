"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type AllStats,
  freshStats,
  pickNextSubject,
  recordAnswer,
} from "./adaptive";
import type { Difficulty, Game, Subject } from "./schema";

interface ScrollLearnState {
  score: number;
  streak: number;
  bestStreak: number;
  stats: AllStats;
  seenIds: string[];
  queue: Game[]; // games ready to render
  answered: Record<string, boolean>; // gameId -> isCorrect (so re-renders don't lose state)
  lastSubject?: Subject;

  // actions
  enqueue: (games: Game[]) => void;
  popFromQueue: () => Game | undefined;
  recordAnswer: (game: Game, isCorrect: boolean) => void;
  reset: () => void;
}

const SEEN_LIMIT = 16;

export const useScrollLearn = create<ScrollLearnState>()(
  persist(
    (set, get) => ({
      score: 0,
      streak: 0,
      bestStreak: 0,
      stats: freshStats(),
      seenIds: [],
      queue: [],
      answered: {},
      lastSubject: undefined,

      enqueue: (games) =>
        set((s) => {
          const existingIds = new Set(s.queue.map((g) => g.id));
          const fresh = games.filter((g) => !existingIds.has(g.id));
          return { queue: [...s.queue, ...fresh] };
        }),

      popFromQueue: () => {
        const q = get().queue;
        if (q.length === 0) return undefined;
        const [first, ...rest] = q;
        set({ queue: rest });
        return first;
      },

      recordAnswer: (game, isCorrect) =>
        set((s) => {
          // Idempotent — don't double-count the same answer
          if (s.answered[game.id] !== undefined) return {};
          const newStreak = isCorrect ? s.streak + 1 : 0;
          return {
            score: s.score + (isCorrect ? 10 : 0),
            streak: newStreak,
            bestStreak: Math.max(s.bestStreak, newStreak),
            stats: recordAnswer(s.stats, game.subject, isCorrect),
            seenIds: [...s.seenIds, game.id].slice(-SEEN_LIMIT),
            answered: { ...s.answered, [game.id]: isCorrect },
            lastSubject: game.subject,
          };
        }),

      reset: () =>
        set({
          score: 0,
          streak: 0,
          bestStreak: 0,
          stats: freshStats(),
          seenIds: [],
          queue: [],
          answered: {},
          lastSubject: undefined,
        }),
    }),
    {
      name: "scrolllearn-state",
      // Only persist the non-derived bits. Queue is per-session.
      partialize: (s) => ({
        score: s.score,
        streak: s.streak,
        bestStreak: s.bestStreak,
        stats: s.stats,
        seenIds: s.seenIds,
        answered: s.answered,
        lastSubject: s.lastSubject,
      }),
    },
  ),
);

/** Pick the subject + difficulty for the *next* card to fetch. */
export function nextRequestParams(): { subject: Subject; difficulty: Difficulty; avoid: string[] } {
  const s = useScrollLearn.getState();
  const subject = pickNextSubject(s.stats, s.lastSubject);
  return {
    subject,
    difficulty: s.stats[subject].difficulty,
    avoid: s.seenIds,
  };
}
