/* ============================================================
   歴史総合クエスト｜エンジン本体
   HQ.units（各 data/*.js が registerUnit で登録した単元）から
   QUESTIONS / STAGE_ORDER / CARDS / CARD_BY_ID を動的に構築する。
   単元やカードを追加しても、この下のロジックは変更不要。
============================================================ */

/* ---------- HQ.units から QUESTIONS / STAGE_ORDER を構築 ---------- */
const QUESTIONS = {};
HQ.units.forEach(u => {
  QUESTIONS[u.id] = { title: u.title, desc: u.desc, data: u.questions, subject: u.subject, group: u.group };
});
// order 昇順で並べたステージID一覧（ホーム表示・ボス戦・弱点マップ・SRSの対象範囲を決める）
const STAGE_ORDER = HQ.units.slice().sort((a, b) => a.order - b.order).map(u => u.id);

/* ---------- HQ.units[].cards + HQ.cards から CARDS / CARD_BY_ID を構築 ---------- */
const CARDS = [];
HQ.units.forEach(u => { if (u.cards) CARDS.push.apply(CARDS, u.cards); });
if (HQ.cards) CARDS.push.apply(CARDS, HQ.cards);
const CARD_BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));

/* ---------- 全問題数（称号の母数などに使う。単元・問題を追加しても自動追従） ---------- */
function totalQuestionCount() {
  return STAGE_ORDER.reduce((n, sid) => n + QUESTIONS[sid].data.length, 0);
}

/* ============================================================
   ゲーム状態
============================================================ */
const state = {
  totalScore:0,
  stageCleared:{},
  stageBest:{},
  badges:new Set(),
  wrongPool:[],          // （旧・未使用）復習はSRSに一本化
  qStats:{},             // "s1-0":{seen,correct,box,due}  1問ごとの成績＋間隔反復
  streak:0,              // 連続学習日数
  lastStudyDate:"",      // "YYYY-MM-DD"
  cards:new Set(),       // 解放済み図鑑カードID
  title:"",              // 現在の称号
  settings:{timeAttack:true, inputMode:false}, // 追加機能：眠気対策の設定
  bossCleared:{},        // 追加機能："s1":true など、ボス撃破済みステージ
  // 現在のプレイ
  cur:null
};
STAGE_ORDER.forEach(sid=>{ state.stageCleared[sid]=false; state.stageBest[sid]=0; });
const DEFAULT_SETTINGS={timeAttack:true, inputMode:false};

/* 称号（累積マスター数で昇格。下がらない成長指標）
   最上位の「学習マスター」は、全問題数に応じて動的に決まる（定数固定にしない）。
   追加機能（数学統合）：教科中立の名称に変更（歴史・数学どちらでも通用する称号）。 */
const TITLES = [
  {name:"学びの見習い",   need:0},
  {name:"知の探究者",     need:40},
  {name:"賢者の卵",       need:100},
  {name:"学習マスター",   need:totalQuestionCount()}
];

/* ---------- ユーティリティ ---------- */
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function el(html){const d=document.createElement('div');d.innerHTML=html.trim();return d.firstChild;}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1800);}
const app=()=>document.getElementById('app');

/* ---------- 追加機能：文字列の正規化（記述モードの表記ゆらぎ吸収） ---------- */
function normalizeAnswer(s){
  if(s==null)return "";
  let x=String(s);
  x=x.replace(/[\s　]+/g,'');                 // 全角/半角空白の除去
  x=x.replace(/[＝=]/g,'=');                  // 等号ゆらぎ
  x=x.replace(/[・･]/g,'・');                 // 中黒ゆらぎ
  x=x.replace(/[（(]/g,'(').replace(/[）)]/g,')'); // 括弧ゆらぎ
  x=x.replace(/[ー－―‐]/g,'ー');              // 長音・ダッシュ類ゆらぎ
  x=x.replace(/[、,]/g,'、');
  x=x.replace(/[。.]/g,'。');
  // 追加機能（数学統合）：全角数字→半角、全角英字→半角、マイナス記号ゆらぎ統一
  x=x.replace(/[０-９]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0xFEE0));
  x=x.replace(/[Ａ-Ｚａ-ｚ]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0xFEE0));
  x=x.replace(/[−－ー―‐]/g,'-');              // マイナス記号ゆらぎ→半角ハイフンに統一（数値比較用）
  return x.toLowerCase();
}
function isAnswerMatch(input, correct){
  const ni=normalizeAnswer(input), nc=normalizeAnswer(correct);
  if(ni==="")return false;
  if(ni===nc)return true;
  // 追加機能（数学統合）：文字列不一致でも、数値としてparseFloatが両方有限かつ一致すれば正解とみなす
  const fi=parseFloat(ni), fc=parseFloat(nc);
  if(Number.isFinite(fi)&&Number.isFinite(fc)&&fi===fc)return true;
  return false;
}
/* 追加機能（数学統合）：複数許容解対応の判定ヘルパー（answersは配列 or 単一値） */
function isAnyAnswerMatch(input, answers){
  const list=Array.isArray(answers)?answers:[answers];
  return list.some(a=>isAnswerMatch(input,a));
}

/* ---------- 日付（ローカル基準。toISOStringはUTCずれするので使わない） ---------- */
function pad2(n){return (n<10?'0':'')+n;}
function todayStr(){const d=new Date();return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function addDays(dateStr,n){const [y,m,dd]=dateStr.split('-').map(Number);const d=new Date(y,m-1,dd);d.setDate(d.getDate()+n);return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}

/* ---------- 保存／読込（localStorage・Setは配列化して往復） ---------- */
const SAVE_KEY='rekishi-quest-v1';
function save(){
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      totalScore:state.totalScore,
      stageCleared:state.stageCleared,
      stageBest:state.stageBest,
      badges:[...state.badges],
      qStats:state.qStats,
      streak:state.streak,
      lastStudyDate:state.lastStudyDate,
      cards:[...state.cards],
      title:state.title,
      settings:state.settings,
      bossCleared:state.bossCleared
    }));
  }catch(e){/* 保存できなくても学習は続けられるので握りつぶす */}
}
function load(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return;                 // 旧データ無し＝初期stateのまま
    const d=JSON.parse(raw);
    if(!d||typeof d!=='object')return;
    if(typeof d.totalScore==='number')state.totalScore=d.totalScore;
    if(d.stageCleared)Object.assign(state.stageCleared,d.stageCleared);
    if(d.stageBest)Object.assign(state.stageBest,d.stageBest);
    state.badges=new Set(d.badges||[]);
    state.qStats=d.qStats||{};
    state.streak=d.streak||0;
    state.lastStudyDate=d.lastStudyDate||"";
    state.cards=new Set(d.cards||[]);
    state.title=d.title||"";
    // 追加機能：settingsは旧データ（無し）でも壊れないようデフォルトとマージ
    state.settings=Object.assign({},DEFAULT_SETTINGS,(d.settings&&typeof d.settings==='object')?d.settings:{});
    state.bossCleared=(d.bossCleared&&typeof d.bossCleared==='object')?d.bossCleared:{};
  }catch(e){/* 壊れたデータ・別バージョンは初期stateで開始 */}
  cleanupStaleQStats();  // 追加機能（数学カテゴリ細分化）：存在しない単元IDのqStatsキーが習熟度/称号を汚染しないよう掃除
}

