import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isChemicalFormulaMatch} from '../js/answers.js';
import {units} from '../data/ch1_formula.js';
import {state} from '../js/state.js';
import {checkInput} from '../js/views/quiz.js';
import {isMockExam,examTotal} from '../js/mock-exam.js';
import {createLocalStorage} from './helpers/env.js';

test('化学式は大小文字を区別し、普通の数字・全角・下付き数字を許容する',()=>{
  for(const s of ['H2O','H₂O','Ｈ２Ｏ',' H2O '])assert.ok(isChemicalFormulaMatch(s,['H₂O']));
  for(const s of ['h2o','HO2','H2O2','H2Oです',''])assert.equal(isChemicalFormulaMatch(s,['H₂O']),false);
  assert.ok(isChemicalFormulaMatch('Ca(OH)2',['Ca(OH)₂']));
  assert.ok(isChemicalFormulaMatch('SO42−',['SO₄²⁻']));
  assert.equal(isChemicalFormulaMatch('CaOH2',['Ca(OH)₂']),false);
  assert.equal(isChemicalFormulaMatch('CO',['Co']),false);
  assert.equal(isChemicalFormulaMatch('NH4',['NH₄⁺']),false);
});

test('各練習は6問・説明3枚、最終確認は6問20点で復習先につながる',()=>{
  assert.equal(units.length,5);
  for(const u of units){
    assert.equal(u.questions.length,6);
    for(const q of u.questions)assert.ok(q.forceInput && q.chemicalFormula && q.examPractice);
  }
  for(const u of units.slice(0,4))assert.equal(u.lesson.length,3);
  const c={mode:'stage',list:units[4].questions};
  assert.ok(isMockExam(c));assert.equal(examTotal(c),20);
  for(const q of c.list)assert.ok(units.some(u=>u.id===q.sourceStage));
});

test('実入力採点で大小文字の誤りを除外し、ミニテストは正誤を最後まで隠す',()=>{
  const node=()=>({innerHTML:'',classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
  const nodes={fb:node(),nextWrap:node(),inputAns:node(),inputCheck:node()};
  globalThis.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({...node(),firstChild:node()})};
  globalThis.localStorage=createLocalStorage();
  const list=units[4].questions.map((q,i)=>({...q,_key:`ch1f5-${i}`}));
  for(const [value,score] of [['h2o',0],['H2O',2]]){
    state.cur={sid:'ch1f5',mode:'stage',list,i:0,correct:0,score:0,combo:0,maxCombo:0,wrongThisRun:[]};
    nodes.inputAns.value=value;
    nodes.inputAns.classList.add=()=>assert.fail('正誤の色を先に出さない');
    checkInput(list[0]);
    assert.equal(state.cur.score,score);
    checkInput(list[0]);assert.equal(state.cur.score,score);
    assert.doesNotMatch(nodes.fb.innerHTML,/正解：|⭕|❌/);
    assert.ok(!nodes.fb.innerHTML.includes(list[0].exp));
  }
});
