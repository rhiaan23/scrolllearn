"use client";

import type { Subject } from "@/lib/schema";
import { PaperSticker } from "./paper/PaperSticker";
import { Icon } from "./paper/Icon";

interface Props {
  subject: Subject;
  onHelp: () => void;
  onExplain?: () => void;
}

export function ActionRail({ subject, onHelp, onExplain }: Props) {
  return (
    <div className="absolute right-3 bottom-6 z-30 flex flex-col items-center gap-4">
      <PaperSticker
        tone={subject}
        rot={-8}
        size={54}
        onClick={onExplain}
        ariaLabel="Explain this answer"
      >
        <Icon name="sparkle" size={22} />
      </PaperSticker>
      <PaperSticker
        tone="ink"
        rot={4}
        size={54}
        onClick={onHelp}
        ariaLabel="How to play"
      >
        <Icon name="help" size={22} />
      </PaperSticker>
    </div>
  );
}
