import { readData, writeData } from "@/lib/classData";
import type { Difficulty, Subject } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as {
    studentId?: string;
    classCode?: string;
    gameId?: string;
    prompt?: string;
    subject?: Subject;
    difficulty?: Difficulty;
    isCorrect?: boolean;
    score?: number;
    streak?: number;
    bestStreak?: number;
  };

  if (!body.studentId || !body.classCode) {
    return Response.json({ error: "studentId and classCode are required" }, { status: 400 });
  }

  const data = readData();

  // Update student score/streak if they're registered
  if (data.students[body.studentId]) {
    const s = data.students[body.studentId];
    if (typeof body.score === "number") s.score = body.score;
    if (typeof body.streak === "number") s.streak = body.streak;
    if (typeof body.bestStreak === "number") s.bestStreak = body.bestStreak;
  }

  // Record the answer event
  if (body.gameId && body.prompt && body.subject && body.difficulty !== undefined) {
    // Prevent duplicate events for the same game
    const alreadyRecorded = data.answers.some(
      (a) => a.studentId === body.studentId && a.gameId === body.gameId,
    );
    if (!alreadyRecorded) {
      data.answers.push({
        studentId: body.studentId,
        classCode: body.classCode,
        gameId: body.gameId!,
        prompt: body.prompt,
        subject: body.subject,
        difficulty: body.difficulty,
        isCorrect: body.isCorrect ?? false,
        timestamp: Date.now(),
      });
    }
  }

  writeData(data);
  return Response.json({ ok: true });
}
