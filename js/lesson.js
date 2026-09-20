/* js/lesson.js — 「まなぶ→とく」レッスンカードの表示データ生成。
   DOM・state に依存しないため、ブラウザと node:test の両方で検証できる。
   単元の lesson は「①たとえ話 ②式と単位 ③よくある勘違い」の3枚固定を運用ルールとする。 */
import { escapeHtml } from './utils.js';
import { mathText, graphSvg } from './math-display.js';

export const LESSON_CARD_COUNT = 3;
export const LESSON_KINDS = ['たとえ話', '式と単位', 'よくある勘違い'];

export function hasLesson(stage){
  return !!(stage && Array.isArray(stage.lesson) && stage.lesson.length);
}

/* 本文は "\n" 区切りの段落。数式まじりの行は mathText で MathML 化する。 */
export function lessonBodyHtml(body, options={}){
  const render = options.math ? (t)=>mathText(t) : (t)=>escapeHtml(t);
  return String(body||'').split('\n').filter(p=>p.trim()).map(p=>`<p>${render(p)}</p>`).join('');
}

export function lessonCardHtml(card, index, options={}){
  const kind = LESSON_KINDS[index] || '';
  const figure = card.graph ? graphSvg(card.graph, card.graphStep ?? 2) : '';
  const formula = card.formula ? `<div class="lessonFormula">${options.math?mathText(card.formula):escapeHtml(card.formula)}</div>` : '';
  return `<article class="lessonCard" data-lesson-card="${index}">
    <div class="lessonKind">${index+1}/${LESSON_CARD_COUNT}　${escapeHtml(kind)}</div>
    <h3>${escapeHtml(card.title||'')}</h3>
    ${lessonBodyHtml(card.body, options)}
    ${formula}
    ${figure}
  </article>`;
}

export function lessonCardsHtml(lesson, options={}){
  return (lesson||[]).map((card,i)=>lessonCardHtml(card,i,options)).join('');
}
