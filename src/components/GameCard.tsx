"use client";

import { useEffect, useRef, useState } from "react";
import { type Game } from "@/lib/schema";
import { INSTRUCTIONS } from "@/lib/instructions";
import { paper } from "@/lib/theme";
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
import { GrammarQuest } from "./games/GrammarQuest";
import { WizardDungeon } from "./games/WizardDungeon";
import { FractionGolf } from "./games/FractionGolf";
import { Calculationster } from "./games/Calculationster";
import { NameFigure } from "./games/NameFigure";

const DIFFICULTY_LABEL: Record<number, string> = { 1: "K–1", 2: "Gr2–3", 3: "Gr4–5" };

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
  const [toastVisible, setToastVisible] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(index === 0);
  const advancedRef = useRef(false);

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
    setToastVisible(true);
    recordAnswer(game, isCorrect);
    setTimeout(() => setToastVisible(false), 900);
    if (onAdvance) {
      advancedRef.current = true;
      setTimeout(() => onAdvance(), isCorrect ? 1100 : 1700);
    }
  }

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
    case "grammar_quest":
      body = <GrammarQuest game={game} onAnswer={handleAnswer} locked={locked} />;
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
    case "name_figure":
      body = <NameFigure game={game} onAnswer={handleAnswer} locked={locked} />;
      break;
  }

  const p = paper[game.subject];
  const templateLabel = `${INSTRUCTIONS[game.template].title} · ${DIFFICULTY_LABEL[game.difficulty]}`;

  return (
    <section
      ref={sectionRef}
      className="relative h-full w-full flex-shrink-0 snap-start snap-always overflow-hidden"
      aria-label={`Game ${index + 1}: ${game.subject}`}
      style={{
        background: `linear-gradient(180deg, ${p.tint} 0%, ${paper.bg} 70%)`,
        color: paper.ink,
      }}
    >
      {/* Decorative peek shapes — subject-tinted paper cutouts */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: 110,
          right: -44,
          width: 120,
          height: 120,
          borderRadius: "28%",
          background: p.hi,
          opacity: 0.2,
          transform: "rotate(18deg)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          bottom: 180,
          left: -34,
          width: 90,
          height: 90,
          borderRadius: "30%",
          background: p.lo,
          opacity: 0.15,
          transform: "rotate(-10deg)",
        }}
      />

      {/* Content column: template pill → title → game body */}
      <div
        className="absolute inset-x-5 z-10 flex flex-col items-center"
        style={{ top: 28, bottom: 108 }}
      >
        <div
          className="inline-flex items-center gap-1.5 font-display"
          style={{
            padding: "5px 12px",
            borderRadius: 999,
            background: "#FFFFFF",
            border: `2px solid ${p.lo}`,
            color: p.ink,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            transform: "rotate(-1deg)",
          }}
        >
          {templateLabel}
        </div>

        <h1
          className="font-display"
          style={{
            margin: "14px 0 4px",
            fontWeight: 900,
            fontSize: 30,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            textAlign: "center",
            color: paper.ink,
          }}
        >
          {INSTRUCTIONS[game.template].title}
        </h1>

        <div className="relative mt-5 flex w-full max-w-[420px] flex-1 items-center justify-center">
          <div className="w-full" style={{ color: paper.ink }}>
            {body}
          </div>
        </div>
      </div>

      {/* Caption below the card */}
      <FooterLeft game={game} />

      {/* Right action rail */}
      <ActionRail subject={game.subject} onHelp={() => setHelpOpen(true)} />

      {/* Flash feedback — subtle full-card green/red wash + big Right!/Wrong! */}
      {result && toastVisible && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-30 animate-[pop_0.32s_ease-out]"
            aria-hidden="true"
            style={{
              background: result.correct
                ? "radial-gradient(80% 60% at 50% 50%, rgba(32,180,138,0.28) 0%, rgba(32,180,138,0.08) 55%, transparent 90%)"
                : "radial-gradient(80% 60% at 50% 50%, rgba(224,90,31,0.28) 0%, rgba(224,90,31,0.08) 55%, transparent 90%)",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 z-40 rounded-[22px] px-7 py-4 text-center animate-[pop_0.4s_ease-out]"
            style={{
              background: "#FFFFFF",
              border: `3px solid ${result.correct ? "#0B8563" : "#E05A1F"}`,
              boxShadow: "0 18px 36px rgba(43,29,16,0.22), 0 3px 0 rgba(43,29,16,0.1)",
              transform: `translate(-50%, -50%) rotate(${result.correct ? -3 : 3}deg)`,
            }}
          >
            <div
              className="font-display text-[34px] font-black leading-none tracking-tight"
              style={{ color: result.correct ? "#0B8563" : "#E05A1F" }}
            >
              {result.correct ? "Right!" : "Wrong!"}
            </div>
            <div
              className="mt-1.5 font-body text-[12px] font-semibold"
              style={{ color: paper.inkSoft }}
            >
              {result.description}
            </div>
            {result.correct && (
              <div
                className="mt-2 inline-block rounded-full px-3 py-1 font-display text-[11px] font-black"
                style={{ background: p.tint, color: p.ink }}
              >
                +10 pts
              </div>
            )}
          </div>
        </>
      )}

      {/* Instructions modal */}
      <InstructionsModal
        template={game.template}
        subject={game.subject}
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </section>
  );
}
