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
1. merge_math — Classic 2048 on a 4×4 grid. Equal-valued adjacent tiles merge into the doubled value when slid together (2+2=4, 4+4=8, 8+8=16, …). target MUST be one of {16, 32, 64, 128} — the tile value the student must build. Provide a 4×4 startGrid of (number|null) where every non-null cell is a power of two (2, 4, 8, 16, 32, 64). Optional winTile (defaults to target). The start grid must be solvable in a handful of moves and contain enough seeded pairs to make merging the target plausible.
2. word_builder — 1-5 short words, each with a hint sentence and a single emoji. The student spells each word letter-by-letter.
3. quick_sort — A rule sentence plus ≥6 emoji+label items; each item has matches: true|false. Student taps only matches within durationSec (10-60). passingScore is how many correct taps win the round.
4. math_castle — Tower-defense math round. Provide enemies: an array of 3-6 { question, answer } objects. question is a compact math expression as a string (e.g., "7+8", "15-6", "6×4"). answer is the integer result. Also provide travelDurationMs (6000-20000, how long each enemy takes to reach the castle — smaller is harder), spawnIntervalMs (1000-6000, delay between spawns), and lives (1-3). Always subject=math. Easy: travel 14000-18000, lives 3, small sums. Medium: travel 10000-13000, lives 2, mixed ops within 20. Hard: travel 7000-10000, lives 2, multiplication/two-digit.
6. clean_river — Tap-the-answer river round. Provide rounds: an array of 3-5 { expression, answer, options } objects. expression is a compact math expression as a string (e.g., "3+4", "12-5", "6×7"). answer is the integer result. options is an array of 3-4 integers that INCLUDES the correct answer plus plausible distractors (off-by-one or common-mistake values). Also provide fallDurationMs (5000-12000, how long each option floats before disappearing — smaller is harder) and lives (1-3). Always subject=math. Easy: operands ≤10, fall 9000-11000, lives 3. Medium: operands up to 20 mixed +/−, fall 7000-9000, lives 2. Hard: single-digit multiplication, fall 6000-8000, lives 2.
7. wizard_dungeon — Hero-vs-enemy RPG quiz. Provide questions: an array of 3-7 { question, options, correctIndex } objects. Each question has exactly 3 options (a tuple of 3 strings) and correctIndex is 0, 1, or 2. Also provide heroHp (2-6, default 4) and enemyHp (2-6, default 4). Correct answers hit the enemy; wrong answers hit the hero. Best for science subject. Easy: simple recall, 3 questions, hp 3. Medium: cause-and-effect, 5-6 questions, hp 4. Hard: multi-fact reasoning, 7 questions, hp 3.
8. fraction_golf — Equivalent-fractions mini-golf. A fraction like "6/9" is displayed; the student reduces it by picking one ball from the numerator pool and one from the denominator pool that form the simplified form (e.g., 2/3). Provide displayNumerator and displayDenominator (the "course" fraction, both ≥2, gcd(n,d) > 1 so there is a non-trivial reduction). Provide topBalls: exactly 2 integers [correct, distractor] where correct = displayNumerator/gcd and distractor is a plausible wrong value 1-12. Provide bottomBalls: exactly 2 integers [correct, distractor] similarly. Provide maxStrokes (3-5). Always subject=math. Difficulty 2: fractions with small factors (gcd 2 or 3, numbers ≤12). Difficulty 3: larger or multi-step reductions (gcd up to 5, numbers ≤30).

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
