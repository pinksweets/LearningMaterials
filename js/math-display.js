import { escapeHtml } from './utils.js';

// A deliberately small presentation grammar: no eval, no changes to answer data.
export function mathMarkup(source){
  const tokens=source.match(/\d+(?:\.\d+)?|[a-zA-Z]|[²³⁴]|√|[()（）]|[^\s]/g)||[];
  let i=0;
  function atom(){
    const t=tokens[i++];
    if(t===undefined)return '';
    let out;
    if(t==='('||t==='（'){
      out='<mrow><mo>(</mo>'+row(true)+'<mo>)</mo></mrow>';
    }else if(t==='√')out='<msqrt>'+atom()+'</msqrt>';
    else if(['−','-','＋','+'].includes(t))out='<mrow><mo>'+t+'</mo>'+atom()+'</mrow>';
    else out=/^\d/.test(t)?'<mn>'+t+'</mn>':/^[a-zA-Z]$/.test(t)?'<mi>'+t+'</mi>':'<mo>'+escapeHtml(t)+'</mo>';
    if(['²','³','⁴'].includes(tokens[i]))out='<msup>'+out+'<mn>'+({'²':2,'³':3,'⁴':4}[tokens[i++]])+'</mn></msup>';
    return out;
  }
  function row(group=false){
    let out='';
    while(i<tokens.length){
      if(group && [')','）'].includes(tokens[i])){i++;break;}
      if(['−','-','＋','+','×','÷','=','＝','<','>','＜','＞','≤','≥',','].includes(tokens[i])){out+='<mo>'+escapeHtml(tokens[i++])+'</mo>';continue;}
      let part=atom();
      while(tokens[i]==='/'){i++;part='<mfrac>'+part+atom()+'</mfrac>';}
      out+=part;
    }
    return out;
  }
  return '<math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="'+escapeHtml(source)+'"><mrow>'+row()+'</mrow></math>';
}

export function mathText(text){
  return String(text).split(/([a-zA-Z0-9√²³⁴＋+−\-×÷/=＝<>＜＞≤≥!()（）.,\s]+)/g).map((part,index)=>{
    if(index%2 && /[0-9a-zA-Z√]/.test(part))return mathMarkup(part);
    return escapeHtml(part);
  }).join('');
}

export function isVisualMath(key){return /^sep16Ma[1-5]-\d+$/.test(key||'');}

export function quadraticSpec(key,parameter){
  const index=Number(key.split('-')[1]);
  if(key.startsWith('sep16Ma3-')){
    const p=parameter??(index===9?3:1);
    return [
      {a:2,b:-12,c:22},{a:-1,b:-4,c:1},{a:1,b:-6,c:11},{a:-2,b:8,c:-3},
      {a:3,b:6,c:-1},{a:-1,b:0,c:9,domain:[-2,1]},{a:-1,b:0,c:9,domain:[-2,1]},
      {a:1,b:-4,c:1,domain:[0,1]},{a:1,b:-2*p,c:3,domain:[0,2],parameter:p},
      {a:1,b:-2*p,c:3,domain:[0,2],parameter:p}
    ][index];
  }
  if(key.startsWith('sep16Ma4-'))return [
    {a:1,b:-5,c:6},{a:1,b:-4,c:4},{a:1,b:2,c:5},
    {a:1,b:-6,c:5,intervals:[[1,5,false,false]]},
    {a:1,b:-1,c:-6,intervals:[[null,-2,false,true],[3,null,true,false]]},
    {a:1,b:-4,c:3,intervals:[[1,3,true,true]]},
    {a:-1,b:1,c:6,intervals:[[-2,3,false,false]]},
    {a:1,b:-8,c:16,intervals:[[null,4,false,false],[4,null,false,false]]}
  ][index];
  return null;
}

export function quadraticFacts(s){
  const f=x=>s.a*x*x+s.b*x+s.c;
  const axis=-s.b/(2*s.a), vertex=f(axis), disc=s.b*s.b-4*s.a*s.c;
  const roots=disc<0?[]:disc===0?[axis]:[(-s.b-Math.sqrt(disc))/(2*s.a),(-s.b+Math.sqrt(disc))/(2*s.a)].sort((a,b)=>a-b);
  const points=s.domain?[...s.domain,...(axis>=s.domain[0]&&axis<=s.domain[1]?[axis]:[])]:[axis];
  return {axis,vertex,roots,min:Math.min(...points.map(f)),max:Math.max(...points.map(f))};
}

