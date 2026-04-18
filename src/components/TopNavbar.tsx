"use client";

interface Props {
  activeTab?: "following" | "for-you";
  onReset?: () => void;
}

export function TopNavbar({ activeTab = "for-you", onReset }: Props) {
  return (
    <header className="relative z-40 flex h-[50px] w-full flex-shrink-0 items-center justify-between px-5 text-white [text-shadow:0_0_2px_rgb(0_0_0/0.6)]">
      {/* Left: TV / live icon */}
      <button
        type="button"
        aria-label="Live"
        className="text-white/90 transition-opacity hover:opacity-70"
      >
        <TvIcon />
      </button>

      {/* Center: Following | For You */}
      <nav className="flex items-center gap-5 text-sm font-medium">
        <Tab label="Following" active={activeTab === "following"} />
        <span className="text-white/60">|</span>
        <Tab label="For You" active={activeTab === "for-you"} />
      </nav>

      {/* Right: reset (stand-in for search) */}
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

function Tab({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`relative ${active ? "font-bold" : "font-medium text-white/85"}`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-1.5 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-white" />
      )}
    </span>
  );
}

function TvIcon() {
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
      <rect x="2" y="7" width="20" height="13" rx="2" />
      <path d="m7 4 5 3 5-3" />
    </svg>
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
