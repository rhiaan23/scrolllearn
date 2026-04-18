"use client";

import { useState } from "react";
import type { FillBlankGame } from "@/lib/schema";

interface Props {
  game: FillBlankGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

export function FillBlank({ game, onAnswer, locked }: Props) {
  const [picked, setPicked] = useState<string | null>(null);

  function pick(choice: string) {
    if (locked || picked !== null) return;
    setPicked(choice);
    onAnswer(choice === game.data.correct, choice);
  }

  const parts = game.data.sentence.split("___");
  const blank = picked ?? "____";

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="rounded-2xl bg-white/10 px-5 py-6 text-2xl font-medium leading-relaxed text-white">
        {parts[0]}
        <span
          className={`mx-1 rounded-md border-b-4 px-2 py-0.5 font-bold ${
            picked === null
              ? "border-yellow-300 bg-yellow-400/20 text-yellow-200"
              : picked === game.data.correct
                ? "border-green-300 bg-green-400/30 text-green-50"
                : "border-red-300 bg-red-400/30 text-red-50"
          }`}
        >
          {blank}
        </span>
        {parts[1] ?? ""}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {game.data.choices.map((c) => {
          const isPicked = picked === c;
          const isCorrect = c === game.data.correct;
          const showResult = picked !== null;
          let cls =
            "rounded-full border-2 px-5 py-2.5 text-lg font-semibold transition-all active:scale-95";
          if (!showResult) {
            cls += " border-white/30 bg-white/10 text-white hover:bg-white/20";
          } else if (isCorrect) {
            cls += " border-green-300 bg-green-400/30 text-white";
          } else if (isPicked) {
            cls += " border-red-300 bg-red-400/30 text-white";
          } else {
            cls += " border-white/20 bg-white/5 text-white/50";
          }
          return (
            <button
              key={c}
              type="button"
              onClick={() => pick(c)}
              disabled={showResult}
              className={cls}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
