import { el, app, toast } from "../utils.js";
import { stopTimer } from "../timer.js";
import { stopBossTension, playBossResultSound } from "../audio.js";
import { state, save, evalTitle, masteredCount } from "../state.js";
import { QUESTIONS, STAGE_ORDER, CARDS } from "../content.js";
import { renderHome } from "./home.js";
import { renderSubjectHome } from "./subject.js";
import { startStage, startReview, startBoss } from "./quiz.js";

/* ============================================================
   追加機能：ボス戦の勝敗画面
============================================================ */
export function renderBossDefeat(){
  stopTimer();
  stopBossTension();
  playBossResultSound(false);
  const c=state.cur;
  save();
  app().innerHTML="";
  app().appendChild(el(`<div class="card center">
    <div class="bossResult">💀</div>
    <div style="font-size:1.3rem;font-weight:800">ボスにやられた…</div>
    <div class="muted">${c.bossName}　｜　与えたダメージ ${c.bossMaxHP-c.bossHP}/${c.bossMaxHP}</div>
    <div class="muted">弱点攻撃 ${c.weakHits||0}回　｜　フィーバー ${c.feverCount||0}回</div>
    <div style="margin:10px 0;font-weight:700">大丈夫、復習してから再挑戦しよう！</div>
    <div class="row" style="margin-top:16px">
      <button class="btn secondary" id="retryBtn">もう一度挑む</button>
      <button class="btn" id="homeBtn">ホームへ →</button>
    </div>
  </div>`));
  // 追加機能（教科選択ファースト化）：ボス戦は必ず特定教科のステージなので、直前の教科ホームへ戻る
  document.getElementById('homeBtn').addEventListener('click',()=>renderSubjectHome(QUESTIONS[c.sid].subject));
  document.getElementById('retryBtn').addEventListener('click',()=>startBoss(c.sid));
}
export function renderBossVictory(){
  stopTimer();
  stopBossTension();
  playBossResultSound(true);
  const c=state.cur;
  state.totalScore += c.score;
  state.bossCleared[c.sid]=true;
  const badgeName = QUESTIONS[c.sid].title+' 討伐';
  const newBadges=[];
  const addBadge=(name)=>{if(!state.badges.has(name)){state.badges.add(name);newBadges.push(name);}};
  addBadge(badgeName);
  evalTitle();
  save();

  const badgeHtml = newBadges.length
    ? `<div class="badges">${newBadges.map(b=>`<div class="badge">🏅 ${b} GET!</div>`).join("")}</div>` : "";

  app().innerHTML="";
  app().appendChild(el(`<div class="card center">
    <div class="bossResult">🏆</div>
    <div style="font-size:1.3rem;font-weight:800">ボス討伐！</div>
    <div class="muted">${c.bossName}　｜　残りライフ ${'❤'.repeat(c.lives)}　｜　獲得 ${c.score}点</div>
    <div class="muted">弱点攻撃 ${c.weakHits||0}回　｜　フィーバー ${c.feverCount||0}回</div>
    ${badgeHtml}
    <div style="margin:10px 0;font-weight:700">おめでとう！このステージの理解はもう完璧だね！</div>
    <div class="row" style="margin-top:16px">
      <button class="btn secondary" id="retryBtn">もう一度挑む</button>
      <button class="btn" id="homeBtn">ホームへ →</button>
    </div>
  </div>`));
  // 追加機能（教科選択ファースト化）：ボス戦は必ず特定教科のステージなので、直前の教科ホームへ戻る
  document.getElementById('homeBtn').addEventListener('click',()=>renderSubjectHome(QUESTIONS[c.sid].subject));
  document.getElementById('retryBtn').addEventListener('click',()=>startBoss(c.sid));
  setTimeout(()=>toast('🎉🏆 '+badgeName+'！おめでとう！'),400);
}

