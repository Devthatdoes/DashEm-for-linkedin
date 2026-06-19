// `defineContentScript` is auto-imported by WXT — no import statement needed.
import { browser } from "wxt/browser";
import type { ExtractedPost } from "@/adapters/adapter";
import { linkedInAdapter } from "@/adapters/linkedin";
import { PACKS, isEmDasher } from "@/core/bands";
import { score } from "@/core/scorer";
import { annotate, isAnnotated } from "@/content/annotator";
import { cache } from "@/content/cache";
import { bumpStats, getSettings, type Settings } from "@/lib/settings";

// Flip to true for the Phase-0 spike: logs {author, score, text} for every post.
const DEBUG = true;

export default defineContentScript({
  matches: ["*://*.linkedin.com/*"],
  runAt: "document_idle",

  async main() {
    console.info("[dash—em] content script injected →", location.href);
    try {
    const adapter = linkedInAdapter;
    if (!adapter.matches(location.href)) return;

    let settings: Settings = await getSettings();
    if (DEBUG) console.info("[dash—em] active · settings:", settings);
    if (!settings.enabled) return;

    // Live-update when the popup changes settings (affects newly-scored posts).
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.settings) {
        settings = { ...settings, ...(changes.settings.newValue as Settings) };
      }
    });

    const byEl = new WeakMap<HTMLElement, ExtractedPost>();
    const registered = new WeakSet<HTMLElement>();
    let everFound = false;

    // Score a post as it enters the viewport (cheap, lazy, dedup'd by URN).
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          const post = byEl.get(el);
          if (post) processPost(post);
        }
      },
      { rootMargin: "0px 0px 300px 0px", threshold: 0.01 },
    );

    function processPost(post: ExtractedPost): void {
      let result = cache.get(post.id);
      if (!result) {
        result = score(post.text);
        cache.set(post.id, result);
        bumpStats({ seen: 1 });
        if (DEBUG) {
          console.log("[dash—em]", result.score, "·", post.author, "·", post.text.slice(0, 70));
        }
      }
      if (
        result.score !== null &&
        (result.score >= settings.threshold || isEmDasher(result)) &&
        !isAnnotated(post.el)
      ) {
        annotate(adapter.badgeMount(post), result, PACKS[settings.tonePack], settings.showPercent);
        bumpStats({ flagged: 1 });
      }
    }

    // Register newly-arrived posts with the IntersectionObserver.
    function scan(): void {
      const posts = adapter.getPosts();
      if (posts.length) everFound = true;
      if (DEBUG) console.log(`[dash—em] scan: ${posts.length} post(s) found`);
      for (const post of posts) {
        if (registered.has(post.el)) continue;
        registered.add(post.el);
        byEl.set(post.el, post);
        io.observe(post.el);
      }
    }

    // The feed streams in via SPA mutations — rescan, debounced.
    let pending = false;
    const mo = new MutationObserver(() => {
      if (pending) return;
      pending = true;
      setTimeout(() => {
        pending = false;
        scan();
      }, 400);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    scan();

    // Extraction canary: if we never find a post, the selectors are likely stale.
    setTimeout(() => {
      if (!everFound) {
        console.warn(
          "[dash—em] extraction canary: no posts found after 5s — " +
            "LinkedIn selectors may be stale (see adapters/linkedin.ts).",
        );
      }
    }, 5000);
    } catch (err) {
      console.error("[dash—em] fatal error during init:", err);
    }
  },
});
