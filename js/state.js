import { STAGE_ORDER, QUESTIONS, totalQuestionCount, CARD_BY_ID } from "./content.js";
import { todayStr, addDays, toast } from "./utils.js";

const LEAP_BASIC_SUBJECT="📘 LEAP Basic 必携英単語";

/* ============================================================
   ゲーム状態
============================================================ */
export const state = {
  totalScore:0,
  stageCleared:{},
  stageBest:{},
  badges:new Set(),
  wrongPool:[],          // （旧・未使用）復習はSRSに一本化
  qStats:{},             // "s1-0":{seen,correct,box,due}  1問ごとの成績＋間隔反復
  streak:0,              // 連続学習日数
  lastStudyDate:"",      // "YYYY-MM-DD"
  studyLog:{},            // "YYYY-MM-DD":{answered,correct,subjects:{},modes:{}}
  cards:new Set(),       // 解放済み図鑑カードID
  title:"",              // 現在の称号
  settings:{timeAttack:true, inputMode:false, sound:true, bgmUrl:"", dailyGoal:10}, // 追加機能：眠気対策の設定
  bossCleared:{},        // 追加機能："s1":true など、ボス撃破済みステージ
  subjectGroupCollapsed:{}, // "教科\u001fグループ":true
  // 現在のプレイ
  cur:null
};
STAGE_ORDER.forEach(sid=>{ state.stageCleared[sid]=false; state.stageBest[sid]=0; });
export const DAILY_GOAL_OPTIONS=[5,10,20];
export const DEFAULT_SETTINGS={timeAttack:true, inputMode:false, sound:true, bgmUrl:"", dailyGoal:10};

/* 称号（累積マスター数で昇格。下がらない成長指標）
   最上位の「学習マスター」は、全問題数に応じて動的に決まる（定数固定にしない）。
   追加機能（数学統合）：教科中立の名称に変更（歴史・数学どちらでも通用する称号）。 */
export const TITLES = [
  {name:"学びの見習い",   need:0},
  {name:"知の探究者",     need:40},
  {name:"賢者の卵",       need:100},
  {name:"学習マスター",   need:totalQuestionCount()}
];

/* ---------- 保存／読込（localStorage・Setは配列化して往復） ---------- */
export const SAVE_KEY='rekishi-quest-v1';
export function save(){
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      totalScore:state.totalScore,
      stageCleared:state.stageCleared,
      stageBest:state.stageBest,
      badges:[...state.badges],
      qStats:state.qStats,
      streak:state.streak,
      lastStudyDate:state.lastStudyDate,
      studyLog:state.studyLog,
      cards:[...state.cards],
      title:state.title,
      settings:state.settings,
      bossCleared:state.bossCleared,
      subjectGroupCollapsed:state.subjectGroupCollapsed
    }));
  }catch(e){/* 保存できなくても学習は続けられるので握りつぶす */}
}
export function load(){
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
    state.studyLog=normalizeStudyLog(d.studyLog);
    state.cards=new Set(d.cards||[]);
    state.title=d.title||"";
    // 追加機能：settingsは旧データ（無し）でも壊れないようデフォルトとマージ
    state.settings=Object.assign({},DEFAULT_SETTINGS,(d.settings&&typeof d.settings==='object')?d.settings:{});
    state.settings.dailyGoal=normalizeDailyGoal(state.settings.dailyGoal);
    state.bossCleared=(d.bossCleared&&typeof d.bossCleared==='object')?d.bossCleared:{};
    state.subjectGroupCollapsed=(d.subjectGroupCollapsed&&typeof d.subjectGroupCollapsed==='object')?d.subjectGroupCollapsed:{};
  }catch(e){/* 壊れたデータ・別バージョンは初期stateで開始 */}
  cleanupStaleQStats();  // 追加機能（数学カテゴリ細分化）：存在しない単元IDのqStatsキーが習熟度/称号を汚染しないよう掃除
}

