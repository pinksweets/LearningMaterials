/* js/utils.js — 汎用ユーティリティ（DOM・文字列・日付） */

/* ---------- ユーティリティ ---------- */
export function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function el(html){const d=document.createElement('div');d.innerHTML=html.trim();return d.firstChild;}
export function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1800);}
export const app=()=>document.getElementById('app');
export function escapeHtml(s){
  return String(s==null?"":s).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}
export const escapeAttr=escapeHtml;

// ハッシュだけを更新し、Pagesの配信サブパス・クエリ文字列を保つ。
export const NAV={restoring:false,scroll:{},current:''};
export function syncScreenHash(hash,replace=false){
  if(typeof window==='undefined' || !window.location || !window.history)return;
  if(NAV.restoring)return;
  if(window.location.hash===hash || (!window.location.hash && hash==='#home'))return;
  NAV.scroll[window.location.hash]=window.scrollY || 0;
  window.history[replace?'replaceState':'pushState'](null,'',hash);
  NAV.current=hash;
  window.scrollTo?.(0,NAV.scroll[hash]||0);
}
export function subjectHash(subject){return '#/subject/'+encodeURIComponent(subject);}
export function parseRoute(hash){
  if(!hash || hash==='#home')return {type:'home'};
  const old={'#test/2026-09-16':'september16','#test/2026-09-15':'september15','#test/2026-09-11':'september'};
  if(old[hash])return {type:old[hash]};
  try{
    const parts=hash.split('/');
    if(parts.length===3 && parts[1]==='subject')return {type:'subject',subject:decodeURIComponent(parts[2])};
    if(parts.length===3 && parts[1]==='lesson')return {type:'lesson',sid:decodeURIComponent(parts[2])};
    if(parts.length===4 && ['question','stage'].includes(parts[1]) && /^[1-9]\d*$/.test(parts[3]))return {type:parts[1],sid:decodeURIComponent(parts[2]),index:Number(parts[3])-1};
    if(parts.length===5 && parts[1]==='learn' && ['2026-09-11','2026-09-15'].includes(parts[2]) && /^[0-3]$/.test(parts[3]) && /^[0-4]$/.test(parts[4]))return {type:'learn',date:parts[2],group:Number(parts[3]),index:Number(parts[4])};
    if(['#/collection','#/session','#/result','#/practice-result'].includes(hash))return {type:hash.slice(2)};
  }catch{/* Malformed percent encoding is an invalid link. */}
  return {type:'invalid'};
}
export function testPrepRoute(hash){
  return ({'#test/2026-09-16':'september16','#test/2026-09-15':'september15','#test/2026-09-11':'september'})[hash] || 'home';
}

/* ---------- 日付（ローカル基準。toISOStringはUTCずれするので使わない） ---------- */
export function pad2(n){return (n<10?'0':'')+n;}
export function todayStr(){const d=new Date();return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
export function addDays(dateStr,n){const [y,m,dd]=dateStr.split('-').map(Number);const d=new Date(y,m-1,dd);d.setDate(d.getDate()+n);return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
