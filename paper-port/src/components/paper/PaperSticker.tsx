// Drop at: src/components/paper/PaperSticker.tsx
"use client";
import type { ReactNode, CSSProperties } from "react";
import { getPaperSubject } from "@/lib/paperTheme";

interface Props {
  subject: string;           // 'math' | 'english' | 'science'
  size?: number;             // px, default 72
  rot?: number;              // degrees, default 0
  flat?: boolean;            // skip gradient, flat hi colour
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/**
 * Hand-cut sticker — the signature shape of the Sunny Paper aesthetic.
 *
 * Usage:
 *   <PaperSticker subject="math" size={48} rot={-6}>
 *     <Icon name="calc" size={22} color="#fff" />
 *   </PaperSticker>
 */
export function PaperSticker({
  subject,
  size = 72,
  rot = 0,
  flat = false,
  children,
  className,
  style,
  onClick,
}: Props) {
  const s = getPaperSubject(subject);
  const Tag = (onClick ? "button" : "div") as "button" | "div";
  return (
    <Tag
      onClick={onClick}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        transform: `rotate(${rot}deg)`,
        background: flat ? s.hi : `linear-gradient(160deg, ${s.hi}, ${s.lo})`,
        border: "3px solid #fff",
        boxShadow: `0 2px 0 ${s.ink}33, 0 10px 20px rgba(43,29,16,0.15)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : undefined,
        padding: 0,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
