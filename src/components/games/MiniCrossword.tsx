"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MiniCrosswordGame } from "@/lib/schema";

interface Props {
  game: MiniCrosswordGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

type Direction = "across" | "down";
interface Cell {
  letter: string; // expected letter, "" if black
  number?: number; // clue number if this cell starts an entry
}
interface EntryWithNumber {
  number: number;
  answer: string;
  clue: string;
  row: number;
  col: number;
  direction: Direction;
}

export function MiniCrossword({ game, onAnswer, locked }: Props) {
  const size = game.data.size;
  const rawEntries = game.data.entries;

  // Build grid of expected letters, plus numbered entries.
  const { grid, entries } = useMemo(() => {
    const g: Cell[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({ letter: "" })),
    );
    for (const e of rawEntries) {
      const ans = e.answer.toUpperCase();
      for (let i = 0; i < ans.length; i++) {
        const r = e.direction === "across" ? e.row : e.row + i;
        const c = e.direction === "across" ? e.col + i : e.col;
        if (r >= 0 && r < size && c >= 0 && c < size) {
          g[r][c] = { ...g[r][c], letter: ans[i] };
        }
      }
    }
    // Number each starting cell (sorted top-left to bottom-right).
    const sorted = [...rawEntries].sort((a, b) =>
      a.row === b.row ? a.col - b.col : a.row - b.row,
    );
    const starts = new Map<string, number>();
    let n = 0;
    const numbered: EntryWithNumber[] = [];
    for (const e of sorted) {
      const k = `${e.row},${e.col}`;
      let num = starts.get(k);
      if (num === undefined) {
        num = ++n;
        starts.set(k, num);
        g[e.row][e.col] = { ...g[e.row][e.col], number: num };
      }
      numbered.push({ ...e, number: num });
    }
    return { grid: g, entries: numbered };
  }, [size, rawEntries]);

  const [letters, setLetters] = useState<string[][]>(() =>
    Array.from({ length: size }, () => Array.from({ length: size }, () => "")),
  );
  const [focus, setFocus] = useState<{ r: number; c: number; dir: Direction } | null>(null);
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