export function graphSvg(s,step=3){
  const facts=quadraticFacts(s), f=x=>s.a*x*x+s.b*x+s.c;
  const lo=Math.floor(Math.min(facts.axis-3,0,...(s.domain||[]),...facts.roots));
  const hi=Math.ceil(Math.max(facts.axis+3,0,...(s.domain||[]),...facts.roots));
  const niceStep=span=>{const base=10**Math.floor(Math.log10(span/4));return [1,2,5,10].find(n=>n*base>=span/4)*base;};
  const rawMin=Math.min(0,facts.vertex,f(lo),f(hi))-1,rawMax=Math.max(0,facts.vertex,f(lo),f(hi))+1;
  const ystep=niceStep(rawMax-rawMin),xstep=niceStep(hi-lo);
  const ymin=Math.floor(rawMin/ystep)*ystep,ymax=Math.ceil(rawMax/ystep)*ystep;
  const X=x=>48+(x-lo)/(hi-lo)*310,Y=y=>224-(y-ymin)/(ymax-ymin)*194;
  const fmt=x=>Number(x.toFixed(2));
  const path=(a,b)=>Array.from({length:101},(_,i)=>{const x=a+(b-a)*i/100;return (i?'L':'M')+X(x).toFixed(2)+','+Y(f(x)).toFixed(2);}).join(' ');
  let marks='';
  for(let x=Math.ceil(lo/xstep)*xstep;x<=hi;x+=xstep)marks+=`<text x="${X(x)}" y="247" text-anchor="middle">${fmt(x)}</text>`;
  for(let y=ymin;y<=ymax;y+=ystep)marks+=`<text x="41" y="${Y(y)+4}" text-anchor="end">${fmt(y)}</text>`;
  const visibleRoots=s.domain?facts.roots.filter(x=>x>=s.domain[0]&&x<=s.domain[1]):facts.roots;
  const desc=`放物線の軸 x＝${fmt(facts.axis)}、頂点 (${fmt(facts.axis)}, ${fmt(facts.vertex)})。${s.domain?'定義域内の':''}x軸との共有点は${visibleRoots.length}個。`;
  const endpoints=step>=3 && s.domain?s.domain.map(x=>`<circle cx="${X(x)}" cy="${Y(f(x))}" r="5" class="graphPoint"/>`).join(''):'';
  return `<figure class="mathFigure"><svg viewBox="0 0 400 270" role="img" aria-label="${desc}"><title>二次関数のグラフ</title><desc>${desc}太線は定義域内。横軸x、縦軸y。縦横の縮尺は異なります。</desc>
    <rect x="48" y="30" width="310" height="194" class="graphFrame"/>
    <path d="M48 ${Y(0)}H358 M${X(0)} 30V224" class="graphAxis"/>
    <text x="373" y="${Math.max(43,Math.min(214,Y(0)))}">x</text><text x="15" y="18">y</text>
    ${marks}<path d="${path(lo,hi)}" class="graphCurve"/>
    ${step>=2?`<path d="M${X(facts.axis)} 30V224" class="graphSymmetry"/><circle cx="${X(facts.axis)}" cy="${Y(facts.vertex)}" r="5" class="graphPoint"/>`:''}
    ${step>=3 && s.domain?`<path d="${path(...s.domain)}" class="graphDomain"/>`:''}${endpoints}
    ${step>=3 && !s.domain?facts.roots.map(x=>`<rect x="${X(x)-4}" y="${Y(0)-4}" width="8" height="8" class="graphPoint"/>`).join(''):''}
    </svg><figcaption>${s.parameter!==undefined?`a＝${s.parameter} の例。<br>`:''}${step===1?`x²の係数は${s.a}。${s.a>0?'下に凸':'上に凸'}の放物線だよ。`:desc}${step>=3 && s.domain?`<br>定義域：${s.domain[0]} ≤ x ≤ ${s.domain[1]}（太線・両端の点）<br>両端の値：f(${s.domain[0]})＝${fmt(f(s.domain[0]))}、f(${s.domain[1]})＝${fmt(f(s.domain[1]))}<br>範囲内の最小値 ${fmt(facts.min)} ／ 最大値 ${fmt(facts.max)}`:''}${step>=3 && !s.domain && facts.roots.length?`<br>x軸との共有点：x＝${facts.roots.map(fmt).join('、')}`:''}</figcaption></figure>`;
}

