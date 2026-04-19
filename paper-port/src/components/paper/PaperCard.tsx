// Drop at: src/components/paper/PaperCard.tsx
"use client";
import type { ReactNode } from "react";
import { paper, getPaperSubject } from "@/lib/paperTheme";
import { PaperSticker } from "./PaperSticker";

interface Props {
  subject: string;
  template?: string;     // for the uppercase pill e.g. "math_castle"
  title: string;
  prompt?: string;
  children: ReactNode;   // the game body
  caption?: { handle: string; text?: string };
  onExplain?: () => void;
  onHelp?: () => void;
  result?: { ok: boolean; message?: string; streak?: number } | null;
}

/**
 * The full feed card chrome for Sunny Paper.
 * Renders:
 *   - subject-tinted radial wash background
 *   - decorative peek shapes
 *   - template stamp pill
 *   - Fraunces serif title + prompt
 *   - <children> slot (the game body)
 *   - left caption (@handle + caption)
 *   - right rail: Explain sticker + Help sticker
 *   - centered result toast
 */
export function PaperCard({
  subject,
  template,
  title,
  prompt,
  children,
  caption,
  onExplain,
  onHelp,
  result,
}: Props) {
  const s = getPaperSubject(subject);
  return (
    <section
      className="relative h-full w-full overflow-hidden snap-start snap-always"
      style={{
        background: `linear-gradient(180deg, ${s.tint} 0%, ${paper.bg} 70%)`,
        color: paper.ink,
      }}
    >
      {/* decorative peek shapes */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: 130, right: -40, width: 120, height: 120,
          borderRadius: "28%", background: s.hi, opacity: 0.2,
          transform: "rotate(18deg)",
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          bottom: 100, left: -30, width: 90, height: 90,
          borderRadius: "30%", background: s.lo, opacity: 0.15,
          transform: "rotate(-10deg)",
        }}
      />

      <div
        className="absolute left-0 right-0 flex flex-col items-center px-5"
        style={{ top: 72, bottom: 96 }}
      >
        {template && (
          <div
            className="inline-flex items-center gap-1.5 font-display"
            style={{
              padding: "5px 11px",
              borderRadius: 999,
              background: "#fff",
              border: `2px solid ${s.lo}`,
              color: s.ink,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transform: "rotate(-1deg)",
            }}
          >
            {template.replace(/_/g, " ")}
          </div>
        )}

        <h1
          className="font-display"
          style={{
            margin: "14px 0 4px",
            fontWeight: 900,
            fontSize: 40,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            textAlign: "center",
          }}
        >
          {title}
        </h1>
        {prompt && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: paper.inkSoft,
              textAlign: "center",
              maxWidth: 280,
              lineHeight: 1.4,
              fontWeight: 600,
            }}
          >
            {prompt}
          </p>
        )}

        <div
          style={{
            marginTop: 20,
            width: "100%",
            maxWidth: 340,
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <div className="absolute z-[5]" style={{ left: 16, right: 82, bottom: 24 }}>
          <div
            className="font-display"
            style={{ fontSize: 14, fontWeight: 900, letterSpacing: "-0.01em" }}
          >
            @{caption.handle}
          </div>
          {caption.text && (
            <div
              style={{
                fontSize: 11.5,
                color: paper.inkSoft,
                marginTop: 3,
                lineHeight: 1.3,
                fontWeight: 600,
              }}
            >
              {caption.text}
            </div>
          )}
        </div>
      )}

      {/* Right rail */}
      <div
        className="absolute z-[5] flex flex-col items-center"
        style={{ right: 12, bottom: 20, gap: 10 }}
      >
        {onExplain && (
          <button
            onClick={onExplain}
            style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
            className="flex flex-col items-center"
          >
            <PaperSticker subject={subject} size={46} rot={-4} style={{ borderRadius: 14 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
                <path d="M5.5 5.5l4 4M14.5 14.5l4 4M18.5 5.5l-4 4M9.5 14.5l-4 4" />
              </svg>
            </PaperSticker>
            <div
              className="font-display"
              style={{ fontSize: 9, fontWeight: 900, marginTop: 4, letterSpacing: "0.05em" }}
            >
              EXPLAIN
            </div>
          </button>
        )}
        {onHelp && (
          <button
            onClick={onHelp}
            style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
            className="flex flex-col items-center"
          >
            <div
              style={{
                width: 42, height: 42, borderRadius: 14, background: "#fff",
                boxShadow: "0 3px 0 rgba(43,29,16,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: "rotate(3deg)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={paper.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.5 9a2.5 2.5 0 115 0c0 2-2.5 2-2.5 4" />
                <circle cx="12" cy="17" r="0.8" fill={paper.ink} />
              </svg>
            </div>
            <div
              className="font-display"
              style={{ fontSize: 9, fontWeight: 900, marginTop: 4, letterSpacing: "0.05em" }}
            >
              HELP
            </div>
          </button>
        )}
      </div>

      {/* Result toast */}
      {result && (
        <div
          className="absolute animate-[pop_0.4s_ease-out]"
          style={{
            left: "50%", top: "46%",
            transform: "translate(-50%,-50%) rotate(-2deg)",
            padding: "18px 28px",
            borderRadius: 20,
            background: "#fff",
            color: paper.ink,
            textAlign: "center",
            border: `3px solid ${result.ok ? "#0B8563" : "#E05A1F"}`,
            boxShadow: "0 16px 40px rgba(43,29,16,0.15)",
            zIndex: 20,
          }}
        >
          <div
            className="font-display"
            style={{
              fontWeight: 900, fontSize: 28,
              color: result.ok ? "#0B8563" : "#E05A1F",
              letterSpacing: "-0.02em",
            }}
          >
            {result.ok ? "Nicely done." : "Close call."}
          </div>
          {result.message && (
            <div style={{ fontSize: 12, fontWeight: 700, color: paper.inkSoft, marginTop: 4 }}>
              {result.message}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
