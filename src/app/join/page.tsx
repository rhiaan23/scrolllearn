"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useScrollLearn } from "@/lib/store";

export default function JoinPage() {
  const router = useRouter();
  const setStudentInfo = useScrollLearn((s) => s.setStudentInfo);
  const existingStudentId = useScrollLearn((s) => s.studentId);

  const [name, setName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    const code = classCode.trim().toUpperCase();
    if (!code) {
      setError("Ask your teacher for a class code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/class/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Anonymous",
          classCode: code,
          existingId: existingStudentId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to join");
      setStudentInfo(json.studentId, name.trim() || "Anonymous", code);
      router.push("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-5 py-8 text-white">
      {/* Sky background */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: "url(/math-castle/clouds.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-sky-300/10" />

      {/* Grass strip */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{
          backgroundImage: "url(/math-castle/field.png)",
          backgroundSize: "auto 100%",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "bottom",
          imageRendering: "pixelated",
        }}
        aria-hidden="true"
      />

      {/* Friendly duck mascot */}
      <div className="pointer-events-none absolute bottom-6 left-4 -z-10">
        <Image
          src="/clean-river/duck_icon.png"
          alt=""
          width={72}
          height={72}
          unoptimized
          style={{ imageRendering: "pixelated" }}
          className="h-16 w-16 drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] sm:h-20 sm:w-20"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-black/60 bg-white/90 px-3 py-1 text-xs font-black text-slate-900 shadow-[2px_2px_0_rgb(0_0_0/0.5)]"
        >
          ← Back
        </Link>

        <div className="mb-6 text-center">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-black/70 bg-pink-400 text-5xl shadow-[4px_4px_0_rgb(0_0_0/0.55)]">
            🎒
          </span>
          <h1
            className="mt-4 text-4xl font-black tracking-tight"
            style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.55)" }}
          >
            Join your class!
          </h1>
          <p
            className="mt-1 text-sm font-bold text-white/95"
            style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.6)" }}
          >
            Ask your teacher for the class code.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border-4 border-black/70 bg-white/95 p-5 text-slate-900 shadow-[6px_6px_0_rgb(0_0_0/0.55)]">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-600">
              Your name 😊
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your name…"
              maxLength={30}
              autoFocus
              className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-600">
              Class code 🔑
            </label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="e.g. ROOM4B"
              maxLength={12}
              className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-mono text-lg font-black uppercase tracking-wider text-slate-900 placeholder-slate-400 outline-none focus:border-pink-400"
            />
          </div>

          {error && <p className="text-sm font-bold text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleJoin}
            disabled={loading}
            className="w-full rounded-xl border-4 border-black/70 bg-yellow-300 py-3 text-lg font-black uppercase tracking-wide text-yellow-950 shadow-[4px_4px_0_rgb(0_0_0/0.6)] transition-all hover:-translate-y-0.5 hover:bg-yellow-200 hover:shadow-[6px_6px_0_rgb(0_0_0/0.6)] active:translate-y-0.5 active:shadow-[2px_2px_0_rgb(0_0_0/0.6)] disabled:opacity-60"
          >
            {loading ? "Joining…" : "Let's Play! 🚀"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/feed")}
            className="w-full py-1 text-xs font-bold text-slate-500 transition hover:text-slate-800"
          >
            Skip — play anonymously
          </button>
        </div>
      </div>
    </main>
  );
}
