import { fresh, restore, normalize, phrases, words, turns } from "./learning.ts";
import type { LearningState } from "./learning.ts";
import moreDays from "./week-data.json" with { type: "json" };
export type Lesson = {
  id: number; label: string; title: string; heroLead: string; heroAccent: string; context: string; summary: string;
  phrases: typeof phrases; words: typeof words; turns: typeof turns;
};
function contains(answer: string, text: string) {
  const haystack = ` ${normalize(answer)} `;
  return haystack.includes(` ${normalize(text)} `);
}
export const lessons: Lesson[] = [
  { id: 1, label: "Im Café", title: "Dein erster spanischer Moment.", heroLead: "Ein Kaffee.", heroAccent: "Viele Möglichkeiten.", context: "Mit Lucía im Café", summary: "Du hast einen Kaffee bestellt. Mit Milch. Freundlich. Zum Mitnehmen.", phrases, words, turns },
  ...moreDays.map((day) => ({ ...day, turns: day.turns.map((turn) => ({ ...turn,
    test: (answer: string) => turn.need.every((part) => contains(answer, part)) && !turn.reject.some((part) => contains(answer, part)),
  })) })),
];
export type CourseState = { version: 2; selectedDay: number; days: Record<string, LearningState> };
export function freshCourse(): CourseState { return { version: 2, selectedDay: 1, days: { "1": fresh() } }; }
export function restoreCourse(raw: string | null): CourseState {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version === 1) return { version: 2, selectedDay: 1, days: { "1": restore(raw) } };
    if (value?.version !== 2 || !value.days || typeof value.days !== "object" || Array.isArray(value.days)) return freshCourse();
    const days: Record<string, LearningState> = {};
    for (const lesson of lessons) if (value.days[String(lesson.id)]) days[String(lesson.id)] = restore(JSON.stringify(value.days[String(lesson.id)]));
    const selectedDay = lessons.some((lesson) => lesson.id === value.selectedDay) ? value.selectedDay : 1;
    days[String(selectedDay)] ??= fresh();
    return { version: 2, selectedDay, days };
  } catch { return freshCourse(); }
}
export function selectDay(course: CourseState, id: number): CourseState {
  if (!lessons.some((lesson) => lesson.id === id)) return course;
  return { ...course, selectedDay: id, days: { ...course.days, [String(id)]: course.days[String(id)] ?? fresh() } };
}