  // Check complete: every non-black cell filled correctly.
  useEffect(() => {
    if (finishedRef.current) return;
    let filled = true;
    let allCorrect = true;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c].letter === "") continue;
        if (letters[r][c] === "") filled = false;
        if (letters[r][c] !== grid[r][c].letter) allCorrect = false;
      }
    }
    if (filled && allCorrect) {
      finish(true, "Every cell is right!");
    }
  }, [letters, grid, size, finish]);

  function cellActive(r: number, c: number): boolean {
    return grid[r][c].letter !== "";
  }

  function setLetter(r: number, c: number, ch: string) {
    setLetters((prev) => {
      const next = prev.map((row) => row.slice());
      next[r][c] = ch.toUpperCase();
      return next;
    });
  }

  const advance = useCallback(
    (r: number, c: number, dir: Direction) => {
      let nr = r;
      let nc = c;
      for (let i = 0; i < size; i++) {
        if (dir === "across") nc += 1;
        else nr += 1;
        if (nr >= size || nc >= size) return;
        if (cellActive(nr, nc)) {
          setFocus({ r: nr, c: nc, dir });
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size, grid],
  );

  const retreat = useCallback(
    (r: number, c: number, dir: Direction) => {
      let nr = r;
      let nc = c;
      for (let i = 0; i < size; i++) {
        if (dir === "across") nc -= 1;
        else nr -= 1;
        if (nr < 0 || nc < 0) return;
        if (cellActive(nr, nc)) {
          setFocus({ r: nr, c: nc, dir });
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size, grid],
  );

  function handleCellClick(r: number, c: number) {
    if (locked || finishedRef.current) return;
    if (!cellActive(r, c)) return;
    setFocus((prev) => {
      if (prev && prev.r === r && prev.c === c) {
        return { r, c, dir: prev.dir === "across" ? "down" : "across" };
      }
      return { r, c, dir: prev?.dir ?? "across" };
    });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (locked || finishedRef.current || !focus) return;
      const { r, c, dir } = focus;
      if (/^[a-zA-Z]$/.test(e.key)) {
        setLetter(r, c, e.key);
        advance(r, c, dir);
      } else if (e.key === "Backspace") {
        if (letters[r][c] !== "") {
          setLetter(r, c, "");
        } else {
          retreat(r, c, dir);
        }
      } else if (e.key === "ArrowRight") {
        advance(r, c, "across");
      } else if (e.key === "ArrowLeft") {
        retreat(r, c, "across");
      } else if (e.key === "ArrowDown") {
        advance(r, c, "down");
      } else if (e.key === "ArrowUp") {
        retreat(r, c, "down");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, locked, letters, advance, retreat]);

  const activeEntry = useMemo(() => {
    if (!focus) return null;
    return entries.find((e) => {
      if (e.direction !== focus.dir) return false;
      if (e.direction === "across") {
        return e.row === focus.r && focus.c >= e.col && focus.c < e.col + e.answer.length;
      }
      return e.col === focus.c && focus.r >= e.row && focus.r < e.row + e.answer.length;
    });
  }, [focus, entries]);

  const across = entries.filter((e) => e.direction === "across");
  const down = entries.filter((e) => e.direction === "down");
  const cellPx = Math.min(54, Math.floor(320 / size));

  return (
    <div className="flex w-full flex-col items-center gap-2.5">
      {/* Current clue ticker — NYT-style: dark band with the active clue front-and-center */}
      <div className="flex min-h-[40px] w-full items-center rounded-md bg-[#3a3431] px-3 py-2">
        {activeEntry ? (
          <div className="flex w-full items-center gap-2 text-white">
            <span className="rounded bg-[#ffd700] px-1.5 py-0.5 text-[11px] font-black text-[#3a3431]">
              {activeEntry.number}
              {activeEntry.direction === "across" ? "A" : "D"}
            </span>
            <span className="flex-1 truncate text-[13px] font-medium leading-tight">
              {activeEntry.clue}
            </span>
          </div>
        ) : (
          <div className="text-[12px] font-medium text-white/70">
            Tap a cell to start · tap again to switch direction
          </div>
        )}
      </div>

      {/* Grid (NYT-style paper card) */}
      <Grid
        size={size}
        cellPx={cellPx}
        grid={grid}
        letters={letters}
        focus={focus}
        activeEntry={activeEntry}
        locked={locked}
        onCellClick={handleCellClick}
      />

      {/* Clue lists — newsprint-card look */}
      <div className="flex w-full max-w-[320px] flex-row gap-2 text-[11px]">
        <ClueList title="Across" entries={across} activeNumber={activeEntry?.number} activeDir={activeEntry?.direction} />
        <ClueList title="Down" entries={down} activeNumber={activeEntry?.number} activeDir={activeEntry?.direction} />
      </div>

      {/* Soft keyboard (single row, compact) */}
      <SoftKeyboard
        disabled={locked || finished || !focus}
        onType={(ch) => {
          if (!focus) return;
          setLetter(focus.r, focus.c, ch);
          advance(focus.r, focus.c, focus.dir);
        }}
        onBackspace={() => {
          if (!focus) return;
          if (letters[focus.r][focus.c] !== "") setLetter(focus.r, focus.c, "");
          else retreat(focus.r, focus.c, focus.dir);
        }}
      />
    </div>
  );
}

function Grid({
  size,
  cellPx,
  grid,
  letters,
  focus,
  activeEntry,
  locked,
  onCellClick,
}: {
  size: number;
  cellPx: number;
  grid: Cell[][];
  letters: string[][];
  focus: { r: number; c: number; dir: Direction } | null;
  activeEntry: EntryWithNumber | null | undefined;
  locked: boolean;
  onCellClick: (r: number, c: number) => void;
}) {
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = grid[r][c];
      const active = cell.letter !== "";
      const isFocused = focus?.r === r && focus?.c === c;
      const inActive =
        !!activeEntry &&
        ((activeEntry.direction === "across" &&
          activeEntry.row === r &&
          c >= activeEntry.col &&
          c < activeEntry.col + activeEntry.answer.length) ||
          (activeEntry.direction === "down" &&
            activeEntry.col === c &&
            r >= activeEntry.row &&
            r < activeEntry.row + activeEntry.answer.length));
      const clueNum = cell.number;
      // NYT palette: focused = #ffd700, in-word = #fdf3a3, plain = white, blocked = solid black
      let bgCls = "bg-black";
      if (active) {
        if (isFocused) bgCls = "bg-[#ffd700]";
        else if (inActive) bgCls = "bg-[#fdf3a3]";
        else bgCls = "bg-white";
      }
      cells.push(
        <button
          key={`${r},${c}`}
          type="button"
          onClick={() => onCellClick(r, c)}
          disabled={!active || locked}
          className={`relative flex items-center justify-center font-black uppercase text-[#1a1a1a] outline-none ${bgCls}`}
          style={{
            width: cellPx,
            height: cellPx,
            // Hairline black grid lines between every cell
            borderRight: c < size - 1 ? "1px solid #1a1a1a" : "none",
            borderBottom: r < size - 1 ? "1px solid #1a1a1a" : "none",
            fontSize: Math.floor(cellPx * 0.5),
            lineHeight: 1,
          }}
          aria-label={active ? `Row ${r + 1} column ${c + 1}` : "blank"}
        >
          {clueNum !== undefined && (
            <span
              className="absolute left-[2px] top-[1px] font-bold text-[#1a1a1a]"
              style={{ fontSize: Math.max(8, Math.floor(cellPx * 0.22)) }}
            >
              {clueNum}
            </span>
          )}
          <span>{letters[r][c]}</span>
        </button>,
      );
    }
  }
  return (
    <div
      className="overflow-hidden rounded-[3px] border-[3px] border-[#1a1a1a] bg-white shadow-[0_4px_0_rgba(0,0,0,0.25)]"
      style={{ width: cellPx * size + 6 }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
          gridTemplateRows: `repeat(${size}, ${cellPx}px)`,
        }}
      >
        {cells}
      </div>
    </div>
  );
}

