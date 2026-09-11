import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testPrepCategories, renderTestPrepPanel } from '../js/views/home.js';
import { septemberSubject } from '../js/views/september.js';
import { stagesOfSubject } from '../js/state.js';

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
  const ids=stagesOfSubject(septemberSubject());
  assert.equal(ids.length,14);
  assert.ok(ids.every(id=>id.startsWith('sepEn')));
});
