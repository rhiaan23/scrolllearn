import type { Template } from "./schema";

export interface Instruction {
  title: string;
  emoji: string;
  steps: string[];
  goal: string;
}

export const INSTRUCTIONS: Record<Template, Instruction> = {
  merge_math: {
    title: "Merge Math",
    emoji: "🧮",
    steps: [
      "Swipe or use arrows to slide every tile in one direction.",
      "When two tiles with the SAME number bump into each other, they double.",
      "Keep doubling — 2→4→8→16... — without filling up the board.",
    ],
    goal: "Build a tile equal to the target number shown on the card.",
  },
  word_builder: {
    title: "Word Builder",
    emoji: "🔤",
    steps: [
      "Look at the emoji hint at the top of the card.",
      "Tap the letter tiles in order to spell the word.",
      "Tap a letter again to take it back if you misclick.",
    ],
    goal: "Spell every word in the round correctly.",
  },
  quick_sort: {
    title: "Quick Sort",
    emoji: "⚡",
    steps: [
      "Read the rule at the top — it tells you what to tap.",
      "Tap only the items that match the rule before they disappear.",
      "Avoid tapping things that don't match — those cost you points.",
    ],
    goal: "Hit the passing score before the timer hits zero.",
  },
  math_castle: {
    title: "Math Castle",
    emoji: "🏰",
    steps: [
      "Enemies march from the right toward your castle.",
      "Tap an enemy to open its math question, type the answer, hit FIRE.",
      "Correct answers destroy the enemy. Wrong answers let it keep marching.",
    ],
    goal: "Defeat every enemy before your castle runs out of hearts.",
  },
  hangman: {
    title: "Hangman",
    emoji: "🪢",
    steps: [
      "Read the hint — it tells you what kind of word you're guessing.",
      "Tap letters on the keyboard to reveal them in the word.",
      "Each wrong letter adds a piece to the hangman drawing.",
    ],
    goal: "Spell the full word before the drawing finishes.",
  },
  mini_crossword: {
    title: "Mini Crossword",
    emoji: "🧩",
    steps: [
      "Tap a cell to focus it, then type a letter.",
      "Use the clue list to figure out each across and down entry.",
      "Letters shared between entries help you solve both at once.",
    ],
    goal: "Fill every cell with the correct letter.",
  },
  grammar_quest: {
    title: "Grammar Quest",
    emoji: "🌊",
    steps: [
      "Read the sentence and find the missing word.",
      "Tap the option that fits — or press 1-4 on the keyboard.",
      "You answer one question at a time, then move on automatically.",
    ],
    goal: "Get enough questions right to clear the round.",
  },
  wizard_dungeon: {
    title: "Wizard Dungeon",
    emoji: "⚔️",
    steps: [
      "Read the question and pick one of three sword answers (A, B, or C).",
      "Correct answers hit the enemy — wrong answers hit you!",
      "Watch the HP hearts: yours on the left, the enemy's on the right.",
    ],
    goal: "Drain the enemy's HP to zero before yours runs out.",
  },
  fraction_golf: {
    title: "Fraction Golf",
    emoji: "🏑",
    steps: [
      "Look at the target fraction on the green.",
      "Tap a numbered ball, then tap the numerator hole (top) or denominator hole (bottom) to drop it in.",
      "Tap a placed ball to send it back to the pool.",
    ],
    goal: "Sink balls into the right holes so they make the target fraction.",
  },
  name_figure: {
    title: "Name the Figure",
    emoji: "🖼️",
    steps: [
      "Look at the portrait on the card.",
      "Read the short clue under the picture.",
      "Tap the name you think matches the face.",
    ],
    goal: "Pick the right historical figure on the first try.",
  },
  calculationster: {
    title: "Calculationster",
    emoji: "🧟",
    steps: [
      "Solve the math problem shown on the card.",
      "Type your answer and press Enter (or tap GO!).",
      "Feed your monster by getting as many right as you can before time runs out.",
    ],
    goal: "Score enough correct answers before the timer hits zero.",
  },
};
