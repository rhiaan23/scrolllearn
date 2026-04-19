"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { WizardDungeonGame } from "@/lib/schema";

interface Props {
  game: WizardDungeonGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

function HpBar({ current, max, label }: { current: number; max: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-[9px] uppercase tracking-widest text-white/60">
        {label}
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-sm border border-black/50 transition-all ${
              i < current ? "bg-red-400" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const SWORD_ICONS = [
  "/wizard-dungeon/sword-a.png",
  "/wizard-dungeon/sword-b.png",
  "/wizard-dungeon/sword-c.png",
];

// Mechanic ported from edutainment-submission (Science Wizard Dungeon Quiz).
export function WizardDungeon({ game, onAnswer, locked }: Props) {
  const questions = game.data.questions;
  const N = questions.length;

  const [idx, setIdx] = useState(0);
  const [heroHp, setHeroHp] = useState(game.data.heroHp);
  const [enemyHp, setEnemyHp] = useState(game.data.enemyHp);
  const [picked, setPicked] = useState<number | null>(null);
  // "hero" = hero attacked (correct), "enemy" = enemy attacked (wrong), null = idle
  const [attackDir, setAttackDir] = useState<"hero" | "enemy" | null>(null);
  const finishedRef = useRef(false);

  const q = questions[idx];

  function settle(nextHeroHp: number, nextEnemyHp: number, nextIdx: number) {
    setAttackDir(null);
    if (nextEnemyHp <= 0) {
      finishedRef.current = true;
      onAnswer(true, `Enemy defeated! ${nextHeroHp} HP remaining`);
      return;
    }
    if (nextHeroHp <= 0) {
      finishedRef.current = true;
      onAnswer(false, `Hero fell — ${nextIdx}/${N} questions answered`);
      return;
    }
    if (nextIdx >= N) {
      finishedRef.current = true;
      const won = nextEnemyHp < game.data.enemyHp;
      onAnswer(
        won,
        `${won ? "Enemy weakened!" : "Hero survived!"} ${nextHeroHp} HP left`,
      );
      return;
    }
    setIdx(nextIdx);
    setPicked(null);
  }

  function pick(optionIdx: number) {
    if (locked || finishedRef.current || picked !== null) return;
    setPicked(optionIdx);
    const correct = optionIdx === q.correctIndex;

    if (correct) {
      const next = enemyHp - 1;
      setEnemyHp(next);
      setAttackDir("hero");
      setTimeout(() => settle(heroHp, next, idx + 1), 900);
    } else {
      const next = heroHp - 1;
      setHeroHp(next);
      setAttackDir("enemy");
      setTimeout(() => settle(next, enemyHp, idx + 1), 900);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked || finishedRef.current || picked !== null) return;
      const k = e.key.toLowerCase();
      let target = -1;
      if (/^[1-3]$/.test(k)) target = parseInt(k, 10) - 1;
      else if (/^[a-c]$/.test(k)) target = k.charCodeAt(0) - "a".charCodeAt(0);
      if (target >= 0) pick(target);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, locked, idx]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Battle scene */}
      <div
        className="relative w-full overflow-hidden rounded-lg"
        style={{
          boxShadow: "inset 0 0 0 3px #000, inset 0 0 0 6px #fff, 0 4px 0 #000",
          minHeight: "140px",
        }}
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/wizard-dungeon/background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* HP bars row */}
        <div className="relative z-10 flex items-start justify-between px-3 pt-2">
          <HpBar current={heroHp} max={game.data.heroHp} label="Hero" />
          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-white [text-shadow:1px_1px_0_#000]">
            Q {idx + 1}/{N}
          </div>
          <HpBar current={enemyHp} max={game.data.enemyHp} label="Enemy" />
        </div>

        {/* Characters */}
        <div
          className="relative z-10 flex items-end justify-between px-6 pb-2"
          style={{ minHeight: "80px" }}
        >
          {/* Hero */}
          <div
            className="h-12 w-12"
            style={{
              backgroundImage: "url('/wizard-dungeon/hero.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "bottom center",
            }}
          />

          {/* Attack projectile */}
          {attackDir && (
            <div
              className={`absolute top-1/2 h-8 w-8 ${
                attackDir === "hero"
                  ? "animate-[slideRight_0.7s_ease-in-out_forwards]"
                  : "animate-[slideLeft_0.7s_ease-in-out_forwards]"
              }`}
              style={{
                backgroundImage: `url('/wizard-dungeon/sword-${attackDir === "hero" ? "a" : "b"}.png')`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                left: attackDir === "hero" ? "20%" : "auto",
                right: attackDir === "enemy" ? "20%" : "auto",
              }}
            />
          )}

          {/* Enemy */}
          <div
            className={`h-16 w-16 transition-all ${enemyHp <= 0 ? "opacity-0" : ""}`}
            style={{
              backgroundImage: "url('/wizard-dungeon/enemy.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "bottom center",
            }}
          />
        </div>
      </div>

      {/* Question banner */}
      <div
        className="w-full rounded-md px-4 py-3 text-center font-mono text-sm font-bold leading-snug text-white"
        style={{
          background: "linear-gradient(180deg, #1a3a1a 0%, #0a1f0a 100%)",
          boxShadow: "inset 0 0 0 2px #000, inset 0 0 0 4px #4a8a4a, 0 3px 0 #000",
          textShadow: "1px 1px 0 #000, 2px 2px 0 #000",
        }}
      >
        {q.question}
      </div>

      {/* Answer buttons */}
      <div className="grid w-full grid-cols-1 gap-2">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === q.correctIndex;
          const showResult = picked !== null;
          let cls =
            "relative flex items-center gap-2 rounded-md px-3 py-2.5 font-mono text-sm font-bold transition-all";
          if (!showResult) {
            cls +=
              " bg-[#1a3a1a] text-emerald-100 shadow-[0_3px_0_#000] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-[0_1px_0_#000]";
          } else if (isCorrect) {
            cls += " bg-emerald-600 text-white shadow-[0_3px_0_#000]";
          } else if (isPicked) {
            cls += " bg-rose-600 text-white shadow-[0_3px_0_#000]";
          } else {
            cls += " bg-[#1a3a1a]/40 text-emerald-100/40 shadow-[0_2px_0_#000]/40";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={showResult || locked}
              className={cls}
            >
              <Image
                src={SWORD_ICONS[i]}
                alt={`Option ${i + 1}`}
                width={20}
                height={20}
                className="shrink-0 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
              <span className="flex-1 text-left">{opt}</span>
            </button>
          );
        })}
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-wider text-white/50">
        tap an option · or press 1-3 on the keyboard
      </p>
    </div>
  );
}