/* ---------- 追加機能（数学カテゴリ細分化）：qStatsの整合確認 ----------
   単元を大単元(m1/m2/m3)から小カテゴリ(m1s1〜m3s5)に再構成したことで、
   旧保存データには存在しない単元IDのキー（例:"m1-0"）が残留する場合がある。
   これらは現在のSTAGE_ORDER・QUESTIONSに存在しないキーなので、
   masteredCount()等の集計を汚染しないよう、現存する問題キー集合でフィルタして削除する。
   歴史側（s1〜s3）のキーは単元ID・問題数を変更していないため、この処理では一切削除されない。 */
function cleanupStaleQStats(){
  const validKeys=new Set();
  STAGE_ORDER.forEach(sid=>{
    QUESTIONS[sid].data.forEach((q,idx)=>{ validKeys.add(sid+'-'+idx); });
  });
  let removed=0;
  Object.keys(state.qStats).forEach(key=>{
    if(!validKeys.has(key)){ delete state.qStats[key]; removed++; }
  });
  if(removed>0) save();  // 掃除結果を保存（次回起動時に再スキャンしなくて済む）
}

/* ---------- ストリーク（連続学習日数） ---------- */
function touchStreak(){
  const t=todayStr();
  if(state.lastStudyDate===t)return;           // 今日すでに学習済み＝不変
  if(state.lastStudyDate===addDays(t,-1))state.streak++;  // 昨日から連続
  else state.streak=1;                          // それ以外（初回・間が空いた）
  state.lastStudyDate=t;
  save();
  if([3,7,14,30].includes(state.streak))setTimeout(()=>toast('🔥 '+state.streak+'日連続学習！えらい！'),500);
}

/* ---------- 1問ごとの成績＋間隔反復（Leitner方式） ---------- */
const SRS_INTERVAL=[0,1,3,7,14,30];  // box 0〜5 の復習間隔（日）
function getQStat(key){
  if(!state.qStats[key])state.qStats[key]={seen:0,correct:0,box:0,due:todayStr()};
  return state.qStats[key];
}
function updateQStat(key,isCorrect){
  const st=getQStat(key);
  st.seen++;
  if(isCorrect){
    st.correct++;
    st.box=Math.min(st.box+1,5);
    st.due=addDays(todayStr(),SRS_INTERVAL[st.box]);
  }else{
    st.box=0;
    st.due=todayStr();
  }
}
function isMastered(key){const st=state.qStats[key];return !!(st&&st.box>=3);}
function masteredCount(){return Object.keys(state.qStats).filter(isMastered).length;}

/* 全ステージ横断で、今日が復習日（due<=today）の問題を集める */
function dueList(){
  const t=todayStr(), out=[];
  STAGE_ORDER.forEach(sid=>{
    QUESTIONS[sid].data.forEach((q,idx)=>{
      const key=sid+'-'+idx, st=state.qStats[key];
      if(st && st.due<=t)out.push({...q,_key:key});
    });
  });
  return out;
}

/* ステージ習熟度（マスター済み問題数 / 全問数, %） */
function stageMastery(sid){
  const data=QUESTIONS[sid].data;
  let m=0;
  data.forEach((q,idx)=>{if(isMastered(sid+'-'+idx))m++;});
  return {pct:Math.round(m/data.length*100), mastered:m, total:data.length};
}
/* 追加機能（教科選択ファースト化）：subjectを指定すると、その教科の単元だけに限定して最弱ステージを探す（省略時は全教科横断） */
function weakestStage(subject){
  let worst=null;
  STAGE_ORDER.forEach(sid=>{
    if(subject && (QUESTIONS[sid].subject||"")!==subject)return;
    const p=stageMastery(sid).pct;
    if(!worst||p<worst.pct)worst={sid,pct:p};
  });
  return worst;
}

/* 追加機能（教科選択ファースト化）：登録済みsubjectの一覧をorder順・重複除去で返す（見出しの無い単元は"その他"に集約） */
function subjectList(){
  const seen=new Set(), out=[];
  STAGE_ORDER.forEach(sid=>{
    const subject=QUESTIONS[sid].subject || "その他";
    if(!seen.has(subject)){ seen.add(subject); out.push(subject); }
  });
  return out;
}
/* 教科ごとのステージID一覧（order順） */
function stagesOfSubject(subject){
  return STAGE_ORDER.filter(sid=>(QUESTIONS[sid].subject||"その他")===subject);
}
/* 教科の習熟度（その教科の全問題でのマスター率, %） */
function subjectMastery(subject){
  const sids=stagesOfSubject(subject);
  let total=0, mastered=0;
  sids.forEach(sid=>{
    const m=stageMastery(sid);
    total+=m.total; mastered+=m.mastered;
  });
  return {pct: total? Math.round(mastered/total*100):0, mastered, total};
}
/* 教科のクリア済みステージ数 */
function subjectClearedCount(subject){
  const sids=stagesOfSubject(subject);
  return {cleared: sids.filter(sid=>state.stageCleared[sid]).length, total: sids.length};
}

/* ---------- 図鑑カードの解放 ---------- */
function unlockCard(id){
  if(!CARD_BY_ID[id]||state.cards.has(id))return;
  state.cards.add(id);
  setTimeout(()=>toast('📖 図鑑に「'+CARD_BY_ID[id].name+'」が仲間入り！'),300);
}

/* ---------- 称号（累積マスター数で昇格。上がるときだけトースト） ---------- */
function evalTitle(){
  const m=masteredCount();
  let best=TITLES[0].name;
  TITLES.forEach(tt=>{if(m>=tt.need)best=tt.name;});
  if(state.title!==best){
    const first=state.title!=="";
    state.title=best;
    if(first)setTimeout(()=>toast('🎖 称号が「'+best+'」に昇格！'),700);
  }
  return best;
}

/* ============================================================
   追加機能（教科選択ファースト化）：直前にいた教科ホームを覚えておくモジュール変数
   リロード時は永続化しない（教科選択画面から開始でよい仕様のため、localStorageには保存しない）。
============================================================ */
let currentSubject = null;

