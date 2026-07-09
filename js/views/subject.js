import { el, app, escapeAttr, escapeHtml } from "../utils.js";
import { stopTimer } from "../timer.js";
import { stopBossTension } from "../audio.js";
import {
  state,
  stageMastery,
  isStageUnlockedForBoss,
  subjectClearedCount,
  weakestStage,
  stagesOfSubject,
  isSubjectGroupCollapsed,
  setSubjectGroupCollapsed,
  setSubjectGroupsCollapsed
} from "../state.js";
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

  const sections=[];
  sids.forEach(sid=>{
    const group = QUESTIONS[sid].group || "";
    const last = sections[sections.length-1];
    if(last && last.group===group)last.sids.push(sid);
    else sections.push({group,sids:[sid]});
  });
  const groupNames=[...new Set(sections.filter(section=>section.group).map(section=>section.group))];
  const groupControlsHtml = groupNames.length
    ? `<div class="subjectTools">
        <button class="btn secondary small" id="expandAllGroups" type="button">全部開く</button>
        <button class="btn secondary small" id="collapseAllGroups" type="button">全部閉じる</button>
      </div>` : "";

  function stageHtml(sid,index){
    const s=QUESTIONS[sid];
    const best = state.stageBest[sid];
    const cleared = state.stageCleared[sid];
    const m=stageMastery(sid);
    const bossUnlocked = isStageUnlockedForBoss(sid);
    const bossDone = !!state.bossCleared[sid];
    const bossBtn = `<button class="bossBtn ${bossUnlocked?'':'locked'}" data-boss="${escapeAttr(sid)}">${bossDone?'👑 再挑戦':(bossUnlocked?'👹 ボス戦':'🔒 ボス戦')}</button>`;
    const pageHtml = s.page ? `　｜　教科書 p.${escapeHtml(s.page)}` : "";
    return `<div class="stage" data-stage="${escapeAttr(sid)}">
      <div class="no">${index}</div>
      <div style="flex:1;min-width:0">
        <div class="t">${escapeHtml(s.title)}</div>
        <div class="d">${escapeHtml(s.desc)}　全${s.data.length}問${pageHtml}</div>
        <div class="mastery"><i style="width:${m.pct}%"></i></div>
        <div class="masteryTxt">習熟 ${m.pct}%（${m.mastered}/${m.total}問マスター）</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <div class="star">${cleared?('★ '+best+'%'):'▶'}</div>
        ${bossBtn}
      </div>
    </div>`;
  }

  let stageIndex=0;
  const stagesHtml = sections.map((section,sectionIndex)=>{
    const body=section.sids.map(sid=>stageHtml(sid,++stageIndex)).join("");
    if(!section.group)return body;
    const collapsed=isSubjectGroupCollapsed(subject,section.group);
    const bodyId='stageGroupBody'+sectionIndex;
    return `<section class="stageGroup ${collapsed?'collapsed':''}">
      <button class="groupToggle" type="button" data-group-toggle="${escapeAttr(section.group)}" aria-expanded="${collapsed?'false':'true'}" aria-controls="${bodyId}">
        <span>${escapeHtml(section.group)}</span>
        <span class="groupToggleState">${collapsed?'開く':'閉じる'}</span>
      </button>
      <div class="stageGroupBody" id="${bodyId}">${body}</div>
    </section>`;
  }).join("");

  const {cleared,total} = subjectClearedCount(subject);
  const weak=weakestStage(subject);
  const weakHtml = weak
    ? `<div class="weakspot" data-stage="${escapeAttr(weak.sid)}">📉 いま伸びしろNo.1：${escapeHtml(QUESTIONS[weak.sid].title)}（習熟 ${weak.pct}%）　タップで挑戦！</div>` : "";

  app().innerHTML = "";
  app().appendChild(el(`<div>
    <h1>${escapeHtml(subject)}</h1>
    <button class="btn secondary small" id="subjectBackBtn" style="margin-bottom:10px">← 教科選択へ</button>
    <div class="card">
      <div class="hud">
        <span class="chip">クリア <span class="em">${cleared}/${total}</span></span>
      </div>
      <div class="muted">好きなステージからいつでも始められるよ。1問ごとに解説が出るよ。</div>
      ${groupControlsHtml}
      ${stagesHtml}
      ${weakHtml}
    </div>
  </div>`));

  document.getElementById('subjectBackBtn').addEventListener('click',renderHome);
  const expandAll=document.getElementById('expandAllGroups');
  if(expandAll)expandAll.addEventListener('click',()=>{
    setSubjectGroupsCollapsed(subject,groupNames,false);
    renderSubjectHome(subject);
  });
  const collapseAll=document.getElementById('collapseAllGroups');
  if(collapseAll)collapseAll.addEventListener('click',()=>{
    setSubjectGroupsCollapsed(subject,groupNames,true);
    renderSubjectHome(subject);
  });
  document.querySelectorAll('[data-group-toggle]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const group=btn.dataset.groupToggle;
      setSubjectGroupCollapsed(subject,group,!isSubjectGroupCollapsed(subject,group));
      renderSubjectHome(subject);
    });
  });

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
