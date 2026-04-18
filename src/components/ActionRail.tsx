"use client";

import { useScrollLearn } from "@/lib/store";
import { type Subject, SUBJECT_EMOJI } from "@/lib/schema";

interface Props {
  subject: Subject;
  onExplain: () => void;
  onSkip?: () => void;
}

export function ActionRail({ subject, onExplain, onSkip }: Props) {
  const score = useScrollLearn((s) => s.score);
  const streak = useScrollLearn((s) => s.streak);

  return (
    <div className="absolute right-2 bottom-24 z-30 flex flex-col items-center gap-4 sm:right-3">
      {/* Subject avatar */}
      <button
        type="button"
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-lg ring-2 ring-white/40"
        aria-label={`${subject} channel`}
      >
        {SUBJECT_EMOJI[subject]}
        <span className="absolute -bottom-1.5 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-md">
          +
        </span>
      </button>

      {/* Score (heart) */}
      <RailButton label={String(score)} aria="score">
        <span className="text-2xl">❤️</span>
      </RailButton>

      {/* Streak (flame) — only when meaningful */}
      {streak >= 1 && (
        <RailButton
          label={String(streak)}
          aria="streak"
          highlight={streak >= 3 ? "text-orange-300" : undefined}
        >
          <span className="text-2xl">🔥</span>
        </RailButton>
      )}

      {/* Explain (comment) */}
      <RailButton label="why" aria="explain" onClick={onExplain}>
        <span className="text-2xl">💬</span>
      </RailButton>

      {/* Mute (decorative) */}
      <RailButton label="" aria="mute">
        <span className="text-2xl">🔇</span>
      </RailButton>

      {/* Skip */}
      {onSkip && (
        <RailButton label="next" aria="skip" onClick={onSkip}>
          <span className="text-2xl">⤴️</span>
        </RailButton>
      )}
    </div>
  );
}

function RailButton({
  children,
  label,
  aria,
  onClick,
  highlight,
}: {
  children: React.ReactNode;
  label: string;
  aria: string;
  onClick?: () => void;
  highlight?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className="flex flex-col items-center gap-0.5 transition-transform active:scale-90"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md drop-shadow-lg">
        {children}
      </span>
      {label && (
        <span className={`text-[11px] font-bold text-white drop-shadow ${highlight ?? ""}`}>
          {label}
        </span>
      )}
    </button>
  );
}
