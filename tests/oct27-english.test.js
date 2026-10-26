import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units as practice} from '../data/oct27_english.js';
import {units as papers} from '../data/oct27_english_mock.js';
import {testPrepCategories,renderTestPrepPanel} from '../js/views/home.js';
import {state,stagesOfSubject} from '../js/state.js';
import {finishQuestion,checkInput} from '../js/views/quiz.js';
import {examTotal,examBreakdown,isMockExam} from '../js/mock-exam.js';
import {examResultHtml} from '../js/views/results.js';
import {snapshotSession,restoreSession} from '../js/session.js';
import {createLocalStorage} from './helpers/env.js';

test('10/27の入口・写真21項目の意味とつづり・60問と100点模擬を確認',()=>{
  const category=date=>testPrepCategories(date).find(c=>c.subject==='📅 10/27 英語小テスト対策');
  assert.equal(category('2026-10-26').status,'これからのテスト');
  assert.equal(category('2026-10-27').status,'今日のテスト');
  assert.equal(category('2026-10-28').past,true);
  assert.equal(testPrepCategories('2026-10-26')[0].subject,category('2026-10-26').subject);
  assert.ok(renderTestPrepPanel('2026-10-26').includes(category('2026-10-26').href));
  assert.equal(stagesOfSubject(category('2026-10-26').subject).length,6);
  assert.deepEqual(practice.map(u=>u.questions.length),[14,14,14,9,9]);
  const expected=['get along with','make friends with','a friend from','break up with','pay','buy','sell','expensive','cheap','on sale','job','work','report','work for','vacation','take off','on business','class','homework','paper','interview'];
  const words=practice.slice(0,3).flatMap(u=>u.questions.slice(7));
  assert.deepEqual(words.map(q=>q.sourceNo),Array.from({length:21},(_,i)=>184+i));
  assert.deepEqual(words.map(q=>q.choices[q.a]),expected);
  for(const u of practice.slice(0,3))assert.deepEqual(u.questions.slice(0,7).map(q=>q.sourceNo),u.questions.slice(7).map(q=>q.sourceNo));
  assert.ok(practice.flatMap(u=>u.questions).every(q=>q.examPractice));
  for(const q of practice.flatMap(u=>u.questions).filter(q=>q.type==='yon'))assert.equal(new Set(q.choices).size,4);
  const paper=papers[0];
  assert.equal(paper.questions.length,34);
  assert.equal(paper.questions.reduce((n,q)=>n+q.points,0),100);
  assert.deepEqual([...new Set(paper.questions.map(q=>q.sourceNo))].sort((a,b)=>a-b),Array.from({length:21},(_,i)=>184+i));
  for(const u of practice){
    const questions=paper.questions.filter(q=>q.sourceStage===u.id);
    assert.ok(questions.length>0);
    for(const {points,examSection,sourceStage,...original} of questions){
      assert.ok([2,3,4].includes(points));
      assert.equal(examSection,u.title);
      assert.ok(u.questions.some(q=>JSON.stringify(q)===JSON.stringify(original)));
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
  return {sid:'oct27mock1',mode:'stage',title:papers[0].title,i:0,startIndex:0,
    list:papers[0].questions.map((q,i)=>({...q,_key:`oct27mock1-${i}`})),
    correct:0,score:0,combo:20,maxCombo:20,feverGauge:0,feverLeft:3,feverCount:0,weakHits:0,wrongThisRun:[]};
}

test('10/27英語模擬の実採点はボーナスなし、二重回答・保存再開・分野別復習に対応（DOMスタブ）',()=>{
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
    assert.equal(examBreakdown(c).length,5);
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
      const examQuestion={...q,points:3,_key:'oct27mock1-0'};
      c.list=[examQuestion];
      const answer=q.choices[q.a];
      nodes.inputAns.value=correct ? [...answer.toUpperCase()].map(ch=>ch===' '?'　':String.fromCharCode(ch.charCodeAt(0)+0xfee0)).join('') : answer+'x';
      checkInput(examQuestion);
      checkInput(examQuestion);
      assert.equal(c.score,correct?3:0,answer);
      assert.equal(styled,false);
      assert.ok(!nodes.fb.innerHTML.includes(q.exp));
    }
  }
});
