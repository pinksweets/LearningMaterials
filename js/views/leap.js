import { app, el, escapeAttr, escapeHtml, toast } from "../utils.js";
import { stopTimer } from "../timer.js";
import { state, recordLeapSession, leapSessionsOn } from "../state.js";
import { QUESTIONS } from "../content.js";
import {
  LEAP_BASIC_SUBJECT,
  LEAP_DAILY_TARGET,
  countsAsLeapDailySession,
  createLeapSession,
  extractLeapEntry,
  finishLeapSession,
  getLeapStats,
  judgeLeapCard
} from "../leap-study.js";
import { stopBossTension, speakEnglish, stopSpeech } from "../audio.js";
import { renderSubjectHome } from "./subject.js";

export function startLeapSpeed(sid) {
  const stage=QUESTIONS[sid];
  if(!stage){toast("ステージを読み込めませんでした");return;}
  const list=stage.data.map((question,index)=>({...question,_key:sid+'-'+index,_page:stage.page}));
  state.cur={sid,mode:'leap-speed',title:stage.title,leapSession:createLeapSession(list),leapRecorded:false};
  renderLeapSpeed();
}

export function stopLeapClock(session) {
  if(session&&session.timerId){clearInterval(session.timerId);session.timerId=null;}
}

export function recordFinishedLeapSession(c, reason, now=Date.now()) {
  if(!c||!c.leapSession)return getLeapStats(null,now);
  const session=c.leapSession;
  finishLeapSession(session,now,reason);
  stopLeapClock(session);
  // 「終了して結果を見る」は中断扱い。ノルマに加算するのは3分完了または全件完了だけ。
  const countsTowardDailyGoal=countsAsLeapDailySession(reason);
  if(countsTowardDailyGoal&&!c.leapRecorded&&session.judged>0){
    recordLeapSession();
    c.leapRecorded=true;
  }
  return getLeapStats(session,now);
}

export function startLeapClock(c) {
  const session=c&&c.leapSession;
  if(!session||session.finished||session.timerId)return;
  session.timerId=setInterval(()=>{
    if(state.cur!==c){stopLeapClock(session);return;}
    const remaining=Math.max(0,Math.ceil((session.endsAt-Date.now())/1000));
    const label=document.getElementById('leapTimeLeft');
    if(label)label.textContent='残り '+remaining+'秒';
    const bar=document.getElementById('leapTimeBarInner');
    if(bar)bar.style.width=Math.max(0,Math.round(remaining/session.durationSeconds*100))+'%';
    if(remaining<=0){
      recordFinishedLeapSession(c,'time',Date.now());
      renderLeapSpeedResult(c);
    }
  },250);
}

export function leapProgressLabel(session) {
  if(!session)return '';
  const judged=session.judged||0;
  const learned=session.learned?session.learned.size:0;
  return `判定 ${judged}語　覚えた ${learned}語　周回 ${session.rounds||1}`;
}

