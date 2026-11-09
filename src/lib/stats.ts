// Streak 🔥 and XP ⚡, stored separately from learning progress.
export const STATS_KEY = "phraseuno.stats.v1";
export type Stats = { version: 1; xp: number; streak: number; lastDay: string | null; days: Record<string, number> };
export const freshStats = (): Stats => ({ version: 1, xp: 0, streak: 0, lastDay: null, days: {} });
const DAY = /^\d{4}-\d{2}-\d{2}$/;
export function restoreStats(raw: string | null): Stats {
  try {
    const v = JSON.parse(raw ?? "null");
    if (v?.version !== 1 || !Number.isInteger(v.xp) || v.xp < 0 || !Number.isInteger(v.streak) || v.streak < 0) return freshStats();
    const days: Record<string, number> = {};
    if (v.days && typeof v.days === "object") for (const [d, xp] of Object.entries(v.days)) if (DAY.test(d) && Number.isInteger(xp) && (xp as number) >= 0) days[d] = xp as number;
    return { version: 1, xp: v.xp, streak: v.streak, lastDay: typeof v.lastDay === "string" && DAY.test(v.lastDay) ? v.lastDay : null, days };
  } catch { return freshStats(); }
}
export function dayBefore(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function recordLesson(stats: Stats, today: string, xp: number): Stats {
  const streak = stats.lastDay === today ? stats.streak : stats.lastDay === dayBefore(today) ? stats.streak + 1 : 1;
  const days = { ...stats.days, [today]: (stats.days[today] ?? 0) + xp };
  const keep = Object.keys(days).sort().slice(-14);
  return { version: 1, xp: stats.xp + xp, streak, lastDay: today, days: Object.fromEntries(keep.map((d) => [d, days[d]])) };
}
// A streak only counts while it is alive (learned today or yesterday).
export function currentStreak(stats: Stats, today: string) {
  return stats.lastDay === today || (stats.lastDay !== null && stats.lastDay === dayBefore(today)) ? stats.streak : 0;
}
export function weekXp(stats: Stats, today: string) {
  let day = today, sum = 0;
  for (let i = 0; i < 7; i++) { sum += stats.days[day] ?? 0; day = dayBefore(day); }
  return sum;
}
