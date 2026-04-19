"use client";

import Link from "next/link";
import { paper } from "@/lib/theme";
import { Icon } from "./paper/Icon";

interface Props {
  activeTab: "teacher" | "student";
  onReset?: () => void;
}

export function TopNavbar({ activeTab, onReset }: Props) {
  return (
    <header
      className="relative z-40 flex h-[58px] w-full flex-shrink-0 items-center justify-between px-5"
      style={{
        background: paper.bg,
        borderBottom: `1.5px dashed ${paper.ink}22`,
      }}
    >
      {/* Left: Teacher / Student tabs */}
      <nav className="flex items-center gap-4 font-body text-[13px]">
        <Tab label="Teacher" href="/teacher" active={activeTab === "teacher"} />
        <Tab label="Student" href="/feed" active={activeTab === "student"} />
      </nav>

      {/* Center: FunFeed wordmark */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[22px] font-black leading-none"
        style={{ letterSpacing: "-0.04em", color: paper.ink }}
      >
        Fun
        <span style={{ fontStyle: "italic", color: paper.math.lo }}>Feed</span>
      </div>

      {/* Right: reset */}
      <button
        type="button"
        aria-label="Reset progress"
        onClick={() => {
          if (!onReset) return;
          if (confirm("Reset your progress?")) onReset();
        }}
        className="transition-opacity hover:opacity-70"
        style={{ color: paper.inkSoft }}
      >
        <Icon name="reset" size={18} />
      </button>
    </header>
  );
}

function Tab({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="relative font-extrabold transition-colors"
      style={{
        color: active ? paper.ink : paper.inkSoft,
        letterSpacing: "-0.01em",
      }}
    >
      {label}
      {active && (
        <span
          className="absolute -bottom-1.5 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full"
          style={{ background: paper.math.lo }}
        />
      )}
    </Link>
  );
}
