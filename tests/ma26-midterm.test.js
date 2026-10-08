import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {units as practice} from '../data/ma26_midterm.js';
import {units as papers} from '../data/ma26_mock.js';
import {QUESTIONS} from '../js/content.js';
import {mathADiagram} from '../js/ma26-display.js';
import {testPrepCategories,renderTestPrepPanel} from '../js/views/home.js';
import {isMockExam,examTotal,examBreakdown,examNumericMatch} from '../js/mock-exam.js';
import {snapshotSession,restoreSession} from '../js/session.js';
import {state} from '../js/state.js';
import {finishQuestion,answer,renderSavedAnswer} from '../js/views/quiz.js';
import {examResultHtml} from '../js/views/results.js';
import {createLocalStorage} from './helpers/env.js';
const cases=JSON.parse(readFileSync(new URL('./fixtures/ma26-math-cases.json',import.meta.url)));
const val=s=>{const [n,d=1]=String(s).split('/').map(Number);return n/d;};
const correct=q=>q.type==='yon'?q.choices[q.a]:q.a[0];
function tuples(values,n){let rows=[[]];for(let i=0;i<n;i++)rows=rows.flatMap(row=>values.map(x=>[...row,x]));return rows;}
function permutations(xs){if(!xs.length)return [[]];return xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>j!==i)).map(r=>[x,...r]));}
function draws(xs,k){if(!k)return [[]];return xs.flatMap((x,i)=>draws(xs.filter((_,j)=>j!==i),k-1).map(r=>[x,...r]));}
const range=n=>Array.from({length:n},(_,i)=>i+1);
const probability=(rows,predicate)=>rows.filter(predicate).length/rows.length;
function rpsRemaining(hands){
 const different=new Set(hands);
 if(different.size===1||different.size===3)return hands.map((_,i)=>i);
 return hands.map((h,i)=>hands.some(x=>(h+1)%3===x)?i:-1).filter(i=>i>=0);
}
function solve(s){
 switch(s.kind){
 case 'positiveComposition':return tuples(range(s.sum),3).filter(r=>r.reduce((a,b)=>a+b,0)===s.sum).length;
 case 'redAtLeast':return probability(tuples(range(s.sides),s.n),r=>r.filter(v=>v<=s.red).length>=s.min);
 case 'weightedCards':{const cards=range(5).flatMap(n=>Array(n).fill(n));return cards.reduce((v,n)=>v+100*n-(n===5?1000:0),0)/cards.length;}
 case 'prizeDraw':return probability(draws(range(10),3),r=>s.event==='atLeast'?r.some(v=>v<=4):r.filter(v=>v===1).length===1&&r.filter(v=>v>=2&&v<=4).length===1&&r.filter(v=>v>=5).length===1);
 case 'coinDice':return probability(tuples([0,1],1).flatMap(a=>range(6).map(b=>[...a,b])),([a,b])=>a===1&&b>=s.threshold);
 case 'bags':{const A=[...Array(s.r1).fill('r'),...Array(s.w1).fill('w')],B=[...Array(s.r2).fill('r'),...Array(s.w2).fill('w')];return probability(A.flatMap(a=>B.map(b=>[a,b])),([a,b])=>s.same?a===b:a==='r'&&b==='r');}
 case 'atLeastDie':return probability(tuples(range(6),s.n),r=>r.includes(1));
 case 'binomial':return probability(tuples(range(s.sides),s.n),r=>r.filter(v=>v===1).length===s.r);
 case 'nthRed':return probability(tuples(range(3),s.n),r=>r.at(-1)===1&&r.filter(v=>v===1).length===s.r);
 case 'walk':return probability(tuples([s.pos,-s.neg],s.n),r=>r.reduce((a,b)=>a+b,0)===0);
 case 'conditionalCards':{const rows=range(s.total).filter(n=>s.reverse?n%2===0:n<=s.blue);return probability(rows,n=>n<=s.blue&&n%2===0);}
 case 'conditionalPercent':return s.joint/s.share;
 case 'conditionalDice':return probability(tuples(range(6),2).filter(([a,b])=>a+b>=s.min),([a])=>a===6);
 case 'lottery':return probability(draws(range(s.n),2),([a,b])=>({both:a<=s.r&&b<=s.r,firstOnly:a<=s.r&&b>s.r,secondOnly:a>s.r&&b<=s.r,neither:a>s.r&&b>s.r,second:b<=s.r}[s.event]));
 case 'diceExpectation':{const rows=tuples(range(6),s.n);return rows.reduce((n,r)=>n+r.reduce((a,b)=>a+b,0),0)/rows.length;}
 case 'coinProfit':{const rows=tuples([0,1],s.n);return rows.reduce((n,r)=>n+50*r.filter(Boolean).length-s.fee,0)/rows.length;}
 case 'ballProfit':{const rows=draws(range(s.red+s.white),s.k);return rows.reduce((n,r)=>n+s.reward*r.filter(v=>v<=s.red).length-s.fee,0)/rows.length;}
 case 'prizes':return s.prizes.flatMap(([v,n])=>Array(n).fill(v)).reduce((a,b)=>a+b,0)/s.n;
 case 'compareDice':return range(6).reduce((n,d)=>n+d*s.scale,0)/6-s.fixed;
 case 'coinPoints':{const rows=tuples([0,1],s.n);return rows.reduce((n,r)=>n+(s.prizes[r.filter(Boolean).length]||0),0)/rows.length;}
 case 'threeDigits':return tuples(range(s.digits).map(v=>v-1),3).filter(r=>r[0]!==0&&new Set(r).size===3).length;
 case 'rankDigits':return tuples([0,1,2,3,4,5],3).filter(r=>r[0]!==0&&new Set(r).size===3).map(r=>100*r[0]+10*r[1]+r[2]).sort((a,b)=>a-b)[s.rank-1];
 case 'circleOpposite':return permutations(range(s.children+1)).filter(row=>row[2]===1).length;
 case 'circleSeparated':return permutations(range(s.children+1)).filter(row=>row[1]===1||row[3]===1).length;
 case 'pairedDigits':return tuples([0,1,2,3,4,5,6,7,8,9],4).filter(r=>new Set(r).size===2&&r.filter(x=>x===r[0]).length===2).length;
 case 'ascendingDigits':return tuples([0,1,2,3,4,5,6,7,8,9],4).filter(r=>r.every((v,i)=>i===0||v>r[i-1])).length;
 case 'derangement':return permutations(range(s.n)).filter(row=>row.every((v,i)=>v!==i+1)).length;
 case 'rooms':return tuples([0,1],s.n).length;
 case 'groups':return tuples([0,1],s.n).filter(row=>row[0]===0&&row.includes(1)).length;
 case 'composition':return tuples([0,...range(s.sum)],3).filter(r=>r.reduce((a,b)=>a+b,0)===s.sum).length;
 case 'rpsOne':return probability(tuples([0,1,2],3),r=>{const remaining=rpsRemaining(r);if(s.event==='Aonly')return remaining.length===1&&remaining[0]===0;if(s.event==='allDifferent')return new Set(r).size===3;if(s.event==='draw')return remaining.length===3;return remaining.length===2;});
 case 'maxDice':return probability(tuples(range(6),s.n),r=>s.exact?Math.max(...r)===s.m:Math.max(...r)<=s.m);
 case 'quizExpectation':{const rows=tuples(range(s.sides),s.n);return rows.reduce((n,r)=>n+r.filter(v=>v===1).length,0)/rows.length;}
 case 'rpsThree':{let distribution={3:1};let end=0;for(let round=1;round<=3;round++){const next={};end=0;for(const [count,p] of Object.entries(distribution)){const n=Number(count),rows=tuples([0,1,2],n);for(const r of rows){const left=rpsRemaining(r).length;if(left===1)end+=p/rows.length;else next[left]=(next[left]||0)+p/rows.length;}}distribution=next;}return end;}
 case 'mixedBag':{const A=range(s.ar+s.aw),B=range(s.br+s.bw),rows=A.flatMap(a=>B.flatMap(b=>[{red:a<=s.ar,origin:'A'},{red:b<=s.br,origin:'B'}]));return probability(rows.filter(r=>r.red),r=>r.origin==='A');}
 case 'transfer':{let p=0;const A=range(s.aw+s.ab),B=range(s.bw+s.bb).map(v=>({white:v<=s.bw}));for(const a of A){const aw=a<=s.aw;const extended=[...B,{white:aw}];for(const b of extended){if(s.same?aw===b.white:!aw&&b.white)p+=1/A.length/extended.length;}}return p;}
 case 'allRed':return probability(draws(range(s.r+s.w),s.k),r=>r.every(x=>x<=s.r));
 case 'swap':{let configs=range(s.aw+1).map(b=>({b,A:range(s.aw+1).filter(x=>x!==b),p:1/(s.aw+1)}));for(let k=0;k<s.steps;k++)configs=configs.flatMap(c=>c.A.map((a,i)=>({b:a,A:c.A.map((x,j)=>j===i?c.b:x),p:c.p/c.A.length})));return configs.filter(c=>c.b===1).reduce((n,c)=>n+c.p,0);}
 case 'internal':{const x=s.length*s.m/(s.m+s.n);assert.ok(Math.abs(x/(s.length-x)-s.m/s.n)<1e-10);return x;}
 case 'external':{const x=s.length*s.m/(s.m-s.n);assert.ok(Math.abs(x/(x-s.length)-s.m/s.n)<1e-10);return x;}
 case 'parallel':return s.bc*(s.ap/s.ab);
 case 'bisectorInner':{assert.ok(s.ab+s.ac>s.bc&&Math.abs(s.ab-s.ac)<s.bc,'三角形成立条件');const x=s.bc*s.ab/(s.ab+s.ac);assert.ok(Math.abs(x/(s.bc-x)-s.ab/s.ac)<1e-10);return s.ratio?x/(s.bc-x):x;}
 case 'bisectorOuter':{assert.ok(s.ab+s.ac>s.bc&&Math.abs(s.ab-s.ac)<s.bc,'三角形成立条件');const dc=s.bc*s.ac/(s.ab-s.ac);const bd=dc+s.bc;assert.ok(Math.abs(bd/dc-s.ab/s.ac)<1e-10);return s.target==='BD'?bd:dc;}
 case 'circumAngles':{const x=90-s.b-s.c;assert.ok(x>0);assert.equal((s.b+x)+(s.b+s.c)+(s.c+x),180);return x;}
 case 'rightRadius':return s.bc/2;
 case 'centralBase':return (180-s.angle)/2;
 case 'equalRadiusAngle':return 180-2*s.base;
 case 'bayes':{const products=[...Array(s.a).fill(s.da),...Array(s.b).fill(s.db)];const defects=products.reduce((n,r)=>n+r,0);return s.posterior?s.a*s.da/defects:defects/(products.length*100);}
 case 'monty':{
   const rows=tuples([0,1,2],2),stay=probability(rows,([prize,pick])=>prize===pick),change=1-stay;
   switch(s.event){case 'stay':return stay;case 'switch':return change;case 'ratio':return change/stay;case 'initialWin':return 0;case 'initialLose':return 1;case 'count':return rows.filter(([p,c])=>p!==c).length;case 'random':return (stay+change)/2;case 'unaware':{const possible=tuples([0,1,2],1).flatMap(([prize])=>[1,2].map(open=>({prize,open}))).filter(r=>r.prize!==r.open);return probability(possible,r=>r.prize!==0);}case 'four':return probability(tuples([0,1,2,3],2),([p,c])=>p!==c);case 'difference':return change-stay;}
 }
 default:throw Error('unknown verification kind '+s.kind);
 }
}
test('数学Aの全140練習正答を全列挙・期待値集計・比の検算で確認',()=>{
 assert.equal(cases.length,140);
 for(const c of cases){const [sid,index]=c.key.split('-');const q=practice.find(u=>u.id===sid).questions[Number(index)];assert.equal(correct(q),c.answer,c.key);assert.ok(Math.abs(solve(c.spec)-val(c.answer))<1e-9,`${c.key}: ${c.answer} / computed ${solve(c.spec)}`);if(q.type==='yon'){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices.map(val)).size,4,c.key);}}
});
test('通常120問・発展20問・図形4ステージ40問と範囲分離',()=>{
 assert.equal(practice.length,14);assert.ok(practice.every(u=>u.questions.length===10));
 assert.equal(practice.slice(0,12).flatMap(u=>u.questions).length,120);
 assert.ok(practice.slice(8,12).flatMap(u=>u.questions).every(q=>q.maDiagram));
 assert.ok(practice.slice(12).every(u=>u.group.includes('発展')));
 assert.ok(practice.flatMap(u=>u.questions).every(q=>q.examPractice));
 for(const q of practice.flatMap(u=>u.questions).filter(q=>q.type==='suji'))assert.ok(q.a.every(a=>/^-?\d+(?:\.\d+)?$/.test(a)));
});
test('模試は独立した固定34問100点・全12通常分野に復習リンク',()=>{
 const list=papers[0].questions;assert.equal(list.length,34);assert.equal(examTotal({list}),100);
 assert.deepEqual([2,3,4].map(p=>list.filter(q=>q.points===p).length),[10,16,8]);assert.equal(new Set(list.map(q=>q.sourceStage)).size,12);
 for(const q of list){const u=practice.find(u=>u.id===q.sourceStage);assert.ok(u);assert.ok(!u.group.includes('発展'));assert.ok(QUESTIONS[q.sourceStage]);assert.ok(u.questions.some(p=>p.q===q.q&&correct(p)===correct(q)));assert.ok(!q.hint);}
});
test('数学Aの入口・期間表示・通常カードの維持',()=>{
 const item=date=>testPrepCategories(date).find(c=>c.subject==='📐 数学A');
 assert.ok(item('2026-10-08').keepSubject);assert.equal(item('2026-10-08').status,'これからのテスト');
 for(const date of ['2026-10-13','2026-10-19'])assert.equal(item(date).status,'テスト期間中');
 assert.equal(item('2026-10-20').status,'過去のテスト');assert.ok(renderTestPrepPanel('2026-10-08').includes(item('2026-10-08').href));
});
test('図形は条件だけのSVG、未知の図は空、ラベルはHTMLエスケープ',()=>{
 for(const q of practice.slice(8,12).flatMap(u=>u.questions)){const html=mathADiagram(q.maDiagram);assert.match(html,/<svg/);assert.match(html,/role="img"/);assert.doesNotMatch(html,/正解|答え：/);}
 assert.equal(mathADiagram(), '');assert.equal(mathADiagram({kind:'unknown'}),'');assert.doesNotMatch(mathADiagram({kind:'inner',labels:['<script>']}),/<script>/);
});
function session(){return {sid:'ma26mock1',mode:'stage',title:papers[0].title,i:0,startIndex:0,list:papers[0].questions.map((q,i)=>({...q,_key:`ma26mock1-${i}`})),correct:0,score:0,combo:0,maxCombo:0,feverGauge:0,feverLeft:0,feverCount:0,weakHits:0,wrongThisRun:[]};}
function dom(){const node=()=>({innerHTML:'',textContent:'',className:'',classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});const nodes={fb:node(),nextWrap:node()};globalThis.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({...node(),firstChild:node()})};globalThis.localStorage=createLocalStorage();return nodes;}
test('数学A模試の実採点・二重回答・ボーナス無効・正解非表示',()=>{
 const nodes=dom();for(const mode of ['all','none','mixed']){const c=state.cur=session();state.settings.timeAttack=true;c.combo=20;c.feverLeft=3;c._timeLeft=30;c._timeLimit=30;let expected=0;
 for(let i=0;i<c.list.length;i++){c.i=i;c._locked=false;const ok=mode==='all'||mode==='mixed'&&i%2===0;finishQuestion(ok,c.list[i]);expected+=ok?c.list[i].points:0;finishQuestion(ok,c.list[i]);assert.equal(c.score,expected);assert.doesNotMatch(nodes.fb.innerHTML,/⭕|❌|正解：/);assert.ok(!nodes.fb.innerHTML.includes(c.list[i].exp));}
 assert.equal(c.score,expected);if(mode==='all')assert.equal(c.score,100);if(mode==='none')assert.equal(c.score,0);
 const restored=restoreSession(snapshotSession(c));assert.equal(restored.score,c.score);assert.equal(examBreakdown(restored).reduce((n,g)=>n+g.earned,0),c.score);assert.ok(isMockExam(restored));
 const html=examResultHtml(restored);assert.equal((html.match(/<details>/g)||[]).length,34);if(mode!=='all')assert.match(html,/この分野を復習/);assert.match(html,/data-ma-diagram/);
 }
});
test('途中回答の保存再開・部分開始・単問の満点・選択肢の色非表示',()=>{
 const nodes=dom();const c=state.cur=session();c.i=4;finishQuestion(false,c.list[4]);const restored=restoreSession(snapshotSession(c));assert.equal(restored.i,4);assert.ok(restored._locked);state.cur=restored;renderSavedAnswer(restored.list[4]);assert.ok(!nodes.fb.innerHTML.includes(restored.list[4].exp));
 assert.equal(examTotal({...c,startIndex:10}),c.list.slice(10).reduce((n,q)=>n+q.points,0));assert.equal(examTotal({...c,mode:'practice',list:[c.list[0]],startIndex:0}),2);
 const fresh=state.cur=session();let leaks=0;const choice={dataset:{i:'0'},classList:{add(name){if(['correct','wrong'].includes(name))leaks++;}}};document.querySelectorAll=selector=>selector==='[data-i]'?[choice]:[];fresh.shuffledCorrect=0;answer(true,choice,0);assert.equal(leaks,0);
 for(const a of ['7','７','7.0'])assert.ok(examNumericMatch(a,['7']));for(const a of ['7abc','7/2','7.2','Infinity',''])assert.equal(examNumericMatch(a,['7']),false);
});
