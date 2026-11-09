import { useI18n } from "./i18n";
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { fresh, KEY, LearningState } from "./learning";
import { createStorageQueue } from "./storage";
import { freshStats, recordLesson, restoreStats, Stats, STATS_KEY } from "./stats";
import { localDay } from "./motivation";
import { CourseState, freshCourse, lessons, Lesson, restoreCourse, selectDay, reviewCollectedWord, completeWeekReview } from "./course";
type Store = {
  course: CourseState;
  lesson: Lesson;
  openDay: (id: number) => void;
  reviewWord: (es: string, known: boolean) => void;
  finishWeekReview: () => void;
  stats: Stats;
  finishLesson: (xp: number) => void;
  state: LearningState;
  setState: React.Dispatch<React.SetStateAction<LearningState>>;
  saveError: boolean;
  clearProgress: () => Promise<void>;
};
const Context = createContext<Store | null>(null);
export function LearningProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [course, setCourse] = useState(freshCourse);
  const state = course.days[String(course.selectedDay)] ?? fresh();
  const lesson = lessons.find((day) => day.id === course.selectedDay) ?? lessons[0];
  const setState: Store["setState"] = (action) => setCourse((previous) => {
    const key = String(previous.selectedDay);
    const current = previous.days[key] ?? fresh();
    return { ...previous, days: { ...previous.days, [key]: typeof action === "function" ? action(current) : action } };
  });
  const openDay = (id: number) => setCourse((previous) => selectDay(previous, id));
  const reviewWord = (es: string, known: boolean) => setCourse(previous => reviewCollectedWord(previous, es, known));
  const finishWeekReview = () => setCourse(previous => completeWeekReview(previous));
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [storage] = useState(() => createStorageQueue(AsyncStorage, KEY));
  const [stats, setStats] = useState<Stats>(freshStats);
  const [statsReady, setStatsReady] = useState(false);
  const [statsStorage] = useState(() => createStorageQueue(AsyncStorage, STATS_KEY));
  const finishLesson = (xp: number) => setStats((previous) => recordLesson(previous, localDay(), xp));
  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY).then((raw) => setStats(restoreStats(raw))).catch(() => {}).finally(() => setStatsReady(true));
  }, []);
  useEffect(() => {
    if (statsReady) statsStorage.save(JSON.stringify(stats)).catch(() => setSaveError(true));
  }, [stats, statsReady, statsStorage]);
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => setCourse(restoreCourse(raw)))
      .catch(() => setSaveError(true))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!ready) return;
    const raw = JSON.stringify(course);
    storage
      .save(raw)
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, [course, ready, storage]);
  async function clearProgress() {
    try {
      await storage.clear();
      await statsStorage.clear();
      setCourse(freshCourse());
      setStats(freshStats());
      setSaveError(false);
    } catch (error) {
      setSaveError(true);
      throw error;
    }
  }
  if (!ready || !statsReady)
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
    <Context.Provider value={{ state, setState, course, lesson, openDay, reviewWord, finishWeekReview, stats, finishLesson, saveError, clearProgress }}>
      {children}
    </Context.Provider>
  );
}
export function useLearning() {
  const value = useContext(Context);
  if (!value) throw new Error("LearningProvider fehlt");
  return value;
}
