# Contributing

This repository hosts a public research-paper website. Contributions that improve accessibility, build reliability, technical accuracy, or presentation are welcome. Changes to the paper’s claims, citations, data, measurements, or editorial conclusions should be proposed with a clear source and rationale.

## Development process

Create a focused branch, run the validation commands below, and open a pull request describing the reader-facing effect of the change. Keep interface changes responsive across mobile and desktop, preserve the warm monochrome visual system, and retain the static-prerendered article content.

```bash
pnpm check
pnpm build
```

## Content and evidence changes

Changes to quantitative claims should identify their source, calculation, date, and provenance category. Do not introduce synthetic provider data under a real provider name. The cheapest-placement sweep is intentionally anonymized as Provider A–O; preserve that convention unless the paper itself changes it.

Prediction status changes belong in `client/public/predictions-status.json`. Each update should revise the date and provide a concise evidence note so the public scoreboard remains auditable.

## Pull-request expectations

Please explain the reason for the change, list any affected paper sections or assets, and provide screenshots for visual changes. Do not commit build output, dependency folders, local logs, secrets, or editorial drafts not intended for publication.
