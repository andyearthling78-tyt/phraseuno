// Spaced repetition with expanding intervals (Leitner system).
// Evidence: distributed practice beats massed practice (Cepeda et al., 2006), and
// retrieval strengthens memory more than re-reading (Roediger & Karpicke, 2006).
export const INTERVALS = [0, 1, 3, 7, 14, 30, 60] as const;
export const MAX_BOX = INTERVALS.length - 1;
export type ItemState = { box: number; due: string; reps: number; lapses: number };
const DAY = /^\d{4}-\d{2}-\d{2}$/;
export const isDay = (value: unknown): value is string => typeof value === "string" && DAY.test(value);
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function addDays(day: string, amount: number) {
  const [y, m, d] = day.split("-").map(Number);
  return localDay(new Date(y, m - 1, d + amount));
}
export const firstSeen = (today: string): ItemState => ({ box: 1, due: addDays(today, INTERVALS[1]), reps: 1, lapses: 0 });
export function reviewed(item: ItemState, ok: boolean, today: string): ItemState {
  const box = ok ? Math.min(item.box + 1, MAX_BOX) : 1;
  return { box, due: addDays(today, INTERVALS[box]), reps: item.reps + 1, lapses: item.lapses + (ok ? 0 : 1) };
}
export const isDue = (item: ItemState, today: string) => item.due <= today;
/** Due item ids, most overdue first, weaker (lower box) before stronger. */
export function dueItems(items: Readonly<Record<string, ItemState>>, today: string) {
  return Object.keys(items).filter((id) => isDue(items[id], today))
    .sort((a, b) => items[a].due.localeCompare(items[b].due) || items[a].box - items[b].box || a.localeCompare(b));
}
export function validItem(value: unknown): value is ItemState {
  const v = value as ItemState;
  return !!v && Number.isInteger(v.box) && v.box >= 0 && v.box <= MAX_BOX && isDay(v.due) && Number.isInteger(v.reps) && v.reps >= 0 && Number.isInteger(v.lapses) && v.lapses >= 0;
}
