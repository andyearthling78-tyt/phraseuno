import { useI18n } from "./i18n";
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { fresh, KEY, LearningState, restore } from "./learning";
import { createStorageQueue } from "./storage";
type Store = {
  state: LearningState;
  setState: React.Dispatch<React.SetStateAction<LearningState>>;
  saveError: boolean;
  clearProgress: () => Promise<void>;
};
const Context = createContext<Store | null>(null);
export function LearningProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [state, setState] = useState(fresh);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [storage] = useState(() => createStorageQueue(AsyncStorage, KEY));
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => setState(restore(raw)))
      .catch(() => setSaveError(true))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!ready) return;
    const raw = JSON.stringify(state);
    storage
      .save(raw)
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, [state, ready, storage]);
  async function clearProgress() {
    try {
      await storage.clear();
      setState(fresh());
      setSaveError(false);
    } catch (error) {
      setSaveError(true);
      throw error;
    }
  }
  if (!ready)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f6f4eb",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          color="#173e32"
          accessibilityLabel={t("Lernstand laden")}
        />
      </View>
    );
  return (
    <Context.Provider value={{ state, setState, saveError, clearProgress }}>
      {children}
    </Context.Provider>
  );
}
export function useLearning() {
  const value = useContext(Context);
  if (!value) throw new Error("LearningProvider fehlt");
  return value;
}
