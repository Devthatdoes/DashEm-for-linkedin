// Small shared helpers for signal modules. Pure.

export interface LexHit {
  count: number;
  matched: string[];
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Count how many distinct terms appear in `lower`. Multi-word terms match as
 * substrings; single words match on word boundaries.
 */
export function matchTerms(lower: string, terms: readonly string[]): LexHit {
  const matched: string[] = [];
  for (const term of terms) {
    const hit = term.includes(" ")
      ? lower.includes(term)
      : new RegExp(`\\b${escapeRe(term)}\\b`, "i").test(lower);
    if (hit) matched.push(term);
  }
  return { count: matched.length, matched };
}

/** Cap a contribution so no single family can run away with the score. */
export function capped(value: number, max: number): number {
  return Math.min(value, max);
}
