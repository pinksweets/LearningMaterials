import { escapeHtml } from './utils.js';
import { mathText, graphSvg, quadraticFacts } from './math-display.js';
import { examNumericMatch } from './mock-exam.js';

// The worked example is practice, separate from question scores and saved mastery.
export function createGuidedSession(){
  return {step:0, completed:[], hintIndex:0, hintCount:0, complete:false};
}

export function submitGuidedStep(example, session, values, reason){
  if(session.complete)return {accepted:false, complete:true};
  const step=example.steps[session.step];
  const matches=(step.inputs||[]).map((input,i)=>examNumericMatch(values[i]??'', [String(input.answer)]));
  const reasonCorrect=!step.reason || String(reason)===String(step.reason.answer);
  if(matches.some(value=>!value)||!reasonCorrect)return {accepted:false, matches, reasonCorrect, complete:false};
  session.completed.push(session.step);
  session.step++;
  session.hintIndex=0;
  session.complete=session.step===example.steps.length;
  return {accepted:true, matches, reasonCorrect, complete:session.complete};
}

export function nextGuidedHint(example, session){
  if(session.complete)return '';
  const hints=example.steps[session.step].hints||[];
  if(session.hintIndex>=hints.length)return '';
  session.hintCount++;
  return hints[session.hintIndex++];
}

export function guidedStudyHtml(example){
  return `<section class="guidedStudy" data-guided-example aria-label="一行ずつ解く例題"><h4>${escapeHtml(example.title)}</h4><p>${mathText(example.intro||'')}</p><p class="muted">数値と理由を答えて、一行ずつ進もう。間違えた欄は直して試せるよ。</p><div data-guided-body></div></section>`;
}

export function bindGuidedStudy(container, example, onComplete=()=>{}){
  let session=createGuidedSession();
  const body=container.querySelector('[data-guided-body]');
  function render(){
    const history=session.completed.map(i=>{
      const step=example.steps[i];
      return `<li><strong>${mathText(step.prompt)}</strong>${step.line?`<p>${mathText(step.line)}</p>`:''}<p>${(step.inputs||[]).map(input=>escapeHtml(input.label)+'＝'+input.answer).join(' ／ ')}</p><p>${mathText(step.explanation)}</p></li>`;
    }).join('');
    let active;
    if(session.complete){
      active=`<p role="status">例題を最後まで確認できたよ。ヒント表示：${session.hintCount}回。</p>${example.graph?graphSvg(example.graph):''}<div class="paperTask"><strong>次は紙で、自力でやってみよう</strong><p>${mathText(example.paperTask)}</p><details><summary>紙で解いた後に答えを確認する</summary><p>${mathText(example.paperAnswer)}</p></details><p class="muted">途中式・理由・グラフまで説明できたか確認しよう。例題の完了だけでは、自力で解けたことにはしないよ。</p></div><button class="btn secondary small" type="button" data-guided-reset>例題をもう一度</button>`;
    }else{
      const step=example.steps[session.step];
      active=`<form data-guided-form><p class="lessonKind">手順 ${session.step+1}/${example.steps.length}</p><h4>${mathText(step.prompt)}</h4>${step.line?`<p class="lessonFormula">${mathText(step.line)}</p>`:''}<div class="guidedInputs">${(step.inputs||[]).map((input,i)=>`<label>${escapeHtml(input.label)}<input data-guided-input="${i}" type="text" inputmode="text" autocomplete="off" required aria-label="${escapeHtml(input.label)}"></label>`).join('')}</div>${step.reason?`<label class="guidedReason">${escapeHtml(step.reason.prompt)}<select data-guided-reason required><option value="">理由を選ぼう</option>${step.reason.choices.map((choice,i)=>`<option value="${i}">${escapeHtml(choice)}</option>`).join('')}</select></label>`:''}<p data-guided-feedback role="status" aria-live="polite"></p><div class="guidedActions"><button class="btn small" type="submit">この一行を確認</button>${step.hints?.length?'<button class="btn secondary small" type="button" data-guided-hint>ヒントを一つ見る</button>':''}</div><div data-guided-hints class="muted"></div></form>`;
    }
    body.innerHTML=`${history?`<ol class="guidedHistory">${history}</ol>`:''}${active}`;
    onComplete(session.complete);
    if(session.complete){
      body.querySelector('[data-guided-reset]').addEventListener('click',()=>{session=createGuidedSession();render();});
      return;
    }
    const form=body.querySelector('[data-guided-form]');
    const stepIndex=session.step;
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(session.step!==stepIndex)return;
      const inputs=[...form.querySelectorAll('[data-guided-input]')];
      const result=submitGuidedStep(example,session,inputs.map(input=>input.value),form.querySelector('[data-guided-reason]')?.value);
      if(result.accepted){
        render();
        body.querySelector('[data-guided-input], [data-guided-reason], [data-guided-reset]')?.focus();
        return;
      }
      inputs.forEach((input,i)=>input.setAttribute('aria-invalid',String(!result.matches[i])));
      form.querySelector('[data-guided-reason]')?.setAttribute('aria-invalid',String(!result.reasonCorrect));
      form.querySelector('[data-guided-feedback]').textContent='もう一度確かめよう。印のついた数値や理由を直して、同じ一行を試せるよ。';
    });
    const hintButton=form.querySelector('[data-guided-hint]');
    hintButton?.addEventListener('click',()=>{
      const hint=nextGuidedHint(example,session);
      if(hint){
        const p=document.createElement('p');
        p.textContent=hint;
        form.querySelector('[data-guided-hints]').appendChild(p);
      }
      hintButton.disabled=session.hintIndex>=(example.steps[session.step].hints||[]).length;
    });
  }
  render();
}

