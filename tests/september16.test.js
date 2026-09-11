import { test } from 'node:test';
import assert from 'node:assert/strict';
import { units as ja } from '../data/sep16_japanese.js';
import { units as ma } from '../data/sep16_math.js';
import { units as en } from '../data/sep16_english.js';
import { state } from '../js/state.js';
import { checkInput } from '../js/views/quiz.js';
import { createLocalStorage } from './helpers/env.js';

test('9/16: 写真の15分野を各10問、3教科各50問で登録する',()=>{
  for(const [group,list] of [['国語',ja],['数学',ma],['英語',en]]){
    assert.equal(list.length,5);
    for(const u of list){
      assert.equal(u.subject,'📅 9/16 実力テスト対策');
      assert.equal(u.group,group);
      assert.equal(u.questions.length,10);
      for(const q of u.questions){
        assert.equal(q.examPractice,true);
        if(q.type==='yon')assert.equal(new Set(q.choices).size,4);
      }
    }
  }
  assert.ok(en[0].questions.every(q=>q.speech));
  for(const u of [...ja.slice(1,4),en[3]])assert.ok(u.questions.every(q=>q.q.includes('【本文】')));
  // 語順問題の答えを回答前の音声で読み上げない。
  assert.ok(en[4].questions.every(q=>!q.speech));
});

