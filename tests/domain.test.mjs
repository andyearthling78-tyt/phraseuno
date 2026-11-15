import test from "node:test";
import assert from "node:assert/strict";
import { spanish as course } from "../src/content/index.ts";
import { allDays, resolveItem, phraseItem, wordItem } from "../src/domain/types.ts";
import { normalize, snap, judgePhrase, judgeTurn, tilesCorrect, stripPunctuation } from "../src/domain/text.ts";
import { INTERVALS, addDays, firstSeen, reviewed, dueItems } from "../src/domain/srs.ts";
import { lessonSession, reviewSession, weekCheckSession, phraseShare, sessionXp } from "../src/domain/session.ts";
import * as P from "../src/domain/progress.ts";
import { needsPremium } from "../src/domain/access.ts";

const days = allDays(course);
const finish = (progress, day, today, at = "2026-11-15T10:00:00.000Z") =>
  lessonSession(course, day).reduce((p, e) => P.passExercise(p, course, day, e.id, today, at), progress);

test("Content: every day is complete, bilingual and internally consistent", () => {
  assert.equal(days.length, 14);
  const words = new Set(), meanings = new Set();
  for (const day of days) {
    assert.equal(day.chunks.length, 4, day.id); assert.equal(day.turns.length, 4, day.id); assert.equal(day.words.length, 3, day.id);
    for (const [i, chunk] of day.chunks.entries()) {
      assert(chunk.es.includes(chunk.add), `${day.id} chunk ${i}: add not in phrase`);
      if (i) assert(normalize(chunk.es).length > normalize(day.chunks[i - 1].es).length, `${day.id} chunk ${i} must grow`);
      if (i) for (const word of normalize(day.chunks[i - 1].es).split(" ")) assert(normalize(chunk.es).split(" ").includes(word), `${day.id} chunk ${i} drops "${word}"`);
      for (const text of [chunk.meaning.de, chunk.meaning.en, chunk.tip.de, chunk.tip.en]) assert(text.trim());
    }
    for (const [i, turn] of day.turns.entries()) {
      const vocab = day.chunks.map((c) => c.es);
      assert(judgeTurn(turn.answer, turn, vocab), `${day.id} turn ${i}: model answer rejected`);
      assert(!judgeTurn("xyz qwerty", turn, vocab)); assert(!judgeTurn("", turn, vocab));
      for (const text of [turn.meaning.de, turn.meaning.en, turn.answerMeaning.de, turn.answerMeaning.en]) assert(text.trim());
    }
    for (const word of day.words) {
      assert(!words.has(word.es), `duplicate word ${word.es}`); words.add(word.es);
      assert(!meanings.has(word.meaning.de), `duplicate meaning ${word.meaning.de}`); meanings.add(word.meaning.de);
      assert(word.meaning.en.trim() && word.example.trim() && word.emoji);
    }
  }
});
test("Text: accents, punctuation and typical recognition near-misses are tolerated; contradictions are not", () => {
  assert.equal(judgePhrase("QUIERO UN CAFE.", "Quiero un café"), "exact");
  assert.equal(judgePhrase("kiero un kafe", "Quiero un café"), "close");
  assert.equal(judgePhrase("Quiero un té", "Quiero un café"), "wrong");
  assert.equal(judgePhrase("Quiero un café", "Quiero un café con leche"), "wrong");
  assert.equal(snap("para yevar", ["para llevar"]), "para llevar");
  const cafe = days[0];
  for (const heard of ["Para yevar", "para lleva", "Para tomar aquí, por favor"]) assert(judgeTurn(heard, cafe.turns[2]), heard);
  assert(!judgeTurn("sin leche", cafe.turns[1])); assert(!judgeTurn("no quiero un café", cafe.turns[0]));
  assert(!judgeTurn("Quiero un café con leche", cafe.turns[3]));
  assert(tilesCorrect(["Quiero", "un", "café"], stripPunctuation("Quiero un café.")));
  assert(!tilesCorrect(["un", "Quiero", "café"], "Quiero un café"));
});
test("Lesson: 20 exercises, 80 % phrases, hear → read → write per chunk, then dialogue and word check", () => {
  for (const day of days) {
    const session = lessonSession(course, day);
    assert.equal(session.length, 20); assert.equal(phraseShare(session), 0.8);
    assert.deepEqual(session.slice(0, 3).map((e) => e.kind), ["listen", "build", "write"]);
    assert.equal(new Set(session.map((e) => e.id)).size, 20);
    for (const e of session) {
      if (e.kind === "build") assert.equal(e.tiles.length, stripPunctuation(resolveItem(course, e.item).chunk.es).split(" ").length + 2);
      if (e.kind === "choose") { assert.equal(new Set(e.options).size, 3); assert(e.options.includes(e.item)); }
    }
    assert.deepEqual(lessonSession(course, day), session, "deterministic");
  }
});
test("Spaced repetition: expanding intervals, lapse returns to box 1", () => {
  let item = firstSeen("2026-11-15");
  assert.deepEqual(item, { box: 1, due: "2026-11-16", reps: 1, lapses: 0 });
  item = reviewed(item, true, "2026-11-16"); assert.equal(item.box, 2); assert.equal(item.due, addDays("2026-11-16", INTERVALS[2]));
  item = reviewed(item, true, item.due); item = reviewed(item, true, item.due); assert.equal(item.box, 4);
  item = reviewed(item, false, "2026-12-20"); assert.deepEqual([item.box, item.due, item.lapses], [1, "2026-12-21", 1]);
  for (let i = 0; i < 20; i++) item = reviewed(item, true, item.due);
  assert.equal(item.box, INTERVALS.length - 1);
  assert.equal(addDays("2026-02-28", 1), "2026-03-01"); assert.equal(addDays("2026-01-01", -1), "2025-12-31");
  assert.deepEqual(dueItems({ a: { box: 2, due: "2026-11-10", reps: 1, lapses: 0 }, b: { box: 1, due: "2026-11-09", reps: 1, lapses: 0 }, c: { box: 1, due: "2026-12-01", reps: 1, lapses: 0 } }, "2026-11-15"), ["b", "a"]);
});
test("Progress: resume, completion schedules reviews, restore validates, sequential unlock and paywall", () => {
  const [d1, d2] = days; const w2 = days[7];
  let p = P.fresh();
  assert.equal(P.dayStatus(course, p, d1, false), "open"); assert.equal(P.dayStatus(course, p, d2, false), "locked");
  p = P.passExercise(p, course, d1, "listen-0", "2026-11-15"); p = P.passExercise(p, course, d1, "nonsense", "2026-11-15");
  assert.deepEqual(p.days[d1.id], { passed: ["listen-0"], completedAt: null }); assert.equal(P.dayPercent(course, p, d1), 5);
  assert.deepEqual(P.restore(JSON.stringify(p), course), p);
  p = finish(p, d1, "2026-11-15");
  assert(P.dayDone(p, d1.id)); assert.equal(Object.keys(p.items).length, 7);
  assert.equal(p.items[phraseItem(d1.id, 3)].due, "2026-11-16"); assert.equal(P.dueCount(p, "2026-11-15"), 0); assert.equal(P.dueCount(p, "2026-11-16"), 7);
  assert.equal(P.dayStatus(course, p, d2, false), "open"); assert.equal(P.nextDay(course, p).id, d2.id);
  assert.deepEqual(P.restore(JSON.stringify(p), course), p);
  for (const day of days.slice(1, 7)) p = finish(p, day, "2026-11-15");
  assert.equal(P.dayStatus(course, p, w2, true), "locked", "week check required first");
  assert.equal(P.completeWeekCheck(P.fresh(), course, 1, "2026-11-15").weekChecks["1"], undefined);
  p = P.completeWeekCheck(p, course, 1, "2026-11-15");
  assert(P.weekComplete(course, p, 1)); assert(needsPremium(w2)); assert(!needsPremium(d1));
  assert.equal(P.dayStatus(course, p, w2, false), "premium"); assert.equal(P.dayStatus(course, p, w2, true), "open");
  assert.equal(P.learnedWords(course, p).length, 21);
  assert.deepEqual(P.restore("kaputt", course), P.fresh());
  const dirty = P.restore(JSON.stringify({ ...p, items: { ...p.items, bad: { box: 99 } }, xp: -4, days: { ...p.days, zz: { passed: ["x"] } } }), course);
  assert.equal(dirty.items.bad, undefined); assert.equal(dirty.xp, 0); assert.equal(dirty.days.zz, undefined);
  assert.equal(P.resetDay(p, d1.id).days[d1.id], undefined);
});
test("Review: only due items, 8 phrases to 2 words, harder retrieval for stronger memories; week check covers all words", () => {
  let p = P.fresh();
  for (const day of days.slice(0, 3)) p = finish(p, day, "2026-11-15");
  assert.equal(reviewSession(course, p.items, "2026-11-15").length, 0);
  const session = reviewSession(course, p.items, "2026-11-16");
  assert.equal(session.length, 10); assert.equal(phraseShare(session), 0.8);
  assert(session.filter((e) => e.kind !== "choose").every((e) => e.kind === "build" && e.audio === false));
  const item = phraseItem(days[0].id, 0);
  p = P.applyReview(p, item, true, "2026-11-16"); assert.equal(p.items[item].box, 2);
  const strong = { [item]: { box: 5, due: "2026-11-16", reps: 6, lapses: 0 }, [wordItem(days[0].id, 0)]: { box: 4, due: "2026-11-16", reps: 5, lapses: 0 } };
  const later = reviewSession(course, strong, "2026-11-16");
  assert.deepEqual(later.map((e) => e.kind).sort(), ["choose", "recall"]); assert.equal(later.find((e) => e.kind === "choose").reverse, true);
  assert.equal(reviewSession(course, { "p:gone:0": { box: 1, due: "2026-01-01", reps: 1, lapses: 0 } }, "2026-11-16").length, 0);
  const check = weekCheckSession(course, 1);
  assert.equal(check.length, 21); assert.equal(new Set(check.map((e) => e.item)).size, 21);
  assert.equal(sessionXp("lesson", 0), 15); assert.equal(sessionXp("lesson", 2), 10); assert.equal(sessionXp("review", 1), 5);
});
test("Streak and XP: once per day, reset after a gap; legacy progress is carried over", () => {
  let p = P.recordActivity(P.fresh(), "2026-11-14", 15);
  p = P.recordActivity(p, "2026-11-15", 10); p = P.recordActivity(p, "2026-11-15", 5);
  assert.deepEqual([p.streak, p.xp, P.weekXp(p, "2026-11-15")], [2, 30, 30]);
  assert.equal(P.currentStreak(p, "2026-11-16"), 2); assert.equal(P.currentStreak(p, "2026-11-17"), 0);
  assert.equal(P.recordActivity(p, "2026-11-18", 5).streak, 1);
  const legacy = { version: 2, selectedDay: 3, days: { "1": { chat: 4, completedAt: "2026-11-09T12:00:00Z" }, "2": { chat: 4, completedAt: "2026-11-09T13:00:00Z" }, "3": { chat: 2, completedAt: null } } };
  const migrated = P.migrateLegacy(JSON.stringify(legacy), course, "2026-11-15");
  assert(P.dayDone(migrated, "w1d1")); assert(P.dayDone(migrated, "w1d2")); assert(!P.dayDone(migrated, "w1d3"));
  assert.equal(migrated.days.w1d1.completedAt, "2026-11-09T12:00:00Z"); assert.equal(Object.keys(migrated.items).length, 14);
  assert.equal(P.migrateLegacy("{}", course, "2026-11-15"), null); assert.equal(P.migrateLegacy(null, course, "2026-11-15"), null);
});
