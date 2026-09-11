import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 添付写真1〜5の学習項目に対応。本文・例文は独自作成。
function c(q,answer,wrong,exp,speech) {return {type:'yon',lv:'標準',q,choices:[answer,...wrong],a:0,exp,examPractice:true,...(speech?{speech}:{})};}
function w(q,answer,exp,accept=[]) {return {type:'ana',lv:'標準',q,choices:[answer],a:0,forceInput:true,accept,exp,examPractice:true};}
function order(q,steps,exp) {return {type:'junban',lv:'標準',q,steps,a:steps.map((_,i)=>i),exp,examPractice:true};}
function u(id,title,desc,questions) {HQ.registerUnit({id,subject:'📅 9/16 実力テスト対策',group:'英語',title,desc,order:10220+HQ.units.length,questions,cards:[]});}

u('sep16En1','英語① 発音・アクセント','音声で確認しながら音の違いと強勢を練習',[
  c('「🔊 英語を聞く」で確認しよう。sea と同じ発音の語は？','see',['say','she','sit'],'sea と see はどちらも /siː/。長い「イー」の音だよ。','sea. see. say. she. sit.'),
  c('write と同じ発音の語は？','right',['wait','white','ride'],'write のwは発音しないので、rightと同じ /raɪt/ になるよ。','write. right. wait. white. ride.'),
  c('太字の a の発音が他の3語と異なるのは？ c<b>a</b>t / b<b>a</b>g / n<b>a</b>me / m<b>a</b>p','name',['cat','bag','map'],'name のaは /eɪ/。ほかの3語は /æ/ だよ。','cat. bag. name. map.'),
  c('太字の oo の発音が他の3語と異なるのは？ b<b>oo</b>k / l<b>oo</b>k / c<b>oo</b>k / f<b>oo</b>d','food',['book','look','cook'],'food は /uː/、book・look・cook は短い /ʊ/ だよ。','book. look. cook. food.'),
  c('語尾 -ed を /ɪd/ と発音する語は？','wanted',['played','washed','looked'],'/t/や/d/で終わる動詞では、-edが1音節増えて /ɪd/ になるよ。','wanted. played. washed. looked.'),
  c('語尾の s を /z/ と発音する語は？','dogs',['cats','books','maps'],'dog の最後は有声音 /ɡ/。続く複数形のsは /z/ だよ。','dogs. cats. books. maps.'),
  c('ho-tel の第1強勢はどこ？','第2音節 tel',['第1音節 ho','両方とも同じ強さ','強勢はない'],'hotel は後ろのtelを強く発音するよ。音声でも確かめよう。','hotel'),
  c('beau-ti-ful の第1強勢はどこ？','第1音節 beau',['第2音節 ti','第3音節 ful','3音節すべて同じ'],'beautiful は最初の音節を強く発音するよ。','beautiful'),
  c('de-ci-sion の第1強勢はどこ？','第2音節 ci',['第1音節 de','第3音節 sion','強勢はない'],'decision は真ん中の音節に強勢があるよ。','decision'),
  c('動詞 in-vite の第1強勢はどこ？','第2音節 vite',['第1音節 in','両方とも同じ強さ','強勢はない'],'動詞inviteは後ろを強く発音するよ。つづりと音を結びつけよう。','invite')
]);
u('sep16En2','英語② 文法・語彙','現在完了、不定詞、比較、熟語、派生語',[
  w('I have lived here (　) 2021.<br>「2021年からここに住んでいます」空欄に1語。','since','起点にはsinceを使うよ。期間の長さならforだね。'),
  w('She has studied English (　) three years.<br>期間を表す1語を入れよう。','for','three yearsは期間の長さなのでforを使うよ。'),
  w('I (　) my uncle last Sunday.<br>meetを適切な過去形にしよう。','met','last Sundayのように過去の時点が明確なら過去形。meetの過去形はmetだよ。'),
  w('Have you (　) visited Kyoto?<br>「今までに京都を訪れたことがありますか」空欄に1語。','ever','経験を尋ねる現在完了ではever「今までに」が使えるよ。'),
  c('I went to the library to study. の to study の働きは？','目的を表す副詞的用法',['主語になる名詞的用法','libraryを修飾する形容詞的用法','過去の時刻を表す'],'「勉強するために」とwentの目的を説明しているよ。'),
  c('I have a report to finish. の to finish の働きは？','reportを修飾する形容詞的用法',['主語になる名詞的用法','比較級を強める副詞','過去完了を作る語句'],'「仕上げるべきレポート」と名詞reportを後ろから説明しているよ。'),
  w('This bag is (　) than that one.<br>「このかばんはあれより重い」heavyを適切な形に。','heavier','子音字＋yで終わるheavyは、yをiにして-erを付けよう。'),
  w('This is the (　) important point.<br>「これが最も重要な点です」空欄に1語。','most','importantの最上級はmost important。theも一緒に確認しよう。'),
  w('To tell the (　), I forgot his name.<br>「実を言うと」になる1語。','truth','To tell the truthで「実を言うと」という熟語だよ。'),
  w('形容詞 deep「深い」に対応する名詞「深さ」を英語で書こう。','depth','deep → depth。語形をセットで覚えよう。')
]);
u('sep16En3','英語③ 会話表現','予約、注文、待ち時間、家族と趣味',[
  c('電話で「明日の夕食の席を予約したいです」と言うなら？',"I'd like to reserve a table for dinner tomorrow.",['I ate dinner yesterday.','The table is made of wood.','I have no homework tomorrow.'],'I would like to ...は丁寧に希望を伝える言い方だよ。'),
  c('店員：For how many people?<br>客の返答として適切なのは？','Three, please.',['At seven, please.','By the window, please.','Medium, please.'],'how many peopleは人数を尋ねているよ。時刻や席の希望と区別しよう。'),
  c('客：Could we have a table by the window?<br>希望しているものは？','窓際の席',['窓を閉めること','窓を修理すること','持ち帰りの食事'],'by the windowは「窓のそばに」だよ。'),
  w('店員：May I (　) your order?<br>「ご注文を伺ってもよろしいですか」空欄に1語。','take','take an orderは「注文を取る」。会話表現として覚えよう。'),
  c('店員：How would you like your steak?<br>自然な答えは？','Medium, please.',['For two people.','At six thirty.','Twice a week.'],'ステーキの焼き加減を尋ねているよ。mediumは「ミディアムで」。'),
  c('「どのくらい待たなければなりませんか」に当たる文は？','How long will we have to wait?',['How many tables are there?','How old is this restaurant?','How much did you eat?'],'時間の長さを尋ねるときはHow longを使うよ。'),
  c('A：How many people are there in your family?<br>Bの答えは？','There are four.',['I am sixteen.','It is sunny.','I like music.'],'人数を尋ねているので、家族の人数で答えよう。'),
  w('I like reading. How (　) you?<br>「あなたはどうですか」空欄に1語。','about','How about you? で同じ質問を相手に返せるよ。'),
  w('I often go (　) in summer.<br>「夏によく泳ぎに行きます」swimを適切な形に。','swimming','go＋動詞の-ing形で「〜しに行く」。swimはmを重ねてswimmingだよ。'),
  c('「この計画についてどう思いますか」と意見を求める文は？','What do you think about this plan?',['When did you make this plan?','Where is the plan?','Who wrote this plan?'],'意見を尋ねるときはWhat do you think about ...? を使おう。')
]);

