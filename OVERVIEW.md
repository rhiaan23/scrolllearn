# ScrollLearn — Complete System Overview

Built at HackPrinceton. A TikTok-style infinite-scroll feed of AI-generated educational mini-games for K–5 students.

---

## 1. What It Is

ScrollLearn is a Next.js web app (App Router, TypeScript, Tailwind CSS 4) that presents an infinite vertical feed of interactive mini-games — one per "slide" — modeled on TikTok's UX. Each game is generated on demand by Claude Sonnet 4.6 and targets math, English, or science at one of three difficulty bands. There is no auth; all state is anonymous and persisted to `localStorage` via Zustand.

A separate teacher dashboard (`/teacher`) lets teachers enter a class code + PIN to view a leaderboard and a "struggle report" — the questions students most often get wrong.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 (PostCSS plugin, no `tailwind.config.js`) |
| State | Zustand with `persist` middleware (`localStorage`) |
| Validation | Zod (discriminated union for all game types) |
| AI | Anthropic SDK (`@anthropic-ai/sdk`) — `claude-sonnet-4-6` |
| Persistence | Flat JSON file at `data/class-data.json` (server-side, Node.js `fs`) |
| Path alias | `@/*` → `src/*` |

Dev commands:
```bash
npm run dev      # port 3000
npm run build
npm run lint     # ESLint
```

---

## 3. File / Directory Map

```
src/
  app/
    page.tsx                      # Landing page (/)
    feed/page.tsx                 # Main TikTok-style feed (/feed)
    teacher/page.tsx              # Teacher dashboard (/teacher)
    globals.css                   # Tailwind + custom keyframe animations
    api/
      games/
        generate/route.ts         # POST /api/games/generate
        explain/route.ts          # POST /api/games/explain
      narrate/route.ts            # POST /api/narrate (TTS stub)
      class/
        progress/route.ts         # POST /api/class/progress
        register/route.ts         # POST /api/class/register
        [classCode]/stats/route.ts # GET /api/class/:code/stats
  components/
    GameCard.tsx                  # Renders one feed slide; dispatches on game.template
    ActionRail.tsx                # Right-side icon rail (like, share, help buttons)
    FooterLeft.tsx                # Bottom-left caption (subject, prompt, @handle)
    InstructionsModal.tsx         # How-to-play overlay (reads from instructions.ts)
    TopNavbar.tsx                 # Top nav with score/streak display
    AmbientBg.tsx                 # CSS-only mouse-reactive backdrop
    StudentOnboarding.tsx         # First-visit modal to enter name + class code
    games/
      MergeMath.tsx               # 2048-style tile merging
      WordBuilder.tsx             # Spell words letter-by-letter
      QuickSort.tsx               # Timed drag-to-categorize
      SequenceOrder.tsx           # Drag tokens into correct order
      MathCastle.tsx              # Tower-defense math (type answer before enemy reaches castle)
      Hangman.tsx                 # Classic hangman
      MiniCrossword.tsx           # 3-6 cell crossword grid
      BalanceScale.tsx            # Pick weights to balance a scale
      MathChase.tsx               # Falling numbers; tap ones that sum to target
      GrammarQuest.tsx            # Fill-in-the-blank MCQ (sea RPG theme)
      CleanRiver.tsx              # Tap falling numbers matching a math expression
      WizardDungeon.tsx           # Hero-vs-enemy RPG MCQ (pixel-art dungeon theme)
  lib/
    schema.ts                     # Zod discriminated union — the single source of truth for game shape
    store.ts                      # Zustand store (score, streak, stats, seenIds, student identity)
    adaptive.ts                   # Subject/difficulty selection algorithm
    claude.ts                     # Anthropic SDK wrapper (generateGame, explainAnswer)
    gamePool.ts                   # Seed-game pool (takeGame picks from SEED_GAMES)
    seedGames.ts                  # ~15 hand-curated fallback games validated at import time
    instructions.ts               # How-to-play text for every template
    classData.ts                  # Read/write class-data.json; computes leaderboard + struggle report
data/
  class-data.json                 # Flat JSON: students + answer events (gitignored in prod)
public/
  clean-river/                    # Pixel-art assets for CleanRiver game
  math-castle/                    # Pixel-art assets for MathCastle game
  wizard-dungeon/                 # 18 pixel-art PNGs for WizardDungeon (ported from edutainment-submission/)
```

