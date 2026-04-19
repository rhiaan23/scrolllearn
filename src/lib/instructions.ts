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
  sequence_order: {
    title: "Sequence Order",
    emoji: "🪜",
    steps: [
      "Read the prompt — it tells you the order to build.",
      "Tap a token at the top, then tap an empty slot to place it.",
      "Tap a placed token to send it back to the pool.",
    ],
    goal: "Fill every slot in the correct order.",
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
  balance_scale: {
    title: "Balance Scale",
    emoji: "⚖️",
    steps: [
      "The scale already has weights on one side — read the total.",
      "Tap numbered weights in the pool to drop them on the empty pan.",
      "Tap a placed weight to send it back to the pool.",
    ],
    goal: "Make both pans weigh the same so the scale balances.",
  },
  math_chase: {
    title: "Math Chase",
    emoji: "🏃",
    steps: [
      "Numbers fall from above — tap the ones you want to grab.",
      "Each tap adds that number to your running total.",
      "Avoid overshooting — going over the target costs you a life.",
    ],
    goal: "Hit the target number exactly before the timer runs out.",
  },
};
