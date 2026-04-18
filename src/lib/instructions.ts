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
      "Swipe left, right, up or down to slide every tile.",
      "Tiles that touch and sum to the target number merge into one.",
      "Keep merging to clear the board without running out of space.",
    ],
    goal: "Make enough merges to hit the win count shown on the card.",
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
};
