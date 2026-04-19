import { takeGame } from "@/lib/gamePool";
import {
  type Difficulty,
  type Subject,
  type Template,
  SUBJECTS,
  TEMPLATES,
} from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReqBody {
  subject?: Subject;
  difficulty?: Difficulty;
  avoid?: string[];
  avoidTemplates?: Template[];
}

export async function POST(request: Request) {
  let body: ReqBody = {};
  try {
    body = (await request.json()) as ReqBody;
  } catch {
    // empty body is OK — defaults below
  }

  const subject: Subject = SUBJECTS.includes(body.subject as Subject)
    ? (body.subject as Subject)
    : "math";

  const difficulty: Difficulty = ([1, 2, 3].includes(body.difficulty as number)
    ? body.difficulty
    : 1) as Difficulty;

  const avoid = Array.isArray(body.avoid) ? body.avoid.slice(0, 16) : [];

  const avoidTemplates = Array.isArray(body.avoidTemplates)
    ? body.avoidTemplates
        .filter((t): t is Template => TEMPLATES.includes(t as Template))
        .slice(0, 5)
    : [];

  try {
    const game = await takeGame({ subject, difficulty, avoid, avoidTemplates });
    return Response.json({ game });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
