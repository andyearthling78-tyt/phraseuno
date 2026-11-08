import { Text } from "../components/localized-text";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Label, Page, Progress, s } from "../components/ui";
import { useLearning } from "../lib/store";
import { percent } from "../lib/learning";
export default function LearningProgress() {
  const { state, saveError } = useLearning();
  return (
    <Page>
      <View>
        <Label>DEINE LERNREISE</Label>
        <Text style={[s.title, { marginTop: 10 }]}>Jeder Satz zählt.</Text>
        <Text style={s.subtitle}>Dein Fortschritt in Spanisch.</Text>
      </View>
      <Card>
        <Text style={s.h2}>Tag 01 · Im Café</Text>
        <Text style={s.small}>{percent(state)}% abgeschlossen</Text>
        <Progress value={percent(state)} />
        <View style={s.row}>
          {[
            [`${state.build}/4`, "Phrasen"],
            [`${state.chat}/4`, "Dialogantworten"],
            [`${state.known.length}/3`, "Wörter"],
          ].map(([n, t]) => (
            <View key={t} style={s.stat}>
              <Text style={s.statNumber}>{n}</Text>
              <Text style={s.small}>{t}</Text>
            </View>
          ))}
        </View>
        <Text style={s.body}>
          {state.completedAt
            ? "Dein erster Lerntag ist geschafft. ¡Muy bien!"
            : "Dein Lerntag wartet dort, wo du aufgehört hast."}
        </Text>
        <Text style={s.small}>
          80% Phrasen & Dialog (ca. 8 Minuten), 20% Worttraining (ca. 2
          Minuten). Dein Tempo darf abweichen.
        </Text>
        <Text style={s.small}>
          {saveError
            ? "Speichern ist gerade nicht verfügbar."
            : "Automatisch auf diesem Gerät gespeichert. Kein Konto erforderlich."}
        </Text>
        <Button
          onPress={() => router.push(state.stage === "intro" ? "/" : "/learn")}
        >
          {state.completedAt ? "Tagesabschluss ansehen" : "Weiterlernen"} →
        </Button>
      </Card>
    </Page>
  );
}
