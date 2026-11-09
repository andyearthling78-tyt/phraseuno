import { ExpoSpeechRecognitionModule as Recognition } from "expo-speech-recognition";
import { createRecognitionGate } from "./recognition-timing";
// One app-wide view of the native recognizer, independent of mounted screens, so
// Lucía/Mateo never start talking while the microphone is still being torn down.
export const recognitionGate = createRecognitionGate();
Recognition.addListener("start", () => recognitionGate.started());
Recognition.addListener("end", () => recognitionGate.ended());