/* ============================================================
   教科選択画面（新トップ）
============================================================ */
function renderHome(){
  stopTimer(); // ホームに戻る全経路でタイマーを確実に止める（防御的）
  if(!state.title)evalTitle();   // 初回は現在の称号を確定
  currentSubject = null;   // 教科選択に戻ったので「直前の教科ホーム」は無し

  // 追加機能（教科選択ファースト化）：教科カードをorder順・重複除去で動的生成
  const cardsHtml = subjectList().map(subject=>{
    const {cleared,total} = subjectClearedCount(subject);
    const m = subjectMastery(subject);
    return `<div class="subjectCard" data-subject="${subject}">
      <div class="subjectCard-name">${subject}</div>
      <div class="subjectCard-sum">クリア ${cleared}/${total}　｜　習熟度 ${m.pct}%</div>
      <div class="mastery"><i style="width:${m.pct}%"></i></div>
    </div>`;
  }).join("");

  const dueN=dueList().length;
  const reviewBtn = dueN
    ? `<button class="btn secondary" id="reviewBtn">🔁 今日の復習（${dueN}問）</button>` : "";

  const collBtn = `<button class="btn secondary" id="collBtn">📖 学習図鑑（${state.cards.size}/${CARDS.length}）</button>`;

  const badgesHtml = state.badges.size
    ? `<div class="badges">${[...state.badges].map(b=>`<div class="badge">🏅 ${b}</div>`).join("")}</div>` : "";

  // 追加機能：眠気対策の設定トグル（タイムアタック／記述モード）
  const ta = !!(state.settings&&state.settings.timeAttack);
  const im = !!(state.settings&&state.settings.inputMode);
  const settingsHtml = `<div class="settingsRow">
      <div class="toggleChip ${ta?'on':''}" id="toggleTimeAttack">⏱ タイムアタック<span class="st">${ta?'ON':'OFF'}</span></div>
      <div class="toggleChip ${im?'on':''}" id="toggleInputMode">✍️ 記述モード<span class="st">${im?'ON':'OFF'}</span></div>
    </div>`;

  app().innerHTML = "";
  app().appendChild(el(`<div>
    <h1>🏰 学習クエスト</h1>
    <div class="titleWrap"><span class="titleBadge">🎖 ${state.title}</span></div>
    <div class="sub">歴史総合・数学Ⅰをゲーム感覚で攻略<br>全${totalQuestionCount()}問／基礎多め＋標準　解説つき</div>
    <div class="card">
      <div class="hud">
        <span class="chip">合計スコア <span class="em">${state.totalScore}</span></span>
        <span class="chip"><span class="fire">🔥</span> 連続 <span class="em">${state.streak}</span>日</span>
        <span class="chip">バッジ <span class="em">${state.badges.size}</span></span>
      </div>
      <div class="muted">まずは教科を選んでね。1問ごとに解説が出るよ。まちがえた問題は「今日の復習」でちょうどよいタイミングにまた出るから大丈夫！</div>
      ${settingsHtml}
      ${cardsHtml}
      ${reviewBtn}
      ${collBtn}
      ${badgesHtml}
    </div>
  </div>`));

  document.querySelectorAll('.subjectCard').forEach(node=>{
    node.addEventListener('click',()=>renderSubjectHome(node.dataset.subject));
  });
  const rb=document.getElementById('reviewBtn');
  if(rb) rb.addEventListener('click',startReview);
  const cb=document.getElementById('collBtn');
  if(cb) cb.addEventListener('click',renderCollection);

  // 追加機能：設定トグルのイベント（トグル→保存→教科選択再描画）
  const ttBtn=document.getElementById('toggleTimeAttack');
  if(ttBtn) ttBtn.addEventListener('click',()=>{
    state.settings.timeAttack=!state.settings.timeAttack;
    save();
    renderHome();
  });
  const imBtn=document.getElementById('toggleInputMode');
  if(imBtn) imBtn.addEventListener('click',()=>{
    state.settings.inputMode=!state.settings.inputMode;
    save();
    renderHome();
  });
}

/* ============================================================
   教科ホーム（新設）：指定した教科のステージ一覧のみ表示
============================================================ */
function renderSubjectHome(subject){
  stopTimer(); // 教科ホームに戻る全経路でタイマーを確実に止める（防御的）
  currentSubject = subject;   // 結果画面・ボス勝敗画面からの「ホームへ」の戻り先として記憶

  const sids = stagesOfSubject(subject);

  // 数学のような大カテゴリ（group）を持つ教科は見出しを挟む。歴史のようにgroupが無い教科は見出し無しのまま。
  let lastGroup=null;
  const stagesHtml = sids.map((sid,i)=>{
    const s=QUESTIONS[sid];
    const best = state.stageBest[sid];
    const cleared = state.stageCleared[sid];
    const m=stageMastery(sid);
    const bossUnlocked = isStageUnlockedForBoss(sid);
    const bossDone = !!state.bossCleared[sid];
    const bossBtn = `<button class="bossBtn ${bossUnlocked?'':'locked'}" data-boss="${sid}">${bossDone?'👑 再挑戦':(bossUnlocked?'👹 ボス戦':'🔒 ボス戦')}</button>`;
    const group = s.group || "";
    let headHtml = "";
    if(group && group!==lastGroup){
      headHtml += `<div class="groupHead">${group}</div>`;
      lastGroup = group;
    } else if(!group){
      lastGroup = null;   // groupの無い単元が続く場合は次にgroup付き単元が来たら必ず見出しを出す
    }
    return `${headHtml}<div class="stage" data-stage="${sid}">
      <div class="no">${i+1}</div>
      <div style="flex:1;min-width:0">
        <div class="t">${s.title}</div>
        <div class="d">${s.desc}　全${s.data.length}問</div>
        <div class="mastery"><i style="width:${m.pct}%"></i></div>
        <div class="masteryTxt">習熟 ${m.pct}%（${m.mastered}/${m.total}問マスター）</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <div class="star">${cleared?('★ '+best+'%'):'▶'}</div>
        ${bossBtn}
      </div>
    </div>`;
  }).join("");

  const {cleared,total} = subjectClearedCount(subject);
  const weak=weakestStage(subject);
  const weakHtml = weak
    ? `<div class="weakspot" data-stage="${weak.sid}">📉 いま伸びしろNo.1：${QUESTIONS[weak.sid].title}（習熟 ${weak.pct}%）　タップで挑戦！</div>` : "";

  app().innerHTML = "";
  app().appendChild(el(`<div>
    <h1>${subject}</h1>
    <button class="btn secondary small" id="subjectBackBtn" style="margin-bottom:10px">← 教科選択へ</button>
    <div class="card">
      <div class="hud">
        <span class="chip">クリア <span class="em">${cleared}/${total}</span></span>
      </div>
      <div class="muted">好きなステージからいつでも始められるよ。1問ごとに解説が出るよ。</div>
      ${stagesHtml}
      ${weakHtml}
    </div>
  </div>`));

  document.getElementById('subjectBackBtn').addEventListener('click',renderHome);

  document.querySelectorAll('.stage').forEach(node=>{
    node.addEventListener('click',(e)=>{
      if(e.target.closest('[data-boss]'))return; // ボスボタンのクリックはステージ通常開始と混同しない
      startStage(node.dataset.stage);
    });
  });
  document.querySelectorAll('[data-boss]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      startBoss(btn.dataset.boss);
    });
  });
  const ws=document.querySelector('.weakspot');
  if(ws) ws.addEventListener('click',()=>startStage(ws.dataset.stage));
}

