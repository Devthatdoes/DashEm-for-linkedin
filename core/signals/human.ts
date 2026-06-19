import { LEXICON } from "../lexicon";
import type { Signal, SignalFn } from "../types";
import { matchTerms } from "./util";

// NEGATIVE signals: markers that pull the score DOWN toward "human". A
// bidirectional scorer is far more precise than a one-way tally of AI tells.
export const human: SignalFn = (ctx) => {
  const out: Signal[] = [];
  const text = ctx.text;

  // All-lowercase prose (ignoring URLs / @handles / #tags) reads casual/human.
  const prose = text.replace(/https?:\/\/\S+/g, "").replace(/[#@]\S+/g, "");
  if (/[a-z]/.test(prose) && !/[A-Z]/.test(prose) && ctx.chars > 40) {
    out.push({ id: "human.all-lowercase", label: "all-lowercase / casual", weight: -16 });
  }

  const slang = matchTerms(ctx.lower, LEXICON.slang);
  if (slang.count > 0) {
    out.push({
      id: "human.slang",
      label: `slang: ${slang.matched.slice(0, 3).join(", ")}`,
      weight: -12,
    });
  }

  // Elongated words ("soooo", "yesss") — very human, basically never LLM.
  if (/([a-z])\1{2,}/i.test(text)) {
    out.push({ id: "human.elongation", label: "elongated words (sooo)", weight: -8 });
  }

  return out;
};
