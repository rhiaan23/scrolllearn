"use client";

import { useEffect, useRef, useState } from "react";
import type { FractionGolfGame } from "@/lib/schema";
import { PixelIcon } from "@/components/PixelIcon";

interface Props {
  game: FractionGolfGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

/**
 * Fraction Golf — pick the correct ball from each half (top = numerator,
 * bottom = denominator) so they form the *reduced* form of the displayed
 * fraction. You have a limited number of strokes before you lose the hole.
 *
 * Mechanic ported from peterjjchen/fraction-golf (ISC). Original visuals
 * (CSS green-felt course, white balls, flagged holes); upstream image/sound
 * assets were not imported.
 */
export function FractionGolf({ game, onAnswer, locked }: Props) {
  const {
    displayNumerator,
    displayDenominator,
    topBalls,
    bottomBalls,
    maxStrokes,
  } = game.data;

  // Compute the reduced-form target via gcd. The "correct" ball values are
  // already in topBalls/bottomBalls — exactly one per half matches.
  const g = gcd(displayNumerator, displayDenominator);
  const reducedNum = displayNumerator / g;
  const reducedDen = displayDenominator / g;

  const [topPick, setTopPick] = useState<number | null>(null);
  const [bottomPick, setBottomPick] = useState<number | null>(null);
  const [strokes, setStrokes] = useState(0);
  const finishedRef = useRef(false);
  // Latch so we don't double-process the same submission across re-renders.
  const submittedRef = useRef(false);

  const submitted = topPick !== null && bottomPick !== null;
  const correct =
    submitted && topPick === reducedNum && bottomPick === reducedDen;
  // Feedback is fully derived — no setState needed, no in-effect cascade.
  const feedback: "correct" | "wrong" | null = !submitted
    ? null
    : correct
      ? "correct"
      : "wrong";

  // One-shot side-effect: when a submission lands, schedule the next step.
  useEffect(() => {
    if (locked || !submitted || finishedRef.current || submittedRef.current) return;
    submittedRef.current = true;

    if (correct) {
      const strokesUsed = strokes + 1;
      const t = setTimeout(() => {
        finishedRef.current = true;
        onAnswer(
          true,
          `holed it in ${strokesUsed} stroke${strokesUsed === 1 ? "" : "s"}`,
        );
      }, 800);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      const nextStrokes = strokes + 1;
      if (nextStrokes >= maxStrokes) {
        finishedRef.current = true;
        onAnswer(
          false,
          `out of strokes — answer was ${reducedNum}/${reducedDen}`,
        );
        return;
      }
      // Reset for another attempt. Order matters: clearing picks unlatches
      // submittedRef via the next render path (submitted → false), but we
      // also clear submittedRef explicitly in case React batches.
      setStrokes(nextStrokes);
      setTopPick(null);
      setBottomPick(null);
      submittedRef.current = false;
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, correct, locked]);

  function tapTop(value: number) {
    if (locked || finishedRef.current || submittedRef.current) return;
    if (feedback !== null) return;
    setTopPick((prev) => (prev === value ? null : value));
  }
  function tapBottom(value: number) {
    if (locked || finishedRef.current || submittedRef.current) return;
    if (feedback !== null) return;
    setBottomPick((prev) => (prev === value ? null : value));
  }

  // Keyboard: digit picks a ball whose VALUE matches in either pool.
  // Picks the unfilled side first; if both filled, no-op.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked || finishedRef.current || submittedRef.current) return;
      if (feedback !== null) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > 12) return;
      // Prefer top if empty and value is in topBalls; else bottom.
      if (topPick === null && topBalls.includes(n)) {
        setTopPick(n);
        return;
      }
      if (bottomPick === null && bottomBalls.includes(n)) {
        setBottomPick(n);
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topPick, bottomPick, locked, feedback]);

