import { test } from 'node:test';
import assert from 'node:assert/strict';
import { units as practice } from '../data/mq_quadratic_support.js';
import { units as papers } from '../data/mq_quadratic_mock.js';
import { QUESTIONS } from '../js/content.js';
import { examTotal, examBreakdown, isMockExam, examNumericMatch } from '../js/mock-exam.js';
import { snapshotSession, restoreSession } from '../js/session.js';
import { state } from '../js/state.js';
import { finishQuestion, answer, renderSavedAnswer } from '../js/views/quiz.js';
import { examResultHtml } from '../js/views/results.js';
import { createLocalStorage } from './helpers/env.js';

const correct = q => q.type === 'yon' || q.type === 'ana' ? q.choices[q.a] : q.type === 'maru' ? q.a : q.a[0];
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} / ${expected}`);
const quadratic = ([a,b,c],x) => a*x*x+b*x+c;
const tidy = s => String(s).replace(/[＋]/g,'+').replace(/[−－]/g,'-').replace(/[＝]/g,'=').replace(/×/g,'*').replace(/\{/g,'(').replace(/\}/g,')').replace(/\s/g,'');

// テスト独自の四則・二乗評価器。正答用の平方完成コードは使わず、候補式に値を代入する。
function formulaValue(source, x) {
  const text = tidy(source).replace(/^y=/,'').replace(/²/g,'^2');
  assert.match(text,/^[0-9x+\-*/^().]+$/);
  const tokens=text.match(/\d+(?:\.\d+)?|x|[+\-*/^()]/g);
  let i=0;
  function atom(){
    if(tokens[i]==='+'){i++;return atom();}
    if(tokens[i]==='-'){i++;return -atom();}
    let value;
    if(tokens[i]==='('){i++;value=sum();assert.equal(tokens[i++],')');}
    else if(tokens[i]==='x'){i++;value=x;}
    else {value=Number(tokens[i++]);assert.ok(Number.isFinite(value));}
    if(tokens[i]==='^'){i++;assert.equal(tokens[i++],'2');value*=value;}
    return value;
  }
  function product(){
    let value=atom();
    while(i<tokens.length && !['+', '-', ')'].includes(tokens[i])){
      if(tokens[i]==='*'){i++;value*=atom();}
      else if(tokens[i]==='/'){i++;value/=atom();}
      else value*=atom();
    }
    return value;
  }
  function sum(){let value=product();while(['+','-'].includes(tokens[i])){const op=tokens[i++];value+= (op==='+'?1:-1)*product();}return value;}
  const result=sum();assert.equal(i,tokens.length);return result;
}
function formulaMatches(candidate,p,shift=[0,0]) {
  return [-7,-2.5,0,1,4,8.25].every(x => Math.abs(formulaValue(candidate,x)-(quadratic(p,x-shift[0])+shift[1]))<1e-9);
}
function extrema(p,L,R) {
  const vertex=-p[1]/(2*p[0]);
  const xs=[L,R];if(vertex>L&&vertex<R)xs.push(vertex);
  const rows=xs.map(x=>({x,y:quadratic(p,x)}));
  const min=Math.min(...rows.map(r=>r.y)),max=Math.max(...rows.map(r=>r.y));
  // 独立した細分化代入でも全点が求めた範囲内かを確かめる。
  for(let i=0;i<=400;i++){const y=quadratic(p,L+(R-L)*i/400);assert.ok(y>=min-1e-9&&y<=max+1e-9);}
  return {min,max,minAt:rows.filter(r=>r.y===min).map(r=>r.x).sort((a,b)=>a-b),maxAt:rows.filter(r=>r.y===max).map(r=>r.x).sort((a,b)=>a-b)};
}
function graphMatches(choice,p) {
  const text=tidy(choice),v=/頂点\((-?[\d.]+),(-?[\d.]+)\)/.exec(text);
  if(!v)return false;
  const x=-p[1]/(2*p[0]);
  if(Number(v[1])!==x || Number(v[2])!==quadratic(p,x) || text.includes('上に開')!==(p[0]>0))return false;
  const axis=/軸x=(-?[\d.]+)/.exec(text);if(axis&&Number(axis[1])!==x)return false;
  const points=[...text.matchAll(/\((-?[\d.]+),(-?[\d.]+)\)/g)].slice(1);
  return points.every(([,a,b])=>quadratic(p,Number(a))===Number(b));
}
function extremaMatches(choice,p,L,R) {
  const computed=extrema(p,L,R),text=tidy(choice);
  for(const [name,key] of [['最小値','min'],['最大値','max']]){
    const match=new RegExp(name+'(-?[\\d.]+)[（(]x=([^）)]+)[）)]').exec(text);
    if(!match || Number(match[1])!==computed[key])return false;
    const xs=match[2].replace(/だけ/g,'').split(/[、,]/).map(Number).sort((a,b)=>a-b);
    if(JSON.stringify(xs)!==JSON.stringify(computed[key+'At']))return false;
  }
  return true;
}
function choiceRoots(choice){return [...tidy(choice).matchAll(/-?\d+(?:\.\d+)?/g)].map(m=>Number(m[0])).sort((a,b)=>a-b);}
function movingRoots({a,k,L,R,target,mode}) {
  // 解は「端点の値=target」の二次方程式の候補から作り、実際の区間最大/最小で篩う。
  const distanceSquared=(target-k)/a;
  if(distanceSquared<0)return [];
  const distance=Math.sqrt(distanceSquared),candidates=new Set([L-distance,L+distance,R-distance,R+distance]);
  return [...candidates].filter(c=>Math.abs(extrema([a,-2*a*c,a*c*c+k],L,R)[mode]-target)<1e-9).sort((a,b)=>a-b);
}

// promptの条件を独立に転記。答えの数値を写すのではなく元の係数・範囲から算出する。
const mockCases=[
  {kind:'formula',given:'(x＋3)²',p:[1,6,9]},
  {kind:'coefficient',given:'(x−4)²',p:[1,-8,16],target:1},
  {kind:'substitute',given:'y＝x²−2x−3',p:[1,-2,-3],x:-2},
  {kind:'substitute',given:'y＝(x−2)²＋1',p:[1,-4,5],x:1},
  {kind:'formula',given:'x²＋8x＋3',p:[1,8,3]},
  {kind:'constant',given:'x²−6x＋5',p:[1,-6,5]},
  {kind:'formula',given:'x²＋5x−1',p:[1,5,-1]},
  {kind:'vertexY',given:'y＝x²−10x＋18',p:[1,-10,18]},
  {kind:'formula',given:'2x²−8x＋1',p:[2,-8,1]},
  {kind:'formula',given:'−x²＋6x−5',p:[-1,6,-5]},
  {kind:'constant',given:'−2x²−12x−15',p:[-2,-12,-15]},
  {kind:'axis',given:'y＝3(x−2)²−5',p:[3,-12,7]},
  {kind:'graph',given:'y＝−(x＋1)²＋4',p:[-1,-2,3]},
  {kind:'substitute',given:'y＝2(x−1)²−3',p:[2,-4,-1],x:-1,other:3},
  {kind:'graph',given:'y＝x²−6x＋5',p:[1,-6,5]},
  {kind:'formula',given:'y＝x²',p:[1,0,0],shift:[3,2]},
  {kind:'formula',given:'y＝2(x＋1)²−4',p:[2,4,-2],shift:[-2,5]},
  {kind:'formula',given:'y＝−(x−2)²＋3',p:[-1,4,-1],shift:[1,-4]},
  {kind:'formula',given:'y＝x²−4x＋1',p:[1,-4,1],shift:[1,-2]},
  {kind:'range',given:'y＝(x−1)²−2',p:[1,-2,-1],L:0,R:3,mode:'min'},
  {kind:'range',given:'y＝(x−1)²−2',p:[1,-2,-1],L:0,R:3,mode:'max'},
  {kind:'extrema',given:'y＝x²−4x＋1',p:[1,-4,1],L:0,R:4},
  {kind:'extrema',given:'y＝2x²−8x＋3',p:[2,-8,3],L:1,R:3},
  {kind:'range',given:'y＝(x−3)²−1',p:[1,-6,8],L:0,R:1,mode:'min'},
  {kind:'extrema',given:'y＝−(x−2)²＋5',p:[-1,4,1],L:0,R:3},
  {kind:'extrema',given:'y＝−2(x＋1)²＋3',p:[-2,-4,1],L:0,R:2},
  {kind:'offset',given:'y＝x²−4x＋c',p:[1,-4,0],L:0,R:3,target:2,mode:'min'},
  {kind:'offset',given:'y＝x²−4x＋c',p:[1,-4,0],L:0,R:1,target:2,mode:'min'},
  {kind:'offset',given:'y＝−x²＋2x＋c',p:[-1,2,0],L:-1,R:2,target:7,mode:'max'},
  {kind:'offset',given:'y＝2x²−8x＋c',p:[2,-8,0],L:1,R:3,target:1,mode:'max'},
  {kind:'moving',given:'y＝(x−c)²＋1',a:1,k:1,L:0,R:2,target:2,mode:'min'},
  {kind:'moving',given:'y＝(x−c)²＋1',a:1,k:1,L:0,R:2,target:5,mode:'max'},
  {kind:'moving',given:'y＝(x−c)²−2',a:1,k:-2,L:-1,R:3,target:2,mode:'min'},
  {kind:'moving',given:'y＝−(x−c)²＋4',a:-1,k:4,L:0,R:2,target:3,mode:'max'}
];

const expand=(p,fields)=>({kind:'expanded',p,fields});
const sub=(p,xs)=>({kind:'substitutions',p,xs});
const complete=(p,innerSign=-1,outerSign=1)=>({kind:'completion',p,innerSign,outerSign});
const vertex=(p,xs=[])=>({kind:'vertex',p,xs});
const interval=(p,L,R,fields)=>({kind:'interval',p,L,R,fields});
const offset=(p,L,R,mode,target)=>({kind:'offset',p,L,R,mode,target});
const moving=(L,R,mode,target,side)=>({kind:'moving',a:1,k:1,L,R,mode,target,side});
const stageCases=[
  [
    expand(3,['b']),expand(-2,['b','c']),{kind:'equivalence',left:'(x＋3)²',right:'x²＋9'},
    sub([1,-4,7],[-1]),sub([1,-4,7],[0,1]),{kind:'point',p:[1,-4,7],x:3,y:4},
    {kind:'order',p:[2,-3,1],x:-2,labels:['負の数を括弧付きで代入する','二乗を計算する','かけ算を計算する','足し算を計算する']},
    sub([3,2,-1],[-2]),expand(-4,['b','c']),sub([-1,6,-4],[2,3,4])
  ],
  [
    {kind:'half',b:-6},
    {kind:'concept',text:'式の値を変えずに二乗のまとまりを作るため',proof:()=>[-3,0,2].every(x=>quadratic([1,-6,0],x)+9-9===quadratic([1,-6,0],x))},
    expand(-3,['c']),complete([1,-6,0],-1,-1),{kind:'constant',p:[1,-6,5]},complete([1,8,3],1),
    {kind:'order',p:[1,-2,6],labels:['同じ数を足して引く','三項を二乗にする','外の定数をまとめる']},
    complete([1,-8,6]),complete([1,6,-2],1),complete([1,-3,1])
  ],
  [
    {kind:'divide',n:-8,d:2},{kind:'equivalence',left:'2{(x−2)²−4}＋5',right:'2(x−2)²−4＋5'},
    {kind:'multiply',n:2,m:-4},complete([2,12,7],1),complete([-1,6,-2]),complete([-2,-8,1],1),
    {kind:'opening',a:-1},complete([2,-12,13]),complete([-1,-4,1],1),complete([3,-6,-4])
  ],
  [
    {kind:'concept',text:'x−2が0になるx',proof:()=>formulaValue('(x−2)²',2)===0},
    {kind:'axis',p:[1,6,7]},{kind:'opening',a:1},vertex([1,-4,7]),sub([1,-4,7],[1,3]),
    {kind:'reflection',axis:2,x:0},vertex([-1,-2,3]),vertex([1,2,-3],[0]),vertex([2,-8,6],[1]),vertex([-1,6,-5],[2])
  ],
  [
    {kind:'pointTranslation',point:[1,1],shift:[3,0]},
    {kind:'vertexTranslation',p:[1,0,0],shift:[-2,0]},
    {kind:'shiftTruth',p:[1,0,0],shift:[3,0],candidate:'(x＋3)²'},
    {kind:'translationCompletion',p:[1,0,0],shift:[2,3],innerSign:-1},
    {kind:'vertexTranslation',p:[1,2,-3],shift:[3,2]},
    {kind:'translationCompletion',p:[2,-4,5],shift:[-2,-5],innerSign:1},
    {kind:'concept',text:'二乗の係数と、グラフの開き方',proof:()=>{const f=x=>quadratic([2,-4,5],x+2)-5;return (f(1)+f(-1)-2*f(0))/2===2;}},
    {kind:'translationCompletion',p:[1,-2,-3],shift:[-3,2],innerSign:1},
    {kind:'translationCompletion',p:[-1,0,0],shift:[1,4],innerSign:-1,xs:[2]},
    {kind:'shiftFromVertices',before:[2,1],after:[-1,-3]}
  ],
  [
    {kind:'concept',text:'両端と、範囲内にある場合だけ頂点',proof:()=>{const e=extrema([1,-4,1],0,3);return e.min===quadratic([1,-4,1],2)&&e.max===quadratic([1,-4,1],0);}},
    {kind:'domain',L:0,R:3},{kind:'endpointsEnough',p:[1,-4,1],L:0,R:3},sub([1,-4,1],[0,3]),
    interval([1,-4,1],0,3,['min','minAt']),interval([1,-4,1],0,3,['max','maxAt']),interval([1,-4,1],1,4,['min','max']),
    interval([1,-6,8],1,4,['min','minAt','max','maxAt']),interval([2,4,-1],-3,0,['min','minAt','max','maxAt']),
    {kind:'rangeChoice',p:[1,-4,8],L:0,R:4,mode:'max'}
  ],
  [
    {kind:'outside',p:[1,-6,10],L:0,R:2},interval([1,-6,10],0,2,['minAt','min']),
    {kind:'outsideVertexValid',p:[1,-6,10],L:0,R:2},interval([1,-6,10],0,2,['maxAt','max']),
    interval([1,4,3],0,2,['min','max']),interval([-1,2,3],-1,2,['min','max']),interval([-1,8,-14],0,2,['min','max']),
    interval([1,-8,17],0,2,['min','minAt','max','maxAt']),interval([-1,-2,3],0,2,['min','minAt','max','maxAt']),
    {kind:'rangeChoice',p:[-1,4,2],L:0,R:4,mode:'min'}
  ],
  [
    {kind:'offsetAxis',a:1,b:-4},complete([1,-4,0],-1,-1),offset([1,-4,0],0,3,'min',2),offset([1,-4,0],0,1,'min',2),
    offset([1,2,0],-2,1,'min',4),offset([1,-4,0],0,3,'max',7),offset([-1,4,0],0,3,'max',8),
    offset([2,-8,0],0,3,'min',1),offset([1,4,0],0,2,'min',3),offset([-1,2,0],0,4,'min',-5)
  ],
  [
    {kind:'movingAxis'}, {kind:'interiorMovingMin',L:0,R:2,k:1},sub([1,4,5],[0]),interval([1,-8,17],0,2,['minAt','min']),
    moving(0,2,'min',2,'left'),moving(0,2,'min',2,'right'),moving(0,2,'min',2),
    {kind:'equalEnds',L:0,R:2},moving(0,2,'max',5),moving(-1,3,'min',2)
  ]
];

function numericAnswers(q){return q.a.map(Number);}
function simpleRangeChoiceMatches(choice,s){
  const text=tidy(choice),name=s.mode==='min'?'最小値':'最大値';
  const value=new RegExp('^'+name+'(-?[\\d.]+)').exec(text);if(!value)return false;
  const xs=[...text.matchAll(/x=(-?\d+(?:\.\d+)?)/g)].map(m=>Number(m[1])).sort((a,b)=>a-b);
  const expected=extrema(s.p,s.L,s.R);
  return Number(value[1])===expected[s.mode]&&JSON.stringify(xs)===JSON.stringify(expected[s.mode+'At']);
}
function practiceExpected(s,q){
  const h=Array.isArray(s.p)?-s.p[1]/(2*s.p[0]):undefined,k=Array.isArray(s.p)?quadratic(s.p,h):undefined;
  switch(s.kind){
    case 'expanded':return s.fields.map(f=>f==='b'?2*s.p:s.p*s.p);
    case 'substitutions':return s.xs.map(x=>quadratic(s.p,x));
    case 'half':return [s.b/2];case 'divide':return [s.n/s.d];case 'multiply':return [s.n*s.m];
    case 'completion':return [-h/s.innerSign,k/s.outerSign];case 'constant':return [k];case 'axis':return [h];
    case 'vertex':return [h,k,...s.xs.map(x=>quadratic(s.p,x))];
    case 'reflection':return [2*s.axis-s.x];
    case 'pointTranslation':return s.point.map((v,i)=>v+s.shift[i]);
    case 'vertexTranslation':return [h+s.shift[0],k+s.shift[1]];
    case 'translationCompletion':return [-(h+s.shift[0])/s.innerSign,k+s.shift[1],...(s.xs||[]).map(x=>quadratic(s.p,x-s.shift[0])+s.shift[1])];
    case 'shiftFromVertices':return s.after.map((v,i)=>v-s.before[i]);case 'domain':return [s.L,s.R];
    case 'interval':{const values=extrema(s.p,s.L,s.R);return s.fields.flatMap(f=>values[f]);}
    case 'offset':{const c=s.target-extrema(s.p,s.L,s.R)[s.mode];close(extrema([s.p[0],s.p[1],c],s.L,s.R)[s.mode],s.target,q.q);return [c];}
    case 'moving':{const roots=movingRoots(s);return roots.filter(c=>!s.side || (s.side==='left'?c<s.L:c>s.R));}
    case 'equalEnds':{const c=(s.L+s.R)/2;close((s.L-c)**2,(s.R-c)**2,q.q);return [c];}
    case 'interiorMovingMin':{
      for(const c of [s.L,(s.L+s.R)/2,s.R])close(extrema([1,-2*c,c*c+s.k],s.L,s.R).min,s.k,q.q);return [s.k];
    }
    case 'equivalence':return [-3,-1,0,2,7].every(x=>formulaValue(s.left,x)===formulaValue(s.right,x));
    case 'point':return quadratic(s.p,s.x)===s.y;
    case 'shiftTruth':return formulaMatches(s.candidate,s.p,s.shift);
    case 'endpointsEnough':return Math.min(quadratic(s.p,s.L),quadratic(s.p,s.R))===extrema(s.p,s.L,s.R).min;
    case 'outside':return h<s.L||h>s.R;
    case 'outsideVertexValid':return h>=s.L&&h<=s.R&&k===extrema(s.p,s.L,s.R).min;
    case 'offsetAxis':return [-12,0,20].every(c=>-(quadratic([s.a,s.b,c],1)-quadratic([s.a,s.b,c],-1))/4/s.a===-s.b/(2*s.a));
    case 'movingAxis':return [-2,0,1,4].every(c=>-(-2*c)/(2*1)===c);
    case 'opening':return s.a>0?'上に開く（下に凸）':'下に開く（上に凸）';
    case 'concept':assert.ok(s.proof(),q.q);return s.text;
    case 'order':{
      const indices=s.labels.map(label=>q.steps.findIndex(step=>step.startsWith(label)));assert.ok(indices.every(i=>i>=0));
      for(const step of q.steps){const formula=step.split('：')[1];if(s.x===undefined)assert.ok(formulaMatches(formula,s.p));else close(formulaValue(formula,s.x),quadratic(s.p,s.x),q.q);}
      return indices;
    }
    case 'rangeChoice':{
      const valid=q.choices.filter(c=>simpleRangeChoiceMatches(c,s));assert.equal(valid.length,1,q.q);return valid[0];
    }
    default:assert.fail(s.kind);
  }
}

test('補習90問の全正答を元式の展開・代入・範囲候補・cの原条件から独立検算する',()=>{
  assert.equal(stageCases.flat().length,90);
  practice.forEach((u,stage)=>{
    assert.equal(stageCases[stage].length,u.questions.length);
    u.questions.forEach((q,i)=>{
      const expected=practiceExpected(stageCases[stage][i],q),label=`${u.id}-${i}`;
      if(Array.isArray(expected))assert.deepEqual(numericAnswers(q),expected,label);
      else assert.equal(correct(q),expected,label);
    });
  });
});

test('二次関数補習は9段階各10問・3枚のレッスン・練習と模擬を区別する',()=>{
  assert.equal(practice.length,9);
  assert.deepEqual(practice.map(u=>u.id),Array.from({length:9},(_,i)=>'mqs'+(i+1)));
  for(const u of practice){
    assert.equal(u.subject,'📐 数学Ⅰ');assert.equal(u.questions.length,10);assert.equal(u.lesson.length,3);
    assert.ok(u.lesson.every(card=>card.title&&card.body));assert.ok(u.questions.every(q=>q.examPractice));
    assert.ok(u.questions.every(q=>q.strictNumeric));
    assert.ok(u.questions.slice(0,3).every(q=>q.q.startsWith('【考え方】')));
    assert.ok(u.questions.slice(3,7).every(q=>q.q.startsWith('【途中式】')));
    assert.ok(u.questions.slice(7).every(q=>q.q.startsWith('【自力で確認')));
    assert.ok(u.questions.every(q=>q.points===undefined));
    assert.ok(QUESTIONS[u.id]);assert.equal(QUESTIONS[u.id].lesson,u.lesson);
  }
});

test('9つの一行例題は入力36段階と理由の正答を検算し、確認用のグラフも元式と一致する',()=>{
  const ps=[[1,-4,7],[1,-6,5],[2,-8,5],[1,-4,3],[1,2,-1],[1,-4,1],[-1,4,1],[1,-4,0],[1,-6,10]];
  const value=(i,x)=>quadratic(ps[i],x),h=i=>-ps[i][1]/(2*ps[i][0]),k=i=>value(i,h(i));
  const e6=extrema(ps[5],0,3),e7=extrema(ps[6],0,3),base8=extrema(ps[7],0,3),c8=2-base8.min;
  const roots=movingRoots({a:1,k:1,L:0,R:2,target:2,mode:'min'});
  const answers=[
    [[ps[0][1]/2],[(ps[0][1]/2)**2],[k(0)],[value(0,1),value(0,1)]],
    [[ps[1][1]/2],[(ps[1][1]/2)**2,(ps[1][1]/2)**2],[k(1)],[h(1),k(1)]],
    [[ps[2][1]/ps[2][0]],[h(2),h(2)**2],[k(2)],[h(2),k(2),value(2,0)]],
    [[h(3),k(3)],[h(3),k(3),h(3)],[value(3,1),value(3,3)],[value(3,0),value(3,4)]],
    [[h(4),k(4)],[-h(4),k(4)],[1-2,-1-1],[ps[4][1],ps[4][2]]],
    [[h(5),k(5)],[value(5,0),value(5,3),value(5,h(5))],[e6.min,...e6.minAt],[e6.max,...e6.maxAt]],
    [[h(6),k(6)],[value(6,0),value(6,h(6)),value(6,3)],[e7.max,...e7.maxAt],[e7.min,...e7.minAt]],
    [[h(7),-k(7)],[...base8.minAt,-base8.min],[c8],[2,0,3].map(x=>quadratic([ps[7][0],ps[7][1],c8],x))],
    [[quadratic([1,-2,2],1)],roots.filter(c=>c<0),roots.filter(c=>c>2),roots]
  ];
  const reasons=[
    '二乗の中で増えた4と合わせて、もとの7にするため','式の値を変えず、二乗のまとまりを作るため',
    '2が括弧内の全部に掛かっているため','軸からの距離が等しく、二乗が同じになるため',
    '新しい頂点のx＝−1で、括弧を0にするため','入れられる。x＝2が0≤x≤3に含まれる',
    '下に開く（上に凸）','軸2が指定範囲内で、上に開くため','合わない。頂点のyは1になる'
  ];
  let steps=0;
  practice.forEach((u,i)=>{
    const guide=u.lesson[1].guidedExample;assert.ok(guide.paperTask&&guide.paperAnswer);
    assert.equal(guide.steps.length,answers[i].length);
    guide.steps.forEach((step,j)=>{
      steps++;assert.deepEqual(step.inputs.map(input=>input.answer),answers[i][j],`${u.id}.guide[${j}]`);
      assert.ok(step.prompt&&step.explanation&&step.hints.length===2);
      if(step.reason)assert.equal(step.reason.choices[step.reason.answer],reasons[i],u.id);
    });
    assert.equal(guide.steps.filter(step=>step.reason).length,1,u.id);
    if(guide.graph){
      const expected=i===7?[ps[i][0],ps[i][1],c8]:ps[i];
      assert.deepEqual([guide.graph.a,guide.graph.b,guide.graph.c],expected,u.id);
      if(i>=5)assert.deepEqual(guide.graph.domain,i===8?[0,2]:[0,3],u.id);
    }
  });
  assert.equal(steps,36);
});

test('復習模擬は固定34問100点・9分野への復習リンク・学校の出題を主張しない',()=>{
  const paper=papers[0],list=paper.questions;
  assert.equal(papers.length,1);assert.equal(paper.id,'mqmock1');assert.equal(list.length,34);assert.equal(examTotal({list}),100);
  assert.deepEqual([2,3,4].map(p=>list.filter(q=>q.points===p).length),[10,16,8]);
  assert.deepEqual([...new Set(list.map(q=>q.sourceStage))],practice.map(u=>u.id));
  assert.match(paper.desc,/45分.*自分で計測/);assert.match(paper.desc,/80点.*学習用目安/);
  for(const q of list){assert.ok(QUESTIONS[q.sourceStage]);assert.ok(['yon','maru','ana','suji'].includes(q.type));assert.ok(q.examPractice);assert.ok(!q.hint);assert.ok(q.examSection);}
});

test('模擬全34問を元式の代入・頂点・端点・条件逆算で独立検算し、誤選択肢も除外する',()=>{
  assert.equal(mockCases.length,papers[0].questions.length);
  mockCases.forEach((s,i)=>{
    const q=papers[0].questions[i],label=`mqmock1-${i}`;assert.ok(q.q.includes(s.given),label);
    const actual=correct(q);let expected;
    switch(s.kind){
      case 'formula':{
        const matches=q.choices.map(c=>formulaMatches(c,s.p,s.shift));assert.equal(matches.filter(Boolean).length,1,label);assert.ok(matches[q.a],label);return;
      }
      case 'graph':{const matches=q.choices.map(c=>graphMatches(c,s.p));assert.equal(matches.filter(Boolean).length,1,label);assert.ok(matches[q.a],label);return;}
      case 'extrema':{const matches=q.choices.map(c=>extremaMatches(c,s.p,s.L,s.R));assert.equal(matches.filter(Boolean).length,1,label);assert.ok(matches[q.a],label);return;}
      case 'moving':{
        const roots=movingRoots(s);assert.deepEqual(choiceRoots(actual),roots,label);
        assert.equal(q.choices.filter(c=>JSON.stringify(choiceRoots(c))===JSON.stringify(roots)).length,1,label);
        // c=区間の端・中点は境界。候補の正誤が隣の境界条件に漏れない。
        for(const c of [s.L,s.R,(s.L+s.R)/2]){
          const satisfies=Math.abs(extrema([s.a,-2*s.a*c,s.a*c*c+s.k],s.L,s.R)[s.mode]-s.target)<1e-9;
          assert.equal(satisfies,roots.includes(c),label);
        }
        return;
      }
      case 'coefficient':expected=s.p[s.target];break;
      case 'substitute':expected=quadratic(s.p,s.x);if(s.other!==undefined)close(quadratic(s.p,s.other),expected,label);break;
      case 'constant':case 'vertexY':expected=quadratic(s.p,-s.p[1]/(2*s.p[0]));break;
      case 'axis':expected=-s.p[1]/(2*s.p[0]);break;
      case 'range':expected=extrema(s.p,s.L,s.R)[s.mode];break;
      case 'offset':{
        expected=s.target-extrema(s.p,s.L,s.R)[s.mode];
        close(extrema([s.p[0],s.p[1],expected],s.L,s.R)[s.mode],s.target,label);break;
      }
      default:assert.fail(s.kind);
    }
    close(Number(actual),expected,label);
  });
});

function session(){return {sid:'mqmock1',mode:'stage',title:papers[0].title,i:0,startIndex:0,list:papers[0].questions.map((q,i)=>({...q,_key:`mqmock1-${i}`})),correct:0,score:0,combo:20,maxCombo:20,feverGauge:0,feverLeft:3,feverCount:0,weakHits:0,wrongThisRun:[]};}
function dom(){const node=()=>({innerHTML:'',textContent:'',className:'',classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});const nodes={fb:node(),nextWrap:node()};globalThis.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({...node(),firstChild:node()})};globalThis.localStorage=createLocalStorage();return nodes;}

test('補習模擬の実採点は全正解100点・全不正解0点・混合配点・二重発火防止・終了まで非表示',()=>{
  const nodes=dom();for(const mode of ['all','none','mixed']){
    const c=state.cur=session();state.settings.timeAttack=true;c._timeLeft=30;c._timeLimit=30;let expected=0;
    for(let i=0;i<c.list.length;i++){
      c.i=i;c._locked=false;const ok=mode==='all'||mode==='mixed'&&i%3===0;
      finishQuestion(ok,c.list[i]);expected+=ok?c.list[i].points:0;finishQuestion(ok,c.list[i]);
      assert.equal(c.score,expected);assert.ok(!nodes.fb.innerHTML.includes(c.list[i].exp));assert.doesNotMatch(nodes.fb.innerHTML,/⭕|❌|正解：/);
    }
    assert.equal(c.score,mode==='all'?100:mode==='none'?0:expected);
    const restored=restoreSession(snapshotSession(c));assert.ok(restored);assert.equal(restored.score,c.score);
    assert.ok(isMockExam(restored));assert.equal(examBreakdown(restored).reduce((n,g)=>n+g.earned,0),c.score);
    const html=examResultHtml(restored);assert.equal((html.match(/<details>/g)||[]).length,34);
    for(const g of examBreakdown(restored))assert.equal(html.includes(`#/stage/${g.sourceStage}/1`),g.earned<g.total);
  }
});