/* ============================================================
   コレクション図鑑
============================================================ */
function renderCollection(){
  const cardsHtml = CARDS.map(c=>{
    const owned=state.cards.has(c.id);
    return owned
      ? `<div class="collCard"><div class="emoji">${c.emoji}</div><div class="name">${c.name}</div><div class="kind">${c.kind}</div><div class="desc">${c.desc}</div></div>`
      : `<div class="collCard locked"><div class="emoji">🔒</div><div class="name">？？？</div><div class="kind">${c.kind}</div><div class="desc">問題に正解すると解放</div></div>`;
  }).join("");

  app().innerHTML="";
  app().appendChild(el(`<div>
    <h1>📖 学習図鑑</h1>
    <div class="sub">問題に正解して、重要人物・条約・できごと・公式を集めよう！</div>
    <div class="card">
      <div class="hud">
        <span class="chip">解放 <span class="em">${state.cards.size}</span>/${CARDS.length}</span>
      </div>
      <div class="collGrid">${cardsHtml}</div>
      <button class="btn secondary small" id="collHome" style="margin-top:14px">← ホームにもどる</button>
    </div>
  </div>`));
  document.getElementById('collHome').addEventListener('click',renderHome);
}

/* ============================================================
   ステージ開始
============================================================ */
function startStage(sid){
  const s=QUESTIONS[sid];
  state.cur={
    sid, mode:'stage', title:s.title,
    list:s.data.map((q,idx)=>({...q,_key:sid+'-'+idx})),
    i:0, correct:0, combo:0, maxCombo:0, score:0, wrongThisRun:[]
  };
  renderQuestion();
}
function startReview(){
  const due=dueList();
  if(!due.length){toast('今日の復習はもうないよ！よくがんばったね！');return;}
  state.cur={
    sid:'review', mode:'review', title:'今日の復習',
    list:shuffle(due),
    i:0, correct:0, combo:0, maxCombo:0, score:0, wrongThisRun:[]
  };
  renderQuestion();
}

/* ============================================================
   追加機能：ライフ制＋ボス戦
============================================================ */
function isStageUnlockedForBoss(sid){
  return !!state.stageCleared[sid];   // そのステージを通常クリア済みなら解放
}
function startBoss(sid){
  if(!isStageUnlockedForBoss(sid)){toast('まずは通常プレイでこのステージをクリアしよう！');return;}
  const s=QUESTIONS[sid];
  state.cur={
    sid, mode:'boss', title:s.title,
    list:shuffle(s.data.map((q,idx)=>({...q,_key:sid+'-'+idx}))),
    i:0, correct:0, combo:0, maxCombo:0, score:0, wrongThisRun:[],
    lives:3, bossHP:s.data.length, bossMaxHP:s.data.length,
    bossName:s.title+' の主'
  };
  renderQuestion();
}

/* ============================================================
   追加機能：タイマー管理（単一ハンドルで多重起動を防止）
   離脱経路（回答・次へ・ホーム戻る・ボス敗北等）では必ず stopTimer() を呼ぶこと
============================================================ */
const TIMER={interval:null, timeout:null};
function stopTimer(){
  if(TIMER.interval){clearInterval(TIMER.interval);TIMER.interval=null;}
  if(TIMER.timeout){clearTimeout(TIMER.timeout);TIMER.timeout=null;}
}
function timeLimitFor(q){
  if(typeof q.time==='number')return q.time;   // 追加機能（数学統合）：問題ごとの明示指定を最優先
  if(q.type==="suji"||q.type==="fill")return 60;  // 追加機能（数学統合）：計算時間を確保
  if(q.type==="junban")return 25;                 // 追加機能（数学統合）：nenpyoと同等の並べ替え時間
  return (q.type==="kumi"||q.type==="nenpyo") ? 25 : 15;
}
/* onTimeout: 時間切れ時に呼ぶコールバック（渡された q を使って不正解処理） */
function startTimer(limitSec, onTick, onTimeout){
  stopTimer();  // 前のタイマーが残っていないことを保証
  let remain=limitSec;
  onTick(remain, limitSec);
  TIMER.interval=setInterval(()=>{
    remain--;
    if(remain<=0){
      stopTimer();
      onTick(0, limitSec);
      onTimeout();
      return;
    }
    onTick(remain, limitSec);
  },1000);
}

