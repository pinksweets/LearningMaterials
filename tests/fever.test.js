import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FEVER_MAX,
  FEVER_GAIN,
  FEVER_MISS_LOSS,
  FEVER_TURNS,
  applyFeverProgress,
  bossWeakRemain,
  initRewardProgress,
} from "../js/fever.js";

test("initRewardProgress: 未設定フィールドを既定値(0)で初期化する", () => {
  const c = {};
  initRewardProgress(c);
  assert.equal(c.feverGauge, 0);
  assert.equal(c.feverLeft, 0);
  assert.equal(c.feverCount, 0);
  assert.equal(c.weakHits, 0);
});

test("initRewardProgress: 既に数値が入っているフィールドは上書きしない", () => {
  const c = { feverGauge: 40, feverLeft: 2, feverCount: 3, weakHits: 1 };
  initRewardProgress(c);
  assert.deepEqual(c, { feverGauge: 40, feverLeft: 2, feverCount: 3, weakHits: 1 });
});

test("applyFeverProgress: 正解でゲージが FEVER_GAIN 分たまる（フィーバー開始前）", () => {
  const c = { feverGauge: 0, feverLeft: 0, feverCount: 0 };
  const out = applyFeverProgress(c, true, false);
  assert.equal(c.feverGauge, FEVER_GAIN);
  assert.deepEqual(out, { started: false, ended: false });
});

test("applyFeverProgress: ゲージがFEVER_MAXに到達するとフィーバー開始（started=true, feverLeft=FEVER_TURNS, feverCount++）", () => {
  const c = { feverGauge: FEVER_MAX - FEVER_GAIN, feverLeft: 0, feverCount: 0 };
  const out = applyFeverProgress(c, true, false);
  assert.equal(c.feverGauge, 0);
  assert.equal(c.feverLeft, FEVER_TURNS);
  assert.equal(c.feverCount, 1);
  assert.equal(out.started, true);
});

test("applyFeverProgress: 不正解でゲージが FEVER_MISS_LOSS 分減り、下限は0でクランプされる", () => {
  const c = { feverGauge: 10, feverLeft: 0, feverCount: 0 };
  const out = applyFeverProgress(c, false, false);
  assert.equal(c.feverGauge, 0); // 10 - 15 は負になるため 0 クランプ
  assert.deepEqual(out, { started: false, ended: false });
});

test("applyFeverProgress: フィーバー中は正誤に関わらず feverLeft がデクリメントされ、0で ended=true になる", () => {
  const c = { feverGauge: 0, feverLeft: 2, feverCount: 1 };
  let out = applyFeverProgress(c, true, true);
  assert.equal(c.feverLeft, 1);
  assert.equal(out.ended, false);
  out = applyFeverProgress(c, false, true); // 不正解でもフィーバー中はデクリメントのみ
  assert.equal(c.feverLeft, 0);
  assert.equal(out.ended, true);
});

test("bossWeakRemain: combo に応じて弱点攻撃までの残り正解数が3,2,1,3と循環する", () => {
  assert.equal(bossWeakRemain({ combo: 0 }), 3);
  assert.equal(bossWeakRemain({ combo: 1 }), 2);
  assert.equal(bossWeakRemain({ combo: 2 }), 1);
  assert.equal(bossWeakRemain({ combo: 3 }), 3);
});

test("bossWeakRemain: combo 未設定(undefined)は0扱いで残り3", () => {
  assert.equal(bossWeakRemain({}), 3);
});
