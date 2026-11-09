export const learningAudioMode = {
  playsInSilentMode: true,
  // Same play-and-record session as the microphone exercise: no category switch
  // between Lucía/Mateo speaking and the learner answering, so nothing gets cut off.
  allowsRecording: true,
  shouldPlayInBackground: false,
  shouldRouteThroughEarpiece: false,
  interruptionMode: "mixWithOthers" as const,
};
// 🐇 natural vs. 🐌 slow learning speed for device voices.
export function speechRate(speed: "natural" | "slow" | undefined) { return speed === "slow" ? 0.55 : 0.9; }
export type LearningSpeechRequest = {
  text: string;
  recording?: { voice: "female" | "male"; speed: "natural" | "slow" };
  voice: { identifier: string; language: string };
  onError: (error: Error) => void;
  onDone?: () => void;
};
type SpeechAdapter = {
  stop: () => Promise<void>;
  prepare: () => Promise<void>;
  speak: (text: string, options: {
    recording?: LearningSpeechRequest["recording"];
    voice: string; language: string; rate: number; volume: number;
    useApplicationAudioSession: boolean; onDone?: () => void; onError: (error: Error) => void;
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
          recording: request.recording,
          onDone: () => { if (token === generation) request.onDone?.(); },
          voice: request.voice.identifier, language: request.voice.language,
          rate: speechRate(request.recording?.speed), volume: 1, useApplicationAudioSession: true,
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
