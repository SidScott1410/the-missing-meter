# The Missing Meter

> **The Missing Meter** is a research-paper website for *The Missing Meter: What every infrastructure buildout leaves behind, and the unit AI still lacks* by Sidney Scott.

The website presents the working paper as a searchable, statically prerendered React application. It includes the paper download, interactive served-token sensitivity analysis, reproducibility downloads, a prediction scoreboard, and the full Appendix A specification.

| Resource | Location |
| --- | --- |
| Live website | [themissingmeter.org](https://themissingmeter.org) |
| Primary paper PDF | [`client/public/downloads/The_Missing_Meter.pdf`](client/public/downloads/The_Missing_Meter.pdf) |
| Worked example PDF | [`client/public/downloads/worked_example.pdf`](client/public/downloads/worked_example.pdf) |
| Reproducibility data | [`client/public/downloads/`](client/public/downloads/) |
| Prediction status configuration | [`client/public/predictions-status.json`](client/public/predictions-status.json) |

## Technology

The site is a static React 19 application built with Vite 7, TypeScript, Tailwind CSS 4, Wouter, Recharts, and Lucide icons. A post-build prerender script injects the complete article into `dist/public/index.html`, making the principal content available to readers and crawlers without JavaScript execution.

| Concern | Implementation |
| --- | --- |
| Application | React 19 + TypeScript |
| Build system | Vite 7 + pnpm |
| Styling | Tailwind CSS 4 + bespoke CSS variables |
| Charts | Recharts |
| Static prerender | `scripts/prerender.mjs` |
| Production output | `dist/public/` |
| Static hosting | GitHub Pages, Netlify, Vercel, or any static host |

## Local development

Install Node.js 22 or later and pnpm 10. Then install dependencies and start the development server.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The application is served at `http://localhost:3000` by default.

## Validation and production builds

Use the following commands before publishing a change. The `build` command runs Vite and the static prerender pass, placing the deployable site in `dist/public`.

```bash
pnpm check
pnpm build
pnpm preview
```

For a project-page deployment such as `https://<owner>.github.io/<repository>/`, use relative asset paths:

```bash
pnpm build:pages
```

## Updating the paper and data

The primary PDF, worked-example PDF, and CSV downloads are committed in `client/public/downloads/`, so they deploy with the site and do not depend on a third-party file store. When replacing an asset, preserve its filename unless every corresponding link is intentionally updated.

The prediction scoreboard is designed for editorial updates without touching React code. Edit `client/public/predictions-status.json`, choose one of `Open`, `Half met`, `Met`, or `Failed`, update the evidence `note`, and set `_last_updated` in `YYYY-MM-DD` format. The scoreboard loads this file at runtime and formats the updated date automatically.

## Deployment

The repository includes GitHub Actions definitions for continuous integration and opt-in GitHub Pages deployment. If the initial GitHub token cannot create workflow files, the definitions are retained in `docs/github-workflows/` and can be activated with the concise steps in [docs/GITHUB-WORKFLOWS.md](docs/GITHUB-WORKFLOWS.md). Static hosting guidance for GitHub Pages, Netlify, and Vercel is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

> **Domain note:** `themissingmeter.org` currently points to the live site. Do not change the domain’s DNS settings until the chosen GitHub-hosted deployment has been tested on its temporary URL.

## Repository structure

```text
client/
  public/                 Favicons, SEO files, PDFs, CSVs, prediction-status JSON
  src/components/         Reusable visual and interactive components
  src/pages/Home.tsx      Main paper website and article content
scripts/prerender.mjs     Static server-rendering pass
server/index.ts           Optional Node static-file server
docs/github-workflows/    CI and GitHub Pages definitions, ready to activate
docs/                     Deployment and maintenance documentation
```

## License and content rights

The **website source code** is available under the MIT License in [LICENSE](LICENSE). The paper text, figures, research data, trademarks, and editorial content remain subject to the separate terms in [CONTENT-LICENSE.md](CONTENT-LICENSE.md); they are not granted under the MIT License merely because they appear in this repository.

## Contact

For corrections, paper-related correspondence, or website issues, contact [sidney@themissingmeter.org](mailto:sidney@themissingmeter.org).
