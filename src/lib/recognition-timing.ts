// Pure timing helpers for handing the audio session between speech output and
// microphone recognition. Kept free of native imports so it can be unit-tested.
export const SETTLE_MS = 350;
export function createRecognitionGate(now: () => number = Date.now, sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))) {
  let running = false;
  let lastEnd = 0;
  let waiters: (() => void)[] = [];
  return {
    get running() { return running; },
    started() { running = true; },
    ended() {
      running = false; lastEnd = now();
      const pending = waiters; waiters = []; pending.forEach((resolve) => resolve());
    },
    // Resolves once the native recognizer has fully ended and the audio session had time to settle.
    async idle(timeout = 2000) {
      if (running) await Promise.race([new Promise<void>((resolve) => waiters.push(resolve)), sleep(timeout)]);
      const wait = lastEnd + SETTLE_MS - now();
      if (wait > 0) await sleep(wait);
    },
  };
}
