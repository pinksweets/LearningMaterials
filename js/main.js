/* ============================================================
   起動エントリ
============================================================ */
import { load, touchStreak, state } from "./state.js";
import { renderHome } from "./views/home.js";
import { renderSeptemberHome, renderSeptemberLearn } from "./views/september.js";
import { renderSeptember15Home, renderSeptember15Learn } from "./views/september15.js";
import { renderSubjectHome } from "./views/subject.js";
import { renderLesson } from "./views/lesson.js";
import { parseRoute, NAV, toast } from "./utils.js";
import { QUESTIONS } from './content.js';
import { sessionHash, restoreSession } from './session.js';
import { startStage, renderQuestion, saveQuestionDraft } from './views/quiz.js';
import { renderResult, renderBossVictory, renderBossDefeat } from './views/results.js';
import { renderCollection } from './views/collection.js';
import { stopLeapClock } from './views/leap.js';
import { stopTimer } from './timer.js';
import { stopSpeech, stopBossTension } from './audio.js';

export function renderUrlScreen(initial=false){
  const hash=window.location.hash;
  if(!initial && NAV.current===hash)return;
  if(!initial){NAV.scroll[NAV.current]=window.scrollY;saveQuestionDraft();}
  NAV.current=hash;
  stopTimer();stopSpeech();stopBossTension();
  if(state.cur?.leapSession)stopLeapClock(state.cur.leapSession);
  NAV.restoring=true;
  const route=parseRoute(hash);
  if(initial && (route.type==='practice-result' || (route.type==='question' && performance.getEntriesByType('navigation')[0]?.type==='reload'))){
    try{const practice=restoreSession(JSON.parse(sessionStorage.getItem('learning-quest-shared-practice')));if(practice && sessionHash(practice)===hash)state.cur=practice;}catch{/* A broken draft must not prevent opening a link. */}
  }
  let invalid=false;
  try{
    if(route.type==='september16')renderSubjectHome('📅 9/16 実力テスト対策');
    else if(route.type==='september15')renderSeptember15Home(true);
    else if(route.type==='september')renderSeptemberHome(true);
    else if(route.type==='subject' && Object.values(QUESTIONS).some(s=>s.subject===route.subject))renderSubjectHome(route.subject);
    else if(route.type==='collection')renderCollection();
    else if(route.type==='lesson'){ if(QUESTIONS[route.sid]?.lesson)renderLesson(route.sid); else {invalid=true;renderHome();} }
    else if(route.type==='learn'){
      if(route.date==='2026-09-15')renderSeptember15Learn(route.group,route.index);
      else renderSeptemberLearn(route.group,route.index);
    }
    else if(['stage','question','session','result','practice-result'].includes(route.type)){
      if(state.cur?.mode==='practice' && !['question','practice-result'].includes(route.type)){
        const personal=restoreSession(state.resumeSession);
        if(personal && sessionHash(personal)===hash)state.cur=personal;
      }
      const c=state.cur;
      const reload=performance.getEntriesByType('navigation')[0]?.type==='reload';
      const canResume=c && sessionHash(c)===hash && !(initial && route.type==='question' && !reload);
      if(canResume){
        if(c.result==='victory')renderBossVictory();
        else if(c.result==='defeat')renderBossDefeat();
        else if(c.result)renderResult();
        else renderQuestion();
      }else if(['question','stage'].includes(route.type) && QUESTIONS[route.sid]?.data[route.index]){
        startStage(route.sid,route.index,route.type==='question');
      }else{
        invalid=true;
        if(QUESTIONS[route.sid])renderSubjectHome(QUESTIONS[route.sid].subject);else renderHome();
      }
    }else{invalid=route.type!=='home';renderHome();}
  }finally{NAV.restoring=false;}
  if(invalid){
    toast('この問題や途中経過は見つからなかったよ。一覧から選び直してね。');
    const fallback=QUESTIONS[route.sid]?'#/subject/'+encodeURIComponent(QUESTIONS[route.sid].subject):'#home';
    window.history.replaceState(null,'',fallback);NAV.current=fallback;
  }
  document.title=(document.querySelector('h1')?.textContent || state.cur?.title || '学習クエスト')+'｜学習クエスト';
  window.scrollTo(0,NAV.scroll[hash]||0);
}

document.addEventListener('DOMContentLoaded', function () {
  load();
  touchStreak();
  renderUrlScreen(true);
  window.history.scrollRestoration='manual';
  window.addEventListener('hashchange',()=>renderUrlScreen());
  window.addEventListener('popstate',()=>renderUrlScreen());
  window.addEventListener('pagehide',saveQuestionDraft);
});

/* Service Worker 登録（https または localhost のみ。GitHub Pages のサブパス配信でも
   ドキュメント基準の相対 URL で正しいスコープに解決される） */
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator &&
    typeof location !== 'undefined' &&
    (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
