import { test } from 'node:test';
import assert from 'node:assert/strict';
import { units } from '../data/qi_quadratic_inequalities.js';
import { displayStagesOfSubject, MATH1_SUBJECT } from '../js/content.js';
import { lessonCardsHtml } from '../js/lesson.js';
import { quadraticFacts, graphSvg } from '../js/math-display.js';
import { snapshotSession, restoreSession } from '../js/session.js';

test('2次不等式は基礎から応用まで10単元各10問、全単元に解説・図・確認がある',()=>{
  assert.equal(units.length,10);
  for(const u of units){
    assert.equal(u.questions.length,10);
    assert.ok(displayStagesOfSubject(MATH1_SUBJECT).includes(u.id));
    assert.equal(u.lesson.length,3);
    assert.match(u.lesson[2].body,/確認/);
    const html=lessonCardsHtml(u.lesson,{math:true});
    assert.match(html,/<svg/);
    assert.doesNotMatch(html,/NaN|Infinity/);
    for(const q of u.questions){
      assert.equal(q.choices.length,4);
      assert.equal(new Set(q.choices).size,4);
      assert.ok(q.exp.length>0);
    }
  }
});

// 解答の範囲を読み取り、元の式への代入で照合する。教材の解法・判別式を流用しない。
function value(s){
  if(s.includes('/')){const [a,b]=s.split('/');return value(a)/value(b);}
  const root=/^(−?\d*)√(\d+)$/.exec(s);
  if(root)return (root[1]===''?1:root[1]==='−'?-1:Number(root[1].replace('−','-')))*Math.sqrt(Number(root[2]));
  const sum=/^(.+)([＋−])(.+)$/.exec(s);
  if(sum)return value(sum[1])+(sum[2]==='＋'?1:-1)*value(sum[3]);
  const n=Number(s.replace('−','-'));assert.ok(Number.isFinite(n),s);return n;
}
function compare(a,op,b){const d=a-b;return op==='＜'?d < -1e-9:op==='＞'?d>1e-9:op==='≤'?d<=1e-9:op==='≥'?d>=-1e-9:op==='≠'?Math.abs(d)>1e-9:Math.abs(d)<=1e-9;}
function answerContains(answer,x){
  if(answer==='解なし')return false;
  if(answer==='すべての実数')return true;
  return answer.replace(/ cm$/,'').split(' または ').some(part=>{
    const tokens=part.split(/([＜＞≤≥＝≠])/);
    for(let i=1;i<tokens.length;i+=2){
      const v=t=>t==='x'||t==='m'||t==='k'?x:value(t);
      if(!compare(v(tokens[i-1]),tokens[i],v(tokens[i+1])))return false;
    }
    assert.ok(tokens.length>=3,part);return true;
  });
}
const poly=(a,b,c,op)=>x=>compare(a*x*x+b*x+c,op,0);
const both=(...predicates)=>x=>predicates.every(p=>p(x));
const cases=[
  ['qi1',9,poly(1,-5,6,'≤')],
  ['qi2',3,poly(1,-5,6,'＞')],['qi2',4,poly(1,-5,6,'≥')],
  ['qi2',5,poly(1,-1,-6,'＜')],['qi2',6,poly(1,0,-4,'≤')],
  ['qi2',7,poly(-1,5,-6,'＞')],['qi2',8,poly(-1,5,-6,'≤')],['qi2',9,poly(2,-8,6,'＜')],
  ['qi3',6,poly(1,-2,-1,'＜')],['qi3',9,poly(1,-2,-1,'≥')],
  ['qi4',2,poly(3,-2*Math.sqrt(3),1,'≤')],
  ...['＜','≤','＞','≥'].map((op,i)=>['qi4',i+3,poly(1,-4,4,op)]),
  ...['≥','＜','≤'].map((op,i)=>['qi4',i+7,poly(-1,4,-4,op)]),
  ['qi5',2,poly(1,-3,5,'＞')],['qi5',3,poly(1,-3,5,'≤')],
  ['qi5',6,poly(-1,3,-5,'＞')],['qi5',7,poly(-1,3,-5,'＜')],
  // パラメータ問題は平方完成した最小値・最大値で独立検証。
  ['qi6',3,m=>compare(1-m*m/8,'≤',0)],['qi6',4,m=>compare(1-m*m/8,'＜',0)],
  ['qi6',7,m=>compare(3-m*m,'≤',0)],['qi6',9,m=>compare(4-m*m/4,'＜',0)],
  ['qi7',3,m=>compare(m+2-m*m,'＞',0)],['qi7',5,m=>compare(m+2-m*m,'≥',0)],
  ['qi7',7,m=>compare(m+m*m/4,'＜',0)],['qi7',8,m=>compare(m+m*m/4,'≤',0)],
  ['qi7',9,k=>compare(k-1,'＞',0)],
  ['qi8',1,poly(1,0,-4,'＞')],['qi8',2,poly(1,-3,-4,'≤')],
  ['qi8',3,both(poly(1,0,-4,'＞'),poly(1,-3,-4,'≤'))],
  ['qi8',4,both(poly(1,-5,4,'≤'),poly(1,-2,-3,'＞'))],
  ['qi8',5,both(poly(1,1,0,'＞'),poly(3,5,-2,'≤'))],
  ['qi8',6,x=>compare(x*x+3*x,'≥',-2)&&compare(x*x+3*x,'≤',4)],
  ['qi8',7,x=>compare(x*x-4*x,'＞',5)&&compare(x*x-4*x,'≤',6-3*x)],
  ['qi8',8,x=>(x < -2||x>2)&&x>=-1&&x<=1],['qi8',9,both(poly(1,0,-4,'≤'),x=>x>=2)],
  ['qi9',1,x=>x>0&&x<=8-x],['qi9',3,x=>compare(x*(8-x),'≥',12)],
  ['qi9',4,x=>x>0&&x<=8-x&&compare(x*(8-x),'≥',12)],
  ['qi9',6,x=>x>0&&12-2*x>=6],
  ['qi9',9,x=>x>0&&12-2*x>=6&&compare(4*x*(12-2*x),'≥',40)],
  ['qi10',3,m=>compare(-m*m-m+6,'＜',0)],
  ['qi10',5,m=>{const r=m*m+m-6;return r>1e-9&&m-Math.sqrt(r)>1e-9;}],
  ['qi10',7,m=>{const r=m*m-m-6;return r>1e-9&&-m+Math.sqrt(r)<-1e-9;}],
  ['qi10',9,both(poly(-1,4,-4,'≥'),x=>x>3)]
];
test('全49問の範囲解を、元の式への代入・境界・境界の両側で独立検算',()=>{
  assert.equal(cases.length,49);
  const boundaries=[-4,-3,-2,-1,0,1,2,3,4,5,6,1/3,Math.sqrt(3)/3,
    1-Math.sqrt(2),1+Math.sqrt(2),-Math.sqrt(3),Math.sqrt(3),-2*Math.sqrt(2),2*Math.sqrt(2)];
  const samples=[...Array.from({length:1601},(_,i)=>-20+i/40),...boundaries.flatMap(x=>[x-1e-4,x,x+1e-4])];
  for(const [sid,i,predicate] of cases){
    const q=units.find(u=>u.id===sid).questions[i];
    for(const x of samples)assert.equal(answerContains(q.choices[q.a],x),predicate(x),`${sid}-${i}: ${q.q} / ${x}`);
  }
});

