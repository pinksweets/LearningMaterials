import { test } from "node:test";
import assert from "node:assert/strict";
import { units } from "../data/index.js";
import {
  createLeapSession,
  countsAsLeapDailySession,
  extractLeapEntry,
  finishLeapSession,
  getLeapStats,
  judgeLeapCard,
  remainingLeapCount,
  shouldShowLeapWordBeforeAnswer
} from "../js/leap-study.js";
import { normalizeSpeechText } from "../js/audio.js";
import { createLocalStorage } from "./helpers/env.js";
import { leapSessionsOn, normalizeLeapDailySessions, recordLeapSession, state } from "../js/state.js";

globalThis.localStorage=createLocalStorage();

test("LEAP 3コースの実データから英語見出語と第1義を抽出できる", () => {
  const course1=units.find((unit)=>unit.id.endsWith("c1w1"));
  const course2=units.find((unit)=>unit.id.endsWith("c2w1"));
  const course3=units.find((unit)=>unit.id.endsWith("c3w1"));
  const first=extractLeapEntry(course1.questions[0]);
  const second=extractLeapEntry(course2.questions[0]);
  const third=extractLeapEntry(course3.questions[0]);
  assert.equal(first.headword,"a");
  assert.equal(first.firstMeaning,"ある");
  assert.equal(second.headword,"a");
  assert.equal(second.firstMeaning,"ある");
  assert.equal(third.headword,"a");
  assert.equal(third.firstMeaning,"ある");
  assert.ok(first.nuance);
  assert.match(first.nuance,/中心の意味/);
  assert.notEqual(first.nuance,first.hint);
});

test("LEAP全6954問は抽出欠落がなく、同じステージの3コースで見出語と第1義が一致する", () => {
  const leapUnits=units.filter((unit)=>unit.subject==="📘 LEAP Basic 必携英単語");
  const byWeek=new Map();
  leapUnits.forEach((unit)=>{
    const part=unit.group.match(/^Part \d+/)?.[0]||unit.group;
    const key=part+'|'+unit.title;
    if(!byWeek.has(key))byWeek.set(key,{});
    const course=unit.group.match(/Course (\d+)/)?.[1]||'';
    byWeek.get(key)[course]=unit;
  });
  let questions=0;
  byWeek.forEach((courses)=>{
    assert.ok(courses["1"]&&courses["2"]&&courses["3"]);
    assert.equal(courses["1"].questions.length,courses["2"].questions.length);
    assert.equal(courses["1"].questions.length,courses["3"].questions.length);
    courses["1"].questions.forEach((question,index)=>{
      const entries=[1,2,3].map((course)=>extractLeapEntry(courses[String(course)].questions[index]));
      entries.forEach((entry)=>{
        assert.ok(entry.headword);
        assert.ok(entry.firstMeaning);
        questions++;
      });
      assert.equal(entries[0].headword,entries[1].headword);
      assert.equal(entries[0].headword,entries[2].headword);
      assert.equal(entries[0].firstMeaning,entries[1].firstMeaning);
      assert.equal(entries[0].firstMeaning,entries[2].firstMeaning);
    });
  });
  assert.equal(questions,6954);
});

test("英単語クエスト由来の追加教材は既存LEAPと重複せず、3コースで718語を収録する", () => {
  const additions=units.filter((unit)=>unit.id.startsWith("lbq"));
  assert.equal(additions.length,222);
  const course1=additions.filter((unit)=>unit.group.includes("Course 1"));
  const headwords=course1.flatMap((unit)=>unit.questions.map((question)=>question.q.match(/「([^」]+)」/)?.[1]||""));
  assert.equal(headwords.length,718);
  assert.equal(new Set(headwords).size,718);
  assert.ok(additions.some((unit)=>unit.questions.some((question)=>question.exp.includes("🔧")&&question.exp.includes("⭐ Tip:"))));
});

test("通常クイズで回答前に見出語を出せるのはCourse 1だけ", () => {
  const course1=units.find((unit)=>unit.id.endsWith("c1w1"));
  const course2=units.find((unit)=>unit.id.endsWith("c2w1"));
  const course3=units.find((unit)=>unit.id.endsWith("c3w1"));
  assert.equal(shouldShowLeapWordBeforeAnswer(course1.questions[0]),true);
  assert.equal(shouldShowLeapWordBeforeAnswer(course2.questions[0]),false);
  assert.equal(shouldShowLeapWordBeforeAnswer(course3.questions[0]),false);
});