export function numberLine(intervals,bounds){
  const values=intervals.flatMap(a=>a.slice(0,2)).filter(x=>x!==null);
  const [lo,hi]=bounds||[Math.min(...values)-2,Math.max(...values)+2],X=x=>32+(x-lo)/(hi-lo)*320;
  return `<svg class="mathNumberLine" viewBox="0 0 390 85" role="img" aria-label="解の範囲。白丸は端を含まず、黒丸は端を含みます。"><title>不等式の解の範囲</title><path d="M20 35H375" class="graphAxis"/>${intervals.map(([a,b,ac,bc])=>`<path d="M${X(a??lo)} 35H${X(b??hi)}" class="graphDomain"/>${[[a,ac],[b,bc]].filter(([x])=>x!==null).map(([x,closed])=>`<circle cx="${X(x)}" cy="35" r="6" class="${closed?'graphPoint':'graphOpen'}"/><text x="${X(x)}" y="65" text-anchor="middle">${x}</text>`).join('')}`).join('')}</svg><p class="muted">白丸 ○：端を含まない ／ 黒丸 ●：端を含む</p>`;
}

export function geometrySvg(index){
  if(index>3)return '';
  let drawing,caption;
  if(index<2){
    const half=(index===0?56:37)*Math.PI/180;
    const ax=180-90*Math.sin(half),bx=180+90*Math.sin(half),y=125+90*Math.cos(half);
    drawing=`<circle cx="180" cy="125" r="90" class="graphFrame"/><path d="M${ax} ${y}L180 35L${bx} ${y} M${ax} ${y}L180 125L${bx} ${y}" class="graphCurve"/><path d="M${ax} ${y}A90 90 0 0 0 ${bx} ${y}" class="graphDomain"/><circle cx="180" cy="125" r="3" class="graphPoint"/><text x="${ax-17}" y="${y+20}">A</text><text x="${bx+8}" y="${y+20}">B</text><text x="175" y="25">P</text><text x="185" y="119">O</text>`;
    if(index===1)drawing+=`<path d="M${ax} ${y}L135 47L${bx} ${y}" class="graphSymmetry"/><text x="115" y="42">Q</text>`;
    else drawing+=`<path d="M${180-22*Math.sin(half)} ${125+22*Math.cos(half)}A22 22 0 0 0 ${180+22*Math.sin(half)} ${125+22*Math.cos(half)}" class="graphAxis"/><text x="159" y="165">112°</text>`;
    caption=index===0?'Oは円の中心。∠AOB＝112°。同じ弧ABに対する∠APBを考えよう。':'PとQは弦ABの同じ側。同じ弧ABに対する二つの円周角を考えよう。一方は37°だよ。';
  }else if(index===2){
    drawing='<path d="M25 170L65 70L120 170Z M200 190L260 40L343 190Z" class="graphCurve"/><text x="61" y="60">A</text><text x="10" y="190">B</text><text x="120" y="190">C</text><text x="259" y="29">D</text><text x="180" y="208">E</text><text x="344" y="208">F</text><text x="22" y="116">6</text><text x="68" y="193">8</text><text x="208" y="110">9</text><text x="260" y="211">?</text>';
    caption='対応する頂点：A↔D、B↔E、C↔F。AB＝6、DE＝9、BC＝8。';
  }else{
    drawing='<path d="M180 25L60 220L330 220Z M132 103L240 103" class="graphCurve"/><text x="178" y="18">A</text><text x="43" y="237">B</text><text x="330" y="237">C</text><text x="111" y="102">D</text><text x="245" y="102">E</text><text x="190" y="95">?</text><text x="135" y="57">4</text><text x="184" y="242">15</text>';
    caption='DはAB上、EはAC上。DE∥BC。AD＝4、AB＝10、BC＝15。';
  }
  return `<figure class="mathFigure"><svg viewBox="0 0 390 260" role="img" aria-label="${caption}"><title>問題の条件を表す模式図</title><desc>${caption}図は正確な角度や長さを測るためのものではありません。</desc>${drawing}</svg><figcaption>${caption}<br>図は模式図。角度や長さは問題の条件を使おう。</figcaption></figure>`;
}

