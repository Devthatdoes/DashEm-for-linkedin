import { LEXICON } from "../lexicon";
import type { Signal, SignalFn } from "../types";
import { capped, matchTerms } from "./util";

function preview(matched: string[]): string {
  return matched.slice(0, 3).join(", ") + (matched.length > 3 ? "…" : "");
}

export const lexical: SignalFn = (ctx) => {
  const out: Signal[] = [];
  const lower = ctx.lower;

  // Near-certain tell: the AI assistant's own phrasing left in the post.
  const leak = matchTerms(lower, LEXICON.assistantLeak);
  if (leak.count > 0) {
    out.push({
      id: "lexical.assistant-leak",
      label: `AI-assistant phrasing: "${leak.matched[0]}"`,
      weight: 30,
    });
  }

  const vocab = matchTerms(lower, LEXICON.aiVocab);
  if (vocab.count > 0) {
    out.push({
      id: "lexical.ai-vocab",
      label: `AI vocabulary: ${preview(vocab.matched)}`,
      weight: capped(vocab.count * 6, 24),
    });
  }

  const puff = matchTerms(lower, LEXICON.puffery);
  if (puff.count > 0) {
    out.push({
      id: "lexical.puffery",
      label: `promotional language (${puff.count})`,
      weight: capped(puff.count * 5, 15),
    });
  }

  const sig = matchTerms(lower, LEXICON.significance);
  if (sig.count > 0) {
    out.push({
      id: "lexical.significance",
      label: `significance inflation: "${sig.matched[0]}"`,
      weight: capped(sig.count * 8, 16),
    });
  }

  const vague = matchTerms(lower, LEXICON.vagueAttribution);
  if (vague.count > 0) {
    out.push({
      id: "lexical.vague-attribution",
      label: `vague attribution: "${vague.matched[0]}"`,
      weight: capped(vague.count * 7, 14),
    });
  }

  return out;
};
