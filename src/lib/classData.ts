import fs from "fs";
import path from "path";
import type { Subject, Difficulty } from "./schema";

const DATA_FILE = path.join(process.cwd(), "data", "class-data.json");

export interface StudentRecord {
  id: string;
  name: string;
  classCode: string;
  score: number;
  streak: number;
  bestStreak: number;
  joinedAt: number;
}

export interface AnswerEvent {
  studentId: string;
  classCode: string;
  gameId: string;
  prompt: string;
  subject: Subject;
  difficulty: Difficulty;
  isCorrect: boolean;
  timestamp: number;
}

export interface AlertEvent {
  studentId?: string;
  studentName?: string;
  classCode?: string;
  gameId: string;
  text: string;
  mode: "twilio" | "sms-link" | "unconfigured";
  timestamp: number;
}

interface ClassData {
  students: Record<string, StudentRecord>;
  answers: AnswerEvent[];
  alerts?: AlertEvent[];
}

function empty(): ClassData {
  return { students: {}, answers: [], alerts: [] };
}

export function appendAlert(ev: AlertEvent): void {
  const data = readData();
  data.alerts = [...(data.alerts ?? []), ev];
  writeData(data);
}

export function readData(): ClassData {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as ClassData;
  } catch {
    return empty();
  }
}

export function writeData(data: ClassData): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Per-class uploaded content — in-memory stubs so the /api/teacher/content
// route compiles. Not persisted between server restarts.
const CLASS_CONTENT = new Map<string, { content: string; filename?: string }>();

export function getClassContent(classCode: string): string | undefined {
  return CLASS_CONTENT.get(classCode.toUpperCase())?.content;
}

export function setClassContent(
  classCode: string,
  content: string,
  filename?: string,
): void {
  CLASS_CONTENT.set(classCode.toUpperCase(), { content, filename });
}

export function clearClassContent(classCode: string): void {
  CLASS_CONTENT.delete(classCode.toUpperCase());
}

export interface SubjectScores {
  math: number;
  english: number;
  science: number;
}

export interface StruggleRow {
  prompt: string;
  subject: Subject;
  difficulty: Difficulty;
  total: number;
  wrong: number;
  wrongPct: number;
}

export interface TopRow {
  prompt: string;
  subject: Subject;
  difficulty: Difficulty;
  total: number;
  correct: number;
  correctPct: number;
}

export interface ClassVerdict {
  subject: Subject;
  difficulty: Difficulty;
  topicLabel: string;    // human-readable, e.g. "Multi-digit multiplication"
  wrongPct: number;      // percent of attempts that were wrong in this bucket
  total: number;         // number of attempts in this bucket
  sampleWrongPrompt?: string;
  message: string;       // rendered "Focus on ___ because ___" verdict
}

// Human labels per (subject, difficulty) bucket. Keeps the verdict readable.
const TOPIC_LABELS: Record<Subject, Record<Difficulty, string>> = {
  math: {
    1: "Single-digit arithmetic",
    2: "Two-digit arithmetic",
    3: "Multi-digit multiplication",
  },
  english: {
    1: "Basic reading",
    2: "Spelling and vocabulary",
    3: "Reading comprehension",
  },
  science: {
    1: "Animals and plants",
    2: "Ecosystems and matter",
    3: "Systems and reasoning",
  },
};

