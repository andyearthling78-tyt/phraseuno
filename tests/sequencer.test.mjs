import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRecognitionGate, createSpeechController, createStorageQueue, recognitionOptions, micLevel, audioMode, SETTLE_MS } from "../src/services/sequencer.ts";
test("Speech waits until the microphone has ended and the audio session settled", async () => {
  let clock = 1000; const slept = [];
  const gate = createRecognitionGate(() => clock, async (ms) => { slept.push(ms); clock += ms; });
  await gate.idle(); assert.deepEqual(slept, []);
  gate.started(); const waiting = gate.idle(60000); gate.ended(); await waiting;
  assert.equal(gate.running, false); assert.equal(slept.at(-1), SETTLE_MS);
});
test("A newer speech request cancels the older one and silences its callbacks", async () => {
  const spoken = []; let release;
  const controller = createSpeechController({ stop: async () => {}, prepare: () => new Promise((r) => { release = r; }), speak: (r) => spoken.push(r) });
  let firstDone = false;
  const first = controller.speak({ text: "uno", voice: "v", language: "es-ES", rate: 0.9, onDone: () => { firstDone = true; } });
  await new Promise((r) => setTimeout(r, 5));
  const second = controller.speak({ text: "dos", voice: "v", language: "es-ES", rate: 0.55 });
  release(); await first; await new Promise((r) => setTimeout(r, 5)); release(); await second;
  assert.deepEqual(spoken.map((r) => [r.text, r.rate]), [["dos", 0.55]]); assert.equal(firstDone, false);
});
test("Storage queue: a pending save can never resurrect deleted data", async () => {
  const store = new Map(); const order = [];
  const queue = createStorageQueue({ setItem: async (k, v) => { await new Promise((r) => setTimeout(r, 10)); store.set(k, v); order.push("save"); },
    removeItem: async (k) => { store.delete(k); order.push("clear"); } }, "k");
  const save = queue.save("old"); const clear = queue.clear(); await Promise.all([save, clear]);
  assert.deepEqual(order, ["save", "clear"]); assert.equal(store.has("k"), false);
});
test("Recognition is on-device only, stores no audio, shares the audio session; privacy patches are applied", () => {
  const o = recognitionOptions("es-ES", ["Para llevar, por favor."]);
  assert.equal(o.requiresOnDeviceRecognition, true); assert.equal(o.recordingOptions.persist, false);
  assert.equal(o.iosCategory.category, "playAndRecord"); assert.equal(audioMode.allowsRecording, true);
  assert.deepEqual(o.contextualStrings, ["Para llevar, por favor.", "Para", "llevar", "por", "favor"]);
  assert.deepEqual([micLevel(-2), micLevel(4), micLevel(20), micLevel(NaN)], [0, 0.5, 1, 0]);
  const recognizer = fs.readFileSync(new URL("../node_modules/expo-speech-recognition/ios/ExpoSpeechRecognizer.swift", import.meta.url), "utf8");
  assert(recognizer.includes("// PhraseUNO: never silently fall back to server recognition."));
  const speech = fs.readFileSync(new URL("../node_modules/expo-speech/ios/SpeechModule.swift", import.meta.url), "utf8");
  assert(speech.includes('gender: voice.gender == .female ? "female"'));
});
