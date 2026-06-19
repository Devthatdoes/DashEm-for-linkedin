import { type Band, bandFor } from "@/core/bands";
import type { ScoreResult } from "@/core/types";

// Renders the badge INSIDE a Shadow DOM root so LinkedIn's CSS can't break our
// badge and our styles can't leak into the page. Non-destructive: we only add an
// overlay element, never touch the post's own text.

const HOST_ATTR = "data-dashem-badge";

const STYLE = `
  :host { all: initial; }
  .wrap { font-family: -apple-system, system-ui, sans-serif; margin: 6px 0 2px; }
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 3px 10px; border-radius: 999px;
    font-size: 12px; font-weight: 700; color: #fff; cursor: default;
    white-space: nowrap;
  }
  .why { display: none; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
  .why.open { display: flex; }
  .chip {
    font-size: 11px; padding: 2px 8px; border-radius: 999px;
    border: 1px solid rgba(0,0,0,.15); color: #333; background: #fff;
  }
  .toggle { cursor: pointer; opacity: .85; font-weight: 400; }
`;

/** True when this post element already carries a dash—em badge. */
export function isAnnotated(el: HTMLElement): boolean {
  return el.querySelector(`[${HOST_ATTR}]`) !== null;
}

export function annotate(
  mount: HTMLElement,
  result: ScoreResult,
  pack?: Band[],
  showPercent = true,
): void {
  if (result.score === null || isAnnotated(mount)) return;
  const band = bandFor(result, pack);

  const host = document.createElement("div");
  host.setAttribute(HOST_ATTR, "");
  const root = host.attachShadow({ mode: "open" });

  // Suppress the % for the em-dash override band (min > 100) — the score isn't
  // the point there.
  const pct = showPercent && band.min <= 100 ? ` · ${result.score}%` : "";
  const chips = result.signals
    .map((s) => `<span class="chip">${escapeHtml(s.label)}</span>`)
    .join("");

  root.innerHTML = `
    <style>${STYLE}</style>
    <div class="wrap">
      <span class="badge" style="background:${band.color}">
        ${band.emoji} ${escapeHtml(band.label)}${pct}
        <span class="toggle" part="toggle">ⓘ</span>
      </span>
      <div class="why">${chips}</div>
    </div>`;

  const toggle = root.querySelector(".toggle");
  const why = root.querySelector(".why");
  toggle?.addEventListener("click", () => why?.classList.toggle("open"));

  mount.prepend(host);
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}
