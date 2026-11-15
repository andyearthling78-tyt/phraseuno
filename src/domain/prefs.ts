import type { Lang } from "./types.ts";
export const PREFS_KEY = "phraseuno.prefs.v3";
export type VoiceGender = "female" | "male";
export type Speed = "natural" | "slow";
export type Prefs = {
  onboarded: boolean; language: Lang | "system"; voice: VoiceGender; voiceId: string | null; speed: Speed;
  reminder: boolean; reminderTime: string;
};
export const defaultPrefs: Prefs = { onboarded: false, language: "system", voice: "female", voiceId: null, speed: "natural", reminder: false, reminderTime: "19:00" };
export const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export function restorePrefs(raw: string | null): Prefs {
  try {
    const v = JSON.parse(raw ?? "null");
    if (!v || typeof v !== "object" || Array.isArray(v)) return { ...defaultPrefs };
    return {
      onboarded: v.onboarded === true,
      language: v.language === "de" || v.language === "en" ? v.language : "system",
      voice: v.voice === "male" ? "male" : "female",
      voiceId: typeof v.voiceId === "string" && v.voiceId.length < 300 ? v.voiceId : null,
      speed: v.speed === "slow" ? "slow" : "natural",
      reminder: v.reminder === true,
      reminderTime: typeof v.reminderTime === "string" && validTime(v.reminderTime) ? v.reminderTime : "19:00",
    };
  } catch { return { ...defaultPrefs }; }
}
export function resolveLanguage(preference: Lang | "system", deviceTags: readonly string[]): Lang {
  if (preference !== "system") return preference;
  for (const tag of deviceTags) {
    const base = tag.toLowerCase().split(/[-_]/)[0];
    if (base === "de" || base === "en") return base;
  }
  return "en";
}
export const tutorName = (gender: VoiceGender) => (gender === "male" ? "Mateo" : "Lucía");
/** 🐇 natural vs 🐌 slow speech rate for device voices. */
export const speechRate = (speed: Speed) => (speed === "slow" ? 0.55 : 0.9);

export type DeviceVoice = { identifier: string; name: string; language: string; quality?: string; gender?: string };
const FEMALE = /\b(monica|paulina|marisol|angelica|silvia|luciana|jimena|isabela|francisca|lucia|helena|laura|elvira|dalia|flo|sandy|shelley|grandma)\b/;
const MALE = /\b(jorge|juan|diego|carlos|antonio|rodrigo|mateo|alvaro|pablo|eddy|reed|rocko|grandpa)\b/;
const NOVELTY = /\b(grandma|grandpa|rocko|eddy|flo|reed|sandy|shelley)\b|eloquence/;
const names = (voice: DeviceVoice) => `${voice.name} ${voice.identifier}`.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
/** iOS reports gender natively (patched expo-speech); elsewhere known voice names are used. */
export function voiceGender(voice: DeviceVoice): VoiceGender | null {
  if (voice.gender === "female" || voice.gender === "male") return voice.gender;
  const text = names(voice);
  return FEMALE.test(text) ? "female" : MALE.test(text) ? "male" : null;
}
export const isEnhanced = (voice: DeviceVoice) => voice.quality === "Enhanced" || /premium|enhanced/.test(names(voice));
function rank(voice: DeviceVoice, locale: string) {
  let score = 0;
  if (voice.language.replace("_", "-").toLowerCase() === locale.toLowerCase()) score += 4;
  if (isEnhanced(voice)) score += 3;
  if (NOVELTY.test(names(voice))) score -= 6;
  return score;
}
export function selectVoice(voices: readonly DeviceVoice[], locale: string, gender: VoiceGender, id: string | null) {
  const base = locale.split("-")[0].toLowerCase();
  const matching = voices.filter((voice) => voice.language.toLowerCase().split(/[-_]/)[0] === base);
  return matching.find((voice) => voice.identifier === id)
    ?? matching.filter((voice) => voiceGender(voice) === gender).sort((a, b) => rank(b, locale) - rank(a, locale))[0];
}
