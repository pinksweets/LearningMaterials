import { escapeAttr, escapeHtml, studyUnitHash, todayStr } from '../utils.js';
import { state, studyMaterialStatus, studyMaterialProgress, setStudyMaterialStatus } from '../state.js';
import { QUESTIONS, studyUnitList } from '../content.js';
import { testPrepCategories } from './home.js';

export function materialCatalog(today=todayStr()){
  const categories=testPrepCategories(today);
  const hidden=new Set(categories.filter(item=>item.hidden).map(item=>item.subject));
  const prep=new Map(categories.filter(item=>!item.hidden).map(item=>[item.subject,item]));
  return studyUnitList().filter(unit=>!hidden.has(unit.subject)).map(unit=>{
    const item=prep.get(unit.subject);
    const test=!!item && !item.keepSubject;
    return {...unit,subjectTitle:test?item.title:unit.subject,href:studyUnitHash(unit.id),
      range:unit.sids.length===1?QUESTIONS[unit.sids[0]].desc:'',kind:test?'test':'subject',added:item?.added || 0,
      focus:unit.sids.some(sid=>QUESTIONS[sid].focus)};
  }).sort((a,b)=>{
    if(a.kind!==b.kind)return a.kind==='subject'?-1:1;
    return a.kind==='test'?b.added-a.added:0;
  });
}

export function activeStudyMaterials(today=todayStr()){
  // 指定のある単元だけ状態を調べる（全単元を調べるとホームの表示が遅くなる）。
  return materialCatalog(today).filter(item=>state.studyMaterials?.[item.id]==='studying' && studyMaterialStatus(item.id)==='studying');
}

export function materialContext(item){
  return item.subjectTitle+(item.group && item.group!==item.title?'　｜　'+item.group:'');
}

export function studyMaterialsHtml(today=todayStr()){
  const active=activeStudyMaterials(today);
  return `<section class="studyMaterials" aria-label="学習中の単元">
    <div class="materialHeading"><h2>📌 学習中に指定した単元</h2><span>${active.length}件</span></div>
    ${active.length?`<nav class="studyMaterialList" aria-label="学習中の単元を選ぶ">${active.map(item=>{
      const {cleared,total}=studyMaterialProgress(item.id);
      return `<a class="studyMaterialLink" href="${escapeAttr(item.href)}"><small>${escapeHtml(materialContext(item))}</small>
        <strong>${escapeHtml(item.title)}${item.focus?'<span class="focusBadge">重点</span>':''}</strong>
        <span>クリア ${cleared}/${total}ステージ</span><b>この単元を開く →</b></a>`;
    }).join('')}</nav>`:'<p class="materialEmpty">指定はなくても大丈夫。上の「すぐ始める」や教材一覧から、いつでも始められるよ。</p>'}
  </section>`;
}

export function materialChoiceHtml(item){
  const studying=studyMaterialStatus(item.id)==='studying';
  const {cleared,total,pct}=studyMaterialProgress(item.id);
  const name=materialContext(item)+'　'+item.title;
  const search=(materialContext(item)+' '+item.title+' '+item.range).normalize('NFKC').toLowerCase();
  const week=/\bweek\s*(\d+)\b/i.exec(item.title.normalize('NFKC'))?.[1] || '';
  const group=(item.group || '').normalize('NFKC');
  const course=/\bcourse\s*(\d+)\b/i.exec(group)?.[1] || '';
  const part=/\bpart\s*(\d+)\b/i.exec(group)?.[1] || '';
  return `<article class="materialChoice${studying?' isStudying':''}" data-material-search="${escapeAttr(search)}" data-material-week="${week}" data-material-course="${course}" data-material-part="${part}">
    ${item.group && item.group!==item.title?`<div class="materialProgress">${escapeHtml(item.group)}</div>`:''}
    <a class="materialTitle" href="${escapeAttr(item.href)}">${escapeHtml(item.title)}${item.focus?'<span class="focusBadge">重点</span>':''} →</a>
    ${item.range?`<p class="materialRange">${escapeHtml(item.range)}</p>`:''}
    <div class="materialProgress">${studying?'学習中　｜　':''}クリア ${cleared}/${total}　｜　習熟度 ${pct}%</div>
    <div class="materialActions">
      <button class="btn ${studying?'secondary ':''}small" type="button" data-material-action="${studying?'remove':'study'}" data-material-id="${escapeAttr(item.id)}" aria-label="${escapeAttr(name+(studying?'の学習中の指定を外す':'を学習中にする'))}">${studying?'指定を外す':'学習中にする'}</button>
      <button class="btn secondary small" type="button" data-material-action="complete" data-material-id="${escapeAttr(item.id)}" aria-label="${escapeAttr(name+'を学習完了にする')}">学習完了にする</button>
    </div></article>`;
}

