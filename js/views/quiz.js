import { shuffle, el, app, toast, escapeHtml } from "../utils.js";
import { normalizeAnswer, isAnswerMatch, isAnyAnswerMatch } from "../answers.js";
import { stopTimer, startTimer, timeLimitFor } from "../timer.js";
import { FEVER_BONUS, initRewardProgress, applyFeverProgress, rewardHudHtml } from "../fever.js";
import { QUESTIONS } from "../content.js";
import { extractLeapEntry, isLeapSubject, shouldShowLeapWordBeforeAnswer } from "../leap-study.js";
import { state, save, dueList, updateQStat, unlockCard, isStageUnlockedForBoss, recordStudyAnswer } from "../state.js";
import { playAnswerSound, speakEnglish, syncBossTension, stopBossTension, stopSpeech } from "../audio.js";
import { renderHome } from "./home.js";
import { renderSubjectHome } from "./subject.js";
import { renderResult, renderBossDefeat, renderBossVictory } from "./results.js";
import { renderSeptember15Home } from "./september15.js";
import { renderSeptemberHome } from "./september.js";
import { syncScreenHash, subjectHash } from '../utils.js';
import { sessionHash, restoreSession } from '../session.js';
import { isVisualMath, mathText, mathVisual, quadraticSpec, graphSvg, numberLine } from '../math-display.js';
import { hasLesson, lessonCardsHtml } from '../lesson.js';
import { isMockExam, examTotal, examAward, examNumericMatch } from '../mock-exam.js';

/* ============================================================
   ステージ開始
============================================================ */
export function startStage(sid,index=0,single=false){
  const s=QUESTIONS[sid];
  if(!s || !s.data[index])return;
  state.cur={
    sid, mode:'stage', title:s.title,
    list:s.data.map((q,idx)=>({...q,_key:sid+'-'+idx,_page:s.page})),
    i:0, correct:0, combo:0, maxCombo:0, score:0, wrongThisRun:[],
    feverGauge:0, feverLeft:0, feverCount:0, weakHits:0
  };
  if(single){state.cur.list=[state.cur.list[index]];state.cur.mode='practice';}
  else {state.cur.i=index;state.cur.startIndex=index;state.cur.partial=index>0;}
  syncScreenHash(sessionHash(state.cur));
  renderQuestion();
}
export function startReview(){
  const due=dueList();
  if(!due.length){toast('今日の復習はもうないよ！よくがんばったね！');return;}
  state.cur={
    sid:'review', mode:'review', title:'今日の復習',
    list:shuffle(due),
    i:0, correct:0, combo:0, maxCombo:0, score:0, wrongThisRun:[],
    feverGauge:0, feverLeft:0, feverCount:0, weakHits:0
  };
  syncScreenHash('#/session');
  renderQuestion();
}

/* ============================================================
   追加機能：ライフ制＋ボス戦
============================================================ */
export function startBoss(sid){
  if(!isStageUnlockedForBoss(sid)){toast('まずは通常プレイでこのステージをクリアしよう！');return;}
  const s=QUESTIONS[sid];
  state.cur={
    sid, mode:'boss', title:s.title,
    list:shuffle(s.data.map((q,idx)=>({...q,_key:sid+'-'+idx,_page:s.page}))),
    i:0, correct:0, combo:0, maxCombo:0, score:0, wrongThisRun:[],
    lives:3, bossHP:s.data.length, bossMaxHP:s.data.length,
    bossName:s.title+' の主',
    feverGauge:0, feverLeft:0, feverCount:0, weakHits:0
  };
  syncScreenHash('#/session');
  renderQuestion();
}

