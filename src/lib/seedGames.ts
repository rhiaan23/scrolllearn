import { Game } from "./schema";

/**
 * 10 hand-curated demo games using v2 interactive templates.
 *
 * Distribution:
 *   subject: math 4 / english 3 / science 3
 *   template: merge_math 3 / word_builder 2 / quick_sort 2 / sequence_order 3
 *   difficulty: 1 (3) / 2 (4) / 3 (3)
 *
 * Each entry is validated against the Game schema at module load — a malformed
 * game throws on import, not at runtime.
 */
export const SEED_GAMES: Game[] = [
  // 1 — math · merge_math · easy
  Game.parse({
    id: "math-merge-10",
    subject: "math",
    difficulty: 1,
    template: "merge_math",
    prompt: "Slide tiles together that add up to 10.",
    explanation:
      "These pairs make 10: 1+9, 2+8, 3+7, 4+6, 5+5. They are called number partners.",
    data: {
      target: 10,
      winMerges: 3,
      startGrid: [
        [3, null, 7, null],
        [null, 4, null, 6],
        [8, null, 2, null],
        [null, 1, null, 9],
      ],
    },
  }),

  // 2 — math · merge_math · medium
  Game.parse({
    id: "math-merge-12",
    subject: "math",
    difficulty: 2,
    template: "merge_math",
    prompt: "Merge tiles that add up to 12.",
    explanation:
      "Look for pairs that make 12: 3+9, 4+8, 5+7, 6+6. Combine them by sliding!",
    data: {
      target: 12,
      winMerges: 3,
      startGrid: [
        [4, 8, null, 5],
        [null, 7, 3, null],
        [9, null, null, 6],
        [null, 5, 7, null],
      ],
    },
  }),

  // 3 — math · sequence_order · medium
  Game.parse({
    id: "math-order-asc",
    subject: "math",
    difficulty: 2,
    template: "sequence_order",
    prompt: "Put these numbers in order, smallest to biggest.",
    explanation:
      "Compare each number's value. Three is smallest, then 7, 14, 19, and 22 is biggest.",
    data: {
      tokens: ["14", "7", "22", "3", "19"],
      correctOrder: ["3", "7", "14", "19", "22"],
    },
  }),

  // 4 — math · merge_math · hard
  Game.parse({
    id: "math-merge-15",
    subject: "math",
    difficulty: 3,
    template: "merge_math",
    prompt: "Merge tiles that add up to 15.",
    explanation:
      "Pairs that make 15: 6+9, 7+8. The grid starts dense — plan your slides carefully!",
    data: {
      target: 15,
      winMerges: 3,
      startGrid: [
        [6, 9, 3, 7],
        [8, null, 5, 2],
        [4, 7, null, 8],
        [9, 1, 6, null],
      ],
    },
  }),

  // 5 — english · word_builder · easy
  Game.parse({
    id: "eng-spell-easy",
    subject: "english",
    difficulty: 1,
    template: "word_builder",
    prompt: "Tap the letters to spell each word.",
    explanation:
      "Look at the picture, sound out the word, then tap each letter in order.",
    data: {
      words: [
        { hint: "a friendly pet", emoji: "🐶", answer: "dog" },
        { hint: "shines in the sky", emoji: "☀️", answer: "sun" },
        { hint: "a pretty flower", emoji: "🌹", answer: "rose" },
      ],
    },
  }),

  // 6 — english · word_builder · medium
  Game.parse({
    id: "eng-spell-med",
    subject: "english",
    difficulty: 2,
    template: "word_builder",
    prompt: "Spell the word for each picture.",
    explanation:
      "Sound out each word slowly: B-O-O-K, F-O-X, H-O-N-E-Y. Tap the letters in order.",
    data: {
      words: [
        { hint: "you read it", emoji: "📚", answer: "book" },
        { hint: "a clever animal", emoji: "🦊", answer: "fox" },
        { hint: "made by bees", emoji: "🐝", answer: "honey" },
      ],
    },
  }),

  // 7 — english · sequence_order · medium
  Game.parse({
    id: "eng-sentence",
    subject: "english",
    difficulty: 2,
    template: "sequence_order",
    prompt: "Put the words in order to make a sentence.",
    explanation:
      "A sentence usually starts with the subject (the cat), then the action (sat), then where (on the mat).",
    data: {
      tokens: ["cat", "the", "on", "sat", "mat", "the"],
      correctOrder: ["the", "cat", "sat", "on", "the", "mat"],
    },
  }),

  // 8 — science · quick_sort · easy
  Game.parse({
    id: "sci-tap-mammals",
    subject: "science",
    difficulty: 1,
    template: "quick_sort",
    prompt: "Tap only the mammals before time runs out!",
    explanation:
      "Mammals have fur, breathe air, and feed milk to their babies. Fish, birds, and insects are not mammals.",
    data: {
      rule: "Tap mammals",
      ruleEmoji: "🐾",
      durationSec: 20,
      passingScore: 5,
      pool: [
        { emoji: "🐶", label: "dog", matches: true },
        { emoji: "🐱", label: "cat", matches: true },
        { emoji: "🐮", label: "cow", matches: true },
        { emoji: "🐘", label: "elephant", matches: true },
        { emoji: "🦁", label: "lion", matches: true },
        { emoji: "🐹", label: "hamster", matches: true },
        { emoji: "🐟", label: "fish", matches: false },
        { emoji: "🐍", label: "snake", matches: false },
        { emoji: "🐦", label: "bird", matches: false },
        { emoji: "🐝", label: "bee", matches: false },
        { emoji: "🐸", label: "frog", matches: false },
        { emoji: "🦀", label: "crab", matches: false },
      ],
    },
  }),

  // 9 — science · quick_sort · medium
  Game.parse({
    id: "sci-tap-flyers",
    subject: "science",
    difficulty: 2,
    template: "quick_sort",
    prompt: "Tap only the things that fly!",
    explanation:
      "Flying needs wings or special engines. Birds, insects, and airplanes fly — fish, rocks, and trees do not.",
    data: {
      rule: "Tap things that fly",
      ruleEmoji: "🪽",
      durationSec: 20,
      passingScore: 5,
      pool: [
        { emoji: "🦅", label: "eagle", matches: true },
        { emoji: "🦋", label: "butterfly", matches: true },
        { emoji: "✈️", label: "plane", matches: true },
        { emoji: "🚁", label: "helicopter", matches: true },
        { emoji: "🐝", label: "bee", matches: true },
        { emoji: "🦇", label: "bat", matches: true },
        { emoji: "🐠", label: "fish", matches: false },
        { emoji: "🪨", label: "rock", matches: false },
        { emoji: "🌳", label: "tree", matches: false },
        { emoji: "🚗", label: "car", matches: false },
        { emoji: "🐢", label: "turtle", matches: false },
        { emoji: "🍎", label: "apple", matches: false },
      ],
    },
  }),

  // 10 — science · sequence_order · hard
  Game.parse({
    id: "sci-water-cycle",
    subject: "science",
    difficulty: 3,
    template: "sequence_order",
    prompt: "Order the steps of the water cycle.",
    explanation:
      "Sun heats water → it evaporates into clouds → clouds condense → rain falls → water collects in lakes and oceans, then it starts again.",
    data: {
      tokens: ["Rain", "Evaporation", "Collection", "Sun heats water", "Clouds form"],
      correctOrder: [
        "Sun heats water",
        "Evaporation",
        "Clouds form",
        "Rain",
        "Collection",
      ],
    },
  }),
];
