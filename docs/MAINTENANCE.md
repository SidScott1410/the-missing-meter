# Maintenance Notes

## Paper assets

The downloadable paper and reproducibility files are committed in `client/public/downloads/`. They are referenced from React components using root-relative `/downloads/...` URLs. To replace the paper, overwrite `The_Missing_Meter.pdf` and keep its filename unless you intentionally update all references.

## Prediction scoreboard

The site loads `client/public/predictions-status.json` on page load. This allows a status update to remain a simple editorial change. Update the `status`, `note`, and `_last_updated` fields, then open a pull request. Valid status values are `Open`, `Half met`, `Met`, and `Failed`.

## Static prerender

`scripts/prerender.mjs` renders the React tree into the generated HTML after Vite’s client build completes. Do not remove it without replacing the static rendering strategy: the initial HTML is intentionally rich in paper content so readers and search systems can read the article without client-side JavaScript.

## Source conventions

The home page holds the paper content and primary section structure. Reusable visual elements belong in `client/src/components/`. The visual language is warm off-white, near-black, restrained amber, Playfair Display for display typography, Inter for prose, and JetBrains Mono for instrument labels.
