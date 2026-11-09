import * as Speech from "expo-speech";
import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from "expo-audio";
import { createSpeechController, learningAudioMode } from "./speech-controller";
import { recordedSource } from "./recorded-audio";
let player: ReturnType<typeof createAudioPlayer> | null = null;
let subscription: { remove: () => void } | null = null;
function releaseRecording() {
  subscription?.remove(); subscription = null;
  player?.remove(); player = null;
}
export const learningSpeech = createSpeechController({
  stop: async () => { releaseRecording(); await Speech.stop(); },
  prepare: async () => {
    await setAudioModeAsync(learningAudioMode);
    await setIsAudioActiveAsync(true);
  },
  speak: (text, options) => {
    const { recording, ...speechOptions } = options;
    const source = recording ? recordedSource(text, recording.voice, recording.speed) : undefined;
    if (source === undefined) { Speech.speak(text, speechOptions); return; }
    const current = createAudioPlayer(source);
    player = current;
    current.volume = 1;
    subscription = current.addListener("playbackStatusUpdate", (status) => {
      if (player !== current) return;
      if (status.error) { releaseRecording(); options.onError(new Error(status.error)); }
      else if (status.didJustFinish) { releaseRecording(); options.onDone?.(); }
    });
    current.play();
  },
});
