import test from "node:test";
import assert from "node:assert/strict";
import { lessons, freshCourse, restoreCourse, selectDay } from "../src/lib/course.ts";
import { fresh, assess } from "../src/lib/learning.ts";
import { translate } from "../src/lib/translation.ts";
test("All seven days have complete bilingual exercises and accept their model answers", () => {
  assert.deepEqual(lessons.map((day) => day.id), [1,2,3,4,5,6,7]);
  for (const day of lessons) {
    assert.equal(day.phrases.length, 4); assert.equal(day.turns.length, 4); assert.equal(day.words.length, 3);
    for (const [index, turn] of day.turns.entries()) {
      assert.equal(assess(turn.hint, index, day.turns).ok, true, `day ${day.id}, turn ${index + 1}`);
      assert.equal(assess("Unrelated answer", index, day.turns).ok, false);
      assert.equal(assess("", index, day.turns).ok, false);
    }
    for (const text of [day.label,day.title,day.context,day.summary,...day.phrases.flatMap(p=>[p.de,p.tip]),...day.words.flatMap(w=>[w.de,w.note]),...day.turns.flatMap(t=>[t.de,t.help,t.success])]) {
      assert.notEqual(translate(text,"en"),text,`English missing: ${text}`);
    }
  }
});
test("Old day-one progress migrates without losing answers, cards or completion", () => {
  const old = {...fresh(),stage:"summary",build:4,chat:4,known:[0,1,2],messages:[{role:"user",text:"Quiero un café."}],completedAt:"2026-11-08T12:00:00Z"};
  const course=restoreCourse(JSON.stringify(old));
  assert.deepEqual(course.days["1"],old); assert.equal(course.selectedDay,1);
  const next=selectDay(course,2);
  assert.equal(next.days["2"].stage,"intro"); assert.deepEqual(next.days["1"],old);
  assert.deepEqual(restoreCourse(JSON.stringify(next)),next);
});
test("Each day is isolated and damaged or foreign course data is safely restored", () => {
  let course=selectDay(freshCourse(),3);
  course.days["3"]={...fresh(),stage:"build",build:2};
  course=selectDay(course,4);
  assert.equal(course.days["4"].build,0);
  assert.equal(selectDay(course,3).days["3"].build,2);
  assert.equal(selectDay(course,100),course);
  assert.deepEqual(restoreCourse("not json"),freshCourse());
  const broken=restoreCourse(JSON.stringify({version:2,selectedDay:9,days:{"1":{version:1,build:999}}}));
  assert.equal(broken.selectedDay,1); assert.equal(broken.days["1"].build,0);
});
