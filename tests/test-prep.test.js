import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testPrepCategories, renderTestPrepPanel } from '../js/views/home.js';
import { septemberSubject } from '../js/views/september.js';
import { stagesOfSubject } from '../js/state.js';
import { syncScreenHash, testPrepRoute } from '../js/utils.js';

test('テスト対策は追加順の降順、当日は過去扱いにしない',()=>{
  const categories=testPrepCategories('2026-09-11');
  assert.deepEqual(categories.map(c=>c.title),['9/15 英語小テスト対策','9/11 小テスト対策']);
  assert.deepEqual(categories.map(c=>c.past),[false,false]);
  assert.equal(categories[1].status,'今日のテスト');
  assert.deepEqual(testPrepCategories('2026-09-12').map(c=>c.past),[false,true]);
  assert.deepEqual(testPrepCategories('2026-09-16').map(c=>c.past),[true,true]);
  assert.ok(testPrepCategories('2027-01-01').every(c=>c.past));
});
test('過去のカテゴリも選択可能で、9/11の既存単元IDを維持する',()=>{
  const html=renderTestPrepPanel('2026-09-12');
  assert.equal((html.match(/class="testPrepCard isPast"/g)||[]).length,1);
  assert.ok(html.indexOf('9/15 英語小テスト対策')<html.indexOf('9/11 小テスト対策'));
  assert.doesNotMatch(html,/disabled|実力テスト/);
  assert.match(html,/href="#test\/2026-09-15"/);
  assert.match(html,/href="#test\/2026-09-11"/);
  const ids=stagesOfSubject(septemberSubject());
  assert.equal(ids.length,14);
  assert.ok(ids.every(id=>id.startsWith('sepEn')));
});

test('カテゴリの直リンクを解決し、未知のURLはホームに戻す',()=>{
  assert.equal(testPrepRoute('#test/2026-09-15'),'september15');
  assert.equal(testPrepRoute('#test/2026-09-11'),'september');
  for(const hash of ['', '#home', '#test/2026-09-12', '#test/bad'])assert.equal(testPrepRoute(hash),'home');
});
test('画面のURL同期は同じカテゴリの履歴を増やさず、相対ハッシュだけを渡す',()=>{
  const previous=globalThis.window;
  const pushed=[];
  globalThis.window={location:{hash:''},history:{pushState(_state,_title,hash){pushed.push(hash);window.location.hash=hash;}}};
  try{
    syncScreenHash('#home');
    assert.equal(pushed.length,0);
    syncScreenHash('#test/2026-09-15');
    syncScreenHash('#test/2026-09-15');
    syncScreenHash('#home');
    assert.deepEqual(pushed,['#test/2026-09-15','#home']);
  }finally{globalThis.window=previous;}
});