export function rangeFacts(spec){
  const facts=quadraticFacts(spec);
  const [left,right]=spec.domain;
  const inside=facts.axis>=left&&facts.axis<=right;
  const candidates=[...new Set([left,right,...(inside?[facts.axis]:[])])];
  const f=x=>spec.a*x*x+spec.b*x+spec.c;
  return {...facts,inside,minAt:candidates.filter(x=>Math.abs(f(x)-facts.min)<1e-9),maxAt:candidates.filter(x=>Math.abs(f(x)-facts.max)<1e-9)};
}

export function explorerSpec(config, values={}){
  const kind=config.kind;
  if(kind==='move'){
    const p=Number(values.p??2),q=Number(values.q??-3),a=Number(values.a??1);
    return {a,b:-2*a*p,c:a*p*p+q,p,q};
  }
  if(kind==='verticalC')return {a:1,b:-4,c:Number(values.c??6),domain:[0,3]};
  if(kind==='axisC'){
    const c=Number(values.c??-1);
    return {a:1,b:-2*c,c:c*c+1,domain:[0,2],axisParameter:c};
  }
  const a=Number(config.a??1);
  const domain=values.domain==='outside'?[0,1]:values.domain==='edge'?[2,4]:[0,3];
  return {a,b:-4*a,c:4*a-3,domain};
}

export function translationGraphSvg(spec){
  const X=x=>40+(x+6)*26,Y=y=>220-(y+20)*3;
  const path=(p,q)=>{
    let started=false;
    return Array.from({length:241},(_,i)=>{
      const x=-6+i/20,y=spec.a*(x-p)**2+q;
      if(y< -20||y>40){started=false;return '';}
      const command=started?'L':'M';started=true;
      return command+X(x).toFixed(2)+','+Y(y).toFixed(2);
    }).join(' ');
  };
  return `<figure class="mathFigure"><svg viewBox="0 0 400 260" role="img" aria-label="破線は移動前、実線は移動後。頂点 (${spec.p}, ${spec.q})。"><title>同じ目盛りで比べるグラフの移動</title><rect x="40" y="40" width="312" height="180" class="graphFrame"/><path d="M40 ${Y(0)}H352 M${X(0)} 40V220" class="graphAxis"/>${[-6,-4,-2,0,2,4,6].map(x=>`<text x="${X(x)}" y="243" text-anchor="middle">${x}</text>`).join('')}${[-20,0,20,40].map(y=>`<text x="34" y="${Y(y)+4}" text-anchor="end">${y}</text>`).join('')}<text x="365" y="${Y(0)}">x</text><text x="15" y="20">y</text><path d="${path(0,0)}" class="graphSymmetry"/><path d="${path(spec.p,spec.q)}" class="graphCurve"/><circle cx="${X(spec.p)}" cy="${Y(spec.q)}" r="5" class="graphPoint"/></svg><figcaption>破線：y＝${spec.a===1?'':'−'}x² ／ 実線：移動後。点は頂点。<br>目盛りは固定。縦横の縮尺は異なるよ。</figcaption></figure>`;
}

