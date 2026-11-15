import { allDays, phraseItem, wordItem } from "./types.ts";
import type { Course, Day } from "./types.ts";
import { addDays, dueItems, firstSeen, isDay, reviewed, validItem } from "./srs.ts";
import type { ItemState } from "./srs.ts";
import { lessonSession } from "./session.ts";
import { needsPremium } from "./access.ts";

export const PROGRESS_KEY = "phraseuno.progress.v3";
export const LEGACY_KEY = "phraseuno.native.v1";
export type DayProgress = { passed: string[]; completedAt: string | null };
export type Progress = {
  version: 3;
  days: Record<string, DayProgress>;
  items: Record<string, ItemState>;
  weekChecks: Record<string, string>;
  xp: number; streak: number; lastDay: string | null; history: Record<string, number>;
};
export const fresh = (): Progress => ({ version: 3, days: {}, items: {}, weekChecks: {}, xp: 0, streak: 0, lastDay: null, history: {} });
const count = (value: unknown) => (Number.isInteger(value) && (value as number) >= 0 ? (value as number) : 0);
export function restore(raw: string | null, course: Course): Progress {
  try {
    const v = JSON.parse(raw ?? "null");
    if (v?.version !== 3 || typeof v.days !== "object" || !v.days) return fresh();
    const out = fresh();
    for (const day of allDays(course)) {
      const saved = v.days[day.id];
      if (!saved || !Array.isArray(saved.passed)) continue;
      const ids = new Set(lessonSession(course, day).map((exercise) => exercise.id));
      const passed = [...new Set((saved.passed as unknown[]).filter((id): id is string => typeof id === "string" && ids.has(id)))];
      const complete = passed.length === ids.size;
      out.days[day.id] = { passed, completedAt: complete && typeof saved.completedAt === "string" && Number.isFinite(Date.parse(saved.completedAt)) ? saved.completedAt : complete ? new Date(0).toISOString() : null };
    }
    if (v.items && typeof v.items === "object") for (const [id, item] of Object.entries(v.items)) if (validItem(item)) out.items[id] = item;
    if (v.weekChecks && typeof v.weekChecks === "object") for (const week of course.weeks) if (isDay(v.weekChecks[String(week.id)])) out.weekChecks[String(week.id)] = v.weekChecks[String(week.id)];
    if (v.history && typeof v.history === "object") for (const [day, xp] of Object.entries(v.history)) if (isDay(day) && count(xp)) out.history[day] = xp as number;
    out.xp = count(v.xp); out.streak = count(v.streak); out.lastDay = isDay(v.lastDay) ? v.lastDay : null;
    return out;
  } catch { return fresh(); }
}
export const dayDone = (progress: Progress, dayId: string) => !!progress.days[dayId]?.completedAt;
export const weekDaysDone = (course: Course, progress: Progress, week: number) =>
  (course.weeks.find((w) => w.id === week)?.days ?? []).every((day) => dayDone(progress, day.id));
export const weekComplete = (course: Course, progress: Progress, week: number) =>
  weekDaysDone(course, progress, week) && !!progress.weekChecks[String(week)];
