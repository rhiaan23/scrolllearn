import { type Difficulty, type Game, type Subject } from "./schema";
import { SEED_GAMES } from "./seedGames";

interface TakeOpts {
  subject: Subject;
  difficulty?: Difficulty;
  avoid?: string[];
}

/**
 * Pick the best demo game for the given parameters.
 *
 * Priority:
 *   1. Subject matches AND difficulty matches AND not in avoid list
 *   2. Subject matches AND not in avoid list
 *   3. Not in avoid list
 *   4. Anything (avoid list ignored — we've cycled past all 10)
 */
export async function takeGame(opts: TakeOpts): Promise<Game> {
  const avoid = new Set(opts.avoid ?? []);
  const notSeen = (g: Game) => !avoid.has(g.id);

  const exact = SEED_GAMES.filter(
    (g) => g.subject === opts.subject && g.difficulty === opts.difficulty && notSeen(g),
  );
  if (exact.length > 0) return pickRandom(exact);

  const subjectMatch = SEED_GAMES.filter((g) => g.subject === opts.subject && notSeen(g));
  if (subjectMatch.length > 0) return pickRandom(subjectMatch);

  const anyUnseen = SEED_GAMES.filter(notSeen);
  if (anyUnseen.length > 0) return pickRandom(anyUnseen);

  // Fully cycled — start over with a random pick.
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
