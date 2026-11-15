import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 出典：提供写真4枚、p.78〜85のNo.225〜251。
// 写真の語句・語法をもとに、問題文と解説は学習用に作成。
const vocabulary = [
  [225,'problem','問題','problemは「問題」。have a problem with＋名詞で「〜に問題がある」と表せるよ。'],
  [226,'solve','〜を解決する・解く','solve a problemで「問題を解決する」。質問に答えるときのanswer a questionと区別しよう。'],
  [227,'do well','うまくやる・成績がよい','do wellで「うまくやる」。do well at schoolなら「学校の成績がよい」だよ。'],
  [228,'decide','決定する・決心する','decide to＋動詞の原形で「〜することを決心する」。decisionは「決定」という名詞だよ。'],
  [229,'choose','〜を選ぶ','chooseは「選ぶ」。choose between the twoで「その2つから選ぶ」。活用はchoose–chose–chosenだよ。'],
  [230,'break','〜を壊す・骨折する','breakは「壊す・骨折する」。活用はbreak–broke–broken。break a legなら「脚を骨折する」だよ。'],
  [231,'break down','故障する','break downは機械などが「故障する」こと。故障した状態はbe out of orderでも表せるよ。'],
  [232,'fall','落ちる','fallは人や物が「落ちる」こと。活用はfall–fell–fallen。fall off〜で「〜から落ちる」。試験に落ちるときのfailとは区別しよう。'],
  [233,'drop','〜を落とす・落ちる','dropは「落とす・落ちる」。過去形はdropped、動名詞はdropping。最後のpを重ねよう。'],
  [234,'busy','忙しい','be busy with＋名詞、be busy doingで「〜で忙しい」。仕事で自分が忙しいときはI am busy with work.と、人を主語にしよう。'],
  [235,'free','自由な・無料の','freeは「自由な」のほか「無料の」という意味もあるよ。入場無料ならAdmission is free.と表せるよ。'],
  [236,'careful','注意深い','be careful of〜は「〜に注意する」。be careful not to＋動詞の原形で「〜しないように気をつける」だよ。'],
  [237,'kind','親切な・種類','kindは形容詞なら「親切な」、名詞なら「種類」。two kinds of〜で「2種類の〜」と表せるよ。'],
  [238,'poor','貧しい・〜が苦手な','poorは「貧しい」のほか、be poor at〜で「〜が苦手だ」という意味もあるよ。atの後ろは名詞か動名詞にしよう。'],
  [239,'shy','恥ずかしがりの・内気な','shyは「内気な」。be shy with strangersなら「知らない人の前では恥ずかしがる」だよ。'],
  [240,'be good at','〜が得意だ','be good atの後ろは名詞や動名詞。be good at playingなら「演奏するのが得意」。手先が器用ならbe good with one’s handsだよ。'],
  [241,'be able to do','〜することができる','be able to＋動詞の原形で「〜できる」。未来はwill be able to do。will canとはしないよ。'],
  [242,'be tired from','〜で疲れている','be tired fromは疲労の原因を表すよ。be tired ofは「〜にうんざりしている」なので、意味を区別しよう。'],
  [243,'easy','簡単な','easyは「簡単な」。easy for＋人、easy to＋動詞の原形という形を覚えよう。'],
  [244,'difficult','難しい','difficultは「難しい」。have difficulty doingなら「〜するのに苦労する」。difficultyの後ろは動名詞だよ。'],
  [245,'quiet','静かな・物静かな','quietは「静かな・物静かな」。keep quietで「静かにしている」。shyの「内気な」と区別しよう。'],
  [246,'safe','安全な','safeは「安全な」という形容詞。名詞の「安全」はsafety。a safe placeで「安全な場所」だよ。'],
  [247,'true','本当の・当てはまる','trueは「本当の」。The same is true for〜なら「同じことが〜にも当てはまる」だよ。'],
  [248,'wrong','間違っている・具合がおかしい','be wrong about〜で「〜について間違っている」。Something is wrong with〜は「〜の具合がおかしい」だよ。'],
  [249,'different','異なる・さまざまな','different from〜で「〜と異なる」。different parts of the worldなら「世界のさまざまな地域」だよ。'],
  [250,'be covered with','〜で覆われている','be covered with＋名詞で「〜で覆われている」。covered with snowなら「雪で覆われている」だよ。'],
  [251,'be full of','〜でいっぱいだ','be full of＋名詞で「〜でいっぱいだ」。be filled withも近い意味で使えるよ。']
];

