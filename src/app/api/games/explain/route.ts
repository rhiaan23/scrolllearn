import { explainAnswer } from "@/lib/claude";
import { Game } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { game?: unknown; userAnswer?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = Game.safeParse(body.game);
  if (!parsed.success) {
    return Response.json({ error: "invalid game payload" }, { status: 400 });
  }
  const userAnswer = typeof body.userAnswer === "string" ? body.userAnswer : "(no answer)";

  try {
    const explanation = await explainAnswer(parsed.data, userAnswer);
    return Response.json({ explanation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
