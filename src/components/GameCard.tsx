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
import { MathCastle } from "./games/MathCastle";
import { Hangman } from "./games/Hangman";
import { MiniCrossword } from "./games/MiniCrossword";
import { BalanceScale } from "./games/BalanceScale";
import { MathChase } from "./games/MathChase";
import { GrammarQuest } from "./games/GrammarQuest";
import { CleanRiver } from "./games/CleanRiver";
import { WizardDungeon } from "./games/WizardDungeon";
import { FractionGolf } from "./games/FractionGolf";
import { Calculationster } from "./games/Calculationster";

const DIFFICULTY_LABEL: Record<number, string> = { 1: "K–1", 2: "Gr2–3", 3: "Gr4–5" };
const SUBJECT_PILL: Record<string, string> = {
  math: "bg-blue-500/20 text-blue-300 ring-blue-500/40",
  english: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40",
  science: "bg-purple-500/20 text-purple-300 ring-purple-500/40",
};

// Per-template pixel-art backdrop. math_castle is intentionally omitted —
// it already renders its own full-bleed castle scene.
const TEMPLATE_BG: Partial<Record<Game["template"], string>> = {
  merge_math: "/sprites/bg/merge-math.png",
  word_builder: "/sprites/bg/word-builder.png",
  quick_sort: "/sprites/bg/quick-sort.png",
  hangman: "/sprites/bg/hangman.png",
  mini_crossword: "/sprites/bg/mini-crossword.png",
  balance_scale: "/sprites/bg/balance-scale.png",
  math_chase: "/sprites/bg/math-chase.png",
  grammar_quest: "/sprites/bg/grammar-quest.png",
  clean_river: "/sprites/bg/clean-river.png",
  wizard_dungeon: "/sprites/bg/wizard-dungeon.png",
  fraction_golf: "/sprites/bg/fraction-golf.png",
  calculationster: "/sprites/bg/calculationster.png",
};

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
    case "wizard_dungeon":
      body = <WizardDungeon game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "fraction_golf":
      body = <FractionGolf game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
    case "calculationster":
      body = <Calculationster game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
  }

  const bgSrc = TEMPLATE_BG[game.template];

  return (
    <section
      ref={sectionRef}
      className="relative h-full w-full flex-shrink-0 snap-start snap-always overflow-hidden bg-black text-white [text-shadow:0_0_4px_rgb(0_0_0/0.5)]"
      aria-label={`Game ${index + 1}: ${game.subject}`}
    >
      {/* Pixel-art backdrop */}
      {bgSrc && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${bgSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
            }}
            aria-hidden="true"
          />
          {/* Dim overlay so game content stays legible */}
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-black/55"
            aria-hidden="true"
          />
        </>
      )}

      {/* Top vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] vignette-top"
        aria-hidden="true"
      />

      {/* Difficulty + subject badge */}
      <div className="pointer-events-none absolute left-3 top-14 z-20">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ring-1 ${SUBJECT_PILL[game.subject]}`}>
          {DIFFICULTY_LABEL[game.difficulty]} · {game.subject}
        </span>
      </div>

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
          {result.correct && (
            <div className="mt-1 text-xs font-black text-yellow-300">+10 pts</div>
          )}
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
