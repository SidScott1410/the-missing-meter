# Deployment Guide

The application is static after `pnpm build`. Deploy the contents of `dist/public/` to any static host. The build also produces `dist/server/` for the prerender process; it is not required at runtime on a static host.

| Hosting option | Build command | Publish directory | Notes |
| --- | --- | --- | --- |
| GitHub Pages | `pnpm build:pages` | `dist/public` | Uses the included Pages workflow. |
| Netlify | `pnpm build` | `dist/public` | `netlify.toml` is included. |
| Vercel | `pnpm build` | `dist/public` | `vercel.json` is included. |
| Any static host | `pnpm build` | `dist/public` | Configure an SPA fallback if routing expands beyond `/`. |

## GitHub Pages

The workflow at `docs/github-workflows/deploy-pages.yml` is intentionally triggered only by a manual dispatch. Move it to `.github/workflows/deploy-pages.yml` after granting workflow-write authorization, following [GitHub Actions Activation](GITHUB-WORKFLOWS.md). Then open **Settings → Pages** and set the source to **GitHub Actions**, followed by a manual run from the Actions tab.

For a project site at `https://<owner>.github.io/<repository>/`, the workflow uses `pnpm build:pages`, which emits relative asset paths. For a custom domain hosted at the web root, use `pnpm build` instead.

## Netlify

Import the repository in Netlify and use the values in `netlify.toml`. The included redirects file sends unmatched routes to `index.html`, preserving client-side routing.

## Vercel

Import the repository in Vercel. The included `vercel.json` identifies `dist/public` as the output directory and rewrites application routes to `index.html`.

## Custom domain cutover

Before changing DNS for `themissingmeter.org`, validate the deployed preview by checking the primary PDF, both CSV downloads, the prediction status JSON, the interactive charts, metadata, and the static initial HTML. Once validated, update the A/AAAA/CNAME record according to the selected host’s instructions. Preserve the existing host until the new certificate is active and the canonical URL resolves correctly.
