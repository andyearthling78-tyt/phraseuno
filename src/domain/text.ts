import type { Turn } from "./types.ts";
// Text comparison for typed and recognised Spanish. It checks which words were understood;
// it never grades pronunciation.
export const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
export const stripPunctuation = (text: string) => text.replace(/[.,;:¿?¡!]/g, "").replace(/\s+/g, " ").trim();
/** Spanish sound key: ll/y, v/b, z/c/s, qu/c/k and silent h collapse, so near-homophones compare equal. */
export function soundKey(word: string) {
  return normalize(word).replace(/ll/g, "y").replace(/v/g, "b").replace(/z/g, "s").replace(/c([ei])/g, "s$1")
    .replace(/qu/g, "k").replace(/c(?!h)/g, "k").replace(/(^|[^c])h/g, "$1").replace(/(.)\1+/g, "$1");
}
export function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}
/** Maps near-misses ("yevar", "lleva") onto the expected vocabulary; unknown words stay untouched. */
export function snap(text: string, vocabulary: readonly string[]) {
  const known = [...new Set(vocabulary.flatMap((v) => normalize(v).split(" ")).filter(Boolean))];
  return normalize(text).split(" ").filter(Boolean).map((word) => {
    if (known.includes(word)) return word;
    const key = soundKey(word);
    const sameSound = known.find((k) => soundKey(k) === key);
    if (sameSound) return sameSound;
    if (word.length < 4) return word;
    const close = known.filter((k) => k.length >= 4 && distance(soundKey(k), key) <= 1);
    return close.length === 1 ? close[0] : word;
  }).join(" ");
}
const contains = (haystack: string, part: string) => ` ${haystack} `.includes(` ${normalize(part)} `);
export type PhraseVerdict = "exact" | "close" | "wrong";
export function judgePhrase(input: string, target: string): PhraseVerdict {
  const wanted = normalize(target);
  if (!normalize(input)) return "wrong";
  if (normalize(input) === wanted) return "exact";
  return snap(input, [target]) === wanted ? "close" : "wrong";
}
export const matchesPhrase = (input: string, target: string) => judgePhrase(input, target) !== "wrong";
export function judgeTurn(input: string, turn: Turn, vocabulary: readonly string[] = []) {
  const candidates = [normalize(input), snap(input, [turn.answer, ...turn.accept.flat(), ...vocabulary])];
  if (!candidates[0]) return false;
  return candidates.some((text) => !turn.reject.some((part) => contains(text, part)) && turn.accept.some((parts) => parts.every((part) => contains(text, part))));
}
export function tilesCorrect(chosen: readonly string[], target: string) {
  return normalize(chosen.join(" ")) === normalize(target);
}
