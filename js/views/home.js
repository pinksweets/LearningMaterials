import { el, app, toast, escapeAttr } from "../utils.js";
import { stopTimer } from "../timer.js";
import { stopBossTension, playAnswerSound, BGM, startYouTubeBgm, stopYouTubeBgm } from "../audio.js";
import { state, save, evalTitle, dueList, subjectList, subjectClearedCount, subjectMastery } from "../state.js";
import { CARDS, totalQuestionCount } from "../content.js";
import { renderSubjectHome } from "./subject.js";
import { renderCollection } from "./collection.js";
import { startReview } from "./quiz.js";

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
