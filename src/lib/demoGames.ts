/**
 * DEMO class curated games — pre-built to match Ms. Johnson's Grade-3
 * daily syllabus (multiplication 2s/5s/10s, ecosystems vocab, food chains).
 *
 * Used when the student is in classCode "DEMO" so we can demonstrate
 * "AI-tailored to teacher-uploaded content" without burning compute or
 * needing an Anthropic API key for the live demo.
 */
import { Game, type Game as GameType, type Subject } from "./schema";

export const DEMO_GAMES: GameType[] = [
  // ── MATH ── multiplication 2s, 5s, 10s ──────────────────────────────

  Game.parse({
    id: "demo-syllabus-math-blanks-2s",
    subject: "math",
    difficulty: 2,
    template: "math_blanks",
    prompt: "Fill the blank — 2-times table.",
    explanation: "The 2-times table doubles each time: 2, 4, 6, 8, 10, 12, 14…",
    data: {
      questions: [
        { expression: "2 × ___ = 6", options: ["2", "3", "4"], correctIndex: 1 },
        { expression: "2 × 5 = ___", options: ["8", "10", "12"], correctIndex: 1 },
        { expression: "___ × 2 = 14", options: ["6", "7", "8"], correctIndex: 1 },
        { expression: "2 × 8 = ___", options: ["14", "16", "18"], correctIndex: 1 },
      ],
    },
  }),

  Game.parse({
    id: "demo-syllabus-math-blanks-5s",
    subject: "math",
    difficulty: 2,
    template: "math_blanks",
    prompt: "Fill the blank — 5-times table.",
    explanation: "Counting by 5s: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50.",
    data: {
      questions: [
        { expression: "5 × 3 = ___", options: ["10", "15", "20"], correctIndex: 1 },
        { expression: "5 × ___ = 25", options: ["4", "5", "6"], correctIndex: 1 },
        { expression: "___ × 5 = 40", options: ["7", "8", "9"], correctIndex: 1 },
        { expression: "5 × 6 = ___", options: ["25", "30", "35"], correctIndex: 1 },
      ],
    },
  }),

  Game.parse({
    id: "demo-syllabus-math-blanks-10s",
    subject: "math",
    difficulty: 2,
    template: "math_blanks",
    prompt: "Fill the blank — 10-times table.",
    explanation: "Multiplying by 10 just adds a zero: 1×10=10, 7×10=70.",
    data: {
      questions: [
        { expression: "10 × 4 = ___", options: ["30", "40", "50"], correctIndex: 1 },
        { expression: "10 × ___ = 70", options: ["6", "7", "8"], correctIndex: 1 },
        { expression: "___ × 10 = 90", options: ["8", "9", "10"], correctIndex: 1 },
        { expression: "10 × 6 = ___", options: ["50", "60", "70"], correctIndex: 1 },
      ],
    },
  }),

  Game.parse({
    id: "demo-syllabus-math-castle-mult",
    subject: "math",
    difficulty: 2,
    template: "math_castle",
    prompt: "Defend the castle — solve the multiplication!",
    explanation: "Quick recall of 2s, 5s, and 10s tables stops the enemies in time.",
    data: {
      enemies: [
        { question: "2×4", answer: 8 },
        { question: "5×3", answer: 15 },
        { question: "10×2", answer: 20 },
        { question: "5×6", answer: 30 },
        { question: "2×7", answer: 14 },
      ],
      travelDurationMs: 12000,
      spawnIntervalMs: 2500,
      lives: 3,
    },
  }),

  Game.parse({
    id: "demo-syllabus-math-chase-mult10",
    subject: "math",
    difficulty: 2,
    template: "math_chase",
    prompt: "Catch numbers that multiply to 30 with another!",
    explanation: "Pairs that make 30: 3×10, 5×6, 2×15. Look for a partner.",
    data: {
      target: 30,
      durationSec: 25,
      spawnIntervalMs: 1100,
      pool: [3, 5, 6, 10, 15, 2, 4, 7, 8, 12, 20, 25],
    },
  }),

  Game.parse({
    id: "demo-syllabus-clean-river-2s",
    subject: "math",
    difficulty: 2,
    template: "clean_river",
    prompt: "Tap the right multiplication answer before it floats away.",
    explanation: "Practice 2s and 5s tables — read the expression, then tap the matching number.",
    data: {
      rounds: [
        { expression: "2×6", answer: 12, options: [10, 12, 14] },
        { expression: "5×4", answer: 20, options: [15, 20, 25] },
        { expression: "10×3", answer: 30, options: [20, 30, 40] },
        { expression: "2×9", answer: 18, options: [16, 18, 20] },
      ],
      fallDurationMs: 9000,
      lives: 3,
    },
  }),

  Game.parse({
    id: "demo-syllabus-balance-fives",
    subject: "math",
    difficulty: 2,
    template: "balance_scale",
    prompt: "Balance both sides — pick the weights.",
    explanation: "Left side = 5 + 5 + 10 = 20. Pick weights from the pool that also add to 20.",
    data: {
      fixed: { side: "left", weights: [5, 5, 10] },
      pool: [5, 10, 15, 20, 2, 8],
    },
  }),

  Game.parse({
    id: "demo-syllabus-merge-math-32",
    subject: "math",
    difficulty: 2,
    template: "merge_math",
    prompt: "Merge tiles to build 32 — like multiplication doubling!",
    explanation: "Each merge doubles the number — 2+2=4, 4+4=8, 8+8=16, 16+16=32.",
    data: {
      target: 32,
      startGrid: [
        [2, 4, null, 2],
        [null, 8, 4, null],
        [16, null, 2, 4],
        [null, 2, null, 8],
      ],
    },
  }),

  // ── ENGLISH ── syllabus spelling + vocab (habitat / predict / observe /
  //               environment / animal / forest / climate) ──

  Game.parse({
    id: "demo-syllabus-word-builder-eco",
    subject: "english",
    difficulty: 2,
    template: "word_builder",
    prompt: "Spell today's vocabulary words.",
    explanation: "All four words come from today's reading on ecosystems.",
    data: {
      words: [
        { hint: "where animals live", emoji: "🌳", answer: "forest" },
        { hint: "weather over a long time", emoji: "🌦️", answer: "climate" },
        { hint: "a living creature", emoji: "🐾", answer: "animal" },
        { hint: "everything around us", emoji: "🌍", answer: "habitat" },
      ],
    },
  }),

  Game.parse({
    id: "demo-syllabus-hangman-ecosystem",
    subject: "english",
    difficulty: 2,
    template: "hangman",
    prompt: "Guess the science word from today's lesson.",
    explanation: "An ecosystem is all the living and non-living things in one place.",
    data: {
      word: "ecosystem",
      hint: "All the living things and their environment together.",
      maxMisses: 6,
    },
  }),

  Game.parse({
    id: "demo-syllabus-hangman-habitat",
    subject: "english",
    difficulty: 1,
    template: "hangman",
    prompt: "Guess today's vocabulary word.",
    explanation: "A habitat is the place where an animal naturally lives.",
    data: {
      word: "habitat",
      hint: "The place where an animal naturally lives.",
      maxMisses: 6,
    },
  }),

  Game.parse({
    id: "demo-syllabus-hangman-predict",
    subject: "english",
    difficulty: 2,
    template: "hangman",
    prompt: "Guess today's vocabulary word.",
    explanation: "To predict means to say what you think will happen next.",
    data: {
      word: "predict",
      hint: "To say what you think will happen next.",
      maxMisses: 6,
    },
  }),

  Game.parse({
    id: "demo-syllabus-mini-crossword",
    subject: "english",
    difficulty: 2,
    template: "mini_crossword",
    prompt: "Today's vocabulary crossword — animals from the story.",
    explanation: "Both answers come from today's ecosystem reading.",
    data: {
      // 5×5 grid. FOX across at (0,0..2); OWL down at (0,1..2,1) intersect on 'O'.
      size: 5,
      entries: [
        { answer: "fox", clue: "Small wild animal with a bushy tail", row: 0, col: 0, direction: "across" },
        { answer: "owl", clue: "Bird that hunts at night and says 'hoot'", row: 0, col: 1, direction: "down" },
      ],
    },
  }),

  Game.parse({
    id: "demo-syllabus-sentence-scramble",
    subject: "english",
    difficulty: 2,
    template: "sentence_scramble",
    prompt: "Unscramble each sentence.",
    explanation: "Use today's reading vocabulary — animal, forest, habitat.",
    data: {
      sentences: [
        { words: ["The", "fox", "lives", "in", "the", "forest."] },
        { words: ["A", "habitat", "is", "an", "animal's", "home."] },
        { words: ["We", "observe", "the", "rain", "today."] },
      ],
    },
  }),

  Game.parse({
    id: "demo-syllabus-flash-vocab",
    subject: "english",
    difficulty: 2,
    template: "flash_quiz",
    prompt: "Quick vocabulary check.",
    explanation: "These are the new vocabulary words from today.",
    data: {
      theme: "Today's vocabulary",
      questions: [
        {
          prompt: "What does HABITAT mean?",
          emoji: "🏞️",
          options: ["a kind of food", "where an animal lives", "a type of weather"],
          correctIndex: 1,
        },
        {
          prompt: "What does PREDICT mean?",
          emoji: "🔮",
          options: ["to look back", "to draw a picture", "to say what will happen next"],
          correctIndex: 2,
        },
        {
          prompt: "What does OBSERVE mean?",
          emoji: "👀",
          options: ["to watch carefully", "to forget", "to run away"],
          correctIndex: 0,
        },
      ],
    },
  }),

  // ── SCIENCE ── ecosystems / producers / consumers / decomposers / food chains

  Game.parse({
    id: "demo-syllabus-quick-sort-producers",
    subject: "science",
    difficulty: 2,
    template: "quick_sort",
    prompt: "Tap only the producers (plants that make their own food).",
    explanation:
      "Producers are plants — they make food using sunlight (photosynthesis). Animals are consumers; mushrooms are decomposers.",
    data: {
      rule: "Tap the producers",
      ruleEmoji: "🌱",
      pool: [
        { emoji: "🌳", label: "tree", matches: true },
        { emoji: "🌻", label: "sunflower", matches: true },
        { emoji: "🌾", label: "grass", matches: true },
        { emoji: "🌿", label: "fern", matches: true },
        { emoji: "🌽", label: "corn", matches: true },
        { emoji: "🦊", label: "fox", matches: false },
        { emoji: "🐰", label: "rabbit", matches: false },
        { emoji: "🦁", label: "lion", matches: false },
        { emoji: "🍄", label: "mushroom", matches: false },
        { emoji: "🐺", label: "wolf", matches: false },
      ],
      durationSec: 25,
      passingScore: 4,
    },
  }),

  Game.parse({
    id: "demo-syllabus-quick-sort-consumers",
    subject: "science",
    difficulty: 2,
    template: "quick_sort",
    prompt: "Tap only the consumers (animals that eat other things).",
    explanation:
      "Consumers eat other living things to get energy — animals are consumers, plants are not.",
    data: {
      rule: "Tap the consumers",
      ruleEmoji: "🦁",
      pool: [
        { emoji: "🦊", label: "fox", matches: true },
        { emoji: "🐰", label: "rabbit", matches: true },
        { emoji: "🦅", label: "eagle", matches: true },
        { emoji: "🐻", label: "bear", matches: true },
        { emoji: "🐺", label: "wolf", matches: true },
        { emoji: "🌳", label: "tree", matches: false },
        { emoji: "🌻", label: "flower", matches: false },
        { emoji: "🍄", label: "mushroom", matches: false },
        { emoji: "🌾", label: "grass", matches: false },
        { emoji: "🌿", label: "fern", matches: false },
      ],
      durationSec: 25,
      passingScore: 4,
    },
  }),

  Game.parse({
    id: "demo-syllabus-sequence-food-chain",
    subject: "science",
    difficulty: 2,
    template: "sequence_order",
    prompt: "Order the food chain — who eats whom?",
    explanation:
      "Energy flows from the sun → producers (grass) → primary consumers (rabbit) → predators (fox).",
    data: {
      tokens: ["Fox", "Sun", "Grass", "Rabbit"],
      correctOrder: ["Sun", "Grass", "Rabbit", "Fox"],
    },
  }),

  Game.parse({
    id: "demo-syllabus-sequence-ecosystem-roles",
    subject: "science",
    difficulty: 3,
    template: "sequence_order",
    prompt: "Order the ecosystem roles by who comes first in the food chain.",
    explanation:
      "Producers (plants) come first — they're eaten by consumers — and decomposers break things down at the end.",
    data: {
      tokens: ["Decomposer", "Consumer", "Producer"],
      correctOrder: ["Producer", "Consumer", "Decomposer"],
    },
  }),

  Game.parse({
    id: "demo-syllabus-flash-ecosystems",
    subject: "science",
    difficulty: 2,
    template: "flash_quiz",
    prompt: "Quick ecosystems quiz.",
    explanation: "Producers, consumers, and decomposers all play different roles.",
    data: {
      theme: "Ecosystems",
      questions: [
        {
          prompt: "Which one is a PRODUCER?",
          emoji: "🌱",
          options: ["a fox", "a tree", "a mushroom"],
          correctIndex: 1,
        },
        {
          prompt: "Which one is a CONSUMER?",
          emoji: "🦁",
          options: ["grass", "an oak", "a rabbit"],
          correctIndex: 2,
        },
        {
          prompt: "Which one is a DECOMPOSER?",
          emoji: "🍄",
          options: ["a mushroom", "a deer", "a sunflower"],
          correctIndex: 0,
        },
        {
          prompt: "What does a producer use to make food?",
          emoji: "☀️",
          options: ["meat", "sunlight", "rocks"],
          correctIndex: 1,
        },
      ],
    },
  }),

  Game.parse({
    id: "demo-syllabus-wizard-eco",
    subject: "science",
    difficulty: 2,
    template: "wizard_dungeon",
    prompt: "Defeat the dungeon — answer ecosystem questions!",
    explanation:
      "Each correct answer hits the enemy. Use what you learned about food chains.",
    data: {
      questions: [
        {
          question: "Which group makes its own food?",
          options: ["Producers", "Consumers", "Decomposers"],
          correctIndex: 0,
        },
        {
          question: "What do consumers eat?",
          options: ["Sunlight only", "Other living things", "Rocks"],
          correctIndex: 1,
        },
        {
          question: "What is the role of decomposers?",
          options: [
            "Make sunlight",
            "Hunt rabbits",
            "Break down dead things",
          ],
          correctIndex: 2,
        },
        {
          question: "Where does the energy in a food chain start?",
          options: ["The sun", "The moon", "The wind"],
          correctIndex: 0,
        },
      ],
      heroHp: 4,
      enemyHp: 4,
    },
  }),

  Game.parse({
    id: "demo-syllabus-flash-vocab-mix",
    subject: "english",
    difficulty: 1,
    template: "flash_quiz",
    prompt: "Quick word match — what fits each picture?",
    explanation: "Match each photo-prompt to today's vocabulary word.",
    data: {
      theme: "Picture vocab",
      questions: [
        {
          prompt: "What kind of place is this?",
          emoji: "🌳",
          options: ["desert", "forest", "ocean"],
          correctIndex: 1,
        },
        {
          prompt: "Which word fits the weather?",
          emoji: "🌦️",
          options: ["climate", "habitat", "animal"],
          correctIndex: 0,
        },
        {
          prompt: "Which word means to watch carefully?",
          emoji: "👀",
          options: ["predict", "observe", "spell"],
          correctIndex: 1,
        },
      ],
    },
  }),
];

