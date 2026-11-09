import React, { useEffect, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { Redirect, router } from "expo-router";
import { LearningMoment } from "../components/learning-moment";
import { Text } from "../components/localized-text";
import { C, Page, s } from "../components/ui";
import { localDay } from "../lib/motivation";
import { usePreferences } from "../lib/preferences";
import { useLearning } from "../lib/store";
import { lessons, weekStatus } from "../lib/course";
import { percent } from "../lib/learning";
import { currentStreak, weekXp } from "../lib/stats";
const ICONS = ["☕", "🥖", "🍽️", "📍", "🍎", "🛏️", "💬"];
const OFFSETS = [0, 52, 78, 52, 0, -52, -78];
// Learning path: the week as a winding path of days, the next one clearly marked.
export default function Home() {
  const { course, stats, openDay } = useLearning();
  const { preferences, update } = usePreferences();
  const [moment, setMoment] = useState<number | null>(null);
  const [bounce] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(bounce, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [bounce]);
  if (!preferences.onboarded) return <Redirect href="/onboarding" />;
  const today = localDay();
  const week = weekStatus(course);
  const nextDay = lessons.find((l) => !course.days[String(l.id)]?.completedAt)?.id ?? null;
  function open(id: number) {
    setMoment(null);
    openDay(id);
    router.push("/learn");
  }
  function tap(id: number) {
    if (preferences.lastMotivationDay !== today) setMoment(id);
    else open(id);
  }
  return (
    <Page>
      <LearningMoment visible={moment !== null} onClose={() => setMoment(null)} onContinue={() => {
        update({ lastMotivationDay: today }).catch(() => {});
        if (moment !== null) open(moment);
      }} />
      <View style={p.stats}>
        <View style={p.statPill}><Text style={[p.statText, { color: "#c86a1f" }]}>🔥 {currentStreak(stats, today)}</Text><Text style={s.small}>Tage</Text></View>
        <View style={p.statPill}><Text style={[p.statText, { color: "#b8860b" }]}>⚡ {weekXp(stats, today)}</Text><Text style={s.small}>Punkte diese Woche</Text></View>
      </View>
      <View style={p.banner}>
        <Text style={p.bannerLabel}>ABSCHNITT 1 · WOCHE 1</Text>
        <Text style={p.bannerTitle}>Erste Sätze für den Alltag</Text>
        <Text style={p.bannerSub}>{week.completedDays} / 7 <Text>Lerntage</Text></Text>
      </View>
      <View style={p.path}>
        {lessons.map((day, i) => {
          const state = course.days[String(day.id)];
          const doneDay = !!state?.completedAt;
          const current = day.id === nextDay;
          const started = !!state && state.stage !== "intro" && !doneDay;
          return <View key={day.id} style={[p.nodeWrap, { transform: [{ translateX: OFFSETS[i] }] }]}>
            {current && <Animated.View style={[p.bubble, { transform: [{ translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]}>
              <Text style={p.bubbleText}>{started ? ["WEITER", ` · ${percent(state)} %`] : "START"}</Text>
            </Animated.View>}
            <Pressable accessibilityRole="button" accessibilityLabel={`Tag ${day.id}: ${day.label}${doneDay ? " ✓" : ""}`}
              onPress={() => tap(day.id)}
              style={({ pressed }) => [p.node, doneDay && p.nodeDone, current && p.nodeCurrent, { transform: [{ translateY: pressed ? 3 : 0 }] }]}>
              <Text accessible={false} style={{ fontSize: current ? 34 : 28 }}>{doneDay ? "✓" : ICONS[i]}</Text>
            </Pressable>
            <Text style={[p.nodeLabel, current && { color: C.green, fontWeight: "800" }]}>{day.label}</Text>
          </View>;
        })}
        <View style={p.nodeWrap}>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !week.reviewOpen }} disabled={!week.reviewOpen}
            onPress={() => router.push({ pathname: "/words", params: { review: "week" } })}
            style={[p.node, p.chest, week.readyForNextWeek && p.nodeDone, !week.reviewOpen && { opacity: 0.45 }]}>
            <Text accessible={false} style={{ fontSize: 30 }}>{week.readyForNextWeek ? "🏆" : week.reviewOpen ? "🎁" : "🔒"}</Text>
          </Pressable>
          <Text style={p.nodeLabel}>Wochenabfrage</Text>
        </View>
      </View>
    </Page>
  );
}
const p = StyleSheet.create({
  stats: { flexDirection: "row", gap: 10 },
  statPill: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14 },
  statText: { fontSize: 18, fontWeight: "800" },
  banner: { backgroundColor: C.green, borderRadius: 20, padding: 18, gap: 4 },
  bannerLabel: { color: C.yellow, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  bannerTitle: { color: C.cream, fontSize: 21, fontWeight: "800" },
  bannerSub: { color: "#d2ddc5", fontSize: 13 },
  path: { alignItems: "center", gap: 18, paddingVertical: 10 },
  nodeWrap: { alignItems: "center", gap: 6 },
  node: { width: 78, height: 72, borderRadius: 39, backgroundColor: C.paper, borderWidth: 2, borderColor: C.line, borderBottomWidth: 7, alignItems: "center", justifyContent: "center" },
  nodeDone: { backgroundColor: "#dcebc8", borderColor: "#9fbf80" },
  nodeCurrent: { width: 92, height: 84, borderRadius: 46, backgroundColor: C.yellow, borderColor: "#c9a94a" },
  chest: { borderRadius: 20 },
  nodeLabel: { fontSize: 12, color: C.muted, fontWeight: "600" },
  bubble: { backgroundColor: C.green, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  bubbleText: { color: C.cream, fontSize: 12, fontWeight: "800", letterSpacing: 0.6 },
});
