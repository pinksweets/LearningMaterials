import { test } from 'node:test';
import assert from 'node:assert/strict';
import { units as practice } from '../data/m1_final_practice.js';
import { units as papers } from '../data/m1_final_mock.js';
import { MATH1_SUBJECT, MATH1_PREP_SUBJECT, displayStagesOfSubject, studyUnitById } from '../js/content.js';
import { examAnswer, examBreakdown, examTotal, isMockExam } from '../js/mock-exam.js';
import { renderTestPrepPanel, testPrepCategories } from '../js/views/home.js';
import { examResultHtml } from '../js/views/results.js';
import { subjectShelf } from '../js/views/start.js';
import { studyUnitHash } from '../js/utils.js';

test('数学Ⅰの期末対策は独立した入口から8つの練習と模試に進める', () => {
  const date = '2026-11-26';
  const href = studyUnitHash('group:mifs1');
  const entry = testPrepCategories(date).find(item => item.href === href);
  assert.equal(entry.evergreen, true);
  assert.ok(renderTestPrepPanel(date).includes(`href="${href}"`));
  assert.equal(subjectShelf(date).main.filter(item => item.href === href).length, 1);

  const ids = [...practice, ...papers].map(unit => unit.id);
  assert.deepEqual(studyUnitById('group:mifs1').sids, ids);
  assert.deepEqual(displayStagesOfSubject(entry.subject), ids);
  for (const subject of [MATH1_SUBJECT, MATH1_PREP_SUBJECT]) {
    assert.ok(displayStagesOfSubject(subject).every(id => !ids.includes(id)));
  }
  assert.deepEqual(practice.map(unit => unit.page), ['81〜83','84〜87','88〜89','90〜91','92〜93','94〜96','97〜98','99〜102']);
  assert.ok(practice.every(unit => unit.lesson.length === 3 && unit.questions.length === 10));
  assert.ok(practice.every(unit => unit.questions.every(question => question.examPractice)));
});

test('期末の復習模試は2次不等式と三角比が各50点で、8分野それぞれに復習先がある', () => {
  const [paper] = papers;
  const list = paper.questions.map((question, i) => ({...question, _key: paper.id+'-'+i}));
  const session = {mode:'stage', list, wrongThisRun:list};
  assert.equal(list.length, 34);
  assert.ok(isMockExam(session));
  assert.equal(examTotal(session), 100);
  assert.deepEqual([2, 3, 4].map(weight => list.filter(q => q.points === weight).length), [10, 16, 8]);
  const sections = examBreakdown(session);
  assert.deepEqual(sections.map(section => section.total), [13, 12, 13, 12, 12, 14, 11, 13]);
  assert.deepEqual(sections.map(section => section.sourceStage), practice.map(unit => unit.id));
  const results = examResultHtml(session);
  for (const unit of practice) assert.ok(results.includes(`#/stage/${unit.id}/1`));
  assert.equal(new Set(list.map(q => q.q)).size, list.length);
  assert.ok(list.some(q => q.type === 'suji'));
  for (const question of list) {
    const unit = practice.find(candidate => candidate.id === question.sourceStage);
    const source = unit.questions.find(candidate => candidate.q === question.q);
    assert.equal(examAnswer(question), examAnswer(source));
    assert.deepEqual(question.choices, source.choices);
    assert.equal(question.exp, source.exp);
  }
});