export function mathVisual(key,answered=false){
  if(!isVisualMath(key))return '';
  if(!answered)return key.startsWith('sep16Ma2-')?geometrySvg(Number(key.split('-')[1])):'';
  const s=quadraticSpec(key);
  if(s)return `<section class="mathExplanation"><h3>図で確かめよう</h3><div class="graphSteps" aria-label="グラフを確かめる順序">${['1. 全体','2. 軸と頂点',s.domain?'3. 範囲と両端':'3. x軸との関係'].map((label,i)=>`<button type="button" class="btn secondary small" data-graph-step="${i+1}" aria-pressed="${i===2}">${label}</button>`).join('')}</div><div data-math-graph>${graphSvg(s)}${s.intervals?numberLine(s.intervals):''}</div>${s.parameter!==undefined?`<details><summary>式を変えて試す</summary><p>f(x)＝x²−2ax＋3、0 ≤ x ≤ 2。元の問題の条件をこえて、軸と範囲の関係を比べてみよう。</p><label>a＝<output id="mathParameterValue">${s.parameter}</output><input id="mathParameter" type="range" min="-1" max="4" step="0.25" value="${s.parameter}"></label><div id="mathExplore">${graphSvg(s)}</div></details>`:''}</section>`;
  if(key==='sep16Ma4-8')return `<section class="mathExplanation"><h3>二つの範囲の共通部分</h3><p>x²−5x＋6 ≥ 0</p>${numberLine([[null,2,false,true],[3,null,true,false]],[-1,6])}<p>x²−7x＋12 ≤ 0</p>${numberLine([[3,4,true,true]],[-1,6])}<p>両方を満たすのは 3 ≤ x ≤ 4。</p>${numberLine([[3,4,true,true]],[-1,6])}</section>`;
  if(key.startsWith('sep16Ma5-')){
    const index=Number(key.split('-')[1]);
    const steps=[['1人目：5通り','2人目：4通り','3人目：3通り'],['順序つき：8×7×6','同じ組を3!回数える','3×2×1で割る'],['両端のA・B：2通り','中央の4人：4!通り'],['1人目：3通り','2人目：3通り','3人目：3通り','4人目：3通り'],['Aの席を固定','残り4人を並べる：4!'],['Aの席を固定','向かいの席にB','残り4人：4!'],['百の位：5通り（0以外）','十の位：残り5通り','一の位：残り4通り'],['一の位0 → 5×4＝20','一の位5 → 4×4＝16','重ならない2通りを足す'],['1文字目：3通り','2文字目：3通り','3文字目：3通り','4文字目：3通り'],['女子2人：6通り','男子1人：3通り']][Number(key.split('-')[1])];
    const seats=index===4?5:6;
    const circle=[4,5].includes(index)?`<figure class="mathFigure"><svg viewBox="0 0 390 250" role="img" aria-label="Aの席を固定した円卓。${index===5?'BはAの向かい。':''}残り4席に4人を並べる。"><title>回転による重複を避ける円卓の配置</title><circle cx="195" cy="125" r="58" class="graphFrame"/>${Array.from({length:seats},(_,i)=>{const x=195+95*Math.sin(i*2*Math.PI/seats),y=125-95*Math.cos(i*2*Math.PI/seats),label=i===0?'A 固定':index===5&&i===3?'B':'?';return `<circle cx="${x}" cy="${y}" r="22" class="graphFrame"/><text x="${x}" y="${y+5}" text-anchor="middle">${label}</text>`;}).join('')}</svg><figcaption>Aを固定して回転の重複をなくすよ。残り4席に4人を並べよう。</figcaption></figure>`:'';
    return `<section class="mathExplanation"><h3>選ぶ順序を整理しよう</h3>${circle}<ol class="mathSlots">${steps.map(t=>`<li>${mathText(t)}</li>`).join('')}</ol></section>`;
  }
  return '';
}
