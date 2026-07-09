import { el, app, toast, escapeAttr, escapeHtml, todayStr, addDays } from "../utils.js";
import { stopTimer } from "../timer.js";
import { stopBossTension, playAnswerSound, BGM, startYouTubeBgm, stopYouTubeBgm } from "../audio.js";
import {
  DAILY_GOAL_OPTIONS,
  state,
  save,
  evalTitle,
  dueList,
  subjectList,
  subjectClearedCount,
  subjectMastery,
  getStudyDay,
  normalizeDailyGoal,
  studyVolumeLevel,
  weeklyStudySummary
} from "../state.js";
import { CARDS, totalQuestionCount } from "../content.js";
import { renderSubjectHome } from "./subject.js";
import { renderCollection } from "./collection.js";
import { startReview } from "./quiz.js";

export function dateParts(dateStr){
  return dateStr.split('-').map(Number);
}
export function dayOfWeek(dateStr){
  const [y,m,d]=dateParts(dateStr);
  return new Date(y,m-1,d).getDay();
}
export function formatDateShort(dateStr){
  const [,m,d]=dateParts(dateStr);
  return m+'/'+d;
}
export function formatDateLong(dateStr){
  const [,m,d]=dateParts(dateStr);
  return m+'月'+d+'日';
}
export function accuracyLabel(day){
  return day.answered ? Math.round(day.correct/day.answered*100)+'%' : '-';
}
export function subjectSummary(subjects){
  const entries=Object.entries(subjects||{}).sort((a,b)=>b[1]-a[1]);
  if(!entries.length)return "科目記録なし";
  return entries.slice(0,3).map(([name,count])=>name+' '+count+'問').join('、');
}
export function studyDetailHtml(dateStr,day){
  return `<div class="studyDetailDate">${formatDateLong(dateStr)}</div>
    <div>回答 ${day.answered}問　正解 ${day.correct}問　正答率 ${accuracyLabel(day)}</div>
    <div>${escapeHtml(subjectSummary(day.subjects))}</div>`;
}
export function renderStudyGrass(today){
  const weeks=14;
  const start=addDays(today,-((weeks-1)*7+dayOfWeek(today)));
  let cells="";
  for(let i=0;i<weeks*7;i++){
    const date=addDays(start,i);
    const future=date>today;
    const day=future ? {answered:0,correct:0,subjects:{},modes:{}} : getStudyDay(date);
    const level=studyVolumeLevel(day.answered);
    const label=future
      ? `${formatDateShort(date)} これから`
      : `${formatDateShort(date)} ${day.answered}問 正答率 ${accuracyLabel(day)}`;
    cells += `<button class="grassDay l${level}${date===today?' today selected':''}${future?' future':''}" type="button"
        data-study-date="${date}" title="${escapeAttr(label)}" aria-label="${escapeAttr(label)}"${future?' disabled':''}></button>`;
  }
  return `<div class="grassWrap">
      <div class="grassGrid" aria-label="直近14週間の学習量">${cells}</div>
      <div class="grassLegend"><span>少</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>多</span></div>
    </div>`;
}
export function renderStudyPanel(){
  const today=todayStr();
  const todayLog=getStudyDay(today);
  const goal=normalizeDailyGoal(state.settings&&state.settings.dailyGoal);
  const goalPct=Math.min(100,Math.round(todayLog.answered/goal*100));
  const week=weeklyStudySummary(today);
  const weekGoal=goal*7;
  const weekPct=Math.min(100,Math.round(week.answered/weekGoal*100));
  const goalButtons=DAILY_GOAL_OPTIONS.map(value=>
    `<button class="goalChoice ${value===goal?'active':''}" type="button" data-goal="${value}">${value}問</button>`
  ).join("");
  return `<section class="studyPanel" aria-label="学習ログ">
    <div class="studyPanelTop">
      <div>
        <div class="studyLabel">今日の目標</div>
        <div class="studyMain">${todayLog.answered}<span>/${goal}問</span></div>
      </div>
      <div class="goalChoices">${goalButtons}</div>
    </div>
    <div class="goalBar"><i style="width:${goalPct}%"></i></div>
    <div class="weeklyBar"><span>今週 ${week.answered}/${weekGoal}問</span><i style="width:${weekPct}%"></i></div>
    <div class="weeklyStats">
      <div><b>${week.answered}</b><span>回答</span></div>
      <div><b>${week.activeDays}</b><span>学習日</span></div>
      <div><b>${week.accuracy}%</b><span>正答率</span></div>
    </div>
    ${renderStudyGrass(today)}
    <div class="studyDetail" id="studyLogDetail">${studyDetailHtml(today,todayLog)}</div>
  </section>`;
}

