import * as Speech from "expo-speech";
import { setAudioModeAsync, setIsAudioActiveAsync } from "expo-audio";
import { createSpeechController, learningAudioMode } from "./speech-controller";
export const learningSpeech = createSpeechController({
  stop: () => Speech.stop(),
  prepare: async () => {
    await setAudioModeAsync(learningAudioMode);
    await setIsAudioActiveAsync(true);
  },
  speak: (text, options) => Speech.speak(text, options),
});
