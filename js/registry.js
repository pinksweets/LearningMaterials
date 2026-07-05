/* ============================================================
   HQ registry — データ自己登録用の共有名前空間
   file:// でそのまま動かすため、fetch/ES modules は使わず
   classic <script src> のみで各 data/*.js が自分自身を登録する。

   使い方（data/sX_xxx.js 側）:
     HQ.registerUnit({
       id:"sN", title:"...", desc:"...", order:N,
       subject:"...",     // 省略可。ホームで教科ごとの見出しを作るためのラベル
       group:"...",       // 省略可。subject見出しの下に挟む大カテゴリのサブ見出し（例:"数と式"）
       questions:[ ... 既存QUESTIONS[sid].data と同じ形の配列 ... ],
       cards:[ ... この単元の図鑑カード定義 ... ]
     });

   任意（複数単元で共有したいカードがある場合）:
     HQ.registerCards([ {id,name,emoji,kind,desc}, ... ]);
============================================================ */
window.HQ = window.HQ || { units: [], cards: [] };

HQ.registerUnit = function (u) {
  HQ.units.push(u);
};

HQ.registerCards = function (list) {
  HQ.cards.push.apply(HQ.cards, list);
};
