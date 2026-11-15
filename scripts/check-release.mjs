// Release gate. `node scripts/check-release.mjs` lists what still blocks a store submission
// and exits with status 1 while anything is open.
import fs from "node:fs";
const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const app = JSON.parse(read("app.json")).expo;
const provider = read("src/content/provider.ts");
const open = [];
if (/email: ""/.test(provider)) open.push("Impressum: E-Mail-Adresse fehlt (src/content/provider.ts)");
if (/vatId: ""/.test(provider)) open.push("Impressum: USt-IdNr. fehlt (src/content/provider.ts)");
if (!app.extra?.revenueCat?.ios) open.push("RevenueCat: iOS-API-Schlüssel fehlt (app.json → extra.revenueCat.ios)");
if (!app.extra?.revenueCat?.android) open.push("RevenueCat: Android-API-Schlüssel fehlt (app.json → extra.revenueCat.android)");
if (read("src/content/legal.ts").includes("DRAFT")) open.push("Rechtstexte: Entwurf – juristische Prüfung und Freigabe ausstehend (src/content/legal.ts)");
for (const asset of ["assets/icon.png", "assets/adaptive-icon.png", "assets/splash.png"]) if (!fs.existsSync(new URL(`../${asset}`, import.meta.url))) open.push(`Grafik fehlt: ${asset}`);
if (open.length) { console.log(`${open.length} offene Punkte vor der Einreichung:\n- ${open.join("\n- ")}`); process.exit(1); }
console.log("Keine offenen Punkte in dieser Prüfung. Store-Konten, Produkte und Tests bleiben gesondert zu prüfen.");
