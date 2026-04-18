"use client";

import { useRef, useState } from "react";
import {
  type Game,
  SUBJECT_COLORS,
  SUBJECT_EMOJI,
} from "@/lib/schema";
import { useScrollLearn } from "@/lib/store";
import { ActionRail } from "./ActionRail";
import { MergeMath } from "./games/MergeMath";
import { WordBuilder } from "./games/WordBuilder";
import { QuickSort } from "./games/QuickSort";
import { SequenceOrder } from "./games/SequenceOrder";

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
    previously === undefined ? null : { correct: previously, description: "(previously played)" },
  );
  const [captionOpen, setCaptionOpen] = useState(false);
  const advancedRef = useRef(false);

  function handleAnswer(isCorrect: boolean, description: string) {
    if (advancedRef.current) return;
    setResult({ correct: isCorrect, description });
    recordAnswer(game, isCorrect);
    if (onAdvance) {
      advancedRef.current = true;
      setTimeout(() => onAdvance(), isCorrect ? 1400 : 2200);
    }
  }

  const locked = result !== null;

  let body: React.ReactNode;
  switch (game.template) {
    case "merge_math":
      body = <MergeMath game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "word_builder":
      body = <WordBuilder game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "quick_sort":
      body = <QuickSort game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "sequence_order":
      body = <SequenceOrder game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
  }

  return (
    <section
      className="relative flex h-screen w-full snap-start snap-always items-center justify-center bg-black"
      aria-label={`Game ${index + 1}: ${game.subject}`}
    >
      {/* Phone-frame card */}
      <div
        className={`relative h-screen w-full max-w-[440px] overflow-hidden bg-gradient-to-br ${colors.bg} md:my-4 md:h-[calc(100vh-2rem)] md:rounded-3xl md:shadow-[0_0_60px_rgba(0,0,0,0.5)]`}
      >
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />

        {/* Top-left: mute icon (decorative) */}
        <div className="absolute left-3 top-3 z-30 flex items-center gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
            aria-label="mute"
          >
            🔇
          </button>
        </div>

        {/* Top-right: subject + level pill */}
        <div className="absolute right-3 top-3 z-30">
          <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            <span className="text-base">{SUBJECT_EMOJI[game.subject]}</span>
            <span>{game.subject}</span>
            <span className="text-white/70">· lv {game.difficulty}</span>
          </div>
        </div>

        {/* Action rail (right side, vertically positioned to clear caption) */}
        <ActionRail
          subject={game.subject}
          onExplain={() => setCaptionOpen((v) => !v)}
          onSkip={onAdvance}
        />

        {/* Game body — vertically centered with room for top pill + bottom caption */}
        <div className="absolute inset-x-0 top-16 bottom-32 z-10 flex items-center justify-center px-5">
          <div className="w-full max-w-[380px]">{body}</div>
        </div>

        {/* Bottom caption: handle + prompt + (toggle) explanation */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-6 pr-20 text-white">
          <div className="text-sm font-bold drop-shadow">@{colors.handle}</div>
          <p className="mt-1 text-sm leading-snug drop-shadow">
            {game.prompt}{" "}
            <button
              type="button"
              onClick={() => setCaptionOpen((v) => !v)}
              className="font-semibold text-white/80 underline-offset-2 hover:underline"
            >
              {captionOpen ? "less" : "more"}
            </button>
          </p>
          {captionOpen && (
            <p className="mt-1 text-xs leading-snug text-white/85 drop-shadow">
              {game.explanation}
            </p>
          )}
        </div>

        {/* Result toast */}
        {result && (
          <div
            className={`absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 px-5 py-3 text-center backdrop-blur-md ${
              result.correct
                ? "border-green-200 bg-green-400/40 text-white"
                : "border-red-200 bg-red-400/40 text-white"
            } animate-[pop_0.4s_ease-out]`}
          >
            <div className="text-2xl font-black">
              {result.correct ? "✨ Nice!" : "🤔 Try again"}
            </div>
            <div className="mt-0.5 text-xs opacity-90">{result.description}</div>
          </div>
        )}

        {/* Swipe hint */}
        <div className="pointer-events-none absolute bottom-1 left-1/2 z-30 -translate-x-1/2 text-[10px] font-medium text-white/50">
          ↓ swipe ↓
        </div>
      </div>
    </section>
  );
}
