import type { ScoreResult } from "@/core/types";

// LinkedIn's feed is virtualized — it recycles DOM nodes as you scroll. Cache by
// the post's stable URN so each post is scored exactly once and recycled nodes
// don't re-score or thrash. In-memory only: we never persist other people's text.
const scores = new Map<string, ScoreResult>();

export const cache = {
  get: (id: string): ScoreResult | undefined => scores.get(id),
  set: (id: string, result: ScoreResult): void => void scores.set(id, result),
  has: (id: string): boolean => scores.has(id),
  get size(): number {
    return scores.size;
  },
};
