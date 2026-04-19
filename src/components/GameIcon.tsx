"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  emoji: string;
  alt?: string;
  size?: number;
  className?: string;
}

const TWEMOJI_VERSION = "14.0.2";

/**
 * Convert an emoji string to its Twemoji SVG codepoint URL.
 * Strips U+FE0F (variation selector-16) since Twemoji filenames omit it.
 */
function emojiToTwemojiUrl(emoji: string): string {
  const codepoints = Array.from(emoji)
    .map((c) => c.codePointAt(0)!.toString(16))
    .filter((cp) => cp !== "fe0f")
    .join("-");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@${TWEMOJI_VERSION}/assets/svg/${codepoints}.svg`;
}

/**
 * Renders an emoji as a Twemoji SVG sprite, with a graceful fallback to the
 * native OS emoji glyph when the SVG 404s (Twemoji 14 doesn't cover every newer
 * codepoint, e.g. some Emoji 15+ additions).
 *
 */
export function GameIcon({ emoji, alt, size = 64, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={alt ?? emoji}
        className={`inline-flex items-center justify-center leading-none drop-shadow-md ${className}`}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.85) }}
      >
        {emoji}
      </span>
    );
  }

  return (
    <Image
      src={emojiToTwemojiUrl(emoji)}
      alt={alt ?? emoji}
      width={size}
      height={size}
      unoptimized
      onError={() => setFailed(true)}
      className={`drop-shadow-md ${className}`}
    />
  );
}