function ClueList({
  title,
  entries,
  activeNumber,
  activeDir,
}: {
  title: string;
  entries: EntryWithNumber[];
  activeNumber?: number;
  activeDir?: Direction;
}) {
  const dirKey: Direction = title.toLowerCase() as Direction;
  return (
    <div className="flex-1 rounded-md border border-[#1a1a1a]/80 bg-[#fafaf6] p-2 text-[#1a1a1a] shadow-[0_2px_0_rgba(0,0,0,0.18)]">
      <div className="mb-1 border-b border-[#1a1a1a]/40 pb-0.5 text-[10px] font-black uppercase tracking-[0.12em]">
        {title}
      </div>
      <ul className="space-y-0.5">
        {entries.map((e) => {
          const isActive = e.number === activeNumber && activeDir === dirKey;
          return (
            <li
              key={`${e.number}-${e.direction}`}
              className={`flex gap-1 leading-tight ${
                isActive ? "rounded-sm bg-[#fdf3a3] px-1 -mx-1 font-semibold" : ""
              }`}
            >
              <span className="shrink-0 font-bold">{e.number}.</span>
              <span className="truncate">{e.clue}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const KEY_ROWS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  "ZXCVBNM".split(""),
];

function SoftKeyboard({
  onType,
  onBackspace,
  disabled,
}: {
  onType: (ch: string) => void;
  onBackspace: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-[4px]">
      {KEY_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-[4px]">
          {row.map((ch) => (
            <button
              key={ch}
              type="button"
              disabled={disabled}
              onClick={() => onType(ch)}
              className="flex h-8 min-w-[24px] items-center justify-center rounded-md bg-white px-1 text-[12px] font-bold text-[#1a1a1a] shadow-[0_2px_0_rgba(0,0,0,0.25)] transition-all active:translate-y-[2px] active:shadow-none disabled:opacity-50"
            >
              {ch}
            </button>
          ))}
          {ri === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={onBackspace}
              className="flex h-8 min-w-[32px] items-center justify-center rounded-md bg-[#3a3431] px-1 text-[13px] font-bold text-white shadow-[0_2px_0_rgba(0,0,0,0.25)] transition-all active:translate-y-[2px] active:shadow-none disabled:opacity-50"
              aria-label="Backspace"
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
