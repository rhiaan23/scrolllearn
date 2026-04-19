"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameCard } from "@/components/GameCard";
import { TopNavbar } from "@/components/TopNavbar";
import { ScreenTimeGate } from "@/components/ScreenTimeGate";
import { PaperButton } from "@/components/paper/PaperButton";
import { paper } from "@/lib/theme";
import type { Game, Subject } from "@/lib/schema";
import { Game as GameSchema } from "@/lib/schema";
import { nextRequestParams, useScrollLearn } from "@/lib/store";

const TABS: ReadonlyArray<{ key: "all" | Subject; label: string; subject: Subject | null }> = [
  { key: "all", label: "All", subject: null },
  { key: "math", label: "Math", subject: "math" },
  { key: "english", label: "English", subject: "english" },
  { key: "science", label: "Science", subject: "science" },
];

const PREFETCH_AHEAD = 3;

export default function FeedPage() {
  const [games, games_set] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinnedSubject, setPinnedSubject] = useState<Subject | null>(null);
  const pinnedSubjectRef = useRef<Subject | null>(null);
  const [tabKey, setTabKey] = useState(0);
  const fetchingRef = useRef(false);
  const loadedIdsRef = useRef<string[]>([]);
  const recentTemplatesRef = useRef<string[]>([]);
  const pendingAdvanceRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reset = useScrollLearn((s) => s.reset);

  const fetchOne = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const base = nextRequestParams();
      const subject = pinnedSubjectRef.current ?? base.subject;
      const difficulty = base.difficulty;
      const recentLoaded = loadedIdsRef.current.slice(-12);
      const recentSet = new Set(recentLoaded);
      const olderPlayed = base.avoid.filter((id) => !recentSet.has(id)).slice(-12);
      const avoid = [...olderPlayed, ...recentLoaded];
      const res = await fetch("/api/games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          difficulty,
          avoid,
          avoidTemplates: recentTemplatesRef.current,
          strictSubject: pinnedSubjectRef.current !== null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      const parsed = GameSchema.safeParse(json.game);
      if (!parsed.success) {
        throw new Error("invalid game shape from server");
      }
      games_set((g) => {
        loadedIdsRef.current = [...loadedIdsRef.current, parsed.data.id].slice(-32);
        recentTemplatesRef.current = [...recentTemplatesRef.current, parsed.data.template].slice(
          -2,
        );
        return [...g, parsed.data];
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "failed to load game";
      setError(msg);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  function handleTabChange(s: Subject | null) {
    setPinnedSubject(s);
    pinnedSubjectRef.current = s;
    games_set([]);
    loadedIdsRef.current = [];
    recentTemplatesRef.current = [];
    setTabKey((k) => k + 1);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 0; i < PREFETCH_AHEAD; i++) {
        if (cancelled) return;
        await fetchOne();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchOne, tabKey]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const visibleIndex = Math.round(el.scrollTop / el.clientHeight);
      const remaining = games.length - 1 - visibleIndex;
      if (remaining < PREFETCH_AHEAD) {
        fetchOne();
      }
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [games.length, fetchOne]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const visibleIndex = Math.round(el.scrollTop / el.clientHeight);
    const remaining = games.length - 1 - visibleIndex;
    if (remaining < PREFETCH_AHEAD) {
      fetchOne();
    }
  }, [games.length, fetchOne]);

  function advance() {
    const el = containerRef.current;
    if (!el) return;
    const visibleIndex = Math.round(el.scrollTop / el.clientHeight);
    if (visibleIndex >= games.length - 1) {
      pendingAdvanceRef.current = true;
      fetchOne();
      return;
    }
    const target = (visibleIndex + 1) * el.clientHeight;
    el.scrollTo({ top: target, behavior: "smooth" });
  }

  useEffect(() => {
    if (!pendingAdvanceRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const visibleIndex = Math.round(el.scrollTop / el.clientHeight);
    if (visibleIndex < games.length - 1) {
      el.scrollTo({ top: (visibleIndex + 1) * el.clientHeight, behavior: "smooth" });
      pendingAdvanceRef.current = false;
    }
  }, [games.length]);

  return (
    <div
      className="relative flex h-dvh w-screen flex-col overflow-hidden"
      style={{ background: paper.bg }}
    >
      <TopNavbar activeTab="student" onReset={reset} />

      <ScreenTimeGate>
        {/* Subject category pill tabs */}
        <div
          className="relative z-20 flex gap-2 overflow-x-auto px-4 py-3"
          style={{
            background: paper.bg,
            borderBottom: `1.5px dashed ${paper.ink}22`,
          }}
        >
          {TABS.map(({ key, label, subject }) => {
            const isActive = pinnedSubject === subject;
            const p = subject ? paper[subject] : null;
            const bg = isActive
              ? p
                ? `linear-gradient(145deg, ${p.hi} 0%, ${p.lo} 100%)`
                : paper.ink
              : "transparent";
            const color = isActive ? "#FFFFFF" : paper.ink;
            const border = isActive
              ? "2px solid transparent"
              : `1.5px dashed ${paper.ink}55`;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTabChange(subject)}
                className="shrink-0 rounded-full px-4 py-1.5 font-display text-[13px] font-extrabold tracking-tight transition-transform active:scale-95"
                style={{
                  background: bg,
                  color,
                  border,
                  boxShadow: isActive ? "0 3px 0 rgba(43,29,16,0.12)" : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div
          ref={containerRef}
          className="snap-y snap-mandatory relative z-10 flex-1 overflow-y-scroll"
        >
          {games.map((g, i) => (
            <GameCard key={`${i}-${g.id}`} game={g} index={i} onAdvance={advance} />
          ))}

          {(games.length === 0 || loading || error) && (
            <div
              className="flex h-full w-full snap-start snap-always items-center justify-center px-6"
              style={{ background: paper.bg }}
            >
              <div className="flex flex-col items-center gap-4">
                {error ? (
                  <>
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full font-display text-2xl font-black"
                      style={{
                        background: "#FFFFFF",
                        border: `3px solid ${paper.math.lo}`,
                        color: paper.math.lo,
                        transform: "rotate(-6deg)",
                        boxShadow: "0 8px 16px rgba(43,29,16,0.14)",
                      }}
                    >
                      !
                    </div>
                    <p
                      className="max-w-xs text-center font-body text-sm font-semibold"
                      style={{ color: paper.ink }}
                    >
                      {error}
                    </p>
                    <PaperButton variant="primary" subject="math" onClick={fetchOne}>
                      Try again
                    </PaperButton>
                  </>
                ) : (
                  <>
                    <div
                      className="h-12 w-12 animate-spin rounded-full"
                      style={{
                        border: `4px solid ${paper.ink}22`,
                        borderTopColor: paper.math.lo,
                      }}
                    />
                    <p
                      className="font-body text-sm font-semibold"
                      style={{ color: paper.inkSoft }}
                    >
                      {games.length === 0 ? "Cutting out your first card…" : "Loading next…"}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </ScreenTimeGate>
    </div>
  );
}
