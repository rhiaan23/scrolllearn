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
 * Slide one row to the LEFT, merging the first adjacent pair (in scan order)
 * whose values sum to `target`. Merged tile becomes `target` (the gold).
 * Returns: { row, mergedHere } where mergedHere is the count of merges in this row.
 */
function slideRowLeft(row: Cell[], target: number): { row: Cell[]; merged: number } {
  // 1. Compact non-null values to the left.
  const compact: number[] = row.filter((v): v is number => v !== null);
  let merged = 0;

  // 2. Scan adjacent pairs, merging where sum == target. Each tile merges at most once.
  const out: number[] = [];
  let i = 0;
  while (i < compact.length) {
    const a = compact[i];
    const b = compact[i + 1];
    if (b !== undefined && a + b === target) {
      out.push(target);
      merged++;
      i += 2;
    } else {
      out.push(a);
      i += 1;
    }
  }

  // 3. Pad with nulls back to row width.
  const padded: Cell[] = [...out, ...Array(row.length - out.length).fill(null)];
  return { row: padded, merged };
}

function slide(grid: Grid, dir: Direction, target: number): { grid: Grid; merged: number } {
  let g = cloneGrid(grid);
  if (dir === "right") g = reverseRows(g);
  if (dir === "up") g = transpose(g);
  if (dir === "down") g = reverseRows(transpose(g));

  let totalMerged = 0;
  g = g.map((row) => {
    const r = slideRowLeft(row, target);
    totalMerged += r.merged;
    return r.row;
  });

  if (dir === "right") g = reverseRows(g);
  if (dir === "up") g = transpose(g);
  if (dir === "down") g = transpose(reverseRows(g));
  return { grid: g, merged: totalMerged };
}

function gridsEqual(a: Grid, b: Grid): boolean {
  for (let r = 0; r < a.length; r++) {
    for (let c = 0; c < a[r].length; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

function spawnRandom(grid: Grid, target: number): Grid {
  const empties: [number, number][] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === null) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return grid;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  // Spawn a tile in [1, target-1] to keep merges achievable.
  const value = 1 + Math.floor(Math.random() * (target - 1));
  const next = cloneGrid(grid);
  next[r][c] = value;
  return next;
}

function hasAnyMove(grid: Grid, target: number): boolean {
  for (const dir of ["left", "right", "up", "down"] as Direction[]) {
    const { grid: after } = slide(grid, dir, target);
    if (!gridsEqual(grid, after)) return true;
  }
  return false;
}

const TILE_BG: Record<string, string> = {
  empty: "bg-white/5",
  small: "bg-white/20 text-white",
  big: "bg-white/30 text-white",
  gold: "bg-amber-300 text-amber-950 ring-2 ring-amber-200",
};

function tileClass(value: Cell, target: number): string {
  if (value === null) return TILE_BG.empty;
  if (value === target) return TILE_BG.gold;
  if (value >= target / 2) return TILE_BG.big;
  return TILE_BG.small;
}

export function MergeMath({ game, onAnswer, locked }: Props) {
  const [grid, setGrid] = useState<Grid>(() =>
    game.data.startGrid.map((row) => row.slice()),
  );
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const target = game.data.target;
  const winMerges = game.data.winMerges ?? 3;

  // Latch results so we don't double-fire onAnswer.
  const finishedRef = useRef(false);
  function finish(isCorrect: boolean, description: string) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDone(true);
    onAnswer(isCorrect, description);
  }

  const tryMove = useCallback(
    (dir: Direction) => {
      if (locked || done) return;
      const { grid: after, merged } = slide(grid, dir, target);
      if (gridsEqual(grid, after)) return; // no-op, don't spawn
      const newScore = score + merged;
      const withSpawn = spawnRandom(after, target);
      setGrid(withSpawn);
      setScore(newScore);

      if (newScore >= winMerges) {
        finish(true, `merged ${newScore} pairs to ${target}`);
        return;
      }
      if (!hasAnyMove(withSpawn, target)) {
        finish(false, `stuck — no more merges to ${target}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grid, score, target, winMerges, locked, done],
  );

  // Keyboard controls
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

  // Touch swipe (within the grid only — page-level snap-scroll handles vertical card swipes)
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
    // Only intercept if the swipe is clearly horizontal — leave vertical for the
    // page snap-scroll. (Up/Down on grid still work via arrow keys.)
    if (ax > ay) {
      e.preventDefault();
      tryMove(dx > 0 ? "right" : "left");
    } else {
      // small grid-level vertical assist if user is clearly aiming at the grid
      if (ay > 80) {
        e.preventDefault();
        tryMove(dy > 0 ? "down" : "up");
      }
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Target + score banner */}
      <div className="flex w-full items-center justify-between rounded-xl bg-black/30 px-4 py-2 backdrop-blur-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-white/70">
          Merge to <span className="text-amber-300">{target}</span>
        </div>
        <div className="flex gap-3 text-sm font-bold text-white">
          <span>
            ⚡ <span className="text-amber-300">{score}</span>/{winMerges}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid w-full max-w-[340px] grid-cols-4 gap-2 rounded-2xl bg-black/20 p-2 touch-none select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="grid"
        aria-label="Merge math grid"
      >
        {grid.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`flex aspect-square items-center justify-center rounded-lg text-2xl font-extrabold transition-all ${tileClass(
                cell,
                target,
              )}`}
            >
              {cell ?? ""}
            </div>
          )),
        )}
      </div>

      {/* Direction hints */}
      <div className="flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-wider text-white/60">
        <span>↑</span>
        <span>↓</span>
        <span>←</span>
        <span>→</span>
        <span className="text-white/40">arrows or swipe</span>
      </div>
    </div>
  );
}
