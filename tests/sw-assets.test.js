/* tests/sw-assets.test.js — Service Worker のプリキャッシュ網羅性チェック
   sw.js は js/data/css/icons 配下のアセットを追加・削除したら ASSETS を
   更新する運用ルール（CLAUDE.md）になっている。このテストは ASSETS の集合と
   実ファイル一覧を突き合わせ、更新漏れ（過不足）を検出する。
   契約: sw.js に `const CACHE_NAME = '...';` と
        `const ASSETS = [ './xxx', ... ];`（単純文字列リテラル配列）がある。 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function listJsRecursive(dir, prefix) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      out.push(...listJsRecursive(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith(".js")) {
      out.push(rel);
    }
  }
  return out;
}

test("sw.js の ASSETS が、キャッシュすべき全アセットと過不足なく一致する", () => {
  const swPath = path.join(ROOT, "sw.js");
  assert.ok(
    existsSync(swPath),
    "sw.js が存在しません（PWA構築が未完了の可能性。担当エージェントの完了後に再実行してください）"
  );
  const src = readFileSync(swPath, "utf8");

  assert.match(
    src,
    /const\s+CACHE_NAME\s*=\s*['"][^'"]+['"]/,
    "sw.js に `const CACHE_NAME = '...';` が見つからない"
  );

  const assetsMatch = src.match(/const\s+ASSETS\s*=\s*\[([\s\S]*?)\];/);
  assert.ok(assetsMatch, "sw.js に `const ASSETS = [...];` が見つからない");
  const assets = new Set([...assetsMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]));

  const expected = new Set(["./", "./index.html", "./manifest.webmanifest", "./css/style.css"]);

  const iconsDir = path.join(ROOT, "icons");
  if (existsSync(iconsDir)) {
    for (const entry of readdirSync(iconsDir, { withFileTypes: true })) {
      if (entry.isFile()) expected.add(`./icons/${entry.name}`);
    }
  }

  const jsDir = path.join(ROOT, "js");
  for (const rel of listJsRecursive(jsDir, "")) {
    expected.add(`./js${rel}`);
  }

  const dataDir = path.join(ROOT, "data");
  for (const entry of readdirSync(dataDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".js")) expected.add(`./data/${entry.name}`);
  }

  const missing = [...expected].filter((a) => !assets.has(a)).sort();
  const extra = [...assets].filter((a) => !expected.has(a)).sort();
  assert.deepEqual({ missing, extra }, { missing: [], extra: [] });
});
