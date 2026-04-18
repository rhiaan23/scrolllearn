"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameCard } from "@/components/GameCard";
import { HUD } from "@/components/HUD";
import type { Game } from "@/lib/schema";
import { Game as GameSchema } from "@/lib/schema";
import { nextRequestParams } from "@/lib/store";

const PREFETCH_AHEAD = 3; // keep this many games ready beyond the visible one

export default function FeedPage() {
  const [games, games_set] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchingRef = useRef(false); // prevent concurrent fetch loops
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchOne = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const params = nextRequestParams();
      const res = await fetch("/api/games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      const parsed = GameSchema.safeParse(json.game);
      if (!parsed.success) {
        throw new Error("invalid game shape from server");
      }
      games_set((g) => {
        if (g.find((x) => x.id === parsed.data.id)) return g; // dedupe
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

  function advance() {
    const el = containerRef.current;
    if (!el) return;
    const visibleIndex = Math.round(el.scrollTop / el.clientHeight);
    const target = (visibleIndex + 1) * el.clientHeight;
    el.scrollTo({ top: target, behavior: "smooth" });
  }

  return (
    <>
      <HUD />
      <div
        ref={containerRef}
        className="h-screen w-screen snap-y snap-mandatory overflow-y-scroll bg-black"
      >
        {games.map((g, i) => (
          <GameCard
            key={g.id}
            game={g}
            index={i}
            onAdvance={i < games.length - 1 ? advance : undefined}
          />
        ))}

        {/* Loading / error pad — also acts as a snap target so scroll-snap behaves */}
        {(games.length === 0 || loading || error) && (
          <section className="flex h-screen w-full snap-start snap-always items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
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
          </section>
        )}
      </div>
    </>
  );
}
