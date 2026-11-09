import test from 'node:test';
import assert from 'node:assert/strict';
import { createRecognitionGate, SETTLE_MS } from '../src/lib/recognition-timing.ts';
import { micLevel, recognitionOptions, recognitionError } from '../src/lib/oral-model.ts';
import { learningAudioMode } from '../src/lib/speech-controller.ts';
test('Speech waits until the microphone has ended and the audio session settled', async () => {
  let clock = 1000; const slept = [];
  const gate = createRecognitionGate(() => clock, async (ms) => { slept.push(ms); clock += ms; });
  await gate.idle(); assert.deepEqual(slept, [], 'no wait without any recognition');
  gate.started(); assert.equal(gate.running, true);
  const waiting = gate.idle(60000);
  gate.ended(); await waiting;
  assert.equal(gate.running, false);
  assert.equal(slept.at(-1), SETTLE_MS, 'settle time after the microphone ended');
  clock += 5000; slept.length = 0; await gate.idle(); assert.deepEqual(slept, []);
});
test('Speech output and microphone share one play-and-record session; level is bounded', () => {
  assert.equal(learningAudioMode.allowsRecording, true);
  assert.equal(recognitionOptions.iosCategory.category, 'playAndRecord');
  assert(recognitionOptions.iosCategory.categoryOptions.includes('defaultToSpeaker'));
  assert.equal(recognitionOptions.volumeChangeEventOptions.enabled, true);
  assert.equal(micLevel(-2), 0); assert.equal(micLevel(4), 0.5); assert.equal(micLevel(20), 1); assert.equal(micLevel(NaN), 0);
  assert.match(recognitionError('interrupted'), /unterbrochen/);
});
