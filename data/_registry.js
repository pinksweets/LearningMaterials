/* ============================================================
   モジュールローカル registry シム
   旧 window.HQ 自己登録方式の data ファイルを ESM 化するための互換層。
   各 data ファイルが自分専用の registry を生成し、本体コードは無改変のまま
   HQ.registerUnit / HQ.registerCards を呼べる。
============================================================ */
export function createRegistry() {
  const HQ = { units: [], cards: [] };
  HQ.registerUnit = function (u) {
    HQ.units.push(u);
  };
  HQ.registerCards = function (list) {
    HQ.cards.push.apply(HQ.cards, list);
  };
  return HQ;
}
