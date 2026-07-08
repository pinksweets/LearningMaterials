import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createLocalStorage } from "./helpers/env.js";

// state.js は localStorage を「呼び出し時」にしか参照しない（import時ではない）ので、
// import 前に差し替えておけば十分（cleanupStaleQStats が内部で save() を呼ぶ経路もカバーする）。
globalThis.localStorage = createLocalStorage();

import {
  getQStat,
  updateQStat,
  isMastered,
  masteredCount,
  dueList,
  cleanupStaleQStats,
  state,
  SRS_INTERVAL,
} from "../js/state.js";
import { STAGE_ORDER, QUESTIONS } from "../js/content.js";
import { todayStr, addDays } from "../js/utils.js";

beforeEach(() => {
  // state はモジュールシングルトンなので、テストごとに qStats を直接クリアする。
  state.qStats = {};
});

test("getQStat: 未登録キーは既定値 {seen:0,correct:0,box:0,due:today} で初期化される", () => {
  const st = getQStat("s1-0");
  assert.deepEqual(st, { seen: 0, correct: 0, box: 0, due: todayStr() });
});

test("getQStat: 同一キーは同じオブジェクトを再利用する（作成後の変更が保持される）", () => {
  const a = getQStat("s1-1");
  a.seen = 5;
  const b = getQStat("s1-1");
  assert.equal(b.seen, 5);
});

test("updateQStat: 正解のたびに box が進み、上限5で頭打ちになる。due は box に応じたSRS間隔になる", () => {
  const key = "s1-2";
  for (let i = 0; i < 10; i++) updateQStat(key, true);
  const st = state.qStats[key];
  assert.equal(st.box, 5);
  assert.equal(st.seen, 10);
  assert.equal(st.correct, 10);
  assert.equal(st.due, addDays(todayStr(), SRS_INTERVAL[5]));
});

test("updateQStat: 1回目の正解では box=1, due=today+SRS_INTERVAL[1]", () => {
  const key = "s1-2b";
  updateQStat(key, true);
  const st = state.qStats[key];
  assert.equal(st.box, 1);
  assert.equal(st.due, addDays(todayStr(), SRS_INTERVAL[1]));
});

test("updateQStat: 不正解で box は0にリセットされ、due は今日になる", () => {
  const key = "s1-3";
  updateQStat(key, true);
  updateQStat(key, true);
  assert.ok(state.qStats[key].box > 0);
  updateQStat(key, false);
  assert.equal(state.qStats[key].box, 0);
  assert.equal(state.qStats[key].due, todayStr());
});

test("isMastered: box>=3 でマスター扱いになる", () => {
  const key = "s1-4";
  updateQStat(key, true);
  updateQStat(key, true);
  assert.equal(isMastered(key), false); // box=2
  updateQStat(key, true);
  assert.equal(isMastered(key), true); // box=3
});

test("isMastered: 未登録キーは false", () => {
  assert.equal(isMastered("nope-0"), false);
});

test("masteredCount: qStats 全体からマスター済み件数を数える", () => {
  updateQStat("a-0", true);
  updateQStat("a-0", true);
  updateQStat("a-0", true); // box=3 マスター
  updateQStat("a-1", true); // box=1 未マスター
  assert.equal(masteredCount(), 1);
});

test("dueList: due<=today の問題を全ステージ横断で列挙し、_key/_page が付与される", () => {
  const sid = STAGE_ORDER[0];
  const key = sid + "-0";
  state.qStats[key] = { seen: 1, correct: 1, box: 1, due: todayStr() };
  const list = dueList();
  const entry = list.find((q) => q._key === key);
  assert.ok(entry, "due済みの問題が dueList に含まれること");
  assert.equal(entry._page, QUESTIONS[sid].page);
});

test("dueList: due が未来の問題は含まれない", () => {
  const sid = STAGE_ORDER[0];
  const key = sid + "-0";
  state.qStats[key] = { seen: 1, correct: 1, box: 1, due: addDays(todayStr(), 3) };
  const list = dueList();
  assert.ok(!list.some((q) => q._key === key));
});

test("cleanupStaleQStats: 現存する単元のキーは残し、存在しない単元IDの偽キーは削除する", () => {
  const sid = STAGE_ORDER[0];
  const validKey = sid + "-0";
  state.qStats[validKey] = { seen: 1, correct: 1, box: 1, due: todayStr() };
  state.qStats["zzz-0"] = { seen: 1, correct: 1, box: 1, due: todayStr() };
  cleanupStaleQStats();
  assert.ok(validKey in state.qStats, "現存キーが誤って削除されている");
  assert.ok(!("zzz-0" in state.qStats), "存在しない単元IDの偽キーが残っている");
});
