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
        701,
        "fish",
        "魚"
      ],
      [
        702,
        "insect",
        "昆虫"
      ],
      [
        703,
        "plant",
        "植物"
      ],
      [
        704,
        "seed",
        "種"
      ],
      [
        705,
        "harvest",
        "収穫"
      ],
      [
        706,
        "crop",
        "作物"
      ],
      [
        707,
        "nature",
        "自然"
      ],
      [
        708,
        "environment",
        "環境"
      ],
      [
        709,
        "ground",
        "地面"
      ],
      [
        710,
        "wave",
        "波"
      ],
      [
        711,
        "earthquake",
        "地震"
      ],
      [
        712,
        "disaster",
        "災害"
      ],
      [
        713,
        "planet",
        "惑星"
      ],
      [
        714,
        "solar",
        "太陽の"
      ],
      [
        715,
        "preserve",
        "～を保護する"
      ],
      [
        716,
        "pollution",
        "汚染"
      ],
      [
        717,
        "extinct",
        "絶滅した"
      ],
      [
        718,
        "freeze",
        "凍る"
      ],
      [
        719,
        "burn",
        "焼ける"
      ],
      [
        720,
        "reflect",
        "～を反射する"
      ],
      [
        721,
        "weather",
        "天候"
      ],
      [
        722,
        "climate",
        "気候"
      ],
      [
        723,
        "forecast",
        "予報"
      ],
      [
        724,
        "temperature",
        "温度"
      ],
      [
        725,
        "degree",
        "度"
      ],
      [
        726,
        "rain",
        "雨が降る"
      ],
      [
        727,
        "humid",
        "湿気が多い"
      ],
      [
        728,
        "science",
        "科学"
      ],
      [
        729,
        "technology",
        "技術"
      ],
      [
        730,
        "research",
        "研究"
      ],
      [
        731,
        "theory",
        "理論"
      ],
      [
        732,
        "experiment",
        "実験"
      ],
      [
        733,
        "material",
        "材料"
      ],
      [
        734,
        "ingredient",
        "材料"
      ],
      [
        735,
        "raw",
        "生の"
      ],
      [
        736,
        "artificial",
        "人工的な"
      ],
      [
        737,
        "electric",
        "電気の"
      ],
      [
        738,
        "plastic",
        "ビニールの"
      ],
      [
        739,
        "invent",
        "～を発明する"
      ],
      [
        740,
        "discover",
        "～を発見する"
      ]
    ]
  },
  {
    "week": 2,
    "entries": [
      [
        741,
        "observe",
        "～を観察する"
      ],
      [
        742,
        "disease",
        "病気"
      ],
      [
        743,
        "fever",
        "熱"
      ],
      [
        744,
        "patient",
        "患者"
      ],
      [
        745,
        "medicine",
        "薬"
      ],
      [
        746,
        "medical",
        "医療の"
      ],
      [
        747,
        "relax",
        "リラックスする"
      ],
      [
        748,
        "rest",
        "休憩"
      ],
      [
        749,
        "suffer",
        "苦しむ"
      ],
      [
        750,
        "exhaust",
        "～を疲れ果てさせる"
      ],
      [
        751,
        "stress",
        "ストレス"
      ],
      [
        752,
        "disabled",
        "障がいのある"
      ],
      [
        753,
        "physical",
        "身体的な"
      ],
      [
        754,
        "mental",
        "精神の"
      ],
      [
        755,
        "strength",
        "力"
      ],
      [
        756,
        "muscle",
        "筋肉"
      ],
      [
        757,
        "tear",
        "涙"
      ],
      [
        758,
        "sweat",
        "汗"
      ],
      [
        759,
        "sense",
        "感覚"
      ],
      [
        760,
        "smell",
        "におい"
      ],
      [
        761,
        "taste",
        "～の味がする"
      ],
      [
        762,
        "form",
        "形態"
      ],
      [
        763,
        "shape",
        "形"
      ],
      [
        764,
        "surface",
        "表面"
      ],
      [
        765,
        "aspect",
        "側面"
      ],
      [
        766,
        "system",
        "制度"
      ],
      [
        767,
        "detail",
        "詳細"
      ],
      [
        768,
        "consist",
        "構成されている"
      ],
      [
        769,
        "compose",
        "～を構成する"
      ],
      [
        770,
        "organize",
        "～をまとめる"
      ],
      [
        771,
        "include",
        "～を含む"
      ],
      [
        772,
        "contain",
        "～を含む"
      ],
      [
        773,
        "attach",
        "～をくっつける"
      ],
      [
        774,
        "base",
        "～の基礎を置く"
      ],
      [
        775,
        "face",
        "～に直面する"
      ],
      [
        776,
        "expose",
        "～をさらす"
      ],
      [
        777,
        "avoid",
        "～を避ける"
      ],
      [
        778,
        "involve",
        "（be −d in ～）（～に）巻き込まれる"
      ],
      [
        779,
        "deal",
        "扱う"
      ],
      [
        780,
        "treat",
        "～を扱う"
      ]
    ]
  },
  {
    "week": 3,
    "entries": [
      [
        781,
        "difficulty",
        "困難"
      ],
      [
        782,
        "issue",
        "問題"
      ],
      [
        783,
        "get rid of ～",
        "～を処分する"
      ],
      [
        784,
        "remove",
        "～を取り除く"
      ],
      [
        785,
        "relieve",
        "～を和らげる"
      ],
      [
        786,
        "abolish",
        "～を廃止する"
      ],
      [
        787,
        "hide",
        "～を隠す"
      ],
      [
        788,
        "hurt",
        "痛む"
      ],
      [
        789,
        "injure",
        "～を痛める"
      ],
      [
        790,
        "damage",
        "～に損害を与える"
      ],
      [
        791,
        "destroy",
        "～を破壊する"
      ],
      [
        792,
        "spoil",
        "～を台無しにする"
      ],
      [
        793,
        "ruin",
        "～を台無しにする"
      ],
      [
        794,
        "protect",
        "～を守る"
      ],
      [
        795,
        "quit",
        "～をやめる"
      ],
      [
        796,
        "retire",
        "引退する"
      ],
      [
        797,
        "prevent",
        "～を妨げる"
      ],
      [
        798,
        "limit",
        "～を制限する"
      ],
      [
        799,
        "ban",
        "禁止"
      ],
      [
        800,
        "refuse",
        "～するのを拒む"
      ],
      [
        801,
        "reject",
        "～を拒絶する"
      ],
      [
        802,
        "ignore",
        "～を無視する"
      ],
      [
        803,
        "deny",
        "～を否定する"
      ],
      [
        804,
        "check",
        "～を調べる"
      ],
      [
        805,
        "explore",
        "～を探検する"
      ],
      [
        806,
        "survey",
        "調査"
      ],
      [
        807,
        "statistic",
        "統計"
      ],
      [
        808,
        "evidence",
        "証拠"
      ],
      [
        809,
        "danger",
        "危険"
      ],
      [
        810,
        "crime",
        "犯罪"
      ],
      [
        811,
        "trick",
        "いたずら"
      ],
      [
        812,
        "punish",
        "～を罰する"
      ],
      [
        813,
        "guilty",
        "申し訳なく思う"
      ],
      [
        814,
        "innocent",
        "無実の"
      ],
      [
        815,
        "smart",
        "利口な"
      ],
      [
        816,
        "intelligent",
        "知的な"
      ],
      [
        817,
        "polite",
        "礼儀正しい"
      ],
      [
        818,
        "active",
        "積極的な"
      ],
      [
        819,
        "positive",
        "前向きな"
      ],
      [
        820,
        "brave",
        "勇敢な"
      ]
    ]
  },
  {
    "week": 4,
    "entries": [
      [
        821,
        "energetic",
        "活発な"
      ],
      [
        822,
        "eager",
        "熱心な"
      ],
      [
        823,
        "honest",
        "正直な"
      ],
      [
        824,
        "punctual",
        "時間を守る"
      ],
      [
        825,
        "confidence",
        "自信"
      ],
      [
        826,
        "courage",
        "勇気"
      ],
      [
        827,
        "rude",
        "無礼な"
      ],
      [
        828,
        "lazy",
        "怠惰な"
      ],
      [
        829,
        "ugly",
        "醜い"
      ],
      [
        830,
        "silly",
        "ばかな"
      ],
      [
        831,
        "nervous",
        "あがって"
      ],
      [
        832,
        "selfish",
        "利己的な"
      ],
      [
        833,
        "character",
        "性格"
      ],
      [
        834,
        "characteristic",
        "特徴"
      ],
      [
        835,
        "feature",
        "特徴"
      ],
      [
        836,
        "quality",
        "質"
      ],
      [
        837,
        "advantage",
        "利点"
      ],
      [
        838,
        "fault",
        "欠点"
      ],
      [
        839,
        "correct",
        "正確な"
      ],
      [
        840,
        "fair",
        "公正な"
      ],
      [
        841,
        "ideal",
        "理想的な"
      ],
      [
        842,
        "appropriate",
        "適切な"
      ],
      [
        843,
        "proper",
        "適切な"
      ],
      [
        844,
        "precise",
        "正確な"
      ],
      [
        845,
        "accurate",
        "正確な"
      ],
      [
        846,
        "exactly",
        "正確に"
      ],
      [
        847,
        "elementary",
        "初歩的な"
      ],
      [
        848,
        "major",
        "主要な"
      ],
      [
        849,
        "significant",
        "重要な"
      ],
      [
        850,
        "matter",
        "重要である"
      ],
      [
        851,
        "bright",
        "明るい"
      ],
      [
        852,
        "comfortable",
        "快適な"
      ],
      [
        853,
        "pleasant",
        "楽しい"
      ],
      [
        854,
        "convenient",
        "都合がよい"
      ],
      [
        855,
        "false",
        "誤った"
      ],
      [
        856,
        "terrible",
        "ひどい"
      ],
      [
        857,
        "awful",
        "ひどい"
      ],
      [
        858,
        "differ",
        "異なる"
      ],
      [
        859,
        "vary",
        "様々だ"
      ],
      [
        860,
        "various",
        "様々な"
      ]
    ]
  },
  {
    "week": 5,
    "entries": [
      [
        861,
        "diverse",
        "多様な"
      ],
      [
        862,
        "complex",
        "複雑な"
      ],
      [
        863,
        "complicated",
        "複雑な"
      ],
      [
        864,
        "similar",
        "似た"
      ],
      [
        865,
        "alike",
        "似ている"
      ],
      [
        866,
        "equal",
        "等しい"
      ],
      [
        867,
        "amazing",
        "見事な"
      ],
      [
        868,
        "useful",
        "役に立つ"
      ],
      [
        869,
        "practical",
        "現実的な"
      ],
      [
        870,
        "flexible",
        "柔軟な"
      ],
      [
        871,
        "thin",
        "薄い"
      ],
      [
        872,
        "tight",
        "引き締まった"
      ],
      [
        873,
        "loose",
        "ゆるい"
      ],
      [
        874,
        "empty",
        "空の"
      ],
      [
        875,
        "famous",
        "有名な"
      ],
      [
        876,
        "familiar",
        "知られた"
      ],
      [
        877,
        "common",
        "普及した"
      ],
      [
        878,
        "popular",
        "人気がある"
      ],
      [
        879,
        "strange",
        "変な"
      ],
      [
        880,
        "unusual",
        "珍しい"
      ],
      [
        881,
        "ordinary",
        "平凡な"
      ],
      [
        882,
        "typical",
        "典型的な"
      ],
      [
        883,
        "regular",
        "規則的な"
      ],
      [
        884,
        "personal",
        "個人の"
      ],
      [
        885,
        "general",
        "一般的な"
      ],
      [
        886,
        "original",
        "元の"
      ],
      [
        887,
        "single",
        "１つの"
      ],
      [
        888,
        "specific",
        "特定の"
      ],
      [
        889,
        "unique",
        "特有の"
      ],
      [
        890,
        "add",
        "～を加える"
      ],
      [
        891,
        "increase",
        "増える"
      ],
      [
        892,
        "reduce",
        "～を減らす"
      ],
      [
        893,
        "decrease",
        "減少する"
      ],
      [
        894,
        "figure",
        "数字"
      ],
      [
        895,
        "average",
        "平均"
      ],
      [
        896,
        "balance",
        "バランス"
      ],
      [
        897,
        "count",
        "～を数える"
      ],
      [
        898,
        "weigh",
        "～の重さがある"
      ],
      [
        899,
        "measure",
        "～を測る"
      ],
      [
        900,
        "divide",
        "～を分割する"
      ]
    ]
  },
  {
    "week": 6,
    "entries": [
      [
        901,
        "amount",
        "量"
      ],
      [
        902,
        "rate",
        "割合"
      ],
      [
        903,
        "quarter",
        "4分の1"
      ],
      [
        904,
        "lack",
        "不足"
      ],
      [
        905,
        "extra",
        "余分な"
      ],
      [
        906,
        "account",
        "占める"
      ],
      [
        907,
        "promise",
        "約束"
      ],
      [
        908,
        "appointment",
        "予約"
      ],
      [
        909,
        "reservation",
        "予約"
      ],
      [
        910,
        "book",
        "～を予約する"
      ],
      [
        911,
        "register",
        "～を登録する"
      ],
      [
        912,
        "ready",
        "用意ができている"
      ],
      [
        913,
        "prepare",
        "～の準備をする"
      ],
      [
        914,
        "operate",
        "～を操作する"
      ],
      [
        915,
        "perform",
        "～を遂行する"
      ],
      [
        916,
        "adjust",
        "慣れる"
      ],
      [
        917,
        "apply",
        "当てはまる"
      ],
      [
        918,
        "suit",
        "～に適している"
      ],
      [
        919,
        "match",
        "～と調和する"
      ],
      [
        920,
        "fit",
        "～に合う"
      ],
      [
        921,
        "tidy",
        "きちんとした"
      ],
      [
        922,
        "history",
        "歴史"
      ],
      [
        923,
        "period",
        "時代"
      ],
      [
        924,
        "century",
        "世紀"
      ],
      [
        925,
        "minute",
        "分"
      ],
      [
        926,
        "anniversary",
        "記念日"
      ],
      [
        927,
        "leisure",
        "余暇"
      ],
      [
        928,
        "generation",
        "世代"
      ],
      [
        929,
        "save",
        "～を省く"
      ],
      [
        930,
        "delay",
        "～を遅らせる"
      ],
      [
        931,
        "recently",
        "最近"
      ],
      [
        932,
        "latest",
        "最新の"
      ],
      [
        933,
        "modern",
        "現代の"
      ],
      [
        934,
        "ancient",
        "古代の"
      ],
      [
        935,
        "previous",
        "前の"
      ],
      [
        936,
        "sight",
        "光景"
      ],
      [
        937,
        "view",
        "眺め"
      ],
      [
        938,
        "landscape",
        "風景"
      ],
      [
        939,
        "scene",
        "場面"
      ],
      [
        940,
        "scenery",
        "景色"
      ]
    ]
  },
  {
    "week": 7,
    "entries": [
      [
        941,
        "aisle",
        "通路"
      ],
      [
        942,
        "track",
        "足跡"
      ],
      [
        943,
        "line",
        "列"
      ],
      [
        944,
        "row",
        "列"
      ],
      [
        945,
        "narrow",
        "狭い"
      ],
      [
        946,
        "room",
        "部屋"
      ],
      [
        947,
        "yard",
        "庭"
      ],
      [
        948,
        "block",
        "区画"
      ],
      [
        949,
        "site",
        "用地"
      ],
      [
        950,
        "facility",
        "施設"
      ],
      [
        951,
        "construction",
        "建設"
      ],
      [
        952,
        "background",
        "背景"
      ],
      [
        953,
        "bottom",
        "底"
      ],
      [
        954,
        "height",
        "高さ"
      ],
      [
        955,
        "distance",
        "距離"
      ],
      [
        956,
        "direction",
        "方向"
      ],
      [
        957,
        "case",
        "場合"
      ],
      [
        958,
        "event",
        "出来事"
      ],
      [
        959,
        "chance",
        "機会"
      ],
      [
        960,
        "opportunity",
        "機会"
      ],
      [
        961,
        "situation",
        "状況"
      ],
      [
        962,
        "condition",
        "状態"
      ],
      [
        963,
        "emergency",
        "緊急事態"
      ],
      [
        964,
        "serious",
        "深刻な"
      ],
      [
        965,
        "strict",
        "厳しい"
      ],
      [
        966,
        "risky",
        "危険な"
      ],
      [
        967,
        "due",
        "が原因で"
      ],
      [
        968,
        "result",
        "結果"
      ],
      [
        969,
        "cause",
        "～を引き起こす"
      ],
      [
        970,
        "blame",
        "～に責任があるとする"
      ],
      [
        971,
        "responsible",
        "責任がある"
      ],
      [
        972,
        "effect",
        "効果"
      ],
      [
        973,
        "influence",
        "影響"
      ],
      [
        974,
        "impact",
        "影響"
      ],
      [
        975,
        "affect",
        "～に影響を与える"
      ],
      [
        976,
        "purpose",
        "目的"
      ],
      [
        977,
        "right",
        "ちょうど"
      ],
      [
        978,
        "partly",
        "ある程度"
      ],
      [
        979,
        "extremely",
        "極度に"
      ],
      [
        980,
        "complete",
        "完全な"
      ]
    ]
  },
  {
    "week": 8,
    "entries": [
      [
        981,
        "moderate",
        "適度な"
      ],
      [
        982,
        "extent",
        "程度"
      ],
      [
        983,
        "likely",
        "～しそうだ"
      ],
      [
        984,
        "certain",
        "確かな"
      ],
      [
        985,
        "probably",
        "おそらく"
      ],
      [
        986,
        "possibly",
        "ひょっとすると"
      ],
      [
        987,
        "hardly",
        "ほとんど〜ない"
      ],
      [
        988,
        "actually",
        "実は"
      ],
      [
        989,
        "gradually",
        "徐々に"
      ],
      [
        990,
        "suddenly",
        "突然"
      ],
      [
        991,
        "therefore",
        "それゆえに"
      ],
      [
        992,
        "instead",
        "代わりに"
      ],
      [
        993,
        "moreover",
        "その上"
      ],
      [
        994,
        "otherwise",
        "さもなければ"
      ],
      [
        995,
        "besides",
        "～に加えて"
      ],
      [
        996,
        "except",
        "～を除いて"
      ],
      [
        997,
        "according to ～",
        "～によれば"
      ],
      [
        998,
        "though",
        "～だけれども"
      ],
      [
        999,
        "although",
        "～だけれども"
      ],
      [
        1000,
        "whether",
        "～かどうか"
      ]
    ]
  }
];

registerLeapPart(HQ, {
  part: 3,
  partTitle: "Active Vocabulary 2",
  startOrder: 231,
  weeks
});

export const units = HQ.units;
export const cards = HQ.cards;
