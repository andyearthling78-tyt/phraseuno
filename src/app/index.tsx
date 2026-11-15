import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Redirect, router } from "expo-router";
import { allDays } from "../domain/types";
import type { Day } from "../domain/types";
import { needsPremium } from "../domain/access";
import { currentStreak, dayPercent, dayStatus, dueCount, nextDay, weekComplete, weekDaysDone, weekXp } from "../domain/progress";
import { useApp } from "../state/app";
import { Button, Card, k, Row, Screen, T } from "../ui/kit";
import { theme } from "../ui/theme";

// Home: one clear next step, the daily review, and the weeks with step-by-step unlocking.
export default function Home() {
  const { course, progress, premium, prefs, t, l, today } = useApp();
  if (!prefs.onboarded) return <Redirect href="/onboarding" />;
  const due = dueCount(progress, today);
  const next = nextDay(course, progress);
  const nextStatus = next ? dayStatus(course, progress, next, premium) : null;
  const lastWeek = course.weeks[course.weeks.length - 1].id;
  const pendingCheck = next && nextStatus === "locked" ? allDays(course)[allDays(course).indexOf(next) - 1]?.week
    : !next && !weekComplete(course, progress, lastWeek) ? lastWeek : null;
  const openDay = (day: Day) => {
    const status = dayStatus(course, progress, day, premium);
    if (status === "premium") router.push("/paywall");
    else if (status !== "locked") router.push({ pathname: "/lesson", params: { mode: "lesson", day: day.id } });
  };
  const startCheck = (week: number) => router.push({ pathname: "/lesson", params: { mode: "weekcheck", week: String(week) } });
  return <Screen tabs>
    <Row style={{ justifyContent: "space-between" }}>
      <T v="small">🔥 {currentStreak(progress, today)} {t("home.streak")}</T>
      <T v="small">✦ {weekXp(progress, today)} {t("home.xp")}</T>
    </Row>

    {due > 0 && <Card style={{ borderColor: theme.yellow, borderWidth: 2 }}>
      <Row>
        <View style={{ flex: 1 }}><T v="h2">{t("home.review")}</T><T v="small">{t("home.review.due", { n: due })}</T></View>
        <Button kind="accent" onPress={() => router.push({ pathname: "/lesson", params: { mode: "review" } })}>{t("home.review.start")}</Button>
      </Row>
    </Card>}

    {next && nextStatus === "open" && <View style={k.hero}>
      <Row style={{ justifyContent: "space-between" }}>
        <T style={h.heroLabel}>{t("home.day", { n: next.day })} · {l(next.title)}</T>
        <T accessible={false} style={{ fontSize: 36 }}>{next.emoji}</T>
      </Row>
      <T es style={h.heroPhrase}>„{next.chunks[next.chunks.length - 1].es}“</T>
      <T style={h.heroHint}>{t("home.today")}</T>
      <Button kind="accent" onPress={() => openDay(next)}>
        {dayPercent(course, progress, next) > 0 ? t("home.continue", { n: dayPercent(course, progress, next) }) : `${t("home.start")} ↗`}
      </Button>
    </View>}
    {next && nextStatus === "premium" && <View style={k.hero}>
      <T style={h.heroLabel}>Premium</T>
      <T style={h.heroPhrase}>{t("home.premium.title", { n: next.week })}</T>
      <T style={h.heroHint}>{t("home.premium.sub")}</T>
      <Button kind="accent" onPress={() => router.push("/paywall")}>{t("home.premium.cta")} ↗</Button>
    </View>}
    {pendingCheck != null && <View style={k.hero}>
      <T style={h.heroLabel}>{t("home.week", { n: pendingCheck })}</T>
      <T style={h.heroPhrase}>{t("home.weekcheck")}</T>
      <T style={h.heroHint}>{t("home.weekcheck.sub")}</T>
      <Button kind="accent" onPress={() => startCheck(pendingCheck)}>{t("home.weekcheck.start")} ↗</Button>
    </View>}
    {!next && pendingCheck == null && <View style={k.hero}>
      <T style={h.heroPhrase}>{t("home.done.title")} ✨</T>
      <T style={h.heroHint}>{t("home.done.sub")}</T>
    </View>}

    {course.weeks.map((week) => {
      const done = week.days.filter((day) => dayStatus(course, progress, day, premium) === "done").length;
      const checkOpen = weekDaysDone(course, progress, week.id);
      const checked = weekComplete(course, progress, week.id);
      return <Card key={week.id} style={{ gap: 6 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <T v="label">{t("home.week", { n: week.id })}{needsPremium({ week: week.id }) && !premium ? " · Premium" : ""}</T>
            <T v="h2">{l(week.title)}</T>
          </View>
          <T v="small">{done} / {week.days.length}</T>
        </Row>
        {week.days.map((day) => {
          const status = dayStatus(course, progress, day, premium);
          const current = day.id === next?.id && status !== "locked";
          return <Pressable key={day.id} disabled={status === "locked"} accessibilityRole="button" accessibilityState={{ disabled: status === "locked" }}
            accessibilityLabel={`${t("home.day", { n: day.day })}: ${l(day.title)}`} onPress={() => openDay(day)}
            style={({ pressed }) => [h.dayRow, current && { backgroundColor: theme.pale }, { opacity: status === "locked" ? 0.45 : pressed ? 0.7 : 1 }]}>
            <View style={[h.dayIcon, status === "done" && { backgroundColor: theme.pale }, current && { backgroundColor: theme.yellow }]}>
              <T accessible={false} style={{ fontSize: 20 }}>{status === "done" ? "✓" : status === "locked" ? "🔒" : status === "premium" ? "✦" : day.emoji}</T>
            </View>
            <T style={{ flex: 1, color: theme.green, fontWeight: current ? "700" : "500" }}>{t("home.day", { n: day.day })} · {l(day.title)}</T>
            {current && <T v="small">{t("home.now")}</T>}
          </Pressable>;
        })}
        <Pressable disabled={!checkOpen} accessibilityRole="button" accessibilityState={{ disabled: !checkOpen }} onPress={() => startCheck(week.id)}
          style={({ pressed }) => [h.dayRow, { opacity: !checkOpen ? 0.45 : pressed ? 0.7 : 1 }]}>
          <View style={[h.dayIcon, checked && { backgroundColor: theme.pale }]}><T accessible={false} style={{ fontSize: 20 }}>{checked ? "✓" : checkOpen ? "✦" : "🔒"}</T></View>
          <T style={{ flex: 1, color: theme.green }}>{t("home.weekcheck")}</T>
        </Pressable>
      </Card>;
    })}
  </Screen>;
}
const h = StyleSheet.create({
  heroLabel: { color: theme.onGreen, fontSize: 13, fontWeight: "600", letterSpacing: 0.3 },
  heroPhrase: { color: theme.cream, fontSize: 26, lineHeight: 33, fontWeight: "700", letterSpacing: -0.5 },
  heroHint: { color: theme.yellow, fontSize: 13, fontWeight: "600" },
  dayRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 14, minHeight: 48 },
  dayIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: theme.paper, borderWidth: 1, borderColor: theme.line, alignItems: "center", justifyContent: "center" },
});
