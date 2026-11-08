import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  state, load, SAVE_KEY, normalizeStudyMaterials, studyMaterialStatus,
  studyMaterialProgress, setStudyMaterialStatus
} from '../js/state.js';
import { QUESTIONS, STAGE_ORDER, MATH1_SUBJECT, MATH1_ZERO_SUBJECT, studyUnitList, studyUnitById, studyUnitForStage } from '../js/content.js';
import {
  materialCatalog, activeStudyMaterials, studyMaterialsHtml, materialManagerHtml,
  materialChoiceHtml, bindMaterialActions
} from '../js/views/materials.js';
import { createLocalStorage } from './helpers/env.js';

const QUADRATICS='math1:quadratics';
const EXPRESSIONS='math1:expressions';
const LEAP_WEEK1='stage:lbp1c1w1';
const LEAP_WEEK2='stage:lbp1c1w2';
const LEAP_COURSE2_WEEK1='stage:lbp1c2w1';
const TENSE='group:e2s1';
const TODAY='2026-11-08';
const previousDocument=globalThis.document;
const previousStorage=globalThis.localStorage;
const unitHref=id=>'#/unit/'+encodeURIComponent(id);

// 各ケースは逐次実行し、実際の状態変更・保存を通してメニューの契約を確認する。
beforeEach(()=>{
  globalThis.localStorage=createLocalStorage();
  state.studyMaterials={};state.stageCleared={};state.stageBest={};state.qStats={};
  state.cur=null;state.resumeSession=null;
});
after(()=>{
  if(previousDocument===undefined)delete globalThis.document;
  else globalThis.document=previousDocument;
  if(previousStorage===undefined)delete globalThis.localStorage;
  else globalThis.localStorage=previousStorage;
});

test('教材指定は有効な単元IDと状態だけを受け入れ、教科名や不正な値を保存しない',()=>{
  for(const raw of [null,undefined,7,'studying',[],[QUADRATICS]])assert.deepEqual(normalizeStudyMaterials(raw),{});
  const raw={
    [QUADRATICS]:'studying',[LEAP_WEEK1]:'completed',[TENSE]:'available',
    [LEAP_WEEK2]:true,[MATH1_SUBJECT]:'studying',[MATH1_ZERO_SUBJECT]:'completed',
    'math1:unknown':'studying','group:missing':'completed'
  };
  assert.deepEqual(normalizeStudyMaterials(raw),{[QUADRATICS]:'studying',[LEAP_WEEK1]:'completed'});
  assert.equal(raw[TENSE],'available','正規化は入力を変更しない');
});

test('未指定・未知の単元は未完了で、不正な操作は指定も保存も変えない',()=>{
  assert.equal(studyMaterialStatus(QUADRATICS),'available');
  assert.equal(studyMaterialStatus('unknown'),'available');
  assert.deepEqual(studyMaterialProgress('unknown'),{cleared:0,total:0,pct:0,mastered:0,questions:0});
  assert.equal(setStudyMaterialStatus('unknown','studying'),false);
  assert.equal(setStudyMaterialStatus(MATH1_SUBJECT,'studying'),false);
  assert.equal(setStudyMaterialStatus(QUADRATICS,'invalid'),false);
  assert.deepEqual(state.studyMaterials,{});
  assert.equal(localStorage.getItem(SAVE_KEY),null);
});

test('二次関数の学習中・完了・指定解除は単元IDで保存される',()=>{
  assert.equal(setStudyMaterialStatus(QUADRATICS,'studying'),true);
  assert.equal(studyMaterialStatus(QUADRATICS),'studying');
  assert.deepEqual(JSON.parse(localStorage.getItem(SAVE_KEY)).studyMaterials,{[QUADRATICS]:'studying'});
  assert.equal(setStudyMaterialStatus(QUADRATICS,'completed'),true);
  assert.equal(studyMaterialStatus(QUADRATICS),'completed');
  assert.equal(studyMaterialStatus(EXPRESSIONS),'available');
  assert.equal(setStudyMaterialStatus(QUADRATICS,'available'),true);
  assert.deepEqual(state.studyMaterials,{});
  assert.deepEqual(JSON.parse(localStorage.getItem(SAVE_KEY)).studyMaterials,{});
});

