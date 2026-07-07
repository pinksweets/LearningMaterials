#!/usr/bin/env node
/* ============================================================
   data/ ESM 移行の突合検証スクリプト（恒久保管）

   旧アーキテクチャ（js/registry.js の window.HQ 自己登録 + classic
   <script> の data/*.js）と、新アーキテクチャ（data/_registry.js の
   モジュールローカル registry シム + data/index.js）が生成する
   units / cards が完全に一致することを検証する。

   使い方:
     node tools/verify-data-migration.mjs [ベースgit ref]
     （省略時は origin/main）
============================================================ */
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_REF = process.argv[2] || "origin/main";

/* 旧 index.html の <script> 読み込み順（js/registry.js の直後） */
const OLD_DATA_FILES = [
  "data/s1_versailles.js",
  "data/s2_asia.js",
  "data/s3_eastasia.js",
  "data/m1_suushiki.js",
  "data/m2_shuugou.js",
  "data/m3_nijikansuu.js",
  "data/e1_harmony_wordorder.js",
  "data/e2_harmony_tense.js",
  "data/b1_visual_metabolism.js",
  "data/b2_visual_enzymes.js",
  "data/ec1_denki_kairo1.js",
  "data/ma1_suugaku_a.js",
];

function gitRepoRoot() {
  return execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: __dirname,
    encoding: "utf8",
  }).trim();
}

const REPO_ROOT = gitRepoRoot();

function gitShow(ref, relPath) {
  return execFileSync("git", ["show", `${ref}:${relPath}`], {
    cwd: REPO_ROOT,
    maxBuffer: 64 * 1024 * 1024,
    encoding: "utf8",
  });
}

function loadOldData(ref) {
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);

  const registryCode = gitShow(ref, "js/registry.js");
  vm.runInContext(registryCode, sandbox, { filename: "js/registry.js" });

  for (const rel of OLD_DATA_FILES) {
    const code = gitShow(ref, rel);
    vm.runInContext(code, sandbox, { filename: rel });
  }

  return { units: sandbox.HQ.units, cards: sandbox.HQ.cards };
}

async function loadNewData() {
  const mod = await import(new URL("../data/index.js", import.meta.url));
  return { units: mod.units, cards: mod.sharedCards };
}

/* ---------- JSON-safe 検査 ----------
   許容: string / finite number / boolean / null / 配列 / プレーンオブジェクト。
   undefined・関数・NaN/Infinity・その他の型を見つけたら最初のパスを返す。 */
function findJsonUnsafe(value, pathStr) {
  if (value === null) return null;
  const t = typeof value;
  if (t === "string" || t === "boolean") return null;
  if (t === "number") {
    return Number.isFinite(value) ? null : `${pathStr}: 非finite数値 (${value})`;
  }
  if (t === "undefined") return `${pathStr}: undefined`;
  if (t === "function") return `${pathStr}: 関数`;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const bad = findJsonUnsafe(value[i], `${pathStr}[${i}]`);
      if (bad) return bad;
    }
    return null;
  }
  if (t === "object") {
    // realm をまたぐ可能性がある（vm.createContext のサンドボックスは別 realm）ため、
    // 自プロセスの Object.prototype との === 比較ではなく、プロトタイプチェーンの
    // 深さで判定する（プレーンオブジェクトの proto は「プロトタイプが null になる
    // Object.prototype 相当」そのもの）。
    const proto = Object.getPrototypeOf(value);
    const isPlain = proto === null || Object.getPrototypeOf(proto) === null;
    if (!isPlain) {
      return `${pathStr}: プレーンオブジェクトではない (${(proto && proto.constructor && proto.constructor.name) || "unknown"})`;
    }
    for (const k of Object.keys(value)) {
      const bad = findJsonUnsafe(value[k], `${pathStr}.${k}`);
      if (bad) return bad;
    }
    return null;
  }
  return `${pathStr}: 未対応の型 (${t})`;
}

/* ---------- 最初に食い違うパスを探すヘルパ ----------
   JSON-safe な値同士（プリミティブ/配列/プレーンオブジェクトのみ）を前提とする。 */
