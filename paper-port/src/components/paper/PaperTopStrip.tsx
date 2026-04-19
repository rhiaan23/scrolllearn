// Drop at: src/components/paper/PaperTopStrip.tsx
"use client";
import { paper, getPaperSubject } from "@/lib/paperTheme";
import type { Subject } from "@/lib/schema";

interface Props {
  screenMsLeft: number;      // ms remaining of 10-min budget
  screenMsTotal?: number;    // default 10 * 60 * 1000
  streak: number;
  score: number;
  badge?: "pill" | "ring" | "coin" | "off";
  activeSubject: "all" | Subject;
  onSubjectChange: (s: "all" | Subject) => void;
}

const TABS: { key: "all" | Subject; label: string }[] = [
  { key: "all",     label: "All" },
  { key: "math",    label: "Math" },
  { key: "english", label: "English" },
  { key: "science", label: "Science" },
];

/**
 * Top strip for Sunny Paper feed: wordmark + badges + screen-time tube + subject tabs.
 * Meant to replace/augment TopNavbar + the subject tab row in feed/page.tsx.
 */
export function PaperTopStrip({
  screenMsLeft,
  screenMsTotal = 10 * 60 * 1000,
  streak,
  score,
  badge = "pill",
  activeSubject,
  onSubjectChange,
}: Props) {
  const pct = Math.max(0, Math.min(100, (screenMsLeft / screenMsTotal) * 100));
  const mins = Math.floor(screenMsLeft / 60000);
  const secs = Math.floor((screenMsLeft % 60000) / 1000).toString().padStart(2, "0");

  return (
    <div className="relative z-20 flex flex-col gap-2 px-3 py-2" style={{ background: paper.bg }}>
      <div className="flex items-center justify-between">
        <div
          className="font-display"
          style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.03em", color: paper.ink }}
        >
          Fun
          <span style={{ fontStyle: "italic", color: paperSubject_math_lo }}>Feed</span>
        </div>
        <Badges streak={streak} score={score} badge={badge} />
      </div>

      {/* Screen time tube */}
      <div
        className="flex items-center gap-2"
        style={{
          padding: "7px 11px",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 0 rgba(43,29,16,0.06)",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={paper.inkSoft} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 8v5l3 2M10 2h4M12 2v3" />
        </svg>
        <span
          style={{
            fontSize: 10, fontWeight: 800, color: paper.inkSoft,
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}
        >
          Screen
        </span>
        <div
          style={{
            flex: 1, height: 7, borderRadius: 4,
            background: paper.bg2, overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 4,
              background: `linear-gradient(90deg, #20B48A, #0B8563)`,
            }}
          />
        </div>
        <div
          style={{
            fontSize: 11, fontWeight: 900, color: paper.ink,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {mins}:{secs}
        </div>
      </div>

      {/* Subject tabs */}
      <div className="flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => {
          const active = activeSubject === t.key;
          const s = t.key === "all" ? null : getPaperSubject(t.key);
          return (
            <button
              key={t.key}
              onClick={() => onSubjectChange(t.key)}
              style={{
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
                padding: "7px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                borderRadius: 12,
                fontFamily: "inherit",
                fontWeight: 900,
                fontSize: 13,
                background: active ? (s ? s.hi : paper.ink) : "#fff",
                color: active ? "#fff" : paper.ink,
                boxShadow: active
                  ? "0 2px 0 rgba(43,29,16,0.2)"
                  : "0 2px 0 rgba(43,29,16,0.06)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const paperSubject_math_lo = "#E05A1F";

function Badges({
  streak,
  score,
  badge,
}: {
  streak: number;
  score: number;
  badge: "pill" | "ring" | "coin" | "off";
}) {
  if (badge === "off") return null;

  if (badge === "ring") {
    const pct = Math.min(1, streak / 10);
    return (
      <div className="relative" style={{ width: 44, height: 44 }}>
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="#fff" stroke={paper.bg2} strokeWidth="3" />
          <circle
            cx="22" cy="22" r="18" fill="none"
            stroke="#E05A1F" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${pct * 113} 113`}
            transform="rotate(-90 22 22)"
          />
        </svg>
        <div
          className="font-display absolute inset-0 flex items-center justify-center"
          style={{ fontWeight: 900, fontSize: 14, color: paper.ink }}
        >
          {streak}
        </div>
      </div>
    );
  }

  if (badge === "coin") {
    return (
      <div
        className="flex items-center gap-1"
        style={{
          background: "#fff",
          padding: "5px 11px 5px 5px",
          borderRadius: 12,
          boxShadow: "0 2px 0 rgba(43,29,16,0.06)",
        }}
      >
        <div
          className="font-display"
          style={{
            width: 26, height: 26, borderRadius: "50%",
            background: "linear-gradient(145deg, #FF8A4A, #E05A1F)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 13,
            boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.15)",
          }}
        >
          $
        </div>
        <span style={{ fontWeight: 900, fontSize: 14, color: paper.ink }}>{score}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      <div
        className="flex items-center gap-1"
        style={{
          padding: "5px 10px", borderRadius: 12,
          background: "#FFE2C8", color: "#7A2A0A",
          fontWeight: 900, fontSize: 13,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A2A0A" strokeWidth="2" strokeLinecap="round">
          <path d="M12 3s5 4 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 0-1 4 2 4s-2-6 1-10z" />
        </svg>
        {streak}
      </div>
      <div
        style={{
          padding: "5px 10px", borderRadius: 12,
          background: "#fff", fontWeight: 900, fontSize: 13, color: paper.ink,
          boxShadow: "0 2px 0 rgba(43,29,16,0.06)",
        }}
      >
        {score} pts
      </div>
    </div>
  );
}
