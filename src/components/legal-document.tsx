import { Text } from "./localized-text";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { Card, C, Label, Page, s } from "./ui";
import { legalVersion } from "../lib/legal";
export function LegalDocument({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Page>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/legal")}
        style={{ paddingVertical: 8 }}
      >
        <Text style={{ color: C.green }}>← Rechtliches</Text>
      </Pressable>
      <View>
        <Label>PHRASEUNO · RECHTLICHES</Label>
        <Text style={[s.title, { marginTop: 10 }]}>{title}</Text>
        <Text style={s.subtitle}>Stand: {legalVersion}</Text>
      </View>
      {children}
    </Page>
  );
}
export function LegalSections({
  sections,
}: {
  sections: { title: string; text: string }[];
}) {
  return (
    <>
      {sections.map((section) => (
        <Card key={section.title}>
          <Text accessibilityRole="header" style={s.h2}>
            {section.title}
          </Text>
          <Text selectable style={s.body}>
            {section.text}
          </Text>
        </Card>
      ))}
    </>
  );
}
