import { test } from 'node:test';
import assert from 'node:assert/strict';
import { units } from '../data/m4_trigonometry.js';
import { lessonCardHtml } from '../js/lesson.js';
import { trigDiagram } from '../js/trig-display.js';
import { MATH1_CHAPTERS } from '../js/content.js';

const sin=d=>Math.sin(d*Math.PI/180);
const cos=d=>Math.cos(d*Math.PI/180);
const tan=d=>Math.tan(d*Math.PI/180);
// 教材の数値回答を、辺の比・座標・面積から独立に再計算する。
const expected={
  tr1:{3:3/5,4:4/5,5:3/4,6:6/10,7:12/13,8:9/6},
  tr2:{3:4/5,4:3/5,5:4/3,6:4/5,8:5/13,9:5/12},
  tr3:{0:Math.hypot(6,8),1:Math.sqrt(13**2-5**2),2:Math.hypot(1,1),3:1/Math.sqrt(2),4:Math.hypot(2,3),5:2/Math.hypot(2,3),6:3/Math.hypot(2,3),7:2/3,8:Math.sqrt(25-9)/5,9:Math.sqrt(9-1)/3},
  tr4:{1:sin(45),2:cos(45),3:tan(45),4:sin(30),5:cos(30),6:tan(30),7:sin(60),8:cos(60),9:tan(60)},
  tr5:{0:10*sin(30),1:10*cos(30),2:4*sin(45),3:8*sin(60),4:8*cos(60),5:6*3/4,6:3/sin(30),7:8/(4/5),8:9/(3/4),9:7*tan(45)},
  tr6:{3:Math.sqrt(1-(3/5)**2),4:(3/5)/(4/5),5:Math.sqrt(1-(12/13)**2),6:5/12,7:Math.sqrt(1-(1/2)**2),9:1/Math.hypot(1,2)},
  tr7:{3:sin(120),4:cos(120),5:tan(120),6:sin(150),7:cos(150)},
  tr8:{2:4*sin(45)/sin(30),3:6/(2*sin(30)),4:2*5*sin(30),6:Math.sqrt(3**2+5**2-2*3*5*cos(60)),7:Math.sqrt(2**2+3**2-2*2*3*cos(120)),8:(3**2+4**2-5**2)/(2*3*4),9:Math.acos((2**2+3**2-7)/(2*2*3))*180/Math.PI},
  tr9:{1:6*4*sin(30)/2,2:6*4*sin(60)/2,3:3*8*sin(150)/2,4:5*4*sin(90)/2,5:10*tan(45),6:10*tan(45)+1.5,7:12*tan(30),8:6*sin(60)}
};
function number(s) {
  const value=s.replace(/cm²|m|°/g,'').replaceAll('−','-').replace('-√','-1√');
  const match=/^(-?\d+(?:\.\d+)?)?(?:√(\d+))?(?:\/(\d+))?$/.exec(value);
  assert.ok(match,`未対応の数値表記: ${s}`);
  return Number(match[1]??1)*(match[2]?Math.sqrt(Number(match[2])):1)/Number(match[3]??1);
}
test('三角比9単元は各10問、3枚の図解レッスンと答えを隠した確認問題を持つ',()=>{
  assert.equal(units.length,9);
  assert.deepEqual(MATH1_CHAPTERS.find(c=>c.id==='trigonometry').sections.flatMap(s=>s.sids),units.map(u=>u.id));
  for(const u of units){
    assert.equal(u.questions.length,10);
    assert.equal(u.lesson.length,3);
    assert.match(lessonCardHtml(u.lesson[0],0),/class="trigFigure"/);
    const html=lessonCardHtml(u.lesson[1],1);
    assert.match(html,/<details><summary>考えてから答えを見る/);
    assert.doesNotMatch(html,/<details open/);
    for(const q of u.questions){assert.equal(new Set(q.choices).size,4);assert.equal(q.examPractice,true);}
  }
});
test('数値回答67問を三角関数・三平方・定理で再計算する',()=>{
  let count=0;
  for(const u of units)for(const [i,want] of Object.entries(expected[u.id])){
    const q=u.questions[i];
    assert.ok(Math.abs(number(q.choices[q.a])-want)<1e-10,`${u.id}-${i}: ${q.q}`);
    count++;
  }
  assert.equal(count,67);
});
test('θの位置を変えた図と半円には読み上げ用の条件があり、文字をエスケープする',()=>{
  assert.match(trigDiagram(units[1].lesson[0].trig),/θ＝∠C/);
  assert.match(trigDiagram(units[6].lesson[0].trig),/P\(−1\/2, √3\/2\)/);
  assert.doesNotMatch(trigDiagram({caption:'<img onerror=x>',base:'<script>'}),/<img|<script>/);
  assert.equal(trigDiagram(null),'');
});
