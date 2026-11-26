import {test} from 'node:test';
import assert from 'node:assert/strict';
import {units as practice} from '../_site/data/nov24_english.js';
import {units as papers} from '../_site/data/nov24_english_mock.js';
import {testPrepCategories,renderTestPrepPanel} from '../_site/js/views/home.js';
import {state,stagesOfSubject} from '../_site/js/state.js';
import {answer,renderSavedAnswer} from '../_site/js/views/quiz.js';
import {examTotal,examBreakdown,isMockExam} from '../_site/js/mock-exam.js';
import {examResultHtml} from '../_site/js/views/results.js';
import {snapshotSession,restoreSession,sessionHash} from '../_site/js/session.js';
import {escapeHtml} from '../_site/js/utils.js';
import {createLocalStorage} from './helpers/env.js';

const subject='📅 11/24 英語小テスト対策';
const numbers=Array.from({length:21},(_,i)=>245+i);
const words=['quiet','safe','true','wrong','different','be covered with','be full of','important','necessary','large','small','tall','short','only','even','each','other','another','each other','either A or B','neither A nor B'];
const meanings=[/静か/,/安全/,/真実|本当/,/間違/,/異な/,/覆/,/いっぱい/,/重要/,/必要/,/大き/,/小さ/,/高い/,/短い/,/だけ|すぎない|唯一/,/さえ|さらに/,/それぞれ|各/,/ほか/,/ほか|もう/,/お互い/,/どちらか/,/どちらも|も.*も.*ない/];

test('11/24の入口は当日まで有効な7ステージへ進め、追加順を保つ',()=>{
  const category=date=>testPrepCategories(date).find(c=>c.subject===subject);
  assert.equal(category('2026-11-23').status,'これからのテスト');
  assert.equal(category('2026-11-24').status,'今日のテスト');
  assert.equal(category('2026-11-24').past,false);
  assert.equal(category('2026-11-25').past,true);
  assert.equal(testPrepCategories('2026-11-21').find(c=>c.added===14).subject,subject);
  assert.ok(renderTestPrepPanel('2026-11-21').includes(category('2026-11-21').href));
  assert.deepEqual(stagesOfSubject(subject),['nov24e1','nov24e2','nov24e3','nov24e4','nov24e5','nov24e6','nov24mock1']);
});

test('写真p.84〜89の21項目を英語→日本語の意味21問・英文理解42問で練習する',()=>{
  assert.deepEqual(practice.map(u=>u.questions.length),[7,7,7,14,14,14]);
  assert.deepEqual(practice.map(u=>u.order),[10901,10902,10903,10904,10905,10906]);
  const vocabulary=practice.slice(0,3).flatMap(u=>u.questions);
  assert.deepEqual(vocabulary.map(q=>q.sourceNo),numbers);
  vocabulary.forEach((q,i)=>{
    assert.ok(q.q.includes(words[i]),`No.${q.sourceNo}: 写真の見出しを英語で示す`);
    assert.match(q.choices[q.a],meanings[i],`No.${q.sourceNo}: 意味の対応`);
  });
  const sentences=practice.slice(3).flatMap(u=>u.questions);
  assert.equal(sentences.length,42);
  for(const no of numbers)assert.equal(sentences.filter(q=>q.sourceNo===no).length,2,`No.${no}: 例文2問`);
  for(const q of practice.flatMap(u=>u.questions)){
    assert.equal(q.type,'yon');
    assert.equal(q.examPractice,true);
    assert.ok(!q.forceInput && q.points===undefined);
    assert.ok(numbers.includes(q.sourceNo));
    assert.match(q.q,/[A-Za-z]/,`英語を読む設問: ${q.q}`);
    assert.equal(q.choices.length,4);
    assert.equal(new Set(q.choices).size,4,q.q);
    assert.ok(q.choices.every(choice=>/[ぁ-んァ-ヶ一-龠]/.test(choice)),`日本語の選択肢: ${q.q}`);
  }
});

test('11/24の固定復習模擬は21項目と全練習分野を含む34問・100点',()=>{
  assert.equal(papers.length,1);
  const paper=papers[0];
  assert.equal(paper.id,'nov24mock1');
  assert.equal(paper.order,10907);
  assert.equal(paper.questions.length,34);
  assert.equal(examTotal({list:paper.questions}),100);
  assert.deepEqual([2,3,4].map(points=>paper.questions.filter(q=>q.points===points).length),[10,16,8]);
  assert.deepEqual([...new Set(paper.questions.map(q=>q.sourceNo))].sort((a,b)=>a-b),numbers);
  for(const unit of practice){
    const selected=paper.questions.filter(q=>q.sourceStage===unit.id);
    assert.ok(selected.length>0,`苦手の復習先: ${unit.id}`);
    for(const {points,examSection,sourceStage,...original} of selected){
      assert.equal(examSection,unit.title);
      assert.ok(unit.questions.some(q=>JSON.stringify(q)===JSON.stringify(original)),`固定模擬と練習の対応: ${sourceStage}`);
    }
  }
});

