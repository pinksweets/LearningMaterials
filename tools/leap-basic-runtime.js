const SUBJECT = "📘 LEAP Basic 必携英単語";

const COURSE_DEFS = [
  {
    id: 1,
    label: "Course 1｜意味・ニュアンス",
    desc: "見出語から基本の意味を思い出し、語の中心イメージをつかむ"
  },
  {
    id: 2,
    label: "Course 2｜フレーズ・例文",
    desc: "意味を復習しながら、オリジナル例文メモで使い方につなげる"
  },
  {
    id: 3,
    label: "Course 3｜語法・Tip",
    desc: "意味と用例を復習し、つづりや語のまとまりを手がかりに定着させる"
  }
];

function uniqueChoices(entries, index, valueIndex) {
  const correct = entries[index][valueIndex];
  const values = [correct];
  const offsets = [7, 13, 19, 23, 29, 31, 37, 41];
  for (const offset of offsets) {
    const candidate = entries[(index + offset) % entries.length][valueIndex];
    if (!values.includes(candidate)) values.push(candidate);
    if (values.length === 4) break;
  }
  for (let i = 1; values.length < 4 && i < entries.length; i += 1) {
    const candidate = entries[(index + i) % entries.length][valueIndex];
    if (!values.includes(candidate)) values.push(candidate);
  }
  const shift = entries[index][0] % values.length;
  const choices = values.slice(shift).concat(values.slice(0, shift));
  return { choices, answer: choices.indexOf(correct) };
}

function partRole(part) {
  if (part === 1) return "日常英語の土台になる基本語・熟語";
  if (part <= 3) return "英作文や会話で自分から使いたい発信語彙";
  return "読解やリスニングで意味をつかみたい受信語彙";
}

function nuanceFor(part, headword, meaning) {
  if (/\s/.test(headword)) {
    return `「${headword}」は複数語を一まとまりとして覚えるのがコツです。`;
  }
  if (/[、・／/]/.test(meaning)) {
    return `意味が複数あるので、まず「${meaning}」を中心に文脈で選び分けよう。`;
  }
  return `${partRole(part)}です。中心の意味「${meaning}」を最初の手がかりにしよう。`;
}

const ORIGINAL_USAGE_EXAMPLES = {
  "a": ["I saw (　) dog in the park.", "I saw a dog in the park."],
  "the": ["Please close (　) door.", "Please close the door."],
  "something": ["I have (　) to tell you.", "I have something to tell you."],
  "someone": ["(　) is waiting outside.", "Someone is waiting outside."],
  "oneself": ["It is important to know (　).", "It is important to know oneself."],
  "speak": ["Can you (　) more slowly?", "Can you speak more slowly?"],
  "talk": ["We need to (　) about the plan.", "We need to talk about the plan."],
  "say": ["Please (　) that again.", "Please say that again."],
  "see": ["I can (　) the mountains from here.", "I can see the mountains from here."],
  "watch": ["We (　) a movie after dinner.", "We watch a movie after dinner."],
  "listen to ～": ["I (　) music on the way home.", "I listen to music on the way home."],
  "hear": ["I can (　) birds outside.", "I can hear birds outside."],
  "language": ["English is an international (　).", "English is an international language."],
  "news": ["I heard the (　) this morning.", "I heard the news this morning."],
  "movie": ["We watched a (　) together.", "We watched a movie together."],
  "information": ["This website provides useful (　).", "This website provides useful information."],
  "opinion": ["Please share your (　) with us.", "Please share your opinion with us."],
  "answer": ["Please (　) the question.", "Please answer the question."],
  "write": ["Please (　) your name here.", "Please write your name here."],
  "read": ["I (　) a book before bed.", "I read a book before bed."],
  "make": ["A funny story can (　) everyone laugh.", "A funny story can make everyone laugh."],
  "have": ["I will (　) my brother help me.", "I will have my brother help me."],
  "let": ["Please (　) me explain.", "Please let me explain."]
};

