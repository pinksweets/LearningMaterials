import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units as practice} from '../_site/data/nov17_english.js';
import {units as papers} from '../_site/data/nov17_english_mock.js';
import {testPrepCategories,renderTestPrepPanel} from '../_site/js/views/home.js';
import {state,stagesOfSubject} from '../_site/js/state.js';
import {finishQuestion,checkInput} from '../_site/js/views/quiz.js';
import {examTotal,examBreakdown,isMockExam} from '../_site/js/mock-exam.js';
import {examResultHtml} from '../_site/js/views/results.js';
import {snapshotSession,restoreSession} from '../_site/js/session.js';
import {createLocalStorage} from './helpers/env.js';

const subject='📅 11/17 英語小テスト対策';
const numbers=Array.from({length:27},(_,i)=>225+i);
const words=['problem','solve','do well','decide','choose','break','break down','fall','drop','busy','free','careful','kind','poor','shy','be good at','be able to do','be tired from','easy','difficult','quiet','safe','true','wrong','different','be covered with','be full of'];

test('11/17の入口は当日まで有効で、新しい対策の追加後も8ステージへ進める',()=>{
  const category=date=>testPrepCategories(date).find(c=>c.subject===subject);
  assert.equal(category('2026-11-16').status,'これからのテスト');
  assert.equal(category('2026-11-17').status,'今日のテスト');
  assert.equal(category('2026-11-17').past,false);
  assert.equal(category('2026-11-18').past,true);
  const categories=testPrepCategories('2026-11-15');
  assert.ok(categories.findIndex(c=>c.added===13)<categories.findIndex(c=>c.added===12));
  assert.ok(renderTestPrepPanel('2026-11-15').includes(category('2026-11-15').href));
  assert.deepEqual(stagesOfSubject(subject),['nov17e1','nov17e2','nov17e3','nov17e4','nov17e5','nov17e6','nov17e7','nov17mock1']);
});

test('写真p.78〜85のNo.225〜251・27項目を意味・英語入力・語法で網羅する',()=>{
  assert.deepEqual(practice.map(u=>u.questions.length),[14,14,12,14,9,9,9]);
  assert.deepEqual(practice.map(u=>u.order),[10801,10802,10803,10804,10805,10806,10807]);
  const spellings=practice.slice(0,4).flatMap(u=>u.questions.filter(q=>q.forceInput));
  assert.deepEqual(spellings.map(q=>q.sourceNo),numbers);
  assert.deepEqual(spellings.map(q=>q.choices[q.a]),words);
  assert.deepEqual(practice.slice(0,4).flatMap(u=>u.questions.filter(q=>q.type==='yon')).map(q=>q.sourceNo),numbers);
  assert.deepEqual(practice.slice(4).flatMap(u=>u.questions).map(q=>q.sourceNo),numbers);
  const all=practice.flatMap(u=>u.questions);
  assert.ok(all.every(q=>q.examPractice && numbers.includes(q.sourceNo)));
  assert.ok(all.filter(q=>q.type==='ana').every(q=>q.forceInput));
  for(const q of all.filter(q=>q.type==='yon'))assert.equal(new Set(q.choices).size,4,q.q);

  assert.equal(papers.length,1);
  const paper=papers[0];
  assert.equal(paper.id,'nov17mock1');
  assert.equal(paper.order,10808);
  assert.equal(paper.questions.length,34);
  assert.equal(examTotal({list:paper.questions}),100);
  assert.deepEqual([2,3,4].map(points=>paper.questions.filter(q=>q.points===points).length),[10,16,8]);
  assert.deepEqual([...new Set(paper.questions.map(q=>q.sourceNo))].sort((a,b)=>a-b),numbers);
  for(const unit of practice){
    const selected=paper.questions.filter(q=>q.sourceStage===unit.id);
    assert.ok(selected.length>0,unit.id);
    for(const {points,examSection,sourceStage,...original} of selected){
      assert.equal(examSection,unit.title);
      assert.ok(unit.questions.some(q=>JSON.stringify(q)===JSON.stringify(original)),`固定模擬と練習の対応: ${sourceStage}`);
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
  return {sid:'nov17mock1',mode:'stage',title:papers[0].title,i:0,startIndex:0,
    list:papers[0].questions.map((q,i)=>({...q,_key:`nov17mock1-${i}`})),
    correct:0,score:0,combo:20,maxCombo:20,feverGauge:0,feverLeft:3,feverCount:0,weakHits:0,wrongThisRun:[]};
}

test('11/17模擬の実採点・回答非開示・二重回答防止・保存再開・復習リンク（DOMスタブ）',()=>{
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
      assert.ok(!nodes.fb.innerHTML.includes(c.list[i].exp));
      if(i===16){
        const resumed=restoreSession(snapshotSession(c));
        assert.ok(resumed);
        assert.equal(resumed.score,c.score);
        assert.equal(resumed.i,16);
        assert.equal(resumed._locked,true);
        assert.deepEqual(resumed.wrongThisRun.map(q=>q._key),c.wrongThisRun.map(q=>q._key));
        Object.assign(c,resumed);
      }
    }
    assert.ok(isMockExam(c));
    assert.equal(examTotal(c),100);
    const groups=examBreakdown(c);
    assert.equal(groups.length,7);
    assert.equal(groups.reduce((n,g)=>n+g.earned,0),expected);
    const html=examResultHtml(c);
    assert.equal((html.match(/<details>/g)||[]).length,34);
    for(const g of groups)assert.equal(html.includes(`#/stage/${g.sourceStage}/1`),g.earned<g.total);
    assert.equal(examTotal({...c,startIndex:33}),c.list[33].points);
  }
});

test('11/17の英語入力は全角大文字と空白を許容し、余分な文字を誤答にする（DOMスタブ）',()=>{
  const nodes=setupDom();
  let styled=false;
  nodes.inputAns.classList.add=()=>{styled=true;};
  for(const q of practice.flatMap(u=>u.questions).filter(q=>q.forceInput)){
    for(const correct of [true,false]){
      const c=state.cur=session();
      const examQuestion={...q,points:3,_key:'nov17mock1-0'};
      c.list=[examQuestion];
      const answer=q.choices[q.a];
      nodes.inputAns.value=correct?[...answer.toUpperCase()].map(ch=>ch===' '?'　':String.fromCharCode(ch.charCodeAt(0)+0xfee0)).join(''):answer+'x';
      checkInput(examQuestion);checkInput(examQuestion);
      assert.equal(c.score,correct?3:0,answer);
      assert.equal(styled,false);
      assert.ok(!nodes.fb.innerHTML.includes(q.exp));
    }
  }
});