/* ============================================================
   問題描画
============================================================ */
function renderQuestion(){
  stopTimer(); // 再描画時は必ず前のタイマーを止める（多重起動防止）
  const c=state.cur;
  if(c.i>=c.list.length){ renderResult(); return; }  // 範囲外の防御
  c._locked=false;   // 新しい問題を描画するのでロック解除
  const q=c.list[c.i];
  const num=c.i+1, total=c.list.length;
  const pct=Math.round((c.i)/total*100);
  const isBoss = c.mode==='boss';
  const timeAttackOn = isBoss ? true : !!(state.settings&&state.settings.timeAttack); // ボス戦は強制ON

  const hud=`<div class="hud">
    <span class="chip">${c.title}</span>
    <span class="chip">Q <span class="em">${num}</span>/${total}</span>
    <span class="chip">スコア <span class="em">${c.score}</span></span>
    <span class="chip combo">🔥 ${c.combo}</span>
  </div>
  <div class="progress"><div class="bar" style="width:${pct}%"></div></div>`;

  const bossHud = isBoss ? `<div class="bossHud">
      <div class="bossRow">
        <div class="bossEmoji">👹</div>
        <div class="bossName">${c.bossName}</div>
        <div class="lives">${'❤'.repeat(c.lives)}${'🖤'.repeat(3-c.lives)}</div>
      </div>
      <div class="hpBar"><i style="width:${Math.max(0,Math.round(c.bossHP/c.bossMaxHP*100))}%"></i></div>
    </div>` : "";

  const timerHtml = timeAttackOn ? `<div class="timerWrap">
      <div class="timerBar" id="timerBar"><i id="timerBarInner"></i></div>
      <div class="timerTxt" id="timerTxt"></div>
    </div>` : "";

  const typeLabel={yon:"4択問題",maru:"○×問題",ana:"穴埋め問題",kumi:"組み合わせ問題",nenpyo:"年表並べ替え問題",
    suji:"数値入力問題",fill:"穴埋め問題",junban:"手順並べ替え問題"}[q.type];
  const tags=`<div class="qtypebar"><span class="tag lv">${q.lv}</span><span class="tag">${typeLabel}</span></div>`;

  // 追加機能：記述（入力）モードで ana を出題するか
  const useInputMode = q.type==="ana" && !!(state.settings&&state.settings.inputMode) && !c._forceChoice;

  let body="";
  if(q.type==="maru"){
    body=`<div class="qtext">${q.q}</div>
      <div class="swipeHint">← ×（左スワイプ）　｜　（右スワイプ）○ →</div>
      <div class="mxwrap swipeable" id="mxwrap">
        <button class="opt" data-mx="true">○</button>
        <button class="opt" data-mx="false">×</button>
      </div>`;
  } else if(q.type==="kumi"){
    const rights=shuffle(q.pairs.map(p=>p.r));
    const rows=q.pairs.map((p,idx)=>`
      <div class="matchrow" data-idx="${idx}">
        <div class="l">${p.l}</div>
        <select data-sel="${idx}">
          <option value="">▼ 選ぶ</option>
          ${rights.map(r=>`<option value="${r}">${r}</option>`).join("")}
        </select>
      </div>`).join("");
    body=`<div class="qtext">${q.q}</div>${rows}
      <button class="btn" id="kumiCheck">こたえ合わせ</button>`;
  } else if(q.type==="nenpyo"){
    if(!c._nenpyoOrder || c._nenpyoOrder.length!==q.items.length){c._nenpyoOrder=shuffle(q.items.map((it,idx)=>idx));}
    const order=c._nenpyoOrder;
    const rows=order.map((itemIdx,pos)=>`
      <div class="nenpyoItem" data-itemidx="${itemIdx}">
        <div class="rank">${pos+1}</div>
        <div class="name">${q.items[itemIdx].t}</div>
        <div class="arrows">
          <button data-up="${pos}" ${pos===0?'disabled':''}>▲</button>
          <button data-down="${pos}" ${pos===order.length-1?'disabled':''}>▼</button>
        </div>
      </div>`).join("");
    body=`<div class="qtext">${q.q}</div>
      <div class="nenpyoList" id="nenpyoList">${rows}</div>
      <button class="btn" id="nenpyoCheck">こたえ合わせ</button>`;
  } else if(useInputMode){
    body=`<div class="qtext">${q.q}</div>
      <div class="inputWrap">
        <input type="text" id="inputAns" placeholder="こたえを入力…" autocomplete="off">
      </div>
      <button class="btn" id="inputCheck">こたえる</button>
      <button class="fallbackLink" id="fallbackToChoice">選択肢を見る</button>`;
  } else if(q.type==="suji"){
    // 追加機能（数学統合）：数値入力（常時テキスト入力、選択肢なし）
    body=`<div class="qtext">${q.q}</div>
      <div class="inputWrap">
        <input type="text" id="inputAns" placeholder="こたえを入力…" autocomplete="off" inputmode="text">
      </div>
      <button class="btn" id="sujiCheck">こたえる</button>`;
  } else if(q.type==="fill"){
    // 追加機能（数学統合）：複数穴埋め（ラベル付き入力欄N個）
    const rows=q.blanks.map((label,idx)=>`
      <div class="blk" style="margin:8px 0">
        <small style="color:var(--muted);font-size:.78rem">${label}</small>
        <input type="text" class="fillInput" data-fillidx="${idx}" autocomplete="off">
      </div>`).join("");
    body=`<div class="qtext">${q.q}</div>${rows}
      <button class="btn" id="fillCheck">こたえ合わせ</button>`;
  } else if(q.type==="junban"){
    // 追加機能（数学統合）：手順並べ替え（nenpyoの▲▼UI・_nenpyoOrder機構を流用）
    if(!c._nenpyoOrder || c._nenpyoOrder.length!==q.steps.length){c._nenpyoOrder=shuffle(q.steps.map((st,idx)=>idx));}
    const order=c._nenpyoOrder;
    const rows=order.map((itemIdx,pos)=>`
      <div class="nenpyoItem" data-itemidx="${itemIdx}">
        <div class="rank">${pos+1}</div>
        <div class="name">${q.steps[itemIdx]}</div>
        <div class="arrows">
          <button data-up="${pos}" ${pos===0?'disabled':''}>▲</button>
          <button data-down="${pos}" ${pos===order.length-1?'disabled':''}>▼</button>
        </div>
      </div>`).join("");
    body=`<div class="qtext">${q.q}</div>
      <div class="nenpyoList" id="nenpyoList">${rows}</div>
      <button class="btn" id="junbanCheck">こたえ合わせ</button>`;
  } else { // yon / ana(選択)
    const order=shuffle(q.choices.map((ch,idx)=>({ch,idx})));
    c.shuffledCorrect=order.findIndex(o=>o.idx===q.a);
    const opts=order.map((o,pos)=>`<button class="opt" data-i="${pos}">${o.ch}</button>`).join("");
    body=`<div class="qtext">${q.q}</div>${opts}`;
  }

  // 追加機能（数学統合）：q.hintがある問題のみ「💡 ヒント」ボタンを表示（減点なし）
  const hintHtml = q.hint ? `<button class="fallbackLink" id="hintBtn" type="button">💡 ヒント</button>
    <div class="muted" id="hintText" style="display:none;margin-top:6px"></div>` : "";

  app().innerHTML="";
  app().appendChild(el(`<div><div class="card">${hud}${bossHud}${timerHtml}${tags}${body}
    ${hintHtml}
    <div class="fb" id="fb"></div>
    <div id="nextWrap"></div>
  </div>
  <button class="btn secondary small" id="quitBtn" style="margin-top:12px">← ホームにもどる</button>
  </div>`));

  document.getElementById('quitBtn').addEventListener('click',()=>{
    if(confirm('ホームにもどる？（このステージの進みはリセットされます）')){
      stopTimer();
      // 追加機能（教科選択ファースト化）：stage/bossは直前の教科ホームへ、reviewは教科選択へ戻る
      const backSubject = c.mode!=='review' ? QUESTIONS[c.sid].subject : null;
      if(backSubject) renderSubjectHome(backSubject); else renderHome();
    }
  });

  // 追加機能（数学統合）：ヒントボタン（表示のみ・減点なし）
  const hintBtn=document.getElementById('hintBtn');
  if(hintBtn) hintBtn.addEventListener('click',()=>{
    const ht=document.getElementById('hintText');
    ht.textContent='💡 '+q.hint;
    ht.style.display='block';
    hintBtn.disabled=true;
  });

  if(q.type==="maru"){
    document.querySelectorAll('[data-mx]').forEach(b=>b.addEventListener('click',()=>{
      answer(b.dataset.mx==='true'===q.a, b, null);
    }));
    setupSwipe(document.getElementById('mxwrap'), q);
  } else if(q.type==="kumi"){
    document.getElementById('kumiCheck').addEventListener('click',checkKumi);
  } else if(q.type==="nenpyo"){
    setupNenpyoHandlers(q);
    document.getElementById('nenpyoCheck').addEventListener('click',checkNenpyo);
  } else if(useInputMode){
    const inputEl=document.getElementById('inputAns');
    const doCheck=()=>checkInput(q);
    document.getElementById('inputCheck').addEventListener('click',doCheck);
    inputEl.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();doCheck();}});
    document.getElementById('fallbackToChoice').addEventListener('click',()=>{
      c._forceChoice=true;
      renderQuestion();
    });
    inputEl.focus();
  } else if(q.type==="suji"){
    // 追加機能（数学統合）：数値入力の採点バインド
    const inputEl=document.getElementById('inputAns');
    const doCheck=()=>checkSuji(q);
    document.getElementById('sujiCheck').addEventListener('click',doCheck);
    inputEl.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();doCheck();}});
    inputEl.focus();
  } else if(q.type==="fill"){
    // 追加機能（数学統合）：複数穴埋めの採点バインド
    document.getElementById('fillCheck').addEventListener('click',()=>checkFill(q));
    const fillInputs=document.querySelectorAll('.fillInput');
    if(fillInputs[0])fillInputs[0].focus();
  } else if(q.type==="junban"){
    // 追加機能（数学統合）：手順並べ替え（nenpyoの▲▼機構を共有・比較のみ別関数）
    setupNenpyoHandlers(q);
    document.getElementById('junbanCheck').addEventListener('click',checkJunban);
  } else {
    document.querySelectorAll('[data-i]').forEach(b=>b.addEventListener('click',()=>{
      answer(parseInt(b.dataset.i)===c.shuffledCorrect, b, parseInt(b.dataset.i));
    }));
  }

  // 追加機能：タイムアタック（時間切れ→自動不正解）
  if(timeAttackOn){
    const limit=timeLimitFor(q);
    c._timeLimit=limit;
    c._timeLeft=limit;
    startTimer(limit,(remain,total)=>{
      c._timeLeft=remain;
      const bar=document.getElementById('timerBarInner');
      const wrap=document.getElementById('timerBar');
      const txt=document.getElementById('timerTxt');
      if(!bar||!wrap||!txt)return; // 画面が既に切り替わっている場合の安全策
      bar.style.width=Math.max(0,Math.round(remain/total*100))+'%';
      txt.textContent='⏱ 残り '+remain+'秒';
      wrap.classList.remove('warn','danger');
      if(remain<=Math.ceil(total*0.33))wrap.classList.add('danger');
      else if(remain<=Math.ceil(total*0.6))wrap.classList.add('warn');
    },()=>{
      onTimeUp(q);
    });
  }
}

