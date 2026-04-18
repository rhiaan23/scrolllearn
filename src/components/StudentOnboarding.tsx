"use client";

import { useState } from "react";
import { useScrollLearn } from "@/lib/store";

interface Props {
  onDone: () => void;
}

export function StudentOnboarding({ onDone }: Props) {
  const setStudentInfo = useScrollLearn((s) => s.setStudentInfo);
  const [name, setName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    const trimmedCode = classCode.trim().toUpperCase();
    if (!trimmedCode) {
      setError("Enter a class code to join a class.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/class/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "Anonymous", classCode: trimmedCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to join");
      setStudentInfo(json.studentId, name.trim() || "Anonymous", trimmedCode);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl">
        <div className="mb-4 text-center">
          <div className="text-4xl">🎓</div>
          <h2 className="mt-2 text-xl font-black">Join a Class</h2>
          <p className="mt-1 text-sm text-white/60">
            Ask your teacher for the class code. You can skip this and play anonymously.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">
              Your name <span className="text-white/40">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={30}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm placeholder-white/30 outline-none ring-1 ring-white/20 focus:ring-white/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-white/70">
              Class code <span className="text-white/40">(optional)</span>
            </label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="e.g. ROOM4B"
              maxLength={12}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm font-mono placeholder-white/30 outline-none ring-1 ring-white/20 focus:ring-white/50"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleJoin}
            disabled={loading}
            className="w-full rounded-xl bg-white py-2.5 text-sm font-black text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? "Joining…" : "Join Class"}
          </button>

          <button
            type="button"
            onClick={onDone}
            className="w-full rounded-xl py-2 text-sm text-white/50 transition hover:text-white/80"
          >
            Skip — play anonymously
          </button>
        </div>
      </div>
    </div>
  );
}
