import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 text-white">
      {/* Decorative floating shapes */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-10 h-48 w-48 rounded-full bg-pink-300/20 blur-2xl" />

      <div className="relative z-10 flex max-w-md flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-3 rounded-full bg-white/15 px-4 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-white/80">
            for elementary students
          </span>
        </div>

        <h1 className="text-6xl font-black leading-none tracking-tight drop-shadow-lg sm:text-7xl">
          Scroll<span className="text-yellow-300">Learn</span>
        </h1>

        <p className="text-lg leading-relaxed text-white/90">
          A scrollable feed of mini-games that turns ten minutes of swiping
          into <span className="font-bold text-yellow-200">real learning</span>.
          Math, English &amp; Science — adapting to you in real time.
        </p>

        <div className="flex items-center gap-4 text-3xl">
          <span title="Math">🔢</span>
          <span title="English">📚</span>
          <span title="Science">🔬</span>
        </div>

        <Link
          href="/feed"
          className="group relative mt-2 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-xl font-bold text-purple-700 shadow-2xl transition-all hover:scale-105 hover:bg-yellow-300 hover:text-purple-900"
        >
          Start Learning
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>

        <p className="text-xs text-white/60">
          No sign-up. Just scroll.
        </p>
      </div>

      <footer className="absolute bottom-4 text-center text-xs text-white/50">
        Powered by Claude · built at HackPrinceton
      </footer>
    </main>
  );
}
