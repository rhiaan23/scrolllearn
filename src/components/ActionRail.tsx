"use client";

import { type Subject, SUBJECT_EMOJI } from "@/lib/schema";

interface Props {
  subject: Subject;
  onHelp: () => void;
}

export function ActionRail({ subject, onHelp }: Props) {

  return (
    <div className="absolute right-1.5 bottom-4 z-30 flex flex-col items-center gap-5 text-white [text-shadow:0_0_4px_rgb(0_0_0/0.5)]">
      {/* Help / question mark — opens instructions */}
      <RailButton label="help" aria="instructions" onClick={onHelp}>
        <HelpIcon />
      </RailButton>

      {/* Spinning record disc (subject emoji) */}
      <div
        className="mt-1 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#b3afaf] shadow-lg animate-spin-slow"
        aria-hidden="true"
      >
        <span className="text-lg leading-none">{SUBJECT_EMOJI[subject]}</span>
      </div>
    </div>
  );
}

function RailButton({
  children,
  label,
  aria,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  aria: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className="flex flex-col items-center gap-1 transition-transform active:scale-90"
    >
      {children}
      {label && (
        <span className="text-[13px] font-semibold text-white drop-shadow">
          {label}
        </span>
      )}
    </button>
  );
}

function HelpIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="white"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.1 15.5a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm1.6-6c-.7.5-.9.8-.9 1.3v.5a.8.8 0 0 1-1.6 0v-.6c0-1.2.6-1.9 1.4-2.5.7-.5 1-.9 1-1.5 0-.8-.7-1.4-1.6-1.4-.8 0-1.5.5-1.7 1.3a.8.8 0 1 1-1.5-.4A3.3 3.3 0 0 1 12 5.5c1.8 0 3.2 1.3 3.2 3 0 1.2-.6 2-1.5 2.6z" />
    </svg>
  );
}
