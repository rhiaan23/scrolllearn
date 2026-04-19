export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Jessica — warm, friendly premade voice that works on free-tier API keys.
// (The original "Rachel" voice has been moved to paid-only.) Override by
// setting ELEVENLABS_VOICE_ID in .env.local.
const DEFAULT_VOICE_ID = "cgSgspJ2msm6clMCkdW9";

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
  const voiceId =
    body.voiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

  // Use the with-timestamps endpoint so the client can highlight each
  // character as it's being spoken. Returns JSON with base64 audio + per-char
  // alignment instead of a raw MP3 stream.
  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
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

  const data = await upstream.json();
  // Forward verbatim. Shape: { audio_base64, alignment: { characters,
  // character_start_times_seconds, character_end_times_seconds } }
  return Response.json(data, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