const ADJECTIVE_HEADWORDS = new Set([
  "aware", "sure", "good", "bad", "right", "wrong", "true", "false", "easy", "hard",
  "important", "necessary", "possible", "impossible", "different", "same", "ready", "afraid",
  "alive", "asleep", "awake", "alone", "glad", "sorry", "worth"
]);

function resolveUsagePattern(headword) {
  return headword
    .replace(/[（(]人[）)]/g, "Mika")
    .replace(/[（(]程度[）)]/g, "a lot")
    .replace(/[（(]that[）)]/gi, "that")
    .replace(/\bS V\b/g, "we are ready")
    .replace(/\bA\b/g, "an idea")
    .replace(/\bB\b/g, "this plan")
    .replace(/～/g, "the plan")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeVerbMeaning(meaning) {
  return /～|Oに|Oを|する|[うくぐすつぬぶむる]$/.test(meaning);
}

function looksLikeAdjective(headword, meaning) {
  return ADJECTIVE_HEADWORDS.has(headword.toLowerCase())
    || /(?:able|ible|al|ful|ic|ive|less|ous|ent|ant|ary|ory|ed|ing)$/.test(headword.toLowerCase())
    || /い$|な$|した$|された$|である$|的な?$|のある$|に満ちた$|らしい$|やすい$|にくい$/.test(meaning);
}

function usageExample(headword, meaning) {
  const fixed = ORIGINAL_USAGE_EXAMPLES[headword];
  if (fixed) return { prompt: fixed[0], completed: fixed[1] };

  const resolved = resolveUsagePattern(headword);
  const lower = headword.toLowerCase();
  if (/^A such as B$/i.test(headword)) {
    return { prompt: "We discussed (　) in class.", completed: "We discussed ideas such as this plan in class." };
  }
  if (/^against$/i.test(headword)) {
    return { prompt: "They voted (　) the plan.", completed: "They voted against the plan." };
  }
  if (/^toward$/i.test(headword)) {
    return { prompt: "They walked (　) the station.", completed: "They walked toward the station." };
  }
  if (/\s|～|（|\(/.test(headword)) {
    return { prompt: "語法パターン：(　)", completed: `Usage pattern: ${resolved}` };
  }
  if (looksLikeAdjective(headword, meaning)) {
    return { prompt: "The situation seems (　).", completed: `The situation seems ${resolved}.` };
  }
  if (looksLikeVerbMeaning(meaning)) {
    const object = /～を|Oを/.test(meaning) ? " it" : "";
    return { prompt: `They can (　)${object} during the activity.`, completed: `They can ${resolved}${object} during the activity.` };
  }
  if (/ly$/.test(lower)) {
    return { prompt: "They handled the task (　).", completed: `They handled the task ${resolved}.` };
  }
  if (/s$/.test(lower) && !/(ss|us)$/.test(lower)) {
    return { prompt: "We discussed these (　) in class.", completed: `We discussed these ${resolved} in class.` };
  }
  return { prompt: "We discussed this (　) in class.", completed: `We discussed this ${resolved} in class.` };
}

function spellingTip(headword) {
  const lower = headword.toLowerCase();
  if (/\s/.test(headword)) return `空白で分かれる語を、意味のまとまりごと音読しよう：${headword}`;
  const suffixes = [
    ["tion", "語尾の -tion"],
    ["ment", "語尾の -ment"],
    ["ness", "語尾の -ness"],
    ["able", "語尾の -able"],
    ["ful", "語尾の -ful"],
    ["less", "語尾の -less"],
    ["ous", "語尾の -ous"],
    ["ive", "語尾の -ive"],
    ["ly", "語尾の -ly"],
    ["er", "最後の -er"],
    ["or", "最後の -or"]
  ];
  for (const [suffix, tip] of suffixes) {
    if (lower.length > suffix.length + 2 && lower.endsWith(suffix)) return `${tip}をつづりのまとまりとして確認しよう。`;
  }
  const prefixes = [
    ["un", "先頭の un-"],
    ["re", "先頭の re-"],
    ["dis", "先頭の dis-"],
    ["pre", "先頭の pre-"],
    ["inter", "先頭の inter-"]
  ];
  for (const [prefix, tip] of prefixes) {
    if (lower.length > prefix.length + 3 && lower.startsWith(prefix)) return `${tip}をつづりのまとまりとして確認しよう。`;
  }
  if (headword.length >= 10) return `長いつづりは ${headword.slice(0, Math.ceil(headword.length / 2))} / ${headword.slice(Math.ceil(headword.length / 2))} に分けて確認しよう。`;
  return `最初の文字「${headword.charAt(0)}」と最後の文字「${headword.charAt(headword.length - 1)}」を意識して、声に出しながら書こう。`;
}

function makeCourse1Question(part, entries, index) {
  const [number, headword, meaning] = entries[index];
  const { choices, answer } = uniqueChoices(entries, index, 2);
  return {
    type: "yon",
    lv: "基礎",
    q: `LEAP Basic 見出番号 ${number}。「${headword}」の基本的な意味に最も近いものは？`,
    choices,
    a: answer,
    time: 30,
    exp: `「${headword}」は「${meaning}」を表します。${nuanceFor(part, headword, meaning)}`,
    hint: `英語を見て、中心の意味「${meaning}」がすぐ浮かぶ状態を目指そう。`
  };
}

function makeCourse2Question(part, entries, index) {
  const [number, headword, meaning] = entries[index];
  const { choices, answer } = uniqueChoices(entries, index, 1);
  const usage = usageExample(headword, meaning);
  return {
    type: "yon",
    lv: "標準",
    q: `「${meaning}」を表す見出語を選び、オリジナル用例を完成させよう。${usage.prompt}`,
    choices,
    a: answer,
    time: 30,
    exp: `完成例：${usage.completed} この文では「${headword}」を「${meaning}」の意味で使っています。自分の場面に置き換えた英文も1つ作ってみよう。`,
    hint: `Course 1で確認した意味から、見出語の形を思い出そう。`
  };
}

function makeCourse3Question(part, entries, index) {
  const [number, headword, meaning] = entries[index];
  const { choices, answer } = uniqueChoices(entries, index, 1);
  const tip = spellingTip(headword);
  const usage = usageExample(headword, meaning);
  return {
    type: "ana",
    lv: "発展",
    q: `見出番号 ${number}。「${meaning}」に当たる見出語は？ Tip：${tip}`,
    choices,
    a: answer,
    time: 30,
    exp: `答えは「${headword}」。使い方メモ：${usage.completed} この用例と語の形を一緒に覚えよう。Tip：${tip}`,
    hint: `例文メモを思い出し、つづりのまとまりから候補をしぼろう。`
  };
}

function questionsForCourse(part, courseId, entries) {
  return entries.map((_, index) => {
    if (courseId === 1) return makeCourse1Question(part, entries, index);
    if (courseId === 2) return makeCourse2Question(part, entries, index);
    return makeCourse3Question(part, entries, index);
  });
}

function registerLeapPart(HQ, config) {
  let order = config.startOrder;
  for (const course of COURSE_DEFS) {
    for (const week of config.weeks) {
      const first = week.entries[0][0];
      const last = week.entries[week.entries.length - 1][0];
      HQ.registerUnit({
        id: `lbp${config.part}c${course.id}w${week.week}`,
        subject: SUBJECT,
        group: `Part ${config.part} ${config.partTitle}｜${course.label}`,
        title: `Week ${week.week}｜見出番号 ${first}～${last}`,
        desc: `${course.desc}（${week.entries.length}語・句）`,
        order,
        questions: questionsForCourse(config.part, course.id, week.entries),
        cards: []
      });
      order += 1;
    }
  }
}
