"use client";

import { useEffect, useRef, useState } from "react";
import { type Game } from "@/lib/schema";
import { useScrollLearn } from "@/lib/store";
import { ActionRail } from "./ActionRail";
import { FooterLeft } from "./FooterLeft";
import { InstructionsModal } from "./InstructionsModal";
import { MergeMath } from "./games/MergeMath";
import { WordBuilder } from "./games/WordBuilder";
import { QuickSort } from "./games/QuickSort";
import { SequenceOrder } from "./games/SequenceOrder";
import { MathCastle } from "./games/MathCastle";
import { Hangman } from "./games/Hangman";
import { MiniCrossword } from "./games/MiniCrossword";
import { BalanceScale } from "./games/BalanceScale";
import { MathChase } from "./games/MathChase";
import { GrammarQuest } from "./games/GrammarQuest";
import { CleanRiver } from "./games/CleanRiver";

interface Props {
  game: Game;
  index: number;
  onAdvance?: () => void;
}

export function GameCard({ game, index, onAdvance }: Props) {
  const recordAnswer = useScrollLearn((s) => s.recordAnswer);
  const sectionRef = useRef<HTMLElement>(null);

  const [result, setResult] = useState<{ correct: boolean; description: string } | null>(
    null,
  );
  const [helpOpen, setHelpOpen] = useState(false);
  // Initialize the first card as visible so it doesn't wait for the observer
  // to fire before its game (e.g., a 20-second QuickSort timer) can start.
  const [isVisible, setIsVisible] = useState(index === 0);
  const advancedRef = useRef(false);

  // Track whether this card is the one currently in view. When it is NOT,
  // we set `locked` below — every game's timer/spawner/keyboard handler is
  // already gated on `locked`, so this single flag pauses off-screen play.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          setIsVisible(e.isIntersecting && e.intersectionRatio > 0.5);
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleAnswer(isCorrect: boolean, description: string) {
    if (advancedRef.current) return;
    setResult({ correct: isCorrect, description });
    recordAnswer(game, isCorrect);
    if (onAdvance) {
      advancedRef.current = true;
      setTimeout(() => onAdvance(), isCorrect ? 1100 : 1700);
    }
  }

  // locked = "no input, no timers, no spawners"
  // — true if the user finished, OR this card isn't currently the visible one.
  const locked = result !== null || !isVisible;

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
    case "math_castle":
      body = <MathCastle game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "hangman":
      body = <Hangman game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "mini_crossword":
      body = <MiniCrossword game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "balance_scale":
      body = <BalanceScale game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "math_chase":
      body = <MathChase game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "grammar_quest":
      body = <GrammarQuest game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "clean_river":
      body = <CleanRiver game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-full w-full flex-shrink-0 snap-start snap-always overflow-hidden bg-black text-white [text-shadow:0_0_4px_rgb(0_0_0/0.5)]"
      aria-label={`Game ${index + 1}: ${game.subject}`}
    >
      {/* Top vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] vignette-top"
        aria-hidden="true"
      />

      {/* Game body — centered between top nav and footer area.
          Each game's component handles its own internal responsive sizing,
          so the wrapper is a single max-width for everything. */}
      <div className="absolute inset-x-0 top-4 bottom-[168px] z-10 flex items-center justify-center px-5">
        <div className="w-full max-w-[420px]">{body}</div>
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
