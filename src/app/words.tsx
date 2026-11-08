import { Text } from "../components/localized-text";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Label, Page, s, Speak } from "../components/ui";
import { useLearning } from "../lib/store";
import { words } from "../lib/learning";
export default function Words() {
  const { state } = useLearning();
  return (
    <Page>
      <View>
        <Label>DEINE WORTSAMMLUNG</Label>
        <Text style={[s.title, { marginTop: 10 }]}>
          Kleine Bausteine.{"\n"}Viele Möglichkeiten.
        </Text>
        <Text style={s.subtitle}>
          Drei Wörter aus deinem ersten Café-Gespräch.
        </Text>
      </View>
      {words.map((w, i) => (
        <Card key={w.es}>
          <View style={s.row}>
            <Text style={{ fontSize: 38 }}>{w.symbol}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.h2}>{w.es}</Text>
              <Text style={s.subtitle}>
                {w.de} ·{" "}
                {state.known.includes(i) ? "✓ gefestigt" : "noch in Übung"}
              </Text>
            </View>
            <Speak text={w.es} />
          </View>
          <Text style={s.small}>{w.example}</Text>
        </Card>
      ))}
      <Button onPress={() => router.replace("/")}>Zum Lerntag →</Button>
    </Page>
  );
}
