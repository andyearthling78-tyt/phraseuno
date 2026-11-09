import React, { useEffect, useState } from "react";
import { Linking, Pressable, Switch, TextInput, View } from "react-native";
import { recordingPackReady } from "../lib/recorded-audio";
import { learningSpeech } from "../lib/speech";
import { useI18n, useLocalizedAlert } from "../lib/i18n";
import { usePreferences } from "../lib/preferences";
import { Preferences, validTime } from "../lib/preferences-model";
import { Text } from "./localized-text";
import { Button, Card, C, s } from "./ui";
export type PreferenceSection = "language" | "voice" | "goal" | "reminder";
function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }}
    onPress={onPress} style={({ pressed }) => [s.row, {
      padding: 13, minHeight: 48, borderRadius: 12, backgroundColor: selected ? C.pale : C.paper,
      borderWidth: 1, borderColor: selected ? C.green : C.line, opacity: pressed ? 0.65 : 1,
    }]}>
    <Text style={[s.body, { flex: 1, fontWeight: selected ? "700" : "400" }]}>{label}</Text>
    <Text accessible={false} style={{ color: C.green }}>{selected ? "●" : "○"}</Text>
  </Pressable>;
}
export function PreferenceSections({ section }: { section: PreferenceSection }) {
  const { preference, setPreference, t } = useI18n();
  const { preferences, update, selectedVoice, voices, voicesLoading, voiceError, reminderState, enableReminder } = usePreferences();
  const Alert = useLocalizedAlert();
  const [showVoices, setShowVoices] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draftTime, setTime] = useState<string | null>(null);
  const time = draftTime ?? preferences.reminderTime;
  useEffect(() => () => { learningSpeech.stop(); }, []);
  function failure() { Alert.alert("Einstellungen", "Die Änderung konnte nicht gespeichert werden. Bitte versuche es erneut."); }
  function save(patch: Partial<Preferences>) { update(patch).catch(failure); }
  function preview(id: string) {
    const voice = voices.find((v) => v.identifier === id);
    if (!voice) return;
    learningSpeech.speak({ text: "Hola. Quiero un café con leche, por favor.", voice,
      onError: () => Alert.alert("Sprachausgabe", "Die Stimme konnte nicht abgespielt werden. Prüfe die Medienlautstärke und das gewählte Audiogerät und versuche es erneut."),
    });
  }
  if (section === "language") return <Card>
    <Text accessibilityRole="header" style={s.h2}>App-Sprache</Text>
    {([{ value: "system", name: "Gerätesprache verwenden" }, { value: "de", name: "Deutsch" }, { value: "en", name: "English" }] as const)
      .map((item) => <Choice key={item.value} label={item.name} selected={preference === item.value} onPress={() => setPreference(item.value)} />)}
  </Card>;
  if (section === "voice" && recordingPackReady) return <Card>
    <Text accessibilityRole="header" style={s.h2}>Deine Lernstimme</Text>
    <Choice label="Lucía · weiblich" selected={preferences.voiceGender === "female"} onPress={() => { learningSpeech.stop(); save({ voiceGender: "female" }); }} />
    <Choice label="Mateo · männlich" selected={preferences.voiceGender === "male"} onPress={() => { learningSpeech.stop(); save({ voiceGender: "male" }); }} />
    <Text style={s.body}>Sprechtempo</Text>
    <Choice label="Natürlich gesprochen" selected={preferences.audioSpeed === "natural"} onPress={() => save({ audioSpeed: "natural" })} />
    <Choice label="Langsam zum Mitsprechen" selected={preferences.audioSpeed === "slow"} onPress={() => save({ audioSpeed: "slow" })} />
    <Button secondary onPress={() => learningSpeech.speak({
      text: "Hola. Quiero un café con leche, por favor.",
      voice: { identifier: "", language: "es-ES" },
      recording: { voice: preferences.voiceGender, speed: preferences.audioSpeed },
      onError: () => Alert.alert("Sprachausgabe", "Die Stimme konnte nicht abgespielt werden. Prüfe die Medienlautstärke und das gewählte Audiogerät und versuche es erneut."),
    })}>Stimme probehören ♪</Button>
    <Text style={s.small}>Beide Stimmen sind auch offline verfügbar.</Text>
  </Card>;
  if (section === "voice") return <Card>
    <Text accessibilityRole="header" style={s.h2}>Deine Lernstimme</Text>
    <Text style={s.body}>Wähle, wer dir die spanischen Sätze vorspricht: Lucía mit weiblicher oder Mateo mit männlicher Stimme.</Text>
    <Choice label="Lucía · weiblich" selected={preferences.voiceGender === "female"} onPress={() => { learningSpeech.stop(); save({ voiceGender: "female", voiceId: null }); }} />
    <Choice label="Mateo · männlich" selected={preferences.voiceGender === "male"} onPress={() => { learningSpeech.stop(); save({ voiceGender: "male", voiceId: null }); }} />
    {voicesLoading ? <Text style={s.small}>Stimmen werden geladen …</Text> : selectedVoice ? <>
      <Text style={s.small}>Aktive Stimme: <Text translate={false}>{selectedVoice.name}</Text></Text>
      <Button secondary onPress={() => preview(selectedVoice.identifier)}>Stimme probehören ♪</Button>
    </> : <Text style={s.body}>{voiceError ? "Stimmen konnten nicht geladen werden. Bitte öffne die App erneut." : "Keine passende Stimme automatisch erkannt. Wähle unten eine verfügbare Stimme nach dem Probehören."}</Text>}
    {!voicesLoading && <Button secondary onPress={() => setShowVoices(!showVoices)}>{showVoices ? "Stimmenliste schließen" : "Verfügbare Stimmen auswählen"}</Button>}
    {showVoices && <>
      <Text style={s.small}>Manche Geräte verraten das Stimmgeschlecht nicht. Höre die Stimmen an und ordne deine Auswahl der oben gewählten Stimme zu.</Text>
      {voices.map((voice) => <View key={voice.identifier} style={{ gap: 8, borderTopWidth: 1, borderColor: C.line, paddingTop: 12 }}>
        <Text translate={false} style={s.body}>{voice.name} · {voice.language}</Text>
        <View style={s.row}>
          <View style={{ flex: 1 }}><Button secondary onPress={() => preview(voice.identifier)}>Probehören ♪</Button></View>
          <View style={{ flex: 1 }}><Button secondary={selectedVoice?.identifier !== voice.identifier} onPress={() => { learningSpeech.stop(); save({ voiceId: voice.identifier }); }}>{selectedVoice?.identifier === voice.identifier ? "Ausgewählt ✓" : "Auswählen"}</Button></View>
        </View>
      </View>)}
      {voices.length === 0 && <Text style={s.body}>Auf diesem Gerät ist keine spanische Stimme verfügbar. Installiere eine spanische Stimme in den Spracheinstellungen des Geräts.</Text>}
    </>}
    <Text style={s.small}>Die verfügbaren Stimmen hängen vom Gerät ab. Zusätzliche Stimmen kannst du in den Spracheinstellungen deines Geräts laden. Prüfe beim Probehören die Medienlautstärke und ob Kopfhörer oder Bluetooth verbunden sind.</Text>
  </Card>;
  if (section === "goal") return <Card>
    <Text accessibilityRole="header" style={s.h2}>Dein Tageslernziel</Text>
    <Text style={s.body}>Wähle dein tägliches Zeitbudget. Du kannst deinen Lerntag jederzeit unterbrechen und später fortsetzen.</Text>
    {([5, 10, 15] as const).map((goal) => <Choice key={goal} label={`${goal} Min. täglich`} selected={preferences.goal === goal} onPress={() => save({ goal })} />)}
  </Card>;
  return <Card>
    <Text accessibilityRole="header" style={s.h2}>Deine Lernerinnerung</Text>
    <Text style={s.body}>Ein freundlicher Hinweis pro Tag. Ohne Ton, ohne Druck. Du entscheidest, ob und wann.</Text>
    <View style={s.row}>
      <Text style={[s.body, { flex: 1 }]}>Täglich erinnern</Text>
      <Switch accessibilityLabel={t("Täglich erinnern")} value={preferences.reminderEnabled} disabled={busy}
        trackColor={{ false: C.line, true: C.green }} thumbColor={C.paper}
        onValueChange={async (enabled) => {
          if (!validTime(time)) { Alert.alert("Uhrzeit", "Bitte gib eine gültige Uhrzeit im Format HH:MM ein."); return; }
          setBusy(true);
          try { await update({ reminderTime: time }); await enableReminder(enabled); }
          catch { failure(); } finally { setBusy(false); }
        }} />
    </View>
    <Text style={s.small}>Uhrzeit auf deinem Gerät</Text>
    <TextInput value={time} onChangeText={setTime} accessibilityLabel={t("Uhrzeit der Lernerinnerung")}
      placeholder="19:00" maxLength={5} autoCorrect={false} autoCapitalize="none" keyboardType="numbers-and-punctuation"
      style={{ borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 14, color: C.green, fontSize: 20 }} />
    {time !== preferences.reminderTime && <Button secondary disabled={busy} onPress={() => {
      if (!validTime(time)) { Alert.alert("Uhrzeit", "Bitte gib eine gültige Uhrzeit im Format HH:MM ein."); return; }
      save({ reminderTime: time });
    }}>Uhrzeit übernehmen</Button>}
    {reminderState === "scheduled" && preferences.reminderEnabled && <Text style={s.small}>Erinnerung aktiv um <Text translate={false}>{preferences.reminderTime}</Text>.</Text>}
    {reminderState === "blocked" && <>
      <Text style={s.body}>Mitteilungen sind nicht erlaubt. Du kannst sie in den Geräteeinstellungen freigeben.</Text>
      <Button secondary onPress={() => Linking.openSettings().catch(failure)}>Geräteeinstellungen öffnen</Button>
    </>}
    {reminderState === "error" && <Text style={s.body}>Die Erinnerung konnte nicht eingerichtet werden. Bitte schalte sie aus und versuche es erneut.</Text>}
    <Text style={s.small}>Die Erinnerung wird lokal auf deinem Gerät geplant. Fokusmodus, Energiesparen oder Systemeinstellungen können die Anzeige verzögern.</Text>
  </Card>;
}
