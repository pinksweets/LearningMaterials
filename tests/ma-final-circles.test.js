import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units} from '../_site/data/ma_final_circles.js';

const answer=q=>q.type==='yon'?q.choices[q.a]:q.type==='maru'?q.a:Number(q.a[0]);
const descending=(values,names)=>values.map((v,i)=>({v,name:names[i]})).sort((a,b)=>b.v-a.v).map(x=>x.name).join(' ＞ ');
const triangleExists=sides=>Math.max(...sides)*2<sides.reduce((a,b)=>a+b,0);
const angleOrder=(a,b,c)=>{
  if(a===b&&c>a)return '∠C ＞ ∠A＝∠B';
  return descending([a,b,c],['∠A','∠B','∠C']);
};

test('期末の辺角・円の3分野は各10問・3枚の解き方レッスンを持つ',()=>{
  assert.deepEqual(units.map(u=>u.id),['mafs5','mafs6','mafs7']);
  for(const u of units){
    assert.equal(u.questions.length,10);
    assert.equal(u.lesson.length,3);
    assert.equal(u.subject,'📐 数学A');
    assert.ok(!u.id.includes('-'));
    for(const q of u.questions){
      assert.equal(q.examPractice,true);
      assert.match(q.exp,/①.+②.+③/s);
      assert.ok(['yon','maru','suji','ana'].includes(q.type));
      if(q.type==='yon'){
        assert.equal(q.choices.length,4);
        assert.equal(new Set(q.choices).size,4);
        assert.ok(Number.isInteger(q.a)&&q.a>=0&&q.a<4);
      }
    }
  }
});

test('辺と角・成立条件の全10問を内角和と厳密な三角不等式で検算',()=>{
  const allowedIntegers=(a,b)=>Array.from({length:a+b},(_,i)=>i).filter(x=>triangleExists([a,b,x]));
  const expected=[
    angleOrder(5,8,6),
    angleOrder(4,4,7),
    descending([48,67,180-48-67],['a','b','c']),
    72>54&&54===180-72-54?'a ＞ b＝c':'error',
    triangleExists([3,6,8]),
    triangleExists([2,5,7]),
    `${7-3} ＜ x ＜ ${7+3}`,
    allowedIntegers(4,9).length,
    Math.max(...allowedIntegers(5,8)),
    triangleExists([3,8,12])
  ];
  assert.deepEqual(units[0].questions.map(answer),expected);
  assert.equal(triangleExists([3,7,4]),false);
  assert.equal(triangleExists([3,7,10]),false);
  assert.equal(triangleExists([3,7,4.00001]),true);
  assert.equal(triangleExists([3,7,9.99999]),true);
});

test('円周角全10問を弧の角度・内角和・逆の条件で独立に検算',()=>{
  const halfArc=central=>central/2;
  const expected=[
    halfArc(124),
    37*2,
    halfArc(42*2),
    180-halfArc(180)-34,
    halfArc(28*2),
    180-halfArc(180)-27,
    halfArc(32*2+38*2),
    halfArc(248),
    46===46,
    90*2===180
  ];
  assert.deepEqual(units[1].questions.map(answer),expected);
  assert.match(units[1].questions[8].q,/同じ側/);
  assert.match(units[1].questions[7].q,/大きい弧AB.*248°/);
});

test('内接四角形全10問を対角和・外角・反例で独立に検算',()=>{
  const sums=[[88,91],[63,117],[70,110],[92,89]];
  const qualifying=sums.flatMap((v,i)=>i!==2&&v[0]+v[1]===180?[i]:[]);
  assert.deepEqual(qualifying,[1]);
  const counterexample=[82,98,78,102];
  assert.equal(counterexample.reduce((a,b)=>a+b,0),360);
  assert.ok(counterexample.every(angle=>angle>0&&angle<180));
  const expected=[
    180-76,
    180-113,
    180-(180-101),
    (180-12-18)/(2+3),
    (180-7-17)/(4+2),
    180-(180-33-41),
    units[2].questions[6].choices[qualifying[0]],
    73+(180-73)===180,
    90+90===180,
    counterexample[0]+counterexample[2]===180
  ];
  assert.deepEqual(units[2].questions.map(answer),expected);
});

test('円図の円周上の点と交点Pが幾何条件を満たす',()=>{
  for(const q of units.flatMap(u=>u.questions)){
    const d=q.maDiagram;
    if(!d)continue;
    for(const segment of d.segments)assert.ok(segment.every(name=>d.points[name]));
    if(!d.circles)continue;
    const {cx,cy,r}=d.circles[0];
    for(const [name,[x,y]] of Object.entries(d.points)){
      if(['O','P','E'].includes(name))continue;
      assert.ok(Math.abs(Math.hypot(x-cx,y-cy)-r)<0.2,`${name} is on the circle`);
    }
  }
  const p=units[1].questions[6].maDiagram.points;
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  assert.ok(Math.abs(cross(p.A,p.C,p.P))<1);
  assert.ok(Math.abs(cross(p.B,p.D,p.P))<1);
  const e=units[2].questions[2].maDiagram.points;
  assert.equal(cross(e.B,e.C,e.E),0);
  assert.ok(e.E[0]>e.C[0]);
  const chord=units[1].questions[4].maDiagram.points;
  const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  assert.equal(length(chord.A,chord.B),length(chord.C,chord.D));
  assert.ok(units[1].questions[5].maDiagram.segments.some(s=>s.join('')==='BD'));
});
