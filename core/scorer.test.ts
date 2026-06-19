import { describe, expect, it } from "vitest";
import { bandFor, classify, isEmDasher } from "./bands";
import { score } from "./scorer";

// Seed of the Phase-3 calibration corpus. Grow this with real labeled posts and
// it doubles as a regression suite — no browser needed, because the scorer is pure.

const AI_POST = `I'm thrilled to share a lesson that changed everything—and it's simpler than you think.

A junior dev asked me a question last week—one that stopped me in my tracks.

Here's what I told them:

✅ Clarity beats cleverness
✅ Done beats perfect
✅ Your network is your net worth

It's not just about writing code—it's about writing the future.

What's the one lesson that shaped your career? 👇

#Leadership #Growth #Mindset`;

const HUMAN_POST = `finally killed the bug that's been haunting me for like 3 days lol. turned out to be a missing await the whole time, classic. anyway shipping it and going to get tacos. honestly idk how i didn't see it sooner`;

// Casual, low-scoring, but riddled with em-dashes (6).
const EM_DASH_HEAVY = `lol ok so i was thinking about this today — and honestly — i'm not totally sure — maybe it's just me — but the whole thing felt off — like genuinely off — anyway thats my brain dump for now tbh`;

describe("score", () => {
  it("rates a classic AI LinkedIn post in bot/Olympic territory", () => {
    const r = score(AI_POST);
    expect(r.score).not.toBeNull();
    expect(r.score as number).toBeGreaterThanOrEqual(75);
    expect(classify(r.score as number).label).toMatch(/bot territory|Olympic/i);
  });

  it("rates a casual human post low", () => {
    const r = score(HUMAN_POST);
    expect(r.score as number).toBeLessThan(45);
  });

  it("abstains on very short posts", () => {
    expect(score("nice one 🙌").score).toBeNull();
  });

  it("exposes the loudest tell first as a why-chip", () => {
    const r = score(AI_POST);
    expect(r.signals[0]?.label).toBeTruthy();
  });

  it("flags em-dash-riddled posts as Olympic Em—Dasher, regardless of score", () => {
    const r = score(EM_DASH_HEAVY);
    expect(isEmDasher(r)).toBe(true);
    expect((r.score as number) < 45).toBe(true); // casual → low score…
    expect(bandFor(r).label).toBe("Olympic Em—Dasher"); // …but the override wins
  });
});