---

## 4. Data Flow (end-to-end per card)

```
1. feed/page.tsx calls fetchOne()
   └─ POST /api/games/generate { subject, difficulty, avoid[], avoidTemplate }

2. generate/route.ts calls takeGame(opts)
   └─ gamePool.ts: tries SEED_GAMES with priority cascade:
        (a) same subject + difficulty + not seen
        (b) same subject + not seen
        (c) any unseen
        (d) not recently seen (soft fallback)
        (e) anything (last resort)
   └─ If no seed matches → calls generateGame() from claude.ts
        └─ Anthropic SDK messages.parse() with zodOutputFormat(Game)
        └─ Returns a validated Game object

3. route.ts returns { game }
   feed/page.tsx validates: GameSchema.safeParse(json.game)
   Appended to games[] state → renders a new <GameCard>

4. GameCard renders game using the correct template component:
   switch(game.template) { case "wizard_dungeon": <WizardDungeon ...> }
   Each template receives: { game, onAnswer, locked }

5. User answers → template calls onAnswer(isCorrect, description)
   GameCard.handleAnswer():
     └─ recordAnswer(game, isCorrect) → Zustand store updates
     └─ If student enrolled: POST /api/class/progress (fire-and-forget)
     └─ setTimeout → advance() scrolls to next card

6. Zustand persist writes score/streak/stats/seenIds to localStorage
```

---

## 5. Schema — All Game Types

**Source of truth: `src/lib/schema.ts`**

Every game shares a `baseShape`:
```ts
id: string           // kebab-case slug, e.g. "sci-wizard-earth-med"
subject: "math" | "english" | "science"
difficulty: 1 | 2 | 3   // 1=K-1, 2=Gr2-3, 3=Gr4-5
prompt: string       // one sentence shown in the feed caption
explanation: string  // 1-2 sentences explaining why the answer is correct
```

The `Game` type is a Zod `discriminatedUnion` on `template`. Current templates:

| template | description | key data fields |
|---|---|---|
| `merge_math` | 2048 on a 4×4 grid | `target` (16/32/64/128), `startGrid` (4×4 of int\|null) |
| `word_builder` | Spell words letter-by-letter | `words[]` { hint, emoji, answer } |
| `quick_sort` | Tap items matching a rule before timer | `rule`, `pool[]` { emoji, label, matches }, `durationSec`, `passingScore` |
| `sequence_order` | Drag tokens into correct order | `tokens[]`, `correctOrder[]` |
| `math_castle` | Tower-defense: type answer before enemy reaches castle | `enemies[]` { question, answer }, `travelDurationMs`, `spawnIntervalMs`, `lives` |
| `hangman` | Classic hangman | `word`, `hint`, `maxMisses` |
| `mini_crossword` | 3-6 cell crossword | `size`, `entries[]` { answer, clue, row, col, direction } |
| `balance_scale` | Pick weights to balance a scale | `fixed` { side, weights[] }, `pool[]` |
| `math_chase` | Tap falling numbers to hit exact target | `target`, `durationSec`, `spawnIntervalMs`, `pool[]` |
| `grammar_quest` | Fill-in-the-blank MCQ (sea RPG theme) | `questions[]` { sentence (with `___`), options[], correctIndex }, `passingScore` |
| `clean_river` | Tap falling number matching a math expression | `rounds[]` { expression, answer, options[] }, `fallDurationMs`, `lives` |
| `wizard_dungeon` | Hero-vs-enemy RPG MCQ (pixel-art dungeon) | `questions[]` { question, options: [3], correctIndex: 0\|1\|2 }, `heroHp`, `enemyHp` |

---

## 6. Adaptive Algorithm (`src/lib/adaptive.ts`)

