import fs from 'node:fs';
// PhraseUNO: expose AVSpeechSynthesisVoice.gender so the female/male tutor voices
// never depend on guessing from voice names on iOS.
const dir = new URL('../node_modules/expo-speech/ios/', import.meta.url);
const fieldBefore = '  @Field\n  var language: String? = nil\n}';
const fieldAfter = '  @Field\n  var language: String? = nil\n  // PhraseUNO: voice gender\n  @Field\n  var gender: String? = nil\n}';
const mapBefore = '          quality: voice.quality == .enhanced ? "Enhanced" : "Default",\n          language: voice.language\n        )';
const mapAfter = '          quality: voice.quality == .enhanced ? "Enhanced" : "Default",\n          language: voice.language,\n          gender: voice.gender == .female ? "female" : voice.gender == .male ? "male" : "unspecified"\n        )';
function patch(name, before, after) {
  const file = new URL(name, dir);
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(after)) return;
  if (!source.includes(before)) throw new Error(`Voice gender patch requires review: ${name}`);
  fs.writeFileSync(file, source.replace(before, after));
}
patch('SpeechOptions.swift', fieldBefore, fieldAfter);
patch('SpeechModule.swift', mapBefore, mapAfter);