export type DayStatus = "done" | "open" | "locked" | "premium";
/** Days open one after another; a new week opens after the previous week's check; paid weeks need Premium. */
export function dayStatus(course: Course, progress: Progress, day: Day, premium: boolean): DayStatus {
  if (dayDone(progress, day.id)) return "done";
  const days = allDays(course);
  const index = days.findIndex((d) => d.id === day.id);
  const previous = days[index - 1];
  const reachable = !previous || (dayDone(progress, previous.id) && (previous.week === day.week || weekComplete(course, progress, previous.week)));
  if (!reachable) return "locked";
  return needsPremium(day) && !premium ? "premium" : "open";
}
export function nextDay(course: Course, progress: Progress) {
  return allDays(course).find((day) => !dayDone(progress, day.id));
}
export function dayPercent(course: Course, progress: Progress, day: Day) {
  const total = lessonSession(course, day).length;
  return dayDone(progress, day.id) ? 100 : Math.round(((progress.days[day.id]?.passed.length ?? 0) / total) * 100);
}
/** Marks one lesson exercise as passed. Finishing the day schedules its phrases and words for review. */
export function passExercise(progress: Progress, course: Course, day: Day, exerciseId: string, today: string, now = new Date().toISOString()): Progress {
  const ids = lessonSession(course, day).map((exercise) => exercise.id);
  if (!ids.includes(exerciseId) || dayDone(progress, day.id)) return progress;
  const passed = [...new Set([...(progress.days[day.id]?.passed ?? []), exerciseId])];
  const complete = ids.every((id) => passed.includes(id));
  const items = { ...progress.items };
  if (complete) {
    day.chunks.forEach((_, i) => { items[phraseItem(day.id, i)] ??= firstSeen(today); });
    day.words.forEach((_, i) => { items[wordItem(day.id, i)] ??= firstSeen(today); });
  }
  return { ...progress, items, days: { ...progress.days, [day.id]: { passed, completedAt: complete ? now : null } } };
}
export function resetDay(progress: Progress, dayId: string): Progress {
  const days = { ...progress.days }; delete days[dayId];
  return { ...progress, days };
}
export function applyReview(progress: Progress, item: string, ok: boolean, today: string): Progress {
  const current = progress.items[item];
  return current ? { ...progress, items: { ...progress.items, [item]: reviewed(current, ok, today) } } : progress;
}
export function completeWeekCheck(progress: Progress, course: Course, week: number, today: string): Progress {
  return weekDaysDone(course, progress, week) ? { ...progress, weekChecks: { ...progress.weekChecks, [String(week)]: today } } : progress;
}
export const dueCount = (progress: Progress, today: string) => dueItems(progress.items, today).length;
/** XP and streak. A streak grows once per calendar day and resets after a missed day. */
export function recordActivity(progress: Progress, today: string, xp: number): Progress {
  const streak = progress.lastDay === today ? progress.streak : progress.lastDay === addDays(today, -1) ? progress.streak + 1 : 1;
  const history = { ...progress.history, [today]: (progress.history[today] ?? 0) + xp };
  const keep = Object.keys(history).sort().slice(-30);
  return { ...progress, xp: progress.xp + xp, streak, lastDay: today, history: Object.fromEntries(keep.map((day) => [day, history[day]])) };
}
export const currentStreak = (progress: Progress, today: string) =>
  progress.lastDay === today || progress.lastDay === addDays(today, -1) ? progress.streak : 0;
export function weekXp(progress: Progress, today: string) {
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += progress.history[addDays(today, -i)] ?? 0;
  return sum;
}
export function learnedWords(course: Course, progress: Progress) {
  return allDays(course).filter((day) => dayDone(progress, day.id))
    .flatMap((day) => day.words.map((word, i) => ({ id: wordItem(day.id, i), word, day, state: progress.items[wordItem(day.id, i)] })));
}
/** Carries completed days over from the first app generation (course state v2 under LEGACY_KEY). */
export function migrateLegacy(raw: string | null, course: Course, today: string): Progress | null {
  try {
    const v = JSON.parse(raw ?? "null");
    if (v?.version !== 2 || !v.days || typeof v.days !== "object") return null;
    let progress = fresh();
    const week = course.weeks[0];
    for (const day of week?.days ?? []) {
      const old = v.days[String(day.day)];
      if (!old || old.chat !== 4 || typeof old.completedAt !== "string") continue;
      for (const exercise of lessonSession(course, day)) progress = passExercise(progress, course, day, exercise.id, today, old.completedAt);
    }
    if (typeof v.weekReviewedAt === "string" && week && weekDaysDone(course, progress, week.id)) progress.weekChecks[String(week.id)] = today;
    return Object.keys(progress.days).length ? progress : null;
  } catch { return null; }
}
