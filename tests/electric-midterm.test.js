import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units as practice} from '../data/ec26_midterm.js';
import {units as papers} from '../data/ec26_mock.js';
import {testPrepCategories,renderTestPrepPanel} from '../js/views/home.js';
import {state,stagesOfSubject} from '../js/state.js';
import {finishQuestion,checkSuji} from '../js/views/quiz.js';
import {examTotal,examBreakdown,isMockExam} from '../js/mock-exam.js';
import {examResultHtml} from '../js/views/results.js';
import {snapshotSession,restoreSession} from '../js/session.js';
import {createLocalStorage} from './helpers/env.js';

test('電気回路は10/13〜19の専用入口から練習66問と100点模擬へ進める',()=>{
  const category=date=>testPrepCategories(date).find(c=>c.subject==='⚡ 中間テスト電気回路');
  assert.equal(category('2026-10-12').status,'これからのテスト');
  for(const date of ['2026-10-13','2026-10-19']){
    assert.equal(category(date).status,'テスト期間中');
    assert.ok(renderTestPrepPanel(date).includes(`href="${category(date).href}"`));
  }
  assert.equal(category('2026-10-20').past,true);
  assert.equal(testPrepCategories('2026-10-07')[0].subject,category('2026-10-07').subject);
  assert.equal(stagesOfSubject(category('2026-10-07').subject).length,15);
  assert.deepEqual(practice.map(u=>u.questions.length),[10,10,10,8,8,10,10]);
  assert.ok(practice.flatMap(u=>u.questions).every(q=>q.examPractice));
  assert.equal(new Set(practice.flatMap(u=>u.questions).map(q=>q.sourceImage)).size,6);
  const paper=papers[0];
  assert.equal(paper.questions.length,34);
  assert.deepEqual([2,3,4].map(p=>paper.questions.filter(q=>q.points===p).length),[10,16,8]);
  assert.deepEqual(examBreakdown(session()).map(g=>g.total),[20,25,15,20,20]);
  for(const u of practice){
    const selected=paper.questions.filter(q=>q.sourceStage===u.id);
    assert.ok(selected.length>0,`${u.id} が模擬から欠落`);
    for(const {points,examSection,sourceStage,...q} of selected){
      assert.ok(u.questions.some(original=>JSON.stringify(original)===JSON.stringify(q)),'固定復習問題の一致');
    }
  }
});

// 写真の数値・式から独立に再計算。負の端数も絶対値を四捨五入する。
function check(sid,index,value,digits){
  const scale=10**digits;
  const expected=Math.sign(value)*Math.round(Math.abs(value)*scale+1e-9)/scale;
  assert.equal(Number(practice.find(u=>u.id===sid).questions[index].a[0]),expected,`${sid}-${index}`);
}
test('電気・四則・代入・表計算の全数値60問を独立再計算する',()=>{
  [2**2*5*10,3**2*4*20,.5**2*8*60,2**2*3*120].forEach((v,i)=>check('ec26s1',i+4,v,0));
  check('ec26s1',9,600/(2**2*5),0);
  [[600,60,500],[600,50,500],[500,90,600],[600,240,500],[500,240,600],[500,140,600],[600,200,500],[600,30,500],[500,40,600]].forEach(([p,t,p2],i)=>check('ec26s2',i,p*t/p2,0));
  const arith=[8.04*(-2.59)-(3.71+5.13),7.51*(8.42-4.19/1.35),(4.62*7.24)/(-8.53/2.07),-3.68*(-(4.06+1.93)-(-9.41+6.29)),-(4.72+6.39)/(5.08-(3.15+1.84)),(6.18/-1.79)/2.86*(3.57-9.02),-9.265+5.832/(-2.743+6.498/3.917),-4.28*(5.92-7.03/.46+3.86/9.64),(-9.75-7.14)/(1.58*.36-8.63/5.27),-5.731+5.832/(2.487+3.094/(6.825-8.169))];
  arith.forEach((v,i)=>check('ec26s3',i,v,[6,9].includes(i)?3:2));
  [1.30,2.75,6.19,8.40].forEach((x,i)=>check('ec26s4',i,3.18*4.09*x,2));
  [2.85,3.90,8.17,9.46].forEach((f,i)=>check('ec26s4',i+4,6.05*7.24/f,2));
  [-9.52,-7.04,-3.65,9.81].forEach((x,i)=>check('ec26s5',i,7.94/1.86*x+3.02,2));
  check('ec26s5',4,-46.1*(87.2-59.3)/87.2+5.2*(-46.1)/(87.2-59.3),1);
  check('ec26s5',5,Math.PI/4*4.21**2+Math.PI*3.57*8.06,2);
  check('ec26s5',6,2.96*5.08**2-(2.96*5.08**2+2*5.08-6.41)/7.13,2);
  check('ec26s5',7,5.31/8.63*(Math.sqrt(8.63)-(-9.07)*2.47),2);
  const moments=[4.21*35.7,6.98*40.5,.32*16.5,1.97*(-28.6),3.07*(-49.5)];
  [moments[0],moments[1],moments[3],moments[4],moments.reduce((a,b)=>a+b,0)].forEach((v,i)=>check('ec26s6',i,v,2));
  const distances=[17.8*31.6,20.4*10.8,5.1*32.8,27.9*5.6];
  const time=31.6+10.8+32.8+5.6,distance=distances.reduce((a,b)=>a+b,0);
  [distances[0],distances[3],time,distance].forEach((v,i)=>check('ec26s6',i+5,v,1));
  check('ec26s6',9,distance/time,2);
  const rows=[[901,837,802],[593,546,506],[743,792,813],[394,520,476],[829,915,870]];
  [rows[0].reduce((a,b)=>a+b),rows[3].reduce((a,b)=>a+b),rows.reduce((n,r)=>n+r[0],0),rows.reduce((n,r)=>n+r[1],0),rows.flat().reduce((a,b)=>a+b)].forEach((v,i)=>check('ec26s7',i,v,0));
  const total=43+149+86+60+24;
  [43,149,60,24].forEach((v,i)=>check('ec26s7',i+5,100*v/total,2));
  check('ec26s7',9,total,0);
});