/* ============================================================
   問題描画
============================================================ */
export function renderQuestion(){
  stopTimer(); // 再描画時は必ず前のタイマーを止める（多重起動防止）
  stopSpeech();
  const c=state.cur;
  if(c.i>=c.list.length){ renderResult(); return; }  // 範囲外の防御
  c._locked=!!c.answer;
  syncScreenHash(sessionHash(c),true);
  const q=c.list[c.i];
  const text=value=>isVisualMath(q._key)?mathText(value):value;
  const sourceSid = c.mode==='review' && q._key ? q._key.split('-')[0] : c.sid;
  const leapEntry = QUESTIONS[sourceSid] && isLeapSubject(QUESTIONS[sourceSid].subject) ? extractLeapEntry(q) : null;
  const preAnswerLeapEntry = leapEntry && shouldShowLeapWordBeforeAnswer(q) ? leapEntry : null;
  const num=c.i+1, total=c.list.length;
  const pct=Math.round((c.i)/total*100);
  const isBoss = c.mode==='boss';
  const mock = isMockExam(c);
  initRewardProgress(c);
  syncBossTension(isBoss);
  const timeAttackOn = isBoss ? true : !q.examPractice && !!(state.settings&&state.settings.timeAttack); // ボス戦は強制ON

  const hud=`<div class="hud">
    <span class="chip">${c.title}</span>
    <span class="chip">Q <span class="em">${num}</span>/${total}</span>
    ${mock?`<span class="chip">${examTotal(c)}点満点・採点は最後</span><span class="chip">この問題 ${q.points}点</span>`:`<span class="chip">スコア <span class="em" id="quizScore">${c.score}</span></span><span class="chip combo" id="quizCombo">🔥 ${c.combo}</span>`}
  </div>
  <div class="progress"><div class="bar" style="width:${pct}%"></div></div>`;
  const rewardHud = mock?'':rewardHudHtml(c,isBoss);

  const bossHud = isBoss ? `<div class="bossHud">
      <div class="bossRow">
        <div class="bossEmoji">👹</div>
        <div class="bossName">${c.bossName}</div>
        <div class="lives">${'❤'.repeat(c.lives)}${'🖤'.repeat(3-c.lives)}</div>
      </div>
      <div class="hpBar"><i style="width:${Math.max(0,Math.round(c.bossHP/c.bossMaxHP*100))}%"></i></div>
    </div>` : "";

  const timerHtml = timeAttackOn ? `<div class="timerWrap">
      <div class="timerBar" id="timerBar"><i id="timerBarInner"></i></div>
      <div class="timerTxt" id="timerTxt"></div>
    </div>` : "";

  const typeLabel={yon:"4択問題",maru:"○×問題",ana:"穴埋め問題",kumi:"組み合わせ問題",nenpyo:"年表並べ替え問題",
    suji:"数値入力問題",fill:"穴埋め問題",junban:"手順並べ替え問題"}[q.type];
  const pageTag = q._page ? `<span class="tag">教科書 p.${q._page}</span>` : "";
  const tags=`<div class="qtypebar"><span class="tag lv">${q.lv}</span><span class="tag">${typeLabel}</span>${pageTag}</div>`;
  const speechPrompt = preAnswerLeapEntry
    ? `<div class="quizSpeechPrompt" aria-live="polite">🔊 声に出して読もう：<strong lang="en">${escapeHtml(preAnswerLeapEntry.headword)}</strong></div>` : "";

  // 追加機能：記述（入力）モードで ana を出題するか
  const useInputMode = q.type==="ana" && (q.forceInput || (!!(state.settings&&state.settings.inputMode) && !c._forceChoice));

  let body="";
  if(q.type==="maru"){
    body=`<div class="qtext">${q.q}</div>
      <div class="swipeHint">← ×（左スワイプ）　｜　（右スワイプ）○ →</div>
      <div class="mxwrap swipeable" id="mxwrap">
        <button class="opt" data-mx="true">○</button>
        <button class="opt" data-mx="false">×</button>
      </div>`;
  } else if(q.type==="kumi"){
    const rights=shuffle(q.pairs.map(p=>p.r));
    const rows=q.pairs.map((p,idx)=>`
      <div class="matchrow" data-idx="${idx}">
        <div class="l">${p.l}</div>
        <select data-sel="${idx}">
          <option value="">▼ 選ぶ</option>
          ${rights.map(r=>`<option value="${r}">${r}</option>`).join("")}
        </select>
      </div>`).join("");
    body=`<div class="qtext">${q.q}</div>${rows}
      <button class="btn" id="kumiCheck">こたえ合わせ</button>`;
  } else if(q.type==="nenpyo"){
    if(!c._nenpyoOrder || c._nenpyoOrder.length!==q.items.length){c._nenpyoOrder=shuffle(q.items.map((it,idx)=>idx));}
    const order=c._nenpyoOrder;
    const rows=order.map((itemIdx,pos)=>`
      <div class="nenpyoItem" data-itemidx="${itemIdx}">
        <div class="rank">${pos+1}</div>
        <div class="name">${q.items[itemIdx].t}</div>
        <div class="arrows">
          <button data-up="${pos}" ${pos===0?'disabled':''}>▲</button>
          <button data-down="${pos}" ${pos===order.length-1?'disabled':''}>▼</button>
        </div>
      </div>`).join("");
    body=`<div class="qtext">${q.q}</div>
      <div class="nenpyoList" id="nenpyoList">${rows}</div>
      <button class="btn" id="nenpyoCheck">こたえ合わせ</button>`;
  } else if(useInputMode){
    body=`<div class="qtext">${q.q}</div>
      <div class="inputWrap">
        <input type="text" id="inputAns" placeholder="こたえを入力…" autocomplete="off">
      </div>
      <button class="btn" id="inputCheck">こたえる</button>
      ${q.forceInput?'':'<button class="fallbackLink" id="fallbackToChoice">選択肢を見る</button>'}`;
  } else if(q.type==="suji"){
    // 追加機能（数学統合）：数値入力（常時テキスト入力、選択肢なし）
    body=`<div class="qtext">${q.q}</div>
      <div class="inputWrap">
        <input type="text" id="inputAns" placeholder="こたえを入力…" autocomplete="off" inputmode="text">
      </div>
      <button class="btn" id="sujiCheck">こたえる</button>`;
  } else if(q.type==="fill"){
    // 追加機能（数学統合）：複数穴埋め（ラベル付き入力欄N個）
    const rows=q.blanks.map((label,idx)=>`
      <div class="blk" style="margin:8px 0">
        <small style="color:var(--muted);font-size:.78rem">${label}</small>
        <input type="text" class="fillInput" data-fillidx="${idx}" autocomplete="off">
      </div>`).join("");
    body=`<div class="qtext">${q.q}</div>${rows}
      <button class="btn" id="fillCheck">こたえ合わせ</button>`;
  } else if(q.type==="junban"){
    // 追加機能（数学統合）：手順並べ替え（nenpyoの▲▼UI・_nenpyoOrder機構を流用）
    if(!c._nenpyoOrder || c._nenpyoOrder.length!==q.steps.length){c._nenpyoOrder=shuffle(q.steps.map((st,idx)=>idx));}
    const order=c._nenpyoOrder;
    const rows=order.map((itemIdx,pos)=>`
      <div class="nenpyoItem" data-itemidx="${itemIdx}">
        <div class="rank">${pos+1}</div>
        <div class="name">${q.steps[itemIdx]}</div>
        <div class="arrows">
          <button data-up="${pos}" ${pos===0?'disabled':''}>▲</button>
          <button data-down="${pos}" ${pos===order.length-1?'disabled':''}>▼</button>
        </div>
      </div>`).join("");
    body=`<div class="qtext">${q.q}</div>
      <div class="nenpyoList" id="nenpyoList">${rows}</div>
      <button class="btn" id="junbanCheck">こたえ合わせ</button>`;
  } else { // yon / ana(選択)
    c.choiceOrder ||= shuffle(q.choices.map((ch,idx)=>idx));
    const order=c.choiceOrder.map(idx=>({ch:q.choices[idx],idx}));
    c.shuffledCorrect=order.findIndex(o=>o.idx===q.a);
    const opts=order.map((o,pos)=>`<button class="opt" data-i="${pos}">${text(o.ch)}</button>`).join("");
    body=`<div class="qtext">${q.q}</div>${opts}`;
  }

  // 追加機能（数学統合）：q.hintがある問題のみ「💡 ヒント」ボタンを表示（減点なし）
  const hintHtml = q.hint && !mock ? `<button class="fallbackLink" id="hintBtn" type="button">💡 ヒント</button>
    <div class="muted" id="hintText" style="display:none;margin-top:6px"></div>` : "";

  body=body.replaceAll(`<div class="qtext">${q.q}</div>`,`<div class="qtext">${text(q.q)}</div>${mathVisual(q._key)}`);
  const subject=QUESTIONS[sourceSid]?.subject;
  // まなぶ→とく：レッスン付き単元では問題の途中でもカードを読み返せる（減点なし・遷移なし）
  const stageInfo=QUESTIONS[sourceSid];
  const lessonPeek = hasLesson(stageInfo) && c.mode!=='boss' && !mock
    ? `<details class="lessonPeek"><summary>📖 もう一度みる（レッスンカード）</summary>${lessonCardsHtml(stageInfo.lesson,{math:!!stageInfo.lessonMath})}</details>` : '';
  const nav=subject?`<nav class="quizBreadcrumb" aria-label="現在地"><a href="#home">教科選択</a><span>›</span><a href="${subjectHash(subject)}">${escapeHtml(subject)}</a><span>› ${escapeHtml(c.title)}</span></nav>`:'';
  app().innerHTML="";
  app().appendChild(el(`<div>${nav}<div class="card">${hud}${rewardHud}${bossHud}${timerHtml}${tags}${speechPrompt}${body}
    ${q.speech?`<button class="btn secondary" id="examSpeak" type="button">🔊 英語を聞く</button>${q.reading?`<details class="sepReading"><summary>読み方のヒント</summary>${escapeHtml(q.reading)}<p class="muted">カタカナは目安。音声をまねしてみよう。</p></details>`:''}`:''}
    ${hintHtml}
    ${lessonPeek}
    ${q.examPractice?`<button class="fallbackLink" id="examUnknown" type="button">${mock?'わからない（0点で次へ）':'わからない・答えを確認する'}</button>`:''}
    <div class="fb" id="fb"></div>
    <div id="nextWrap"></div>
  </div>
  <div class="quizTools"><button class="btn secondary small" id="quitBtn">← 単元一覧へ（途中保存）</button><button class="btn secondary small" id="shareQuestion">この問題を共有</button></div>
  <div id="shareFallback" hidden><label>問題のリンク<input id="shareUrl" readonly></label></div>
  </div>`));

  const examSpeak=document.getElementById('examSpeak');
  if(examSpeak)examSpeak.addEventListener('click',()=>{
    if(!speakEnglish(q.speech,{manual:true}))toast('音声を再生できないよ。端末の音声設定を確認してね。');
  });
  const examUnknown=document.getElementById('examUnknown');
  if(examUnknown)examUnknown.addEventListener('click',()=>{
    if(c._locked)return;
    examUnknown.disabled=true;
    finishQuestion(false,q,{correctText:q.choices?.[q.a] || (Array.isArray(q.a)?q.a.join(' / '):String(q.a))});
  });

  document.getElementById('quitBtn').addEventListener('click',()=>{
    {
      saveQuestionDraft();
      stopTimer();
      stopBossTension();
      stopSpeech();
      if(c.september15Review){renderSeptember15Home(true);return;}
      if(c.septemberReview){renderSeptemberHome(true);return;}
      // 追加機能（教科選択ファースト化）：stage/bossは直前の教科ホームへ、reviewは教科選択へ戻る
      const backSubject = c.mode!=='review' ? QUESTIONS[c.sid].subject : null;
      if(backSubject) renderSubjectHome(backSubject); else renderHome();
    }
  });
  document.getElementById('shareQuestion').addEventListener('click',async()=>{
    const url=new URL(window.location.href);
    const [sid,index]=q._key.split('-');
    url.hash=`/question/${encodeURIComponent(sid)}/${Number(index)+1}`;
    try{await navigator.clipboard.writeText(url.href);toast('問題のリンクをコピーしたよ。開くと未回答から始まるよ。');}
    catch{document.getElementById('shareFallback').hidden=false;const input=document.getElementById('shareUrl');input.value=url.href;input.select();}
  });

  // 追加機能（数学統合）：ヒントボタン（表示のみ・減点なし）
  const hintBtn=document.getElementById('hintBtn');
  if(hintBtn) hintBtn.addEventListener('click',()=>{
    const ht=document.getElementById('hintText');
    ht.textContent='💡 '+q.hint;
    ht.style.display='block';
    hintBtn.disabled=true;
  });

  if(q.type==="maru"){
    document.querySelectorAll('[data-mx]').forEach(b=>b.addEventListener('click',()=>{
      answer(b.dataset.mx==='true'===q.a, b, null);
    }));
    setupSwipe(document.getElementById('mxwrap'), q);
  } else if(q.type==="kumi"){
    document.getElementById('kumiCheck').addEventListener('click',checkKumi);
  } else if(q.type==="nenpyo"){
    setupNenpyoHandlers(q);
    document.getElementById('nenpyoCheck').addEventListener('click',checkNenpyo);
  } else if(useInputMode){
    const inputEl=document.getElementById('inputAns');
    const doCheck=()=>checkInput(q);
    document.getElementById('inputCheck').addEventListener('click',doCheck);
    inputEl.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();doCheck();}});
    document.getElementById('fallbackToChoice')?.addEventListener('click',()=>{
      c._forceChoice=true;
      renderQuestion();
    });
    inputEl.focus();
  } else if(q.type==="suji"){
    // 追加機能（数学統合）：数値入力の採点バインド
    const inputEl=document.getElementById('inputAns');
    const doCheck=()=>checkSuji(q);
    document.getElementById('sujiCheck').addEventListener('click',doCheck);
    inputEl.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();doCheck();}});
    inputEl.focus();
  } else if(q.type==="fill"){
    // 追加機能（数学統合）：複数穴埋めの採点バインド
    document.getElementById('fillCheck').addEventListener('click',()=>checkFill(q));
    const fillInputs=document.querySelectorAll('.fillInput');
    if(fillInputs[0])fillInputs[0].focus();
  } else if(q.type==="junban"){
    // 追加機能（数学統合）：手順並べ替え（nenpyoの▲▼機構を共有・比較のみ別関数）
    setupNenpyoHandlers(q);
    document.getElementById('junbanCheck').addEventListener('click',checkJunban);
  } else {
    document.querySelectorAll('[data-i]').forEach(b=>b.addEventListener('click',()=>{
      answer(parseInt(b.dataset.i)===c.shuffledCorrect, b, parseInt(b.dataset.i));
    }));
  }

  // 追加機能：タイムアタック（時間切れ→自動不正解）
  const inputs=[...app().querySelectorAll('#inputAns,.fillInput,select[data-sel]')];
  inputs.forEach((input,index)=>{input.value=c.draft?.[index]??input.value;input.addEventListener('input',saveQuestionDraft);input.addEventListener('change',saveQuestionDraft);});
  if(c.answer){renderSavedAnswer(q);return;}
  save();
  if(preAnswerLeapEntry)speakEnglish(preAnswerLeapEntry.headword);
  if(timeAttackOn){
    const limit=Number.isFinite(c._timeLeft)?Math.max(0,c._timeLeft):timeLimitFor(q);
    c._timeLimit ||= timeLimitFor(q);
    c._timeLeft=limit;
    if(limit===0){onTimeUp(q);return;}
    startTimer(limit,(remain,total)=>{
      c._timeLeft=remain;
      save();
      const bar=document.getElementById('timerBarInner');
      const wrap=document.getElementById('timerBar');
      const txt=document.getElementById('timerTxt');
      if(!bar||!wrap||!txt)return; // 画面が既に切り替わっている場合の安全策
      bar.style.width=Math.max(0,Math.round(remain/total*100))+'%';
      txt.textContent='⏱ 残り '+remain+'秒';
      wrap.classList.remove('warn','danger');
      if(remain<=Math.ceil(total*0.33))wrap.classList.add('danger');
      else if(remain<=Math.ceil(total*0.6))wrap.classList.add('warn');
    },()=>{
      onTimeUp(q);
    });
  }
}

