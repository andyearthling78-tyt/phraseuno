// One script shared by the female and male recordings, each with two deliveries.
export const audioClips = [
  { id: "preview", text: "Hola. Quiero un café con leche, por favor." },
  { id: "order-coffee", text: "Quiero un café" },
  { id: "order-milk", text: "Quiero un café con leche" },
  { id: "order-please", text: "Quiero un café con leche, por favor" },
  { id: "order-takeaway", text: "Quiero un café con leche, por favor, para llevar" },
  { id: "with-milk", text: "con leche" },
  { id: "please", text: "por favor" },
  { id: "to-go", text: "para llevar" },
  { id: "word-coffee", text: "el café" },
  { id: "word-milk", text: "la leche" },
  { id: "word-take", text: "llevar" },
  { id: "ask-order", text: "¡Hola! ¿Qué quieres tomar?" },
  { id: "ask-milk", text: "¿Solo o con leche?" },
  { id: "ask-takeaway", text: "¿Para tomar aquí o para llevar?" },
  { id: "ask-repeat", text: "Muy bien. ¿Puedes repetir tu pedido completo?" },
  { id: "answer-milk", text: "Con leche, por favor." },
  { id: "answer-takeaway", text: "Para llevar, por favor." },
] as const;
export const recordingVoices = ["female", "male"] as const;
export const recordingSpeeds = ["natural", "slow"] as const;
export type RecordingVoice = typeof recordingVoices[number];
export type RecordingSpeed = typeof recordingSpeeds[number];
export function audioTextKey(text: string) {
  return text.normalize("NFC").toLowerCase().replace(/\p{P}/gu, " ").replace(/\s+/g, " ").trim();
}
export function recordingKey(id: string, voice: RecordingVoice, speed: RecordingSpeed) {
  return `${voice}/${speed}/${id}`;
}
export function recordingForText(text: string, voice: RecordingVoice, speed: RecordingSpeed) {
  const clip = audioClips.find((item) => audioTextKey(item.text) === audioTextKey(text));
  return clip ? recordingKey(clip.id, voice, speed) : null;
}

// Publish both voices together; partial packs must not create a mixed lesson.
export function isRecordingPackComplete(assets: Readonly<Record<string, number>>) {
  return recordingVoices.every((voice) => recordingSpeeds.every((speed) =>
    audioClips.every((clip) => typeof assets[recordingKey(clip.id, voice, speed)] === "number")));
}
