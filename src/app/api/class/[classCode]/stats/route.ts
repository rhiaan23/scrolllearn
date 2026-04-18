import { getClassStats } from "@/lib/classData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEACHER_PIN = process.env.TEACHER_PIN ?? "1234";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classCode: string }> },
) {
  const pin = new URL(request.url).searchParams.get("pin");
  if (pin !== TEACHER_PIN) {
    return Response.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const { classCode } = await params;
  const stats = getClassStats(classCode.toUpperCase());
  return Response.json(stats);
}
