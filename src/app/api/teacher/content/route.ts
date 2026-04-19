import Anthropic from "@anthropic-ai/sdk";
import {
  clearClassContent,
  getClassContent,
  setClassContent,
} from "@/lib/classData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEACHER_PIN = process.env.TEACHER_PIN ?? "1234";
const MODEL = "claude-sonnet-4-6";
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.",
    );
  }
  if (!_client) _client = new Anthropic();
  return _client;
}

/**
 * GET /api/teacher/content?classCode=DEMO&pin=1234
 * Returns the currently saved content (or empty string).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const classCode = url.searchParams.get("classCode")?.trim().toUpperCase();
  const pin = url.searchParams.get("pin");
  if (!classCode) return Response.json({ error: "classCode required" }, { status: 400 });
  if (pin !== TEACHER_PIN) return Response.json({ error: "Invalid PIN" }, { status: 401 });
  return Response.json({ content: getClassContent(classCode) ?? "" });
}

/**
 * POST /api/teacher/content
 *
 * Two flavors:
 *   1) JSON body: `{ classCode, pin, content }` — direct text paste.
 *   2) multipart form: `classCode`, `pin`, `file` — .txt or .pdf upload.
 *      PDFs are sent to Claude (native document understanding) to extract
 *      kid-friendly lesson text before storage.
 */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let classCode = "";
  let pin = "";
  let text = "";
  let sourceFilename: string | undefined;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      classCode = String(form.get("classCode") ?? "").trim().toUpperCase();
      pin = String(form.get("pin") ?? "").trim();
      const file = form.get("file");
      const pasted = String(form.get("content") ?? "").trim();

      if (file && file instanceof File) {
        if (file.size > MAX_FILE_BYTES) {
          return Response.json({ error: "File too large (max 8 MB)" }, { status: 400 });
        }
        sourceFilename = file.name;
        const lower = file.name.toLowerCase();

        if (lower.endsWith(".txt")) {
          text = await file.text();
        } else if (lower.endsWith(".pdf") || file.type === "application/pdf") {
          // PDFs need Claude — fail loud if no API key.
          if (!process.env.ANTHROPIC_API_KEY) {
            return Response.json(
              {
                error:
                  "PDF parsing needs Claude. Set ANTHROPIC_API_KEY in .env.local and restart, or upload a .txt file / paste text instead.",
              },
              { status: 503 },
            );
          }
          const buf = await file.arrayBuffer();
          const base64 = Buffer.from(buf).toString("base64");
          text = await extractTextFromPdf(base64);
        } else {
          return Response.json(
            { error: `Unsupported file type. Use .txt or .pdf` },
            { status: 400 },
          );
        }
      } else if (pasted) {
        text = pasted;
      } else {
        return Response.json({ error: "No file or content provided" }, { status: 400 });
      }
    } else {
      const body = (await request.json()) as {
        classCode?: string;
        pin?: string;
        content?: string;
      };
      classCode = (body.classCode ?? "").trim().toUpperCase();
      pin = (body.pin ?? "").trim();
      text = (body.content ?? "").trim();
    }
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "invalid request" },
      { status: 400 },
    );
  }

  if (!classCode) return Response.json({ error: "classCode required" }, { status: 400 });
  if (pin !== TEACHER_PIN) return Response.json({ error: "Invalid PIN" }, { status: 401 });

  if (!text) {
    // Empty content = clear it
    clearClassContent(classCode);
    return Response.json({ ok: true, cleared: true });
  }

  setClassContent(classCode, text, sourceFilename);
  return Response.json({
    ok: true,
    storedChars: Math.min(text.length, 8000),
    sourceFilename,
  });
}

async function extractTextFromPdf(base64Pdf: string): Promise<string> {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Pdf,
            },
          },
          {
            type: "text",
            text:
              "Extract every educational concept, vocabulary word, fact, formula, " +
              "and example from this document as plain text. Skip page numbers, " +
              "headers, footers, and table-of-contents fluff. Keep the text concise " +
              "but cover ALL teachable topics — this will be used to generate " +
              "elementary-school questions for kids ages 5–10. Output ONLY the " +
              "extracted text, no preamble.",
          },
        ],
      },
    ],
  });

  const textBlock = res.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}
