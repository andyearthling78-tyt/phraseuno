import fs from 'node:fs';
// PhraseUNO privacy guard: iOS must never silently fall back to server-side recognition.
const file = new URL('../node_modules/expo-speech-recognition/ios/ExpoSpeechRecognizer.swift', import.meta.url);
const before = '    if recognizer.supportsOnDeviceRecognition {\n      request.requiresOnDeviceRecognition = options.requiresOnDeviceRecognition\n    }';
const after = '    // PhraseUNO: never silently fall back to server recognition.\n    request.requiresOnDeviceRecognition = options.requiresOnDeviceRecognition';
const source = fs.readFileSync(file, 'utf8');
if (source.includes(before)) fs.writeFileSync(file, source.replace(before, after));
else if (!source.includes(after)) throw new Error('Speech privacy patch requires review for this library version');
