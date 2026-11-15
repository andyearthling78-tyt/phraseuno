import { allDays, phraseItem, resolveItem, wordItem } from "./types.ts";
import type { Course, Day } from "./types.ts";
import { normalize, stripPunctuation } from "./text.ts";
import { dueItems } from "./srs.ts";
import type { ItemState } from "./srs.ts";

// A session is a run of short exercises. New days follow hear → speak → read → write for each
// growing phrase (chunking, production effect), then use it in a dialogue. About 80 % of all
// exercises train phrases, about 20 % train single words.
export type Exercise =
  | { kind: "listen"; id: string; item: string }                    // hear the phrase, repeat aloud
  | { kind: "build"; id: string; item: string; tiles: string[]; audio: boolean } // read: assemble from tiles
  | { kind: "write"; id: string; item: string }                     // write from meaning
  | { kind: "recall"; id: string; item: string }                    // say it from memory
  | { kind: "dialog"; id: string; day: string; turn: number }
  | { kind: "match"; id: string; items: string[] }                  // word pairs
  | { kind: "choose"; id: string; item: string; options: string[]; reverse: boolean }; // word meaning
export type SessionKind = "lesson" | "review" | "weekcheck";
export const isWordExercise = (exercise: Exercise) => exercise.kind === "match" || exercise.kind === "choose";
export const phraseShare = (session: readonly Exercise[]) =>
  session.length ? session.filter((exercise) => !isWordExercise(exercise)).length / session.length : 0;

/** Deterministic shuffle so a resumed session looks the same. */
export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let x = (Math.abs(Math.trunc(seed)) * 9301 + 49297) % 233280 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = Math.floor((x / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const hash = (text: string) => [...text].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 100003, 7);
export function tilesFor(course: Course, phrase: string, seed: number) {
  const words = stripPunctuation(phrase).split(" ");
  const own = new Set(words.map(normalize));
  const pool = [...new Set(allDays(course).flatMap((day) => day.chunks).flatMap((chunk) => stripPunctuation(chunk.es).split(" ")))]
    .filter((word) => !own.has(normalize(word)));
  return shuffle([...words, ...shuffle(pool, seed).slice(0, 2)], seed + 1);
}
export function wordOptions(course: Course, item: string, seed: number) {
  const target = resolveItem(course, item);
  if (target?.kind !== "word") return [item];
  const others = allDays(course).flatMap((day) => day.words.map((word, i) => ({ id: wordItem(day.id, i), word })))
    .filter((other) => other.id !== item && other.word.es !== target.word.es && other.word.meaning.de !== target.word.meaning.de);
  // Prefer distractors from the same week: plausible, already-seen alternatives.
  const near = others.filter((other) => other.id.split(":")[1].startsWith(`w${target.day.week}d`));
  const picks = shuffle(near.length >= 2 ? near : others, seed).slice(0, 2).map((other) => other.id);
  return shuffle([item, ...picks], seed + 3);
}
export function lessonSession(course: Course, day: Day): Exercise[] {
  const seed = hash(day.id);
  const list: Exercise[] = [];
  day.chunks.forEach((chunk, i) => {
    const item = phraseItem(day.id, i);
    list.push({ kind: "listen", id: `listen-${i}`, item });
    list.push({ kind: "build", id: `build-${i}`, item, tiles: tilesFor(course, chunk.es, seed + i), audio: true });
    list.push({ kind: "write", id: `write-${i}`, item });
    if (i === 1) list.push({ kind: "match", id: "match", items: day.words.map((_, w) => wordItem(day.id, w)) });
  });
  day.turns.forEach((_, t) => list.push({ kind: "dialog", id: `dialog-${t}`, day: day.id, turn: t }));
  day.words.forEach((_, w) => {
    const item = wordItem(day.id, w);
    list.push({ kind: "choose", id: `choose-${w}`, item, options: wordOptions(course, item, seed + w), reverse: false });
  });
  return list;
}
/** Daily review: due items only, 8 phrases to 2 words, harder retrieval as memory gets stronger. */
export function reviewSession(course: Course, items: Readonly<Record<string, ItemState>>, today: string, size = 10): Exercise[] {
  const due = dueItems(items, today).filter((id) => resolveItem(course, id));
  const phrases = due.filter((id) => id.startsWith("p:"));
  const words = due.filter((id) => id.startsWith("w:"));
  const wordQuota = Math.min(words.length, Math.max(Math.round(size * 0.2), size - phrases.length));
  const chosen = [...phrases.slice(0, size - wordQuota), ...words.slice(0, wordQuota)];
  const seed = hash(today);
  const list = chosen.map((item, n): Exercise => {
    const id = `review-${item}`;
    if (item.startsWith("w:")) return { kind: "choose", id, item, options: wordOptions(course, item, seed + n), reverse: items[item].box >= 3 };
    const box = items[item].box;
    const phrase = resolveItem(course, item);
    if (box <= 1 && phrase?.kind === "phrase") return { kind: "build", id, item, tiles: tilesFor(course, phrase.chunk.es, seed + n), audio: false };
    return box <= 3 ? { kind: "write", id, item } : { kind: "recall", id, item };
  });
  // Interleave phrases and words instead of blocking them.
  return shuffle(list, seed);
}
/** End-of-week check: every word of the week once. */
export function weekCheckSession(course: Course, week: number): Exercise[] {
  const days = course.weeks.find((w) => w.id === week)?.days ?? [];
  const list = days.flatMap((day) => day.words.map((_, w): Exercise => {
    const item = wordItem(day.id, w);
    return { kind: "choose", id: `week-${item}`, item, options: wordOptions(course, item, hash(item)), reverse: (day.day + w) % 2 === 1 };
  }));
  return shuffle(list, week * 17);
}
export function sessionXp(kind: SessionKind, mistakes: number) {
  return (kind === "review" ? 5 : 10) + (mistakes === 0 ? 5 : 0);
}
