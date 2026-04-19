"use client";

import { useEffect, useState } from "react";

const COLORS = [
  "#FF6B6B", // red
  "#FFD93D", // yellow
  "#6BCB77", // green
  "#4D96FF", // blue
  "#FF95E1", // pink
  "#A78BFA", // purple
  "#FF9A3D", // orange
];

const PIECE_COUNT = 36;

interface Piece {
  id: string;
  cx: number; // horizontal end offset (px)
  cy: number; // vertical end offset (px)
  cr: number; // total rotation (deg)
  color: string;
  width: number;
  height: number;
  delay: number;
}

/**
 * One-shot confetti burst.
 * `trigger` is a number that, when changed, fires a fresh burst. Pass an
 * incrementing counter from the parent (or `Date.now()` on a win event).
 */
export function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const arr: Piece[] = Array.from({ length: PIECE_COUNT }, (_, i) => {
      // Spread pieces in a fan-shaped burst.
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const distance = 120 + Math.random() * 160;
      const w = 6 + Math.random() * 6;
      return {
        id: `${trigger}-${i}`,
        cx: Math.cos(angle) * distance,
        cy: Math.sin(angle) * distance,
        cr: (Math.random() - 0.5) * 720,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        width: w,
        height: w * 0.5,
        delay: Math.random() * 120,
      };
    });
    setPieces(arr);

    const t = setTimeout(() => setPieces([]), 1800);
    return () => clearTimeout(t);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="animate-confetti-burst absolute left-1/2 top-1/2 block"
          style={
            {
              backgroundColor: p.color,
              width: `${p.width}px`,
              height: `${p.height}px`,
              borderRadius: "1px",
              boxShadow: "0 1px 0 rgba(0,0,0,0.2)",
              animationDelay: `${p.delay}ms`,
              ["--cx" as string]: `${p.cx}px`,
              ["--cy" as string]: `${p.cy}px`,
              ["--cr" as string]: `${p.cr}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
