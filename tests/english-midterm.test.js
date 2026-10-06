import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units as practice} from '../data/e26_midterm.js';
import {units as papers} from '../data/e26_mock.js';
import {testPrepCategories,renderTestPrepPanel} from '../js/views/home.js';
import {state,stagesOfSubject} from '../js/state.js';
import {finishQuestion,checkInput} from '../js/views/quiz.js';
import {examTotal,examBreakdown,isMockExam} from '../js/mock-exam.js';
import {examResultHtml} from '../js/views/results.js';
import {snapshotSession,restoreSession} from '../js/session.js';
import {createLocalStorage} from './helpers/env.js';

test('英語専用入口は期間末まで開催中で100問と模擬34問につながる',()=>{
  const category=date=>testPrepCategories(date).find(c=>c.subject==='🇬🇧 中間テスト英語');
  assert.equal(category('2026-10-12').status,'これからのテスト');
  for(const date of ['2026-10-13','2026-10-19']){
    assert.equal(category(date).status,'テスト期間中');
    assert.ok(renderTestPrepPanel(date).includes(`href="${category(date).href}"`));
  }
  assert.equal(category('2026-10-20').past,true);
  assert.ok(!category('2026-10-13').keepSubject,'通常教科カードへの二重表示を防ぐ');
  assert.equal(stagesOfSubject(category('2026-10-13').subject).length,11);
  assert.deepEqual(practice.map(u=>u.questions.length),Array(10).fill(10));
  const all=practice.flatMap(u=>u.questions);
  assert.equal(all.filter(q=>q.type==='yon').length,90);
  assert.equal(all.filter(q=>q.type==='ana'&&q.forceInput).length,10);
  assert.ok(all.every(q=>q.examPractice),'基礎練習の時間制限をなくす');
  const paper=papers[0];
  assert.equal(paper.questions.length,34);
  assert.deepEqual([2,3,4].map(p=>paper.questions.filter(q=>q.points===p).length),[10,16,8]);
  assert.equal(paper.questions.filter(q=>q.forceInput).length,4);
  for(const u of practice){
    const questions=paper.questions.filter(q=>q.sourceStage===u.id);
    assert.ok(questions.length>0,`${u.id} が模擬から欠落`);
    for(const {points,examSection,sourceStage,...original} of questions){
      assert.equal(examSection,u.title);
      assert.ok(u.questions.some(q=>JSON.stringify(q)===JSON.stringify(original)),'固定復習問題の一致');
    }
  }
});

function setupDom(){
  const node=()=>({innerHTML:'',textContent:'',value:'',disabled:false,className:'',
    classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
  const nodes={fb:node(),nextWrap:node(),inputAns:node(),inputCheck:node()};
  globalThis.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:()=>[],
    createElement:()=>({...node(),firstChild:node()})};
  globalThis.localStorage=createLocalStorage();
  return nodes;
}
function session(){
  return {sid:'e26mock1',mode:'stage',title:papers[0].title,i:0,startIndex:0,
    list:papers[0].questions.map((q,i)=>({...q,_key:`e26mock1-${i}`})),
    correct:0,score:0,combo:20,maxCombo:20,feverGauge:0,feverLeft:3,feverCount:0,weakHits:0,wrongThisRun:[]};
}

test('英語模擬の実採点はボーナスなし、二重回答・保存再開・分野別復習に対応（DOMスタブ）',()=>{
  const nodes=setupDom();
  for(const scenario of ['correct','wrong','mixed']){
    const c=state.cur=session();
    state.settings.timeAttack=true;
    let expected=0;
    for(let i=0;i<c.list.length;i++){
      c.i=i;c._locked=false;
      const correct=scenario==='correct'||scenario==='mixed'&&i%2===0;
      if(correct)expected+=c.list[i].points;
      finishQuestion(correct,c.list[i]);
      finishQuestion(correct,c.list[i]);
      assert.equal(c.score,expected);
      assert.ok(!nodes.fb.innerHTML.includes(c.list[i].exp),'解説を途中で出さない');
      if(i===5){
        const resumed=restoreSession(snapshotSession(c));
        assert.equal(resumed.score,c.score);
        assert.equal(resumed.i,5);
        assert.equal(resumed._locked,true);
        assert.deepEqual(resumed.wrongThisRun.map(q=>q._key),c.wrongThisRun.map(q=>q._key));
        Object.assign(c,resumed);
      }
    }
    assert.ok(isMockExam(c));assert.equal(examTotal(c),100);
    assert.equal(examBreakdown(c).length,10);
    assert.equal(examBreakdown(c).reduce((n,g)=>n+g.earned,0),expected);
    for(const g of examBreakdown(c)){
      assert.equal(examResultHtml(c).includes(`#/stage/${g.sourceStage}/1`),g.earned<g.total);
    }
    assert.equal(examTotal({...c,startIndex:33}),c.list[33].points);
  }
});

test('英単語入力は全角大文字を許容し、余分な文字を誤答にする。模擬中に正誤色を出さない',()=>{
  const nodes=setupDom();
  let styled=false;
  nodes.inputAns.classList.add=()=>{styled=true;};
  for(const q of practice.flatMap(u=>u.questions).filter(q=>q.forceInput)){
    for(const correct of [true,false]){
      const c=state.cur=session();
      const examQuestion={...q,points:3,_key:'e26mock1-0'};
      c.list=[examQuestion];
      const answer=q.choices[q.a];
      nodes.inputAns.value=correct ? [...answer.toUpperCase()].map(ch=>String.fromCharCode(ch.charCodeAt(0)+0xfee0)).join('') : answer+'x';
      checkInput(examQuestion);
      checkInput(examQuestion);
      assert.equal(c.score,correct?3:0,answer);
      assert.equal(styled,false);
      assert.ok(!nodes.fb.innerHTML.includes(q.exp));
    }
  }
});