function choice(q,answer,others,exp,sourceNo){
  return {type:'yon',lv:'基礎',q,choices:[answer,...others],a:0,examPractice:true,exp,sourceNo};
}
function input(q,answer,exp,sourceNo){
  return {type:'ana',lv:'標準',q,choices:[answer],a:0,forceInput:true,examPractice:true,exp,sourceNo};
}
function stage(n,title,desc,questions,group='① 意味→つづり｜写真の27項目'){
  HQ.registerUnit({id:`nov17e${n}`,subject:'📅 11/17 英語小テスト対策',group,title,desc,order:10800+n,questions,cards:[]});
}

const spreads = [
  {page:'78〜79',start:0,end:7},
  {page:'80〜81',start:7,end:14},
  {page:'82〜83',start:14,end:20},
  {page:'84〜85',start:20,end:27}
];
spreads.forEach(({page,start,end},index)=>{
  const rows=vocabulary.slice(start,end);
  const meanings=rows.map(([no,en,ja,exp],i)=>choice(`No.${no}「${en}」の意味は？`,ja,
    [7,14,21].map(offset=>vocabulary[(start+i+offset)%vocabulary.length][2]),exp,no));
  const spellings=rows.map(([no,en,ja,exp])=>input(`写真No.${no}の「${ja}」を英語で書こう。<br>見出しの形で${en.split(' ').length}語。「〜」は書かず、beやdoはそのまま書こう。`,en,exp,no));
  stage(index+1,`p.${page}｜No.${rows[0][0]}〜${rows.at(-1)[0]}`,`意味を${rows.length}問、続けて英語入力を${rows.length}問。見出しの形で、見ないで書いてみよう。`,[...meanings,...spellings]);
});

stage(5,'語法①｜解決・選択・落下','No.225〜233の前置詞・活用・動詞の形を9問で確認しよう。',[
  choice('「この電話機の調子が悪い」に合う前置詞は？<br>I have a problem (　) this phone.','with',['on','at','by'],'have a problem with＋名詞で「〜に問題がある」。withまで覚えよう。',225),
  input('「私たちは昨日、その問題を解決しました」<br>We (　) the problem yesterday.<br>solveの過去形を1語。','solved','solveは規則動詞。過去形はsolvedだよ。',226),
  choice('「彼女は学校の成績がよい」に合う前置詞は？<br>She does well (　) school.','at',['on','from','about'],'do well at schoolで「学校の成績がよい」。wellは「うまく」を表すよ。',227),
  input('「私は毎日練習することに決めました」<br>I decided (　) practice every day.<br>空欄に1語。','to','decide to＋動詞の原形で「〜することを決心する」。to practiceとしよう。',228),
  choice('「その2つから選んでね」に合う前置詞は？<br>Choose (　) the two.','between',['at','on','with'],'2つの選択肢から選ぶときはchoose between the twoと言えるよ。',229),
  input('「彼はコップを壊してしまいました」<br>He has (　) a cup.<br>breakの過去分詞を1語。','broken','break–broke–broken。has＋過去分詞なのでbrokenを書こう。',230),
  input('「私の車は昨日、故障しました」<br>My car (　) down yesterday.<br>breakの過去形を1語。','broke','break downで「故障する」。yesterdayに合わせ、breakを過去形brokeにしよう。',231),
  input('「葉がその木から落ちてしまいました」<br>The leaves have (　) from the tree.<br>fallの過去分詞を1語。','fallen','fall–fell–fallen。have＋過去分詞なのでfallenだよ。試験に落ちるときはfailを使うよ。',232),
  input('「私は昨日、ペンを落としました」<br>I (　) my pen yesterday.<br>dropの過去形を1語。','dropped','dropの過去形はdropped。最後のpを重ねてからedを付けよう。動名詞もdroppingとpを重ねるよ。',233)
],'② 例文で確認｜間違えやすい語法');

