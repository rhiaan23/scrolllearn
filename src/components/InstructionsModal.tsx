"use client";

import { useEffect } from "react";
import type { Template } from "@/lib/schema";
import { INSTRUCTIONS } from "@/lib/instructions";

interface Props {
  template: Template;
  open: boolean;
  onClose: () => void;
}

export function InstructionsModal({ template, open, onClose }: Props) {
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

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label={`How to play ${instr.title}`}
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-[340px] rounded-2xl bg-white p-5 text-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-3xl" aria-hidden="true">
            {instr.emoji}
          </span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              How to play
            </div>
            <h2 className="text-xl font-bold leading-tight">{instr.title}</h2>
          </div>
        </div>

        <ol className="space-y-2 text-sm leading-snug">
          {instr.steps.map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[2px] flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-4 rounded-lg bg-zinc-100 px-3 py-2 text-[13px] font-semibold text-zinc-800">
          <span className="mr-1">🎯</span>
          {instr.goal}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-zinc-900 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-85 active:scale-95"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
