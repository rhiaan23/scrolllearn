"use client";

import { useEffect, useRef, useState } from "react";
import type { SequenceOrderGame } from "@/lib/schema";

interface Props {
  game: SequenceOrderGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

function shuffled<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function SequenceOrder({ game, onAnswer, locked }: Props) {
  const tokens = game.data.tokens;
  const correctOrder = game.data.correctOrder;
  const N = correctOrder.length;

  // Pool keeps original indices; lazy-init shuffled order so it's stable across renders.
  const [poolOrder] = useState<number[]>(() => shuffled(tokens.map((_, i) => i)));

  // assignment[slot] = poolIdx (or null)
  const [assignment, setAssignment] = useState<(number | null)[]>(() =>
    new Array(N).fill(null),
  );
  const [shake, setShake] = useState(false);
  const finishedRef = useRef(false);

  function tapPoolItem(poolIdx: number) {
    if (locked || finishedRef.current) return;
    // If already in a slot, ignore (use tap-on-slot to remove instead).
    if (assignment.includes(poolIdx)) return;
    const nextSlot = assignment.findIndex((s) => s === null);
    if (nextSlot === -1) return;
    const next = assignment.slice();
    next[nextSlot] = poolIdx;
    setAssignment(next);
    if (next.every((s) => s !== null)) {
      // All filled — check.
      setTimeout(() => check(next as number[]), 250);
    }
  }

  function tapSlot(slotIdx: number) {
    if (locked || finishedRef.current) return;
    if (assignment[slotIdx] === null) return;
    const next = assignment.slice();
    next[slotIdx] = null;
    setAssignment(next);
  }

  function check(filled: number[]) {
    const ordered = filled.map((i) => tokens[i]);
    const correct = ordered.every((t, i) => t === correctOrder[i]);
    if (correct) {
      finishedRef.current = true;
      onAnswer(true, `ordered: ${ordered.join(" → ")}`);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 350);
      finishedRef.current = true;
      // brief delay so the user sees their wrong answer before advance
      setTimeout(() => onAnswer(false, `your order: ${ordered.join(" → ")}`), 600);
    }
  }

  // Defensive — if locked is set externally before user finishes, no-op.
  useEffect(() => {
    if (locked) finishedRef.current = true;
  }, [locked]);

  // Keyboard input — number keys 1-N place the Nth pool item.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked || finishedRef.current) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > poolOrder.length) return;
      tapPoolItem(poolOrder[n - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, locked, poolOrder]);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Pool (top) */}
      <div className="flex w-full flex-col items-center gap-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">
          pool
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {poolOrder.map((poolIdx) => {
            const placed = assignment.includes(poolIdx);
            return (
              <button
                key={poolIdx}
                type="button"
                disabled={placed || locked}
                onClick={() => tapPoolItem(poolIdx)}
                className={`rounded-xl border-2 px-3 py-2 text-base font-bold transition-all active:scale-95 ${
                  placed
                    ? "border-white/10 bg-white/5 text-white/20"
                    : "border-white/30 bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {tokens[poolIdx]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots (bottom) */}
      <div className="flex w-full flex-col items-center gap-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">
          your order
        </div>
        <div className={`flex flex-wrap justify-center gap-2 ${shake ? "animate-shake" : ""}`}>
          {assignment.map((poolIdx, slot) => {
            const filled = poolIdx !== null;
            return (
              <button
                key={slot}
                type="button"
                disabled={!filled || locked}
                onClick={() => tapSlot(slot)}
                className={`relative flex h-12 min-w-[60px] items-center justify-center rounded-xl border-2 px-3 text-base font-bold transition-all ${
                  filled
                    ? "border-amber-200 bg-amber-300/30 text-white hover:bg-amber-300/40"
                    : "border-dashed border-white/30 bg-white/5 text-white/30"
                }`}
              >
                <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-black text-white">
                  {slot + 1}
                </span>
                {filled ? tokens[poolIdx] : "·"}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] font-medium text-white/60">
        tap to place · tap a slot to take it back
      </p>
    </div>
  );
}
