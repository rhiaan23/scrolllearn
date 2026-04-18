# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (port 3000)
npm run build    # production build
npm run lint     # ESLint
```

No test suite is configured.

## Architecture

**ScrollLearn** is a TikTok-style infinite-scroll feed of AI-generated educational mini-games for grades K–5. There is no auth — state is anonymous and persisted to `localStorage` via Zustand.

### Data flow

1. `/feed` page calls `fetchOne()` → `POST /api/games/generate`
2. API calls Claude Sonnet 4.6 with structured output (Zod schema) to return a validated `Game` object
3. A `GameCard` renders the game using one of four templates
4. User answers → `recordAnswer()` updates Zustand store (score, streak, per-subject stats)
5. Adaptive algorithm picks next subject/difficulty; feed prefetches 3 cards ahead

### Key directories

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router pages + API routes |
| `src/app/api/games/` | `generate` and `explain` endpoints |
| `src/components/games/` | Four game templates (MergeMath, WordBuilder, QuickSort, SequenceOrder) |
| `src/lib/schema.ts` | Zod discriminated union for all game types — the source of truth for game shape |
| `src/lib/store.ts` | Zustand store with persistence; `nextRequestParams()` drives adaptive requests |
| `src/lib/adaptive.ts` | Difficulty/subject selection logic (60% weakest-subject bias) |
| `src/lib/claude.ts` | Anthropic SDK wrapper — `generateGame()` and `explainAnswer()` |
| `src/lib/gamePool.ts` | Seeded demo games used as fallback before AI games are ready |

### Game templates

Four templates, three subjects (math, english, science), three difficulty levels (1=K–1, 2=Gr2–3, 3=Gr4–5):

- **MergeMath** — slide tiles to sum to a target (arrow keys + swipe)
- **WordBuilder** — fill in words from hints/emojis
- **QuickSort** — timed drag-to-categorize
- **SequenceOrder** — drag tokens into correct order

### State shape

`answered` (per game-id map) prevents double-counting. `seenIds` prevents repeat games in a session. Queue is ephemeral (not persisted). Score/streak/stats survive reloads.

### AI integration

- Model: `claude-sonnet-4-6` via `@anthropic-ai/sdk`
- System prompt uses ephemeral cache control for cost efficiency
- `messages.parse()` guarantees structured JSON matching the Zod schema
- `avoid` param passed to Claude to prevent repeating recent game IDs

### Styling

Tailwind CSS 4 (PostCSS plugin, not the old `tailwind.config.js` approach). Custom animations (`pop`, `shake`) are defined in `src/app/globals.css`. Path alias `@/*` maps to `src/*`.
