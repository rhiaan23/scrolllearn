"use client";

import { useEffect, useRef, useState } from "react";
import type { QuickSortGame } from "@/lib/schema";
import { GameIcon } from "@/components/GameIcon";

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

  // Keyboard input — number keys 1-9 map to grid slots.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked || finishedRef.current) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > 9) return;
      tap(n - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, locked]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Rule banner */}
      <div
        className="relative flex w-full items-center justify-between overflow-hidden rounded-xl px-4 py-2.5 ring-1 ring-white/10"
        style={{
          backgroundImage: "url(/sprites/frames/rule-banner.png)",
          backgroundSize: "cover",
          backgroundPosition: "center 60%",
          imageRendering: "pixelated",
        }}
      >
        <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
        <div className="relative flex items-center gap-2 text-sm font-bold text-white">
          <GameIcon emoji={ruleEmoji} size={22} className="!drop-shadow-sm" />
          <span>{rule}</span>
        </div>
        <div className="relative flex items-center gap-3 text-xs font-bold">
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-amber-200">
            ⚡ {score}
          </span>
          <span className="text-white/80">⏱ {timeLeft}s</span>
        </div>
      </div>

      {/* 3×3 grid */}
      <div className="grid w-full max-w-[340px] grid-cols-3 gap-2.5">
        {slots.map((item, i) => {
          const isFlashOk = flash?.slot === i && flash.kind === "ok";
          const isFlashBad = flash?.slot === i && flash.kind === "bad";
          let cls =
            "relative aspect-square flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-150";
          if (isFlashOk) {
            cls += " bg-green-400 ring-4 ring-green-200 scale-105";
          } else if (isFlashBad) {
            cls += " bg-red-400 ring-4 ring-red-200 scale-95";
          } else if (item) {
            cls +=
              " bg-white shadow-[0_4px_0_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)_inset] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_0_rgba(0,0,0,0.18)]";
          } else {
            cls += " bg-white/5 ring-1 ring-white/10";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => tap(i)}
              disabled={!item || locked}
              className={cls}
              style={
                item
                  ? {
                      // Stagger pop-in so the grid doesn't all flash at once.
                      animation: `pop-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                      animationDelay: `${(i % 3) * 30}ms`,
                    }
                  : undefined
              }
            >
              {item && (
                <>
                  <GameIcon
                    emoji={pool[item.poolIdx].emoji}
                    alt={pool[item.poolIdx].label}
                    size={56}
                    className="!drop-shadow-none"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-700">
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
