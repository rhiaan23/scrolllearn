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
    target: z.union([
      z.literal(16),
      z.literal(32),
      z.literal(64),
      z.literal(128),
    ]),
    startGrid: Grid,
    winTile: z.number().int().optional(),
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

export const MathCastleGame = z.object({
  template: z.literal("math_castle"),
  ...baseShape,
  data: z.object({
    enemies: z
      .array(
        z.object({
          question: z.string().min(1).max(24),
          answer: z.number().int(),
        }),
      )
      .min(3)
      .max(6),
    travelDurationMs: z.number().int().min(6000).max(20000).default(12000),
    spawnIntervalMs: z.number().int().min(1000).max(6000).default(2500),
    lives: z.number().int().min(1).max(3).default(2),
  }),
});

export const HangmanGame = z.object({
  template: z.literal("hangman"),
  ...baseShape,
  data: z.object({
    word: z.string().min(3).max(12),
    hint: z.string().min(1).max(80),
    maxMisses: z.number().int().min(3).max(10).default(6),
  }),
});

export const MiniCrosswordGame = z.object({
  template: z.literal("mini_crossword"),
  ...baseShape,
  data: z.object({
    size: z.number().int().min(3).max(6),
    entries: z
      .array(
        z.object({
          answer: z.string().min(2).max(8),
          clue: z.string().min(1).max(80),
          row: z.number().int().min(0).max(5),
          col: z.number().int().min(0).max(5),
          direction: z.enum(["across", "down"]),
        }),
      )
      .min(2)
      .max(6),
  }),
});

export const GrammarQuestGame = z.object({
  template: z.literal("grammar_quest"),
  ...baseShape,
  data: z.object({
    questions: z
      .array(
        z.object({
          sentence: z.string().min(4).max(140), // contains "___" placeholder
          options: z.array(z.string()).min(2).max(4),
          correctIndex: z.number().int().min(0).max(3),
        }),
      )
      .min(3)
      .max(10),
    passingScore: z.number().int().min(1).optional(), // defaults to ceil(N * 0.6)
  }),
});

export const WizardDungeonGame = z.object({
  template: z.literal("wizard_dungeon"),
  ...baseShape,
  data: z.object({
    questions: z
      .array(
        z.object({
          question: z.string().min(4).max(160),
          options: z.tuple([z.string(), z.string(), z.string()]),
          correctIndex: z.union([z.literal(0), z.literal(1), z.literal(2)]),
        }),
      )
      .min(3)
      .max(7),
    heroHp: z.number().int().min(2).max(6).default(4),
    enemyHp: z.number().int().min(2).max(6).default(4),
  }),
});

export const FractionGolfGame = z.object({
  template: z.literal("fraction_golf"),
  ...baseShape,
  data: z.object({
    displayNumerator: z.number().int().min(1).max(60),
    displayDenominator: z.number().int().min(2).max(60),
    // 2 balls per half; exactly one per half is the correct reduced-form value
    topBalls: z.tuple([z.number().int().min(1).max(12), z.number().int().min(1).max(12)]),
    bottomBalls: z.tuple([z.number().int().min(1).max(12), z.number().int().min(1).max(12)]),
    maxStrokes: z.number().int().min(3).max(8),
  }),
});

export const CalculationsterGame = z.object({
  template: z.literal("calculationster"),
  ...baseShape,
  data: z.object({
    operations: z.array(z.enum(["+", "-", "×", "÷"])).min(1).max(4),
    maxOperand: z.number().int().min(5).max(99),
    durationSec: z.number().int().min(15).max(45).default(25),
    passingScore: z.number().int().min(1).default(4),
  }),
});

export const NameFigureGame = z.object({
  template: z.literal("name_figure"),
  ...baseShape,
  data: z.object({
    imageSrc: z.string().min(1), // absolute path under /public, e.g. /figures/tesla.jpg
    figure: z.string().min(2).max(40), // the correct full name
    clue: z.string().min(4).max(140), // 1-sentence hint shown under the portrait
    options: z.array(z.string().min(2).max(40)).min(3).max(4), // includes `figure`
  }),
});

export const Game = z.discriminatedUnion("template", [
  MergeMathGame,
  WordBuilderGame,
  QuickSortGame,
  MathCastleGame,
  HangmanGame,
  MiniCrosswordGame,
  GrammarQuestGame,
  WizardDungeonGame,
  FractionGolfGame,
  CalculationsterGame,
  NameFigureGame,
]);

export type Game = z.infer<typeof Game>;
export type MergeMathGame = z.infer<typeof MergeMathGame>;
export type WordBuilderGame = z.infer<typeof WordBuilderGame>;
export type QuickSortGame = z.infer<typeof QuickSortGame>;
export type MathCastleGame = z.infer<typeof MathCastleGame>;
export type HangmanGame = z.infer<typeof HangmanGame>;
export type MiniCrosswordGame = z.infer<typeof MiniCrosswordGame>;
export type GrammarQuestGame = z.infer<typeof GrammarQuestGame>;
export type WizardDungeonGame = z.infer<typeof WizardDungeonGame>;
export type FractionGolfGame = z.infer<typeof FractionGolfGame>;
export type CalculationsterGame = z.infer<typeof CalculationsterGame>;
export type NameFigureGame = z.infer<typeof NameFigureGame>;

export const TEMPLATES = [
  "merge_math",
  "word_builder",
  "quick_sort",
  "math_castle",
  "hangman",
  "mini_crossword",
  "grammar_quest",
  "wizard_dungeon",
  "fraction_golf",
  "calculationster",
  "name_figure",
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
