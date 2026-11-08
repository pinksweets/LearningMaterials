import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute, subjectHash, studyUnitHash, mathChapterHash, syncScreenHash, NAV } from '../js/utils.js';
import { QUESTIONS, STAGE_ORDER, MATH1_SUBJECT, MATH1_ZERO_SUBJECT, MATH1_CHAPTERS, displaySubjectForStage, displayStagesOfSubject, studyUnitList, studyUnitById, studyUnitForStage } from '../js/content.js';
import { snapshotSession, restoreSession, sessionHash, questionFromKey } from '../js/session.js';
import { mathMarkup, mathText, mathVisual, quadraticSpec, quadraticFacts } from '../js/math-display.js';
import { state, save, load, SAVE_KEY } from '../js/state.js';
import { finishQuestion, renderSavedAnswer } from '../js/views/quiz.js';
import { renderResult } from '../js/views/results.js';
import { createLocalStorage } from './helpers/env.js';

function session(){return {sid:'sep16Ma1',mode:'stage',title:'数学①',list:[questionFromKey('sep16Ma1-0'),questionFromKey('sep16Ma1-1')],i:0,correct:0,combo:0,maxCombo:0,score:0,wrongThisRun:[],feverGauge:0,feverLeft:0,feverCount:0,weakHits:0};}
function dom(){
  const nodes=new Map();
  const node=()=>({value:'3',innerHTML:'',classList:{add(){},remove(){}},appendChild(){},addEventListener(){}});
  for(const id of ['fb','nextWrap','app','quizScore','quizCombo','homeBtn','retryBtn','toast'])nodes.set(id,node());
  globalThis.document={getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],createElement:()=>({firstChild:node()})};
  return nodes;
}

test('URLは日本語教科、特定問題、旧リンクを扱い、不正番号を拒否する',()=>{
  assert.deepEqual(parseRoute(subjectHash('📅 9/16 実力テスト対策')),{type:'subject',subject:'📅 9/16 実力テスト対策'});
  assert.deepEqual(parseRoute('#/question/sep16Ma3/6'),{type:'question',sid:'sep16Ma3',index:5});
  assert.equal(parseRoute('#test/2026-09-16').type,'september16');
  for(const hash of ['#/question/a/-1','#/question/a/0','#/subject/%XX','#/question/a/1/more'])assert.equal(parseRoute(hash).type,'invalid');
});

test('学習単元URLは章・グループ・WeekのIDを往復し、余分な階層や壊れたIDを拒否する',()=>{
  for(const id of ['math1:quadratics','stage:lp1c1w1','group:歴史Ⅰ']){
    const hash=studyUnitHash(id);
    assert.ok(hash.startsWith('#/unit/'));
    assert.deepEqual(parseRoute(hash),{type:'unit',unit:id});
  }
  for(const hash of ['#/unit/','#/unit/%XX','#/unit/stage:a/more'])assert.equal(parseRoute(hash).type,'invalid');
  assert.equal(mathChapterHash('quadratics'),'#/math1/quadratics');
  assert.deepEqual(parseRoute(mathChapterHash('quadratics')),{type:'math-chapter',chapter:'quadratics'});
});

test('学習単元は表示上の全ステージを一度ずつ含み、IDから元の問題へ到達できる',()=>{
  const units=studyUnitList();
  const sids=units.flatMap(unit=>unit.sids);
  assert.equal(new Set(units.map(unit=>unit.id)).size,units.length);
  assert.equal(new Set(sids).size,sids.length);
  assert.deepEqual(new Set(sids),new Set(STAGE_ORDER));
  for(const unit of units){
    assert.deepEqual(studyUnitById(unit.id),unit);
    assert.ok(unit.title);
    for(const sid of unit.sids){
      assert.equal(displaySubjectForStage(sid),unit.subject);
      assert.deepEqual(studyUnitForStage(sid),unit);
    }
  }
  for(const id of ['missing','group:missing','stage:missing','math1:missing',null])assert.equal(studyUnitById(id),undefined);
  assert.equal(studyUnitForStage('missing'),undefined);
});

