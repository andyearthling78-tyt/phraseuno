// Pure coordination between speech output and the microphone. No native imports: unit-tested.
export const SETTLE_MS = 350;
/** App-wide view of the recogniser, so the tutor never talks while the microphone is being torn down. */
export function createRecognitionGate(now: () => number = Date.now, sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))) {
  let running = false, lastEnd = 0, waiters: (() => void)[] = [];
  return {
    get running() { return running; },
    started() { running = true; },
    ended() { running = false; lastEnd = now(); const pending = waiters; waiters = []; pending.forEach((resolve) => resolve()); },
    async idle(timeout = 2000) {
      if (running) await Promise.race([new Promise<void>((resolve) => waiters.push(resolve)), sleep(timeout)]);
      const wait = lastEnd + SETTLE_MS - now();
      if (wait > 0) await sleep(wait);
    },
  };
}
export type SpeakRequest = { text: string; voice: string; language: string; rate: number; onDone?: () => void; onError?: (error: Error) => void };
type Adapter = { stop: () => Promise<void>; prepare: () => Promise<void>; speak: (request: SpeakRequest) => void };
/** Serialises stop/prepare/speak; a newer request cancels older ones and silences their callbacks. */
export function createSpeechController(adapter: Adapter) {
  let generation = 0;
  let pending = Promise.resolve();
  return {
    speak(request: SpeakRequest) {
      const token = ++generation;
      pending = pending.then(async () => {
        if (token !== generation) return;
        await adapter.stop();
        if (token !== generation) return;
        await adapter.prepare();
        if (token !== generation) return;
        adapter.speak({ ...request,
          onDone: () => { if (token === generation) request.onDone?.(); },
          onError: (error) => { if (token === generation) request.onError?.(error); } });
      }).catch((error: unknown) => { if (token === generation) request.onError?.(error instanceof Error ? error : new Error(String(error))); });
      return pending;
    },
    stop() { generation++; pending = pending.then(() => adapter.stop()).catch(() => {}); return pending; },
  };
}
/** Serialises saves and deletion so an older pending write cannot restore deleted data. */
export function createStorageQueue(adapter: { setItem: (key: string, value: string) => Promise<void>; removeItem: (key: string) => Promise<void> }, key: string) {
  let pending = Promise.resolve();
  const run = (task: () => Promise<void>) => { const result = pending.then(task); pending = result.catch(() => {}); return result; };
  return { save: (value: string) => run(() => adapter.setItem(key, value)), clear: () => run(() => adapter.removeItem(key)) };
}
// Recognition settings: Spanish, on-device only, nothing persisted, one shared play-and-record
// audio session with speech output so nothing gets cut off when switching.
export const SILENCE_MS = 1700;
export const START_TIMEOUT_MS = 4000;
export const MAX_LISTEN_MS = 15000;
export function recognitionOptions(locale: string, expected: readonly string[]) {
  const hints = [...new Set(expected.flatMap((e) => [e, ...e.replace(/[.,;:¿?¡!]/g, "").split(/\s+/)]).filter((e) => e.length > 1))].slice(0, 100);
  return {
    lang: locale, interimResults: true, continuous: true, maxAlternatives: 3,
    requiresOnDeviceRecognition: true, recordingOptions: { persist: false }, iosTaskHint: "dictation" as const,
    iosCategory: { category: "playAndRecord" as const, categoryOptions: ["defaultToSpeaker" as const, "allowBluetooth" as const, "mixWithOthers" as const], mode: "default" as const },
    volumeChangeEventOptions: { enabled: true, intervalMillis: 120 }, contextualStrings: hints,
  };
}
export const micLevel = (value: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value / 8)) : 0);
export const audioMode = { playsInSilentMode: true, allowsRecording: true, shouldPlayInBackground: false, shouldRouteThroughEarpiece: false, interruptionMode: "mixWithOthers" as const };
