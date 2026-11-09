import { normalize } from './learning.ts';
// Recognition checks the words that were understood; it cannot grade pronunciation.
export function matchesSpokenPhrase(transcript: string, target: string) {
  return Boolean(normalize(transcript)) && normalize(transcript) === normalize(target);
}
export const recognitionOptions = {
  lang: 'es-ES', interimResults: true, continuous: false, maxAlternatives: 1,
  requiresOnDeviceRecognition: true, recordingOptions: { persist: false },
} as const;
export function recognitionError(code: string) {
  if (code === 'not-allowed' || code === 'service-not-allowed') return 'Bitte erlaube den Mikrofonzugriff in den Geräteeinstellungen.';
  if (code === 'no-speech' || code === 'speech-timeout') return 'Ich habe nichts verstanden. Sprich nach dem Start deutlich ins Mikrofon und versuche es noch einmal.';
  return 'Die spanische Erkennung auf diesem Gerät ist gerade nicht verfügbar. Prüfe das installierte spanische Offline-Sprachmodell in den Geräteeinstellungen. Du kannst weiter laut üben oder freiwillig schreiben.';
}
