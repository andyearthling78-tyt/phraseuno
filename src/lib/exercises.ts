import { normalize } from "./learning.ts";
import type { LearningState } from "./learning.ts";
import type { Lesson } from "./course.ts";

// One learning day as a sequence of short exercises (Duolingo-style), ~80 % phrases/dialogue, ~20 % words.
// Per phrase: hear & repeat → read (build from tiles) → write.
export type Exercise =
  | { kind: "speak"; id: string; phrase: number }
  | { kind: "tiles"; id: string; phrase: number; tiles: string[] }
  | { kind: "write"; id: string; phrase: number }
  | { kind: "match"; id: string; words: number[] }
  | { kind: "dialog"; id: string; turn: number }
  | { kind: "word"; id: string; word: number; options: string[] };

export function stripPunctuation(text: string) {
  return text.replace(/[.,;:¿?¡!]/g, "").replace(/\s+/g, " ").trim();
}
// Deterministic shuffle, so a resumed session looks the same.
export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let x = (seed * 9301 + 49297) % 233280 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = Math.floor((x / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
export function tilesFor(lesson: Lesson, phraseIndex: number, all: readonly Lesson[]) {
  const words = stripPunctuation(lesson.phrases[phraseIndex].phrase).split(" ");
  const own = new Set(words.map(normalize));
  const pool = [...new Set([...lesson.phrases, ...all.flatMap((l) => l.phrases)]
    .flatMap((p) => stripPunctuation(p.phrase).split(" ")))]
    .filter((w) => !own.has(normalize(w)));
  const distractors = shuffle(pool, lesson.id * 31 + phraseIndex).slice(0, 2);
  return shuffle([...words, ...distractors], lesson.id * 7 + phraseIndex + 1);
}
export function tilesCorrect(chosen: readonly string[], target: string) {
  return normalize(chosen.join(" ")) === normalize(stripPunctuation(target));
}
export function wordOptions(lesson: Lesson, wordIndex: number, all: readonly Lesson[]) {
  const right = lesson.words[wordIndex].de;
  const wrong = [...new Set(all.flatMap((l) => l.words.map((w) => w.de)))].filter((de) => de !== right);
  return shuffle([right, ...shuffle(wrong, lesson.id * 13 + wordIndex).slice(0, 2)], lesson.id + wordIndex * 5);
}
export function buildSession(lesson: Lesson, state: LearningState, all: readonly Lesson[]): Exercise[] {
  const list: Exercise[] = [];
  for (let i = state.build; i < lesson.phrases.length; i++) {
    list.push({ kind: "speak", id: `speak-${i}`, phrase: i });
    list.push({ kind: "tiles", id: `tiles-${i}`, phrase: i, tiles: tilesFor(lesson, i, all) });
    list.push({ kind: "write", id: `write-${i}`, phrase: i });
    if (i === 1) list.push({ kind: "match", id: "match", words: lesson.words.map((_, w) => w) });
  }
  for (let t = state.chat; t < lesson.turns.length; t++) list.push({ kind: "dialog", id: `dialog-${t}`, turn: t });
  lesson.words.forEach((_, w) => {
    if (!state.known.includes(w)) list.push({ kind: "word", id: `word-${w}`, word: w, options: wordOptions(lesson, w, all) });
  });
  return list;
}
// Persisted day progress from the exercises passed in this session. Keeps the
// saved shape (LearningState v1) valid for restore(): stage follows build → chat → words.
export function progressAfter(start: LearningState, passed: ReadonlySet<string>, lesson: Lesson, now = new Date().toISOString()): LearningState {
  let build = start.build;
  while (build < lesson.phrases.length && ["speak", "tiles", "write"].every((k) => passed.has(`${k}-${build}`))) build++;
  let chat = build === lesson.phrases.length ? start.chat : 0;
  if (build === lesson.phrases.length) while (chat < lesson.turns.length && passed.has(`dialog-${chat}`)) chat++;
  const known = [...new Set([...start.known, ...lesson.words.map((_, w) => w).filter((w) => passed.has(`word-${w}`))])].sort();
  const dialogDone = chat === lesson.turns.length;
  const stage = build < lesson.phrases.length ? "build" : !dialogDone ? "chat" : known.length < lesson.words.length ? "cards" : "summary";
  const card = lesson.words.map((_, w) => w).find((w) => !known.includes(w)) ?? 0;
  return { ...start, build, chat, known, card, stage, completedAt: dialogDone ? start.completedAt ?? now : null };
}
export function phraseShare(session: readonly Exercise[]) {
  const words = session.filter((e) => e.kind === "match" || e.kind === "word").length;
  return session.length ? (session.length - words) / session.length : 0;
}
// XP: 10 per finished learning day, +5 without mistakes.
export function lessonXp(mistakes: number) { return 10 + (mistakes === 0 ? 5 : 0); }
