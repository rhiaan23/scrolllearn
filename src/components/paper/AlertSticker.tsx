"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PaperSubject } from "@/lib/theme";
import { paper } from "@/lib/theme";
import { PaperSticker } from "./PaperSticker";
import { Icon } from "./Icon";

interface Props {
  /** Stable id of the card being played — included in the SMS body. */
  gameId: string;
  /** Used for the message body, if the student has onboarded. */
  studentName?: string;
  studentId?: string;
  classCode?: string;
  /** Default green (science). Pass "math" for red-orange "emergency" vibe. */
  tone?: PaperSubject | "ink";
}

type ToastKind = "sending" | "sent" | "unconfigured" | "error";

function buildText(studentName?: string, classCode?: string, gameId?: string): string {
  const who = studentName?.trim() || "A student";
  const where = classCode ? ` (class ${classCode})` : "";
  const what = gameId ? ` while playing "${gameId}"` : "";
  return `${who}${where} needs help${what} on FunFeed. Please check in.`;
}

export function AlertSticker({
  gameId,
  studentName,
  studentId,
  classCode,
  tone = "science",
}: Props) {
  const [toast, setToast] = useState<ToastKind | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((kind: ToastKind, ms = 1800) => {
    setToast(kind);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), ms);
  }, []);

  const handleClick = useCallback(async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    const text = buildText(studentName, classCode, gameId);
    showToast("sending", 1200);

    try {
      const res = await fetch("/api/alert/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, studentId, studentName, classCode, gameId }),
      });
      if (res.status === 503) {
        showToast("unconfigured", 2200);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (typeof body?.error === "string") {
          console.error("[alert]", body.error);
        }
        showToast("error", 2200);
        return;
      }
      const json = (await res.json()) as {
        mode?: "twilio" | "sms-link";
        href?: string;
        sent?: boolean;
      };
      if (json.mode === "twilio" && json.sent) {
        showToast("sent", 2000);
      } else if (json.mode === "sms-link" && json.href) {
        showToast("sent", 1000);
        // Open native Messages composer with the body prefilled.
        window.location.href = json.href;
      } else {
        showToast("error", 2200);
      }
    } catch {
      showToast("error", 2200);
    } finally {
      sendingRef.current = false;
    }
  }, [gameId, studentName, studentId, classCode, showToast]);

  return (
    <div className="relative flex flex-col items-center">
      <PaperSticker
        tone={tone}
        rot={-8}
        size={54}
        onClick={handleClick}
        ariaLabel="Alert teacher"
      >
        <Icon name="alert" size={22} />
      </PaperSticker>
      <span
        className="mt-1 font-display text-[9px] font-black uppercase tracking-[0.16em]"
        style={{ color: paper.ink }}
      >
        Teacher
      </span>

      {toast && (
        <div
          className="absolute right-[60px] top-0 whitespace-nowrap rounded-full px-3 py-1 font-display text-[11px] font-black animate-[pop_0.25s_ease-out]"
          style={{
            background: "#FFFFFF",
            color: paper.ink,
            border: `2px solid ${paper.ink}`,
            boxShadow: "0 3px 0 rgba(43,29,16,0.15)",
          }}
          role="status"
        >
          {toast === "sending" && "Sending…"}
          {toast === "sent" && "Teacher alerted"}
          {toast === "unconfigured" && "No teacher phone set"}
          {toast === "error" && "Couldn't send"}
        </div>
      )}
    </div>
  );
}
