"use client";

import { useEffect, useRef, useState } from "react";
import type { QuickSortGame } from "@/lib/schema";

interface Props {
  game: QuickSortGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

const SLOT_COUNT = 9; // 3×3 grid
const SPAWN_INTERVAL_MS = 700;
const ITEM_LIFETIME_MS = 1800;

interface ActiveItem {
  uid: number; // unique key for React
  poolIdx: number; // index into game.data.pool
  spawnedAt: number;
}

let UID = 1;

export function QuickSort({ game, onAnswer, locked }: Props) {
  const { pool, durationSec, passingScore, rule, ruleEmoji } = game.data;

  const [slots, setSlots] = useState<(ActiveItem | null)[]>(() =>
    new Array(SLOT_COUNT).fill(null),
  );
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [flash, setFlash] = useState<{ slot: number; kind: "ok" | "bad" } | null>(null);

  const finishedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);

  // Defer the "started" timestamp to first effect tick — avoids issues during SSR.
  useEffect(() => {
    startedAtRef.current = performance.now();
  }, []);

  // Spawn items + age them out.
  useEffect(() => {
    if (locked || finishedRef.current) return;
    const spawnTimer = setInterval(() => {
      setSlots((prev) => {
        const empties: number[] = [];
        for (let i = 0; i < prev.length; i++) if (prev[i] === null) empties.push(i);
        if (empties.length === 0) return prev;
        const slotIdx = empties[Math.floor(Math.random() * empties.length)];
        const poolIdx = Math.floor(Math.random() * pool.length);
        const next = prev.slice();
        next[slotIdx] = {
          uid: UID++,
          poolIdx,
          spawnedAt: performance.now(),
        };
        return next;
      });
    }, SPAWN_INTERVAL_MS);

    const ageTimer = setInterval(() => {
      setSlots((prev) => {
        const now = performance.now();
        let changed = false;
        const next = prev.map((s) => {
          if (s && now - s.spawnedAt > ITEM_LIFETIME_MS) {
            changed = true;
            return null;
          }
          return s;
        });
        return changed ? next : prev;
      });
    }, 200);

    return () => {
      clearInterval(spawnTimer);
      clearInterval(ageTimer);
    };
  }, [pool.length, locked]);

  // Countdown timer.
  useEffect(() => {
    if (locked || finishedRef.current) return;
    const t = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1) {
          clearInterval(t);
          if (!finishedRef.current) {
            finishedRef.current = true;
            // We need the latest score — pull from a callback below. Easiest:
            // schedule on next tick to read fresh state.
            setTimeout(() => {
              const won = score >= passingScore;
              onAnswer(won, `scored ${score} / ${passingScore} needed`);
            }, 0);
          }
          return 0;
        }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  // When score state changes, also check for early-exit if passingScore reached.
  useEffect(() => {
    if (finishedRef.current) return;
    if (score >= passingScore) {
      finishedRef.current = true;
      setTimeout(() => onAnswer(true, `scored ${score} / ${passingScore} needed`), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  function tap(slotIdx: number) {
    if (locked || finishedRef.current) return;
    const item = slots[slotIdx];
    if (!item) return;
    const matches = pool[item.poolIdx].matches;
    setSlots((prev) => {
      const next = prev.slice();
      next[slotIdx] = null;
      return next;
    });
    setScore((s) => s + (matches ? 1 : -1));
    setFlash({ slot: slotIdx, kind: matches ? "ok" : "bad" });
    setTimeout(() => setFlash(null), 250);
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Rule banner */}
      <div className="flex w-full items-center justify-between rounded-xl bg-black/30 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <span className="text-lg">{ruleEmoji}</span>
          <span>{rule}</span>
        </div>
        <div className="flex gap-3 text-xs font-bold">
          <span className="text-amber-300">⚡ {score}</span>
          <span className="text-white/80">⏱ {timeLeft}s</span>
        </div>
      </div>

      {/* 3×3 grid */}
      <div className="grid w-full max-w-[340px] grid-cols-3 gap-2">
        {slots.map((item, i) => {
          const isFlashOk = flash?.slot === i && flash.kind === "ok";
          const isFlashBad = flash?.slot === i && flash.kind === "bad";
          let cls =
            "relative aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all";
          if (isFlashOk) cls += " border-green-200 bg-green-400/40";
          else if (isFlashBad) cls += " border-red-200 bg-red-400/40";
          else if (item) cls += " border-white/40 bg-white/15 hover:bg-white/25 active:scale-95";
          else cls += " border-white/10 bg-white/5";
          return (
            <button
              key={i}
              type="button"
              onClick={() => tap(i)}
              disabled={!item || locked}
              className={cls}
            >
              {item && (
                <>
                  <span className="text-3xl drop-shadow">{pool[item.poolIdx].emoji}</span>
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90">
                    {pool[item.poolIdx].label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] font-medium text-white/60">
        target: {passingScore} pts · tap matches, ignore the rest
      </p>
    </div>
  );
}
