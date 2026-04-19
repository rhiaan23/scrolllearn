"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { WordBuilderGame } from "@/lib/schema";
import { PixelIcon } from "@/components/PixelIcon";
import { emojiToIconSlug } from "@/lib/emojiToIcon";
import { paper } from "@/lib/theme";

interface Props {
  game: WordBuilderGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

const DISTRACTORS = "abcdefghijklmnopqrstuvwxyz".split("");

function shuffled<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function makePool(answer: string): string[] {
  const letters = answer.toLowerCase().split("");
  const used = new Set(letters);
  const distractors: string[] = [];
  const want = answer.length <= 4 ? 2 : 1;
  for (const d of shuffled(DISTRACTORS)) {
    if (distractors.length >= want) break;
    if (!used.has(d)) distractors.push(d);
  }
  return shuffled([...letters, ...distractors]);
}

export function WordBuilder({ game, onAnswer, locked }: Props) {
  const [wordIdx, setWordIdx] = useState(0);
  const finishedRef = useRef(false);

  function onWordComplete() {
    if (finishedRef.current) return;
    if (wordIdx + 1 >= game.data.words.length) {
      finishedRef.current = true;
      const total = game.data.words.length;
      const list = game.data.words.map((w) => w.answer.toLowerCase()).join(", ");
      const prefix = total === 1 ? "spelled" : `spelled all ${total}:`;
      onAnswer(true, `${prefix} ${list}`);
    } else {
      setWordIdx((i) => i + 1);
    }
  }

  return (
    <WordRound
      key={wordIdx}
      word={game.data.words[wordIdx]}
      stepLabel={`word ${wordIdx + 1} of ${game.data.words.length}`}
      onComplete={onWordComplete}
      locked={locked}
    />
  );
}

interface RoundProps {
  word: WordBuilderGame["data"]["words"][number];
  stepLabel: string;
  onComplete: () => void;
  locked: boolean;
}

function WordRound({ word, stepLabel, onComplete, locked }: RoundProps) {
  const answer = word.answer.toLowerCase();
  const [pool] = useState<string[]>(() => makePool(answer));

  // assignment[slotIdx] = poolIdx of the letter placed there, or null
  const [assignment, setAssignment] = useState<(number | null)[]>(() =>
    new Array(answer.length).fill(null),
  );
  const [shake, setShake] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const checkingRef = useRef(false); // prevent double-checks during reset timeout

  // Derived: which pool indices are currently in use, and the spelled word
  const usedSet = useMemo(() => new Set(assignment.filter((v): v is number => v !== null)), [assignment]);
  const spelled = useMemo(
    () => assignment.map((p) => (p === null ? "" : pool[p])).join(""),
    [assignment, pool],
  );

  function placeLetter(poolIdx: number) {
    if (locked || celebrating || checkingRef.current) return;
    if (usedSet.has(poolIdx)) return;
    const nextSlot = assignment.indexOf(null);
    if (nextSlot === -1) return;
    const next = assignment.slice();
    next[nextSlot] = poolIdx;
    setAssignment(next);

    // Auto-check when all slots are filled.
    if (next.every((s) => s !== null)) {
      checkingRef.current = true;
      const candidate = next.map((p) => pool[p as number]).join("");
      if (candidate === answer) {
        setCelebrating(true);
        setTimeout(() => onComplete(), 700);
      } else {
        // Wrong: shake, then clear so the user can retry without bouncing the card.
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setAssignment(new Array(answer.length).fill(null));
          checkingRef.current = false;
        }, 500);
      }
    }
  }

  function unplaceSlot(slotIdx: number) {
    if (locked || celebrating || checkingRef.current) return;
    if (assignment[slotIdx] === null) return;
    const next = assignment.slice();
    next[slotIdx] = null;
    setAssignment(next);
  }

  function unplaceLast() {
    if (locked || celebrating || checkingRef.current) return;
    // Find the last non-null slot.
    let lastFilled = -1;
    for (let i = assignment.length - 1; i >= 0; i--) {
      if (assignment[i] !== null) {
        lastFilled = i;
        break;
      }
    }
    if (lastFilled === -1) return;
    unplaceSlot(lastFilled);
  }

  // Keyboard: type any letter → place the first unused matching pool letter
  // into the next empty slot. Backspace → undo the last placement.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked || celebrating || checkingRef.current) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        unplaceLast();
        return;
      }
      if (!/^[a-zA-Z]$/.test(e.key)) return;
      const ch = e.key.toLowerCase();
      const poolIdx = pool.findIndex((p, i) => p === ch && !usedSet.has(i));
      if (poolIdx === -1) return;
      placeLetter(poolIdx);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, locked, celebrating, pool]);

  const correctSoFar = celebrating || spelled === answer;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Hint */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative flex h-[120px] w-[160px] items-center justify-center overflow-hidden rounded-xl"
          style={{
            background: "#FFFFFF",
            border: `2px solid ${paper.ink}22`,
            boxShadow: "0 3px 0 rgba(43,29,16,0.08)",
          }}
        >
          {(() => {
            const slug = emojiToIconSlug(word.emoji);
            return slug ? (
              <PixelIcon name={slug} size={72} color={paper.ink} />
            ) : (
              <div
                className="font-display text-2xl font-black uppercase tracking-widest"
                style={{ color: paper.ink }}
              >
                {word.emoji || word.hint.split(" ").slice(0, 2).join(" ")}
              </div>
            );
          })()}
        </div>
        <div
          className="font-display text-[12px] font-black uppercase tracking-[0.18em]"
          style={{ color: paper.ink }}
        >
          {word.hint}
        </div>
        <div
          className="font-body text-[10px] font-semibold"
          style={{ color: paper.inkSoft }}
        >
          {stepLabel}
        </div>
      </div>

      {/* Slots — tap a filled slot to send its letter back to the pool */}
      <div className={`flex gap-2 ${shake ? "animate-shake" : ""}`}>
        {assignment.map((poolIdx, i) => {
          const ch = poolIdx === null ? null : pool[poolIdx];
          return (
            <button
              key={i}
              type="button"
              disabled={poolIdx === null || locked || celebrating}
              onClick={() => unplaceSlot(i)}
              aria-label={ch ? `Remove ${ch} from slot ${i + 1}` : `Empty slot ${i + 1}`}
              className={`flex h-12 w-10 items-center justify-center rounded-lg border-b-4 text-2xl font-black uppercase shadow-[0_2px_0_rgba(43,29,16,0.12)] transition-colors ${
                ch
                  ? correctSoFar
                    ? "border-emerald-600 bg-emerald-300 text-emerald-950"
                    : "border-[#2B1D10]/70 bg-white text-[#2B1D10]"
                  : "border-[#2B1D10]/30 bg-white/70 text-[#2B1D10]/30"
              }`}
            >
              {ch ?? ""}
            </button>
          );
        })}
      </div>

      {/* Letter pool — tap any letter to drop into the next empty slot */}
      <div className="flex flex-wrap justify-center gap-2">
        {pool.map((letter, i) => {
          const isUsed = usedSet.has(i);
          return (
            <button
              key={i}
              type="button"
              disabled={isUsed || locked || celebrating}
              onClick={() => placeLetter(i)}
              className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 text-xl font-bold uppercase shadow-[0_2px_0_rgba(43,29,16,0.12)] transition-all active:scale-90 ${
                isUsed
                  ? "border-[#2B1D10]/15 bg-[#2B1D10]/5 text-[#2B1D10]/25"
                  : "border-[#2B1D10]/40 bg-white text-[#2B1D10] hover:bg-[#F3E8CF]"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={unplaceLast}
        disabled={!assignment.some((v) => v !== null) || celebrating}
        className="font-body text-xs font-semibold underline-offset-2 hover:underline disabled:opacity-30"
        style={{ color: paper.inkSoft }}
      >
        ← undo last
      </button>
    </div>
  );
}
