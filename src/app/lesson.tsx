import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { findDay } from "../domain/types";
import { lessonSession, reviewSession, sessionXp, weekCheckSession } from "../domain/session";
import type { Exercise, SessionKind } from "../domain/session";
import { applyReview, completeWeekCheck, currentStreak, dayDone, dayStatus, passExercise, recordActivity, resetDay, weekDaysDone } from "../domain/progress";
import { Build, Choose, Dialog, Listen, Match, Recall, Write } from "../lesson/exercises";
import { FeedbackBar } from "../lesson/parts";
import type { Result } from "../lesson/parts";
import { useApp } from "../state/app";
import { Button, Card, k, ProgressBar, Row, T } from "../ui/kit";
import { theme } from "../ui/theme";

// One session: a run of short exercises. Wrong answers come back at the end of the run.
type Params = { mode?: string; day?: string; week?: string; again?: string };
export default function LessonRoute() {
  const params = useLocalSearchParams<Params>();
  const { course, progress, premium } = useApp();
  const mode: SessionKind = params.mode === "review" || params.mode === "weekcheck" ? params.mode : "lesson";
  const day = mode === "lesson" && params.day ? findDay(course, params.day) : undefined;
  const [entry] = useState(() => (day ? dayStatus(course, progress, day, premium) : null));
  if (mode === "lesson" && (!day || entry === "locked")) return <Redirect href="/" />;
  if (entry === "premium") return <Redirect href="/paywall" />;
  if (mode === "weekcheck" && !weekDaysDone(course, progress, Number(params.week))) return <Redirect href="/" />;
  // A new key restarts the run when the same day is practised again.
  return <Session key={`${mode}-${params.day}-${params.week}-${params.again}`} mode={mode} dayId={day?.id} week={Number(params.week)} />;
}
function Session({ mode, dayId, week }: { mode: SessionKind; dayId?: string; week: number }) {
  const { course, progress, setProgress, premium, t, today } = useApp();
  const day = dayId ? findDay(course, dayId) : undefined;
  const [queue, setQueue] = useState<Exercise[]>(() => {
    if (mode === "review") return reviewSession(course, progress.items, today);
    if (mode === "weekcheck") return weekCheckSession(course, week);
    if (!day || dayDone(progress, day.id)) return [];
    const status = dayStatus(course, progress, day, premium);
    if (status !== "open") return [];
    const passed = progress.days[day.id]?.passed ?? [];
    return lessonSession(course, day).filter((exercise) => !passed.includes(exercise.id));
  });
  const [total] = useState(queue.length);
  const [index, setIndex] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<Result | null>(null);
  const [noSpeech, setNoSpeech] = useState(false);
  const [earned, setEarned] = useState<number | null>(null);
  const attempted = useRef(new Set<string>());
  const finished = useRef(false);
  const current = queue[index];
  const done = total > 0 && index >= queue.length;

  // Settles the current exercise. Wrong answers are queued again; with speaking switched off,
  // the following hear-and-repeat steps count as done. Finishing the run awards points once.
  function advance(ok: boolean, skipSpeech = noSpeech) {
    if (!current) return;
    // Spaced repetition counts the first attempt only; a re-queued retry must not promote the item.
    if (mode === "review" && "item" in current && !attempted.current.has(current.id)) {
      const item = current.item;
      setProgress((p) => applyReview(p, item, ok, today));
    }
    attempted.current.add(current.id);
    const nextQueue = ok ? queue : [...queue, current];
    const settled = ok ? [current] : [];
    let nextIndex = index + 1;
    while (skipSpeech && nextQueue[nextIndex]?.kind === "listen") settled.push(nextQueue[nextIndex++]);
    if (mode === "lesson" && day) setProgress((p) => settled.reduce((state, exercise) => passExercise(state, course, day, exercise.id, today), p));
    const wrong = mistakes + (ok ? 0 : 1);
    setMistakes(wrong); setPassedCount((n) => n + settled.length); setQueue(nextQueue); setIndex(nextIndex);
    if (nextIndex >= nextQueue.length && !finished.current) {
      finished.current = true;
      const xp = sessionXp(mode, wrong);
      setEarned(xp);
      setProgress((p) => recordActivity(mode === "weekcheck" ? completeWeekCheck(p, course, week, today) : p, today, xp));
    }
  }
  const next = () => { const result = feedback; setFeedback(null); if (result) advance(result.ok); };
  const skipSpeaking = () => { setNoSpeech(true); if (current?.kind === "listen") advance(true, true); };
  const home = () => router.replace("/");

  if (!total || done) {
    const replay = mode === "lesson" && day && dayDone(progress, day.id);
    const empty = !total && !replay;
    return <SafeAreaView style={k.page}>
      <ScrollView contentContainerStyle={[k.content, { flexGrow: 1, justifyContent: "center" }]}>
        <Card>
          <View style={s.badge}><T accessible={false} style={{ fontSize: 36, color: theme.green }}>✦</T></View>
          <T v="title" center>{empty ? t("review.empty") : t(mode === "review" ? "done.review" : mode === "weekcheck" ? "done.weekcheck" : "done.lesson")}</T>
          {mode === "lesson" && day && <View style={k.note}><T es v="h2" center>„{day.chunks[day.chunks.length - 1].es}“</T></View>}
          {earned !== null && <Row>
            <Stat value={`+${earned}`} label={t("done.points")} />
            <Stat value={`${Math.round((total / (total + mistakes)) * 100)} %`} label={t("done.accuracy")} />
            <Stat value={`🔥 ${currentStreak(progress, today)}`} label={t("done.streak")} />
          </Row>}
          {mode === "lesson" && earned !== null && <T v="small" center>{t("done.tomorrow")}</T>}
          <Button onPress={home}>{earned !== null ? t("common.continue") : t("done.home")}</Button>
          {replay && day && <Button kind="secondary" onPress={() => { setProgress((p) => resetDay(p, day.id)); router.replace({ pathname: "/lesson", params: { mode: "lesson", day: day.id, again: String(Date.now()) } }); }}>{t("done.again")} ↻</Button>}
        </Card>
      </ScrollView>
    </SafeAreaView>;
  }
  const shared = { locked: !!feedback, onResult: setFeedback, noSpeech, onNoSpeech: skipSpeaking };
  const percent = (passedCount / total) * 100;
  return <SafeAreaView style={k.page}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Row style={s.top}>
        <Pressable accessibilityRole="button" onPress={home} style={{ paddingVertical: 12, paddingRight: 6 }}><T v="small" style={{ color: theme.green }}>← {t("lesson.leave")}</T></Pressable>
        <ProgressBar value={percent} />
        <T v="small">{Math.round(percent)}%</T>
      </Row>
      <ScrollView contentContainerStyle={[k.content, { paddingBottom: 60 }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View key={`${current.id}-${index}`}>
          {current.kind === "listen" && <Listen {...shared} ex={current} />}
          {current.kind === "build" && <Build {...shared} ex={current} />}
          {current.kind === "write" && <Write {...shared} ex={current} />}
          {current.kind === "recall" && <Recall {...shared} ex={current} />}
          {current.kind === "dialog" && <Dialog {...shared} ex={current} />}
          {current.kind === "match" && <Match {...shared} ex={current} />}
          {current.kind === "choose" && <Choose {...shared} ex={current} />}
        </View>
      </ScrollView>
      {feedback && <FeedbackBar result={feedback} onContinue={next} />}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
function Stat({ value, label }: { value: string; label: string }) {
  return <View style={s.stat}><T style={{ fontSize: 20, fontWeight: "700", color: theme.green }}>{value}</T><T v="small" center>{label}</T></View>;
}
const s = StyleSheet.create({
  top: { paddingHorizontal: 22, paddingVertical: 4 },
  badge: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.yellow, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  stat: { flex: 1, backgroundColor: theme.pale, borderRadius: 13, paddingVertical: 14, alignItems: "center", gap: 4 },
});
