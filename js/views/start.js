/* js/views/start.js — ホームの「すぐ始める」と教材一覧。
   学習する単元を先に指定しなくても、開いてすぐ1タップで始められるようにする。
   候補は「近いテスト → 学習中に指定した単元・最近取り組んだ単元 → まだの教科の最初の単元」の順。 */
import { escapeAttr, escapeHtml, todayStr, subjectHash } from '../utils.js';
import { state, stageLastStudied, subjectList, subjectClearedCount, subjectMastery, stagesOfSubject, isLessonSeen, studyMaterialStatus } from '../state.js';
import { QUESTIONS, studyUnitList, studyUnitForStage } from '../content.js';
import { hasLesson } from '../lesson.js';
import { sessionHash, restoreSession } from '../session.js';
import { materialCatalog } from './materials.js';
import { testPrepCategories } from './home.js';

/* 単元内の学習順。図形と計量は、章ホームと同じく坂道の復習（先頭）を最後に回す。 */
export function unitLearningOrder(unit){
  return unit.id==='math1:trigonometry'?[...unit.sids.slice(1),unit.sids[0]]:unit.sids;
}
/* 次に取り組むステージ。最後に取り組んだステージが途中ならそこから、クリア済みならその先の未クリアへ進む。 */
export function unitNextStage(unit){
  const order=unitLearningOrder(unit);
  const latest=order.reduce((best,sid,index)=>stageLastStudied(sid)>stageLastStudied(order[best])?index:best,0);
  return [...order.slice(latest),...order.slice(0,latest)].find(sid=>!state.stageCleared[sid]);
}
export function unitLastStudied(unit){
  return unit.sids.reduce((latest,sid)=>Math.max(latest,stageLastStudied(sid)),0);
}
/* まだ取り組める単元か（完了の指定・全ステージクリアは対象外）。 */
export function unitIsOpen(unit){
  return state.studyMaterials?.[unit.id]!=='completed' && unit.sids.some(sid=>!state.stageCleared[sid]);
}
/* 1タップで始めるリンク。レッスン付きで未読なら、従来どおり「まなぶ」から入る。 */
export function stageStartHash(sid){
  const stage=QUESTIONS[sid];
  return hasLesson(stage) && !isLessonSeen(sid)?'#/lesson/'+encodeURIComponent(sid):'#/stage/'+encodeURIComponent(sid)+'/1';
}
export function daysAgoLabel(at,today=todayStr()){
  if(!at)return '';
  const [y,m,d]=today.split('-').map(Number);
  const then=new Date(at);
  const days=Math.round((new Date(y,m-1,d)-new Date(then.getFullYear(),then.getMonth(),then.getDate()))/86400000);
  if(days<=0)return '今日';
  if(days===1)return 'きのう';
  if(days<7)return days+'日前';
  if(days<35)return Math.floor(days/7)+'週間前';
  return 'しばらく前';
}

/* 途中のステージ・復習。完了にした単元のものはホームでは出さない（教科の画面では再開できる）。 */
export function resumableSession(){
  const c=state.cur?.mode==='practice'?restoreSession(state.resumeSession):state.cur;
  if(!c || !Array.isArray(c.list) || c.result)return null;
  if(c.mode!=='review' && studyMaterialStatus(studyUnitForStage(c.sid)?.id)==='completed')return null;
  return c;
}

