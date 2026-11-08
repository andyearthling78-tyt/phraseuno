import { Modal, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./localized-text";
import { Button, C, s } from "./ui";
import { PlayfulDetails } from "./playful-details";
import { dailyMotivation } from "../lib/motivation";
import { useI18n } from "../lib/i18n";
export function LearningMoment({ visible, onContinue, onClose }: { visible: boolean; onContinue: () => void; onClose: () => void }) {
  const { t } = useI18n();
  const quote = dailyMotivation();
  return <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
    <SafeAreaView style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(12,35,27,0.45)", paddingHorizontal: 22 }}>
      <View accessibilityViewIsModal onAccessibilityEscape={onClose} style={{ backgroundColor: C.cream, padding: 22, borderRadius: 28, maxHeight: "95%", width: "100%", maxWidth: 500, alignSelf: "center" }}>
        <ScrollView contentContainerStyle={{ gap: 22 }}>
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <Text style={s.label}>DEIN KLEINER LERNMOMENT</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t("Lernmoment schließen")} onPress={onClose} style={{ minHeight: 44, minWidth: 44, justifyContent: "center", alignItems: "center" }}><Text style={{ color: C.green, fontSize: 25 }}>×</Text></Pressable>
          </View>
          <View style={{ padding: 27, borderRadius: 22, backgroundColor: C.green, gap: 22, overflow: "hidden" }}>
            <PlayfulDetails />
            <Text translate={false} accessibilityLanguage="es-ES" style={{ color: C.cream, fontSize: 26, lineHeight: 36, fontWeight: "600" }}>{quote.es}</Text>
            <View style={{ height: 2, width: 32, backgroundColor: C.yellow }} />
            <Text style={{ color: "#d5dfca", fontSize: 16, lineHeight: 25 }}>{quote.de}</Text>
          </View>
          <Text style={[s.small, s.center]}>Ein kleiner Schritt ist genug für heute.</Text>
          <Button onPress={onContinue}>Los geht’s →</Button>
        </ScrollView>
      </View>
    </SafeAreaView>
  </Modal>;
}
