import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createLocalStorage } from './helpers/env.js';
import { REPORTING, REPORT_ENDPOINT, reportConfig, configureReporting, queueReport, pendingReports, flushReports, sendReport, reportingStatus } from '../js/reporting.js';
import { reportCompletion } from '../js/views/reporting.js';
import { snapshotSession, restoreSession, questionFromKey } from '../js/session.js';

const endpoint='https://script.google.com/macros/s/TEST/exec';
const fields={mode:'stage',stage:'sep16Ma1',title:'数学',subject:'数学Ⅰ',outcome:'normal',partial:false,answered:10,correct:8,score:80,learned:null,elapsedSeconds:null};
beforeEach(()=>{
  globalThis.localStorage=createLocalStorage();
  REPORTING.busy=true;REPORTING.error='';
  configureReporting('S001',true);
});

test('完了を保存し再表示でも増えない。学習者は完了時で固定',()=>{
  const c={};queueReport(c,fields);queueReport(c,fields);
  assert.equal(pendingReports().length,1);
  configureReporting('S002',true);
  assert.equal(pendingReports()[0].endpoint,undefined);
  assert.equal(pendingReports()[0].payload.learner,'S001');
  assert.match(reportingStatus(c),/送信待ち/);
});
test('独立した2回の学習は同じ単元でも別の実績',()=>{
  queueReport({},fields);queueReport({},fields);assert.equal(pendingReports().length,2);
});
test('旧設定や送信待ちに残るURLよりソースの固定送信先を優先する',async()=>{
  localStorage.setItem('learning-quest-report-config-v1',JSON.stringify({endpoint,learner:'S001',enabled:true}));
  assert.deepEqual(reportConfig(),{learner:'S001',enabled:true});
  const payload={id:'legacy-id'};
  localStorage.setItem('learning-quest-report-v1:'+payload.id,JSON.stringify({endpoint,payload}));
  REPORTING.busy=false;
  globalThis.fetch=async(url,options)=>{
    assert.equal(url,REPORT_ENDPOINT);
    assert.equal(JSON.parse(options.body).id,payload.id);
    return {ok:true,json:async()=>({ok:true,id:payload.id})};
  };
  await flushReports();assert.equal(pendingReports().length,0);
});
test('設定OFF・未設定では収集せず、不正な学習者コードを拒否',()=>{
  configureReporting('',false);assert.equal(queueReport({},fields),false);
  assert.throws(()=>configureReporting('日本語',true));
});
test('成功応答だけで削除する。失敗・応答消失は同じIDのまま再送',async()=>{
  const c={};queueReport(c,fields);REPORTING.busy=false;
  const ids=[];
  globalThis.fetch=async(url,options)=>{ids.push(JSON.parse(options.body).id);throw Error('offline');};
  await flushReports();assert.equal(pendingReports().length,1);
  globalThis.fetch=async(url,options)=>{const p=JSON.parse(options.body);ids.push(p.id);return {ok:true,json:async()=>({ok:true,id:p.id})};};
  await flushReports();assert.equal(pendingReports().length,0);
  assert.equal(ids[0],ids[1]);assert.match(reportingStatus(c),/記録済み/);
});
test('成功に見える不一致IDやopaque応答を受領と扱わない',async()=>{
  const item={endpoint,payload:{id:'expected'}};
  await assert.rejects(sendReport(item,async()=>({ok:true,json:async()=>({ok:true,id:'other'})})));
  await assert.rejects(sendReport(item,async()=>({ok:false,type:'opaque'})));
});
test('OFFにすると送信待ちも停止し、保存容量エラーは通知する',async()=>{
  queueReport({},fields);configureReporting('S001',false);REPORTING.busy=false;
  globalThis.fetch=async()=>{assert.fail('OFF must not send');};await flushReports();assert.equal(pendingReports().length,1);
  configureReporting('S001',true);
  localStorage.setItem=()=>{throw Error('quota');};
  assert.equal(queueReport({},fields),false);assert.match(REPORTING.error,/保存できなかった/);
});
test('通常・復習・ボスの実績とLEAP自己判定を分離し、中断と共有1問を除外',()=>{
  for(const mode of ['stage','review','boss'])reportCompletion({mode,sid:'sep16Ma1',correct:2,wrongThisRun:[{}],score:20,result:'normal'});
  const leap={mode:'leap-speed',sid:'sep16Ma1'};
  reportCompletion(leap,{endedReason:'quit',judged:12});
  reportCompletion({mode:'practice',correct:1});
  assert.equal(pendingReports().length,3);
  reportCompletion(leap,{endedReason:'time',judged:12,learned:7,elapsedSeconds:180});
  const p=pendingReports().find(i=>i.payload.mode==='leap-speed').payload;
  assert.equal(p.correct,null);assert.equal(p.learned,7);assert.equal(p.answered,12);
});
test('セッション保存・復元で実績IDと予約済み状態を保つ',()=>{
  const c={sid:'sep16Ma1',mode:'stage',list:[questionFromKey('sep16Ma1-0')],i:0,correct:1,combo:1,maxCombo:1,score:10,feverGauge:0,feverLeft:0,feverCount:0,weakHits:0,wrongThisRun:[],result:'normal'};
  queueReport(c,fields);
  const restored=restoreSession(snapshotSession(c));
  assert.equal(restored.reportId,c.reportId);assert.equal(restored.reportQueued,true);
  queueReport(restored,fields);assert.equal(pendingReports().length,1);
});

function receiver(){
  const rows=[];
  const range=(row,col,n)=>({
    setFontWeight(){return this;},setBackground(){return this;},
    getValues(){return rows.slice(row-1,row-1+n);},
    createTextFinder(id){return {matchEntireCell(){return this;},findNext(){return rows.slice(1).some(r=>r[0]===id)?{}:null;}};}
  });
  const sheet={getLastRow:()=>rows.length,appendRow:r=>rows.push([...r]),setFrozenRows(){},getRange:range};
  let locked=false;
  const context=vm.createContext({Date,SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush(){}},LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true;},releaseLock(){locked=false;}})}});
  vm.runInContext(readFileSync(new URL('../integrations/google-apps-script/Code.gs',import.meta.url),'utf8'),context);
  return {context,rows};
}
test('受信側は再送を1行にまとめ、不正データと列変更を拒否する',()=>{
  queueReport({},fields);const p=pendingReports()[0].payload;
  const {context,rows}=receiver();
  assert.equal(context.storeReport(p).ok,true);assert.equal(context.storeReport(p).ok,true);
  assert.equal(rows.length,2);assert.equal(rows[1][13],80);
  assert.throws(()=>context.storeReport({...p,correct:11}));
  assert.equal(context.safeText('=IMPORTXML(...)'),"'=IMPORTXML(...)");
  rows[0][0]='different';assert.throws(()=>context.storeReport(p));
});
