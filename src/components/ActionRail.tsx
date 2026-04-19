"use client";

import type { Subject } from "@/lib/schema";
import { useScrollLearn } from "@/lib/store";
import { PaperSticker } from "./paper/PaperSticker";
import { AlertSticker } from "./paper/AlertSticker";
import { Icon } from "./paper/Icon";

interface Props {
  subject: Subject;
  gameId: string;
  onHelp: () => void;
}

export function ActionRail({ subject, gameId, onHelp }: Props) {
  const studentName = useScrollLearn((s) => s.studentName);
  const studentId = useScrollLearn((s) => s.studentId);
  const classCode = useScrollLearn((s) => s.classCode);

  return (
    <div className="absolute right-3 bottom-6 z-30 flex flex-col items-center gap-4">
      <AlertSticker
        gameId={gameId}
        studentName={studentName}
        studentId={studentId}
        classCode={classCode}
        tone={subject}
      />
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
