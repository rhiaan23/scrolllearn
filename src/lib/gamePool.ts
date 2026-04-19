import { type Difficulty, type Game, type Subject, type Template } from "./schema";
import { SEED_GAMES } from "./seedGames";

interface TakeOpts {
  subject: Subject;
  difficulty?: Difficulty;
  avoid?: string[]; // every game ID already served this session
  avoidTemplates?: Template[]; // soft preference — last N templates to spread mechanics
  /** When true, never fall back to a different subject even if the pool is exhausted. */
  strictSubject?: boolean;
}

/**
 * Strict, session-scoped pick. A game id in `avoid` is NEVER returned —
 * callers pass the full session history. When every game has been seen,
 * returns null so the feed can show an end-of-pool state rather than repeat.
 */
export async function takeGame(opts: TakeOpts): Promise<Game | null> {
  const avoid = new Set(opts.avoid ?? []);
  const recentTemplates = new Set(opts.avoidTemplates ?? []);

  const notSeen = (g: Game) => !avoid.has(g.id);
  const freshTemplate = (g: Game) => !recentTemplates.has(g.template);

  // 1. Same subject + same difficulty + fresh template
  const t1 = SEED_GAMES.filter(
    (g) =>
      g.subject === opts.subject &&
      g.difficulty === opts.difficulty &&
      notSeen(g) &&
      freshTemplate(g),
  );
  if (t1.length > 0) return pickRandom(t1);

  // 2. Same subject + fresh template (any difficulty)
  const t2 = SEED_GAMES.filter(
    (g) => g.subject === opts.subject && notSeen(g) && freshTemplate(g),
  );
  if (t2.length > 0) return pickRandom(t2);

  // 3. Same subject, any template
  const t3 = SEED_GAMES.filter((g) => g.subject === opts.subject && notSeen(g));
  if (t3.length > 0) return pickRandom(t3);

  // Subject exhausted — bail if caller wants strict subject pinning.
  if (opts.strictSubject) return null;

  // 4. Any subject + fresh template
  const t4 = SEED_GAMES.filter((g) => notSeen(g) && freshTemplate(g));
  if (t4.length > 0) return pickRandom(t4);

  // 5. Any unseen game
  const t5 = SEED_GAMES.filter(notSeen);
  if (t5.length > 0) return pickRandom(t5);

  // Pool fully exhausted — do NOT repeat.
  return null;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function poolStats(): Record<Subject, number> {
  const out = { math: 0, english: 0, science: 0 } as Record<Subject, number>;
  for (const g of SEED_GAMES) out[g.subject]++;
  return out;
}
