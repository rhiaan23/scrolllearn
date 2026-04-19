"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CalculationsterGame } from "@/lib/schema";
import { MONSTER_SPRITES, PixelSprite } from "@/components/PixelSprite";

const MONSTER = MONSTER_SPRITES[0]; // single consistent monster — do not cycle
import { paper } from "@/lib/theme";

/**
 * Calculationster — monster-approach math drill.
 *
 * A monster walks toward your hero on the left. Each question answered correctly
 * knocks the monster back and you score a point. A wrong answer surges the
 * monster forward. The monster also speeds up as your score climbs. Reach
 * passingScore to win; get caught and you lose.
 *
 * Mechanic inspired by es-rene99/calculationster (GPL-3.0). No source code
 * copied; only the educational concept (timed arithmetic drill).
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

const ARENA_W = 320;
const HERO_X = 8; // left edge
const MONSTER_W = 76; // rendered monster width
const HERO_W = 56;
const START_MONSTER_X = ARENA_W - MONSTER_W - 4;
const CATCH_DIST = HERO_X + HERO_W - 10; // monster caught you when its x <= this

const BASE_SPEED_PX_PER_SEC = 14; // initial advance speed
const SPEED_BUMP_PER_SCORE = 3.2; // each correct +px/s
const SURGE_WRONG = 22; // pixels monster gains on a wrong answer

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
  const divisor = 2 + Math.floor(Math.random() * (Math.min(maxOperand, 12) - 1));
  const quotient = 2 + Math.floor(Math.random() * 11);
  return { a: quotient * divisor, op, b: divisor, answer: quotient };
}

export function Calculationster({ game, onAnswer, locked }: Props) {
  const { operations, maxOperand, passingScore } = game.data;

  const [problem, setProblem] = useState<Problem>(() =>
    makeProblem(operations, maxOperand),
  );
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [monsterX, setMonsterX] = useState(START_MONSTER_X);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const finishedRef = useRef(false);
  const scoreRef = useRef(0);
  const monsterRef = useRef(START_MONSTER_X);
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Monster march loop — rAF so it's smooth and auto-pauses when tab is hidden.
  useEffect(() => {
    if (locked || finishedRef.current) {
      lastTsRef.current = null;
      return;
    }
    function tick(ts: number) {
      if (finishedRef.current) return;
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      const speed =
        BASE_SPEED_PX_PER_SEC + scoreRef.current * SPEED_BUMP_PER_SCORE;
      const next = monsterRef.current - speed * dt;
      monsterRef.current = next;
      setMonsterX(next);
      if (next <= CATCH_DIST) {
        finishedRef.current = true;
        onAnswer(
          false,
          `caught at ${scoreRef.current} / ${passingScore} fed`,
        );
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [locked, onAnswer, passingScore]);

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
      // Reset monster all the way back to the rightmost spawn — survival only ends
      // when the monster catches up, not when a score threshold is reached.
      monsterRef.current = START_MONSTER_X;
      setMonsterX(START_MONSTER_X);
      feedbackTimerRef.current = setTimeout(nextProblem, 400);
    } else {
      setFeedback("wrong");
      const surged = monsterRef.current - SURGE_WRONG;
      monsterRef.current = surged;
      setMonsterX(surged);
      feedbackTimerRef.current = setTimeout(nextProblem, 700);
    }
  }

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!locked) setTimeout(() => inputRef.current?.focus(), 100);
  }, [locked]);

  // Danger tint when the monster is within 90px of the hero.
  const danger = monsterX - CATCH_DIST < 90;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* HUD — score + speed */}
      <div
        className="flex w-full items-center justify-between rounded-[14px] px-3 py-1.5"
        style={{
          background: "#FFFFFF",
          border: `1.5px dashed ${paper.ink}44`,
          color: paper.ink,
        }}
      >
        <div className="font-display text-[11px] font-black uppercase tracking-[0.18em]">
          Fed{" "}
          <span className="font-mono tabular-nums">
            {score} / {passingScore}
          </span>
        </div>
        <div
          className="font-display text-[11px] font-black uppercase tracking-[0.18em]"
          style={{ color: danger ? paper.math.lo : paper.inkSoft }}
        >
          Speed ×{(1 + score * 0.2).toFixed(1)}
        </div>
      </div>

      {/* Battle arena */}
      <div
        className="relative w-full overflow-hidden rounded-[18px]"
        style={{
          width: ARENA_W,
          height: 112,
          background: danger
            ? `linear-gradient(180deg, ${paper.math.tint} 0%, ${paper.bg} 70%)`
            : `linear-gradient(180deg, ${paper.bg2} 0%, ${paper.bg} 70%)`,
          border: `2px solid ${paper.ink}22`,
          boxShadow: "inset 0 -3px 0 rgba(43,29,16,0.06)",
        }}
      >
        {/* Ground line */}
        <div
          className="absolute left-0 right-0"
          style={{
            bottom: 10,
            height: 2,
            background: `${paper.ink}22`,
          }}
        />

        {/* Me — stick figure hero on the left */}
        <div
          className="absolute"
          style={{
            left: HERO_X,
            bottom: 8,
            width: HERO_W,
            height: 72,
            transition: feedback === "wrong" ? "transform 0.25s" : undefined,
            transform: feedback === "wrong" ? "translateX(-4px)" : undefined,
            filter: "drop-shadow(0 2px 0 rgba(43,29,16,0.2))",
          }}
        >
          <StickFigure color={paper.ink} width={HERO_W} height={72} />
        </div>

        {/* Monster — single, never cycled */}
        <div
          className="absolute"
          style={{
            left: monsterX,
            bottom: 8,
            width: MONSTER_W,
            height: 84,
            transition:
              feedback === "correct" ? "left 0.55s cubic-bezier(0.22,1,0.36,1)" : undefined,
            transform: `scaleX(-1)${feedback === "wrong" ? " scale(1.05)" : ""}`,
            transformOrigin: "center",
          }}
        >
          <PixelSprite
            src={MONSTER.src}
            width={MONSTER.w}
            height={MONSTER.h}
            alt="monster"
            style={{
              width: MONSTER_W,
              height: 84,
              objectFit: "contain",
              filter: "drop-shadow(0 3px 0 rgba(43,29,16,0.28))",
            }}
          />
        </div>
      </div>

      {/* Problem display */}
      <div
        className="flex w-full items-center justify-center rounded-[16px] px-6 py-3"
        style={{
          background: "#FFFFFF",
          border: `2px solid ${paper.ink}22`,
          boxShadow: "0 3px 0 rgba(43,29,16,0.1)",
          color: paper.ink,
        }}
      >
        <span
          className="font-mono text-4xl font-black tabular-nums tracking-tight"
          style={{ color: paper.ink }}
        >
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
          className="flex-1 rounded-[14px] px-4 py-2.5 text-center font-mono text-2xl font-black outline-none"
          style={{
            background: paper.bg2,
            color: paper.ink,
            border: `2px solid ${paper.ink}22`,
          }}
          aria-label="Your answer"
        />
        <button
          type="button"
          onClick={submit}
          disabled={locked || feedback !== null || input === ""}
          className="rounded-[14px] px-5 py-2.5 font-display font-black transition-transform active:translate-y-[2px] disabled:opacity-40"
          style={{
            background: `linear-gradient(145deg, ${paper.math.hi} 0%, ${paper.math.lo} 100%)`,
            color: "#FFFFFF",
            boxShadow: "0 3px 0 rgba(43,29,16,0.16)",
          }}
        >
          GO!
        </button>
      </div>

      {/* Tiny per-answer flash — different from the GameCard-level toast */}
      {feedback === "correct" && (
        <div
          className="font-display text-[12px] font-black animate-[pop_0.3s_ease-out]"
          style={{ color: paper.science.lo }}
        >
          +1 knocked back!
        </div>
      )}
      {feedback === "wrong" && (
        <div
          className="font-display text-[12px] font-black animate-[pop_0.3s_ease-out]"
          style={{ color: paper.math.lo }}
        >
          answer was {problem.answer}
        </div>
      )}
    </div>
  );
}

function StickFigure({
  color,
  width,
  height,
}: {
  color: string;
  width: number;
  height: number;
}) {
  // A friendly stick-figure "me" — head, body, arms, legs.
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 72"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="20" cy="12" r="8" fill="#FFFFFF" />
      {/* Eyes */}
      <circle cx="17" cy="11" r="1.1" fill={color} stroke="none" />
      <circle cx="23" cy="11" r="1.1" fill={color} stroke="none" />
      {/* Smile */}
      <path d="M16.5 14.5 Q20 17 23.5 14.5" />
      {/* Body */}
      <path d="M20 20 L20 46" />
      {/* Arms (slightly raised like ready stance) */}
      <path d="M20 26 L10 34" />
      <path d="M20 26 L30 34" />
      {/* Legs */}
      <path d="M20 46 L13 66" />
      <path d="M20 46 L27 66" />
      {/* Ground shadow */}
      <ellipse cx="20" cy="68" rx="10" ry="2" fill={color} stroke="none" opacity="0.15" />
    </svg>
  );
}
