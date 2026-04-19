# FunFeed — Sunny Paper theme port

This folder is a drop-in port of the **Direction 03 — Sunny Paper** aesthetic from the FunFeed prototype into your existing `scrolllearn` Next.js codebase.

## What you're getting

```
paper-port/
├─ src/lib/paperTheme.ts            # colour tokens (paper + per-subject)
└─ src/components/paper/
   ├─ PaperSticker.tsx              # 3D hand-cut sticker (core primitive)
   ├─ PaperButton.tsx               # chunky pill CTA
   ├─ PaperCard.tsx                 # full feed-card chrome
   └─ PaperTopStrip.tsx             # wordmark + screen time + tabs
```

Everything is **TypeScript + Tailwind-compatible + Next.js App Router** ("use client" where needed, no external deps beyond your existing ones).

---

## Step 1 — Copy the files in

```bash
# From your scrolllearn repo root:
cp -r paper-port/src/lib/paperTheme.ts         src/lib/
cp -r paper-port/src/components/paper          src/components/
```

## Step 2 — Fonts (`src/app/layout.tsx`)

Replace the single Montserrat import with two fonts — one display, one body:

```tsx
import { Fraunces, Nunito } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "800", "900"],
  variable: "--font-display",
});
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-body",
});

// ...
<html lang="en" className={`${nunito.variable} ${fraunces.variable} h-full antialiased`}>
  <body className="min-h-full" style={{ background: "#FAF3E4" }}>{children}</body>
</html>
```

## Step 3 — `src/app/globals.css`

Change the root colour vars and add the `.font-display` helper:

```css
:root {
  --background: #FAF3E4;
  --foreground: #2B1D10;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-body);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-body), "Nunito", system-ui, sans-serif;
  overflow-x: hidden;
}

.font-display {
  font-family: var(--font-display), "Fraunces", serif;
  letter-spacing: -0.03em;
}

/* Optional: paper grain */
body::before {
  content: "";
  position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.4;
  background:
    radial-gradient(circle at 20% 30%, rgba(0,0,0,0.04) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(0,0,0,0.03) 0%, transparent 40%);
}
```

Keep the rest of your existing keyframes (`pop`, `shake`, etc.) — they all still work.

## Step 4 — Rewrite GameCard's chrome

In `src/components/GameCard.tsx`, replace everything *outside* the `body` switch (the `<section>`, bg image overlay, vignette, `FooterLeft`, `ActionRail`, and result toast) with `<PaperCard>`:

```tsx
import { PaperCard } from "@/components/paper/PaperCard";
import { SUBJECT_COLORS } from "@/lib/schema";

// ... inside return():
return (
  <PaperCard
    subject={game.subject}
    template={game.template}
    title={/* pick a title — e.g. a static map per template */ titleFor(game.template)}
    prompt={game.prompt}
    caption={{ handle: SUBJECT_COLORS[game.subject].handle }}
    onExplain={() => setHelpOpen(true)}   // or split into a separate sheet
    onHelp={() => setHelpOpen(true)}
    result={
      result && { ok: result.correct, message: result.description }
    }
  >
    {body}  {/* your existing switch-statement body, unchanged */}
  </PaperCard>
);
```

You'll want to drop the `TEMPLATE_BG` pixel-art overlays for Sunny Paper — it's a clean theme. If you want to keep them, set `opacity: 0.08` on the overlay so the cream dominates.

## Step 5 — Replace the feed top strip

In `src/app/feed/page.tsx`, swap the old `<TopNavbar>` + subject tab row for `<PaperTopStrip>`:

```tsx
import { PaperTopStrip } from "@/components/paper/PaperTopStrip";

// in JSX, above the scroll container:
<PaperTopStrip
  screenMsLeft={/* pull from your ScreenTimeGate / store */}
  streak={useScrollLearn((s) => s.streak)}
  score={useScrollLearn((s) => s.score)}
  activeSubject={pinnedSubject ?? "all"}
  onSubjectChange={(s) => handleTabChange(s === "all" ? null : s)}
/>
```

If you don't already track `streak`/`score` in your Zustand store, stub them to `0` for now — the badges will render fine.

## Step 6 — Drop emojis from tabs

Your `TAB_LABELS` currently has `"🔢 Math"` etc. The paper aesthetic is no-emoji — use plain labels (already the case in `PaperTopStrip`).

For `ActionRail.tsx` / `SUBJECT_EMOJI`, replace the spinning record disc with a `<PaperSticker>` coloured by subject. I've already wired `EXPLAIN` and `HELP` stickers into `PaperCard`, so you can remove `ActionRail` from `GameCard` entirely if you're using `PaperCard`.

## Step 7 — Onboarding

`StudentOnboarding.tsx`: swap the dark modal for a cream-backed card with:
- `font-display` heading reading `Fun` + italic `Feed.` (math.lo colour)
- `<PaperSticker>` cluster (math/english/science) above the form
- `<PaperButton variant="ink">Start scrolling</PaperButton>`

Same layout as `PaperOnboard` in `ff-paper.jsx`.

---

## Signature details not to miss

- **Rotations**: stickers at -10° to +4°, result toast -2°, template pill -1°. These tiny offsets are 80% of the hand-made feel.
- **3-px press depth**: every interactive element has `box-shadow: 0 3px 0 rgba(43,29,16,0.x)`. Don't flatten them.
- **White 3-px borders** on every sticker — hard-edged like scissor cuts.
- **Serif body inside cards** (Fraunces 500) when you want editorial weight (e.g. the Grammar Quest sentence block). Nunito elsewhere.
- **No emoji.** Use SVG icons.

## What still needs bespoke work

Per-game components (`MergeMath`, `WordBuilder`, `MathCastle`, etc.) still render dark-themed inner UI. Each one needs its palette swapped to the paper tokens — tiles, buttons, inputs. I've kept `PaperCard` agnostic so you can migrate one game at a time; everything outside the body keeps working.
