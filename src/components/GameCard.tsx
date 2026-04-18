"use client";

import { useRef, useState } from "react";
import { type Game, SUBJECT_COLORS } from "@/lib/schema";
import { useScrollLearn } from "@/lib/store";
import { ActionRail } from "./ActionRail";
import { FooterLeft } from "./FooterLeft";
import { InstructionsModal } from "./InstructionsModal";
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
  const [helpOpen, setHelpOpen] = useState(false);
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
      className={`relative h-full w-full flex-shrink-0 snap-start snap-always overflow-hidden bg-gradient-to-br ${colors.bg} text-white [text-shadow:0_0_4px_rgb(0_0_0/0.5)]`}
      aria-label={`Game ${index + 1}: ${game.subject}`}
    >
      {/* Top vignette (matches TikTok-UI-Clone ::before) */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] vignette-top"
        aria-hidden="true"
      />

      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />

      {/* Game body — centered between top nav and footer area */}
      <div className="absolute inset-x-0 top-4 bottom-[148px] z-10 flex items-center justify-center px-5">
        <div className="w-full max-w-[380px]">{body}</div>
      </div>

      {/* Left caption overlay */}
      <FooterLeft game={game} />

      {/* Right action rail */}
      <ActionRail subject={game.subject} onHelp={() => setHelpOpen(true)} />

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

      {/* Instructions modal */}
      <InstructionsModal
        template={game.template}
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </section>
  );
}
