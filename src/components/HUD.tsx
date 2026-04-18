"use client";

import { useScrollLearn } from "@/lib/store";

export function HUD() {
  const score = useScrollLearn((s) => s.score);
  const streak = useScrollLearn((s) => s.streak);
  const reset = useScrollLearn((s) => s.reset);

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 pt-3">
      <div className="pointer-events-auto rounded-full bg-black/40 px-4 py-1.5 backdrop-blur-md">
        <div className="flex items-center gap-3 text-sm font-bold text-white">
          <span>⭐ {score}</span>
          {streak >= 3 ? (
            <span className="text-orange-300">🔥 {streak}</span>
          ) : streak > 0 ? (
            <span className="text-white/80">x{streak}</span>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (confirm("Reset your progress?")) reset();
        }}
        className="pointer-events-auto rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md hover:bg-black/60"
      >
        reset
      </button>
    </div>
  );
}
