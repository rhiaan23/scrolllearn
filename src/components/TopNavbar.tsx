"use client";

import Link from "next/link";

interface Props {
  activeTab: "teacher" | "student";
  onReset?: () => void;
}

export function TopNavbar({ activeTab, onReset }: Props) {
  return (
    <header className="relative z-40 flex h-[50px] w-full flex-shrink-0 items-center justify-between px-5 text-white [text-shadow:0_0_2px_rgb(0_0_0/0.6)]">
      {/* Left: spacer to balance reset button */}
      <div className="w-8" />

      {/* Center: Teacher | Student */}
      <nav className="flex items-center gap-5 text-sm font-medium">
        <Tab label="Teacher" href="/teacher" active={activeTab === "teacher"} />
        <span className="text-white/60">|</span>
        <Tab label="Student" href="/feed" active={activeTab === "student"} />
      </nav>

      {/* Right: reset */}
      <button
        type="button"
        aria-label="Reset progress"
        onClick={() => {
          if (!onReset) return;
          if (confirm("Reset your progress?")) onReset();
        }}
        className="text-white/90 transition-opacity hover:opacity-70"
      >
        <ResetIcon />
      </button>
    </header>
  );
}

function Tab({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative ${active ? "font-bold text-white" : "font-medium text-white/75 hover:text-white/95"}`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-1.5 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-white" />
      )}
    </Link>
  );
}

function ResetIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
