// Course content model. A course is language-agnostic: adding a language means adding content only.
export type Lang = "de" | "en";
export type L10n = Record<Lang, string>;
/** One step of a growing phrase ("chunk"): `es` is the whole phrase so far, `add` the new part. */
export type Chunk = { es: string; add: string; meaning: L10n; tip: L10n };
/** One dialogue turn. `accept` lists alternatives; each alternative is a set of parts that must all occur. */
export type Turn = { es: string; meaning: L10n; answer: string; answerMeaning: L10n; accept: string[][]; reject: string[] };
export type Word = { es: string; meaning: L10n; emoji: string; example: string };
export type Day = { id: string; week: number; day: number; emoji: string; title: L10n; chunks: Chunk[]; turns: Turn[]; words: Word[] };
export type Week = { id: number; title: L10n; days: Day[] };
export type Course = { id: string; speechLocale: string; name: L10n; weeks: Week[] };
export const allDays = (course: Course) => course.weeks.flatMap((week) => week.days);
export const findDay = (course: Course, id: string) => allDays(course).find((day) => day.id === id);
export const phraseItem = (dayId: string, chunk: number) => `p:${dayId}:${chunk}`;
export const wordItem = (dayId: string, word: number) => `w:${dayId}:${word}`;
export function resolveItem(course: Course, item: string) {
  const [kind, dayId, index] = item.split(":");
  const day = findDay(course, dayId);
  const i = Number(index);
  if (!day || !Number.isInteger(i)) return undefined;
  if (kind === "p" && day.chunks[i]) return { kind: "phrase" as const, day, index: i, chunk: day.chunks[i] };
  if (kind === "w" && day.words[i]) return { kind: "word" as const, day, index: i, word: day.words[i] };
  return undefined;
}
