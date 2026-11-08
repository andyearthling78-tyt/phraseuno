import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { audioClips, recordingKey, recordingVoices, recordingSpeeds } from "../src/lib/audio-catalog.ts";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const audioDir = resolve(root, "assets/audio/spanish");
const production = JSON.parse(readFileSync(resolve(audioDir, "production.json"), "utf8"));
const problems = [], entries = [];
for (const voice of recordingVoices) {
  if (!production.voices?.[voice]?.performerOrModel?.trim() || !production.voices?.[voice]?.rightsReference?.trim()) problems.push(`${voice}: production source/rights reference missing`);
  for (const speed of recordingSpeeds) for (const clip of audioClips) {
    const key = recordingKey(clip.id, voice, speed);
    const filename = `${voice}-${speed}-${clip.id}.mp3`;
    const path = resolve(audioDir, filename);
    if (!existsSync(path)) { problems.push(`${filename}: missing`); continue; }
    const data = readFileSync(path);
    const sha = createHash("sha256").update(data).digest("hex");
    const mp3 = data.subarray(0, 3).toString() === "ID3" || (data[0] === 255 && (data[1] & 224) === 224);
    if (data.length < 1000 || !mp3) { problems.push(`${filename}: invalid MP3`); continue; }
    if (production.approvedSha256?.[key] !== sha) { problems.push(`${filename}: requires listening approval for SHA-256 ${sha}`); continue; }
    entries.push(`  ${JSON.stringify(key)}: require(${JSON.stringify(`../../assets/audio/spanish/${filename}`)}),`);
  }
}
if (problems.length) {
  process.stderr.write(`Audio pack not ready (${problems.length} checks failed). Existing app playback remains unchanged.\n${problems.join("\n")}\n`);
  process.exitCode = 1;
} else if (process.argv.includes("--write")) {
  writeFileSync(resolve(root, "src/lib/recorded-assets.ts"), `// Generated: complete, reviewed offline voice pack.\nexport const recordedAssets: Record<string, number> = {\n${entries.join("\n")}\n};\n`);
  process.stdout.write(`Bundled ${entries.length} approved recordings.\n`);
} else process.stdout.write(`Validated ${entries.length} approved recordings. Use --write to activate.\n`);