**Subject selection** (`pickNextSubject`):
- 60% of the time: pick the weakest subject (lowest accuracy, min 3 attempts)
- 40% of the time: rotate (never repeat last subject)

**Difficulty adjustment** (per subject, tracked in Zustand `stats`):
- Bump up (→ +1): last 3 answers all correct
- Drop down (→ -1): last 2 answers all wrong
- Clamps to [1, 3]

**Struggle explanation trigger**: if last 2 answers for a subject are wrong, surface the explanation automatically.

---

## 7. AI Integration (`src/lib/claude.ts`)

Model: `claude-sonnet-4-6`

`generateGame(opts)`:
- Calls `client().messages.parse()` with `zodOutputFormat(Game)` — guarantees structured JSON
- System prompt uses `cache_control: { type: "ephemeral" }` for prompt caching
- System prompt lists all 12 templates with exact schema constraints and difficulty bands
- User message: `"Generate one {subject} game. Difficulty: {n}. Template: {template}. Avoid: [ids]."`
- If Claude returns a different template than requested, it is accepted with a console warning

`explainAnswer(game, userAnswerDescription)`:
- Separate call, 300 max tokens
- Returns a warm kid-friendly re-explanation of the game's `explanation` field

---

## 8. State (`src/lib/store.ts`)

Zustand store, persisted to `localStorage` as `"scrolllearn-state"`.

**Persisted fields:** `score`, `streak`, `bestStreak`, `stats` (AllStats), `seenIds` (last 16 game IDs), `answered` (gameId → boolean map), `lastSubject`, `studentId`, `studentName`, `classCode`

**Ephemeral (not persisted):** `queue` (pre-fetched game objects)

**Key actions:**
- `recordAnswer(game, isCorrect)` — updates score (+10 if correct), streak, bestStreak, stats, seenIds; fires `POST /api/class/progress` if enrolled
- `reset()` — clears all scores/stats but keeps student identity
- `setStudentInfo(id, name, classCode)` — set after onboarding

`nextRequestParams()` — exported helper that reads current store state and returns `{ subject, difficulty, avoid }` for the next API call.

---

## 9. Game Components — Contract

Every game component in `src/components/games/` follows this interface:

```ts
interface Props {
  game: XxxGame;                                          // the typed game object
  onAnswer: (isCorrect: boolean, description: string) => void;
  locked: boolean;   // true when card is off-screen OR user already answered
}
```

Rules:
- `onAnswer` must be called **exactly once** per game instance (use a `finishedRef = useRef(false)` guard)
- When `locked === true`, all timers, spawners, and keyboard handlers must be disabled
- `description` is a short human-readable string shown in the result toast (e.g. `"4 / 7 correct"`)

**`locked` lifecycle:** `locked = result !== null || !isVisible`. `isVisible` is set by an IntersectionObserver with 0.5 threshold — the card is only "active" when it occupies more than half the viewport.

---

## 10. Adding a New Game Template (Checklist)

1. **`src/lib/schema.ts`** — define a Zod object with `template: z.literal("foo")` extending `baseShape`, a `data` sub-schema, append to `Game` discriminatedUnion, export the type, append `"foo"` to `TEMPLATES`.

2. **`src/components/games/Foo.tsx`** — React client component following the Props contract above.

3. **`src/components/GameCard.tsx`** — add `import`, add `case "foo":` to the switch.

4. **`src/lib/instructions.ts`** — add `foo: { title, emoji, steps[], goal }` to `INSTRUCTIONS`.

5. **`src/lib/seedGames.ts`** — add at least one `Game.parse({...})` seed entry so the feed has a fallback before AI games are ready.

6. **`src/lib/claude.ts`** — add a numbered entry in `SYSTEM_PROMPT`'s `GAME TEMPLATES` section describing schema constraints and difficulty scaling.

---

## 11. Teacher System

**Class enrollment** (student side):
- First visit → `StudentOnboarding` modal → student enters name + class code
- `POST /api/class/register` creates/updates a `StudentRecord` in `data/class-data.json`
- `setStudentInfo(id, name, classCode)` persists to Zustand

