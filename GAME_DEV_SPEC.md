# ScrollLearn — Game Component Spec

A spec for building a single playable mini-game that drops into the **ScrollLearn** feed. ScrollLearn is a TikTok-style vertical-scroll feed of educational mini-games for elementary students. Each card in the feed is one playable game.

You're building **one game**, delivered as **one self-contained React component** plus a **JSON content blob**. We integrate it.

---

## TL;DR — what to deliver

1. **One component file** — `src/components/games/<YourGame>.tsx`
   - Default-exported React function component
   - Accepts the props interface in [§3](#3-the-component-contract)
   - Calls `onAnswer(isCorrect, description)` exactly once when the player wins or loses
2. **One schema entry** — a Zod object describing the JSON shape of your game's content (see [§4](#4-the-schema-contract))
3. **At least one content instance** — a JSON object matching that schema, so we can seed the demo
4. **Brief notes** — what the game tests, what counts as "winning", any external assets

You do not build any chrome (header, action rail, footer). The host renders all that around your component. You only build the game body.

---

## 1. Tech stack — use this exactly

| | |
|---|---|
| Framework | **Next.js 16** (App Router) |
| React | **19** (Server Components by default; you'll write a Client Component) |
| Language | **TypeScript** (strict mode) |
| Styling | **Tailwind CSS v4** — utility classes only, no separate `.css` files |
| Validation | **Zod 4** for the schema entry |
| Build tool | Turbopack (handled by Next) |

**Do not add new dependencies** without asking. If you genuinely need one (e.g., `framer-motion`, `canvas-confetti`), flag it before using it. We have an extreme bias toward zero new deps — bundle size matters.

**Do not pull in:**
- A drag-and-drop library (use tap-to-place, see §6)
- A state library (use React `useState` / `useRef`)
- A CSS-in-JS library
- Any UI kit (Material, Chakra, Radix, etc.)

You can use Web APIs freely (`<canvas>`, `Audio`, `requestAnimationFrame`, `IntersectionObserver`, etc.).

---

## 2. What "good" looks like

The host already has 4 games (merge-tiles, word-spell, whack-a-mole, sequence-order). Yours should be **better**, meaning:

- **Real interactive mechanics**, not a quiz. The player should be *doing* something — dragging, dropping, timing, drawing, sliding, building. Not picking A/B/C/D.
- **Playable in 30-90 seconds** per session. The feed flows fast; the player will swipe past at any moment.
- **Educational by design**. The mechanic itself should teach a concept. "You learn by playing", not "you answer to prove you learned."
- **Mobile-first**. Most users hold a phone. Touch is primary; mouse/keyboard secondary.
- **No instructions screen**. The mechanic should be obvious within 3 seconds of seeing the game state. If you need an instructions screen, the mechanic is too complex.

---

## 3. The component contract

```tsx
// src/components/games/YourGame.tsx
"use client";

import type { YourGameContent } from "@/lib/schema";

interface Props {
  game: YourGameContent;             // the content JSON, already parsed & validated
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;                    // true if the host has frozen interaction
}

export function YourGame({ game, onAnswer, locked }: Props) {
  // ... your game logic
}
```

### Lifecycle rules

| Rule | Why |
|---|---|
| Call `onAnswer` **exactly once** per mount. | The host advances the feed off this call. Multiple calls cause weird state. Use a `useRef<boolean>` latch. |
| Stop accepting input when `locked === true`. | The host sets this when the user has already finished or is reviewing. |
| Stop accepting input after **you** call `onAnswer`. | Prevents post-win taps from re-firing logic. |
| `description` is a short human string (≤60 chars). | We may surface it in a result toast / log. e.g. `"merged 3 pairs to 10"` or `"got 7 of 10 right"`. |
| Clean up timers/listeners on unmount. | Cards are mounted/unmounted as the user scrolls. Leaks add up fast. |

### Latch pattern (copy this)

```tsx
const finishedRef = useRef(false);
function finish(isCorrect: boolean, desc: string) {
  if (finishedRef.current) return;
  finishedRef.current = true;
  onAnswer(isCorrect, desc);
}
```

### What "win" means

You decide. Keep it generous — the feed format rewards small dopamine hits. Examples:
- Tile-merge game: 3 successful merges = win
- Spelling game: 3 correct words = win
- Reflex game: ≥5 points in 20 seconds = win
- Loss only on real failure (board locked, timer expired below threshold). Don't punish the player for being slow.

---

## 4. The schema contract

Define your content shape as a Zod object. The host imports this into `src/lib/schema.ts` and adds it to the discriminated union on `template`.

```ts
// goes into src/lib/schema.ts
export const YourGameContent = z.object({
  template: z.literal("your_game"),       // <-- unique snake_case discriminator
  id: z.string(),                         // unique slug across all games
  subject: z.enum(["math", "english", "science"]),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),  // 1=K-1, 2=2-3, 3=4-5
  prompt: z.string(),                     // shown as TikTok-style caption
  explanation: z.string(),                // shown when user taps the 💬 button

  // Everything specific to YOUR game goes inside `data`:
  data: z.object({
    // ... whatever your game needs
    // example: targetNumber: z.number().int().min(2).max(99),
    //          startGrid: z.array(z.array(z.number().nullable())),
  }),
});

export type YourGameContent = z.infer<typeof YourGameContent>;
```

### Constraints on `data`

- **JSON-serializable only.** No functions, no class instances, no `Date` objects (use ISO strings). It must round-trip through `JSON.stringify` cleanly.
- **Self-contained.** All assets (text, image URLs, emoji, parameters) needed to render one play session live in this object.
- **No runtime fetches from inside the game.** If you need data, it's in `data`. If you need an image, put a URL in `data` and load it.
- **Keep it small.** Aim for under ~5KB per instance.

---

## 5. Content instances — deliver at least one

Hand back at least one valid JSON content blob your game can render. We use it to seed the demo. Five blobs at varying difficulty is great.

Example shape:

```json
{
  "template": "your_game",
  "id": "math-yourgame-easy-1",
  "subject": "math",
  "difficulty": 1,
  "prompt": "Stack the bricks to make 10.",
  "explanation": "Each brick is a number. Combine them to total 10.",
  "data": {
    "target": 10,
    "bricks": [3, 7, 5, 5, 4, 6, 2, 8]
  }
}
```

---

## 6. Layout & interaction constraints

### Render area

Your component renders inside a centered box that is **roughly 380px wide × 500px tall** (varies by viewport — design responsive). The phone-frame chrome wraps you on top, bottom, and right. Treat your component like the inside of a TikTok video frame.

### Touch & gestures — important

The card sits inside a vertical-scroll snap container. **Vertical swipes belong to the page** (they advance to the next card). If your game uses swipes:

- ✅ **Horizontal swipes** are yours.
- ✅ **Taps**, **drags within your component**, **long-presses**, and **keyboard input** are yours.
- ⚠️ **Vertical swipes** are conditionally yours — only intercept if the swipe is clearly within your game's interactive area AND clearly not the start of a scroll. If you intercept vertical, set `touch-action: none` on the affected element and call `e.preventDefault()` only after you're confident it's a game gesture (not a page scroll).

Safe default: build for tap + horizontal swipe + keyboard.

### Drag-and-drop

Use **tap-to-place** instead of HTML5 drag-and-drop. Reasons: HTML5 DnD is broken on iOS Safari, native fallback is ugly, and pointer-event drag implementations conflict with the scroll-snap container. Tap to pick up → tap to place is fast and works everywhere.

If you absolutely need drag (e.g., drawing, gesture-based), use **Pointer Events** scoped to your component and `e.preventDefault()` on `pointermove`.

### Styling

- Use only Tailwind v4 utility classes. No new global CSS, no `<style>` blocks.
- Background of the card is a colored gradient (math=blue, english=purple, science=green). Your component renders **on top** of that gradient — don't set your own full-bleed background. Use `bg-white/10`, `bg-black/30 backdrop-blur-sm` etc. for sub-panels.
- Default text color: **white**. Use `text-white`, `text-white/70` for secondary, `text-amber-300` for accent.
- Rounded corners: `rounded-xl` for buttons/tiles, `rounded-2xl` for panels.
- Tap target minimum: 44×44px (`h-11 w-11`).

### Animations

- Tailwind utilities first (`transition-all`, `active:scale-95`, `animate-pulse`).
- For custom keyframes, add them to `src/app/globals.css` — don't bring in `framer-motion` for simple stuff.
- The host already ships `animate-shake` and a `pop` keyframe — use them when you can.

### Accessibility

- Every interactive element is a `<button type="button">`, not a `<div>`.
- Provide `aria-label` on icon-only buttons.
- Keyboard navigation should be possible where it makes sense (not required for pure touch games).

---

## 7. Working example — copy this as a starter

Here is a minimal, working game component you can copy and modify. It implements a "tap-the-target" reflex game so you can see all the moving parts.

```tsx
// src/components/games/TapTarget.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { TapTargetContent } from "@/lib/schema";

interface Props {
  game: TapTargetContent;
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;
}

export function TapTarget({ game, onAnswer, locked }: Props) {
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [timeLeft, setTimeLeft] = useState(game.data.durationSec);
  const finishedRef = useRef(false);

  function finish(isCorrect: boolean, desc: string) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onAnswer(isCorrect, desc);
  }

  // Countdown
  useEffect(() => {
    if (locked) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          // Defer to next tick to read latest score safely
          setTimeout(() => {
            const won = score >= game.data.passingScore;
            finish(won, `scored ${score}`);
          }, 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  function tap() {
    if (locked || finishedRef.current) return;
    const next = score + 1;
    setScore(next);
    setTarget({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 });
    if (next >= game.data.passingScore) {
      finish(true, `scored ${next}`);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between rounded-xl bg-black/30 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
        <span>⚡ {score}/{game.data.passingScore}</span>
        <span>⏱ {timeLeft}s</span>
      </div>

      <div className="relative h-80 w-full max-w-[340px] overflow-hidden rounded-2xl bg-black/20">
        <button
          type="button"
          onClick={tap}
          disabled={locked}
          aria-label="target"
          className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300 text-2xl shadow-lg transition-all active:scale-90"
          style={{ left: `${target.x}%`, top: `${target.y}%` }}
        >
          🎯
        </button>
      </div>
    </div>
  );
}
```

The schema entry that goes with it:

```ts
export const TapTargetContent = z.object({
  template: z.literal("tap_target"),
  id: z.string(),
  subject: z.enum(["math", "english", "science"]),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  prompt: z.string(),
  explanation: z.string(),
  data: z.object({
    durationSec: z.number().int().min(5).max(60),
    passingScore: z.number().int().min(1),
  }),
});
export type TapTargetContent = z.infer<typeof TapTargetContent>;
```

A content instance:

```json
{
  "template": "tap_target",
  "id": "demo-tap-1",
  "subject": "math",
  "difficulty": 1,
  "prompt": "Tap the target as many times as you can!",
  "explanation": "Practice your reflexes — tap the target before time runs out.",
  "data": { "durationSec": 15, "passingScore": 10 }
}
```

---

## 8. Local testing recipe

You don't need to clone the host app to develop. Build the component in isolation:

1. Create a fresh Next.js 16 + Tailwind 4 project: `npx create-next-app@latest my-game --ts --tailwind --app --no-src-dir`
2. Drop your component into `app/page.tsx` like this:

```tsx
"use client";
import { YourGame } from "./YourGame";  // your component

const SAMPLE = {
  template: "your_game",
  id: "test-1",
  subject: "math",
  difficulty: 1,
  prompt: "Test prompt.",
  explanation: "Test explanation.",
  data: { /* ... */ },
} as const;

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-800">
      <div className="w-full max-w-[380px]">
        <YourGame
          game={SAMPLE}
          onAnswer={(ok, desc) => alert(`${ok ? "WON" : "LOST"}: ${desc}`)}
          locked={false}
        />
      </div>
    </div>
  );
}
```

3. `npm run dev`. Iterate until it feels good.
4. Test on a real phone (use the dev server's network URL). Touch behavior is hard to fake in DevTools.

---

## 9. Deliverables checklist

When you're done, hand back:

- [ ] **`<YourGame>.tsx`** — the component file, no external deps beyond what's already in this spec
- [ ] **Schema snippet** — the Zod object + inferred type, ready to paste into `src/lib/schema.ts`
- [ ] **3-5 content instances** — JSON blobs at mixed difficulty, covering at least 2 of the 3 subjects if possible
- [ ] **A 1-paragraph design note** — what the game teaches, what counts as winning, any quirks
- [ ] **Self-contained test page** (the snippet from §8) — proof it runs

We'll wire it into the dispatcher (one new `case` in `GameCard.tsx`) and ship it.

---

## 10. Anti-patterns — what will get sent back

- ❌ Quiz-style "pick the right multiple choice" — already covered, we want mechanics
- ❌ Game that requires reading more than ~10 words to start playing
- ❌ Game that assumes a mouse (hover-only interactions, tiny click targets)
- ❌ Game that takes >2 minutes to win
- ❌ Game that fetches data from an external API
- ❌ Game with embedded audio/video without a fallback (browsers block autoplay)
- ❌ Game with hard-coded content (everything that varies between sessions belongs in `data`)
- ❌ Component that takes props other than the three in §3
- ❌ Component that calls `onAnswer` zero times (player can never advance) or more than once (race condition)

---

## Questions?

If anything in this spec is ambiguous — especially the gesture/scroll-snap interaction — ask before building. A clarification beats a rewrite.
