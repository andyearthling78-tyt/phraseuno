import React from "react";
import { Pressable, ScrollView, StyleSheet, Text as RNText, View } from "react-native";
import type { StyleProp, TextProps, TextStyle, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
import { useApp } from "../state/app";
import { space, theme } from "./theme";

type Variant = "title" | "h2" | "body" | "small" | "label";
/** Text in the UI language; `es` marks Spanish learning content for screen readers. */
export function T({ v = "body", center, es, style, ...props }: TextProps & { v?: Variant; center?: boolean; es?: boolean }) {
  const { lang } = useApp();
  return <RNText {...props} accessibilityLanguage={es ? "es" : lang} style={[k[v], center && { textAlign: "center" }, style]} />;
}
export function Button({ children, onPress, kind = "primary", disabled, style }: {
  children: React.ReactNode; onPress: () => void; kind?: "primary" | "secondary" | "accent" | "ghost"; disabled?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const light = kind !== "primary";
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [k.button, kind === "secondary" && { backgroundColor: theme.pale }, kind === "accent" && { backgroundColor: theme.yellow },
      kind === "ghost" && { backgroundColor: "transparent", minHeight: 40 }, { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 }, style]}>
    <RNText style={[k.buttonText, light && { color: theme.green }, kind === "ghost" && { fontWeight: "500", fontSize: 14 }]}>{children}</RNText>
  </Pressable>;
}
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[k.card, style]}>{children}</View>;
}
export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[k.row, style]}>{children}</View>;
}
export function ProgressBar({ value }: { value: number }) {
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }} style={k.track}>
    <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: 6, borderRadius: 6, backgroundColor: "#789565" }} />
  </View>;
}
/** Small secondary action: icon above a one-line label. */
export function Pill({ label, icon, onPress, disabled, active }: { label: string; icon: string; onPress: () => void; disabled?: boolean; active?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled, selected: !!active }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [k.pill, active && { backgroundColor: theme.green }, { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 }]}>
    <RNText accessible={false} style={{ fontSize: 18, color: active ? theme.cream : theme.green }}>{icon}</RNText>
    <RNText numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 11, fontWeight: "600", color: active ? theme.cream : theme.green }}>{label}</RNText>
  </Pressable>;
}
export function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress}
    style={({ pressed }) => [k.choice, selected && { backgroundColor: theme.pale, borderColor: theme.green }, { opacity: pressed ? 0.7 : 1 }]}>
    <RNText style={[k.body, { flex: 1, fontWeight: selected ? "700" : "400" }]}>{label}</RNText>
    <RNText accessible={false} style={{ color: theme.green }}>{selected ? "●" : "○"}</RNText>
  </Pressable>;
}
const TABS = [{ path: "/", icon: "◫", key: "tab.learn" }, { path: "/words", icon: "▤", key: "tab.words" }, { path: "/profile", icon: "◴", key: "tab.profile" }] as const;
/** Page frame. Main pages show the brand header and the three tabs; focused pages show neither. */
export function Screen({ children, tabs = false, title, onBack }: { children: React.ReactNode; tabs?: boolean; title?: string; onBack?: () => void }) {
  const { t } = useApp();
  const path = usePathname();
  return <SafeAreaView style={k.page} edges={["top", "left", "right"]}>
    {tabs ? <View style={k.header}>
      <View style={k.mark}><RNText style={k.markText}>P</RNText></View>
      <RNText style={k.brand}>Phrase<RNText style={{ color: "#aa842a" }}>UNO</RNText></RNText>
    </View> : (title !== undefined || onBack) && <View style={[k.header, { paddingVertical: 8 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={t("common.back")} onPress={onBack ?? (() => router.back())} style={k.back}>
        <RNText style={{ fontSize: 22, color: theme.green }}>←</RNText>
      </Pressable>
      {!!title && <RNText style={[k.h2, { flex: 1 }]}>{title}</RNText>}
    </View>}
    <ScrollView contentContainerStyle={k.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">{children}</ScrollView>
    {tabs && <SafeAreaView edges={["bottom"]} style={k.tabs}>
      {TABS.map((tab) => {
        const on = path === tab.path;
        return <Pressable key={tab.path} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => { if (!on) router.replace(tab.path); }} style={k.tab}>
          <RNText accessible={false} style={{ fontSize: 20, color: on ? theme.green : theme.muted }}>{tab.icon}</RNText>
          <RNText style={{ fontSize: 11, fontWeight: on ? "700" : "500", color: on ? theme.green : theme.muted }}>{t(tab.key)}</RNText>
        </Pressable>;
      })}
    </SafeAreaView>}
  </SafeAreaView>;
}
const text = (style: TextStyle) => style;
export const k = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.cream },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: space.l, paddingVertical: 14, borderBottomWidth: 1, borderColor: theme.line },
  mark: { backgroundColor: theme.yellow, borderRadius: 9, width: 29, height: 32, justifyContent: "center", alignItems: "center" },
  markText: { color: theme.green, fontWeight: "900", fontSize: 23 },
  brand: { fontSize: 23, fontWeight: "800", letterSpacing: -1, color: theme.green },
  back: { width: 44, height: 44, justifyContent: "center" },
  content: { padding: space.l, gap: space.m, paddingBottom: 48 },
  tabs: { flexDirection: "row", borderTopWidth: 1, borderColor: theme.line, backgroundColor: theme.paper },
  tab: { flex: 1, alignItems: "center", paddingVertical: 9, gap: 2, minHeight: 52 },
  title: text({ fontSize: 28, lineHeight: 34, fontWeight: "800", letterSpacing: -0.6, color: theme.green }),
  h2: text({ fontSize: 19, lineHeight: 25, fontWeight: "700", letterSpacing: -0.3, color: theme.green }),
  body: text({ fontSize: 15, lineHeight: 23, color: theme.ink }),
  small: text({ fontSize: 12, lineHeight: 17, color: theme.muted }),
  label: text({ fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: theme.muted }),
  button: { minHeight: 52, borderRadius: 15, backgroundColor: theme.green, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  buttonText: { color: theme.cream, fontSize: 16, fontWeight: "700" },
  card: { backgroundColor: theme.paper, borderWidth: 1, borderColor: theme.line, borderRadius: 22, padding: space.l, gap: space.m },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  track: { flex: 1, height: 6, borderRadius: 6, backgroundColor: "#e0e4d5", overflow: "hidden" },
  pill: { flex: 1, minHeight: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", gap: 2, paddingHorizontal: 2, backgroundColor: theme.pale },
  choice: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.paper },
  hero: { borderRadius: 24, backgroundColor: theme.green, padding: space.l, gap: 12 },
  note: { padding: 14, borderRadius: 12, backgroundColor: theme.pale },
});