/* ---------- 追加機能：時間切れ処理（自動不正解） ---------- */
export function onTimeUp(q){
  const c=state.cur;
  // クリック無効化＋正解を色表示
  document.querySelectorAll('.opt').forEach(o=>o.classList.add('disabled'));
  if(q.type==="maru"){
    document.querySelectorAll('[data-mx]').forEach(o=>{
      if((o.dataset.mx==='true')===q.a)o.classList.add('correct');
    });
  } else if(q.type==="yon"||(q.type==="ana"&&document.querySelector('[data-i]'))){
    document.querySelectorAll('[data-i]').forEach(o=>{
      if(parseInt(o.dataset.i)===c.shuffledCorrect)o.classList.add('correct');
    });
  } else if(q.type==="kumi"){
    document.querySelectorAll('select[data-sel]').forEach(sel=>{
      sel.disabled=true;
      const idx=parseInt(sel.dataset.sel);
      sel.classList.add(sel.value===q.pairs[idx].r?'correct':'wrong');
    });
    const kc=document.getElementById('kumiCheck'); if(kc)kc.disabled=true;
  } else if(q.type==="nenpyo"){
    document.querySelectorAll('.nenpyoItem .arrows button').forEach(b=>b.disabled=true);
    const nc=document.getElementById('nenpyoCheck'); if(nc)nc.disabled=true;
  } else if(q.type==="ana"){ // 入力モード中の時間切れ
    const inputEl=document.getElementById('inputAns');
    if(inputEl){inputEl.disabled=true;inputEl.classList.add('wrong');}
    const ic=document.getElementById('inputCheck'); if(ic)ic.disabled=true;
    const fb2=document.getElementById('fallbackToChoice'); if(fb2)fb2.disabled=true;
  } else if(q.type==="suji"){ // 追加機能（数学統合）：数値入力の時間切れ
    const inputEl=document.getElementById('inputAns');
    if(inputEl){inputEl.disabled=true;inputEl.classList.add('wrong');}
    const sc=document.getElementById('sujiCheck'); if(sc)sc.disabled=true;
  } else if(q.type==="fill"){ // 追加機能（数学統合）：複数穴埋めの時間切れ
    document.querySelectorAll('.fillInput').forEach(inp=>{inp.disabled=true;inp.classList.add('wrong');});
    const fc=document.getElementById('fillCheck'); if(fc)fc.disabled=true;
  } else if(q.type==="junban"){ // 追加機能（数学統合）：手順並べ替えの時間切れ
    document.querySelectorAll('.nenpyoItem .arrows button').forEach(b=>b.disabled=true);
    const jc=document.getElementById('junbanCheck'); if(jc)jc.disabled=true;
  }
  const hintBtn2=document.getElementById('hintBtn'); if(hintBtn2)hintBtn2.disabled=true;
  toast('⏰ 時間切れ！');
  finishQuestion(false,q,{timeUp:true});
}

