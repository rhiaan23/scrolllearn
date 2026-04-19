/**
 * Maps common emoji codepoints to pixelarticons slugs so AI-generated emoji
 * content can be rendered as pixel art instead. Returns null when no mapping
 * exists — callers should fall back to a text label.
 *
 * All slugs below are verified against /public/sprites/pa/ (pixelarticons v2.1).
 */

const MAP: Record<string, string> = {
  // Targets / awards
  "🎯": "target",
  "🏆": "trophy",
  "🥇": "trophy",
  "🥈": "trophy",
  "🥉": "trophy",
  "⭐": "sparkles",
  "🌟": "sparkles",
  "✨": "sparkles",

  // Time
  "⏱": "clock",
  "⏰": "alarm-clock",
  "⌛": "clock",
  "⏳": "clock",

  // Power / feedback
  "⚡": "zap",
  "🔥": "fire",
  "💥": "zap",
  "💣": "skull",
  "☠️": "skull",
  "💀": "skull",
  "❤️": "heart",
  "💖": "heart",
  "💗": "heart",
  "💕": "heart",
  "💔": "heart",

  // Places / structures
  "🏰": "castle",
  "🏯": "castle",
  "🏠": "home",
  "🏡": "home",
  "🏢": "building",
  "🏣": "building",
  "🏥": "building",
  "🏦": "building",
  "🏨": "hotel-bed",
  "🌆": "building-community",
  "🌇": "building-community",
  "🗺": "map-pin",
  "🗺️": "map-pin",
  "⛩": "castle",

  // Nature
  "🌲": "tree-pine",
  "🌳": "tree",
  "🌴": "tree",
  "🍀": "leaf",
  "🌱": "leaf",
  "🌿": "leaf",
  "🍃": "leaf",
  "🌻": "leaf",
  "🌹": "leaf",
  "🌸": "leaf",
  "🌼": "leaf",
  "🌺": "leaf",
  "🌞": "cloud-sun",
  "☀️": "cloud-sun",
  "🌙": "moon",
  "☁️": "cloud",
  "⛅": "cloud-sun",
  "🌧": "cloud",
  "⛈": "cloud",
  "❄️": "cloud",
  "🌈": "sparkles",

  // Creatures
  "🐟": "fish",
  "🐠": "fish",
  "🐡": "fish",
  "🦈": "fish",
  "🐳": "fish",
  "🐋": "fish",
  "🦀": "fish",
  "🦑": "fish",
  "🐙": "fish",
  "🐛": "bug",
  "🐜": "bug",
  "🐝": "bug",
  "🐞": "bug",
  "🦋": "bug",
  "🕷": "bug",

  // Tools / objects
  "📖": "book-open",
  "📚": "book-open",
  "📘": "book-open",
  "📕": "book-open",
  "📓": "notebook",
  "📝": "notes",
  "✏️": "pen-square",
  "🖊": "pen-square",
  "🎨": "brush",
  "🖌": "brush",
  "🪄": "magic-edit",
  "🔮": "globe",
  "⚔️": "sword",
  "🗡": "sword",
  "🛡": "shield",
  "👑": "crown",
  "💎": "diamond-gem",
  "💰": "coins",
  "💵": "money",
  "💴": "money",
  "💶": "money",
  "💷": "money",
  "🪙": "coins",
  "🎁": "gift",
  "🎈": "balloon",
  "🎵": "music",
  "🎶": "music",
  "🎤": "mic",
  "📷": "camera",
  "📸": "camera",
  "🕹": "gamepad",
  "🎮": "gamepad",
  "🎲": "chess",
  "♟": "chess",
  "🧪": "potion",
  "🧴": "potion",
  "💡": "lightbulb",
  "🔦": "lightbulb",
  "🔋": "battery-full",
  "🎒": "handbag",
  "👜": "handbag",
  "💼": "briefcase",
  "🎭": "frown",

  // Vehicles
  "🚗": "car",
  "🚙": "car",
  "🚕": "car",
  "🚓": "car",
  "🚌": "bus",
  "🚎": "bus",
  "🚑": "bus",
  "🚒": "bus",
  "🚚": "truck",
  "🚛": "truck",
  "🚢": "ship",
  "⛵": "ship",
  "🚂": "bus",
  "🚆": "bus",

  // Misc
  "🌍": "globe",
  "🌎": "globe",
  "🌏": "globe",
  "🏁": "flag",
  "🚩": "flag",
  "🔔": "bell",
  "👀": "eye",
  "👁": "eye",
  "💭": "message",
  "💬": "message",
  "📞": "phone",
  "☎️": "phone",
  "📺": "tv",
  "📹": "video",
  "🎬": "video",
  "🍿": "box",
  "🎪": "tent",

  // Food (all fall through to a generic "cake" since icons for fruit/food
  // are sparse — AI hint text carries the actual meaning, icon is flavor).
  "🍰": "cake",
  "🎂": "cake",
  "🍩": "cake",
  "🍪": "cake",

  // Drinks
  "☕": "coffee",
  "🍵": "tea",

  // People / faces
  "👤": "user",
  "👥": "users",
  "🙂": "smile",
  "😀": "smile",
  "😄": "smile",
  "😊": "smile",
  "😢": "frown",
  "😭": "frown",
  "😠": "angry",
  "😡": "angry",
  "🤔": "smile",
  "😎": "sunglasses",

  // Directions
  "⬆️": "arrow-up",
  "⬇️": "arrow-down",
  "⬅️": "arrow-left",
  "➡️": "arrow-right",
  "🔼": "arrow-up",
  "🔽": "arrow-down",
};

function normalize(emoji: string): string {
  // strip variation selector-16 so "⏱" matches "⏱️"
  return emoji.replace(/\uFE0F/g, "");
}

const NORMALIZED: Record<string, string> = Object.fromEntries(
  Object.entries(MAP).map(([k, v]) => [normalize(k), v]),
);

export function emojiToIconSlug(emoji: string): string | null {
  if (!emoji) return null;
  return MAP[emoji] ?? NORMALIZED[normalize(emoji)] ?? null;
}
