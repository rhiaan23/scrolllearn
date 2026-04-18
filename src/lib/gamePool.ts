import { generateGame } from "./claude";
import {
  type Difficulty,
  type Game,
  type Subject,
  SUBJECTS,
  TEMPLATES,
  type Template,
} from "./schema";

type Bucket = Game[];

// Module-level cache. Survives across requests in the same Node process.
const pool: Record<Subject, Bucket> = {
  math: [],
  english: [],
  science: [],
};

// Tracks subjects we're currently topping up to avoid duplicate concurrent gens.
const topUpInFlight: Record<Subject, boolean> = {
  math: false,
  english: false,
  science: false,
};

const TARGET_PER_SUBJECT = 4;
const TOP_UP_THRESHOLD = 2;

let warmedUp = false;
let warmupPromise: Promise<void> | null = null;

async function generateOne(
  subject: Subject,
  difficulty: Difficulty,
  template?: Template,
  avoid?: string[],
): Promise<Game | null> {
  try {
    return await generateGame({ subject, difficulty, template, avoid });
  } catch (err) {
    console.error(`[gamePool] failed to generate ${subject}/${difficulty}:`, err);
    return null;
  }
}

/** Pre-warm the pool with a starter set across all subjects. */
async function warmUp(): Promise<void> {
  if (warmedUp) return;
  if (warmupPromise) return warmupPromise;
  warmupPromise = (async () => {
    const tasks: Promise<Game | null>[] = [];
    for (const subject of SUBJECTS) {
      for (let i = 0; i < TARGET_PER_SUBJECT; i++) {
        const difficulty = ((i % 3) + 1) as Difficulty;
        const template = TEMPLATES[i % TEMPLATES.length];
        tasks.push(generateOne(subject, difficulty, template));
      }
    }
    const results = await Promise.all(tasks);
    for (const g of results) {
      if (g) pool[g.subject].push(g);
    }
    warmedUp = true;
  })();
  return warmupPromise;
}

/** Async (non-blocking) top-up so the next request finds something ready. */
function backgroundTopUp(subject: Subject): void {
  if (topUpInFlight[subject]) return;
  if (pool[subject].length >= TARGET_PER_SUBJECT) return;
  topUpInFlight[subject] = true;
  (async () => {
    try {
      const need = TARGET_PER_SUBJECT - pool[subject].length;
      const tasks: Promise<Game | null>[] = [];
      for (let i = 0; i < need; i++) {
        const difficulty = ((i % 3) + 1) as Difficulty;
        const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
        const avoid = pool[subject].map((g) => g.id);
        tasks.push(generateOne(subject, difficulty, template, avoid));
      }
      const results = await Promise.all(tasks);
      for (const g of results) {
        if (g) pool[subject].push(g);
      }
    } finally {
      topUpInFlight[subject] = false;
    }
  })();
}

interface TakeOpts {
  subject: Subject;
  difficulty?: Difficulty; // preferred; not strictly enforced
  avoid?: string[];
  template?: Template;
}

/**
 * Get one game for the given subject. Generates fresh if the pool is dry.
 * Triggers a background top-up whenever the pool drops below threshold.
 */
export async function takeGame(opts: TakeOpts): Promise<Game> {
  await warmUp();
  const bucket = pool[opts.subject];

  // Prefer one matching the requested difficulty if we have it.
  let idx = -1;
  if (opts.difficulty !== undefined) {
    idx = bucket.findIndex(
      (g) => g.difficulty === opts.difficulty && !opts.avoid?.includes(g.id),
    );
  }
  if (idx === -1) {
    idx = bucket.findIndex((g) => !opts.avoid?.includes(g.id));
  }

  let game: Game | null = null;
  if (idx !== -1) {
    [game] = bucket.splice(idx, 1);
  }

  // Trigger a background top-up no matter what.
  if (bucket.length < TOP_UP_THRESHOLD) backgroundTopUp(opts.subject);

  if (game) return game;

  // Pool was empty for this subject — generate synchronously as a fallback.
  const fresh = await generateGame({
    subject: opts.subject,
    difficulty: opts.difficulty ?? 1,
    template: opts.template,
    avoid: opts.avoid,
  });
  return fresh;
}

export function poolStats(): Record<Subject, number> {
  return {
    math: pool.math.length,
    english: pool.english.length,
    science: pool.science.length,
  };
}
