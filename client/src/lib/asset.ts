/**
 * asset.ts — base-aware public asset URLs.
 *
 * WHY: this site is built once and served from two different URL roots:
 *   - the apex custom domain            https://themissingmeter.org/
 *   - the GitHub Pages project fallback https://<user>.github.io/the-missing-meter/
 *
 * Hardcoded root-absolute paths like "/downloads/paper.pdf" resolve correctly
 * only on the apex. On the project path they 404. Vite exposes the configured
 * base as import.meta.env.BASE_URL, so prefixing with it makes a single build
 * correct under both roots.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  // Normalise: base always ends with "/", path never starts with "/".
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
