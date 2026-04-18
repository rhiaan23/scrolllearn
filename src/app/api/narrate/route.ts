export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel — friendly default

export async function POST(request: Request) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return Response.json({ error: "ELEVENLABS_API_KEY not set" }, { status: 503 });
  }

  let body: { text?: string; voiceId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.slice(0, 500) : "";
  if (!text.trim()) {
    return Response.json({ error: "text is required" }, { status: 400 });
  }
  const voiceId = body.voiceId || DEFAULT_VOICE_ID;

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );

  if (!upstream.ok) {
    const detail = await upstream.text();
    return Response.json(
      { error: `ElevenLabs ${upstream.status}: ${detail.slice(0, 200)}` },
      { status: 502 },
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