function dom(){
  const node=()=>({innerHTML:'',textContent:'',value:'',disabled:false,className:'',classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
  const nodes={fb:node(),nextWrap:node(),inputAns:node(),sujiCheck:node()};
  globalThis.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({...node(),firstChild:node()})};
  globalThis.localStorage=createLocalStorage();return nodes;
}
function session(){
  return {sid:'ec26mock1',mode:'stage',title:papers[0].title,i:0,startIndex:0,
    list:papers[0].questions.map((q,i)=>({...q,_key:`ec26mock1-${i}`})),correct:0,score:0,combo:20,maxCombo:20,feverGauge:0,feverLeft:3,feverCount:0,weakHits:0,wrongThisRun:[]};
}
test('電気回路模擬の採点・二重回答・保存再開・分野別復習（DOMスタブ）',()=>{
  const nodes=dom();
  for(const scenario of ['correct','wrong','mixed']){
    const c=state.cur=session();state.settings.timeAttack=true;let expected=0;
    for(let i=0;i<c.list.length;i++){
      c.i=i;c._locked=false;c._timeLeft=30;c._timeLimit=30;
      const correct=scenario==='correct'||scenario==='mixed'&&i%2===0;
      if(correct)expected+=c.list[i].points;
      finishQuestion(correct,c.list[i]);finishQuestion(correct,c.list[i]);
      assert.equal(c.score,expected);assert.doesNotMatch(nodes.fb.innerHTML,/⭕|❌|正解：/);
      assert.ok(!nodes.fb.innerHTML.includes(c.list[i].exp));
      const restored=restoreSession(snapshotSession(c));
      assert.equal(restored.score,expected);assert.ok(restored._locked);
      assert.equal(restored.i,i);assert.equal(restored.wrongThisRun.length,c.wrongThisRun.length);
    }
    assert.ok(isMockExam(c));assert.equal(examTotal(c),100);
    const restored=restoreSession(snapshotSession(c));
    assert.equal(examBreakdown(restored).reduce((n,g)=>n+g.earned,0),expected);
    const html=examResultHtml(restored);assert.equal((html.match(/<details>/g)||[]).length,34);
    for(const g of examBreakdown(restored)){if(g.earned<g.total)assert.ok(html.includes(`#/stage/${g.sourceStage}/1`));}
    assert.equal(examTotal({...restored,startIndex:10}),restored.list.slice(10).reduce((n,q)=>n+q.points,0));
  }
});
test('模擬の丸めた数値は数値として一致し、誤答や部分入力を拒否（DOMスタブ）',()=>{
  const nodes=dom();const c=state.cur=session();c.i=c.list.findIndex(q=>q.type==='suji');const q=c.list[c.i];
  for(const [value,correct] of [[q.a[0],true],[`${q.a[0]}.5`,false],[`${q.a[0]}秒`,false]]){
    c._locked=false;c.score=0;c.correct=0;nodes.inputAns.value=value;checkSuji(q);
    assert.equal(c.score,correct?q.points:0,value);
  }
});