test('一部クリアでは学習中を保ち、その単元の全ステージクリアでだけ自動完了する',()=>{
  setStudyMaterialStatus(QUADRATICS,'studying');
  const {sids}=studyUnitById(QUADRATICS);
  assert.equal(sids.length,25);
  state.stageCleared[sids[0]]=true;
  assert.equal(studyMaterialStatus(QUADRATICS),'studying');
  sids.forEach(sid=>{state.stageCleared[sid]=true;});
  assert.equal(studyMaterialStatus(QUADRATICS),'completed');
  assert.equal(studyMaterialStatus(EXPRESSIONS),'available');
  assert.deepEqual(state.qStats,{},'習熟履歴がなくても全ステージクリアは完了と判定する');
  assert.equal(state.studyMaterials[QUADRATICS],'studying','自動完了では利用者の指定を書き換えない');
});

test('グループ単元の自動完了後にステージが追加されると学習中に戻る',()=>{
  setStudyMaterialStatus(TENSE,'studying');
  const unit=studyUnitById(TENSE);
  assert.ok(unit.sids.length>1);
  unit.sids.forEach(sid=>{state.stageCleared[sid]=true;});
  assert.equal(studyMaterialStatus(TENSE),'completed');
  const sid='studyMaterialAppendCase';
  assert.equal(QUESTIONS[sid],undefined);
  QUESTIONS[sid]={subject:unit.subject,group:unit.group,title:'追加ステージ',data:[]};
  STAGE_ORDER.push(sid);
  try{
    assert.equal(studyUnitForStage(sid).id,TENSE);
    assert.equal(studyMaterialStatus(TENSE),'studying');
    assert.equal(state.studyMaterials[TENSE],'studying');
  }finally{
    STAGE_ORDER.splice(STAGE_ORDER.indexOf(sid),1);
    delete QUESTIONS[sid];
  }
});

test('LEAPはWeekとCourseごとに指定・完了を分離する',()=>{
  for(const id of [LEAP_WEEK1,LEAP_WEEK2,LEAP_COURSE2_WEEK1])setStudyMaterialStatus(id,'studying');
  const week1=studyUnitById(LEAP_WEEK1);
  assert.deepEqual(week1.sids,['lbp1c1w1']);
  assert.equal(week1.title,studyUnitById(LEAP_COURSE2_WEEK1).title);
  assert.notEqual(week1.group,studyUnitById(LEAP_COURSE2_WEEK1).group);
  state.stageCleared.lbp1c1w1=true;
  assert.equal(studyMaterialStatus(LEAP_WEEK1),'completed');
  assert.equal(studyMaterialStatus(LEAP_WEEK2),'studying');
  assert.equal(studyMaterialStatus(LEAP_COURSE2_WEEK1),'studying');
  setStudyMaterialStatus(LEAP_WEEK2,'completed');
  assert.equal(studyMaterialStatus(LEAP_COURSE2_WEEK1),'studying');
});

test('単元の進捗はクリア数と問題単位の習熟を集計し、別単元の履歴を混ぜない',()=>{
  state.stageCleared={njz1:true,m1s1:true};
  state.qStats={'njz1-0':{box:3},'qi10-9':{box:5},'njz1-1':{box:2},'m1s1-0':{box:5}};
  assert.deepEqual(studyMaterialProgress(QUADRATICS),{cleared:1,total:25,pct:1,mastered:2,questions:250});
  const questions=QUESTIONS.lbp1c1w1.data.length;
  assert.deepEqual(studyMaterialProgress(LEAP_WEEK1),{cleared:0,total:1,pct:0,mastered:0,questions});
  assert.ok(studyMaterialProgress(TENSE).total>1,'グループは複数ステージを集計する');
});

