import { useI18n, useLocalizedAlert } from "../../lib/i18n";
import { Text } from "../../components/localized-text";
import { useState } from "react";
import { Pressable, Share, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, C, Label, Page, s } from "../../components/ui";
import { providerComplete } from "../../lib/legal";
import { useLearning } from "../../lib/store";
export default function Legal() {
  const { t } = useI18n();
  const Alert = useLocalizedAlert();
  const { course, clearProgress } = useLearning();
  const [busy, setBusy] = useState(false);
  async function share() {
    try {
      await Share.share({
        title: "PhraseUNO · Meine Lerndaten",
        message: JSON.stringify(course, null, 2),
      });
    } catch {
      Alert.alert("Teilen nicht möglich", "Bitte versuche es später erneut.");
    }
  }
  function clear() {
    Alert.alert(
      "Lerndaten löschen?",
      "Dein Lernfortschritt und deine gespeicherten Dialogantworten auf diesem Gerät werden gelöscht. Dies kann nicht rückgängig gemacht werden.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await clearProgress();
              Alert.alert(
                "Lerndaten gelöscht",
                "Du kannst mit Tag 1 neu starten.",
              );
            } catch {
              Alert.alert(
                "Löschen fehlgeschlagen",
                "Die Daten konnten nicht sicher aus dem Gerätespeicher entfernt werden. Bitte versuche es erneut.",
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  }
  return (
    <Page>
      <View>
        <Label>GUT ZU WISSEN</Label>
        <Text style={[s.title, { marginTop: 10 }]}>
          Rechtliches & deine Daten.
        </Text>
        <Text style={s.subtitle}>
          Direkt in der App. Auch ohne Internet lesbar.
        </Text>
      </View>
      {!providerComplete && (
        <Card style={{ backgroundColor: "#f6edcd" }}>
          <Text style={s.h2}>Anbieterangaben noch offen</Text>
          <Text style={s.body}>
            Impressum und Datenschutzhinweise sind für diesen Prototyp
            vorbereitet. Die Angaben zum Anbieter und die rechtliche Einordnung
            müssen vor einer Veröffentlichung vervollständigt werden.
          </Text>
        </Card>
      )}
      <Card>
        {(
          [
            {
              path: "/legal/impressum",
              title: "Impressum",
              detail: "Anbieter und Kontakt",
            },
            {
              path: "/legal/datenschutz",
              title: "Datenschutzhinweise",
              detail: "Welche Daten die App verwendet",
            },
            {
              path: "/legal/nutzung",
              title: "Hinweise zur Nutzung",
              detail: "Umfang und Grenzen der App",
            },
            {
              path: "/legal/lizenzen",
              title: "Open-Source-Lizenzen",
              detail: "Bibliotheken und Lizenzhinweise",
            },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.path}
            accessibilityRole="button"
            accessibilityLabel={t(item.title)}
            onPress={() => router.push(item.path)}
            style={[s.row, { paddingVertical: 10 }]}
          >
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={[s.h2, { fontSize: 17 }]}>{item.title}</Text>
              <Text style={s.small}>{item.detail}</Text>
            </View>
            <Text style={{ color: C.green, fontSize: 24 }}>›</Text>
          </Pressable>
        ))}
      </Card>
      <Card>
        <Text style={s.h2}>Deine Lerndaten</Text>
        <Text style={s.body}>
          Dein Fortschritt und die Dialogantworten liegen auf diesem Gerät. Du
          kannst den Datensatz selbst teilen oder löschen.
        </Text>
        <Button secondary disabled={busy} onPress={share}>
          Lerndaten teilen ↗
        </Button>
        <Button secondary disabled={busy} onPress={clear}>
          {busy ? "Daten werden gelöscht …" : "Lerndaten löschen"}
        </Button>
        <Text style={s.small}>
          Das Löschen betrifft den lokalen App-Speicher. Betriebssystem-Backups
          und bereits geteilte Kopien werden dadurch nicht gelöscht.
        </Text>
      </Card>
      <Text style={[s.small, s.center]}>
        PhraseUNO · Version 1.0.0 · Sieben Lerntage
      </Text>
    </Page>
  );
}
