import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 基礎練習から選んだ復習用の固定問題。実行時に練習データを参照しない。
// 教科書70点・プリント30点。配点と目標は学習用で、学校の出題予想ではない。
HQ.registerUnit({
  "id": "e26mock1",
  "subject": "🇬🇧 中間テスト英語",
  "group": "仕上げ｜復習模擬テスト",
  "title": "英語｜基礎の復習模擬テスト 100点",
  "desc": "全10分野から34問・100点｜目安30分（自分で計時）・学習目標60点",
  "order": 10410,
  "questions": [
    {
      "type": "yon",
      "lv": "基礎",
      "q": "three keys to their success の意味は？",
      "choices": [
        "成功への3つのかぎ",
        "3個の店の鍵",
        "3人の店員",
        "3種類の飲み物"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "key は「かぎ」。ここでは成功するための重要なポイントを表すよ。",
      "points": 2,
      "examSection": "p.70 コンビニ①｜商品の配置",
      "sourceStage": "e26s1"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "本文では、飲み物や弁当は普通どこにある？",
      "choices": [
        "店の奥",
        "必ず入口の外",
        "店の屋上",
        "レジの下"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "at the back of the store は「店の奥で」。配置と表現を一緒に覚えよう。",
      "points": 3,
      "examSection": "p.70 コンビニ①｜商品の配置",
      "sourceStage": "e26s1"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "「買いたい気がする」feel like (　) の正しい形は？",
      "choices": [
        "buying",
        "buy",
        "bought",
        "buys"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "feel like の後ろで動作を表すときは動詞の -ing 形。feel like buying で「買いたい気がする」だよ。",
      "points": 3,
      "examSection": "p.70 コンビニ①｜商品の配置",
      "sourceStage": "e26s1"
    },
    {
      "type": "ana",
      "lv": "基礎",
      "q": "「客」を表す英単語を1語で書こう。a (　)",
      "choices": [
        "customer"
      ],
      "a": 0,
      "forceInput": true,
      "examPractice": true,
      "exp": "customer＝客。本文の customers は複数形だよ。ここは a があるので customer と書こう。",
      "points": 4,
      "examSection": "p.70 コンビニ①｜商品の配置",
      "sourceStage": "e26s1"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "成功の2つ目のかぎは？",
      "choices": [
        "明るい照明",
        "大きな駐車場",
        "暗い入口",
        "店内の音楽"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "The second key is the bright lights. は「2つ目のかぎは明るい照明です」。bright＝明るい、だよ。",
      "points": 2,
      "examSection": "p.72 コンビニ②｜照明と棚",
      "sourceStage": "e26s2"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "明るい照明のおかげで、お客さんは店をどう感じる？",
      "choices": [
        "清潔で安全だと感じる",
        "危険で汚いと感じる",
        "閉店していると感じる",
        "商品がないと感じる"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "clean and safe＝清潔で安全。照明のよい点として本文に挙がっているよ。",
      "points": 3,
      "examSection": "p.72 コンビニ②｜照明と棚",
      "sourceStage": "e26s2"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "Why don’t you find out for yourself? はどんな呼びかけ？",
      "choices": [
        "自分で調べてみてはどうですか",
        "自分で調べてはいけません",
        "私は昨日調べました",
        "誰も調べられません"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "Why don’t you ～? は提案の表現。find out＝調べる、for yourself＝自分で、だよ。",
      "points": 3,
      "examSection": "p.72 コンビニ②｜照明と棚",
      "sourceStage": "e26s2"
    },
    {
      "type": "ana",
      "lv": "基礎",
      "q": "shelf（棚）の複数形を1語で書こう。",
      "choices": [
        "shelves"
      ],
      "a": 0,
      "forceInput": true,
      "examPractice": true,
      "exp": "shelf の複数形は shelves。f が v に変わって -es が付くよ。",
      "points": 4,
      "examSection": "p.72 コンビニ②｜照明と棚",
      "sourceStage": "e26s2"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "for the first time の意味は？",
      "choices": [
        "初めて",
        "毎日",
        "何年もの間",
        "最後まで"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "Today, I harvested honey for the first time. は「今日、初めてはちみつを収穫した」だよ。",
      "points": 2,
      "examSection": "p.80 養蜂①｜はちみつの収穫",
      "sourceStage": "e26s3"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "養蜂部は、何年もはちみつをどこに売っている？",
      "choices": [
        "和菓子屋",
        "病院",
        "図書館",
        "駅の案内所"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "a Japanese sweets shop＝和菓子屋。for years は「何年もの間」だよ。",
      "points": 3,
      "examSection": "p.80 養蜂①｜はちみつの収穫",
      "sourceStage": "e26s3"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "We have sold our honey ... for years. の have sold はどんな形？",
      "choices": [
        "have＋過去分詞の現在完了",
        "be＋動詞の -ing 形",
        "will＋動詞の原形",
        "動詞の現在形だけ"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "sell の過去分詞は sold。現在完了と for years で、何年も続いていることを伝えているよ。",
      "points": 3,
      "examSection": "p.80 養蜂①｜はちみつの収穫",
      "sourceStage": "e26s3"
    },
    {
      "type": "ana",
      "lv": "基礎",
      "q": "「はちみつ」を表す英単語を1語で書こう。",
      "choices": [
        "honey"
      ],
      "a": 0,
      "forceInput": true,
      "examPractice": true,
      "exp": "honey＝はちみつ。honey dorayaki は「はちみつどら焼き」だよ。",
      "points": 4,
      "examSection": "p.80 養蜂①｜はちみつの収穫",
      "sourceStage": "e26s3"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "At first の意味は？",
      "choices": [
        "最初は",
        "その結果",
        "夜でさえ",
        "途中で"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "At first＝最初は。最初の考えと、今の考えを比べて読もう。",
      "points": 2,
      "examSection": "p.82 養蜂②｜花とミツバチの世話",
      "sourceStage": "e26s4"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "ミツバチが食べるものは？",
      "choices": [
        "花粉と花の蜜",
        "米と肥料",
        "弁当と飲み物",
        "葉と土だけ"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "pollen and nectar＝花粉と花の蜜。ミツバチが生きるために花が必要なんだ。",
      "points": 3,
      "examSection": "p.82 養蜂②｜花とミツバチの世話",
      "sourceStage": "e26s4"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "自分たちでミツバチの世話をする理由は？",
      "choices": [
        "ミツバチの医者がいないから",
        "花が絶対にいらないから",
        "はちみつを買うためだけ",
        "学校祭が終わったから"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "there are no doctors for honeybees＝ミツバチの医者はいない。by ourselves は「自分たち自身で」だよ。",
      "points": 3,
      "examSection": "p.82 養蜂②｜花とミツバチの世話",
      "sourceStage": "e26s4"
    },
    {
      "type": "ana",
      "lv": "基礎",
      "q": "「～の世話をする」(　) for ～ の空所を1語で書こう。",
      "choices": [
        "care"
      ],
      "a": 0,
      "forceInput": true,
      "examPractice": true,
      "exp": "care for ～＝～の世話をする。プリントの take care of ～ も同じ意味で使えるよ。",
      "points": 4,
      "examSection": "p.82 養蜂②｜花とミツバチの世話",
      "sourceStage": "e26s4"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "本文のロボットは、何を収穫している？",
      "choices": [
        "赤いトマトだけ",
        "青いトマトだけ",
        "すべての花",
        "はちみつ"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "It picks only red tomatoes. は「赤いトマトだけを摘み取る」。only＝～だけ、に注目しよう。",
      "points": 2,
      "examSection": "p.90 スマート農業①｜技術の活用",
      "sourceStage": "e26s5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "千葉の一部の農家は、何で畑を見守っている？",
      "choices": [
        "スマートフォン",
        "紙の地図だけ",
        "望遠鏡だけ",
        "店のレジ"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "monitor their fields with their smartphones＝スマートフォンで畑を監視する、だよ。",
      "points": 2,
      "examSection": "p.90 スマート農業①｜技術の活用",
      "sourceStage": "e26s5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "北海道の一部の農場では、ドローンで何をまく？",
      "choices": [
        "肥料",
        "はちみつ",
        "弁当",
        "花の蜜"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "spray fertilizer on the rice fields＝水田に肥料をまく。fertilizer＝肥料だよ。",
      "points": 3,
      "examSection": "p.90 スマート農業①｜技術の活用",
      "sourceStage": "e26s5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "drones are used の意味は？",
      "choices": [
        "ドローンが使われる",
        "ドローンが使った",
        "ドローンが売り切れた",
        "ドローンが使っている"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "be動詞＋過去分詞で受動態。「～される」という意味だよ。use の過去分詞は used。",
      "points": 4,
      "examSection": "p.90 スマート農業①｜技術の活用",
      "sourceStage": "e26s5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "Farming is important for our lives. の意味は？",
      "choices": [
        "農業は私たちの生活に重要だ",
        "農業は私たちの生活に無関係だ",
        "農業はいつも簡単だ",
        "農業は食べ物を必要としない"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "our lives＝私たちの生活。lives は life の複数形だよ。",
      "points": 2,
      "examSection": "p.92 スマート農業②｜時間と労力",
      "sourceStage": "e26s6"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "技術を使うことで節約できるのは？",
      "choices": [
        "時間と労力",
        "花粉と蜜",
        "棚と照明",
        "学校と教室"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "save time and effort＝時間と労力を節約する。農家の負担を減らす効果だね。",
      "points": 2,
      "examSection": "p.92 スマート農業②｜時間と労力",
      "sourceStage": "e26s6"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "both crop quality and quantity の意味は？",
      "choices": [
        "作物の質と量の両方",
        "作物の質だけ",
        "作物の量だけ",
        "作物の色と形だけ"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "both A and B＝AとBの両方。quality は質、quantity は量。似たつづりを区別しよう。",
      "points": 3,
      "examSection": "p.92 スマート農業②｜時間と労力",
      "sourceStage": "e26s6"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "By using advanced technology の意味は？",
      "choices": [
        "先進的な技術を使うことによって",
        "先進的な技術を使う前に",
        "先進的な技術を使わずに",
        "先進的な技術を忘れたため"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "by＋動詞の -ing 形で「～することによって」。advanced＝先進的な、だよ。",
      "points": 4,
      "examSection": "p.92 スマート農業②｜時間と労力",
      "sourceStage": "e26s6"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "Tom showed up late. の showed up は？",
      "choices": [
        "現れた",
        "片付けた",
        "着替えた",
        "笑った"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "show up＝現れる。showed は過去形で、「トムは遅れて現れた」だよ。",
      "points": 2,
      "examSection": "プリント①｜出来事と滞在",
      "sourceStage": "e26s7"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "stay with Bob for two days の意味は？",
      "choices": [
        "2日間、ボブの家に泊めてもらう",
        "2日間、ボブを待つ",
        "2日間、ボブと働く",
        "2日間、ボブを探す"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "stay with 人 は「人の家に泊まる」。for two days は期間の2日間だよ。",
      "points": 3,
      "examSection": "プリント①｜出来事と滞在",
      "sourceStage": "e26s7"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "stop talking の意味は？",
      "choices": [
        "話すのをやめる",
        "話すために立ち止まる",
        "話し始める",
        "話すのを楽しみにする"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "stop＋動詞の -ing 形は「～するのをやめる」。stop to talk（話すために立ち止まる）とは区別しよう。",
      "points": 4,
      "examSection": "プリント①｜出来事と滞在",
      "sourceStage": "e26s7"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "turn on the air conditioner の意味は？",
      "choices": [
        "エアコンの電源を入れる",
        "エアコンを片付ける",
        "エアコンを組み立てる",
        "エアコンの電源を切る"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "turn on＝電源を入れる・つける。反対の turn off と区別しよう。",
      "points": 2,
      "examSection": "プリント②｜日常の動作",
      "sourceStage": "e26s8"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "throw away old clothes の意味は？",
      "choices": [
        "古着を捨てる",
        "古着を着る",
        "古着を買う",
        "古着を片付ける"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "throw away＝捨てる。put away（片付ける）との違いに注意しよう。",
      "points": 3,
      "examSection": "プリント②｜日常の動作",
      "sourceStage": "e26s8"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "put a table together の意味は？",
      "choices": [
        "テーブルを組み立てる",
        "テーブルを捨てる",
        "テーブルを拭く",
        "テーブルを売る"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "put ～ together＝～を組み立てる。部品を一緒にするイメージだよ。",
      "points": 4,
      "examSection": "プリント②｜日常の動作",
      "sourceStage": "e26s8"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "I am looking forward to seeing you again. の意味は？",
      "choices": [
        "また会えるのを楽しみにしています",
        "また会うのを避けています",
        "また会うのを忘れました",
        "また会うのが怖いです"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "look forward to ～＝～を楽しみにする。to の後ろは seeing のような -ing 形だよ。",
      "points": 3,
      "examSection": "プリント③｜気持ちと反応",
      "sourceStage": "e26s9"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "I am proud of my team. の意味は？",
      "choices": [
        "自分のチームを誇りに思っている",
        "自分のチームを怖がっている",
        "自分のチームを忘れている",
        "自分のチームを探している"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "be proud of ～＝～を誇りに思う。of までセットで覚えよう。",
      "points": 3,
      "examSection": "プリント③｜気持ちと反応",
      "sourceStage": "e26s9"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "I was born in India. の意味は？",
      "choices": [
        "私はインドで生まれた",
        "私はインドに引っ越した",
        "私はインドで結婚した",
        "私はインドを旅行した"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "be born＝生まれる。was born で「生まれた」だよ。",
      "points": 3,
      "examSection": "プリント④｜人生と人々",
      "sourceStage": "e26s10"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "take care of my tortoise の意味は？",
      "choices": [
        "私の亀の世話をする",
        "私の亀を探す",
        "私の亀を買う",
        "私の亀の絵を描く"
      ],
      "a": 0,
      "examPractice": true,
      "exp": "take care of ～＝～の世話をする。教科書の care for ～ と結びつけて覚えよう。",
      "points": 3,
      "examSection": "プリント④｜人生と人々",
      "sourceStage": "e26s10"
    }
  ],
  "cards": []
});

export const units = HQ.units;
export const cards = HQ.cards;