/* ---------- 追加機能：時間切れ処理（自動不正解） ---------- */
function onTimeUp(q){
  const c=state.cur;
  // クリック無効化＋正解を色表示
  document.querySelectorAll('.opt').forEach(o=>o.classList.add('disabled'));
  if(q.type==="maru"){
    document.querySelectorAll('[data-mx]').forEach(o=>{
      if((o.dataset.mx==='true')===q.a)o.classList.add('correct');
    });
  } else if(q.type==="yon"||(q.type==="ana"&&document.querySelector('[data-i]'))){
    document.querySelectorAll('[data-i]').forEach(o=>{
      if(parseInt(o.dataset.i)===c.shuffledCorrect)o.classList.add('correct');
    });
  } else if(q.type==="kumi"){
    document.querySelectorAll('select[data-sel]').forEach(sel=>{
      sel.disabled=true;
      const idx=parseInt(sel.dataset.sel);
      sel.classList.add(sel.value===q.pairs[idx].r?'correct':'wrong');
    });
    const kc=document.getElementById('kumiCheck'); if(kc)kc.disabled=true;
  } else if(q.type==="nenpyo"){
    document.querySelectorAll('.nenpyoItem .arrows button').forEach(b=>b.disabled=true);
    const nc=document.getElementById('nenpyoCheck'); if(nc)nc.disabled=true;
  } else if(q.type==="ana"){ // 入力モード中の時間切れ
    const inputEl=document.getElementById('inputAns');
    if(inputEl){inputEl.disabled=true;inputEl.classList.add('wrong');}
    const ic=document.getElementById('inputCheck'); if(ic)ic.disabled=true;
    const fb2=document.getElementById('fallbackToChoice'); if(fb2)fb2.disabled=true;
  } else if(q.type==="suji"){ // 追加機能（数学統合）：数値入力の時間切れ
    const inputEl=document.getElementById('inputAns');
    if(inputEl){inputEl.disabled=true;inputEl.classList.add('wrong');}
    const sc=document.getElementById('sujiCheck'); if(sc)sc.disabled=true;
  } else if(q.type==="fill"){ // 追加機能（数学統合）：複数穴埋めの時間切れ
    document.querySelectorAll('.fillInput').forEach(inp=>{inp.disabled=true;inp.classList.add('wrong');});
    const fc=document.getElementById('fillCheck'); if(fc)fc.disabled=true;
  } else if(q.type==="junban"){ // 追加機能（数学統合）：手順並べ替えの時間切れ
    document.querySelectorAll('.nenpyoItem .arrows button').forEach(b=>b.disabled=true);
    const jc=document.getElementById('junbanCheck'); if(jc)jc.disabled=true;
  }
  const hintBtn2=document.getElementById('hintBtn'); if(hintBtn2)hintBtn2.disabled=true;
  toast('⏰ 時間切れ！');
  finishQuestion(false,q,{timeUp:true});
}

