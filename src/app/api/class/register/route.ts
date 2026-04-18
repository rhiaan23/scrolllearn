import { readData, writeData } from "@/lib/classData";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as {
    name?: string;
    classCode?: string;
    existingId?: string;
  };

  const name = (typeof body.name === "string" && body.name.trim()) || "Anonymous";
  const classCode = typeof body.classCode === "string" ? body.classCode.trim().toUpperCase() : "";

  if (!classCode) {
    return Response.json({ error: "classCode is required" }, { status: 400 });
  }

  const data = readData();

  // If student already exists, update their name and return same ID
  if (body.existingId && data.students[body.existingId]) {
    data.students[body.existingId].name = name;
    writeData(data);
    return Response.json({ studentId: body.existingId });
  }

  const id = randomUUID();
  data.students[id] = {
    id,
    name,
    classCode,
    score: 0,
    streak: 0,
    bestStreak: 0,
    joinedAt: Date.now(),
  };
  writeData(data);

  return Response.json({ studentId: id });
}
