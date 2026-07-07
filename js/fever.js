/* js/fever.js — 連続正解フィーバー＋ボス弱点攻撃の進行管理 */

/* ============================================================
   追加機能：連続正解フィーバー＋ボス弱点攻撃
============================================================ */
export const FEVER_MAX=100;
export const FEVER_GAIN=20;
export const FEVER_MISS_LOSS=15;
export const FEVER_TURNS=3;
export const FEVER_BONUS=10;
export function initRewardProgress(c){
  if(typeof c.feverGauge!=='number')c.feverGauge=0;
  if(typeof c.feverLeft!=='number')c.feverLeft=0;
  if(typeof c.feverCount!=='number')c.feverCount=0;
  if(typeof c.weakHits!=='number')c.weakHits=0;
}
export function bossWeakRemain(c){
  const mod=(c.combo||0)%3;
  return mod===0 ? 3 : 3-mod;
}
export function applyFeverProgress(c,isCorrect,wasFeverActive){
  const out={started:false,ended:false};
  if(wasFeverActive){
    c.feverLeft=Math.max(0,c.feverLeft-1);
    out.ended=c.feverLeft===0;
    return out;
  }
  if(isCorrect){
    c.feverGauge=Math.min(FEVER_MAX,c.feverGauge+FEVER_GAIN);
    if(c.feverGauge>=FEVER_MAX){
      c.feverGauge=0;
      c.feverLeft=FEVER_TURNS;
      c.feverCount++;
      out.started=true;
    }
  }else{
    c.feverGauge=Math.max(0,c.feverGauge-FEVER_MISS_LOSS);
  }
  return out;
}
export function rewardHudHtml(c,isBoss){
  initRewardProgress(c);
  const lampCount=5;
  const lit=c.feverLeft>0 ? lampCount : Math.min(lampCount,c.combo||0);
  const lamps=Array.from({length:lampCount},(_,i)=>`<i class="${i<lit?'on':''}"></i>`).join("");
  const feverPct=Math.max(0,Math.min(100,c.feverGauge));
  const feverText=c.feverLeft>0 ? `フィーバー中 あと${c.feverLeft}問` : `あと${Math.ceil((FEVER_MAX-feverPct)/FEVER_GAIN)}正解でフィーバー`;
  const bossText=isBoss ? `<div class="rewardNote">弱点攻撃まであと${bossWeakRemain(c)}正解</div>` : "";
  return `<div class="rewardHud ${c.feverLeft>0?'feverOn':''}">
    <div class="rewardTop">
      <div>
        <div class="rewardLabel">連続正解ランプ</div>
        <div class="rewardLamps">${lamps}</div>
      </div>
      <div class="rewardStatus">${feverText}</div>
    </div>
    <div class="feverBar"><i style="width:${c.feverLeft>0?100:feverPct}%"></i></div>
    ${bossText}
  </div>`;
}