test('数学Ⅰは章単位、LEAPはPartとCourseを保った個別Week単位で指定できる',()=>{
  const math=studyUnitList(MATH1_SUBJECT);
  assert.deepEqual(math.map(unit=>({id:unit.id,title:unit.title,group:unit.group,sids:unit.sids})),MATH1_CHAPTERS.map(chapter=>({
    id:'math1:'+chapter.id,title:chapter.title,group:'',sids:chapter.sections.flatMap(section=>section.sids)
  })));
  assert.deepEqual(studyUnitList(MATH1_ZERO_SUBJECT),math);
  const leapSubject='📘 LEAP Basic 必携英単語';
  const leap=studyUnitList(leapSubject);
  const leapSids=displayStagesOfSubject(leapSubject);
  assert.equal(leap.length,leapSids.length);
  assert.ok(leap.length>1);
  for(const [index,unit] of leap.entries()){
    const sid=leapSids[index];
    assert.deepEqual(unit,{id:'stage:'+sid,subject:leapSubject,title:QUESTIONS[sid].title,group:QUESTIONS[sid].group || '',sids:[sid]});
  }
  // 呼び出し元が配列を加工しても次回の単元一覧や章定義に影響しない。
  math[0].sids.length=0;
  assert.deepEqual(studyUnitList(MATH1_SUBJECT)[0].sids,MATH1_CHAPTERS[0].sections.flatMap(section=>section.sids));
});

test('ほかの教科は同じグループを一単元にまとめ、末尾の追加ステージも反映する',()=>{
  const subject='📜 歴史総合';
  const grouped=studyUnitList(subject).find(unit=>unit.group);
  assert.ok(grouped);
  const sid='unitAppendCheck';
  assert.equal(QUESTIONS[sid],undefined);
  const originalSids=grouped.sids.slice();
  try{
    QUESTIONS[sid]={subject,title:'追加練習',group:grouped.group,data:[]};
    STAGE_ORDER.push(sid);
    assert.deepEqual(studyUnitById(grouped.id).sids,[...originalSids,sid]);
    assert.equal(studyUnitForStage(sid).id,grouped.id);
    const standalone=studyUnitList().find(unit=>unit.id.startsWith('stage:') && unit.subject!=='📘 LEAP Basic 必携英単語');
    assert.ok(standalone);
    assert.equal(standalone.group,'');
    assert.equal(standalone.title,QUESTIONS[standalone.sids[0]].title);
  }finally{
    STAGE_ORDER.splice(STAGE_ORDER.indexOf(sid),1);
    delete QUESTIONS[sid];
  }
});

test('次問は履歴を置換し、復元中は履歴を追加しない',()=>{
  const calls=[];globalThis.window={location:{hash:'#home'},scrollY:123,scrollTo(){},history:{pushState(a,b,h){calls.push('push');window.location.hash=h;},replaceState(a,b,h){calls.push('replace');window.location.hash=h;}}};
  syncScreenHash('#/stage/sep16Ma1/1');syncScreenHash('#/stage/sep16Ma1/2',true);
  NAV.restoring=true;syncScreenHash('#home');NAV.restoring=false;
  assert.deepEqual(calls,['push','replace']);assert.equal(NAV.scroll['#home'],123);
  delete globalThis.window;
});

test('保存は問題参照のみ。入力・並び・採点済み・残り時間を復元する',()=>{
  const c=session();c.i=1;c.answer={correct:false,correctText:'−0.5'};c.draft=['-0.'];c._timeLeft=9;
  const raw=snapshotSession(c);assert.equal(raw.list,undefined);assert.equal(JSON.stringify(raw).includes('計算しよう'),false);
  const restored=restoreSession(raw);
  assert.equal(restored.list[1].q,c.list[1].q);assert.equal(restored._locked,true);assert.equal(restored._timeLeft,9);
  assert.deepEqual(restored.draft,['-0.']);assert.equal(sessionHash(restored),'#/stage/sep16Ma1/2');
  assert.equal(restoreSession({...raw,keys:['missing-0']}),null);
  assert.equal(restoreSession({...raw,i:5}),null);
  assert.equal(restoreSession({...raw,score:'broken'}),null);
});

