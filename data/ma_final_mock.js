import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 練習から固定で選んだ復習模擬。実行時には練習データを参照しない。
HQ.registerUnit({
  "id": "mafmock1",
  "subject": "📐 数学A",
  "group": "期末テスト対策｜図形の性質",
  "title": "期末・図形の性質｜復習模擬100点",
  "page": "53〜61",
  "desc": "7分野の復習34問｜目安45分（自分で計測）・目標80点｜正解と解説は終了後",
  "order": 176.27,
  "questions": [
    {
      "type": "yon",
      "lv": "標準",
      "q": "三角形の内心は、どの3本の線が交わる点？",
      "choices": [
        "3つの内角の二等分線",
        "3辺の垂直二等分線",
        "3本の中線",
        "3本の高さ"
      ],
      "a": 0,
      "exp": "① 内心は内接円の中心だよ。② 角の二等分線上の点は、その角をつくる2辺への距離が等しい。③ 3つの内角の二等分線の交点なら3辺への距離が等しくなり、内心になるよ。",
      "examPractice": true,
      "points": 2,
      "examSection": "内心",
      "sourceStage": "mafs1"
    },
    {
      "type": "maru",
      "lv": "基礎",
      "q": "三角形の内心は、3つの頂点からの距離が必ず等しい。",
      "a": false,
      "exp": "① 内心の性質は、3辺からの距離が等しいことだよ。② 3頂点からの距離が等しいのは外心。③ この文は×。内心と外心で「どこまでの距離か」を区別しよう。",
      "examPractice": true,
      "points": 2,
      "examSection": "内心",
      "sourceStage": "mafs1"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "Iは△ABCの内心。∠A＝48°のとき、∠BICは何度？ 数字で答えよう。",
      "a": [
        "114"
      ],
      "exp": "① 内心からB・Cを結ぶ線は、それぞれの角の二等分線だよ。② ∠B＋∠C＝180°−48°＝132°なので、∠IBC＋∠ICB＝66°。③ ∠BIC＝180°−66°＝114°。90°＋48°÷2でも確かめられるよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            270,
            35
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "I": [
            263,
            175
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "I"
          ],
          [
            "B",
            "I"
          ],
          [
            "C",
            "I"
          ]
        ],
        "labels": [
          "I：内心",
          "∠A＝48°",
          "求める角：∠BIC"
        ]
      },
      "points": 3,
      "examSection": "内心",
      "sourceStage": "mafs1"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "Iは△ABCの内心。∠BIC＝116°のとき、∠BAIは何度？",
      "a": [
        "26"
      ],
      "exp": "① ∠BIC＝90°＋∠A÷2だから、∠A÷2＝116°−90°＝26°。② AIは∠Aの二等分線なので、∠BAI＝∠A÷2。③ 答えは26°。ここでは∠A全体を答えないようにしよう。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            270,
            35
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "I": [
            263,
            175
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "I"
          ],
          [
            "B",
            "I"
          ],
          [
            "C",
            "I"
          ]
        ],
        "labels": [
          "I：内心",
          "∠BIC＝116°",
          "求める角：∠BAI"
        ]
      },
      "points": 3,
      "examSection": "内心",
      "sourceStage": "mafs1"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "Iは△ABCの内心。∠A＝54°、∠ABI＝28°のとき、∠ACIは何度？",
      "a": [
        "35"
      ],
      "exp": "① BIは∠Bを二等分するから、∠B＝28°×2＝56°。② ∠C＝180°−54°−56°＝70°。③ CIも二等分線なので、∠ACI＝70°÷2＝35°だよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            270,
            35
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "I": [
            263,
            175
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "I"
          ],
          [
            "B",
            "I"
          ],
          [
            "C",
            "I"
          ]
        ],
        "labels": [
          "I：内心",
          "∠A＝54°",
          "∠ABI＝28°"
        ]
      },
      "points": 4,
      "examSection": "内心",
      "sourceStage": "mafs1"
    },
    {
      "type": "yon",
      "lv": "標準",
      "q": "三角形の重心は、どの3本の線が交わる点？",
      "choices": [
        "3本の中線",
        "3つの内角の二等分線",
        "3辺の垂直二等分線",
        "3本の高さ"
      ],
      "a": 0,
      "exp": "① 中線は頂点と向かいの辺の中点を結ぶ線分だよ。② 3本の中線は1点で交わる。③ その交点が重心。内心の「角の二等分線」と分けて覚えよう。",
      "examPractice": true,
      "points": 2,
      "examSection": "重心",
      "sourceStage": "mafs2"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "Gは△ABCの重心。直線AGと辺BCの交点をFとする。BC＝18 cmのとき、BFは何cm？",
      "a": [
        "9"
      ],
      "exp": "① 頂点Aと重心Gを通る直線は中線だから、FはBCの中点。② BF＝BC÷2＝18÷2。③ BF＝9 cm。重心の2：1ではなく、辺の中点の1：1を使うよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            250,
            35
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "F": [
            252.5,
            250
          ],
          "G": [
            251.7,
            178.3
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "F"
          ]
        ],
        "labels": [
          "G：重心",
          "BC＝18 cm"
        ]
      },
      "points": 2,
      "examSection": "重心",
      "sourceStage": "mafs2"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "Gは△ABCの重心、Fは辺BCの中点。中線AF＝21 cmのとき、AGは何cm？",
      "a": [
        "14"
      ],
      "exp": "① AG：GF＝2：1だから、AF全体は3つ分。② 1つ分は21÷3＝7 cm。③ AGは2つ分なので7×2＝14 cmだよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            250,
            35
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "F": [
            252.5,
            250
          ],
          "G": [
            251.7,
            178.3
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "F"
          ]
        ],
        "labels": [
          "G：重心",
          "F：BCの中点",
          "AF＝21 cm"
        ]
      },
      "points": 3,
      "examSection": "重心",
      "sourceStage": "mafs2"
    },
    {
      "type": "yon",
      "lv": "標準",
      "q": "Gは△ABCの重心。Gを通りBCに平行な直線が、AB・ACとそれぞれD・Eで交わる。AD：DBは？",
      "choices": [
        "2：1",
        "1：2",
        "1：1",
        "2：3"
      ],
      "a": 0,
      "exp": "① FをBCの中点とすると、AG：AF＝2：3。② DE∥BCだから△ADE∽△ABC、AD：AB＝2：3。③ DBは残り1つ分なので、AD：DB＝2：1。AD：ABと区別しよう。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            250,
            35
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "F": [
            252.5,
            250
          ],
          "G": [
            251.7,
            178.3
          ],
          "D": [
            126.7,
            178.3
          ],
          "E": [
            376.7,
            178.3
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "F"
          ],
          [
            "D",
            "E"
          ]
        ],
        "labels": [
          "G：重心",
          "DE ∥ BC",
          "DはAB上、EはAC上"
        ]
      },
      "points": 3,
      "examSection": "重心",
      "sourceStage": "mafs2"
    },
    {
      "type": "yon",
      "lv": "標準",
      "q": "Gは△ABCの重心、FはBCの中点、DはABの中点。Dを通りBCに平行な直線とAFの交点をEとする。AE：EGは？",
      "choices": [
        "3：1",
        "2：1",
        "1：1",
        "1：3"
      ],
      "a": 0,
      "exp": "① AFを6つ分とすると、重心よりAGは4つ分。② △ADE∽△ABFでAD：AB＝1：2だからAEは3つ分。③ EG＝AG−AE＝1つ分なので、AE：EG＝3：1になるよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            250,
            35
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "F": [
            252.5,
            250
          ],
          "G": [
            251.7,
            178.3
          ],
          "D": [
            157.5,
            142.5
          ],
          "E": [
            251.25,
            142.5
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "F"
          ],
          [
            "D",
            "E"
          ]
        ],
        "labels": [
          "G：重心",
          "D：ABの中点",
          "DE ∥ BC",
          "EはAF上"
        ]
      },
      "points": 4,
      "examSection": "重心",
      "sourceStage": "mafs2"
    },
    {
      "type": "yon",
      "lv": "標準",
      "q": "P・Q・Rはそれぞれ△ABCの辺BC・CA・AB上、AP・BQ・CRは1点で交わる。チェバの定理を正しく表した式は？",
      "choices": [
        "(BP/PC)×(CQ/QA)×(AR/RB)＝1",
        "(BP/PC)×(QA/CQ)×(AR/RB)＝1",
        "(BP/PC)＋(CQ/QA)＋(AR/RB)＝1",
        "(BP/BC)×(CQ/CA)×(AR/AB)＝1"
      ],
      "a": 0,
      "exp": "① 三角形の辺をB→C→A→Bの順に一周しよう。② 各辺で「進む向きの手前の線分／先の線分」を書くと、BP/PC、CQ/QA、AR/RB。③ この3つをかけた積が1だよ。1つだけ逆数にしないでね。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            250,
            30
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "P": [
            252.5,
            250
          ],
          "Q": [
            345,
            140
          ],
          "R": [
            157.5,
            140
          ],
          "O": [
            251.66666666666666,
            176.66666666666666
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "P"
          ],
          [
            "B",
            "Q"
          ],
          [
            "C",
            "R"
          ]
        ],
        "labels": [
          "AP・BQ・CRは1点Oで交わる"
        ]
      },
      "points": 2,
      "examSection": "チェバの定理",
      "sourceStage": "mafs3"
    },
    {
      "type": "yon",
      "lv": "標準",
      "q": "△ABCでPはBC上、QはCA上、RはAB上。AP・BQ・CRは1点で交わる。CQ：QA＝3：2、AR：RB＝2：5のとき、BP：PCは？",
      "choices": [
        "5：3",
        "3：5",
        "5：2",
        "3：2"
      ],
      "a": 0,
      "exp": "① チェバの定理より(BP/PC)×(CQ/QA)×(AR/RB)＝1。② (BP/PC)×(3/2)×(2/5)＝1から、BP/PC＝5/3。③ BP：PC＝5：3。積が1に戻るか確かめよう。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            250,
            30
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "P": [
            299.375,
            250
          ],
          "Q": [
            326,
            118
          ],
          "R": [
            197.14285714285714,
            92.85714285714286
          ],
          "O": [
            275.48387096774195,
            143.5483870967742
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "P"
          ],
          [
            "B",
            "Q"
          ],
          [
            "C",
            "R"
          ]
        ],
        "labels": [
          "AP・BQ・CRは1点Oで交わる",
          "CQ：QA＝3：2",
          "AR：RB＝2：5"
        ]
      },
      "points": 3,
      "examSection": "チェバの定理",
      "sourceStage": "mafs3"
    },
    {
      "type": "yon",
      "lv": "標準",
      "q": "△ABCでP・Q・RはそれぞれBC・CA・AB上、AP・BQ・CRは1点で交わる。BP：PC＝4：5、AR：RB＝5：6のとき、CQ：QAは？",
      "choices": [
        "3：2",
        "2：3",
        "4：5",
        "6：5"
      ],
      "a": 0,
      "exp": "① チェバの定理から(4/5)×(CQ/QA)×(5/6)＝1。② 既知の比の積は2/3だから、CQ/QA＝3/2。③ CQ：QA＝3：2だよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            250,
            30
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "P": [
            231.66666666666666,
            250
          ],
          "Q": [
            326,
            118
          ],
          "R": [
            165.9090909090909,
            130
          ],
          "O": [
            239,
            162
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "P"
          ],
          [
            "B",
            "Q"
          ],
          [
            "C",
            "R"
          ]
        ],
        "labels": [
          "AP・BQ・CRは1点Oで交わる",
          "BP：PC＝4：5",
          "AR：RB＝5：6"
        ]
      },
      "points": 3,
      "examSection": "チェバの定理",
      "sourceStage": "mafs3"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "△ABCでP・Q・RはそれぞれBC・CA・AB上、AP・BQ・CRは1点で交わる。BP＝6、PC＝9、CQ＝4、QA＝8、AR＝3のとき、RBは？",
      "a": [
        "1"
      ],
      "exp": "① チェバの定理に長さを代入して、(6/9)×(4/8)×(3/RB)＝1。② (2/3)×(1/2)×(3/RB)＝1なので、1/RB＝1。③ RB＝1。長さの単位はすべてそろえて考えよう。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            250,
            30
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "P": [
            215,
            250
          ],
          "Q": [
            376.6666666666667,
            176.66666666666669
          ],
          "R": [
            111.25,
            195
          ],
          "O": [
            220.83333333333331,
            213.33333333333337
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "P"
          ],
          [
            "B",
            "Q"
          ],
          [
            "C",
            "R"
          ]
        ],
        "labels": [
          "AP・BQ・CRは1点Oで交わる",
          "BP＝6、PC＝9",
          "CQ＝4、QA＝8",
          "AR＝3"
        ]
      },
      "points": 3,
      "examSection": "チェバの定理",
      "sourceStage": "mafs3"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "△ABCでP・Q・RはそれぞれBC・CA・AB上、AP・BQ・CRは1点で交わる。BP：PC＝3：2、CQ：QA＝4：5、AB＝22のとき、ARは？",
      "a": [
        "10"
      ],
      "exp": "① チェバの定理より(3/2)×(4/5)×(AR/RB)＝1だから、AR：RB＝5：6。② AB全体は比の合計11に当たるので、1つ分は22÷11＝2。③ AR＝2×5＝10。ARとRBを逆にしないようにしよう。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            250,
            30
          ],
          "B": [
            65,
            250
          ],
          "C": [
            440,
            250
          ],
          "P": [
            290,
            250
          ],
          "Q": [
            355.55555555555554,
            152.22222222222223
          ],
          "R": [
            165.9090909090909,
            130
          ],
          "O": [
            277.02702702702703,
            178.64864864864865
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "P"
          ],
          [
            "B",
            "Q"
          ],
          [
            "C",
            "R"
          ]
        ],
        "labels": [
          "AP・BQ・CRは1点Oで交わる",
          "BP：PC＝3：2",
          "CQ：QA＝4：5",
          "AB＝22"
        ]
      },
      "points": 4,
      "examSection": "チェバの定理",
      "sourceStage": "mafs3"
    },
    {
      "type": "yon",
      "lv": "標準",
      "q": "三角形の3辺またはその延長と、頂点を通らない1本の直線との交点の比を扱う定理は？",
      "choices": [
        "メネラウスの定理",
        "チェバの定理",
        "三平方の定理",
        "内角の二等分線の定理"
      ],
      "a": 0,
      "exp": "① 交点が3つとも1本の直線上にあることに注目しよう。② この配置ではメネラウスの定理を使えるよ。③ チェバの定理の目印は、頂点から引いた3本が1点で交わること。図の条件から使う定理を選ぼう。",
      "examPractice": true,
      "points": 2,
      "examSection": "メネラウスの定理",
      "sourceStage": "mafs4"
    },
    {
      "type": "yon",
      "lv": "標準",
      "q": "△ABCで、PはBCをC側へ延長した直線上、RはAB上、QはCA上にあり、P・Q・Rは一直線。BC：CP＝4：3、AR：RB＝1：2のとき、CQ：QAは？",
      "choices": [
        "6：7",
        "7：6",
        "3：2",
        "2：3"
      ],
      "a": 0,
      "exp": "① B・C・Pの順なのでBP＝BC＋CP、BP：PC＝7：3。② メネラウスの定理で(7/3)×(CQ/QA)×(1/2)＝1。③ CQ/QA＝6/7だからCQ：QA＝6：7。BC/CPをそのまま使わないでね。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            220,
            30
          ],
          "B": [
            60,
            235
          ],
          "C": [
            282.85714285714283,
            235
          ],
          "P": [
            450,
            235
          ],
          "Q": [
            253.84615384615384,
            140.38461538461536
          ],
          "R": [
            166.66666666666669,
            98.33333333333333
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "P"
          ],
          [
            "C",
            "A"
          ],
          [
            "R",
            "P"
          ]
        ],
        "labels": [
          "B・C・Pはこの順に一直線",
          "R・Q・Pは一直線",
          "BC：CP＝4：3",
          "AR：RB＝1：2"
        ]
      },
      "points": 3,
      "examSection": "メネラウスの定理",
      "sourceStage": "mafs4"
    },
    {
      "type": "yon",
      "lv": "標準",
      "q": "△ABCで、PはBCをC側へ延長した直線上、RはAB上、QはCA上にあり、P・Q・Rは一直線。BP＝18、PC＝6、CQ：QA＝1：2のとき、AR：RBは？",
      "choices": [
        "2：3",
        "3：2",
        "1：3",
        "3：1"
      ],
      "a": 0,
      "exp": "① BPとPCはすでに分かっているので、その比18/6＝3を使うよ。② メネラウスの定理から3×(1/2)×(AR/RB)＝1。③ AR/RB＝2/3だからAR：RB＝2：3。ここで18と6を足す必要はないよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            220,
            30
          ],
          "B": [
            60,
            235
          ],
          "C": [
            320,
            235
          ],
          "P": [
            450,
            235
          ],
          "Q": [
            286.66666666666663,
            166.66666666666666
          ],
          "R": [
            156,
            112
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "P"
          ],
          [
            "C",
            "A"
          ],
          [
            "R",
            "P"
          ]
        ],
        "labels": [
          "B・C・Pはこの順に一直線",
          "R・Q・Pは一直線",
          "BP＝18、PC＝6",
          "CQ：QA＝1：2"
        ]
      },
      "points": 3,
      "examSection": "メネラウスの定理",
      "sourceStage": "mafs4"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "△ABCで、PはBCをC側へ延長した直線上、RはAB上、QはCA上にあり、P・Q・Rは一直線。CQ：QA＝3：4、AR：RB＝2：3、CP＝6のとき、BCは？",
      "a": [
        "6"
      ],
      "exp": "① メネラウスの定理から(BP/PC)×(3/4)×(2/3)＝1なのでBP：PC＝2：1。② PC＝6だからBP＝12。③ B・C・Pの順なのでBC＝BP−CP＝12−6＝6だよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            220,
            30
          ],
          "B": [
            60,
            235
          ],
          "C": [
            255,
            235
          ],
          "P": [
            450,
            235
          ],
          "Q": [
            240,
            147.14285714285714
          ],
          "R": [
            156,
            112
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "P"
          ],
          [
            "C",
            "A"
          ],
          [
            "R",
            "P"
          ]
        ],
        "labels": [
          "B・C・Pはこの順に一直線",
          "R・Q・Pは一直線",
          "CQ：QA＝3：4",
          "AR：RB＝2：3",
          "CP＝6"
        ]
      },
      "points": 3,
      "examSection": "メネラウスの定理",
      "sourceStage": "mafs4"
    },
    {
      "type": "yon",
      "lv": "標準",
      "q": "P・B・Cはこの順に一直線。Aは直線PC上にない点、Rは辺AC上、QはABとPRの交点。PB：BC＝2：3、CR：RA＝5：2のとき、PQ：QRは？",
      "choices": [
        "7：3",
        "3：7",
        "5：2",
        "2：5"
      ],
      "a": 0,
      "exp": "① △PCRを直線BQAが横切ると見て、メネラウスの定理を使うよ。CA：AR＝(5＋2)：2＝7：2。② (PB/BC)×(CA/AR)×(RQ/QP)＝1より、(2/3)×(7/2)×(RQ/QP)＝1。③ RQ/QP＝3/7だから、求めるPQ：QR＝7：3。最後は比の順番を確認しよう。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            200,
            30
          ],
          "B": [
            201,
            245
          ],
          "C": [
            435,
            245
          ],
          "P": [
            45,
            245
          ],
          "Q": [
            200.50000000000003,
            137.49999999999994
          ],
          "R": [
            267.1428571428571,
            91.42857142857142
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "P",
            "C"
          ],
          [
            "P",
            "R"
          ]
        ],
        "labels": [
          "P・B・Cはこの順に一直線",
          "P・Q・Rは一直線",
          "PB：BC＝2：3",
          "CR：RA＝5：2"
        ]
      },
      "points": 4,
      "examSection": "メネラウスの定理",
      "sourceStage": "mafs4"
    },
    {
      "type": "maru",
      "lv": "基礎",
      "q": "3辺の長さが3、6、8の三角形は存在する。○か×か。",
      "a": true,
      "exp": "①最も長い辺が、残り2辺の和より小さければ三角形を作れるよ。②最大は8で、3＋6＝9 ＞ 8。③条件を満たすので○だよ。",
      "examPractice": true,
      "points": 2,
      "examSection": "三角形の辺と角・成立条件",
      "sourceStage": "mafs5"
    },
    {
      "type": "maru",
      "lv": "基礎",
      "q": "3辺の長さが2、5、7の三角形は存在する。○か×か。",
      "a": false,
      "exp": "①三角形では、2辺の和が残りの1辺より大きいことが必要だよ。②2＋5＝7で、最大の辺と等しくなってしまう。③一直線になるので三角形は存在せず、×だよ。等号は含めないね。",
      "examPractice": true,
      "points": 2,
      "examSection": "三角形の辺と角・成立条件",
      "sourceStage": "mafs5"
    },
    {
      "type": "yon",
      "lv": "標準",
      "q": "△ABCで∠A＝48°、∠B＝67°。a＝BC、b＝CA、c＝ABを大きい順に並べよう。",
      "choices": [
        "a ＞ b ＞ c",
        "c ＞ b ＞ a",
        "b ＞ c ＞ a",
        "b ＞ a ＞ c"
      ],
      "a": 2,
      "exp": "①三角形の内角の和は180°だよ。②∠C＝180°−48°−67°＝65°。67° ＞ 65° ＞ 48°なので∠B ＞ ∠C ＞ ∠A。③向かいの辺もb ＞ c ＞ aだよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            245,
            35
          ],
          "B": [
            75,
            250
          ],
          "C": [
            425,
            250
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ]
        ],
        "labels": [
          "∠A＝48°、∠B＝67°",
          "a＝BC、b＝CA、c＝AB"
        ]
      },
      "points": 4,
      "examSection": "三角形の辺と角・成立条件",
      "sourceStage": "mafs5"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "3辺の長さが4、9、xの三角形が存在する。xが整数のとき、何通りある？（数だけ入力）",
      "a": [
        "7"
      ],
      "exp": "①三角形の成立条件から、9−4 ＜ x ＜ 9＋4。②5 ＜ x ＜ 13なので、整数xは6、7、8、9、10、11、12。③全部で7通りだよ。端の5と13は含めないね。",
      "examPractice": true,
      "points": 4,
      "examSection": "三角形の辺と角・成立条件",
      "sourceStage": "mafs5"
    },
    {
      "type": "maru",
      "lv": "基礎",
      "q": "4点A、B、P、Qは互いに異なり、P、Qは直線ABの同じ側にある。∠APB＝∠AQB＝46°なら、4点は同一円周上にある。○か×か。",
      "a": true,
      "exp": "①円周角の定理の逆を使おう。②P、Qが直線ABの同じ側にあり、同じ線分ABを見込む角が等しい。③逆の条件を満たすので、4点は同一円周上にあり、○だよ。",
      "examPractice": true,
      "points": 2,
      "examSection": "円周角",
      "sourceStage": "mafs6"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "円の中心をOとする。小さい弧ABに対する中心角∠AOB＝124°で、Pはその小さい弧AB上にない円周上の点。∠APBは何度？（数だけ入力）",
      "a": [
        "62"
      ],
      "exp": "①同じ弧に対する円周角は中心角の半分だよ。②Pは小さい弧AB上にないので、∠APBはその小さい弧を見込む。③124°÷2＝62°だよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            150,
            225
          ],
          "B": [
            350,
            225
          ],
          "P": [
            250,
            25
          ],
          "O": [
            250,
            150
          ]
        },
        "segments": [
          [
            "A",
            "O"
          ],
          [
            "O",
            "B"
          ],
          [
            "A",
            "P"
          ],
          [
            "P",
            "B"
          ]
        ],
        "circles": [
          {
            "cx": 250,
            "cy": 150,
            "r": 125
          }
        ],
        "labels": [
          "Oは中心、∠AOB＝124°",
          "Pは小さい弧AB上にない"
        ],
        "pointOffsets": {
          "O": [
            0,
            22
          ]
        }
      },
      "points": 3,
      "examSection": "円周角",
      "sourceStage": "mafs6"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "A、B、C、Dがこの順に同じ円周上にある。∠ABD＝42°のとき、∠ACDは何度？（数だけ入力）",
      "a": [
        "42"
      ],
      "exp": "①同じ弧に対する円周角は等しいよ。②∠ABDも∠ACDも、B、Cを含まない弧ADを見込む。③∠ACD＝∠ABD＝42°だよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            175,
            50
          ],
          "B": [
            175,
            250
          ],
          "C": [
            350,
            225
          ],
          "D": [
            350,
            75
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "D"
          ],
          [
            "D",
            "A"
          ],
          [
            "A",
            "C"
          ],
          [
            "B",
            "D"
          ]
        ],
        "circles": [
          {
            "cx": 250,
            "cy": 150,
            "r": 125
          }
        ],
        "labels": [
          "A、B、C、Dはこの順に円周上",
          "∠ABD＝42°"
        ]
      },
      "points": 3,
      "examSection": "円周角",
      "sourceStage": "mafs6"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "A、B、C、Dがこの順に同じ円周上にあり、ACは直径。∠CAD＝27°のとき、∠ABDは何度？（数だけ入力）",
      "a": [
        "63"
      ],
      "exp": "①直径ACに対する∠ADC＝90°だよ。②△ACDで∠ACD＝180°−90°−27°＝63°。③∠ABDと∠ACDは同じ弧ADを見込むので、∠ABD＝63°だよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            125,
            150
          ],
          "B": [
            285,
            30
          ],
          "C": [
            375,
            150
          ],
          "D": [
            285,
            270
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "A"
          ],
          [
            "A",
            "D"
          ],
          [
            "D",
            "C"
          ],
          [
            "B",
            "D"
          ]
        ],
        "circles": [
          {
            "cx": 250,
            "cy": 150,
            "r": 125
          }
        ],
        "labels": [
          "ACは直径、∠CAD＝27°"
        ]
      },
      "points": 3,
      "examSection": "円周角",
      "sourceStage": "mafs6"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "A、B、C、Dがこの順に同じ円周上にあり、対角線ACとBDがPで交わる。∠ABD＝32°、∠BDC＝38°のとき、∠APDは何度？（数だけ入力）",
      "a": [
        "70"
      ],
      "exp": "①同じ弧BCを見るので、∠BAC＝∠BDC＝38°だよ。②△ABPで∠BAP＝38°、∠ABP＝32°だから、∠APB＝180°−38°−32°＝110°。③B、P、Dは一直線なので、∠APD＝180°−110°＝70°だよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            175,
            50
          ],
          "B": [
            175,
            250
          ],
          "C": [
            350,
            225
          ],
          "D": [
            350,
            75
          ],
          "P": [
            275,
            150
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "D"
          ],
          [
            "D",
            "A"
          ],
          [
            "A",
            "C"
          ],
          [
            "B",
            "D"
          ]
        ],
        "circles": [
          {
            "cx": 250,
            "cy": 150,
            "r": 125
          }
        ],
        "labels": [
          "ACとBDの交点がP",
          "∠ABD＝32°、∠BDC＝38°"
        ],
        "pointOffsets": {
          "P": [
            0,
            -16
          ]
        }
      },
      "points": 4,
      "examSection": "円周角",
      "sourceStage": "mafs6"
    },
    {
      "type": "maru",
      "lv": "基礎",
      "q": "凸四角形ABCDで、∠ABC＝90°、∠ADC＝90°である。この四角形は円に内接する。○か×か。",
      "a": true,
      "exp": "①向かい合う角∠Bと∠Dの和を調べよう。②90°＋90°＝180°。③内接条件を満たすので○だよ。ACを直径とする円を考える方法でも説明できるね。",
      "examPractice": true,
      "points": 2,
      "examSection": "円に内接する四角形",
      "sourceStage": "mafs7"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "四角形ABCDは円に内接している。∠A＝76°のとき、∠Cは何度？（数だけ入力）",
      "a": [
        "104"
      ],
      "exp": "①円に内接する四角形の対角の和は180°だよ。②∠A＋∠C＝180°に76°を代入する。③∠C＝180°−76°＝104°だよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            175,
            50
          ],
          "B": [
            175,
            250
          ],
          "C": [
            350,
            225
          ],
          "D": [
            350,
            75
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "D"
          ],
          [
            "D",
            "A"
          ]
        ],
        "circles": [
          {
            "cx": 250,
            "cy": 150,
            "r": 125
          }
        ],
        "labels": [
          "四角形ABCDは円に内接、∠A＝76°"
        ]
      },
      "points": 3,
      "examSection": "円に内接する四角形",
      "sourceStage": "mafs7"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "四角形ABCDは円に内接し、∠A＝101°。辺BCをCの先の点Eまで延ばしたとき、外角∠DCEは何度？（数だけ入力）",
      "a": [
        "101"
      ],
      "exp": "①円に内接する四角形では、外角はその向かいの内角に等しいよ。②Cの内角は180°−101°＝79°、外角∠DCEは180°−79°。③∠DCE＝101°だよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            175,
            50
          ],
          "B": [
            175,
            250
          ],
          "C": [
            350,
            225
          ],
          "D": [
            350,
            75
          ],
          "E": [
            420,
            215
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "D"
          ],
          [
            "D",
            "A"
          ],
          [
            "C",
            "E"
          ]
        ],
        "circles": [
          {
            "cx": 250,
            "cy": 150,
            "r": 125
          }
        ],
        "labels": [
          "∠A＝101°、B、C、Eはこの順に一直線"
        ]
      },
      "points": 3,
      "examSection": "円に内接する四角形",
      "sourceStage": "mafs7"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "円に内接する四角形ABCDで、∠A＝(2x＋12)°、∠C＝(3x＋18)°。xを求めよう。（数だけ入力）",
      "a": [
        "30"
      ],
      "exp": "①対角の和が180°だから、(2x＋12)＋(3x＋18)＝180。②5x＋30＝180より、5x＝150。③x＝30だよ。確認すると∠A＝72°、∠C＝108°で和は180°になるね。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            175,
            50
          ],
          "B": [
            175,
            250
          ],
          "C": [
            350,
            225
          ],
          "D": [
            350,
            75
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "D"
          ],
          [
            "D",
            "A"
          ]
        ],
        "circles": [
          {
            "cx": 250,
            "cy": 150,
            "r": 125
          }
        ],
        "labels": [
          "∠A＝(2x＋12)°、∠C＝(3x＋18)°"
        ]
      },
      "points": 3,
      "examSection": "円に内接する四角形",
      "sourceStage": "mafs7"
    },
    {
      "type": "suji",
      "lv": "標準",
      "q": "四角形ABCDは円に内接し、対角線BDを引く。∠ABD＝33°、∠ADB＝41°のとき、∠BCDは何度？（数だけ入力）",
      "a": [
        "74"
      ],
      "exp": "①まず△ABDの内角の和を使うよ。②∠BAD＝180°−33°−41°＝106°。③円に内接する四角形の対角の和から、∠BCD＝180°−106°＝74°だよ。",
      "examPractice": true,
      "maDiagram": {
        "kind": "geometry",
        "points": {
          "A": [
            175,
            50
          ],
          "B": [
            175,
            250
          ],
          "C": [
            350,
            225
          ],
          "D": [
            350,
            75
          ]
        },
        "segments": [
          [
            "A",
            "B"
          ],
          [
            "B",
            "C"
          ],
          [
            "C",
            "D"
          ],
          [
            "D",
            "A"
          ],
          [
            "B",
            "D"
          ]
        ],
        "circles": [
          {
            "cx": 250,
            "cy": 150,
            "r": 125
          }
        ],
        "labels": [
          "∠ABD＝33°、∠ADB＝41°"
        ]
      },
      "points": 4,
      "examSection": "円に内接する四角形",
      "sourceStage": "mafs7"
    }
  ],
  "cards": []
});

export const units = HQ.units;
export const cards = HQ.cards;
