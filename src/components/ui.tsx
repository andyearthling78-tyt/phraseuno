import { useI18n, useLocalizedAlert } from "../lib/i18n";
import { Text } from "./localized-text";
import { usePreferences } from "../lib/preferences";
import { LanguageMenu } from "./language-menu";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import { recordedSource } from "../lib/recorded-audio";
import { learningSpeech } from "../lib/speech";
export const C = {
  green: "#173e32",
  cream: "#f6f4eb",
  yellow: "#efd06d",
  ink: "#233d32",
  muted: "#75806f",
  line: "#dde2d3",
  paper: "#fffef9",
  pale: "#e9eddf",
};
export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={s.label}>{children}</Text>;
}
export function Button({
  children,
  onPress,
  secondary = false,
  accent = false,
  disabled = false,
  label,
}: {
  children: React.ReactNode;
  onPress: () => void;
  secondary?: boolean;
  accent?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  const { t } = useI18n();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ? t(label) : undefined}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        accent && { backgroundColor: C.yellow },
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={[s.buttonText, (secondary || accent) && { color: C.green }]}>
        {children}
      </Text>
    </Pressable>
  );
}
export function Speak({ text }: { text: string }) {
  const { t } = useI18n();
  const Alert = useLocalizedAlert();
  const { selectedVoice, preferences } = usePreferences();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(`${text} auf Spanisch anhören`)}
      onPress={() => {
        if (!selectedVoice && recordedSource(text, preferences.voiceGender, preferences.audioSpeed) === undefined) {
          Alert.alert("Sprachausgabe", "Bitte wähle in den Einstellungen eine verfügbare spanische Stimme.");
          return;
        }
        learningSpeech.speak({
          text, voice: selectedVoice ?? { identifier: "", language: "es-ES" },
          recording: { voice: preferences.voiceGender, speed: preferences.audioSpeed },
          onError: () => Alert.alert("Sprachausgabe", "Die Stimme konnte nicht abgespielt werden. Prüfe die Medienlautstärke und das gewählte Audiogerät und versuche es erneut."),
        });
      }}
      style={s.speak}
    >
      <Text style={{ color: C.green, fontSize: 21 }}>♪</Text>
    </Pressable>
  );
}
export function Progress({ value }: { value: number }) {
  const { t } = useI18n();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: value }}
      accessibilityLabel={t("Lernfortschritt")}
      style={s.progress}
    >
      <View
        style={{
          width: `${value}%`,
          height: 6,
          backgroundColor: "#789565",
          borderRadius: 6,
        }}
      />
    </View>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}