test('補習模擬の保存再開は回答ロックを保持し、途中開始と単問は実際の満点を使う',()=>{
  const nodes=dom(),c=state.cur=session();c.i=4;finishQuestion(false,c.list[4]);
  const restored=restoreSession(snapshotSession(c));assert.equal(restored.i,4);assert.ok(restored._locked);state.cur=restored;
  renderSavedAnswer(restored.list[4]);assert.ok(!nodes.fb.innerHTML.includes(restored.list[4].exp));
  finishQuestion(true,restored.list[4]);assert.equal(restored.score,0);assert.equal(restored.wrongThisRun.length,1);
  assert.equal(examTotal({...c,startIndex:10}),c.list.slice(10).reduce((n,q)=>n+q.points,0));
  assert.equal(examTotal({...c,mode:'practice',list:[c.list[0]],startIndex:0}),2);
  const fresh=state.cur=session();let leaks=0;const choice={dataset:{i:'0'},classList:{add(name){if(['correct','wrong'].includes(name))leaks++;}}};
  document.querySelectorAll=selector=>selector==='[data-i]'?[choice]:[];fresh.shuffledCorrect=0;answer(true,choice,0);assert.equal(leaks,0);
  for(const value of ['-8','−８','-8.0'])assert.ok(examNumericMatch(value,['-8']));
  for(const value of ['-8abc','-8/2','-8.2','Infinity',''])assert.equal(examNumericMatch(value,['-8']),false);
});