const passage='Last month, our class started a small garden behind the school. At first, we watered every plant every day. Some plants grew well, but others became weak. Our science teacher told us that different plants need different amounts of water. We began to check the soil before watering. Two weeks later, the weak plants looked healthier. I learned that helping does not always mean doing more. Sometimes it means watching carefully and changing what we do.';
function r(q,answer,wrong,exp){return c(`【本文】<span lang="en">${passage}</span><br><br>【問】${q}`,answer,wrong,exp);}
u('sep16En4','英語④ 長文読解','学校の庭づくりを題材に主旨・理由・指示語を読む',[
  r('庭を作り始めたのはいつ？','先月',['昨年','昨日','2年前'],'Last monthが時を示しているよ。'),
  r('庭を作った場所は？','学校の裏',['教師の家の前','駅の中','教室の屋根の上'],'behind the schoolは「学校の裏」だよ。'),
  r('最初に生徒たちがしていたことは？','毎日すべての植物に水をやっていた',['植物ごとに土を確認していた','弱った植物を全部捨てていた','水を一度もやらなかった'],'At firstの後の文を根拠にしよう。'),
  r('othersが指すのは？','他の植物',['他の教師','他の学校','他の月'],'Some plants ..., but others ...は「ある植物は〜、他の植物は〜」という対比だよ。'),
  r('教師の助言の内容は？','植物によって必要な水の量が異なる',['すべての植物には同じ量の水が必要だ','毎日水を増やし続けるべきだ','弱い植物は回復しない'],'different plantsとdifferent amountsを対応させよう。'),
  r('助言の後、生徒たちが水やり前に確認したものは？','土',['花の値段','校門','時計だけ'],'check the soil before wateringに書かれているよ。'),
  r('2週間後、弱っていた植物はどうなった？','以前より元気に見えた',['すべて枯れた','すぐ木になった','変化は一切なかった'],'healthierはhealthyの比較級。「より元気な」だよ。'),
  r('筆者が学んだことは？','よく観察して行動を変えることも助けになる',['助けるには常に作業量を増やすだけでよい','植物にはまったく水がいらない','先生に聞かずに行動すべきだ'],'最後の2文が体験から得た教訓を表しているよ。'),
  r('本文に最も合う題名は？','Learning to Care for Plants',['The Fastest Way to Build a School','A Trip to a Science Museum','Why All Plants Need the Same Water'],'内容全体に合う題名を選ぼう。「植物の世話を学ぶ」が適切だね。'),
  w(`【本文】<span lang="en">${passage}</span><br><br>【問】「注意深く」に当たる英単語を本文から1語で抜き出そう。`,'carefully','watching carefullyのcarefully。「どう観察するか」を表す副詞だよ。')
]);
u('sep16En5','英語⑤ 語順・英作文','現在完了進行形、受動態、不定詞、提案',[
  order('「私は2時間ずっと勉強しています」になるように並べよう。',['I','have','been','studying','for two hours.'],'have been＋動詞の-ing形が現在完了進行形。期間はforで表すよ。'),
  order('「私の兄は私に辞書をくれました」になるように並べよう。',['My brother','gave','me','a dictionary.'],'give＋人＋物の語順。誰に、何をくれたかを確認しよう。'),
  order('「オーストラリアでは何語が話されていますか」になるように並べよう。',['What language','is','spoken','in Australia?'],'言語は話される側なので、is spokenという受動態にしよう。'),
  order('「この町には訪れるべき場所がたくさんあります」になるように並べよう。',['There','are','many places','to visit','in this town.'],'There areで存在を示すよ。to visitがplacesを後ろから修飾するね。'),
  order('「忘れずに窓を閉めてください」になるように並べよう。',['Please','remember','to close','the window.'],'remember to ...は「忘れずに〜する」。これから行うことを表すよ。'),
  order('「彼は私にこの箱の開け方を教えてくれました」になるように並べよう。',['He','taught','me','how to open','this box.'],'how to＋動詞の原形で「〜の仕方」。taughtはteachの過去形だよ。'),
  order('「先生は私たちに廊下を走らないように言いました」になるように並べよう。',['The teacher','told','us','not to run','in the hallway.'],'tell＋人＋not to ...で「人に〜しないように言う」だよ。'),
  order('「彼はいつも机をきれいにしておきます」になるように並べよう。',['He','always','keeps','his desk','clean.'],'keep＋目的語＋形容詞で「目的語を〜の状態に保つ」。'),
  w('「私は昨年、50メートル泳ぐことができました」<br>I was (　) to swim fifty meters last year.<br>空欄に1語。','able','be able toで「〜できる」。過去なのでwas able toだよ。'),
  w('「窓を開けましょうか」<br>(　) I open the window?<br>提案する表現になる1語。','Shall','Shall I ...? は「私が〜しましょうか」と申し出る表現だよ。')
]);
export const units = HQ.units;
export const cards = HQ.cards;
