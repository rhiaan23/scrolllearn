"use client";

import { useState } from "react";
import type { MatchGame } from "@/lib/schema";

function shuffledIndices(n: number): number[] {
  const idxs = Array.from({ length: n }, (_, i) => i);
  for (let i = idxs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
  }
  return idxs;
}

interface Props {
  game: MatchGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

interface Pairing {
  leftIdx: number;
  rightIdx: number;
}

export function Match({ game, onAnswer, locked }: Props) {
  // Shuffle the right column once per game (lazy init keeps it stable across re-renders)
  const [rightOrder] = useState(() => shuffledIndices(game.data.pairs.length));

  const [activeLeft, setActiveLeft] = useState<number | null>(null);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const leftToPair = new Map(pairings.map((p) => [p.leftIdx, p.rightIdx]));
  const rightToPair = new Map(pairings.map((p) => [p.rightIdx, p.leftIdx]));

  function tapLeft(i: number) {
    if (locked || submitted) return;
    setActiveLeft(i === activeLeft ? null : i);
  }

  function tapRight(i: number) {
    if (locked || submitted) return;
    if (activeLeft === null) {
      // Tap an existing pairing on the right to clear it
      if (rightToPair.has(i)) {
        setPairings((ps) => ps.filter((p) => p.rightIdx !== i));
      }
      return;
    }
    // Wire up the pairing — replace any existing pairing on either side
    const next = pairings.filter(
      (p) => p.leftIdx !== activeLeft && p.rightIdx !== i,
    );
    next.push({ leftIdx: activeLeft, rightIdx: i });
    setPairings(next);
    setActiveLeft(null);

    if (next.length === game.data.pairs.length) {
      // Auto-submit when all pairs are made
      const allCorrect = next.every((p) => p.leftIdx === p.rightIdx);
      setSubmitted(true);
      const description = next
        .map((p) => `${game.data.pairs[p.leftIdx].left}↔${game.data.pairs[p.rightIdx].right}`)
        .join(", ");
      onAnswer(allCorrect, description);
    }
  }

  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        {game.data.pairs.map((p, i) => {
          const paired = leftToPair.has(i);
          const isActive = activeLeft === i;
          const matchedCorrectly = submitted && leftToPair.get(i) === i;
          let cls =
            "rounded-xl border-2 px-3 py-3 text-base font-semibold text-left transition-all";
          if (submitted) {
            cls += matchedCorrectly
              ? " border-green-300 bg-green-400/30 text-white"
              : " border-red-300 bg-red-400/30 text-white";
          } else if (isActive) {
            cls += " border-yellow-300 bg-yellow-400/30 text-white";
          } else if (paired) {
            cls += " border-white/40 bg-white/15 text-white";
          } else {
            cls += " border-white/30 bg-white/10 text-white hover:bg-white/20";
          }
          return (
            <button key={`L${i}`} type="button" onClick={() => tapLeft(i)} className={cls}>
              {p.left}
              {paired && !submitted && (
                <span className="ml-2 text-xs text-white/60">→ {game.data.pairs[rightOrder.indexOf(leftToPair.get(i)!)].right}</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {rightOrder.map((origIdx, displayIdx) => {
          const paired = rightToPair.has(origIdx);
          const matchedCorrectly = submitted && rightToPair.get(origIdx) === origIdx;
          let cls =
            "rounded-xl border-2 px-3 py-3 text-base font-semibold text-left transition-all";
          if (submitted) {
            cls += matchedCorrectly
              ? " border-green-300 bg-green-400/30 text-white"
              : " border-red-300 bg-red-400/30 text-white";
          } else if (paired) {
            cls += " border-white/40 bg-white/15 text-white";
          } else {
            cls += " border-white/30 bg-white/10 text-white hover:bg-white/20";
          }
          return (
            <button
              key={`R${displayIdx}`}
              type="button"
              onClick={() => tapRight(origIdx)}
              className={cls}
            >
              {game.data.pairs[origIdx].right}
            </button>
          );
        })}
      </div>
    </div>
  );
}
