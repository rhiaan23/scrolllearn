"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MathChaseGame } from "@/lib/schema";

interface Props {
  game: MathChaseGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

const FIELD_WIDTH = 320;
const FIELD_HEIGHT = 300;
const FALL_DURATION_MS = 3400; // top → bottom

type Falling = {
  key: number;
  value: number;
  lane: number;
  spawnedAt: number;
};

const LANES = 4;
const LANE_W = FIELD_WIDTH / LANES;

export function MathChase({ game, onAnswer, locked }: Props) {
  const target = game.data.target;
  const duration = game.data.durationSec;
  const spawnMs = game.data.spawnIntervalMs;
  const pool = game.data.pool;

  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [falling, setFalling] = useState<Falling[]>([]);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [finished, setFinished] = useState(false);

  const keyRef = useRef(0);
  const finishedRef = useRef(false);
  const totalRef = useRef(0);
  const onAnswerRef = useRef(onAnswer);
  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  const finish = useCallback((isCorrect: boolean, description: string) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    onAnswerRef.current(isCorrect, description);
  }, []);

  // Countdown timer. Reads totalRef so the final message reflects the real
  // accumulated sum at the moment the timer ends, not a captured closure.
  useEffect(() => {
    if (locked || finishedRef.current) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          finish(
            false,
            `Out of time. Total was ${totalRef.current}, target was ${target}.`,
          );
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  // Spawner.
  useEffect(() => {
    if (locked || finishedRef.current) return;

    function spawn() {
      if (finishedRef.current) return;
      const value = pool[Math.floor(Math.random() * pool.length)];
      const lane = Math.floor(Math.random() * LANES);
      const key = ++keyRef.current;
      const now = Date.now();
      setFalling((prev) => [...prev, { key, value, lane, spawnedAt: now }]);
      // Auto-despawn when it hits the bottom.
      setTimeout(() => {
        setFalling((prev) => prev.filter((f) => f.key !== key));
      }, FALL_DURATION_MS);
    }

    spawn();
    const id = setInterval(spawn, spawnMs);
    return () => clearInterval(id);
  }, [locked, pool, spawnMs]);

  function tap(item: Falling) {
    if (locked || finishedRef.current) return;
    setFalling((prev) => prev.filter((f) => f.key !== item.key));

    const next = total + item.value;
    setTotal(next);
    totalRef.current = next;

    if (next === target) {
      setFlash("good");
      setTimeout(() => setFlash(null), 300);
      finish(true, `Exactly ${target}!`);
      return;
    }

    if (next > target) {
      setFlash("bad");
      setTimeout(() => setFlash(null), 300);
      finish(false, `Overshot — ${next} is past ${target}.`);
      return;
    }

    setFlash("good");
    setTimeout(() => setFlash(null), 200);
  }

  // Keyboard input — number keys grab the LOWEST (oldest) falling number
  // matching that value (i.e. the one most likely to drop off the field next).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked || finishedRef.current) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 0 || n > 9) return;
      const match = falling
        .filter((f) => f.value === n)
        .sort((a, b) => a.spawnedAt - b.spawnedAt)[0];
      if (match) tap(match);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [falling, total, locked]);

  const progressPct = useMemo(
    () => Math.min(100, Math.round((total / target) * 100)),
    [total, target],
  );

  return (
    <div className="flex w-full flex-col items-center gap-2">
      {/* Header: total, target, timer */}
      <div className="flex w-full items-center justify-between rounded-xl bg-black/30 px-3 py-2 text-white backdrop-blur-sm">
        <div className="text-[12px] font-semibold">
          Target <span className="text-amber-300">{target}</span>
        </div>
        <div className="text-[18px] font-black tabular-nums text-white">
          {total}
          <span className="text-[11px] font-medium text-white/60"> / {target}</span>
        </div>
        <div className="text-[12px] font-semibold tabular-nums">
          ⏱ <span className={timeLeft <= 5 ? "text-rose-300" : "text-white"}>{timeLeft}s</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full bg-emerald-400 transition-[width] duration-200"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Field */}
      <div
        className={`relative overflow-hidden rounded-2xl border-2 ${
          flash === "good"
            ? "border-emerald-300 bg-emerald-500/20"
            : flash === "bad"
              ? "border-rose-300 bg-rose-500/20"
              : "border-white/30 bg-black/30"
        } transition-colors duration-200`}
        style={{ width: FIELD_WIDTH, height: FIELD_HEIGHT }}
      >
        {/* Lane guides */}
        {Array.from({ length: LANES - 1 }).map((_, i) => (
          <div
            key={i}
            className="pointer-events-none absolute top-0 h-full w-px bg-white/10"
            style={{ left: (i + 1) * LANE_W }}
            aria-hidden="true"
          />
        ))}

        {/* Player marker at bottom */}
        <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-2xl">
          🧒
        </div>

        {/* Falling numbers */}
        {falling.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => tap(f)}
            disabled={locked || finished}
            className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-white text-base font-black text-slate-900 shadow-lg ring-2 ring-amber-300 transition-transform active:scale-90"
            style={{
              left: f.lane * LANE_W + (LANE_W - 40) / 2,
              top: -40,
              animation: `mc-fall ${FALL_DURATION_MS}ms linear forwards`,
            }}
            aria-label={`Number ${f.value}`}
          >
            {f.value}
          </button>
        ))}
      </div>

      <div className="text-center text-[11px] font-medium uppercase tracking-wider text-white/60">
        tap numbers that add to the target — do not overshoot
      </div>
    </div>
  );
}
