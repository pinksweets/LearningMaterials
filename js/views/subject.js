import { el, app } from "../utils.js";
import { stopTimer } from "../timer.js";
import { stopBossTension } from "../audio.js";
import { state, stageMastery, isStageUnlockedForBoss, subjectClearedCount, weakestStage, stagesOfSubject } from "../state.js";
import { QUESTIONS } from "../content.js";
import { renderHome } from "./home.js";
import { startStage, startBoss } from "./quiz.js";

/* ============================================================
   教科ホーム（新設）：指定した教科のステージ一覧のみ表示
============================================================ */
export function renderSubjectHome(subject){
  stopTimer(); // 教科ホームに戻る全経路でタイマーを確実に止める（防御的）
  stopBossTension();

  const sids = stagesOfSubject(subject);

  // 数学のような大カテゴリ（group）を持つ教科は見出しを挟む。歴史のようにgroupが無い教科は見出し無しのまま。
  let lastGroup=null;
  const stagesHtml = sids.map((sid,i)=>{
    const s=QUESTIONS[sid];
    const best = state.stageBest[sid];
    const cleared = state.stageCleared[sid];
    const m=stageMastery(sid);
    const bossUnlocked = isStageUnlockedForBoss(sid);
    const bossDone = !!state.bossCleared[sid];
    const bossBtn = `<button class="bossBtn ${bossUnlocked?'':'locked'}" data-boss="${sid}">${bossDone?'👑 再挑戦':(bossUnlocked?'👹 ボス戦':'🔒 ボス戦')}</button>`;
    const pageHtml = s.page ? `　｜　教科書 p.${s.page}` : "";
    const group = s.group || "";
    let headHtml = "";
    if(group && group!==lastGroup){
      headHtml += `<div class="groupHead">${group}</div>`;
      lastGroup = group;
    } else if(!group){
      lastGroup = null;   // groupの無い単元が続く場合は次にgroup付き単元が来たら必ず見出しを出す
    }
    return `${headHtml}<div class="stage" data-stage="${sid}">
      <div class="no">${i+1}</div>
      <div style="flex:1;min-width:0">
        <div class="t">${s.title}</div>
        <div class="d">${s.desc}　全${s.data.length}問${pageHtml}</div>
        <div class="mastery"><i style="width:${m.pct}%"></i></div>
        <div class="masteryTxt">習熟 ${m.pct}%（${m.mastered}/${m.total}問マスター）</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <div class="star">${cleared?('★ '+best+'%'):'▶'}</div>
        ${bossBtn}
      </div>
    </div>`;
  }).join("");

  const {cleared,total} = subjectClearedCount(subject);
  const weak=weakestStage(subject);
  const weakHtml = weak
    ? `<div class="weakspot" data-stage="${weak.sid}">📉 いま伸びしろNo.1：${QUESTIONS[weak.sid].title}（習熟 ${weak.pct}%）　タップで挑戦！</div>` : "";

  app().innerHTML = "";
  app().appendChild(el(`<div>
    <h1>${subject}</h1>
    <button class="btn secondary small" id="subjectBackBtn" style="margin-bottom:10px">← 教科選択へ</button>
    <div class="card">
      <div class="hud">
        <span class="chip">クリア <span class="em">${cleared}/${total}</span></span>
      </div>
      <div class="muted">好きなステージからいつでも始められるよ。1問ごとに解説が出るよ。</div>
      ${stagesHtml}
      ${weakHtml}
    </div>
  </div>`));

  document.getElementById('subjectBackBtn').addEventListener('click',renderHome);

  document.querySelectorAll('.stage').forEach(node=>{
    node.addEventListener('click',(e)=>{
      if(e.target.closest('[data-boss]'))return; // ボスボタンのクリックはステージ通常開始と混同しない
      startStage(node.dataset.stage);
    });
  });
  document.querySelectorAll('[data-boss]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      startBoss(btn.dataset.boss);
    });
  });
  const ws=document.querySelector('.weakspot');
  if(ws) ws.addEventListener('click',()=>startStage(ws.dataset.stage));
}
