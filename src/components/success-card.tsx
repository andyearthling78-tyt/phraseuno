import React, { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import { Text } from "./localized-text";
import { Button, C } from "./ui";
// Clear, celebratory confirmation after a correct spoken or written answer.
export function SuccessCard({ title = "¡Muy bien!", text, action, onContinue }: { title?: string; text: string; action: string; onContinue: () => void }) {
  const [pop] = useState(() => new Animated.Value(0));
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) { pop.setValue(1); return; }
      Animated.timing(pop, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(2)), useNativeDriver: true }).start();
    });
  }, [pop]);
  return <View style={x.wrap} accessibilityLiveRegion="assertive">
    <Animated.View style={[x.badge, { transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }], opacity: pop }]}>
      <Text accessible={false} style={x.check}>✓</Text>
    </Animated.View>
    <Text translate={false} style={x.title}>{title}</Text>
    <Text style={x.text}>{text}</Text>
    <View style={{ alignSelf: "stretch" }}><Button onPress={onContinue}>{action}</Button></View>
  </View>;
}
const x = StyleSheet.create({
  wrap: { alignItems: "center", gap: 12, paddingVertical: 12, backgroundColor: "#e3efd3", borderRadius: 20, padding: 20 },
  badge: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.green, alignItems: "center", justifyContent: "center" },
  check: { color: C.yellow, fontSize: 44, fontWeight: "900" },
  title: { fontSize: 30, fontWeight: "800", color: C.green, letterSpacing: -0.6 },
  text: { fontSize: 15, lineHeight: 22, color: C.ink, textAlign: "center" },
});