test("意味の中黒を語義の区切りとして誤分割しない", () => {
  const unit=units.find((item)=>item.questions.some((question)=>question.exp.includes("ほかの物・人")));
  const question=unit.questions.find((item)=>item.exp.includes("ほかの物・人"));
  const entry=extractLeapEntry(question);
  assert.equal(entry.firstMeaning,"ほかの物・人");
  assert.equal(entry.additionalMeanings,"");
});

test("発音用語形は語法プレースホルダーを除去し、英語がなければ空にする", () => {
  assert.equal(normalizeSpeechText("listen to ～"),"listen to");
  assert.equal(normalizeSpeechText("take（人）［are］"),"take");
  assert.equal(normalizeSpeechText("go (程度) [are]"),"go");
  assert.equal(normalizeSpeechText("ほかの物・人"),"");
});

test("高速周回はあやしい語だけを次周回へイベント駆動で戻す", () => {
  const items=[{_key:"word-1"},{_key:"word-2"}];
  const session=createLeapSession(items,{now:0,durationSeconds:180});
  assert.equal(session.current.id,"word-1");
  assert.equal(judgeLeapCard(session,false,1000).round,1);
  assert.equal(session.current.id,"word-2");
  assert.equal(judgeLeapCard(session,true,2000).round,2);
  assert.equal(session.current.id,"word-1");
  const result=judgeLeapCard(session,true,3000);
  assert.equal(result.finished,true);
  assert.equal(session.current,null);
  assert.equal(remainingLeapCount(session),0);
  assert.deepEqual(getLeapStats(session,3000),{
    elapsedSeconds:3,
    judged:3,
    learned:2,
    remainingUncertain:0,
    rounds:2,
    averageSeconds:1,
    endedReason:"complete"
  });
});

test("3分経過で未判定カードを残りあやしいとして終了できる", () => {
  const session=createLeapSession([{_key:"one"},{_key:"two"}],{now:0,durationSeconds:180});
  judgeLeapCard(session,true,1000);
  finishLeapSession(session,180000,"time");
  const stats=getLeapStats(session,180000);
  assert.equal(stats.endedReason,"time");
  assert.equal(stats.judged,1);
  assert.equal(stats.learned,1);
  assert.equal(stats.remainingUncertain,1);
  assert.equal(stats.elapsedSeconds,180);
});

test("期限ちょうど・期限後の判定は受け付けず、時間切れとして終了する", () => {
  const atLimit=createLeapSession([{_key:"at-limit"}],{now:0,durationSeconds:1});
  const exact=judgeLeapCard(atLimit,true,1000);
  assert.equal(exact.accepted,false);
  assert.equal(exact.expired,true);
  assert.equal(atLimit.finished,true);
  assert.equal(atLimit.endedReason,"time");
  assert.equal(atLimit.judged,0);

  const afterLimit=createLeapSession([{_key:"after-limit"}],{now:0,durationSeconds:1});
  const late=judgeLeapCard(afterLimit,true,1001);
  assert.equal(late.accepted,false);
  assert.equal(late.expired,true);
  assert.equal(getLeapStats(afterLimit,1001).elapsedSeconds,1);
});

test("完了時刻0秒も経過時間0として集計し、二重判定と空入力を拒否する", () => {
  const session=createLeapSession([{_key:"instant"}],{now:0,durationSeconds:180});
  const first=judgeLeapCard(session,true,0);
  assert.equal(first.accepted,true);
  assert.equal(getLeapStats(session,1000).elapsedSeconds,0);
  assert.equal(judgeLeapCard(session,true,1001).accepted,false);
  const empty=createLeapSession([],{now:0});
  assert.equal(empty.finished,true);
  assert.equal(judgeLeapCard(empty,true,0).accepted,false);
});

test("日別LEAPセッション保存値は日付形式と正の整数だけを残す", () => {
  assert.deepEqual(normalizeLeapDailySessions({
    "2026-08-15":2,
    "bad":5,
    "2026-08-16":0,
    "2026-08-17":"4.9",
    "2026-08-18":-1
  }),{"2026-08-15":2,"2026-08-17":4});
});

test("手動終了はノルマに加算せず、時間切れまたは全件完了だけを加算する", () => {
  assert.equal(countsAsLeapDailySession("quit"),false);
  assert.equal(countsAsLeapDailySession("time"),true);
  assert.equal(countsAsLeapDailySession("complete"),true);
});

test("LEAP日次セッション数は1回ずつ1→2→3と保存される", () => {
  state.leapDailySessions={};
  const date="2099-01-01";
  assert.equal(recordLeapSession(date),1);
  assert.equal(recordLeapSession(date),2);
  assert.equal(recordLeapSession(date),3);
  assert.equal(leapSessionsOn(date),3);
});
