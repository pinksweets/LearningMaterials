import { test } from "node:test";
import assert from "node:assert/strict";
import { units } from "../data/index.js";
import { CARD_BY_ID } from "../js/content.js";

const TYPES = ["yon", "maru", "ana", "kumi", "nenpyo", "suji", "fill", "junban"];

test("units: id は非空文字列・ハイフンを含まない・全単元で一意", () => {
  const seen = new Set();
  for (const u of units) {
    assert.equal(typeof u.id, "string", `unit.id が文字列でない: ${JSON.stringify(u.id)}`);
    assert.ok(u.id.length > 0, "unit.id が空文字列");
    assert.ok(!u.id.includes("-"), `単元ID にハイフンを含めない規約に違反: "${u.id}"`);
    assert.ok(!seen.has(u.id), `単元IDが重複している: "${u.id}"`);
    seen.add(u.id);
  }
});

test("units: order は number かつ一意。title/desc は非空文字列", () => {
  const orders = units.map((u) => u.order);
  for (const u of units) {
    assert.equal(typeof u.order, "number", `${u.id}: order が number でない`);
    assert.equal(typeof u.title, "string", `${u.id}: title が文字列でない`);
    assert.ok(u.title.length > 0, `${u.id}: title が空`);
    assert.equal(typeof u.desc, "string", `${u.id}: desc が文字列でない`);
    assert.ok(u.desc.length > 0, `${u.id}: desc が空`);
  }
  assert.equal(new Set(orders).size, orders.length, "order に重複がある");
});

test("units: questions は非空配列。各問題は type が既知の8種、exp は非空文字列", () => {
  for (const u of units) {
    assert.ok(Array.isArray(u.questions), `${u.id}: questions が配列でない`);
    assert.ok(u.questions.length > 0, `${u.id}: questions が空`);
    u.questions.forEach((q, idx) => {
      const where = `${u.id}[${idx}]`;
      assert.ok(TYPES.includes(q.type), `${where}: 未知の type "${q.type}"`);
      assert.equal(typeof q.exp, "string", `${where}: exp が文字列でない`);
      assert.ok(q.exp.length > 0, `${where}: exp が空`);
    });
  }
});

test("units: 問題タイプ別の形状（yon/ana=choices+a範囲内, maru=boolean, kumi=pairs, nenpyo=items年昇順, suji=文字列配列, fill=blanks/a同長, junban=steps+aは順列）", () => {
  for (const u of units) {
    u.questions.forEach((q, idx) => {
      const where = `${u.id}[${idx}] (${q.type})`;
      switch (q.type) {
        case "yon":
        case "ana": {
          assert.ok(Array.isArray(q.choices) && q.choices.length >= 2, `${where}: choices が2択以上の配列でない`);
          assert.ok(
            Number.isInteger(q.a) && q.a >= 0 && q.a < q.choices.length,
            `${where}: a(${q.a}) が choices の範囲内の整数でない`
          );
          break;
        }
        case "maru": {
          assert.equal(typeof q.a, "boolean", `${where}: a が boolean でない`);
          break;
        }
        case "kumi": {
          assert.ok(Array.isArray(q.pairs) && q.pairs.length > 0, `${where}: pairs が非空配列でない`);
          q.pairs.forEach((p, pi) => {
            assert.equal(typeof p.l, "string", `${where}: pairs[${pi}].l が文字列でない`);
            assert.equal(typeof p.r, "string", `${where}: pairs[${pi}].r が文字列でない`);
          });
          break;
        }
        case "nenpyo": {
          assert.ok(Array.isArray(q.items) && q.items.length > 0, `${where}: items が非空配列でない`);
          q.items.forEach((it, ii) => {
            assert.equal(typeof it.t, "string", `${where}: items[${ii}].t が文字列でない`);
            assert.equal(typeof it.year, "number", `${where}: items[${ii}].year が number でない`);
          });
          const years = q.items.map((it) => it.year);
          const sorted = [...years].sort((a, b) => a - b);
          assert.deepEqual(years, sorted, `${where}: items が year 昇順で並んでいない（表示・正解判定の前提）`);
          break;
        }
        case "suji": {
          // 実データ調査: a は許容解1〜2件の「文字列配列」（数値ではない）。
          assert.ok(Array.isArray(q.a) && q.a.length > 0, `${where}: a が非空配列でない`);
          q.a.forEach((v, vi) => {
            assert.equal(typeof v, "string", `${where}: a[${vi}] が文字列でない`);
          });
          break;
        }
        case "fill": {
          assert.ok(Array.isArray(q.blanks), `${where}: blanks が配列でない`);
          assert.ok(Array.isArray(q.a), `${where}: a が配列でない`);
          assert.equal(q.blanks.length, q.a.length, `${where}: blanks と a の長さが一致しない`);
          break;
        }
        case "junban": {
          assert.ok(Array.isArray(q.steps) && q.steps.length > 0, `${where}: steps が非空配列でない`);
          assert.ok(Array.isArray(q.a) && q.a.length === q.steps.length, `${where}: a の長さが steps と一致しない`);
          const sortedA = [...q.a].sort((x, y) => x - y);
          const identity = q.steps.map((_, i) => i);
          assert.deepEqual(sortedA, identity, `${where}: a が steps インデックスの順列になっていない`);
          break;
        }
      }
    });
  }
});

test("units: q.card（文字列 or 配列）と単元 cards の id が CARD_BY_ID で解決できる", () => {
  for (const u of units) {
    (u.cards || []).forEach((c) => {
      assert.ok(CARD_BY_ID[c.id], `${u.id}: 単元cards の "${c.id}" が CARD_BY_ID に登録されていない`);
    });
    u.questions.forEach((q, idx) => {
      if (q.card === undefined) return;
      const list = Array.isArray(q.card) ? q.card : [q.card];
      list.forEach((cid) => {
        assert.equal(typeof cid, "string", `${u.id}[${idx}]: q.card の要素が文字列でない`);
        assert.ok(CARD_BY_ID[cid], `${u.id}[${idx}]: q.card "${cid}" が CARD_BY_ID で解決できない`);
      });
    });
  }
});

test("合計件数の固定スナップショット（単元309・問題6242・カード93）— 意図的な増減ならこの数値を更新すること", () => {
  assert.equal(units.length, 309, "単元数が想定と異なる");
  const totalQuestions = units.reduce((n, u) => n + u.questions.length, 0);
  assert.equal(totalQuestions, 6242, "問題総数が想定と異なる");
  assert.equal(Object.keys(CARD_BY_ID).length, 93, "カード総数（重複除去後）が想定と異なる");
});
