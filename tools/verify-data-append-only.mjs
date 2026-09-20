#!/usr/bin/env node
/* ============================================================
   data/ の「既存問題は無改変・追加は末尾のみ」を git の任意 ref と突合する恒久ツール

   CLAUDE.md の制約3（qStats キーは位置ベース：並べ替え・途中挿入禁止、追加は末尾のみ）と
   制約4（既存の問題データは改変しない）を、ハッシュではなく実データで検証し、
   食い違いがあれば「最初に食い違ったパス」を表示する（digest fixture が失敗したときの診断にも使う）。

   仕組み：`git archive <ref> data` で旧 data/ を一時ディレクトリに展開し、
   旧新それぞれの data/index.js を import() して units / sharedCards を比較する（両方 ESM）。

   使い方:
     node tools/verify-data-append-only.mjs            # 省略時は origin/main と比較
     node tools/verify-data-append-only.mjs HEAD~1      # 直前コミットと比較
     node tools/verify-data-append-only.mjs <任意のref>

   判定:
     ・旧にある単元 ID は新にも存在する（削除・改名は不一致）
     ・旧の questions は新の questions の先頭部分と完全一致する（末尾追加のみ許容）
     ・旧の単元の id/subject/group/title/desc/order/page と cards は完全一致する
       （title や desc の修正は「意図的な変更」として ref を進めてから再実行する）
     ・新規の単元・ファイルは無条件で許容し、件数を表示する
     ・旧新とも JSON-safe（undefined・関数・NaN を含まない）であること
============================================================ */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_REF = process.argv[2] || "origin/main";
const REPO_ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: __dirname, encoding: "utf8" }).trim();

/* 旧 data/ を一時ディレクトリへ展開して import する */
async function loadOldData(ref) {
  const dir = mkdtempSync(path.join(tmpdir(), "lq-data-"));
  try {
    execFileSync("sh", ["-c", `git archive "${ref}" data | tar -x -C "${dir}"`], { cwd: REPO_ROOT, stdio: ["ignore", "ignore", "pipe"] });
  } catch (e) {
    rmSync(dir, { recursive: true, force: true });
    throw new Error(`ref "${ref}" の data/ を取り出せません（ref が存在しないか、shallow clone の可能性）: ${String(e.stderr || e.message).trim()}`);
  }
  try {
    const indexPath = path.join(dir, "data", "index.js");
    if (!existsSync(indexPath)) throw new Error(`ref "${ref}" の data/ に index.js がありません（data/ ESM 化（1235a6f）より前の ref は比較対象外）`);
    const mod = await import(pathToFileURL(indexPath).href);
    return { units: toJsonSafe(mod.units), cards: toJsonSafe(mod.sharedCards) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
async function loadNewData() {
  const mod = await import(new URL("../data/index.js", import.meta.url));
  return { units: toJsonSafe(mod.units), cards: toJsonSafe(mod.sharedCards) };
}

/* ---------- JSON-safe 検査（undefined・関数・非finite数値を見つけたら最初のパスを返す） ---------- */
function findJsonUnsafe(value, p) {
  if (value === null) return null;
  const t = typeof value;
  if (t === "string" || t === "boolean") return null;
  if (t === "number") return Number.isFinite(value) ? null : `${p}: 非finite数値 (${value})`;
  if (t === "undefined") return `${p}: undefined`;
  if (t === "function") return `${p}: 関数`;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) { const bad = findJsonUnsafe(value[i], `${p}[${i}]`); if (bad) return bad; }
    return null;
  }
  if (t === "object") {
    for (const k of Object.keys(value)) { const bad = findJsonUnsafe(value[k], `${p}.${k}`); if (bad) return bad; }
    return null;
  }
  return `${p}: 未対応の型 (${t})`;
}
/* JSON-safe 検査は import 直後の生オブジェクトに対して行う（toJsonSafe は undefined キーを落とすため）。
   旧データは当時のテストで検査済みなので、生値の検査は新データのみ行う。 */
function toJsonSafe(value) { return JSON.parse(JSON.stringify(value)); }

/* ---------- 最初に食い違うパスを探す ---------- */
function findFirstDiff(a, b, p) {
  if (a === b) return null;
  const ta = a === null ? "null" : typeof a, tb = b === null ? "null" : typeof b;
  if (ta !== tb) return `${p}: 型不一致 (new=${ta}, old=${tb})`;
  if (ta !== "object") return `${p}: 値不一致 (new=${JSON.stringify(a)}, old=${JSON.stringify(b)})`;
  if (Array.isArray(a) !== Array.isArray(b)) return `${p}: 配列/オブジェクトの型不一致`;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return `${p}: 配列長不一致 (new=${a.length}, old=${b.length})`;
    for (let i = 0; i < a.length; i++) { const bad = findFirstDiff(a[i], b[i], `${p}[${i}]`); if (bad) return bad; }
    return null;
  }
  const ak = Object.keys(a).sort(), bk = Object.keys(b).sort();
  if (ak.join(",") !== bk.join(",")) return `${p}: キー不一致 (new=[${ak.join(",")}], old=[${bk.join(",")}])`;
  for (const k of ak) { const bad = findFirstDiff(a[k], b[k], `${p}.${k}`); if (bad) return bad; }
  return null;
}

