import { test } from 'node:test';
import assert from 'node:assert/strict';
import { units } from '../data/b26_midterm.js';
import { QUESTIONS, STAGE_ORDER } from '../js/content.js';
import { lessonCardHtml } from '../js/lesson.js';
import { bioDiagram } from '../js/bio-display.js';
import { testPrepCategories, renderTestPrepPanel } from '../js/views/home.js';
import { state } from '../js/state.js';
import { finishQuestion, renderSavedAnswer } from '../js/views/quiz.js';
import { snapshotSession, restoreSession } from '../js/session.js';
import { createLocalStorage } from './helpers/env.js';

test('写真の範囲を6ステージ各10問・計60問、既存生物単元の後ろに追加',()=>{
  assert.equal(units.length,6);
  assert.equal(units.reduce((n,u)=>n+u.questions.length,0),60);
  assert.equal(new Set(units.flatMap(u=>u.questions.map(q=>q.q))).size,60);
  for(const [i,u] of units.entries()){
    assert.equal(u.id,`b26s${i+1}`);
    assert.equal(u.subject,'🧬 生物基礎 visual');
    assert.equal(u.questions.length,10);
    assert.equal(u.questions.filter(q=>q.lv==='基礎').length,5);
    assert.equal(u.lesson.length,3);
    assert.equal(QUESTIONS[u.id].page,u.page);
    assert.ok(STAGE_ORDER.indexOf(u.id)>STAGE_ORDER.indexOf('b2s7'));
    for(const q of u.questions){
      assert.equal(q.examPractice,true);
      assert.equal(q.points,undefined); // 60問の通常練習。追加の模擬問題を生成しない。
      assert.match(bioDiagram(q.studyDiagram),/role="img"/);
      assert.ok(q.sourcePages);
    }
  }
});

test('全学習カードに生物用の見出しを表示し、各ステージで図を読める',()=>{
  for(const u of units){
    assert.ok(u.lesson.some(c=>c.diagram));
    for(const [i,c] of u.lesson.entries()){
      const html=lessonCardHtml(c,i);
      assert.ok(html.includes(c.kind));
      assert.doesNotMatch(html,/式と単位/);
      if(c.diagram){assert.match(html,/viewBox="0 0 600/);assert.match(html,/aria-label=/);assert.match(html,/<figcaption>/);}
    }
  }
  assert.equal(bioDiagram('unrecognized'),'');
  const question=bioDiagram('fluidQuestion');
  assert.match(question,/B（細胞の周り）/);
  assert.doesNotMatch(question,/組織液|リンパ液|血しょう/); // 代替テキストにも正解を含めない。
});

test('テスト対策に最新追加の生物を掲載、10/19まで期間中として扱う',()=>{
  const first=date=>testPrepCategories(date)[0];
  assert.equal(first('2026-10-08').subject,units[0].subject);
  assert.equal(first('2026-10-12').status,'これからのテスト');
  for(const date of ['2026-10-13','2026-10-19'])assert.equal(first(date).status,'テスト期間中');
  assert.equal(first('2026-10-20').past,true);
  assert.equal(first('2026-10-08').keepSubject,true);
  assert.ok(renderTestPrepPanel('2026-10-08').includes(first('2026-10-08').href));
});

test('実採点・二重回答・保存復元でも図が1つ表示され、模擬中には解答図を隠す',()=>{
  const node=()=>({innerHTML:'',textContent:'',className:'',classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
  const nodes={fb:node(),nextWrap:node()};
  globalThis.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({...node(),firstChild:node()})};
  globalThis.localStorage=createLocalStorage();
  state.settings.sound=false;
  state.settings.timeAttack=false;
  for(const correct of [true,false]){
    const u=units[0];
    const c=state.cur={sid:u.id,mode:'stage',title:u.title,i:0,startIndex:0,list:QUESTIONS[u.id].data.map((q,i)=>({...q,_key:`${u.id}-${i}`})),correct:0,score:0,combo:0,maxCombo:0,feverGauge:0,feverLeft:0,feverCount:0,weakHits:0,wrongThisRun:[]};
    finishQuestion(correct,c.list[0]);
    assert.match(nodes.fb.innerHTML,/data-bio-diagram="homeostasis"/);
    const score=c.score;
    finishQuestion(correct,c.list[0]);
    assert.equal(c.score,score);
    assert.equal((nodes.fb.innerHTML.match(/data-bio-diagram=/g)||[]).length,1);
    state.cur=restoreSession(snapshotSession(c));
    assert.ok(state.cur._locked);
    renderSavedAnswer(state.cur.list[0]);
    assert.match(nodes.fb.innerHTML,/data-bio-diagram="homeostasis"/);
    assert.equal(state.cur.score,score);
    state.cur.list=state.cur.list.map(q=>({...q,points:2}));
    renderSavedAnswer(state.cur.list[0]);
    assert.doesNotMatch(nodes.fb.innerHTML,/data-bio-diagram=/);
  }
});
