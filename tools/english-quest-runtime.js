const ENGLISH_QUEST_SUBJECT = "📘 LEAP Basic 必携英単語";

const ENGLISH_QUEST_COURSES = [
  {
    id: 1,
    label: "Course 1｜意味とニュアンス",
    level: "基礎",
    desc: "単語の基本的な意味と中心イメージをつかむ"
  },
  {
    id: 2,
    label: "Course 2｜フレーズ・例文",
    level: "標準",
    desc: "フレーズと例文で実際の使われ方を確認する"
  },
  {
    id: 3,
    label: "Course 3｜使い方とTip",
    level: "発展",
    desc: "語法メモとTipで知識を定着させる"
  }
];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function shortMeaning(meaning) {
  return String(meaning).split(/[；;]/)[0].trim();
}

function choiceKey(value) {
  return String(value).normalize("NFKC").trim().toLowerCase();
}

function choicesFor(entries, target, valueOf) {
  const index = entries.indexOf(target);
  const correct = valueOf(target);
  const values = [correct];
  const seen = new Set([choiceKey(correct)]);
  const offsets = [7, 13, 19, 23, 29, 31, 37, 41];
  for (const offset of offsets) {
    const candidate = valueOf(entries[(index + offset) % entries.length]);
    const key = choiceKey(candidate);
    if (!seen.has(key)) {
      seen.add(key);
      values.push(candidate);
    }
    if (values.length === 4) break;
  }
  for (let step = 1; values.length < 4 && step < entries.length; step += 1) {
    const candidate = valueOf(entries[(index + step) % entries.length]);
    const key = choiceKey(candidate);
    if (!seen.has(key)) {
      seen.add(key);
      values.push(candidate);
    }
  }
  if (values.length < 4) {
    throw new Error(`英単語クエスト追加教材の選択肢が不足しています: ${target.w}（候補${values.length}件）`);
  }
  const shift = (index + entries[index].w.length) % values.length;
  const choices = values.slice(shift).concat(values.slice(0, shift));
  return { choices, answer: choices.indexOf(correct) };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function blankOut(text, word) {
  const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
  const output = String(text).replace(pattern, "（　　）");
  return output === String(text) ? null : output;
}

function detailsFor(word, courseId) {
  let details = `<br>💡 ${escapeHtml(word.nu)}`;
  if (courseId >= 2) {
    details += `<br>📌 ${escapeHtml(word.ph)}（${escapeHtml(word.phm)}）`;
    details += `<br>✏️ ${escapeHtml(word.ex)}<br>　${escapeHtml(word.exm)}`;
  }
  if (courseId >= 3) {
    details += `<br>🔧 ${escapeHtml(word.us)}`;
    details += `<br>⭐ Tip: ${escapeHtml(word.tip)}`;
  }
  return details;
}

function makeCourse1Question(word, pool) {
  const { choices, answer } = choicesFor(pool, word, (entry) => shortMeaning(entry.m));
  return {
    type: "yon",
    lv: "基礎",
    q: `英単語クエスト追加教材。「${word.w}」の基本的な意味に最も近いものは？`,
    choices,
    a: answer,
    time: 30,
    exp: `「${escapeHtml(word.w)}」は「${escapeHtml(word.m)}」を表します。${detailsFor(word, 1)}`,
    hint: `単語を見て、中心の意味「${word.m}」とイメージを思い出そう。`
  };
}

function makeCourse2Question(word, pool) {
  const { choices, answer } = choicesFor(pool, word, (entry) => entry.w);
  const blanked = blankOut(word.ex, word.w);
  const question = blanked
    ? `「${word.m}」を表す見出語を選び、例文を完成させよう。\n${blanked}\n（${word.exm}）`
    : `「${word.m}」を表す見出語は？\nフレーズ：${word.ph}（${word.phm}）`;
  return {
    type: "yon",
    lv: "標準",
    q: question,
    choices,
    a: answer,
    time: 30,
    exp: `完成例：${escapeHtml(word.ex)} ${escapeHtml(word.exm)}。この文では「${escapeHtml(word.w)}」を「${escapeHtml(word.m)}」の意味で使っています。${detailsFor(word, 2)}`,
    hint: `意味から見出語を思い出し、例文の場面に合う単語を選ぼう。`
  };
}

function makeCourse3Question(word, pool) {
  const { choices, answer } = choicesFor(pool, word, (entry) => entry.w);
  return {
    type: "ana",
    lv: "発展",
    q: `英単語クエスト追加教材。「${word.m}」に当たる見出語は？ Tip：${word.tip}`,
    choices,
    a: answer,
    time: 30,
    exp: `答えは「${escapeHtml(word.w)}」。使い方メモ：${escapeHtml(word.ph)}（${escapeHtml(word.phm)}）。${escapeHtml(word.ex)}（${escapeHtml(word.exm)}）。${detailsFor(word, 3)}`,
    hint: `語法メモとTipを手がかりに、つづりと使い方を思い出そう。`
  };
}

function questionsForCourse(courseId, entries, pool) {
  return entries.map((word) => {
    if (courseId === 1) return makeCourse1Question(word, pool);
    if (courseId === 2) return makeCourse2Question(word, pool);
    return makeCourse3Question(word, pool);
  });
}

function registerEnglishQuestAdditions(HQ, parts, startOrder) {
  let order = startOrder;
  for (const part of parts) {
    const stages = [];
    for (let offset = 0; offset < part.entries.length; offset += 10) {
      stages.push(part.entries.slice(offset, offset + 10));
    }
    for (const course of ENGLISH_QUEST_COURSES) {
      stages.forEach((entries, stageIndex) => {
        const first = entries[0].w;
        const last = entries[entries.length - 1].w;
        HQ.registerUnit({
          id: `lbq${part.part}c${course.id}s${stageIndex + 1}`,
          subject: ENGLISH_QUEST_SUBJECT,
          group: `Part ${part.part} ${part.title}｜英単語クエスト追加教材｜${course.label}`,
          title: `追加ステージ ${stageIndex + 1}｜${first}〜${last}`,
          desc: `${course.desc}（${entries.length}語・句）`,
          order,
          questions: questionsForCourse(course.id, entries, part.entries),
          cards: []
        });
        order += 1;
      });
    }
  }
}
