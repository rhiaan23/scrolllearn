"use client";

import { useEffect, useRef } from "react";

/**
 * Cheap, mouse-reactive page backdrop.
 *
 * - One absolutely-positioned `<div>` with a radial gradient
 * - `mousemove` writes pixel coords to `--mx` / `--my` CSS variables on the
 *   div itself (one rAF-throttled write per frame)
 * - The browser GPU-composites the gradient — no canvas, no WebGL, no shader
 *   compile, no per-pixel math. Cost is essentially zero.
 *
 * Replaces the previous WebGL ShaderWallpaper which was killing the framerate.
 */
export function AmbientBg() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let pendingX = 50;
    let pendingY = 50;

    function onMove(e: MouseEvent) {
      pendingX = (e.clientX / window.innerWidth) * 100;
      pendingY = (e.clientY / window.innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(flush);
    }
    function flush() {
      const el = ref.current;
      if (el) {
        el.style.setProperty("--mx", `${pendingX}%`);
        el.style.setProperty("--my", `${pendingY}%`);
      }
      raf = 0;
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: [
          // Static base gradient — slight cool tint from top.
          "linear-gradient(180deg, #0b0d14 0%, #050609 60%, #000000 100%)",
          // Mouse-following soft glow.
          "radial-gradient(circle 600px at var(--mx, 50%) var(--my, 50%), rgba(99, 102, 241, 0.18), transparent 60%)",
        ].join(", "),
      }}
    />
  );
}
