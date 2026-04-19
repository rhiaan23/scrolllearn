"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { CleanRiverGame } from "@/lib/schema";

interface Props {
  game: CleanRiverGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

// Base sizes — actual rendered dimensions are scaled responsively (see useEffect below).
const BASE_RIVER_WIDTH = 320;
const BASE_RIVER_HEIGHT = 400;
const BASE_BANK_WIDTH = 40;
const BASE_ITEM_SIZE = 72;
const MIN_RIVER_WIDTH = 240;

type Active = {
  key: number;
  value: number;
  lane: number;
  startMs: number;
};

export function CleanRiver({ game, onAnswer, locked }: Props) {
  const rounds = game.data.rounds;
  const fall = game.data.fallDurationMs;
  const startingLives = game.data.lives;

  const [roundIdx, setRoundIdx] = useState(0);
  const [lives, setLives] = useState(startingLives);
  const [correctCount, setCorrectCount] = useState(0);
  const [active, setActive] = useState<Active[]>([]);
  const [flash, setFlash] = useState<"right" | "wrong" | null>(null);

  // Responsive sizing — measure parent width, derive river dimensions.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [riverW, setRiverW] = useState(BASE_RIVER_WIDTH);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    function measure() {
      if (!el) return;
      const w = Math.max(MIN_RIVER_WIDTH, Math.min(BASE_RIVER_WIDTH, el.clientWidth));
      setRiverW(w);
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = riverW / BASE_RIVER_WIDTH;
  const riverH = Math.round(BASE_RIVER_HEIGHT * scale);
  const bankW = Math.round(BASE_BANK_WIDTH * scale);
  const itemSize = Math.round(BASE_ITEM_SIZE * scale);

  const spawnIdxRef = useRef(0);
  const keySeqRef = useRef(0);
  const finishedRef = useRef(false);
  const roundResolvedRef = useRef(false);
  const fallTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onAnswerRef = useRef(onAnswer);
  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  const clearAllTimers = useCallback(() => {
    for (const t of fallTimersRef.current.values()) clearTimeout(t);
    fallTimersRef.current.clear();
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (isCorrect: boolean, description: string) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      clearAllTimers();
      onAnswerRef.current(isCorrect, description);
    },
    [clearAllTimers],
  );

  const resolveRound = useCallback(
    (wasCorrect: boolean) => {
      if (roundResolvedRef.current || finishedRef.current) return;
      roundResolvedRef.current = true;
      clearAllTimers();
      setActive([]);
      setFlash(wasCorrect ? "right" : "wrong");
      if (wasCorrect) {
        setCorrectCount((c) => c + 1);
      } else {
        setLives((L) => {
          const next = L - 1;
          if (next <= 0) {
            const totalRounds = rounds.length;
            finish(
              false,
              `the river is still full of trash — ${correctCount}/${totalRounds} cleaned`,
            );
          }
          return next;
        });
      }
      setTimeout(() => {
        setFlash(null);
        if (finishedRef.current) return;
        setRoundIdx((i) => i + 1);
      }, 550);
    },
    [clearAllTimers, finish, correctCount, rounds.length],
  );

  useEffect(() => {
    if (finishedRef.current) return;
    if (roundIdx >= rounds.length) {
      const total = rounds.length;
      finish(true, `cleaned the river — ${correctCount}/${total} right`);
      return;
    }
    if (locked) return;

    roundResolvedRef.current = false;
    spawnIdxRef.current = 0;

    const round = rounds[roundIdx];
    const opts = round.options;
    const gap = Math.max(1200, Math.floor(fall / (opts.length + 1)));

    function spawnNext() {
      if (roundResolvedRef.current || finishedRef.current) return;
      const idx = spawnIdxRef.current;
      if (idx >= opts.length) {
        if (spawnIntervalRef.current) {
          clearInterval(spawnIntervalRef.current);
          spawnIntervalRef.current = null;
        }
        return;
      }
      spawnIdxRef.current = idx + 1;
      const key = ++keySeqRef.current;
      const value = opts[idx];
      const lane = ((idx * 7 + 3) % 5) / 4;
      setActive((prev) => [
        ...prev,
        { key, value, lane, startMs: performance.now() },
      ]);
      const t = setTimeout(() => {
        fallTimersRef.current.delete(key);
        setActive((prev) => {
          const next = prev.filter((a) => a.key !== key);
          if (
            !roundResolvedRef.current &&
            next.length === 0 &&
            spawnIdxRef.current >= opts.length
          ) {
            queueMicrotask(() => resolveRound(false));
          }
          return next;
        });
      }, fall);
      fallTimersRef.current.set(key, t);
    }

    spawnNext();
    spawnIntervalRef.current = setInterval(spawnNext, gap);

    return () => {
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx, locked]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  function handleTap(key: number, value: number) {
    if (locked || finishedRef.current || roundResolvedRef.current) return;
    const round = rounds[roundIdx];
    if (!round) return;
    const isRight = value === round.answer;
    const t = fallTimersRef.current.get(key);
    if (t) clearTimeout(t);
    fallTimersRef.current.delete(key);
    resolveRound(isRight);
  }

  // Keyboard input — number keys 1-N tap the matching answer (matches by value).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked || finishedRef.current || roundResolvedRef.current) return;
      const round = rounds[roundIdx];
      if (!round) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 0 || n > 9) return;
      // Find the active falling item whose value matches the typed digit.
      const match = active.find((a) => a.value === n);
      if (match) handleTap(match.key, match.value);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, locked, roundIdx]);

