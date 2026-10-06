import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units as practice} from '../data/h26_midterm.js';
import {units as papers} from '../data/h26_mock.js';
import {testPrepCategories,renderTestPrepPanel} from '../js/views/home.js';
import {state} from '../js/state.js';
import {finishQuestion} from '../js/views/quiz.js';
import {examTotal,examBreakdown,isMockExam} from '../js/mock-exam.js';
import {examResultHtml} from '../js/views/results.js';
import {snapshotSession,restoreSession} from '../js/session.js';
import {createLocalStorage} from './helpers/env.js';

test('歴史の中間対策は期間内に選べ、写真4分野の練習60問と固定模擬100点へつながる',()=>{
  for(const date of ['2026-10-13','2026-10-19']){
    const category=testPrepCategories(date).find(c=>c.subject==='📜 歴史総合');
    assert.equal(category.status,'テスト期間中');
    assert.ok(renderTestPrepPanel(date).includes(`href="${category.href}"`));
  }
  assert.equal(testPrepCategories('2026-10-20').find(c=>c.subject==='📜 歴史総合').past,true);
  assert.deepEqual(practice.map(u=>u.questions.length),[15,15,15,15]);
  const paper=papers[0];
  assert.equal(paper.questions.length,34);
  assert.deepEqual([2,3,4].map(p=>paper.questions.filter(q=>q.points===p).length),[10,16,8]);
  for(const u of practice){
    const questions=paper.questions.filter(q=>q.sourceStage===u.id);
    assert.equal(questions.reduce((n,q)=>n+q.points,0),25);
    for(const {points,examPractice,examSection,sourceStage,...original} of questions){
      assert.ok(examPractice);
      assert.equal(examSection,u.title);
      assert.ok(u.questions.some(q=>JSON.stringify(q)===JSON.stringify(original)));
    }
  }
});

test('歴史模擬の実採点・二重回答防止・再開・結果の復習先を検証する（DOMスタブ）',()=>{
  const node=()=>({innerHTML:'',textContent:'',className:'',classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
  const nodes={fb:node(),nextWrap:node()};
  globalThis.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({...node(),firstChild:node()})};
  globalThis.localStorage=createLocalStorage();
  for(const scenario of ['correct','wrong','mixed']){
    const c=state.cur={sid:'h26mock1',mode:'stage',title:papers[0].title,i:0,startIndex:0,
      list:papers[0].questions.map((q,i)=>({...q,_key:`h26mock1-${i}`})),
      correct:0,score:0,combo:20,maxCombo:20,feverGauge:0,feverLeft:3,feverCount:0,weakHits:0,wrongThisRun:[]};
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
    assert.equal(c.score,expected);
    assert.equal(examBreakdown(c).reduce((n,g)=>n+g.earned,0),expected);
    for(const g of examBreakdown(c)){
      assert.equal(examResultHtml(c).includes(`#/stage/${g.sourceStage}/1`),g.earned<g.total);
    }
    assert.equal(examTotal({...c,startIndex:33}),c.list[33].points);
  }
});
