import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const source = resolve(root, "client/src/data/predictions-status.json");
const destination = resolve(root, "client/public/predictions-status.json");

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);
console.log("Synced static prediction-status configuration.");
