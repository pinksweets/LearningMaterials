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
        1301,
        "flow",
        "流れる"
      ],
      [
        1302,
        "melt",
        "溶ける"
      ],
      [
        1303,
        "float",
        "浮かぶ"
      ],
      [
        1304,
        "sink",
        "沈む"
      ],
      [
        1305,
        "chemical",
        "化学物質"
      ],
      [
        1306,
        "fuel",
        "燃料"
      ],
      [
        1307,
        "ray",
        "光線"
      ],
      [
        1308,
        "oxygen",
        "酸素"
      ],
      [
        1309,
        "cell",
        "細胞"
      ],
      [
        1310,
        "gene",
        "遺伝子"
      ],
      [
        1311,
        "molecule",
        "分子"
      ],
      [
        1312,
        "compound",
        "化合物"
      ],
      [
        1313,
        "phenomenon",
        "現象"
      ],
      [
        1314,
        "laboratory",
        "研究室"
      ],
      [
        1315,
        "analysis",
        "分析"
      ],
      [
        1316,
        "launch",
        "～を打ち上げる"
      ],
      [
        1317,
        "nuclear",
        "原子力の"
      ],
      [
        1318,
        "solid",
        "固体の"
      ],
      [
        1319,
        "symptom",
        "症状"
      ],
      [
        1320,
        "cure",
        "～を治療する"
      ],
      [
        1321,
        "strain",
        "負担"
      ],
      [
        1322,
        "chest",
        "胸"
      ],
      [
        1323,
        "tongue",
        "舌"
      ],
      [
        1324,
        "cancer",
        "がん"
      ],
      [
        1325,
        "surgery",
        "手術"
      ],
      [
        1326,
        "pale",
        "青白い"
      ],
      [
        1327,
        "recover",
        "回復する"
      ],
      [
        1328,
        "nourish",
        "～に栄養を与える"
      ],
      [
        1329,
        "sore",
        "痛い"
      ],
      [
        1330,
        "pain",
        "苦痛"
      ],
      [
        1331,
        "wound",
        "傷"
      ],
      [
        1332,
        "lung",
        "肺"
      ],
      [
        1333,
        "vision",
        "視力"
      ],
      [
        1334,
        "resident",
        "住人"
      ],
      [
        1335,
        "routine",
        "決まりきった仕事"
      ]
    ]
  },
  {
    "week": 2,
    "entries": [
      [
        1336,
        "nap",
        "昼寝"
      ],
      [
        1337,
        "household",
        "所帯"
      ],
      [
        1338,
        "load",
        "荷"
      ],
      [
        1339,
        "architecture",
        "建築"
      ],
      [
        1340,
        "pile",
        "積み重ね"
      ],
      [
        1341,
        "structure",
        "構造"
      ],
      [
        1342,
        "edge",
        "端"
      ],
      [
        1343,
        "element",
        "要素"
      ],
      [
        1344,
        "function",
        "機能"
      ],
      [
        1345,
        "internal",
        "内部の"
      ],
      [
        1346,
        "connect",
        "～をつなげる"
      ],
      [
        1347,
        "relate",
        "～を関連づける"
      ],
      [
        1348,
        "associate",
        "～を関連づける"
      ],
      [
        1349,
        "stick",
        "～を貼り付ける"
      ],
      [
        1350,
        "combine",
        "～を結びつける"
      ],
      [
        1351,
        "unite",
        "団結する"
      ],
      [
        1352,
        "link",
        "関連"
      ],
      [
        1353,
        "bond",
        "きずな"
      ],
      [
        1354,
        "isolation",
        "孤立"
      ],
      [
        1355,
        "string",
        "ひも"
      ],
      [
        1356,
        "tie",
        "～を縛る"
      ],
      [
        1357,
        "fix",
        "～を固定する"
      ],
      [
        1358,
        "suspend",
        "～を吊るす"
      ],
      [
        1359,
        "scatter",
        "～をまき散らす"
      ],
      [
        1360,
        "release",
        "～を解放する"
      ],
      [
        1361,
        "emit",
        "～を排出する"
      ],
      [
        1362,
        "spectator",
        "観客"
      ]
    ]
  },
  {
    "week": 3,
    "entries": [
      [
        1363,
        "relative",
        "親戚"
      ],
      [
        1364,
        "citizen",
        "市民"
      ],
      [
        1365,
        "acquaintance",
        "知人"
      ],
      [
        1366,
        "committee",
        "委員会"
      ],
      [
        1367,
        "folk",
        "人々"
      ],
      [
        1368,
        "mayor",
        "市長"
      ],
      [
        1369,
        "humanity",
        "人類"
      ],
      [
        1370,
        "individual",
        "個人"
      ],
      [
        1371,
        "semester",
        "学期"
      ],
      [
        1372,
        "biology",
        "生物学"
      ],
      [
        1373,
        "philosophy",
        "哲学"
      ],
      [
        1374,
        "geography",
        "地理"
      ],
      [
        1375,
        "psychology",
        "心理学"
      ],
      [
        1376,
        "logic",
        "論理"
      ],
      [
        1377,
        "instruction",
        "指示"
      ],
      [
        1378,
        "discipline",
        "しつけ"
      ],
      [
        1379,
        "address",
        "～に取り組む"
      ],
      [
        1380,
        "handle",
        "～を扱う"
      ],
      [
        1381,
        "arrange",
        "～を手配する"
      ],
      [
        1382,
        "resolve",
        "～を解決する"
      ],
      [
        1383,
        "settle",
        "～を解決する"
      ],
      [
        1384,
        "cope",
        "（with ～）（～に）対処する"
      ],
      [
        1385,
        "strategy",
        "戦略"
      ],
      [
        1386,
        "approach",
        "取り組み方"
      ],
      [
        1387,
        "attempt",
        "試み"
      ],
      [
        1388,
        "clue",
        "手がかり"
      ],
      [
        1389,
        "challenge",
        "難問"
      ],
      [
        1390,
        "bump",
        "ぶつかる"
      ],
      [
        1391,
        "crash",
        "激突する"
      ],
      [
        1392,
        "burst",
        "破裂する"
      ],
      [
        1393,
        "explode",
        "爆発する"
      ],
      [
        1394,
        "collapse",
        "崩壊する"
      ],
      [
        1395,
        "crisis",
        "危機"
      ],
      [
        1396,
        "threat",
        "脅威"
      ],
      [
        1397,
        "obstacle",
        "障害"
      ]
    ]
  },
  {
    "week": 4,
    "entries": [
      [
        1398,
        "burden",
        "重荷"
      ],
      [
        1399,
        "poison",
        "毒"
      ],
      [
        1400,
        "harm",
        "害"
      ],
      [
        1401,
        "rob",
        "～を襲う"
      ],
      [
        1402,
        "deprive",
        "（A of B）（A）から（Bを）奪う"
      ],
      [
        1403,
        "sacrifice",
        "～を犠牲にする"
      ],
      [
        1404,
        "drown",
        "溺れ死ぬ"
      ],
      [
        1405,
        "examine",
        "～を調査する"
      ],
      [
        1406,
        "investigate",
        "～を調査する"
      ],
      [
        1407,
        "search",
        "～を捜す"
      ],
      [
        1408,
        "monitor",
        "～を監視する"
      ],
      [
        1409,
        "detect",
        "～を探知する"
      ],
      [
        1410,
        "inquiry",
        "調査"
      ],
      [
        1411,
        "trace",
        "～を捜し出す"
      ],
      [
        1412,
        "proof",
        "証拠"
      ],
      [
        1413,
        "invade",
        "～を侵害する"
      ],
      [
        1414,
        "arrest",
        "～を逮捕する"
      ],
      [
        1415,
        "cheat",
        "ごまかす"
      ],
      [
        1416,
        "murder",
        "殺人"
      ],
      [
        1417,
        "witness",
        "目撃者"
      ],
      [
        1418,
        "prison",
        "刑務所"
      ],
      [
        1419,
        "insult",
        "侮辱"
      ],
      [
        1420,
        "abuse",
        "虐待"
      ],
      [
        1421,
        "enemy",
        "敵"
      ],
      [
        1422,
        "sword",
        "剣"
      ],
      [
        1423,
        "victim",
        "犠牲者"
      ],
      [
        1424,
        "conflict",
        "対立"
      ],
      [
        1425,
        "triumph",
        "勝利"
      ],
      [
        1426,
        "conquer",
        "～を征服する"
      ],
      [
        1427,
        "dominate",
        "～を支配する"
      ],
      [
        1428,
        "compete",
        "競争する"
      ],
      [
        1429,
        "interfere",
        "邪魔する"
      ],
      [
        1430,
        "controversial",
        "論争を招く"
      ],
      [
        1431,
        "generous",
        "気前のよい"
      ]
    ]
  },
  {
    "week": 5,
    "entries": [
      [
        1432,
        "curious",
        "好奇心が強い"
      ],
      [
        1433,
        "aggressive",
        "攻撃的な"
      ],
      [
        1434,
        "stupid",
        "ばかな"
      ],
      [
        1435,
        "jealous",
        "嫉妬した"
      ],
      [
        1436,
        "modest",
        "謙虚な"
      ],
      [
        1437,
        "brilliant",
        "輝いている"
      ],
      [
        1438,
        "lively",
        "生き生きとした"
      ],
      [
        1439,
        "pure",
        "純粋な"
      ],
      [
        1440,
        "steady",
        "着実な"
      ],
      [
        1441,
        "stable",
        "安定した"
      ],
      [
        1442,
        "casual",
        "気楽な"
      ],
      [
        1443,
        "mature",
        "成熟した"
      ],
      [
        1444,
        "magnificent",
        "壮大な"
      ],
      [
        1445,
        "incredible",
        "信じられない"
      ],
      [
        1446,
        "genuine",
        "心からの"
      ],
      [
        1447,
        "superior",
        "（be － to ～）～より優れている"
      ],
      [
        1448,
        "luxury",
        "高級"
      ],
      [
        1449,
        "negative",
        "否定的な"
      ],
      [
        1450,
        "vague",
        "曖昧な"
      ],
      [
        1451,
        "rough",
        "粗い"
      ],
      [
        1452,
        "severe",
        "厳しい"
      ],
      [
        1453,
        "passive",
        "受動的な"
      ],
      [
        1454,
        "primitive",
        "原始的な"
      ],
      [
        1455,
        "insane",
        "正気でない"
      ],
      [
        1456,
        "odd",
        "奇妙な"
      ],
      [
        1457,
        "horrible",
        "とてもひどい"
      ],
      [
        1458,
        "miserable",
        "悲惨な"
      ],
      [
        1459,
        "cruel",
        "残酷な"
      ],
      [
        1460,
        "ridiculous",
        "ばかげた"
      ],
      [
        1461,
        "nasty",
        "不快な"
      ],
      [
        1462,
        "delicate",
        "繊細な"
      ],
      [
        1463,
        "principal",
        "主要な"
      ],
      [
        1464,
        "primary",
        "主な"
      ],
      [
        1465,
        "precious",
        "貴重な"
      ],
      [
        1466,
        "essential",
        "不可欠な"
      ],
      [
        1467,
        "critical",
        "重大な"
      ]
    ]
  },
  {
    "week": 6,
    "entries": [
      [
        1468,
        "crucial",
        "重大な"
      ],
      [
        1469,
        "fundamental",
        "根本的な"
      ],
      [
        1470,
        "ultimate",
        "究極の"
      ],
      [
        1471,
        "relevant",
        "関連のある"
      ],
      [
        1472,
        "priority",
        "優先"
      ],
      [
        1473,
        "logical",
        "論理的な"
      ],
      [
        1474,
        "efficient",
        "能率的な"
      ],
      [
        1475,
        "reasonable",
        "理にかなった"
      ],
      [
        1476,
        "rational",
        "理性的な"
      ],
      [
        1477,
        "plain",
        "明白な"
      ],
      [
        1478,
        "obvious",
        "明白な"
      ],
      [
        1479,
        "vivid",
        "鮮明な"
      ],
      [
        1480,
        "remarkable",
        "注目すべき"
      ],
      [
        1481,
        "outstanding",
        "傑出した"
      ],
      [
        1482,
        "definite",
        "明確な"
      ],
      [
        1483,
        "marked",
        "際立った"
      ],
      [
        1484,
        "stuff",
        "物"
      ],
      [
        1485,
        "fragment",
        "破片"
      ],
      [
        1486,
        "brick",
        "れんが"
      ],
      [
        1487,
        "pole",
        "棒"
      ],
      [
        1488,
        "substance",
        "物質"
      ],
      [
        1489,
        "identify",
        "～を特定する"
      ],
      [
        1490,
        "separate",
        "別々の"
      ],
      [
        1491,
        "respective",
        "それぞれの"
      ],
      [
        1492,
        "given",
        "定められた"
      ],
      [
        1493,
        "particular",
        "ある特定の"
      ],
      [
        1494,
        "mutual",
        "相互の"
      ],
      [
        1495,
        "unit",
        "単位"
      ],
      [
        1496,
        "proportion",
        "比率"
      ],
      [
        1497,
        "quantity",
        "量"
      ],
      [
        1498,
        "volume",
        "容積"
      ],
      [
        1499,
        "calculate",
        "～を計算する"
      ],
      [
        1500,
        "range",
        "範囲"
      ],
      [
        1501,
        "scope",
        "範囲"
      ],
      [
        1502,
        "scale",
        "規模"
      ]
    ]
  },
  {
    "week": 7,
    "entries": [
      [
        1503,
        "enormous",
        "莫大な"
      ],
      [
        1504,
        "numerous",
        "多くの"
      ],
      [
        1505,
        "broad",
        "幅広い"
      ],
      [
        1506,
        "vast",
        "広大な"
      ],
      [
        1507,
        "huge",
        "巨大な"
      ],
      [
        1508,
        "tiny",
        "とても小さな"
      ],
      [
        1509,
        "global",
        "世界的な"
      ],
      [
        1510,
        "universal",
        "普遍的な"
      ],
      [
        1511,
        "maximum",
        "最大限"
      ],
      [
        1512,
        "sort",
        "種（類）"
      ],
      [
        1513,
        "content",
        "中身"
      ],
      [
        1514,
        "alternative",
        "代わりのもの"
      ],
      [
        1515,
        "contrast",
        "対比"
      ],
      [
        1516,
        "resemble",
        "～に似ている"
      ],
      [
        1517,
        "abstract",
        "抽象的な"
      ],
      [
        1518,
        "annual",
        "年に1 度の"
      ],
      [
        1519,
        "current",
        "最新の"
      ],
      [
        1520,
        "contemporary",
        "現代の"
      ],
      [
        1521,
        "temporary",
        "一時的な"
      ],
      [
        1522,
        "permanent",
        "永久的な"
      ],
      [
        1523,
        "brief",
        "手短な"
      ],
      [
        1524,
        "rapid",
        "急速な"
      ],
      [
        1525,
        "initial",
        "最初の"
      ],
      [
        1526,
        "immediately",
        "すぐに"
      ],
      [
        1527,
        "meanwhile",
        "その間"
      ],
      [
        1528,
        "deadline",
        "締め切り"
      ],
      [
        1529,
        "session",
        "期間"
      ],
      [
        1530,
        "era",
        "時代"
      ],
      [
        1531,
        "decade",
        "10年"
      ],
      [
        1532,
        "former",
        "前者"
      ],
      [
        1533,
        "postpone",
        "～を延期する"
      ],
      [
        1534,
        "region",
        "地域"
      ],
      [
        1535,
        "district",
        "地区"
      ],
      [
        1536,
        "border",
        "国境"
      ],
      [
        1537,
        "distant",
        "遠い"
      ]
    ]
  },
  {
    "week": 8,
    "entries": [
      [
        1538,
        "remote",
        "遠い"
      ],
      [
        1539,
        "domestic",
        "国内の"
      ],
      [
        1540,
        "locate",
        "（be －d）～に位置している"
      ],
      [
        1541,
        "occupy",
        "～を占める"
      ],
      [
        1542,
        "surround",
        "～を取り囲む"
      ],
      [
        1543,
        "occasion",
        "場合"
      ],
      [
        1544,
        "incident",
        "出来事"
      ],
      [
        1545,
        "circumstance",
        "状況"
      ],
      [
        1546,
        "outcome",
        "結果"
      ],
      [
        1547,
        "rare",
        "珍しい"
      ],
      [
        1548,
        "urgent",
        "緊急の"
      ],
      [
        1549,
        "inevitable",
        "避けられない"
      ],
      [
        1550,
        "accidental",
        "偶然の"
      ],
      [
        1551,
        "tense",
        "張り詰めた"
      ],
      [
        1552,
        "calm",
        "落ち着いた"
      ],
      [
        1553,
        "dull",
        "退屈な"
      ],
      [
        1554,
        "awkward",
        "ぎこちない"
      ],
      [
        1555,
        "steep",
        "険しい"
      ],
      [
        1556,
        "shallow",
        "浅い"
      ],
      [
        1557,
        "spare",
        "余分な"
      ],
      [
        1558,
        "mess",
        "乱雑"
      ],
      [
        1559,
        "shortage",
        "不足"
      ],
      [
        1560,
        "method",
        "方法"
      ],
      [
        1561,
        "medium",
        "手段"
      ],
      [
        1562,
        "consequence",
        "結果"
      ],
      [
        1563,
        "process",
        "過程"
      ],
      [
        1564,
        "storage",
        "貯蔵"
      ],
      [
        1565,
        "equipment",
        "設備"
      ],
      [
        1566,
        "device",
        "装置"
      ],
      [
        1567,
        "means",
        "手段"
      ],
      [
        1568,
        "intend",
        "（to do）～するつもりだ"
      ],
      [
        1569,
        "aim",
        "狙う"
      ],
      [
        1570,
        "objective",
        "客観的な"
      ],
      [
        1571,
        "motive",
        "動機"
      ],
      [
        1572,
        "deliberately",
        "故意に"
      ],
      [
        1573,
        "nearly",
        "ほとんど"
      ]
    ]
  },
  {
    "week": 9,
    "entries": [
      [
        1574,
        "largely",
        "大部分は"
      ],
      [
        1575,
        "entire",
        "全ての"
      ],
      [
        1576,
        "absolute",
        "絶対的な"
      ],
      [
        1577,
        "faint",
        "かすかな"
      ],
      [
        1578,
        "subtle",
        "かすかな"
      ],
      [
        1579,
        "abundant",
        "豊富な"
      ],
      [
        1580,
        "tremendous",
        "すさまじい"
      ],
      [
        1581,
        "extraordinary",
        "並外れた"
      ],
      [
        1582,
        "adequate",
        "十分な"
      ],
      [
        1583,
        "sufficient",
        "十分な"
      ],
      [
        1584,
        "barely",
        "かろうじて"
      ],
      [
        1585,
        "eventually",
        "最終的に"
      ],
      [
        1586,
        "approximately",
        "おおよそ"
      ],
      [
        1587,
        "frequently",
        "頻繁に"
      ],
      [
        1588,
        "seldom",
        "めったに～ない"
      ],
      [
        1589,
        "apparently",
        "見たところでは"
      ],
      [
        1590,
        "indeed",
        "実際に"
      ],
      [
        1591,
        "merely",
        "～にすぎない"
      ],
      [
        1592,
        "altogether",
        "完全に"
      ],
      [
        1593,
        "nevertheless",
        "それにもかかわらず"
      ],
      [
        1594,
        "somehow",
        "何らかの方法で"
      ],
      [
        1595,
        "thus",
        "それゆえ"
      ],
      [
        1596,
        "pretty",
        "まあまあ"
      ],
      [
        1597,
        "regardless",
        "（of ～）（～とは）無関係に"
      ],
      [
        1598,
        "despite",
        "～にもかかわらず"
      ],
      [
        1599,
        "via",
        "～経由で"
      ],
      [
        1600,
        "unless",
        "～の場合を除いて"
      ]
    ]
  }
];

registerLeapPart(HQ, {
  part: 5,
  partTitle: "Passive Vocabulary 2",
  startOrder: 282,
  weeks
});

export const units = HQ.units;
export const cards = HQ.cards;
