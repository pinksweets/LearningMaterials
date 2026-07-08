/* tests/architecture.test.js — CLAUDE.md「モジュール層規約」の静的固定テスト
   依存は一方向 data/* → js/content.js → js/state.js → js/audio.js → js/views/* → js/main.js。
   ソースを文字列として静的解析するだけで、実行は伴わない。 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function readSrc(relPath) {
  return readFileSync(path.join(ROOT, relPath), "utf8");
}

function extractImports(src) {
  const re = /^import\s.*?from\s*["']([^"']+)["'];?\s*$/gm;
  const out = [];
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

/* views/*.js のトップレベルが「import と export function 宣言（＋コメント）のみ」であることを検査。
   brace深度0の行に、それ以外の実行文・const/let/var宣言が無いことを確認する。
   （文字列/テンプレートリテラル内の中括弧も素朴にカウントするが、現行ファイルでは
   トップレベルが関数本体の外に出ないため、この単純な方式で十分な検出力がある） */
function findTopLevelOffenders(src) {
  const lines = src.split("\n");
  let depth = 0;
  let inBlockComment = false;
  const offenders = [];
  for (const rawLine of lines) {
    let line = rawLine;
    if (inBlockComment) {
      const end = line.indexOf("*/");
      if (end === -1) continue;
      line = line.slice(end + 2);
      inBlockComment = false;
    }
    const trimmed = line.trim();
    if (depth === 0) {
      if (trimmed === "") {
        // ok: 空行
      } else if (trimmed.startsWith("//")) {
        // ok: 行コメント
      } else if (trimmed.startsWith("/*")) {
        const end = trimmed.indexOf("*/", 2);
        if (end === -1) inBlockComment = true;
      } else if (trimmed.startsWith("import ")) {
        // ok: import宣言
      } else if (trimmed.startsWith("export function")) {
        // ok: 関数宣言（巻き上げにより循環import同士でも安全に成立する）
      } else {
        offenders.push(trimmed.slice(0, 80));
      }
    }
    for (const ch of line) {
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
    }
  }
  return offenders;
}

test("leaf モジュール（utils/answers/timer/fever）は他モジュールを import しない", () => {
  for (const f of ["js/utils.js", "js/answers.js", "js/timer.js", "js/fever.js"]) {
    const imports = extractImports(readSrc(f));
    assert.deepEqual(imports, [], `${f} は import 0件のはずが: ${JSON.stringify(imports)}`);
  }
});

test("js/content.js は ../data/index.js のみを import する", () => {
  const imports = extractImports(readSrc("js/content.js"));
  assert.deepEqual(imports, ["../data/index.js"]);
});

test("js/state.js は ./content.js と ./utils.js のみを import する", () => {
  const imports = new Set(extractImports(readSrc("js/state.js")));
  assert.deepEqual(imports, new Set(["./content.js", "./utils.js"]));
});

test("js/audio.js は ./state.js と ./utils.js のみを import する", () => {
  const imports = new Set(extractImports(readSrc("js/audio.js")));
  assert.deepEqual(imports, new Set(["./state.js", "./utils.js"]));
});

test("js/views/*.js は ../main.js を import しない", () => {
  const viewsDir = path.join(ROOT, "js", "views");
  for (const file of readdirSync(viewsDir)) {
    if (!file.endsWith(".js")) continue;
    const imports = extractImports(readSrc(`js/views/${file}`));
    assert.ok(
      !imports.some((i) => i.endsWith("/main.js") || i === "main.js"),
      `js/views/${file} が main.js を import している: ${JSON.stringify(imports)}`
    );
  }
});

test("js/views/*.js のトップレベルは import・export function宣言・コメントのみで構成される", () => {
  const viewsDir = path.join(ROOT, "js", "views");
  for (const file of readdirSync(viewsDir)) {
    if (!file.endsWith(".js")) continue;
    const src = readSrc(`js/views/${file}`);
    const offenders = findTopLevelOffenders(src);
    assert.deepEqual(
      offenders,
      [],
      `js/views/${file} のトップレベルに import/export function 以外の文がある: ${JSON.stringify(offenders)}`
    );
  }
});

test("views 以外のモジュール（main.js を除く）から js/views/ を import しない", () => {
  const files = [
    "js/utils.js",
    "js/answers.js",
    "js/timer.js",
    "js/fever.js",
    "js/content.js",
    "js/state.js",
    "js/audio.js",
  ];
  for (const f of files) {
    const imports = extractImports(readSrc(f));
    assert.ok(
      !imports.some((i) => i.includes("/views/")),
      `${f} が js/views/ を import している: ${JSON.stringify(imports)}`
    );
  }
});

test("data/*.js（index.js・_registry.js以外）は ./_registry.js のみを import する", () => {
  const dataDir = path.join(ROOT, "data");
  for (const file of readdirSync(dataDir)) {
    if (!file.endsWith(".js") || file === "index.js" || file === "_registry.js") continue;
    const imports = extractImports(readSrc(`data/${file}`));
    assert.deepEqual(imports, ["./_registry.js"], `data/${file}`);
  }
});

test("data/index.js は data/ 直下の全12単元ファイル（_registry.js・index.js 以外）を import している", () => {
  const dataDir = path.join(ROOT, "data");
  const expected = readdirSync(dataDir)
    .filter((f) => f.endsWith(".js") && f !== "index.js" && f !== "_registry.js")
    .map((f) => `./${f}`)
    .sort();
  const imports = extractImports(readSrc("data/index.js")).sort();
  assert.deepEqual(imports, expected);
});
