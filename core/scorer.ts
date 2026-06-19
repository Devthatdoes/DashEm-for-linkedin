import { SIGNALS } from "./signals";
import type { PostContext, ScoreResult, Signal } from "./types";

/** Below this length a post carries too little signal — we abstain (no badge). */
export const MIN_CHARS = 120;

/** Neutral starting point. Absence of any tell leans (weakly) human. */
const BASELINE = 10;

function buildContext(raw: string): PostContext {
  const text = raw.trim();
  return {
    text,
    lower: text.toLowerCase(),
    chars: text.length,
    lines: text
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean),
  };
}

/**
 * Score a post's text. Returns a 0–100 AI-style likelihood plus the fired
 * signals (the "why"), or `score: null` when the post is too short to judge.
 * Pure: no chrome.*, no DOM — unit-testable in plain Node.
 */
export function score(raw: string): ScoreResult {
  const ctx = buildContext(raw);

  if (ctx.chars < MIN_CHARS) {
    return { score: null, signals: [], raw: 0 };
  }

  const signals: Signal[] = [];
  for (const fn of SIGNALS) signals.push(...fn(ctx));
  signals.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  const raw_ = signals.reduce((sum, s) => sum + s.weight, BASELINE);
  const clamped = Math.max(0, Math.min(100, Math.round(raw_)));

  return { score: clamped, signals, raw: raw_ };
}
