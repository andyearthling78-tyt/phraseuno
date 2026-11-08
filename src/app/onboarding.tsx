import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Text } from "../components/localized-text";
import { Button, C, Label, Page, s } from "../components/ui";
import { PreferenceSections, PreferenceSection } from "../components/preference-sections";
import { usePreferences } from "../lib/preferences";
import { useLocalizedAlert } from "../lib/i18n";
const sections: PreferenceSection[] = ["language", "voice", "goal", "reminder"];
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const { update, saveError } = usePreferences();
  const Alert = useLocalizedAlert();
  return <Page key={step} lesson>
    <Label>WILLKOMMEN BEI PHRASEUNO</Label>
    <Text style={s.small}>Schritt <Text translate={false}>{step + 1}</Text> von 4</Text>
    {step === 0 ? <View style={{ gap: 12 }}>
      <Text style={s.title}>¡Hola! Ich bin Lucía.</Text>
      <Text style={s.body}>Ich begleite dich bei deinen ersten spanischen Sätzen. Wir beginnen mit einer Bestellung im Café – Schritt für Schritt.</Text>
      <Text style={s.small}>Deine Lehrerin im simulierten Dialog. Du kannst die Stimme für die Hörbeispiele gleich selbst wählen.</Text>
    </View> : <Text style={s.title}>{step === 1 ? "So klingt dein Spanisch." : step === 2 ? "Kleine Schritte. Dein Tempo." : "Ein kleiner Anstoß, wenn du möchtest."}</Text>}
    <PreferenceSections section={sections[step]} />
    {saveError && <Text style={s.small}>Einstellungen konnten nicht gespeichert werden. Bitte versuche es erneut.</Text>}
    <Button disabled={busy} onPress={async () => {
      if (step < 3) { setStep(step + 1); return; }
      setBusy(true);
      try { await update({ onboarded: true }); router.replace("/"); }
      catch { Alert.alert("Einstellungen", "Die Änderung konnte nicht gespeichert werden. Bitte versuche es erneut."); }
      finally { setBusy(false); }
    }}>{step === 3 ? "Zu meinem Lerntag →" : "Weiter →"}</Button>
    {step > 0 && <Pressable accessibilityRole="button" onPress={() => setStep(step - 1)} style={{ padding: 12 }}><Text style={{ color: C.green }}>← Zurück</Text></Pressable>}
    <Text style={s.small}>Du kannst alles später in den Einstellungen ändern. Dein Lernfortschritt bleibt erhalten.</Text>
  </Page>;
}