/* ---------- yon/ana/maru の採点 ---------- */
export function answer(isCorrect, clickedBtn, chosenIdx){
  stopTimer(); // 回答したのでタイマー停止
  const c=state.cur, q=c.list[c.i];
  document.querySelectorAll('.opt').forEach(o=>o.classList.add('disabled'));
  // 正解・不正解の色付け
  if(isMockExam(c)){finishQuestion(isCorrect,q);return;}
  if(q.type==="maru"){
    document.querySelectorAll('[data-mx]').forEach(o=>{
      const val=o.dataset.mx==='true';
      if(val===q.a)o.classList.add('correct');
      else if(o===clickedBtn)o.classList.add('wrong');
    });
  } else {
    document.querySelectorAll('[data-i]').forEach(o=>{
      const idx=parseInt(o.dataset.i);
      if(idx===state.cur.shuffledCorrect)o.classList.add('correct');
      else if(idx===chosenIdx)o.classList.add('wrong');
    });
  }
  finishQuestion(isCorrect,q);
}

/* ---------- 追加機能：記述（入力）モードの採点 ---------- */
export function checkInput(q){
  const c=state.cur;
  if(c._locked)return;
  const inputEl=document.getElementById('inputAns');
  const val=inputEl.value;
  if(normalizeAnswer(val)===""){toast('こたえを入力してね！');return;}
  stopTimer();
  const correctText=q.choices[q.a];
  const accepted=[correctText,...(q.accept||[])];
  const isCorrect=q.forceInput
    ? accepted.some(answer=>normalizeAnswer(val)===normalizeAnswer(answer))
    : isAnyAnswerMatch(val,accepted);
  inputEl.disabled=true;
  if(!isMockExam(state.cur))inputEl.classList.add(isCorrect?'correct':'wrong');
  document.getElementById('inputCheck').disabled=true;
  const fb2=document.getElementById('fallbackToChoice'); if(fb2)fb2.disabled=true;
  finishQuestion(isCorrect,q,{correctText});
}

