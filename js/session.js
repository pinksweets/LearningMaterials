import { QUESTIONS } from './content.js';

// Store references, never copies of question text or generated HTML.
export function snapshotSession(c){
  if(!c || !Array.isArray(c.list))return null;
  const fields=['sid','mode','title','i','startIndex','correct','combo','maxCombo','score','feverGauge','feverLeft','feverCount','weakHits','lives','bossHP','bossMaxHP','bossName','septemberReview','september15Review','_forceChoice','_timeLeft','_timeLimit','result','resultApplied','partial'];
  const out={version:1, keys:c.list.map(q=>q._key), wrongKeys:(c.wrongThisRun||[]).map(q=>q._key)};
  for(const field of fields)if(c[field]!==undefined)out[field]=c[field];
  out.draft=c.draft || [];
  out.choiceOrder=c.choiceOrder || null;
  out._nenpyoOrder=c._nenpyoOrder || null;
  out.answer=c.answer || null;
  return out;
}

export function questionFromKey(key){
  if(typeof key!=='string')return null;
  const match=/^([^-]+)-(\d+)$/.exec(key);
  if(!match)return null;
  const s=QUESTIONS[match[1]], index=Number(match[2]);
  return s?.data[index] ? {...s.data[index],_key:key,_page:s.page} : null;
}

export function restoreSession(raw){
  if(!raw || raw.version!==1 || !['stage','review','boss','practice'].includes(raw.mode))return null;
  if(!Array.isArray(raw.keys) || !raw.keys.length || raw.keys.length>20000)return null;
  const list=raw.keys.map(questionFromKey);
  if(list.some(q=>!q) || !Number.isInteger(raw.i) || raw.i<0 || raw.i>=list.length)return null;
  if(raw.mode!=='review' && (!QUESTIONS[raw.sid] || raw.keys.some(k=>!k.startsWith(raw.sid+'-'))))return null;
  for(const field of ['correct','combo','maxCombo','score','feverGauge','feverLeft','feverCount','weakHits']){
    if(!Number.isFinite(raw[field]) || raw[field]<0)return null;
  }
  const c={...snapshotSession({...raw,list,wrongThisRun:[]}),list};
  c.title=raw.mode==='review'?'今日の復習':QUESTIONS[raw.sid].title;
  c.wrongThisRun=(Array.isArray(raw.wrongKeys)?raw.wrongKeys:[]).map(questionFromKey).filter(Boolean);
  c.draft=Array.isArray(raw.draft)?raw.draft.map(v=>String(v).slice(0,10000)):[];
  c.answer=raw.answer && typeof raw.answer.correct==='boolean'
    ? {correct:raw.answer.correct,timeUp:!!raw.answer.timeUp,correctText:typeof raw.answer.correctText==='string'?raw.answer.correctText:''}:null;
  c._locked=!!c.answer;
  c.result=['normal','victory','defeat'].includes(raw.result)?raw.result:null;
  c.resultApplied=!!raw.resultApplied;
  const q=list[c.i];
  const permutation=(a,n)=>Array.isArray(a)&&a.length===n&&new Set(a).size===n&&a.every(x=>Number.isInteger(x)&&x>=0&&x<n);
  c.choiceOrder=permutation(raw.choiceOrder,q.choices?.length)?raw.choiceOrder:null;
  c._nenpyoOrder=permutation(raw._nenpyoOrder,q.items?.length || q.steps?.length)?raw._nenpyoOrder:null;
  if(raw.mode==='boss' && !['lives','bossHP','bossMaxHP'].every(k=>Number.isFinite(raw[k])&&raw[k]>=0))return null;
  return c;
}

export function sessionHash(c){
  if(c.result)return c.mode==='practice'?'#/practice-result':'#/result';
  if(c.mode==='stage')return `#/stage/${encodeURIComponent(c.sid)}/${c.i+1}`;
  if(c.mode==='practice')return `#/question/${encodeURIComponent(c.sid)}/${Number(c.list[c.i]._key.split('-')[1])+1}`;
  return '#/session';
}
