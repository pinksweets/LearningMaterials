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

/* ---------- 日付（ローカル基準。toISOStringはUTCずれするので使わない） ---------- */
export function pad2(n){return (n<10?'0':'')+n;}
export function todayStr(){const d=new Date();return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
export function addDays(dateStr,n){const [y,m,dd]=dateStr.split('-').map(Number);const d=new Date(y,m-1,dd);d.setDate(d.getDate()+n);return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
