"use client";

import { useState } from "react";
import type { SortGame } from "@/lib/schema";

interface Props {
  game: SortGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

type Bucket = "A" | "B" | null;

export function Sort({ game, onAnswer, locked }: Props) {
  const [assignments, setAssignments] = useState<Record<string, Bucket>>({});
  const [submitted, setSubmitted] = useState(false);

  function assign(item: string, bucket: Bucket) {
    if (locked || submitted) return;
    const next = { ...assignments, [item]: bucket };
    setAssignments(next);
    if (game.data.items.every((it) => next[it] === "A" || next[it] === "B")) {
      const correctSet = new Set(game.data.correctA);
      const allCorrect = game.data.items.every((it) =>
        correctSet.has(it) ? next[it] === "A" : next[it] === "B",
      );
      setSubmitted(true);
      const desc = game.data.items
        .map((it) => `${it}→${next[it] === "A" ? game.data.bucketA : game.data.bucketB}`)
        .join(", ");
      onAnswer(allCorrect, desc);
    }
  }

  const unsorted = game.data.items.filter((it) => !assignments[it]);
  const inA = game.data.items.filter((it) => assignments[it] === "A");
  const inB = game.data.items.filter((it) => assignments[it] === "B");

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Unsorted pool */}
      <div className="rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-3 min-h-[60px]">
        {unsorted.length === 0 ? (
          <p className="text-center text-sm text-white/50 italic">all sorted</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unsorted.map((it) => (
              <span
                key={it}
                className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white"
              >
                {it}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Choose-bucket buttons for the topmost unsorted item */}
      {unsorted.length > 0 && !submitted && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => assign(unsorted[0], "A")}
            className="flex-1 rounded-xl border-2 border-white/30 bg-white/10 py-2.5 text-base font-bold text-white hover:bg-white/20"
          >
            ← {game.data.bucketA}
          </button>
          <button
            type="button"
            onClick={() => assign(unsorted[0], "B")}
            className="flex-1 rounded-xl border-2 border-white/30 bg-white/10 py-2.5 text-base font-bold text-white hover:bg-white/20"
          >
            {game.data.bucketB} →
          </button>
        </div>
      )}

      {/* Bucket displays */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: game.data.bucketA, items: inA, kind: "A" as const },
          { label: game.data.bucketB, items: inB, kind: "B" as const },
        ].map(({ label, items, kind }) => (
          <div
            key={kind}
            className="rounded-xl border-2 border-white/40 bg-white/10 p-3 min-h-[110px]"
          >
            <div className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-white/80">
              {label}
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {items.map((it) => {
                const correctSet = new Set(game.data.correctA);
                const wantsA = correctSet.has(it);
                const isCorrect = (wantsA && kind === "A") || (!wantsA && kind === "B");
                let cls = "rounded-full px-2.5 py-1 text-xs font-medium ";
                if (submitted) {
                  cls += isCorrect
                    ? "bg-green-400/40 text-white border border-green-300"
                    : "bg-red-400/40 text-white border border-red-300";
                } else {
                  cls += "bg-white/20 text-white";
                }
                return (
                  <span key={it} className={cls}>
                    {it}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