/* ---------- 追加機能（数学統合）：suji（数値入力）の採点。q.aは複数許容解の配列 ---------- */
export function checkSuji(q){
  const inputEl=document.getElementById('inputAns');
  const val=inputEl.value;
  if(normalizeAnswer(val)===""){toast('こたえを入力してね！');return;}
  stopTimer();
  const isCorrect=isMockExam(state.cur)?examNumericMatch(val,q.a):isAnyAnswerMatch(val,q.a);
  inputEl.disabled=true;
  if(!isMockExam(state.cur))inputEl.classList.add(isCorrect?'correct':'wrong');
  document.getElementById('sujiCheck').disabled=true;
  const hintBtn=document.getElementById('hintBtn'); if(hintBtn)hintBtn.disabled=true;
  finishQuestion(isCorrect,q,{correctText:isCorrect?null:q.a.join(' / ')});
}

/* ---------- 追加機能（数学統合）：fill（複数穴埋め）の採点。全欄一致で正解 ---------- */
export function checkFill(q){
  const inputs=document.querySelectorAll('.fillInput');
  let allFilled=true;
  inputs.forEach(inp=>{ if(normalizeAnswer(inp.value)==="")allFilled=false; });
  if(!allFilled){toast('すべて入力してね！');return;}
  stopTimer();
  let allRight=true;
  inputs.forEach(inp=>{
    const idx=parseInt(inp.dataset.fillidx);
    const ok=isAnswerMatch(inp.value,q.a[idx]);
    if(!ok)allRight=false;
    inp.disabled=true;
    inp.classList.add(ok?'correct':'wrong');
  });
  document.getElementById('fillCheck').disabled=true;
  const hintBtn=document.getElementById('hintBtn'); if(hintBtn)hintBtn.disabled=true;
  finishQuestion(allRight,q,{correctText:allRight?null:q.a.join(' / ')});
}

