"use client";

import type { Game } from "@/lib/schema";
import { paper } from "@/lib/theme";

interface Props {
  game: Game;
}

const HANDLE: Record<Game["subject"], string> = {
  math: "@mathbot",
  english: "@wordbot",
  science: "@sciencebot",
};

export function FooterLeft({ game }: Props) {
  const p = paper[game.subject];

  return (
    <div className="pointer-events-none absolute left-5 right-[96px] bottom-4 z-20">
      <h3
        className="font-display text-[16px] font-extrabold leading-tight"
        style={{ color: p.ink }}
      >
        {HANDLE[game.subject]}
      </h3>
      <p
        className="mt-1 line-clamp-2 font-display text-[15px] font-semibold leading-snug"
        style={{ color: paper.ink, fontStyle: "italic" }}
      >
        {game.prompt}
      </p>
    </div>
  );
}
