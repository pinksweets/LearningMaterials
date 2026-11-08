import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MATH1_SUBJECT, MATH1_ZERO_SUBJECT, MATH1_PREP_SUBJECT, QUESTIONS, studyUnitById, studyUnitList } from '../js/content.js';
import { mathChapterHash, subjectHash, studyUnitHash, parseRoute, todayStr, NAV } from '../js/utils.js';
import { state, save, load, studyMaterialStatus, setStudyMaterialStatus } from '../js/state.js';
import { snapshotSession } from '../js/session.js';
import { startStage, resumePanel, finishQuestion, renderQuestion } from '../js/views/quiz.js';
import { renderLesson } from '../js/views/lesson.js';
import { renderHome } from '../js/views/home.js';
import { renderLeapSpeedResult } from '../js/views/leap.js';
import { createLeapSession, finishLeapSession } from '../js/leap-study.js';
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
  state.studyMaterials={};
  state.settings={...state.settings,sound:false,englishSpeech:false,timeAttack:false};
});

test('単元未指定のホームは選択欄を開き、指定後は学習中メニューをログ・設定より先に置く（DOMスタブ）',()=>{
  renderHome();
  assert.match(screen.innerHTML,/<details\b[^>]*id="materialManager"[^>]*\bopen\b/);
  assert.doesNotMatch(screen.innerHTML,/class="studyMaterialLink"/);
  setStudyMaterialStatus('math1:quadratics','studying');
  setStudyMaterialStatus('stage:lbp1c1w1','studying');
  renderHome();
  const menu=/<section class="studyMaterials"[\s\S]*?<\/section>/.exec(screen.innerHTML)?.[0];
  assert.ok(menu);
  assert.ok(menu.includes(`href="${studyUnitHash('math1:quadratics')}"`));
  assert.ok(menu.includes(`href="${studyUnitHash('stage:lbp1c1w1')}"`));
  assert.ok(!menu.includes(studyUnitHash('math1:expressions')));
  assert.ok(!menu.includes(studyUnitHash('stage:lbp1c1w2')));
  assert.equal((menu.match(/class="studyMaterialLink"/g)||[]).length,2);
  const menuIndex=screen.innerHTML.indexOf(menu);
  const logIndex=screen.innerHTML.indexOf('class="studyPanel"');
  const settingsIndex=screen.innerHTML.indexOf('class="homeSettings"');
  assert.ok(menuIndex>=0 && logIndex>menuIndex && settingsIndex>menuIndex);
  const manager=/<details\b[^>]*id="materialManager"[^>]*>/.exec(screen.innerHTML)?.[0];
  assert.ok(manager);
  assert.doesNotMatch(manager,/\bopen\b/);
});

test('単元の指定を保存・復元すると、ホームで同じ二次関数とWeekを選べる（DOMスタブ）',()=>{
  setStudyMaterialStatus('math1:quadratics','studying');
  setStudyMaterialStatus('stage:lbp1c1w1','studying');
  save();
  state.studyMaterials={};
  load();
  renderHome();
  const menu=/<section class="studyMaterials"[\s\S]*?<\/section>/.exec(screen.innerHTML)?.[0];
  assert.ok(menu);
  for(const id of ['math1:quadratics','stage:lbp1c1w1']){
    assert.equal(studyMaterialStatus(id),'studying');
    assert.ok(menu.includes(`href="${studyUnitHash(id)}"`));
  }
  assert.equal((menu.match(/class="studyMaterialLink"/g)||[]).length,2);
});

