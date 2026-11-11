/* tests/start.test.js — ホームの「すぐ始める」（単元を指定しなくても1タップで始められる）の検証 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { state, save, load, SAVE_KEY, setStudyMaterialStatus, deriveStageLastAt, normalizeStageLastAt, markStageStudied, stageLastStudied } from '../js/state.js';
import { QUESTIONS, studyUnitById } from '../js/content.js';
import { studyUnitHash, subjectHash } from '../js/utils.js';
import {
  startCandidates, startPanelHtml, subjectShelf, subjectShelfHtml, unitNextStage, stageStartHash,
  nextStageAfter, daysAgoLabel, resumableSession
} from '../js/views/start.js';
import { createLocalStorage } from './helpers/env.js';

const TODAY='2026-11-11';
const at=(date,hour=12)=>{const [y,m,d]=date.split('-').map(Number);return new Date(y,m-1,d,hour).getTime();};
function session(sid,i=0){
  return {sid,mode:'stage',title:QUESTIONS[sid].title,list:QUESTIONS[sid].data.map((q,index)=>({...q,_key:sid+'-'+index})),i,correct:0,score:0,combo:0,maxCombo:0,feverGauge:0,feverLeft:0,feverCount:0,weakHits:0,wrongThisRun:[]};
}

beforeEach(()=>{
  globalThis.localStorage=createLocalStorage();
  globalThis.sessionStorage=createLocalStorage();
  state.cur=null;state.resumeSession=null;
  state.studyMaterials={};state.stageCleared={};state.stageBest={};state.qStats={};state.lessonSeen={};state.stageLastAt={};
});

test('何も指定していない初回でも、最初の候補と教材一覧が出て1タップで始められる',()=>{
  const candidates=startCandidates(TODAY);
  assert.ok(candidates.length>=1 && candidates.length<=4);
  assert.equal(candidates[0].reason,'new');
  assert.equal(candidates[0].sid,'m1s1');
  assert.equal(candidates[0].href,'#/stage/m1s1/1');
  assert.equal(new Set(candidates.map(item=>item.subjectTitle)).size,candidates.length,'初回は教科を重ねずに並べる');
  const html=startPanelHtml(TODAY,0);
  assert.match(html,/<a class="startMain" data-start="next" href="#\/stage\/m1s1\/1"/);
  assert.doesNotMatch(html,/id="reviewBtn"/);
  assert.match(startPanelHtml(TODAY,7),/id="reviewBtn"[^>]*>🔁 今日の復習（7問）/);
  const shelf=subjectShelfHtml(TODAY);
  assert.ok(shelf.includes(`href="${subjectHash('📐 数学Ⅰ')}"`));
  assert.ok(shelf.includes(`href="${subjectHash('📘 LEAP Basic 必携英単語')}"`));
});

test('最近取り組んだ単元の続きが先頭に来て、クリア済みの次のステージから始まる',()=>{
  state.stageCleared.tr2=true;
  markStageStudied('tr2',at('2026-11-10'));
  markStageStudied('qi1',at('2026-11-05'));state.stageCleared.qi1=true;
  const [first,second]=startCandidates(TODAY);
  assert.equal(first.id,'math1:trigonometry');
  assert.equal(first.sid,'tr3','クリアした②の次へ進む');
  assert.equal(first.reason,'recent');
  assert.equal(second.id,'math1:quadratics');
  assert.equal(second.sid,'qi2','章の先頭ではなく、取り組んだ場所の続きから');
  // 途中のステージ（未クリア）が最新なら、そのステージをもう一度。
  markStageStudied('tr5',at('2026-11-11',9));
  assert.equal(unitNextStage(studyUnitById('math1:trigonometry')),'tr5');
  assert.match(startPanelHtml(TODAY,0),/data-start="next" href="#\/(?:stage\/tr5\/1|lesson\/tr5)"/);
});

test('レッスン未読のステージは「まなぶ」から、既読なら問題から始まる',()=>{
  const sid=Object.keys(QUESTIONS).find(id=>Array.isArray(QUESTIONS[id].lesson) && QUESTIONS[id].lesson.length);
  assert.ok(sid);
  assert.equal(stageStartHash(sid),'#/lesson/'+encodeURIComponent(sid));
  state.lessonSeen[sid]=true;
  assert.equal(stageStartHash(sid),'#/stage/'+encodeURIComponent(sid)+'/1');
});

test('単元を終えた教科は次の単元へ進み、完了した単元・過去のテスト対策は候補に出さない',()=>{
  // LEAP Week 1 をクリア → 完了扱い。次の候補は Week 2。
  state.stageCleared.lbp1c1w1=true;markStageStudied('lbp1c1w1',at('2026-11-10'));
  // 過去のテスト対策（11/10 英語小テスト）は、取り組んだ履歴があっても候補にしない。
  markStageStudied('nov10e1',at('2026-11-10',18));
  const candidates=startCandidates(TODAY);
  assert.equal(candidates[0].id,'stage:lbp1c1w2');
  assert.equal(candidates[0].reason,'next');
  assert.ok(candidates.every(item=>!item.sid.startsWith('nov10')));
  assert.ok(candidates.every(item=>item.id!=='stage:lbp1c1w1'));
  // 手動で完了にした単元も出さない。
  setStudyMaterialStatus('stage:lbp1c1w2','completed');
  assert.ok(startCandidates(TODAY).every(item=>item.id!=='stage:lbp1c1w2'));
});

test('これから・期間中のテスト対策は最優先で、終わったら過去のテスト対策へ移る',()=>{
  markStageStudied('tr2',at('2026-11-08'));
  const before=startCandidates('2026-11-09');
  assert.equal(before[0].reason,'test');
  assert.equal(before[0].subjectTitle,'11/10 英語小テスト対策');
  assert.ok(before[0].sid.startsWith('nov10'));
  assert.equal(startCandidates('2026-11-10')[0].reason,'test','当日も対象');
  assert.equal(startCandidates(TODAY)[0].id,'math1:trigonometry');
  const during=subjectShelf('2026-11-09'), after=subjectShelf(TODAY);
  assert.deepEqual(during.tests.map(entry=>entry.title),['11/10 英語小テスト対策']);
  assert.equal(after.tests.length,0);
  assert.ok(after.past.some(entry=>entry.title==='11/10 英語小テスト対策'));
  assert.ok(after.past.every(entry=>!entry.test.hidden),'非表示にした9月の対策は一覧にも出さない');
  assert.match(subjectShelfHtml(TODAY),/<details class="shelfPast">/);
});

test('「学習中にする」で指定した単元は候補に入り、途中のステージがあれば「続きから」が最優先',()=>{
  setStudyMaterialStatus('group:e1s1','studying');
  markStageStudied('tr2',at('2026-11-10'));
  const ids=startCandidates(TODAY).map(item=>item.id);
  assert.ok(ids.includes('group:e1s1'));
  assert.equal(ids[0],'math1:trigonometry','新しく取り組んだ単元が先');
  state.cur=session('njz1',2);
  assert.equal(resumableSession().sid,'njz1');
  const html=startPanelHtml(TODAY,0);
  assert.match(html,/<a class="startMain" data-start="resume" href="#\/stage\/njz1\/3"/);
  assert.match(html,/3問目から再開/);
  // 完了にした単元の途中経過はホームに出さない。
  setStudyMaterialStatus('math1:quadratics','completed');
  assert.equal(resumableSession(),null);
  assert.match(startPanelHtml(TODAY,0),/data-start="next"/);
});

test('結果画面の「次へ」は同じ単元の未クリア、なければ次のおすすめを返す',()=>{
  const unit=studyUnitById('group:e1s1');
  assert.ok(unit.sids.length>=2);
  const next=nextStageAfter(unit.sids[0],TODAY);
  assert.deepEqual({sid:next.sid,sameUnit:next.sameUnit},{sid:unit.sids[1],sameUnit:true});
  unit.sids.forEach(sid=>{state.stageCleared[sid]=true;});
  const other=nextStageAfter(unit.sids[0],TODAY);
  assert.equal(other.sameUnit,false);
  assert.ok(!unit.sids.includes(other.sid));
});

test('教材一覧は全ステージを終えた教科を隠し、取り組んだ教科に「前回」を出す',()=>{
  markStageStudied('s1',at('2026-11-10'));
  const html=subjectShelfHtml(TODAY);
  assert.match(html,/📜 歴史総合[\s\S]*?前回 きのう/);
  const before=subjectShelf(TODAY).main.map(entry=>entry.subject);
  assert.ok(before.includes('📜 歴史総合'));
  Object.keys(QUESTIONS).filter(sid=>QUESTIONS[sid].subject==='📜 歴史総合').forEach(sid=>{state.stageCleared[sid]=true;});
  assert.ok(!subjectShelf(TODAY).main.map(entry=>entry.subject).includes('📜 歴史総合'));
});

test('旧セーブ（stageLastAtなし）は回答履歴から最後に学習した日を推定し、保存後はそのまま復元する',()=>{
  const qStats={'tr2-0':{seen:2,correct:1,box:1,due:'2026-11-11'},'tr2-1':{seen:1,correct:0,box:0,due:'2026-11-08'},'qi1-0':{seen:3,correct:3,box:3,due:'2026-11-12'},'missing-0':{seen:1,correct:1,box:1,due:'2026-11-11'},'s1-0':{seen:0,correct:0,box:0,due:'2026-11-11'}};
  const derived=deriveStageLastAt(qStats);
  assert.deepEqual(Object.keys(derived).sort(),['qi1','tr2']);
  assert.equal(daysAgoLabel(derived.tr2,TODAY),'きのう','box1（+1日）のdueから前日を逆算');
  assert.equal(daysAgoLabel(derived.qi1,TODAY),'6日前','box3（+7日）のdueから逆算');
  localStorage.setItem(SAVE_KEY,JSON.stringify({totalScore:10,qStats}));
  load();
  assert.equal(daysAgoLabel(stageLastStudied('tr2'),TODAY),'きのう');
  markStageStudied('tr3',at('2026-11-11',8));
  save();state.stageLastAt={};load();
  assert.equal(stageLastStudied('tr3'),at('2026-11-11',8));
  assert.deepEqual(normalizeStageLastAt({tr2:5,missing:9,tr3:'x',qi1:-1}),{tr2:5});
  assert.deepEqual(normalizeStageLastAt(null),{});
  assert.equal(daysAgoLabel(0,TODAY),'');
  assert.equal(daysAgoLabel(at('2026-11-11',23),TODAY),'今日');
  assert.equal(daysAgoLabel(at('2026-10-28'),TODAY),'2週間前');
  assert.ok(studyUnitHash('math1:trigonometry'));
});
