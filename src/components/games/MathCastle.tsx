"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MathCastleGame } from "@/lib/schema";

interface Props {
  game: MathCastleGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

const FIELD_WIDTH = 520;
const FIELD_HEIGHT = 360;
const CASTLE_WIDTH = 120;
const CASTLE_X = 6;
const ENEMY_WIDTH = 90;
const ENEMY_HEIGHT = 66;
const SPRITE_SHEET_WIDTH = 1620;
const SPRITE_FRAMES = 18;
const WALK_DURATION_SEC = 0.9;
const LANES = 3;
const LANE_TOP = 130;
const LANE_GAP = 70;
const CASTLE_RIGHT = CASTLE_X + CASTLE_WIDTH;

const SHEETS = [
  "/math-castle/enemySpriteSheet.png",
  "/math-castle/enemySpriteSheet2.png",
  "/math-castle/enemySpriteSheet3.png",
];

type Active = {
  key: number;
  question: string;
  answer: number;
  lane: number;
  sheet: string;
};

export function MathCastle({ game, onAnswer, locked }: Props) {
  const enemies = game.data.enemies;
  const travel = game.data.travelDurationMs;
  const spawnInterval = game.data.spawnIntervalMs;
  const startingLives = game.data.lives;

  const [lives, setLives] = useState(startingLives);
  const [killed, setKilled] = useState(0);
  const [active, setActive] = useState<Active[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [wrongKey, setWrongKey] = useState<number | null>(null);
  const [castleShake, setCastleShake] = useState(false);

  const spawnIdxRef = useRef(0);
  const keySeqRef = useRef(0);
  const finishedRef = useRef(false);
  const killedRef = useRef(0);
  const breachTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const onAnswerRef = useRef(onAnswer);
  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  const finish = useCallback((isCorrect: boolean, description: string) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    for (const t of breachTimersRef.current.values()) clearTimeout(t);
    breachTimersRef.current.clear();
    onAnswerRef.current(isCorrect, description);
  }, []);

  useEffect(() => {
    if (locked || finishedRef.current) return;
    if (spawnIdxRef.current >= enemies.length) return;

    function spawnNext() {
      if (finishedRef.current) return;
      const idx = spawnIdxRef.current;
      if (idx >= enemies.length) return;
      const e = enemies[idx];
      spawnIdxRef.current = idx + 1;
      const key = ++keySeqRef.current;
      const lane = idx % LANES;
      const sheet = SHEETS[idx % SHEETS.length];
      setActive((prev) => [
        ...prev,
        { key, question: e.question, answer: e.answer, lane, sheet },
      ]);

      const t = setTimeout(() => {
        breachTimersRef.current.delete(key);
        setActive((prev) => prev.filter((a) => a.key !== key));
        setSelected((s) => (s === key ? null : s));
        setCastleShake(true);
        setTimeout(() => setCastleShake(false), 400);
        setLives((L) => {
          const next = L - 1;
          if (next <= 0) {
            finish(
              false,
              `Castle fell — ${enemies.length - killedRef.current} enemies broke through.`,
            );
          }
          return next;
        });
      }, travel);
      breachTimersRef.current.set(key, t);
    }

    spawnNext();
    const id = setInterval(spawnNext, spawnInterval);
    return () => clearInterval(id);
  }, [enemies, travel, spawnInterval, locked, finish]);

  useEffect(() => {
    killedRef.current = killed;
    if (killed === enemies.length && !finishedRef.current) {
      finish(true, `Castle held! All ${enemies.length} enemies defeated.`);
    }
  }, [killed, enemies.length, finish]);

  useEffect(() => {
    const timers = breachTimersRef.current;
    return () => {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
    };
  }, []);

  function handleSelect(key: number) {
    if (locked || finishedRef.current) return;
    setSelected(key);
    setInput("");
  }

  function submitAnswer() {
    if (selected === null) return;
    const target = active.find((a) => a.key === selected);
    if (!target) {
      setSelected(null);
      return;
    }
    const trimmed = input.trim();
    if (trimmed === "") return;
    const value = Number(trimmed);
    if (!Number.isFinite(value)) return;

    if (value === target.answer) {
      const t = breachTimersRef.current.get(selected);
      if (t) clearTimeout(t);
      breachTimersRef.current.delete(selected);
      setActive((prev) => prev.filter((a) => a.key !== selected));
      setKilled((k) => k + 1);
      setSelected(null);
      setInput("");
    } else {
      setWrongKey(selected);
      setTimeout(() => setWrongKey(null), 450);
      setSelected(null);
      setInput("");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submitAnswer();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSelected(null);
      setInput("");
    }
  }

  const selectedEnemy = selected !== null ? active.find((a) => a.key === selected) : null;

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex w-full items-center justify-between rounded-xl bg-black/30 px-4 py-2 backdrop-blur-sm">
        <div className="flex gap-1 text-lg" aria-label={`${lives} lives`}>
          {Array.from({ length: startingLives }).map((_, i) => (
            <span key={i} className={i < lives ? "" : "opacity-20 grayscale"}>
              ❤️
            </span>
          ))}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-white/80">
          🏰 <span className="text-amber-300">{killed}</span>/{enemies.length} defeated
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl ring-2 ring-white/20"
        style={{
          width: FIELD_WIDTH,
          height: FIELD_HEIGHT,
          backgroundImage: "url(/math-castle/field.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="pointer-events-none absolute left-0 top-0 h-full"
          style={{
            width: CASTLE_WIDTH,
            backgroundImage: "url(/math-castle/castle.png)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left center",
            transform: `translateX(${CASTLE_X}px)`,
            animation: castleShake ? "mc-castle-shake 0.4s ease-in-out" : undefined,
            filter: lives <= 0 ? "grayscale(0.8) brightness(0.5)" : undefined,
            transition: "filter 0.4s",
          }}
          aria-hidden="true"
        />

        {active.map((a) => {
          const laneTop = LANE_TOP + a.lane * LANE_GAP - ENEMY_HEIGHT / 2;
          const startX = FIELD_WIDTH - ENEMY_WIDTH;
          const endX = CASTLE_RIGHT - ENEMY_WIDTH / 2;
          const isSelected = selected === a.key;
          const isWrong = wrongKey === a.key;
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => handleSelect(a.key)}
              disabled={locked}
              className="absolute z-10 cursor-pointer border-0 bg-transparent p-0 text-left"
              style={{
                top: laneTop,
                left: 0,
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT + 18,
                // @ts-expect-error: CSS custom properties
                "--mc-start": `${startX}px`,
                "--mc-end": `${endX}px`,
                animation: `mc-march ${travel}ms linear forwards${isWrong ? ", mc-shake 0.45s ease-in-out" : ""}`,
                animationPlayState: locked ? "paused" : "running",
                filter: isSelected
                  ? "drop-shadow(0 0 6px #fef08a) drop-shadow(0 0 2px #fef08a)"
                  : undefined,
              }}
              aria-label={`Enemy asking ${a.question}`}
            >
              <div
                className="mx-auto rounded bg-black/70 px-1.5 py-0.5 text-center text-[11px] font-bold text-white"
                style={{ width: "fit-content", transform: "translateY(-2px)" }}
              >
                {a.question}
              </div>
              <div
                style={{
                  width: ENEMY_WIDTH,
                  height: ENEMY_HEIGHT,
                  backgroundImage: `url(${a.sheet})`,
                  backgroundSize: `${SPRITE_SHEET_WIDTH}px ${ENEMY_HEIGHT}px`,
                  backgroundPosition: "0 0",
                  animation: `mc-walk ${WALK_DURATION_SEC}s steps(${SPRITE_FRAMES}) infinite`,
                  animationPlayState: locked ? "paused" : "running",
                  transform: "scaleX(-1)",
                }}
              />
            </button>
          );
        })}

        {selectedEnemy && !locked && (
          <div
            className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-black/80 px-3 py-2 ring-2 ring-amber-300 backdrop-blur-sm"
            role="dialog"
            aria-label="Answer the question"
          >
            <span className="text-sm font-bold text-white">
              {selectedEnemy.question} =
            </span>
            <input
              type="number"
              inputMode="numeric"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-16 rounded bg-white/90 px-2 py-1 text-center text-sm font-bold text-slate-900 outline-none ring-2 ring-transparent focus:ring-amber-300"
              aria-label="Your answer"
            />
            <button
              type="button"
              onClick={submitAnswer}
              className="rounded bg-amber-400 px-2 py-1 text-xs font-black text-amber-950 hover:bg-amber-300"
            >
              FIRE
            </button>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setInput("");
              }}
              aria-label="Close"
              className="rounded bg-white/20 px-2 py-1 text-xs font-bold text-white"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] font-medium uppercase tracking-wider text-white/60">
        tap an enemy · answer to defend
      </div>
    </div>
  );
}
