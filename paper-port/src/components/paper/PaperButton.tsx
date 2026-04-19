// Drop at: src/components/paper/PaperButton.tsx
"use client";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { paper, getPaperSubject } from "@/lib/paperTheme";

type Variant = "ink" | "subject" | "white";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  subject?: string;      // required when variant="subject"
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

/**
 * Chunky paper button — signature "3-px press depth" drop shadow.
 * - variant="ink"     → dark inky pill on cream (primary CTA)
 * - variant="subject" → subject-gradient pill (game actions)
 * - variant="white"   → white sticker pill (secondary)
 */
export function PaperButton({
  variant = "ink",
  subject,
  size = "md",
  children,
  style,
  className,
  ...rest
}: Props) {
  const s = subject ? getPaperSubject(subject) : null;
  const pad =
    size === "sm" ? "8px 14px" :
    size === "lg" ? "16px 24px" :
                    "12px 20px";
  const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  let bg: string;
  let color: string;
  let shadow: string;
  switch (variant) {
    case "subject":
      bg = `linear-gradient(135deg, ${s!.hi}, ${s!.lo})`;
      color = "#fff";
      shadow = `0 3px 0 ${s!.ink}33`;
      break;
    case "white":
      bg = "#fff";
      color = paper.ink;
      shadow = "0 3px 0 rgba(43,29,16,0.12)";
      break;
    case "ink":
    default:
      bg = paper.ink;
      color = paper.bg;
      shadow = "0 3px 0 rgba(43,29,16,0.3)";
      break;
  }

  return (
    <button
      {...rest}
      className={className}
      style={{
        border: "none",
        borderRadius: 999,
        padding: pad,
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: 900,
        fontSize,
        background: bg,
        color,
        boxShadow: shadow,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
