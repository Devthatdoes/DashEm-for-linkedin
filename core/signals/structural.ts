import type { Signal, SignalFn } from "../types";
import { capped } from "./util";

// "not just X, but Y" / "it's not X, it's Y" / "no X, no Y, just Z"
const NEG_PARALLEL: RegExp[] = [
  /\bnot just\b[^.?!\n]{1,60}\b(but|it'?s)\b/i,
  /\bit'?s not\b[^.?!\n]{1,60},\s*it'?s\b/i,
  /\bno\b[^.?!\n]{1,40},\s*no\b[^.?!\n]{1,40},\s*(just|only)\b/i,
];

// Lines used as emoji bullets (start with a bullet-ish glyph).
const EMOJI_BULLET = /^\s*(?:[✅✔☑🔹🔸▶➡👉💡🚀⭐✨🔑📌•‣–-]️?)\s*\S/u;

// Decorative "enthusiasm" emojis over-represented in AI posts (rocket, sparkle,
// fire, brain…). Per Bloomberg/RTÉ reporting these are among the strongest tells.
const AI_EMOJI = /[🚀✨⭐🌟🔥📈📊💡🧠🎯🙌💪🙏]/gu;

const DESPITE_OPTIMISM = /\bdespite\b[^.?!\n]{0,80}\b(challenges?|obstacles?|setbacks?|hurdles?)\b/i;

export const structural: SignalFn = (ctx) => {
  const out: Signal[] = [];
  const text = ctx.text;

  if (NEG_PARALLEL.some((re) => re.test(text))) {
    out.push({
      id: "structural.negative-parallelism",
      label: 'negative parallelism ("not just X, but Y")',
      weight: 20,
    });
  }

  const bulletLines = ctx.lines.filter((l) => EMOJI_BULLET.test(l)).length;
  if (bulletLines >= 2) {
    out.push({
      id: "structural.emoji-bullets",
      label: `emoji bullet list (${bulletLines} items)`,
      weight: 16,
    });
  }

  const emoji = (text.match(AI_EMOJI) || []).length;
  if (emoji > 0) {
    out.push({
      id: "structural.ai-emoji",
      label: `AI-favored emoji (${emoji})`,
      weight: capped(emoji * 6, 18),
    });
  }

  if (DESPITE_OPTIMISM.test(text)) {
    out.push({
      id: "structural.despite-optimism",
      label: '"despite challenges…" framing',
      weight: 6,
    });
  }

  // Staccato: lots of short, newline-separated one-liners.
  const short = ctx.lines.filter((l) => l.length > 0 && l.length < 55).length;
  if (ctx.lines.length >= 6 && short / ctx.lines.length > 0.7) {
    out.push({ id: "structural.staccato", label: "staccato one-liners", weight: 8 });
  }

  return out;
};
