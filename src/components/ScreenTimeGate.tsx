"use client";

import { useEffect, useRef, useState } from "react";

const LIMIT_MS = 10 * 60 * 1000; // 10 minutes
const STORAGE_KEY = "scrolllearn-screen-ms";

function load(): number {
  try {
    return Math.max(0, Number(localStorage.getItem(STORAGE_KEY)) || 0);
  } catch {
    return 0;
  }
}

function save(ms: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(ms));
  } catch {}
}

function fmt(remainingMs: number): string {
  const secs = Math.max(0, Math.ceil(remainingMs / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  children: React.ReactNode;
}

export function ScreenTimeGate({ children }: Props) {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const elapsedRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load persisted value once on mount, then start ticking.
  useEffect(() => {
    const initial = load();
    elapsedRef.current = initial;
    setElapsedMs(initial);

    function tick() {
      // Pause if tab is hidden (background tab, phone screen off, etc.)
      if (document.visibilityState === "hidden") return;
      const next = elapsedRef.current + 1000;
      elapsedRef.current = next;
      save(next);
      setElapsedMs(next);
    }

    intervalRef.current = setInterval(tick, 1000);

    // Save on unmount so nothing is lost if the component teardown skips the
    // last tick.
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      save(elapsedRef.current);
    };
  }, []);

  function reset() {
    elapsedRef.current = 0;
    save(0);
    setElapsedMs(0);
  }

  const remainingMs = Math.max(0, LIMIT_MS - elapsedMs);
  const expired = elapsedMs >= LIMIT_MS;
  const pct = Math.min(100, (elapsedMs / LIMIT_MS) * 100);
  const urgent = remainingMs < 60_000; // last minute

  return (
    // flex-1 + relative so this column-child fills the remaining height and
    // the expired overlay (absolute inset-0) covers exactly this region.
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Countdown bar — always visible at top of feed */}
      <div className="relative z-20 flex items-center gap-2 border-b border-white/10 bg-black/60 px-4 py-1.5 backdrop-blur-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
          Screen time
        </span>
        {/* Progress bar */}
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ${
              urgent ? "bg-rose-400" : "bg-emerald-400"
            }`}
            style={{ width: `${100 - pct}%` }}
          />
        </div>
        <span
          className={`min-w-[38px] text-right text-[11px] font-black tabular-nums ${
            urgent ? "text-rose-300" : "text-white/70"
          }`}
        >
          {fmt(remainingMs)}
        </span>
        <button
          type="button"
          onClick={reset}
          title="Reset screen timer"
          className="ml-1 rounded-full p-0.5 text-white/40 transition-colors hover:text-white/80"
          aria-label="Reset screen time"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      {/* Feed content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {children}
      </div>

      {/* Time's-up overlay */}
      {expired && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/90 backdrop-blur-md">
          <div className="text-6xl">⏰</div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">Time&apos;s up!</p>
            <p className="mt-1 text-sm text-white/60">
              You&apos;ve used your 10-minute screen limit.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-white px-7 py-3 text-base font-black text-black transition-opacity hover:opacity-80 active:scale-95"
          >
            Reset timer
          </button>
        </div>
      )}
    </div>
  );
}
