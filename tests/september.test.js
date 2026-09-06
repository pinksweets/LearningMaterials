import { test } from 'node:test';
import assert from 'node:assert/strict';
import { units } from '../data/sep_english.js';
import { state, save, load, updateQStat } from '../js/state.js';
import { checkInput } from '../js/views/quiz.js';
import { septemberMistakes } from '../js/views/september.js';
import { speakEnglish } from '../js/audio.js';
import { createLocalStorage } from './helpers/env.js';

globalThis.localStorage=createLocalStorage();
function scoringDom(value){
  const node=()=>({value,disabled:false,classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
  const nodes=Object.fromEntries(['inputAns','inputCheck','fb','nextWrap','toast'].map(id=>[id,node()]));
  globalThis.document={getElementById:id=>nodes[id]||null,querySelectorAll:()=>[],createElement:()=>({firstChild:node()})};
  globalThis.window={};
  return nodes;
}
function score(q,value){
  const nodes=scoringDom(value);
  state.settings.sound=false;
  state.cur={sid:'sepEnWrite1',mode:'stage',list:[q],i:0,correct:0,combo:0,maxCombo:0,score:0,wrongThisRun:[]};
  checkInput(q);
  return {correct:state.cur.correct,nodes};
}
test('9月英語: 基本20項目を5問ずつ、仕上げA/Bは重複なく全項目を網羅',()=>{
  assert.equal(units.length,14);
  assert.equal(units.reduce((n,u)=>n+u.questions.length,0),80);
  const basic=units.filter(u=>u.id.includes('Choose'));
  assert.ok(basic.every(u=>u.questions.length===5));
  assert.deepEqual(basic.flatMap(u=>u.questions.map(q=>q.learn.no)),Array.from({length:20},(_,i)=>103+i));
  const mocks=units.filter(u=>u.id.includes('Mock'));
  assert.ok(mocks.every(u=>u.questions.length===10));
  assert.deepEqual(mocks.flatMap(u=>u.questions.map(q=>q.learn.no)).sort((a,b)=>a-b),Array.from({length:20},(_,i)=>103+i));
  assert.ok(mocks.flatMap(u=>u.questions).every(q=>q.forceInput && !q.hint));
});
test('日本語入力: 全許容解を受理、数値だけの誤一致を拒否、二重採点しない',()=>{
  for(const u of units){
    for(const q of u.questions.filter(q=>q.forceInput)){
      for(const answer of [q.choices[q.a],...q.accept])assert.equal(score(q,answer).correct,1,answer);
    }
  }
  const q=units.flatMap(u=>u.questions).find(q=>q.choices[0]==='3階');
  assert.equal(score(q,'３階').correct,1);
  assert.equal(score(q,'3年').correct,0);
  const keyed={...q,_key:'sepEnExtra2-1'};
  state.qStats={};
  score(keyed,'三階');
  checkInput(keyed);
  assert.equal(state.qStats[keyed._key].seen,1);
});
test('復習: 最後に間違えた英語問題だけを保存後も抽出し、正解で除外',()=>{
  state.qStats={};
  updateQStat('sepEnWrite1-0',false);
  updateQStat('sepEnWrite1-1',true);
  updateQStat('s1-0',false);
  save();state.qStats={};load();
  assert.deepEqual(septemberMistakes().map(q=>q._key),['sepEnWrite1-0']);
  updateQStat('sepEnWrite1-0',true);
  assert.equal(septemberMistakes().length,0);
  assert.equal(state.qStats['s1-0'].seen,1);
});
test('手動発音は自動音声OFFでも再生でき、設定を書き換えない',()=>{
  const spoken=[];
  state.settings.englishSpeech=false;
  globalThis.window={speechSynthesis:{cancel(){},speak:u=>spoken.push(u)},SpeechSynthesisUtterance:class {constructor(text){this.text=text;}}};
  assert.equal(speakEnglish('happen'),false);
  assert.equal(speakEnglish('happen',{manual:true}),true);
  assert.equal(spoken[0].text,'happen');
  assert.equal(state.settings.englishSpeech,false);
  globalThis.window={};
  assert.equal(speakEnglish('happen',{manual:true}),false);
});
