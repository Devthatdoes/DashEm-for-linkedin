import type { ExtractedPost, SiteAdapter } from "./adapter";

// ────────────────────────────────────────────────────────────────────────────
// LinkedIn ships TWO post layouts depending on page / A-B bucket. We support
// both. Hashed class names (e.g. "_564eb611") are NEVER used as anchors — only
// stable semantics (data-urn, role, componentkey, aria-label).
// ────────────────────────────────────────────────────────────────────────────

// ── OLD layout: profile activity pages + older feed ─────────────────────────
const OLD_POST_SELECTORS = [
  'div[data-urn^="urn:li:activity"]',
  "div.feed-shared-update-v2[data-urn]",
  "div.fie-impression-container[data-urn]",
];
const OLD_TEXT_SELECTORS = [
  ".update-components-text",
  ".feed-shared-update-v2__description .update-components-text",
  ".update-components-update-v2__commentary",
];
const OLD_AUTHOR_SELECTORS = [
  ".update-components-actor__title span[aria-hidden='true']",
  ".update-components-actor__name",
  ".update-components-actor__title",
];

// ── NEW layout: redesigned home feed with hashed class names ────────────────
// Anchor on the per-post control button, whose aria-label carries the author:
//   "Open control menu for post by <Name>"
const NEW_CONTROL_BTN = 'button[aria-label^="Open control menu for post"]';

function firstText(root: Element, selectors: string[]): string {
  for (const sel of selectors) {
    const t = (root.querySelector(sel)?.textContent ?? "").trim();
    if (t) return t;
  }
  return "";
}

function getOldPosts(): ExtractedPost[] {
  const seen = new Set<string>();
  const posts: ExtractedPost[] = [];
  for (const sel of OLD_POST_SELECTORS) {
    for (const el of document.querySelectorAll<HTMLElement>(sel)) {
      const id = el.getAttribute("data-urn") ?? "";
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const text = cleanText(firstText(el, OLD_TEXT_SELECTORS));
      if (!text) continue; // images-only / no commentary
      posts.push({ id, author: firstText(el, OLD_AUTHOR_SELECTORS) || "(unknown)", text, el });
    }
  }
  return posts;
}

function getNewPosts(): ExtractedPost[] {
  const seen = new Set<string>();
  const posts: ExtractedPost[] = [];
  for (const btn of document.querySelectorAll<HTMLElement>(NEW_CONTROL_BTN)) {
    const el = (btn.closest('[role="listitem"]') ?? btn.parentElement) as HTMLElement | null;
    if (!el) continue;

    const aria = btn.getAttribute("aria-label") ?? "";
    const author =
      aria.replace(/^Open control menu for post by\s*/i, "").trim() || "(unknown)";

    const id =
      el.getAttribute("componentkey") ||
      el.querySelector("[componentkey]")?.getAttribute("componentkey") ||
      `${author}:${(el.textContent ?? "").slice(0, 40)}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const text = cleanText(longestTextBlock(el));
    if (!text) continue;
    posts.push({ id, author, text, el });
  }
  return posts;
}

// With hashed classes we can't target the commentary directly. Heuristic: it's
// the longest text block in the post that does NOT contain the control menu
// (which excludes the header/author chrome and big outer wrappers).
function longestTextBlock(post: Element): string {
  let best = "";
  for (const e of post.querySelectorAll("span, p, div")) {
    if (e === post) continue;
    if (e.querySelector('button[aria-label*="control menu"]')) continue;
    const t = (e.textContent ?? "").trim();
    if (t.length > best.length) best = t;
  }
  return best;
}

// Strip the "…more" / "see more" truncation affordance so it neither pollutes
// the scored text nor trips the ellipsis-glyph signal.
function cleanText(raw: string): string {
  return raw
    .replace(/(…|\.\.\.)\s*more\b/gi, " ")
    .replace(/\bsee\s+more\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const linkedInAdapter: SiteAdapter = {
  name: "linkedin",

  matches(url: string): boolean {
    return /(^|\.)linkedin\.com$/.test(new URL(url).hostname);
  },

  getPosts(): ExtractedPost[] {
    // Search results mix people, companies, videos and short previews, and the
    // cards there nest the author headline into the text block — unreliable. Skip
    // it until it gets dedicated extraction; we target the feed + activity pages.
    if (/\/search\//.test(location.pathname)) return [];

    // Old layout first (it's precise where it applies, e.g. activity pages);
    // fall back to the new home-feed layout when the old selectors find nothing.
    const old = getOldPosts();
    return old.length ? old : getNewPosts();
  },

  badgeMount(post: ExtractedPost): HTMLElement {
    return post.el;
  },
};