/** Pick a demo game for the given subject (random unless filtered). */
export function pickDemoGame(opts: {
  subject?: Subject;
  avoid?: string[];
  avoidTemplates?: string[];
}): GameType | null {
  const seen = new Set(opts.avoid ?? []);
  const recentTemplates = new Set((opts.avoidTemplates ?? []).slice(-3));

  const notSeen = (g: GameType) => !seen.has(g.id);
  const freshTemplate = (g: GameType) => !recentTemplates.has(g.template);

  // 1. Subject + fresh template + unseen
  if (opts.subject) {
    const t1 = DEMO_GAMES.filter(
      (g) => g.subject === opts.subject && notSeen(g) && freshTemplate(g),
    );
    if (t1.length > 0) return pickRandom(t1);

    const t2 = DEMO_GAMES.filter((g) => g.subject === opts.subject && notSeen(g));
    if (t2.length > 0) return pickRandom(t2);
  }

  // 2. Any unseen with fresh template
  const t3 = DEMO_GAMES.filter((g) => notSeen(g) && freshTemplate(g));
  if (t3.length > 0) return pickRandom(t3);

  // 3. Any unseen
  const t4 = DEMO_GAMES.filter(notSeen);
  if (t4.length > 0) return pickRandom(t4);

  // 4. Cycle: drop avoid filter
  return pickRandom(DEMO_GAMES);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
