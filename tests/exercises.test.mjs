import test from "node:test";
import assert from "node:assert/strict";
import { lessons } from "../src/lib/course.ts";
import { fresh, restore } from "../src/lib/learning.ts";
import { buildSession, progressAfter, phraseShare, tilesCorrect, lessonXp, wordOptions } from "../src/lib/exercises.ts";
import { freshStats, recordLesson, currentStreak, weekXp, restoreStats } from "../src/lib/stats.ts";
test("Every day becomes ~80 % phrase/dialogue and ~20 % word exercises in hear-speak-read-write order", () => {
  for (const lesson of lessons) {
    const session = buildSession(lesson, fresh(), lessons);
    assert.equal(session.length, 20);
    assert.equal(phraseShare(session), 0.8);
    assert.deepEqual(session.slice(0, 3).map((e) => e.kind), ["speak", "tiles", "write"]);
    for (const e of session.filter((x) => x.kind === "tiles")) {
      const phrase = lesson.phrases[e.phrase].phrase;
      assert.equal(e.tiles.length, phrase.replace(/[.,¿?¡!]/g, "").split(" ").length + 2);
    }
    for (const e of session.filter((x) => x.kind === "word")) {
      assert.equal(e.options.length, 3); assert(e.options.includes(lesson.words[e.word].de));
    }
  }
  assert(tilesCorrect(["Quiero", "un", "café"], "Quiero un café."));
  assert(!tilesCorrect(["un", "Quiero", "café"], "Quiero un café"));
  assert.equal(new Set(wordOptions(lessons[0], 0, lessons)).size, 3);
});
test("Progress is saved per finished phrase, dialogue and word, and stays restorable", () => {
  const lesson = lessons[0];
  const passed = new Set(["speak-0", "tiles-0", "write-0", "speak-1", "tiles-1"]);
  let state = progressAfter(fresh(), passed, lesson, "2026-11-09T10:00:00Z");
  assert.equal(state.build, 1); assert.equal(state.stage, "build");
  assert.deepEqual(restore(JSON.stringify(state)), state);
  // a resumed session skips what is done
  assert.equal(buildSession(lesson, state, lessons)[0].id, "speak-1");
  for (const k of ["write-1", "speak-2", "tiles-2", "write-2", "speak-3", "tiles-3", "write-3", "dialog-0", "dialog-1", "dialog-2", "dialog-3"]) passed.add(k);
  state = progressAfter(fresh(), passed, lesson, "2026-11-09T10:00:00Z");
  assert.equal(state.stage, "cards"); assert.equal(state.chat, 4); assert.equal(state.completedAt, "2026-11-09T10:00:00Z");
  assert.deepEqual(restore(JSON.stringify(state)), state);
  for (const k of ["word-0", "word-1", "word-2"]) passed.add(k);
  state = progressAfter(fresh(), passed, lesson, "2026-11-09T10:00:00Z");
  assert.equal(state.stage, "summary"); assert.deepEqual(state.known, [0, 1, 2]);
  assert.deepEqual(restore(JSON.stringify(state)), state);
  // dialogue passed before a re-queued phrase is not saved early
  const early = progressAfter(fresh(), new Set(["dialog-0"]), lesson);
  assert.equal(early.chat, 0);
});
test("XP and streak: daily continuation, reset after a gap, restore validation", () => {
  let s = recordLesson(freshStats(), "2026-11-08", lessonXp(0));
  s = recordLesson(s, "2026-11-09", lessonXp(2));
  s = recordLesson(s, "2026-11-09", lessonXp(1));
  assert.equal(s.streak, 2); assert.equal(s.xp, 35);
  assert.equal(currentStreak(s, "2026-11-10"), 2);
  assert.equal(currentStreak(s, "2026-11-12"), 0);
  assert.equal(recordLesson(s, "2026-11-12", 10).streak, 1);
  assert.equal(weekXp(s, "2026-11-09"), 35);
  assert.equal(recordLesson(freshStats(), "2026-03-01", 10).lastDay, "2026-03-01");
  assert.equal(recordLesson(recordLesson(freshStats(), "2026-02-28", 10), "2026-03-01", 10).streak, 2);
  assert.deepEqual(restoreStats(JSON.stringify(s)), s);
  assert.deepEqual(restoreStats("kaputt"), freshStats());
});
