import { Game } from "./schema";

/**
 * Demo syllabus mode — when a teacher "uploads" a syllabus we serve games
 * from a hand-built pool tailored to that syllabus's topics instead of the
 * generic seed pool. No AI / PDF parsing; this is shipped data.
 */
export interface DemoSyllabus {
  id: string;
  title: string;
  grade: string;
  teacher: string;
  topics: string[];
  games: Game[];
}

const GRADE_3_ECOSYSTEMS_GAMES: Game[] = [
  // -------- Math (multiplication through 10, fractions) -------------------
  Game.parse({
    id: "syl-g3-eco-math-tables-a",
    subject: "math",
    difficulty: 2,
    template: "math_castle",
    prompt: "Times-tables siege — defend the castle.",
    explanation:
      "Multiplication is repeated addition. 5 × 4 = 5 + 5 + 5 + 5 = 20.",
    data: {
      enemies: [
        { question: "2×6", answer: 12 },
        { question: "5×4", answer: 20 },
        { question: "10×7", answer: 70 },
        { question: "2×9", answer: 18 },
        { question: "5×8", answer: 40 },
      ],
      travelDurationMs: 13000,
      spawnIntervalMs: 2800,
      lives: 2,
    },
  }),
  Game.parse({
    id: "syl-g3-eco-math-tables-b",
    subject: "math",
    difficulty: 2,
    template: "math_castle",
    prompt: "Mixed times tables — answer fast!",
    explanation:
      "Look for patterns — 10× just adds a zero, 5× ends in 0 or 5, doubling works for 2s and 4s.",
    data: {
      enemies: [
        { question: "10×4", answer: 40 },
        { question: "6×3", answer: 18 },
        { question: "2×7", answer: 14 },
        { question: "10×8", answer: 80 },
        { question: "5×6", answer: 30 },
      ],
      travelDurationMs: 12000,
      spawnIntervalMs: 2600,
      lives: 2,
    },
  }),
  Game.parse({
    id: "syl-g3-eco-math-drill",
    subject: "math",
    difficulty: 2,
    template: "calculationster",
    prompt: "Feed the monster — solve multiplication before time runs out!",
    explanation:
      "Keep practicing your times tables through 10. Quick recall beats counting every time.",
    data: {
      operations: ["×"],
      maxOperand: 10,
      durationSec: 30,
      passingScore: 5,
    },
  }),
  Game.parse({
    id: "syl-g3-eco-frac-half",
    subject: "math",
    difficulty: 3,
    template: "fraction_golf",
    prompt: "Reduce the fraction — what's the simplest form?",
    explanation:
      "A fraction shows parts of a whole. 4/8 means 4 out of 8 equal parts — the same as 1/2.",
    data: {
      displayNumerator: 4,
      displayDenominator: 8,
      topBalls: [1, 2],
      bottomBalls: [2, 3],
      maxStrokes: 3,
    },
  }),

  // -------- English (ecosystem reading + vocabulary) ----------------------
  Game.parse({
    id: "syl-g3-eco-eng-spell-core",
    subject: "english",
    difficulty: 2,
    template: "word_builder",
    prompt: "Today's spelling words.",
    explanation:
      "Sound each word out slowly: A-N-I-M-A-L, F-O-R-E-S-T, C-L-I-M-A-T-E.",
    data: {
      words: [
        { hint: "a living creature", emoji: "🦌", answer: "animal" },
        { hint: "lots of trees together", emoji: "🌲", answer: "forest" },
        { hint: "the usual weather of a place", emoji: "🌦️", answer: "climate" },
      ],
    },
  }),
  Game.parse({
    id: "syl-g3-eco-eng-vocab",
    subject: "english",
    difficulty: 2,
    template: "word_builder",
    prompt: "Science vocabulary words.",
    explanation:
      "A habitat is where an animal lives. To observe is to watch carefully.",
    data: {
      words: [
        { hint: "where an animal lives", emoji: "🏞️", answer: "habitat" },
        { hint: "to watch carefully", emoji: "👀", answer: "observe" },
        { hint: "to guess what happens next", emoji: "🔮", answer: "predict" },
      ],
    },
  }),
  Game.parse({
    id: "syl-g3-eco-eng-hangman-env",
    subject: "english",
    difficulty: 3,
    template: "hangman",
    prompt: "Guess the ecosystem word.",
    explanation:
      "The environment is everything around a living thing — air, water, land, plants, and other animals.",
    data: {
      word: "environment",
      hint: "Everything around a living thing",
      maxMisses: 7,
    },
  }),
  Game.parse({
    id: "syl-g3-eco-eng-grammar",
    subject: "english",
    difficulty: 2,
    template: "grammar_quest",
    prompt: "Fill in the blank from today's ecosystems reading.",
    explanation:
      "Read the whole sentence to pick the form that fits. Words like 'lives', 'eats', and 'grows' are verbs.",
    data: {
      questions: [
        {
          sentence: "The fox ___ in the forest.",
          options: ["lives", "living", "lived"],
          correctIndex: 0,
        },
        {
          sentence: "Rabbits ___ grass and leaves.",
          options: ["eats", "eat", "eating"],
          correctIndex: 1,
        },
        {
          sentence: "Plants need sunlight to ___.",
          options: ["grow", "grew", "grown"],
          correctIndex: 0,
        },
        {
          sentence: "We ___ an animal's home a habitat.",
          options: ["calls", "called", "call"],
          correctIndex: 2,
        },
      ],
      passingScore: 3,
    },
  }),

  // -------- Science (producers/consumers/decomposers, food chains) --------
  Game.parse({
    id: "syl-g3-eco-sci-roles",
    subject: "science",
    difficulty: 2,
    template: "wizard_dungeon",
    prompt: "Producers, consumers, or decomposers?",
    explanation:
      "Producers (plants) make their own food from sunlight. Consumers eat other living things. Decomposers break down dead matter.",
    data: {
      heroHp: 4,
      enemyHp: 4,
      questions: [
        {
          question: "Which one is a PRODUCER in a food chain?",
          options: ["Grass", "Fox", "Mushroom"],
          correctIndex: 0,
        },
        {
          question: "A wolf that eats rabbits is a…",
          options: ["Producer", "Consumer", "Decomposer"],
          correctIndex: 1,
        },
        {
          question: "Mushrooms and bacteria that break down dead leaves are…",
          options: ["Producers", "Consumers", "Decomposers"],
          correctIndex: 2,
        },
        {
          question: "What do producers use to make their own food?",
          options: ["Meat", "Sunlight", "Rocks"],
          correctIndex: 1,
        },
      ],
    },
  }),
  Game.parse({
    id: "syl-g3-eco-sci-foodchain",
    subject: "science",
    difficulty: 2,
    template: "wizard_dungeon",
    prompt: "Food-chain challenge!",
    explanation:
      "Energy flows sun → plants → plant-eaters → meat-eaters. Arrows in a food chain point toward the eater.",
    data: {
      heroHp: 4,
      enemyHp: 4,
      questions: [
        {
          question: "In a food chain, arrows point from…",
          options: ["Eaten TO eater", "Eater TO eaten", "Any direction"],
          correctIndex: 0,
        },
        {
          question: "Where does a food chain's energy originally come from?",
          options: ["The soil", "The sun", "The moon"],
          correctIndex: 1,
        },
        {
          question:
            "A hawk eats snakes that eat mice. The mice eat grass. What's at the START?",
          options: ["Hawk", "Mice", "Grass"],
          correctIndex: 2,
        },
        {
          question: "An animal that eats only plants is called…",
          options: ["A carnivore", "A herbivore", "A decomposer"],
          correctIndex: 1,
        },
      ],
    },
  }),
  Game.parse({
    id: "syl-g3-eco-sci-sort",
    subject: "science",
    difficulty: 2,
    template: "quick_sort",
    prompt: "Tap only the PRODUCERS — skip the consumers!",
    explanation:
      "Producers make their own food (mostly plants). Consumers eat other living things.",
    data: {
      rule: "Tap producers",
      ruleEmoji: "🌱",
      durationSec: 20,
      passingScore: 5,
      pool: [
        { emoji: "🌳", label: "tree", matches: true },
        { emoji: "🌾", label: "grass", matches: true },
        { emoji: "🌻", label: "sunflower", matches: true },
        { emoji: "🪴", label: "fern", matches: true },
        { emoji: "🌿", label: "herb", matches: true },
        { emoji: "🌵", label: "cactus", matches: true },
        { emoji: "🦊", label: "fox", matches: false },
        { emoji: "🐰", label: "rabbit", matches: false },
        { emoji: "🦅", label: "hawk", matches: false },
        { emoji: "🐍", label: "snake", matches: false },
        { emoji: "🦉", label: "owl", matches: false },
        { emoji: "🐻", label: "bear", matches: false },
      ],
    },
  }),
];

export const DEMO_SYLLABI: Record<string, DemoSyllabus> = {
  "grade-3-ecosystems": {
    id: "grade-3-ecosystems",
    title: "Grade 3 — Ecosystems & Living Things",
    grade: "Grade 3",
    teacher: "Ms. Rivera",
    topics: [
      "Producers, consumers, and decomposers",
      "Food chains and food webs",
      "Habitats and adaptations",
      "Life cycles of plants and animals",
      "Weather and seasons",
      "Multiplication facts through 10",
      "Fractions as parts of a whole",
      "Reading informational texts",
    ],
    games: GRADE_3_ECOSYSTEMS_GAMES,
  },
};

export function getSyllabus(id: string): DemoSyllabus | undefined {
  return DEMO_SYLLABI[id];
}
