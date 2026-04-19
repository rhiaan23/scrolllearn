"use client";

import type { CSSProperties } from "react";

interface Props {
  /** Slug of a pixelarticons icon (e.g. "target", "castle", "clock"). */
  name: string;
  size?: number;
  color?: string;
  className?: string;
  title?: string;
}

/**
 * Renders a pixelarticons SVG from /public/sprites/pa/ as a CSS mask so it
 * can be colored via the `color` prop. Crisp-pixel rendering is enforced.
 */
export function PixelIcon({
  name,
  size = 20,
  color = "currentColor",
  className = "",
  title,
}: Props) {
  const url = `/sprites/pa/${name}.svg`;
  const style: CSSProperties = {
    width: size,
    height: size,
    backgroundColor: color,
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    display: "inline-block",
    flexShrink: 0,
    imageRendering: "pixelated",
  };
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      style={style}
    />
  );
}
