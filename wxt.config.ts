import { defineConfig } from "wxt";

// https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "dash—em",
    description:
      "Flags likely-AI text in your LinkedIn feed with a playful, transparent AI-style badge. Scored entirely on-device.",
    // The ENTIRE permission surface. No <all_urls>, no remote code.
    permissions: ["storage"],
    host_permissions: ["*://*.linkedin.com/*"],
  },
  // Single source of truth for the build; entrypoints/ is auto-discovered.
});
