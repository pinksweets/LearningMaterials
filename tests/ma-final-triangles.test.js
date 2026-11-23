import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units} from '../data/ma_final_triangles.js';

const answer=q=>q.type==='suji'?Number(q.a[0]):q.type==='maru'?q.a:q.choices[q.a];
const distance=(A,B)=>Math.hypot(A[0]-B[0],A[1]-B[1]);
const ratio=s=>{const [a,b]=s.split('：').map(Number);return a/b;};
const near=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-8,`${message}: ${actual} / ${expected}`);
const cross=(A,B,C)=>(B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]);
function correctRatio(index,qIndex,expected){near(ratio(answer(units[index].questions[qIndex])),expected,`${units[index].id}-${qIndex}`);}

test('数学A期末：内心・重心・チェバ・メネラウスは各10問で、解き方3段階とレッスンを備える',()=>{
  assert.deepEqual(units.map(u=>u.id),['mafs1','mafs2','mafs3','mafs4']);
  assert.deepEqual(units.map(u=>u.page),['53','54','55','56']);
  assert.ok(units.every(u=>u.questions.length===10&&u.lesson.length===3));
  assert.equal(new Set(units.map(u=>u.order)).size,4);
  for(const u of units)for(const [i,q] of u.questions.entries()){
    assert.equal(q.examPractice,true,`${u.id}-${i}`);
    for(const step of ['①','②','③'])assert.ok(q.exp.includes(step),`${u.id}-${i}: ${step}`);
    if(q.type==='yon'){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);}
    if(q.maDiagram)for(const point of Object.values(q.maDiagram.points)){
      assert.ok(point.every(Number.isFinite));assert.ok(point[0]>=20&&point[0]<=480);assert.ok(point[1]>=20&&point[1]<=280);
    }
  }
});

test('数学A期末：内心の正答を内角の和と二等分から独立計算する',()=>{
  const q=units[0].questions;
  const expected=[
    180-(180-48)/2,
    180-2*(180-128),
    180-(180-64)/2,
    180-22-31,
    (180-54-28*2)/2,
    (180-72-46)/2,
    3.5,
    116-90,
    '3つの内角の二等分線',
    false
  ];
  q.forEach((question,i)=>assert.equal(answer(question),expected[i],`mafs1-${i}`));
  assert.match(q[3].q,/∠ABI＝22°、∠ACI＝31°/);
  assert.match(q[6].q,/垂線の足/);
  assert.match(q[9].exp,/3辺からの距離/);
});

test('数学A期末：重心と中点を座標および相似で検算する',()=>{
  const q=units[1].questions;
  const A=[0,6],B=[-3,0],C=[6,0],F=[1.5,0],G=[1,2],D=[-1.5,3],E=[0.75,3];
  near(distance(A,G)/distance(G,F),2,'重心の中線比');
  near(cross(A,F,E),0,'Eは中線上');
  near(D[1]-E[1],0,'DE∥BC');
  const expected=[12/2,4*2,21*2/3,10*3/2,18/2,'2：1',24*2/3,12*3/2*(2/3-1/2),'3：1','3本の中線'];
  q.forEach((question,i)=>{
    if(typeof expected[i]==='number')near(answer(question),expected[i],`mafs2-${i}`);
    else assert.equal(answer(question),expected[i],`mafs2-${i}`);
  });
  near(ratio(answer(q[8])),distance(A,E)/distance(E,G),'AE:EGの座標検算');
});

test('数学A期末：チェバの未知の比・長さを検算し、図の3本が1点で交わる',()=>{
  const q=units[2].questions;
  correctRatio(2,0,1/((3/2)*(2/5)));
  correctRatio(2,1,1/((2/3)*(3/4)));
  correctRatio(2,2,1/(1*(3/5)));
  correctRatio(2,3,1/((4/5)*(5/6)));
  near(answer(q[4]),(6/9)*(4/8)*3,'mafs3-4');
  const bpPc=1/((2/3)*(3/4));near(answer(q[5]),21*bpPc/(1+bpPc),'mafs3-5');
  const arRb=1/((3/2)*(4/5));near(answer(q[6]),22*arRb/(1+arRb),'mafs3-6');
  assert.equal(answer(q[7]),Math.abs((2/3)*(3/4)*2-1)<1e-10);
  assert.equal(answer(q[8]),'(BP/PC)×(CQ/QA)×(AR/RB)＝1');
  correctRatio(2,9,1/((4/5)*(5/6)));
  for(const [i,question] of q.entries()){
    const {A,B,C,P,Q,R,O}=question.maDiagram.points;
    for(const [U,V] of [[A,P],[B,Q],[C,R]])near(cross(U,V,O),0,`mafs3-${i}の共点`);
    near((distance(B,P)/distance(P,C))*(distance(C,Q)/distance(Q,A))*(distance(A,R)/distance(R,B)),1,`mafs3-${i}の比の積`);
  }
});

test('数学A期末：メネラウスは延長上の全体の長さと横断線上の比も検算する',()=>{
  const q=units[3].questions;
  correctRatio(3,0,1/(((4+3)/3)*(1/2)));
  correctRatio(3,1,1/(((5+2)/2)*(2/7)));
  correctRatio(3,2,1/(((12+8)/8)*(2/3)));
  correctRatio(3,3,1/((18/6)*(1/2)));
  near(answer(q[4]),6/((3/4)*(2/3))-6,'mafs4-4');
  correctRatio(3,5,1/(((2+1)/1)*(1/2)));
  correctRatio(3,6,(2/3)*((5+2)/2));
  correctRatio(3,7,(1/4)*((3+2)/2));
  assert.equal(answer(q[8]),7+5);
  assert.equal(answer(q[9]),'メネラウスの定理');
  for(let i=0;i<6;i++){
    const {A,B,C,P,Q,R}=q[i].maDiagram.points;
    near(cross(B,C,P),0,`mafs4-${i}: BCP`);near(cross(R,Q,P),0,`mafs4-${i}: RQP`);
    assert.ok(P[0]>C[0]&&C[0]>B[0]);
    near((distance(B,P)/distance(P,C))*(distance(C,Q)/distance(Q,A))*(distance(A,R)/distance(R,B)),1,`mafs4-${i}の比の積`);
  }
  for(let i=6;i<8;i++){
    const {A,B,C,P,Q,R}=q[i].maDiagram.points;
    near(cross(A,Q,B),0,`mafs4-${i}: AQB`);near(cross(P,Q,R),0,`mafs4-${i}: PQR`);
    near(distance(P,Q)/distance(Q,R),ratio(answer(q[i])),`mafs4-${i}の横断線座標比`);
  }
});
