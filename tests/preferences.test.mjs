import test from "node:test";
import assert from "node:assert/strict";
import { restorePreferences, defaultPreferences, validTime, selectVoice } from "../src/lib/preferences-model.ts";
import { createReminderQueue } from "../src/lib/reminder-queue.ts";
test("Preferences validate damaged storage and keep onboarding/reminders opt-in", () => {
  for (const value of [null, "broken", "[]", "null"]) assert.deepEqual(restorePreferences(value), defaultPreferences);
  const restored = restorePreferences(JSON.stringify({ onboarded: true, goal: 100, voiceGender: "invalid", reminderEnabled: "true", reminderTime: "25:00" }));
  assert.equal(restored.onboarded, true);
  assert.equal(restored.goal, 10);
  assert.equal(restored.voiceGender, "female");
  assert.equal(restored.reminderEnabled, false);
  assert.equal(restored.reminderTime, "19:00");
  const chosen = { ...defaultPreferences, goal: 5, voiceGender: "male", voiceId: "jorge", reminderEnabled: true, reminderTime: "08:05", onboarded: true };
  assert.deepEqual(restorePreferences(JSON.stringify(chosen)), chosen);
});
test("Reminder time rejects impossible and ambiguous input", () => {
  for (const time of ["00:00", "23:59", "08:05"]) assert.ok(validTime(time));
  for (const time of ["24:00", "12:60", "8:00", "12:30pm", "-1:20", ""]) assert.equal(validTime(time), false);
});
const voices = [
  { name: "Monica", identifier: "female-es", language: "es-ES" },
  { name: "Jorge", identifier: "male-es", language: "es-ES" },
  { name: "Engine unknown", identifier: "engine-es", language: "es-MX" },
  { name: "Jorge", identifier: "wrong-language", language: "en-US" },
];
test("Voice selection uses existing Spanish voices and never guesses unknown gender", () => {
  assert.equal(selectVoice(voices, "female", null)?.identifier, "female-es");
  assert.equal(selectVoice(voices, "male", "removed")?.identifier, "male-es");
  assert.equal(selectVoice(voices, "male", "engine-es")?.identifier, "engine-es");
  assert.equal(selectVoice(voices.slice(2), "female", null), undefined);
  assert.equal(selectVoice(voices, "male", "wrong-language")?.identifier, "male-es");
});
test("Reminder edits serialize replacement, disabling removes schedule, denial never schedules", async () => {
  let scheduled = null;
  let allowed = true;
  const queue = createReminderQueue({
    cancel: async () => { scheduled = null; }, allowed: async () => allowed,
    schedule: async (value) => { scheduled = value; },
  });
  const first = queue({ enabled: true, time: "19:00", language: "de" });
  const second = queue({ enabled: true, time: "08:00", language: "en" });
  await Promise.all([first, second]);
  assert.deepEqual(scheduled, { enabled: true, time: "08:00", language: "en" });
  assert.equal(await queue({ enabled: false, time: "08:00", language: "en" }), "off");
  assert.equal(scheduled, null);
  allowed = false;
  assert.equal(await queue({ enabled: true, time: "08:00", language: "en" }), "blocked");
  assert.equal(scheduled, null);
});
test("A reminder scheduling failure does not break later disabling", async () => {
  let cancelled = 0;
  const queue = createReminderQueue({ cancel: async () => { cancelled++; }, allowed: async () => true,
    schedule: async () => { throw Error("OS failure"); } });
  await assert.rejects(queue({ enabled: true, time: "19:00", language: "de" }));
  assert.equal(await queue({ enabled: false, time: "19:00", language: "de" }), "off");
  assert.equal(cancelled, 2);
});

test("Daily learning moments rotate and preserve Spanish plus both UI languages", async () => {
  const { dailyMotivation, localDay, motivations } = await import("../src/lib/motivation.ts");
  const { translate } = await import("../src/lib/translation.ts");
  const day = new Date(2026, 10, 8, 23, 59);
  assert.equal(localDay(day), "2026-11-08");
  assert.deepEqual(dailyMotivation(day), dailyMotivation(new Date(2026, 10, 8, 0, 1)));
  assert.notDeepEqual(dailyMotivation(day), dailyMotivation(new Date(2026, 10, 9)));
  for (const quote of motivations) {
    assert.equal(translate(quote.es, "en"), quote.es);
    assert.notEqual(translate(quote.de, "en"), quote.de);
  }
  assert.equal(restorePreferences(JSON.stringify({ lastMotivationDay: "2026-11-08" })).lastMotivationDay, "2026-11-08");
});
