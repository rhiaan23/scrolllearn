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

  // student identity (optional — only set after onboarding)
  studentId?: string;
  studentName?: string;
  classCode?: string;

  // actions
  enqueue: (games: Game[]) => void;
  popFromQueue: () => Game | undefined;
  recordAnswer: (game: Game, isCorrect: boolean) => void;
  setStudentInfo: (id: string, name: string, classCode: string) => void;
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
      studentId: undefined,
      studentName: undefined,
      classCode: undefined,

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

      recordAnswer: (game, isCorrect) => {
        const s = get();
        if (s.answered[game.id] !== undefined) return;
        const newStreak = isCorrect ? s.streak + 1 : 0;
        const newScore = s.score + (isCorrect ? 10 : 0);
        const newBestStreak = Math.max(s.bestStreak, newStreak);
        set({
          score: newScore,
          streak: newStreak,
          bestStreak: newBestStreak,
          stats: recordAnswer(s.stats, game.subject, isCorrect),
          seenIds: [...s.seenIds, game.id].slice(-SEEN_LIMIT),
          answered: { ...s.answered, [game.id]: isCorrect },
          lastSubject: game.subject,
        });
        if (s.classCode && s.studentId) {
          fetch("/api/class/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: s.studentId,
              classCode: s.classCode,
              gameId: game.id,
              prompt: game.prompt,
              subject: game.subject,
              difficulty: game.difficulty,
              isCorrect,
              score: newScore,
              streak: newStreak,
              bestStreak: newBestStreak,
            }),
          }).catch(() => {});
        }
      },

      setStudentInfo: (id, name, classCode) =>
        set({ studentId: id, studentName: name, classCode }),

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
        studentId: s.studentId,
        studentName: s.studentName,
        classCode: s.classCode,
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
