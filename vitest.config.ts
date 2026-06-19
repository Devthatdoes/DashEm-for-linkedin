import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// The scorer is pure (no chrome.*, no DOM), so tests run in plain Node —
// no browser, no jsdom. This is the payoff of a DOM-free core.
export default defineConfig({
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
  test: {
    include: ["core/**/*.test.ts"],
    environment: "node",
  },
});
