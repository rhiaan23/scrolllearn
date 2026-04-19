"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Subject, Template } from "@/lib/schema";
import { INSTRUCTIONS } from "@/lib/instructions";
import { paper } from "@/lib/theme";
import { PaperButton } from "./paper/PaperButton";
import { Icon } from "./paper/Icon";

interface Props {
  template: Template;
  subject: Subject;
  open: boolean;
  onClose: () => void;
}

// --- Segment model ---------------------------------------------------------
// The narration script is split into ordered segments. Label segments are
// spoken but not displayed ("How to play.", "Step one."). Content segments
// (title / step / goal) are both spoken AND rendered, so each of their
// characters gets a time-offset we can highlight in sync with the audio.

type Segment =
  | { kind: "label"; text: string }
  | { kind: "title"; text: string }
  | { kind: "step"; stepIndex: number; text: string }
  | { kind: "goal"; text: string };

const WORD_NUMBER = ["one", "two", "three", "four", "five", "six", "seven"];

function buildSegments(title: string, steps: string[], goal: string): Segment[] {
  const segs: Segment[] = [
    { kind: "label", text: "How to play." },
    { kind: "title", text: `${title}.` },
  ];
  steps.forEach((s, i) => {
    segs.push({ kind: "label", text: `Step ${WORD_NUMBER[i] ?? i + 1}.` });
    segs.push({ kind: "step", stepIndex: i, text: s });
  });
  segs.push({ kind: "label", text: "Goal." });
  segs.push({ kind: "goal", text: goal });
  return segs;
}

// Concatenate segments with single-space joins and remember each segment's
// start offset in the resulting script. Those offsets are how we map UI
// characters to positions in the ElevenLabs alignment array.
function computeScript(segments: Segment[]): { script: string; offsets: number[] } {
  const offsets: number[] = [];
  const parts: string[] = [];
  let off = 0;
  segments.forEach((seg, i) => {
    offsets.push(off);
    parts.push(seg.text);
    off += seg.text.length;
    if (i < segments.length - 1) off += 1; // the joining space
  });
  return { script: parts.join(" "), offsets };
}

// --- Narration cache -------------------------------------------------------

interface Narration {
  url: string;            // blob URL for the decoded MP3
  charStartTimes: number[]; // parallel to script characters
}

const NARRATION_CACHE = new Map<Template, Narration>();

function decodeBase64ToBlobUrl(b64: string, mime = "audio/mpeg"): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

type AudioStatus = "idle" | "loading" | "playing" | "error";

