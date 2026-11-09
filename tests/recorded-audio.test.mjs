import test from "node:test";
import assert from "node:assert/strict";
import { audioClips, audioTextKey, recordingForText, recordingKey, isRecordingPackComplete } from "../src/lib/audio-catalog.ts";
import { lessons } from "../src/lib/course.ts";
const phrases=lessons.flatMap(day=>day.phrases), turns=lessons.flatMap(day=>day.turns), words=lessons.flatMap(day=>day.words);
test("Recording script covers all spoken lesson content and preserves meaningful words", () => {
  for (const text of [...phrases.map((p) => p.phrase), ...turns.flatMap((turn) => [turn.es, turn.hint]), ...words.map((word) => word.es), "Hola. Quiero un café con leche, por favor."]) {
    assert.ok(recordingForText(text, "female", "natural"), text);
    assert.ok(recordingForText(text, "male", "slow"), text);
  }
  assert.equal(new Set(audioClips.map((clip) => clip.id)).size, audioClips.length);
  assert.equal(new Set(audioClips.map((clip) => audioTextKey(clip.text))).size, audioClips.length);
  assert.equal(recordingForText("Quiero un café.", "female", "natural"), "female/natural/order-coffee");
  assert.equal(recordingForText("No quiero un café", "female", "natural"), null);
});
test("A pack activates only when both voices and both deliveries cover every clip", () => {
  const pack = {};
  assert.equal(isRecordingPackComplete(pack), false);
  for (const voice of ["female", "male"]) for (const speed of ["natural", "slow"]) for (const clip of audioClips) pack[recordingKey(clip.id, voice, speed)] = 1;
  assert.equal(isRecordingPackComplete(pack), true);
  delete pack["male/slow/order-coffee"];
  assert.equal(isRecordingPackComplete(pack), false);
});
