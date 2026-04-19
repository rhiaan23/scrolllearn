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
  // 1 — math · merge_math · easy (2048 to 16)
  // Classic 2048 starts with 2 tiles. Sparse boards = always playable.
  Game.parse({
    id: "math-2048-easy",
    subject: "math",
    difficulty: 1,
    template: "merge_math",
    prompt: "Slide so equal tiles bump into each other and double — build a 16!",
    explanation:
      "Two 2s make a 4. Two 4s make an 8. Two 8s make a 16. Same numbers double when they touch.",
    data: {
      target: 16,
      startGrid: [
        [2, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, 2, null],
      ],
    },
  }),

  // 2 — math · merge_math · medium (2048 to 32)
  Game.parse({
    id: "math-2048-med",
    subject: "math",
    difficulty: 2,
    template: "merge_math",
    prompt: "Same-number tiles double when they touch. Build a 32!",
    explanation:
      "Plan your slides so doubled tiles end up next to their twin. 2→4→8→16→32.",
    data: {
      target: 32,
      startGrid: [
        [2, 2, null, null],
        [null, null, 4, null],
        [null, 4, null, null],
        [null, null, null, 2],
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

  // 4 — math · merge_math · hard (2048 to 64)
  // Head-start the player with a few merged tiles, but keep half the board
  // empty so there's always somewhere to slide.
  Game.parse({
    id: "math-2048-hard",
    subject: "math",
    difficulty: 3,
    template: "merge_math",
    prompt: "Build a 64 tile! Doubles double when they touch.",
    explanation:
      "Powers of two: 2, 4, 8, 16, 32, 64. Keep your big tile in a corner so it stays safe.",
    data: {
      target: 64,
      startGrid: [
        [16, null, 8, null],
        [null, 8, null, 4],
        [4, null, 2, null],
        [null, 2, null, null],
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

  // 11 — math · math_castle · easy
  Game.parse({
    id: "math-castle-add-easy",
    subject: "math",
    difficulty: 1,
    template: "math_castle",
    prompt: "Defend the castle — solve each sum before the enemy gets through!",
    explanation:
      "Single-digit addition. Count on from the bigger number: 3+2 → 3, then 4, 5.",
    data: {
      enemies: [
        { question: "2+1", answer: 3 },
        { question: "3+2", answer: 5 },
        { question: "4+3", answer: 7 },
      ],
      travelDurationMs: 16000,
      spawnIntervalMs: 3500,
      lives: 3,
    },
  }),

  // 12 — math · math_castle · medium
  Game.parse({
    id: "math-castle-mix-med",
    subject: "math",
    difficulty: 2,
    template: "math_castle",
    prompt: "Hold the line — answer the math to fire back!",
    explanation:
      "Mixed addition and subtraction within 20. Line up the numbers and count carefully.",
    data: {
      enemies: [
        { question: "7+6", answer: 13 },
        { question: "15-8", answer: 7 },
        { question: "9+8", answer: 17 },
        { question: "12-5", answer: 7 },
      ],
      travelDurationMs: 12000,
      spawnIntervalMs: 2800,
      lives: 2,
    },
  }),

  // 13 — math · math_castle · hard
  Game.parse({
    id: "math-castle-mul-hard",
    subject: "math",
    difficulty: 3,
    template: "math_castle",
    prompt: "Multiplication siege — defeat them all!",
    explanation:
      "Single-digit multiplication. 6×7=42, 8×7=56, 9×6=54, 7×7=49, 8×8=64.",
    data: {
      enemies: [
        { question: "6×7", answer: 42 },
        { question: "8×7", answer: 56 },
        { question: "9×6", answer: 54 },
        { question: "7×7", answer: 49 },
        { question: "8×8", answer: 64 },
      ],
      travelDurationMs: 9000,
      spawnIntervalMs: 2200,
      lives: 2,
    },
  }),

  // 14 — english · hangman · easy
  Game.parse({
    id: "eng-hangman-pets",
    subject: "english",
    difficulty: 1,
    template: "hangman",
    prompt: "Guess the pet before the drawing finishes.",
    explanation:
      "Sound out common letters first: vowels like A, E, I, O, U, then frequent consonants like R, S, T, N.",
    data: {
      word: "rabbit",
      hint: "A fluffy pet with long ears",
      maxMisses: 6,
    },
  }),

  // 15 — english · hangman · medium
  Game.parse({
    id: "eng-hangman-weather",
    subject: "english",
    difficulty: 2,
    template: "hangman",
    prompt: "Weather word — start with vowels.",
    explanation:
      "Common weather words include RAIN, SNOW, WIND, STORM. Try vowels A, E, I, O first.",
    data: {
      word: "thunder",
      hint: "The loud sound after lightning",
      maxMisses: 6,
    },
  }),

  // 16 — science · hangman · medium
  Game.parse({
    id: "sci-hangman-body",
    subject: "science",
    difficulty: 2,
    template: "hangman",
    prompt: "Part of your body — guess the word.",
    explanation:
      "This organ pumps blood through your body. Three syllables won't help you — letters will.",
    data: {
      word: "stomach",
      hint: "Where your food goes after you swallow",
      maxMisses: 7,
    },
  }),

  // 17 — english · mini_crossword · easy
  Game.parse({
    id: "eng-xword-animals",
    subject: "english",
    difficulty: 1,
    template: "mini_crossword",
    prompt: "Mini crossword — animals.",
    explanation:
      "Two words sharing a letter: CAT across and CUP down share a C. Tap a cell to switch between across and down.",
    data: {
      size: 3,
      entries: [
        { answer: "CAT", clue: "Meows and purrs", row: 0, col: 0, direction: "across" },
        { answer: "CUP", clue: "Holds your drink", row: 0, col: 0, direction: "down" },
      ],
    },
  }),

  // 18 — english · mini_crossword · medium
  Game.parse({
    id: "eng-xword-kitchen",
    subject: "english",
    difficulty: 2,
    template: "mini_crossword",
    prompt: "Mini crossword — kitchen things.",
    explanation:
      "SPOON crosses SOUP at their shared letter. Read both clues to confirm.",
    data: {
      size: 5,
      entries: [
        { answer: "SPOON", clue: "You eat soup with it", row: 0, col: 0, direction: "across" },
        { answer: "SOUP", clue: "Hot liquid meal", row: 0, col: 0, direction: "down" },
        { answer: "OVEN", clue: "Bakes your cookies", row: 2, col: 1, direction: "across" },
      ],
    },
  }),

  // 19 — math · balance_scale · easy
  Game.parse({
    id: "math-balance-easy",
    subject: "math",
    difficulty: 1,
    template: "balance_scale",
    prompt: "Balance the scale — both sides must weigh the same.",
    explanation:
      "The left pan holds 10. Add weights to the right pan that add up to 10. Try 4 + 6 or 7 + 3.",
    data: {
      fixed: { side: "left", weights: [10] },
      pool: [3, 4, 6, 7, 2, 8],
    },
  }),

  // 20 — math · balance_scale · medium
  Game.parse({
    id: "math-balance-med",
    subject: "math",
    difficulty: 2,
    template: "balance_scale",
    prompt: "Match the heavier side — pick the right numbers.",
    explanation:
      "Fixed side weighs 7 + 8 = 15. Combinations that sum to 15: 9+6, 7+5+3, 4+11, etc.",
    data: {
      fixed: { side: "left", weights: [7, 8] },
      pool: [9, 6, 5, 4, 3, 11, 2],
    },
  }),

  // 21 — math · balance_scale · hard
  Game.parse({
    id: "math-balance-hard",
    subject: "math",
    difficulty: 3,
    template: "balance_scale",
    prompt: "Balance a bigger load — plan your picks.",
    explanation:
      "Fixed side is 12 + 9 + 5 = 26. One solution: 14 + 12, or 15 + 8 + 3.",
    data: {
      fixed: { side: "right", weights: [12, 9, 5] },
      pool: [14, 12, 15, 8, 3, 7, 6, 4],
    },
  }),

  // 22 — math · math_chase · easy
  Game.parse({
    id: "math-chase-20",
    subject: "math",
    difficulty: 1,
    template: "math_chase",
    prompt: "Tap falling numbers that add to 20 — don't overshoot!",
    explanation:
      "Pick pairs that make 20: 10+10, 15+5, 12+8. Skip numbers that would push you over.",
    data: {
      target: 20,
      durationSec: 25,
      spawnIntervalMs: 1100,
      pool: [2, 3, 5, 8, 10, 12, 15, 7],
    },
  }),

  // 23 — math · math_chase · medium
  Game.parse({
    id: "math-chase-30",
    subject: "math",
    difficulty: 2,
    template: "math_chase",
    prompt: "Reach exactly 30 — watch the numbers fall.",
    explanation:
      "Harder targets need three or four additions: 15+10+5, 12+8+10, 7+13+5+5.",
    data: {
      target: 30,
      durationSec: 30,
      spawnIntervalMs: 950,
      pool: [3, 5, 7, 8, 10, 12, 13, 15, 4, 6],
    },
  }),

  // 24 — math · clean_river · easy
  Game.parse({
    id: "math-river-easy",
    subject: "math",
    difficulty: 1,
    template: "clean_river",
    prompt: "Clean the river — tap the right answer before it drifts away!",
    explanation:
      "Read the expression, find the answer floating down, tap it. The others are tricks.",
    data: {
      rounds: [
        { expression: "2 + 3", answer: 5, options: [5, 4, 6] },
        { expression: "4 + 1", answer: 5, options: [3, 5, 7] },
        { expression: "6 - 2", answer: 4, options: [4, 6, 2] },
      ],
      fallDurationMs: 9500,
      lives: 3,
    },
  }),

  // 25 — math · clean_river · medium
  Game.parse({
    id: "math-river-med",
    subject: "math",
    difficulty: 2,
    template: "clean_river",
    prompt: "Mixed plus and minus — grab the right trash!",
    explanation:
      "Add or subtract carefully. 13-5=8, 7+6=13, 16-9=7, 8+5=13.",
    data: {
      rounds: [
        { expression: "7 + 6", answer: 13, options: [12, 13, 14] },
        { expression: "13 - 5", answer: 8, options: [8, 7, 9] },
        { expression: "16 - 9", answer: 7, options: [5, 7, 8, 9] },
        { expression: "8 + 5", answer: 13, options: [12, 13, 14] },
      ],
      fallDurationMs: 8000,
      lives: 2,
    },
  }),

  // 26 — math · clean_river · hard
  Game.parse({
    id: "math-river-hard",
    subject: "math",
    difficulty: 3,
    template: "clean_river",
    prompt: "Times tables at river speed — don't miss!",
    explanation:
      "Single-digit multiplication. 6×7=42, 8×4=32, 9×5=45, 7×8=56, 6×9=54.",
    data: {
      rounds: [
        { expression: "6 × 7", answer: 42, options: [36, 42, 48, 49] },
        { expression: "8 × 4", answer: 32, options: [24, 32, 36] },
        { expression: "9 × 5", answer: 45, options: [40, 45, 50] },
        { expression: "7 × 8", answer: 56, options: [48, 54, 56, 63] },
        { expression: "6 × 9", answer: 54, options: [48, 54, 56] },
      ],
      fallDurationMs: 6500,
      lives: 2,
    },
  }),

  // english · grammar_quest · easy
  // Mechanic + question content ported from AstroMike101/grammar-quest (MIT,
  Game.parse({
    id: "eng-grammar-easy",
    subject: "english",
    difficulty: 1,
    template: "grammar_quest",
    prompt: "Pick the word that fits each sentence.",
    explanation:
      "Reading the whole sentence helps — the words around the blank usually hint at which form is right.",
    data: {
      questions: [
        {
          sentence: "The monkey loves to ___ bananas.",
          options: ["eat", "eating", "eated"],
          correctIndex: 0,
        },
        {
          sentence: "Look over ___!",
          options: ["there", "their", "they're"],
          correctIndex: 0,
        },
        {
          sentence: "Timmy is ___ his homework.",
          options: ["do", "did", "doing"],
          correctIndex: 2,
        },
        {
          sentence: "The ___ was on the street.",
          options: ["man", "men", "mens"],
          correctIndex: 0,
        },
      ],
      passingScore: 3,
    },
  }),

  // english · grammar_quest · medium
  Game.parse({
    id: "eng-grammar-med",
    subject: "english",
    difficulty: 2,
    template: "grammar_quest",
    prompt: "Choose the correct word for each sentence.",
    explanation:
      "Watch for tense (when something happens) and possession (whose thing it is) — those are the two most common traps.",
    data: {
      questions: [
        {
          sentence: "___ exam was yesterday.",
          options: ["Him", "He", "His"],
          correctIndex: 2,
        },
        {
          sentence: "The ___ toy was stolen.",
          options: ["kids", "kid", "kid's"],
          correctIndex: 2,
        },
        {
          sentence: "He told the man to help him ___.",
          options: ["build", "built", "building"],
          correctIndex: 0,
        },
        {
          sentence: "They have ___ best friends since preschool.",
          options: ["been", "being", "be"],
          correctIndex: 0,
        },
        {
          sentence: "Before playing video games, you have to ___ your homework.",
          options: ["finish", "finishing", "finished"],
          correctIndex: 0,
        },
      ],
      passingScore: 4,
    },
  }),

  // science · wizard_dungeon · medium
  // Questions ported from edutainment-submission (Science Wizard Dungeon Quiz).
  Game.parse({
    id: "sci-wizard-earth-med",
    subject: "science",
    difficulty: 2,
    template: "wizard_dungeon",
    prompt: "Answer earth-science questions to defeat the dungeon enemy!",
    explanation:
      "Earth processes like glaciers, earthquakes, and erosion constantly shape the land around us.",
    data: {
      heroHp: 4,
      enemyHp: 4,
      questions: [
        {
          question: "What is an example of ice and gravity creating and moving sediments?",
          options: ["Glaciers move", "Icebergs float", "Frost on grass"],
          correctIndex: 0,
        },
        {
          question: "How might an earthquake change the land?",
          options: ["Hardening the ground", "Lowering or raising the ground", "Forming ice sheets"],
          correctIndex: 1,
        },
        {
          question: "What does rain help create on the land?",
          options: ["Oceans", "Limestone caves", "Glaciers"],
          correctIndex: 1,
        },
        {
          question: "Which fossil indicates the oldest layer of rock?",
          options: ["Trilobite", "T-rex", "Mammoth"],
          correctIndex: 0,
        },
        {
          question: "What is obsidian?",
          options: ["Volcanic glass", "Sedimentary cement", "Metamorphic shale"],
          correctIndex: 0,
        },
        {
          question: "Petroleum (crude oil) was once ____?",
          options: ["Marine life", "Lava", "Magma"],
          correctIndex: 0,
        },
        {
          question: "Which causes erosion but NOT weathering?",
          options: ["Acid rain", "Direct sunlight", "Fierce wind"],
          correctIndex: 1,
        },
      ],
    },
  }),
];
