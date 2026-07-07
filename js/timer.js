/* js/timer.js — タイムアタック用タイマー管理 */

/* ============================================================
   追加機能：タイマー管理（単一ハンドルで多重起動を防止）
   離脱経路（回答・次へ・ホーム戻る・ボス敗北等）では必ず stopTimer() を呼ぶこと
============================================================ */
export const TIMER={interval:null, timeout:null};
export function stopTimer(){
  if(TIMER.interval){clearInterval(TIMER.interval);TIMER.interval=null;}
  if(TIMER.timeout){clearTimeout(TIMER.timeout);TIMER.timeout=null;}
}
export function timeLimitFor(q){
  if(typeof q.time==='number')return q.time;   // 追加機能（数学統合）：問題ごとの明示指定を最優先
  if(q.type==="suji"||q.type==="fill")return 60;  // 追加機能（数学統合）：計算時間を確保
  if(q.type==="junban")return 25;                 // 追加機能（数学統合）：nenpyoと同等の並べ替え時間
  return (q.type==="kumi"||q.type==="nenpyo") ? 25 : 15;
}
/* onTimeout: 時間切れ時に呼ぶコールバック（渡された q を使って不正解処理） */
export function startTimer(limitSec, onTick, onTimeout){
  stopTimer();  // 前のタイマーが残っていないことを保証
  let remain=limitSec;
  onTick(remain, limitSec);
  TIMER.interval=setInterval(()=>{
    remain--;
    if(remain<=0){
      stopTimer();
      onTick(0, limitSec);
      onTimeout();
      return;
    }
    onTick(remain, limitSec);
  },1000);
}