test('9/16: 国語と英語の入力は正解・別表記を受け付け、誤答を拒否する',()=>{
  globalThis.localStorage=createLocalStorage();
  const previousDocument=globalThis.document, previousWindow=globalThis.window;
  state.settings.sound=false;
  try{
    for(const u of [...ja,...ma,...en])for(const q of u.questions.filter(q=>q.forceInput)){
      for(const value of [q.choices[q.a],...(q.accept||[]),'不正解の文字列']){
        const node=()=>({value,innerHTML:'',disabled:false,classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
        const nodes=Object.fromEntries(['inputAns','inputCheck','fb','nextWrap','toast'].map(id=>[id,node()]));
        globalThis.document={getElementById:id=>nodes[id]||null,querySelectorAll:()=>[],createElement:()=>({firstChild:node()})};
        globalThis.window={};
        state.cur={sid:u.id,mode:'stage',list:[q],i:0,correct:0,combo:0,maxCombo:0,score:0,wrongThisRun:[]};
        checkInput(q);
        assert.equal(state.cur.correct,value==='不正解の文字列'?0:1,`${u.id}: ${value}`);
      }
    }
  }finally{globalThis.document=previousDocument;globalThis.window=previousWindow;}
});

// 自前教材の数式だけを対象にした検証用パーサー。アプリの採点処理とは独立。
function expression(s,vars={}){
  let src=s.replaceAll('＋','+').replaceAll('−','-').replaceAll('²','**2').replace(/√(\d+)/g,'Math.sqrt($1)');
  src=src.replace(/(\d|[xab])(?=[xab(])/g,'$1*').replace(/\)(?=[xab(])/g,')*').replace(/(\d)(?=Math)/g,'$1*');
  return Function(...Object.keys(vars),`return (${src})`)(...Object.values(vars));
}
function answer(u,i){const q=ma[u].questions[i];return q.type==='suji'?Number(q.a[0]):q.choices[q.a];}
function close(actual,expected){assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);}
function numeric(u,i,expected){close(answer(u,i),expected);}
function relation(text,x){
  if(text==='4以外のすべての実数')return x!==4;
  return text.split(' または ').some(part=>{
    const tokens=part.trim().split(/\s+/);
    for(let i=1;i<tokens.length;i+=2){
      const left=expression(tokens[i-1],{x}),right=expression(tokens[i+1],{x});
      const ok=({'＜':left<right,'＞':left>right,'≤':left<=right,'≥':left>=right})[tokens[i]];
      if(!ok)return false;
    }
    return true;
  });
}
test('9/16数学①: 分数・全ての展開/因数分解・有理化を独立計算で検証',()=>{
  numeric(0,0,-18*(1/3-1/2));numeric(0,1,(3/4)/(-3/2));
  const sources=[(x,a,b)=>(x+4)*(x-2),(x,a,b)=>(2*a-b)**2,(x,a,b)=>6*a*a*b+9*a*b*b,(x)=>x*x-7*x+12,(x)=>2*x*x+10*x+12];
  for(let i=2;i<=6;i++)for(const x of [-7,-1,0,0.5,2,9])for(const a of [-3,0,2])for(const b of [-2,1,4]){
    close(expression(answer(0,i),{x,a,b}),sources[i-2](x,a,b));
  }
  close(expression(answer(0,7)),6/Math.sqrt(3));
  close(expression(answer(0,8)),3/(Math.sqrt(5)-2));
  numeric(0,9,(Math.sqrt(7)+Math.sqrt(2))*(Math.sqrt(7)-Math.sqrt(2)));
});
test('9/16数学②: 相似と円周角、全ての一次不等式の境界と符号',()=>{
  numeric(1,0,112/2);numeric(1,1,37);numeric(1,2,8*9/6);numeric(1,3,15*4/10);
  const predicates=[x=>5*x+3<18,x=>-3*x+2>=11,x=>x/2-1>2,x=>4*x+6<=7*x-9,x=>x-5>3*(x+1)];
  for(let i=4;i<=8;i++)for(let k=-120;k<=120;k++){
    const x=k/10;assert.equal(relation(answer(1,i),x),predicates[i-4](x),`問${i+1}, x=${x}`);
  }
  numeric(1,9,((Math.sqrt(6)+1)-(Math.sqrt(6)-1))**2);
});
function extrema(f,start,end){const vals=[];for(let i=0;i<=1000;i++)vals.push(f(start+(end-start)*i/1000));return [Math.min(...vals),Math.max(...vals)];}
test('9/16数学③: 軸・最大最小・定義域の端・パラメータ境界',()=>{
  numeric(2,0,3);numeric(2,1,-((-2+2)**2)+5);
  numeric(2,2,extrema(x=>x*x-6*x+11,-7,13)[0]);
  numeric(2,3,extrema(x=>-2*x*x+8*x-3,-8,12)[1]);
  assert.equal(answer(2,4),'最大値はない');assert.ok(3*(1e6+1)**2-4>1e12);
  numeric(2,5,extrema(x=>-x*x+9,-2,2)[1]);
  numeric(2,6,Math.min(-((-2)**2)+9,-(1**2)+9));
  numeric(2,7,extrema(x=>x*x-4*x+1,0,1)[0]);
  for(const a of [0.002,0.5,1,1.5,2])close(expression(answer(2,8),{a}),extrema(x=>x*x-2*a*x+3,0,2)[0]);
  for(const a of [2.001,2.5,3,10])close(expression(answer(2,9),{a}),extrema(x=>x*x-2*a*x+3,0,2)[0]);
});
test('9/16数学④: 方程式の根、共有点数、全ての二次不等式と共通部分',()=>{
  const roots=answer(3,0).split(' と ').map(Number);
  assert.equal(new Set(roots).size,2);roots.forEach(x=>close(x*x-5*x+6,0));
  numeric(3,1,(-4)**2-4*4===0?1:2);numeric(3,2,2**2-4*5<0?0:2);
  const predicates=[x=>(x-1)*(x-5)<0,x=>(x+2)*(x-3)>=0,x=>x*x-4*x+3<=0,x=>-x*x+x+6>0,x=>(x-4)**2>0,x=>x*x-5*x+6>=0&&x*x-7*x+12<=0];
  for(let i=3;i<=8;i++)for(let k=-40;k<=40;k++){
    const x=k/4;assert.equal(relation(answer(3,i),x),predicates[i-3](x),`問${i+1}, x=${x}`);
  }
  numeric(3,9,-(-1+4));
});
function permutations(items,n){if(!n)return [[]];return items.flatMap((x,i)=>permutations(items.filter((_,j)=>i!==j),n-1).map(rest=>[x,...rest]));}
test('9/16数学⑤: 順列・組合せ・円順列・整数生成を全列挙で検証',()=>{
  numeric(4,0,permutations([0,1,2,3,4],3).length);
  numeric(4,1,new Set(permutations([0,1,2,3,4,5,6,7],3).map(p=>p.sort().join(','))).size);
  const lines=permutations([0,1,2,3,4,5],6);
  numeric(4,2,lines.filter(p=>(p[0]===0&&p[5]===1)||(p[0]===1&&p[5]===0)).length);
  const words=[];for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)for(let d=0;d<3;d++)words.push([a,b,c,d]);
  numeric(4,3,words.length);numeric(4,4,permutations([1,2,3,4],4).length);
  numeric(4,5,permutations([1,2,3,4,5],5).filter(p=>p[2]===1).length);
  const integers=permutations([0,1,2,3,4,5],3).filter(p=>p[0]!==0).map(p=>100*p[0]+10*p[1]+p[2]);
  numeric(4,6,integers.length);numeric(4,7,integers.filter(n=>n%5===0).length);numeric(4,8,words.length);
  const groups=new Set(permutations([0,1,2,3,4,5,6],3).filter(p=>p.filter(x=>x<4).length===2).map(p=>p.sort().join(',')));
  numeric(4,9,groups.size);
});
