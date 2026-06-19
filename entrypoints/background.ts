// `defineBackground` is auto-imported by WXT — no import statement needed.
// Scoring happens in the content script. The one job here: grant content scripts
// access to session-scoped storage (Chrome defaults it to trusted contexts only,
// so writing session stats from a content script would otherwise throw).
export default defineBackground(() => {
  try {
    chrome.storage.session
      .setAccessLevel({ accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" })
      .catch(() => {});
  } catch {
    // Older Chrome without setAccessLevel — stats simply stay background-only.
  }
});
