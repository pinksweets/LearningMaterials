// Independent delivery queue: learning saves remain compatible.
const CONFIG_KEY='learning-quest-report-config-v1';
const PREFIX='learning-quest-report-v1:';
// 送信先を変更する場合は、この定数を修正する（保存済みの送信待ちにも適用）。
export const REPORT_ENDPOINT='https://script.google.com/macros/s/AKfycbzbRywl3iHuqYNssx6SsHZxLqmeYG70jtdT7ryl2berHF0WXmj8sk3rwSaLL4qFv-VT/exec';
export const REPORTING={busy:false,error:''};

export function validEndpoint(value){
  return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(value);
}
export function reportConfig(){
  try{
    const saved=JSON.parse(localStorage.getItem(CONFIG_KEY));
    return {learner:typeof saved?.learner==='string'?saved.learner:'',enabled:saved?.enabled===true};
  }catch{return {};}
}
export function configureReporting(learner,enabled){
  learner=learner.trim();
  if(enabled&&!/^[-A-Za-z0-9_]{1,64}$/.test(learner))throw Error('学習者コード（半角英数字・ハイフン・_、64文字以内）を確認してね。');
  localStorage.setItem(CONFIG_KEY,JSON.stringify({learner,enabled:!!enabled}));
  notifyReporting();
}
export function pendingReports(){
  const out=[];
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(!key?.startsWith(PREFIX))continue;
    try{const item=JSON.parse(localStorage.getItem(key));if(item?.payload?.id)out.push(item);}catch{/* Do not erase unreadable records. */}
  }
  return out;
}
export function notifyReporting(){
  if(typeof window!=='undefined'&&typeof CustomEvent!=='undefined')window.dispatchEvent(new CustomEvent('reportingchange'));
}
export function queueReport(session,fields){
  const config=reportConfig();
  if(!config.enabled||!validEndpoint(REPORT_ENDPOINT)||!config.learner)return false;
  if(session.reportQueued)return true;
  try{
    session.reportId ||= crypto.randomUUID();
    // One storage key per completion prevents concurrent tabs from replacing the queue.
    const payload={...fields,version:1,id:session.reportId,learner:config.learner,completedAt:Date.now(),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone};
    localStorage.setItem(PREFIX+payload.id,JSON.stringify({payload}));
    session.reportQueued=true;
    REPORTING.error='';
    notifyReporting();
    void flushReports();
    return true;
  }catch{REPORTING.error='実績を端末に保存できなかったよ。空き容量やブラウザ設定を確認してね。';notifyReporting();return false;}
}
export async function sendReport(item,fetcher=globalThis.fetch){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),20000);
  try{
    // text/plain avoids a preflight. Never treat an opaque response as a receipt.
    const response=await fetcher(REPORT_ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(item.payload),credentials:'omit',redirect:'follow',signal:controller.signal});
    if(!response.ok)throw Error('delivery failed');
    const receipt=await response.json();
    if(receipt.ok!==true||receipt.id!==item.payload.id)throw Error('receipt missing');
  }finally{clearTimeout(timeout);}
}
export async function flushReports(){
  if(REPORTING.busy||!reportConfig().enabled||globalThis.navigator?.onLine===false)return;
  REPORTING.busy=true;
  try{
    for(const item of pendingReports()){
      if(!reportConfig().enabled)break;
      if(!validEndpoint(REPORT_ENDPOINT))throw Error('invalid endpoint');
      await sendReport(item);
      localStorage.removeItem(PREFIX+item.payload.id);
    }
    REPORTING.error='';
  }catch{REPORTING.error='送信待ちだよ。通信や接続先の設定を確認してね。';}
  finally{REPORTING.busy=false;notifyReporting();}
}
export function reportingStatus(session){
  try{
    if(REPORTING.error)return REPORTING.error;
    if(session?.reportQueued)return localStorage.getItem(PREFIX+session.reportId)?'学習実績：送信待ち':'学習実績：記録済み';
    const n=pendingReports().length;
    return (reportConfig().enabled?'自動送信ON':'自動送信OFF')+'・送信待ち '+n+'件';
  }catch{return '学習実績の保存状況を確認できません';}
}
