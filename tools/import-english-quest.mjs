#!/usr/bin/env node
/*
  英単語クエスト.html の独自教材を、既存LEAP Basicの見出語と突き合わせて
  重複を除き、Learning Quest用の追加データへ変換する。

  既存LEAP Basicの問題は変更せず、英単語クエスト側にだけある語を同じ教科へ
  追加する。問題生成ロジックは data/lbq_leap_basic.js に埋め込むため、
  dataファイルは単独でも読み込める。
*/
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_PATH = path.join(ROOT, "英単語暗記サイト", "英単語クエスト.html");
const OUTPUT_PATH = path.join(ROOT, "data", "lbq_leap_basic.js");
const RUNTIME_PATH = path.join(ROOT, "tools", "english-quest-runtime.js");
const SUBJECT = "📘 LEAP Basic 必携英単語";
const PARTS = [
  { key: "p1", part: 1, title: "Basic Vocabulary & Idioms" },
  { key: "p2", part: 2, title: "Active Vocabulary 1" },
  { key: "p3", part: 3, title: "Active Vocabulary 2" },
  { key: "p4", part: 4, title: "Passive Vocabulary 1" },
  { key: "p5", part: 5, title: "Passive Vocabulary 2" }
];

function normalizeWord(value) {
  return String(value).normalize("NFKC").trim().toLowerCase();
}

function readWords() {
  const html = readFileSync(SOURCE_PATH, "utf8");
  const match = html.match(/const WORDS = (.*?);\r?\n/);
  if (!match) throw new Error(`WORDSデータが見つかりません: ${SOURCE_PATH}`);
  const words = JSON.parse(match[1]);
  for (const part of PARTS) {
    if (!Array.isArray(words[part.key])) throw new Error(`${part.key} の語彙配列がありません`);
    for (const [index, word] of words[part.key].entries()) {
      for (const field of ["w", "pos", "m", "nu", "ph", "phm", "ex", "exm", "us", "tip"]) {
        if (typeof word[field] !== "string" || !word[field].trim()) {
          throw new Error(`${part.key}[${index}] の ${field} が空です`);
        }
      }
    }
  }
  return words;
}

function existingLeapHeadwords(units) {
  const headwords = new Set();
  for (const unit of units) {
    if (unit.subject !== SUBJECT || !unit.group.includes("Course 1") || unit.id.startsWith("lbq")) continue;
    for (const question of unit.questions) {
      const match = String(question.q || "").match(/「([^」]+)」/);
      if (match) headwords.add(normalizeWord(match[1]));
    }
  }
  return headwords;
}

const words = readWords();
const baseModules = await Promise.all(
  [1, 2, 3, 4, 5].map((part) => import(pathToFileURL(path.join(ROOT, "data", `lb${part}_leap_basic.js`)).href))
);
const units = baseModules.flatMap((module) => module.units);
const baseUnits = units.filter((unit) => !unit.id.startsWith("lbq"));
const existing = existingLeapHeadwords(baseUnits);
const seen = new Set();
const additions = PARTS.map((part) => ({
  part: part.part,
  title: part.title,
  entries: words[part.key].filter((word) => {
    const key = normalizeWord(word.w);
    if (seen.has(key)) throw new Error(`英単語クエスト内で見出語が重複しています: ${word.w}`);
    seen.add(key);
    return !existing.has(key);
  })
}));

const runtime = readFileSync(RUNTIME_PATH, "utf8").trim();
const startOrder = Math.max(...baseUnits.map((unit) => unit.order)) + 1;
const output = [
  'import { createRegistry } from "./_registry.js";',
  "const HQ = createRegistry();",
  "",
  runtime,
  "",
  `const ENGLISH_QUEST_PARTS = ${JSON.stringify(additions, null, 2)};`,
  `registerEnglishQuestAdditions(HQ, ENGLISH_QUEST_PARTS, ${startOrder});`,
  "",
  "export const units = HQ.units;",
  "export const cards = HQ.cards;",
  ""
].join("\n");
writeFileSync(OUTPUT_PATH, output, "utf8");

const addedWords = additions.reduce((total, part) => total + part.entries.length, 0);
const stagesPerCourse = additions.reduce((total, part) => total + Math.ceil(part.entries.length / 10), 0);
console.log(`英単語クエスト追加教材を生成しました: ${OUTPUT_PATH}`);
console.log(`  既存LEAPとの重複除外: ${seen.size - addedWords}語`);
console.log(`  追加語彙: ${addedWords}語 / 追加単元: ${stagesPerCourse * 3}（3コース）`);
for (const part of additions) {
  console.log(`  Part ${part.part}: ${part.entries.length}語 / ${Math.ceil(part.entries.length / 10)}ステージ相当`);
}
