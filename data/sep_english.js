import { createRegistry } from "./_registry.js";
const HQ = createRegistry();

// 写真 p.42–47 の見出しを基にしたオリジナル練習。既存LEAPの問題位置とは独立。
const entries = [
  [103,'there is [are] ～','ゼア イズ／ゼア アー','～がある・いる','There are two dogs near the gate.','門の近くに犬が2匹（　）。','いる',['います'],'there are は複数のもの・人が「ある／いる」。'],
  [104,'happen','ハプン','起こる','What happened this morning?','今朝、何が（　）のですか。','起こった',['おこった'],'happened は happen の過去形だよ。'],
  [105,'appear','アピア','現れる','A small bird appeared in the garden.','庭に小さな鳥が（　）。','現れた',['あらわれた'],'appeared は「現れた」。'],
  [106,'show up','ショウ アップ','現れる・やって来る','Ken showed up early.','ケンは早く（　）。','現れた',['あらわれた','やって来た','やってきた','来た','きた'],'showed up は show up の過去形。人がやって来る場面で使うよ。'],
  [107,'come true','カム トゥルー','実現する','Her wish came true.','彼女の願いが（　）。','実現した',['じつげんした','かなった','叶った'],'came true で「実現した」。come の過去形は came。'],
  [108,'break out','ブレイク アウト','勃発する・発生する','A fire broke out near the station.','駅の近くで火事が（　）。','発生した',['はっせいした','起こった','おこった'],'broke out は、火事や戦争などが発生したことを表すよ。'],
  [109,'have an accident','ハヴ アン アクスィデント','事故に遭う','He had an accident last week.','彼は先週（　）。','事故に遭った',['事故にあった','じこにあった'],'had は have の過去形。「事故を持つ」と訳さないよ。'],
  [110,'continue','コンティニュー','続ける・続く','The lesson continued until noon.','授業は正午まで（　）。','続いた',['つづいた'],'continue は「続く」と「続ける」の両方で使えるよ。'],
  [111,'keep on doing','キープ オン ドゥーイング','～し続ける','She kept on reading.','彼女は本を（　）。','読み続けた',['よみつづけた'],'kept は keep の過去形。reading は「読むこと」。'],
  [112,'stop doing','ストップ ドゥーイング','～するのをやめる','They stopped singing.','彼らは歌うのを（　）。','やめた',['止めた'],'stop の後ろが singing なら「歌うのをやめる」。'],
  [113,'give ～ up','ギヴ アップ','～をあきらめる','I gave up the plan.','私はその計画を（　）。','あきらめた',['諦めた'],'gave up は give up の過去形。'],
  [114,'home','ホーム','家・家に／家で／家へ','Please come home before six.','6時前に（　）来てください。','家に',['いえに','うちに'],'come home は「家に来る／帰って来る」。home の前に to は不要だよ。'],
  [115,'floor','フロア','階・床','My bag is on the floor.','私のかばんは（　）にあります。','床',['ゆか'],'on the floor は「床に」。数字が付くと「階」も表すよ。'],
  [116,'live','リヴ','住む・生活する','My aunt lives in Kobe.','私のおばは神戸に（　）。','住んでいる',['すんでいる','住んでいます','すんでいます'],'lives は live に s が付いた形。住んでいる場所には in を使うよ。'],
  [117,'stay','ステイ','いる・滞在する','We stayed in Osaka for a week.','私たちは大阪に1週間（　）。','滞在した',['たいざいした','いた'],'stayed は stay の過去形。一時的にいることだよ。'],
  [118,'stay with','ステイ ウィズ','人の家に泊まる','I stayed with my uncle.','私は（　）。','おじの家に泊まった',['おじのいえにとまった','叔父の家に泊まった','伯父の家に泊まった'],'stay with ＋人で「その人の家に泊まる」。uncle は「おじ」。'],
  [119,'stay up','ステイ アップ','寝ないで起きている','We stayed up late yesterday.','私たちは昨日、遅くまで（　）。','起きていた',['おきていた'],'stay up の up は「起きている」。'],
  [120,'take a bath','テイク ア バス','お風呂に入る','I take a bath after dinner.','私は夕食後に（　）。','お風呂に入る',['おふろにはいる','風呂に入る','入浴する','にゅうよくする'],'bath はお風呂。take a bath をひとまとまりで覚えよう。'],
  [121,'have ～ for breakfast','ハヴ フォー ブレックファスト','朝食に～を食べる','I have rice for breakfast.','私は（　）ご飯を食べます。','朝食に',['ちょうしょくに','朝ごはんに','朝御飯に'],'have は食事の場面で「食べる」。for breakfast は「朝食に」。'],
  [122,'call','コール','電話する・～と呼ぶ','Please call me tonight.','今夜、私に（　）ください。','電話して',['でんわして'],'call ＋人で「人に電話する」。']
];
const extras = [
  ['happen to','I happened to see Emi.','私は（　）エミを見かけました。','たまたま',['偶然','ぐうぜん'],'happen to do は「偶然～する」。'],
  ['appear to be','He appears to be busy.','彼は忙しい（　）。','ようだ',['ようです'],'appear to be は「～のように見える」。'],
  ['there was','There was a storm last night.','昨夜、嵐が（　）。','あった',['ありました'],'出来事にも there is の形を使えるよ。was は過去形。'],
  ['continue to do','Please continue to practice.','練習を（　）ください。','続けて',['つづけて'],'continue to do と continue doing はどちらも「～し続ける」。'],
  ['stop to do','I stopped to drink water.','私は水を飲むために（　）。','立ち止まった',['たちどまった'],'stop doing「するのをやめる」と区別しよう。'],
  ['home','She got home at five.','彼女は5時に（　）。','帰宅した',['家に帰った','いえにかえった','帰った','かえった','きたくした'],'get home は「帰宅する」。'],
  ['floor','Our room is on the third floor.','私たちの部屋は（　）にあります。（米国式）','3階',['三階','さんがい'],'floor は「階」。米国式の third floor は3階。'],
  ['live a happy life','They live a happy life.','彼らは幸せな（　）。','生活を送っている',['人生を送っている','生活を送る','人生を送る','せいかつをおくっている'],'live a ～ life は「～な生活を送る」。'],
  ['stay','Enjoy your stay here.','ここでの（　）を楽しんでください。','滞在',['たいざい'],'stay は名詞「滞在」にもなるよ。'],
  ['call A B','We call our dog Pochi.','私たちは犬をポチと（　）。','呼ぶ',['よぶ','呼んでいる','よんでいる'],'call A B は「AをBと呼ぶ」。'],
  ['No problem.','No problem.','頼みを引き受けて「（　）」。','問題ないよ',['問題ありません','いいですよ','お安い御用です','もんだいないよ'],'頼まれたことを気持ちよく引き受けるときの表現。'],
  ['Good point.','Good point.','相手の意見に「（　）」。','いいこと言うね',['いいところをついているね','いい指摘だね','的を射ているね'],'point はここでは「論点・指摘」。'],
  ['disappear','The bird disappeared.','その鳥は（　）。','消えた',['きえた','姿を消した'],'appear「現れる」の反対だよ。'],
  ['cause an accident','The driver caused an accident.','その運転手は事故を（　）。','引き起こした',['ひきおこした','起こした','おこした'],'have an accident「事故に遭う」と区別しよう。'],
  ['house','We bought a house.','私たちは（　）を買いました。','家',['いえ','住宅'],'建物としての家は house。'],
  ['take a shower','I take a shower every morning.','私は毎朝（　）。','シャワーを浴びる',['しゃわーをあびる'],'take a bath と合わせて覚えよう。'],
  ['call back','I will call you back soon.','私はすぐに（　）。','折り返し電話します',['折り返し電話する','かけ直します','電話をかけ直す','電話をかけ直します'],'call back は「折り返し電話する」。'],
  ['live with','I live with my sister.','私は姉と（　）。','暮らしている',['くらしている','住んでいる','すんでいる'],'live with は「一緒に暮らす」。stay with は一時的に泊まること。'],
  ['stay at home','I stayed at home today.','私は今日（　）。','家にいた',['いえにいた','自宅にいた'],'stay home とも言えるよ。'],
  ['give up doing','He gave up swimming.','彼は泳ぐことを（　）。','あきらめた',['諦めた'],'give up の後ろは doing の形。']
];
function question(e, mode){
  const [no,word,reading,meaning,en,ja,answer,aliases,note]=e;
  const choices = mode==='choice' ? [meaning,...entries.filter(x=>x[0]!==no).map(x=>x[3]).filter(x=>x!==meaning).slice(0,3)] : [answer];
  return {type:mode==='choice'?'yon':'ana',lv:mode==='choice'?'基礎':'本番形式',q:mode==='choice'?`<span lang="en">${word}</span><br>日本語の意味を選ぼう。`:`<span lang="en">${en}</span><br>${ja}`,choices,a:0,accept:aliases,forceInput:mode!=='choice',examPractice:true,speech:mode==='choice'?word:en,reading:mode==='choice'?reading:'',learn:{no,word,reading,meaning},exp:`${word}：${meaning}。${note}`,hint:mode==='choice'?'先に声に出してから、意味を思い出してみよう。':note};
}
function unit(id,group,title,questions){
  HQ.registerUnit({id,subject:'📅 9/11 小テスト対策',group,title,desc:'英語｜p.42〜47・No.103〜122',page:'42〜47',order:10000+HQ.units.length,questions,cards:[]});
}
for(let i=0;i<4;i++)unit(`sepEnChoose${i+1}`,'英語① 意味を選ぶ（5問ずつ）',`意味チェック ${i+1}｜No.${103+i*5}〜${107+i*5}`,entries.slice(i*5,i*5+5).map(e=>question(e,'choice')));
for(let i=0;i<4;i++)unit(`sepEnWrite${i+1}`,'英語② 日本語の空欄を埋める（5問ずつ）',`空欄練習 ${i+1}｜No.${103+i*5}〜${107+i*5}`,entries.slice(i*5,i*5+5).map(e=>question(e,'write')));
// 二つのセットで20項目を漏れなく確認。1問ごとに解説する仕上げ練習。
for(let i=0;i<2;i++)unit(`sepEnMock${i+1}`,'英語③ 10問で仕上げる',`本番形式 ${i?'B':'A'}｜日本語で答える`,entries.filter((_,n)=>n%2===i).map(e=>({...question(e,'write'),hint:''})));
for(let i=0;i<4;i++)unit(`sepEnExtra${i+1}`,'英語④ 余裕があれば（別の意味・関連表現）',`発展 ${i+1}｜意味の使い分け`,extras.slice(i*5,i*5+5).map(([word,en,ja,answer,accept,note])=>({type:'ana',lv:'発展',q:`<span lang="en">${en}</span><br>${ja}`,choices:[answer],a:0,accept,forceInput:true,examPractice:true,speech:en,exp:`${word}：${note}`,hint:note})));

export const units = HQ.units;
export const cards = HQ.cards;
