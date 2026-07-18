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
        1001,
        "refer",
        "言及する"
      ],
      [
        1002,
        "mention",
        "～について述べる"
      ],
      [
        1003,
        "whisper",
        "ささやく"
      ],
      [
        1004,
        "remark",
        "発言"
      ],
      [
        1005,
        "yell",
        "叫ぶ"
      ],
      [
        1006,
        "react",
        "反応する"
      ],
      [
        1007,
        "reply",
        "返事をする"
      ],
      [
        1008,
        "respond",
        "返答する"
      ],
      [
        1009,
        "propose",
        "～を提案する"
      ],
      [
        1010,
        "submit",
        "～を提出する"
      ],
      [
        1011,
        "adopt",
        "～を採用する"
      ],
      [
        1012,
        "negotiate",
        "交渉する"
      ],
      [
        1013,
        "convey",
        "～を伝える"
      ],
      [
        1014,
        "broadcast",
        "～を放送する"
      ],
      [
        1015,
        "consult",
        "～に相談する"
      ],
      [
        1016,
        "participate",
        "参加する"
      ],
      [
        1017,
        "encounter",
        "～に偶然出会う"
      ],
      [
        1018,
        "interaction",
        "交流"
      ],
      [
        1019,
        "tip",
        "助言"
      ],
      [
        1020,
        "envelope",
        "封筒"
      ],
      [
        1021,
        "insist",
        "言い張る"
      ],
      [
        1022,
        "accuse",
        "～を非難する"
      ],
      [
        1023,
        "scold",
        "～を𠮟る"
      ],
      [
        1024,
        "object",
        "反対する"
      ],
      [
        1025,
        "resist",
        "～を我慢する"
      ],
      [
        1026,
        "tolerate",
        "～を大目に見る"
      ],
      [
        1027,
        "protest",
        "抗議する"
      ],
      [
        1028,
        "confirm",
        "～を確認する"
      ],
      [
        1029,
        "approve",
        "認める"
      ],
      [
        1030,
        "confess",
        "白状する"
      ],
      [
        1031,
        "permit",
        "～を許可する"
      ],
      [
        1032,
        "acknowledge",
        "～を認める"
      ],
      [
        1033,
        "assure",
        "～に保証する"
      ],
      [
        1034,
        "ensure",
        "～を確実にする"
      ],
      [
        1035,
        "guarantee",
        "保証"
      ]
    ]
  },
  {
    "week": 2,
    "entries": [
      [
        1036,
        "suppose",
        "（be －d to do）～することになっている"
      ],
      [
        1037,
        "assume",
        "～と思い込む"
      ],
      [
        1038,
        "suspect",
        "～ではないかと思う"
      ],
      [
        1039,
        "comprehend",
        "～を理解している"
      ],
      [
        1040,
        "notice",
        "～に気がついている"
      ],
      [
        1041,
        "perceive",
        "～を認識する"
      ],
      [
        1042,
        "evaluate",
        "～を評価する"
      ],
      [
        1043,
        "recall",
        "～を思い出す"
      ],
      [
        1044,
        "anticipate",
        "～を予想する"
      ],
      [
        1045,
        "conscious",
        "意識している"
      ],
      [
        1046,
        "review",
        "再検討"
      ],
      [
        1047,
        "notion",
        "考え"
      ],
      [
        1048,
        "concept",
        "概念"
      ],
      [
        1049,
        "insight",
        "洞察"
      ],
      [
        1050,
        "perspective",
        "視点"
      ],
      [
        1051,
        "conclude",
        "～と結論を下す"
      ],
      [
        1052,
        "distinguish",
        "～を区別する"
      ],
      [
        1053,
        "classify",
        "～を分類する"
      ],
      [
        1054,
        "deserve",
        "～に値する"
      ],
      [
        1055,
        "option",
        "選択肢"
      ],
      [
        1056,
        "questionnaire",
        "アンケート"
      ],
      [
        1057,
        "commit",
        "（oneself to ～）～に専念する"
      ],
      [
        1058,
        "engage",
        "従事する"
      ],
      [
        1059,
        "accomplish",
        "～をやり遂げる"
      ],
      [
        1060,
        "fulfill",
        "～を果たす"
      ],
      [
        1061,
        "overcome",
        "～を克服する"
      ],
      [
        1062,
        "undertake",
        "～を引き受ける"
      ],
      [
        1063,
        "resume",
        "～を再開する"
      ],
      [
        1064,
        "undergo",
        "～を経験する"
      ],
      [
        1065,
        "struggle",
        "苦闘する"
      ],
      [
        1066,
        "capable",
        "力がある"
      ],
      [
        1067,
        "potential",
        "潜在的な"
      ],
      [
        1068,
        "capacity",
        "能力"
      ],
      [
        1069,
        "seek",
        "～を求める"
      ],
      [
        1070,
        "desire",
        "願望"
      ]
    ]
  },
  {
    "week": 3,
    "entries": [
      [
        1071,
        "reveal",
        "～を明らかにする"
      ],
      [
        1072,
        "illustrate",
        "～を説明する"
      ],
      [
        1073,
        "announce",
        "～を発表する"
      ],
      [
        1074,
        "declare",
        "～を宣言する"
      ],
      [
        1075,
        "display",
        "～を展示する"
      ],
      [
        1076,
        "exhibit",
        "～を展示する"
      ],
      [
        1077,
        "demonstrate",
        "～を示す"
      ],
      [
        1078,
        "imply",
        "～をほのめかす"
      ],
      [
        1079,
        "instance",
        "例"
      ],
      [
        1080,
        "head",
        "向かう"
      ],
      [
        1081,
        "accompany",
        "～と一緒に行く"
      ],
      [
        1082,
        "withdraw",
        "～を引っ込める"
      ],
      [
        1083,
        "transfer",
        "乗り換える"
      ],
      [
        1084,
        "commute",
        "通勤"
      ],
      [
        1085,
        "descend",
        "降下する"
      ],
      [
        1086,
        "chase",
        "～を追いかける"
      ],
      [
        1087,
        "departure",
        "出発"
      ],
      [
        1088,
        "destination",
        "目的地"
      ],
      [
        1089,
        "vehicle",
        "車両"
      ],
      [
        1090,
        "transform",
        "～を変える"
      ],
      [
        1091,
        "split",
        "～を割る"
      ],
      [
        1092,
        "expand",
        "拡大する"
      ],
      [
        1093,
        "extend",
        "～を延長する"
      ],
      [
        1094,
        "multiply",
        "～を増やす"
      ],
      [
        1095,
        "adapt",
        "適応する"
      ],
      [
        1096,
        "fade",
        "薄れる"
      ],
      [
        1097,
        "spread",
        "～を広げる"
      ],
      [
        1098,
        "decline",
        "減る"
      ],
      [
        1099,
        "reverse",
        "～を逆転する"
      ],
      [
        1100,
        "alter",
        "～を変える"
      ],
      [
        1101,
        "revolution",
        "革命"
      ],
      [
        1102,
        "reform",
        "改革"
      ],
      [
        1103,
        "stare",
        "じっと見つめる"
      ],
      [
        1104,
        "glance",
        "ちらりと見る"
      ],
      [
        1105,
        "drag",
        "～を引きずる"
      ]
    ]
  },
  {
    "week": 4,
    "entries": [
      [
        1106,
        "bend",
        "身をかがめる"
      ],
      [
        1107,
        "twist",
        "～を（ねじ）曲げる"
      ],
      [
        1108,
        "lean",
        "寄りかかる"
      ],
      [
        1109,
        "stretch",
        "～を伸ばす"
      ],
      [
        1110,
        "press",
        "～を押す"
      ],
      [
        1111,
        "grab",
        "～をつかむ"
      ],
      [
        1112,
        "capture",
        "～を捕らえる"
      ],
      [
        1113,
        "seize",
        "～をつかむ"
      ],
      [
        1114,
        "strike",
        "～を打つ"
      ],
      [
        1115,
        "beat",
        "～を打つ"
      ],
      [
        1116,
        "cast",
        "～を投げる"
      ],
      [
        1117,
        "bury",
        "～を埋める"
      ],
      [
        1118,
        "stir",
        "～を混ぜる"
      ],
      [
        1119,
        "wipe",
        "～を拭く"
      ],
      [
        1120,
        "rub",
        "～をこする"
      ],
      [
        1121,
        "tremble",
        "震える"
      ],
      [
        1122,
        "scream",
        "悲鳴を上げる"
      ],
      [
        1123,
        "nod",
        "うなずく"
      ],
      [
        1124,
        "defend",
        "～を守る"
      ],
      [
        1125,
        "retain",
        "～を保持する"
      ],
      [
        1126,
        "sustain",
        "～を維持する"
      ],
      [
        1127,
        "restore",
        "～を回復する"
      ],
      [
        1128,
        "escape",
        "逃れる"
      ],
      [
        1129,
        "acquire",
        "～を習得する"
      ],
      [
        1130,
        "secure",
        "～を確保する"
      ],
      [
        1131,
        "possess",
        "～を所有している"
      ],
      [
        1132,
        "distribute",
        "～を分配する"
      ],
      [
        1133,
        "abandon",
        "～を捨てる"
      ],
      [
        1134,
        "eliminate",
        "～を排除する"
      ],
      [
        1135,
        "dismiss",
        "～を退ける"
      ],
      [
        1136,
        "generate",
        "～を生み出す"
      ],
      [
        1137,
        "found",
        "～を創立する"
      ],
      [
        1138,
        "manufacture",
        "～を製造する"
      ],
      [
        1139,
        "yield",
        "～を産出する"
      ],
      [
        1140,
        "emerge",
        "現れる"
      ],
      [
        1141,
        "derive",
        "由来する"
      ]
    ]
  },
  {
    "week": 5,
    "entries": [
      [
        1142,
        "persist",
        "持続する"
      ],
      [
        1143,
        "vanish",
        "消える"
      ],
      [
        1144,
        "origin",
        "起源"
      ],
      [
        1145,
        "convince",
        "～に確信させる"
      ],
      [
        1146,
        "inspire",
        "（（人） to do）（人）を奮起させて～させる"
      ],
      [
        1147,
        "promote",
        "～を促進する"
      ],
      [
        1148,
        "discourage",
        "（（人） from doing）（人）が～するのをやめさせる"
      ],
      [
        1149,
        "warn",
        "～に警告する"
      ],
      [
        1150,
        "prohibit",
        "～を禁じる"
      ],
      [
        1151,
        "forbid",
        "～を禁じる"
      ],
      [
        1152,
        "force",
        "～に強いる"
      ],
      [
        1153,
        "restrict",
        "～を制限する"
      ],
      [
        1154,
        "interrupt",
        "～を中断する"
      ],
      [
        1155,
        "regulate",
        "～を規制する"
      ],
      [
        1156,
        "impose",
        "～を課す"
      ],
      [
        1157,
        "urge",
        "～をせき立てる"
      ],
      [
        1158,
        "stimulate",
        "～を刺激する"
      ],
      [
        1159,
        "distract",
        "～をそらす"
      ],
      [
        1160,
        "scare",
        "～をおびえさせる"
      ],
      [
        1161,
        "alarm",
        "～をぎょっとさせる"
      ],
      [
        1162,
        "disappoint",
        "～を失望させる"
      ],
      [
        1163,
        "entertain",
        "～を楽しませる"
      ],
      [
        1164,
        "fascinate",
        "～を魅了する"
      ],
      [
        1165,
        "tempt",
        "～を誘惑する"
      ],
      [
        1166,
        "offend",
        "～を怒らせる"
      ],
      [
        1167,
        "frustrate",
        "～を欲求不満にさせる"
      ],
      [
        1168,
        "enhance",
        "～を向上させる"
      ]
    ]
  },
  {
    "week": 6,
    "entries": [
      [
        1169,
        "honor",
        "名誉"
      ],
      [
        1170,
        "enthusiasm",
        "情熱"
      ],
      [
        1171,
        "passion",
        "情熱"
      ],
      [
        1172,
        "affection",
        "愛情"
      ],
      [
        1173,
        "sorrow",
        "悲しみ"
      ],
      [
        1174,
        "fuss",
        "大騒ぎ"
      ],
      [
        1175,
        "emotion",
        "感情"
      ],
      [
        1176,
        "sympathy",
        "同情"
      ],
      [
        1177,
        "delight",
        "～を喜ばせる"
      ],
      [
        1178,
        "charm",
        "魅力"
      ],
      [
        1179,
        "virtue",
        "美徳"
      ],
      [
        1180,
        "reluctant",
        "気が進まない"
      ],
      [
        1181,
        "willing",
        "（be － to do）嫌がらずに～する"
      ],
      [
        1182,
        "policy",
        "政策"
      ],
      [
        1183,
        "affair",
        "情勢"
      ],
      [
        1184,
        "republic",
        "共和国"
      ],
      [
        1185,
        "empire",
        "帝国"
      ],
      [
        1186,
        "council",
        "議会"
      ],
      [
        1187,
        "minister",
        "大臣"
      ],
      [
        1188,
        "candidate",
        "候補"
      ],
      [
        1189,
        "military",
        "軍事的な"
      ],
      [
        1190,
        "conservative",
        "保守的な"
      ],
      [
        1191,
        "elect",
        "～を選ぶ"
      ],
      [
        1192,
        "fortune",
        "財産"
      ],
      [
        1193,
        "credit",
        "（－ card）クレジットカード"
      ],
      [
        1194,
        "income",
        "収入"
      ],
      [
        1195,
        "property",
        "財産"
      ],
      [
        1196,
        "fund",
        "資金"
      ],
      [
        1197,
        "profit",
        "利益"
      ],
      [
        1198,
        "tax",
        "税金"
      ],
      [
        1199,
        "expense",
        "費用"
      ],
      [
        1200,
        "debt",
        "借金"
      ],
      [
        1201,
        "deposit",
        "預金"
      ],
      [
        1202,
        "insurance",
        "保険"
      ],
      [
        1203,
        "merchant",
        "商人"
      ],
      [
        1204,
        "purchase",
        "～を購入する"
      ]
    ]
  },
  {
    "week": 7,
    "entries": [
      [
        1205,
        "invest",
        "～を投資する"
      ],
      [
        1206,
        "import",
        "～を輸入する"
      ],
      [
        1207,
        "financial",
        "財政的な"
      ],
      [
        1208,
        "industry",
        "工業"
      ],
      [
        1209,
        "agriculture",
        "農業"
      ],
      [
        1210,
        "prosperity",
        "繁栄"
      ],
      [
        1211,
        "hire",
        "～を雇う"
      ],
      [
        1212,
        "employ",
        "～を雇う"
      ],
      [
        1213,
        "resign",
        "辞職する"
      ],
      [
        1214,
        "assign",
        "～を割り当てる"
      ],
      [
        1215,
        "labor",
        "労働"
      ],
      [
        1216,
        "service",
        "事業"
      ],
      [
        1217,
        "venture",
        "事業"
      ],
      [
        1218,
        "administration",
        "経営"
      ],
      [
        1219,
        "occupation",
        "職業"
      ],
      [
        1220,
        "career",
        "職業"
      ],
      [
        1221,
        "profession",
        "職業"
      ],
      [
        1222,
        "unemployment",
        "失業"
      ],
      [
        1223,
        "firm",
        "会社"
      ],
      [
        1224,
        "corporation",
        "企業"
      ],
      [
        1225,
        "branch",
        "支店"
      ],
      [
        1226,
        "agency",
        "機関"
      ],
      [
        1227,
        "reunion",
        "同窓会"
      ],
      [
        1228,
        "grocery",
        "食料雑貨店"
      ],
      [
        1229,
        "editor",
        "編集長"
      ],
      [
        1230,
        "secretary",
        "秘書"
      ],
      [
        1231,
        "colleague",
        "同僚"
      ]
    ]
  },
  {
    "week": 8,
    "entries": [
      [
        1232,
        "client",
        "依頼人"
      ],
      [
        1233,
        "conference",
        "会議"
      ],
      [
        1234,
        "code",
        "規定"
      ],
      [
        1235,
        "kingdom",
        "～界"
      ],
      [
        1236,
        "slave",
        "奴隷"
      ],
      [
        1237,
        "principle",
        "原理"
      ],
      [
        1238,
        "prejudice",
        "偏見"
      ],
      [
        1239,
        "conduct",
        "～を行う"
      ],
      [
        1240,
        "gender",
        "性"
      ],
      [
        1241,
        "authority",
        "権威"
      ],
      [
        1242,
        "trend",
        "風潮"
      ],
      [
        1243,
        "duty",
        "義務"
      ],
      [
        1244,
        "access",
        "利用する権利"
      ],
      [
        1245,
        "obligation",
        "責務"
      ],
      [
        1246,
        "institution",
        "機関"
      ],
      [
        1247,
        "poverty",
        "貧困"
      ],
      [
        1248,
        "immigrant",
        "移民"
      ],
      [
        1249,
        "divorce",
        "離婚する"
      ],
      [
        1250,
        "racial",
        "人種の"
      ],
      [
        1251,
        "ethnic",
        "民族の"
      ],
      [
        1252,
        "donate",
        "～を寄付する"
      ],
      [
        1253,
        "liberty",
        "自由"
      ],
      [
        1254,
        "justice",
        "正義"
      ],
      [
        1255,
        "welfare",
        "福祉"
      ],
      [
        1256,
        "security",
        "安全"
      ],
      [
        1257,
        "aid",
        "援助"
      ],
      [
        1258,
        "religion",
        "宗教"
      ],
      [
        1259,
        "myth",
        "神話"
      ],
      [
        1260,
        "funeral",
        "葬式"
      ],
      [
        1261,
        "heaven",
        "天国"
      ],
      [
        1262,
        "faith",
        "信仰"
      ],
      [
        1263,
        "sacred",
        "神聖な"
      ],
      [
        1264,
        "fate",
        "運命"
      ],
      [
        1265,
        "destiny",
        "運命"
      ],
      [
        1266,
        "rumor",
        "うわさ"
      ],
      [
        1267,
        "context",
        "文脈"
      ]
    ]
  },
  {
    "week": 9,
    "entries": [
      [
        1268,
        "usage",
        "語法"
      ],
      [
        1269,
        "biography",
        "伝記"
      ],
      [
        1270,
        "tragedy",
        "悲劇"
      ],
      [
        1271,
        "superstition",
        "迷信"
      ],
      [
        1272,
        "document",
        "書類"
      ],
      [
        1273,
        "command",
        "言語を操る力"
      ],
      [
        1274,
        "fluent",
        "流暢な"
      ],
      [
        1275,
        "cartoon",
        "漫画"
      ],
      [
        1276,
        "statue",
        "像"
      ],
      [
        1277,
        "tune",
        "曲"
      ],
      [
        1278,
        "souvenir",
        "土産"
      ],
      [
        1279,
        "craft",
        "工芸"
      ],
      [
        1280,
        "ape",
        "類人猿"
      ],
      [
        1281,
        "cattle",
        "ウシ"
      ],
      [
        1282,
        "ecology",
        "生態"
      ],
      [
        1283,
        "species",
        "種"
      ],
      [
        1284,
        "instinct",
        "本能"
      ],
      [
        1285,
        "feed",
        "～に食べ物を与える"
      ],
      [
        1286,
        "breed",
        "繁殖する"
      ],
      [
        1287,
        "reproduce",
        "繁殖する"
      ],
      [
        1288,
        "inhabit",
        "～に生息している"
      ],
      [
        1289,
        "shade",
        "日陰"
      ],
      [
        1290,
        "desert",
        "砂漠"
      ],
      [
        1291,
        "path",
        "道"
      ],
      [
        1292,
        "trail",
        "山道"
      ],
      [
        1293,
        "stream",
        "小川"
      ],
      [
        1294,
        "canal",
        "運河"
      ],
      [
        1295,
        "volcano",
        "火山"
      ],
      [
        1296,
        "layer",
        "層"
      ],
      [
        1297,
        "atmosphere",
        "大気"
      ],
      [
        1298,
        "horizon",
        "水平線"
      ],
      [
        1299,
        "satellite",
        "衛星"
      ],
      [
        1300,
        "rural",
        "田舎の"
      ]
    ]
  }
];

registerLeapPart(HQ, {
  part: 4,
  partTitle: "Passive Vocabulary 1",
  startOrder: 255,
  weeks
});

export const units = HQ.units;
export const cards = HQ.cards;