export function explorerHtml(config){
  return `<section class="quadraticExplorer" data-quadratic-explorer aria-label="グラフを動かして確かめる"><h4>動かして確かめよう</h4><div data-explorer-controls>${config.kind==='move'?'<label>横の移動 p<input type="range" data-explorer-value="p" min="-3" max="3" step="0.5" value="2"></label><label>縦の移動 q<input type="range" data-explorer-value="q" min="-5" max="5" step="0.5" value="-3"></label><label>開く向き<select data-explorer-value="a"><option value="1">上に開く（下に凸）</option><option value="-1">下に開く（上に凸）</option></select></label>':config.kind==='range'?'<label>xの範囲<select data-explorer-value="domain"><option value="inside">0 ≤ x ≤ 3（頂点を含む）</option><option value="outside">0 ≤ x ≤ 1（頂点の左）</option><option value="edge">2 ≤ x ≤ 4（頂点が端）</option></select></label>':'<label>c を変える<input type="range" data-explorer-value="c" min="-2" max="8" step="0.5" value="'+(config.kind==='axisC'?-1:6)+'"></label>'}</div><div data-explorer-output aria-live="polite"></div><p class="muted">まず変化を予想してから動かそう。最後は画面を見ずに、紙の途中式で説明してね。</p></section>`;
}

export function explorerOutput(config, values){
  const spec=explorerSpec(config,values);
  const fmt=n=>Number(n.toFixed(4));
  if(config.kind==='move'){
    const {p,q,a}=spec;
    const squared=p===0?'x²':`(x${p<0?'＋':'−'}${Math.abs(p)})²`;
    const formula=`y＝${a<0?'−':''}${squared}${q<0?'−':'＋'}${Math.abs(q)}`;
    return `<p class="lessonFormula">${mathText(formula)}</p><p>横：${p===0?'移動なし':Math.abs(p)+(p>0?' 右':' 左')} ／ 縦：${q===0?'移動なし':Math.abs(q)+(q>0?' 上':' 下')}。軸 x＝${p}、頂点 (${p}, ${q})。</p><p>かっこの中が0になる x を探すと、横の移動を確かめられるよ。</p>${translationGraphSvg(spec)}`;
  }
  const facts=rangeFacts(spec);
  const offset=spec.c-4;
  const formula=config.kind==='verticalC'?`y＝x²−4x＋c、c＝${spec.c} → y＝(x−2)²${offset<0?'−':'＋'}${Math.abs(offset)}`:config.kind==='axisC'?`y＝(x−c)²＋1、c＝${spec.axisParameter}`:`y＝${spec.a<0?'−':''}(x−2)²−3`;
  const note=config.kind==='verticalC'?'cを増やすと全体が上へ動く。軸 x＝2 は動かないよ。':config.kind==='axisC'?'cが軸の位置になる。0 ≤ x ≤ 2 は固定。軸が0・2をまたぐと最小値の求め方が変わり、最大値の端はc＝1を境に入れ替わるよ。':'頂点と両端を候補にするよ。下に開く場合は、頂点で最大になることにも注意しよう。';
  return `<p class="lessonFormula">${mathText(formula)}</p><p>${note}</p><p>軸 x＝${fmt(facts.axis)} は範囲${facts.inside?'内（端を含む）':'外'}。<br>最小値 ${fmt(facts.min)}（x＝${facts.minAt.map(fmt).join('、')}）<br>最大値 ${fmt(facts.max)}（x＝${facts.maxAt.map(fmt).join('、')}）</p>${graphSvg(spec)}`;
}

export function bindQuadraticExplorer(container,config){
  const output=container.querySelector('[data-explorer-output]');
  const controls=[...container.querySelectorAll('[data-explorer-value]')];
  const render=()=>{
    const values=Object.fromEntries(controls.map(input=>[input.dataset.explorerValue,input.value]));
    output.innerHTML=explorerOutput(config,values);
  };
  controls.forEach(input=>input.addEventListener('input',render));
  render();
}

export function mountLessonActivities(root,lesson,onComplete=()=>{}){
  (lesson||[]).forEach((card,i)=>{
    const element=root.querySelector(`[data-lesson-card="${i}"]`);
    if(!element)return;
    if(card.guidedExample)bindGuidedStudy(element.querySelector('[data-guided-example]'),card.guidedExample,onComplete);
    if(card.explorer)bindQuadraticExplorer(element.querySelector('[data-quadratic-explorer]'),card.explorer);
  });
}