/* ---------- kumi の採点 ---------- */
export function checkKumi(){
  const c=state.cur,q=c.list[c.i];
  const sels=document.querySelectorAll('select[data-sel]');
  let allFilled=true, allRight=true;
  sels.forEach(sel=>{
    const idx=parseInt(sel.dataset.sel);
    if(sel.value==="")allFilled=false;
    if(sel.value===q.pairs[idx].r){sel.classList.add('correct');}
    else{sel.classList.add('wrong');allRight=false;}
  });
  if(!allFilled){
    document.querySelectorAll('select[data-sel]').forEach(s=>s.classList.remove('correct','wrong'));
    toast('すべて選んでね！');return;
  }
  stopTimer();
  document.querySelectorAll('select[data-sel]').forEach(s=>s.disabled=true);
  document.getElementById('kumiCheck').disabled=true;
  finishQuestion(allRight,q);
}

/* ---------- 追加機能：nenpyo（年表並べ替え）の並べ替え操作＋採点 ---------- */
export function setupNenpyoHandlers(q){
  const c=state.cur;
  document.querySelectorAll('.nenpyoItem .arrows button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const order=c._nenpyoOrder;
      if(btn.dataset.up!==undefined){
        const pos=parseInt(btn.dataset.up);
        if(pos>0){[order[pos-1],order[pos]]=[order[pos],order[pos-1]];renderQuestion();}
      } else if(btn.dataset.down!==undefined){
        const pos=parseInt(btn.dataset.down);
        if(pos<order.length-1){[order[pos],order[pos+1]]=[order[pos+1],order[pos]];renderQuestion();}
      }
    });
  });
}
export function checkNenpyo(){
  const c=state.cur,q=c.list[c.i];
  const order=c._nenpyoOrder; // 現在の並び（itemIdxの配列）
  const correctOrder=q.items.map((it,idx)=>idx).sort((a,b)=>q.items[a].year-q.items[b].year);
  const isCorrect = order.length===correctOrder.length && order.every((v,i)=>v===correctOrder[i]);
  stopTimer();
  document.querySelectorAll('.nenpyoItem').forEach((node,pos)=>{
    node.classList.add(isCorrect?'correctRow':(order[pos]===correctOrder[pos]?'correctRow':'wrongRow'));
    const itemIdx=parseInt(node.dataset.itemidx);
    const hint=document.createElement('span');
    hint.className='yearHint';
    hint.textContent=q.items[itemIdx].year+'年';
    node.appendChild(hint);
  });
  document.querySelectorAll('.nenpyoItem .arrows button').forEach(b=>b.disabled=true);
  document.getElementById('nenpyoCheck').disabled=true;
  finishQuestion(isCorrect,q);
}

/* ---------- 追加機能（数学統合）：junban（手順並べ替え）の採点。正解順は q.a（stepsのインデックス配列） ---------- */
export function checkJunban(){
  const c=state.cur,q=c.list[c.i];
  const order=c._nenpyoOrder; // 現在の並び（stepsのインデックス配列）
  const correctOrder=q.a;
  const isCorrect = order.length===correctOrder.length && order.every((v,i)=>v===correctOrder[i]);
  stopTimer();
  document.querySelectorAll('.nenpyoItem').forEach((node,pos)=>{
    node.classList.add(isCorrect?'correctRow':(order[pos]===correctOrder[pos]?'correctRow':'wrongRow'));
  });
  document.querySelectorAll('.nenpyoItem .arrows button').forEach(b=>b.disabled=true);
  document.getElementById('junbanCheck').disabled=true;
  const hintBtn=document.getElementById('hintBtn'); if(hintBtn)hintBtn.disabled=true;
  finishQuestion(isCorrect,q);
}

/* ---------- 追加機能：maru問題のスワイプ○×対応（ボタン回答は従来通り残す） ---------- */
export function setupSwipe(wrap,q){
  if(!wrap)return;
  let startX=null, startY=null, dragging=false, moved=0;
  const threshold=60;
  const onDown=(x,y)=>{startX=x;startY=y;dragging=true;moved=0;wrap.classList.add('dragging');};
  const onMove=(x,y)=>{
    if(!dragging||startX===null)return;
    moved=x-startX;
    wrap.style.transform='translateX('+(moved*0.4)+'px)';
  };
  const onUp=()=>{
    if(!dragging)return;
    dragging=false;
    wrap.classList.remove('dragging');
    wrap.style.transform='';
    if(Math.abs(moved)>threshold){
      const guessTrue = moved>0; // 右スワイプ=○
      const btn=wrap.querySelector('[data-mx="'+guessTrue+'"]');
      if(btn && !btn.classList.contains('disabled'))answer(guessTrue===q.a, btn, null);
    }
    startX=null;startY=null;moved=0;
  };
  const onPointerDown=(e)=>{const p=e.touches?e.touches[0]:e;onDown(p.clientX,p.clientY);};
  const onPointerMove=(e)=>{const p=e.touches?e.touches[0]:e;onMove(p.clientX,p.clientY);};
  const onPointerUp=()=>onUp();
  // pointer系（マウス／ペン／一部タッチ）とtouch系の両方に対応。要素が再描画時に破棄されるため直接バインド（要素ごとリセットされる）
  wrap.addEventListener('pointerdown',onPointerDown);
  wrap.addEventListener('pointermove',onPointerMove);
  wrap.addEventListener('pointerup',onPointerUp);
  wrap.addEventListener('pointercancel',onPointerUp);
  wrap.addEventListener('touchstart',onPointerDown,{passive:true});
  wrap.addEventListener('touchmove',onPointerMove,{passive:true});
  wrap.addEventListener('touchend',onPointerUp);
}

