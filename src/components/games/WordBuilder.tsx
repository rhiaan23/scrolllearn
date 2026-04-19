"use client";

import { useMemo, useRef, useState } from "react";
import type { WordBuilderGame } from "@/lib/schema";

interface Props {
  game: WordBuilderGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

const DISTRACTORS = "abcdefghijklmnopqrstuvwxyz".split("");

function shuffled<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function makePool(answer: string): string[] {
  const letters = answer.toLowerCase().split("");
  const used = new Set(letters);
  const distractors: string[] = [];
  const want = answer.length <= 4 ? 2 : 1;
  for (const d of shuffled(DISTRACTORS)) {
    if (distractors.length >= want) break;
    if (!used.has(d)) distractors.push(d);
  }
  return shuffled([...letters, ...distractors]);
}

export function WordBuilder({ game, onAnswer, locked }: Props) {
  const [wordIdx, setWordIdx] = useState(0);
  const finishedRef = useRef(false);

  function onWordComplete() {
    if (finishedRef.current) return;
    if (wordIdx + 1 >= game.data.words.length) {
      finishedRef.current = true;
      const total = game.data.words.length;
      const list = game.data.words.map((w) => w.answer.toLowerCase()).join(", ");
      const prefix = total === 1 ? "spelled" : `spelled all ${total}:`;
      onAnswer(true, `${prefix} ${list}`);
    } else {
      setWordIdx((i) => i + 1);
    }
  }

  return (
    // The key={wordIdx} forces a fresh round on every word — React unmounts &
    // remounts WordRound so its useState initializers re-run with the new word.
    <WordRound
      key={wordIdx}
      word={game.data.words[wordIdx]}
      stepLabel={`word ${wordIdx + 1} of ${game.data.words.length}`}
      onComplete={onWordComplete}
      locked={locked}
    />
  );
}

interface RoundProps {
  word: WordBuilderGame["data"]["words"][number];
  stepLabel: string;
  onComplete: () => void;
  locked: boolean;
}

function WordRound({ word, stepLabel, onComplete, locked }: RoundProps) {
  const answer = word.answer.toLowerCase();
  const [pool] = useState<string[]>(() => makePool(answer));
  const [used, setUsed] = useState<boolean[]>(() => new Array(pool.length).fill(false));
  const [filled, setFilled] = useState<{ ch: string; poolIdx: number }[]>([]);
  const [shake, setShake] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  function tap(letter: string, poolIdx: number) {
    if (locked || celebrating) return;
    if (used[poolIdx]) return;
    const expected = answer[filled.length];
    if (letter !== expected) {
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }
    const nextFilled = [...filled, { ch: letter, poolIdx }];
    const nextUsed = used.slice();
    nextUsed[poolIdx] = true;
    setFilled(nextFilled);
    setUsed(nextUsed);

    if (nextFilled.length === answer.length) {
      setCelebrating(true);
      setTimeout(() => onComplete(), 800);
    }
  }

  function untap() {
    if (locked || celebrating || filled.length === 0) return;
    const last = filled[filled.length - 1];
    const nextUsed = used.slice();
    nextUsed[last.poolIdx] = false;
    setFilled(filled.slice(0, -1));
    setUsed(nextUsed);
  }

  const slots = useMemo(
    () => answer.split("").map((_, i) => filled[i]?.ch ?? null),
    [answer, filled],
  );

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Hint */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-6xl drop-shadow-md">{word.emoji}</div>
        <div className="text-xs font-bold uppercase tracking-wider text-white/70">
          {word.hint}
        </div>
        <div className="text-[10px] font-medium text-white/50">{stepLabel}</div>
      </div>

      {/* Slots */}
      <div className={`flex gap-2 ${shake ? "animate-shake" : ""}`}>
        {slots.map((ch, i) => (
          <div
            key={i}
            className={`flex h-12 w-10 items-center justify-center rounded-lg border-b-4 text-2xl font-black uppercase ${
              ch
                ? celebrating
                  ? "border-amber-200 bg-amber-300 text-amber-950"
                  : "border-white/60 bg-white/30 text-white"
                : "border-white/40 bg-white/10 text-white/30"
            }`}
          >
            {ch ?? ""}
          </div>
        ))}
      </div>

      {/* Letter pool */}
      <div className="flex flex-wrap justify-center gap-2">
        {pool.map((letter, i) => {
          const isUsed = used[i];
          return (
            <button
              key={i}
              type="button"
              disabled={isUsed || locked || celebrating}
              onClick={() => tap(letter, i)}
              className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 text-xl font-bold uppercase transition-all active:scale-90 ${
                isUsed
                  ? "border-white/10 bg-white/5 text-white/20"
                  : "border-white/30 bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={untap}
        disabled={filled.length === 0 || celebrating}
        className="text-xs font-medium text-white/60 underline-offset-2 hover:underline disabled:text-white/20"
      >
        ← undo last
      </button>
    </div>
  );
}