/* ============================================================
   教科選択画面（新トップ）
============================================================ */
export function renderHome(){
  stopTimer(); // ホームに戻る全経路でタイマーを確実に止める（防御的）
  stopBossTension();
  if(!state.title)evalTitle();   // 初回は現在の称号を確定

  // 追加機能（教科選択ファースト化）：教科カードをorder順・重複除去で動的生成
  const cardsHtml = subjectList().map(subject=>{
    const {cleared,total} = subjectClearedCount(subject);
    const m = subjectMastery(subject);
    return `<div class="subjectCard" data-subject="${subject}">
      <div class="subjectCard-name">${subject}</div>
      <div class="subjectCard-sum">クリア ${cleared}/${total}　｜　習熟度 ${m.pct}%</div>
      <div class="mastery"><i style="width:${m.pct}%"></i></div>
    </div>`;
  }).join("");

  const dueN=dueList().length;
  const reviewBtn = dueN
    ? `<button class="btn secondary" id="reviewBtn">🔁 今日の復習（${dueN}問）</button>` : "";

  const collBtn = `<button class="btn secondary" id="collBtn">📖 学習図鑑（${state.cards.size}/${CARDS.length}）</button>`;

  const badgesHtml = state.badges.size
    ? `<div class="badges">${[...state.badges].map(b=>`<div class="badge">🏅 ${b}</div>`).join("")}</div>` : "";
  const studyPanelHtml = renderStudyPanel();

  // 追加機能：眠気対策の設定トグル（タイムアタック／記述モード／サウンド）
  const ta = !!(state.settings&&state.settings.timeAttack);
  const im = !!(state.settings&&state.settings.inputMode);
  const se = !!(state.settings&&state.settings.sound);
  const bgmUrl = (state.settings&&state.settings.bgmUrl) || "";
  const bgmStatus = BGM.playing ? "再生中" : (bgmUrl ? "設定済み" : "未設定");
  const settingsHtml = `<div class="settingsRow">
      <div class="toggleChip ${ta?'on':''}" id="toggleTimeAttack">⏱ タイムアタック<span class="st">${ta?'ON':'OFF'}</span></div>
      <div class="toggleChip ${im?'on':''}" id="toggleInputMode">✍️ 記述モード<span class="st">${im?'ON':'OFF'}</span></div>
      <div class="toggleChip ${se?'on':''}" id="toggleSound">🔊 サウンド<span class="st">${se?'ON':'OFF'}</span></div>
    </div>`;
  const bgmHtml = `<div class="bgmSettings">
      <div class="bgmTop"><span>🎵 YouTube BGM</span><span>${bgmStatus}</span></div>
      <div class="bgmForm">
        <input type="url" id="bgmUrlInput" value="${escapeAttr(bgmUrl)}" placeholder="YouTube URL">
        <button class="btn secondary small" id="bgmSaveBtn" type="button">保存</button>
        <button class="btn small" id="bgmPlayBtn" type="button">再生</button>
        <button class="btn secondary small" id="bgmStopBtn" type="button">停止</button>
      </div>
    </div>`;

  app().innerHTML = "";
  app().appendChild(el(`<div>
    <h1>🏰 学習クエスト</h1>
    <div class="titleWrap"><span class="titleBadge">🎖 ${state.title}</span></div>
    <div class="sub">歴史総合・数学Ⅰをゲーム感覚で攻略<br>全${totalQuestionCount()}問／基礎多め＋標準　解説つき</div>
    <div class="card">
      <div class="hud">
        <span class="chip">合計スコア <span class="em">${state.totalScore}</span></span>
        <span class="chip"><span class="fire">🔥</span> 連続 <span class="em">${state.streak}</span>日</span>
        <span class="chip">バッジ <span class="em">${state.badges.size}</span></span>
      </div>
      <div class="muted">まずは教科を選んでね。1問ごとに解説が出るよ。まちがえた問題は「今日の復習」でちょうどよいタイミングにまた出るから大丈夫！</div>
      ${studyPanelHtml}
      ${settingsHtml}
      ${bgmHtml}
      ${cardsHtml}
      ${reviewBtn}
      ${collBtn}
      ${badgesHtml}
    </div>
  </div>`));

  document.querySelectorAll('.subjectCard').forEach(node=>{
    node.addEventListener('click',()=>renderSubjectHome(node.dataset.subject));
  });
  const rb=document.getElementById('reviewBtn');
  if(rb) rb.addEventListener('click',startReview);
  const cb=document.getElementById('collBtn');
  if(cb) cb.addEventListener('click',renderCollection);
  document.querySelectorAll('[data-goal]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      state.settings.dailyGoal=normalizeDailyGoal(btn.dataset.goal);
      save();
      renderHome();
    });
  });
  document.querySelectorAll('[data-study-date]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const date=btn.dataset.studyDate;
      document.querySelectorAll('.grassDay.selected').forEach(node=>node.classList.remove('selected'));
      btn.classList.add('selected');
      const detail=document.getElementById('studyLogDetail');
      if(detail)detail.innerHTML=studyDetailHtml(date,getStudyDay(date));
    });
  });

  // 追加機能：設定トグルのイベント（トグル→保存→教科選択再描画）
  const ttBtn=document.getElementById('toggleTimeAttack');
  if(ttBtn) ttBtn.addEventListener('click',()=>{
    state.settings.timeAttack=!state.settings.timeAttack;
    save();
    renderHome();
  });
  const imBtn=document.getElementById('toggleInputMode');
  if(imBtn) imBtn.addEventListener('click',()=>{
    state.settings.inputMode=!state.settings.inputMode;
    save();
    renderHome();
  });
  const seBtn=document.getElementById('toggleSound');
  if(seBtn) seBtn.addEventListener('click',()=>{
    state.settings.sound=!state.settings.sound;
    if(!state.settings.sound)stopBossTension();
    else playAnswerSound(true);
    save();
    renderHome();
  });
  const bgmInput=document.getElementById('bgmUrlInput');
  const saveBgmInput=()=>{
    const value=bgmInput?bgmInput.value.trim():"";
    state.settings.bgmUrl=value;
    if(!value)stopYouTubeBgm();
    save();
    return value;
  };
  const bgmSaveBtn=document.getElementById('bgmSaveBtn');
  if(bgmSaveBtn)bgmSaveBtn.addEventListener('click',()=>{
    const value=saveBgmInput();
    toast(value?'BGM URLを保存しました':'BGM URLをクリアしました');
    renderHome();
  });
  const bgmPlayBtn=document.getElementById('bgmPlayBtn');
  if(bgmPlayBtn)bgmPlayBtn.addEventListener('click',()=>{
    const value=saveBgmInput();
    if(!value){toast('YouTube URLを入力してね');return;}
    if(startYouTubeBgm(value))renderHome();
  });
  const bgmStopBtn=document.getElementById('bgmStopBtn');
  if(bgmStopBtn)bgmStopBtn.addEventListener('click',()=>{
    stopYouTubeBgm();
    renderHome();
  });
  if(bgmInput)bgmInput.addEventListener('keydown',(e)=>{
    if(e.key==='Enter'){
      e.preventDefault();
      const value=saveBgmInput();
      if(value&&startYouTubeBgm(value))renderHome();
    }
  });
}
