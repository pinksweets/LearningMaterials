import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 確認済み範囲の復習用。既存問題から独立した固定問題セット（元の配列は変更しない）。
HQ.registerUnit({
  "id": "ch1mock1",
  "subject": "🧪 化学基礎",
  "group": "中間テスト 模擬テスト",
  "title": "化学 模擬テスト①｜100点満点",
  "desc": "34問・2〜4点配点｜目安40分（自分で計測）｜正解・解説は最後に確認",
  "order": 10308,
  "questions": [
    {
      "type": "yon",
      "lv": "基礎",
      "q": "陽イオンと陰イオンを引きつける力は？",
      "choices": [
        "静電気的な引力",
        "磁石の力",
        "重力だけ",
        "分子間力だけ"
      ],
      "a": 0,
      "exp": "正と負の電荷の間には静電気的な引力が働くよ。",
      "points": 2,
      "examPractice": true,
      "examSection": "イオン結合と結晶の性質",
      "sourceStage": "ch1s1"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "陽イオンと陰イオンが静電気的な引力で結びつく結合は？",
      "choices": [
        "イオン結合",
        "共有結合",
        "金属結合",
        "水素結合"
      ],
      "a": 0,
      "exp": "異なる符号のイオンが引き合う結合がイオン結合だよ。",
      "points": 2,
      "examPractice": true,
      "examSection": "イオン結合と結晶の性質",
      "sourceStage": "ch1s1"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "イオンが規則正しく並んだ結晶を何という？",
      "choices": [
        "イオン結晶",
        "分子結晶",
        "金属結晶",
        "共有結合の結晶"
      ],
      "a": 0,
      "exp": "塩化ナトリウムなどがイオン結晶の例だよ。",
      "points": 2,
      "examPractice": true,
      "examSection": "イオン結合と結晶の性質",
      "sourceStage": "ch1s1"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "塩化ナトリウムを融解すると電流が流れるのはなぜ？",
      "choices": [
        "イオンが移動できるから",
        "電子がすべてなくなるから",
        "分子が新しく生じるから",
        "電荷がすべて消えるから"
      ],
      "a": 0,
      "exp": "融解するとイオンが動けるようになり、電荷を運ぶよ。",
      "points": 4,
      "examPractice": true,
      "examSection": "イオン結合と結晶の性質",
      "sourceStage": "ch1s1"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "Mg²⁺とCl⁻からできる物質の組成式は？",
      "choices": [
        "MgCl₂",
        "MgCl",
        "Mg₂Cl",
        "Mg₂Cl₃"
      ],
      "a": 0,
      "exp": "＋2を打ち消すには−1が2個必要だよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "電荷をそろえて組成式を作ろう",
      "sourceStage": "ch1s2"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "Ca²⁺とNO₃⁻からできる物質の組成式は？",
      "choices": [
        "Ca(NO₃)₂",
        "CaNO₃",
        "Ca₂NO₃",
        "CaN₂O₃"
      ],
      "a": 0,
      "exp": "硝酸イオン全体が2個なので、NO₃をかっこで囲もう。",
      "points": 3,
      "examPractice": true,
      "examSection": "電荷をそろえて組成式を作ろう",
      "sourceStage": "ch1s2"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "Al³⁺とO²⁻からできる物質の組成式は？",
      "choices": [
        "Al₂O₃",
        "AlO",
        "Al₃O₂",
        "AlO₃"
      ],
      "a": 0,
      "exp": "電荷の最小公倍数は6。Al³⁺が2個、O²⁻が3個だよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "電荷をそろえて組成式を作ろう",
      "sourceStage": "ch1s2"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "NH₄⁺とSO₄²⁻からできる物質の組成式は？",
      "choices": [
        "(NH₄)₂SO₄",
        "NH₄SO₄",
        "NH₄(SO₄)₂",
        "N₂H₄SO₄"
      ],
      "a": 0,
      "exp": "アンモニウムイオン2個で＋2、硫酸イオン1個で−2になるよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "電荷をそろえて組成式を作ろう",
      "sourceStage": "ch1s2"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "Ca²⁺とPO₄³⁻からできる物質の組成式は？",
      "choices": [
        "Ca₃(PO₄)₂",
        "Ca₂(PO₄)₃",
        "CaPO₄",
        "Ca₃PO₄"
      ],
      "a": 0,
      "exp": "＋6と−6をそろえるため、カルシウムイオン3個とリン酸イオン2個を使うよ。",
      "points": 4,
      "examPractice": true,
      "examSection": "電荷をそろえて組成式を作ろう",
      "sourceStage": "ch1s2"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "アンモニアの分子式は？",
      "choices": [
        "NH₃",
        "NH₄",
        "N₂H",
        "NO₃"
      ],
      "a": 0,
      "exp": "窒素原子1個と水素原子3個からできているよ。",
      "points": 2,
      "examPractice": true,
      "examSection": "分子式と電子のペア",
      "sourceStage": "ch1s3"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "メタンの分子式は？",
      "choices": [
        "CH₄",
        "CO₂",
        "C₂H₄",
        "CH₃"
      ],
      "a": 0,
      "exp": "メタンは炭素原子1個に水素原子4個が結びついた分子だよ。",
      "points": 2,
      "examPractice": true,
      "examSection": "分子式と電子のペア",
      "sourceStage": "ch1s3"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "炭素原子Cの電子式で、不対電子は何個？",
      "a": [
        "4"
      ],
      "exp": "炭素の価電子は4個。電子式ではまず上下左右に1個ずつ置くので、不対電子は4個だよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "分子式と電子のペア",
      "sourceStage": "ch1s3"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "窒素原子Nの電子式で、不対電子は何個？",
      "a": [
        "3"
      ],
      "exp": "窒素の価電子5個は、電子対1組と不対電子3個として表すよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "分子式と電子のペア",
      "sourceStage": "ch1s3"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "O₂の二重結合に含まれる共有電子対は何組？",
      "a": [
        "2"
      ],
      "exp": "O＝Oの線2本は共有電子対2組を表すよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "構造式・共有電子対・非共有電子対",
      "sourceStage": "ch1s4"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "H₂O分子全体の非共有電子対は何組？",
      "a": [
        "2"
      ],
      "exp": "酸素にはO−H結合2本と、結合に使われない電子対2組があるよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "構造式・共有電子対・非共有電子対",
      "sourceStage": "ch1s4"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "CH₄分子全体の共有電子対は何組？",
      "a": [
        "4"
      ],
      "exp": "C−H結合が4本あり、それぞれが共有電子対1組を表すよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "構造式・共有電子対・非共有電子対",
      "sourceStage": "ch1s4"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "CO₂分子全体の非共有電子対は何組？",
      "a": [
        "4"
      ],
      "exp": "それぞれの酸素に2組ずつあり、合計4組になるよ。",
      "points": 4,
      "examPractice": true,
      "examSection": "構造式・共有電子対・非共有電子対",
      "sourceStage": "ch1s4"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "水H₂Oの分子の形は？",
      "choices": [
        "折れ線形",
        "直線形",
        "三角錐形",
        "正四面体形"
      ],
      "a": 0,
      "exp": "水はH−O−Hが一直線にはならず、折れ曲がった形だよ。",
      "points": 2,
      "examPractice": true,
      "examSection": "分子の立体的な形を見分けよう",
      "sourceStage": "ch1s5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "二酸化炭素CO₂の分子の形は？",
      "choices": [
        "直線形",
        "折れ線形",
        "三角錐形",
        "正四面体形"
      ],
      "a": 0,
      "exp": "O＝C＝Oの3個の原子が一直線に並ぶよ。",
      "points": 2,
      "examPractice": true,
      "examSection": "分子の立体的な形を見分けよう",
      "sourceStage": "ch1s5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "アンモニアNH₃の分子の形は？",
      "choices": [
        "三角錐形",
        "直線形",
        "折れ線形",
        "正四面体形"
      ],
      "a": 0,
      "exp": "窒素を頂点として、水素3個が三角形の底面をつくる形だよ。",
      "points": 2,
      "examPractice": true,
      "examSection": "分子の立体的な形を見分けよう",
      "sourceStage": "ch1s5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "メタンCH₄の分子の形は？",
      "choices": [
        "正四面体形",
        "平面正方形",
        "直線形",
        "三角錐形"
      ],
      "a": 0,
      "exp": "炭素を中心に、水素4個が正四面体の頂点に向かって広がるよ。",
      "points": 2,
      "examPractice": true,
      "examSection": "分子の立体的な形を見分けよう",
      "sourceStage": "ch1s5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "高分子をつくるもとになる小さな分子は？",
      "choices": [
        "単量体（モノマー）",
        "重合体（ポリマー）",
        "配位子",
        "同素体"
      ],
      "a": 0,
      "exp": "小さな単量体がたくさんつながって高分子になるよ。",
      "points": 2,
      "examPractice": true,
      "examSection": "高分子と配位結合の基本",
      "sourceStage": "ch1s6"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "単量体が繰り返しつながっていく反応は？",
      "choices": [
        "重合",
        "電離",
        "融解",
        "昇華"
      ],
      "a": 0,
      "exp": "単量体がつながる反応を重合、できたものを重合体というよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "高分子と配位結合の基本",
      "sourceStage": "ch1s6"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "NH₃がH⁺と結びついてNH₄⁺になるとき、電子対を提供するのは？",
      "choices": [
        "窒素原子",
        "水素イオン",
        "すべての水素原子",
        "陽子だけ"
      ],
      "a": 0,
      "exp": "窒素の非共有電子対がH⁺との結合に使われるよ。",
      "points": 4,
      "examPractice": true,
      "examSection": "高分子と配位結合の基本",
      "sourceStage": "ch1s6"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "錯イオンで、金属イオンに配位結合している分子や陰イオンは？",
      "choices": [
        "配位子",
        "重合体",
        "陽子",
        "自由電子"
      ],
      "a": 0,
      "exp": "水やアンモニアなど、非共有電子対をもつ粒子が配位子になれるよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "高分子と配位結合の基本",
      "sourceStage": "ch1s6"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "ドライアイスでは、CO₂分子どうしを結びつけているのは？",
      "choices": [
        "分子間力",
        "共有結合",
        "金属結合",
        "イオン結合"
      ],
      "a": 0,
      "exp": "CO₂分子の内部は共有結合、分子と分子の間は分子間力だよ。",
      "points": 4,
      "examPractice": true,
      "examSection": "分子結晶と結晶の分類",
      "sourceStage": "ch1s7"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "ドライアイスの結晶の分類は？",
      "choices": [
        "分子結晶",
        "イオン結晶",
        "金属結晶",
        "共有結合の結晶"
      ],
      "a": 0,
      "exp": "CO₂分子が分子間力で集まってできた結晶だよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "分子結晶と結晶の分類",
      "sourceStage": "ch1s7"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "多数の原子が共有結合で網目状につながった結晶は？",
      "choices": [
        "共有結合の結晶",
        "分子結晶",
        "イオン結晶",
        "金属結晶"
      ],
      "a": 0,
      "exp": "独立した小さな分子ではなく、原子の結びつきが結晶全体に広がっているよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "分子結晶と結晶の分類",
      "sourceStage": "ch1s7"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "結晶の分類の組み合わせで正しいものは？",
      "choices": [
        "ヨウ素：分子結晶／二酸化ケイ素：共有結合の結晶",
        "ヨウ素：金属結晶／二酸化ケイ素：分子結晶",
        "ヨウ素：イオン結晶／二酸化ケイ素：金属結晶",
        "ヨウ素：共有結合の結晶／二酸化ケイ素：イオン結晶"
      ],
      "a": 0,
      "exp": "分子が集まるヨウ素と、原子が網目状につながる二酸化ケイ素を区別しよう。",
      "points": 4,
      "examPractice": true,
      "examSection": "分子結晶と結晶の分類",
      "sourceStage": "ch1s7"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "ダイヤモンドで、1個の炭素原子に直接結合する炭素原子は何個？",
      "a": [
        "4"
      ],
      "exp": "4個の炭素原子と結合し、正四面体を基本とする立体的な網目をつくるよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "ダイヤモンド・黒鉛・ケイ素",
      "sourceStage": "ch1s8"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "黒鉛がはがれやすい理由は？",
      "choices": [
        "層と層の間に働く力が弱いから",
        "層内に結合がないから",
        "炭素原子がすべてイオンだから",
        "水にすぐ溶けるから"
      ],
      "a": 0,
      "exp": "層の中は共有結合で強くつながるけれど、層と層の間の力は弱いよ。",
      "points": 4,
      "examPractice": true,
      "examSection": "ダイヤモンド・黒鉛・ケイ素",
      "sourceStage": "ch1s8"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "黒鉛が電気を通すのはなぜ？",
      "choices": [
        "層に沿って動ける電子があるから",
        "自由に動くNa⁺があるから",
        "水を含むから",
        "原子核が移動するから"
      ],
      "a": 0,
      "exp": "結合に使われない電子が層に沿って移動できるので、電流を運べるよ。",
      "points": 4,
      "examPractice": true,
      "examSection": "ダイヤモンド・黒鉛・ケイ素",
      "sourceStage": "ch1s8"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "二酸化ケイ素の結晶で、1個のSi原子に直接結合するO原子は何個？",
      "a": [
        "4"
      ],
      "exp": "Si原子のまわりに4個のO原子が正四面体状に配置されるよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "ダイヤモンド・黒鉛・ケイ素",
      "sourceStage": "ch1s8"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "二酸化ケイ素でSiにOが4個結合しているのに組成式がSiO₂なのはなぜ？",
      "choices": [
        "各O原子を2個のSi原子が共有するから",
        "半分のO原子が消えるから",
        "O原子は数えないから",
        "SiO₂という小分子だけが集まるから"
      ],
      "a": 0,
      "exp": "O原子はSi原子2個を橋渡しするので、Si：Oの個数比は1：2になるよ。",
      "points": 3,
      "examPractice": true,
      "examSection": "ダイヤモンド・黒鉛・ケイ素",
      "sourceStage": "ch1s8"
    }
  ],
  "cards": []
});

export const units = HQ.units;
export const cards = HQ.cards;
