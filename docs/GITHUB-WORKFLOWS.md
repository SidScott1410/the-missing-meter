# GitHub Actions Activation

The CI and GitHub Pages workflow definitions are included in `docs/github-workflows/`. They are not under `.github/workflows/` in the initial private-repository push because the connected GitHub token does not have the permission required to create workflow files.

After authorizing a GitHub token or GitHub App installation with **Actions workflow write** permission, activate them with:

```bash
mkdir -p .github/workflows
mv docs/github-workflows/ci.yml .github/workflows/ci.yml
mv docs/github-workflows/deploy-pages.yml .github/workflows/deploy-pages.yml
git add .github/workflows docs/github-workflows
git commit -m "Enable CI and GitHub Pages workflows"
git push
```

The `ci.yml` workflow installs dependencies, runs `pnpm check`, and runs the static prerender build. The `deploy-pages.yml` workflow is manual-only; after it is activated, set **Settings → Pages → Source** to **GitHub Actions**, then start the workflow from the Actions tab.
