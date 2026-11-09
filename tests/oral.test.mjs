import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { matchesSpokenPhrase, recognitionOptions, recognitionError } from '../src/lib/oral-model.ts';
import { fresh, restore } from '../src/lib/learning.ts';
import { freshCourse, lessons, collectedWords, reviewCollectedWord, weekStatus, restoreCourse } from '../src/lib/course.ts';
test('Speech checks complete understood words without pretending to score pronunciation', () => {
 assert(matchesSpokenPhrase('QUIERO UN CAFE.', 'Quiero un café'));
 assert(!matchesSpokenPhrase('no quiero un café', 'Quiero un café'));
 assert(!matchesSpokenPhrase('', 'Quiero un café'));
 assert(!matchesSpokenPhrase('Quiero un café', 'Quiero un café con leche'));
 assert.equal(recognitionOptions.requiresOnDeviceRecognition,true);
 assert.equal(recognitionOptions.recordingOptions.persist,false);
 assert.match(recognitionError('not-allowed'), /Mikrofon/);
 const native = fs.readFileSync(new URL('../node_modules/expo-speech-recognition/ios/ExpoSpeechRecognizer.swift', import.meta.url),'utf8');
 assert(native.includes('// PhraseUNO: never silently fall back to server recognition.\n    request.requiresOnDeviceRecognition = options.requiresOnDeviceRecognition'));
});
test('Daily vocabulary can be deferred and restored; unfinished speech days do not enter weekly collection', () => {
 const day={...fresh(), stage:'summary',build:4,chat:4,completedAt:'2026-11-09T12:00:00Z'};
 assert.deepEqual(restore(JSON.stringify(day)),day);
 const course=freshCourse();course.days['1']=day;course.days['2']={...fresh(),build:4,chat:3,stage:'chat'};
 assert.equal(collectedWords(course).length,3);
 assert.equal(weekStatus(course).completedDays,1);
 assert(!weekStatus(course).readyForNextWeek);
});
test('Weekly gate survives restart and requires every completed day and all collected words', () => {
 let course=freshCourse();
 for (const lesson of lessons) course.days[String(lesson.id)]={...fresh(),stage:'summary',build:4,chat:4,completedAt:'2026-11-09T12:00:00Z'};
 assert(!weekStatus(course).readyForNextWeek);
 const unique=collectedWords(course);assert.equal(unique.length,20);
 for (const entry of unique) course=reviewCollectedWord(course,entry.word.es,true);
 assert(weekStatus(restoreCourse(JSON.stringify(course))).readyForNextWeek);
 assert.deepEqual(course.days['2'].known.sort(),[0,1,2]); assert.deepEqual(course.days['5'].known.sort(),[0,1,2]);
 course=reviewCollectedWord(course,'la bolsa',false);
 assert(!weekStatus(course).readyForNextWeek);assert.equal(weekStatus(course).remaining,1);
 delete course.days['7'];assert(!weekStatus(course).readyForNextWeek);
});
