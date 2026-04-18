import { z } from "zod";

export const SUBJECTS = ["math", "english", "science"] as const;
export type Subject = (typeof SUBJECTS)[number];

export const DIFFICULTIES = [1, 2, 3] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

const baseShape = {
  id: z.string().describe("A unique short slug for this game, e.g. 'math-add-12'"),
  subject: z.enum(SUBJECTS),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]).describe(
    "1 = grades K-1, 2 = grades 2-3, 3 = grades 4-5",
  ),
  prompt: z.string().describe("The question or instruction shown to the student"),
  explanation: z
    .string()
    .describe("Kid-friendly explanation of the correct answer, max 2 sentences"),
};

export const MultipleChoiceGame = z.object({
  template: z.literal("multiple_choice"),
  ...baseShape,
  data: z.object({
    options: z.array(z.string()).length(4).describe("Exactly four answer options"),
    correctIndex: z
      .union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
      .describe("Index of the correct option in the options array"),
  }),
});

export const MatchGame = z.object({
  template: z.literal("match"),
  ...baseShape,
  data: z.object({
    pairs: z
      .array(
        z.object({
          left: z.string().describe("Left-side item"),
          right: z.string().describe("Matching right-side item"),
        }),
      )
      .min(3)
      .max(4)
      .describe("3 or 4 left/right pairs to match"),
  }),
});

export const FillBlankGame = z.object({
  template: z.literal("fill_blank"),
  ...baseShape,
  data: z.object({
    sentence: z
      .string()
      .describe("Sentence with one blank marked as '___' (three underscores)"),
    choices: z.array(z.string()).min(3).max(4).describe("Word bank options"),
    correct: z.string().describe("The choice that correctly fills the blank"),
  }),
});

export const SortGame = z.object({
  template: z.literal("sort"),
  ...baseShape,
  data: z.object({
    items: z.array(z.string()).length(6).describe("Exactly six items to sort"),
    bucketA: z.string().describe("Label of the first bucket"),
    bucketB: z.string().describe("Label of the second bucket"),
    correctA: z
      .array(z.string())
      .describe("Items that belong in bucketA (rest go in bucketB)"),
  }),
});

export const Game = z.discriminatedUnion("template", [
  MultipleChoiceGame,
  MatchGame,
  FillBlankGame,
  SortGame,
]);

export type Game = z.infer<typeof Game>;
export type MultipleChoiceGame = z.infer<typeof MultipleChoiceGame>;
export type MatchGame = z.infer<typeof MatchGame>;
export type FillBlankGame = z.infer<typeof FillBlankGame>;
export type SortGame = z.infer<typeof SortGame>;

export const TEMPLATES = ["multiple_choice", "match", "fill_blank", "sort"] as const;
export type Template = (typeof TEMPLATES)[number];

export const SUBJECT_COLORS: Record<Subject, { bg: string; ring: string; text: string; accent: string }> = {
  math: {
    bg: "from-blue-500 to-blue-700",
    ring: "ring-blue-300",
    text: "text-blue-50",
    accent: "bg-blue-400",
  },
  english: {
    bg: "from-purple-500 to-fuchsia-700",
    ring: "ring-purple-300",
    text: "text-purple-50",
    accent: "bg-purple-400",
  },
  science: {
    bg: "from-emerald-500 to-teal-700",
    ring: "ring-emerald-300",
    text: "text-emerald-50",
    accent: "bg-emerald-400",
  },
};

export const SUBJECT_EMOJI: Record<Subject, string> = {
  math: "🔢",
  english: "📚",
  science: "🔬",
};
