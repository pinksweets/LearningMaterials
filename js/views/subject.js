import { el, app, escapeAttr, escapeHtml } from "../utils.js";
import { stopTimer } from "../timer.js";
import { stopBossTension, stopSpeech } from "../audio.js";
import {
  state,
  stageMastery,
  isStageUnlockedForBoss,
  subjectClearedCount,
  weakestStage,
  leapSessionsOn,
  stagesOfSubject,
  isSubjectGroupCollapsed,
  setSubjectGroupCollapsed,
  setSubjectGroupsCollapsed
} from "../state.js";
import { QUESTIONS } from "../content.js";
import { renderHome } from "./home.js";
import { startStage, startBoss } from "./quiz.js";
import { startLeapSpeed } from "./leap.js";
import { LEAP_BASIC_SUBJECT, LEAP_DAILY_TARGET } from "../leap-study.js";

/* ============================================================
   教科ホーム（新設）：指定した教科のステージ一覧のみ表示
============================================================ */
export function renderSubjectHome(subject){
  stopTimer(); // 教科ホームに戻る全経路でタイマーを確実に止める（防御的）
  stopBossTension();
  stopSpeech();

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
    const bossBtn = `<button class="bossBtn ${bossUnlocked?'':'locked'}" data-boss="${escapeAttr(sid)}" type="button">${bossDone?'👑 再挑戦':(bossUnlocked?'👹 ボス戦':'🔒 ボス戦')}</button>`;
    const leapBtn = subject===LEAP_BASIC_SUBJECT
      ? `<button class="leapFastBtn" data-leap-fast="${escapeAttr(sid)}" type="button">⚡ 高速</button>` : '';
    const pageHtml = s.page ? `　｜　教科書 p.${escapeHtml(s.page)}` : "";
    return `<div class="stage" data-stage="${escapeAttr(sid)}" tabindex="0" role="button" aria-label="${escapeAttr(s.title)}を通常プレイする">
      <div class="no">${index}</div>
      <div style="flex:1;min-width:0">
        <div class="t">${escapeHtml(s.title)}</div>
        <div class="d">${escapeHtml(s.desc)}　全${s.data.length}問${pageHtml}</div>
        <div class="mastery"><i style="width:${m.pct}%"></i></div>
        <div class="masteryTxt">習熟 ${m.pct}%（${m.mastered}/${m.total}問マスター）</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <div class="star">${cleared?('★ '+best+'%'):'▶'}</div>
        ${leapBtn}${bossBtn}
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

  const leapIntro = subject===LEAP_BASIC_SUBJECT
    ? `<div class="leapSpeedIntro"><strong>⚡ 3分高速周回</strong><span>英単語を見て思い出す→答えを表示→わかった/あやしい。各Weekの「⚡ 高速」から始めよう。</span></div>` : '';
  const leapDailyHtml = subject===LEAP_BASIC_SUBJECT
    ? (()=>{
        const today=Math.min(leapSessionsOn(),LEAP_DAILY_TARGET);
        return `<div class="leapSubjectDaily" aria-label="LEAP Basic 今日の高速周回進捗"><strong>今日の高速周回：${today}/${LEAP_DAILY_TARGET}回</strong><span>1回＝時間切れまたは全件完了。途中終了は今日の回数に加算されません。</span></div>`;
      })() : '';

  app().innerHTML = "";
  app().appendChild(el(`<div>
    <h1>${escapeHtml(subject)}</h1>
    <button class="btn secondary small" id="subjectBackBtn" style="margin-bottom:10px">← 教科選択へ</button>
    <div class="card">
      <div class="hud">
        <span class="chip">クリア <span class="em">${cleared}/${total}</span></span>
      </div>
      ${leapDailyHtml}
      <div class="muted">好きなステージからいつでも始められるよ。1問ごとに解説が出るよ。</div>
      ${leapIntro}
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
      if(e.target.closest('[data-boss],[data-leap-fast]'))return; // 補助ボタンのクリックはステージ通常開始と混同しない
      startStage(node.dataset.stage);
    });
    node.addEventListener('keydown',(e)=>{
      if(e.target.closest('button,[data-boss],[data-leap-fast]'))return;
      if(e.key!=='Enter'&&e.key!==' ')return;
      e.preventDefault();
      startStage(node.dataset.stage);
    });
  });
  document.querySelectorAll('[data-boss]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      startBoss(btn.dataset.boss);
    });
  });
  document.querySelectorAll('[data-leap-fast]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      startLeapSpeed(btn.dataset.leapFast);
    });
  });
  const ws=document.querySelector('.weakspot');
  if(ws) ws.addEventListener('click',()=>startStage(ws.dataset.stage));
}
