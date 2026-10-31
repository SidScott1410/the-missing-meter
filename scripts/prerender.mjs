/**
 * Static document generator for The Missing Meter.
 *
 * Each public route is rendered to its own HTML document. This prevents GitHub
 * Pages from treating the site as a one-document SPA and gives crawlers, fetch
 * clients, and readers without JavaScript complete route-specific HTML.
 */

import { build } from "vite";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const siteOrigin = "https://themissingmeter.org";

const ROUTES = [
  {
    path: "/",
    output: "index.html",
    title: "The Missing Meter | AI Infrastructure Economics and the Served Token",
    description: "A research paper by Sidney Scott on the served token as a unit of account for AI infrastructure, with exhibits, predictions, appendix, and public materials.",
    canonical: `${siteOrigin}/`,
    type: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      headline: "The Missing Meter: What every infrastructure buildout leaves behind, and the unit AI still lacks",
      description: "AI is the first trillion-dollar infrastructure buildout that cannot yet state, in a standard unit, what its output costs. This paper proposes the served token as the missing unit of account for AI inference.",
      author: { "@type": "Person", name: "Sidney Scott", email: "sidney@theashbyinstitute.org", affiliation: { "@type": "Organization", name: "The Ashby Institute" } },
      datePublished: "2026-07-15",
      dateModified: "2026-10-31",
      url: `${siteOrigin}/`,
      sameAs: `${siteOrigin}/publications/the-missing-meter/`,
      encoding: `${siteOrigin}/downloads/The_Missing_Meter.pdf`,
      isAccessibleForFree: true,
      inLanguage: "en",
    },
  },
  {
    path: "/publications/",
    output: "publications/index.html",
    title: "Publications | The Missing Meter",
    description: "A server-readable index of research publications from The Missing Meter, with stable publication pages, direct PDFs, and public materials.",
    canonical: `${siteOrigin}/publications/`,
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "The Missing Meter Publications",
      url: `${siteOrigin}/publications/`,
      mainEntity: [{ "@type": "ScholarlyArticle", name: "The Missing Meter", url: `${siteOrigin}/publications/the-missing-meter/`, encoding: `${siteOrigin}/downloads/The_Missing_Meter.pdf` }],
    },
  },
  {
    path: "/publications/the-missing-meter/",
    output: "publications/the-missing-meter/index.html",
    title: "The Missing Meter | Publication Record",
    description: "Publication record for The Missing Meter, a working paper by Sidney Scott on AI infrastructure economics and the served token.",
    canonical: `${siteOrigin}/publications/the-missing-meter/`,
    type: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      headline: "The Missing Meter: What every infrastructure buildout leaves behind, and the unit AI still lacks",
      author: { "@type": "Person", name: "Sidney Scott", affiliation: { "@type": "Organization", name: "The Ashby Institute" } },
      datePublished: "2026-07-15",
      dateModified: "2026-10-01",
      version: "v1.0",
      url: `${siteOrigin}/publications/the-missing-meter/`,
      encoding: `${siteOrigin}/downloads/The_Missing_Meter.pdf`,
      isAccessibleForFree: true,
    },
  },
  {
    path: "/materials/",
    output: "materials/index.html",
    title: "Materials | The Missing Meter",
    description: "Public paper, datasets, and worked example supporting The Missing Meter, available as direct static downloads without JavaScript.",
    canonical: `${siteOrigin}/materials/`,
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "The Missing Meter Materials",
      url: `${siteOrigin}/materials/`,
      hasPart: [
        { "@type": "ScholarlyArticle", name: "The Missing Meter", encoding: `${siteOrigin}/downloads/The_Missing_Meter.pdf` },
        { "@type": "Dataset", name: "Exhibit 1 data", contentUrl: `${siteOrigin}/downloads/exhibit1_scissors.csv` },
        { "@type": "Dataset", name: "Exhibit 2 data", contentUrl: `${siteOrigin}/downloads/exhibit2_served_token.csv` },
      ],
    },
  },
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function injectMetadata(template, route) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*("\s*\/>)/i, `$1${escapeHtml(route.description)}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*("\s*\/>)/i, `$1${escapeHtml(route.title)}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*("\s*\/>)/i, `$1${escapeHtml(route.description)}$2`);
  html = html.replace(/(<meta property="og:type" content=")[^"]*("\s*\/>)/i, `$1${route.type}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*("\s*\/>)/i, `$1${route.canonical}$2`);
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*("\s*\/>)/i, `$1${escapeHtml(route.title)}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*("\s*\/>)/i, `$1${escapeHtml(route.description)}$2`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${route.canonical}" />`);
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script type="application/ld+json">\n${JSON.stringify(route.jsonLd, null, 2)}\n    </script>`);
  return html;
}

async function prerender() {
  console.log("Building self-contained server-render bundle...");
  await build({
    root: resolve(root, "client"),
    base: process.env.VITE_BASE_PATH || "/",
    build: {
      ssr: resolve(root, "client/src/entry-server.tsx"),
      outDir: resolve(root, "dist/server"),
      emptyOutDir: true,
      rollupOptions: { output: { format: "cjs", entryFileNames: "entry-server.cjs" } },
    },
    resolve: { alias: { "@": resolve(root, "client/src"), "@shared": resolve(root, "shared") } },
    ssr: { noExternal: /.*/ },
    logLevel: "warn",
  });

  const bundlePath = resolve(root, "dist/server/entry-server.cjs");
  let bundle = readFileSync(bundlePath, "utf8");
  const reactVar = bundle.match(/const (React\$\d+) = \/\* @__PURE__ \*\/ getDefaultExportFromCjs\(reactExports\)/)?.[1];
  if (reactVar && !bundle.includes("// SSR-PATCH: React alias")) {
    bundle = bundle.replace(
      `const ${reactVar} = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);`,
      `const ${reactVar} = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);\n// SSR-PATCH: React alias\nconst React = ${reactVar};`,
    );
    writeFileSync(bundlePath, bundle);
  }

  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const { render } = require(bundlePath);
  const template = readFileSync(resolve(root, "dist/public/index.html"), "utf8");

  for (const route of ROUTES) {
    const documentHtml = injectMetadata(
      template.replace('<div id="root"></div>', `<div id="root">${render(route.path)}</div>`),
      route,
    );
    const target = resolve(root, "dist/public", route.output);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, documentHtml);
    const textLength = documentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
    console.log(`Rendered ${route.path} -> ${route.output} (${textLength.toLocaleString()} text chars)`);
  }

  const notFound = injectMetadata(
    template.replace('<div id="root"></div>', `<div id="root">${render("/not-found")}</div>`),
    {
      title: "Page not found | The Missing Meter",
      description: "The requested page does not exist.",
      canonical: `${siteOrigin}/404.html`,
      type: "website",
      jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: "Page not found" },
    },
  ).replace("</head>", '<meta name="robots" content="noindex, follow" />\n  </head>');
  writeFileSync(resolve(root, "dist/public/404.html"), notFound);
}

prerender().catch((error) => {
  console.error("Static document generation failed:", error);
  process.exit(1);
});