/* ---------- 共通：正誤処理＋フィードバック ---------- */
export function finishQuestion(isCorrect,q,opts){
  opts=opts||{};
  const c=state.cur;
  if(c._locked) return;   // 二重採点防止（スワイプ＋クリック等の二重発火対策）
  c._locked=true;
  c.answer={correct:isCorrect,timeUp:!!opts.timeUp,correctText:opts.correctText||''};
  c.draft=[...document.querySelectorAll('#inputAns,.fillInput,select[data-sel]')].map(input=>input.value);
  stopTimer(); // 採点確定時点で必ずタイマー停止（時間切れ経路も含め二重に保証）
  const mock=isMockExam(c);
  if(!mock)playAnswerSound(isCorrect);
  const sourceSid = c.mode==='review' && q._key ? q._key.split('-')[0] : c.sid;
  const leapFeedbackEntry = QUESTIONS[sourceSid] && isLeapSubject(QUESTIONS[sourceSid].subject) ? extractLeapEntry(q) : null;
  const leapSpeechFeedback = leapFeedbackEntry && leapFeedbackEntry.headword
    ? `<div class="quizSpeechPrompt" aria-live="polite">🔊 声に出して読もう：<strong lang="en">${escapeHtml(leapFeedbackEntry.headword)}</strong></div>` : "";
  if(leapFeedbackEntry)speakEnglish(leapFeedbackEntry.headword);
  initRewardProgress(c);
  const feverWasActive=c.feverLeft>0;
  const fb=document.getElementById('fb');

  // 追加機能：速答ボーナス（タイムアタックONかつ正解時、残り時間に比例）
  let speedBonus=0;
  const timeAttackActive = c.mode==='boss' ? true : !!(state.settings&&state.settings.timeAttack);
  if(isCorrect && timeAttackActive && typeof c._timeLeft==='number' && typeof c._timeLimit==='number' && !opts.timeUp){
    speedBonus = Math.round(c._timeLeft/c._timeLimit*10);
  }

  if(mock){
    c.score+=examAward(q,isCorrect);
    if(isCorrect)c.correct++;
    else c.wrongThisRun.push(q);
  }else if(isCorrect){
    c.correct++; c.combo++; c.maxCombo=Math.max(c.maxCombo,c.combo);
    let pts = q.lv==="標準"?15:10;
    let bonus = c.combo>=3 ? (c.combo>=5?10:5) : 0;
    let feverBonus = feverWasActive ? FEVER_BONUS : 0;
    let bossDamage = 0;
    if(c.mode==='boss'){
      bossDamage = (c.combo>0 && c.combo%3===0) ? 2 : 1;
      c.bossHP=Math.max(0,c.bossHP-bossDamage);
      if(bossDamage>1)c.weakHits++;
    }
    const feverEvent=applyFeverProgress(c,true,feverWasActive);
    c.score += pts+bonus+speedBonus+feverBonus;
    const rewardBits=[];
    if(feverBonus)rewardBits.push(`✨ フィーバー+${feverBonus}`);
    if(feverEvent.started)rewardBits.push('🎰 フィーバー突入！次の3問がボーナス');
    if(bossDamage>1)rewardBits.push('🎯 弱点攻撃！ボスに2ダメージ');
    fb.className="fb good show";
    fb.innerHTML=`<div class="head">⭕ 正解！ +${pts}点${bonus?` <span class="combo">コンボ+${bonus}</span>`:''}${speedBonus?` <span class="combo">⏱速答+${speedBonus}</span>`:''}${feverBonus?` <span class="combo">FEVER+${feverBonus}</span>`:''}</div>
      ${leapSpeechFeedback}<div class="exp">${q.exp}</div>
      ${rewardBits.length?`<div class="rewardMsg">${rewardBits.join('　')}</div>`:''}`;
    if(feverEvent.started)toast('✨ フィーバー突入！次の3問はボーナス！');
    else if(bossDamage>1)toast('🎯 弱点攻撃！ ボスに2ダメージ！');
    else if(c.combo===10)toast('🔥🔥🔥 10連続正解！すごい集中力！');
    else if(c.combo===5)toast('🔥🔥 5連続！絶好調！');
    else if(c.combo===3)toast('🔥 3連続正解！コンボボーナス！');
    else if(c.mode==='boss')toast('⚔️ こうげき！ ボスに1ダメージ！');
  } else {
    c.combo=0;
    const feverEvent=applyFeverProgress(c,false,feverWasActive);
    let feedbackHead = opts.timeUp ? '⏰ 時間切れ… もう一度チェック' : '❌ おしい！ もう一度チェック';
    let extra = opts.correctText ? `<div class="muted" style="margin-top:6px">正解：${opts.correctText}</div>` : "";
    let rewardMsg = feverEvent.ended ? `<div class="rewardMsg">フィーバー終了。次の正解からまたゲージをためよう。</div>` : "";
    fb.className="fb bad show";
    fb.innerHTML=`<div class="head">${feedbackHead}</div>
      ${leapSpeechFeedback}<div class="exp">${q.exp}</div>${extra}${rewardMsg}`;
    c.wrongThisRun.push(q);
    if(c.mode==='boss'){
      c.lives=Math.max(0,c.lives-1);
      toast('💥 やられた！ ライフが減った！');
    }
  }

  // 1問ごとの成績＋間隔反復スケジュールを更新（復習・ボス戦でも共通）
  if(q._key)updateQStat(q._key,isCorrect);
  const logSid = c.mode==='review' && q._key ? q._key.split('-')[0] : c.sid;
  recordStudyAnswer(isCorrect, QUESTIONS[logSid]&&QUESTIONS[logSid].subject, c.mode);
  // 図鑑カードの解放（正解時。card は文字列または配列）
  if(isCorrect && q.card){
    (Array.isArray(q.card)?q.card:[q.card]).forEach(unlockCard);
  }
  save();

  // 追加機能：ボス戦の勝敗判定
  if(c.mode==='boss'){
    if(c.lives<=0){ renderBossDefeat(); return; }
    if(c.bossHP<=0){ renderBossVictory(); return; }
  }

  renderSavedAnswer(q,true);
}

