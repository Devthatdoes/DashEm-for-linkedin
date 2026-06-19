import type { Signal, SignalFn } from "../types";
import { capped } from "./util";

const EM_DASH = /—/g;
const CURLY = /[‘’“”]/;
const ELLIPSIS = /…/;
// Markdown LinkedIn does NOT render: literal **bold** and "# headings" never
// display, so their presence means text was pasted raw from a model. (Plain
// "- " bullets are excluded — humans type those manually all the time.)
const MD_BOLD = /\*\*[^*\n]+\*\*/;
const MD_HEADING = /^#{1,6}\s+\S/m;

export const typography: SignalFn = (ctx) => {
  const out: Signal[] = [];
  const text = ctx.text;

  const em = (text.match(EM_DASH) || []).length;
  if (em > 0) {
    out.push({
      id: "typography.em-dash",
      label: em === 1 ? "1 em-dash" : `${em} em-dashes`,
      weight: capped(em * 5, 15),
      count: em,
    });
  }

  if (CURLY.test(text)) {
    out.push({ id: "typography.curly-quotes", label: "curly quotes", weight: 4 });
  }
  if (ELLIPSIS.test(text)) {
    out.push({ id: "typography.ellipsis", label: "… ellipsis glyph", weight: 4 });
  }
  if (MD_BOLD.test(text) || MD_HEADING.test(text)) {
    out.push({ id: "typography.leaked-markdown", label: "leaked markdown", weight: 18 });
  }

  return out;
};
