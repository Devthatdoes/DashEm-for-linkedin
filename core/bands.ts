// Bands are a PRESENTATION layer, fully decoupled from the scorer. Wording and
// colors can change forever without re-testing detection. Each band is defined by
// `min` only (it runs until the next band starts), which makes gaps/overlaps
// structurally impossible.

import type { ScoreResult } from "./types";

export interface Band {
  /** Inclusive lower bound on the 0–100 score. */
  min: number;
  emoji: string;
  label: string;
  /** Hex color for the badge (the one green→red ramp). */
  color: string;
}

export type TonePack = "playful" | "neutral";

/** Default voice. Keep the personality here, not in the scorer. */
export const playful: Band[] = [
  { min: 0, emoji: "🧑", label: "Seems Human", color: "#2f855a" },
  { min: 25, emoji: "⌨️", label: "Human Enough", color: "#6b8e23" },
  { min: 45, emoji: "🪙", label: "Maybe AI or Human, flip a coin", color: "#c9a227" },
  { min: 55, emoji: "✍️", label: "A human may have edited this", color: "#c2622c" },
  { min: 75, emoji: "🤖", label: "Entered bot territory", color: "#b23a1f" },
  { min: 90, emoji: "🏅", label: "Olympic Prompt Engineer", color: "#8e1b1b" },
];

/** Sober alternative for users who want it dry. Same numbers, different words. */
export const neutral: Band[] = [
  { min: 0, emoji: "", label: "Likely human", color: "#2f855a" },
  { min: 45, emoji: "", label: "Uncertain", color: "#c9a227" },
  { min: 55, emoji: "", label: "Possibly AI-assisted", color: "#c2622c" },
  { min: 75, emoji: "", label: "Likely AI", color: "#b23a1f" },
];

export const PACKS: Record<TonePack, Band[]> = { playful, neutral };

/** Map a 0–100 score to its band within a pack. */
export function classify(score: number, pack: Band[] = playful): Band {
  for (let i = pack.length - 1; i >= 0; i--) {
    const band = pack[i];
    if (band && score >= band.min) return band;
  }
  return pack[0] as Band;
}

// ── Em-dash override ─────────────────────────────────────────────────────────
// A post can read casual yet be riddled with em-dashes — the single loudest tell,
// which the scorer caps so it can't dominate. When the count is egregious we
// override the score's band with a dedicated badge. (Yes, this badge keeps an
// em-dash on purpose. It's the joke.)
export const EM_DASH_LIMIT = 5; // strictly MORE than this triggers the override

export const OLYMPIC_EM_DASHER: Band = {
  min: 101, // unreachable by a 0–100 score; reached only via the override
  emoji: "🥇",
  label: "Olympic Em—Dasher",
  color: "#7c3aed",
};

function emDashCount(result: ScoreResult): number {
  return result.signals.find((s) => s.id === "typography.em-dash")?.count ?? 0;
}

export function isEmDasher(result: ScoreResult): boolean {
  return emDashCount(result) > EM_DASH_LIMIT;
}

/** The band to display: the em-dash override wins; otherwise the score's band. */
export function bandFor(result: ScoreResult, pack: Band[] = playful): Band {
  if (isEmDasher(result)) return OLYMPIC_EM_DASHER;
  return classify(result.score ?? 0, pack);
}
