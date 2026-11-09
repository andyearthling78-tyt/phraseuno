import fs from 'node:fs';
import assert from 'node:assert/strict';
const root = new URL('../release/', import.meta.url);
const metadata = JSON.parse(fs.readFileSync(new URL('metadata.json', root)));
let checked = 0;
for (const locale of ['de-DE', 'en-US', 'en-GB']) {
  const value = metadata.locales[locale];
  for (const [key, maximum] of Object.entries({name:30, subtitle:30, shortDescription:80, promotionalText:170, keywords:100, description:4000})) {
    assert(value[key]?.trim(), `${locale}: ${key} missing`);
    assert([...value[key]].length <= maximum, `${locale}: ${key} exceeds ${maximum}`);
    checked++;
  }
}
const manifest = JSON.parse(fs.readFileSync(new URL('screenshots/manifest.json', root)));
for (const shot of manifest.screenshots) {
  const bytes = fs.readFileSync(new URL(shot.file, root));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16), shot.width);
  assert.equal(bytes.readUInt32BE(20), shot.height);
  assert.equal(bytes[25], 2, `${shot.file}: RGB without alpha required`);
  checked++;
}
for (const lang of ['de', 'en']) {
  for (const page of ['privacy', 'imprint', 'usage', 'support']) {
    assert(fs.statSync(new URL(`legal-site/${page}-${lang}.html`, root)).size > 200);
    checked++;
  }
}
const config = JSON.parse(fs.readFileSync(new URL('../app.json', root))).expo;
assert.equal(config.ios.bundleIdentifier, metadata.bundleIdentifier);
assert.equal(config.android.package, metadata.bundleIdentifier);
assert.equal(config.ios.buildNumber, String(metadata.build));
assert.equal(config.android.versionCode, metadata.build);
console.log(`${checked} release material checks passed. No store submission performed.`);
if (process.argv.includes('--submission')) {
  const status = JSON.parse(fs.readFileSync(new URL('release-status.json', root)));
  const open = status.submissionGates.filter(gate => gate.status !== 'DONE');
  for (const gate of open) console.error(`OPEN: ${gate.id} — ${gate.reason}`);
  process.exitCode = open.length ? 1 : 0;
}
