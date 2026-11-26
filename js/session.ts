import { QUESTIONS } from './content.js';
import type { Session } from './types.js';

const sessionFields=['sid','mode','title','i','startIndex','correct','combo','maxCombo','score','feverGauge','feverLeft','feverCount','weakHits','lives','bossHP','bossMaxHP','bossName','septemberReview','september15Review','_forceChoice','_timeLeft','_timeLimit','result','resultApplied','partial'] as const;
export type SessionSnapshot = Partial<Pick<Session, (typeof sessionFields)[number] | 'reportId' | 'reportQueued' | 'draft' | 'choiceOrder' | '_nenpyoOrder' | 'answer'>> & {
  version: 1;
  keys: string[];
  wrongKeys: string[];
};

// Store references, never copies of question text or generated HTML.
export function snapshotSession(c: Session | null): SessionSnapshot | null {
  if(!c || !Array.isArray(c.list))return null;
  const out: SessionSnapshot={version:1, keys:c.list.map(q=>q._key), wrongKeys:(c.wrongThisRun||[]).map(q=>q._key)};
  for(const field of sessionFields)if(c[field]!==undefined)Object.assign(out,{[field]:c[field]});
  if(c.reportId)out.reportId=c.reportId;
  if(c.reportQueued)out.reportQueued=true;
  out.draft=c.draft || [];
  out.choiceOrder=c.choiceOrder || null;
  out._nenpyoOrder=c._nenpyoOrder || null;
  out.answer=c.answer || null;
  return out;
}

export function questionFromKey(key: unknown){
  if(typeof key!=='string')return null;
  const match=/^([^-]+)-(\d+)$/.exec(key);
  if(!match)return null;
  const s=QUESTIONS[match[1]], index=Number(match[2]);
  return s?.data[index] ? {...s.data[index],_key:key,_page:s.page} : null;
}

export function restoreSession(raw: SessionSnapshot | null): Session | null {
  if(!raw || raw.version!==1 || !['stage','review','boss','practice'].includes(raw.mode))return null;
  if(!Array.isArray(raw.keys) || !raw.keys.length || raw.keys.length>20000)return null;
  const list=raw.keys.map(questionFromKey);
  if(list.some(q=>!q) || !Number.isInteger(raw.i) || raw.i<0 || raw.i>=list.length)return null;
  if(raw.mode!=='review' && (!QUESTIONS[raw.sid] || raw.keys.some(k=>!k.startsWith(raw.sid+'-'))))return null;
  for(const field of ['correct','combo','maxCombo','score','feverGauge','feverLeft','feverCount','weakHits'] as const){
    if(!Number.isFinite(raw[field]) || raw[field]<0)return null;
  }
  const c: Session={...snapshotSession({ ...raw, sid: raw.sid, mode: raw.mode, title: raw.title, list, wrongThisRun:[] }),
    list, sid: raw.sid, mode: raw.mode, title: raw.mode==='review'?'今日の復習':QUESTIONS[raw.sid].title};
  c.wrongThisRun=(Array.isArray(raw.wrongKeys)?raw.wrongKeys:[]).map(questionFromKey).filter(Boolean);
  c.draft=Array.isArray(raw.draft)?raw.draft.map(v=>String(v).slice(0,10000)):[];
  c.answer=raw.answer && typeof raw.answer.correct==='boolean'
    ? {correct:raw.answer.correct,timeUp:!!raw.answer.timeUp,correctText:typeof raw.answer.correctText==='string'?raw.answer.correctText:''}:null;
  c._locked=!!c.answer;
  c.result=['normal','victory','defeat'].includes(raw.result)?raw.result:null;
  c.resultApplied=!!raw.resultApplied;
  const q=list[c.i];
  const permutation=(a: number[] | null,n: number)=>Array.isArray(a)&&a.length===n&&new Set(a).size===n&&a.every(x=>Number.isInteger(x)&&x>=0&&x<n);
  c.choiceOrder=permutation(raw.choiceOrder,q.choices?.length)?raw.choiceOrder:null;
  c._nenpyoOrder=permutation(raw._nenpyoOrder,q.items?.length || q.steps?.length)?raw._nenpyoOrder:null;
  if(raw.mode==='boss' && !(['lives','bossHP','bossMaxHP'] as const).every(k=>Number.isFinite(raw[k])&&raw[k]>=0))return null;
  return c;
}

export function sessionHash(c: Session){
  if(c.result)return c.mode==='practice'?'#/practice-result':'#/result';
  if(c.mode==='stage')return `#/stage/${encodeURIComponent(c.sid)}/${c.i+1}`;
  if(c.mode==='practice')return `#/question/${encodeURIComponent(c.sid)}/${Number(c.list[c.i]._key.split('-')[1])+1}`;
  return '#/session';
}