export function saveQuestionDraft(){
  const c=state.cur;
  if(!c || c.result || !document.getElementById('fb'))return;
  c.draft=[...app().querySelectorAll('#inputAns,.fillInput,select[data-sel]')].map(input=>input.value);
  save();
}

export function resumePanel(subject){
  const c=state.cur?.mode==='practice'?restoreSession(state.resumeSession):state.cur;
  if(!c || !Array.isArray(c.list) || c.result || (subject && QUESTIONS[c.sid]?.subject!==subject))return '';
  return `<aside class="resumePanel"><strong>続きから学習できるよ</strong><a class="btn secondary" href="${sessionHash(c)}">${escapeHtml(c.title)} · ${c.i+1}問目から再開</a></aside>`;
}

export function renderSavedAnswer(q,keepFeedback=false){
  const c=state.cur;
  c._locked=true;
  stopTimer();
  const fb=document.getElementById('fb');
  fb.className='fb show '+(c.answer.correct?'good':'bad');
  const explanation=isVisualMath(q._key)?q.exp.split('。').filter(Boolean).map(line=>`<p>${mathText(line)}。</p>`).join(''):q.exp;
  if(keepFeedback && !isVisualMath(q._key)){
    // The original speech prompt and reward detail stay visible on first grading.
  }else fb.innerHTML=`<div class="head">${c.answer.correct?'⭕ 正解！':c.answer.timeUp?'⏰ 時間切れ。解説を確認しよう':'もう一度、考え方を確認しよう'}</div><div class="exp">${explanation}</div>${c.answer.correctText?`<p>正解：${isVisualMath(q._key)?mathText(c.answer.correctText):escapeHtml(c.answer.correctText)}</p>`:''}${mathVisual(q._key,true)}`;
  const score=document.getElementById('quizScore'),combo=document.getElementById('quizCombo');
  if(score)score.textContent=c.score;
  if(combo)combo.textContent='🔥 '+c.combo;
  const reward=document.querySelector?.('.rewardHud');
  if(reward)reward.outerHTML=rewardHudHtml(c,c.mode==='boss');
  document.querySelectorAll('.opt,#inputAns,.fillInput,select[data-sel],#inputCheck,#sujiCheck,#fillCheck,#kumiCheck,#nenpyoCheck,#junbanCheck,#examUnknown,#fallbackToChoice,.arrows button').forEach(node=>node.disabled=true);
  if(isMockExam(c)){
    fb.className='fb show';
    fb.innerHTML='<div class="head">回答を受け付けたよ</div><div class="exp">正解と解説は、最後の結果画面で確認しよう。</div>';
  }else document.querySelectorAll('[data-i]').forEach(node=>{if(Number(node.dataset.i)===c.shuffledCorrect)node.classList.add('correct');});
  const slider=document.getElementById('mathParameter');
  if(slider)slider.addEventListener('input',()=>{document.getElementById('mathParameterValue').value=slider.value;document.getElementById('mathExplore').innerHTML=graphSvg(quadraticSpec(q._key,Number(slider.value)));});
  document.querySelectorAll('[data-graph-step]').forEach(button=>button.addEventListener('click',()=>{
    const step=Number(button.dataset.graphStep),s=quadraticSpec(q._key);
    document.querySelector('[data-math-graph]').innerHTML=graphSvg(s,step)+(step===3&&s.intervals?numberLine(s.intervals):'');
    document.querySelectorAll('[data-graph-step]').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));
  }));
  const nw=document.getElementById('nextWrap');
  nw.innerHTML='';                       // 二重生成防止
  const last = c.i>=c.list.length-1;
  const nextBtn=el(`<button class="btn" id="nextBtn">${last?'結果を見る 🏁':'次の問題へ →'}</button>`);
  nw.appendChild(nextBtn);
  nextBtn.addEventListener('click',()=>{
    stopTimer();
    if(last)renderResult();
    else{
      c.i++;
      delete c.answer;
      delete c.choiceOrder;
      delete c.draft;
      delete c._timeLeft;
      delete c._timeLimit;
      delete c._nenpyoOrder;   // 前問の並べ替え状態を持ち越さない
      delete c._forceChoice;   // 前問の「選択肢を見る」状態を持ち越さない
      renderQuestion();
    }
  });
}
