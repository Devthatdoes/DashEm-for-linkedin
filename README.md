# Dash—Em For LinkedIn

Flags likely-AI text in your **LinkedIn feed** as you scroll, with a playful,
transparent "AI-style" badge, scored **entirely on-device**. No backend, no API
keys, no post text ever leaves your browser.

The em-dash (`—`) in the name is the joke: the most famous AI tell, demoted here
to just one signal among many.







> See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full design rationale.

## Quickstart

```bash
pnpm install        # also runs `wxt prepare` (generates .wxt/ types + @/ alias)
pnpm dev            # launches Chrome with the extension loaded + hot reload
```

Open LinkedIn, scroll your feed, and posts above your threshold get a badge.
Click the **ⓘ** on a badge to see *why* it fired.

```bash
pnpm test           # run the scorer unit tests (pure Node, no browser)
pnpm build          # production build → .output/
pnpm zip            # package for the Chrome Web Store
```

## How it works

1. `adapters/linkedin.ts` finds feed posts (by `data-urn`) and extracts the
   author's text. **This is the only Linkedin-specific file** — the brittle part,
   isolated on purpose.
2. `core/scorer.ts` runs the text through five pure signal modules
   (`core/signals/*`) → a `0–100` score plus the list of tells that fired. No DOM,
   no `chrome.*` — fully unit-testable.
3. `core/bands.ts` maps the score to a playful band label (purely presentational).
4. `content/annotator.ts` renders the badge in a **Shadow DOM** overlay — it never
   edits the post text.

## Tuning

- **Signals & weights:** `core/signals/*.ts`
- **Word/phrase lists:** `core/lexicon.ts` (versioned — bump `version` when you
  revise; the tells drift as models change)
- **Band labels/colors:** `core/bands.ts`
- **Defaults (threshold, tone):** `lib/settings.ts`
- **Calibration:** add labeled posts to `core/scorer.test.ts` and run `pnpm test`.
  Tune toward **precision** — a false "AI-style" on a real human is the costly error.

## Status

Initial scaffold. Phase 0 = confirm LinkedIn extraction is solid (set
`DEBUG = true` in `entrypoints/linkedin.content.ts` to log every post). The
selectors in `adapters/linkedin.ts` are the first thing to verify against the
live feed.

## Permissions

`storage` + `*://*.linkedin.com/*`. That's the entire surface.
