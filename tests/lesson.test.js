/* tests/lesson.test.js — 「まなぶ→とく」レッスン機能
   ・js/lesson.js の表示データ生成（DOM 非依存）
   ・state.lessonSeen の既読管理と save/load 互換（旧データにフィールドが無くても未読で開始）
   ・lesson を持つ単元のデータ形状（3枚固定・各カードに title/body） */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createLocalStorage } from "./helpers/env.js";

globalThis.localStorage = createLocalStorage();

import { units } from "../data/index.js";
import { QUESTIONS } from "../js/content.js";
import { state, save, load, SAVE_KEY, isLessonSeen, markLessonSeen } from "../js/state.js";
import { hasLesson, lessonCardHtml, lessonCardsHtml, lessonBodyHtml, LESSON_CARD_COUNT, LESSON_KINDS } from "../js/lesson.js";
import { parseRoute } from "../js/utils.js";

test("hasLesson: lesson 配列が非空のときだけ真", () => {
  assert.equal(hasLesson(null), false);
  assert.equal(hasLesson({}), false);
  assert.equal(hasLesson({ lesson: [] }), false);
  assert.equal(hasLesson({ lesson: [{ title: "t", body: "b" }] }), true);
});

test("lessonBodyHtml: 改行区切りの段落を <p> にし、HTML はエスケープする", () => {
  const html = lessonBodyHtml("1行目\n\n<b>2行目</b>");
  assert.equal(html, "<p>1行目</p><p>&lt;b&gt;2行目&lt;/b&gt;</p>");
});

test("lessonCardHtml: 種別ラベル・見出し・式・グラフ（graph 指定時のみ）を含む", () => {
  const plain = lessonCardHtml({ title: "見出し", body: "本文", formula: "V=IR" }, 0);
  assert.match(plain, /1\/3　たとえ話/);
  assert.match(plain, /<h3>見出し<\/h3>/);
  assert.match(plain, /lessonFormula/);
  assert.doesNotMatch(plain, /<svg/);
  const withGraph = lessonCardHtml({ title: "g", body: "b", graph: { a: 1, b: 0, c: 0 } }, 1);
  assert.match(withGraph, /2\/3　式と単位/);
  assert.match(withGraph, /<svg/);
});

test("lessonCardsHtml: 全カードを順番どおりに連結する", () => {
  const html = lessonCardsHtml([{ title: "A", body: "a" }, { title: "B", body: "b" }, { title: "C", body: "c" }]);
  const idx = ["A", "B", "C"].map((t) => html.indexOf(`<h3>${t}</h3>`));
  assert.ok(idx[0] < idx[1] && idx[1] < idx[2]);
  assert.equal((html.match(/data-lesson-card=/g) || []).length, 3);
});

test("state.lessonSeen: 初期は未読。markLessonSeen で既読になり save→load で復元される", () => {
  localStorage.clear();
  state.lessonSeen = {};
  assert.equal(isLessonSeen("njz1"), false);
  markLessonSeen("njz1");
  assert.equal(isLessonSeen("njz1"), true);
  save();
  state.lessonSeen = {};
  load();
  assert.equal(isLessonSeen("njz1"), true);
  assert.equal(isLessonSeen("njz2"), false);
});

test("load(): 旧セーブデータに lessonSeen が無くても壊れず、未読として開始する", () => {
  localStorage.clear();
  localStorage.setItem(SAVE_KEY, JSON.stringify({ totalScore: 5, qStats: {} }));
  state.lessonSeen = { njz1: true };
  load();
  assert.deepEqual(state.lessonSeen, {});
  assert.equal(state.totalScore, 5);
});

test("parseRoute: #/lesson/<sid> をレッスン画面として解釈する", () => {
  assert.deepEqual(parseRoute("#/lesson/njz1"), { type: "lesson", sid: "njz1" });
  assert.equal(parseRoute("#/lesson/njz1/2").type, "invalid");
});

test("data: lesson を持つ単元は3枚固定で、各カードに title/body があり、QUESTIONS に伝わる", () => {
  const withLesson = units.filter((u) => u.lesson !== undefined);
  for (const u of withLesson) {
    assert.ok(Array.isArray(u.lesson), `${u.id}: lesson が配列でない`);
    assert.equal(u.lesson.length, LESSON_CARD_COUNT, `${u.id}: lesson は${LESSON_CARD_COUNT}枚固定（${LESSON_KINDS.join("→")}）`);
    u.lesson.forEach((card, i) => {
      assert.ok(typeof card.title === "string" && card.title.length > 0, `${u.id}.lesson[${i}]: title が空`);
      assert.ok(typeof card.body === "string" && card.body.length > 0, `${u.id}.lesson[${i}]: body が空`);
      if (card.graph) for (const k of ["a", "b", "c"]) assert.equal(typeof card.graph[k], "number", `${u.id}.lesson[${i}].graph.${k}`);
    });
    assert.equal(QUESTIONS[u.id].lesson, u.lesson, `${u.id}: content.js が lesson を引き渡していない`);
  }
});
