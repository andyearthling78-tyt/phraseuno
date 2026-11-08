import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Text } from "../components/localized-text";
import { Card, Label, Page, s, C } from "../components/ui";
import { useI18n } from "../lib/i18n";
export default function Language() {
  const { preference, setPreference } = useI18n();
  return (
    <Page>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={{ paddingVertical: 8 }}
      >
        <Text style={{ color: C.green }}>← Mein Lerntag</Text>
      </Pressable>
      <View>
        <Label>PhraseUNO</Label>
        <Text style={[s.title, { marginTop: 10 }]}>App-Sprache</Text>
        <Text style={s.subtitle}>
          Diese App ist auf Deutsch und Englisch verfügbar.
        </Text>
      </View>
      <Card>
        {(
          [
            { value: "system", name: "Gerätesprache verwenden" },
            { value: "de", name: "Deutsch" },
            { value: "en", name: "English" },
          ] as const
        ).map((item) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: preference === item.value }}
            key={item.value}
            onPress={() => setPreference(item.value)}
            style={[s.row, { paddingVertical: 15 }]}
          >
            <Text style={[s.body, { flex: 1 }]}>{item.name}</Text>
            <Text style={{ color: C.green, fontSize: 21 }}>
              {preference === item.value ? "●" : "○"}
            </Text>
          </Pressable>
        ))}
      </Card>
      <Text style={s.body}>
        Deine Sprachwahl bleibt auf diesem Gerät gespeichert. Dein
        Lernfortschritt bleibt erhalten.
      </Text>
    </Page>
  );
}