export function getClassStats(classCode: string) {
  const data = readData();

  // Compute per-subject scores for each student from existing answer events.
  const studentSubjectScores = new Map<string, SubjectScores>();
  for (const ev of data.answers) {
    if (ev.classCode !== classCode) continue;
    if (!studentSubjectScores.has(ev.studentId)) {
      studentSubjectScores.set(ev.studentId, { math: 0, english: 0, science: 0 });
    }
    if (ev.isCorrect) {
      const ss = studentSubjectScores.get(ev.studentId)!;
      ss[ev.subject] = (ss[ev.subject] ?? 0) + 10;
    }
  }

  const students = Object.values(data.students)
    .filter((s) => s.classCode === classCode)
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({
      ...s,
      rank: i + 1,
      subjectScores: studentSubjectScores.get(s.id) ?? { math: 0, english: 0, science: 0 },
    }));

  // Aggregate per prompt
  const promptMap = new Map<
    string,
    { prompt: string; subject: Subject; difficulty: Difficulty; total: number; wrong: number }
  >();

  for (const ev of data.answers) {
    if (ev.classCode !== classCode) continue;
    const existing = promptMap.get(ev.prompt);
    if (existing) {
      existing.total++;
      if (!ev.isCorrect) existing.wrong++;
    } else {
      promptMap.set(ev.prompt, {
        prompt: ev.prompt,
        subject: ev.subject,
        difficulty: ev.difficulty,
        total: 1,
        wrong: ev.isCorrect ? 0 : 1,
      });
    }
  }

  const rows = Array.from(promptMap.values()).filter((r) => r.total >= 2);

  const struggles: StruggleRow[] = rows
    .map((r) => ({ ...r, wrongPct: Math.round((r.wrong / r.total) * 100) }))
    .filter((r) => r.wrong > 0)
    .sort((a, b) => b.wrongPct - a.wrongPct || b.wrong - a.wrong)
    .slice(0, 8);

  const topCorrect: TopRow[] = rows
    .map((r) => {
      const correct = r.total - r.wrong;
      return {
        prompt: r.prompt,
        subject: r.subject,
        difficulty: r.difficulty,
        total: r.total,
        correct,
        correctPct: Math.round((correct / r.total) * 100),
      };
    })
    .filter((r) => r.correct > 0)
    .sort((a, b) => b.correctPct - a.correctPct || b.correct - a.correct)
    .slice(0, 8);

  // Verdict — pick the (subject, difficulty) bucket with the worst wrong%
  // that has enough attempts to be meaningful.
  type BucketKey = `${Subject}|${Difficulty}`;
  const buckets = new Map<
    BucketKey,
    {
      subject: Subject;
      difficulty: Difficulty;
      total: number;
      wrong: number;
      wrongExamples: string[];
    }
  >();
  for (const ev of data.answers) {
    if (ev.classCode !== classCode) continue;
    const key: BucketKey = `${ev.subject}|${ev.difficulty}`;
    const b = buckets.get(key) ?? {
      subject: ev.subject,
      difficulty: ev.difficulty,
      total: 0,
      wrong: 0,
      wrongExamples: [],
    };
    b.total++;
    if (!ev.isCorrect) {
      b.wrong++;
      if (b.wrongExamples.length < 3 && !b.wrongExamples.includes(ev.prompt)) {
        b.wrongExamples.push(ev.prompt);
      }
    }
    buckets.set(key, b);
  }

  let verdict: ClassVerdict | null = null;
  const ranked = Array.from(buckets.values())
    .filter((b) => b.total >= 4)
    .map((b) => ({ ...b, wrongPct: Math.round((b.wrong / b.total) * 100) }))
    .sort((a, b) => b.wrongPct - a.wrongPct);

  if (ranked.length > 0 && ranked[0].wrongPct >= 40) {
    const worst = ranked[0];
    const topicLabel = TOPIC_LABELS[worst.subject][worst.difficulty];
    const sample = worst.wrongExamples[0];
    verdict = {
      subject: worst.subject,
      difficulty: worst.difficulty,
      topicLabel,
      wrongPct: worst.wrongPct,
      total: worst.total,
      sampleWrongPrompt: sample,
      message: `Focus on ${topicLabel.toLowerCase()} — ${worst.wrongPct}% of attempts in this class were wrong${
        sample ? ` (e.g. “${sample}”)` : ""
      }.`,
    };
  }

  return { students, struggles, topCorrect, verdict };
}
