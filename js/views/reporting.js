import { queueReport, reportConfig, configureReporting, reportingStatus, flushReports } from '../reporting.js';
import { state, save } from '../state.js';
import { QUESTIONS } from '../content.js';
import { el, app, toast } from '../utils.js';

export function reportCompletion(c,leapStats){
  if(!c||c.mode==='practice')return;
  const leap=c.mode==='leap-speed';
  if(leap&&!['time','complete'].includes(leapStats?.endedReason))return;
  const answered=leap?leapStats.judged:c.correct+(c.wrongThisRun?.length||0);
  if(!answered)return;
  const queued=queueReport(c,{
    mode:c.mode,stage:c.sid||'',title:c.title||'',subject:QUESTIONS[c.sid]?.subject||'教科横断',
    outcome:leap?leapStats.endedReason:c.result||'normal',partial:!!c.partial,
    answered,correct:leap?null:c.correct,score:leap?null:c.score,
    learned:leap?leapStats.learned:null,elapsedSeconds:leap?Math.round(leapStats.elapsedSeconds):null
  });
  if(queued&&c===state.cur)save();
}
export function appendReportingStatus(c){
  const node=el('<p class="muted" data-report-status="" role="status"></p>');
  node.textContent=reportingStatus(c);app().appendChild(node);
}
export function updateReportingStatus(){
  document.querySelectorAll('[data-report-status]').forEach(node=>{node.textContent=reportingStatus(node.dataset.reportStatus==='settings'?null:state.cur);});
}
export function appendReportingSettings(){
  const config=reportConfig();
  const panel=el(`<details class="card reportSettings"><summary>学習実績の自動送信</summary>
    <p class="muted">ステージや復習の完了ごとに、学習者コード・単元・回答数・正解数などを設定先へ送るよ。氏名は入力しないでね。</p>
    <form>
    <p><label>学習者コード <input name="learner" maxlength="64" placeholder="例：S001"></label></p>
    <p><label><input name="enabled" type="checkbox"> 学習実績を自動送信する</label></p>
    <button class="btn secondary small" type="submit">設定を保存</button>
    <button class="btn secondary small" type="button" data-retry>送信待ちを再送</button></form>
    <p class="muted">送信先は設定済みだよ。送信待ちの実績は、完了時の学習者コードで送るよ。OFFにすると再送も止まるよ。</p>
    <p data-report-status="settings" role="status"></p></details>`);
  const form=panel.querySelector('form');
  form.elements.learner.value=config.learner||'';
  form.elements.enabled.checked=!!config.enabled;
  form.addEventListener('submit',event=>{
    event.preventDefault();
    try{configureReporting(form.elements.learner.value,form.elements.enabled.checked);toast('自動送信の設定を保存したよ');void flushReports();}
    catch(error){toast(error.message);}
  });
  panel.querySelector('[data-retry]').addEventListener('click',()=>{void flushReports();});
  app().appendChild(panel);updateReportingStatus();
}
