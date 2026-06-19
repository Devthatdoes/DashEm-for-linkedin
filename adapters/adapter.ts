// A SiteAdapter is the ONLY place that knows a site's DOM. Adding X/Reddit later
// = implement this interface; the scorer, bands, and annotator are unchanged.

export interface ExtractedPost {
  /** Stable id for caching (LinkedIn: the post's data-urn). */
  id: string;
  /** Display name of the author, for logging/debug. */
  author: string;
  /** The author's OWN commentary (not quoted/reshared content). */
  text: string;
  /** The post container element, used to position the badge. */
  el: HTMLElement;
}

export interface SiteAdapter {
  readonly name: string;
  /** Does this adapter handle the current page? */
  matches(url: string): boolean;
  /** Posts currently in the DOM that have extractable text. */
  getPosts(): ExtractedPost[];
  /** Where to mount the badge for a post (defaults to the post element). */
  badgeMount(post: ExtractedPost): HTMLElement;
}
