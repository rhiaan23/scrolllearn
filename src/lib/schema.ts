import { z } from "zod";

export const SUBJECTS = ["math", "english", "science"] as const;
export type Subject = (typeof SUBJECTS)[number];

export const DIFFICULTIES = [1, 2, 3] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

const baseShape = {
  id: z.string(),
  subject: z.enum(SUBJECTS),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  prompt: z.string(),
  explanation: z.string(),
};

// 4×4 grid of (number | null). Null = empty cell.
const Grid = z.array(z.array(z.number().int().nullable()).length(4)).length(4);

export const MergeMathGame = z.object({
  template: z.literal("merge_math"),
  ...baseShape,
  data: z.object({
    target: z.number().int().min(2).max(99),
    startGrid: Grid,
    winMerges: z.number().int().min(1).max(10).default(3),
  }),
});

export const WordBuilderGame = z.object({
  template: z.literal("word_builder"),
  ...baseShape,
  data: z.object({
    words: z
      .array(
        z.object({
          hint: z.string(),
          emoji: z.string(),
          answer: z.string().min(2).max(10),
        }),
      )
      .min(1)
      .max(5),
  }),
});

export const QuickSortGame = z.object({
  template: z.literal("quick_sort"),
  ...baseShape,
  data: z.object({
    rule: z.string(),
    ruleEmoji: z.string(),
    pool: z
      .array(
        z.object({
          emoji: z.string(),
          label: z.string(),
          matches: z.boolean(),
        }),
      )
      .min(6),
    durationSec: z.number().int().min(10).max(60).default(20),
    passingScore: z.number().int().min(1).default(5),
  }),
});

export const SequenceOrderGame = z.object({
  template: z.literal("sequence_order"),
  ...baseShape,
  data: z.object({
    tokens: z.array(z.string()).min(3).max(7),
    correctOrder: z.array(z.string()).min(3).max(7),
  }),
});

export const Game = z.discriminatedUnion("template", [
  MergeMathGame,
  WordBuilderGame,
  QuickSortGame,
  SequenceOrderGame,
]);

export type Game = z.infer<typeof Game>;
export type MergeMathGame = z.infer<typeof MergeMathGame>;
export type WordBuilderGame = z.infer<typeof WordBuilderGame>;
export type QuickSortGame = z.infer<typeof QuickSortGame>;
export type SequenceOrderGame = z.infer<typeof SequenceOrderGame>;

export const TEMPLATES = [
  "merge_math",
  "word_builder",
  "quick_sort",
  "sequence_order",
] as const;
export type Template = (typeof TEMPLATES)[number];

export const SUBJECT_COLORS: Record<
  Subject,
  { bg: string; ring: string; text: string; accent: string; handle: string }
> = {
  math: {
    bg: "from-blue-500 via-indigo-600 to-blue-800",
    ring: "ring-blue-300",
    text: "text-blue-50",
    accent: "bg-blue-400",
    handle: "math_bot",
  },
  english: {
    bg: "from-purple-500 via-fuchsia-600 to-pink-700",
    ring: "ring-purple-300",
    text: "text-purple-50",
    accent: "bg-purple-400",
    handle: "english_bot",
  },
  science: {
    bg: "from-emerald-500 via-teal-600 to-cyan-800",
    ring: "ring-emerald-300",
    text: "text-emerald-50",
    accent: "bg-emerald-400",
    handle: "science_bot",
  },
};

export const SUBJECT_EMOJI: Record<Subject, string> = {
  math: "🔢",
  english: "📚",
  science: "🔬",
};
