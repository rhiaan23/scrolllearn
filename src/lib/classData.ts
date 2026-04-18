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

interface ClassData {
  students: Record<string, StudentRecord>;
  answers: AnswerEvent[];
}

function empty(): ClassData {
  return { students: {}, answers: [] };
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

export interface StruggleRow {
  prompt: string;
  subject: Subject;
  difficulty: Difficulty;
  total: number;
  wrong: number;
  wrongPct: number;
}

export function getClassStats(classCode: string) {
  const data = readData();

  const students = Object.values(data.students)
    .filter((s) => s.classCode === classCode)
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ ...s, rank: i + 1 }));

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

  const struggles: StruggleRow[] = Array.from(promptMap.values())
    .filter((r) => r.total >= 2)
    .map((r) => ({ ...r, wrongPct: Math.round((r.wrong / r.total) * 100) }))
    .sort((a, b) => b.wrong - a.wrong);

  return { students, struggles };
}