export function renderLeapSpeed() {
  stopTimer();
  stopBossTension();
  stopSpeech();
  const c=state.cur;
  if(!c||c.mode!=='leap-speed'||!c.leapSession){renderSubjectHome(LEAP_BASIC_SUBJECT);return;}
  const session=c.leapSession;
  if(session.finished){renderLeapSpeedResult(c);return;}
  const card=session.current;
  if(!card){recordFinishedLeapSession(c,'complete');renderLeapSpeedResult(c);return;}
  const entry=extractLeapEntry(card.question);
  const remaining=Math.max(0,Math.ceil((session.endsAt-Date.now())/1000));
  const additionalMeanings=entry.additionalMeanings||'';
  const nuance=entry.nuance||'';
  app().innerHTML='';
  app().appendChild(el(`<div>
    <h1>⚡ LEAP 3分高速周回</h1>
    <div class="card leapSpeedCard">
      <div class="hud">
        <span class="chip">${escapeHtml(c.title)}</span>
        <span class="chip">${escapeHtml(leapProgressLabel(session))}</span>
      </div>
      <div class="leapTime" role="timer" aria-live="off" aria-label="高速周回の残り時間"><span aria-hidden="true">⏱</span><b id="leapTimeLeft">残り ${remaining}秒</b></div>
      <div class="leapTimeBar" id="leapTimeBar" aria-hidden="true"><i id="leapTimeBarInner" style="width:${Math.max(0,Math.round(remaining/session.durationSeconds*100))}%"></i></div>
      <div class="leapCounter">このカードをまず思い出そう　｜　${session.round||1}周目</div>
      <section class="leapPrompt" aria-label="英単語セルフテスト">
        <div class="leapWord" lang="en">${escapeHtml(entry.headword||'英語を確認')}</div>
        <p class="leapInstruction">まず頭の中で意味を答えてから、答えを表示しよう。</p>
        <button class="btn leapReveal" id="leapRevealBtn" type="button" aria-controls="leapAnswer" aria-expanded="false">答えを表示</button>
      </section>
      <section class="leapAnswer" id="leapAnswer" hidden aria-live="polite">
        <div class="leapAnswerLabel">第1義</div>
        <div class="leapMeaning">${escapeHtml(entry.firstMeaning||entry.meaning||'意味を確認しよう')}</div>
        ${additionalMeanings?`<div class="leapExtra"><span class="leapExtraLabel">追加の意味：</span>${escapeHtml(additionalMeanings)}</div>`:''}
        ${nuance?`<div class="leapNuance"><span class="leapExtraLabel">ニュアンス：</span>${escapeHtml(nuance)}</div>`:''}
        <div class="leapReadPrompt">🔊 声に出して読もう：<strong lang="en">${escapeHtml(entry.headword)}</strong></div>
        <div class="leapJudgement" role="group" aria-label="覚えたか判定">
          <button class="btn leapKnow" id="leapKnowBtn" type="button">✅ わかった</button>
          <button class="btn secondary leapUnsure" id="leapUnsureBtn" type="button">🤔 あやしい</button>
        </div>
      </section>
      <p class="muted leapQueueHint">「あやしい」はこの周回のあとにもう一度出るよ。</p>
    </div>
    <button class="btn secondary small" id="leapFinishBtn" type="button" style="margin-top:12px">セッションを終了して結果を見る</button>
  </div>`));

  startLeapClock(c);
  speakEnglish(entry.headword);
  const reveal=document.getElementById('leapRevealBtn');
  const answer=document.getElementById('leapAnswer');
  const know=document.getElementById('leapKnowBtn');
  const unsure=document.getElementById('leapUnsureBtn');
  if(reveal)reveal.addEventListener('click',()=>{
    if(answer)answer.hidden=false;
    reveal.disabled=true;
    reveal.setAttribute('aria-expanded','true');
    speakEnglish(entry.headword);
    if(know)know.focus();
  });
  const judge=(knew)=>{
    if(answer&&answer.hidden){toast('先に「答えを表示」してね');return;}
    if(know)know.disabled=true;
    if(unsure)unsure.disabled=true;
    stopSpeech();
    const result=judgeLeapCard(session,knew,Date.now());
    if(!result.accepted){
      if(result.expired){
        recordFinishedLeapSession(c,'time',Date.now());
        renderLeapSpeedResult(c);
      }
      return;
    }
    if(result.finished){
      recordFinishedLeapSession(c,'complete',Date.now());
      renderLeapSpeedResult(c);
    }else renderLeapSpeed();
  };
  if(know)know.addEventListener('click',()=>judge(true));
  if(unsure)unsure.addEventListener('click',()=>judge(false));
  const finish=document.getElementById('leapFinishBtn');
  if(finish)finish.addEventListener('click',()=>{
    if(typeof window!=='undefined'&&typeof window.confirm==='function'&&
      !window.confirm('この高速周回を終了して結果を見る？\n途中終了は今日の3回には加算されません。'))return;
    recordFinishedLeapSession(c,'quit',Date.now());
    renderLeapSpeedResult(c);
  });
}

export function renderLeapSpeedResult(c) {
  stopTimer();
  stopLeapClock(c&&c.leapSession);
  stopBossTension();
  stopSpeech();
  if(!c||!c.leapSession){renderSubjectHome(LEAP_BASIC_SUBJECT);return;}
  const stats=getLeapStats(c.leapSession,Date.now());
  const today=leapSessionsOn();
  const complete=today>=LEAP_DAILY_TARGET;
  app().innerHTML='';
  app().appendChild(el(`<div>
    <h1>⚡ 高速周回の結果</h1>
    <div class="card leapResult">
      <div class="leapResultEmoji">${stats.endedReason==='time'?'⏱️':(stats.endedReason==='quit'?'🌱':'🎉')}</div>
      <h2 class="center">${stats.endedReason==='time'?'時間いっぱい学習できたね':(stats.endedReason==='quit'?'ここまででOK！':'1周完了！')}</h2>
      <div class="leapResultGrid">
        <div><b>${stats.judged}</b><span>判定数</span></div>
        <div><b>${stats.learned}</b><span>覚えた数</span></div>
        <div><b>${stats.remainingUncertain}</b><span>残りあやしい/未判定</span></div>
        <div><b>${stats.rounds}</b><span>周回数</span></div>
        <div><b>${stats.averageSeconds}</b><span>平均秒/語</span></div>
      </div>
      <p class="muted center">${Math.round(stats.elapsedSeconds)}秒取り組んだよ。短時間でも想起できたのが大きな一歩！</p>
      <div class="leapDailyResult ${complete?'complete':''}">
        <strong>今日のLEAP：${Math.min(today,LEAP_DAILY_TARGET)}/${LEAP_DAILY_TARGET}回</strong>
        <span>${complete?'🎊 1日3回達成！今日もよく続けたね。':'あと'+Math.max(0,LEAP_DAILY_TARGET-today)+'回。3分だけ、もう一度やってみよう。'}</span>
      </div>
      <button class="btn" id="leapAgainBtn" type="button">同じステージをもう一周</button>
      <button class="btn secondary" id="leapHomeBtn" type="button">LEAP Basic に戻る</button>
    </div>
  </div>`));
  const again=document.getElementById('leapAgainBtn');
  if(again)again.addEventListener('click',()=>startLeapSpeed(c.sid));
  const home=document.getElementById('leapHomeBtn');
  if(home)home.addEventListener('click',()=>renderSubjectHome(LEAP_BASIC_SUBJECT));
}
