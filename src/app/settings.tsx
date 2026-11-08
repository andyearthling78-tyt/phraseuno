import { Pressable } from "react-native";
import { router } from "expo-router";
import { Text } from "../components/localized-text";
import { C, Page, s } from "../components/ui";
import { PreferenceSections } from "../components/preference-sections";
import { usePreferences } from "../lib/preferences";
export default function Settings() {
  const { saveError } = usePreferences();
  return <Page>
    <Pressable accessibilityRole="button" style={{ paddingVertical: 8 }} onPress={() => router.canGoBack() ? router.back() : router.replace("/")}><Text style={{ color: C.green }}>← Zurück</Text></Pressable>
    <Text style={s.title}>Einstellungen</Text>
    <Text style={s.body}>Dein Spanisch. Dein Tempo. Änderungen werden automatisch gespeichert.</Text>
    {saveError && <Text style={s.body}>Einstellungen konnten nicht gespeichert werden. Bitte versuche es erneut.</Text>}
    <PreferenceSections section="language" />
    <PreferenceSections section="voice" />
    <PreferenceSections section="goal" />
    <PreferenceSections section="reminder" />
  </Page>;
}
