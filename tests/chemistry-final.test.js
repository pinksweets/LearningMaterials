import { test } from 'node:test';
import assert from 'node:assert/strict';
import { units as practice } from '../data/ch_final_amount.js';
import { units as papers } from '../data/ch_final_mock.js';
import { studyUnitById } from '../js/content.js';
import { examNumericMatch, examTotal, isMockExam } from '../js/mock-exam.js';
import { testPrepCategories, renderTestPrepPanel } from '../js/views/home.js';
import { subjectShelfHtml } from '../js/views/start.js';

test('化学期末の入口は日付を固定せず、練習7ステージと模試に直接つながる', () => {
  const date = '2026-11-25';
  const entry = testPrepCategories(date).find(item => item.unitId === 'group:chfs1');
  assert.ok(entry.evergreen);
  assert.equal(entry.date, undefined);
  assert.equal(entry.past, false);
  assert.deepEqual(studyUnitById(entry.unitId).sids, [...practice, ...papers].map(unit => unit.id));
  assert.ok(renderTestPrepPanel(date).includes(`href="${entry.href}"`));
  assert.ok(subjectShelfHtml(date).includes(`href="${entry.href}"`));
});

test('7分野各10問と固定の34問100点があり、各模試問題は練習と対応する', () => {
  assert.equal(practice.length, 7);
  assert.ok(practice.every(unit => unit.questions.length === 10 && unit.lesson.length === 3));
  const [paper] = papers;
  const list = paper.questions;
  assert.equal(list.length, 34);
  assert.ok(isMockExam({mode:'stage', list}));
  assert.equal(examTotal({list}), 100);
  assert.deepEqual(practice.map(unit => list.filter(q => q.sourceStage === unit.id)
    .reduce((sum, q) => sum + q.points, 0)), [15,12,13,14,18,16,12]);
  assert.equal(new Set(list.map(q => q.examSection)).size, practice.length);
  for (const { points, examSection, sourceStage, ...question } of list) {
    const source = practice.find(unit => unit.id === sourceStage);
    assert.ok(source.questions.some(q => q.q === question.q), question.q);
    assert.deepEqual(question, source.questions.find(q => q.q === question.q));
    assert.equal(question.examPractice, true);
    assert.equal(question.hint, undefined);
  }
});

test('指数の係数を入力する問題は全角と末尾の0を許容し、単位付きの誤入力を除外する', () => {
  const question = papers[0].questions.find(q => q.sourceStage === 'chfs7' && q.points === 4);
  assert.match(question.q, /□ × 10²³/);
  assert.equal(question.strictNumeric, true);
  assert.ok(examNumericMatch('６．０', question.a));
  for (const input of ['6.0個', '6.0 × 10²³', '6.1']) {
    assert.equal(examNumericMatch(input, question.a), false);
  }
});
