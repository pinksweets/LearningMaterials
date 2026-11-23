import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units as triangles} from '../data/ma_final_triangles.js';
import {units as circles} from '../data/ma_final_circles.js';
import {units as papers} from '../data/ma_final_mock.js';
import {QUESTIONS, studyUnitById} from '../js/content.js';
import {isMockExam, examTotal, examBreakdown} from '../js/mock-exam.js';
import {snapshotSession, restoreSession} from '../js/session.js';
import {state} from '../js/state.js';
import {finishQuestion, renderSavedAnswer} from '../js/views/quiz.js';
import {examResultHtml} from '../js/views/results.js';
import {testPrepCategories, renderTestPrepPanel} from '../js/views/home.js';
import {subjectShelfHtml} from '../js/views/start.js';
import {createLocalStorage} from './helpers/env.js';

const practice=[...triangles,...circles];
const paper=papers[0];
function session(){
  return {sid:paper.id,mode:'stage',title:paper.title,i:0,startIndex:0,
    list:paper.questions.map((q,i)=>({...q,_key:`${paper.id}-${i}`})),correct:0,score:0,
    combo:0,maxCombo:0,feverGauge:0,feverLeft:0,feverCount:0,weakHits:0,wrongThisRun:[]};
}
function dom(){
  const node=()=>({innerHTML:'',textContent:'',className:'',classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
  const nodes={fb:node(),nextWrap:node()};
  globalThis.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({...node(),firstChild:node()})};
  globalThis.localStorage=createLocalStorage();
  return nodes;
}

test('期末対策は7分野70問と固定の34問100点、配点と復習先が対応する',()=>{
  assert.equal(practice.length,7);
  assert.ok(practice.every(u=>u.questions.length===10));
  assert.equal(papers.length,1);
  assert.equal(paper.questions.length,34);
  assert.equal(examTotal({list:paper.questions}),100);
  assert.deepEqual([2,3,4].map(p=>paper.questions.filter(q=>q.points===p).length),[10,16,8]);
  assert.equal(new Set(paper.questions.map(q=>q.examSection)).size,7);
  for(const q of paper.questions){
    assert.equal(q.examPractice,true);
    assert.equal(q.hint,undefined);
    const source=practice.find(u=>u.id===q.sourceStage);
    assert.ok(source && QUESTIONS[source.id]);
    const {points,examSection,sourceStage,...original}=q;
    assert.ok(source.questions.some(p=>JSON.stringify(p)===JSON.stringify(original)),q.q);
  }
});

test('期末専用入口は未指定の日付を作らず、8ステージだけを集計する',()=>{
  state.studyMaterials={};state.stageCleared={};
  const item=testPrepCategories('2026-11-23').find(c=>c.unitId==='group:mafs1');
  assert.ok(item.evergreen);
  assert.equal(item.date,undefined);
  assert.equal(item.past,false);
  assert.deepEqual(studyUnitById(item.unitId).sids,[...practice.map(u=>u.id),paper.id]);
  const html=renderTestPrepPanel('2026-11-23');
  assert.ok(html.includes(`href="${item.href}"`));
  assert.match(html,/期末テスト対策｜数学A/);
  assert.match(html,/クリア 0\/8/);
  assert.match(subjectShelfHtml('2026-11-23'),/期末テスト対策｜数学A/);
  assert.ok(subjectShelfHtml('2026-11-23').includes(`href="${item.href}"`));
  state.studyMaterials[item.unitId]='completed';
  assert.ok(!renderTestPrepPanel('2026-11-23').includes(item.title));
  assert.ok(!subjectShelfHtml('2026-11-23').includes(item.title));
  assert.match(renderTestPrepPanel('2026-11-23'),/10\/13〜19 中間テスト対策｜数学A/);
  state.studyMaterials={};
});

test('期末模試の全正解・全誤答・混合採点、二重発火とボーナスを確認する',()=>{
  const nodes=dom();
  for(const mode of ['all','none','mixed']){
    const c=state.cur=session();
    state.settings.timeAttack=true;c.combo=20;c.feverLeft=3;c._timeLeft=30;c._timeLimit=30;
    let expected=0;
    for(let i=0;i<c.list.length;i++){
      c.i=i;c._locked=false;
      const ok=mode==='all'||mode==='mixed'&&i%2===0;
      finishQuestion(ok,c.list[i]);expected+=ok?c.list[i].points:0;
      finishQuestion(ok,c.list[i]);
      assert.equal(c.score,expected);
      assert.doesNotMatch(nodes.fb.innerHTML,/⭕|❌|正解：/);
      assert.ok(!nodes.fb.innerHTML.includes(c.list[i].exp));
    }
    if(mode==='all')assert.equal(c.score,100);
    if(mode==='none')assert.equal(c.score,0);
    const restored=restoreSession(snapshotSession(c));
    assert.ok(isMockExam(restored));
    assert.equal(restored.score,expected);
    assert.equal(examBreakdown(restored).reduce((n,g)=>n+g.earned,0),expected);
    const html=examResultHtml(restored);
    assert.equal((html.match(/<details>/g)||[]).length,34);
    assert.match(html,/data-ma-diagram="geometry"/);
    if(mode!=='all')for(const u of practice)assert.ok(html.includes(`href="#/stage/${u.id}/1"`));
  }
});

test('途中保存の再開でも正解を隠し、部分開始と単問の実配点を使う',()=>{
  const nodes=dom();
  const c=state.cur=session();c.i=4;
  finishQuestion(false,c.list[4]);
  const restored=restoreSession(snapshotSession(c));
  assert.equal(restored.i,4);assert.ok(restored._locked);
  assert.equal(restored.wrongThisRun[0]._key,`${paper.id}-4`);
  state.cur=restored;renderSavedAnswer(restored.list[4]);
  assert.ok(!nodes.fb.innerHTML.includes(restored.list[4].exp));
  assert.equal(examTotal({...c,startIndex:10}),c.list.slice(10).reduce((n,q)=>n+q.points,0));
  assert.equal(examTotal({...c,mode:'practice',list:[c.list[0]],startIndex:0}),c.list[0].points);
});