function findFirstDiff(a, b, pathStr) {
  if (a === b) return null;
  const ta = a === null ? "null" : typeof a;
  const tb = b === null ? "null" : typeof b;
  if (ta !== tb) {
    return `${pathStr}: 型不一致 (new=${ta}, old=${tb})`;
  }
  if (ta !== "object") {
    return `${pathStr}: 値不一致 (new=${JSON.stringify(a)}, old=${JSON.stringify(b)})`;
  }
  const aIsArr = Array.isArray(a);
  const bIsArr = Array.isArray(b);
  if (aIsArr !== bIsArr) {
    return `${pathStr}: 配列/オブジェクトの型不一致`;
  }
  if (aIsArr) {
    if (a.length !== b.length) {
      return `${pathStr}: 配列長不一致 (new=${a.length}, old=${b.length})`;
    }
    for (let i = 0; i < a.length; i++) {
      const bad = findFirstDiff(a[i], b[i], `${pathStr}[${i}]`);
      if (bad) return bad;
    }
    return null;
  }
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.join(",") !== bKeys.join(",")) {
    return `${pathStr}: キー不一致 (new=[${aKeys.join(",")}], old=[${bKeys.join(",")}])`;
  }
  for (const k of aKeys) {
    const bad = findFirstDiff(a[k], b[k], `${pathStr}.${k}`);
    if (bad) return bad;
  }
  return null;
}

function toJsonSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function questionCount(units) {
  return units.reduce((sum, u) => sum + (u.questions ? u.questions.length : 0), 0);
}

function qStatsKeySet(units) {
  const set = new Set();
  for (const u of units) {
    const qs = u.questions || [];
    qs.forEach((_, idx) => set.add(`${u.id}-${idx}`));
  }
  return set;
}

