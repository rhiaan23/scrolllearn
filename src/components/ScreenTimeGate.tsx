"use client";

import { useEffect, useRef, useState } from "react";
import { paper } from "@/lib/theme";
import { PaperButton } from "./paper/PaperButton";

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
      {/* Countdown bar — paper style */}
      <div
        className="relative z-20 flex items-center gap-2 px-4 py-2"
        style={{
          background: paper.bg,
          borderBottom: `1.5px dashed ${paper.ink}22`,
        }}
      >
        <span
          className="font-display text-[10px] font-black uppercase tracking-[0.18em]"
          style={{ color: paper.inkSoft }}
        >
          Screen time
        </span>
        <div
          className="relative h-2 flex-1 overflow-hidden rounded-full"
          style={{ background: paper.bg2 }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-1000"
            style={{
              width: `${100 - pct}%`,
              background: urgent
                ? `linear-gradient(90deg, ${paper.math.hi}, ${paper.math.lo})`
                : `linear-gradient(90deg, ${paper.science.hi}, ${paper.science.lo})`,
            }}
          />
        </div>
        <span
          className="min-w-[40px] text-right font-display text-[12px] font-black tabular-nums"
          style={{ color: urgent ? paper.math.lo : paper.ink }}
        >
          {fmt(remainingMs)}
        </span>
        <button
          type="button"
          onClick={reset}
          title="Reset screen timer"
          className="ml-1 rounded-full p-0.5 transition-opacity hover:opacity-70"
          style={{ color: paper.inkSoft }}
          aria-label="Reset screen time"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      {/* Feed content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {children}
      </div>

      {/* Time's-up overlay — paper style */}
      {expired && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 px-6"
          style={{ background: "rgba(250,243,228,0.96)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="rounded-[24px] px-7 py-6 text-center"
            style={{
              background: "#FFFFFF",
              border: `3px solid ${paper.ink}`,
              boxShadow: "0 24px 48px rgba(43,29,16,0.28), 0 3px 0 rgba(43,29,16,0.12)",
              transform: "rotate(-1.5deg)",
              color: paper.ink,
            }}
          >
            <p className="font-display text-[28px] font-black leading-tight">
              Time&apos;s up.
            </p>
            <p
              className="mt-2 max-w-[260px] font-body text-[13px] font-semibold"
              style={{ color: paper.inkSoft }}
            >
              You&apos;ve used your 10-minute screen limit. Come back tomorrow or reset.
            </p>
          </div>
          <PaperButton variant="ink" onClick={reset}>
            Reset timer
          </PaperButton>
        </div>
      )}
    </div>
  );
}
