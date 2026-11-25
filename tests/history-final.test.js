import { test } from 'node:test';
import assert from 'node:assert/strict';
import { units as practice } from '../data/h_final_history.js';
import { units as papers } from '../data/h_final_mock.js';
import { studyUnitById } from '../js/content.js';
import { examBreakdown, examTotal, isMockExam } from '../js/mock-exam.js';
import { renderTestPrepPanel, testPrepCategories } from '../js/views/home.js';
import { examResultHtml } from '../js/views/results.js';

test('歴史の期末対策はホームから範囲ごとの練習と模試に進める', () => {
  const date = '2026-11-25';
  const entry = testPrepCategories(date).find(item => item.unitId === 'group:hfs1');
  assert.equal(entry.evergreen, true);
  assert.equal(entry.date, undefined);
  assert.ok(renderTestPrepPanel(date).includes(`href="${entry.href}"`));
  assert.deepEqual(studyUnitById(entry.unitId).sids, [...practice, ...papers].map(unit => unit.id));
  assert.deepEqual(practice.map(unit => unit.page), ['156〜157','156〜157','158〜159','158〜159','162〜163','162〜163']);
  assert.equal(practice.length, 6);
  assert.ok(practice.every(unit => unit.lesson.length === 3 && unit.questions.length === 10));
});

test('復習模試は34問100点で、分野別結果から対応する練習へ戻れる', () => {
  const [paper] = papers;
  const list = paper.questions.map((question, i) => ({...question, _key: `${paper.id}-${i}`}));
  const session = {mode:'stage', list, wrongThisRun:list};
  assert.equal(list.length, 34);
  assert.ok(isMockExam(session));
  assert.equal(examTotal(session), 100);
  assert.deepEqual(examBreakdown(session).map(({earned,total}) => [earned,total]),
    [[0,15],[0,18],[0,15],[0,18],[0,17],[0,17]]);
  const results = examResultHtml(session);
  for (const unit of practice) {
    assert.ok(results.includes(`#/stage/${unit.id}/1`));
  }
  for (const {points, examSection, sourceStage, _key, ...question} of list) {
    const unit = practice.find(candidate => candidate.id === sourceStage);
    assert.equal(examSection, unit.title);
    assert.deepEqual(question, unit.questions.find(candidate => candidate.q === question.q));
  }
});