test('旧セーブ・不正な単元指定を読み込んでも既存スコアと問題履歴を保つ',()=>{
  const progress={totalScore:456,qStats:{'s1-0':{seen:2,correct:1,box:1,due:'2026-11-09'}}};
  state.studyMaterials={[QUADRATICS]:'completed'};
  localStorage.setItem(SAVE_KEY,JSON.stringify(progress));load();
  assert.deepEqual(state.studyMaterials,{});
  assert.equal(state.totalScore,456);assert.deepEqual(state.qStats,progress.qStats);
  for(const raw of [[],null,'broken',{[QUADRATICS]:false,[MATH1_SUBJECT]:'completed'}]){
    localStorage.setItem(SAVE_KEY,JSON.stringify({...progress,studyMaterials:raw}));load();
    assert.deepEqual(state.studyMaterials,{});assert.deepEqual(state.qStats,progress.qStats);
  }
  localStorage.setItem(SAVE_KEY,JSON.stringify({...progress,studyMaterials:{[QUADRATICS]:'studying',[LEAP_WEEK1]:'completed'}}));load();
  assert.deepEqual(state.studyMaterials,{[QUADRATICS]:'studying',[LEAP_WEEK1]:'completed'});
});

test('教材一覧は章・Week・グループを重複なく列挙し、非表示の9月教材を復活させない',()=>{
  const items=materialCatalog(TODAY), ids=items.map(item=>item.id);
  assert.equal(ids.length,new Set(ids).size);
  for(const id of [QUADRATICS,EXPRESSIONS,TENSE,LEAP_WEEK1,LEAP_WEEK2,LEAP_COURSE2_WEEK1])assert.ok(ids.includes(id),id);
  for(const subject of ['📅 9/11 小テスト対策','📅 9/15 英語小テスト対策','📅 9/16 実力テスト対策'])assert.ok(items.every(item=>item.subject!==subject),subject);
  assert.ok(!ids.includes(MATH1_SUBJECT));assert.ok(!ids.includes(MATH1_ZERO_SUBJECT));
  for(const item of items){assert.deepEqual(item.sids,studyUnitById(item.id).sids);assert.equal(item.href,unitHref(item.id));}
  assert.equal(items.find(item=>item.id===QUADRATICS).title,'二次関数');
  assert.equal(studyUnitList(MATH1_SUBJECT).length,4);
});

test('学習中メニューは二次関数と指定したWeekだけを直リンクで表示する',()=>{
  setStudyMaterialStatus(QUADRATICS,'studying');setStudyMaterialStatus(LEAP_WEEK1,'studying');setStudyMaterialStatus(LEAP_WEEK2,'completed');
  assert.deepEqual(new Set(activeStudyMaterials(TODAY).map(item=>item.id)),new Set([QUADRATICS,LEAP_WEEK1]));
  const html=studyMaterialsHtml(TODAY);
  assert.match(html,/aria-label="学習中の単元"/);
  assert.equal((html.match(/class="[^"]*\bstudyMaterialLink\b/g)||[]).length,2);
  for(const id of [QUADRATICS,LEAP_WEEK1])assert.ok(html.includes(`href="${unitHref(id)}"`));
  for(const id of [LEAP_WEEK2,LEAP_COURSE2_WEEK1,EXPRESSIONS])assert.ok(!html.includes(`href="${unitHref(id)}"`));
  assert.match(html,/Course 1/,'同じWeek名をCourseの表示で区別できる');
  studyUnitById(QUADRATICS).sids.forEach(sid=>{state.stageCleared[sid]=true;});
  assert.deepEqual(activeStudyMaterials(TODAY).map(item=>item.id),[LEAP_WEEK1]);
});

test('全完了・未指定でも空の学習中メニューに完了単元のリンクを出さない',()=>{
  const empty=studyMaterialsHtml(TODAY);
  assert.match(empty,/aria-label="学習中の単元"/);assert.doesNotMatch(empty,/class="[^"]*\bstudyMaterialLink\b/);
  state.studyMaterials=Object.fromEntries(materialCatalog(TODAY).map(item=>[item.id,'completed']));
  assert.deepEqual(activeStudyMaterials(TODAY),[]);
  const html=studyMaterialsHtml(TODAY);
  assert.doesNotMatch(html,/class="[^"]*\bstudyMaterialLink\b/);assert.ok(html.replace(/<[^>]+>/g,'').trim().length>0);
});