stage(6,'語法②｜忙しさ・性質・能力','No.234〜242の動名詞・品詞・熟語を9問で確認しよう。',[
  choice('「彼女は夕食作りで忙しい」に合う形は？<br>She is busy (　) dinner.','cooking',['cook','to cook','cooked'],'be busy doingで「〜するのに忙しい」。名詞を続けるならbe busy with＋名詞だよ。',234),
  choice('「この博物館は入場無料です」のfreeの意味は？<br>Admission to this museum is free.','無料の',['忙しい','自由時間がない','注意深い'],'freeには「自由な」と「無料の」の意味があるよ。入場料についての文なので、ここでは「無料の」だよ。',235),
  input('「転ばないように気をつけてね」<br>Be careful (　) to fall.<br>「〜しないように」を表す1語。','not','be careful not to＋動詞の原形で「〜しないように気をつける」。notはtoの前に置こう。',236),
  input('「ここには2種類の鳥がいます」<br>There are two (　) of birds here.<br>kindを文に合う形にして1語。','kinds','「種類」のkindは数えられる名詞。twoに合わせて複数形kindsにしよう。',237),
  choice('「私は歌うのが苦手です」に合う前置詞は？<br>I am poor (　) singing.','at',['with','to','from'],'be poor at〜で「〜が苦手だ」。この文のpoorは「貧しい」ではなく、技能が苦手なことを表しているよ。',238),
  choice('「知らない人の前では恥ずかしがる」に合う形は？<br>He is shy (　) strangers.','with',['on','at','to'],'写真の表現はbe shy with strangers。「知らない人の前では恥ずかしがる」だよ。',239),
  choice('「彼女はピアノを弾くのが得意です」に合う形は？<br>She is good at (　) the piano.','playing',['play','to play','played'],'atは前置詞なので、後ろに動作を続けるときは動名詞playingにしよう。',240),
  choice('「来年にはもっと速く泳げるでしょう」に合う形は？<br>You (　) swim faster next year.','will be able to',['will can','will able to','will be can'],'未来の能力はwill be able to＋動詞の原形。willの直後にcanは置かないよ。',241),
  choice('家事のあとで体が疲れています。「家事にうんざり」ではない表現は？<br>I am tired (　) doing housework.','from',['of','to','about'],'疲労の原因はtired fromで表すよ。tired ofなら「〜にうんざりしている」という意味になるよ。',242)
],'② 例文で確認｜間違えやすい語法');

stage(7,'語法③｜難しさ・状態・前置詞','No.243〜251の熟語・品詞・前置詞を9問で確認しよう。',[
  choice('「この問題は私には簡単でした」に合う前置詞は？<br>This question was easy (　) me.','for',['at','of','with'],'easy for＋人で「その人にとって簡単」。for meで「私にとって」だよ。',243),
  choice('「私はこの本を読むのに苦労しています」に合う形は？<br>I have difficulty (　) this book.','reading',['read','to read','reads'],'have difficultyの後ろは動名詞。have difficulty readingで「読むのに苦労する」だよ。',244),
  input('「図書館では静かにしていてね」<br>Please keep (　) in the library.<br>写真No.245の「静かな」を表す1語。','quiet','keep quietで「静かにしている」。quietは状態を表す形容詞だよ。',245),
  input('safeは「安全な」という形容詞。「安全」を表す名詞を1語で書こう。','safety','形容詞はsafe、名詞はsafety。つづりの違いも確認しよう。',246),
  choice('「同じことがほかのみんなにも当てはまります」に合う前置詞は？<br>The same is true (　) everybody else.','for',['at','from','with'],'The same is true for〜で「同じことが〜にも当てはまる」と表せるよ。',247),
  choice('「このパソコンはどこか具合がおかしい」に合う前置詞は？<br>Something is wrong (　) this computer.','with',['about','at','from'],'Something is wrong with〜で「〜のどこかが具合が悪い」。人の考えが間違っている場合のwrong aboutと区別しよう。',248),
  choice('「私の計画はあなたのものと異なります」に合う前置詞は？<br>My plan is different (　) yours.','from',['of','at','for'],'写真の表現はdifferent from〜。「〜と異なる」をfromと一緒に覚えよう。',249),
  choice('「山の頂上は雪で覆われています」に合う前置詞は？<br>The mountain top is covered (　) snow.','with',['of','from','at'],'be covered with＋名詞で「〜で覆われている」。雪ならcovered with snowだよ。',250),
  choice('「この箱は本でいっぱいです」に合う前置詞は？<br>This box is full (　) books.','of',['with','from','at'],'be full of＋名詞で「〜でいっぱいだ」。be filled withとは前置詞が違うよ。',251)
],'② 例文で確認｜間違えやすい語法');

export const units = HQ.units;
export const cards = HQ.cards;
