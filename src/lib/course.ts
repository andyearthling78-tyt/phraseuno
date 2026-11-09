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
// weekReviewedAt: the end-of-week check of all collected words was completed.
export type CourseState = { version: 2; selectedDay: number; days: Record<string, LearningState>; weekReviewedAt?: string | null };
export function freshCourse(): CourseState { return { version: 2, selectedDay: 1, days: { "1": fresh() }, weekReviewedAt: null }; }
export function restoreCourse(raw: string | null): CourseState {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version === 1) return { version: 2, selectedDay: 1, days: { "1": restore(raw) }, weekReviewedAt: null };
    if (value?.version !== 2 || !value.days || typeof value.days !== "object" || Array.isArray(value.days)) return freshCourse();
    const days: Record<string, LearningState> = {};
    for (const lesson of lessons) if (value.days[String(lesson.id)]) days[String(lesson.id)] = restore(JSON.stringify(value.days[String(lesson.id)]));
    const selectedDay = lessons.some((lesson) => lesson.id === value.selectedDay) ? value.selectedDay : 1;
    days[String(selectedDay)] ??= fresh();
    const reviewed = typeof value.weekReviewedAt === "string" && Number.isFinite(Date.parse(value.weekReviewedAt)) ? value.weekReviewedAt : null;
    return { version: 2, selectedDay, days, weekReviewedAt: reviewed };
  } catch { return freshCourse(); }
}
export function selectDay(course: CourseState, id: number): CourseState {
  if (!lessons.some((lesson) => lesson.id === id)) return course;
  return { ...course, selectedDay: id, days: { ...course.days, [String(id)]: course.days[String(id)] ?? fresh() } };
}

export function collectedWords(course: CourseState) {
  const entries = new Map<string, { word: typeof words[number]; sources: { day: number; index: number }[]; known: boolean }>();
  for (const lesson of lessons) {
    const day = course.days[String(lesson.id)];
    if (!day || day.chat !== 4) continue;
    lesson.words.forEach((word, index) => {
      const previous = entries.get(word.es);
      const known = day.known.includes(index);
      if (previous) { previous.sources.push({ day: lesson.id, index }); previous.known = previous.known && known; }
      else entries.set(word.es, { word, sources: [{ day: lesson.id, index }], known });
    });
  }
  return [...entries.values()];
}
export function reviewCollectedWord(course: CourseState, es: string, known: boolean): CourseState {
  const entry = collectedWords(course).find(value => value.word.es === es);
  if (!entry) return course;
  const days = { ...course.days };
  for (const source of entry.sources) {
    const day = days[String(source.day)];
    const learned = known ? [...new Set([...day.known, source.index])] : day.known.filter(index => index !== source.index);
    const card = [0, 1, 2].find(index => !learned.includes(index)) ?? 0;
    days[String(source.day)] = { ...day, known: learned, card,
      stage: learned.length === 3 && day.stage === 'cards' ? 'summary' : day.stage };
  }
  return { ...course, days };
}
export function weekStatus(course: CourseState) {
  const completedDays = lessons.filter(lesson => course.days[String(lesson.id)]?.chat === 4).length;
  const vocabulary = collectedWords(course);
  const remaining = vocabulary.filter(entry => !entry.known).length;
  const reviewOpen = completedDays === lessons.length;
  const weekReviewed = reviewOpen && remaining === 0 && !!course.weekReviewedAt;
  return { completedDays, vocabulary, remaining, reviewOpen, weekReviewed, readyForNextWeek: weekReviewed };
}
// Called when every word of the week was answered with "Gewusst" in the end-of-week check.
export function completeWeekReview(course: CourseState, at = new Date().toISOString()): CourseState {
  const status = weekStatus({ ...course, weekReviewedAt: at });
  if (!status.reviewOpen || status.remaining !== 0) return course;
  return { ...course, weekReviewedAt: at };
}
