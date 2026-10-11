import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGuidedSession, submitGuidedStep, nextGuidedHint, guidedStudyHtml, explorerSpec, explorerOutput, rangeFacts, translationGraphSvg } from '../js/quadratic-study.js';
import { units } from '../data/mq_quadratic_support.js';
import { state } from '../js/state.js';
import { checkSuji, checkFill, finishQuestion, renderSavedAnswer } from '../js/views/quiz.js';
import { snapshotSession, restoreSession } from '../js/session.js';
import { createLocalStorage } from './helpers/env.js';

const example={title:'平方完成',intro:'y＝x²−4x＋6',steps:[
  {prompt:'半分と二乗',inputs:[{label:'半分',answer:-2},{label:'二乗',answer:4}],reason:{prompt:'なぜ？',choices:['係数を半分にする','符号を逆にする'],answer:0},hints:['xの係数は−4','−4を2で割る'],explanation:'同じ式を保とう。'},
  {prompt:'定数を整える',inputs:[{label:'残る定数',answer:2}],hints:[],explanation:'6−4＝2。'}
]};

test('例題は数値と理由が両方正しいときだけ進み、誤答は編集して再試行できる',()=>{
  const session=createGuidedSession();
  for(const [values,reason] of [[['','4'],0],[['−2abc','4'],0],[['−2','4'],''],[['−2','4'],1],[['−2','5'],0]]){
    assert.equal(submitGuidedStep(example,session,values,reason).accepted,false);
    assert.equal(session.step,0);
    assert.equal(session.complete,false);
  }
  assert.equal(submitGuidedStep(example,session,['－２','４'],'0').accepted,true);
  assert.equal(session.step,1);
  assert.equal(submitGuidedStep(example,session,['2']).complete,true);
  assert.deepEqual(session.completed,[0,1]);
  assert.equal(submitGuidedStep(example,session,['2']).accepted,false);
  assert.equal(session.step,2);
});

test('ヒントは一つずつ表示し、数値の正解や次の手順へ自動で進めない',()=>{
  const session=createGuidedSession();
  assert.equal(nextGuidedHint(example,session),'xの係数は−4');
  assert.equal(nextGuidedHint(example,session),'−4を2で割る');
  assert.equal(nextGuidedHint(example,session),'');
  assert.equal(session.hintCount,2);
  assert.equal(session.step,0);
  submitGuidedStep(example,session,[-2,4],0);
  assert.equal(session.hintIndex,0);
  assert.equal(session.hintCount,2);
  const fresh=createGuidedSession();
  assert.equal(fresh.hintCount,0);
  assert.equal(fresh.step,0);
  assert.doesNotMatch(guidedStudyHtml(example),/残る定数|同じ式を保とう/);
});

test('定義域の端・範囲外・下に開く場合の極値と、そのxを独立比較する',()=>{
  for(const a of [1,-1])for(const domain of ['inside','outside','edge']){
    const spec=explorerSpec({kind:'range',a},{domain});
    const facts=rangeFacts(spec);
    const values=Array.from({length:401},(_,i)=>{
      const x=spec.domain[0]+(spec.domain[1]-spec.domain[0])*i/400;
      return {x,y:a*(x-2)**2-3};
    });
    if(spec.domain[0]<=2&&spec.domain[1]>=2)values.push({x:2,y:-3});
    assert.equal(facts.min,Math.min(...values.map(p=>p.y)));
    assert.equal(facts.max,Math.max(...values.map(p=>p.y)));
    for(const x of facts.minAt)assert.equal(a*(x-2)**2-3,facts.min);
    for(const x of facts.maxAt)assert.equal(a*(x-2)**2-3,facts.max);
  }
});

test('cの軸移動は固定した0≤x≤2で最小値の境界0・2と最大値の境界1を保つ',()=>{
  for(const c of [-2,-1,0,.5,1,1.5,2,3,4,8]){
    const spec=explorerSpec({kind:'axisC'},{c});
    assert.deepEqual(spec.domain,[0,2]);
    const facts=rangeFacts(spec);
    const closest=Math.max(0,Math.min(2,c));
    const min=(closest-c)**2+1;
    const max=Math.max(c*c+1,(2-c)**2+1);
    assert.equal(facts.min,min);
    assert.equal(facts.max,max);
    assert.deepEqual(facts.minAt,[closest]);
    assert.deepEqual(facts.maxAt,c===1?[0,2]:[c<1?2:0]);
    assert.ok(explorerOutput({kind:'axisC'},{c}).includes('最大値 '+max));
  }
  for(const c of [-2,0,6,8]){
    const spec=explorerSpec({kind:'verticalC'},{c});
    assert.equal(rangeFacts(spec).axis,2);
    assert.equal(rangeFacts(spec).min,c-4);
    assert.equal(rangeFacts(spec).max,c);
  }
});