/* ---------- yon/ana/maru の採点 ---------- */
function answer(isCorrect, clickedBtn, chosenIdx){
  stopTimer(); // 回答したのでタイマー停止
  const c=state.cur, q=c.list[c.i];
  document.querySelectorAll('.opt').forEach(o=>o.classList.add('disabled'));
  // 正解・不正解の色付け
  if(q.type==="maru"){
    document.querySelectorAll('[data-mx]').forEach(o=>{
      const val=o.dataset.mx==='true';
      if(val===q.a)o.classList.add('correct');
      else if(o===clickedBtn)o.classList.add('wrong');
    });
  } else {
    document.querySelectorAll('[data-i]').forEach(o=>{
      const idx=parseInt(o.dataset.i);
      if(idx===state.cur.shuffledCorrect)o.classList.add('correct');
      else if(idx===chosenIdx)o.classList.add('wrong');
    });
  }
  finishQuestion(isCorrect,q);
}

/* ---------- 追加機能：記述（入力）モードの採点 ---------- */
function checkInput(q){
  const c=state.cur;
  const inputEl=document.getElementById('inputAns');
  const val=inputEl.value;
  if(normalizeAnswer(val)===""){toast('こたえを入力してね！');return;}
  stopTimer();
  const correctText=q.choices[q.a];
  const isCorrect=isAnswerMatch(val,correctText);
  inputEl.disabled=true;
  inputEl.classList.add(isCorrect?'correct':'wrong');
  document.getElementById('inputCheck').disabled=true;
  const fb2=document.getElementById('fallbackToChoice'); if(fb2)fb2.disabled=true;
  finishQuestion(isCorrect,q,{correctText});
}

/* ---------- 追加機能（数学統合）：suji（数値入力）の採点。q.aは複数許容解の配列 ---------- */
function checkSuji(q){
  const inputEl=document.getElementById('inputAns');
  const val=inputEl.value;
  if(normalizeAnswer(val)===""){toast('こたえを入力してね！');return;}
  stopTimer();
  const isCorrect=isAnyAnswerMatch(val,q.a);
  inputEl.disabled=true;
  inputEl.classList.add(isCorrect?'correct':'wrong');
  document.getElementById('sujiCheck').disabled=true;
  const hintBtn=document.getElementById('hintBtn'); if(hintBtn)hintBtn.disabled=true;
  finishQuestion(isCorrect,q,{correctText:isCorrect?null:q.a.join(' / ')});
}

/* ---------- 追加機能（数学統合）：fill（複数穴埋め）の採点。全欄一致で正解 ---------- */
function checkFill(q){
  const inputs=document.querySelectorAll('.fillInput');
  let allFilled=true;
  inputs.forEach(inp=>{ if(normalizeAnswer(inp.value)==="")allFilled=false; });
  if(!allFilled){toast('すべて入力してね！');return;}
  stopTimer();
  let allRight=true;
  inputs.forEach(inp=>{
    const idx=parseInt(inp.dataset.fillidx);
    const ok=isAnswerMatch(inp.value,q.a[idx]);
    if(!ok)allRight=false;
    inp.disabled=true;
    inp.classList.add(ok?'correct':'wrong');
  });
  document.getElementById('fillCheck').disabled=true;
  const hintBtn=document.getElementById('hintBtn'); if(hintBtn)hintBtn.disabled=true;
  finishQuestion(allRight,q,{correctText:allRight?null:q.a.join(' / ')});
}

/* ---------- kumi の採点 ---------- */
function checkKumi(){
  const c=state.cur,q=c.list[c.i];
  const sels=document.querySelectorAll('select[data-sel]');
  let allFilled=true, allRight=true;
  sels.forEach(sel=>{
    const idx=parseInt(sel.dataset.sel);
    if(sel.value==="")allFilled=false;
    if(sel.value===q.pairs[idx].r){sel.classList.add('correct');}
    else{sel.classList.add('wrong');allRight=false;}
  });
  if(!allFilled){
    document.querySelectorAll('select[data-sel]').forEach(s=>s.classList.remove('correct','wrong'));
    toast('すべて選んでね！');return;
  }
  stopTimer();
  document.querySelectorAll('select[data-sel]').forEach(s=>s.disabled=true);
  document.getElementById('kumiCheck').disabled=true;
  finishQuestion(allRight,q);
}

/* ---------- 追加機能：nenpyo（年表並べ替え）の並べ替え操作＋採点 ---------- */
function setupNenpyoHandlers(q){
  const c=state.cur;
  document.querySelectorAll('.nenpyoItem .arrows button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const order=c._nenpyoOrder;
      if(btn.dataset.up!==undefined){
        const pos=parseInt(btn.dataset.up);
        if(pos>0){[order[pos-1],order[pos]]=[order[pos],order[pos-1]];renderQuestion();}
      } else if(btn.dataset.down!==undefined){
        const pos=parseInt(btn.dataset.down);
        if(pos<order.length-1){[order[pos],order[pos+1]]=[order[pos+1],order[pos]];renderQuestion();}
      }
    });
  });
}
function checkNenpyo(){
  const c=state.cur,q=c.list[c.i];
  const order=c._nenpyoOrder; // 現在の並び（itemIdxの配列）
  const correctOrder=q.items.map((it,idx)=>idx).sort((a,b)=>q.items[a].year-q.items[b].year);
  const isCorrect = order.length===correctOrder.length && order.every((v,i)=>v===correctOrder[i]);
  stopTimer();
  document.querySelectorAll('.nenpyoItem').forEach((node,pos)=>{
    node.classList.add(isCorrect?'correctRow':(order[pos]===correctOrder[pos]?'correctRow':'wrongRow'));
    const itemIdx=parseInt(node.dataset.itemidx);
    const hint=document.createElement('span');
    hint.className='yearHint';
    hint.textContent=q.items[itemIdx].year+'年';
    node.appendChild(hint);
  });
  document.querySelectorAll('.nenpyoItem .arrows button').forEach(b=>b.disabled=true);
  document.getElementById('nenpyoCheck').disabled=true;
  finishQuestion(isCorrect,q);
}

/* ---------- 追加機能（数学統合）：junban（手順並べ替え）の採点。正解順は q.a（stepsのインデックス配列） ---------- */
function checkJunban(){
  const c=state.cur,q=c.list[c.i];
  const order=c._nenpyoOrder; // 現在の並び（stepsのインデックス配列）
  const correctOrder=q.a;
  const isCorrect = order.length===correctOrder.length && order.every((v,i)=>v===correctOrder[i]);
  stopTimer();
  document.querySelectorAll('.nenpyoItem').forEach((node,pos)=>{
    node.classList.add(isCorrect?'correctRow':(order[pos]===correctOrder[pos]?'correctRow':'wrongRow'));
  });
  document.querySelectorAll('.nenpyoItem .arrows button').forEach(b=>b.disabled=true);
  document.getElementById('junbanCheck').disabled=true;
  const hintBtn=document.getElementById('hintBtn'); if(hintBtn)hintBtn.disabled=true;
  finishQuestion(isCorrect,q);
}

