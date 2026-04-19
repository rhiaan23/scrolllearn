"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MergeMathGame } from "@/lib/schema";

interface Props {
  game: MergeMathGame;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

type Cell = number | null;
type Grid = Cell[][];
type Direction = "up" | "down" | "left" | "right";

function cloneGrid(g: Grid): Grid {
  return g.map((row) => row.slice());
}

function transpose(g: Grid): Grid {
  return g[0].map((_, c) => g.map((row) => row[c]));
}

function reverseRows(g: Grid): Grid {
  return g.map((row) => row.slice().reverse());
}

/**
 * 2048 row mechanic: compact non-null values to the LEFT, then walk through
 * the compacted array merging adjacent equal pairs into doubled values.
 * Each tile may merge at most once per move.
 */
function slideRowLeft(row: Cell[]): { row: Cell[]; mergedValue: number } {
  const compact = row.filter((v): v is number => v !== null);
  const out: number[] = [];
  let mergedValue = 0; // largest tile produced this move (informational)
  let i = 0;
  while (i < compact.length) {
    const a = compact[i];
    const b = compact[i + 1];
    if (b !== undefined && a === b) {
      const doubled = a * 2;
      out.push(doubled);
      mergedValue = Math.max(mergedValue, doubled);
      i += 2;
    } else {
      out.push(a);
      i += 1;
    }
  }
  const padded: Cell[] = [...out, ...Array(row.length - out.length).fill(null)];
  return { row: padded, mergedValue };
}

function slide(grid: Grid, dir: Direction): { grid: Grid; mergedValue: number } {
  let g = cloneGrid(grid);
  if (dir === "right") g = reverseRows(g);
  if (dir === "up") g = transpose(g);
  if (dir === "down") g = reverseRows(transpose(g));

  let topMerged = 0;
  g = g.map((row) => {
    const r = slideRowLeft(row);
    if (r.mergedValue > topMerged) topMerged = r.mergedValue;
    return r.row;
  });

  if (dir === "right") g = reverseRows(g);
  if (dir === "up") g = transpose(g);
  if (dir === "down") g = transpose(reverseRows(g));
  return { grid: g, mergedValue: topMerged };
}

function gridsEqual(a: Grid, b: Grid): boolean {
  for (let r = 0; r < a.length; r++) {
    for (let c = 0; c < a[r].length; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

function spawnRandom(grid: Grid): Grid {
  const empties: [number, number][] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === null) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return grid;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  // 90% spawn a 2, 10% spawn a 4 — classic 2048.
  const value = Math.random() < 0.9 ? 2 : 4;
  const next = cloneGrid(grid);
  next[r][c] = value;
  return next;
}

function maxTile(grid: Grid): number {
  let m = 0;
  for (const row of grid) for (const c of row) if (c !== null && c > m) m = c;
  return m;
}

function hasAnyMove(grid: Grid): boolean {
  for (const dir of ["left", "right", "up", "down"] as Direction[]) {
    const { grid: after } = slide(grid, dir);
    if (!gridsEqual(grid, after)) return true;
  }
  return false;
}

// Tailwind-safe lookup (full classes so JIT keeps them).
const TILE_STYLES: Record<number, string> = {
  0: "bg-white/5",
  2: "bg-amber-50 text-amber-950",
  4: "bg-amber-100 text-amber-950",
  8: "bg-orange-300 text-orange-950",
  16: "bg-orange-400 text-white",
  32: "bg-rose-400 text-white",
  64: "bg-rose-500 text-white",
  128: "bg-amber-400 text-amber-950 ring-2 ring-amber-200",
  256: "bg-amber-300 text-amber-950 ring-2 ring-amber-200",
};

function tileClass(value: Cell): string {
  if (value === null) return TILE_STYLES[0];
  return TILE_STYLES[value] ?? "bg-amber-300 text-amber-950 ring-2 ring-amber-200";
}

function tileFontClass(value: Cell): string {
  if (value === null) return "text-2xl";
  if (value < 100) return "text-2xl";
  if (value < 1000) return "text-xl";
  return "text-base";
}

export function MergeMath({ game, onAnswer, locked }: Props) {
  const [grid, setGrid] = useState<Grid>(() =>
    game.data.startGrid.map((row) => row.slice()),
  );
  const target = game.data.target;
  const winTile = game.data.winTile ?? target;
  const [highest, setHighest] = useState(() => maxTile(game.data.startGrid));
  const [done, setDone] = useState(false);

  const finishedRef = useRef(false);
  const finish = useCallback(
    (isCorrect: boolean, description: string) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setDone(true);
      onAnswer(isCorrect, description);
    },
    [onAnswer],
  );

  const tryMove = useCallback(
    (dir: Direction) => {
      if (locked || done) return;
      const { grid: after } = slide(grid, dir);
      if (gridsEqual(grid, after)) return;
      const withSpawn = spawnRandom(after);
      const top = maxTile(withSpawn);
      setGrid(withSpawn);
      if (top > highest) setHighest(top);

      if (top >= winTile) {
        finish(true, `built a ${winTile} tile`);
        return;
      }
      if (!hasAnyMove(withSpawn)) {
        finish(false, `stuck — no merges left (best: ${top})`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grid, locked, done, winTile, highest],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          tryMove("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          tryMove("right");
          break;
        case "ArrowUp":
          e.preventDefault();
          tryMove("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          tryMove("down");
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tryMove]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    const THRESH = 30;
    if (Math.max(ax, ay) < THRESH) return;
    if (ax > ay) {
      e.preventDefault();
      tryMove(dx > 0 ? "right" : "left");
    } else {
      if (ay > 80) {
        e.preventDefault();
        tryMove(dy > 0 ? "down" : "up");
      }
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between rounded-xl bg-black/30 px-4 py-2 backdrop-blur-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-white/70">
          Build a <span className="text-amber-300">{winTile}</span> tile
        </div>
        <div className="flex gap-3 text-sm font-bold text-white">
          <span>
            🏆 best <span className="text-amber-300">{highest}</span>
          </span>
        </div>
      </div>

      <div
        className="grid w-full max-w-[340px] grid-cols-4 gap-2 rounded-2xl bg-black/20 p-2 touch-none select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="grid"
        aria-label="2048 grid"
      >
        {grid.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`flex aspect-square items-center justify-center rounded-lg font-extrabold transition-all ${tileClass(
                cell,
              )} ${tileFontClass(cell)}`}
            >
              {cell ?? ""}
            </div>
          )),
        )}
      </div>

      <div className="flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-wider text-white/60">
        <span>↑</span>
        <span>↓</span>
        <span>←</span>
        <span>→</span>
        <span className="text-white/40">arrows or swipe · same tiles double</span>
      </div>
    </div>
  );
}
