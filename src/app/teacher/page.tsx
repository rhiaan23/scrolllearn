"use client";

import { useEffect, useRef, useState } from "react";
import { TopNavbar } from "@/components/TopNavbar";
import type {
  ClassVerdict,
  StudentRecord,
  StruggleRow,
  SubjectScores,
  TopRow,
} from "@/lib/classData";
import { DEMO_SYLLABI, type DemoSyllabus } from "@/lib/syllabusDemo";

interface Stats {
  students: (StudentRecord & { rank: number; subjectScores: SubjectScores })[];
  struggles: StruggleRow[];
  topCorrect: TopRow[];
  verdict: ClassVerdict | null;
}

const SUBJECT_BADGE: Record<string, string> = {
  math: "bg-blue-500/20 text-blue-300 ring-blue-500/40",
  english: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40",
  science: "bg-purple-500/20 text-purple-300 ring-purple-500/40",
};

const DIFFICULTY_LABEL: Record<number, string> = { 1: "K–1", 2: "Gr2–3", 3: "Gr4–5" };

const SYLLABUS_KEY_PREFIX = "scrolllearn.syllabus.";

interface ActiveSyllabus {
  id: string;
  classCode: string;
  fileName: string;
  title: string;
  grade: string;
  teacher: string;
  topics: string[];
  uploadedAt: number;
}

function readSyllabus(classCode: string): ActiveSyllabus | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SYLLABUS_KEY_PREFIX + classCode);
    return raw ? (JSON.parse(raw) as ActiveSyllabus) : null;
  } catch {
    return null;
  }
}

function writeSyllabus(classCode: string, s: ActiveSyllabus | null) {
  if (typeof window === "undefined") return;
  const key = SYLLABUS_KEY_PREFIX + classCode;
  if (s) window.localStorage.setItem(key, JSON.stringify(s));
  else window.localStorage.removeItem(key);
}

