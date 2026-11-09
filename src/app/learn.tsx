import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Text } from "../components/localized-text";
import { Button, C, s } from "../components/ui";
import { FeedbackBar, Result } from "../components/lesson/feedback-bar";
import { DialogExercise, MatchExercise, SpeakExercise, TilesExercise, WordExercise, WriteExercise } from "../components/lesson/exercises";
import { buildSession, Exercise, lessonXp, progressAfter } from "../lib/exercises";
import { lessons, weekStatus } from "../lib/course";
import { fresh } from "../lib/learning";
import { localDay } from "../lib/motivation";
import { currentStreak } from "../lib/stats";
import { learningSpeech } from "../lib/speech";
import { useLearning } from "../lib/store";

// One learning day as a run of short exercises. Wrong answers come back at the end.
export default function Learn() {
  const { state, setState, lesson, course, stats, finishLesson, openDay } = useLearning();
  const [start] = useState(() => (state.stage === "intro" ? { ...state, stage: "build" as const } : state));
  const [queue, setQueue] = useState<Exercise[]>(() => (start.stage === "summary" ? [] : buildSession(lesson, start, lessons)));
  const [total] = useState(() => queue.length);
  const [index, setIndex] = useState(0);
  const [passed, setPassed] = useState<Set<string>>(() => new Set());
  const [feedback, setFeedback] = useState<Result | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [noSpeech, setNoSpeech] = useState(false);
  const [earned, setEarned] = useState<number | null>(null);
  const finished = useRef(false);
  const current = queue[index];
  const done = total > 0 && index >= queue.length;
  useEffect(() => () => { void learningSpeech.stop(); }, []);
  useEffect(() => {
    if (!done || finished.current) return;
    finished.current = true;
    const xp = lessonXp(mistakes);
    setEarned(xp); finishLesson(xp);
  }, [done, mistakes, finishLesson]);
  // Speaking switched off for this session: hear-and-repeat steps count as done.
  useEffect(() => {
    if (noSpeech && current?.kind === "speak" && !feedback) pass(current);
  });
  function pass(ex: Exercise) {
    const next = new Set(passed); next.add(ex.id); setPassed(next);
    setState((v) => {
      const p = progressAfter(start, next, lesson);
      return { ...p, messages: v.messages, completedAt: p.completedAt ? v.completedAt ?? p.completedAt : null };
    });
    setIndex((i) => i + 1);
  }
  function onResult(r: Result) {
    if (current?.kind === "dialog" && r.heard) setState((v) => ({ ...v, messages: [...v.messages, { role: "user" as const, text: r.heard ?? "" }].slice(-100) }));
    setFeedback(r);
  }
  function next() {
    const r = feedback; setFeedback(null);
    if (!current || !r) return;
    if (r.ok) pass(current);
    else { setMistakes((m) => m + 1); setQueue((q) => [...q, { ...current }]); setIndex((i) => i + 1); }
  }
  const progress = total ? Math.min(1, passed.size / total) : 1;
  const streak = currentStreak(stats, localDay());

  if (!total || done) {
    const week = weekStatus(course);
    return <SafeAreaView style={[s.page, { padding: 24, justifyContent: "center", gap: 18 }]}>
      <View style={l.trophy}><Text accessible={false} style={{ fontSize: 54 }}>🏆</Text></View>
      <Text style={[s.title, s.center]}>Lerntag geschafft!</Text>
      <Text translate={false} style={[s.h2, s.center]}>„{lesson.phrases[3].phrase}“</Text>
      {earned !== null && <View style={s.row}>
        <Stat icon="⚡" value={`${earned}`} label="Punkte" />
        <Stat icon="🎯" value={`${Math.round((total / (total + mistakes)) * 100)} %`} label="Genauigkeit" />
        <Stat icon="🔥" value={`${streak}`} label="Tage am Stück" />
      </View>}
      {lesson.id < lessons.length && <Button onPress={() => { openDay(lesson.id + 1); router.replace("/"); }}>Weiter</Button>}
      {lesson.id === lessons.length && week.reviewOpen && !week.readyForNextWeek && <Button accent onPress={() => router.replace({ pathname: "/words", params: { review: "week" } })}>Wochenabfrage starten →</Button>}
      <Button secondary onPress={() => { setState({ ...fresh(), stage: "build" }); router.replace("/"); }}>Tag noch einmal üben ↻</Button>
      <Button secondary onPress={() => router.replace("/")}>Zum Lernpfad</Button>
    </SafeAreaView>;
  }
  const props = { lesson, locked: !!feedback, onResult, noSpeech, onNoSpeech: () => setNoSpeech(true) };
  return <SafeAreaView style={s.page} edges={["top", "left", "right", "bottom"]}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={l.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Lektion verlassen" onPress={() => router.replace("/")} style={l.close}>
          <Text style={{ fontSize: 22, color: C.muted }}>✕</Text>
        </Pressable>
        <View style={l.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
          <View style={[l.fill, { width: `${Math.max(4, progress * 100)}%` }]} />
        </View>
        <Text style={l.streak}>🔥 {streak}</Text>
      </View>
      <ScrollView contentContainerStyle={l.content} keyboardShouldPersistTaps="handled">
        {current && <View key={`${current.id}-${index}`}>
          {current.kind === "speak" && <SpeakExercise {...props} ex={current} />}
          {current.kind === "tiles" && <TilesExercise {...props} ex={current} />}
          {current.kind === "write" && <WriteExercise {...props} ex={current} />}
          {current.kind === "match" && <MatchExercise {...props} ex={current} />}
          {current.kind === "dialog" && <DialogExercise {...props} ex={current} />}
          {current.kind === "word" && <WordExercise {...props} ex={current} />}
        </View>}
      </ScrollView>
      {feedback && <FeedbackBar result={feedback} onContinue={next} />}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return <View style={l.stat}>
    <Text accessible={false} style={{ fontSize: 22 }}>{icon}</Text>
    <Text translate={false} style={s.statNumber}>{value}</Text>
    <Text style={s.small}>{label}</Text>
  </View>;
}
const l = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 12 },
  close: { width: 36, height: 44, alignItems: "center", justifyContent: "center" },
  track: { flex: 1, height: 14, borderRadius: 7, backgroundColor: C.line, overflow: "hidden" },
  fill: { height: 14, borderRadius: 7, backgroundColor: "#6f9a4e" },
  streak: { fontSize: 15, fontWeight: "800", color: "#c86a1f" },
  content: { padding: 22, paddingBottom: 60 },
  trophy: { alignSelf: "center", width: 110, height: 110, borderRadius: 55, backgroundColor: C.yellow, alignItems: "center", justifyContent: "center" },
  stat: { flex: 1, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 12, alignItems: "center", gap: 2 },
});