/* ============================================================
   結果画面
============================================================ */
export function renderResult(){
  stopTimer(); // 結果画面到達時にタイマーが残っていないことを保証（防御的）
  stopBossTension();
  const c=state.cur;
  const total=c.list.length;
  const pctRaw=c.correct/total*100;
  const pct=Math.round(pctRaw);
  let rank,msg;
  if(pct>=90){rank="S";msg="かんぺき！この調子なら赤点なんて心配なし！";}
  else if(pct>=75){rank="A";msg="よくできました！合格ラインは十分こえてるよ。";}
  else if(pct>=60){rank="B";msg="いい感じ！あと少しで安心圏。復習でつめよう。";}
  else if(pct>=40){rank="C";msg="ここからが伸びどころ。まちがえた問題を復習しよう！";}
  else{rank="D";msg="大丈夫、解説を読み直せば必ず伸びる。もう一回いこう！";}

  // ステージクリア＆ベスト更新（復習はSRSで管理するのでプール操作は不要）
  let newlyCleared=false;
  if(c.mode==='stage'){
    if(!state.stageCleared[c.sid]){state.stageCleared[c.sid]=true;newlyCleared=true;}
    if(pct>state.stageBest[c.sid])state.stageBest[c.sid]=pct;
    state.totalScore += c.score;
  } else {
    state.totalScore += c.score;
  }

  // バッジ判定
  const newBadges=[];
  const addBadge=(name)=>{if(!state.badges.has(name)){state.badges.add(name);newBadges.push(name);}};
  if(pct===100)addBadge(c.title+' 全問正解');
  if(c.maxCombo>=5)addBadge('5コンボ達成');
  if(c.maxCombo>=10)addBadge('10コンボ達成');
  if(newlyCleared)addBadge(c.title+' クリア');
  if(STAGE_ORDER.every(sid=>state.stageCleared[sid]))addBadge('全ステージ制覇');
  // 継続・習熟・収集のバッジ
  if(state.streak>=7)addBadge('7日連続学習');
  if(state.streak>=30)addBadge('30日連続学習');
  if(masteredCount()>=50)addBadge('50問マスター');
  if(state.cards.size===CARDS.length)addBadge('図鑑コンプリート');
  // 称号の再評価（昇格時はevalTitle内でトースト）
  evalTitle();

  const badgeHtml = newBadges.length
    ? `<div class="badges">${newBadges.map(b=>`<div class="badge">🏅 ${b} GET!</div>`).join("")}</div>` : "";

  const wrongList = c.wrongThisRun.length
    ? `<div class="muted" style="margin-top:14px">今回まちがえた問題：${c.wrongThisRun.length}問。ホームの「今日の復習」でちょうどよいタイミングにまた出るよ。</div>`
    : `<div class="muted" style="margin-top:14px">まちがい0問！すばらしい！</div>`;

  save();

  app().innerHTML="";
  app().appendChild(el(`<div class="card center">
    <div class="muted">${c.title}　結果</div>
    <div class="rankbig">${rank}</div>
    <div style="font-size:1.3rem;font-weight:800">正答率 ${pct}%</div>
    <div class="muted">${c.correct} / ${total} 問正解　｜　最大コンボ ${c.maxCombo}　｜　獲得 ${c.score}点</div>
    <div class="muted">フィーバー ${c.feverCount||0}回</div>
    <div style="margin:10px 0;font-weight:700">${msg}</div>
    ${badgeHtml}
    ${wrongList}
    <div class="row" style="margin-top:16px">
      <button class="btn secondary" id="retryBtn">もう一度</button>
      <button class="btn" id="homeBtn">ホームへ →</button>
    </div>
  </div>`));

  // 追加機能（教科選択ファースト化）：stageモードは直前の教科ホームへ、reviewモード（教科横断）は教科選択へ戻る
  document.getElementById('homeBtn').addEventListener('click',()=>{
    if(c.mode==='review') renderHome();
    else renderSubjectHome(QUESTIONS[c.sid].subject);
  });
  document.getElementById('retryBtn').addEventListener('click',()=>{
    if(c.mode==='review')startReview();else startStage(c.sid);
  });

  if(newlyCleared) setTimeout(()=>toast('🎉 ステージクリア！おつかれさま！'),400);
}
