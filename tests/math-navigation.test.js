import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MATH1_SUBJECT, MATH1_ZERO_SUBJECT, MATH1_PREP_SUBJECT, QUESTIONS } from '../js/content.js';
import { mathChapterHash, subjectHash, parseRoute, todayStr, NAV } from '../js/utils.js';
import { state } from '../js/state.js';
import { snapshotSession } from '../js/session.js';
import { startStage, resumePanel, finishQuestion, renderQuestion } from '../js/views/quiz.js';
import { renderLesson } from '../js/views/lesson.js';
import { renderResult, renderBossDefeat, renderBossVictory } from '../js/views/results.js';
import { createLocalStorage } from './helpers/env.js';

// 最小DOMスタブで、実画面が登録した戻るイベントを実行する。ブラウザの描画検証は別途行う。
let nodes, screen;
function node(html=''){
  return {
    html, innerHTML:html, textContent:'', value:'', style:{}, dataset:{}, disabled:false,
    classList:{add(){},remove(){},toggle(){}}, events:{},
    addEventListener(type,fn){this.events[type]=fn;}, focus(){}, select(){},
    querySelectorAll(){return [];},
    querySelector(selector){
      if(selector==='form')return {elements:{learner:{value:''},enabled:{checked:false}},addEventListener(){}};
      if(selector==='[data-retry]')return node();
      return null;
    },
    appendChild(child){
      this.innerHTML+=child.innerHTML;
      for(const [,id] of child.innerHTML.matchAll(/\bid="([^"]+)"/g))nodes.set(id,node());
    }
  };
}
function installDom(){
  nodes=new Map();screen=node();nodes.set('app',screen);nodes.set('toast',node());
  globalThis.document={
    getElementById:id=>nodes.get(id)||null, querySelectorAll:()=>[],addEventListener(){},
    querySelector:selector=>selector==='h1'?{textContent:/<h1[^>]*>(.*?)<\/h1>/.exec(screen.innerHTML)?.[1] || ''}:null,
    createElement(){const builder=node();Object.defineProperty(builder,'firstChild',{get(){return node(builder.innerHTML);}});return builder;}
  };
  globalThis.window={
    location:{hash:'#home',href:'http://127.0.0.1:8012/LearningMaterials/#home'},scrollY:0,scrollTo(){},addEventListener(){},
    history:{pushState(_s,_t,hash){window.location.hash=hash;},replaceState(_s,_t,hash){window.location.hash=hash;}}
  };
  globalThis.localStorage=createLocalStorage();
  globalThis.sessionStorage=createLocalStorage();
}
function session(sid,mode='stage'){
  return {sid,mode,title:QUESTIONS[sid].title,list:QUESTIONS[sid].data.map((q,i)=>({...q,_key:sid+'-'+i})),i:0,correct:0,score:0,combo:0,maxCombo:0,feverGauge:0,feverLeft:0,feverCount:0,weakHits:0,wrongThisRun:[]};
}
function click(id){assert.ok(nodes.get(id)?.events.click,`${id}の戻るイベント`);nodes.get(id).events.click();}

beforeEach(()=>{
  installDom();NAV.current='';NAV.restoring=false;NAV.scroll={};
  state.cur=null;state.resumeSession=null;state.title='学びの見習い';state.qStats={};state.studyLog={};
  state.lessonSeen={};state.stageCleared={};state.stageBest={};state.bossCleared={};state.badges=new Set();
  state.settings={...state.settings,sound:false,englishSpeech:false,timeAttack:false};
});

test('章URLは直接開ける形式を保ち、不正なエンコードや余分な階層を拒否する',()=>{
  for(const chapter of ['expressions','logic','quadratics'])assert.deepEqual(parseRoute(mathChapterHash(chapter)),{type:'math-chapter',chapter});
  assert.deepEqual(parseRoute(subjectHash(MATH1_ZERO_SUBJECT)),{type:'subject',subject:MATH1_ZERO_SUBJECT});
  assert.deepEqual(parseRoute(subjectHash(MATH1_PREP_SUBJECT)),{type:'subject',subject:MATH1_PREP_SUBJECT});
  assert.equal(parseRoute('#/math1/%XX').type,'invalid');
  assert.equal(parseRoute('#/math1/quadratics/extra').type,'invalid');
});

test('途中経過は統合後の通常数学Ⅰとテスト対策の正しい一覧にだけ表示する',()=>{
  for(const sid of ['njz1','m3s2']){
    state.cur=session(sid);state.cur.i=2;
    assert.match(resumePanel(MATH1_SUBJECT),new RegExp(`/stage/${sid}/3`));
    assert.equal(resumePanel(MATH1_ZERO_SUBJECT),resumePanel(MATH1_SUBJECT));
    assert.equal(resumePanel(MATH1_PREP_SUBJECT),'');
  }
  for(const sid of ['mqs2','mqmock1']){
    state.cur=session(sid);
    assert.match(resumePanel(MATH1_PREP_SUBJECT),new RegExp(`/stage/${sid}/1`));
    assert.equal(resumePanel(MATH1_SUBJECT),'');
    assert.equal(resumePanel(MATH1_ZERO_SUBJECT),'');
  }
  state.resumeSession=snapshotSession(session('njz1'));
  state.cur=session('mqs2','practice');
  assert.match(resumePanel(MATH1_SUBJECT),/stage\/njz1\/1/);
  assert.equal(resumePanel(MATH1_PREP_SUBJECT),'');
});

