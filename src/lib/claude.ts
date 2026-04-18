import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  Game,
  type Difficulty,
  type Subject,
  type Template,
  TEMPLATES,
} from "./schema";

const MODEL = "claude-sonnet-4-6";

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    _client = new Anthropic();
  }
  return _client;
}

const SYSTEM_PROMPT = `You design fun educational mini-games for elementary students.

You generate exactly one game at a time as JSON matching the provided schema.

GAME TEMPLATES
1. multiple_choice — A short prompt + exactly 4 answer options. Set correctIndex (0-3).
2. match — 3 or 4 left/right pairs the student matches. Pairs should be obviously paired (word→meaning, animal→habitat, equation→answer).
3. fill_blank — A sentence containing the literal token "___" (three underscores) for the blank, plus 3-4 word-bank choices. "correct" must be one of the choices.
4. sort — Exactly 6 items the student sorts into two labeled buckets. "correctA" lists which items belong in bucketA (the rest go in bucketB).

DIFFICULTY BANDS
- 1: Kindergarten / Grade 1. Single-digit numbers, simple words, very concrete.
- 2: Grades 2-3. Two-digit numbers, common vocabulary, basic facts.
- 3: Grades 4-5. Multi-step problems, richer vocabulary, multi-fact reasoning.

SUBJECT GUIDELINES
- math: addition, subtraction, multiplication, division, number patterns, shapes, fractions (only at difficulty 3).
- english: spelling, vocabulary, antonyms/synonyms, sentence completion, basic grammar.
- science: animals/habitats, plants, weather, states of matter, body systems, simple cause/effect.

WRITING RULES
- Prompts: one short sentence, no preamble, no "Let's", no exclamation marks.
- Use friendly grade-appropriate vocabulary.
- Never include the answer in the prompt.
- explanation: 1-2 short sentences, kid-friendly, explains WHY the answer is correct.
- id: a short kebab-case slug like "math-add-7-8" or "sci-mammals-1".

VARIETY
The user prompt may include "avoid" topics (recently shown). Pick a different concept.
The user prompt may include a desired template. Use exactly that template.
Do NOT repeat the same exact question twice.`;

interface GenerateOpts {
  subject: Subject;
  difficulty: Difficulty;
  template?: Template;
  avoid?: string[]; // recently-shown game ids
}

export async function generateGame(opts: GenerateOpts): Promise<Game> {
  const template =
    opts.template ?? TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];

  const userPrompt = [
    `Generate one ${opts.subject} game.`,
    `Difficulty: ${opts.difficulty}.`,
    `Template: ${template}.`,
    opts.avoid && opts.avoid.length > 0
      ? `Avoid these recent ids: ${opts.avoid.slice(0, 8).join(", ")}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const response = await client().messages.parse({
    model: MODEL,
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
    output_config: { format: zodOutputFormat(Game) },
  });

  if (!response.parsed_output) {
    throw new Error(
      `Claude did not return a parseable game (stop_reason=${response.stop_reason})`,
    );
  }

  // Defensive: enforce template match (if Claude ignored the request)
  const game = response.parsed_output;
  if (game.template !== template) {
    // Accept it anyway — variety is fine. But log for debugging.
    console.warn(
      `[generateGame] requested ${template} got ${game.template} for ${opts.subject}/${opts.difficulty}`,
    );
  }
  return game;
}

export async function explainAnswer(
  game: Game,
  userAnswerDescription: string,
): Promise<string> {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 300,
    system:
      "You are a friendly tutor for elementary students. Explain in 1-2 short sentences why the correct answer is right. Be encouraging. Never scold.",
    messages: [
      {
        role: "user",
        content: `The game prompt was: "${game.prompt}". The student answered: "${userAnswerDescription}". The pre-written explanation is: "${game.explanation}". Re-explain it in your own words, briefly and warmly.`,
      },
    ],
  });
  const text = response.content.find((b) => b.type === "text");
  return text && text.type === "text" ? text.text : game.explanation;
}
