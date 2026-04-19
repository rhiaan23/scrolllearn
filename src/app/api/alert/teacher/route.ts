import { appendAlert } from "@/lib/classData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReqBody {
  text?: string;
  studentId?: string;
  studentName?: string;
  classCode?: string;
  gameId?: string;
}

/**
 * Teacher-alert dispatcher.
 *
 * Priority:
 *   1. TWILIO_SID + TWILIO_TOKEN + TWILIO_FROM + TEACHER_PHONE → real SMS.
 *   2. NEXT_PUBLIC_TEACHER_PHONE or TEACHER_PHONE → `sms:` link the client
 *      can navigate to; opens the student's native Messages app with a
 *      prefilled body.
 *   3. Nothing configured → 503. Client shows "not configured" toast.
 *
 * Every successful attempt (incl. sms-link which still requires the student
 * to tap send) is recorded to data/class-data.json so the teacher dashboard
 * can surface alerts later.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ReqBody;

  const text =
    typeof body.text === "string" && body.text.trim().length > 0
      ? body.text.trim()
      : "A student needs help on FunFeed.";
  const gameId = typeof body.gameId === "string" ? body.gameId : "unknown";

  const phone =
    process.env.TEACHER_PHONE ?? process.env.NEXT_PUBLIC_TEACHER_PHONE ?? "";

  if (!phone) {
    appendAlert({
      studentId: body.studentId,
      studentName: body.studentName,
      classCode: body.classCode,
      gameId,
      text,
      mode: "unconfigured",
      timestamp: Date.now(),
    });
    return Response.json(
      { error: "No teacher phone configured" },
      { status: 503 },
    );
  }

  const sid = process.env.TWILIO_SID ?? "";
  const token = process.env.TWILIO_TOKEN ?? "";
  const from = process.env.TWILIO_FROM ?? "";

  if (sid && token && from) {
    try {
      const form = new URLSearchParams();
      form.set("To", phone);
      form.set("From", from);
      form.set("Body", text);

      const auth = Buffer.from(`${sid}:${token}`).toString("base64");
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form.toString(),
        },
      );
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Twilio HTTP ${res.status}: ${errText.slice(0, 200)}`);
      }
      const json = (await res.json()) as { sid?: string };

      appendAlert({
        studentId: body.studentId,
        studentName: body.studentName,
        classCode: body.classCode,
        gameId,
        text,
        mode: "twilio",
        timestamp: Date.now(),
      });

      return Response.json({ mode: "twilio", sent: true, sid: json.sid });
    } catch (err) {
      const message = err instanceof Error ? err.message : "twilio failed";
      return Response.json({ error: message }, { status: 502 });
    }
  }

  // Fallback: hand the client an `sms:` link.
  const href = `sms:${encodeURIComponent(phone)}?&body=${encodeURIComponent(text)}`;

  appendAlert({
    studentId: body.studentId,
    studentName: body.studentName,
    classCode: body.classCode,
    gameId,
    text,
    mode: "sms-link",
    timestamp: Date.now(),
  });

  return Response.json({ mode: "sms-link", href });
}
