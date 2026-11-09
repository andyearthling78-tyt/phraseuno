import { useI18n } from "./i18n";
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { fresh, KEY, LearningState } from "./learning";
import { createStorageQueue } from "./storage";
import { CourseState, freshCourse, lessons, Lesson, restoreCourse, selectDay, reviewCollectedWord } from "./course";
type Store = {
  course: CourseState;
  lesson: Lesson;
  openDay: (id: number) => void;
  reviewWord: (es: string, known: boolean) => void;
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
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [storage] = useState(() => createStorageQueue(AsyncStorage, KEY));
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
      setCourse(freshCourse());
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
    <Context.Provider value={{ state, setState, course, lesson, openDay, reviewWord, saveError, clearProgress }}>
      {children}
    </Context.Provider>
  );
}
export function useLearning() {
  const value = useContext(Context);
  if (!value) throw new Error("LearningProvider fehlt");
  return value;
}
