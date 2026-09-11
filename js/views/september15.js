import { app, escapeHtml, toast } from "../utils.js";
import { QUESTIONS } from "../content.js";
import { state, stagesOfSubject } from "../state.js";
import { stopTimer } from "../timer.js";
import { stopSpeech, stopBossTension, speakEnglish } from "../audio.js";
import { renderHome } from "./home.js";
import { startStage, renderQuestion } from "./quiz.js";

export function september15Subject(){
  return '📅 9/15 英語小テスト対策';
}
export function september15Mistakes(){
  return stagesOfSubject(september15Subject()).flatMap(sid=>QUESTIONS[sid].data.flatMap((q,idx)=>{
    const key=sid+'-'+idx, st=state.qStats[key];
    return st && st.seen>0 && st.box===0 ? [{...q,_key:key,_page:QUESTIONS[sid].page}] : [];
  }));
}
export function renderSeptember15Home(english=false){
  stopTimer();stopSpeech();stopBossTension();
  const mistakes=september15Mistakes();
  app().innerHTML=`<section class="card sepMenu"><span class="tag">9月15日 小テスト対策</span><h1>9/15 英語小テスト対策</h1>
    <p>1回5分。まずは音を聞いて、意味を思い出そう。</p>
    ${english?`<h2>英語｜LEAP p.48〜53</h2><p>No.123〜142の20項目。本番は英文を見て、日本語訳の空欄を埋める想定だよ。</p>
      <div class="sepPlan"><strong>テストまでの進め方</strong><p>9/11〜13：①音と意味 → ②意味チェック<br>9/14：③空欄練習 → ④10問で仕上げ<br>9/15：間違えた問題をもう一度</p></div>
      <h3>① 音と意味を覚える</h3><p class="muted">聞く → 声に出す → 意味を隠して思い出す。カタカナは読み方の目安だよ。</p>
      <div class="sepGrid">${[0,1,2,3].map(i=>`<button class="btn secondary" data-learn="${i}">5語ずつ覚える ${i+1}<br>No.${123+i*5}〜${127+i*5}</button>`).join('')}</div>
      ${['Choose','Write','Mock','Extra'].map((kind,n)=>`<h3>${['② 意味を選ぶ','③ 日本語の空欄を埋める','④ 10問で仕上げる','⑤ 余裕があれば：別の意味・関連表現'][n]}</h3>${n===2?'<p class="muted">A・Bで20項目を確認。1問ごとに答えと解説が出る練習だよ。</p>':''}<div class="sepGrid">${stagesOfSubject(september15Subject()).filter(s=>s.startsWith('sep15En'+kind)).map(sid=>`<button class="btn secondary" data-sep-stage="${sid}">${escapeHtml(QUESTIONS[sid].title)}<br><small>${!QUESTIONS[sid].data.some((q,i)=>state.qStats[sid+'-'+i]?.seen)?'未挑戦':`最高 ${state.stageBest[sid]}%`}</small></button>`).join('')}</div>`).join('')}
      <button class="btn" id="sepReview" ${mistakes.length?'':'disabled'}>間違えた問題を復習（${mistakes.length}問）</button>
      <p class="muted">最後に間違えた問題から最大5問。正解すると復習リストから外れるよ。</p>`:
      '<button class="btn" id="sep15English">英語 →<br><small>音声から始める・基本20項目</small></button>'}
    <button class="btn secondary" id="sepBack">← テスト対策へ</button></section>`;
  document.getElementById('sepBack').addEventListener('click',()=>renderHome());
  document.getElementById('sep15English')?.addEventListener('click',()=>renderSeptember15Home(true));
  document.querySelectorAll('[data-learn]').forEach(b=>b.addEventListener('click',()=>renderSeptember15Learn(Number(b.dataset.learn))));
  document.querySelectorAll('[data-sep-stage]').forEach(b=>b.addEventListener('click',()=>startStage(b.dataset.sepStage)));
  document.getElementById('sepReview')?.addEventListener('click',startSeptember15Review);
}
export function startSeptember15Review(){
  const list=september15Mistakes().slice(0,5);
  if(!list.length){toast('復習する問題はないよ。よくがんばったね！');renderSeptember15Home(true);return;}
  state.cur={sid:'review',mode:'review',september15Review:true,title:'英語｜間違えた問題を復習',list,i:0,correct:0,combo:0,maxCombo:0,score:0,wrongThisRun:[],feverGauge:0,feverLeft:0,feverCount:0,weakHits:0};
  renderQuestion();
}
export function renderSeptember15Learn(group,index=0){
  stopTimer();stopSpeech();stopBossTension();
  const sid='sep15EnChoose'+(group+1), words=QUESTIONS[sid].data;
  const w=words[index].learn;
  app().innerHTML=`<section class="card sepMenu"><span class="tag">音と意味｜${index+1} / 5語</span>
    <h1 lang="en">${escapeHtml(w.word)}</h1><p>No.${w.no}</p>
    <button class="btn" id="sepListen">🔊 発音を聞く</button><p id="sepAudioStatus" role="status"></p>
    <details open class="sepReading"><summary>読み方のヒント</summary><p>${escapeHtml(w.reading)}</p><small>カタカナは目安。音声をまねして声に出そう。</small></details>
    <details open class="sepMeaning"><summary>意味を表示／隠す</summary><p>${escapeHtml(w.meaning)}</p></details>
    <p>一度読んだら意味を隠して、自分で言ってみよう。</p>
    <div class="sepGrid"><button class="btn secondary" id="sepPrev" ${index?'':'disabled'}>← 前の語</button><button class="btn" id="sepNext">${index===4?'5語のクイズへ →':'次の語 →'}</button></div>
    <button class="btn secondary" id="sepLearnBack">← 英語メニューへ</button></section>`;
  document.getElementById('sepListen').addEventListener('click',()=>{
    const ok=speakEnglish(w.word,{manual:true});
    document.getElementById('sepAudioStatus').textContent=ok?'聞こえないときは端末の音量を確認してね。':'この端末では音声を再生できないよ。読み方のヒントを使ってね。';
  });
  document.getElementById('sepPrev').addEventListener('click',()=>renderSeptember15Learn(group,index-1));
  document.getElementById('sepNext').addEventListener('click',()=>index===4?startStage(sid):renderSeptember15Learn(group,index+1));
  document.getElementById('sepLearnBack').addEventListener('click',()=>renderSeptember15Home(true));
}
