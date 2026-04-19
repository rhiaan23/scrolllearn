"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HangmanGame } from "@/lib/schema";

interface Props {
  game: HangmanGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

const ROWS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  "ZXCVBNM".split(""),
];

export function Hangman({ game, onAnswer, locked }: Props) {
  const answer = useMemo(() => game.data.word.toUpperCase(), [game.data.word]);
  const maxMisses = game.data.maxMisses;

  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState(0);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  const onAnswerRef = useRef(onAnswer);
  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  const finish = useCallback((isCorrect: boolean, description: string) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    onAnswerRef.current(isCorrect, description);
  }, []);

  const letters = useMemo(() => new Set(answer.replace(/[^A-Z]/g, "").split("")), [answer]);
  const won = [...letters].every((l) => guessed.has(l));

  useEffect(() => {
    if (finishedRef.current) return;
    if (won) {
      finish(true, `You saved them! The word was "${answer}".`);
    } else if (misses >= maxMisses) {
      finish(false, `Out of guesses — the word was "${answer}".`);
    }
  }, [won, misses, maxMisses, answer, finish]);

  function handleGuess(ch: string) {
    if (locked || finishedRef.current) return;
    if (guessed.has(ch)) return;
    const next = new Set(guessed);
    next.add(ch);
    setGuessed(next);
    if (!letters.has(ch)) setMisses((m) => m + 1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked || finishedRef.current) return;
      const k = e.key.toUpperCase();
      if (/^[A-Z]$/.test(k)) handleGuess(k);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, guessed]);

  const livesLeft = Math.max(0, maxMisses - misses);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Top status: hint + lives */}
      <div className="flex w-full items-center justify-between rounded-xl bg-black/30 px-3 py-2 backdrop-blur-sm">
        <div className="flex-1 pr-2 text-[12px] font-semibold leading-tight text-white">
          <span className="text-amber-300">Hint:</span> {game.data.hint}
        </div>
        <div className="flex shrink-0 gap-0.5 text-sm" aria-label={`${livesLeft} guesses left`}>
          {Array.from({ length: maxMisses }).map((_, i) => (
            <span key={i} className={i < livesLeft ? "" : "opacity-25 grayscale"}>
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* Gallows drawing */}
      <HangmanArt misses={misses} maxMisses={maxMisses} />

      {/* Word display */}
      <div className="flex flex-wrap justify-center gap-1.5 px-2">
        {answer.split("").map((ch, i) => {
          if (ch === " ") return <span key={i} className="w-3" />;
          const revealed = guessed.has(ch) || finished;
          return (
            <span
              key={i}
              className="flex h-9 w-7 items-center justify-center border-b-2 border-white text-lg font-black text-white"
            >
              {revealed ? ch : ""}
            </span>
          );
        })}
      </div>

      {/* On-screen keyboard */}
      <div className="mt-1 flex w-full flex-col items-center gap-1">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-[4px]">
            {row.map((ch) => {
              const used = guessed.has(ch);
              const isHit = used && letters.has(ch);
              const isMiss = used && !letters.has(ch);
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => handleGuess(ch)}
                  disabled={used || locked || finished}
                  className={`flex h-8 min-w-[26px] items-center justify-center rounded-md px-1.5 text-[13px] font-bold shadow transition-transform active:scale-90 ${
                    isHit
                      ? "bg-emerald-400 text-emerald-950"
                      : isMiss
                        ? "bg-rose-500/70 text-white line-through"
                        : "bg-white/90 text-slate-900 hover:bg-white"
                  } ${used ? "cursor-default" : "cursor-pointer"}`}
                  aria-label={`Guess ${ch}`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function HangmanArt({ misses, maxMisses }: { misses: number; maxMisses: number }) {
  // Map progress to 6 canonical parts even if maxMisses differs.
  const progress = Math.min(6, Math.round((misses / maxMisses) * 6));
  const show = (n: number) => progress >= n;
  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 120 120"
      className="text-white drop-shadow"
      aria-label={`Hangman drawing, ${misses} of ${maxMisses} misses`}
    >
      {/* Gallows */}
      <line x1="10" y1="115" x2="80" y2="115" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="25" y1="115" x2="25" y2="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="25" y1="10" x2="75" y2="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="75" y1="10" x2="75" y2="25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Head */}
      {show(1) && <circle cx="75" cy="35" r="10" stroke="currentColor" strokeWidth="3" fill="none" />}
      {/* Body */}
      {show(2) && <line x1="75" y1="45" x2="75" y2="75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />}
      {/* Left arm */}
      {show(3) && <line x1="75" y1="55" x2="62" y2="65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />}
      {/* Right arm */}
      {show(4) && <line x1="75" y1="55" x2="88" y2="65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />}
      {/* Left leg */}
      {show(5) && <line x1="75" y1="75" x2="64" y2="92" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />}
      {/* Right leg */}
      {show(6) && <line x1="75" y1="75" x2="86" y2="92" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />}
    </svg>
  );
}
