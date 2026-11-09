import React, { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import { Text } from "../localized-text";
import { Button, C } from "../ui";
export type Result = { ok: boolean; solution?: string; note?: string; heard?: string; skipped?: boolean };
// Duolingo-style bottom sheet: green ✓ "¡Muy bien!" or warm "Richtige Lösung".
export function FeedbackBar({ result, onContinue }: { result: Result; onContinue: () => void }) {
  const [rise] = useState(() => new Animated.Value(0));
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) rise.setValue(1);
      else Animated.timing(rise, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
  }, [rise]);
  const ok = result.ok;
  return <Animated.View accessibilityLiveRegion="assertive" style={[f.bar, ok ? f.ok : f.bad, {
    transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [140, 0] }) }] }]}>
    <View style={f.head}>
      <View style={[f.badge, { backgroundColor: ok ? C.green : "#b5482f" }]}><Text accessible={false} style={f.badgeText}>{ok ? "✓" : "↻"}</Text></View>
      <Text translate={!ok} style={[f.title, { color: ok ? C.green : "#8a3420" }]}>{ok ? "¡Muy bien!" : "Fast!"}</Text>
    </View>
    {!ok && !!result.heard && <Text style={f.small}>Verstanden: <Text translate={false}>„{result.heard}“</Text></Text>}
    {!ok && !!result.solution && <><Text style={[f.small, { color: "#8a3420" }]}>Richtige Lösung:</Text><Text translate={false} style={f.solution}>{result.solution}</Text></>}
    {!!result.note && <Text style={f.note}>{result.note}</Text>}
    {!ok && <Text style={f.small}>Diese Übung kommt am Ende noch einmal.</Text>}
    <Button accent={!ok} onPress={onContinue}>Weiter</Button>
  </Animated.View>;
}
const f = StyleSheet.create({
  bar: { padding: 20, paddingBottom: 28, gap: 8, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  ok: { backgroundColor: "#dcebc8" },
  bad: { backgroundColor: "#f8e1d4" },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badgeText: { color: C.cream, fontSize: 22, fontWeight: "900" },
  title: { fontSize: 24, fontWeight: "800" },
  small: { fontSize: 13, color: C.ink },
  solution: { fontSize: 18, fontWeight: "700", color: "#5d2414" },
  note: { fontSize: 14, lineHeight: 20, color: C.ink },
});
