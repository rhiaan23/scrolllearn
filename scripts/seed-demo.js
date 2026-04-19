/**
 * Seed the "DEMO" class with realistic teacher-dashboard data.
 * Idempotent — safe to re-run; replaces existing DEMO data each time.
 *
 * Usage:  node scripts/seed-demo.js
 */
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "class-data.json");
const raw = fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE, "utf-8") : "{}";
const data = JSON.parse(raw);
data.students ??= {};
data.answers ??= [];

// ── Wipe any prior DEMO entries so this script is idempotent ──
for (const id of Object.keys(data.students)) {
  if (data.students[id].classCode === "DEMO") delete data.students[id];
}
data.answers = data.answers.filter((a) => a.classCode !== "DEMO");

// ── Demo students ── 10 kids with a believable spread ──
const STUDENTS = [
  { id: "demo-emma",   name: "Emma T.",   score: 290, streak: 5, bestStreak: 12 },
  { id: "demo-liam",   name: "Liam K.",   score: 260, streak: 8, bestStreak: 9  },
  { id: "demo-sofia",  name: "Sofia R.",  score: 240, streak: 3, bestStreak: 9  },
  { id: "demo-noah",   name: "Noah B.",   score: 220, streak: 0, bestStreak: 7  },
  { id: "demo-aisha",  name: "Aisha M.",  score: 200, streak: 6, bestStreak: 7  },
  { id: "demo-carlos", name: "Carlos D.", score: 180, streak: 2, bestStreak: 6  },
  { id: "demo-priya",  name: "Priya S.",  score: 150, streak: 0, bestStreak: 6  },
  { id: "demo-jake",   name: "Jake W.",   score: 130, streak: 3, bestStreak: 5  },
  { id: "demo-maya",   name: "Maya P.",   score: 110, streak: 1, bestStreak: 4  },
  { id: "demo-diego",  name: "Diego R.",  score:  80, streak: 0, bestStreak: 3  },
];

const JOINED = 1744934400000; // ~Apr 2025
for (const s of STUDENTS) {
  data.students[s.id] = {
    id: s.id,
    name: s.name,
    classCode: "DEMO",
    score: s.score,
    streak: s.streak,
    bestStreak: s.bestStreak,
    joinedAt: JOINED,
  };
}

// ── Demo questions ── chosen to populate all three feedback categories ──
const QUESTIONS = [
  // ✅ Best-performing (kids nail these — appear in "Easiest")
  { prompt: "What is 3 + 4?",                                         subject: "math",    difficulty: 1, attempts: 14, correctRate: 0.93 },
  { prompt: "Spell the missing word: I see the ___ in the sky.",      subject: "english", difficulty: 1, attempts: 12, correctRate: 0.92 },
  { prompt: "Tap only the animals that fly.",                         subject: "science", difficulty: 1, attempts: 11, correctRate: 0.91 },
  { prompt: "What planet do we live on?",                             subject: "science", difficulty: 1, attempts:  8, correctRate: 0.88 },
  { prompt: "What number comes after 39?",                            subject: "math",    difficulty: 1, attempts:  8, correctRate: 0.88 },

  // 🟡 Mid — moderate correct, may show in Most Played but not extremes
  { prompt: "What is 7 × 8?",                                         subject: "math",    difficulty: 2, attempts: 13, correctRate: 0.62 },
  { prompt: "Choose the verb in: \"She runs fast.\"",                 subject: "english", difficulty: 2, attempts: 10, correctRate: 0.60 },
  { prompt: "Spell the word HONEY.",                                  subject: "english", difficulty: 2, attempts:  9, correctRate: 0.67 },
  { prompt: "Order the water cycle stages.",                          subject: "science", difficulty: 2, attempts: 12, correctRate: 0.58 },

  // 🧠 Needs work — high wrong rate (appear in "Struggles")
  { prompt: "Simplify the fraction 12/18.",                           subject: "math",    difficulty: 3, attempts: 11, correctRate: 0.27 },
  { prompt: "What is the antonym of \"generous\"?",                   subject: "english", difficulty: 3, attempts:  9, correctRate: 0.22 },
  { prompt: "Identify the producer in: grass → rabbit → fox.",        subject: "science", difficulty: 3, attempts: 10, correctRate: 0.30 },
  { prompt: "What is 1/2 + 1/4 ?",                                    subject: "math",    difficulty: 3, attempts:  8, correctRate: 0.25 },

  // 🔥 Most-played — high engagement (cap most-played list)
  { prompt: "Merge tiles to reach 16.",                               subject: "math",    difficulty: 1, attempts: 22, correctRate: 0.77 },
  { prompt: "Tap the things that fly!",                               subject: "science", difficulty: 1, attempts: 20, correctRate: 0.85 },
  { prompt: "Spell each word from the picture.",                      subject: "english", difficulty: 1, attempts: 18, correctRate: 0.83 },
];

let ts = 1745020800000;
const studentIds = STUDENTS.map((s) => s.id);

for (const q of QUESTIONS) {
  const correct = Math.round(q.attempts * q.correctRate);
  const wrong = q.attempts - correct;
  const slug = q.prompt.replace(/[^A-Za-z0-9]+/g, "-").slice(0, 32).toLowerCase();

  for (let i = 0; i < correct; i++) {
    data.answers.push({
      studentId: studentIds[i % studentIds.length],
      classCode: "DEMO",
      gameId: `demo-${slug}-c${i}`,
      prompt: q.prompt,
      subject: q.subject,
      difficulty: q.difficulty,
      isCorrect: true,
      timestamp: ts++,
    });
  }
  for (let i = 0; i < wrong; i++) {
    data.answers.push({
      studentId: studentIds[(i + correct) % studentIds.length],
      classCode: "DEMO",
      gameId: `demo-${slug}-w${i}`,
      prompt: q.prompt,
      subject: q.subject,
      difficulty: q.difficulty,
      isCorrect: false,
      timestamp: ts++,
    });
  }
}

fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
console.log(
  `✓ DEMO seed: ${STUDENTS.length} students, ${QUESTIONS.length} questions, ` +
    `${data.answers.filter((a) => a.classCode === "DEMO").length} answer events.`,
);