async function main() {
  console.log(`ベース ref: ${BASE_REF}`);
  console.log(`リポジトリルート: ${REPO_ROOT}`);
  console.log("");

  const old = loadOldData(BASE_REF);
  const neu = await loadNewData();

  const errors = [];

  /* --- JSON-safe 検査（両方） --- */
  old.units.forEach((u, i) => {
    const bad = findJsonUnsafe(u, `old.units[${i}]${u && u.id ? `(${u.id})` : ""}`);
    if (bad) errors.push(`旧データがJSON-safeではない: ${bad}`);
  });
  neu.units.forEach((u, i) => {
    const bad = findJsonUnsafe(u, `new.units[${i}]${u && u.id ? `(${u.id})` : ""}`);
    if (bad) errors.push(`新データがJSON-safeではない: ${bad}`);
  });
  {
    const bad = findJsonUnsafe(old.cards, "old.cards");
    if (bad) errors.push(`旧共有cardsがJSON-safeではない: ${bad}`);
  }
  {
    const bad = findJsonUnsafe(neu.cards, "new.cards");
    if (bad) errors.push(`新共有cardsがJSON-safeではない: ${bad}`);
  }

  if (errors.length) {
    console.error("--- JSON-safe 検査で異常を検出 ---");
    errors.forEach((e) => console.error(`❌ ${e}`));
    console.log("\n判定: 失敗 ❌");
    process.exit(1);
  }

  /* --- ここ以降は JSON-safe な複製のみを使う ---
     old.units / old.cards は node:vm の別 realm 由来オブジェクトのため、
     Array.prototype 等が現realmのものと === にならず、素の
     assert.deepStrictEqual が「構造は同じでも realm が違う」ことをもって
     不一致と誤判定してしまう（strict モードは [[Prototype]] を === で見る）。
     toJsonSafe(配列全体) を1回だけ呼ぶことで、要素だけでなく配列コンテナ自体も
     現realmの素の配列として再構築する（.map(toJsonSafe) のように要素単位で
     変換すると、コンテナ配列自体は species creation により元realmの Array の
     ままになってしまうため、これは避ける）。 */
  const oldUnits = toJsonSafe(old.units);
  const newUnits = toJsonSafe(neu.units);
  const oldSharedCards = toJsonSafe(old.cards);
  const newSharedCards = toJsonSafe(neu.cards);

  /* --- units 配列長の一致 --- */
  if (oldUnits.length !== newUnits.length) {
    errors.push(`単元数不一致: new=${newUnits.length}, old=${oldUnits.length}`);
  }

  /* --- 各インデックスで deepStrictEqual --- */
  const len = Math.min(oldUnits.length, newUnits.length);
  for (let i = 0; i < len; i++) {
    const oldU = oldUnits[i];
    const newU = newUnits[i];
    try {
      assert.deepStrictEqual(newU, oldU);
    } catch {
      const diffPath = findFirstDiff(newU, oldU, `units[${i}]`);
      errors.push(
        `単元不一致: index=${i}, id(new)=${newU && newU.id}, id(old)=${oldU && oldU.id}, 差異=${diffPath || "(検出不能)"}`
      );
    }
  }

  /* --- STAGE_ORDER 相当の一致 --- */
  const oldOrder = oldUnits
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((u) => u.id);
  const newOrder = newUnits
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((u) => u.id);
  try {
    assert.deepStrictEqual(newOrder, oldOrder);
  } catch {
    errors.push(
      `STAGE_ORDER不一致: new=[${newOrder.join(",")}] old=[${oldOrder.join(",")}]`
    );
  }

  /* --- qStats 有効キー集合の一致 --- */
  const oldKeys = qStatsKeySet(oldUnits);
  const newKeys = qStatsKeySet(newUnits);
  const missingInNew = [...oldKeys].filter((k) => !newKeys.has(k));
  const extraInNew = [...newKeys].filter((k) => !oldKeys.has(k));
  if (missingInNew.length || extraInNew.length) {
    errors.push(
      `qStatsキー不一致: 欠落=${missingInNew.length}件 [${missingInNew.slice(0, 5).join(",")}], 余剰=${extraInNew.length}件 [${extraInNew.slice(0, 5).join(",")}]`
    );
  }

  /* --- CARDS 相当（units 由来 cards を登録順に連結 + 共有 cards）の一致 --- */
  const oldCardsFromUnits = oldUnits.flatMap((u) => u.cards || []);
  const newCardsFromUnits = newUnits.flatMap((u) => u.cards || []);
  const oldCardsAll = [...oldCardsFromUnits, ...oldSharedCards];
  const newCardsAll = [...newCardsFromUnits, ...newSharedCards];
  try {
    assert.deepStrictEqual(newCardsAll, oldCardsAll);
  } catch {
    const diffPath = findFirstDiff(newCardsAll, oldCardsAll, "cards");
    errors.push(`CARDS不一致: 差異=${diffPath || "(検出不能)"}`);
  }

  /* --- 総問題数の一致 --- */
  const oldTotalQ = questionCount(oldUnits);
  const newTotalQ = questionCount(newUnits);
  if (oldTotalQ !== newTotalQ) {
    errors.push(`総問題数不一致: new=${newTotalQ}, old=${oldTotalQ}`);
  }

  /* --- サマリ表示 --- */
  console.log("=== 検証サマリ ===");
  console.log(`単元数:                 old=${oldUnits.length} / new=${newUnits.length}`);
  console.log(`総問題数:               old=${oldTotalQ} / new=${newTotalQ}`);
  console.log(`カード数（単元由来）:   old=${oldCardsFromUnits.length} / new=${newCardsFromUnits.length}`);
  console.log(`カード数（共有）:       old=${oldSharedCards.length} / new=${newSharedCards.length}`);
  console.log(`カード数（合計）:       old=${oldCardsAll.length} / new=${newCardsAll.length}`);
  console.log("");

  if (errors.length) {
    console.error("--- 不一致 ---");
    errors.forEach((e) => console.error(`❌ ${e}`));
    console.log("\n判定: 失敗 ❌");
    process.exit(1);
  }

  console.log("判定: 完全一致 ✅");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
