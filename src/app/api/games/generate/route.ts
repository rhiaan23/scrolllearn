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
  strictSubject?: boolean;
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

  // NO truncation — the full session history is the source of truth for
  // "don't repeat". Max session length = seed pool size.
  const avoid = Array.isArray(body.avoid) ? body.avoid : [];

  const avoidTemplates = Array.isArray(body.avoidTemplates)
    ? body.avoidTemplates
        .filter((t): t is Template => TEMPLATES.includes(t as Template))
        .slice(-5)
    : [];

  try {
    const strictSubject = Boolean(body.strictSubject);
    const game = await takeGame({
      subject,
      difficulty,
      avoid,
      avoidTemplates,
      strictSubject,
    });
    if (game === null) {
      return Response.json({ exhausted: true }, { status: 200 });
    }
    return Response.json({ game });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
