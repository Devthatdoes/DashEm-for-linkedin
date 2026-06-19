// Pure types shared across the scorer. No chrome.*, no DOM.

/** A single tell that fired, with its contribution to the score. */
export interface Signal {
  /** Stable id, e.g. "typography.em-dash". */
  id: string;
  /** Human-readable text for the "why" chip, e.g. "3 em-dashes". */
  label: string;
  /** Score contribution. Positive = leans AI, negative = leans human. */
  weight: number;
  /** Optional raw count behind the signal (e.g. number of em-dashes). */
  count?: number;
}

/** Lightweight, precomputed context passed to every signal fn. */
export interface PostContext {
  /** Trimmed post text. */
  text: string;
  /** Lowercased text (precomputed once for case-insensitive matching). */
  lower: string;
  /** Character count of the trimmed text. */
  chars: number;
  /** Non-empty lines. */
  lines: string[];
}

/** A signal module: given text + context, return the tells that fired. */
export type SignalFn = (ctx: PostContext) => Signal[];

/** The result of scoring one post. */
export interface ScoreResult {
  /** 0–100 AI-style likelihood, or null when we abstain (too short). */
  score: number | null;
  /** Fired signals, sorted by absolute weight (loudest first). */
  signals: Signal[];
  /** Pre-clamp aggregate — handy for debugging/calibration. */
  raw: number;
}
