#!/usr/bin/env node
/*
  数研出版の許諾済み「改訂版 必携英単語 LEAP Basic」公式ドリルから、
  見出語・見出番号・基本義だけを抽出して data/lb*_leap_basic.js を再生成する。

  公式の選択肢・用例・解説は出力しない。学習クエスト側の問題・例文メモ・Tipは
  tools/leap-basic-runtime.js が独自に生成する。
*/
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://cds.chart.co.jp/assets/contents/books/9xv5lr9k2g/content/14433_drill/contents";
const RUNTIME_SOURCE = readFileSync(path.join(ROOT, "tools", "leap-basic-runtime.js"), "utf8").trim();

const PARTS = [
  { part: 1, code: "P1_WEJ", partTitle: "Basic Vocabulary & Idioms", expected: 400, startOrder: 177 },
  { part: 2, code: "P2_WEJ", partTitle: "Active Vocabulary 1", expected: 300, startOrder: 207 },
  { part: 3, code: "P3_WEJ", partTitle: "Active Vocabulary 2", expected: 300, startOrder: 231 },
  { part: 4, code: "P4_WEJ", partTitle: "Passive Vocabulary 1", expected: 300, startOrder: 255 },
  { part: 5, code: "P5_WEJ", partTitle: "Passive Vocabulary 2", expected: 300, startOrder: 282 }
];

function scalar(value) {
  const text = value.trim();
  if (text.startsWith("'") && text.endsWith("'")) return text.slice(1, -1).replace(/''/g, "'");
  if (text.startsWith('"') && text.endsWith('"')) {
    try { return JSON.parse(text); } catch { return text.slice(1, -1); }
  }
  return text;
}

function plainText(value) {
  return scalar(value)
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseQuestionsYaml(source, part) {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/);
  const weeks = [];
  let week = null;
  let question = null;
  let section = "";
  let list = "";

  function flushQuestion() {
    if (!question) return;
    const answer = Number(question.answers[0] ?? question.answer ?? 1);
    const meaning = question.options[answer - 1];
    const numberMatch = question.comment.match(/単語番号\s*(\d+)/);
    const number = numberMatch ? Number(numberMatch[1]) : null;
    const headword = plainText(question.presentation);
    if (!week || !number || !headword || !meaning) {
      throw new Error(`Part ${part}: 問題の解析に失敗しました: ${JSON.stringify({ week: week?.title, number, headword, meaning, question })}`);
    }
    week.entries.push([number, headword, plainText(meaning)]);
    question = null;
  }

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const indent = raw.length - raw.trimStart().length;
    const text = raw.trim();
    if (indent === 2 && text.startsWith("- title:")) {
      flushQuestion();
      week = { week: weeks.length + 1, title: plainText(text.slice(text.indexOf(":") + 1)), entries: [] };
      weeks.push(week);
      section = "";
      list = "";
      continue;
    }
    if (indent === 6 && text.startsWith("- ")) {
      flushQuestion();
      question = { presentation: "", comment: "", answer: null, answers: [], options: [] };
      const firstKey = text.slice(2, text.indexOf(":"));
      section = ["presentation", "question", "comment"].includes(firstKey) ? firstKey : "";
      list = "";
      continue;
    }
    if (!question) continue;
    if (indent === 8 && /^(presentation|question|comment):/.test(text)) {
      section = text.slice(0, text.indexOf(":"));
      list = "";
      continue;
    }
    if (indent === 10 && text.startsWith("value:")) {
      const value = text.slice(text.indexOf(":") + 1);
      if (section === "presentation") question.presentation = value;
      if (section === "comment") question.comment = value;
      continue;
    }
    if (section === "question" && indent === 10 && text.startsWith("answer:")) {
      const value = text.slice(text.indexOf(":") + 1).trim();
      list = "answer";
      if (value) question.answer = scalar(value);
      continue;
    }
    if (section === "question" && indent === 10 && text === "option:") {
      list = "option";
      continue;
    }
    if (section === "question" && indent === 12 && text.startsWith("- ")) {
      const value = text.slice(2);
      if (list === "answer") question.answers.push(scalar(value));
      if (list === "option") question.options.push(value);
    }
  }
  flushQuestion();
  return weeks;
}

function moduleSource(part, weeks) {
  return `import { createRegistry } from "./_registry.js";\n` +
    `const HQ = createRegistry();\n\n` +
    `${RUNTIME_SOURCE}\n\n` +
    `// 数研出版の許諾済み見出語一覧から生成。問題・例文メモ・Tipは独自生成。\n` +
    `const weeks = ${JSON.stringify(weeks.map(({ week, entries }) => ({ week, entries })), null, 2)};\n\n` +
    `registerLeapPart(HQ, {\n` +
    `  part: ${part.part},\n` +
    `  partTitle: ${JSON.stringify(part.partTitle)},\n` +
    `  startOrder: ${part.startOrder},\n` +
    `  weeks\n` +
    `});\n\n` +
    `export const units = HQ.units;\n` +
    `export const cards = HQ.cards;\n`;
}

for (const part of PARTS) {
  const url = `${BASE}/14433_${part.code}/questions.yaml`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const weeks = parseQuestionsYaml(await response.text(), part.part);
  const entries = weeks.flatMap((week) => week.entries);
  if (entries.length !== part.expected) {
    throw new Error(`Part ${part.part}: ${entries.length}語（期待値 ${part.expected}語）`);
  }
  for (let i = 0; i < entries.length; i += 1) {
    const expectedNumber = (part.part === 1 ? 1 : PARTS.slice(0, part.part - 1).reduce((n, p) => n + p.expected, 1)) + i;
    if (entries[i][0] !== expectedNumber) {
      throw new Error(`Part ${part.part}: 見出番号が不連続です（${entries[i][0]} / 期待値 ${expectedNumber}）`);
    }
  }
  const outputPath = path.join(ROOT, "data", `lb${part.part}_leap_basic.js`);
  writeFileSync(outputPath, moduleSource(part, weeks), "utf8");
  console.log(`Part ${part.part}: ${weeks.length}週 / ${entries.length}語 -> ${outputPath}`);
}
