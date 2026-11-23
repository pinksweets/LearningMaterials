import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mathADiagram} from '../js/ma26-display.js';

const geometry={
  kind:'geometry',
  points:{A:[250,35],B:[70,245],C:[430,245],I:[250,165]},
  segments:[['A','B'],['B','C'],['C','A'],['B','I'],['C','I']],
  circles:[{cx:250,cy:190,r:55}],
  pointOffsets:{I:[15,-5]},
  labels:['I：内心','∠A＝50°']
};

test('数学Aの汎用模式図は条件・点・線分・円を読み取れるSVGにする',()=>{
  const html=mathADiagram(geometry);
  assert.match(html,/data-ma-diagram="geometry"/);
  assert.match(html,/viewBox="0 0 500 300" role="img"/);
  assert.match(html,/<title>I：内心 ／ ∠A＝50°<\/title>/);
  assert.match(html,/<desc>点の位置と線分のつながりを示す模式図/);
  assert.match(html,/M70 245 L250 165/);
  assert.match(html,/<circle cx="250" cy="190" r="55"/);
  assert.match(html,/<text x="265" y="160"[^>]*>I<\/text>/);
  assert.equal((html.match(/<path /g)||[]).length,5);
  assert.equal((html.match(/<text /g)||[]).length,4);
  assert.doesNotMatch(html,/正解|答え：|115/);
});

test('汎用模式図は点名と条件文をエスケープして、無効な座標・参照を描かない',()=>{
  const hostile={
    kind:'geometry',
    points:{'<A>':[20,30],B:[80,100],bad:[NaN,5],infinite:[10,Infinity]},
    segments:[['<A>','B'],['bad','B'],['B','missing'],null,'bad'],
    circles:[{cx:0,cy:0,r:-2},{cx:NaN,cy:3,r:4},null],
    pointOffsets:{B:[Infinity,5]},
    labels:['<script>alert("x")</script>',null,{}]
  };
  const html=mathADiagram(hostile);
  assert.match(html,/&lt;A&gt;/);
  assert.match(html,/&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.doesNotMatch(html,/<script|<A>|NaN|Infinity|missing|\[object Object\]/);
  assert.equal((html.match(/<path /g)||[]).length,1);
  assert.equal((html.match(/<circle /g)||[]).length,2);
  assert.equal((html.match(/<text /g)||[]).length,2);
});

test('汎用模式図は欠損データを安全に扱い、空の条件文にも説明を付ける',()=>{
  for(const points of [undefined,null,[],{}, {A:[1,2]},{A:['1',2],B:[3,4]}]){
    assert.equal(mathADiagram({kind:'geometry',points}), '');
  }
  const html=mathADiagram({kind:'geometry',points:{A:[0,0],B:[500,300]},labels:'not an array',segments:{}});
  assert.match(html,/aria-label="問題の点と線分の位置関係"/);
  assert.match(html,/x="12" y="22"/);
  assert.match(html,/x="488" y="288"/);
});

test('既存7種の数学A模式図と未知の種類の扱いを維持する',()=>{
  for(const kind of ['internal','external','parallel','inner','outer','circum','right']){
    const html=mathADiagram({kind,labels:['条件']});
    assert.match(html,new RegExp(`data-ma-diagram="${kind}"`));
    assert.match(html,/viewBox="0 0 500 260"/);
    assert.match(html,/<svg/);
  }
  assert.equal(mathADiagram(), '');
  assert.equal(mathADiagram({kind:'unknown'}), '');
});