test('単元の選択カードは学習中にする・指定を外す操作と完了操作を区別する',()=>{
  const item=materialCatalog(TODAY).find(item=>item.id===QUADRATICS);
  const available=materialChoiceHtml(item);
  assert.ok(available.includes(`href="${item.href}"`));assert.match(available,/data-material-action="study"/);
  assert.match(available,/data-material-action="complete"/);assert.ok(available.includes(`data-material-id="${QUADRATICS}"`));
  setStudyMaterialStatus(QUADRATICS,'studying');
  const studying=materialChoiceHtml(item);
  assert.match(studying,/data-material-action="remove"/);assert.match(studying,/data-material-action="complete"/);
  assert.doesNotMatch(studying,/data-material-action="study"/);
});

test('完了単元は通常の選択肢から除き、閉じた管理欄にだけ戻す操作を置く',()=>{
  setStudyMaterialStatus(QUADRATICS,'completed');
  const html=materialManagerHtml(TODAY), restoreIndex=html.indexOf('data-material-action="restore"');
  assert.ok(restoreIndex>=0);
  const completedDetail=[...html.matchAll(/<details\b([^>]*)>/g)].find(match=>match[0].includes('id="completedMaterials"'));
  assert.ok(completedDetail);assert.doesNotMatch(completedDetail[1],/\bopen\b/);assert.ok(completedDetail.index<restoreIndex);
  const normal=html.slice(0,completedDetail.index);
  assert.ok(!normal.includes(`data-material-id="${QUADRATICS}"`));assert.ok(!normal.includes(unitHref(QUADRATICS)));
  assert.ok(normal.includes(unitHref(EXPRESSIONS)),'別の数学単元は引き続き選べる');
});

test('単元ボタンの操作は単元IDで状態と保存を更新し、呼び出し元へ通知する',()=>{
  const changes=[];
  const buttons=['study','remove','complete','restore'].map(materialAction=>({
    dataset:{materialAction,materialId:QUADRATICS},handlers:{},addEventListener(type,fn){this.handlers[type]=fn;}
  }));
  globalThis.document={getElementById:()=>null,querySelectorAll:selector=>selector==='[data-material-action]'?buttons:[]};
  bindMaterialActions(change=>changes.push(change));
  for(const [index,status] of ['studying','available','completed','available'].entries()){
    assert.equal(typeof buttons[index].handlers.click,'function');buttons[index].handlers.click({preventDefault(){},stopPropagation(){}});
    assert.equal(studyMaterialStatus(QUADRATICS),status);assert.deepEqual(changes.at(-1),{id:QUADRATICS,status});
    const saved=JSON.parse(localStorage.getItem(SAVE_KEY)).studyMaterials;
    assert.deepEqual(saved,status==='available'?{}:{[QUADRATICS]:status});assert.equal(studyMaterialStatus(EXPRESSIONS),'available');
  }
  assert.equal(changes.length,4);
});

