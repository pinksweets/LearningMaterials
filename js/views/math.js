import { app, el, escapeHtml, escapeAttr, syncScreenHash, subjectHash, mathChapterHash } from '../utils.js';
import { QUESTIONS, MATH1_SUBJECT, MATH1_PREP_SUBJECT, MATH1_CHAPTERS } from '../content.js';
import { state, stageMastery, subjectMastery, subjectClearedCount, isLessonSeen, isStageUnlockedForBoss } from '../state.js';
import { stopTimer } from '../timer.js';
import { stopBossTension, stopSpeech } from '../audio.js';
import { hasLesson } from '../lesson.js';
import { renderHome } from './home.js';
import { openStage } from './subject.js';
import { renderLesson } from './lesson.js';
import { resumePanel, startBoss } from './quiz.js';

export function mathChapterForStage(sid){
  return MATH1_CHAPTERS.find(chapter=>chapter.sections.some(section=>section.sids.includes(sid)));
}

export function mathChapterProgress(chapter){
  const sids=chapter.sections.flatMap(section=>section.sids);
  let mastered=0, questions=0;
  sids.forEach(sid=>{const m=stageMastery(sid);mastered+=m.mastered;questions+=m.total;});
  return {sids, questions, mastered, pct:questions?Math.round(mastered/questions*100):0,
    cleared:sids.filter(sid=>state.stageCleared[sid]).length};
}

export function mathStageHtml(sid,index){
  const s=QUESTIONS[sid];
  const lesson=hasLesson(s);
  const seen=isLessonSeen(sid);
  const cleared=!!state.stageCleared[sid];
  const m=stageMastery(sid);
  const check=sid==='njz10';
  const bossUnlocked=isStageUnlockedForBoss(sid);
  const boss=s.data[0]?.examPractice?'':`<button class="bossBtn" type="button" data-math-boss="${escapeAttr(sid)}"${bossUnlocked?'':' disabled'} aria-label="${escapeAttr(s.title)}のボス戦" title="${bossUnlocked?'ボス戦に挑戦':'10問をクリアすると開くよ'}">${state.bossCleared[sid]?'👑 再挑戦':bossUnlocked?'👹 ボス戦':'🔒 ボス戦'}</button>`;
  return `<article class="mathStage${cleared?' isCleared':''}">
    <button class="mathStageMain" type="button" data-math-stage="${escapeAttr(sid)}" aria-label="${escapeAttr(s.title)}：${lesson&&!seen?'まなぶから始める':'10問をとく'}">
      <span class="mathStageNumber">${index}</span>
      <span class="mathStageText"><span class="mathStageKind">${check?'章の確認':lesson?'まなぶ＋練習':'練習'}${cleared?'　✓ クリア済み':''}</span>
        <strong>${escapeHtml(s.title)}</strong><span class="mathStageDescription">${escapeHtml(s.desc)}</span>
        <span class="mathStageHint">${lesson&&!seen?'まなぶ → ':''}${s.data.length}問をとく　<span aria-hidden="true">→</span></span>
      </span>
    </button>
    <div class="mathStageFooter"><span>習熟 ${m.pct}%${cleared?'　｜　ベスト '+(state.stageBest[sid]||0)+'%':''}</span>
      <div class="mathStageActions">${lesson?`<button class="lessonBtn" type="button" data-math-lesson="${escapeAttr(sid)}" aria-label="${escapeAttr(s.title)}をまなぶ">📖 まなぶ</button>`:''}${boss}</div>
    </div>
    <div class="mastery"><i style="width:${m.pct}%"></i></div>
  </article>`;
}

export function mathChapterCardsHtml(){
  return `<div class="mathChapterCards">${MATH1_CHAPTERS.map((chapter,index)=>{
    const p=mathChapterProgress(chapter);
    return `<a class="mathChapterCard" href="${mathChapterHash(chapter.id)}"><span class="mathChapterNumber">第${index+1}章</span>
      <strong>${escapeHtml(chapter.title)}</strong><span>${escapeHtml(chapter.desc)}</span>
      <small>${p.sids.length}ステージ・${p.questions}問　｜　クリア ${p.cleared}/${p.sids.length}</small>
      <div class="mastery"><i style="width:${p.pct}%"></i></div><b>この章を開く →</b></a>`;
  }).join('')}</div>`;
}

