"use client";

import type { Game } from "@/lib/schema";
import { SUBJECT_COLORS } from "@/lib/schema";

interface Props {
  game: Game;
}

export function FooterLeft({ game }: Props) {
  const handle = SUBJECT_COLORS[game.subject].handle;

  return (
    <div className="pointer-events-none absolute left-3 right-[88px] bottom-2 z-20 text-white">
      <h3 className="text-[18px] font-bold leading-tight drop-shadow">
        @{handle}
      </h3>
      <p className="mt-1 line-clamp-2 text-[14px] font-medium leading-snug drop-shadow">
        {game.prompt}
      </p>
    </div>
  );
}
