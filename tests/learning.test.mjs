import test from "node:test";
import assert from "node:assert/strict";
import {
  assess,
  normalize,
  restore,
  fresh,
  percent,
  phrases,
  KEY,
} from "../src/lib/learning.ts";
test("Café dialog accepts accents, punctuation, case and complete answer", () => {
  assert.equal(assess("¡Quiero un CAFÉ, por favor!", 0).ok, true);
  assert.equal(assess("Con leche, por favor.", 1).ok, true);
  assert.equal(assess("Para llevar.", 2).ok, true);
  assert.equal(assess(phrases[3].phrase, 3).ok, true);
});
test("Targeted feedback blocks irrelevant, incomplete and contradictory answers", () => {
  for (const [s, i] of [
    ["no quiero un café", 0],
    ["hola", 0],
    ["cafetería", 0],
    ["Sin leche", 1],
    ["No, sin leche, con leche", 1],
    ["No sé", 2],
    ["Quiero un café con leche", 3],
    ["", 0],
  ])
    assert.equal(assess(s, i).ok, false);
  assert.match(assess("cafe", 0).message, /Quiero/);
  // "Here" is a correct real-life answer too, not only "to go".
  for (const answer of ["Para tomar aquí, por favor", "Para llevar"]) assert.equal(assess(answer, 2).ok, true);
});
test("Restore survives malformed, old and invalid saved data", () => {
  for (const s of [
    null,
    "broken",
    "{}",
    JSON.stringify({ ...fresh(), stage: "wrong" }),
    JSON.stringify({ ...fresh(), build: 99 }),
    JSON.stringify({ ...fresh(), messages: [{ text: "oops" }] }),
  ])
    assert.deepEqual(restore(s), fresh());
});
test("Saved lesson resumes dialog and cards without losing progress", () => {
  const s = {
    ...fresh(),
    stage: "cards",
    build: 4,
    chat: 4,
    known: [0, 1],
    card: 2,
    messages: [{ role: "user", text: "Con leche." }],
  };
  assert.deepEqual(restore(JSON.stringify(s)), s);
  assert.equal(percent(s), 93);
});
test("80/20 weighting, 100 percent completion and fresh state", () => {
  assert.equal(percent(fresh()), 0);
  assert.equal(percent({ ...fresh(), build: 4, chat: 4 }), 80);
  assert.equal(
    percent({ ...fresh(), build: 4, chat: 4, known: [0, 1, 2] }),
    100,
  );
  assert.equal(normalize("café, por favor!"), "cafe por favor");
  assert.equal(KEY, "phraseuno.native.v1");
});

test("Inconsistent restored stages reset safely", () => {
  for (const state of [
    { ...fresh(), stage: "build", build: 4 },
    { ...fresh(), stage: "cards" },
    { ...fresh(), known: [0, 0] },
  ])
    assert.deepEqual(restore(JSON.stringify(state)), fresh());
});
