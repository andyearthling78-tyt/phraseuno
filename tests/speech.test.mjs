import test from "node:test";
import assert from "node:assert/strict";
import { createSpeechController, learningAudioMode } from "../src/lib/speech-controller.ts";
const request = (text, onError = () => {}) => ({ text, voice: { identifier: "monica", language: "es-ES" }, onError });
test("Speech awaits stop and playback session, and uses full utterance volume", async () => {
  const calls = [];
  const controller = createSpeechController({
    stop: async () => { calls.push("stop"); }, prepare: async () => { calls.push("prepare"); },
    speak: (text, options) => { calls.push("speak"); assert.equal(text, "café"); assert.equal(options.volume, 1); assert.equal(options.useApplicationAudioSession, true); assert.equal(options.voice, "monica"); },
  });
  await controller.speak(request("café"));
  assert.deepEqual(calls, ["stop", "prepare", "speak"]);
  assert.equal(learningAudioMode.playsInSilentMode, true);
  assert.equal(learningAudioMode.allowsRecording, false);
  assert.equal(learningAudioMode.shouldRouteThroughEarpiece, false);
});
test("Rapid requests play only the newest phrase and cleanup cancels pending speech", async () => {
  const spoken = [];
  let finishPreparation;
  const controller = createSpeechController({ stop: async () => {},
    prepare: () => new Promise((resolve) => { finishPreparation = resolve; }),
    speak: (text) => spoken.push(text),
  });
  const first = controller.speak(request("old"));
  const latest = controller.speak(request("new"));
  await new Promise((resolve) => setImmediate(resolve));
  finishPreparation();
  await Promise.all([first, latest]);
  assert.deepEqual(spoken, ["new"]);
  const pending = controller.speak(request("cancelled"));
  await new Promise((resolve) => setImmediate(resolve));
  const stopped = controller.stop();
  finishPreparation();
  await Promise.all([pending, stopped]);
  assert.deepEqual(spoken, ["new"]);
});
test("Audio session errors are surfaced and do not break the next attempt", async () => {
  let fail = true;
  const errors = [], spoken = [];
  const controller = createSpeechController({ stop: async () => {}, prepare: async () => { if (fail) throw new Error("audio unavailable"); }, speak: (text) => spoken.push(text) });
  await controller.speak(request("first", (error) => errors.push(error.message)));
  assert.deepEqual(errors, ["audio unavailable"]);
  fail = false;
  await controller.speak(request("retry"));
  assert.deepEqual(spoken, ["retry"]);
});
test('Playback completion belongs to the current phrase; stopped audio cannot enable a later microphone step', async () => {
 const completions=[]; const native=[];
 const controller=createSpeechController({stop:async()=>{},prepare:async()=>{},speak:(_text,options)=>native.push(options.onDone)});
 await controller.speak({...request('first'),onDone:()=>completions.push('first')});
 await controller.speak({...request('second'),onDone:()=>completions.push('second')});
 native[0](); assert.deepEqual(completions,[]);
 native[1](); assert.deepEqual(completions,['second']);
 await controller.stop();native[1]();assert.deepEqual(completions,['second']);
});
