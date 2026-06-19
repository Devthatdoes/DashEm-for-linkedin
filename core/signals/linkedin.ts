import type { Signal, SignalFn } from "../types";

const ANNOUNCE =
  /\b(thrilled|humbled|honou?red|excited|delighted|proud|pleased|grateful|blessed)\b[^.?!\n]{0,30}\bto\s+(announce|share)\b/i;

const ENGAGEMENT_BAIT: RegExp[] = [
  /\bwhat (are|do) your? (thoughts|takes?)\b/i,
  /\bthoughts\?\s*$/im,
  /\bagree\?\s*$/im,
  /\b(drop|leave) a (comment|like)\b/i,
  /\bcomment below\b/i,
  /👇/u,
];

const HASHTAG = /(?:^|\s)#[\p{L}\p{N}_]{2,}/gu;
const SINK_IN = /\blet that sink in\b/i;

export const linkedin: SignalFn = (ctx) => {
  const out: Signal[] = [];
  const text = ctx.text;

  if (ANNOUNCE.test(text)) {
    out.push({ id: "linkedin.announce", label: '"thrilled to announce" opener', weight: 14 });
  }
  if (ENGAGEMENT_BAIT.some((re) => re.test(text))) {
    out.push({ id: "linkedin.engagement-bait", label: "engagement-bait closer", weight: 14 });
  }

  const tags = (text.match(HASHTAG) || []).length;
  if (tags >= 3) {
    out.push({ id: "linkedin.hashtag-stack", label: `hashtag stack (${tags})`, weight: 10 });
  }
  if (SINK_IN.test(text)) {
    out.push({ id: "linkedin.sink-in", label: '"let that sink in"', weight: 8 });
  }

  return out;
};
