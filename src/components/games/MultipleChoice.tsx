"use client";

import { useState } from "react";
import type { MultipleChoiceGame } from "@/lib/schema";

interface Props {
  game: MultipleChoiceGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
  lockedCorrect?: boolean;
}

export function MultipleChoice({ game, onAnswer, locked, lockedCorrect }: Props) {
  const [picked, setPicked] = useState<number | null>(null);

  function pick(i: number) {
    if (locked || picked !== null) return;
    setPicked(i);
    const isCorrect = i === game.data.correctIndex;
    onAnswer(isCorrect, game.data.options[i]);
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {game.data.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === game.data.correctIndex;
          const showResult = locked || picked !== null;
          let cls =
            "w-full rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition-all active:scale-[0.98]";
          if (!showResult) {
            cls += " border-white/30 bg-white/10 text-white hover:bg-white/20";
          } else if (isCorrect) {
            cls += " border-green-300 bg-green-400/30 text-white";
          } else if (isPicked && !isCorrect) {
            cls += " border-red-300 bg-red-400/30 text-white";
          } else {
            cls += " border-white/20 bg-white/5 text-white/60";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              className={cls}
              disabled={showResult}
            >
              <span className="mr-3 inline-block w-6 text-white/70">{"ABCD"[i]}.</span>
              {opt}
            </button>
          );
        })}
      </div>
      {lockedCorrect !== undefined ? null : null}
    </div>
  );
}
