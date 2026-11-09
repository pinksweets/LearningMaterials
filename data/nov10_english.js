import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 出典：提供写真IMG_1457.jpeg〜IMG_1459.jpeg、p.72〜77のNo.205〜224。
// 写真内の説明・例文は学習資料として参照し、問題文と解説は学習用に作成。
// 各行は［見出し番号、英語、意味、覚えるポイント］。範囲外の見出しは追加しない。
const vocabulary = [
  [205,'teach','〜を（人に）教える','teachは知識や技能を教えること。teach＋人＋内容、teach＋人＋how to＋動詞を覚えよう。活用はteach–taught–taughtだよ。'],
  [206,'on my way to school','学校へ行く途中で','on my way to＋場所で「〜へ行く途中で」。homeは副詞なので、家へ帰る途中ならon my way homeとするよ。'],
  [207,'on a school trip','学校の旅行で','on a school tripで「学校の旅行で」。go on a school tripなら「遠足や修学旅行に行く」だよ。'],
  [208,'foreign','外国の','foreignは形容詞。a foreign countryで「外国」、foreign currencyで「外国通貨」だよ。'],
  [209,'abroad','海外へ・海外で','abroadは副詞なのでstudy abroad、live abroadのように、前にinやtoを置かず使えるよ。from abroadは「海外から」という表現だよ。'],
  [210,'international','国際的な','internationalは「国際的な」。an international flightで「国際便」、a domestic flightなら「国内便」だよ。'],
  [211,'country','国・田舎','countryは「国」。the countryで「田舎」という意味にもなるよ。live in the countryで「田舎に住む」。'],
  [212,'town','町','townは「町」。in town（町で）、out of town（町の外で）、go to town（町へ行く）では、ふつう冠詞を付けないよ。'],
  [213,'street','通り・街','streetは家や店が並ぶ「通り」。on the streetで「街で」。Go down this street.なら「この通りを行ってね」。'],
  [214,'begin','〜を始める・始まる','活用はbegin–began–begun。begin to doとbegin doingはどちらも「〜し始める」。時刻はbegin at nineのようにatを使うよ。'],
  [215,'finish','〜を終える・仕上げる','finishの後ろに動作を置くときはfinish doing。「読み終える」はfinish readingで、finish to readにはしないよ。'],
  [216,'be over','終わっている・終わった','be overは出来事が終わった状態を表すよ。The game is over.で「試合はもう終わった」。beは主語や時制に合わせよう。'],
  [217,'be done with','（仕事など）を終えている','be done with＋名詞で「〜を終えている」。Are you done with your homework?なら「宿題は終わった？」だよ。'],
  [218,'become','〜になる','become＋名詞で「〜になる」。職業ならbecome a doctorなど。活用はbecome–became–becomeだよ。'],
  [219,'turn','（色・年齢などが）〜に変わる・曲がる','turn greenで「緑色に変わる」、turn rightで「右に曲がる」。年齢はturn sixteenのように表すよ。'],
  [220,'change','変わる・〜を変える','changeは「変わる・変える」。change trainsは「電車を乗り換える」。この表現のtrainsは複数形にしよう。'],
  [221,'learn to do','（技能などが）〜できるようになる','learn to＋動詞の原形で、練習して技能を身に付けること。learn to swimなら「泳げるようになる」。learn how to swimとも言えるよ。'],
  [222,'come to do','〜するようになる','come to＋動詞の原形で、徐々にそうするようになること。come to likeで「好きになる」。become to doにはしないよ。'],
  [223,'get used to','〜に慣れる','get used toのtoは前置詞。後ろは名詞か動名詞にするよ。get used to getting up earlyで「早起きに慣れる」。be used toなら「慣れている」という状態だよ。'],
  [224,'go bad','悪くなる','食品などが悪くなることをgo badで表すよ。goの過去形はwent、過去分詞はgone。has gone badで「悪くなってしまった」。']
];

function choice(q,answer,others,exp,sourceNo){
  return {type:'yon',lv:'基礎',q,choices:[answer,...others],a:0,examPractice:true,exp,sourceNo};
}
function input(q,answer,exp,sourceNo){
  return {type:'ana',lv:'標準',q,choices:[answer],a:0,forceInput:true,examPractice:true,exp,sourceNo};
}
function stage(n,title,desc,questions,group='① 意味→つづり｜写真の20項目'){
  HQ.registerUnit({id:`nov10e${n}`,subject:'📅 11/10 英語小テスト対策',group,title,desc,order:10700+n,questions,cards:[]});
}

const spreads = [
  {page:'72〜73',start:0,end:6},
  {page:'74〜75',start:6,end:13},
  {page:'76〜77',start:13,end:20}
];
spreads.forEach(({page,start,end},index)=>{
  const rows=vocabulary.slice(start,end);
  const meanings=rows.map(([no,en,ja,exp])=>choice(`No.${no}「${en}」の意味は？`,ja,
    vocabulary.filter(row=>row[0]!==no).filter((_,i)=>i%6===index).slice(0,3).map(row=>row[2]),exp,no));
  const spellings=rows.map(([no,en,ja,exp])=>input(`No.${no}「${ja}」を英語で書こう。<br>見出しの形で答えてね（${en.split(' ').length}語）。「〜」は書かず、doはそのまま書こう。`,en,exp,no));
  stage(index+1,`p.${page}｜No.${rows[0][0]}〜${rows.at(-1)[0]}`,`意味を${rows.length}問、続けて英語入力を${rows.length}問。声に出してから、見ないで書いてみよう。`,[...meanings,...spellings]);
});