test('グラフの移動はp・qが頂点で、全操作を同じ目盛りで比べられる',()=>{
  for(const a of [-1,1])for(const p of [-3,-.5,0,2,3])for(const q of [-5,0,5]){
    const spec=explorerSpec({kind:'move'},{a,p,q});
    assert.equal(spec.a*p*p+spec.b*p+spec.c,q);
    for(const x of [-4,-1,0,2,4])assert.equal(spec.a*x*x+spec.b*x+spec.c,a*(x-p)**2+q);
    const svg=translationGraphSvg(spec);
    assert.match(svg,/目盛りは固定/);
    assert.match(svg,/破線/);
    assert.ok(!svg.includes('NaN'));
    assert.match(svg,/<circle cx="/);
  }
});

function quizDom(q,values){
  const node=()=>({innerHTML:'',textContent:'',className:'',classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
  const inputs=values.map((value,i)=>({...node(),value,dataset:{fillidx:String(i)}}));
  const nodes={fb:node(),nextWrap:node(),inputAns:inputs[0],sujiCheck:node(),fillCheck:node()};
  globalThis.localStorage=createLocalStorage();
  globalThis.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:selector=>selector==='.fillInput'||selector==='#inputAns,.fillInput,select[data-sel]'?inputs:[],createElement:()=>({...node(),firstChild:node()})};
  state.cur={sid:q._key.split('-')[0],mode:'stage',i:0,list:[q,q],correct:0,score:0,combo:0,maxCombo:0,wrongThisRun:[]};
  return nodes;
}

test('新規の数値・複数欄の実採点は小数の切り捨てや余分な文字を認めない',()=>{
  const numeric={...units[1].questions[4],_key:'mqs2-4'};
  const fill={...units[0].questions[1],_key:'mqs1-1'};
  for(const q of [numeric,fill]){
    for(const suffix of ['.5','abc']){
      const values=q.a.map(String);values[0]+=suffix;
      quizDom(q,values);
      (q.type==='suji'?checkSuji:checkFill)(q);
      assert.equal(state.cur.correct,0,q.type+suffix);
    }
    quizDom(q,q.a.map(String));
    (q.type==='suji'?checkSuji:checkFill)(q);
    assert.equal(state.cur.correct,1,q.type);
    const score=state.cur.score;
    (q.type==='suji'?checkSuji:checkFill)(q);
    assert.equal(state.cur.correct,1);
    assert.equal(state.cur.score,score);
  }
});

test('回答後のグラフは二重採点や保存復元で重複せず、模擬の途中には出さない',()=>{
  const q={...units[3].questions[3],_key:'mqs4-3'};
  const nodes=quizDom(q,q.a.map(String));
  assert.doesNotMatch(nodes.fb.innerHTML,/data-quadratic-feedback/);
  checkFill(q);
  assert.equal((nodes.fb.innerHTML.match(/data-quadratic-feedback/g)||[]).length,1);
  finishQuestion(true,q);
  renderSavedAnswer(q,true);
  assert.equal((nodes.fb.innerHTML.match(/data-quadratic-feedback/g)||[]).length,1);
  state.cur=restoreSession(snapshotSession(state.cur));
  assert.ok(state.cur);
  renderSavedAnswer(state.cur.list[0]);
  assert.equal((nodes.fb.innerHTML.match(/data-quadratic-feedback/g)||[]).length,1);
  const examQuestion={...q,points:2};
  const examNodes=quizDom(examQuestion,q.a.map(String));
  finishQuestion(true,examQuestion);
  assert.doesNotMatch(examNodes.fb.innerHTML,/data-quadratic-feedback|<svg/);
  assert.match(examNodes.fb.innerHTML,/最後の結果画面/);
});
