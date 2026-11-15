import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, AppState, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { defaultCourse } from "../content";
import type { Course, L10n, Lang } from "../domain/types";
import { defaultPrefs, PREFS_KEY, resolveLanguage, restorePrefs, selectVoice } from "../domain/prefs";
import type { DeviceVoice, Prefs } from "../domain/prefs";
import { fresh, LEGACY_KEY, migrateLegacy, PROGRESS_KEY, restore } from "../domain/progress";
import type { Progress } from "../domain/progress";
import { localDay } from "../domain/srs";
import { de } from "../i18n/de";
import type { Key } from "../i18n/de";
import { en } from "../i18n/en";
import { createStorageQueue } from "../services/sequencer";
import { loadVoices } from "../services/speech";
import { initPurchases } from "../services/purchases";
import { syncReminder } from "../services/reminders";
import { theme } from "../ui/theme";

type Translate = (key: Key, vars?: Record<string, string | number>) => string;
type App = {
  course: Course; lang: Lang; t: Translate; l: (text: L10n) => string; today: string;
  prefs: Prefs; setPrefs: (patch: Partial<Prefs>) => void;
  progress: Progress; setProgress: (update: (current: Progress) => Progress) => void; resetProgress: () => Promise<void>;
  premium: boolean; setDevPremium: (value: boolean) => void;
  voices: DeviceVoice[]; voice: DeviceVoice | undefined; voicesLoading: boolean;
  reminderState: "off" | "scheduled" | "blocked" | "error"; saveError: boolean;
};
const Context = createContext<App | null>(null);
const catalogs = { de, en } as const;
export function AppProvider({ children }: { children: React.ReactNode }) {
  const course = defaultCourse;
  const [prefs, setPrefsState] = useState<Prefs>(defaultPrefs);
  const [progress, setProgressState] = useState<Progress>(fresh);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [storePremium, setStorePremium] = useState(false);
  const [devPremium, setDevPremium] = useState(false);
  const [voices, setVoices] = useState<DeviceVoice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [today, setToday] = useState(() => localDay());
  const [reminderState, setReminderState] = useState<App["reminderState"]>("off");
  const queues = useRef({ prefs: createStorageQueue(AsyncStorage, PREFS_KEY), progress: createStorageQueue(AsyncStorage, PROGRESS_KEY) });

  useEffect(() => {
    (async () => {
      try {
        const [rawPrefs, rawProgress] = await Promise.all([AsyncStorage.getItem(PREFS_KEY), AsyncStorage.getItem(PROGRESS_KEY)]);
        setPrefsState(restorePrefs(rawPrefs));
        if (rawProgress) setProgressState(restore(rawProgress, course));
        else {
          // First start of this generation: carry completed days over from the previous app version.
          const migrated = migrateLegacy(await AsyncStorage.getItem(LEGACY_KEY), course, localDay());
          if (migrated) { setProgressState(migrated); setPrefsState((p) => ({ ...p, onboarded: true })); }
        }
      } catch { setSaveError(true); }
      setReady(true);
    })();
    loadVoices().then((all) => setVoices(all as DeviceVoice[])).catch(() => {}).finally(() => setVoicesLoading(false));
    void initPurchases(setStorePremium);
    // The date drives due reviews and the streak; refresh it when the app returns to the foreground.
    const sub = AppState.addEventListener("change", (state) => { if (state === "active") setToday(localDay()); });
    return () => sub.remove();
  }, [course]);
  useEffect(() => { if (ready) queues.current.prefs.save(JSON.stringify(prefs)).then(() => setSaveError(false), () => setSaveError(true)); }, [prefs, ready]);
  useEffect(() => { if (ready) queues.current.progress.save(JSON.stringify(progress)).then(() => setSaveError(false), () => setSaveError(true)); }, [progress, ready]);

  const lang = resolveLanguage(prefs.language, getLocales().map((locale) => locale.languageTag));
  const t = useCallback<Translate>((key, vars) => {
    let text: string = catalogs[lang][key] ?? de[key];
    if (vars) for (const [name, value] of Object.entries(vars)) text = text.replace(`{${name}}`, String(value));
    return text;
  }, [lang]);
  useEffect(() => {
    if (!ready) return;
    syncReminder({ enabled: prefs.reminder, time: prefs.reminderTime, title: t("reminder.push.title"), body: t("reminder.push.body") })
      .then(setReminderState, () => setReminderState("error"));
  }, [ready, prefs.reminder, prefs.reminderTime, t, today]);

  const value = useMemo<App>(() => ({
    course, lang, t, l: (text) => text[lang], today,
    prefs, setPrefs: (patch) => setPrefsState((current) => ({ ...current, ...patch })),
    progress, setProgress: (update) => setProgressState(update),
    resetProgress: async () => { await queues.current.progress.clear(); await AsyncStorage.removeItem(LEGACY_KEY); setProgressState(fresh()); },
    premium: storePremium || (__DEV__ && devPremium), setDevPremium,
    voices, voice: selectVoice(voices, course.speechLocale, prefs.voice, prefs.voiceId), voicesLoading,
    reminderState, saveError,
  }), [course, lang, t, today, prefs, progress, storePremium, devPremium, voices, voicesLoading, reminderState, saveError]);
  if (!ready) return <View style={{ flex: 1, backgroundColor: theme.cream, justifyContent: "center" }}><ActivityIndicator color={theme.green} /></View>;
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("AppProvider missing");
  return value;
}
