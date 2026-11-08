import React, { useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../lib/i18n";
import { Text } from "./localized-text";

export function LanguageMenu() {
  const { language, preference, setPreference, t } = useI18n();
  const trigger = useRef<React.ElementRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<{ bottom: number; right: number } | null>(null);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const close = () => setAnchor(null);
  const menuWidth = Math.min(288, width - 32);
  return (
    <>
      <View ref={trigger} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Sprache ändern")}
          accessibilityState={{ expanded: anchor !== null }}
          onPress={() => trigger.current?.measureInWindow((x, y, w, h) => {
            setAnchor({ bottom: y + h, right: Math.max(16, width - x - w) });
          })}
          style={styles.trigger}
        >
          <Text style={styles.triggerText}>{language.toUpperCase()} ⌄</Text>
        </Pressable>
      </View>
      <Modal transparent visible={anchor !== null} animationType="none"
        statusBarTranslucent navigationBarTranslucent onRequestClose={close}
        supportedOrientations={["portrait", "landscape"]}>
        <View style={styles.overlay} onAccessibilityEscape={close}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close}
            accessibilityRole="button" accessibilityLabel={t("Sprachauswahl schließen")} />
          {anchor && (
            <View accessibilityViewIsModal style={[styles.menu, {
              width: menuWidth,
              right: Math.min(anchor.right, width - menuWidth - 16),
              top: Math.max(insets.top + 8, Math.min(anchor.bottom + 6, height - insets.bottom - 260)),
              maxHeight: height - insets.top - insets.bottom - 24,
            }]}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <Text accessibilityRole="header" style={styles.heading}>App-Sprache</Text>
                {([
                  { value: "system", name: "Gerätesprache verwenden" },
                  { value: "de", name: "Deutsch" },
                  { value: "en", name: "English" },
                ] as const).map((item) => (
                  <Pressable key={item.value} accessibilityRole="radio"
                    accessibilityLabel={t(item.name)}
                    accessibilityState={{ checked: preference === item.value }}
                    onPress={() => { setPreference(item.value); close(); }}
                    style={({ pressed }) => [styles.option,
                      preference === item.value && styles.selected,
                      pressed && { opacity: 0.65 }]}>
                    <Text style={styles.optionText}>{item.name}</Text>
                    <Text accessible={false} style={styles.check}>{preference === item.value ? "✓" : ""}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  trigger: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  triggerText: { fontSize: 12, color: "#173e32", fontWeight: "700" },
  overlay: { flex: 1 },
  menu: { position: "absolute", padding: 8, backgroundColor: "#fffef9", borderRadius: 18,
    borderWidth: 1, borderColor: "#dde2d3", boxShadow: "0px 8px 30px rgba(23,62,50,0.18)", elevation: 8 },
  heading: { color: "#75806f", fontSize: 12, fontWeight: "700", padding: 12 },
  option: { minHeight: 48, padding: 12, borderRadius: 11, flexDirection: "row", alignItems: "center", gap: 8 },
  selected: { backgroundColor: "#e9eddf" },
  optionText: { flex: 1, fontSize: 15, color: "#173e32" },
  check: { width: 20, color: "#173e32", fontWeight: "700", fontSize: 18 },
});