test('平方根を含む重解は1共有点、実際の小さい正負の判別式は区別する',()=>{
  const s={a:3,b:-2*Math.sqrt(3),c:1};
  assert.equal(quadraticFacts(s).roots.length,1);
  assert.match(graphSvg(s),/共有点は1個/);
  assert.equal(quadraticFacts({a:1,b:0,c:1e-20}).roots.length,0);
  assert.equal(quadraticFacts({a:1,b:0,c:-1e-20}).roots.length,2);
  assert.equal(quadraticFacts({a:1,b:2,c:1+1e-10}).roots.length,0);
});

test('新単元の回答済みセッションを位置キーで復元できる',()=>{
  const u=units[7];
  const session={sid:u.id,mode:'stage',title:u.title,list:u.questions.map((q,i)=>({...q,_key:`${u.id}-${i}`})),
    i:3,correct:2,score:20,combo:0,maxCombo:2,wrongThisRun:[],feverGauge:0,feverLeft:0,feverCount:0,weakHits:0,
    answer:{correct:true,correctText:u.questions[3].choices[0]}};
  const restored=restoreSession(snapshotSession(session));
  assert.equal(restored.list[3]._key,'qi8-3');
  assert.equal(restored.list[3].q,u.questions[3].q);
  assert.equal(restored._locked,true);
  assert.equal(restored.score,20);
});