stage(4,'語法①｜教える・外国・始める','No.205〜214の前置詞・冠詞・活用を10問で確認しよう。',[
  input('「彼は去年、私たちに英語を教えました」<br>He (　) us English last year.<br>teachの過去形を1語。','taught','teachの活用はteach–taught–taught。last yearに合わせて過去形taughtを書こう。',205),
  choice('「家に帰る途中で」に合う形は？<br>I saw a cat (　).','on my way home',['on my way to home','in my way home','on my way at home'],'homeはここでは副詞なのでtoは不要。on my way homeをまとめて覚えよう。',206),
  input('「私たちは来週、修学旅行に行きます」<br>We will go (　) a school trip next week.<br>空欄に1語。','on','go on a school tripで「学校の旅行に行く」。onを使おう。',207),
  input('「彼女は外国で働いています」<br>She works in a (　) country.<br>「外国の」を表す1語。','foreign','countryを説明する形容詞foreignを入れよう。a foreign countryで「外国」だよ。',208),
  choice('「私は来年、留学したい」に合う形は？<br>I want to (　) next year.','study abroad',['study in abroad','study to abroad','study at abroad'],'abroadは副詞なので、その前にinやtoなどを置かずstudy abroadとするよ。',209),
  input('「これは国際便です」<br>This is an (　) flight.<br>「国際的な」を表す1語。','international','an international flightで「国際便」。internationalのつづりも確認しよう。',210),
  choice('文中のin the countryの意味は？<br>My grandparents live in the country.','田舎に',['その国のすべての場所に','町の中心部に','海外に'],'live in the countryは「田舎に住む」。countryの「国」と「田舎」を区別しよう。',211),
  choice('「彼女は今、町にいます」に合う形は？<br>She is (　) now.','in town',['on town','to town','at town'],'in townで「町にいる」。この決まった表現では冠詞を付けずに使うよ。',212),
  input('「私は通りで彼を見かけました」<br>I saw him (　) the street.<br>写真No.213の表現になる前置詞を1語。','on','on the streetで「通りで・街で」。onまで含めて思い出そう。',213),
  input('「授業はもう始まっています」<br>The lesson has already (　).<br>beginの過去分詞を1語。','begun','begin–began–begun。has＋過去分詞なのでbegunにしよう。beganは過去形だよ。',214)
],'② 例文で確認｜間違えやすい語法');

stage(5,'語法②｜終える・変化する','No.215〜224の動名詞・活用・熟語を10問で確認しよう。',[
  input('「私はその本を読み終えました」<br>I finished (　) the book.<br>readを文に合う形にして1語。','reading','finishの後ろには動名詞を置くよ。finish readingで「読み終える」。to readにはしないよ。',215),
  choice('試合が終わり、今は行われていません。「試合はもう終わったよ」に合う文は？','The game is over.',['The game is overed.','The game does over.','The game has over.'],'be overで「終わっている」。今の状態を表すので、この文ではis overを使うよ。',216),
  input('「宿題は終わりましたか」<br>Are you done (　) your homework?<br>空欄に1語。','with','be done with＋名詞で「〜を終えている」。doneの後ろのwithを忘れずに。',217),
  input('「彼女は去年、医者になりました」<br>She (　) a doctor last year.<br>becomeの過去形を1語。','became','becomeの過去形はbecame。職業などの名詞の前にはbecomeを使えるよ。got a doctorではこの意味にならないよ。',218),
  input('「その信号は緑色に変わりました」<br>The light (　) green.<br>turnの過去形を1語。','turned','色の変化はturn＋色。turnは規則動詞なので、過去形はturnedだよ。',219),
  input('「私たちは京都で電車を乗り換える必要があります」<br>We need to change (　) in Kyoto.<br>trainを文に合う形にして1語。','trains','change trainsで「電車を乗り換える」。乗る電車が変わるので、trainsと複数形で覚えよう。',220),
  input('「私は泳げるようになりたい」<br>I want to learn (　) swim.<br>空欄に1語。','to','learn to＋動詞の原形は、練習して技能が身に付くこと。learn to swimで「泳げるようになる」だよ。',221),
  choice('「私はだんだん英語の勉強が好きになりました」に合う形は？<br>I (　) like studying English.','came to',['became to','came for','became for'],'come to likeで「好きになる」。過去の変化なのでcame toを使おう。become to doにはしないよ。',222),
  input('「私は早起きに慣れてきています」<br>I am getting used to (　) up early.<br>getを文に合う形にして1語。','getting','get used toのtoは前置詞。動詞を続けるときは動名詞gettingにするよ。used to getにはしないよ。',223),
  input('「この牛乳は悪くなってしまいました」<br>This milk has (　) bad.<br>goの過去分詞を1語。','gone','go–went–gone。has＋過去分詞なのでgone bad。「食品が悪くなる」はgo badだよ。',224)
],'② 例文で確認｜間違えやすい語法');

export const units = HQ.units;
export const cards = HQ.cards;