test('レッスンと通常問題は数学Ⅰ・所属章を示し、戻ると二次関数の一覧になる',()=>{
  renderLesson('njz1');
  assert.ok(screen.innerHTML.includes(`href="${subjectHash(MATH1_SUBJECT)}"`));
  assert.ok(screen.innerHTML.includes(`href="${mathChapterHash('quadratics')}"`));
  assert.ok(!screen.innerHTML.includes(subjectHash(MATH1_ZERO_SUBJECT)));
  click('lessonBack');
  assert.equal(window.location.hash,mathChapterHash('quadratics'));
  startStage('m3s1');
  assert.ok(screen.innerHTML.includes(`href="${subjectHash(MATH1_SUBJECT)}"`));
  assert.ok(screen.innerHTML.includes(`href="${mathChapterHash('quadratics')}"`));
  click('quitBtn');
  assert.equal(window.location.hash,mathChapterHash('quadratics'));
  assert.equal(state.cur.sid,'m3s1');
});

test('テスト対策のレッスン・問題から戻ると通常教材に混ざらない',()=>{
  renderLesson('mqs1');
  assert.ok(screen.innerHTML.includes(`href="${subjectHash(MATH1_PREP_SUBJECT)}"`));
  assert.ok(!screen.innerHTML.includes('href="#/math1/'));
  click('lessonBack');
  assert.equal(window.location.hash,subjectHash(MATH1_PREP_SUBJECT));
  startStage('mqmock1');
  assert.ok(screen.innerHTML.includes(`href="${subjectHash(MATH1_PREP_SUBJECT)}"`));
  assert.ok(!screen.innerHTML.includes('href="#/math1/'));
  click('quitBtn');
  assert.equal(window.location.hash,subjectHash(MATH1_PREP_SUBJECT));
});

test('通常・共有練習・模試・ボス結果の戻り先を単元の所属に統一する',()=>{
  for(const [sid,mode,expected] of [
    ['njz1','stage',mathChapterHash('quadratics')],
    ['m1s1','practice',mathChapterHash('expressions')],
    ['mqmock1','stage',subjectHash(MATH1_PREP_SUBJECT)]
  ]){
    state.cur=session(sid,mode);renderResult();click('homeBtn');
    assert.equal(window.location.hash,expected);
  }
  for(const render of [renderBossDefeat,renderBossVictory]){
    state.cur={...session('njz10','boss'),lives:3,bossMaxHP:100,bossHP:40,bossName:'確認ボス'};
    render();click('homeBtn');
    assert.equal(window.location.hash,mathChapterHash('quadratics'));
  }
});

test('通常統合は回答履歴の元教科名を変えず、教科横断復習の戻り先を維持する',()=>{
  startStage('njz1');
  finishQuestion(true,state.cur.list[0]);
  assert.equal(state.studyLog[todayStr()].subjects[MATH1_ZERO_SUBJECT],1);
  assert.equal(state.studyLog[todayStr()].subjects[MATH1_SUBJECT],undefined);
  state.cur={...session('njz1'),sid:'review',mode:'review',title:'今日の復習'};
  // 今日の復習に混じった数学の問題でも、中断と結果は教科選択へ戻る。
  renderQuestion();click('quitBtn');
  assert.equal(window.location.hash,'#home');
  renderResult();click('homeBtn');
  assert.equal(window.location.hash,'#home');
});

test('直リンク・旧教科URL・範囲外番号を同じ数学Ⅰと対策ホームへ解決する',async()=>{
  // mainは起動イベントを登録するため、DOMスタブを用意してから読み込む。
  const {renderUrlScreen}=await import('../js/main.js');
  for(const hash of [mathChapterHash('expressions'),subjectHash(MATH1_ZERO_SUBJECT),subjectHash(MATH1_PREP_SUBJECT)]){
    window.location.hash=hash;renderUrlScreen(true);
    assert.match(screen.innerHTML,/数学Ⅰ/);
    assert.equal(NAV.restoring,false);
    if(hash===mathChapterHash('expressions'))assert.equal(document.title,'数学Ⅰ｜数と式｜学習クエスト');
  }
  for(const [hash,fallback] of [
    ['#/stage/njz1/999',mathChapterHash('quadratics')],
    ['#/stage/m3s1/999',mathChapterHash('quadratics')],
    ['#/stage/mqs1/999',subjectHash(MATH1_PREP_SUBJECT)],
    ['#/math1/unknown',subjectHash(MATH1_SUBJECT)]
  ]){
    state.cur=null;window.location.hash=hash;renderUrlScreen(true);
    assert.equal(window.location.hash,fallback);
    assert.equal(NAV.current,fallback);
    assert.equal(NAV.restoring,false);
  }
});
