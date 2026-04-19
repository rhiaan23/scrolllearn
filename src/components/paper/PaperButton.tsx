"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { paper, type PaperSubject } from "@/lib/theme";

type Variant = "primary" | "ghost" | "ink";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  subject?: PaperSubject;
  size?: "sm" | "md" | "lg";
}

function palette(variant: Variant, subject?: PaperSubject) {
  if (variant === "primary" && subject) {
    const p = paper[subject];
    return {
      background: `linear-gradient(145deg, ${p.hi} 0%, ${p.lo} 100%)`,
      color: "#FFFFFF",
      border: `2px solid ${p.ink}20`,
    };
  }
  if (variant === "ink") {
    return { background: paper.ink, color: "#FFFFFF", border: "2px solid transparent" };
  }
  return {
    background: paper.bg,
    color: paper.ink,
    border: `2px dashed ${paper.ink}40`,
  };
}

export function PaperButton({
  variant = "primary",
  subject = "math",
  size = "md",
  className = "",
  children,
  style,
  ...rest
}: Props) {
  const p = palette(variant, subject);

  const pad =
    size === "sm"
      ? "px-3 py-1.5 text-[13px]"
      : size === "lg"
        ? "px-6 py-3 text-base"
        : "px-5 py-2.5 text-sm";

  const baseStyle: CSSProperties = {
    background: p.background,
    color: p.color,
    border: p.border,
    borderRadius: 999,
    boxShadow: "0 3px 0 rgba(43,29,16,0.12)",
    ...style,
  };

  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 font-body font-extrabold leading-none tracking-tight transition-transform active:translate-y-[2px] active:shadow-[0_1px_0_rgba(43,29,16,0.12)] disabled:opacity-60 ${pad} ${className}`}
      style={baseStyle}
    >
      {children}
    </button>
  );
}
