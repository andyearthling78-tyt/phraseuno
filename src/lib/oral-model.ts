import { normalize } from './learning.ts';
// Recognition checks the words that were understood; it cannot grade pronunciation.
export function matchesSpokenPhrase(transcript: string, target: string) {
  return Boolean(normalize(transcript)) && normalize(transcript) === normalize(target);
}
export const recognitionOptions = {
  lang: 'es-ES', interimResults: true, continuous: true, maxAlternatives: 1,
  requiresOnDeviceRecognition: true, recordingOptions: { persist: false },
  // Matches the speech-output session (expo-audio allowsRecording) to avoid category switches.
  iosCategory: { category: 'playAndRecord', categoryOptions: ['defaultToSpeaker', 'allowBluetooth', 'mixWithOthers'], mode: 'default' },
  volumeChangeEventOptions: { enabled: true, intervalMillis: 120 },
} as const;
// Maps the recognizer's input level (-2 … 10) to 0 … 1 for the microphone animation.
// Continuous recognition: the app ends the recording after this much silence, so a short
// pause after the first word no longer cuts the sentence off.
export const SILENCE_MS = 1700;
export function micLevel(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value / 8));
}
export function recognitionError(code: string) {
  if (code === 'not-allowed' || code === 'service-not-allowed') return 'Bitte erlaube den Mikrofonzugriff in den Geräteeinstellungen.';
  if (code === 'no-speech' || code === 'speech-timeout') return 'Ich habe nichts verstanden. Sprich nach dem Start deutlich ins Mikrofon und versuche es noch einmal.';
  if (code === 'interrupted') return 'Die Aufnahme wurde unterbrochen. Tippe noch einmal auf das Mikrofon.';
  return 'Die spanische Erkennung auf diesem Gerät ist gerade nicht verfügbar. Prüfe das installierte spanische Offline-Sprachmodell in den Geräteeinstellungen. Du kannst weiter laut üben oder freiwillig schreiben.';
}
