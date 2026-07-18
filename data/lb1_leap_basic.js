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
        1,
        "a",
        "ある"
      ],
      [
        2,
        "the",
        "暗黙の了解を示す"
      ],
      [
        3,
        "something",
        "何か"
      ],
      [
        4,
        "someone",
        "人"
      ],
      [
        5,
        "oneself",
        "他動詞の目的語"
      ],
      [
        6,
        "speak",
        "話す"
      ],
      [
        7,
        "talk",
        "話す"
      ],
      [
        8,
        "say",
        "～と言う"
      ],
      [
        9,
        "tell （人） about ～",
        "（人）に～のことを話す"
      ],
      [
        10,
        "tell （人） （that） S V",
        "（人）に～と言う"
      ],
      [
        11,
        "look at ～",
        "～を見る"
      ],
      [
        12,
        "see",
        "～が見える"
      ],
      [
        13,
        "watch",
        "～を見る"
      ],
      [
        14,
        "listen to ～",
        "～を聴く"
      ],
      [
        15,
        "hear",
        "～が聞こえる"
      ],
      [
        16,
        "language",
        "言語"
      ],
      [
        17,
        "news",
        "ニュース"
      ],
      [
        18,
        "movie",
        "映画"
      ],
      [
        19,
        "information",
        "情報"
      ],
      [
        20,
        "opinion",
        "意見"
      ],
      [
        21,
        "answer",
        "～に答える"
      ],
      [
        22,
        "write",
        "書く"
      ],
      [
        23,
        "read",
        "読む"
      ],
      [
        24,
        "take a picture",
        "写真を撮る"
      ],
      [
        25,
        "hear from ～",
        "～から連絡がある"
      ],
      [
        26,
        "get in touch with ～",
        "～に連絡を取る"
      ],
      [
        27,
        "meet",
        "～と会う"
      ],
      [
        28,
        "introduce",
        "～を紹介する"
      ],
      [
        29,
        "invite",
        "～を招く"
      ],
      [
        30,
        "join",
        "～に加わる"
      ],
      [
        31,
        "take part",
        "参加する"
      ],
      [
        32,
        "look like ～",
        "～のように見える"
      ],
      [
        33,
        "sound like ～",
        "～のように聞こえる"
      ],
      [
        34,
        "A such as B",
        "BのようなA"
      ],
      [
        35,
        "feel",
        "～と感じる"
      ],
      [
        36,
        "think （that） S V",
        "～と考える"
      ],
      [
        37,
        "think about ～",
        "～について考える"
      ],
      [
        38,
        "know （程度） about ～",
        "～について（程度）知っている"
      ],
      [
        39,
        "learn",
        "知る"
      ],
      [
        40,
        "study",
        "学ぶ"
      ]
    ]
  },
  {
    "week": 2,
    "entries": [
      [
        41,
        "find",
        "～を見つける"
      ],
      [
        42,
        "understand",
        "～を理解している"
      ],
      [
        43,
        "remember",
        "～を覚えている"
      ],
      [
        44,
        "forget",
        "～を忘れる"
      ],
      [
        45,
        "care",
        "気にする"
      ],
      [
        46,
        "have no idea",
        "さっぱり分からない"
      ],
      [
        47,
        "come up with ～",
        "～を思いつく"
      ],
      [
        48,
        "memory",
        "記憶力"
      ],
      [
        49,
        "believe （that） S V",
        "～を信じる"
      ],
      [
        50,
        "believe in ～",
        "～を信じる"
      ],
      [
        51,
        "I am sure （that） S V",
        "～を確信している"
      ],
      [
        52,
        "see if S V",
        "～かどうか確認する"
      ],
      [
        53,
        "show",
        "～を見せる"
      ],
      [
        54,
        "mean",
        "～を意味する"
      ],
      [
        55,
        "run",
        "走る"
      ],
      [
        56,
        "sit",
        "座っている"
      ],
      [
        57,
        "stand",
        "立っている"
      ],
      [
        58,
        "sleep",
        "眠る"
      ],
      [
        59,
        "hold",
        "～を持つ"
      ],
      [
        60,
        "push",
        "～を押す"
      ],
      [
        61,
        "climb",
        "～に登る"
      ],
      [
        62,
        "go up",
        "～を上がる"
      ],
      [
        63,
        "go to ～",
        "～へ行く"
      ],
      [
        64,
        "come to ～",
        "～に来る"
      ],
      [
        65,
        "visit",
        "～を訪問する"
      ],
      [
        66,
        "move",
        "動く"
      ],
      [
        67,
        "return",
        "戻る"
      ],
      [
        68,
        "travel",
        "旅行する"
      ],
      [
        69,
        "enter",
        "～に入る"
      ],
      [
        70,
        "toward",
        "～に向かって"
      ],
      [
        71,
        "go to bed",
        "床につく"
      ],
      [
        72,
        "go to school",
        "学校に通う"
      ],
      [
        73,
        "go to work",
        "仕事に行く"
      ],
      [
        74,
        "go shopping",
        "買い物に行く"
      ],
      [
        75,
        "go out",
        "外出する"
      ],
      [
        76,
        "eat out",
        "外食する"
      ],
      [
        77,
        "leave",
        "出発する"
      ],
      [
        78,
        "get to ～",
        "～に着く"
      ],
      [
        79,
        "arrive at ～",
        "～に到着する"
      ],
      [
        80,
        "ride",
        "～に乗って行く"
      ],
      [
        81,
        "get on ～",
        "～に乗る"
      ]
    ]
  },
  {
    "week": 3,
    "entries": [
      [
        82,
        "get into ～",
        "～に乗る"
      ],
      [
        83,
        "take the train",
        "電車を利用する"
      ],
      [
        84,
        "fly",
        "飛ぶ"
      ],
      [
        85,
        "park",
        "～を駐車する"
      ],
      [
        86,
        "take A to B",
        "AをBへ持って行く"
      ],
      [
        87,
        "bring A to B",
        "AをBへ持ってくる"
      ],
      [
        88,
        "carry",
        "～を運ぶ"
      ],
      [
        89,
        "pick ～ up",
        "を迎えに行く"
      ],
      [
        90,
        "get",
        "～を受け取る"
      ],
      [
        91,
        "take",
        "～を取る"
      ],
      [
        92,
        "catch",
        "～を捕まえる"
      ],
      [
        93,
        "receive",
        "～を受け取る"
      ],
      [
        94,
        "give",
        "～を与える"
      ],
      [
        95,
        "send",
        "～を送る"
      ],
      [
        96,
        "hand ～ in",
        "～を提出する"
      ],
      [
        97,
        "hand ～ out",
        "～を配布する"
      ],
      [
        98,
        "steal A from B",
        "BからAを盗む"
      ],
      [
        99,
        "keep",
        "～を取っておく"
      ],
      [
        100,
        "own",
        "自分自身の"
      ],
      [
        101,
        "look for ～",
        "～を探す"
      ],
      [
        102,
        "look ～ up",
        "～を調べる"
      ],
      [
        103,
        "there is［are］ ～",
        "～が起きる"
      ],
      [
        104,
        "happen",
        "起こる"
      ],
      [
        105,
        "appear",
        "現れる"
      ],
      [
        106,
        "show up",
        "現れる"
      ],
      [
        107,
        "come true",
        "実現する"
      ],
      [
        108,
        "break out",
        "勃発する"
      ],
      [
        109,
        "have an accident",
        "事故に遭う"
      ],
      [
        110,
        "continue",
        "～を続ける"
      ],
      [
        111,
        "keep on doing",
        "～し続ける"
      ],
      [
        112,
        "stop doing",
        "～するのをやめる"
      ],
      [
        113,
        "give ～ up",
        "～をあきらめる"
      ],
      [
        114,
        "home",
        "家"
      ],
      [
        115,
        "floor",
        "階"
      ],
      [
        116,
        "live",
        "暮らす"
      ],
      [
        117,
        "stay",
        "いる"
      ],
      [
        118,
        "stay with （人）",
        "（人）の家に泊まる"
      ],
      [
        119,
        "stay up",
        "起きている"
      ],
      [
        120,
        "take a bath",
        "お風呂に入る"
      ],
      [
        121,
        "have ～ for breakfast",
        "朝食に～を食べる"
      ],
      [
        122,
        "call",
        "～に電話する"
      ]
    ]
  },
  {
    "week": 4,
    "entries": [
      [
        123,
        "turn ～ on",
        "～をつける"
      ],
      [
        124,
        "clean",
        "～をきれいにする"
      ],
      [
        125,
        "brush",
        "～を磨く"
      ],
      [
        126,
        "put ～ away",
        "～を片付ける"
      ],
      [
        127,
        "throw ～ away",
        "～を捨てる"
      ],
      [
        128,
        "clothes",
        "服"
      ],
      [
        129,
        "wear",
        "～を身につけている"
      ],
      [
        130,
        "put ～ on",
        "～を身につける"
      ],
      [
        131,
        "take ～ off",
        "～を脱ぐ"
      ],
      [
        132,
        "get dressed",
        "服を着る"
      ],
      [
        133,
        "put",
        "～を置く"
      ],
      [
        134,
        "set",
        "～を置く"
      ],
      [
        135,
        "close",
        "～を閉める"
      ],
      [
        136,
        "hit",
        "～を打つ"
      ],
      [
        137,
        "turn ～ over",
        "～をひっくり返す"
      ],
      [
        138,
        "build",
        "～を建てる"
      ],
      [
        139,
        "be made of ～",
        "～で作られている"
      ],
      [
        140,
        "put ～ together",
        "～をまとめる"
      ],
      [
        141,
        "want to do",
        "～したい"
      ],
      [
        142,
        "would like to do",
        "～したい"
      ],
      [
        143,
        "feel like doing",
        "～したい気がする"
      ],
      [
        144,
        "enjoy",
        "～を楽しむ"
      ],
      [
        145,
        "have fun",
        "楽しむ"
      ],
      [
        146,
        "be glad to do",
        "～してうれしい"
      ],
      [
        147,
        "be interested in ～",
        "～に興味を持っている"
      ],
      [
        148,
        "look forward to ～",
        "～を楽しみにしている"
      ],
      [
        149,
        "laugh at ～",
        "～を笑う"
      ],
      [
        150,
        "favorite",
        "気に入った"
      ],
      [
        151,
        "tell （人） to do",
        "（人）に～するように言う"
      ],
      [
        152,
        "ask （人） to do",
        "（人）に～するように頼む"
      ],
      [
        153,
        "would like （人） to do",
        "（人）に～してほしい"
      ],
      [
        154,
        "advise （人） to do",
        "（人）に～するように忠告する"
      ],
      [
        155,
        "happy",
        "幸せな"
      ],
      [
        156,
        "sad",
        "悲しい"
      ],
      [
        157,
        "afraid",
        "恐れる"
      ],
      [
        158,
        "sorry",
        "すまなく思って"
      ],
      [
        159,
        "angry",
        "怒って"
      ],
      [
        160,
        "cry",
        "泣く"
      ],
      [
        161,
        "worry",
        "心配をする"
      ],
      [
        162,
        "be surprised at ～",
        "～に驚く"
      ],
      [
        163,
        "be proud of ～",
        "～を誇りに思っている"
      ]
    ]
  },
  {
    "week": 5,
    "entries": [
      [
        164,
        "life",
        "生活"
      ],
      [
        165,
        "dream",
        "夢"
      ],
      [
        166,
        "get married",
        "結婚する"
      ],
      [
        167,
        "be born",
        "生まれる"
      ],
      [
        168,
        "die",
        "死ぬ"
      ],
      [
        169,
        "win",
        "～に勝つ"
      ],
      [
        170,
        "lose",
        "～を失う"
      ],
      [
        171,
        "health",
        "健康"
      ],
      [
        172,
        "get sick",
        "病気になる"
      ],
      [
        173,
        "get well",
        "健康になる"
      ],
      [
        174,
        "stay healthy",
        "健康を保つ"
      ],
      [
        175,
        "have a cold",
        "風邪をひいている"
      ],
      [
        176,
        "human",
        "人間"
      ],
      [
        177,
        "person",
        "人"
      ],
      [
        178,
        "people",
        "人々"
      ],
      [
        179,
        "neighbor",
        "近所の人"
      ],
      [
        180,
        "help",
        "～を手伝う"
      ],
      [
        181,
        "grow",
        "成長する"
      ],
      [
        182,
        "bring ～ up",
        "～を育てる"
      ],
      [
        183,
        "take care of ～",
        "～の世話をする"
      ],
      [
        184,
        "get along with ～",
        "～とうまくやっていく"
      ],
      [
        185,
        "make friends",
        "友達になる"
      ],
      [
        186,
        "a friend from ～",
        "の友達"
      ],
      [
        187,
        "break up",
        "別れる"
      ],
      [
        188,
        "pay",
        "～を支払う"
      ],
      [
        189,
        "buy",
        "～を買う"
      ],
      [
        190,
        "sell",
        "～を売る"
      ],
      [
        191,
        "expensive",
        "高価な"
      ],
      [
        192,
        "cheap",
        "安価な"
      ],
      [
        193,
        "on sale",
        "特売で"
      ],
      [
        194,
        "job",
        "仕事"
      ],
      [
        195,
        "work",
        "仕事"
      ],
      [
        196,
        "report",
        "報告書"
      ],
      [
        197,
        "work for ～",
        "～で働いている"
      ],
      [
        198,
        "vacation",
        "休暇"
      ],
      [
        199,
        "take （期間） off",
        "（期間）の休みを取る"
      ],
      [
        200,
        "on business",
        "仕事で"
      ],
      [
        201,
        "class",
        "授業"
      ],
      [
        202,
        "homework",
        "宿題"
      ],
      [
        203,
        "paper",
        "レポ−ト"
      ],
      [
        204,
        "interview",
        "面接"
      ]
    ]
  },
  {
    "week": 6,
    "entries": [
      [
        205,
        "teach",
        "～を教える"
      ],
      [
        206,
        "on my way to school",
        "学校へ行く途中で"
      ],
      [
        207,
        "on a school trip",
        "学校の旅行で"
      ],
      [
        208,
        "foreign",
        "外国の"
      ],
      [
        209,
        "abroad",
        "海外へ"
      ],
      [
        210,
        "international",
        "国際的な"
      ],
      [
        211,
        "country",
        "国"
      ],
      [
        212,
        "town",
        "町"
      ],
      [
        213,
        "street",
        "通り"
      ],
      [
        214,
        "begin",
        "～を始める"
      ],
      [
        215,
        "finish",
        "～を終える"
      ],
      [
        216,
        "be over",
        "終わった"
      ],
      [
        217,
        "be done with ～",
        "～を終えている"
      ],
      [
        218,
        "become",
        "～になる"
      ],
      [
        219,
        "turn",
        "～に変わる"
      ],
      [
        220,
        "change",
        "変わる"
      ],
      [
        221,
        "learn to do",
        "～できるようになる"
      ],
      [
        222,
        "come to do",
        "～するようになる"
      ],
      [
        223,
        "get used to ～",
        "～に慣れる"
      ],
      [
        224,
        "go bad",
        "悪くなる"
      ],
      [
        225,
        "problem",
        "問題"
      ],
      [
        226,
        "solve",
        "～を解決する"
      ],
      [
        227,
        "do well",
        "うまくやる"
      ],
      [
        228,
        "decide",
        "～を決定する"
      ],
      [
        229,
        "choose",
        "～を選ぶ"
      ],
      [
        230,
        "break",
        "～を壊す"
      ],
      [
        231,
        "break down",
        "故障する"
      ],
      [
        232,
        "fall",
        "落ちる"
      ],
      [
        233,
        "drop",
        "～を落とす"
      ],
      [
        234,
        "busy",
        "忙しい"
      ],
      [
        235,
        "free",
        "自由の"
      ],
      [
        236,
        "careful",
        "注意深い"
      ],
      [
        237,
        "kind",
        "親切な"
      ],
      [
        238,
        "poor",
        "貧しい"
      ],
      [
        239,
        "shy",
        "恥ずかしがりの"
      ],
      [
        240,
        "be good at ～",
        "～が得意だ"
      ],
      [
        241,
        "be able to do",
        "～する能力がある"
      ],
      [
        242,
        "be tired from ～",
        "～で疲れる"
      ],
      [
        243,
        "easy",
        "簡単な"
      ],
      [
        244,
        "difficult",
        "難しい"
      ]
    ]
  },
  {
    "week": 7,
    "entries": [
      [
        245,
        "quiet",
        "静かな"
      ],
      [
        246,
        "safe",
        "安全な"
      ],
      [
        247,
        "true",
        "真実で"
      ],
      [
        248,
        "wrong",
        "間違っている"
      ],
      [
        249,
        "different",
        "異なる"
      ],
      [
        250,
        "be covered with ～",
        "～で覆われている"
      ],
      [
        251,
        "be full of ～",
        "～でいっぱいだ"
      ],
      [
        252,
        "important",
        "重要な"
      ],
      [
        253,
        "necessary",
        "必要な"
      ],
      [
        254,
        "large",
        "大きい"
      ],
      [
        255,
        "small",
        "小さい"
      ],
      [
        256,
        "tall",
        "高い"
      ],
      [
        257,
        "short",
        "短い"
      ],
      [
        258,
        "only",
        "ただ～にすぎない"
      ],
      [
        259,
        "even",
        "さえも"
      ],
      [
        260,
        "each",
        "各々"
      ],
      [
        261,
        "other",
        "ほかの物・人"
      ],
      [
        262,
        "another",
        "ほかの1つ"
      ],
      [
        263,
        "each other",
        "お互い"
      ],
      [
        264,
        "either A or B",
        "AかBかのどちらか"
      ],
      [
        265,
        "neither A nor B",
        "AもBも～ない"
      ],
      [
        266,
        "both A and B",
        "AもBも両方とも"
      ],
      [
        267,
        "not A but B",
        "AではなくてB"
      ],
      [
        268,
        "not only A but （also） B",
        "AだけでなくBまでも"
      ],
      [
        269,
        "at least",
        "少なくとも"
      ],
      [
        270,
        "the same ～",
        "同じ～"
      ],
      [
        271,
        "especially",
        "特に"
      ],
      [
        272,
        "have （程度） to do with ～",
        "～と（程度）の関係がある"
      ],
      [
        273,
        "that of ～",
        "～のそれ"
      ],
      [
        274,
        "some",
        "～もある"
      ],
      [
        275,
        "any",
        "何か"
      ],
      [
        276,
        "many",
        "多くの～"
      ],
      [
        277,
        "much",
        "多くの～"
      ],
      [
        278,
        "a few ～",
        "いくらかの～"
      ],
      [
        279,
        "a little ～",
        "少量の～"
      ],
      [
        280,
        "a lot of ～",
        "多くの～"
      ],
      [
        281,
        "a piece of ～",
        "1つの～"
      ],
      [
        282,
        "a couple of ～",
        "2つの"
      ],
      [
        283,
        "thousand",
        "1000"
      ],
      [
        284,
        "thousands of ～",
        "何千もの～"
      ],
      [
        285,
        "（数字）percent",
        "～パーセント"
      ]
    ]
  },
  {
    "week": 8,
    "entries": [
      [
        286,
        "all",
        "全ての～"
      ],
      [
        287,
        "whole",
        "～全体"
      ],
      [
        288,
        "have a ～ time",
        "～な時間を過ごす"
      ],
      [
        289,
        "spend",
        "～を費やす"
      ],
      [
        290,
        "waste",
        "～を浪費する"
      ],
      [
        291,
        "put ～ off",
        "～を延期する"
      ],
      [
        292,
        "be going to do",
        "～するつもりだ"
      ],
      [
        293,
        "try",
        "～を試す"
      ],
      [
        294,
        "plan",
        "～を計画する"
      ],
      [
        295,
        "carry ～ out",
        "～を実行する"
      ],
      [
        296,
        "behind schedule",
        "予定より遅れて"
      ],
      [
        297,
        "wait for ～",
        "～を待つ"
      ],
      [
        298,
        "keep （人） waiting",
        "（人）を待たせる"
      ],
      [
        299,
        "in time",
        "間に合って"
      ],
      [
        300,
        "on time",
        "時間どおりに"
      ],
      [
        301,
        "late",
        "遅れた"
      ],
      [
        302,
        "early",
        "早く"
      ],
      [
        303,
        "quickly",
        "急いで"
      ],
      [
        304,
        "soon",
        "すぐに"
      ],
      [
        305,
        "right away",
        "すぐに"
      ],
      [
        306,
        "at once",
        "すぐに"
      ],
      [
        307,
        "（期間） later",
        "（期間）後に"
      ],
      [
        308,
        "in （期間）",
        "（期間）で"
      ],
      [
        309,
        "at first",
        "最初は"
      ],
      [
        310,
        "for the first time",
        "初めて"
      ],
      [
        311,
        "in the end",
        "最後には"
      ],
      [
        312,
        "at last",
        "とうとう"
      ],
      [
        313,
        "after all",
        "結局"
      ],
      [
        314,
        "first",
        "第1の"
      ],
      [
        315,
        "second",
        "第2の"
      ],
      [
        316,
        "finally",
        "最後に"
      ],
      [
        317,
        "have been to ～",
        "～へ行ったことがある"
      ],
      [
        318,
        "ever",
        "これまでに"
      ],
      [
        319,
        "never",
        "決して～ない"
      ],
      [
        320,
        "experience",
        "経験"
      ],
      [
        321,
        "already",
        "すでに"
      ],
      [
        322,
        "yet",
        "まだ"
      ],
      [
        323,
        "still",
        "まだ"
      ],
      [
        324,
        "at 9 a.m.",
        "午前9時に"
      ],
      [
        325,
        "on February 14th",
        "2月14日に"
      ],
      [
        326,
        "on weekends",
        "週末に"
      ]
    ]
  },
  {
    "week": 9,
    "entries": [
      [
        327,
        "every day",
        "毎日"
      ],
      [
        328,
        "one day",
        "ある日"
      ],
      [
        329,
        "these days",
        "この頃"
      ],
      [
        330,
        "the other day",
        "先日"
      ],
      [
        331,
        "in 2020",
        "2020年に"
      ],
      [
        332,
        "last year",
        "昨年"
      ],
      [
        333,
        "time",
        "時間"
      ],
      [
        334,
        "age",
        "年齢"
      ],
      [
        335,
        "present",
        "現在"
      ],
      [
        336,
        "past",
        "過去"
      ],
      [
        337,
        "future",
        "将来"
      ],
      [
        338,
        "noon",
        "正午"
      ],
      [
        339,
        "all day",
        "一日中"
      ],
      [
        340,
        "all the way",
        "ずっと"
      ],
      [
        341,
        "by",
        "～までには"
      ],
      [
        342,
        "until",
        "～まで"
      ],
      [
        343,
        "during",
        "～の間"
      ],
      [
        344,
        "while",
        "～している間に"
      ],
      [
        345,
        "since",
        "～以来"
      ],
      [
        346,
        "once",
        "かつて"
      ],
      [
        347,
        "used to",
        "以前は～だった"
      ],
      [
        348,
        "not ～ anymore",
        "もう～ない"
      ],
      [
        349,
        "no longer",
        "もはや～ない"
      ],
      [
        350,
        "here",
        "ここに"
      ],
      [
        351,
        "there",
        "そこに"
      ],
      [
        352,
        "outside",
        "外に"
      ],
      [
        353,
        "at home",
        "家で"
      ],
      [
        354,
        "between A and B",
        "AとBの間に"
      ],
      [
        355,
        "in front of ～",
        "～の前に"
      ],
      [
        356,
        "behind",
        "～の後ろに"
      ],
      [
        357,
        "next to ～",
        "～の隣に"
      ],
      [
        358,
        "far away from ～",
        "～から遠い"
      ],
      [
        359,
        "near",
        "～の近くに"
      ],
      [
        360,
        "across from ～",
        "～の向かい側に"
      ],
      [
        361,
        "all over ～",
        "～の中で"
      ],
      [
        362,
        "out of ～",
        "～から"
      ],
      [
        363,
        "together",
        "一緒に"
      ],
      [
        364,
        "without",
        "～なしで"
      ],
      [
        365,
        "alone",
        "一人で"
      ],
      [
        366,
        "reason",
        "理由"
      ],
      [
        367,
        "because",
        "～なので"
      ]
    ]
  },
  {
    "week": 10,
    "entries": [
      [
        368,
        "because of ～",
        "～のために"
      ],
      [
        369,
        "thanks to ～",
        "～のおかげで"
      ],
      [
        370,
        "way",
        "方法"
      ],
      [
        371,
        "how to do",
        "いかに～するのか"
      ],
      [
        372,
        "in order to do",
        "～するために"
      ],
      [
        373,
        "by train",
        "電車で"
      ],
      [
        374,
        "with a pencil",
        "鉛筆で"
      ],
      [
        375,
        "on YouTube",
        "ユ−チュ−ブで"
      ],
      [
        376,
        "online",
        "オンラインで"
      ],
      [
        377,
        "in English",
        "英語で"
      ],
      [
        378,
        "always",
        "いつも"
      ],
      [
        379,
        "not ～ always",
        "必ずしも～ない"
      ],
      [
        380,
        "usually",
        "普段は"
      ],
      [
        381,
        "often",
        "しばしば"
      ],
      [
        382,
        "sometimes",
        "時々"
      ],
      [
        383,
        "by chance",
        "偶然に"
      ],
      [
        384,
        "almost",
        "ほとんど"
      ],
      [
        385,
        "most",
        "最も"
      ],
      [
        386,
        "least",
        "最も～でなく"
      ],
      [
        387,
        "really",
        "本当に"
      ],
      [
        388,
        "enough",
        "十分な"
      ],
      [
        389,
        "（比較級） than ～",
        "～より…"
      ],
      [
        390,
        "as ～ as ...",
        "…と同じくらい～"
      ],
      [
        391,
        "as ～ as S can",
        "できるだけ～"
      ],
      [
        392,
        "not ～ at all",
        "まったく～ない"
      ],
      [
        393,
        "too ～ （for A） to do",
        "あまりに～なので（Aは）…できない"
      ],
      [
        394,
        "so",
        "これほど"
      ],
      [
        395,
        "such",
        "そのような"
      ],
      [
        396,
        "quite",
        "けっこう"
      ],
      [
        397,
        "could",
        "～かもしれない"
      ],
      [
        398,
        "should",
        "～すべきだ"
      ],
      [
        399,
        "have to do",
        "～しなければならない"
      ],
      [
        400,
        "do one's best",
        "全力を尽くす"
      ]
    ]
  }
];

registerLeapPart(HQ, {
  part: 1,
  partTitle: "Basic Vocabulary & Idioms",
  startOrder: 177,
  weeks
});

export const units = HQ.units;
export const cards = HQ.cards;
