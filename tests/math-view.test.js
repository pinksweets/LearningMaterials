import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, MATH1_CHAPTERS } from '../js/content.js';
import { state } from '../js/state.js';
import { lessonCardsHtml } from '../js/lesson.js';
import { mathChapterForStage, mathChapterProgress, mathChapterCardsHtml, mathStageHtml } from '../js/views/math.js';

// 表示用のHTMLと集計を検証する。実ブラウザの操作・描画確認とは別の確認。
beforeEach(()=>{
  state.qStats={};
  state.stageCleared={};
  state.stageBest={};
  state.bossCleared={};
  state.lessonSeen={};
});

test('数学Ⅰの3章カードには通常25ステージ250問だけを表示する',()=>{
  const html=mathChapterCardsHtml();
  assert.equal((html.match(/class="mathChapterCard"/g)||[]).length,3);
  for(const [id,title,stages,questions] of [
    ['expressions','数と式',6,60],
    ['logic','集合と命題',4,40],
    ['quadratics','二次関数',15,150]
  ]){
    assert.ok(html.includes(`href="#/math1/${id}"`));
    assert.ok(html.includes(`<strong>${title}</strong>`));
    assert.ok(html.includes(`${stages}ステージ・${questions}問　｜　クリア 0/${stages}`));
  }
  assert.doesNotMatch(html,/mqs\d|mqmock|100点|124問/);
});

test('章内の練習ボタンは通常の全25単元を一度ずつ示し、補習・模擬を混ぜない',()=>{
  const expected=[
    ...Array.from({length:6},(_,i)=>`m1s${i+1}`),
    ...Array.from({length:4},(_,i)=>`m2s${i+1}`),
    ...Array.from({length:5},(_,i)=>`m3s${i+1}`),
    ...Array.from({length:10},(_,i)=>`njz${i+1}`)
  ];
  const sids=MATH1_CHAPTERS.flatMap(chapter=>chapter.sections.flatMap(section=>section.sids));
  const html=sids.map((sid,index)=>mathStageHtml(sid,index+1)).join('');
  const buttons=[...html.matchAll(/data-math-stage="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(buttons.length,25);
  assert.equal(new Set(buttons).size,25);
  assert.deepEqual(buttons.slice().sort(),expected.slice().sort());
  assert.doesNotMatch(html,/data-math-(?:stage|lesson|boss)="(?:mqs\d+|mqmock1)"/);
  for(const sid of expected)assert.ok(mathChapterForStage(sid),`${sid}の所属章`);
  for(const sid of ['mqs1','mqs9','mqmock1','sep16Ma3'])assert.equal(mathChapterForStage(sid),undefined);
});

test('ゼロからの3枚レッスンと未読・既読の開始案内を保つ',()=>{
  for(let i=1;i<=10;i++){
    const sid=`njz${i}`;
    const stage=QUESTIONS[sid];
    assert.equal(stage.lesson.length,3);
    assert.equal((lessonCardsHtml(stage.lesson,{math:stage.lessonMath}).match(/data-lesson-card=/g)||[]).length,3);
    const unread=mathStageHtml(sid,i);
    assert.match(unread,new RegExp(`data-math-lesson="${sid}"`));
    assert.match(unread,/まなぶから始める/);
    state.lessonSeen[sid]=true;
    const seen=mathStageHtml(sid,i);
    assert.doesNotMatch(seen,/まなぶから始める/);
    assert.match(seen,/10問をとく/);
    assert.match(seen,new RegExp(`data-math-lesson="${sid}"`));
  }
  assert.match(mathStageHtml('njz10',15),/章の確認/);
  assert.doesNotMatch(mathStageHtml('m3s2',1),/data-math-lesson=/);
});

test('時間制限のない基本学習はボス無し、章確認と通常練習はクリア後にボスを解放する',()=>{
  state.stageCleared.njz1=true;
  assert.doesNotMatch(mathStageHtml('njz1',1),/data-math-boss=/);
  for(const sid of ['njz10','m3s2']){
    assert.match(mathStageHtml(sid,1),new RegExp(`data-math-boss="${sid}" disabled`));
    state.stageCleared[sid]=true;
    const cleared=mathStageHtml(sid,1);
    assert.match(cleared,new RegExp(`data-math-boss="${sid}" aria-label`));
    assert.match(cleared,/👹 ボス戦/);
    state.bossCleared[sid]=true;
    assert.match(mathStageHtml(sid,1),/👑 再挑戦/);
  }
});

test('章別進捗はその章の旧問題キーだけを集計し、補習の実績を加算しない',()=>{
  for(const sid of ['m1s1','m1s2','m2s1','njz1','m3s2','mqs1','mqmock1'])state.stageCleared[sid]=true;
  for(const [sid,count] of [['m1s1',4],['m1s2',1],['m2s1',2],['njz1',1],['m3s2',2],['mqs1',10],['mqmock1',34]]){
    for(let i=0;i<count;i++)state.qStats[`${sid}-${i}`]={box:3};
  }
  state.qStats['njz1-1']={box:2}; // まだマスターではない問題
  for(const [id,questions,mastered,pct,cleared] of [
    ['expressions',60,5,8,2],['logic',40,2,5,1],['quadratics',150,3,2,2]
  ]){
    const progress=mathChapterProgress(MATH1_CHAPTERS.find(chapter=>chapter.id===id));
    assert.deepEqual({questions:progress.questions,mastered:progress.mastered,pct:progress.pct,cleared:progress.cleared},
      {questions,mastered,pct,cleared});
  }
  const html=mathChapterCardsHtml();
  assert.match(html,/クリア 2\/6/);
  assert.match(html,/クリア 1\/4/);
  assert.match(html,/クリア 2\/15/);
  assert.match(html,/width:8%/);
  assert.match(html,/width:5%/);
  assert.match(html,/width:2%/);
  state.stageBest.njz1=70;
  assert.match(mathStageHtml('njz1',1),/クリア済み/);
  assert.match(mathStageHtml('njz1',1),/習熟 10%　｜　ベスト 70%/);
});
