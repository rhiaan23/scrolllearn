import { type Difficulty, type Game, type Subject, type Template } from "./schema";
import { SEED_GAMES } from "./seedGames";

interface TakeOpts {
  subject: Subject;
  difficulty?: Difficulty;
  avoid?: string[]; // ordered oldest → newest of recently-served IDs
  avoidTemplate?: Template; // template of the last-served card — avoid back-to-back same mechanic
}

// Hard adjacency window: NEVER return a game whose ID appears in the last
// NO_REPEAT_WINDOW entries of `avoid`, no matter how exhausted the pool gets.
// Tuned so even a 3-game subject (e.g. science) never produces visible adjacent repeats.
const NO_REPEAT_WINDOW = 4;

/**
 * Pick the next demo game.
 *
 * Priority cascade (each tier respects the FULL avoid list):
 *   1. Same subject AND same difficulty AND different template
 *   2. Same subject (any difficulty) AND different template
 *   3. Any subject AND different template
 *   4. Same subject AND same difficulty (template filter relaxed)
 *   5. Same subject (any difficulty)
 *   6. Any subject
 * Final fallback (avoid list relaxed):
 *   7. Anything outside the hard adjacency window — guarantees no immediate ID repeat
 *   8. Anything at all (only reachable when SEED_GAMES has fewer entries than the window)
 */
export async function takeGame(opts: TakeOpts): Promise<Game> {
  const avoidList = opts.avoid ?? [];
  const avoid = new Set(avoidList);
  // The last N IDs are the ones that would feel like a "right next to itself" repeat.
  const recent = new Set(avoidList.slice(-NO_REPEAT_WINDOW));

  const notSeen = (g: Game) => !avoid.has(g.id);
  const notRecent = (g: Game) => !recent.has(g.id);
  const differentTemplate = (g: Game) =>
    opts.avoidTemplate === undefined || g.template !== opts.avoidTemplate;

  // Tier 1-3: honor both avoid list AND template adjacency.
  const exactFresh = SEED_GAMES.filter(
    (g) =>
      g.subject === opts.subject &&
      g.difficulty === opts.difficulty &&
      notSeen(g) &&
      differentTemplate(g),
  );
  if (exactFresh.length > 0) return pickRandom(exactFresh);

  const subjectFresh = SEED_GAMES.filter(
    (g) => g.subject === opts.subject && notSeen(g) && differentTemplate(g),
  );
  if (subjectFresh.length > 0) return pickRandom(subjectFresh);

  const anyFresh = SEED_GAMES.filter((g) => notSeen(g) && differentTemplate(g));
  if (anyFresh.length > 0) return pickRandom(anyFresh);

  // Tier 4-6: template adjacency relaxed, but avoid list still honored.
  const exact = SEED_GAMES.filter(
    (g) => g.subject === opts.subject && g.difficulty === opts.difficulty && notSeen(g),
  );
  if (exact.length > 0) return pickRandom(exact);

  const subjectMatch = SEED_GAMES.filter((g) => g.subject === opts.subject && notSeen(g));
  if (subjectMatch.length > 0) return pickRandom(subjectMatch);

  const anyUnseen = SEED_GAMES.filter(notSeen);
  if (anyUnseen.length > 0) return pickRandom(anyUnseen);

  // Cycled past the whole avoid list — relax it, but STILL refuse anything
  // we just served in the last NO_REPEAT_WINDOW picks.
  const notTooRecent = SEED_GAMES.filter(notRecent);
  if (notTooRecent.length > 0) return pickRandom(notTooRecent);

  // Pool smaller than the no-repeat window. Best we can do.
  return pickRandom(SEED_GAMES);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function poolStats(): Record<Subject, number> {
  const out = { math: 0, english: 0, science: 0 } as Record<Subject, number>;
  for (const g of SEED_GAMES) out[g.subject]++;
  return out;
}
