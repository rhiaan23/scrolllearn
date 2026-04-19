"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { paper } from "@/lib/theme";
import { useScrollLearn } from "@/lib/store";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperSticker } from "@/components/paper/PaperSticker";

export default function LandingPage() {
  const router = useRouter();
  const setStudentInfo = useScrollLearn((s) => s.setStudentInfo);
  const existingStudentId = useScrollLearn((s) => s.studentId);
  const existingClassCode = useScrollLearn((s) => s.classCode);

  const [name, setName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate form from any saved values so returning students see their info.
  useEffect(() => {
    if (existingClassCode) setClassCode(existingClassCode);
  }, [existingClassCode]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim() || "Anonymous";
    const trimmedCode = classCode.trim().toUpperCase();

    if (!trimmedCode) {
      // No class code — skip registration, go straight in.
      router.push("/feed");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/class/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, classCode: trimmedCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to join class");
      setStudentInfo(json.studentId, trimmedName, trimmedCode);
      router.push("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const alreadyEnrolled = Boolean(existingStudentId);

  return (
    <main
      className="relative flex min-h-dvh w-full flex-col items-center overflow-hidden px-6 py-10"
      style={{ background: paper.bg, color: paper.ink }}
    >
      {/* Subtle paper grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: [
            `radial-gradient(circle at 20% 30%, rgba(43,29,16,0.04) 0%, transparent 40%)`,
            `radial-gradient(circle at 80% 70%, rgba(43,29,16,0.03) 0%, transparent 40%)`,
          ].join(", "),
        }}
      />

      <div className="relative z-10 flex w-full max-w-[380px] flex-1 flex-col items-center justify-center gap-7 text-center">
        {/* Ten minute learning pill */}
        <div
          className="inline-flex items-center rounded-full px-4 py-1.5 font-display text-[11px] font-black uppercase tracking-[0.24em]"
          style={{ background: paper.ink, color: "#FFFFFF" }}
        >
          Ten minute learning
        </div>

        {/* Wordmark */}
        <h1
          className="font-display leading-[0.92]"
          style={{
            fontWeight: 900,
            fontSize: 72,
            letterSpacing: "-0.04em",
            color: paper.ink,
          }}
        >
          Fun
          <br />
          <span style={{ fontStyle: "italic", color: paper.math.lo }}>
            Feed.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="max-w-[300px] font-body text-[15px] font-semibold leading-snug"
          style={{ color: paper.inkSoft }}
        >
          A scrolling feed of tiny learning games. Math, reading, science — in
          small, tasty bites.
        </p>

        {/* Three stickers */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <PaperSticker tone="math" rot={-8} size={66}>
            <BookIcon />
          </PaperSticker>
          <PaperSticker tone="english" rot={3} size={66}>
            <OpenBookIcon />
          </PaperSticker>
          <PaperSticker tone="science" rot={-4} size={66}>
            <FlaskIcon />
          </PaperSticker>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleStart}
          className="mt-2 w-full rounded-[22px] p-5"
          style={{
            background: "#FFFFFF",
            boxShadow:
              "0 18px 40px rgba(43,29,16,0.12), 0 3px 0 rgba(43,29,16,0.08)",
            border: `1.5px solid ${paper.ink}12`,
          }}
        >
          <Field
            label="Your name"
            value={name}
            onChange={setName}
            placeholder="Mia"
            maxLength={30}
          />
          <div className="h-3" />
          <Field
            label="Class code"
            value={classCode}
            onChange={(v) => setClassCode(v.toUpperCase())}
            placeholder="MS-LUZ-3B"
            maxLength={16}
            mono
          />

          {error && (
            <p
              className="mt-3 font-body text-[12px] font-semibold"
              style={{ color: paper.math.lo }}
            >
              {error}
            </p>
          )}

          <div className="mt-4">
            <PaperButton
              type="submit"
              variant="ink"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Joining…" : "Start scrolling"}
              <ChevronIcon />
            </PaperButton>
          </div>

          {alreadyEnrolled && (
            <p
              className="mt-3 text-center font-body text-[11px] font-semibold"
              style={{ color: paper.inkSoft }}
            >
              Welcome back — your class is saved.
            </p>
          )}
        </form>

        <p
          className="font-body text-[11px] font-semibold"
          style={{ color: paper.inkSoft }}
        >
          No class code? Leave it blank to play anonymously.
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  mono?: boolean;
}) {
  return (
    <label className="block text-left">
      <span
        className="mb-1 block font-display text-[10px] font-black uppercase tracking-[0.18em]"
        style={{ color: paper.inkSoft }}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-[12px] px-3 py-2.5 font-body text-[15px] font-bold outline-none transition-shadow focus:shadow-[inset_0_0_0_2px_rgba(43,29,16,0.2)]"
        style={{
          background: paper.bg2,
          color: paper.ink,
          border: "none",
          fontFamily: mono
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : undefined,
        }}
      />
    </label>
  );
}

function BookIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}

function OpenBookIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H11v15H4.5A1.5 1.5 0 0 1 3 17.5v-12z" />
      <path d="M21 5.5A1.5 1.5 0 0 0 19.5 4H13v15h6.5a1.5 1.5 0 0 0 1.5-1.5v-12z" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 3h4" />
      <path d="M10 3v5L5 18a2 2 0 0 0 1.8 2.9h10.4A2 2 0 0 0 19 18l-5-10V3" />
      <path d="M7 14h10" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
