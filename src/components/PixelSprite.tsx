"use client";

import Image from "next/image";

interface Props {
  src: string;
  alt?: string;
  /** Intrinsic width of the source PNG (required by next/image). */
  width: number;
  /** Intrinsic height of the source PNG (required by next/image). */
  height: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PixelSprite({
  src,
  alt = "",
  width,
  height,
  className = "",
  style,
}: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={`pixelated ${className}`}
      style={style}
    />
  );
}

export interface MonsterSprite {
  src: string;
  w: number;
  h: number;
}

// Ordered by the score they unlock at (score 0 → vampire, score 5+ → jumping-demon).
// Intrinsic dimensions match the PNGs in /public/sprites/monsters/.
export const MONSTER_SPRITES: readonly MonsterSprite[] = [
  { src: "/sprites/monsters/vampire.png", w: 121, h: 110 },
  { src: "/sprites/monsters/witch.png", w: 55, h: 96 },
  { src: "/sprites/monsters/demon.png", w: 112, h: 153 },
  { src: "/sprites/monsters/treant.png", w: 80, h: 84 },
  { src: "/sprites/monsters/fire-haunt.png", w: 112, h: 128 },
  { src: "/sprites/monsters/jumping-demon.png", w: 101, h: 98 },
];