test('共有問題は通常学習の途中経過を上書きせず、旧セーブも読める',()=>{
  globalThis.localStorage=createLocalStorage();globalThis.sessionStorage=createLocalStorage();
  state.cur=session();state.cur.draft=['途中'];save();
  state.cur={...session(),mode:'practice'};save();
  assert.equal(JSON.parse(localStorage.getItem(SAVE_KEY)).currentSession.mode,'stage');
  assert.equal(JSON.parse(sessionStorage.getItem('learning-quest-shared-practice')).mode,'practice');
  state.cur=null;load();assert.deepEqual(state.cur.draft,['途中']);
  localStorage.setItem(SAVE_KEY,JSON.stringify({totalScore:45}));load();
  assert.equal(state.cur,null);assert.equal(state.totalScore,45);
});

test('採点後の復元と二重クリックは成績・学習ログを増やさない',()=>{
  dom();globalThis.localStorage=createLocalStorage();state.settings.sound=false;
  state.cur=session();const q=state.cur.list[0];
  finishQuestion(true,q);const score=state.cur.score,seen=state.qStats[q._key].seen;
  state.cur=restoreSession(snapshotSession(state.cur));renderSavedAnswer(state.cur.list[0]);finishQuestion(true,state.cur.list[0]);
  assert.equal(state.cur.score,score);assert.equal(state.qStats[q._key].seen,seen);
  state.title='テスト';const before=state.totalScore;renderResult();
  state.cur=restoreSession(snapshotSession(state.cur));renderResult();
  assert.equal(state.totalScore,before+score);
});

test('分数、平方根、指数を構造化し、テキストをHTMLとして実行しない',()=>{
  assert.match(mathMarkup('3/(√5−2)'),/<mfrac><mn>3<\/mn><mrow><mo>\(<\/mo><msqrt>/);
  assert.match(mathMarkup('1/3−1/2'),/<\/mfrac><mo>−<\/mo><mfrac>/);
  assert.match(mathMarkup('(x−3)²'),/<msup><mrow>/);
  assert.doesNotMatch(mathText('<img src=x onerror=alert(1)>'),/<img/);
  assert.match(mathMarkup('6/√3'),/<mfrac><mn>6<\/mn><msqrt><mn>3<\/mn><\/msqrt><\/mfrac>/);
});

test('解答前にグラフの答えを見せず、図形の条件だけを表示する',()=>{
  for(let i=0;i<10;i++)assert.equal(mathVisual('sep16Ma3-'+i),'');
  assert.match(mathVisual('sep16Ma2-0'),/112°/);assert.doesNotMatch(mathVisual('sep16Ma2-0'),/56°/);
  assert.match(mathVisual('sep16Ma3-8',true),/mathParameter/);
  assert.match(mathVisual('sep16Ma4-4',true),/graphOpen|graphPoint/);
  assert.match(mathVisual('sep16Ma3-6',true),/定義域内のx軸との共有点は0個/);
});

test('図の係数と最大最小・共有点を独立した期待値で検証する',()=>{
  assert.equal(quadraticFacts(quadraticSpec('sep16Ma3-0')).axis,3);
  assert.equal(quadraticFacts(quadraticSpec('sep16Ma3-3')).vertex,5);
  assert.equal(quadraticFacts(quadraticSpec('sep16Ma3-6')).min,5);
  assert.equal(quadraticFacts(quadraticSpec('sep16Ma3-7')).min,-2);
  assert.equal(quadraticFacts(quadraticSpec('sep16Ma3-8',1)).min,2);
  assert.equal(quadraticFacts(quadraticSpec('sep16Ma3-8',3)).min,-5);
  assert.deepEqual(quadraticFacts(quadraticSpec('sep16Ma4-0')).roots,[2,3]);
  assert.deepEqual(quadraticFacts(quadraticSpec('sep16Ma4-1')).roots,[2]);
  assert.deepEqual(quadraticFacts(quadraticSpec('sep16Ma4-2')).roots,[]);
});
