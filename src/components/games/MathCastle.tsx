"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MathCastleGame } from "@/lib/schema";
import { PixelIcon } from "@/components/PixelIcon";

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
  spawnedAt: number;
};

type Burst = {
  id: number;
  x: number;
  y: number;
  kind: "hit" | "miss";
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
  const [damageFlash, setDamageFlash] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [heartPulseIdx, setHeartPulseIdx] = useState<number | null>(null);

  const spawnIdxRef = useRef(0);
  const keySeqRef = useRef(0);
  const burstSeqRef = useRef(0);
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

  const triggerDamage = useCallback(() => {
    setDamageFlash((n) => n + 1);
    setCastleShake(true);
    setTimeout(() => setCastleShake(false), 400);
    setLives((L) => {
      const next = Math.max(0, L - 1);
      setHeartPulseIdx(next);
      setTimeout(() => setHeartPulseIdx(null), 500);
      return next;
    });
  }, []);

  const addBurst = useCallback((x: number, y: number, kind: "hit" | "miss") => {
    const id = ++burstSeqRef.current;
    setBursts((prev) => [...prev, { id, x, y, kind }]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 700);
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
        {
          key,
          question: e.question,
          answer: e.answer,
          lane,
          sheet,
          spawnedAt: Date.now(),
        },
      ]);

      const t = setTimeout(() => {
        breachTimersRef.current.delete(key);
        setActive((prev) => prev.filter((a) => a.key !== key));
        setSelected((s) => (s === key ? null : s));
        // Breach damage: shake castle, flash red, lose a heart.
        triggerDamage();
        // Small "miss" burst at the castle gate in the breached lane.
        const laneY = LANE_TOP + lane * LANE_GAP;
        addBurst(CASTLE_RIGHT + 10, laneY, "miss");
      }, travel);
      breachTimersRef.current.set(key, t);
    }

    spawnNext();
    const id = setInterval(spawnNext, spawnInterval);
    return () => clearInterval(id);
  }, [enemies, travel, spawnInterval, locked, triggerDamage, addBurst]);

  useEffect(() => {
    killedRef.current = killed;
    if (killed === enemies.length && !finishedRef.current) {
      finish(true, `Castle held! All ${enemies.length} enemies defeated.`);
    }
  }, [killed, enemies.length, finish]);

  // Watch lives — when it drops to 0, end the game. Done in an effect so the
  // side-effect happens AFTER the state commit, not during a setLives updater
  // (which would trigger setState-during-render of GameCard).
  useEffect(() => {
    if (lives <= 0 && !finishedRef.current) {
      finish(
        false,
        `Castle fell — ${enemies.length - killedRef.current} enemies broke through.`,
      );
    }
  }, [lives, enemies.length, finish]);

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

    // Compute the enemy's current on-screen x/y so feedback bursts land on it.
    const elapsed = Date.now() - target.spawnedAt;
    const progress = Math.min(1, elapsed / travel);
    const startX = FIELD_WIDTH - ENEMY_WIDTH;
    const endX = CASTLE_RIGHT - ENEMY_WIDTH / 2;
    const enemyX = startX + (endX - startX) * progress + ENEMY_WIDTH / 2;
    const enemyY = LANE_TOP + target.lane * LANE_GAP;

    if (value === target.answer) {
      const t = breachTimersRef.current.get(selected);
      if (t) clearTimeout(t);
      breachTimersRef.current.delete(selected);
      setActive((prev) => prev.filter((a) => a.key !== selected));
      setKilled((k) => k + 1);
      setSelected(null);
      setInput("");
      addBurst(enemyX, enemyY, "hit");
    } else {
      setWrongKey(selected);
      setTimeout(() => setWrongKey(null), 450);
      setSelected(null);
      setInput("");
      // Wrong answer now costs a heart and triggers the red flash.
      triggerDamage();
      addBurst(enemyX, enemyY, "miss");
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

  // Responsive scaling — measure parent width, derive a 0..1 scale factor that
  // shrinks the fixed-pixel field to fit narrow phones without breaking the
  // sprite-sheet animation (sprite step math depends on the 1620px sheet width
  // staying in pixel-perfect proportion to ENEMY_WIDTH, so we scale via CSS
  // transform instead of mutating the constants).
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    function measure() {
      if (!el) return;
      const w = el.clientWidth;
      setScale(Math.min(1, w / FIELD_WIDTH));
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="flex w-full flex-col items-center gap-2">
      <div className="flex w-full items-center justify-between rounded-xl border border-amber-400/20 bg-linear-to-b from-stone-900/80 to-stone-950/80 px-4 py-2 shadow-inner backdrop-blur-sm">
        <div
          className="flex items-center gap-1.5"
          aria-label={`${lives} of ${startingLives} lives remaining`}
        >
          {Array.from({ length: startingLives }).map((_, i) => {
            const alive = i < lives;
            const pulsing = heartPulseIdx === i;
            return (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  animation: pulsing ? "mc-heart-lose 0.5s ease-out" : undefined,
                  filter: alive
                    ? "drop-shadow(0 0 3px rgba(239,68,68,0.55))"
                    : "grayscale(1) opacity(0.55)",
                }}
              >
                <PixelIcon
                  name="heart"
                  size={22}
                  color={alive ? "#ef4444" : "#52525b"}
                />
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/85">
          <PixelIcon name="castle" size={16} color="#fcd34d" />
          <span className="text-amber-300">{killed}</span>
          <span className="text-white/50">/</span>
          <span>{enemies.length}</span>
          <span className="text-white/60">defeated</span>
        </div>
      </div>

      {/* Scaled wrapper: collapses to FIELD_HEIGHT * scale so siblings don't
          get pushed off-screen by the unscaled child. */}
      <div
        style={{
          width: FIELD_WIDTH * scale,
          height: FIELD_HEIGHT * scale,
        }}
      >
        <div
          className="relative overflow-hidden rounded-2xl ring-2 ring-white/20"
          style={{
            width: FIELD_WIDTH,
            height: FIELD_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
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
                height: ENEMY_HEIGHT + 22,
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
                className="mx-auto rounded-md border border-amber-300/60 bg-linear-to-b from-amber-100 to-amber-200 px-2 py-0.5 text-center text-[12px] font-black text-stone-900 shadow-[0_2px_0_rgba(0,0,0,0.45)]"
                style={{ width: "fit-content", transform: "translateY(-3px)" }}
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
                  imageRendering: "pixelated",
                }}
              />
            </button>
          );
        })}

        {/* Correct / miss feedback bursts positioned on the field */}
        {bursts.map((b) => (
          <div
            key={b.id}
            className="pointer-events-none absolute z-20"
            style={{
              left: b.x,
              top: b.y,
              transform: "translate(-50%, -50%)",
              animation: "mc-hit-burst 0.7s ease-out forwards",
            }}
            aria-hidden="true"
          >
            {b.kind === "hit" ? (
              <div className="flex items-center gap-1 rounded-full border-2 border-emerald-200 bg-emerald-500/95 px-2 py-0.5 text-[13px] font-black text-white shadow-[0_0_14px_rgba(16,185,129,0.9)]">
                <PixelIcon name="check" size={14} color="#ffffff" />
                <span>+1</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full border-2 border-rose-200 bg-rose-600/95 px-2 py-0.5 text-[13px] font-black text-white shadow-[0_0_14px_rgba(244,63,94,0.9)]">
                <PixelIcon name="cancel" size={14} color="#ffffff" />
              </div>
            )}
          </div>
        ))}

        {/* Red damage flash overlay — covers the field only, keyed so it
            retriggers the animation on every hit. */}
        {damageFlash > 0 && (
          <div
            key={damageFlash}
            className="pointer-events-none absolute inset-0 z-30"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(239,68,68,0.55) 0%, rgba(127,29,29,0.45) 55%, rgba(127,29,29,0) 100%)",
              animation: "mc-damage-flash 0.45s ease-out forwards",
            }}
            aria-hidden="true"
          />
        )}

        {selectedEnemy && !locked && (
          <div
            className="absolute bottom-2 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-black/80 px-3 py-2 ring-2 ring-amber-300 backdrop-blur-sm"
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
      </div>
    </div>
  );
}
