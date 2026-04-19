"use client";

import type { CSSProperties, ReactNode } from "react";
import { paper, type PaperSubject } from "@/lib/theme";

interface Props {
  subject: PaperSubject;
  templateLabel?: string;
  title?: string;
  caption?: string;
  rightRail?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function PaperCard({
  subject,
  templateLabel,
  title,
  caption,
  rightRail,
  children,
  className = "",
  style,
}: Props) {
  const p = paper[subject];

  const cardStyle: CSSProperties = {
    background: [
      `radial-gradient(120% 80% at 20% 0%, #FFFFFF 0%, ${p.tint} 55%, transparent 100%)`,
      p.tint,
    ].join(", "),
    borderRadius: 28,
    border: `2px solid ${p.ink}18`,
    color: p.ink,
    boxShadow: "0 18px 36px rgba(43,29,16,0.12), 0 3px 0 rgba(43,29,16,0.08)",
    ...style,
  };

  return (
    <div
      className={`paper-grain relative flex flex-col overflow-hidden ${className}`}
      style={cardStyle}
    >
      {(templateLabel || title) && (
        <header className="relative z-10 flex items-start justify-between gap-3 px-5 pt-4">
          <div className="flex flex-col gap-2">
            {templateLabel && (
              <span
                className="inline-flex w-max items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-[0.18em]"
                style={{
                  border: `1.5px dashed ${p.ink}66`,
                  color: p.ink,
                  background: "rgba(255,255,255,0.35)",
                }}
              >
                {templateLabel}
              </span>
            )}
            {title && (
              <h3
                className="font-display text-[22px] font-extrabold leading-tight"
                style={{ color: p.ink }}
              >
                {title}
              </h3>
            )}
          </div>
          {rightRail && <div className="flex-shrink-0">{rightRail}</div>}
        </header>
      )}

      <div className="relative z-10 flex-1 min-h-0">{children}</div>

      {caption && (
        <footer
          className="relative z-10 px-5 pb-4 pt-2 font-body text-[14px] font-semibold leading-snug"
          style={{ color: p.ink }}
        >
          {caption}
        </footer>
      )}
    </div>
  );
}
