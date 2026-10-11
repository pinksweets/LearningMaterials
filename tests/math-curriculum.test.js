import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTIONS, STAGE_ORDER, MATH1_SUBJECT, MATH1_ZERO_SUBJECT, MATH1_PREP_SUBJECT,
  MATH1_CHAPTERS, canonicalSubject, displaySubjectForStage, displayStagesOfSubject
} from '../js/content.js';
import {
  state, save, load, SAVE_KEY, subjectList, stagesOfSubject, subjectMastery,
  subjectClearedCount, weakestStage, dueList, cleanupStaleQStats
} from '../js/state.js';
import { createLocalStorage } from './helpers/env.js';

beforeEach(()=>{
  globalThis.localStorage=createLocalStorage();
  state.qStats={};
  state.stageCleared=Object.fromEntries(STAGE_ORDER.map(sid=>[sid,false]));
  state.stageBest=Object.fromEntries(STAGE_ORDER.map(sid=>[sid,0]));
  state.bossCleared={};
  state.lessonSeen={};
  state.studyLog={};
  state.cur=null;
  state.resumeSession=null;
});

test('通常の数学Ⅰとテスト対策は全35単元を重複・欠落なく分ける',()=>{
  const normal=displayStagesOfSubject(MATH1_SUBJECT);
  const prep=displayStagesOfSubject(MATH1_PREP_SUBJECT);
  const raw=STAGE_ORDER.filter(sid=>[MATH1_SUBJECT,MATH1_ZERO_SUBJECT].includes(QUESTIONS[sid].subject));
  assert.equal(normal.length,25);
  assert.equal(prep.length,10);
  assert.equal(normal.reduce((sum,sid)=>sum+QUESTIONS[sid].data.length,0),250);
  assert.equal(prep.reduce((sum,sid)=>sum+QUESTIONS[sid].data.length,0),124);
  assert.equal(new Set([...normal,...prep]).size,35);
  assert.deepEqual([...normal,...prep].sort(),raw.slice().sort());
  assert.deepEqual(MATH1_CHAPTERS.flatMap(chapter=>chapter.sections.flatMap(section=>section.sids)),normal);
  assert.deepEqual(normal.slice(0,6),['m1s1','m1s2','m1s3','m1s4','m1s5','m1s6']);
  assert.deepEqual(normal.slice(10,13),['njz1','m3s1','njz2']);
  assert.deepEqual(prep,['mqs1','mqs2','mqs3','mqs4','mqs5','mqs6','mqs7','mqs8','mqs9','mqmock1']);
  normal.push('unregistered');
  assert.equal(displayStagesOfSubject(MATH1_SUBJECT).includes('unregistered'),false);
});

test('旧ゼロから教科は通常数学Ⅰの別名として扱い、元データは変更しない',()=>{
  assert.equal(canonicalSubject(MATH1_ZERO_SUBJECT),MATH1_SUBJECT);
  assert.equal(canonicalSubject(MATH1_PREP_SUBJECT),MATH1_PREP_SUBJECT);
  assert.equal(displaySubjectForStage('njz7'),MATH1_SUBJECT);
  assert.equal(displaySubjectForStage('m3s2'),MATH1_SUBJECT);
  assert.equal(displaySubjectForStage('mqs2'),MATH1_PREP_SUBJECT);
  assert.equal(displaySubjectForStage('mqmock1'),MATH1_PREP_SUBJECT);
  assert.equal(displaySubjectForStage('s1'),QUESTIONS.s1.subject);
  assert.deepEqual(stagesOfSubject(MATH1_ZERO_SUBJECT),stagesOfSubject(MATH1_SUBJECT));
  assert.equal(QUESTIONS.njz7.subject,MATH1_ZERO_SUBJECT);
  assert.equal(QUESTIONS.mqs2.subject,MATH1_SUBJECT);
});

