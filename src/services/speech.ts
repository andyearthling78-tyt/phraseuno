import * as Speech from "expo-speech";
import { setAudioModeAsync, setIsAudioActiveAsync } from "expo-audio";
import { ExpoSpeechRecognitionModule as Recognition } from "expo-speech-recognition";
import { audioMode, createRecognitionGate, createSpeechController } from "./sequencer";
export const recognitionGate = createRecognitionGate();
Recognition.addListener("start", () => recognitionGate.started());
Recognition.addListener("end", () => recognitionGate.ended());
export const speech = createSpeechController({
  stop: async () => { await Speech.stop(); },
  prepare: async () => { await setAudioModeAsync(audioMode); await setIsAudioActiveAsync(true); },
  speak: ({ text, voice, language, rate, onDone, onError }) =>
    Speech.speak(text, { voice, language, rate, volume: 1, useApplicationAudioSession: true, onDone, onError }),
});
export const loadVoices = () => Speech.getAvailableVoicesAsync();