const META_KEYS = ["id", "subject", "group", "title", "desc", "order", "page", "cards"];

async function main() {
  console.log(`ベース ref: ${BASE_REF}`);
  console.log(`リポジトリルート: ${REPO_ROOT}\n`);

  const rawNew = await import(new URL("../data/index.js", import.meta.url));
  const errors = [];
  rawNew.units.forEach((u, i) => { const bad = findJsonUnsafe(u, `new.units[${i}]${u && u.id ? `(${u.id})` : ""}`); if (bad) errors.push(`新データがJSON-safeではない: ${bad}`); });
  { const bad = findJsonUnsafe(rawNew.sharedCards, "new.sharedCards"); if (bad) errors.push(`新共有cardsがJSON-safeではない: ${bad}`); }

  const old = await loadOldData(BASE_REF);
  const neu = await loadNewData();
  const newById = new Map(neu.units.map((u) => [u.id, u]));
  const oldIds = new Set(old.units.map((u) => u.id));

  let appended = 0;
  for (const [i, ou] of old.units.entries()) {
    const nu = newById.get(ou.id);
    if (!nu) { errors.push(`単元が消えている: ${ou.id}（旧 index=${i}）— 削除・改名は qStats キーを失わせる`); continue; }
    for (const k of META_KEYS) {
      const bad = findFirstDiff(nu[k], ou[k], `${ou.id}.${k}`);
      if (bad) errors.push(`単元メタ情報の変更: ${bad}`);
    }
    const oq = ou.questions || [], nq = nu.questions || [];
    if (nq.length < oq.length) { errors.push(`問題が減っている: ${ou.id}（old=${oq.length}, new=${nq.length}）`); continue; }
    for (let j = 0; j < oq.length; j++) {
      const bad = findFirstDiff(nq[j], oq[j], `${ou.id}.questions[${j}]`);
      if (bad) { errors.push(`既存問題の改変または途中挿入・並べ替え: ${bad}`); break; }
    }
    appended += nq.length - oq.length;
  }
  {
    const bad = findFirstDiff(neu.cards, old.cards, "sharedCards");
    if (bad) errors.push(`共有cardsの変更: ${bad}`);
  }
  const newUnits = neu.units.filter((u) => !oldIds.has(u.id));
  const count = (units) => units.reduce((n, u) => n + (u.questions ? u.questions.length : 0), 0);

  console.log("=== 検証サマリ ===");
  console.log(`単元数:       old=${old.units.length} / new=${neu.units.length}（新規 ${newUnits.length}）`);
  console.log(`総問題数:     old=${count(old.units)} / new=${count(neu.units)}（既存単元への末尾追加 ${appended} 問、新規単元 ${count(newUnits)} 問）`);
  if (newUnits.length) console.log(`新規単元:     ${newUnits.map((u) => u.id).join(", ")}`);
  console.log("");

  if (errors.length) {
    console.error("--- 不一致 ---");
    errors.forEach((e) => console.error(`❌ ${e}`));
    console.log("\n判定: 失敗 ❌（意図的な変更なら、その変更をコミットした ref を指定して再実行する）");
    process.exit(1);
  }
  console.log("判定: 既存問題は無改変・追加は末尾のみ ✅");
}

main().catch((err) => { console.error(`❌ ${err.message || err}`); process.exit(1); });
