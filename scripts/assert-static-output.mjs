import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const output = resolve(root, "dist/public");

const routes = [
  { file: "index.html", canonical: "https://themissingmeter.org/", minMainText: 8000, required: ["The Missing Meter", "Nine predictions", "Public materials for the exhibits and worked example"] },
  { file: "publications/index.html", canonical: "https://themissingmeter.org/publications/", minMainText: 300, required: ["Research publications", "The Missing Meter", "Publications"] },
  { file: "publications/the-missing-meter/index.html", canonical: "https://themissingmeter.org/publications/the-missing-meter/", minMainText: 400, required: ["Publication record", "Abstract", "Download final PDF"] },
  { file: "materials/index.html", canonical: "https://themissingmeter.org/materials/", minMainText: 500, required: ["Public data and documents", "Available downloads", "Worked example"] },
];

function textFromMain(html) {
  const match = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!match) return "";
  return match[1]
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|quot|#39|lt|gt);/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

for (const route of routes) {
  const html = readFileSync(resolve(output, route.file), "utf8");
  const main = textFromMain(html);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (!html.includes(`rel="canonical" href="${route.canonical}"`)) {
    throw new Error(`${route.file}: missing exact canonical ${route.canonical}`);
  }
  if (h1Count !== 1) throw new Error(`${route.file}: expected one H1, found ${h1Count}`);
  if (main.length < route.minMainText) {
    throw new Error(`${route.file}: initial HTML contains only ${main.length} main-text characters`);
  }
  for (const value of route.required) {
    if (!main.includes(value)) throw new Error(`${route.file}: missing crawler-visible text: ${value}`);
  }
}

const feed = JSON.parse(readFileSync(resolve(output, "publications.json"), "utf8"));
if (!Array.isArray(feed.publications) || feed.publications.length < 1) {
  throw new Error("publications.json: expected at least one publication");
}
if (!feed.publications[0].url || !feed.publications[0].pdf) {
  throw new Error("publications.json: first publication needs both URL and PDF");
}

console.log(`Static route check passed for ${routes.length} HTML documents and publications.json.`);