export function renderMathHome(chapterId=''){
  const chapter=MATH1_CHAPTERS.find(item=>item.id===chapterId);
  syncScreenHash(chapter?mathChapterHash(chapter.id):subjectHash(MATH1_SUBJECT));
  stopTimer();stopBossTension();stopSpeech();
  document.title=(chapter?'数学Ⅰ｜'+chapter.title:'数学Ⅰ')+'｜学習クエスト';
  const m=subjectMastery(MATH1_SUBJECT);
  const progress=chapter?mathChapterProgress(chapter):null;
  const cleared=subjectClearedCount(MATH1_SUBJECT);
  const next=chapter?progress.sids.find(sid=>!state.stageCleared[sid])||progress.sids[0]:'njz1';
  let index=0;
  const body=chapter?`<nav class="mathChapterNav" aria-label="数学Ⅰの章">${MATH1_CHAPTERS.map(item=>`<a href="${mathChapterHash(item.id)}"${item.id===chapter.id?' aria-current="page"':''}>${escapeHtml(item.title)}</a>`).join('')}</nav>
    <section class="card mathCourseIntro"><h1>${escapeHtml(chapter.title)}</h1><p>${escapeHtml(chapter.desc)}</p>
      <div class="hud"><span class="chip">${progress.sids.length}ステージ・${progress.questions}問</span><span class="chip">クリア ${progress.cleared}/${progress.sids.length}</span><span class="chip">習熟 ${progress.pct}%</span></div>
      <button class="btn" type="button" data-math-stage="${escapeAttr(next)}">${progress.cleared===progress.sids.length?'最初から復習する':'次のステージから始める'}：${escapeHtml(QUESTIONS[next].title)}</button>
      <p class="muted">上から順に進めよう。覚えているところは飛ばして、好きなステージからでも始められるよ。</p></section>
    <div class="mathCourseSections">${chapter.sections.map(section=>`<section class="mathCourseSection"><h2>${escapeHtml(section.title)}</h2>${section.sids.map(sid=>mathStageHtml(sid,++index)).join('')}</section>`).join('')}</div>`
    :`<section class="card mathCourseIntro"><h1>📐 数学Ⅰ</h1><p>学ぶ内容を3つの章にまとめたよ。苦手なところから、少しずつ進めよう。</p>
      <div class="hud"><span class="chip">3章・${cleared.total}ステージ・${m.total}問</span><span class="chip">クリア ${cleared.cleared}/${cleared.total}</span><span class="chip">習熟 ${m.pct}%</span></div>
      <div class="mathStartBox"><strong>二次関数が苦手なら、ここから</strong><p>関数と座標 → 軸・頂点 → 平方完成とグラフ → 移動 → 最大・最小。やさしい説明と練習を、同じ章で順に進められるよ。</p>
        <button class="btn" type="button" data-math-stage="njz1">関数の意味から まなぶ</button>
        <a class="mathTextLink" href="${mathChapterHash('quadratics')}">二次関数の学ぶ順序を見る →</a></div>
    </section><section class="mathCourseChapters" aria-label="数学Ⅰの通常教材"><h2>学ぶ章を選ぼう</h2>${mathChapterCardsHtml()}</section>`;
  app().innerHTML='';
  app().appendChild(el(`<div class="mathCourse"><nav class="quizBreadcrumb" aria-label="現在地"><a href="#home">教科選択</a><span>›</span>${chapter?`<a href="${subjectHash(MATH1_SUBJECT)}">数学Ⅰ</a><span>› ${escapeHtml(chapter.title)}</span>`:'<span>数学Ⅰ</span>'}</nav>
    <button class="btn secondary small" id="mathBack" type="button">${chapter?'← 数学Ⅰの3章へ':'← 教科選択へ'}</button>
    ${resumePanel(MATH1_SUBJECT)}${body}
    <aside class="mathPrepLink"><strong>テスト対策</strong><p>一行ずつの例題と補習90問・100点の模擬テストは、別の入口から取り組めるよ。</p>
      <a href="${subjectHash(MATH1_PREP_SUBJECT)}">数学Ⅰのテスト対策を開く →</a></aside>
  </div>`));
  document.getElementById('mathBack').addEventListener('click',()=>chapter?renderMathHome():renderHome());
  app().querySelectorAll('[data-math-stage]').forEach(button=>button.addEventListener('click',()=>openStage(button.dataset.mathStage)));
  app().querySelectorAll('[data-math-lesson]').forEach(button=>button.addEventListener('click',()=>renderLesson(button.dataset.mathLesson)));
  app().querySelectorAll('[data-math-boss]').forEach(button=>button.addEventListener('click',()=>startBoss(button.dataset.mathBoss)));
}