/* ---------- 追加機能：maru問題のスワイプ○×対応（ボタン回答は従来通り残す） ---------- */
function setupSwipe(wrap,q){
  if(!wrap)return;
  let startX=null, startY=null, dragging=false, moved=0;
  const threshold=60;
  const onDown=(x,y)=>{startX=x;startY=y;dragging=true;moved=0;wrap.classList.add('dragging');};
  const onMove=(x,y)=>{
    if(!dragging||startX===null)return;
    moved=x-startX;
    wrap.style.transform='translateX('+(moved*0.4)+'px)';
  };
  const onUp=()=>{
    if(!dragging)return;
    dragging=false;
    wrap.classList.remove('dragging');
    wrap.style.transform='';
    if(Math.abs(moved)>threshold){
      const guessTrue = moved>0; // 右スワイプ=○
      const btn=wrap.querySelector('[data-mx="'+guessTrue+'"]');
      if(btn && !btn.classList.contains('disabled'))answer(guessTrue===q.a, btn, null);
    }
    startX=null;startY=null;moved=0;
  };
  const onPointerDown=(e)=>{const p=e.touches?e.touches[0]:e;onDown(p.clientX,p.clientY);};
  const onPointerMove=(e)=>{const p=e.touches?e.touches[0]:e;onMove(p.clientX,p.clientY);};
  const onPointerUp=()=>onUp();
  // pointer系（マウス／ペン／一部タッチ）とtouch系の両方に対応。要素が再描画時に破棄されるため直接バインド（要素ごとリセットされる）
  wrap.addEventListener('pointerdown',onPointerDown);
  wrap.addEventListener('pointermove',onPointerMove);
  wrap.addEventListener('pointerup',onPointerUp);
  wrap.addEventListener('pointercancel',onPointerUp);
  wrap.addEventListener('touchstart',onPointerDown,{passive:true});
  wrap.addEventListener('touchmove',onPointerMove,{passive:true});
  wrap.addEventListener('touchend',onPointerUp);
}

/* ---------- 共通：正誤処理＋フィードバック ---------- */
function finishQuestion(isCorrect,q,opts){
  opts=opts||{};
  const c=state.cur;
  if(c._locked) return;   // 二重採点防止（スワイプ＋クリック等の二重発火対策）
  c._locked=true;
  stopTimer(); // 採点確定時点で必ずタイマー停止（時間切れ経路も含め二重に保証）
  const fb=document.getElementById('fb');

  // 追加機能：速答ボーナス（タイムアタックONかつ正解時、残り時間に比例）
  let speedBonus=0;
  const timeAttackActive = c.mode==='boss' ? true : !!(state.settings&&state.settings.timeAttack);
  if(isCorrect && timeAttackActive && typeof c._timeLeft==='number' && typeof c._timeLimit==='number' && !opts.timeUp){
    speedBonus = Math.round(c._timeLeft/c._timeLimit*10);
  }

  if(isCorrect){
    c.correct++; c.combo++; c.maxCombo=Math.max(c.maxCombo,c.combo);
    let pts = q.lv==="標準"?15:10;
    let bonus = c.combo>=3 ? (c.combo>=5?10:5) : 0;
    c.score += pts+bonus+speedBonus;
    fb.className="fb good show";
    fb.innerHTML=`<div class="head">⭕ 正解！ +${pts}点${bonus?` <span class="combo">コンボ+${bonus}</span>`:''}${speedBonus?` <span class="combo">⏱速答+${speedBonus}</span>`:''}</div>
      <div class="exp">${q.exp}</div>`;
    if(c.combo===3)toast('🔥 3連続正解！コンボボーナス！');
    if(c.combo===5)toast('🔥🔥 5連続！絶好調！');
    if(c.mode==='boss'){
      c.bossHP=Math.max(0,c.bossHP-1);
      toast('⚔️ こうげき！ ボスに1ダメージ！');
    }
  } else {
    c.combo=0;
    let feedbackHead = opts.timeUp ? '⏰ 時間切れ… もう一度チェック' : '❌ おしい！ もう一度チェック';
    let extra = opts.correctText ? `<div class="muted" style="margin-top:6px">正解：${opts.correctText}</div>` : "";
    fb.className="fb bad show";
    fb.innerHTML=`<div class="head">${feedbackHead}</div>
      <div class="exp">${q.exp}</div>${extra}`;
    c.wrongThisRun.push(q);
    if(c.mode==='boss'){
      c.lives=Math.max(0,c.lives-1);
      toast('💥 やられた！ ライフが減った！');
    }
  }

  // 1問ごとの成績＋間隔反復スケジュールを更新（復習・ボス戦でも共通）
  if(q._key)updateQStat(q._key,isCorrect);
  // 図鑑カードの解放（正解時。card は文字列または配列）
  if(isCorrect && q.card){
    (Array.isArray(q.card)?q.card:[q.card]).forEach(unlockCard);
  }
  save();

  // 追加機能：ボス戦の勝敗判定
  if(c.mode==='boss'){
    if(c.lives<=0){ renderBossDefeat(); return; }
    if(c.bossHP<=0){ renderBossVictory(); return; }
  }

  const nw=document.getElementById('nextWrap');
  nw.innerHTML='';                       // 二重生成防止
  const last = c.i>=c.list.length-1;
  const nextBtn=el(`<button class="btn" id="nextBtn">${last?'結果を見る 🏁':'次の問題へ →'}</button>`);
  nw.appendChild(nextBtn);
  nextBtn.addEventListener('click',()=>{
    stopTimer();
    if(last)renderResult();
    else{
      c.i++;
      delete c._nenpyoOrder;   // 前問の並べ替え状態を持ち越さない
      delete c._forceChoice;   // 前問の「選択肢を見る」状態を持ち越さない
      renderQuestion();
    }
  });
}

/* ============================================================
   追加機能：ボス戦の勝敗画面
============================================================ */
function renderBossDefeat(){
  stopTimer();
  const c=state.cur;
  save();
  app().innerHTML="";
  app().appendChild(el(`<div class="card center">
    <div class="bossResult">💀</div>
    <div style="font-size:1.3rem;font-weight:800">ボスにやられた…</div>
    <div class="muted">${c.bossName}　｜　与えたダメージ ${c.bossMaxHP-c.bossHP}/${c.bossMaxHP}</div>
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
function renderBossVictory(){
  stopTimer();
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
function renderResult(){
  stopTimer(); // 結果画面到達時にタイマーが残っていないことを保証（防御的）
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

/* ---------- 起動 ---------- */
document.addEventListener('DOMContentLoaded', function () {
  load();
  touchStreak();
  renderHome();
});
