import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LearningProvider } from "../lib/store";
import { LanguageProvider } from "../lib/i18n";
export default function Layout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <LearningProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#f6f4eb" },
            }}
          />
        </LearningProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
