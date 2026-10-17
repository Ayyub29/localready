import type { CorridorId } from "@/lib/types";

export const CORRIDOR_FLAG: Record<CorridorId, string> = {
  "ja-jp": "🇯🇵",
  "ko-kr": "🇰🇷",
  "th-th": "🇹🇭",
  "vi-vn": "🇻🇳",
  "id-id": "🇮🇩",
};

export const CORRIDOR_GRADIENT: Record<CorridorId, string> = {
  "ja-jp": "from-rose-500/20 via-white to-teal-500/15",
  "ko-kr": "from-sky-500/20 via-white to-teal-500/15",
  "th-th": "from-violet-500/15 via-white to-teal-500/15",
  "vi-vn": "from-red-500/15 via-white to-teal-500/15",
  "id-id": "from-emerald-500/15 via-white to-teal-500/15",
};

export const SITUATION_EMOJI: Record<string, string> = {
  script: "あ",
  basics: "👋",
  train: "🚆",
  money: "💳",
  restaurant: "🍜",
  hotel: "🏨",
  directions: "🧭",
  culture: "⛩️",
  emergency: "🆘",
};
