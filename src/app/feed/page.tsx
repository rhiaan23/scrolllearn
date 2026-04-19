"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameCard } from "@/components/GameCard";
import { AmbientBg } from "@/components/AmbientBg";
import { TopNavbar } from "@/components/TopNavbar";
import { StudentOnboarding } from "@/components/StudentOnboarding";
import type { Game } from "@/lib/schema";
import { Game as GameSchema } from "@/lib/schema";
import { nextRequestParams, useScrollLearn } from "@/lib/store";

const PREFETCH_AHEAD = 3; // keep this many games ready beyond the visible one

export default function FeedPage() {
  const [games, games_set] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false); // prevent concurrent fetch loops
  const loadedIdsRef = useRef<string[]>([]);
  const pendingAdvanceRef = useRef(false); // user advanced from last card; scroll forward as soon as a new card lands
  const containerRef = useRef<HTMLDivElement>(null);
  const reset = useScrollLearn((s) => s.reset);
  const classCode = useScrollLearn((s) => s.classCode);
  const studentId = useScrollLearn((s) => s.studentId);

  // Show onboarding once on first visit if not yet enrolled. Lazy init from
  // current store state avoids a cascading setState inside useEffect.
  const [showOnboarding, setShowOnboarding] = useState(
    () => classCode === undefined && studentId === undefined,
  );

  const fetchOne = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const base = nextRequestParams();
      // Build the avoid list with newest entries always at the END, so the
      // server's adjacency-window check (`slice(-N)`) always sees the
      // most-recently-loaded games. Without this, a game that was both
      // previously played AND just-loaded would get dedup'd into the older
      // half and the server would miss it as "recent."
      const recentLoaded = loadedIdsRef.current.slice(-12);
      const recentSet = new Set(recentLoaded);
      const olderPlayed = base.avoid.filter((id) => !recentSet.has(id)).slice(-12);
      const avoid = [...olderPlayed, ...recentLoaded];
      const res = await fetch("/api/games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...base, avoid }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      const parsed = GameSchema.safeParse(json.game);
      if (!parsed.success) {
        throw new Error("invalid game shape from server");
      }
      games_set((g) => {
        loadedIdsRef.current = [...loadedIdsRef.current, parsed.data.id].slice(-32);
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

  // Initial load: fetch a starter handful
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
  }, [fetchOne]);

  // Watch the scroll position; when the user is near the end, prefetch more.
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

  // Keep the buffer topped up: whenever a fetch completes (games.length grows)
  // and we're still below the target buffer at the current scroll position,
  // fire another fetch. Single-flight via fetchingRef.
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
      // No next card yet — kick off a fetch and queue an auto-scroll so the
      // feed catches up the moment the new card lands.
      pendingAdvanceRef.current = true;
      fetchOne();
      return;
    }
    const target = (visibleIndex + 1) * el.clientHeight;
    el.scrollTo({ top: target, behavior: "smooth" });
  }

  // When games.length grows AND the user already asked to advance off the
  // last card, scroll forward and clear the pending flag.
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
    <div className="relative flex h-dvh w-screen flex-col overflow-hidden bg-black">
      {/* Cheap CSS-only mouse-reactive backdrop (z-0, behind everything). */}
      <AmbientBg />

      {showOnboarding && <StudentOnboarding onDone={() => setShowOnboarding(false)} />}
      <TopNavbar activeTab="student" onReset={reset} />

      <div
        ref={containerRef}
        className="snap-y snap-mandatory relative z-10 flex-1 overflow-y-scroll"
      >
        {games.map((g, i) => (
          <GameCard
            key={`${i}-${g.id}`}
            game={g}
            index={i}
            onAdvance={advance}
          />
        ))}

        {(games.length === 0 || loading || error) && (
          <div className="flex h-full w-full snap-start snap-always items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 text-white">
              {error ? (
                <>
                  <div className="text-5xl">⚠️</div>
                  <p className="max-w-xs text-center text-sm text-red-300">{error}</p>
                  <button
                    type="button"
                    onClick={fetchOne}
                    className="rounded-full bg-white/15 px-5 py-2 text-sm font-bold hover:bg-white/25"
                  >
                    Try again
                  </button>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                  <p className="text-sm font-medium text-white/70">
                    {games.length === 0 ? "Cooking up your first game…" : "Loading next…"}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