export function InstructionsModal({ template, subject, open, onClose }: Props) {
  const instr = INSTRUCTIONS[template];
  const p = paper[subject];

  const { segments, offsets } = useMemo(() => {
    const segs = buildSegments(instr.title, instr.steps, instr.goal);
    const { offsets: o } = computeScript(segs);
    return { segments: segs, offsets: o };
  }, [instr.title, instr.steps, instr.goal]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const charStartTimesRef = useRef<number[] | null>(null);

  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  // -1 = nothing highlighted yet; otherwise the index (inclusive) of the
  // last character that has already been spoken.
  const [currentCharIdx, setCurrentCharIdx] = useState<number>(-1);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startRaf = useCallback(() => {
    function tick() {
      const audio = audioRef.current;
      const starts = charStartTimesRef.current;
      if (!audio || !starts) {
        rafRef.current = null;
        return;
      }
      const t = audio.currentTime;
      // Linear scan from the current position forward — scripts are short
      // (< 500 chars) and audio.currentTime only moves forward.
      let idx = -1;
      for (let i = 0; i < starts.length; i++) {
        if (starts[i] <= t) idx = i;
        else break;
      }
      setCurrentCharIdx(idx);
      if (!audio.paused && !audio.ended) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    }
    stopRaf();
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf]);

  const playNarration = useCallback(async () => {
    // Tear down any prior playback.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    stopRaf();
    setCurrentCharIdx(-1);

    let narration = NARRATION_CACHE.get(template);
    if (!narration) {
      setAudioStatus("loading");
      try {
        const { script } = computeScript(segments);
        const res = await fetch("/api/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: script }),
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(`narrate HTTP ${res.status}: ${msg.slice(0, 200)}`);
        }
        const data = (await res.json()) as {
          audio_base64?: string;
          alignment?: {
            characters: string[];
            character_start_times_seconds: number[];
          };
        };
        if (!data.audio_base64 || !data.alignment?.character_start_times_seconds) {
          throw new Error("narrate response missing audio or alignment");
        }
        narration = {
          url: decodeBase64ToBlobUrl(data.audio_base64),
          charStartTimes: data.alignment.character_start_times_seconds,
        };
        NARRATION_CACHE.set(template, narration);
      } catch (err) {
        console.error("[narrate]", err);
        setAudioStatus("error");
        return;
      }
    }

    charStartTimesRef.current = narration.charStartTimes;

    const audio = new Audio(narration.url);
    audioRef.current = audio;
    audio.addEventListener("playing", () => {
      setAudioStatus("playing");
      startRaf();
    });
    audio.addEventListener("pause", stopRaf);
    audio.addEventListener("ended", () => {
      stopRaf();
      setAudioStatus("idle");
      // Fully highlight everything once narration finishes.
      if (charStartTimesRef.current) {
        setCurrentCharIdx(charStartTimesRef.current.length - 1);
      }
    });
    audio.addEventListener("error", () => {
      stopRaf();
      setAudioStatus("error");
    });
    try {
      await audio.play();
    } catch (err) {
      console.warn("[narrate] autoplay blocked", err);
      setAudioStatus("idle");
    }
  }, [template, segments, startRaf, stopRaf]);

  // Auto-play when modal opens; tear down when it closes.
  useEffect(() => {
    if (!open) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopRaf();
      setAudioStatus("idle");
      setCurrentCharIdx(-1);
      return;
    }
    playNarration();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopRaf();
    };
  }, [open, playNarration, stopRaf]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const titleSeg = segments.find((s) => s.kind === "title");
  const titleIdx = titleSeg ? segments.indexOf(titleSeg) : -1;
  const goalSeg = segments.find((s) => s.kind === "goal");
  const goalIdx = goalSeg ? segments.indexOf(goalSeg) : -1;

  const highlightBg = p.tint;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label={`How to play ${instr.title}`}
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{ background: "rgba(43,29,16,0.55)", backdropFilter: "blur(2px)" }}
      />
      <div
        className="relative w-full max-w-[360px] rounded-[24px] p-6"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          border: `3px solid ${p.ink}`,
          boxShadow: "0 24px 48px rgba(43,29,16,0.28), 0 3px 0 rgba(43,29,16,0.12)",
          color: paper.ink,
          transform: "rotate(-1deg)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-90"
          style={{ background: paper.bg, color: paper.ink }}
        >
          <Icon name="close" size={16} />
        </button>

        <div className="mb-3">
          <div
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-[0.18em]"
            style={{
              border: `1.5px dashed ${p.ink}66`,
              color: p.ink,
              background: p.tint,
            }}
          >
            How to play
          </div>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h2
              className="font-display text-[26px] font-black leading-tight"
              style={{ color: p.ink }}
            >
              {titleSeg ? (
                <KaraokeText
                  text={titleSeg.text.replace(/\.$/, "")}
                  globalStart={offsets[titleIdx]}
                  currentCharIdx={currentCharIdx}
                  highlightBg={highlightBg}
                />
              ) : (
                instr.title
              )}
            </h2>
            <button
              type="button"
              onClick={playNarration}
              aria-label={
                audioStatus === "playing"
                  ? "Teacher is reading the instructions"
                  : "Play the teacher's instructions"
              }
              disabled={audioStatus === "loading"}
              className="relative mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
              style={{
                background: p.tint,
                border: `2px solid ${p.ink}`,
                color: p.ink,
                boxShadow: "0 3px 0 rgba(43,29,16,0.18)",
              }}
            >
              {audioStatus === "loading" ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2"
                  style={{ borderColor: `${p.ink}33`, borderTopColor: p.ink }}
                />
              ) : audioStatus === "playing" ? (
                <span className="flex items-end gap-[2px]" aria-hidden="true">
                  <span className="inline-block w-[3px] animate-[eq_0.8s_ease-in-out_infinite]" style={{ background: p.ink, height: 10 }} />
                  <span className="inline-block w-[3px] animate-[eq_0.8s_ease-in-out_0.15s_infinite]" style={{ background: p.ink, height: 16 }} />
                  <span className="inline-block w-[3px] animate-[eq_0.8s_ease-in-out_0.3s_infinite]" style={{ background: p.ink, height: 12 }} />
                </span>
              ) : audioStatus === "error" ? (
                <span className="text-lg" aria-hidden="true">🔇</span>
              ) : (
                <span className="text-lg leading-none" aria-hidden="true">🔊</span>
              )}
            </button>
          </div>
          {audioStatus === "error" && (
            <p
              className="mt-1 font-body text-[11px] italic"
              style={{ color: paper.inkSoft }}
            >
              Teacher audio unavailable — read the steps below.
            </p>
          )}
        </div>

        <ol className="space-y-2.5 font-body text-[14px] leading-snug" style={{ color: paper.ink }}>
          {segments.map((seg, i) => {
            if (seg.kind !== "step") return null;
            return (
              <li key={seg.stepIndex} className="flex gap-2.5">
                <span
                  className="mt-[1px] flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-display text-[12px] font-black"
                  style={{
                    border: `1.5px dashed ${p.ink}80`,
                    color: p.ink,
                    background: paper.bg,
                  }}
                >
                  {seg.stepIndex + 1}
                </span>
                <span className="pt-0.5">
                  <KaraokeText
                    text={seg.text}
                    globalStart={offsets[i]}
                    currentCharIdx={currentCharIdx}
                    highlightBg={highlightBg}
                  />
                </span>
              </li>
            );
          })}
        </ol>

        <div
          className="mt-4 rounded-[14px] px-3 py-2.5 font-body text-[13px] font-bold"
          style={{
            background: p.tint,
            color: p.ink,
            border: `1.5px dashed ${p.ink}55`,
          }}
        >
          Goal ·{" "}
          {goalSeg ? (
            <KaraokeText
              text={goalSeg.text}
              globalStart={offsets[goalIdx]}
              currentCharIdx={currentCharIdx}
              highlightBg="rgba(255,255,255,0.6)"
            />
          ) : (
            instr.goal
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <PaperButton variant="primary" subject={subject} onClick={onClose}>
            Got it
          </PaperButton>
        </div>
      </div>
    </div>
  );
}

// --- Karaoke word highlight -------------------------------------------------

interface KaraokeTextProps {
  text: string;
  globalStart: number;     // char offset of `text[0]` in the narration script
  currentCharIdx: number;  // the last character already spoken; -1 before start
  highlightBg: string;
}

function KaraokeText({ text, globalStart, currentCharIdx, highlightBg }: KaraokeTextProps) {
  // Render each character as its own inline span. Only `background` changes
  // when a character becomes "spoken" — no padding, border, or whitespace
  // tweaks, so the line layout is identical to the plain text and wraps
  // normally inside the modal.
  const chars = [...text];
  return (
    <>
      {chars.map((ch, i) => {
        const globalIdx = globalStart + i;
        const spoken = globalIdx <= currentCharIdx;
        return (
          <span
            key={i}
            style={{
              background: spoken ? highlightBg : "transparent",
              transition: "background 90ms linear",
            }}
          >
            {ch}
          </span>
        );
      })}
    </>
  );
}
