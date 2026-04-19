"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { NameFigureGame } from "@/lib/schema";
import { paper } from "@/lib/theme";

interface Props {
  game: NameFigureGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function NameFigure({ game, onAnswer, locked }: Props) {
  const { imageSrc, figure, clue, options } = game.data;

  const shuffled = useMemo(() => shuffle(options), [options]);
  const [picked, setPicked] = useState<string | null>(null);

  function pick(name: string) {
    if (locked || picked) return;
    setPicked(name);
    const correct = name === figure;
    onAnswer(correct, correct ? `it was ${figure}` : `correct: ${figure}`);
  }

  const p = paper.science; // visual tokens for framing — consumer card already handles subject tint

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Portrait frame */}
      <div
        className="relative w-full max-w-[260px] overflow-hidden rounded-2xl"
        style={{
          aspectRatio: "3 / 4",
          background: "#FFFFFF",
          border: "3px solid #FFFFFF",
          boxShadow:
            "0 10px 24px rgba(43,29,16,0.28), 0 0 0 2px rgba(43,29,16,0.08) inset",
          transform: "rotate(-1.5deg)",
        }}
      >
        <Image
          src={imageSrc}
          alt="Historical figure"
          fill
          sizes="260px"
          className="object-cover"
          priority
        />
      </div>

      {/* Clue */}
      <p
        className="max-w-[320px] text-center font-display text-[14px] font-semibold italic leading-snug"
        style={{ color: p.ink }}
      >
        {clue}
      </p>

      {/* Options */}
      <div className="grid w-full max-w-[340px] grid-cols-2 gap-2.5 pt-1">
        {shuffled.map((name) => {
          const isPicked = picked === name;
          const isCorrect = name === figure;
          const reveal = picked !== null;
          const showWrong = reveal && isPicked && !isCorrect;
          const showRight = reveal && isCorrect;

          const bg = showRight
            ? `linear-gradient(145deg, ${p.hi} 0%, ${p.lo} 100%)`
            : showWrong
              ? "#ffffff"
              : "#ffffff";
          const color = showRight ? "#ffffff" : paper.ink;
          const border = showWrong
            ? `2.5px solid ${paper.math.lo}`
            : showRight
              ? "2.5px solid transparent"
              : `2px dashed ${paper.ink}55`;

          return (
            <button
              key={name}
              type="button"
              disabled={locked || picked !== null}
              onClick={() => pick(name)}
              className="rounded-full px-3 py-2 font-display text-[14px] font-extrabold tracking-tight transition-transform active:translate-y-[2px]"
              style={{
                background: bg,
                color,
                border,
                boxShadow: "0 3px 0 rgba(43,29,16,0.14)",
              }}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
