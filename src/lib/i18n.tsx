import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocales } from "expo-localization";
import { ActivityIndicator, Alert } from "react-native";
import { createStorageQueue } from "./storage";
import {
  LANGUAGE_KEY,
  LanguagePreference,
  resolveLanguage,
  restorePreference,
  translate,
} from "./translation";
const Context = createContext({
  language: "de" as "de" | "en",
  preference: "system" as LanguagePreference,
  setPreference: (_value: LanguagePreference) => {},
  t: (text: string) => text,
});
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locales = useLocales();
  const [preference, setValue] = useState<LanguagePreference>("system");
  const [ready, setReady] = useState(false);
  const [storage] = useState(() =>
    createStorageQueue(AsyncStorage, LANGUAGE_KEY),
  );
  const language = resolveLanguage(
    preference,
    locales.map((l) => l.languageTag),
  );
  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((value) => setValue(restorePreference(value)))
      .finally(() => setReady(true))
      .catch(() => {});
  }, []);
  function setPreference(value: LanguagePreference) {
    setValue(value);
    storage
      .save(value)
      .catch(() =>
        Alert.alert(
          translate("Sprache", language),
          translate("Sprachwahl konnte nicht gespeichert werden.", language),
        ),
      );
  }
  if (!ready)
    return (
      <ActivityIndicator
        style={{ flex: 1, backgroundColor: "#f6f4eb" }}
        color="#173e32"
      />
    );
  return (
    <Context.Provider
      value={{
        language,
        preference,
        setPreference,
        t: (text) => translate(text, language),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useI18n() {
  return useContext(Context);
}
export function useLocalizedAlert() {
  const { t } = useI18n();
  return {
    alert: (
      title: string,
      message?: string,
      buttons?: Parameters<typeof Alert.alert>[2],
    ) =>
      Alert.alert(
        t(title),
        message ? t(message) : undefined,
        buttons?.map((button) => ({
          ...button,
          text: button.text ? t(button.text) : undefined,
        })),
      ),
  };
}
