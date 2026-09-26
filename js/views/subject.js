import { el, app, escapeAttr, escapeHtml, syncScreenHash } from "../utils.js";
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
  setSubjectGroupsCollapsed,
  isLessonSeen
} from "../state.js";
import { QUESTIONS } from "../content.js";
import { renderHome } from "./home.js";
import { startStage, startBoss, resumePanel } from "./quiz.js";
import { startLeapSpeed } from "./leap.js";
import { renderLesson } from "./lesson.js";
import { hasLesson } from "../lesson.js";
import { LEAP_BASIC_SUBJECT, LEAP_DAILY_TARGET } from "../leap-study.js";
import { renderSeptember15Home } from "./september15.js";
import { renderSeptemberHome } from "./september.js";
import { subjectHash } from '../utils.js';

/* ============================================================
   教科ホーム（新設）：指定した教科のステージ一覧のみ表示
============================================================ */
export function renderSubjectHome(subject){
  if(subject==='📅 9/15 英語小テスト対策'){renderSeptember15Home(true);return;}
  if(subject==='📅 9/11 小テスト対策'){renderSeptemberHome(true);return;}
  const september16=subject==='📅 9/16 実力テスト対策';
  if(september16)syncScreenHash('#test/2026-09-16');
  else syncScreenHash(subjectHash(subject));
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
    const bossBtn = s.data[0]?.examPractice ? '' : `<button class="bossBtn ${bossUnlocked?'':'locked'}" data-boss="${escapeAttr(sid)}" type="button">${bossDone?'👑 再挑戦':(bossUnlocked?'👹 ボス戦':'🔒 ボス戦')}</button>`;
    const lessonBtn = hasLesson(s)
      ? `<button class="lessonBtn ${isLessonSeen(sid)?'':'unread'}" data-lesson="${escapeAttr(sid)}" type="button">📖 ${isLessonSeen(sid)?'まなぶ':'まず まなぶ'}</button>` : '';
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
        ${lessonBtn}${leapBtn}${bossBtn}
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
    ${resumePanel(subject)}
    <button class="btn secondary small" id="subjectBackBtn" style="margin-bottom:10px">${september16?'← テスト対策へ':'← 教科選択へ'}</button>
    ${subject==='🧪 化学基礎'?`<section class="sepPlan"><strong>化学式が苦手なら｜1日10分・6問から</strong>
      <p>最初は「まず まなぶ」で確認してから、説明を閉じて入力しよう。時間制限はないよ。H2OやCa(OH)2のように普通の数字で入力できるよ。</p>
      <ol><li><a href="#/stage/ch1f1/1">① 基本分子</a>：名前・式・形をセットで覚える。</li><li><a href="#/stage/ch1f2/1">② イオン式</a>：元素記号・個数・電荷を区別する。</li><li><a href="#/stage/ch1f3/1">③ 電荷を合わせる</a>：合計0になる個数を考える。</li><li><a href="#/stage/ch1f4/1">④ 括弧のある式</a>：イオンのまとまりを保って書く。</li><li><a href="#/stage/ch1f5/1">⑤ ミニテスト</a>：6問・20点満点で確認。解説は最後だよ。</li></ol>
      <p>毎日10分の目安：前日の式を見ずに書く2分 → 新しい式を学ぶ3分 → 入力して答え合わせ3分 → 間違えた式を紙に書き直す2分。</p>
      <p>翌日・3日後・1週間後を目安に同じステージへ戻ろう。「今日の復習」も使えるよ。翌日も何も見ずに書けたら一歩前進！ ミニテストで間違えた分野を復習したら、下の100点模擬テストへ進もう。</p>
      <button class="btn" data-lesson="ch1f1" type="button">基本分子4つから まなぶ</button>
      </section><section class="sepPlan"><strong>10/13〜19 中間テスト｜模擬テストカリキュラム</strong>
      <ol><li>基礎固め：第7・8節の4ステージ40問で、組成式と電子対を練習。</li><li>範囲を仕上げる：第9・11節の4ステージ40問で、分子の形と結晶の性質を確認。</li><li>力試し：模擬テスト34問・100点満点。2点×10問、3点×16問、4点×8問。目安40分を自分で計って解こう。</li><li>振り返り：結果の分野別得点から復習し、翌日もう一度挑戦。目標は80点、最後は全分野の取りこぼしをなくそう。</li></ol>
      <p>模擬テストは練習問題から選んだ復習用。正解・解説は最後にまとめて確認できるよ。学校の実際の配点・出題を予想するものではないよ。</p>
      <a class="btn" href="#/stage/ch1mock1/1">100点満点の模擬テストを始める</a></section>`:''}
    ${september16?`<div class="sepPlan"><strong>9月16日｜国語・数学・英語の実力テスト</strong>
      <p>本番はBenesseの問題。ここでは、もらった写真の学習範囲に沿うオリジナル問題を練習するよ。Benesseの公式問題・本番の予想問題ではないよ。</p>
      <p>各教科5ステージ×10問。まずは①から、苦手なところは解説を読んでもう一度。国語・英語の読解本文もここで読めるよ。</p>
      <p>9/11〜13：基礎を確認 → 9/14〜15：苦手を解き直す → 9/16：間違えた考え方を見直す。英語①は音声でも確かめよう（本番のリスニング音源ではないよ）。</p></div>`:''}
    <div class="card">
      <div class="hud">
        <span class="chip">クリア <span class="em">${cleared}/${total}</span></span>
      </div>
      ${leapDailyHtml}
      <div class="muted">好きなステージからいつでも始められるよ。通常練習は1問ごと、模擬テストは最後に解説が出るよ。</div>
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
      if(e.target.closest('[data-boss],[data-leap-fast],[data-lesson]'))return; // 補助ボタンのクリックはステージ通常開始と混同しない
      openStage(node.dataset.stage);
    });
    node.addEventListener('keydown',(e)=>{
      if(e.target.closest('button,[data-boss],[data-leap-fast],[data-lesson]'))return;
      if(e.key!=='Enter'&&e.key!==' ')return;
      e.preventDefault();
      openStage(node.dataset.stage);
    });
  });
  document.querySelectorAll('[data-boss]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      startBoss(btn.dataset.boss);
    });
  });
  document.querySelectorAll('[data-lesson]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      renderLesson(btn.dataset.lesson);
    });
  });
  document.querySelectorAll('[data-leap-fast]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      startLeapSpeed(btn.dataset.leapFast);
    });
  });
  const ws=document.querySelector('.weakspot');
  if(ws) ws.addEventListener('click',()=>openStage(ws.dataset.stage));
}

/* レッスン付き単元は、初回のみレッスン必読（まなぶ→とく）。既読なら通常どおり開始する。 */
export function openStage(sid){
  const s=QUESTIONS[sid];
  if(hasLesson(s) && !isLessonSeen(sid)){ renderLesson(sid); return; }
  startStage(sid);
}