/* ---------- 日別学習ログ（草グラフ・今日の目標・週間ふりかえり） ---------- */
export function normalizeDailyGoal(value){
  const n=Number(value);
  return DAILY_GOAL_OPTIONS.includes(n)?n:10;
}
export function emptyStudyDay(){
  return {answered:0, correct:0, subjects:{}, modes:{}};
}
function normalizeCount(value){
  const n=Number(value);
  return Number.isFinite(n)&&n>0 ? Math.floor(n) : 0;
}
function normalizeCountMap(raw){
  const out={};
  if(!raw||typeof raw!=='object')return out;
  Object.keys(raw).forEach(key=>{
    const n=normalizeCount(raw[key]);
    if(n>0)out[key]=n;
  });
  return out;
}
function normalizeStudyDay(raw){
  if(!raw||typeof raw!=='object')return emptyStudyDay();
  const answered=normalizeCount(raw.answered);
  const correct=Math.min(answered,normalizeCount(raw.correct));
  return {
    answered,
    correct,
    subjects:normalizeCountMap(raw.subjects),
    modes:normalizeCountMap(raw.modes)
  };
}
export function normalizeStudyLog(raw){
  const out={};
  if(!raw||typeof raw!=='object')return out;
  Object.keys(raw).forEach(date=>{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return;
    const day=normalizeStudyDay(raw[date]);
    if(day.answered>0)out[date]=day;
  });
  return out;
}
function ensureStudyDay(date){
  if(!state.studyLog||typeof state.studyLog!=='object')state.studyLog={};
  state.studyLog[date]=normalizeStudyDay(state.studyLog[date]);
  return state.studyLog[date];
}
export function getStudyDay(date){
  return normalizeStudyDay(state.studyLog&&state.studyLog[date]);
}
export function recordStudyAnswer(isCorrect, subject, mode){
  const day=ensureStudyDay(todayStr());
  day.answered++;
  if(isCorrect)day.correct++;
  const subjectName=subject||"その他";
  const modeName=mode||"stage";
  day.subjects[subjectName]=(day.subjects[subjectName]||0)+1;
  day.modes[modeName]=(day.modes[modeName]||0)+1;
}
export function recentStudyDays(days,endDate){
  const end=endDate||todayStr();
  const out=[];
  for(let i=days-1;i>=0;i--){
    const date=addDays(end,-i);
    out.push({date, ...getStudyDay(date)});
  }
  return out;
}
export function weeklyStudySummary(endDate){
  const days=recentStudyDays(7,endDate);
  const answered=days.reduce((sum,d)=>sum+d.answered,0);
  const correct=days.reduce((sum,d)=>sum+d.correct,0);
  const activeDays=days.filter(d=>d.answered>0).length;
  return {
    answered,
    correct,
    activeDays,
    accuracy:answered?Math.round(correct/answered*100):0
  };
}
export function studyVolumeLevel(answered){
  if(answered>=20)return 4;
  if(answered>=10)return 3;
  if(answered>=5)return 2;
  if(answered>=1)return 1;
  return 0;
}

/* ---------- 教科ホームのグループ折りたたみ状態 ---------- */
export function subjectGroupKey(subject,group){
  return String(subject||"その他")+"\u001f"+String(group||"");
}
export function isSubjectGroupCollapsed(subject,group){
  const key=subjectGroupKey(subject,group);
  if(state.subjectGroupCollapsed&&Object.prototype.hasOwnProperty.call(state.subjectGroupCollapsed,key)){
    return !!state.subjectGroupCollapsed[key];
  }
  return subject===LEAP_BASIC_SUBJECT;
}
export function setSubjectGroupCollapsed(subject,group,collapsed){
  if(!state.subjectGroupCollapsed||typeof state.subjectGroupCollapsed!=='object')state.subjectGroupCollapsed={};
  const key=subjectGroupKey(subject,group);
  if(subject===LEAP_BASIC_SUBJECT)state.subjectGroupCollapsed[key]=!!collapsed;
  else if(collapsed)state.subjectGroupCollapsed[key]=true;
  else delete state.subjectGroupCollapsed[key];
  save();
}
export function setSubjectGroupsCollapsed(subject,groups,collapsed){
  if(!state.subjectGroupCollapsed||typeof state.subjectGroupCollapsed!=='object')state.subjectGroupCollapsed={};
  groups.forEach(group=>{
    const key=subjectGroupKey(subject,group);
    if(subject===LEAP_BASIC_SUBJECT)state.subjectGroupCollapsed[key]=!!collapsed;
    else if(collapsed)state.subjectGroupCollapsed[key]=true;
    else delete state.subjectGroupCollapsed[key];
  });
  save();
}

/* ---------- 追加機能（数学カテゴリ細分化）：qStatsの整合確認 ----------
   単元を大単元(m1/m2/m3)から小カテゴリ(m1s1〜m3s5)に再構成したことで、
   旧保存データには存在しない単元IDのキー（例:"m1-0"）が残留する場合がある。
   これらは現在のSTAGE_ORDER・QUESTIONSに存在しないキーなので、
   masteredCount()等の集計を汚染しないよう、現存する問題キー集合でフィルタして削除する。
   歴史側（s1〜s3）のキーは単元ID・問題数を変更していないため、この処理では一切削除されない。 */
