import { test } from "node:test";
import assert from "node:assert/strict";
import { createLocalStorage } from "./helpers/env.js";

globalThis.localStorage = createLocalStorage();

import { state, save, load, SAVE_KEY, DEFAULT_SETTINGS } from "../js/state.js";

test("SAVE_KEY はリネームされていない（旧セーブデータとの互換性を保つ命綱）", () => {
  assert.equal(SAVE_KEY, "rekishi-quest-v1");
});

test("save(): localStorage に書き込む JSON のキー集合が仕様どおり", () => {
  localStorage.clear();
  save();
  const raw = localStorage.getItem(SAVE_KEY);
  assert.ok(raw, "save() が localStorage に何も書き込んでいない");
  const obj = JSON.parse(raw);
  assert.deepEqual(
    new Set(Object.keys(obj)),
    new Set([
      "totalScore",
      "stageCleared",
      "stageBest",
      "badges",
      "qStats",
      "streak",
      "lastStudyDate",
      "studyLog",
      "cards",
      "title",
      "settings",
      "bossCleared",
      "subjectGroupCollapsed",
    ])
  );
});

test("save→load 往復で totalScore/badges(Set)/cards(Set)/settings が復元される", () => {
  localStorage.clear();
  state.totalScore = 1234;
  state.badges = new Set(["b1", "b2"]);
  state.cards = new Set(["c_wilson"]);
  state.settings = { ...DEFAULT_SETTINGS, sound: false, dailyGoal: 20 };
  state.studyLog = {
    "2026-07-09": { answered: 3, correct: 2, subjects: { "数学Ⅰ": 3 }, modes: { stage: 3 } },
  };
  state.subjectGroupCollapsed = { "数学Ⅰ\u001f二次関数": true };
  save();

  // 一度クリアしてから load() で正しく復元されることを確認する
  state.totalScore = 0;
  state.badges = new Set();
  state.cards = new Set();
  state.settings = { ...DEFAULT_SETTINGS };
  state.studyLog = {};
  state.subjectGroupCollapsed = {};

  load();

  assert.equal(state.totalScore, 1234);
  assert.deepEqual(state.badges, new Set(["b1", "b2"]));
  assert.deepEqual(state.cards, new Set(["c_wilson"]));
  assert.equal(state.settings.sound, false);
  assert.equal(state.settings.dailyGoal, 20);
  assert.deepEqual(state.studyLog, {
    "2026-07-09": { answered: 3, correct: 2, subjects: { "数学Ⅰ": 3 }, modes: { stage: 3 } },
  });
  assert.deepEqual(state.subjectGroupCollapsed, { "数学Ⅰ\u001f二次関数": true });
});

test("旧データ互換: settings/bossCleared/studyLog/subjectGroupCollapsed が欠落してもデフォルトで読める", () => {
  localStorage.clear();
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      totalScore: 5,
      stageCleared: {},
      stageBest: {},
      badges: [],
      qStats: {},
      streak: 0,
      lastStudyDate: "",
      cards: [],
      title: "",
      // settings, bossCleared, studyLog, subjectGroupCollapsed は意図的に欠落（旧バージョンのセーブデータを模擬）
    })
  );
  load();
  assert.deepEqual(state.settings, DEFAULT_SETTINGS);
  assert.deepEqual(state.bossCleared, {});
  assert.deepEqual(state.studyLog, {});
  assert.deepEqual(state.subjectGroupCollapsed, {});
});

test("壊れたJSON（構文エラー）を読み込んでも load() は例外を出さず、呼び出し前の状態を保持する", () => {
  localStorage.clear();
  localStorage.setItem(SAVE_KEY, "{oops");
  state.totalScore = 999; // 呼び出し前の既知の値
  assert.doesNotThrow(() => load());
  assert.equal(state.totalScore, 999, "壊れたJSONで既存stateが上書きされてしまっている");
});
