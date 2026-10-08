import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 追加写真6枚の確認済み範囲。実験案内等は作業指示として扱わない。
HQ.registerUnit({
  "id": "ec26mock2",
  "subject": "⚡ 中間テスト電気回路",
  "group": "10/13〜19 追加学習 模擬テスト",
  "title": "教科書追加範囲 模擬テスト｜100点満点",
  "desc": "復習34問・100点｜目安40分（自己計時）｜解説は最後",
  "order": 10514,
  "questions": [
    {
      "type": "yon",
      "lv": "基礎",
      "q": "ジュール熱Qを、電流I・抵抗R・時間tで表す式は？",
      "choices": [
        "Q＝I²Rt",
        "Q＝IRt",
        "Q＝I²R/t",
        "Q＝I/Rt"
      ],
      "a": 0,
      "exp": "電流の2乗と抵抗と秒数をかけるよ。Qの単位はJ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真1.jpg",
      "points": 2,
      "examSection": "⑧ 発熱と比熱｜p.48〜49",
      "sourceStage": "ec26t1"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "物質1 kgの温度を1 K上げるのに必要な熱量を表す性質は？",
      "choices": [
        "比熱",
        "抵抗率",
        "導電率",
        "電力"
      ],
      "a": 0,
      "exp": "質量1 kgあたりの熱容量が比熱だよ。単位はJ/(kg・K)。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真1.jpg",
      "points": 2,
      "examSection": "⑧ 発熱と比熱｜p.48〜49",
      "sourceStage": "ec26t1"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "5 Ωの抵抗に2 Aを30分流す。発生する熱量は何J？（数値だけ入力してね）",
      "a": [
        "36000"
      ],
      "exp": "30分＝1800秒。Q＝2²×5×1800＝36000 J。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真1.jpg",
      "points": 3,
      "examSection": "⑧ 発熱と比熱｜p.48〜49",
      "sourceStage": "ec26t1"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "水10 kgを20℃から80℃へ上げる。比熱4190 J/(kg・K)として、必要な熱量は何J？（数値だけ入力してね）",
      "a": [
        "2514000"
      ],
      "exp": "Q＝10×4190×(80−20)＝2514000 J。ここでは途中で丸めない値を答えるよ。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真1.jpg",
      "points": 3,
      "examSection": "⑧ 発熱と比熱｜p.48〜49",
      "sourceStage": "ec26t1"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "銅1 gを25℃から1025℃へ上げる。比熱390 J/(kg・K)として必要な熱量は何J？（数値だけ入力してね）",
      "a": [
        "390"
      ],
      "exp": "1 g＝0.001 kg。Q＝0.001×390×1000＝390 J。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真1.jpg",
      "points": 4,
      "examSection": "⑧ 発熱と比熱｜p.48〜49",
      "sourceStage": "ec26t1"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "100 Ωに2 Aを20分流した熱を、10℃の水5 kgにすべて与える。比熱4190 J/(kg・K)、損失なし。水の最終温度は何℃？四捨五入して小数第2位まで。（数値だけ入力してね）",
      "a": [
        "32.91"
      ],
      "exp": "Q＝2²×100×1200＝480000 J。温度上昇＝480000/(5×4190)。最終温度＝10＋温度上昇＝32.91℃。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真1.jpg",
      "points": 4,
      "examSection": "⑧ 発熱と比熱｜p.48〜49",
      "sourceStage": "ec26t1"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "電力1 Wの意味は？",
      "choices": [
        "1秒あたり1 Jの仕事",
        "1時間あたり1 Jの仕事",
        "1秒あたり1 Aの電流",
        "抵抗1 Ω"
      ],
      "a": 0,
      "exp": "電力は単位時間あたりのエネルギー。1 W＝1 J/sだよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真2.jpg",
      "points": 2,
      "examSection": "⑨ 電力と電力量｜p.50〜51",
      "sourceStage": "ec26t2"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "1 kWhは何J？（数値だけ入力してね）",
      "a": [
        "3600000"
      ],
      "exp": "1000 W×3600秒＝3600000 J。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真2.jpg",
      "points": 2,
      "examSection": "⑨ 電力と電力量｜p.50〜51",
      "sourceStage": "ec26t2"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "抵抗10 Ωに5 Aが流れる。電力は何W？（数値だけ入力してね）",
      "a": [
        "250"
      ],
      "exp": "P＝I²R＝5²×10＝250 W。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真2.jpg",
      "points": 3,
      "examSection": "⑨ 電力と電力量｜p.50〜51",
      "sourceStage": "ec26t2"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "5 Ωの電熱線に100 Vを加える。電力は何W？（数値だけ入力してね）",
      "a": [
        "2000"
      ],
      "exp": "P＝V²/R＝100²/5＝2000 W。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真2.jpg",
      "points": 3,
      "examSection": "⑨ 電力と電力量｜p.50〜51",
      "sourceStage": "ec26t2"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "100 V、5 Aの電熱線を2時間15分使う。電力量は何J？（数値だけ入力してね）",
      "a": [
        "4050000"
      ],
      "exp": "P＝500 W、時間＝8100秒。W＝Pt＝4050000 J。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真2.jpg",
      "points": 4,
      "examSection": "⑨ 電力と電力量｜p.50〜51",
      "sourceStage": "ec26t2"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "100 Ωの抵抗に100 Vを2時間加える。電力量は何kWh？（数値だけ入力してね）",
      "a": [
        "0.2"
      ],
      "exp": "P＝100²/100＝100 W＝0.1 kW。0.1×2＝0.2 kWh。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真2.jpg",
      "points": 4,
      "examSection": "⑨ 電力と電力量｜p.50〜51",
      "sourceStage": "ec26t2"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "同じ材質・断面積の電線で、長さを2倍にすると抵抗は？",
      "choices": [
        "2倍",
        "4倍",
        "半分",
        "変わらない"
      ],
      "a": 0,
      "exp": "R＝ρl/A。長さlに比例するよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真3.jpg",
      "points": 2,
      "examSection": "⑩ 抵抗率と導電率｜p.60〜61",
      "sourceStage": "ec26t3"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "抵抗率ρ、長さl、断面積Aから抵抗Rを求める式は？",
      "choices": [
        "R＝ρl/A",
        "R＝ρA/l",
        "R＝l/(ρA)",
        "R＝ρlA"
      ],
      "a": 0,
      "exp": "長いほど流れにくく、断面積が大きいほど流れやすいよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真3.jpg",
      "points": 2,
      "examSection": "⑩ 抵抗率と導電率｜p.60〜61",
      "sourceStage": "ec26t3"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "直径2.0 mm、長さ100 mの銅線。ρ＝0.0000000172 Ω・m、π＝3.14。抵抗は何Ω？小数第3位まで四捨五入。（数値だけ入力してね）",
      "a": [
        "0.548"
      ],
      "exp": "半径＝0.001 m。R＝ρl/(πr²)＝0.0000000172×100/(3.14×0.001²)＝0.548 Ω。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真3.jpg",
      "points": 3,
      "examSection": "⑩ 抵抗率と導電率｜p.60〜61",
      "sourceStage": "ec26t3"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "同じ材質の直径1.6 mm・長さ50 mの銅線と同じ抵抗をもつ直径2.0 mmの銅線。長さは何m？（数値だけ入力してね）",
      "a": [
        "78.125"
      ],
      "exp": "抵抗一定ならlは断面積に比例し、断面積は直径の2乗に比例。l＝50×(2.0/1.6)²＝78.125 m。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真3.jpg",
      "points": 3,
      "examSection": "⑩ 抵抗率と導電率｜p.60〜61",
      "sourceStage": "ec26t3"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "抵抗率ρと導電率σの関係は？",
      "choices": [
        "σ＝1/ρ",
        "σ＝ρ",
        "σ＝ρ²",
        "σ＝ρ/100"
      ],
      "a": 0,
      "exp": "導電率は電気の通しやすさ。抵抗率と逆数の関係だよ。単位はS/m。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真3.jpg",
      "points": 3,
      "examSection": "⑩ 抵抗率と導電率｜p.60〜61",
      "sourceStage": "ec26t3"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "抵抗率0.0000000162 Ω・mの銅のパーセント導電率は何％？標準軟銅の導電率は58000000 S/m。小数第2位まで四捨五入。（数値だけ入力してね）",
      "a": [
        "106.43"
      ],
      "exp": "導電率σ＝1/ρ。パーセント導電率＝σ/58000000×100＝106.43％。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真3.jpg",
      "points": 4,
      "examSection": "⑩ 抵抗率と導電率｜p.60〜61",
      "sourceStage": "ec26t3"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "原則として放電後に充電して繰り返し使うための電池ではないものは？",
      "choices": [
        "一次電池",
        "二次電池",
        "鉛蓄電池",
        "リチウムイオン二次電池"
      ],
      "a": 0,
      "exp": "一次電池と二次電池を分けて覚えよう。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真4.jpg",
      "points": 2,
      "examSection": "⑪ 一次電池｜p.72〜73",
      "sourceStage": "ec26t4"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "ルクランシェ電池の正極に使われるのは？",
      "choices": [
        "炭素棒",
        "亜鉛板",
        "鉛板",
        "銅板"
      ],
      "a": 0,
      "exp": "ルクランシェ電池では炭素棒が正極、亜鉛が負極だよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真4.jpg",
      "points": 3,
      "examSection": "⑪ 一次電池｜p.72〜73",
      "sourceStage": "ec26t4"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "炭素棒の表面に水素のあわが付着し、電流が流れにくくなる現象は？",
      "choices": [
        "分極作用",
        "サルフェーション",
        "導電率",
        "電磁誘導"
      ],
      "a": 0,
      "exp": "水素のあわで反応が妨げられ、電流が流れにくくなるよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真4.jpg",
      "points": 3,
      "examSection": "⑪ 一次電池｜p.72〜73",
      "sourceStage": "ec26t4"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "電池に加えた酸化マンガン(IV)MnO2の役割は？",
      "choices": [
        "水素を酸化して分極を抑える",
        "亜鉛を充電する",
        "電解液を凍らせる",
        "抵抗を無限大にする"
      ],
      "a": 0,
      "exp": "MnO2が水素を酸化して水にし、分極を抑えるよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真4.jpg",
      "points": 3,
      "examSection": "⑪ 一次電池｜p.72〜73",
      "sourceStage": "ec26t4"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "アルカリ・マンガン乾電池の電解液は？",
      "choices": [
        "水酸化カリウムKOH",
        "硫酸H2SO4",
        "塩化ナトリウムだけ",
        "有機電解液"
      ],
      "a": 0,
      "exp": "KOHを使う一次電池だよ。KOHを使うからといって、すべて充電式になるわけではないよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真4.jpg",
      "points": 4,
      "examSection": "⑪ 一次電池｜p.72〜73",
      "sourceStage": "ec26t4"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "鉛蓄電池はどちらの種類？",
      "choices": [
        "二次電池",
        "一次電池",
        "電力計",
        "絶縁体"
      ],
      "a": 0,
      "exp": "充電と放電を繰り返して使える二次電池だよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真5.jpg",
      "points": 2,
      "examSection": "⑫ 鉛蓄電池｜p.74〜75",
      "sourceStage": "ec26t5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "充電された鉛蓄電池の正極の物質は？",
      "choices": [
        "酸化鉛(IV)PbO2",
        "鉛Pb",
        "亜鉛Zn",
        "炭素C"
      ],
      "a": 0,
      "exp": "正極はPbO2、負極はPbだよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真5.jpg",
      "points": 3,
      "examSection": "⑫ 鉛蓄電池｜p.74〜75",
      "sourceStage": "ec26t5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "鉛蓄電池を放電すると、正極・負極の両方にできる物質は？",
      "choices": [
        "硫酸鉛PbSO4",
        "酸化銀Ag2O",
        "亜鉛Zn",
        "塩化アンモニウムNH4Cl"
      ],
      "a": 0,
      "exp": "放電により両極が硫酸鉛へ近づくよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真5.jpg",
      "points": 3,
      "examSection": "⑫ 鉛蓄電池｜p.74〜75",
      "sourceStage": "ec26t5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "鉛蓄電池の放電が進むと、電解液の硫酸濃度は？",
      "choices": [
        "低くなる",
        "高くなる",
        "必ず変わらない",
        "必ず0から増える"
      ],
      "a": 0,
      "exp": "放電で硫酸が使われ、水が生じるので濃度は下がるよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真5.jpg",
      "points": 3,
      "examSection": "⑫ 鉛蓄電池｜p.74〜75",
      "sourceStage": "ec26t5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "放電したまま長く放置し、硫酸鉛が結晶化して充電性能が落ちる現象は？",
      "choices": [
        "サルフェーション",
        "分極作用",
        "ジュール熱",
        "電磁誘導"
      ],
      "a": 0,
      "exp": "硫酸鉛の結晶化で反応しにくくなり、充電性能が下がるよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真5.jpg",
      "points": 4,
      "examSection": "⑫ 鉛蓄電池｜p.74〜75",
      "sourceStage": "ec26t5"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "蓄電池の容量を表す式は？",
      "choices": [
        "容量＝放電電流×放電時間",
        "容量＝放電電流÷放電時間",
        "容量＝電圧×抵抗",
        "容量＝電流＋時間"
      ],
      "a": 0,
      "exp": "電流Aと時間hをかけると、容量A・hになるよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真6.jpg",
      "points": 2,
      "examSection": "⑬ 二次電池と容量｜p.75〜76",
      "sourceStage": "ec26t6"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "写真にあるニッケル・カドミウム蓄電池の起電力は約何V？（数値だけ入力してね）",
      "a": [
        "1.2"
      ],
      "exp": "ニッケル・カドミウム蓄電池は約1.2 V。KOHを電解液に使う二次電池だよ。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真6.jpg",
      "points": 2,
      "examSection": "⑬ 二次電池と容量｜p.75〜76",
      "sourceStage": "ec26t6"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "60 A・hの鉛蓄電池を10時間で放電する。一定の放電電流は何A？（数値だけ入力してね）",
      "a": [
        "6"
      ],
      "exp": "電流＝容量÷時間＝60/10＝6 A。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真6.jpg",
      "points": 3,
      "examSection": "⑬ 二次電池と容量｜p.75〜76",
      "sourceStage": "ec26t6"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "容量3.5 A・hの二次電池を0.7 Aで放電する。使用時間は何時間？（数値だけ入力してね）",
      "a": [
        "5"
      ],
      "exp": "時間＝容量÷電流＝3.5/0.7＝5時間。",
      "hint": "単位をそろえて式に代入しよう。",
      "examPractice": true,
      "sourceImage": "写真6.jpg",
      "points": 3,
      "examSection": "⑬ 二次電池と容量｜p.75〜76",
      "sourceStage": "ec26t6"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "10時間放電率の意味は？",
      "choices": [
        "所定の条件で放電終止電圧まで10時間放電する定格",
        "10 Aでしか放電できない",
        "10 Vまで必ず使う",
        "容量が10％だけ使える"
      ],
      "a": 0,
      "exp": "何時間で放電終止電圧に達するかで表したものだよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真6.jpg",
      "points": 3,
      "examSection": "⑬ 二次電池と容量｜p.75〜76",
      "sourceStage": "ec26t6"
    },
    {
      "type": "yon",
      "lv": "基礎",
      "q": "A・hとkWhの違いとして正しいのは？",
      "choices": [
        "A・hは電気量、kWhはエネルギー",
        "どちらも必ず同じ数値",
        "A・hは抵抗、kWhは電流",
        "どちらも電圧"
      ],
      "a": 0,
      "exp": "容量A・hだけではエネルギーは決まらず、電圧も関係するよ。",
      "hint": "「まなぶ」の式と意味を思い出そう。",
      "examPractice": true,
      "sourceImage": "写真6.jpg",
      "points": 4,
      "examSection": "⑬ 二次電池と容量｜p.75〜76",
      "sourceStage": "ec26t6"
    }
  ],
  "cards": []
});

export const units = HQ.units;
export const cards = HQ.cards;
