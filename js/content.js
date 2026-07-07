import { units, sharedCards } from "../data/index.js";

const HQ = { units, cards: sharedCards };

/* ============================================================
   歴史総合クエスト｜エンジン本体
   HQ.units（各 data/*.js が registerUnit で登録した単元）から
   QUESTIONS / STAGE_ORDER / CARDS / CARD_BY_ID を動的に構築する。
   単元やカードを追加しても、この下のロジックは変更不要。
============================================================ */

/* ---------- HQ.units から QUESTIONS / STAGE_ORDER を構築 ---------- */
export const QUESTIONS = {};
HQ.units.forEach(u => {
  QUESTIONS[u.id] = { title: u.title, desc: u.desc, data: u.questions, subject: u.subject, group: u.group, page: u.page };
});
// order 昇順で並べたステージID一覧（ホーム表示・ボス戦・弱点マップ・SRSの対象範囲を決める）
export const STAGE_ORDER = HQ.units.slice().sort((a, b) => a.order - b.order).map(u => u.id);

/* ---------- HQ.units[].cards + HQ.cards から CARDS / CARD_BY_ID を構築 ---------- */
export const CARDS = [];
HQ.units.forEach(u => { if (u.cards) CARDS.push.apply(CARDS, u.cards); });
if (HQ.cards) CARDS.push.apply(CARDS, HQ.cards);
export const CARD_BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));

/* ---------- 全問題数（称号の母数などに使う。単元・問題を追加しても自動追従） ---------- */
export function totalQuestionCount() {
  return STAGE_ORDER.reduce((n, sid) => n + QUESTIONS[sid].data.length, 0);
}
