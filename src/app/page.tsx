"use client";

import { useRef } from "react";
import { paper } from "@/lib/theme";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperSticker } from "@/components/paper/PaperSticker";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import Link from "next/link";

/* ─── tiny helpers ─── */

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`relative w-full ${className}`}>
      <div className="mx-auto max-w-6xl px-6">{children}</div>
    </section>
  );
}

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mb-4 inline-block font-display text-[11px] font-black uppercase tracking-[0.28em]"
      style={{ color: paper.math.lo }}
    >
      {children}
    </span>
  );
}

/* ─── Phone mockup ─── */

function PhoneMockup() {
  return (
    <div className="relative">
      {/* Glow ring */}
      <div
        className="absolute -inset-6 rounded-[52px] opacity-40 blur-2xl"
        style={{
          background: `radial-gradient(circle, ${paper.math.tint} 0%, transparent 70%)`,
        }}
      />
      <div
        className="animate-phone-glow relative overflow-hidden rounded-[40px] border-[6px]"
        style={{
          borderColor: paper.ink,
          width: 280,
          height: 580,
          background: paper.bg,
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-5 py-2 text-[11px] font-bold"
          style={{ background: paper.ink, color: "#fff" }}
        >
          <span>9:41</span>
          <span style={{ fontSize: 10, letterSpacing: "0.08em" }}>
            FunFeed
          </span>
          <span>100%</span>
        </div>

        {/* HUD bar */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ background: paper.bg2 }}
        >
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 14 }}>&#11088;</span>
            <span
              className="font-display text-[15px] font-black"
              style={{ color: paper.ink }}
            >
              120
            </span>
          </div>
          <div className="flex gap-1.5">
            {(["math", "english", "science"] as const).map((s) => (
              <div
                key={s}
                className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold capitalize"
                style={{
                  background: paper[s].tint,
                  color: paper[s].ink,
                }}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 12 }}>&#128293;</span>
            <span
              className="font-display text-[14px] font-black"
              style={{ color: paper.math.lo }}
            >
              8
            </span>
          </div>
        </div>

        {/* Scrolling game cards */}
        <div className="relative flex-1 overflow-hidden" style={{ height: 440 }}>
          <PhoneGameCards />
        </div>

        {/* Bottom nav */}
        <div
          className="flex items-center justify-around py-2"
          style={{
            background: paper.ink,
            borderTop: `1px solid ${paper.ink}`,
          }}
        >
          {["Feed", "Score", "Streak"].map((t) => (
            <div
              key={t}
              className="text-center text-[9px] font-bold"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              <div
                className="mx-auto mb-0.5 h-4 w-4 rounded-md"
                style={{ background: "rgba(255,255,255,0.2)" }}
              />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneGameCards() {
  const games = [
    {
      subject: "math" as const,
      label: "MergeMath",
      content: (
        <div className="flex flex-col items-center gap-3">
          <div
            className="rounded-xl px-4 py-2 text-center font-display text-lg font-black"
            style={{ background: paper.math.tint, color: paper.math.ink }}
          >
            Target: 12
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 7, 4, 8, 2].map((n, i) => (
              <div
                key={i}
                className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-lg font-black text-white"
                style={{
                  background:
                    i === 1 || i === 3
                      ? paper.math.hi
                      : paper.math.tint,
                  color:
                    i === 1 || i === 3 ? "#fff" : paper.math.ink,
                }}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      subject: "english" as const,
      label: "WordBuilder",
      content: (
        <div className="flex flex-col items-center gap-3">
          <div className="text-center text-3xl">&#128218;</div>
          <p
            className="text-center font-body text-sm font-bold"
            style={{ color: paper.english.ink }}
          >
            &quot;A place where books live&quot;
          </p>
          <div className="flex gap-1.5">
            {["L", "I", "B", "R", "A", "R", "Y"].map((c, i) => (
              <div
                key={i}
                className="flex h-9 w-8 items-center justify-center rounded-lg font-display text-base font-black"
                style={{
                  background: i < 5 ? paper.english.hi : paper.english.tint,
                  color: i < 5 ? "#fff" : paper.english.ink,
                  border: i >= 5 ? `2px dashed ${paper.english.hi}60` : "none",
                }}
              >
                {i < 5 ? c : ""}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      subject: "science" as const,
      label: "QuickSort",
      content: (
        <div className="flex flex-col items-center gap-3">
          <div className="text-center text-3xl">&#129514;</div>
          <p
            className="text-center font-body text-sm font-bold"
            style={{ color: paper.science.ink }}
          >
            Sort: Living vs Non-living
          </p>
          <div className="flex gap-3">
            <div
              className="rounded-xl px-3 py-2 text-center text-xs font-bold"
              style={{
                background: paper.science.tint,
                color: paper.science.ink,
              }}
            >
              &#127793; Plant
              <br />
              &#128023; Dog
            </div>
            <div
              className="rounded-xl px-3 py-2 text-center text-xs font-bold"
              style={{
                background: paper.bg2,
                color: paper.inkSoft,
              }}
            >
              &#129704; Rock
              <br />
              &#128167; Water
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      className="flex flex-col"
      animate={{ y: [0, -410, -820, 0] }}
      transition={{
        duration: 9,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.3, 0.65, 1],
        repeatDelay: 1,
      }}
    >
      {games.map((g, i) => (
        <div
          key={i}
          className="flex h-[410px] flex-col items-center justify-center px-5 py-6"
          style={{ background: `${paper[g.subject].tint}40` }}
        >
          <div
            className="mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white"
            style={{
              background: `linear-gradient(135deg, ${paper[g.subject].hi}, ${paper[g.subject].lo})`,
            }}
          >
            {g.label}
          </div>
          <div
            className="w-full rounded-2xl p-5"
            style={{
              background: "#fff",
              boxShadow:
                "0 12px 32px rgba(43,29,16,0.1), 0 3px 0 rgba(43,29,16,0.06)",
            }}
          >
            {g.content}
          </div>
          <div
            className="mt-4 text-[11px] font-bold"
            style={{ color: paper.inkSoft }}
          >
            &#8593; swipe up for next
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Stat card ─── */

function StatCard({
  value,
  label,
  color,
  delay,
}: {
  value: string;
  label: string;
  color: string;
  delay: number;
}) {
  return (
    <FadeUp delay={delay}>
      <div className="text-center">
        <div
          className="font-display text-5xl font-black leading-none md:text-6xl"
          style={{ color }}
        >
          {value}
        </div>
        <p
          className="mt-2 font-body text-sm font-semibold"
          style={{ color: paper.inkSoft }}
        >
          {label}
        </p>
      </div>
    </FadeUp>
  );
}

/* ─── Feature row ─── */

function FeatureRow({
  icon,
  title,
  desc,
  color,
  delay,
}: {
  icon: string;
  title: string;
  desc: string;
  color: string;
  delay: number;
}) {
  return (
    <FadeUp delay={delay} className="flex items-start gap-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>
      <div>
        <h3
          className="font-display text-lg font-black"
          style={{ color: paper.ink }}
        >
          {title}
        </h3>
        <p
          className="mt-1 font-body text-sm font-semibold leading-relaxed"
          style={{ color: paper.inkSoft }}
        >
          {desc}
        </p>
      </div>
    </FadeUp>
  );
}

/* ─── Two-sides card ─── */

function SideCard({
  audience,
  headline,
  items,
  color,
  bgColor,
  icon,
  dark = false,
}: {
  audience: string;
  headline: string;
  items: string[];
  color: string;
  bgColor: string;
  icon: string;
  dark?: boolean;
}) {
  const textColor = dark ? "#fff" : paper.ink;
  const subColor = dark ? "rgba(255,255,255,0.8)" : paper.ink;
  const labelColor = dark ? "rgba(255,255,255,0.7)" : color;
  return (
    <div
      className="flex-1 rounded-3xl p-7"
      style={{
        background: bgColor,
        boxShadow: dark
          ? "0 12px 32px rgba(0,0,0,0.2)"
          : "0 12px 32px rgba(43,29,16,0.08)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span
          className="font-display text-[10px] font-black uppercase tracking-[0.24em]"
          style={{ color: labelColor }}
        >
          {audience}
        </span>
      </div>
      <h3
        className="mb-5 font-display text-2xl font-black leading-tight md:text-3xl"
        style={{ color: textColor }}
      >
        {headline}
      </h3>
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-black text-white"
              style={{ background: color }}
            >
              {i + 1}
            </span>
            <span
              className="pt-0.5 font-body text-sm font-semibold leading-snug"
              style={{ color: subColor }}
            >
              {item}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════ */

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOp = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <main
      className="relative min-h-dvh w-full overflow-x-hidden"
      style={{ background: paper.bg, color: paper.ink }}
    >
      {/* Global paper grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            `radial-gradient(circle at 20% 30%, rgba(43,29,16,0.04) 0%, transparent 40%)`,
            `radial-gradient(circle at 80% 70%, rgba(43,29,16,0.03) 0%, transparent 40%)`,
          ].join(", "),
        }}
      />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: `${paper.bg}ee` }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1
            className="font-display text-2xl leading-none"
            style={{ fontWeight: 900, letterSpacing: "-0.03em" }}
          >
            Fun
            <span style={{ fontStyle: "italic", color: paper.math.lo }}>
              Feed.
            </span>
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/feed"
              className="font-body text-sm font-bold transition-opacity hover:opacity-70"
              style={{ color: paper.inkSoft }}
            >
              Live demo
            </Link>
            <Link href="/start">
              <PaperButton variant="ink" size="sm">
                Try it free
              </PaperButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div ref={heroRef}>
        <Section className="pb-20 pt-12 md:pb-28 md:pt-20">
          <motion.div
            style={{ y: heroY, opacity: heroOp }}
            className="flex flex-col items-center gap-12 md:flex-row md:items-center md:gap-16"
          >
            {/* Left copy */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className="mb-5 inline-flex items-center rounded-full px-4 py-1.5 font-display text-[10px] font-black uppercase tracking-[0.28em]"
                  style={{ background: paper.ink, color: "#fff" }}
                >
                  HackPrinceton Spring &apos;26
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-5xl font-black leading-[0.95] md:text-7xl"
                style={{ letterSpacing: "-0.04em" }}
              >
                If you can&apos;t beat
                <br />
                the feed —{" "}
                <span className="text-gradient-math">
                  teach
                  <br />
                  through it.
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mx-auto mt-6 max-w-md font-body text-lg font-semibold leading-relaxed md:mx-0"
                style={{ color: paper.inkSoft }}
              >
                A scrolling feed of bite-size learning games — math, reading, science — that adapts in real time to each student. Turning passive screen time into active learning.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:items-start"
              >
                <Link href="/start">
                  <PaperButton variant="primary" subject="math" size="lg">
                    Start scrolling
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </PaperButton>
                </Link>
                <Link href="/feed">
                  <PaperButton variant="ghost" size="lg">
                    Watch demo
                  </PaperButton>
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-5 font-body text-xs font-semibold italic"
                style={{ color: paper.inkSoft }}
              >
                Built with Claude &middot; Next.js &middot; TypeScript
              </motion.p>
            </div>

            {/* Right phone */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex-shrink-0"
            >
              {/* Floating stickers */}
              <motion.div
                className="absolute -left-10 -top-6 z-10"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <PaperSticker tone="math" rot={-12} size={52}>
                  <span className="text-xl">&#x1F4D0;</span>
                </PaperSticker>
              </motion.div>
              <motion.div
                className="absolute -right-8 top-24 z-10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <PaperSticker tone="english" rot={8} size={48}>
                  <span className="text-lg">&#x1F4DA;</span>
                </PaperSticker>
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -left-6 z-10"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <PaperSticker tone="science" rot={-6} size={48}>
                  <span className="text-lg">&#x1F52C;</span>
                </PaperSticker>
              </motion.div>

              <PhoneMockup />
            </motion.div>
          </motion.div>
        </Section>
      </div>

      {/* ── STATS STRIP ── */}
      <Section className="py-16" id="stats">
        <div
          className="rounded-3xl px-8 py-10"
          style={{
            background: "#fff",
            boxShadow:
              "0 18px 50px rgba(43,29,16,0.08), 0 3px 0 rgba(43,29,16,0.04)",
          }}
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCard value="75%" label="of school leaders report focus issues" color={paper.math.lo} delay={0} />
            <StatCard value="12" label="bite-size game templates" color={paper.english.hi} delay={0.1} />
            <StatCard value="3" label="subjects — math, english, science" color={paper.science.hi} delay={0.2} />
            <StatCard value="K–5" label="grades, all skill levels" color={paper.ink} delay={0.3} />
          </div>
        </div>
      </Section>

      {/* ── THE PROBLEM ── */}
      <Section className="py-20" id="problem">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <FadeUp>
              <SectionLabel>01 &middot; The Problem</SectionLabel>
              <h2 className="font-display text-4xl font-black leading-[1.05] md:text-5xl">
                Students can&apos;t focus.
              </h2>
              <p
                className="mt-4 font-body text-base font-semibold leading-relaxed"
                style={{ color: paper.inkSoft }}
              >
                Traditional teaching can&apos;t compete with TikTok. Attention spans are shrinking. Classrooms still look the same as 20 years ago while the content kids consume has completely changed.
              </p>
            </FadeUp>
          </div>

          <FadeUp delay={0.15}>
            <div className="space-y-4">
              {[
                {
                  icon: "&#128241;",
                  title: "Endless scroll",
                  sub: "infinite stimulation",
                  color: paper.math.lo,
                },
                {
                  icon: "&#9889;",
                  title: "Instant feedback",
                  sub: "dopamine on tap",
                  color: paper.math.hi,
                },
                {
                  icon: "&#129513;",
                  title: "Personalized",
                  sub: "knows what you like",
                  color: paper.english.hi,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-2xl p-4"
                  style={{
                    background: "#fff",
                    borderLeft: `4px solid ${item.color}`,
                    boxShadow: "0 4px 16px rgba(43,29,16,0.06)",
                  }}
                >
                  <span
                    className="text-2xl"
                    dangerouslySetInnerHTML={{ __html: item.icon }}
                  />
                  <div>
                    <div
                      className="font-display text-base font-black"
                      style={{ color: paper.ink }}
                    >
                      {item.title}
                    </div>
                    <div
                      className="font-body text-xs font-semibold italic"
                      style={{ color: paper.inkSoft }}
                    >
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
              <p
                className="pt-2 text-center font-display text-[10px] font-black uppercase tracking-[0.2em]"
                style={{ color: paper.inkSoft }}
              >
                What kids get online
              </p>
            </div>
          </FadeUp>
        </div>
      </Section>

      {/* ── THE SOLUTION ── */}
      <Section className="py-20" id="solution">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div>
            <FadeUp>
              <SectionLabel>02 &middot; The Solution</SectionLabel>
              <h2 className="font-display text-4xl font-black leading-[1.05] md:text-5xl">
                Teach through
                <br />
                <span className="text-gradient-math">the feed.</span>
              </h2>
            </FadeUp>

            <div className="mt-8 space-y-6">
              <FeatureRow
                icon="&#127918;"
                title="12 bite-size game templates"
                desc="Math, English & Science — from 2048-style merge math to pixel-art RPG quizzes."
                color={paper.math.hi}
                delay={0.1}
              />
              <FeatureRow
                icon="&#129504;"
                title="AI-generated on demand"
                desc="Claude creates fresh, standards-aligned games tailored to each student."
                color={paper.english.hi}
                delay={0.2}
              />
              <FeatureRow
                icon="&#9889;"
                title="Adaptive in real time"
                desc="Difficulty and subject auto-adjust based on every answer — weak spots get more reps."
                color={paper.science.hi}
                delay={0.3}
              />
            </div>
          </div>

          {/* Game type grid */}
          <FadeUp delay={0.2}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "MergeMath", emoji: "&#129518;", subject: "math" as const },
                { name: "WordBuilder", emoji: "&#128221;", subject: "english" as const },
                { name: "QuickSort", emoji: "&#9201;", subject: "science" as const },
                { name: "MathCastle", emoji: "&#127984;", subject: "math" as const },
                { name: "Hangman", emoji: "&#128100;", subject: "english" as const },
                { name: "WizardDungeon", emoji: "&#129497;", subject: "science" as const },
                { name: "FractionGolf", emoji: "&#9971;", subject: "math" as const },
                { name: "GrammarQuest", emoji: "&#128220;", subject: "english" as const },
                { name: "Sequence", emoji: "&#128290;", subject: "science" as const },
              ].map((g, i) => (
                <motion.div
                  key={g.name}
                  className="flex flex-col items-center gap-2 rounded-2xl p-4"
                  style={{
                    background: paper[g.subject].tint,
                    border: `2px solid ${paper[g.subject].hi}20`,
                  }}
                  whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span
                    className="text-2xl"
                    dangerouslySetInnerHTML={{ __html: g.emoji }}
                  />
                  <span
                    className="text-center font-display text-[10px] font-black leading-tight"
                    style={{ color: paper[g.subject].ink }}
                  >
                    {g.name}
                  </span>
                </motion.div>
              ))}
            </div>
            <p
              className="mt-4 text-center font-body text-xs font-semibold"
              style={{ color: paper.inkSoft }}
            >
              ...and more. Every game AI-generated fresh.
            </p>
          </FadeUp>
        </div>
      </Section>

      {/* ── TWO SIDES ── */}
      <Section className="py-20" id="how">
        <FadeUp>
          <div className="mb-10 text-center">
            <SectionLabel>03 &middot; How it works</SectionLabel>
            <h2 className="font-display text-4xl font-black leading-[1.05] md:text-5xl">
              Two sides. <span className="text-gradient-math">One loop.</span>
            </h2>
          </div>
        </FadeUp>

        <div className="flex flex-col gap-6 md:flex-row">
          <FadeUp delay={0.1} className="flex-1">
            <SideCard
              audience="For Students"
              headline="Scroll. Play. Learn."
              items={[
                "Infinite vertical feed — one mini-game per swipe",
                "Earn points, build streaks, unlock harder levels",
                "Built-in 10-min screen-time limit keeps it healthy",
              ]}
              color={paper.math.hi}
              bgColor="#1a7a8a"
              icon="&#127891;"
              dark
            />
          </FadeUp>
          <FadeUp delay={0.25} className="flex-1">
            <SideCard
              audience="For Teachers"
              headline="See what's sticking."
              items={[
                "Class leaderboard — motivate & celebrate progress",
                "Struggle report — see which questions students miss",
                "Class-code login, no account setup required",
              ]}
              color={paper.math.hi}
              bgColor="#fff"
              icon="&#128202;"
            />
          </FadeUp>
        </div>

        <FadeUp delay={0.35}>
          <p
            className="mt-8 text-center font-body text-sm font-semibold italic"
            style={{ color: paper.inkSoft }}
          >
            Students get the engagement of TikTok. Teachers get the insights of a dashboard.
          </p>
        </FadeUp>
      </Section>

      {/* ── CTA ── */}
      <Section className="py-20" id="cta">
        <FadeUp>
          <div
            className="relative overflow-hidden rounded-[32px] px-8 py-16 text-center md:px-16"
            style={{
              background: `linear-gradient(145deg, #1a7a8a 0%, #145f6c 100%)`,
            }}
          >
            {/* Decorative blobs */}
            <div
              className="absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-20"
              style={{ background: paper.science.hi }}
            />
            <div
              className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-15"
              style={{ background: paper.math.hi }}
            />

            <div className="relative z-10">
              <h2
                className="font-display text-4xl font-black leading-[1.05] md:text-5xl"
                style={{ color: "#fff" }}
              >
                Let&apos;s see it live.
              </h2>
              <p
                className="mx-auto mt-4 max-w-md font-display text-lg font-semibold italic"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Fun Feed — Learning made fun.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link href="/feed">
                  <PaperButton variant="primary" subject="math" size="lg">
                    Demo time
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </PaperButton>
                </Link>
                <Link href="/start">
                  <PaperButton
                    variant="ghost"
                    size="lg"
                    style={{
                      color: "#fff",
                      borderColor: "rgba(255,255,255,0.4)",
                    }}
                  >
                    Enter class code
                  </PaperButton>
                </Link>
              </div>

              <p
                className="mt-8 font-body text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                HackPrinceton Spring &apos;26 &middot; Built with Claude
              </p>
            </div>
          </div>
        </FadeUp>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="py-10 text-center">
        <h2
          className="font-display text-xl leading-none"
          style={{ fontWeight: 900, letterSpacing: "-0.03em" }}
        >
          Fun
          <span style={{ fontStyle: "italic", color: paper.math.lo }}>
            Feed.
          </span>
        </h2>
        <p
          className="mt-2 font-body text-xs font-semibold"
          style={{ color: paper.inkSoft }}
        >
          Safe &middot; Ad-free &middot; Teacher-approved
        </p>
      </footer>
    </main>
  );
}
