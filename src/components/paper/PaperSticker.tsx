"use client";

import type { CSSProperties, ReactNode } from "react";
import { paper, type PaperSubject } from "@/lib/theme";

type Tone = PaperSubject | "ink" | "cream";

interface Props {
  tone?: Tone;
  rot?: number; // degrees
  size?: number; // px — square sticker; ignored if `padded`
  padded?: boolean; // if true, sticker sizes to content with label padding
  label?: string;
  onClick?: () => void;
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
}

function palette(tone: Tone): { fill: string; text: string } {
  if (tone === "ink") return { fill: paper.ink, text: "#FFFFFF" };
  if (tone === "cream") return { fill: paper.bg, text: paper.ink };
  const p = paper[tone];
  return {
    fill: `linear-gradient(145deg, ${p.hi} 0%, ${p.lo} 100%)`,
    text: "#FFFFFF",
  };
}

export function PaperSticker({
  tone = "ink",
  rot = -4,
  size = 56,
  padded = false,
  label,
  onClick,
  ariaLabel,
  children,
  className = "",
}: Props) {
  const { fill, text } = palette(tone);

  const baseStyle: CSSProperties = {
    background: fill,
    color: text,
    border: "3px solid #ffffff",
    borderRadius: 18,
    filter: "drop-shadow(0 6px 10px rgba(43,29,16,0.18))",
    transform: `rotate(${rot}deg)`,
  };

  const sizing: CSSProperties = padded
    ? { padding: "8px 14px" }
    : { width: size, height: size };

  const Component: "button" | "div" = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center font-display font-extrabold transition-transform active:scale-95 ${className}`}
      style={{ ...baseStyle, ...sizing }}
    >
      <span className="flex items-center gap-1.5 leading-none">
        {children}
        {label && <span className="text-[13px] tracking-tight">{label}</span>}
      </span>
    </Component>
  );
}
