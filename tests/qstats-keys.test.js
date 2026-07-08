/* tests/qstats-keys.test.js — 位置ベース qStats キー（"単元ID-配列インデックス"）の恒久ガード
   学習履歴は問題の「並び順」に依存して保存されるため、既存問題の並び替え・
   途中挿入・改変を検出する。新しい単元の追加・既存単元への末尾追加のみ許容する。
   fixture は tools/make-fixtures.mjs で生成・更新する（tests/fixtures/question-digests.json）。 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { units } from "../data/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.join(__dirname, "fixtures", "question-digests.json");

function digestOf(q) {
  return createHash("sha256").update(JSON.stringify(q)).digest("hex").slice(0, 8);
}

const fixture = JSON.parse(readFileSync(FIXTURE_PATH, "utf8"));

const current = {};
for (const u of units) {
  current[u.id] = u.questions.map(digestOf);
}

test("qstats-keys: fixture に記録された単元は現行データにも存在する（消えていたら意図確認）", () => {
  for (const id of Object.keys(fixture)) {
    assert.ok(
      id in current,
      `単元 "${id}" が data/ から消えています。意図的な削除であれば、` +
        `tools/make-fixtures.mjs --force で fixture(tests/fixtures/question-digests.json) を更新してください。`
    );
  }
});

test("qstats-keys: 既存位置の問題digestが変化していない（並び替え・途中挿入・改変の検出。末尾追加のみ許容）", () => {
  for (const [id, oldDigests] of Object.entries(fixture)) {
    if (!(id in current)) continue; // 消失は上のテストで検出済み
    const newDigests = current[id];
    assert.ok(
      newDigests.length >= oldDigests.length,
      `単元 "${id}": 問題数が fixture 時点より減少している（末尾削除は禁止）`
    );
    oldDigests.forEach((d, i) => {
      assert.equal(
        newDigests[i],
        d,
        `単元 "${id}" の ${i}番目の問題（qStatsキー "${id}-${i}"）が変化した可能性` +
          `（並び替え・途中挿入・問題文改変はSRS学習履歴を壊すため禁止）`
      );
    });
  }
});

test("qstats-keys: 現行データの全単元が fixture に記録されている", () => {
  for (const id of Object.keys(current)) {
    assert.ok(
      id in fixture,
      `単元 "${id}" が fixture に未記録。tools/make-fixtures.mjs を実行して反映してください。`
    );
  }
});
