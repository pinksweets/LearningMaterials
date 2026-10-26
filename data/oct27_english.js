import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 出典：提供写真30264_0.jpg・30266_0.jpg・30267.jpgのp.67/69/71、No.184〜204。
// No.184は番号部分が見切れているため、見出しと用例で確認。未提供の偶数ページは補完しない。
// 問題文は学習用に作成。各行は［見出し番号、英語、意味、覚え方］。
const vocabulary = [
  [184,'get along with','〜と仲よくやっていく','get along with＋人で「人と仲よくやっていく」。withまで覚えよう。'],
  [185,'make friends with','〜と友達になる','make friends with＋人。friendsは複数形にするよ。'],
  [186,'a friend from','〜時代の友達・〜で知り合った友達','a friend from schoolなら学校で知り合った友達。fromは出会った場所や時代を表すよ。'],
  [187,'break up with','〜と別れる','恋人と別れるときはbreak up with＋人。breakの過去形はbrokeだよ。'],
  [188,'pay','（代金を）支払う','pay＋金額＋for＋物で「物の代金として金額を支払う」。過去形はpaidだよ。'],
  [189,'buy','〜を買う','buy＋物＋for＋人で「人に物を買ってあげる」。過去形はboughtだよ。'],
  [190,'sell','〜を売る','sell＋物＋for＋金額で「物をその金額で売る」。過去形はsoldだよ。'],
  [191,'expensive','値段が高い','物が高価ならexpensive。price（価格）が高いときはhighを使うよ。'],
  [192,'cheap','値段が安い','物が安価ならcheap。price（価格）が低いときはlowを使うよ。'],
  [193,'on sale','特売で・バーゲンで','on saleは「特売で」。for sale（売りに出されている）と区別しよう。'],
  [194,'job','仕事（職業・個々の仕事）','jobは数えられる名詞。a job、two jobsのように使えるよ。'],
  [195,'work','働く・仕事','名詞のworkはふつう数えられないのでa lot of work。動詞なら「働く」だよ。'],
  [196,'report','報告する・報告書','reportは動詞「報告する」と名詞「報告書」の両方で使えるよ。'],
  [197,'work for','〜で働いている（勤務先）','work for＋会社などで勤務先を表すよ。'],
  [198,'vacation','休暇','take a vacationで「休暇を取る」。米語でよく使われる語だよ。'],
  [199,'take off','（期間）休みを取る','take＋期間＋offで「その期間、休みを取る」。take a day offで「1日休む」。'],
  [200,'on business','仕事で・出張で','go abroad on businessで「仕事で海外へ行く」。businessはここでは仕事のことだよ。'],
  [201,'class','授業・階級','in classは「授業中に」。in a classは「あるクラスの中に」だよ。'],
  [202,'homework','宿題','homeworkは数えられない名詞。a lot of homeworkと表すよ。'],
  [203,'paper','（学生の）レポート・新聞','write a paper on＋話題で「〜についてのレポートを書く」。新聞の意味もあるよ。'],
  [204,'interview','面接・インタビュー','have an interview for a jobで「仕事の面接を受ける」。最初が母音なのでanだよ。']
];
function choice(q,answer,others,exp,sourceNo){
  return {type:'yon',lv:'基礎',q,choices:[answer,...others],a:0,examPractice:true,exp,sourceNo};
}
function input(q,answer,exp,sourceNo){
  return {type:'ana',lv:'標準',q,choices:[answer],a:0,forceInput:true,examPractice:true,exp,sourceNo};
}
function stage(n,title,desc,questions,group='① 意味→つづり｜写真の21項目'){
  HQ.registerUnit({id:`oct27e${n}`,subject:'📅 10/27 英語小テスト対策',group,title,desc,order:10600+n,questions,cards:[]});
}
for(let page=0;page<3;page++){
  const rows=vocabulary.slice(page*7,page*7+7);
  const meanings=rows.map(([no,en,ja,exp])=>choice(`No.${no}「${en}」の意味は？`,ja,
    vocabulary.filter(row=>row[0]!==no).filter((_,i)=>i%5===page).slice(0,3).map(row=>row[2]),exp,no));
  const spellings=rows.map(([no,en,ja,exp])=>input(`No.${no}「${ja}」を英語で書こう。<br>見出し表現の形で答えてね（${en.split(' ').length}語）。`,en,exp,no));
  stage(page+1,`p.${67+page*2}｜No.${rows[0][0]}〜${rows[6][0]}`, 'まず意味を7問、続けてつづりを7問。迷った語をもう一度思い出そう。',[...meanings,...spellings]);
}
stage(4,'使い分け①｜人間関係・お金','前置詞・過去形・価格の表現を9問で確認しよう。',[
  input('「私は隣の人たちと仲よくやっています」<br>I get along (　) my neighbors.<br>空欄に1語。','with','get along with＋人。仲よくしている相手をwithの後ろに置こう。',184),
  input('「私は新しいクラスメートと友達になりたい」<br>I want to make (　) with my new classmates.<br>空欄に1語。','friends','make friends withはfriendsを複数形にするよ。',185),
  input('「彼は中学時代の友達です」<br>He is a friend (　) junior high school.<br>空欄に1語。','from','a friend from＋学校などで、知り合った場所や時代を示すよ。',186),
  input('「彼女は先月、恋人と別れました」<br>She (　) up with her boyfriend last month.<br>空欄に1語。','broke','last monthは過去。breakの過去形brokeを使ってbroke up withとしよう。',187),
  input('「私はそのノートに3ドル払いました」<br>I (　) three dollars for the notebook.<br>payの過去形を1語。','paid','payの過去形はpaid。pay＋金額＋for＋物の語順だよ。',188),
  input('「私は妹にかばんを買いました」<br>I (　) a bag for my sister.<br>buyの過去形を1語。','bought','buyの過去形はbought。buy＋物＋for＋人も覚えよう。',189),
  input('「彼は古い自転車を売りました」<br>He (　) his old bike.<br>sellの過去形を1語。','sold','sellの過去形はsoldだよ。',190),
  choice('「このカメラの値段は高い」に合うのは？<br>The price of this camera is (　).','high',['expensive','tall','long'],'主語がpriceならhighを使うよ。The camera is expensive.とも表せるね。',191),
  choice('「このかばんの値段は安い」に合うのは？<br>The price of this bag is (　).','low',['cheap','short','small'],'主語がpriceならlow。The bag is cheap.との主語の違いを確認しよう。',192)
],'② 例文で確認｜間違えやすい形');
stage(5,'使い分け②｜仕事・休暇・学校','saleの違い、数え方、熟語を9問で確認しよう。',[
  choice('「その靴は今日、特売です」に合う表現は？<br>The shoes are (　) today.','on sale',['for sale','on business','in class'],'on saleは「特売で」。for saleは単に「売りに出されている」だよ。',193),
  choice('jobとworkの数え方で正しいのは？','two jobs / a lot of work',['two job / a lot of works','two works / a lot of job','a job / a work'],'個々の仕事はa job、two jobs。仕事全般のworkはふつう数えられないよ。',194),
  input('「彼女はとても熱心に働きます」<br>She (　) very hard.<br>workを文に合う形にして1語。','works','主語Sheは三人称単数。現在の習慣ならworkにsを付けよう。',195),
  input('「その事故は昨日報じられました」<br>The accident was (　) yesterday.<br>reportを文に合う形にして1語。','reported','was＋過去分詞で受動態。reportの過去分詞はreportedだよ。',196),
  input('「彼はテレビ局で働いています」<br>He works (　) a TV station.<br>見出しNo.197の熟語になる1語。','for','work for＋勤務先。forの後ろに勤めている会社などを置くよ。',197),
  input('「私は金曜日に1日休みを取ります」<br>I will take a day (　) on Friday.<br>空欄に1語。','off','take a day offで「1日休みを取る」。期間をtakeとoffの間に置こう。',199),
  input('「彼女は仕事でカナダへ行きました」<br>She went to Canada (　) business.<br>空欄に1語。','on','on businessで「仕事で・出張で」。onを忘れずに。',200),
  choice('「今日は宿題がたくさんあります」に合うのは？<br>I have (　) today.','a lot of homework',['many homeworks','a homework','three homeworks'],'homeworkは数えられない名詞。aや複数形のsを付けず、a lot ofを使おう。',202),
  input('「私はアルバイトの面接を受けます」<br>I will have (　) interview for a part-time job.<br>aかanを入れよう。','an','interviewは母音の音で始まるのでan interviewだよ。',204)
],'② 例文で確認｜間違えやすい形');

export const units = HQ.units;
export const cards = HQ.cards;
