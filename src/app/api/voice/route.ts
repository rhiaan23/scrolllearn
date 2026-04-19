export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Friendly female voice. Defaults to "Bella" (warm, teacher-like).
// Override via ELEVENLABS_VOICE_ID. Other good female teacher voices:
//   ThT5KcBeYPX3keUQqHPh — Dorothy (mature, classroom)
//   pFZP5JQG7iQjIQuC4Bku — Lily (gentle, young)
//   21m00Tcm4TlvDq8ikWAM — Rachel (calm narrator)
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Bella

export async function POST(request: Request) {
  let body: { text?: string } = {};
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) {
    return Response.json({ error: "text required" }, { status: 400 });
  }
  if (text.length > 1000) {
    return Response.json({ error: "text too long (max 1000 chars)" }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ELEVENLABS_API_KEY is not set on the server" },
      { status: 503 },
    );
  }
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5", // low-latency model
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return Response.json(
        { error: `ElevenLabs ${res.status}: ${errText.slice(0, 200)}` },
        { status: res.status },
      );
    }

    const audioBuffer = await res.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        // Same text → same audio; cache aggressively at the edge.
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 },
    );
  }
}
