import { Text } from "../components/localized-text";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, Card, C, Label, Page, Progress, s } from "../components/ui";
import { useLearning } from "../lib/store";
import { percent } from "../lib/learning";
export default function Home() {
  const { state, setState, saveError } = useLearning();
  const p = percent(state);
  return (
    <Page>
      <View>
        <Label>TAG 01 / IM CAFÉ</Label>
        <Text style={[s.title, { marginTop: 10 }]}>
          Dein erster spanischer Moment.
        </Text>
        <Text style={s.subtitle}>
          Heute bestellst du deinen Kaffee. Auf Spanisch.
        </Text>
      </View>
      <View style={s.hero}>
        <Label>ALLTAGSSPANISCH · LEKTION 01</Label>
        <Text style={s.heroTitle}>
          Ein Kaffee.{"\n"}Viele{" "}
          <Text style={{ color: C.yellow }}>Möglichkeiten.</Text>
        </Text>
        <Text style={s.heroCopy}>
          Aus drei Wörtern wird deine erste echte Bestellung. Schritt für
          Schritt. Mit Lucía an deiner Seite.
        </Text>
        <View style={s.row}>
          <View style={s.pill}>
            <Text style={s.pillText}>◷ ca. 10 Min. · für Einsteiger</Text>
          </View>
          <Text style={{ fontSize: 65, marginLeft: "auto" }}>☕</Text>
        </View>
      </View>
      <Card>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Text style={s.h2}>Dein Plan für heute</Text>
          <Text style={s.small}>{p}%</Text>
        </View>
        <Progress value={p} />
        {[
          [
            "01",
            "Phrasen aufbauen",
            "Ein Satz, vier kleine Schritte.",
            "4 Min.",
            state.build === 4,
          ],
          [
            "02",
            "Mit Lucía sprechen",
            "Dein erster Dialog im Café.",
            "4 Min.",
            state.chat === 4,
          ],
          [
            "03",
            "Wörter festigen",
            "Drei Wörter, die bleiben.",
            "2 Min.",
            state.known.length === 3,
          ],
        ].map(([n, title, sub, time, done]) => (
          <View key={String(n)} style={[s.row, { paddingVertical: 4 }]}>
            <View
              style={{
                width: 40,
                height: 42,
                borderRadius: 12,
                backgroundColor: done ? C.pale : C.yellow,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: C.green, fontWeight: "700" }}>
                {done ? "✓" : n}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.green, fontWeight: "600", fontSize: 14 }}>
                {title}
              </Text>
              <Text style={s.small}>{sub}</Text>
            </View>
            <Text style={s.small}>{time}</Text>
          </View>
        ))}
        <Button
          onPress={() => {
            if (state.stage === "intro")
              setState((v) => ({ ...v, stage: "build" }));
            router.push("/learn");
          }}
        >
          {state.completedAt
            ? "Tagesabschluss ansehen"
            : state.stage === "intro"
              ? "Meinen Lerntag starten ↗"
              : "Weiterlernen ↗"}
        </Button>
        <Text style={[s.small, s.center]}>
          {saveError
            ? "Speichern gerade nicht verfügbar."
            : "✓ Dein Fortschritt bleibt auf diesem Gerät."}
        </Text>
      </Card>
      <Card style={{ backgroundColor: C.pale }}>
        <Text style={s.h2}>👩🏽 Das ist Lucía.</Text>
        <Label>Deine Lehrerin · simulierter Dialog</Label>
        <Text style={s.body}>
          „Du brauchst noch nicht viele Wörter. Lass uns mit einem Satz
          anfangen, den du heute schon benutzen kannst.“
        </Text>
      </Card>
      <Card>
        <Text style={s.h2}>Mehr sprechen. Weniger pauken.</Text>
        <View style={[s.row, { gap: 4 }]}>
          <View
            style={{
              flex: 8,
              height: 8,
              borderRadius: 8,
              backgroundColor: C.green,
            }}
          />
          <View
            style={{
              flex: 2,
              height: 8,
              borderRadius: 8,
              backgroundColor: C.yellow,
            }}
          />
        </View>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Text style={s.small}>80% Phrasen & Dialog</Text>
          <Text style={s.small}>20% Wörter</Text>
        </View>
      </Card>
    </Page>
  );
}