**Progress tracking** (automatic):
- Every `recordAnswer()` call fires `POST /api/class/progress` if the student is enrolled
- Route upserts the student's score/streak and appends an `AnswerEvent`
- Deduplication: same `studentId + gameId` combo is never recorded twice

**Teacher dashboard** (`/teacher`):
- Enter class code + PIN (default PIN: `1234`)
- `GET /api/class/:code/stats` → returns leaderboard (students sorted by score) and struggle report
- Struggle report: aggregates `AnswerEvent`s by prompt, filters to ≥2 total attempts, sorts by wrong count, shows wrong % with color coding (red ≥70%, yellow ≥40%, green otherwise)

**Data storage:** flat JSON at `data/class-data.json` (read/write via Node.js `fs`). No database. This is intentional for hackathon simplicity — not suitable for production scale.

---

## 12. Feed UX Details

- Vertical snap-scroll (`snap-y snap-mandatory`) — one card per viewport height
- `PREFETCH_AHEAD = 3` — always keep 3 games buffered beyond the visible card
- Single-flight fetch via `fetchingRef` — concurrent fetches are prevented
- `avoidTemplate` param prevents two of the same template back-to-back
- `avoid` list: up to 16 recently-seen game IDs, prioritizing the most recent 12 for the adjacency window check
- After answering: auto-advance after 1.1s (correct) or 1.7s (wrong)
- If the user answers the last buffered card before the next fetch completes, `pendingAdvanceRef` queues a scroll-forward that fires the moment the next card lands

---

## 13. Styling Conventions

- Tailwind CSS 4 (PostCSS plugin). No `tailwind.config.js`. Custom utilities go in `src/app/globals.css` as `@keyframes` + class definitions.
- Existing custom animations: `pop`, `pop-in`, `shake` (`.animate-shake`), `spin-slow`, `marquee`, `mc-walk`, `mc-march`, `mc-castle-shake`, `mc-shake`, `mc-fall`, `river-fall`, `slideRight`, `slideLeft`
- Font: Montserrat (CSS variable `--font-montserrat`), loaded via Next.js font optimization
- Subject color palette (defined in `schema.ts` as `SUBJECT_COLORS`):
  - math: blue/indigo
  - english: purple/fuchsia/pink
  - science: emerald/teal/cyan
- Pixel-art game components use `imageRendering: "pixelated"` and inlined box-shadow borders (`inset 0 0 0 3px #000, inset 0 0 0 6px #fff`)

---

## 14. Seed Games Summary

`src/lib/seedGames.ts` contains ~15 hand-curated games validated at module import time via `Game.parse()`. They serve as the fallback pool before AI-generated games are ready and as exemplars that prime Claude's understanding of the format.

Distribution: math 4–5 / english 3–4 / science 3–4 games across all templates and difficulty levels.

---

## 15. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes (for AI games) | Anthropic API key; if missing, only seed games are served |

No other env vars. The app degrades gracefully to seed-only mode if the key is absent (the generate route will error, triggering a retry button in the UI).

---

## 16. Known Constraints / Non-obvious Decisions

- **No database.** `data/class-data.json` is written directly by the server. Concurrent writes could cause data loss at scale. Fine for a hackathon demo.
- **No auth.** Teacher PIN is hardcoded to `1234` in the UI hint. Class codes are unguarded.
- **AI games are blocking.** `POST /api/games/generate` calls Claude synchronously; if Claude is slow, the feed shows a spinner. There is no streaming.
- **Seed pool is exhausted quickly.** With 15 seeds and `SEEN_LIMIT = 16`, a user who scrolls fast will run out of unique seeds and start getting AI games immediately.
- **`answered` map grows unbounded** across sessions (never pruned). For a student who plays for months this could get large, but localStorage limits are ~5MB.
- **`TEMPLATES` array drives Claude's random template selection.** All 12 templates are equally weighted; the `avoidTemplate` param prevents back-to-back repeats but does not otherwise weight by subject affinity.
- **Wizard Dungeon is science-biased** by convention (seeds are science, Claude prompt recommends science), but the schema allows any subject.