/* 選ばなくても始められる候補。先頭がホームの大きなボタンになる。 */
export function startCandidates(today=todayStr(),limit=4){
  const categories=testPrepCategories(today);
  const category=new Map(categories.map(item=>[item.subject,item]));
  const isPastTest=subject=>{const item=category.get(subject);return !!item && item.past && !item.keepSubject;};
  const catalog=materialCatalog(today).map(item=>({...item,lastAt:unitLastStudied(item),open:unitIsOpen(item)}));
  const out=[], used=new Set(), usedSubjects=new Set();
  const add=(item,reason,test)=>{
    if(!item || !item.open || used.has(item.id))return;
    const sid=unitNextStage(item);
    if(!sid)return;
    used.add(item.id);usedSubjects.add(item.subject);
    out.push({id:item.id,sid,reason,test:test||null,href:stageStartHash(sid),listHref:item.href,
      title:QUESTIONS[sid].title,subjectTitle:item.subjectTitle,unitTitle:item.title,lastAt:item.lastAt,
      cleared:item.sids.filter(id=>state.stageCleared[id]).length,total:item.sids.length,
      lesson:hasLesson(QUESTIONS[sid]) && !isLessonSeen(sid)});
  };
  const byRecent=(a,b)=>b.lastAt-a.lastAt;

  // 1) これから・期間中のテスト対策（近い順）。取り組み中の単元があればその続き。
  categories.filter(item=>!item.hidden && !item.evergreen && !item.past)
    .sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:b.added-a.added)
    .forEach(item=>{
      const units=catalog.filter(unit=>unit.subject===item.subject && unit.open);
      const started=units.filter(unit=>unit.lastAt>0).sort(byRecent)[0];
      add(started || units.find(unit=>/テスト/.test(unit.group+unit.title)) || units[0],'test',item);
    });

  // 2) 「学習中にする」で指定した単元と、最近取り組んだ単元（新しい順）。
  const subjects=[...new Set(catalog.map(item=>item.subject))].filter(subject=>!isPastTest(subject)).map(subject=>{
    const units=catalog.filter(item=>item.subject===subject);
    return {units,lastAt:units.reduce((latest,unit)=>Math.max(latest,unit.lastAt),0)};
  });
  const pinned=catalog.filter(item=>state.studyMaterials?.[item.id]==='studying');
  const recent=[];
  subjects.filter(subject=>subject.lastAt>0).forEach(({units})=>{
    const started=units.filter(unit=>unit.open && unit.lastAt>0).sort(byRecent).slice(0,2);
    if(started.length){recent.push(...started);return;}
    // 直前の単元を終えていたら、その教科の次の単元へ進む。
    const latest=units.reduce((best,unit,index)=>unit.lastAt>units[best].lastAt?index:best,0);
    const next=units.slice(latest+1).find(unit=>unit.open) || units.find(unit=>unit.open);
    if(next)recent.push({...next,lastAt:units[latest].lastAt,followUp:true});
  });
  [...pinned.map(item=>({...item,pinned:true})),...recent].sort(byRecent)
    .forEach(item=>add(item,item.pinned?'pinned':item.followUp?'next':'recent'));

  // 3) 候補が少ないときは、まだ候補に出ていない教科の最初の単元で埋める。
  subjects.forEach(({units})=>{
    if(out.length<limit && !usedSubjects.has(units[0].subject))add(units.find(unit=>unit.open),'new');
  });
  return out.slice(0,limit);
}

export function candidateReason(item,today=todayStr()){
  if(item.reason==='test'){
    const [,m,d]=item.test.date.split('-').map(Number);
    return item.test.status+'｜'+m+'/'+d;
  }
  if(item.reason==='pinned')return item.lastAt?'学習中｜前回 '+daysAgoLabel(item.lastAt,today):'学習中';
  if(item.reason==='recent')return '前回 '+daysAgoLabel(item.lastAt,today)+' のつづき';
  if(item.reason==='next')return 'つぎの単元';
  return 'ここから始められるよ';
}
export function candidateContext(item){
  return item.subjectTitle+(item.unitTitle && item.unitTitle!==item.title?'　｜　'+item.unitTitle:'');
}

/* ホーム最上部。大きなボタン1つで、続き・おすすめのステージをそのまま開く。 */
export function startPanelHtml(today=todayStr(),dueCount=0){
  const session=resumableSession();
  const candidates=startCandidates(today);
  const sessionUnit=session && session.mode!=='review'?studyUnitForStage(session.sid)?.id:'';
  const others=session?candidates.filter(item=>item.id!==sessionUnit):candidates.slice(1);
  const first=session?null:candidates[0];
  const main=session
    ? `<a class="startMain" data-start="resume" href="${escapeAttr(sessionHash(session))}">
        <span class="startKicker">▶ 続きから</span><strong>${escapeHtml(session.title)}</strong>
        <span class="startMeta">${session.i+1}問目から再開（全${session.list.length}問）</span></a>`
    : first
      ? `<a class="startMain" data-start="next" href="${escapeAttr(first.href)}">
        <span class="startKicker">▶ すぐ始める${first.lesson?'（まなぶ → とく）':''}</span><strong>${escapeHtml(first.title)}</strong>
        <span class="startMeta">${escapeHtml(candidateContext(first))}　｜　${escapeHtml(candidateReason(first,today))}</span></a>`
      : `<p class="startDone">いま出せるステージは全部クリアしたよ。すごい！「今日の復習」や下の教材一覧からもう一度挑戦できるよ。</p>`;
  const review=dueCount?`<button class="btn secondary startReview" id="reviewBtn" type="button">🔁 今日の復習（${dueCount}問）</button>`:'';
  const list=others.slice(0,3).map(item=>`<article class="startCard">
      <a class="startCardMain" href="${escapeAttr(item.href)}" aria-label="${escapeAttr(item.title+'を始める')}">
        <small>${escapeHtml(candidateReason(item,today))}</small><strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(candidateContext(item))}</span><b>▶ 始める</b></a>
      <a class="startCardList" href="${escapeAttr(item.listHref)}" aria-label="${escapeAttr(item.unitTitle+'のステージ一覧')}">クリア ${item.cleared}/${item.total}　一覧 →</a>
    </article>`).join('');
  return `<section class="startPanel" aria-label="すぐ始める">
    ${main}${review}
    ${list?`<h2 class="startHeading">つづき・おすすめ</h2><div class="startList">${list}</div>`:''}
  </section>`;
}

