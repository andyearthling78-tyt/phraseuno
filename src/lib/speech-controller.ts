export const learningAudioMode = {
  playsInSilentMode: true,
  allowsRecording: false,
  shouldPlayInBackground: false,
  shouldRouteThroughEarpiece: false,
  interruptionMode: "mixWithOthers" as const,
};
export type LearningSpeechRequest = {
  text: string;
  voice: { identifier: string; language: string };
  onError: (error: Error) => void;
};
type SpeechAdapter = {
  stop: () => Promise<void>;
  prepare: () => Promise<void>;
  speak: (text: string, options: {
    voice: string; language: string; rate: number; volume: number;
    useApplicationAudioSession: boolean; onError: (error: Error) => void;
  }) => void;
};
// Serialize native stop/configuration calls; a newer tap cancels any older request
// that is still waiting for the audio session to become ready.
export function createSpeechController(adapter: SpeechAdapter) {
  let generation = 0;
  let pending = Promise.resolve();
  return {
    speak(request: LearningSpeechRequest) {
      const token = ++generation;
      pending = pending.then(async () => {
        if (token !== generation) return;
        await adapter.stop();
        if (token !== generation) return;
        await adapter.prepare();
        if (token !== generation) return;
        adapter.speak(request.text, {
          voice: request.voice.identifier, language: request.voice.language,
          rate: 0.85, volume: 1, useApplicationAudioSession: true,
          onError: (error) => { if (token === generation) request.onError(error); },
        });
      }).catch((error: unknown) => {
        if (token === generation) request.onError(error instanceof Error ? error : new Error(String(error)));
      });
      return pending;
    },
    stop() {
      generation++;
      pending = pending.then(() => adapter.stop()).catch(() => {});
      return pending;
    },
  };
}
