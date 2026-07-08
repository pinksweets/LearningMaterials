import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeAnswer, isAnswerMatch, isAnyAnswerMatch } from "../js/answers.js";

/* 以下は実装の実挙動を node -e で確認したうえで固定した assert 群。
   直感と異なる箇所には注記を付けてある。 */

test("normalizeAnswer: 全角/半角空白を除去する", () => {
  assert.equal(normalizeAnswer("　　hello　"), "hello");
  assert.equal(normalizeAnswer(" a b "), "ab");
});

test("normalizeAnswer: 全角数字/全角英字を半角化し、小文字化する", () => {
  assert.equal(normalizeAnswer("５"), "5");
  assert.equal(normalizeAnswer("ＡＢＣ"), "abc");
  assert.equal(normalizeAnswer("ａｂｃ"), "abc");
  assert.equal(normalizeAnswer("ABC"), "abc");
});

test("normalizeAnswer: 等号・括弧・中黒のゆらぎを統一する", () => {
  assert.equal(normalizeAnswer("＝"), "=");
  assert.equal(normalizeAnswer("（a）"), "(a)");
  assert.equal(normalizeAnswer("a･b"), "a・b");
  assert.equal(normalizeAnswer("a・b"), "a・b");
});

test("normalizeAnswer: 長音・各種マイナス記号は半角ハイフンに統一される", () => {
  assert.equal(normalizeAnswer("－５"), "-5");
  assert.equal(normalizeAnswer("−5"), "-5");
  assert.equal(normalizeAnswer("-5"), "-5");
});

test("normalizeAnswer: 実挙動の注記 — ASCII/全角ピリオドは句点(。)に変換される（小数点として温存されない）", () => {
  // normalizeAnswer は句点ゆらぎ吸収 (x.replace(/[。.]/g,'。')) を
  // 全角数字→半角変換より先に行うため、"." を含む小数表記は
  // 小数点として残らず全角句点相当の文字に化ける。これは意図的か
  // どうかに関わらず現行実装の実挙動であり、本テストはそれを固定する。
  assert.equal(normalizeAnswer("3.14"), "3。14");
  assert.equal(normalizeAnswer("5.0"), "5。0");
  assert.equal(normalizeAnswer(".5"), "。5");
});

test("isAnswerMatch: 空入力は常に不正解 (false)", () => {
  assert.equal(isAnswerMatch("", "5"), false);
  assert.equal(isAnswerMatch("   ", ""), false);
});

test("isAnswerMatch: 正規化後の文字列一致で正解になる", () => {
  assert.equal(isAnswerMatch("ABC", "abc"), true);
  assert.equal(isAnswerMatch("３", "3"), true);
  assert.equal(isAnswerMatch("あ", "い"), false);
});

test("isAnswerMatch: 文字列不一致でも parseFloat が両者有限かつ一致すれば正解", () => {
  assert.equal(isAnswerMatch("5", "5.0"), true); // parseFloat('5。0') は 5 になり 5 と一致
  assert.equal(isAnswerMatch("7", "9"), false);
});

test("isAnswerMatch: 実挙動の注記 — 小数点以下が normalizeAnswer で句点化されるため、parseFloatフォールバックは整数部だけで一致してしまうことがある", () => {
  // '3.14' は normalizeAnswer で '3。14' になり、parseFloat('3。14') は
  // 先頭の '3' までしか読めず 3 になる。そのため correct='3' の問題に
  // 入力'3.14'を与えても正解扱いになってしまう（既知の実挙動）。
  assert.equal(isAnswerMatch("3.14", "3"), true);
});

test("isAnyAnswerMatch: 配列内のいずれかに一致すれば true", () => {
  assert.equal(isAnyAnswerMatch("5", ["1", "5", "9"]), true);
  assert.equal(isAnyAnswerMatch("7", ["1", "5", "9"]), false);
});

test("isAnyAnswerMatch: 単一値（非配列）にも対応する", () => {
  assert.equal(isAnyAnswerMatch("5", "5"), true);
  assert.equal(isAnyAnswerMatch("7", "5"), false);
});
