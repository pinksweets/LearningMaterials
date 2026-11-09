import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units as practice} from '../data/nov10_english.js';
import {units as papers} from '../data/nov10_english_mock.js';
import {testPrepCategories,renderTestPrepPanel} from '../js/views/home.js';
import {state,stagesOfSubject} from '../js/state.js';
import {finishQuestion,checkInput} from '../js/views/quiz.js';
import {examTotal,examBreakdown,isMockExam} from '../js/mock-exam.js';
import {examResultHtml} from '../js/views/results.js';
import {snapshotSession,restoreSession} from '../js/session.js';
import {createLocalStorage} from './helpers/env.js';

test('11/10の入口は追加順の先頭、当日まで有効で6ステージへ進める',()=>{
  const category=date=>testPrepCategories(date).find(c=>c.subject==='📅 11/10 英語小テスト対策');
  assert.equal(category('2026-11-09').status,'これからのテスト');
  assert.equal(category('2026-11-10').status,'今日のテスト');
  assert.equal(category('2026-11-10').past,false);
  assert.equal(category('2026-11-11').past,true);
  assert.equal(testPrepCategories('2026-11-09')[0].subject,category('2026-11-09').subject);
  assert.ok(renderTestPrepPanel('2026-11-09').includes(category('2026-11-09').href));
  assert.equal(stagesOfSubject(category('2026-11-09').subject).length,6);
});

test('写真No.205〜224の全20項目を意味・英語入力・語法で練習し、固定模擬も全範囲を含む',()=>{
  const expected=['teach','on my way to school','on a school trip','foreign','abroad','international','country','town','street','begin','finish','be over','be done with','become','turn','change','learn to do','come to do','get used to','go bad'];
  const numbers=Array.from({length:20},(_,i)=>205+i);
  assert.deepEqual(practice.map(u=>u.questions.length),[12,14,14,10,10]);
  const words=practice.slice(0,3).flatMap(u=>u.questions.filter(q=>q.forceInput));
  assert.deepEqual(words.map(q=>q.sourceNo),numbers);
  assert.deepEqual(words.map(q=>q.choices[q.a]),expected);
  assert.deepEqual(practice.slice(0,3).flatMap(u=>u.questions.filter(q=>q.type==='yon')).map(q=>q.sourceNo),numbers);
  assert.deepEqual(practice.slice(3).flatMap(u=>u.questions).map(q=>q.sourceNo),numbers);
  const all=practice.flatMap(u=>u.questions);
  assert.ok(all.every(q=>q.examPractice));
  assert.ok(all.filter(q=>q.type==='ana').every(q=>q.forceInput));
  for(const q of all.filter(q=>q.type==='yon'))assert.equal(new Set(q.choices).size,4,q.q);
  assert.equal(papers.length,1);
  const paper=papers[0];
  assert.equal(paper.questions.length,34);
  assert.equal(examTotal({list:paper.questions}),100);
  assert.deepEqual([2,3,4].map(points=>paper.questions.filter(q=>q.points===points).length),[10,16,8]);
  assert.deepEqual([...new Set(paper.questions.map(q=>q.sourceNo))].sort((a,b)=>a-b),numbers);
  for(const u of practice){
    const selected=paper.questions.filter(q=>q.sourceStage===u.id);
    assert.ok(selected.length>0,u.id);
    for(const {points,examSection,sourceStage,...original} of selected){
      assert.equal(examSection,u.title);
      assert.ok(u.questions.some(q=>JSON.stringify(q)===JSON.stringify(original)),`固定模擬と練習の対応: ${sourceStage}`);
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
  return {sid:'nov10mock1',mode:'stage',title:papers[0].title,i:0,startIndex:0,
    list:papers[0].questions.map((q,i)=>({...q,_key:`nov10mock1-${i}`})),
    correct:0,score:0,combo:20,maxCombo:20,feverGauge:0,feverLeft:3,feverCount:0,weakHits:0,wrongThisRun:[]};
}

test('11/10模擬の実採点・回答非開示・二重回答防止・保存再開・復習リンク（DOMスタブ）',()=>{
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
        assert.equal(resumed.score,c.score);
        assert.equal(resumed.i,16);
        assert.equal(resumed._locked,true);
        assert.deepEqual(resumed.wrongThisRun.map(q=>q._key),c.wrongThisRun.map(q=>q._key));
        Object.assign(c,resumed);
      }
    }
    assert.ok(isMockExam(c));assert.equal(examTotal(c),100);
    const groups=examBreakdown(c);
    assert.equal(groups.length,5);
    assert.equal(groups.reduce((n,g)=>n+g.earned,0),expected);
    const html=examResultHtml(c);
    assert.equal((html.match(/<details>/g)||[]).length,34);
    for(const g of groups)assert.equal(html.includes(`#/stage/${g.sourceStage}/1`),g.earned<g.total);
    assert.equal(examTotal({...c,startIndex:33}),c.list[33].points);
  }
});

test('新しい英語入力は全角大文字と空白を許容し、誤った活用や余分な文字は誤答にする',()=>{
  const nodes=setupDom();
  let styled=false;
  nodes.inputAns.classList.add=()=>{styled=true;};
  for(const q of practice.flatMap(u=>u.questions).filter(q=>q.forceInput)){
    for(const correct of [true,false]){
      const c=state.cur=session();
      const examQuestion={...q,points:3,_key:'nov10mock1-0'};
      c.list=[examQuestion];
      const answer=q.choices[q.a];
      nodes.inputAns.value=correct?[...answer.toUpperCase()].map(ch=>ch===' '?'　':String.fromCharCode(ch.charCodeAt(0)+0xfee0)).join(''):answer+'x';
      checkInput(examQuestion);checkInput(examQuestion);
      assert.equal(c.score,correct?3:0,answer);
      assert.equal(styled,false);
      assert.ok(!nodes.fb.innerHTML.includes(q.exp));
    }
  }
  for(const [no,wrong] of [[205,'teached'],[214,'began'],[215,'to read'],[218,'becomed'],[220,'train'],[223,'get'],[224,'went']]){
    const q=practice.slice(3).flatMap(u=>u.questions).find(q=>q.sourceNo===no);
    const c=state.cur=session();
    const examQuestion={...q,points:4,_key:'nov10mock1-0'};
    c.list=[examQuestion];nodes.inputAns.value=wrong;
    checkInput(examQuestion);assert.equal(c.score,0,`${no}: ${wrong}`);
  }
});
