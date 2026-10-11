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
  QUESTIONS[u.id] = { title: u.title, desc: u.desc, data: u.questions, subject: u.subject, group: u.group, page: u.page,
    lesson: u.lesson, lessonMath: u.lessonMath, focus: u.focus }; // lesson/lessonMath/focus は「まなぶ→とく」機能と重点バッジ（省略可）
});
// order 昇順で並べたステージID一覧（ホーム表示・ボス戦・弱点マップ・SRSの対象範囲を決める）
export const STAGE_ORDER = HQ.units.slice().sort((a, b) => a.order - b.order).map(u => u.id);

/* 数学Ⅰの表示上の教材構成。元の教科名・単元ID・問題順は保存互換のため変更しない。 */
export const MATH1_SUBJECT = '📐 数学Ⅰ';
export const MATH1_ZERO_SUBJECT = '🐣 ２次関数 ゼロから';
export const MATH1_PREP_SUBJECT = '📐 数学Ⅰ テスト対策';
export const MATH1_CHAPTERS = [
  {id:'expressions', title:'数と式', desc:'整式の計算から一次不等式まで、式の扱い方を順に確かめよう。', sections:[
    {title:'基礎から順に', sids:['m1s1','m1s2','m1s3','m1s4','m1s5','m1s6']}
  ]},
  {id:'logic', title:'集合と命題', desc:'集合の関係と、命題が正しいかを判断する考え方を学ぼう。', sections:[
    {title:'基礎から順に', sids:['m2s1','m2s2','m2s3','m2s4']}
  ]},
  {id:'quadratics', title:'二次関数', desc:'関数と座標から始めて、平方完成・グラフ・移動・最大最小へ進もう。', sections:[
    {title:'1 関数と座標', sids:['njz1','m3s1','njz2']},
    {title:'2 放物線・軸・頂点', sids:['njz3','njz4','njz5','njz6']},
    {title:'3 平方完成と作図', sids:['njz7','m3s2','m3s3']},
    {title:'4 移動と対称', sids:['njz8','m3s4','njz9']},
    {title:'5 最大・最小', sids:['m3s5']},
    {title:'6 章の確認', sids:['njz10']}
  ]}
];
const MATH1_NORMAL_STAGE_IDS = MATH1_CHAPTERS.flatMap(chapter=>chapter.sections.flatMap(section=>section.sids));
const MATH1_PREP_STAGE_IDS = ['mqs1','mqs2','mqs3','mqs4','mqs5','mqs6','mqs7','mqs8','mqs9','mqmock1'];

export function canonicalSubject(subject) {
  return subject===MATH1_ZERO_SUBJECT ? MATH1_SUBJECT : subject;
}
export function displaySubjectForStage(sid) {
  if(MATH1_PREP_STAGE_IDS.includes(sid))return MATH1_PREP_SUBJECT;
  return canonicalSubject(QUESTIONS[sid]?.subject || 'その他');
}
export function displayStagesOfSubject(subject) {
  const displaySubject=canonicalSubject(subject);
  if(displaySubject===MATH1_SUBJECT)return MATH1_NORMAL_STAGE_IDS.slice();
  if(displaySubject===MATH1_PREP_SUBJECT)return MATH1_PREP_STAGE_IDS.slice();
  return STAGE_ORDER.filter(sid=>(QUESTIONS[sid].subject || 'その他')===displaySubject);
}

/* ---------- HQ.units[].cards + HQ.cards から CARDS / CARD_BY_ID を構築 ---------- */
export const CARDS = [];
HQ.units.forEach(u => { if (u.cards) CARDS.push.apply(CARDS, u.cards); });
if (HQ.cards) CARDS.push.apply(CARDS, HQ.cards);
export const CARD_BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));

/* ---------- 全問題数（称号の母数などに使う。単元・問題を追加しても自動追従） ---------- */
export function totalQuestionCount() {
  return STAGE_ORDER.reduce((n, sid) => n + QUESTIONS[sid].data.length, 0);
}
