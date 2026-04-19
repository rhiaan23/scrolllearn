"use client";

import { useState } from "react";
import { TopNavbar } from "@/components/TopNavbar";
import type { StudentRecord, StruggleRow, SubjectScores } from "@/lib/classData";

interface Stats {
  students: (StudentRecord & { rank: number; subjectScores: SubjectScores })[];
  struggles: StruggleRow[];
}

const SUBJECT_BADGE: Record<string, string> = {
  math: "bg-blue-500/20 text-blue-300 ring-blue-500/40",
  english: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40",
  science: "bg-purple-500/20 text-purple-300 ring-purple-500/40",
};

const DIFFICULTY_LABEL: Record<number, string> = { 1: "K–1", 2: "Gr2–3", 3: "Gr4–5" };

export default function TeacherPage() {
  const [classCode, setClassCode] = useState("");
  const [pin, setPin] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLoad() {
    const code = classCode.trim().toUpperCase();
    if (!code || !pin.trim()) {
      setError("Enter both a class code and PIN.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/class/${encodeURIComponent(code)}/stats?pin=${encodeURIComponent(pin.trim())}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setStats(json as Stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <TopNavbar activeTab="teacher" />
      {/* Sub-header */}
      <div className="border-b border-white/10 bg-zinc-900 px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <p className="text-sm text-white/50">Teacher Dashboard</p>
          {stats && (
            <button
              type="button"
              onClick={() => { setStats(null); setClassCode(""); setPin(""); }}
              className="rounded-lg px-3 py-1.5 text-xs text-white/50 ring-1 ring-white/20 hover:text-white"
            >
              Switch class
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Login form */}
        {!stats && (
          <div className="mx-auto max-w-sm">
            <h2 className="mb-6 text-center text-2xl font-black">View class data</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/60">Class code</label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ROOM4B"
                  maxLength={12}
                  className="w-full rounded-xl bg-white/10 px-4 py-3 font-mono placeholder-white/30 outline-none ring-1 ring-white/20 focus:ring-white/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/60">Teacher PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  onKeyDown={(e) => e.key === "Enter" && handleLoad()}
                  className="w-full rounded-xl bg-white/10 px-4 py-3 placeholder-white/30 outline-none ring-1 ring-white/20 focus:ring-white/50"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="button"
                onClick={handleLoad}
                disabled={loading}
                className="w-full rounded-xl bg-white py-3 font-black text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                {loading ? "Loading…" : "View Dashboard"}
              </button>
              <p className="text-center text-xs text-white/30">Default PIN: 1234</p>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {stats && (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Class: {classCode.toUpperCase()}</h2>
                <p className="text-sm text-white/50">{stats.students.length} student{stats.students.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Leaderboard */}
            <section>
              <h3 className="mb-4 text-lg font-black">🏆 Leaderboard</h3>
              {stats.students.length === 0 ? (
                <p className="rounded-xl bg-white/5 p-6 text-center text-sm text-white/40">
                  No students have joined this class yet.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 text-xs font-semibold text-white/50">
                      <tr>
                        <th className="px-4 py-3 text-left">Rank</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-right">Score</th>
                        <th className="px-3 py-3 text-right text-blue-400/70">Math</th>
                        <th className="px-3 py-3 text-right text-emerald-400/70">Eng</th>
                        <th className="px-3 py-3 text-right text-purple-400/70">Sci</th>
                        <th className="px-4 py-3 text-right">Streak</th>
                        <th className="px-4 py-3 text-right">Best</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.students.map((s) => (
                        <tr key={s.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 font-black text-white/40">
                            {s.rank === 1 ? "🥇" : s.rank === 2 ? "🥈" : s.rank === 3 ? "🥉" : `#${s.rank}`}
                          </td>
                          <td className="px-4 py-3 font-semibold">{s.name}</td>
                          <td className="px-4 py-3 text-right font-black text-yellow-400">{s.score}</td>
                          <td className="px-3 py-3 text-right font-semibold text-blue-300">{s.subjectScores.math}</td>
                          <td className="px-3 py-3 text-right font-semibold text-emerald-300">{s.subjectScores.english}</td>
                          <td className="px-3 py-3 text-right font-semibold text-purple-300">{s.subjectScores.science}</td>
                          <td className="px-4 py-3 text-right text-white/70">🔥 {s.streak}</td>
                          <td className="px-4 py-3 text-right text-white/50">{s.bestStreak}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Struggle report */}
            <section>
              <h3 className="mb-1 text-lg font-black">🧠 Struggle Report</h3>
              <p className="mb-4 text-xs text-white/40">
                Questions answered incorrectly most often — focus these topics in your next lesson.
              </p>
              {stats.struggles.length === 0 ? (
                <p className="rounded-xl bg-white/5 p-6 text-center text-sm text-white/40">
                  Not enough data yet. Students need to answer at least 2 questions.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.struggles.map((row, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10"
                    >
                      {/* Wrong % bar */}
                      <div className="flex w-14 flex-col items-center gap-1">
                        <span
                          className={`text-lg font-black ${row.wrongPct >= 70 ? "text-red-400" : row.wrongPct >= 40 ? "text-yellow-400" : "text-green-400"}`}
                        >
                          {row.wrongPct}%
                        </span>
                        <span className="text-[10px] text-white/30">wrong</span>
                      </div>

                      {/* Prompt + metadata */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-snug">{row.prompt}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${SUBJECT_BADGE[row.subject] ?? ""}`}
                          >
                            {row.subject}
                          </span>
                          <span className="text-[10px] text-white/40">
                            {DIFFICULTY_LABEL[row.difficulty]}
                          </span>
                          <span className="text-[10px] text-white/30">
                            {row.wrong}/{row.total} wrong
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
