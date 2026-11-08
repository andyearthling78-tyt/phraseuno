import { useI18n } from "../../lib/i18n";
import { Text } from "../../components/localized-text";
import { useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import notices from "../../lib/licenses.json";
import { LegalDocument } from "../../components/legal-document";
import { Button, Card, C, s } from "../../components/ui";
export default function Licenses() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(25);
  const results = useMemo(
    () =>
      notices
        .map((n, i) => ({ ...n, id: i }))
        .filter((n) => n.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  return (
    <LegalDocument title="Open-Source-Lizenzen">
      <Text style={s.body}>
        PhraseUNO verwendet Open-Source-Software. Hier findest du Paketangaben
        und die mitgelieferten Lizenz- und Urheberrechtshinweise, einschließlich
        nativer Bibliotheken. Die Liste umfasst auch Entwicklungswerkzeuge.
      </Text>
      <TextInput
        accessibilityLabel={t("Bibliothek suchen")}
        value={query}
        onChangeText={(v) => {
          setQuery(v);
          setCount(25);
        }}
        placeholder={t("Bibliothek suchen …")}
        placeholderTextColor={C.muted}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 12,
          backgroundColor: C.paper,
          padding: 15,
          color: C.green,
          fontSize: 16,
        }}
      />
      <Text style={s.small}>
        {results.length} {results.length === 1 ? "Eintrag" : "Einträge"}
      </Text>
      <Card>
        {results.slice(0, count).map((n) => (
          <Pressable
            key={n.id}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/legal/lizenz",
                params: { id: String(n.id) },
              })
            }
            style={[s.row, { paddingVertical: 8 }]}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontWeight: "600", color: C.green, fontSize: 14 }}>
                {n.name}
              </Text>
              <Text style={s.small}>
                {n.version} · {n.license}
              </Text>
            </View>
            <Text style={{ color: C.green }}>›</Text>
          </Pressable>
        ))}
        {!results.length && (
          <Text style={s.body}>Keine passende Bibliothek gefunden.</Text>
        )}
      </Card>
      {results.length > count && (
        <Button secondary onPress={() => setCount((v) => v + 25)}>
          Weitere Einträge anzeigen
        </Button>
      )}
    </LegalDocument>
  );
}
