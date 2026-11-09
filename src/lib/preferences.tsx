import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import * as Notifications from "expo-notifications";
import { ActivityIndicator, AppState } from "react-native";
import { router } from "expo-router";
import { createStorageQueue } from "./storage";
import { useI18n } from "./i18n";
import { defaultPreferences, PREFERENCES_KEY, Preferences, restorePreferences, selectVoice } from "./preferences-model";
import { reminderPermission, synchronizeReminder } from "./reminders";
import { REMINDER_ID } from "./reminder-queue";
function usePreferencesState() {
  const { language } = useI18n();
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const current = useRef(preferences);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [voices, setVoices] = useState<(Speech.Voice & { gender?: string })[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voiceError, setVoiceError] = useState(false);
  const [reminderState, setReminderState] = useState("off");
  const [storage] = useState(() => createStorageQueue(AsyncStorage, PREFERENCES_KEY));
  useEffect(() => {
    AsyncStorage.getItem(PREFERENCES_KEY).then((raw) => {
      current.current = restorePreferences(raw); setPreferences(current.current);
    }).catch(() => setSaveError(true)).finally(() => setReady(true));
    Speech.getAvailableVoicesAsync().then((all) => setVoices(all.filter((v) => /^es([-_]|$)/i.test(v.language))))
      .catch(() => setVoiceError(true)).finally(() => setVoicesLoading(false));
  }, []);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    const sync = () => {
      synchronizeReminder({ enabled: preferences.reminderEnabled, time: preferences.reminderTime, language })
        .then((status) => { if (active) setReminderState(status); })
        .catch(() => { if (active) setReminderState("error"); });
    };
    sync();
    const subscription = AppState.addEventListener("change", (state) => { if (state === "active") sync(); });
    return () => { active = false; subscription.remove(); };
  }, [ready, preferences.reminderEnabled, preferences.reminderTime, language]);
  useEffect(() => {
    function open(response: Notifications.NotificationResponse | null) {
      if (response?.notification.request.identifier !== REMINDER_ID) return;
      router.replace("/");
      Notifications.clearLastNotificationResponse();
    }
    if (!ready) return;
    open(Notifications.getLastNotificationResponse());
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, [ready]);
  async function update(patch: Partial<Preferences>) {
    const next = { ...current.current, ...patch };
    current.current = next; setPreferences(next);
    try { await storage.save(JSON.stringify(next)); setSaveError(false); }
    catch (error) { setSaveError(true); throw error; }
  }
  async function enableReminder(enabled: boolean) {
    if (enabled && !await reminderPermission(true)) { setReminderState("blocked"); return false; }
    await update({ reminderEnabled: enabled });
    return true;
  }
  return { preferences, update, ready, saveError, voices, voicesLoading, voiceError,
    selectedVoice: selectVoice(voices, preferences.voiceGender, preferences.voiceId), reminderState, enableReminder };
}
const Context = createContext<ReturnType<typeof usePreferencesState> | null>(null);
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const value = usePreferencesState();
  return <Context.Provider value={value}>{value.ready ? children : <ActivityIndicator style={{ flex: 1, backgroundColor: "#f6f4eb" }} color="#173e32" />}</Context.Provider>;
}
export function usePreferences() {
  const context = useContext(Context);
  if (!context) throw new Error("PreferencesProvider fehlt");
  return context;
}
