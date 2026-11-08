import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LearningProvider } from "../lib/store";
import { LanguageProvider } from "../lib/i18n";
import { PreferencesProvider } from "../lib/preferences";
export default function Layout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <PreferencesProvider>
        <LearningProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#f6f4eb" },
            }}
          />
        </LearningProvider>
        </PreferencesProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
