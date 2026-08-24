/**
 * prerender.mjs — Static HTML prerender for The Missing Meter
 *
 * Run after `vite build`:
 *   node scripts/prerender.mjs
 *
 * Strategy:
 *  1. Build a fully self-contained CJS bundle
 *  2. Patch the bundle: add `const React = React$1;` at the top so that
 *     components using classic JSX (React.createElement) find the variable
 *  3. Call render() and inject the HTML into dist/public/index.html
 */

import { build } from "vite";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

async function prerender() {
  console.log("🔨 Building SSR bundle (fully self-contained)...");

  await build({
    root: resolve(root, "client"),
    // Must match the client build's base, otherwise import.meta.env.BASE_URL
    // is "/" inside the SSR bundle and the prerendered markup emits
    // root-absolute asset links that are wrong under a project-path deploy.
    base: process.env.VITE_BASE_PATH || "/",
    build: {
      ssr: resolve(root, "client/src/entry-server.tsx"),
      outDir: resolve(root, "dist/server"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          format: "cjs",
          entryFileNames: "entry-server.cjs",
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(root, "client/src"),
        "@shared": resolve(root, "shared"),
      },
    },
    ssr: {
      noExternal: /.*/,
    },
    logLevel: "warn",
  });

  console.log("⚙️  Patching bundle and rendering HTML...");

  const bundlePath = resolve(root, "dist/server/entry-server.cjs");
  let code = readFileSync(bundlePath, "utf-8");

  // Find the variable name Rollup assigned to the React default export
  // It's always `const React$1 = getDefaultExportFromCjs(reactExports);`
  const reactVarMatch = code.match(/const (React\$\d+) = \/\* @__PURE__ \*\/ getDefaultExportFromCjs\(reactExports\)/);
  const reactVar = reactVarMatch ? reactVarMatch[1] : null;

  if (reactVar && !code.includes("// SSR-PATCH: React alias")) {
    // Inject alias right after the React$1 declaration
    code = code.replace(
      `const ${reactVar} = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);`,
      `const ${reactVar} = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);\n// SSR-PATCH: React alias\nconst React = ${reactVar};`
    );
    writeFileSync(bundlePath, code);
    console.log(`   Patched: aliased React → ${reactVar}`);
  } else if (!reactVar) {
    console.warn("   ⚠️  Could not find React variable name — bundle may fail");
  }

  // Load the patched CJS bundle
  const { createRequire } = await import("module");
  const req = createRequire(import.meta.url);
  const { render } = req(bundlePath);

  const appHtml = render();

  // Read the Vite-built client index.html
  const templatePath = resolve(root, "dist/public/index.html");
  const template = readFileSync(templatePath, "utf-8");

  // Inject the rendered HTML into the root div
  const html = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`
  );

  writeFileSync(templatePath, html);

  // GitHub Pages has no SPA rewrite rule (netlify.toml / _redirects are ignored
  // there). Shipping 404.html as a copy of index.html makes any unknown path
  // boot the app instead of showing GitHub's default 404.
  writeFileSync(resolve(root, "dist/public/404.html"), html);

  const textLength = appHtml.replace(/<[^>]+>/g, "").trim().length;
  console.log(`✅ Prerender complete — injected ~${textLength.toLocaleString()} characters of text content`);
}

prerender().catch((err) => {
  console.error("❌ Prerender failed:", err);
  process.exit(1);
});
