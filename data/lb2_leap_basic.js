import { createRegistry } from "./_registry.js";
const HQ = createRegistry();

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

// 数研出版の許諾済み見出語一覧から生成。問題・例文メモ・Tipは独自生成。
const weeks = [
  {
    "week": 1,
    "entries": [
      [
        401,
        "make",
        "Oに～をやらせる"
      ],
      [
        402,
        "have",
        "Oに～してもらう"
      ],
      [
        403,
        "let",
        "Oが～するのを許す"
      ],
      [
        404,
        "explain",
        "～を説明する"
      ],
      [
        405,
        "describe",
        "～を説明する"
      ],
      [
        406,
        "communicate",
        "意思の疎通をはかる"
      ],
      [
        407,
        "express",
        "～を表現する"
      ],
      [
        408,
        "greet",
        "～に挨拶する"
      ],
      [
        409,
        "bow",
        "おじぎする"
      ],
      [
        410,
        "agree",
        "賛成する"
      ],
      [
        411,
        "disagree",
        "反対である"
      ],
      [
        412,
        "against",
        "に反対で"
      ],
      [
        413,
        "be opposed to ～",
        "～に反対である"
      ],
      [
        414,
        "argue",
        "～と主張する"
      ],
      [
        415,
        "claim",
        "～と主張する"
      ],
      [
        416,
        "emphasize",
        "～を強調する"
      ],
      [
        417,
        "complain",
        "文句を言う"
      ],
      [
        418,
        "criticize",
        "～を批判する"
      ],
      [
        419,
        "discuss",
        "～について話し合う"
      ],
      [
        420,
        "debate",
        "討論"
      ],
      [
        421,
        "aloud",
        "声を出して"
      ],
      [
        422,
        "thank",
        "～にお礼を言う"
      ],
      [
        423,
        "owe",
        "（A to B）（A）は（B の）おかげだ"
      ],
      [
        424,
        "grateful",
        "感謝している"
      ],
      [
        425,
        "excuse",
        "言い訳"
      ],
      [
        426,
        "forgive",
        "～を許す"
      ],
      [
        427,
        "apologize",
        "謝る"
      ],
      [
        428,
        "celebrate",
        "～を祝う"
      ],
      [
        429,
        "congratulate",
        "～を祝う"
      ],
      [
        430,
        "impress",
        "～に印象を与える"
      ],
      [
        431,
        "admire",
        "～を称賛する"
      ],
      [
        432,
        "respect",
        "～を尊敬する"
      ],
      [
        433,
        "praise",
        "～を褒める"
      ],
      [
        434,
        "award",
        "賞"
      ],
      [
        435,
        "prize",
        "賞"
      ],
      [
        436,
        "reward",
        "報酬"
      ],
      [
        437,
        "reputation",
        "評判"
      ],
      [
        438,
        "cheer",
        "～に声援を送る"
      ],
      [
        439,
        "support",
        "～を支持する"
      ],
      [
        440,
        "recommend",
        "～を推薦する"
      ]
    ]
  },
  {
    "week": 2,
    "entries": [
      [
        441,
        "attend",
        "～に出席する"
      ],
      [
        442,
        "represent",
        "～を代表する"
      ],
      [
        443,
        "belong",
        "所属している"
      ],
      [
        444,
        "independent",
        "独立した"
      ],
      [
        445,
        "act",
        "行動する"
      ],
      [
        446,
        "pretend",
        "ふりをする"
      ],
      [
        447,
        "behave",
        "振る舞う"
      ],
      [
        448,
        "tend",
        "～する傾向にある"
      ],
      [
        449,
        "bear",
        "～に耐える"
      ],
      [
        450,
        "obey",
        "～に従う"
      ],
      [
        451,
        "imitate",
        "～をまねる"
      ],
      [
        452,
        "attitude",
        "態度"
      ],
      [
        453,
        "manner",
        "方法"
      ],
      [
        454,
        "allow",
        "～を許可する"
      ],
      [
        455,
        "admit",
        "～を認める"
      ],
      [
        456,
        "accept",
        "～を受け入れる"
      ],
      [
        457,
        "take ～ for granted",
        "～を当然のことと思う"
      ],
      [
        458,
        "natural",
        "当然の"
      ],
      [
        459,
        "seem",
        "～のように思われる"
      ],
      [
        460,
        "consider",
        "～をよく考える"
      ],
      [
        461,
        "regard",
        "（A as B）（A）を（Bと）みなす"
      ],
      [
        462,
        "interpret",
        "～を解釈する"
      ],
      [
        463,
        "imagine",
        "～を想像する"
      ],
      [
        464,
        "guess",
        "～を推測する"
      ],
      [
        465,
        "expect",
        "～を予期する"
      ],
      [
        466,
        "predict",
        "～を予測する"
      ],
      [
        467,
        "estimate",
        "～を推定する"
      ],
      [
        468,
        "recognize",
        "～が誰だか分かる"
      ],
      [
        469,
        "realize",
        "～を理解する"
      ],
      [
        470,
        "appreciate",
        "～を理解する"
      ],
      [
        471,
        "aware",
        "気づいている"
      ],
      [
        472,
        "concerned",
        "関心を持っている"
      ],
      [
        473,
        "wonder",
        "～かなと思う"
      ],
      [
        474,
        "doubt",
        "～を疑う"
      ],
      [
        475,
        "judge",
        "～を判断する"
      ],
      [
        476,
        "compare",
        "～を比較する"
      ],
      [
        477,
        "determine",
        "～を決める"
      ],
      [
        478,
        "attention",
        "注意"
      ],
      [
        479,
        "concentrate",
        "集中する"
      ],
      [
        480,
        "focus",
        "焦点を当てる"
      ]
    ]
  },
  {
    "week": 3,
    "entries": [
      [
        481,
        "absorb",
        "（be -ed in ～）～に没頭する"
      ],
      [
        482,
        "devote",
        "～をささげる"
      ],
      [
        483,
        "pray",
        "祈る"
      ],
      [
        484,
        "wish",
        "～ならいいのに"
      ],
      [
        485,
        "hope",
        "～と望む"
      ],
      [
        486,
        "envy",
        "～を羨ましく思う"
      ],
      [
        487,
        "ambition",
        "願望"
      ],
      [
        488,
        "need",
        "～が必要である"
      ],
      [
        489,
        "require",
        "～を必要とする"
      ],
      [
        490,
        "trust",
        "～を信頼する"
      ],
      [
        491,
        "depend",
        "次第である"
      ],
      [
        492,
        "rely",
        "頼る"
      ],
      [
        493,
        "indicate",
        "～を示す"
      ],
      [
        494,
        "suggest",
        "～を示唆する"
      ],
      [
        495,
        "prove",
        "～を証明する"
      ],
      [
        496,
        "publish",
        "～を出版する"
      ],
      [
        497,
        "advertise",
        "～を宣伝する"
      ],
      [
        498,
        "sign",
        "兆候"
      ],
      [
        499,
        "hurry",
        "急ぐ"
      ],
      [
        500,
        "wander",
        "歩き回る"
      ],
      [
        501,
        "follow",
        "～の後について行く"
      ],
      [
        502,
        "pass",
        "～を通り過ぎる"
      ],
      [
        503,
        "lead",
        "至る"
      ],
      [
        504,
        "rise",
        "上がる"
      ],
      [
        505,
        "raise",
        "～を上げる"
      ],
      [
        506,
        "traffic",
        "交通"
      ],
      [
        507,
        "jam",
        "渋滞"
      ],
      [
        508,
        "transportation",
        "交通機関"
      ],
      [
        509,
        "fare",
        "運賃"
      ],
      [
        510,
        "mail",
        "郵便"
      ],
      [
        511,
        "deliver",
        "～を配達する"
      ],
      [
        512,
        "breathe",
        "呼吸する"
      ],
      [
        513,
        "cough",
        "咳をする"
      ],
      [
        514,
        "sigh",
        "ため息をつく"
      ],
      [
        515,
        "lie",
        "横たわる"
      ],
      [
        516,
        "lay",
        "～を横たえる"
      ],
      [
        517,
        "wake",
        "目が覚める"
      ],
      [
        518,
        "awake",
        "目を覚まして"
      ],
      [
        519,
        "thirsty",
        "のどが渇いた"
      ],
      [
        520,
        "scratch",
        "ひっかき傷"
      ]
    ]
  },
  {
    "week": 4,
    "entries": [
      [
        521,
        "skill",
        "技術"
      ],
      [
        522,
        "ability",
        "能力"
      ],
      [
        523,
        "talent",
        "才能"
      ],
      [
        524,
        "effort",
        "努力"
      ],
      [
        525,
        "practice",
        "練習"
      ],
      [
        526,
        "exercise",
        "運動"
      ],
      [
        527,
        "competition",
        "コンテスト"
      ],
      [
        528,
        "defeat",
        "～を打ち負かす"
      ],
      [
        529,
        "succeed",
        "成功する"
      ],
      [
        530,
        "fail",
        "失敗する"
      ],
      [
        531,
        "miss",
        "～を逃す"
      ],
      [
        532,
        "mistake",
        "間違い"
      ],
      [
        533,
        "pursue",
        "～を追求する"
      ],
      [
        534,
        "achieve",
        "～を達成する"
      ],
      [
        535,
        "manage",
        "何とかして～する"
      ],
      [
        536,
        "repair",
        "～を修理する"
      ],
      [
        537,
        "improve",
        "～を改善する"
      ],
      [
        538,
        "develop",
        "発達する"
      ],
      [
        539,
        "progress",
        "進歩"
      ],
      [
        540,
        "advance",
        "進歩"
      ],
      [
        541,
        "collect",
        "～を集める"
      ],
      [
        542,
        "gather",
        "～を集める"
      ],
      [
        543,
        "gain",
        "～を得る"
      ],
      [
        544,
        "obtain",
        "～を得る"
      ],
      [
        545,
        "available",
        "手に入る"
      ],
      [
        546,
        "last",
        "続く"
      ],
      [
        547,
        "remain",
        "～のままでいる"
      ],
      [
        548,
        "exist",
        "存在する"
      ],
      [
        549,
        "survive",
        "生き残る"
      ],
      [
        550,
        "maintain",
        "～を維持する"
      ],
      [
        551,
        "borrow",
        "～を借りる"
      ],
      [
        552,
        "lend",
        "～を貸す"
      ],
      [
        553,
        "rent",
        "～を借りる"
      ],
      [
        554,
        "share",
        "～を共有する"
      ],
      [
        555,
        "provide",
        "～を供給する"
      ],
      [
        556,
        "offer",
        "～を申し出る"
      ],
      [
        557,
        "contribute",
        "貢献する"
      ],
      [
        558,
        "replace",
        "～に取って代わる"
      ],
      [
        559,
        "exchange",
        "～を交換する"
      ],
      [
        560,
        "produce",
        "～を生産する"
      ]
    ]
  },
  {
    "week": 5,
    "entries": [
      [
        561,
        "create",
        "～を創造する"
      ],
      [
        562,
        "establish",
        "～を確立する"
      ],
      [
        563,
        "arise",
        "生じる"
      ],
      [
        564,
        "occur",
        "生じる"
      ],
      [
        565,
        "throw",
        "～を投げる"
      ],
      [
        566,
        "pack",
        "～を詰める"
      ],
      [
        567,
        "pull",
        "～を引っ張る"
      ],
      [
        568,
        "fold",
        "～を折る"
      ],
      [
        569,
        "hang",
        "～を掛ける"
      ],
      [
        570,
        "shake",
        "～を振る"
      ],
      [
        571,
        "draw",
        "～を描く"
      ],
      [
        572,
        "install",
        "～を設置する"
      ],
      [
        573,
        "satisfy",
        "～を満足させる"
      ],
      [
        574,
        "encourage",
        "に促す"
      ],
      [
        575,
        "enable",
        "～に可能にする"
      ],
      [
        576,
        "persuade",
        "を説得して～させる"
      ],
      [
        577,
        "attract",
        "～を引きつける"
      ],
      [
        578,
        "remind",
        "～に思い出させる"
      ],
      [
        579,
        "annoy",
        "～を苛立たせる"
      ],
      [
        580,
        "bother",
        "～に面倒をかける"
      ],
      [
        581,
        "disturb",
        "～に迷惑をかける"
      ],
      [
        582,
        "confuse",
        "～を混乱させる"
      ],
      [
        583,
        "frighten",
        "～を怯えさせる"
      ],
      [
        584,
        "irritate",
        "～をいらいらさせる"
      ],
      [
        585,
        "bore",
        "～をうんざりさせる"
      ],
      [
        586,
        "prefer",
        "～を好む"
      ],
      [
        587,
        "be fond of ～",
        "～が好きだ"
      ],
      [
        588,
        "favor",
        "願い"
      ],
      [
        589,
        "hate",
        "～を嫌う"
      ],
      [
        590,
        "hesitate",
        "ためらう"
      ],
      [
        591,
        "mind",
        "気にする"
      ],
      [
        592,
        "joy",
        "喜び"
      ],
      [
        593,
        "amusement",
        "楽しみ"
      ],
      [
        594,
        "pity",
        "残念なこと"
      ],
      [
        595,
        "fear",
        "恐怖"
      ],
      [
        596,
        "despair",
        "絶望"
      ],
      [
        597,
        "lonely",
        "孤独な"
      ],
      [
        598,
        "anxious",
        "心配して"
      ],
      [
        599,
        "uneasy",
        "不安な"
      ],
      [
        600,
        "upset",
        "動揺して"
      ]
    ]
  },
  {
    "week": 6,
    "entries": [
      [
        601,
        "regret",
        "～を後悔する"
      ],
      [
        602,
        "embarrass",
        "～に恥ずかしい思いをさせる"
      ],
      [
        603,
        "ashamed",
        "恥ずかしい"
      ],
      [
        604,
        "shame",
        "残念なこと"
      ],
      [
        605,
        "government",
        "政府"
      ],
      [
        606,
        "nation",
        "国家"
      ],
      [
        607,
        "capital",
        "首都"
      ],
      [
        608,
        "state",
        "州"
      ],
      [
        609,
        "vote",
        "投票"
      ],
      [
        610,
        "law",
        "法律"
      ],
      [
        611,
        "official",
        "役人"
      ],
      [
        612,
        "legal",
        "合法の"
      ],
      [
        613,
        "political",
        "政治的な"
      ],
      [
        614,
        "trade",
        "貿易"
      ],
      [
        615,
        "economy",
        "経済"
      ],
      [
        616,
        "order",
        "注文"
      ],
      [
        617,
        "cost",
        "（費用）がかかる"
      ],
      [
        618,
        "consume",
        "～を消費する"
      ],
      [
        619,
        "afford",
        "～する余裕がある"
      ],
      [
        620,
        "supply",
        "～を供給する"
      ],
      [
        621,
        "demand",
        "～を要求する"
      ],
      [
        622,
        "task",
        "仕事"
      ],
      [
        623,
        "company",
        "会社"
      ],
      [
        624,
        "department",
        "部門"
      ],
      [
        625,
        "earn",
        "～を稼ぐ"
      ],
      [
        626,
        "price",
        "価格"
      ],
      [
        627,
        "sum",
        "金額"
      ],
      [
        628,
        "fee",
        "料金"
      ],
      [
        629,
        "charge",
        "料金"
      ],
      [
        630,
        "bill",
        "勘定"
      ],
      [
        631,
        "budget",
        "予算"
      ],
      [
        632,
        "local",
        "その土地の"
      ],
      [
        633,
        "native",
        "母国の"
      ],
      [
        634,
        "population",
        "人口"
      ],
      [
        635,
        "community",
        "社会"
      ],
      [
        636,
        "society",
        "社会"
      ],
      [
        637,
        "public",
        "大衆"
      ],
      [
        638,
        "fashion",
        "流行"
      ],
      [
        639,
        "role",
        "役割"
      ],
      [
        640,
        "relationship",
        "関係"
      ]
    ]
  },
  {
    "week": 7,
    "entries": [
      [
        641,
        "volunteer",
        "ボランティア"
      ],
      [
        642,
        "discrimination",
        "差別"
      ],
      [
        643,
        "habit",
        "習慣"
      ],
      [
        644,
        "custom",
        "習慣"
      ],
      [
        645,
        "tradition",
        "伝統"
      ],
      [
        646,
        "culture",
        "文化"
      ],
      [
        647,
        "art",
        "芸術"
      ],
      [
        648,
        "novel",
        "小説"
      ],
      [
        649,
        "fiction",
        "小説"
      ],
      [
        650,
        "literature",
        "文学"
      ],
      [
        651,
        "proverb",
        "ことわざ"
      ],
      [
        652,
        "instrument",
        "楽器"
      ],
      [
        653,
        "civilization",
        "文明"
      ],
      [
        654,
        "heritage",
        "遺産"
      ],
      [
        655,
        "value",
        "価値"
      ],
      [
        656,
        "wealth",
        "富"
      ],
      [
        657,
        "treasure",
        "財宝"
      ],
      [
        658,
        "resource",
        "資源"
      ],
      [
        659,
        "benefit",
        "恩恵"
      ],
      [
        660,
        "worth",
        "～の価値がある"
      ],
      [
        661,
        "glasses",
        "眼鏡"
      ],
      [
        662,
        "furniture",
        "家具"
      ],
      [
        663,
        "refrigerator",
        "冷蔵庫"
      ],
      [
        664,
        "garbage",
        "ごみ"
      ],
      [
        665,
        "note",
        "メモ"
      ],
      [
        666,
        "item",
        "品物"
      ],
      [
        667,
        "meal",
        "食事"
      ],
      [
        668,
        "diet",
        "食事"
      ],
      [
        669,
        "cafeteria",
        "食堂"
      ],
      [
        670,
        "serve",
        "（飲食物）を出す"
      ],
      [
        671,
        "pour",
        "～を注ぐ"
      ],
      [
        672,
        "spill",
        "～をこぼす"
      ],
      [
        673,
        "fry",
        "～を揚げる"
      ],
      [
        674,
        "customer",
        "客"
      ],
      [
        675,
        "passenger",
        "乗客"
      ],
      [
        676,
        "audience",
        "聴衆"
      ],
      [
        677,
        "crowd",
        "群衆"
      ],
      [
        678,
        "author",
        "著者"
      ],
      [
        679,
        "staff",
        "職員"
      ],
      [
        680,
        "clerk",
        "店員"
      ]
    ]
  },
  {
    "week": 8,
    "entries": [
      [
        681,
        "ancestor",
        "祖先"
      ],
      [
        682,
        "elderly",
        "年配の"
      ],
      [
        683,
        "female",
        "女性の"
      ],
      [
        684,
        "education",
        "教育"
      ],
      [
        685,
        "knowledge",
        "知識"
      ],
      [
        686,
        "grade",
        "学年"
      ],
      [
        687,
        "subject",
        "科目"
      ],
      [
        688,
        "senior",
        "最上級生"
      ],
      [
        689,
        "uniform",
        "制服"
      ],
      [
        690,
        "scholarship",
        "奨学金"
      ],
      [
        691,
        "graduate",
        "卒業する"
      ],
      [
        692,
        "article",
        "記事"
      ],
      [
        693,
        "text",
        "本文"
      ],
      [
        694,
        "passage",
        "一節"
      ],
      [
        695,
        "vocabulary",
        "語彙"
      ],
      [
        696,
        "term",
        "用語"
      ],
      [
        697,
        "pronounce",
        "～を発音する"
      ],
      [
        698,
        "translate",
        "～を翻訳する"
      ],
      [
        699,
        "define",
        "～を定義する"
      ],
      [
        700,
        "literally",
        "文字どおりに"
      ]
    ]
  }
];

registerLeapPart(HQ, {
  part: 2,
  partTitle: "Active Vocabulary 1",
  startOrder: 207,
  weeks
});

export const units = HQ.units;
export const cards = HQ.cards;
