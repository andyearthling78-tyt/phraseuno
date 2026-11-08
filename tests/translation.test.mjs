import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveLanguage,
  restorePreference,
  translate,
} from "../src/lib/translation.ts";
import { phrases, words, turns, fresh, restore } from "../src/lib/learning.ts";
import { privacySections, usageSections, provider } from "../src/lib/legal.ts";
test("US and UK English, German and unsupported devices resolve predictably", () => {
  for (const tag of ["en-US", "en-GB", "en"])
    assert.equal(resolveLanguage("system", [tag]), "en");
  assert.equal(resolveLanguage("system", ["de-DE"]), "de");
  assert.equal(resolveLanguage("system", ["fr-FR"]), "en");
  assert.equal(resolveLanguage("system", ["fr-FR", "de-AT"]), "de");
  assert.equal(resolveLanguage("de", ["en-US"]), "de");
  assert.equal(resolveLanguage("en", ["de-DE"]), "en");
});
test("Stored language choices are validated separately from learning progress", () => {
  for (const value of ["de", "en"])
    assert.equal(restorePreference(value), value);
  for (const value of [null, "bad", "system"])
    assert.equal(restorePreference(value), "system");
  const before = { ...fresh(), build: 2, stage: "build" };
  assert.deepEqual(restore(JSON.stringify(before)), before);
});
test("Every lesson explanation and teacher response has an English translation", () => {
  const all = [
    ...phrases.flatMap((p) => [p.de, p.tip]),
    ...words.flatMap((w) => [w.de, w.note]),
    ...turns.flatMap((t) => [t.de, t.success, t.help]),
  ];
  for (const text of all) assert.notEqual(translate(text, "en"), text, text);
});
test("Privacy and usage sections are translated without changing provider identity", () => {
  for (const section of [...privacySections, ...usageSections]) {
    assert.notEqual(translate(section.title, "en"), section.title);
    if (section.title !== "Wer verantwortlich ist")
      assert.notEqual(translate(section.text, "en"), section.text);
  }
  assert.equal(translate(provider.name, "en"), provider.name);
  assert.equal(translate(provider.email, "en"), provider.email);
});
test("Spanish targets stay Spanish and saved German feedback switches for display", () => {
  for (const p of phrases) assert.equal(translate(p.phrase, "en"), p.phrase);
  const original = "¡Muy bien! " + phrases[0].tip;
  assert.match(translate(original, "en"), /I’d like/);
  assert.equal(translate(original, "de"), original);
  assert.equal(translate("café zurücklegen", "en"), "Put café back");
  assert.equal(
    translate("Karte umdrehen: der Kaffee", "en"),
    "Flip card: coffee",
  );
});
