"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BalanceScaleGame } from "@/lib/schema";

interface Props {
  game: BalanceScaleGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

type Item = { id: string; value: number };

export function BalanceScale({ game, onAnswer, locked }: Props) {
  const fixedSide = game.data.fixed.side;
  const fixedWeights = useMemo<Item[]>(
    () =>
      game.data.fixed.weights.map((w, i) => ({ id: `fixed-${i}`, value: w })),
    [game.data.fixed.weights],
  );
  const fixedSum = useMemo(
    () => fixedWeights.reduce((a, b) => a + b.value, 0),
    [fixedWeights],
  );

  const pool = useMemo<Item[]>(
    () => game.data.pool.map((w, i) => ({ id: `pool-${i}`, value: w })),
    [game.data.pool],
  );

  // Items placed on the empty pan.
  const [placed, setPlaced] = useState<Item[]>([]);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
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

  const placedSum = placed.reduce((a, b) => a + b.value, 0);
  const available = pool.filter((p) => !placed.some((q) => q.id === p.id));

  // Balanced? Success.
  useEffect(() => {
    if (finishedRef.current) return;
    if (placed.length > 0 && placedSum === fixedSum) {
      finish(
        true,
        `${placed.map((p) => p.value).join(" + ")} = ${fixedSum}. Balanced!`,
      );
    }
  }, [placedSum, fixedSum, placed, finish]);

  function pickFromPool(item: Item) {
    if (locked || finishedRef.current) return;
    setPlaced((p) => [...p, item]);
  }

  function returnToPool(item: Item) {
    if (locked || finishedRef.current) return;
    setPlaced((p) => p.filter((q) => q.id !== item.id));
  }

  // Keyboard input — number keys map to the value of an available weight.
  // Pressing 5 picks the first available weight whose value is 5; Backspace
  // returns the last placed weight.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked || finishedRef.current) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        const last = placed[placed.length - 1];
        if (last) returnToPool(last);
        return;
      }
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > 9) return;
      const match = available.find((p) => p.value === n);
      if (match) pickFromPool(match);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, placed, locked]);

  // Visual tilt based on sum comparison.
  const diff = placedSum - fixedSum;
  // fixed side is heavier → its end tilts down. tilt angle in degrees.
  const rawTilt = Math.max(-12, Math.min(12, diff * 1.5));
  const tilt = fixedSide === "left" ? -rawTilt : rawTilt;
  // direction: positive angle = right side down.

  const leftSum = fixedSide === "left" ? fixedSum : placedSum;
  const rightSum = fixedSide === "right" ? fixedSum : placedSum;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Header: sums */}
      <div className="flex w-full items-center justify-between rounded-xl bg-black/30 px-3 py-2 text-white backdrop-blur-sm">
        <div className="text-[12px] font-semibold">
          Target weight: <span className="text-amber-300">{fixedSum}</span>
        </div>
        <div className="text-[12px] font-semibold">
          You placed: <span className="text-amber-300">{placedSum}</span>
        </div>
      </div>

      {/* Scale */}
      <div className="relative flex h-[170px] w-full max-w-[340px] items-end justify-center">
        {/* Base post */}
        <div className="absolute bottom-0 left-1/2 h-[70px] w-3 -translate-x-1/2 rounded-t-md bg-zinc-700" />
        <div className="absolute bottom-0 left-1/2 h-3 w-24 -translate-x-1/2 rounded-md bg-zinc-800" />

        {/* Beam (rotates) */}
        <div
          className="absolute bottom-[70px] left-1/2 h-1.5 w-[280px] -translate-x-1/2 rounded-full bg-zinc-300 shadow-md transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-50%) rotate(${tilt}deg)`, transformOrigin: "center" }}
        >
          {/* Left pan */}
          <Pan
            side="left"
            items={fixedSide === "left" ? fixedWeights : placed}
            isFixed={fixedSide === "left"}
            onRemove={fixedSide === "left" ? undefined : returnToPool}
          />
          {/* Right pan */}
          <Pan
            side="right"
            items={fixedSide === "right" ? fixedWeights : placed}
            isFixed={fixedSide === "right"}
            onRemove={fixedSide === "right" ? undefined : returnToPool}
          />
          {/* Pan sums (stay horizontal-ish; keep on the beam) */}
          <div className="pointer-events-none absolute -top-5 left-0 text-[10px] font-bold text-white">
            {leftSum}
          </div>
          <div className="pointer-events-none absolute -top-5 right-0 text-[10px] font-bold text-white">
            {rightSum}
          </div>
        </div>
      </div>

      {/* Pool of weights */}
      <div className="w-full rounded-xl bg-black/30 p-2 backdrop-blur-sm">
        <div className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-white/70">
          Available weights · tap to add
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {available.length === 0 ? (
            <span className="py-1 text-[11px] italic text-white/60">
              no weights left — tap a placed weight to return it
            </span>
          ) : (
            available.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pickFromPool(item)}
                disabled={locked || finished}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-300 text-base font-black text-amber-950 shadow-md transition-transform active:scale-90 disabled:opacity-50"
                aria-label={`Weight ${item.value}`}
              >
                {item.value}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Pan({
  side,
  items,
  isFixed,
  onRemove,
}: {
  side: "left" | "right";
  items: Item[];
  isFixed: boolean;
  onRemove?: (item: Item) => void;
}) {
  return (
    <div
      className={`absolute top-0 ${side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"}`}
    >
      {/* chain */}
      <div className="mx-auto h-5 w-px bg-zinc-400" />
      <div
        className={`flex min-h-[46px] w-[96px] flex-wrap items-center justify-center gap-1 rounded-md border-2 p-1 shadow ${
          isFixed
            ? "border-amber-400/80 bg-amber-500/30"
            : "border-sky-200/80 bg-sky-400/30"
        }`}
      >
        {items.length === 0 ? (
          <span className="text-[10px] italic text-white/70">empty</span>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={onRemove ? () => onRemove(item) : undefined}
              disabled={!onRemove}
              className={`flex h-7 w-7 items-center justify-center rounded text-[12px] font-black ${
                isFixed
                  ? "cursor-default bg-amber-200 text-amber-950"
                  : "cursor-pointer bg-sky-200 text-sky-950 hover:bg-sky-100 active:scale-90"
              }`}
              aria-label={`Weight ${item.value}${isFixed ? "" : ", tap to return"}`}
            >
              {item.value}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
