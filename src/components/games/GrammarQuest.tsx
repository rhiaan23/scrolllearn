"use client";

import { useEffect, useRef, useState } from "react";
import type { GrammarQuestGame } from "@/lib/schema";
import { PixelIcon } from "@/components/PixelIcon";

interface Props {
  game: GrammarQuestGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

/**
 * Grammar Quest — fill-in-the-blank grammar mini-game.
 *
 * Mechanic ported from AstroMike101/grammar-quest (MIT) — see
 * the upstream's image assets are 3rd-party and were not relicensed for use here.
 */
export function GrammarQuest({ game, onAnswer, locked }: Props) {
  const questions = game.data.questions;
  const N = questions.length;
  const passing = game.data.passingScore ?? Math.ceil(N * 0.6);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const finishedRef = useRef(false);

  const q = questions[idx];

  function pick(optionIdx: number) {
    if (locked || finishedRef.current || picked !== null) return;
    setPicked(optionIdx);
    const correct = optionIdx === q.correctIndex;
    if (correct) {
      setScore((s) => s + 1);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
    // Brief pause to read result, then advance.
    const delay = correct ? 650 : 1100;
    setTimeout(() => {
      const nextIdx = idx + 1;
      if (nextIdx >= N) {
        finishedRef.current = true;
        const finalScore = score + (correct ? 1 : 0);
        const won = finalScore >= passing;
        onAnswer(
          won,
          `${finalScore} / ${N} correct${won ? " — passed!" : ""}`,
        );
      } else {
        setIdx(nextIdx);
        setPicked(null);
      }
    }, delay);
  }

  // Keyboard: 1-4 picks the corresponding option; A-D also works.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked || finishedRef.current || picked !== null) return;
      const k = e.key.toLowerCase();
      let target = -1;
      if (/^[1-4]$/.test(k)) target = parseInt(k, 10) - 1;
      else if (/^[a-d]$/.test(k)) target = k.charCodeAt(0) - "a".charCodeAt(0);
      if (target >= 0 && target < q.options.length) pick(target);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, locked, q.options.length, idx]);

  // Split on the first run of underscores (3 or more) — upstream uses 3-7.
  // Cheap operation, React Compiler will memoize as needed.
  const blankMatch = q.sentence.match(/_{3,}/);
  const sentenceParts = blankMatch
    ? {
        before: q.sentence.slice(0, blankMatch.index ?? 0),
        after: q.sentence.slice((blankMatch.index ?? 0) + blankMatch[0].length),
      }
    : { before: q.sentence, after: "" };

  const blankFill = picked === null ? "____" : q.options[picked];

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* Sea-themed gradient + pixel HUD */}
      <div className="grid w-full grid-cols-3 items-center gap-2">
        <div className="rounded-md bg-[#0e1933] px-2 py-1 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-200 shadow-[0_2px_0_#000]">
          Q {idx + 1}/{N}
        </div>
        <div className="flex items-center justify-center gap-1 rounded-md bg-[#0e1933] px-2 py-1 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-amber-200 shadow-[0_2px_0_#000]">
          <PixelIcon name="sparkles" size={12} color="#fde68a" />
          {score}
        </div>
        <div className="flex items-center justify-center gap-1 rounded-md bg-[#0e1933] px-2 py-1 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-200 shadow-[0_2px_0_#000]">
          <PixelIcon name="target" size={12} color="#a7f3d0" />
          {passing}
        </div>
      </div>

      {/* The question card — retro game-window look */}
      <div
        className={`relative w-full overflow-hidden rounded-lg ${shake ? "animate-shake" : ""}`}
        style={{
          background: "linear-gradient(180deg, #4ab9e8 0%, #2a78c9 55%, #0e3a7c 100%)",
          boxShadow: "inset 0 0 0 3px #000, inset 0 0 0 6px #fff, 0 4px 0 #000",
        }}
      >
        {/* Animated water-line band */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[42%] h-px bg-cyan-100/50"
          aria-hidden="true"
        />
        {/* Sentence display */}
        <div className="relative z-10 px-4 py-6 text-center font-mono text-[15px] font-bold leading-snug text-white [text-shadow:1px_1px_0_#000,2px_2px_0_#000]">
          <span>{sentenceParts.before}</span>
          <span
            className={`mx-1 inline-block min-w-[60px] rounded border-b-4 px-2 ${
              picked === null
                ? "border-amber-200 bg-amber-300/30 text-amber-100"
                : picked === q.correctIndex
                  ? "border-emerald-200 bg-emerald-400/40 text-white"
                  : "border-rose-200 bg-rose-500/40 text-white"
            }`}
          >
            {blankFill}
          </span>
          <span>{sentenceParts.after}</span>
        </div>
      </div>

      {/* Option buttons — chunky pixel-art style */}
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === q.correctIndex;
          const showResult = picked !== null;
          let cls =
            "relative flex items-center gap-2 rounded-md px-3 py-2.5 font-mono text-sm font-bold uppercase tracking-wide transition-all";
          if (!showResult) {
            cls +=
              " bg-[#1b2a52] text-cyan-100 shadow-[0_3px_0_#000] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-[0_1px_0_#000]";
          } else if (isCorrect) {
            cls += " bg-emerald-500 text-white shadow-[0_3px_0_#000]";
          } else if (isPicked) {
            cls += " bg-rose-500 text-white shadow-[0_3px_0_#000]";
          } else {
            cls += " bg-[#1b2a52]/40 text-cyan-100/40 shadow-[0_2px_0_#000]/40";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={showResult || locked}
              className={cls}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-black/40 text-[10px] text-cyan-200">
                {i + 1}
              </span>
              <span className="flex-1 text-left">{opt}</span>
            </button>
          );
        })}
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-wider text-white/50">
        tap an option · or press 1-{q.options.length} on the keyboard
      </p>
    </div>
  );
}
