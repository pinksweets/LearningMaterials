import { el, app, escapeHtml, syncScreenHash, subjectHash, mathChapterHash } from "../utils.js";
import { stopTimer } from "../timer.js";
import { stopBossTension, stopSpeech } from "../audio.js";
import { markLessonSeen, isLessonSeen } from "../state.js";
import { QUESTIONS, MATH1_PREP_SUBJECT, displaySubjectForStage } from "../content.js";
import { lessonCardHtml, hasLesson } from "../lesson.js";
import { renderStageHome } from "./subject.js";
import { mathChapterForStage } from './math.js';
import { startStage } from "./quiz.js";
import { mountLessonActivities } from '../quadratic-study.js';

/* ============================================================
   レッスン画面（まなぶ）：3枚のカードを1枚ずつ読み、最後に「とく」へ進む。
   初回は必読（最後まで読むと既読になる）。2回目以降は教科ホームから「📖 まなぶ」で再読できる。
============================================================ */
export function lessonHash(sid){return '#/lesson/'+encodeURIComponent(sid);}

export function renderLesson(sid,page=0){
  const s=QUESTIONS[sid];
  if(!s || !hasLesson(s)){ startStage(sid); return; }
  stopTimer();
  stopBossTension();
  stopSpeech();
  syncScreenHash(lessonHash(sid), page>0);
  const total=s.lesson.length;
  const last=page>=total-1;
  const seen=isLessonSeen(sid);
  const subject=displaySubjectForStage(sid);
  const chapter=mathChapterForStage(sid);
  const backLabel=chapter?chapter.title+'の単元一覧へ':subject===MATH1_PREP_SUBJECT?'テスト対策の単元一覧へ':'単元一覧へ';
  const math=!!s.lessonMath;
  document.title=s.title+'｜学習クエスト';
  const dots=Array.from({length:total},(_,i)=>`<span class="lessonDot ${i===page?'on':''}${i<page?' done':''}"></span>`).join('');

  app().innerHTML="";
  app().appendChild(el(`<div>
    <nav class="quizBreadcrumb" aria-label="現在地"><a href="#home">教科選択</a><span>›</span><a href="${subjectHash(subject)}">${escapeHtml(subject)}</a>${chapter?`<span>›</span><a href="${mathChapterHash(chapter.id)}">${escapeHtml(chapter.title)}</a>`:''}<span>› ${escapeHtml(s.title)}</span></nav>
    <div class="card lessonScreen">
      <div class="hud"><span class="chip">📖 まなぶ</span><span class="chip">${escapeHtml(s.title)}</span></div>
      <div class="lessonDots" aria-label="${page+1}枚目 / ${total}枚">${dots}</div>
      ${lessonCardHtml(s.lesson[page],page,{math})}
      <div class="lessonNav">
        ${page>0?`<button class="btn secondary" id="lessonPrev" type="button">← 前のカード</button>`:''}
        ${last
          ? `<button class="btn" id="lessonStart" type="button">✏️ 問題をとく（全${s.data.length}問）</button>`
          : `<button class="btn" id="lessonNext" type="button">次のカード →</button>`}
        ${seen && !last ? `<button class="fallbackLink" id="lessonSkip" type="button">読んだことがあるので問題へ</button>`:''}
      </div>
      <div class="muted lessonNote">${seen?'もう一度読んでいます。問題の途中でも「📖 もう一度みる」から読み返せます。':'まずは3枚のカードを読んでから問題に進みます。問題の途中でも読み返せます。'}</div>
    </div>
    <div class="quizTools"><button class="btn secondary small" id="lessonBack" type="button">← ${escapeHtml(backLabel)}</button></div>
  </div>`));

  document.getElementById('lessonBack').addEventListener('click',()=>renderStageHome(sid));
  const prev=document.getElementById('lessonPrev');
  if(prev)prev.addEventListener('click',()=>renderLesson(sid,page-1));
  const next=document.getElementById('lessonNext');
  if(next)next.addEventListener('click',()=>renderLesson(sid,page+1));
  const skip=document.getElementById('lessonSkip');
  if(skip)skip.addEventListener('click',()=>startStage(sid));
  const start=document.getElementById('lessonStart');
  if(start)start.addEventListener('click',()=>{ markLessonSeen(sid); startStage(sid); });
  mountLessonActivities(app(),s.lesson,complete=>{
    const advance=next||start;
    if(advance)advance.disabled=!complete;
  });
  window.scrollTo?.(0,0);
}
