import type { Chunk, Day, Turn, Word } from "../../domain/types.ts";
// Compact authoring helpers. Tuples keep the course files readable side by side.
type C = [es: string, add: string, de: string, en: string, tipDe: string, tipEn: string];
type T = [es: string, de: string, en: string, answer: string, answerDe: string, answerEn: string, accept: string[][], reject?: string[]];
type W = [es: string, de: string, en: string, emoji: string, example: string];
export function day(week: number, n: number, emoji: string, de: string, en: string, chunks: C[], turns: T[], words: W[]): Day {
  return {
    id: `w${week}d${n}`, week, day: n, emoji, title: { de, en },
    chunks: chunks.map(([es, add, d, e, tipDe, tipEn]): Chunk => ({ es, add, meaning: { de: d, en: e }, tip: { de: tipDe, en: tipEn } })),
    turns: turns.map(([es, d, e, answer, aDe, aEn, accept, reject = []]): Turn => ({ es, meaning: { de: d, en: e }, answer, answerMeaning: { de: aDe, en: aEn }, accept, reject })),
    words: words.map(([es, d, e, wordEmoji, example]): Word => ({ es, meaning: { de: d, en: e }, emoji: wordEmoji, example })),
  };
}
