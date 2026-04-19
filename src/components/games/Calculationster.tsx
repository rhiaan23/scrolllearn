"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CalculationsterGame } from "@/lib/schema";
import { MONSTER_SPRITES, PixelSprite } from "@/components/PixelSprite";

/**
 * Calculationster — timed math drill where solving problems feeds a monster.
 * Mechanic ported from es-rene99/calculationster (GPL-3.0). No source code
 * copied; only the educational concept (timed arithmetic drill). See
 * THIRD_PARTY_LICENSES.md for details.
 */

type Op = "+" | "-" | "×" | "÷";

interface Problem {
  a: number;
  op: Op;
  b: number;
  answer: number;
}

interface Props {
  game: CalculationsterGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

function makeProblem(ops: readonly string[], maxOperand: number): Problem {
  const op = ops[Math.floor(Math.random() * ops.length)] as Op;
  if (op === "+") {
    const a = Math.floor(Math.random() * (maxOperand + 1));
    const b = Math.floor(Math.random() * (maxOperand + 1));
    return { a, op, b, answer: a + b };
  }
  if (op === "-") {
    let a = Math.floor(Math.random() * (maxOperand + 1));
    let b = Math.floor(Math.random() * (maxOperand + 1));
    if (b > a) [a, b] = [b, a];
    return { a, op, b, answer: a - b };
  }
  if (op === "×") {
    const cap = Math.min(maxOperand, 12);
    const a = 2 + Math.floor(Math.random() * (cap - 1));
    const b = 2 + Math.floor(Math.random() * 11);
    return { a, op, b, answer: a * b };
  }
  // ÷ — generate clean integer division (quotient * divisor = dividend)
  const divisor = 2 + Math.floor(Math.random() * (Math.min(maxOperand, 12) - 1));
  const quotient = 2 + Math.floor(Math.random() * 11);
  return { a: quotient * divisor, op, b: divisor, answer: quotient };
}

export function Calculationster({ game, onAnswer, locked }: Props) {
  const { operations, maxOperand, durationSec, passingScore } = game.data;

  const [problem, setProblem] = useState<Problem>(() => makeProblem(operations, maxOperand));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(durationSec);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const finishedRef = useRef(false);
  const scoreRef = useRef(0);
  const secondsRef = useRef(durationSec);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Countdown — gated on locked so it pauses when this card is off-screen
  useEffect(() => {
    if (locked || finishedRef.current) return;
    const id = setInterval(() => {
      const next = secondsRef.current - 1;
      secondsRef.current = next;
      setSecondsLeft(next);
      if (next <= 0) {
        clearInterval(id);
        if (!finishedRef.current) {
          finishedRef.current = true;
          const s = scoreRef.current;
          onAnswer(s >= passingScore, `${s} / ${passingScore} correct`);
        }
      }
    }, 1000);
    return () => clearInterval(id);
    // intentionally only re-run when locked changes — secondsRef tracks live time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  const nextProblem = useCallback(() => {
    setProblem(makeProblem(operations, maxOperand));
    setInput("");
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 40);
  }, [operations, maxOperand]);

  function submit() {
    if (locked || finishedRef.current || feedback !== null) return;
    const guess = parseInt(input, 10);
    if (Number.isNaN(guess)) return;
    const isCorrect = guess === problem.answer;
    if (isCorrect) {
      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
      setFeedback("correct");
      feedbackTimerRef.current = setTimeout(nextProblem, 400);
    } else {
      setFeedback("wrong");
      feedbackTimerRef.current = setTimeout(nextProblem, 900);
    }
  }

  // Cleanup feedback timers on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  // Focus the input when the card becomes active
  useEffect(() => {
    if (!locked) setTimeout(() => inputRef.current?.focus(), 100);
  }, [locked]);

  const monsterFrame = MONSTER_SPRITES[Math.min(score, MONSTER_SPRITES.length - 1)];
  const timerPct = Math.max(0, (secondsLeft / durationSec) * 100);
  const timerColor =
    secondsLeft <= 5
      ? "bg-red-500"
      : secondsLeft <= 10
        ? "bg-amber-400"
        : "bg-emerald-400";

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* HUD */}
      <div className="flex w-full items-center justify-between rounded-md bg-black/40 px-3 py-1.5 backdrop-blur-sm">
        <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">
          🎯 score{" "}
          <span className="font-mono text-amber-300">
            {score}/{passingScore}
          </span>
        </div>
        <div
          className={`font-mono text-sm font-black ${secondsLeft <= 5 ? "animate-pulse text-red-300" : "text-white"}`}
        >
          ⏱ {secondsLeft}s
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ${timerColor}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* Monster */}
      <div className="flex flex-col items-center gap-1">
        <div
          className={`flex h-[128px] w-[128px] items-end justify-center transition-all duration-300 ${
            feedback === "correct"
              ? "scale-125 animate-[pop_0.4s_ease-out]"
              : feedback === "wrong"
                ? "animate-[shake_0.4s_ease-out]"
                : ""
          }`}
        >
          <PixelSprite
            key={monsterFrame.src}
            src={monsterFrame.src}
            width={monsterFrame.w}
            height={monsterFrame.h}
            alt="monster"
            style={{
              height: "128px",
              width: "auto",
              filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.4))",
            }}
          />
        </div>
        {feedback === "correct" && (
          <div className="animate-[pop_0.3s_ease-out] text-xs font-bold text-emerald-300">
            +1 fed! 🍖
          </div>
        )}
        {feedback === "wrong" && (
          <div className="text-xs font-bold text-red-300">
            answer: {problem.answer}
          </div>
        )}
        {feedback === null && (
          <div className="text-[10px] text-white/30">
            {score === 0 ? "feed the monster!" : `${score} fed so far`}
          </div>
        )}
      </div>

      {/* Problem display */}
      <div className="flex w-full items-center justify-center rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-sm">
        <span className="font-mono text-4xl font-black tabular-nums tracking-tight text-white">
          {problem.a} {problem.op} {problem.b} = ?
        </span>
      </div>

      {/* Input row */}
      <div className="flex w-full gap-2">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9-]*"
          value={input}
          onChange={(e) => {
            if (locked || feedback !== null) return;
            setInput(e.target.value.replace(/[^0-9-]/g, ""));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          disabled={locked || feedback !== null}
          placeholder="?"
          className="flex-1 rounded-xl bg-white/20 px-4 py-3 text-center font-mono text-2xl font-black text-white outline-none ring-2 ring-white/20 placeholder:text-white/30 focus:ring-white/60 disabled:opacity-50"
          aria-label="Your answer"
        />
        <button
          type="button"
          onClick={submit}
          disabled={locked || feedback !== null || input === ""}
          className="rounded-xl bg-amber-400 px-5 py-3 font-black text-amber-950 transition-all hover:bg-amber-300 active:scale-95 disabled:opacity-40"
        >
          GO!
        </button>
      </div>

      <p className="text-center text-[10px] font-medium uppercase tracking-wider text-white/50">
        type your answer · press Enter or GO!
      </p>
    </div>
  );
}
