/* js/answers.js — 解答文字列の正規化・一致判定 */

/* ---------- 追加機能：文字列の正規化（記述モードの表記ゆらぎ吸収） ---------- */
export function normalizeAnswer(s){
  if(s==null)return "";
  let x=String(s);
  x=x.replace(/[\s　]+/g,'');                 // 全角/半角空白の除去
  x=x.replace(/[＝=]/g,'=');                  // 等号ゆらぎ
  x=x.replace(/[・･]/g,'・');                 // 中黒ゆらぎ
  x=x.replace(/[（(]/g,'(').replace(/[）)]/g,')'); // 括弧ゆらぎ
  x=x.replace(/[ー－―‐]/g,'ー');              // 長音・ダッシュ類ゆらぎ
  x=x.replace(/[、,]/g,'、');
  x=x.replace(/[。.]/g,'。');
  // 追加機能（数学統合）：全角数字→半角、全角英字→半角、マイナス記号ゆらぎ統一
  x=x.replace(/[０-９]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0xFEE0));
  x=x.replace(/[Ａ-Ｚａ-ｚ]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0xFEE0));
  x=x.replace(/[−－ー―‐]/g,'-');              // マイナス記号ゆらぎ→半角ハイフンに統一（数値比較用）
  return x.toLowerCase();
}
export function isAnswerMatch(input, correct){
  const ni=normalizeAnswer(input), nc=normalizeAnswer(correct);
  if(ni==="")return false;
  if(ni===nc)return true;
  // 追加機能（数学統合）：文字列不一致でも、数値としてparseFloatが両方有限かつ一致すれば正解とみなす
  const fi=parseFloat(ni), fc=parseFloat(nc);
  if(Number.isFinite(fi)&&Number.isFinite(fc)&&fi===fc)return true;
  return false;
}
/* 追加機能（数学統合）：複数許容解対応の判定ヘルパー（answersは配列 or 単一値） */
export function isAnyAnswerMatch(input, answers){
  const list=Array.isArray(answers)?answers:[answers];
  return list.some(a=>isAnswerMatch(input,a));
}