export function Page({
  children,
  lesson = false,
  autoScroll = false,
}: {
  children: React.ReactNode;
  lesson?: boolean;
  autoScroll?: boolean;
}) {
  const { t } = useI18n();
  const path = usePathname();
  const scroll = React.useRef<React.ElementRef<typeof ScrollView>>(null);
  return (
    <SafeAreaView style={s.page} edges={["top", "left", "right"]}>
      {!lesson && <View style={s.header}>
        <View style={s.logo}>
          <View style={s.mark}>
            <Text style={s.markText}>P</Text>
          </View>
          <Text style={s.brand}>
            Phrase<Text style={{ color: "#aa842a" }}>UNO</Text>
          </Text>
        </View>
        <View style={[s.row, { gap: 2 }]}>
          <LanguageMenu />
          {path !== "/onboarding" && <Pressable accessibilityRole="button" accessibilityLabel={t("Einstellungen öffnen")}
            onPress={() => { if (path !== "/settings") router.push("/settings"); }}
            style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: C.green, fontSize: 23 }}>⚙</Text>
          </Pressable>}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("Rechtliches öffnen")}
            onPress={() => router.push("/legal")}
            style={{
              minWidth: 44,
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: C.green, fontSize: 23 }}>ⓘ</Text>
          </Pressable>
        </View>
      </View>}
      <ScrollView
        ref={scroll}
        onContentSizeChange={() => {
          if (autoScroll) scroll.current?.scrollToEnd({ animated: false });
        }}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {!lesson && (
        <SafeAreaView edges={["bottom"]} style={s.bottom}>
          <View style={s.tabs}>
            {(
              [
                { path: "/", icon: "◫", name: "Lernen" },
                { path: "/words", icon: "▤", name: "Meine Wörter" },
                { path: "/progress", icon: "◴", name: "Fortschritt" },
              ] as const
            ).map((t) => (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: path === t.path }}
                key={t.path}
                onPress={() => router.replace(t.path)}
                style={s.tab}
              >
                <Text
                  style={[
                    s.tabIcon,
                    { color: path === t.path ? C.green : C.muted },
                  ]}
                >
                  {t.icon}
                </Text>
                <Text
                  style={[
                    s.tabText,
                    { color: path === t.path ? C.green : C.muted },
                  ]}
                >
                  {t.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.cream },
  header: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  logo: { flexDirection: "row", alignItems: "center", gap: 8 },
  mark: {
    backgroundColor: C.yellow,
    borderRadius: 9,
    width: 29,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  markText: { color: C.green, fontWeight: "900", fontSize: 23 },
  brand: { fontSize: 23, fontWeight: "800", letterSpacing: -1, color: C.green },
  language: {
    fontSize: 10,
    color: C.green,
    backgroundColor: "#eceee1",
    padding: 9,
    borderRadius: 20,
  },
  content: {
    padding: 20,
    paddingBottom: 35,
    gap: 19,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  title: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "800",
    letterSpacing: -1,
    color: C.green,
  },
  subtitle: { fontSize: 13, lineHeight: 20, color: C.muted, marginTop: 8 },
  label: {
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 1.7,
    fontWeight: "700",
    color: C.muted,
  },
  card: {
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    padding: 23,
    borderRadius: 22,
    gap: 17,
  },
  h2: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: C.green,
  },
  body: { fontSize: 14, lineHeight: 23, color: C.ink },
  small: { fontSize: 11, lineHeight: 17, color: C.muted },
  button: {
    backgroundColor: C.green,
    borderRadius: 12,
    padding: 16,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: { backgroundColor: C.pale, borderWidth: 1, borderColor: C.line },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.paper,
    textAlign: "center",
  },
  speak: {
    backgroundColor: "#e5ebda",
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  progress: {
    height: 6,
    backgroundColor: "#e0e4d5",
    borderRadius: 6,
    overflow: "hidden",
    flex: 1,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  note: { padding: 16, borderRadius: 12, backgroundColor: C.pale },
  bottom: { backgroundColor: C.paper, borderTopWidth: 1, borderColor: C.line },
  tabs: { flexDirection: "row", paddingVertical: 10 },
  tab: { flex: 1, alignItems: "center", gap: 5, padding: 5, minHeight: 47 },
  tabIcon: { fontSize: 21 },
  tabText: { fontSize: 10, fontWeight: "600" },
  center: { textAlign: "center" },
  token: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: "#cbd4be",
    backgroundColor: C.paper,
  },
  tokenText: { fontSize: 16, color: C.green, fontWeight: "600" },
  wrap: {
    flexDirection: "row",
    gap: 9,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  answer: {
    borderBottomWidth: 2,
    borderStyle: "dashed",
    borderColor: "#cdd5be",
    paddingVertical: 20,
    minHeight: 80,
    gap: 10,
  },
  hero: {
    borderRadius: 24,
    backgroundColor: C.green,
    padding: 27,
    overflow: "hidden",
    gap: 16,
    minHeight: 330,
  },
  heroTitle: {
    fontSize: 37,
    lineHeight: 41,
    fontWeight: "600",
    letterSpacing: -1.3,
    color: C.cream,
  },
  heroCopy: { fontSize: 13, lineHeight: 22, color: "#c8d6c0", maxWidth: 260 },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#62775c",
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  pillText: { fontSize: 10, color: "#e6ecd9" },
  stat: {
    flex: 1,
    backgroundColor: C.pale,
    borderRadius: 13,
    paddingVertical: 17,
    alignItems: "center",
    gap: 5,
  },
  statNumber: { fontSize: 26, fontWeight: "700", color: C.green },
});