  const round = rounds[roundIdx];
  const riverX = bankW;
  const innerWidth = riverW - bankW * 2;

  return (
    <div ref={wrapRef} className="flex w-full flex-col items-center gap-2">
      {/* HUD — compact: lives + counter on one row */}
      <div className="flex w-full items-center justify-between rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-sm">
        <div className="flex gap-0.5 text-base" aria-label={`${lives} lives`}>
          {Array.from({ length: startingLives }).map((_, i) => (
            <span key={i} className={i < lives ? "" : "opacity-20 grayscale"}>
              ❤️
            </span>
          ))}
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">
          🌊 <span className="text-amber-300">{correctCount}</span>/
          {rounds.length} cleaned
        </div>
      </div>

      {/* Expression prompt — tighter padding */}
      {round && (
        <div className="flex items-center gap-2 rounded-lg bg-green-900/80 px-3 py-1.5 ring-2 ring-green-400/50 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-200/70">
            solve
          </span>
          <span className="font-mono text-lg font-black text-white">
            {round.expression} = ?
          </span>
        </div>
      )}

      {/* River field */}
      <div
        className="relative overflow-hidden rounded-2xl ring-2 ring-black/40"
        style={{
          width: riverW,
          height: riverH,
          backgroundImage: "url(/clean-river/river.png)",
          backgroundSize: "100% auto",
          backgroundRepeat: "repeat-y",
          imageRendering: "pixelated",
        }}
        aria-label="River with floating trash"
      >
        {/* Left grass bank */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10"
          style={{
            width: bankW,
            backgroundImage: "url(/clean-river/grass.png)",
            backgroundSize: "80px auto",
            backgroundRepeat: "repeat",
            imageRendering: "pixelated",
            boxShadow: "inset -3px 0 8px rgba(0,0,0,0.5)",
          }}
          aria-hidden="true"
        />
        {/* Right grass bank */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10"
          style={{
            width: bankW,
            backgroundImage: "url(/clean-river/grass.png)",
            backgroundSize: "80px auto",
            backgroundRepeat: "repeat",
            imageRendering: "pixelated",
            boxShadow: "inset 3px 0 8px rgba(0,0,0,0.5)",
          }}
          aria-hidden="true"
        />

        {/* Duck mascot — bigger so it actually reads as a duck */}
        <div
          className="pointer-events-none absolute bottom-2 left-2 z-20"
          style={{ imageRendering: "pixelated" }}
          aria-hidden="true"
        >
          <Image
            src="/clean-river/duck_sprite.png"
            alt="duck"
            width={56}
            height={38}
            style={{ imageRendering: "pixelated" }}
            unoptimized
          />
        </div>

        {/* Floating rubbish items */}
        {active.map((a) => {
          const x = riverX + a.lane * Math.max(0, innerWidth - itemSize);
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => handleTap(a.key, a.value)}
              disabled={locked}
              className="absolute z-10 flex flex-col items-center justify-center hover:scale-105 active:scale-95"
              style={{
                left: x,
                top: 0,
                width: itemSize,
                height: itemSize,
                animation: `river-fall ${fall}ms linear forwards`,
                animationPlayState: locked ? "paused" : "running",
              }}
              aria-label={`Answer ${a.value}`}
            >
              <Image
                src="/clean-river/rubbish_hill.png"
                alt="trash"
                width={itemSize}
                height={itemSize - 20}
                style={{
                  objectFit: "contain",
                  imageRendering: "pixelated",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
                }}
                unoptimized
              />
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-2 py-0.5 font-black leading-none text-slate-900 shadow"
                style={{ fontSize: Math.round(15 * scale) }}
              >
                {a.value}
              </span>
            </button>
          );
        })}

        {/* Round result flash */}
        {flash && (
          <div
            className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-5xl font-black ${
              flash === "right" ? "text-emerald-200" : "text-rose-200"
            }`}
            aria-hidden="true"
          >
            <span className="animate-[pop_0.4s_ease-out] drop-shadow-lg">
              {flash === "right" ? "✨" : "💥"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
