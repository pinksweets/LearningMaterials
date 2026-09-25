import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units} from '../data/ch1_mock.js';
import {QUESTIONS} from '../js/content.js';
import {isMockExam,examTotal,examBreakdown,examNumericMatch} from '../js/mock-exam.js';
import {snapshotSession,restoreSession} from '../js/session.js';
import {state} from '../js/state.js';
import {finishQuestion,answer,renderSavedAnswer} from '../js/views/quiz.js';
import {examResultHtml} from '../js/views/results.js';
import {createLocalStorage} from './helpers/env.js';

function session(){
  return {sid:'ch1mock1',mode:'stage',title:units[0].title,i:0,startIndex:0,
    list:units[0].questions.map((q,i)=>({...q,_key:`ch1mock1-${i}`})),
    correct:0,score:0,combo:0,maxCombo:0,feverGauge:0,feverLeft:0,feverCount:0,weakHits:0,wrongThisRun:[]};
}
function dom(){
  const node=()=>({innerHTML:'',textContent:'',className:'',classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
  const nodes={fb:node(),nextWrap:node()};
  globalThis.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({...node(),firstChild:node()})};
  globalThis.localStorage=createLocalStorage();
  return nodes;
}
test('模擬の数値入力は部分一致や小数の切り捨てを認めない',()=>{
  for(const value of ['4','４','4.0',' 4 '])assert.equal(examNumericMatch(value,['4']),true);
  for(const value of ['4.5','4abc','','4個','Infinity'])assert.equal(examNumericMatch(value,['4']),false);
});

test('模擬テストは34問・100点、2/3/4点が10/16/8問、全8練習分野をカバー',()=>{
  const c=session();
  assert.equal(c.list.length,34);
  assert.equal(examTotal(c),100);
  assert.deepEqual([2,3,4].map(p=>c.list.filter(q=>q.points===p).length),[10,16,8]);
  assert.equal(new Set(c.list.map(q=>q.sourceStage)).size,8);
  for(const q of c.list){assert.ok(QUESTIONS[q.sourceStage]);assert.ok(q.examPractice);assert.ok(['yon','maru','suji'].includes(q.type));}
  assert.equal(isMockExam(c),true);
  assert.equal(isMockExam({...c,mode:'review'}),false);
  assert.equal(isMockExam({...c,list:QUESTIONS.ch1s1.data}),false);
});
test('実際の採点は全問正解100点・全問不正解0点、二重発火とボーナスで増えない',()=>{
  const nodes=dom();
  for(const correct of [true,false]){
    const c=state.cur=session();
    state.settings.timeAttack=true;
    c.combo=20;c.feverLeft=3;c._timeLeft=30;c._timeLimit=30;
    for(let i=0;i<c.list.length;i++){
      c.i=i;c._locked=false;
      finishQuestion(correct,c.list[i]);
      const score=c.score;
      finishQuestion(correct,c.list[i]);
      assert.equal(c.score,score);
      assert.doesNotMatch(nodes.fb.innerHTML,/⭕|❌|正解：/);
      assert.ok(!nodes.fb.innerHTML.includes(c.list[i].exp));
    }
    assert.equal(c.score,correct?100:0);
    assert.equal(c.correct,correct?34:0);
  }
});
test('配点・途中経過・誤答は再開しても維持し、結果は分野別得点と復習リンクを示す',()=>{
  dom();
  const c=state.cur=session();
  for(let i=0;i<c.list.length;i++){
    c.i=i;c._locked=false;
    finishQuestion(i%2===0,c.list[i]);
  }
  const restored=restoreSession(snapshotSession(c));
  assert.ok(isMockExam(restored));
  assert.equal(restored.score,c.score);
  assert.equal(examTotal(restored),100);
  assert.equal(examBreakdown(restored).reduce((n,g)=>n+g.earned,0),c.score);
  state.cur=restored;
  renderSavedAnswer(restored.list[restored.i]);
  const html=examResultHtml(restored);
  assert.match(html,/この分野を復習/);
  assert.match(html,/正解と解説/);
  assert.equal((html.match(/<details>/g)||[]).length,34);
  const partial={...restored,startIndex:10};
  assert.equal(examTotal(partial),partial.list.slice(10).reduce((n,q)=>n+q.points,0));
});
test('選択肢回答時も正誤の色を漏らさない',()=>{
  dom();
  const c=state.cur=session();
  let leaks=0;
  const choice={dataset:{i:'0'},classList:{add(name){if(['correct','wrong'].includes(name))leaks++;}}};
  document.querySelectorAll=selector=>selector==='[data-i]'?[choice]:[];
  c.shuffledCorrect=0;
  answer(true,choice,0);
  assert.equal(leaks,0);
  assert.equal(c.score,c.list[0].points);
});