function setupDom(){
  const styleCalls=[];
  const node=()=>({innerHTML:'',textContent:'',value:'',disabled:false,className:'',
    classList:{add(...names){styleCalls.push(...names);},remove(){}},appendChild(){},addEventListener(){}});
  const nodes={fb:node(),nextWrap:node()};
  const options=Array.from({length:4},(_,i)=>({...node(),dataset:{i:String(i)}}));
  globalThis.document={
    getElementById:id=>nodes[id]||null,
    querySelector:()=>null,
    querySelectorAll:selector=>selector==='.opt'||selector==='[data-i]'?options:[],
    createElement:()=>({...node(),firstChild:node()})
  };
  globalThis.localStorage=createLocalStorage();
  return {nodes,options,styleCalls};
}

function session(){
  return {sid:'nov24mock1',mode:'stage',title:papers[0].title,i:0,startIndex:0,
    list:papers[0].questions.map((q,i)=>({...q,_key:`nov24mock1-${i}`})),
    correct:0,score:0,combo:20,maxCombo:20,feverGauge:100,feverLeft:3,feverCount:1,weakHits:0,wrongThisRun:[],
    _timeLeft:30,_timeLimit:30};
}

test('11/24模擬の選択採点は配点のみ加算し、二重回答・保存再開・結果の復習先に対応する（DOMスタブ）',()=>{
  const {nodes,options,styleCalls}=setupDom();
  for(const scenario of ['correct','wrong','mixed']){
    let c=state.cur=session();
    state.settings.timeAttack=true;
    let expected=0,correctCount=0;
    for(let i=0;i<c.list.length;i++){
      c.i=i;c._locked=false;
      const q=c.list[i];
      const correct=scenario==='correct'||scenario==='mixed'&&i%2===0;
      const chosen=correct?q.a:(q.a+1)%q.choices.length;
      if(correct){expected+=q.points;correctCount++;}
      answer(correct,options[chosen],chosen);
      answer(correct,options[chosen],chosen);
      assert.equal(c.score,expected,`${scenario} ${i}: コンボ・速答・フィーバーを加算しない`);
      assert.equal(c.correct,correctCount);
      assert.ok(!nodes.fb.innerHTML.includes(q.exp));
      assert.equal(nodes.fb.className,'fb show');
      assert.ok(!styleCalls.some(name=>name==='correct'||name==='wrong'));
      if(i===16){
        const raw=JSON.parse(JSON.stringify(snapshotSession(c)));
        const resumed=restoreSession(raw);
        assert.ok(resumed);
        assert.equal(resumed.score,expected);
        assert.equal(resumed.i,16);
        assert.equal(resumed._locked,true);
        assert.equal(sessionHash(resumed),'#/stage/nov24mock1/17');
        assert.deepEqual(resumed.wrongThisRun.map(q=>q._key),c.wrongThisRun.map(q=>q._key));
        c=state.cur=resumed;
        renderSavedAnswer(c.list[c.i]);
        assert.ok(!nodes.fb.innerHTML.includes(c.list[c.i].exp));
        answer(!correct,options[(chosen+1)%4],(chosen+1)%4);
        assert.equal(c.score,expected,'保存後の回答済み問題も二重加算しない');
      }
    }
    assert.ok(isMockExam(c));
    assert.equal(examTotal(c),100);
    const groups=examBreakdown(c);
    assert.equal(groups.length,6);
    assert.equal(groups.reduce((n,g)=>n+g.earned,0),expected);
    const html=examResultHtml(c);
    assert.equal((html.match(/<details>/g)||[]).length,34);
    for(const g of groups)assert.equal(html.includes(`#/stage/${g.sourceStage}/1`),g.earned<g.total);
    for(const q of c.list)assert.ok(html.includes(escapeHtml(q.exp)));
    assert.equal(examTotal({...c,startIndex:33}),c.list[33].points);
    assert.equal(examTotal({...c,list:[c.list[33]],startIndex:0}),c.list[33].points);
  }
});