export default function TeacherPage() {
  const [classCode, setClassCode] = useState("");
  const [pin, setPin] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syllabus, setSyllabus] = useState<ActiveSyllabus | null>(null);
  const [syllabusStage, setSyllabusStage] = useState<"idle" | "uploading" | "analyzing">(
    "idle",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load the saved syllabus for the current class whenever we log into one.
  useEffect(() => {
    if (!stats) return;
    setSyllabus(readSyllabus(classCode.toUpperCase()));
  }, [stats, classCode]);

  function handleSyllabusFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setSyllabusStage("uploading");
    setTimeout(() => {
      setSyllabusStage("analyzing");
      setTimeout(() => {
        const demo = DEMO_SYLLABI["grade-3-ecosystems"] as DemoSyllabus;
        const code = classCode.toUpperCase();
        const active: ActiveSyllabus = {
          id: demo.id,
          classCode: code,
          fileName: file.name,
          title: demo.title,
          grade: demo.grade,
          teacher: demo.teacher,
          topics: demo.topics,
          uploadedAt: Date.now(),
        };
        writeSyllabus(code, active);
        setSyllabus(active);
        setSyllabusStage("idle");
      }, 1100);
    }, 700);
  }

  function handleClearSyllabus() {
    writeSyllabus(classCode.toUpperCase(), null);
    setSyllabus(null);
    setSyllabusStage("idle");
  }

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

            {/* Syllabus upload — per class */}
            <section>
              <h3 className="mb-1 text-lg font-black">📚 Class Syllabus</h3>
              <p className="mb-4 text-xs text-white/40">
                Upload your lesson plan — only students in <span className="font-bold">{classCode.toUpperCase()}</span> will see
                games tailored to these topics.
              </p>
              {!syllabus && syllabusStage === "idle" && (
                <div className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
                  <p className="mb-4 text-sm text-white/70">
                    No syllabus uploaded. This class is playing the general game pool.
                  </p>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-white/90">
                    <span>📎</span>
                    <span>Upload PDF</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleSyllabusFile}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
              {syllabusStage !== "idle" && (
                <div className="flex items-center gap-4 rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <div>
                    <p className="text-sm font-semibold">
                      {syllabusStage === "uploading" ? "Uploading…" : "Analyzing topics…"}
                    </p>
                    <p className="text-xs text-white/40">
                      {syllabusStage === "uploading"
                        ? "Reading the PDF"
                        : "Extracting math, reading, and science topics"}
                    </p>
                  </div>
                </div>
              )}
              {syllabus && syllabusStage === "idle" && (
                <div className="rounded-xl bg-emerald-500/10 p-6 ring-1 ring-emerald-500/40">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-black text-emerald-300">
                        <span>✓</span>
                        <span>Active — games in {syllabus.classCode} are now tailored</span>
                      </p>
                      <p className="mt-2 truncate text-sm font-semibold">{syllabus.fileName}</p>
                      <p className="text-xs text-white/50">
                        {syllabus.title} · {syllabus.grade}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSyllabus}
                      className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-white/60 ring-1 ring-white/20 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="mt-4 border-t border-emerald-500/20 pt-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-300/80">
                      Detected topics
                    </p>
                    <ul className="space-y-1.5">
                      {syllabus.topics.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-sm text-white/80">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </section>

            {/* Student Results */}
            <section>
              <h3 className="mb-1 text-lg font-black">📊 Student Results</h3>
              <p className="mb-4 text-xs text-white/40">
                How your class is performing across questions. Use the verdict to plan your next lesson.
              </p>

              {/* Verdict card */}
              {stats.verdict && (
                <div className="mb-6 rounded-xl bg-gradient-to-br from-amber-500/15 to-rose-500/15 p-5 ring-1 ring-amber-500/40">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-2xl ring-1 ring-amber-400/50">
                      🎯
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-300/80">
                        Teacher verdict
                      </p>
                      <p className="mt-1 text-base font-black leading-snug">
                        {stats.verdict.message}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`rounded-full px-2 py-0.5 font-bold ring-1 ${SUBJECT_BADGE[stats.verdict.subject] ?? ""}`}
                        >
                          {stats.verdict.subject}
                        </span>
                        <span className="text-white/50">
                          {DIFFICULTY_LABEL[stats.verdict.difficulty]}
                        </span>
                        <span className="text-white/40">
                          · {stats.verdict.wrongPct}% wrong across {stats.verdict.total} attempts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stats.struggles.length === 0 && stats.topCorrect.length === 0 ? (
                <p className="rounded-xl bg-white/5 p-6 text-center text-sm text-white/40">
                  Not enough data yet. Students need to answer at least 2 questions.
                </p>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Incorrect column */}
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-black text-red-300">
                      <span>❌</span>
                      <span>Most missed</span>
                    </h4>
                    <div className="space-y-2">
                      {stats.struggles.length === 0 ? (
                        <p className="rounded-xl bg-white/5 p-4 text-center text-xs text-white/40">
                          No misses yet — impressive!
                        </p>
                      ) : (
                        stats.struggles.map((row, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10"
                          >
                            <div className="flex w-12 flex-col items-center">
                              <span
                                className={`text-base font-black ${
                                  row.wrongPct >= 70
                                    ? "text-red-400"
                                    : row.wrongPct >= 40
                                      ? "text-yellow-400"
                                      : "text-green-400"
                                }`}
                              >
                                {row.wrongPct}%
                              </span>
                              <span className="text-[9px] text-white/30">wrong</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-snug">
                                {row.prompt}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ring-1 ${SUBJECT_BADGE[row.subject] ?? ""}`}
                                >
                                  {row.subject}
                                </span>
                                <span className="text-[9px] text-white/40">
                                  {DIFFICULTY_LABEL[row.difficulty]}
                                </span>
                                <span className="text-[9px] text-white/30">
                                  {row.wrong}/{row.total}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Correct column */}
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-black text-emerald-300">
                      <span>✅</span>
                      <span>Most mastered</span>
                    </h4>
                    <div className="space-y-2">
                      {stats.topCorrect.length === 0 ? (
                        <p className="rounded-xl bg-white/5 p-4 text-center text-xs text-white/40">
                          No data yet.
                        </p>
                      ) : (
                        stats.topCorrect.map((row, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10"
                          >
                            <div className="flex w-12 flex-col items-center">
                              <span
                                className={`text-base font-black ${
                                  row.correctPct >= 80
                                    ? "text-emerald-400"
                                    : row.correctPct >= 60
                                      ? "text-green-400"
                                      : "text-yellow-400"
                                }`}
                              >
                                {row.correctPct}%
                              </span>
                              <span className="text-[9px] text-white/30">right</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-snug">
                                {row.prompt}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ring-1 ${SUBJECT_BADGE[row.subject] ?? ""}`}
                                >
                                  {row.subject}
                                </span>
                                <span className="text-[9px] text-white/40">
                                  {DIFFICULTY_LABEL[row.difficulty]}
                                </span>
                                <span className="text-[9px] text-white/30">
                                  {row.correct}/{row.total}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