/* 教材一覧。単元を指定しなくても、教科カードからいつでも開ける。 */
export function subjectShelf(today=todayStr()){
  const categories=testPrepCategories(today);
  const category=new Map(categories.map(item=>[item.subject,item]));
  const entries=subjectList().map((subject,index)=>{
    const item=category.get(subject);
    const sids=stagesOfSubject(subject);
    const {cleared,total}=subjectClearedCount(subject);
    const kind=item?.hidden?'hidden':item && !item.evergreen && !item.past?'test':item && item.past && !item.keepSubject?'past':'subject';
    // 期間中の中間テストなどは対策名で、終わった後は元の教科名で表示する。
    const named=item && (kind==='test' || !item.keepSubject);
    return {subject,index,test:item||null,kind,
      title:named?item.title:subject,range:named?item.range:'',href:item?.href || subjectHash(subject),
      open:studyUnitList(subject).some(unitIsOpen),lastAt:sids.reduce((latest,sid)=>Math.max(latest,stageLastStudied(sid)),0),
      focus:sids.some(sid=>QUESTIONS[sid].focus),cleared,total,pct:subjectMastery(subject).pct};
  }).filter(entry=>entry.open && entry.kind!=='hidden');
  return {
    tests:entries.filter(entry=>entry.kind==='test').sort((a,b)=>a.test.date<b.test.date?-1:a.test.date>b.test.date?1:b.test.added-a.test.added),
    main:entries.filter(entry=>entry.kind==='subject'),
    past:entries.filter(entry=>entry.kind==='past').sort((a,b)=>b.test.added-a.test.added)
  };
}
export function shelfCardHtml(entry,today=todayStr()){
  const status=entry.kind==='subject'?'':`<span class="shelfStatus">${escapeHtml(entry.test.status)}</span>`;
  return `<a class="shelfCard${entry.kind==='test'?' isTest':''}${entry.kind==='past'?' isPast':''}" href="${escapeAttr(entry.href)}">
    ${status}<strong>${escapeHtml(entry.title)}${entry.focus?'<span class="focusBadge">重点</span>':''}</strong>
    ${entry.range?`<span class="shelfRange">${escapeHtml(entry.range)}</span>`:''}
    <span class="shelfSum">クリア ${entry.cleared}/${entry.total}　｜　習熟 ${entry.pct}%${entry.lastAt?'　｜　前回 '+daysAgoLabel(entry.lastAt,today):''}</span>
    <span class="shelfBar"><i style="width:${entry.pct}%"></i></span></a>`;
}
export function subjectShelfHtml(today=todayStr()){
  const {tests,main,past}=subjectShelf(today);
  if(!tests.length && !main.length && !past.length)return '';
  return `<section class="shelf" aria-label="教材一覧">
    <h2 class="startHeading">📚 教材一覧</h2>
    ${tests.length?`<div class="shelfGrid shelfTests">${tests.map(entry=>shelfCardHtml(entry,today)).join('')}</div>`:''}
    <div class="shelfGrid">${main.map(entry=>shelfCardHtml(entry,today)).join('')}</div>
    ${past.length?`<details class="shelfPast"><summary>過去のテスト対策<span>${past.length}件</span></summary>
      <div class="shelfGrid">${past.map(entry=>shelfCardHtml(entry,today)).join('')}</div></details>`:''}
  </section>`;
}

/* 結果画面の「次へ」。同じ単元の未クリアのステージ、なければ次のおすすめ。 */
export function nextStageAfter(sid,today=todayStr()){
  const unit=studyUnitForStage(sid);
  if(unit){
    const order=unitLearningOrder(unit), index=order.indexOf(sid);
    const next=[...order.slice(index+1),...order.slice(0,index)].find(id=>!state.stageCleared[id]);
    if(next)return {sid:next,href:stageStartHash(next),title:QUESTIONS[next].title,sameUnit:true};
  }
  const candidate=startCandidates(today).find(item=>item.sid!==sid);
  return candidate?{sid:candidate.sid,href:candidate.href,title:candidate.title,sameUnit:false}:null;
}
