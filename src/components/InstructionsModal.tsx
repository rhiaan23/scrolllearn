"use client";

import { useEffect } from "react";
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

export function InstructionsModal({ template, subject, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const instr = INSTRUCTIONS[template];
  const p = paper[subject];

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
          <h2
            className="mt-2 font-display text-[26px] font-black leading-tight"
            style={{ color: p.ink }}
          >
            {instr.title}
          </h2>
        </div>

        <ol className="space-y-2.5 font-body text-[14px] leading-snug" style={{ color: paper.ink }}>
          {instr.steps.map((step, i) => (
            <li key={i} className="flex gap-2.5">
              <span
                className="mt-[1px] flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-display text-[12px] font-black"
                style={{
                  border: `1.5px dashed ${p.ink}80`,
                  color: p.ink,
                  background: paper.bg,
                }}
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        <div
          className="mt-4 rounded-[14px] px-3 py-2.5 font-body text-[13px] font-bold"
          style={{
            background: p.tint,
            color: p.ink,
            border: `1.5px dashed ${p.ink}55`,
          }}
        >
          Goal · {instr.goal}
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
