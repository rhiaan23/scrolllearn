"use client";

import type { Game } from "@/lib/schema";
import { SUBJECT_COLORS } from "@/lib/schema";
import { INSTRUCTIONS } from "@/lib/instructions";

interface Props {
  game: Game;
}

export function FooterLeft({ game }: Props) {
  const handle = SUBJECT_COLORS[game.subject].handle;
  const templateLabel = INSTRUCTIONS[game.template].title;
  const tickerText = `Level ${game.difficulty} · ${templateLabel} · ScrollLearn original sound`;

  return (
    <div className="pointer-events-none absolute left-3 right-[88px] bottom-2 z-20 text-white">
      <h3 className="text-[18px] font-bold leading-tight drop-shadow">
        @{handle}
      </h3>
      <p className="mt-1 line-clamp-2 text-[14px] font-medium leading-snug drop-shadow">
        {game.prompt}
      </p>
      <div className="mt-2 flex items-center gap-2 overflow-hidden">
        <MusicIcon />
        <div className="relative flex-1 overflow-hidden">
          <div className="flex whitespace-nowrap will-change-transform animate-marquee">
            <span className="pr-8 text-[12px] font-normal">{tickerText}</span>
            <span className="pr-8 text-[12px] font-normal" aria-hidden="true">
              {tickerText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MusicIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-white"
      aria-hidden="true"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
