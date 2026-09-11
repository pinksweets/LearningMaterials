import { test } from 'node:test';
import assert from 'node:assert/strict';
import { units } from '../data/sep15_english.js';
import { state, save, load, updateQStat } from '../js/state.js';
import { checkInput } from '../js/views/quiz.js';
import { renderSubjectHome } from '../js/views/subject.js';
import { renderSeptember15Learn, september15Mistakes, september15Subject } from '../js/views/september15.js';
import { septemberMistakes } from '../js/views/september.js';
import { createLocalStorage } from './helpers/env.js';

globalThis.localStorage=createLocalStorage();
function dom(value=''){
  const node=()=>({value,innerHTML:'',disabled:false,classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
  const nodes=Object.fromEntries(['app','sepBack','sep15English','sepListen','sepPrev','sepNext','sepLearnBack','inputAns','inputCheck','fb','nextWrap','toast'].map(id=>[id,node()]));
  globalThis.document={getElementById:id=>nodes[id]||null,querySelectorAll:()=>[],createElement:()=>({firstChild:node()})};
  globalThis.window={};
  return nodes;
}
test('9/15英語: 写真の20項目を網羅し、14ステージ80問で前回と同じ構成',()=>{
  assert.equal(units.length,14);
  assert.equal(units.reduce((n,u)=>n+u.questions.length,0),80);
  for(const kind of ['Choose','Write','Mock']){
    const selected=units.filter(u=>u.id.includes(kind));
    assert.ok(selected.every(u=>u.questions.length===(kind==='Mock'?10:5)));
    assert.deepEqual(selected.flatMap(u=>u.questions.map(q=>q.learn.no)).sort((a,b)=>a-b),Array.from({length:20},(_,i)=>123+i));
  }
  for(const q of units.filter(u=>u.id.includes('Choose')).flatMap(u=>u.questions))assert.equal(new Set(q.choices).size,4);
  assert.ok(units.filter(u=>u.id.includes('Mock')).flatMap(u=>u.questions).every(q=>q.forceInput && !q.hint));
  assert.ok(units.every(u=>u.page==='48〜53' && u.subject===september15Subject()));
});
test('9/15英語: 日本語入力の全許容解を採点でき、誤答を拒否する',()=>{
  state.settings.sound=false;
  for(const u of units){
    for(const q of u.questions.filter(q=>q.forceInput)){
      for(const value of [q.choices[q.a],...q.accept,'これは誤答']){
        dom(value);
        state.cur={sid:u.id,mode:'stage',list:[q],i:0,correct:0,combo:0,maxCombo:0,score:0,wrongThisRun:[]};
        checkInput(q);
        assert.equal(state.cur.correct,value==='これは誤答'?0:1,`${u.id}: ${value}`);
      }
    }
  }
});
test('9/15英語: 保存後も前回分と復習が混ざらず、正解した問題を除外',()=>{
  state.qStats={};
  updateQStat('sep15EnWrite1-0',false);
  updateQStat('sepEnWrite1-0',false);
  updateQStat('sep15EnWrite1-1',true);
  save();state.qStats={};load();
  assert.deepEqual(september15Mistakes().map(q=>q._key),['sep15EnWrite1-0']);
  assert.deepEqual(septemberMistakes().map(q=>q._key),['sepEnWrite1-0']);
  updateQStat('sep15EnWrite1-0',true);
  assert.equal(september15Mistakes().length,0);
});
test('9/15英語: 教科カードの遷移先と全20語の暗記画面を描画できる',()=>{
  const nodes=dom();
  renderSubjectHome(september15Subject());
  assert.match(nodes.app.innerHTML,/9月15日/);
  assert.match(nodes.app.innerHTML,/No.123〜142/);
  assert.match(nodes.app.innerHTML,/sep15EnMock2/);
  assert.doesNotMatch(nodes.app.innerHTML,/sepEnChoose|9月8日|42〜47/);
  for(let group=0;group<4;group++){
    for(let index=0;index<5;index++){
      renderSeptember15Learn(group,index);
      assert.ok(nodes.app.innerHTML.includes(`No.${123+group*5+index}`));
      assert.match(nodes.app.innerHTML,/発音を聞く/);
    }
  }
});
