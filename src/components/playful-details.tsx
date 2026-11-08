import { StyleSheet, View } from "react-native";
import { Text } from "./localized-text";
export function PlayfulDetails() {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
    <Text accessible={false} style={{ position: "absolute", top: -9, right: 14, fontSize: 54, opacity: 0.09, transform: [{ rotate: "17deg" }] }}>🌿</Text>
    <Text accessible={false} style={{ position: "absolute", top: "48%", right: -10, fontSize: 45, opacity: 0.07, transform: [{ rotate: "-16deg" }] }}>💬</Text>
    <Text accessible={false} style={{ position: "absolute", bottom: 12, left: -9, fontSize: 35, opacity: 0.08, transform: [{ rotate: "-20deg" }] }}>💛</Text>
  </View>;
}
