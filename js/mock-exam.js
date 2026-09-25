// 配点付き模擬テストの共通計算。通常ステージのゲームスコアとは分ける。
export function isMockExam(c){
  return !!c && ['stage','practice'].includes(c.mode) && c.list?.length>0 &&
    c.list.every(q=>Number.isInteger(q.points) && q.points>=2 && q.points<=4);
}
export function examTotal(c){
  return c.list.slice(c.startIndex||0).reduce((sum,q)=>sum+q.points,0);
}
export function examAward(q,correct){return correct?q.points:0;}
export function examNumericMatch(value,answers){
  const text=String(value).normalize('NFKC').trim().replace(/[−－]/g,'-');
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) &&
    Number.isFinite(Number(text)) && answers.some(a=>Number(text)===Number(a));
}
export function examBreakdown(c){
  const wrong=new Set(c.wrongThisRun.map(q=>q._key));
  const groups=new Map();
  for(const q of c.list.slice(c.startIndex||0)){
    const key=q.examSection||'総合';
    if(!groups.has(key))groups.set(key,{title:key,earned:0,total:0,sourceStage:q.sourceStage});
    const group=groups.get(key);
    group.total+=q.points;
    group.earned+=examAward(q,!wrong.has(q._key));
  }
  return [...groups.values()];
}
export function examAnswer(q){
  if(q.type==='maru')return q.a?'○':'×';
  if(q.type==='yon'||q.type==='ana')return q.choices[q.a];
  if(q.type==='suji')return q.a.join(' または ');
  return '解説を確認しよう';
}
