import { test } from "node:test";
import assert from "node:assert/strict";
import { pad2, todayStr, addDays } from "../js/utils.js";

test("pad2: 1桁は0埋め、2桁以上はそのまま", () => {
  assert.equal(pad2(0), "00");
  assert.equal(pad2(1), "01");
  assert.equal(pad2(9), "09");
  assert.equal(pad2(10), "10");
  assert.equal(pad2(23), "23");
});

test("todayStr: YYYY-MM-DD 形式（ローカル日付。toISOStringのUTCずれを使わない）", () => {
  assert.match(todayStr(), /^\d{4}-\d{2}-\d{2}$/);
});

test("addDays: 閏年の月末をまたぐ（2024-02-28 → +1 → 02-29）", () => {
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
});

test("addDays: 平年は2月末で3月へ（うるう年でない場合の対照確認）", () => {
  assert.equal(addDays("2023-02-28", 1), "2023-03-01");
});

test("addDays: 年またぎ（2023-12-31 → +1 → 2024-01-01）", () => {
  assert.equal(addDays("2023-12-31", 1), "2024-01-01");
});

test("addDays: 負数（過去日付への遡り、月またぎ・うるう年またぎ含む）", () => {
  assert.equal(addDays("2024-03-01", -1), "2024-02-29");
  assert.equal(addDays("2024-01-01", -1), "2023-12-31");
  assert.equal(addDays("2024-07-08", -7), "2024-07-01");
});

test("addDays(todayStr(), 0) は恒等（当日を指す）", () => {
  const t = todayStr();
  assert.equal(addDays(t, 0), t);
});
