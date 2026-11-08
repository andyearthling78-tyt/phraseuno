import { recordingForText, isRecordingPackComplete, RecordingVoice, RecordingSpeed } from "./audio-catalog";
import { recordedAssets } from "./recorded-assets";
export const recordingPackReady = isRecordingPackComplete(recordedAssets);
export function recordedSource(text: string, voice: RecordingVoice, speed: RecordingSpeed) {
  if (!recordingPackReady) return undefined;
  const key = recordingForText(text, voice, speed);
  return key ? recordedAssets[key] : undefined;
}
