#!/usr/bin/env node
/* tools/make-fixtures.mjs
   data/index.js の問題データから、単元ごとの「問題digest列」を
   tests/fixtures/question-digests.json に書き出す恒久スクリプト。

   qStats キーは "単元ID-配列インデックス" という位置ベースのキーなので、
   既存位置の問題を並び替え・挿入・改変すると学習履歴が壊れる（CLAUDE.md 参照）。
   このスクリプトは「末尾追加のみ」を自動でマージし、既存位置のdigestが
   変化する場合はエラーで拒否する（意図的な変更なら --force を付けて再生成する）。

   使い方:
     node tools/make-fixtures.mjs          # 通常更新（append-only 検証つき）
     node tools/make-fixtures.mjs --force  # 初回生成 / 意図的な再生成
*/
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FIXTURE_PATH = path.join(ROOT, "tests", "fixtures", "question-digests.json");

const force = process.argv.includes("--force");

function digestOf(q) {
  return createHash("sha256").update(JSON.stringify(q)).digest("hex").slice(0, 8);
}

const { units } = await import(pathToFileURL(path.join(ROOT, "data", "index.js")).href);

const current = {};
for (const u of units) {
  current[u.id] = u.questions.map(digestOf);
}

let existing = {};
if (existsSync(FIXTURE_PATH)) {
  existing = JSON.parse(readFileSync(FIXTURE_PATH, "utf8"));
}

if (!force) {
  const errors = [];
  for (const [id, oldDigests] of Object.entries(existing)) {
    if (!(id in current)) {
      errors.push(
        `単元 "${id}" が data/ から見つかりません（削除された？）。意図的な削除であれば --force を付けて再生成してください。`
      );
      continue;
    }
    const newDigests = current[id];
    const isPrefix =
      oldDigests.length <= newDigests.length &&
      oldDigests.every((d, i) => d === newDigests[i]);
    if (!isPrefix) {
      errors.push(
        `単元 "${id}": 既存位置の問題の digest が変化しています（並び替え・途中挿入・改変の疑い）。` +
          `意図的な変更であれば --force を付けて再生成してください。`
      );
    }
  }
  if (errors.length) {
    console.error("fixture の更新を拒否しました:\n" + errors.map((e) => "  - " + e).join("\n"));
    process.exit(1);
  }
}

// 検証済み（force時は無条件）なので、現行データで上書き・新単元も自動追加する。
// force時は data/ から消えた単元のfixtureエントリも一緒に消える。
const merged = force ? current : { ...existing, ...current };

mkdirSync(path.dirname(FIXTURE_PATH), { recursive: true });
writeFileSync(FIXTURE_PATH, JSON.stringify(merged, null, 2) + "\n");

const unitCount = Object.keys(merged).length;
const questionCount = Object.values(merged).reduce((n, arr) => n + arr.length, 0);
console.log(
  `fixture を${force ? "再生成" : "更新"}しました: ${FIXTURE_PATH}\n  単元数: ${unitCount} / 問題数: ${questionCount}`
);
