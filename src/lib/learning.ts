export type Stage = "intro" | "build" | "chat" | "cards" | "summary";
export type Message = { role: "user" | "teacher"; text: string };
export type LearningState = {
  version: 1;
  stage: Stage;
  build: number;
  chat: number;
  messages: Message[];
  known: number[];
  card: number;
  completedAt: string | null;
};
export const KEY = "phraseuno.native.v1";
export const phrases = [
  {
    phrase: "Quiero un café",
    de: "Ich möchte einen Kaffee.",
    add: "Quiero un café",
    tokens: ["café", "Quiero", "un"],
    tip: "„Quiero“ bedeutet „ich möchte“. Damit kannst du direkt etwas bestellen.",
  },
  {
    phrase: "Quiero un café con leche",
    de: "Ich möchte einen Kaffee mit Milch.",
    add: "con leche",
    tokens: ["leche", "con"],
    tip: "„Con“ heißt „mit“. Ein kleines Wort, viele Möglichkeiten.",
  },
  {
    phrase: "Quiero un café con leche, por favor",
    de: "Ich möchte einen Kaffee mit Milch, bitte.",
    add: "por favor",
    tokens: ["favor", "por"],
    tip: "„Por favor“ macht deine Bestellung freundlich. Die zwei Wörter gehören zusammen.",
  },
  {
    phrase: "Quiero un café con leche, por favor, para llevar",
    de: "Ich möchte einen Kaffee mit Milch, bitte, zum Mitnehmen.",
    add: "para llevar",
    tokens: ["llevar", "para"],
    tip: "„Para llevar“ heißt hier „zum Mitnehmen“. Du lernst die Wendung als Ganzes.",
  },
];
export const words = [
  {
    es: "el café",
    de: "der Kaffee",
    symbol: "☕",
    note: "Mit Artikel merken: el café.",
    example: "Quiero un café.",
  },
  {
    es: "la leche",
    de: "die Milch",
    symbol: "🥛",
    note: "Mit Artikel merken: la leche.",
    example: "Un café con leche.",
  },
  {
    es: "llevar",
    de: "mitnehmen",
    symbol: "↗",
    note: "Im Café: para llevar = zum Mitnehmen.",
    example: "Para llevar, por favor.",
  },
];
export const turns = [
  {
    es: "¡Hola! ¿Qué quieres tomar?",
    de: "Hallo! Was möchtest du trinken?",
    hint: "Quiero un café.",
    success: "¡Muy bien! Mit „Quiero un café“ ist dein Wunsch klar.",
    test: (s: string) =>
      s.includes("quiero") && !s.includes("no quiero") && /\bcafe\b/.test(s),
    help: "Beginne mit „Quiero“ und bestelle „un café“.",
  },
  {
    es: "¿Solo o con leche?",
    de: "Schwarz oder mit Milch?",
    hint: "Con leche, por favor.",
    success: "¡Perfecto! Dein Kaffee kommt mit Milch.",
    test: (s: string) => /\bcon leche\b/.test(s) && !s.includes("sin leche"),
    help: "Du möchtest Milch. Antworte mit „con leche“.",
  },
  {
    es: "¿Para tomar aquí o para llevar?",
    de: "Hier trinken oder zum Mitnehmen?",
    hint: "Para llevar, por favor.",
    success: "¡Genial! Lucía weiß jetzt, wo du deinen Kaffee trinkst.",
    // Both are correct Spanish answers: to go or to have here.
    test: (s: string) => /\bpara llevar\b/.test(s) || /\baqui\b/.test(s),
    help: "Sag „para llevar“ (zum Mitnehmen) oder „para tomar aquí“ (hier trinken).",
  },
  {
    es: "Muy bien. ¿Puedes repetir tu pedido completo?",
    de: "Sehr gut. Kannst du deine vollständige Bestellung wiederholen?",
    hint: phrases[3].phrase + ".",
    success:
      "¡Excelente! Du hast deine erste Bestellung auf Spanisch geschafft.",
    test: (s: string) =>
      s.includes("quiero") &&
      !s.includes("no quiero") &&
      /\bcafe\b/.test(s) &&
      s.includes("con leche") &&
      s.includes("por favor") &&
      s.includes("para llevar") &&
      !s.includes("sin leche"),
    help: "Verbinde alle Bausteine: Quiero un café + con leche + por favor + para llevar.",
  },
];
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
// Spanish speech recognition often hears near-misses ("yevar", "lleva", "parar").
// Words are compared by sound (ll/y, v/b, z/c/s, silent h) and, for longer words,
// with one letter tolerance, then snapped to the lesson's known words.
export function soundKey(word: string) {
  return normalize(word).replace(/ll/g, "y").replace(/v/g, "b").replace(/z/g, "s")
    .replace(/c([ei])/g, "s$1").replace(/qu/g, "k").replace(/c/g, "k").replace(/(^|[^c])h/g, "$1").replace(/(.)\1+/g, "$1");
}
function distance(a: string, b: string) {
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
export function snapToVocabulary(text: string, vocabulary: readonly string[]) {
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
export function assess(text: string, index: number, lessonTurns = turns) {
  if (!text.trim())
    return { ok: false, message: "Schreibe zuerst deine Antwort." };
  const t = lessonTurns[index];
  if (!t)
    return { ok: false, message: "Dieser Dialog ist bereits abgeschlossen." };
  const vocabulary = lessonTurns.map((turn) => turn.hint);
  const ok = t.test(normalize(text)) || t.test(snapToVocabulary(text, vocabulary));
  return { ok, message: ok ? t.success : t.help };
}
export const fresh = (): LearningState => ({
  version: 1,
  stage: "intro",
  build: 0,
  chat: 0,
  messages: [],
  known: [],
  card: 0,
  completedAt: null,
});
export function restore(raw: string | null) {
  try {
    const s = JSON.parse(raw ?? "null");
    if (
      s?.version !== 1 ||
      !["intro", "build", "chat", "cards", "summary"].includes(s.stage) ||
      !Number.isInteger(s.build) ||
      s.build < 0 ||
      s.build > 4 ||
      !Number.isInteger(s.chat) ||
      s.chat < 0 ||
      s.chat > 4 ||
      !Number.isInteger(s.card) ||
      s.card < 0 ||
      s.card > 2 ||
      !Array.isArray(s.known) ||
      s.known.some(
        (x: unknown) =>
          typeof x !== "number" || !Number.isInteger(x) || x < 0 || x > 2,
      ) ||
      !Array.isArray(s.messages) ||
      s.messages.some(
        (x: Message) =>
          !["user", "teacher"].includes(x.role) || typeof x.text !== "string",
      ) ||
      s.messages.length > 100
    )
      return fresh();
    if (new Set(s.known).size !== s.known.length) return fresh();
    if (s.stage === "build" && s.build >= 4) return fresh();
    if (["chat", "cards", "summary"].includes(s.stage) && s.build !== 4)
      return fresh();
    if (["cards", "summary"].includes(s.stage) && s.chat !== 4) return fresh();
    if (s.stage === "cards" && s.known.includes(s.card)) return fresh();
    if (
      s.stage === "summary" &&
      (!s.completedAt ||
        !Number.isFinite(Date.parse(s.completedAt)))
    )
      return fresh();
    return s;
  } catch {
    return fresh();
  }
}
export function percent(s: LearningState) {
  return Math.round(
    Math.min(s.build, 4) * 10 +
      Math.min(s.chat, 4) * 10 +
      (new Set(s.known).size * 20) / 3,
  );
}
