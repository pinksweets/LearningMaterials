import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units as practice} from '../data/ec26_textbook.js';
import {units as papers} from '../data/ec26_textbook_mock.js';
import {state} from '../js/state.js';
import {finishQuestion,checkSuji} from '../js/views/quiz.js';
import {examTotal,examBreakdown} from '../js/mock-exam.js';
import {examResultHtml} from '../js/views/results.js';
import {snapshotSession,restoreSession} from '../js/session.js';
import {createLocalStorage} from './helpers/env.js';

test('教科書写真の6分野は練習60問・固定模擬34問100点で全分野をカバー',()=>{
 assert.deepEqual(practice.map(u=>u.questions.length),Array(6).fill(10));
 assert.equal(new Set(practice.flatMap(u=>u.questions).map(q=>q.sourceImage)).size,6);
 assert.ok(practice.every(u=>u.lesson.length===3));
 const paper=papers[0];assert.equal(paper.questions.length,34);
 assert.deepEqual([2,3,4].map(p=>paper.questions.filter(q=>q.points===p).length),[10,16,8]);
 assert.deepEqual(examBreakdown(session()).map(g=>g.total),[18,18,17,15,15,17]);
 for(const u of practice){
  const selected=paper.questions.filter(q=>q.sourceStage===u.id);assert.ok(selected.length);
  for(const {points,examSection,sourceStage,...q} of selected){
   assert.equal(examSection,u.title);assert.ok(u.questions.some(p=>JSON.stringify(p)===JSON.stringify(q)));
  }
 }
});
function calc(n,i,v,d=0){
 const scale=10**d;assert.equal(Number(practice[n-1].questions[i].a[0]),Math.round(v*scale+1e-8)/scale,`ec26t${n}-${i}`);
}
test('写真の数値から熱量・電力・抵抗率・導電率・容量の26問を独立計算',()=>{
 calc(1,1,10**2*10*20*60);calc(1,2,2**2*5*30*60);calc(1,3,20**2/10*3600);
 calc(1,6,10*4190*(80-20));calc(1,7,.001*390*(1025-25));calc(1,8,10+(2**2*100*20*60)/(5*4190),2);
 calc(2,1,5**2*10);calc(2,2,100/6,2);calc(2,3,100*6);calc(2,4,100**2/5);calc(2,5,100/100);
 calc(2,6,1000/5);calc(2,7,1000*3600);calc(2,8,100*5*(2*3600+15*60));calc(2,9,(100**2/100)*2/1000,1);
 calc(3,4,1.72e-8*100/(3.14*(.002/2)**2),3);calc(3,5,1.72e-8*400/(3.14*(.001/2)**2),2);
 calc(3,6,50*(2/1.6)**2,3);calc(3,7,3/.5);calc(3,9,(1/1.62e-8)/58e6*100,2);
 calc(4,6,1.5,1);calc(5,4,2);calc(6,1,60/10);calc(6,2,3.5/.7);calc(6,3,10*20);calc(6,5,1.2,1);
 assert.equal(practice.flatMap(u=>u.questions).filter(q=>q.type==='suji').length,26);
});
function dom(){
 const node=()=>({innerHTML:'',textContent:'',value:'',disabled:false,className:'',classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
 const nodes={fb:node(),nextWrap:node(),inputAns:node(),sujiCheck:node()};
 globalThis.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({...node(),firstChild:node()})};
 globalThis.localStorage=createLocalStorage();return nodes;
}
function session(){return {sid:'ec26mock2',mode:'stage',title:papers[0].title,i:0,startIndex:0,list:papers[0].questions.map((q,i)=>({...q,_key:`ec26mock2-${i}`})),correct:0,score:0,combo:20,maxCombo:20,feverGauge:0,feverLeft:3,feverCount:0,weakHits:0,wrongThisRun:[]};}
test('追加模擬の全正解・全誤答・混合配点、二重採点防止、保存再開と復習リンク（DOMスタブ）',()=>{
 const nodes=dom();
 for(const scenario of ['correct','wrong','mixed']){
  const c=state.cur=session();state.settings.timeAttack=true;let expected=0;
  for(let i=0;i<c.list.length;i++){
   c.i=i;c._locked=false;c._timeLeft=30;c._timeLimit=30;
   const correct=scenario==='correct'||scenario==='mixed'&&i%2===0;
   if(correct)expected+=c.list[i].points;
   if(c.list[i].type==='suji'){nodes.inputAns.value=correct?c.list[i].a[0]:'999999';checkSuji(c.list[i]);}
   else finishQuestion(correct,c.list[i]);
   finishQuestion(correct,c.list[i]);assert.equal(c.score,expected);
   assert.ok(!nodes.fb.innerHTML.includes(c.list[i].exp));assert.doesNotMatch(nodes.fb.innerHTML,/⭕|❌|正解：/);
   const saved=restoreSession(snapshotSession(c));assert.equal(saved.score,c.score);assert.ok(saved._locked);
   assert.equal(saved.i,i);assert.equal(saved.wrongThisRun.length,c.wrongThisRun.length);
  }
  const saved=restoreSession(snapshotSession(c));assert.equal(examTotal(saved),100);
  assert.equal(examBreakdown(saved).reduce((n,g)=>n+g.earned,0),expected);
  const html=examResultHtml(saved);assert.equal((html.match(/<details>/g)||[]).length,34);
  for(const g of examBreakdown(saved))if(g.earned<g.total)assert.ok(html.includes(`#/stage/${g.sourceStage}/1`));
 }
});