export function materialManagerLabel(){return '📌 単元を整理する（使わなくてもOK）';}
/* ホームでは閉じた見出しだけを出し、開いたときに中身を描く（400以上の単元を毎回描かない）。 */
export function materialManagerClosedHtml(){
  return `<details class="materialManager" id="materialManager"><summary>${materialManagerLabel()}<span>開いて選ぶ</span></summary></details>`;
}

export function materialManagerHtml(today=todayStr(),open=false,completedOpen=false,options={}){
  const catalog=materialCatalog(today);
  const available=catalog.filter(item=>studyMaterialStatus(item.id)!=='completed');
  const subjects=[...new Set(available.map(item=>item.subject))];
  const restorable=catalog.filter(item=>{
    const {cleared,total}=studyMaterialProgress(item.id);
    return state.studyMaterials?.[item.id]==='completed' && cleared<total;
  });
  const query=options.search || '';
  return `<details class="materialManager" id="materialManager"${open?' open':''}>
    <summary>${materialManagerLabel()}<span>${available.length}単元</span></summary>
    <p class="muted">選ばなくても、上の「すぐ始める」と教材一覧からそのまま学習できるよ。よく使う単元を「学習中にする」と、ホームの上に固定できる。単元内の全ステージをクリアするか「学習完了にする」を押すと、メニューから隠れるよ。</p>
    ${available.length?`<label class="materialSearchLabel" for="materialSearch">単元を検索</label>
      <input class="materialSearch" id="materialSearch" type="search" value="${escapeAttr(query)}" placeholder="二次関数、Week 1 など" autocomplete="off">
      <p class="materialEmpty" id="materialSearchEmpty" role="status" hidden>一致する単元がないよ。教科名や短い言葉でも探してみてね。</p>
      ${subjects.map(subject=>{
        const items=available.filter(item=>item.subject===subject);
        const expanded=options.openSubjects?.includes(subject);
        return `<details class="unitSubject" data-material-subject-panel="${escapeAttr(subject)}"${expanded?' open':''}>
          <summary>${escapeHtml(items[0].subjectTitle)}<span>${items.length}単元</span></summary>
          <div class="materialChoices">${items.map(materialChoiceHtml).join('')}</div></details>`;
      }).join('')}`:'<p class="materialEmpty">選べる単元はすべて学習完了だよ。「今日の復習」でもう一度確かめてみよう。</p>'}
    ${restorable.length?`<details class="completedMaterials" id="completedMaterials"${completedOpen?' open':''}>
      <summary>完了の指定を取り消す（${restorable.length}単元）</summary>
      <p class="muted">まちがえて完了にした単元は、ここから戻せるよ。学習記録はそのまま残るよ。</p>
      ${restorable.map(item=>`<div class="completedMaterial"><span>${escapeHtml(materialContext(item)+'　'+item.title)}</span><button class="btn secondary small" type="button" data-material-action="restore" data-material-id="${escapeAttr(item.id)}" aria-label="${escapeAttr(materialContext(item)+'　'+item.title+'の完了の指定を取り消す')}">完了を取り消す</button></div>`).join('')}
    </details>`:''}
  </details>`;
}

export function filterMaterialChoices(){
  const input=document.getElementById('materialSearch');
  if(!input)return;
  const query=input.value.normalize('NFKC').toLowerCase().trim();
  const numberFields={week:'materialWeek',course:'materialCourse',part:'materialPart'};
  const numbers=[];
  const words=query.replace(/\b(week|course|part)\s*(\d+)\b/g,(_phrase,kind,value)=>{
    numbers.push({field:numberFields[kind],value});
    return ' ';
  }).split(/\s+/).filter(Boolean);
  let visible=0;
  document.querySelectorAll('[data-material-subject-panel]').forEach(panel=>{
    if(query && !panel._materialSearchActive){
      panel._materialWasOpen=!!panel.open;
      panel._materialSearchActive=true;
    }else if(!query && panel._materialSearchActive){
      panel.open=panel._materialWasOpen;
      delete panel._materialWasOpen;
      delete panel._materialSearchActive;
    }
    let matches=0;
    panel.querySelectorAll('[data-material-search]').forEach(row=>{
      row.hidden=!numbers.every(({field,value})=>row.dataset[field]===value) || !words.every(word=>row.dataset.materialSearch.includes(word));
      if(!row.hidden)matches++;
    });
    panel.hidden=matches===0;
    if(query && matches)panel.open=true;
    visible+=matches;
  });
  const empty=document.getElementById('materialSearchEmpty');
  if(empty)empty.hidden=visible>0;
}

export function bindMaterialActions(onChange){
  document.querySelectorAll('[data-material-action]').forEach(button=>{
    button.addEventListener('click',()=>{
      const status={study:'studying',remove:'available',complete:'completed',restore:'available'}[button.dataset.materialAction];
      const id=button.dataset.materialId;
      if(status && setStudyMaterialStatus(id,status))onChange({id,status});
    });
  });
  const input=document.getElementById('materialSearch');
  if(input){input.addEventListener('input',filterMaterialChoices);filterMaterialChoices();}
}
