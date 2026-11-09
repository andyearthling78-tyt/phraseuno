export const PREFERENCES_KEY = "phraseuno.preferences.v1";
export type VoiceGender = "female" | "male";
export type Preferences = {
  onboarded: boolean;
  audioSpeed: "natural" | "slow";
  lastMotivationDay: string | null;
  voiceGender: VoiceGender;
  voiceId: string | null;
  goal: 5 | 10 | 15;
  reminderEnabled: boolean;
  reminderTime: string;
};
export const defaultPreferences: Preferences = {
  audioSpeed: "natural", lastMotivationDay: null, onboarded: false, voiceGender: "female", voiceId: null, goal: 10,
  reminderEnabled: false, reminderTime: "19:00",
};
export function validTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
export function restorePreferences(raw: string | null): Preferences {
  try {
    const v = JSON.parse(raw ?? "null");
    if (!v || typeof v !== "object" || Array.isArray(v)) return { ...defaultPreferences };
    return {
      onboarded: v.onboarded === true,
      audioSpeed: v.audioSpeed === "slow" ? "slow" : "natural",
      lastMotivationDay: typeof v.lastMotivationDay === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.lastMotivationDay) ? v.lastMotivationDay : null,
      voiceGender: v.voiceGender === "male" ? "male" : "female",
      voiceId: typeof v.voiceId === "string" && v.voiceId.length < 300 ? v.voiceId : null,
      goal: v.goal === 5 || v.goal === 15 ? v.goal : 10,
      reminderEnabled: v.reminderEnabled === true,
      reminderTime: typeof v.reminderTime === "string" && validTime(v.reminderTime) ? v.reminderTime : "19:00",
    };
  } catch { return { ...defaultPreferences }; }
}
export type DeviceVoice = { identifier: string; name: string; language: string; quality?: string; gender?: string };
export function tutorName(gender: VoiceGender) { return gender === "male" ? "Mateo" : "Lucía"; }
const FEMALE = /\b(monica|paulina|marisol|angelica|silvia|luciana|jimena|isabela|francisca|lucia|helena|laura|elvira|dalia|flo|sandy|shelley|grandma)\b/;
const MALE = /\b(jorge|juan|diego|carlos|antonio|rodrigo|mateo|alvaro|pablo|eddy|reed|rocko|grandpa)\b/;
const NOVELTY = /\b(grandma|grandpa|rocko|eddy|flo|reed|sandy|shelley)\b/;
function names(voice: DeviceVoice) {
  return `${voice.name} ${voice.identifier}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
// iOS reports the gender natively (patched expo-speech). Elsewhere, known Spanish
// system voice names are used; unknown engine names stay unclassified.
export function voiceGender(voice: DeviceVoice): VoiceGender | null {
  if (voice.gender === "female" || voice.gender === "male") return voice.gender;
  const text = names(voice);
  if (FEMALE.test(text)) return "female";
  if (MALE.test(text)) return "male";
  return null;
}
function rank(voice: DeviceVoice) {
  const text = names(voice);
  let score = 0;
  if (/^es[-_]es$/i.test(voice.language)) score += 4;
  else if (/^es[-_](mx|us)$/i.test(voice.language)) score += 2;
  if (voice.quality === "Enhanced" || /premium|enhanced/.test(text)) score += 3;
  if (NOVELTY.test(text) || /eloquence/.test(text)) score -= 6;
  return score;
}
export function selectVoice(voices: readonly DeviceVoice[], gender: VoiceGender, id: string | null) {
  const spanish = voices.filter((v) => /^es([-_]|$)/i.test(v.language));
  const chosen = spanish.find((v) => v.identifier === id);
  if (chosen) return chosen;
  return spanish.filter((v) => voiceGender(v) === gender).sort((a, b) => rank(b) - rank(a))[0];
}
