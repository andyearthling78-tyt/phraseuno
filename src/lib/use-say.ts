import { useCallback } from "react";
import { usePreferences } from "./preferences";
import { learningSpeech } from "./speech";
import { recognitionGate } from "./recognition-gate";
// Speak a Spanish text with the chosen tutor voice and tempo, never over a running microphone.
export function useSay() {
  const { selectedVoice, preferences } = usePreferences();
  return useCallback(async (text: string, onDone?: () => void) => {
    if (!selectedVoice) return false;
    await recognitionGate.idle();
    void learningSpeech.speak({
      text, voice: selectedVoice,
      recording: { voice: preferences.voiceGender, speed: preferences.audioSpeed },
      onError: () => onDone?.(), onDone,
    });
    return true;
  }, [selectedVoice, preferences.voiceGender, preferences.audioSpeed]);
}