test('教科一覧は数学Ⅰを元の位置に集約し、ほかの教科の順序を維持する',()=>{
  const original=[...new Set(STAGE_ORDER.map(sid=>QUESTIONS[sid].subject || 'その他'))];
  const expected=original.filter(subject=>subject!==MATH1_ZERO_SUBJECT);
  expected.splice(expected.indexOf(MATH1_SUBJECT)+1,0,MATH1_PREP_SUBJECT);
  const displayed=subjectList();
  assert.deepEqual(displayed,expected);
  assert.equal(displayed.filter(subject=>subject===MATH1_SUBJECT).length,1);
  assert.equal(displayed.includes(MATH1_ZERO_SUBJECT),false);
  for(const subject of displayed.filter(subject=>![MATH1_SUBJECT,MATH1_PREP_SUBJECT].includes(subject))){
    assert.deepEqual(stagesOfSubject(subject),STAGE_ORDER.filter(sid=>(QUESTIONS[sid].subject || 'その他')===subject));
  }
});

test('クリア数・習熟度・弱点は通常教材とテスト対策で分離する',()=>{
  state.stageCleared.njz1=true;
  state.stageCleared.m3s1=true;
  state.stageCleared.mqs1=true;
  state.stageCleared.mqmock1=true;
  for(const key of ['njz1-0','m3s1-0','mqs1-0','mqmock1-0'])state.qStats[key]={seen:3,correct:3,box:3,due:'2099-01-01'};
  assert.deepEqual(subjectClearedCount(MATH1_SUBJECT),{cleared:2,total:25});
  assert.deepEqual(subjectClearedCount(MATH1_PREP_SUBJECT),{cleared:2,total:10});
  assert.deepEqual(subjectMastery(MATH1_SUBJECT),{pct:1,mastered:2,total:250});
  assert.deepEqual(subjectMastery(MATH1_PREP_SUBJECT),{pct:2,mastered:2,total:124});
  assert.deepEqual(subjectMastery(MATH1_ZERO_SUBJECT),subjectMastery(MATH1_SUBJECT));
  for(const sid of stagesOfSubject(MATH1_SUBJECT)){
    QUESTIONS[sid].data.forEach((q,i)=>{state.qStats[sid+'-'+i]={seen:3,correct:3,box:3,due:'2099-01-01'};});
  }
  assert.equal(weakestStage(MATH1_SUBJECT).pct,100);
  assert.equal(weakestStage(MATH1_PREP_SUBJECT).pct,0);
  assert.ok(stagesOfSubject(MATH1_SUBJECT).includes(weakestStage(MATH1_ZERO_SUBJECT).sid));
});

test('表示を統合しても旧キー・教科名を含む保存と復習は維持する',()=>{
  const keys=['njz1-0','m3s1-0','mqs1-0','mqmock1-0'];
  for(const key of keys)state.qStats[key]={seen:3,correct:2,box:0,due:'2000-01-01'};
  state.stageCleared.njz1=true;
  state.stageBest.njz1=70;
  state.bossCleared.njz10=true;
  state.lessonSeen.njz1=true;
  state.studyLog={'2026-10-11':{answered:4,correct:3,subjects:{[MATH1_ZERO_SUBJECT]:2,[MATH1_SUBJECT]:2},modes:{stage:4}}};
  state.cur={sid:'njz1',mode:'stage',title:QUESTIONS.njz1.title,list:QUESTIONS.njz1.data.map((q,i)=>({...q,_key:'njz1-'+i})),i:2,correct:1,score:10,combo:0,maxCombo:1,wrongThisRun:[],feverGauge:0,feverLeft:0,feverCount:0,weakHits:0};
  const originalStats=structuredClone(state.qStats);
  const originalLog=structuredClone(state.studyLog);
  save();
  const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
  assert.deepEqual(saved.qStats,originalStats);
  assert.deepEqual(saved.studyLog,originalLog);
  state.qStats={};state.lessonSeen={};state.studyLog={};state.stageBest.njz1=0;state.bossCleared={};state.cur=null;
  load();
  assert.deepEqual(state.qStats,originalStats);
  assert.deepEqual(state.studyLog,originalLog);
  assert.equal(state.lessonSeen.njz1,true);
  assert.equal(state.stageBest.njz1,70);
  assert.equal(state.stageCleared.njz1,true);
  assert.equal(state.bossCleared.njz10,true);
  assert.equal(state.cur.sid,'njz1');
  assert.equal(state.cur.i,2);
  assert.equal(state.cur.list[0]._key,'njz1-0');
  cleanupStaleQStats();
  assert.deepEqual(state.qStats,originalStats);
  assert.deepEqual(dueList().filter(q=>keys.includes(q._key)).map(q=>q._key).sort(),keys.slice().sort());
});
