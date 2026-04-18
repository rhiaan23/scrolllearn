"use client";

import { useState } from "react";
import {
  type Game,
  SUBJECT_COLORS,
  SUBJECT_EMOJI,
} from "@/lib/schema";
import { useScrollLearn } from "@/lib/store";
import { MultipleChoice } from "./games/MultipleChoice";
import { Match } from "./games/Match";
import { FillBlank } from "./games/FillBlank";
import { Sort } from "./games/Sort";

interface Props {
  game: Game;
  index: number;
  onAdvance?: () => void;
}

export function GameCard({ game, index, onAdvance }: Props) {
  const colors = SUBJECT_COLORS[game.subject];
  const recordAnswer = useScrollLearn((s) => s.recordAnswer);
  const previously = useScrollLearn((s) => s.answered[game.id]);

  const [result, setResult] = useState<{ correct: boolean; description: string } | null>(
    previously === undefined
      ? null
      : { correct: previously, description: "(previously answered)" },
  );
  const [showExplanation, setShowExplanation] = useState(false);

  function handleAnswer(isCorrect: boolean, description: string) {
    setResult({ correct: isCorrect, description });
    recordAnswer(game, isCorrect);
    if (!isCorrect) setShowExplanation(true);
    // Auto-advance after a beat to keep the feed flowing
    if (onAdvance) {
      setTimeout(() => onAdvance(), isCorrect ? 1100 : 2400);
    }
  }

  const locked = result !== null;

  let body: React.ReactNode;
  switch (game.template) {
    case "multiple_choice":
      body = <MultipleChoice game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "match":
      body = <Match game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "fill_blank":
      body = <FillBlank game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "sort":
      body = <Sort game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
  }

  return (
    <section
      className={`relative h-screen w-full snap-start snap-always bg-gradient-to-br ${colors.bg} flex items-center justify-center overflow-hidden`}
      aria-label={`Game ${index + 1}: ${game.subject}`}
    >
      {/* Decorative bubbles */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-5 px-6 pb-24 pt-24">
        {/* Subject badge */}
        <div className="flex items-center gap-2 self-start rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-xl">{SUBJECT_EMOJI[game.subject]}</span>
          <span className="text-sm font-bold uppercase tracking-wider text-white">
            {game.subject}
          </span>
          <span className="text-xs font-medium text-white/70">
            · level {game.difficulty}
          </span>
        </div>

        {/* Prompt */}
        <h2 className="text-3xl font-bold leading-tight text-white drop-shadow-md">
          {game.prompt}
        </h2>

        {/* Game body */}
        <div className="mt-2">{body}</div>

        {/* Result banner + explanation */}
        {result && (
          <div
            className={`mt-2 rounded-2xl border-2 p-4 backdrop-blur-sm transition-all ${
              result.correct
                ? "border-green-200 bg-green-400/30 text-white"
                : "border-red-200 bg-red-400/30 text-white"
            }`}
          >
            <div className="flex items-center gap-2 text-lg font-bold">
              {result.correct ? "✨ Correct!" : "🤔 Not quite"}
            </div>
            {(showExplanation || result.correct) && (
              <p className="mt-1.5 text-sm leading-snug opacity-95">{game.explanation}</p>
            )}
            {onAdvance && (
              <button
                type="button"
                onClick={onAdvance}
                className="mt-3 w-full rounded-xl bg-white/20 py-2 text-sm font-bold text-white hover:bg-white/30"
              >
                Next →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Swipe-up hint at the very bottom */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-medium text-white/60">
        ↓ swipe ↓
      </div>
    </section>
  );
}
