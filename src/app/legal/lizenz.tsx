import { Text } from "../../components/localized-text";
import { useLocalSearchParams, router } from "expo-router";
import { Pressable } from "react-native";
import notices from "../../lib/licenses.json";
import { LegalDocument } from "../../components/legal-document";
import { Card, C, s } from "../../components/ui";
export default function License() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const index = Number(id);
  const item =
    /^\d+$/.test(id ?? "") && Number.isSafeInteger(index)
      ? notices[index]
      : undefined;
  return (
    <LegalDocument title={item?.name ?? "Lizenz nicht gefunden"}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/legal/lizenzen")}
        style={{ paddingVertical: 8 }}
      >
        <Text style={{ color: C.green }}>← Alle Lizenzen</Text>
      </Pressable>
      {item ? (
        <Card>
          <Text style={s.small}>
            {item.version} · {item.license} · {item.source}
          </Text>
          <Text
            translate={false}
            selectable
            style={[s.body, { fontSize: 12, lineHeight: 19 }]}
          >
            {item.text}
          </Text>
        </Card>
      ) : (
        <Text style={s.body}>Dieser Eintrag ist nicht verfügbar.</Text>
      )}
    </LegalDocument>
  );
}