test('完了した単元はホームと全体の再開欄から隠れ、教科の再開欄と直リンクは使える（DOMスタブ）',async()=>{
  const {renderUrlScreen}=await import('../js/main.js');
  for(const completion of ['manual','all-stages']){
    state.studyMaterials={};state.stageCleared={};
    state.cur=session('njz1');state.cur.i=2;
    setStudyMaterialStatus('math1:quadratics','studying');
    renderHome();
    assert.match(screen.innerHTML,/class="resumePanel"/);
    if(completion==='manual')setStudyMaterialStatus('math1:quadratics','completed');
    else studyUnitById('math1:quadratics').sids.forEach(sid=>{state.stageCleared[sid]=true;});
    renderHome();
    assert.equal(studyMaterialStatus('math1:quadratics'),'completed');
    assert.ok(!screen.innerHTML.includes(`href="${studyUnitHash('math1:quadratics')}"`));
    assert.doesNotMatch(screen.innerHTML,/class="resumePanel"/);
    assert.equal(resumePanel(),'');
    assert.match(resumePanel(MATH1_SUBJECT),/stage\/njz1\/3/);
    window.location.hash=subjectHash(MATH1_SUBJECT);
    renderUrlScreen(true);
    assert.match(screen.innerHTML,/class="mathChapterCard"/);
    assert.match(screen.innerHTML,/class="resumePanel"/);
    window.location.hash='#/stage/njz1/3';
    renderUrlScreen(true);
    assert.equal(state.cur.sid,'njz1');
    assert.equal(state.cur.i,2);
    assert.equal(window.location.hash,'#/stage/njz1/3');
    assert.equal(studyMaterialStatus('math1:quadratics'),'completed');
  }
});

test('単元を手動で完了にしてホームへ戻っても回答履歴・ベスト・クリア記録は変わらない（DOMスタブ）',()=>{
  state.qStats={'mqs1-0':{seen:4,correct:3,box:2,due:'2026-11-12'}};
  state.stageBest={mqs1:90};state.stageCleared={mqs1:true};
  const expected=structuredClone({qStats:state.qStats,stageBest:state.stageBest,stageCleared:state.stageCleared});
  setStudyMaterialStatus('group:mqs1','studying');
  setStudyMaterialStatus('group:mqs1','completed');
  renderHome();
  load();
  assert.equal(studyMaterialStatus('group:mqs1'),'completed');
  assert.deepEqual({qStats:state.qStats,stageBest:state.stageBest,stageCleared:state.stageCleared},expected);
});

test('LEAPの日課はWeekを学習中に指定した間だけホームに表示する（DOMスタブ）',()=>{
  const id='stage:lbp1c1w1';
  renderHome();
  assert.doesNotMatch(screen.innerHTML,/class="leapDailyPanel"/);
  setStudyMaterialStatus(id,'studying');
  renderHome();
  assert.match(screen.innerHTML,/class="leapDailyPanel"/);
  setStudyMaterialStatus(id,'completed');
  renderHome();
  assert.doesNotMatch(screen.innerHTML,/class="leapDailyPanel"/);
});

test('単元URLは指定Week・Courseだけを開き、グループ・数学章へ進め、未知単元はホームへ戻る（DOMスタブ）',async()=>{
  const {renderUrlScreen}=await import('../js/main.js');
  for(const id of ['stage:lbp1c1w1','group:e1s1']){
    window.location.hash=studyUnitHash(id);renderUrlScreen(true);
    const ids=[...screen.innerHTML.matchAll(/class="stage" data-stage="([^"]+)"/g)].map(match=>match[1]);
    assert.deepEqual(ids,studyUnitById(id).sids);
    assert.ok(!ids.includes('lbp1c1w2'));assert.ok(!ids.includes('lbp1c2w1'));
    assert.equal(window.location.hash,studyUnitHash(id));
  }
  window.location.hash=studyUnitHash('math1:quadratics');renderUrlScreen(true);
  assert.match(screen.innerHTML,/data-math-stage="njz1"/);
  assert.match(screen.innerHTML,/data-math-stage="qi10"/);
  assert.doesNotMatch(screen.innerHTML,/data-math-stage="m1s1"|data-math-stage="tr2"/);
  window.location.hash=studyUnitHash('stage:missing');renderUrlScreen(true);
  assert.equal(window.location.hash,'#home');assert.match(screen.innerHTML,/class="studyMaterials"/);
});

