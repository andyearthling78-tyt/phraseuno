import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Redirect, router } from "expo-router";
import { LearningMoment } from "../components/learning-moment";
import { PlayfulDetails } from "../components/playful-details";
import { Text } from "../components/localized-text";
import { Button, C, Card, Page, s } from "../components/ui";
import { localDay } from "../lib/motivation";
import { usePreferences } from "../lib/preferences";
import { useLearning } from "../lib/store";
import { lessons, weekStatus } from "../lib/course";
import { percent } from "../lib/learning";
import { currentStreak, weekXp } from "../lib/stats";
import { dayUnlocked } from "../lib/unlock";
const ICONS = ["☕", "🥖", "🍽️", "📍", "🍎", "🛏️", "💬"];
// PhraseUNO look, Duolingo-like progression: one next day, the rest unlocks step by step.
export default function Home() {
  const { course, stats, openDay } = useLearning();
  const { preferences, update } = usePreferences();
  const [moment, setMoment] = useState<number | null>(null);
  if (!preferences.onboarded) return <Redirect href="/onboarding" />;
  const today = localDay();
  const week = weekStatus(course);
  const completed = (id: number) => !!course.days[String(id)]?.completedAt;
  const nextLesson = lessons.find((l) => !completed(l.id)) ?? lessons[lessons.length - 1];
  const nextState = course.days[String(nextLesson.id)];
  const started = !!nextState && nextState.stage !== "intro" && !completed(nextLesson.id);
  function open(id: number) {
    setMoment(null);
    openDay(id);
    router.push("/learn");
  }
  function start(id: number) {
    if (preferences.lastMotivationDay !== today) setMoment(id);
    else open(id);
  }
  return (
    <Page>
      <LearningMoment visible={moment !== null} onClose={() => setMoment(null)} onContinue={() => {
        update({ lastMotivationDay: today }).catch(() => {});
        if (moment !== null) open(moment);
      }} />
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <Text style={s.small}>🔥 {currentStreak(stats, today)} <Text>Tage am Stück</Text></Text>
        <Text style={s.small}>✦ {weekXp(stats, today)} <Text>Punkte diese Woche</Text></Text>
      </View>
      {week.readyForNextWeek ? <View style={[s.hero, h.hero]}>
        <PlayfulDetails />
        <Text style={h.day}>Woche 1</Text>
        <Text style={h.phrase}>¡Enhorabuena! ✨</Text>
        <Text style={h.goal}>Alle sieben Lerntage und die Wochenabfrage geschafft.</Text>
      </View> : week.reviewOpen ? <View style={[s.hero, h.hero]}>
        <PlayfulDetails />
        <Text style={h.day}>Woche 1 · Abschluss</Text>
        <Text style={h.phrase}>Wochenabfrage</Text>
        <Text style={h.goal}>Alle Wörter der Woche – dann ist Woche 1 geschafft.</Text>
        <Button accent onPress={() => router.push({ pathname: "/words", params: { review: "week" } })}>Wochenabfrage starten ↗</Button>
      </View> : <View style={[s.hero, h.hero]}>
        <PlayfulDetails />
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Text style={h.day}>Tag {nextLesson.id} · <Text>{nextLesson.label}</Text></Text>
          <Text accessible={false} style={{ fontSize: 38 }}>{ICONS[nextLesson.id - 1]}</Text>
        </View>
        <Text translate={false} style={h.phrase}>„{nextLesson.phrases[3].phrase}“</Text>
        <Text style={h.goal}>Das sagst du heute.</Text>
        <Button accent onPress={() => start(nextLesson.id)}>
          {started ? ["Weiterlernen", ` · ${percent(nextState)} %`] : "Los geht’s ↗"}
        </Button>
      </View>}

      <Card>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Text style={s.h2}>Woche 1</Text>
          <Text style={s.small}>{week.completedDays} / 7</Text>
        </View>
        {lessons.map((day, i) => {
          const doneDay = completed(day.id);
          const open_ = dayUnlocked(day.id, completed);
          const current = day.id === nextLesson.id && !doneDay;
          return <Pressable key={day.id} disabled={!open_} accessibilityRole="button" accessibilityState={{ disabled: !open_ }}
            onPress={() => (current ? start(day.id) : open(day.id))}
            style={({ pressed }) => [h.dayRow, current && h.dayCurrent, { opacity: !open_ ? 0.45 : pressed ? 0.7 : 1 }]}>
            <View style={[h.dayIcon, doneDay && { backgroundColor: C.pale }, current && { backgroundColor: C.yellow }]}>
              <Text accessible={false} style={{ fontSize: 20 }}>{doneDay ? "✓" : open_ ? ICONS[i] : "🔒"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.body, { fontWeight: current ? "700" : "500", color: C.green }]}>Tag {day.id} · <Text>{day.label}</Text></Text>
            </View>
            <Text style={s.small}>{doneDay ? "✓" : current ? "Jetzt" : ""}</Text>
          </Pressable>;
        })}
        <Pressable disabled={!week.reviewOpen} accessibilityRole="button" accessibilityState={{ disabled: !week.reviewOpen }}
          onPress={() => router.push({ pathname: "/words", params: { review: "week" } })}
          style={[h.dayRow, !week.reviewOpen && { opacity: 0.45 }]}>
          <View style={h.dayIcon}><Text accessible={false} style={{ fontSize: 20 }}>{week.readyForNextWeek ? "✓" : week.reviewOpen ? "✦" : "🔒"}</Text></View>
          <Text style={[s.body, { flex: 1, color: C.green }]}>Wochenabfrage</Text>
        </Pressable>
      </Card>
    </Page>
  );
}
const h = StyleSheet.create({
  hero: { padding: 22, gap: 12, minHeight: 0 },
  day: { color: "#d2ddc5", fontSize: 13, fontWeight: "600", letterSpacing: 0.3 },
  phrase: { color: C.cream, fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.5 },
  goal: { color: C.yellow, fontSize: 13, fontWeight: "600" },
  dayRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 14 },
  dayCurrent: { backgroundColor: C.pale },
  dayIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
});
