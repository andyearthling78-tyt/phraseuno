import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Redirect, router } from "expo-router";
import { LearningMoment } from "../components/learning-moment";
import { PlayfulDetails } from "../components/playful-details";
import { Text } from "../components/localized-text";
import { Button, C, Page, s } from "../components/ui";
import { localDay } from "../lib/motivation";
import { usePreferences } from "../lib/preferences";
import { useLearning } from "../lib/store";
import { lessons, weekStatus } from "../lib/course";
import { percent } from "../lib/learning";
const ICONS = ["☕", "🥖", "🍽️", "📍", "🍎", "🛏️", "💬"];
// Calm home screen: one clear next step, a week strip, nothing to read through.
export default function Home() {
  const { state, setState, saveError, lesson, course, openDay } = useLearning();
  const { preferences, update } = usePreferences();
  const [momentVisible, setMomentVisible] = useState(false);
  function openLesson() {
    setMomentVisible(false);
    if (state.stage === "intro") setState((v) => ({ ...v, stage: "build" }));
    router.push("/learn");
  }
  const week = weekStatus(course);
  const steps: [string, boolean][] = [["Phrasen", state.build === 4], ["Dialog", state.chat === 4], ["Wörter", state.known.length === 3]];
  if (!preferences.onboarded) return <Redirect href="/onboarding" />;
  return (
    <Page key={lesson.id}>
      <LearningMoment visible={momentVisible} onClose={() => setMomentVisible(false)} onContinue={() => {
        update({ lastMotivationDay: localDay() }).catch(() => {});
        openLesson();
      }} />
      <View style={[s.hero, h.hero]}>
        <PlayfulDetails />
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Text style={h.day}>Tag {lesson.id} · <Text>{lesson.label}</Text></Text>
          <Text accessible={false} style={{ fontSize: 40 }}>{ICONS[lesson.id - 1]}</Text>
        </View>
        <Text translate={false} style={h.phrase}>„{lesson.phrases[3].phrase}“</Text>
        <Text style={h.goal}>Das sagst du heute.</Text>
        <View style={h.steps}>
          {steps.map(([name, done]) => <View key={name} style={[h.step, done && h.stepDone]}>
            <Text style={[h.stepText, done && { color: C.green }]}>{done ? "✓ " : ""}{name}</Text>
          </View>)}
        </View>
        <Button accent onPress={() => {
          if (!state.completedAt && preferences.lastMotivationDay !== localDay()) setMomentVisible(true);
          else openLesson();
        }}>
          {state.completedAt ? "Tag wiederholen" : state.stage === "intro" ? "Los geht’s ↗" : ["Weiterlernen", ` · ${percent(state)} %`]}
        </Button>
      </View>

      <View style={{ gap: 10 }}>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Text style={s.h2}>Woche 1</Text>
          <Text style={s.small}>{week.completedDays} / 7</Text>
        </View>
        <View style={h.week}>
          {lessons.map((day) => {
            const done = !!course.days[String(day.id)]?.completedAt;
            const selected = day.id === lesson.id;
            return <Pressable key={day.id} accessibilityRole="button" accessibilityState={{ selected }}
              accessibilityLabel={`Tag ${day.id}: ${day.label}${done ? " ✓" : ""}`}
              onPress={() => openDay(day.id)}
              style={[h.dayDot, done && h.dayDone, selected && h.daySelected]}>
              <Text accessible={false} style={{ fontSize: 18 }}>{done ? "✓" : ICONS[day.id - 1]}</Text>
              <Text style={[h.dayNum, selected && { color: C.green }]}>{day.id}</Text>
            </Pressable>;
          })}
        </View>
      </View>

      {week.reviewOpen && !week.readyForNextWeek && <Button accent onPress={() => router.push({ pathname: "/words", params: { review: "week" } })}>Wochenabfrage starten →</Button>}
      {week.readyForNextWeek && <Text style={[s.body, s.center]}>✨ Woche 1 geschafft!</Text>}
      {saveError && <Text style={[s.small, s.center]}>Speichern gerade nicht verfügbar.</Text>}
    </Page>
  );
}
const h = StyleSheet.create({
  hero: { padding: 22, gap: 12, minHeight: 0 },
  day: { color: "#d2ddc5", fontSize: 13, fontWeight: "600", letterSpacing: 0.3 },
  phrase: { color: C.cream, fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.5 },
  goal: { color: C.yellow, fontSize: 13, fontWeight: "600" },
  steps: { flexDirection: "row", gap: 6, marginVertical: 4 },
  step: { flex: 1, borderRadius: 999, borderWidth: 1, borderColor: "#41604f", paddingVertical: 7, alignItems: "center" },
  stepDone: { backgroundColor: "#dfeccf", borderColor: "#dfeccf" },
  stepText: { fontSize: 12, color: "#d2ddc5", fontWeight: "600" },
  week: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  dayDot: { flex: 1, aspectRatio: 0.78, borderRadius: 14, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center", gap: 2 },
  dayDone: { backgroundColor: C.pale },
  daySelected: { borderColor: C.green, borderWidth: 2, backgroundColor: C.yellow },
  dayNum: { fontSize: 11, color: C.muted, fontWeight: "700" },
});
