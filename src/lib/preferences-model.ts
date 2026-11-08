export const PREFERENCES_KEY = "phraseuno.preferences.v1";
export type VoiceGender = "female" | "male";
export type Preferences = {
  onboarded: boolean;
  lastMotivationDay: string | null;
  voiceGender: VoiceGender;
  voiceId: string | null;
  goal: 5 | 10 | 15;
  reminderEnabled: boolean;
  reminderTime: string;
};
export const defaultPreferences: Preferences = {
  lastMotivationDay: null, onboarded: false, voiceGender: "female", voiceId: null, goal: 10,
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
      lastMotivationDay: typeof v.lastMotivationDay === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.lastMotivationDay) ? v.lastMotivationDay : null,
      voiceGender: v.voiceGender === "male" ? "male" : "female",
      voiceId: typeof v.voiceId === "string" && v.voiceId.length < 300 ? v.voiceId : null,
      goal: v.goal === 5 || v.goal === 15 ? v.goal : 10,
      reminderEnabled: v.reminderEnabled === true,
      reminderTime: typeof v.reminderTime === "string" && validTime(v.reminderTime) ? v.reminderTime : "19:00",
    };
  } catch { return { ...defaultPreferences }; }
}
export type DeviceVoice = { identifier: string; name: string; language: string };
// Expo does not expose voice gender. Recognize known Spanish system voice names;
// unknown engine names remain unclassified and can be auditioned/selected manually.
export function voiceGender(voice: DeviceVoice): VoiceGender | null {
  const names = `${voice.name} ${voice.identifier}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/\b(monica|paulina|marisol|angelica|silvia|luciana|jimena)\b/.test(names)) return "female";
  if (/\b(jorge|juan|diego|carlos|antonio|rodrigo|mateo)\b/.test(names)) return "male";
  return null;
}
export function selectVoice(voices: readonly DeviceVoice[], gender: VoiceGender, id: string | null) {
  const spanish = voices.filter((v) => /^es([-_]|$)/i.test(v.language));
  return spanish.find((v) => v.identifier === id) ?? spanish.find((v) => voiceGender(v) === gender);
}
