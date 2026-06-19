import { browser } from "wxt/browser";
import type { TonePack } from "@/core/bands";

// Typed wrapper over chrome.storage. Settings persist in `local`; ephemeral
// session counters live in `session`. This is the only module that touches
// storage, so the rest of the code stays testable.

export interface Settings {
  enabled: boolean;
  /** Only badge posts scoring at/above this (precision-biased default). */
  threshold: number;
  /** Show the raw % next to the band label. */
  showPercent: boolean;
  /** Which label vocabulary to use. */
  tonePack: TonePack;
}

export const DEFAULTS: Settings = {
  enabled: true,
  threshold: 45, // ≈ "flip a coin" and up; humans stay clean
  showPercent: true,
  tonePack: "playful",
};

export async function getSettings(): Promise<Settings> {
  const stored = await browser.storage.local.get("settings");
  return { ...DEFAULTS, ...(stored.settings as Partial<Settings> | undefined) };
}

export async function setSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch };
  await browser.storage.local.set({ settings: next });
  return next;
}

export interface SessionStats {
  seen: number;
  flagged: number;
}

export async function bumpStats(patch: Partial<SessionStats>): Promise<void> {
  try {
    const cur = ((await browser.storage.session.get("stats")).stats as SessionStats) ?? {
      seen: 0,
      flagged: 0,
    };
    await browser.storage.session.set({
      stats: { seen: cur.seen + (patch.seen ?? 0), flagged: cur.flagged + (patch.flagged ?? 0) },
    });
  } catch {
    // Session stats are non-critical — never let them break scoring/annotation.
  }
}