test('単元検索は全角半角・大文字小文字を吸収し、複数語で絞り込み、該当なしを伝える',()=>{
  const input={value:'ＷＥＥＫ １ Course 2',handlers:{},addEventListener(type,fn){this.handlers[type]=fn;}};
  const empty={hidden:true};
  const row=materialSearch=>({dataset:{materialSearch,
    materialWeek:/week\s*(\d+)/.exec(materialSearch)?.[1] || '',
    materialCourse:/course\s*(\d+)/.exec(materialSearch)?.[1] || '',
    materialPart:/part\s*(\d+)/.exec(materialSearch)?.[1] || ''},hidden:false});
  const panels=[
    {open:false,rows:[row('leap basic course 1 week 1'),row('leap basic course 2 week 1'),row('leap basic course 2 week 2'),row('leap basic course 2 week 10')]},
    {open:false,rows:[row('数学Ⅰ 二次関数')]}
  ];
  panels.forEach(panel=>{panel.querySelectorAll=()=>panel.rows;});
  globalThis.document={
    getElementById:id=>id==='materialSearch'?input:id==='materialSearchEmpty'?empty:null,
    querySelectorAll:selector=>selector==='[data-material-subject-panel]'?panels:[]
  };
  bindMaterialActions(()=>{});
  assert.equal(panels[0].hidden,false);assert.equal(panels[0].open,true);
  assert.deepEqual(panels[0].rows.map(row=>row.hidden),[true,false,true,true]);assert.equal(panels[1].hidden,true);assert.equal(empty.hidden,true);
  input.value='Week1';input.handlers.input();
  assert.deepEqual(panels[0].rows.map(row=>row.hidden),[false,false,true,true],'Week 1とWeek 10を区別する');
  input.value='存在しない単元';input.handlers.input();
  assert.ok(panels.every(panel=>panel.hidden));assert.equal(empty.hidden,false);
  input.value='';input.handlers.input();
  assert.ok(panels.every(panel=>!panel.hidden));assert.ok(panels.every(panel=>panel.rows.every(row=>!row.hidden)));assert.equal(empty.hidden,true);
  assert.ok(panels.every(panel=>panel.open===false),'検索を消すと元の閉じた状態に戻る');
});

test('LEAP検索は実データのPart・Course・Weekを数値ごとに一致させる',()=>{
  const items=materialCatalog(TODAY).filter(item=>item.subject==='📘 LEAP Basic 必携英単語');
  const rows=items.map(item=>{
    const html=materialChoiceHtml(item);
    const attr=name=>new RegExp('data-material-'+name+'="([^"]*)"').exec(html)?.[1] || '';
    return {id:item.id,hidden:false,dataset:{
      materialSearch:attr('search'),materialWeek:attr('week'),
      materialCourse:attr('course'),materialPart:attr('part')
    }};
  });
  const input={value:'Week 1 Course 1',handlers:{},addEventListener(type,fn){this.handlers[type]=fn;}};
  const empty={hidden:true};
  const panel={open:false,querySelectorAll:()=>rows};
  globalThis.document={
    getElementById:id=>id==='materialSearch'?input:id==='materialSearchEmpty'?empty:null,
    querySelectorAll:selector=>selector==='[data-material-subject-panel]'?[panel]:[]
  };
  bindMaterialActions(()=>{});
  const visible=()=>rows.filter(row=>!row.hidden);
  assert.equal(visible().length,5,'5つのPartのCourse1・Week1だけを表示する');
  assert.ok(visible().every(row=>row.dataset.materialCourse==='1' && row.dataset.materialWeek==='1'));
  assert.ok(visible().some(row=>row.dataset.materialPart==='1'));
  assert.ok(visible().some(row=>row.dataset.materialPart==='2'));
  assert.equal(rows.find(row=>row.id==='stage:lbp1c2w1').hidden,true,'Part1を理由にCourse2を通さない');
  for(const query of ['Part1 Course1 Week1','Ｐａｒｔ １ Ｃｏｕｒｓｅ １ Ｗｅｅｋ １']){
    input.value=query;input.handlers.input();
    assert.deepEqual(visible().map(row=>row.id),['stage:lbp1c1w1']);
  }
  input.value='Part 2 Course 1 Week 1';input.handlers.input();
  assert.deepEqual(visible().map(row=>row.id),['stage:lbp2c1w1']);
  input.value='Part1 Course2 Week1';input.handlers.input();
  assert.deepEqual(visible().map(row=>row.id),['stage:lbp1c2w1']);
  input.value='Course1 Week1 意味・ニュアンス';input.handlers.input();
  assert.equal(visible().length,5,'数値指定以外の語句もAND条件にする');
  input.value='Course 10 Week 1';input.handlers.input();
  assert.equal(visible().length,0,'Course1とCourse10を区別する');
  assert.equal(empty.hidden,false);
  input.value='';input.handlers.input();
  assert.equal(visible().length,items.length);
  assert.equal(panel.open,false,'検索を消すと元の開閉状態に戻る');
});