test('選択中グループの結果からは単元へ戻り、最終ステージのクリア後はホームでその単元を隠す（DOMスタブ）',()=>{
  const id='group:e1s1';
  // 指定のない従来経路は教科全体へ戻る。
  state.cur=session('e1s1');state.cur.i=state.cur.list.length;renderResult();click('homeBtn');
  assert.equal(window.location.hash,subjectHash('🇬🇧 総合英語 Harmony'));
  assert.match(screen.innerHTML,/class="stage" data-stage="e2s1"/);
  setStudyMaterialStatus(id,'studying');
  state.cur=session('e1s1');state.cur.i=state.cur.list.length;renderResult();click('homeBtn');
  assert.equal(window.location.hash,studyUnitHash(id));
  const ids=[...screen.innerHTML.matchAll(/class="stage" data-stage="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(ids,studyUnitById(id).sids);assert.ok(!ids.includes('e2s1'));
  studyUnitById(id).sids.forEach(sid=>{state.stageCleared[sid]=true;});
  state.cur=session('e1s1');state.cur.i=state.cur.list.length;renderResult();click('homeBtn');
  assert.equal(window.location.hash,'#home');assert.equal(studyMaterialStatus(id),'completed');
  assert.ok(!screen.innerHTML.includes(`href="${studyUnitHash(id)}"`));
  assert.doesNotMatch(screen.innerHTML,/class="stage" data-stage=/);
});

test('選択したLEAPのWeekを終えるとホームへ戻り、別WeekやCourseの一覧を出さない（DOMスタブ）',()=>{
  const id='stage:lbp1c1w1';
  setStudyMaterialStatus(id,'studying');setStudyMaterialStatus('stage:lbp1c1w2','studying');
  state.cur=session('lbp1c1w1');state.cur.i=state.cur.list.length;renderResult();click('homeBtn');
  assert.equal(window.location.hash,'#home');assert.equal(studyMaterialStatus(id),'completed');
  const menu=/<section class="studyMaterials"[\s\S]*?<\/section>/.exec(screen.innerHTML)?.[0];
  assert.ok(menu);assert.ok(!menu.includes(studyUnitHash(id)));
  assert.ok(menu.includes(studyUnitHash('stage:lbp1c1w2')));assert.ok(!menu.includes(studyUnitHash('stage:lbp1c2w1')));
});

test('化学の単元URLには選んだ節のステージだけを出し、教科全体のプランや模試を混ぜない（DOMスタブ）',async()=>{
  const {renderUrlScreen}=await import('../js/main.js');
  const id='group:ch1s1';
  window.location.hash=studyUnitHash(id);renderUrlScreen(true);
  const ids=[...screen.innerHTML.matchAll(/class="stage" data-stage="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(ids,['ch1s1','ch1s2']);
  assert.deepEqual(ids,studyUnitById(id).sids);
  assert.doesNotMatch(screen.innerHTML,/ch1f1|ch1mock1|class="sepPlan"/);
  assert.equal(window.location.hash,studyUnitHash(id));
});

test('数学の章の再開欄はその章の個人セッションだけを出し、共有練習中も個人の再開先を使う（DOMスタブ）',async()=>{
  const {renderMathHome}=await import('../js/views/math.js');
  const personal=session('njz1');personal.i=2;
  state.cur=personal;
  renderMathHome('expressions');
  assert.doesNotMatch(screen.innerHTML,/class="resumePanel"/);
  renderMathHome('quadratics');
  assert.match(screen.innerHTML,/class="resumePanel"/);
  assert.match(screen.innerHTML,/href="#\/stage\/njz1\/3"/);
  state.resumeSession=snapshotSession(personal);
  state.cur=session('m1s1','practice');
  renderMathHome('expressions');
  assert.doesNotMatch(screen.innerHTML,/class="resumePanel"/);
  renderMathHome('quadratics');
  assert.match(screen.innerHTML,/href="#\/stage\/njz1\/3"/);
  assert.ok(!resumePanel(MATH1_SUBJECT,'math1:quadratics').includes('/question/m1s1/'));
});

test('数学の完了した章は一覧・他章ナビ・案内から隠れ、直接開いた復習は残る（DOMスタブ）',async()=>{
  const {renderMathHome}=await import('../js/views/math.js');
  setStudyMaterialStatus('math1:quadratics','completed');
  renderMathHome();
  assert.ok(!screen.innerHTML.includes(`href="${mathChapterHash('quadratics')}"`));
  assert.doesNotMatch(screen.innerHTML,/class="mathStartBox"|data-math-stage="njz1"/);
  assert.ok(screen.innerHTML.includes(`href="${mathChapterHash('expressions')}"`));
  renderMathHome('expressions');
  const nav=/<nav class="mathChapterNav"[\s\S]*?<\/nav>/.exec(screen.innerHTML)?.[0];
  assert.ok(nav);assert.ok(!nav.includes(mathChapterHash('quadratics')));
  assert.ok(nav.includes(mathChapterHash('expressions')));
  assert.match(screen.innerHTML,/class="mathPrepLink"/);
  studyUnitList(MATH1_PREP_SUBJECT).forEach(unit=>setStudyMaterialStatus(unit.id,'completed'));
  renderMathHome('expressions');
  assert.doesNotMatch(screen.innerHTML,/class="mathPrepLink"/);
  renderMathHome('quadratics');
  assert.match(screen.innerHTML,/data-math-stage="njz1"/);
  assert.ok(screen.innerHTML.includes(`href="${mathChapterHash('quadratics')}" aria-current="page"`));
});

test('LEAP高速周回の結果からは選択Weekへ戻り、完了済みならホームへ戻る（DOMスタブ）',()=>{
  const sid='lbp1c1w1', id='stage:'+sid;
  setStudyMaterialStatus(id,'studying');
  const list=QUESTIONS[sid].data.map((q,index)=>({...q,_key:sid+'-'+index}));
  const leapSession=createLeapSession(list,{now:0,durationSeconds:180});
  finishLeapSession(leapSession,180000,'time');
  const c={sid,mode:'leap-speed',title:QUESTIONS[sid].title,leapSession,leapRecorded:false};
  state.cur=c;
  renderLeapSpeedResult(c);click('leapHomeBtn');
  assert.equal(window.location.hash,studyUnitHash(id));
  const ids=[...screen.innerHTML.matchAll(/class="stage" data-stage="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(ids,[sid]);
  assert.doesNotMatch(screen.innerHTML,/class="stage" data-stage="(?:lbp1c1w2|lbp1c2w1)"/);
  state.stageCleared[sid]=true;
  renderLeapSpeedResult(c);
  assert.match(screen.innerHTML,/id="leapHomeBtn"[^>]*>学習中の単元へ/);
  click('leapHomeBtn');
  assert.equal(window.location.hash,'#home');
  assert.ok(!screen.innerHTML.includes(`href="${studyUnitHash(id)}"`));
});

test('章URLは直接開ける形式を保ち、不正なエンコードや余分な階層を拒否する',()=>{
  for(const chapter of ['expressions','logic','quadratics'])assert.deepEqual(parseRoute(mathChapterHash(chapter)),{type:'math-chapter',chapter});
  assert.deepEqual(parseRoute(subjectHash(MATH1_ZERO_SUBJECT)),{type:'subject',subject:MATH1_ZERO_SUBJECT});
  assert.deepEqual(parseRoute(subjectHash(MATH1_PREP_SUBJECT)),{type:'subject',subject:MATH1_PREP_SUBJECT});
  assert.equal(parseRoute('#/math1/%XX').type,'invalid');
  assert.equal(parseRoute('#/math1/quadratics/extra').type,'invalid');
});

test('三角比は②から開始し、図つき問題の採点・保存復元・結果から章へ戻れる（DOMスタブ）',async()=>{
  const {renderMathHome}=await import('../js/views/math.js');
  renderMathHome('trigonometry');
  assert.match(screen.innerHTML,/data-math-stage="tr2"/);
  assert.match(screen.innerHTML,/9ステージ・90問/);
  renderLesson('tr2');
  assert.match(screen.innerHTML,/θ＝∠C/);
  click('lessonNext');
  assert.match(screen.innerHTML,/<details><summary>考えてから答えを見る/);
  click('lessonNext');click('lessonStart');
  // 問題順はランダムでも、問題キーと図データは保存・復元される。
  const first=state.cur.list[0];
  finishQuestion(true,first);
  finishQuestion(true,first);
  assert.equal(state.cur.correct,1);
  assert.equal(state.qStats[first._key].seen,1);
  save();state.cur=null;load();
  assert.equal(state.cur.sid,'tr2');
  assert.equal(state.cur.list[0]._key,first._key);
  assert.equal(state.cur.correct,1);
  renderQuestion();
  if(first.trig)assert.match(screen.innerHTML,/class="trigFigure"/);
  state.cur.i=state.cur.list.length;
  renderQuestion();
  click('homeBtn');
  assert.equal(window.location.hash,mathChapterHash('trigonometry'));
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