export function cleanupStaleQStats(){
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
export function touchStreak(){
  const t=todayStr();
  if(state.lastStudyDate===t)return;           // 今日すでに学習済み＝不変
  if(state.lastStudyDate===addDays(t,-1))state.streak++;  // 昨日から連続
  else state.streak=1;                          // それ以外（初回・間が空いた）
  state.lastStudyDate=t;
  save();
  if([3,7,14,30].includes(state.streak))setTimeout(()=>toast('🔥 '+state.streak+'日連続学習！えらい！'),500);
}

/* ---------- 1問ごとの成績＋間隔反復（Leitner方式） ---------- */
export const SRS_INTERVAL=[0,1,3,7,14,30];  // box 0〜5 の復習間隔（日）
export function getQStat(key){
  if(!state.qStats[key])state.qStats[key]={seen:0,correct:0,box:0,due:todayStr()};
  return state.qStats[key];
}
export function updateQStat(key,isCorrect){
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
export function isMastered(key){const st=state.qStats[key];return !!(st&&st.box>=3);}
export function masteredCount(){return Object.keys(state.qStats).filter(isMastered).length;}

/* 全ステージ横断で、今日が復習日（due<=today）の問題を集める */
export function dueList(){
  const t=todayStr(), out=[];
  STAGE_ORDER.forEach(sid=>{
    QUESTIONS[sid].data.forEach((q,idx)=>{
      const key=sid+'-'+idx, st=state.qStats[key];
      if(st && st.due<=t)out.push({...q,_key:key,_page:QUESTIONS[sid].page});
    });
  });
  return out;
}

/* ステージ習熟度（マスター済み問題数 / 全問数, %） */
export function stageMastery(sid){
  const data=QUESTIONS[sid].data;
  let m=0;
  data.forEach((q,idx)=>{if(isMastered(sid+'-'+idx))m++;});
  return {pct:Math.round(m/data.length*100), mastered:m, total:data.length};
}
/* 追加機能（教科選択ファースト化）：subjectを指定すると、その教科の単元だけに限定して最弱ステージを探す（省略時は全教科横断） */
export function weakestStage(subject){
  let worst=null;
  STAGE_ORDER.forEach(sid=>{
    if(subject && (QUESTIONS[sid].subject||"")!==subject)return;
    const p=stageMastery(sid).pct;
    if(!worst||p<worst.pct)worst={sid,pct:p};
  });
  return worst;
}

/* 追加機能（教科選択ファースト化）：登録済みsubjectの一覧をorder順・重複除去で返す（見出しの無い単元は"その他"に集約） */
export function subjectList(){
  const seen=new Set(), out=[];
  STAGE_ORDER.forEach(sid=>{
    const subject=QUESTIONS[sid].subject || "その他";
    if(!seen.has(subject)){ seen.add(subject); out.push(subject); }
  });
  return out;
}
/* 教科ごとのステージID一覧（order順） */
export function stagesOfSubject(subject){
  return STAGE_ORDER.filter(sid=>(QUESTIONS[sid].subject||"その他")===subject);
}
/* 教科の習熟度（その教科の全問題でのマスター率, %） */
export function subjectMastery(subject){
  const sids=stagesOfSubject(subject);
  let total=0, mastered=0;
  sids.forEach(sid=>{
    const m=stageMastery(sid);
    total+=m.total; mastered+=m.mastered;
  });
  return {pct: total? Math.round(mastered/total*100):0, mastered, total};
}
/* 教科のクリア済みステージ数 */
export function subjectClearedCount(subject){
  const sids=stagesOfSubject(subject);
  return {cleared: sids.filter(sid=>state.stageCleared[sid]).length, total: sids.length};
}

/* ---------- 図鑑カードの解放 ---------- */
export function unlockCard(id){
  if(!CARD_BY_ID[id]||state.cards.has(id))return;
  state.cards.add(id);
  setTimeout(()=>toast('📖 図鑑に「'+CARD_BY_ID[id].name+'」が仲間入り！'),300);
}

/* ---------- 称号（累積マスター数で昇格。上がるときだけトースト） ---------- */
export function evalTitle(){
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

export function isStageUnlockedForBoss(sid){
  return !!state.stageCleared[sid];   // そのステージを通常クリア済みなら解放
}
