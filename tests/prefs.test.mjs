import test from "node:test";
import assert from "node:assert/strict";
import { defaultPrefs, restorePrefs, resolveLanguage, selectVoice, speechRate, tutorName, validTime } from "../src/domain/prefs.ts";
import { de } from "../src/i18n/de.ts";
import { en } from "../src/i18n/en.ts";
test("Preferences survive damaged storage and stay opt-in", () => {
  for (const raw of [null, "broken", "[]", "null"]) assert.deepEqual(restorePrefs(raw), defaultPrefs);
  const r = restorePrefs(JSON.stringify({ onboarded: true, voice: "x", reminder: "true", reminderTime: "25:00", language: "fr", speed: "slow" }));
  assert.deepEqual([r.onboarded, r.voice, r.reminder, r.reminderTime, r.language, r.speed], [true, "female", false, "19:00", "system", "slow"]);
  const chosen = { ...defaultPrefs, onboarded: true, voice: "male", voiceId: "jorge", reminder: true, reminderTime: "08:05", language: "en" };
  assert.deepEqual(restorePrefs(JSON.stringify(chosen)), chosen);
  for (const t of ["00:00", "23:59"]) assert(validTime(t));
  for (const t of ["24:00", "8:00", ""]) assert(!validTime(t));
});
test("Language resolves for DE, US/UK English and falls back to English", () => {
  assert.equal(resolveLanguage("system", ["de-DE"]), "de"); assert.equal(resolveLanguage("system", ["en-GB"]), "en");
  assert.equal(resolveLanguage("system", ["fr-FR", "de-AT"]), "de"); assert.equal(resolveLanguage("system", ["fr-FR"]), "en");
  assert.equal(resolveLanguage("en", ["de-DE"]), "en");
});
test("Lucía gets a female and Mateo a male voice; natural voices first; snail is clearly slower", () => {
  const ios = [
    { name: "Grandpa", identifier: "com.apple.eloquence.es-ES.Grandpa", language: "es-ES", gender: "male" },
    { name: "Jorge", identifier: "com.apple.voice.compact.es-ES.Jorge", language: "es-ES", gender: "male" },
    { name: "Shelley", identifier: "com.apple.eloquence.es-ES.Shelley", language: "es-ES", gender: "female" },
    { name: "Paulina", identifier: "com.apple.voice.compact.es-MX.Paulina", language: "es-MX", gender: "female" },
    { name: "Mónica", identifier: "com.apple.voice.compact.es-ES.Monica", language: "es-ES", gender: "female" },
    { name: "Marisol", identifier: "com.apple.voice.enhanced.es-ES.Marisol", language: "es-ES", gender: "female", quality: "Enhanced" },
    { name: "Anna", identifier: "de", language: "de-DE", gender: "female" },
  ];
  assert.equal(selectVoice(ios, "es-ES", "female", null).name, "Marisol");
  assert.equal(selectVoice(ios, "es-ES", "male", null).name, "Jorge");
  assert.equal(selectVoice(ios, "es-ES", "male", "com.apple.voice.compact.es-MX.Paulina").name, "Paulina");
  assert.equal(selectVoice(ios, "es-ES", "female", "de").name, "Marisol", "foreign-language id is ignored");
  assert.equal(selectVoice([{ name: "Monica", identifier: "m", language: "es_ES" }], "es-ES", "female", null).name, "Monica");
  assert.equal(selectVoice([{ name: "X", identifier: "x", language: "es-ES", gender: "unspecified" }], "es-ES", "female", null), undefined);
  assert(speechRate("slow") < speechRate("natural") * 0.7);
  assert.deepEqual([tutorName("female"), tutorName("male")], ["Lucía", "Mateo"]);
});
test("German and English UI catalogues have identical keys and no empty strings", () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(de).sort());
  for (const [key, value] of [...Object.entries(de), ...Object.entries(en)]) assert(String(value).trim(), key);
});