  return (
    <div className="flex w-full flex-col items-center gap-2.5">
      {/* HUD: strokes used / par */}
      <div className="flex w-full items-center justify-between rounded-md bg-black/40 px-3 py-1.5 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/80">
          <PixelIcon name="flag" size={14} color="#fcd34d" />
          stroke <span className="text-amber-300">{strokes + 1}</span>/{maxStrokes}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/80">
          <PixelIcon name="target" size={14} color="#fcd34d" />
          reduce <span className="font-mono text-amber-300">{displayNumerator}/{displayDenominator}</span>
        </div>
      </div>

      {/* The "course" */}
      <div
        className="relative w-full overflow-hidden rounded-2xl ring-2 ring-emerald-900/60"
        style={{
          minHeight: 280,
          background:
            "radial-gradient(ellipse at center, #2f8f43 0%, #226d33 60%, #18532a 100%)",
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.4)",
        }}
      >
        {/* Subtle grass texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 6px, rgba(0,0,0,0.06) 6px 8px)",
          }}
          aria-hidden="true"
        />

        {/* Center: the fraction display */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 px-4 py-5">
          {/* Big target display fraction */}
          <div className="flex flex-col items-center font-mono leading-none text-white drop-shadow">
            <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-100/80">
              reduce
            </div>
            <div className="mt-1 inline-flex flex-col items-center text-4xl font-black">
              <span>{displayNumerator}</span>
              <span className="my-1 block h-[3px] w-10 bg-white" />
              <span>{displayDenominator}</span>
            </div>
          </div>

          {/* Compose-row: top hole · "/" · bottom hole */}
          <div className="flex items-center gap-3 font-mono text-white">
            <Hole
              label="top"
              value={topPick}
              accent="top"
              isCorrect={feedback === "correct"}
              isWrong={feedback === "wrong" && topPick !== reducedNum}
            />
            <span className="text-3xl font-black opacity-50">/</span>
            <Hole
              label="bot"
              value={bottomPick}
              accent="bottom"
              isCorrect={feedback === "correct"}
              isWrong={feedback === "wrong" && bottomPick !== reducedDen}
            />
          </div>
        </div>

        {/* Result overlay */}
        {feedback && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span
              className="animate-[pop_0.4s_ease-out] font-display text-4xl font-black drop-shadow-lg"
              style={{ color: feedback === "correct" ? "#0B8563" : "#E05A1F" }}
            >
              {feedback === "correct" ? "Nice!" : "Miss"}
            </span>
          </div>
        )}
      </div>

      {/* Two ball pools — top half feeds the numerator hole, bottom feeds denominator */}
      <div className="flex w-full flex-col gap-2">
        <BallPool
          label="numerator balls"
          balls={topBalls}
          picked={topPick}
          accent="top"
          locked={locked || feedback !== null}
          onTap={tapTop}
        />
        <BallPool
          label="denominator balls"
          balls={bottomBalls}
          picked={bottomPick}
          accent="bottom"
          locked={locked || feedback !== null}
          onTap={tapBottom}
        />
      </div>

      <p className="text-center text-[10px] font-medium uppercase tracking-wider text-white/60">
        pick one from each row · or press the digit on your keyboard
      </p>
    </div>
  );
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function Hole({
  label,
  value,
  accent,
  isCorrect,
  isWrong,
}: {
  label: string;
  value: number | null;
  accent: "top" | "bottom";
  isCorrect: boolean;
  isWrong: boolean;
}) {
  let cls =
    "flex h-14 w-14 items-center justify-center rounded-full font-mono text-2xl font-black transition-all";
  if (isCorrect) {
    cls += " bg-amber-300 text-amber-950 ring-4 ring-white shadow-lg";
  } else if (isWrong) {
    cls += " bg-rose-500/80 text-white ring-2 ring-rose-200";
  } else if (value !== null) {
    cls += " bg-white text-zinc-900 ring-2 ring-zinc-300 shadow-md";
  } else {
    cls += " bg-black/60 text-white/30 ring-2 ring-black/80 shadow-inner";
  }
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={cls} aria-label={`${label} hole${value !== null ? `, ${value}` : " empty"}`}>
        {value !== null ? value : "·"}
      </div>
      <div
        className={`text-[8px] font-black uppercase tracking-widest ${accent === "top" ? "text-rose-200" : "text-amber-200"}`}
      >
        {label}
      </div>
    </div>
  );
}

function BallPool({
  label,
  balls,
  picked,
  accent,
  locked,
  onTap,
}: {
  label: string;
  balls: readonly number[];
  picked: number | null;
  accent: "top" | "bottom";
  locked: boolean;
  onTap: (value: number) => void;
}) {
  return (
    <div className="flex w-full items-center gap-2 rounded-md bg-black/30 p-2 backdrop-blur-sm">
      <div
        className={`w-16 shrink-0 text-[9px] font-black uppercase tracking-wider ${accent === "top" ? "text-rose-200" : "text-amber-200"}`}
      >
        {label}
      </div>
      <div className="flex flex-1 items-center justify-center gap-3">
        {balls.map((v, i) => {
          const isPicked = picked === v;
          let cls =
            "flex h-10 w-10 items-center justify-center rounded-full font-mono text-base font-black transition-all";
          if (isPicked) {
            cls +=
              " bg-amber-300 text-amber-950 ring-2 ring-white scale-110 shadow-[0_0_12px_rgba(252,211,77,0.7)]";
          } else {
            cls +=
              " bg-white text-zinc-900 ring-2 ring-zinc-300 shadow-md hover:-translate-y-0.5 active:scale-95";
          }
          return (
            <button
              key={`${v}-${i}`}
              type="button"
              onClick={() => onTap(v)}
              disabled={locked}
              className={cls}
              aria-label={`Ball ${v}`}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}
