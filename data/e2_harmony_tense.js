import { createRegistry } from "./_registry.js";
const HQ = createRegistry();
/* ============================================================
   総合英語 Harmony：時制
   小カテゴリ8つ・各10問・計80問
   type: yon(4択) / ana(穴埋め) / maru(○×) / kumi(組み合わせ)
============================================================ */

HQ.registerUnit({
  id: "e2s1",
  subject: "🇬🇧 総合英語 Harmony",
  group: "時制",
  title: "現在形",
  desc: "習慣・事実・現在の状態を表す",
  order: 24,
  questions: [
 {type:"yon",lv:"基礎",q:"次の日本語に合う英文はどれか。「彼は毎朝英語を勉強します。」",choices:["He study English every morning.","He studies English every morning.","He is studying English yesterday.","He studied English every morning now."],a:1,time:30,exp:"主語が He の現在形では、一般動詞に三単現の -s がつきます。every morning は習慣を表すので現在形が自然です。",hint:"He が主語の現在形では動詞に何がつく？"},
 {type:"ana",lv:"基礎",q:"英文 My father（　）coffee every day. に入る最も自然な語はどれか。",choices:["drink","drinks","drank","is drink"],a:1,time:30,exp:"My father は三人称単数なので drinks です。every day は習慣を表します。",hint:"My father は he に置き換えられます。"},
 {type:"maru",lv:"基礎",q:"現在形は、今この瞬間だけでなく、習慣や一般的な事実にも使う。",a:true,exp:"正しいです。I play tennis on Sundays. のような習慣や、The earth goes around the sun. のような一般的事実に使います。",hint:"「いつもそう」「ふだんそう」に使います。"},
 {type:"yon",lv:"基礎",q:"次のうち、一般的な事実を現在形で表している文はどれか。",choices:["Water boils at 100°C.","I was watching TV.","They will visit us.","She used to live here."],a:0,time:30,exp:"Water boils at 100°C. は水の性質という一般的な事実を表すので現在形です。",hint:"いつでも成り立つ内容を探そう。"},
 {type:"yon",lv:"標準",q:"否定文として正しいものはどれか。「彼女は肉を食べません。」",choices:["She don't eat meat.","She doesn't eats meat.","She doesn't eat meat.","She not eats meat."],a:2,time:30,exp:"三人称単数の否定は doesn't ＋動詞の原形です。doesn't の後ろでは eats ではなく eat になります。",hint:"doesn't の後ろは動詞の原形です。"},
 {type:"yon",lv:"基礎",q:"英文 The earth（　）around the sun. に入る最も自然な語はどれか。",choices:["go","goes","went","is going now"],a:1,time:30,exp:"地球が太陽のまわりを回ることは一般的な事実なので現在形を使います。主語 The earth は三人称単数なので goes です。",hint:"一般的な事実＋三人称単数です。"},
 {type:"ana",lv:"基礎",q:"英文 I usually（　）breakfast at seven. に入る語はどれか。",choices:["eat","eats","ate","am eating"],a:0,time:30,exp:"usually は習慣を表します。主語 I には動詞の原形 eat を使います。",hint:"I が主語なので -s はつきません。"},
 {type:"maru",lv:"基礎",q:"every day や usually は、習慣を表す現在形と一緒に使われやすい。",a:true,exp:"正しいです。every day や usually は「ふだんそうしている」ことを表すため、現在形と相性がよい語です。",hint:"習慣を表す語です。"},
 {type:"yon",lv:"標準",q:"疑問文として正しいものはどれか。「彼はこの近くに住んでいますか。」",choices:["Do he live near here?","Does he lives near here?","Does he live near here?","Is he live near here?"],a:2,time:30,exp:"三人称単数の一般動詞の疑問文は Does＋主語＋動詞の原形 です。Does の後ろは lives ではなく live です。",hint:"Does の後ろは原形です。"},
 {type:"kumi",lv:"標準",q:"次の主語と、現在形で使う動詞の形を対応させよう。",pairs:[
    {l:"I", r:"play"},
    {l:"She", r:"plays"},
    {l:"My friends", r:"play"}
  ],exp:"現在形では、主語が三人称単数のときだけ一般動詞に -s / -es がつきます。"}
  ],
  cards: []
});

HQ.registerUnit({
  id: "e2s2",
  subject: "🇬🇧 総合英語 Harmony",
  group: "時制",
  title: "現在進行形",
  desc: "今していること・一時的な動作を表す",
  order: 25,
  questions: [
 {type:"yon",lv:"基礎",q:"現在進行形の形として正しいものはどれか。",choices:["主語＋動詞の原形","主語＋be動詞＋動詞のing形","主語＋will＋動詞の原形","主語＋過去形"],a:1,time:30,exp:"現在進行形は be動詞＋動詞のing形 で作ります。I am studying. / She is studying. の形です。",hint:"be動詞と -ing をセットで使います。"},
 {type:"ana",lv:"基礎",q:"英文 They（　）soccer now. に入る最も自然な語句はどれか。",choices:["play","plays","are playing","played"],a:2,time:30,exp:"now があるので「今している」動作を表す現在進行形が自然です。They are playing soccer now. となります。",hint:"They に合う be動詞も必要です。"},
 {type:"maru",lv:"基礎",q:"I am reading a book now. は現在進行形の文である。",a:true,exp:"正しいです。am reading が be動詞＋ing形になっています。now も現在進行形と相性のよい語です。",hint:"am reading の形に注目しよう。"},
 {type:"yon",lv:"基礎",q:"「彼女は今、昼食を作っています。」に合う英文はどれか。",choices:["She cooks lunch now.","She is cooking lunch now.","She cooked lunch now.","She cooking lunch now."],a:1,time:30,exp:"今している動作なので She is cooking lunch now. が正しいです。主語 She には is を使います。",hint:"She の現在進行形は is ＋ing。"},
 {type:"yon",lv:"標準",q:"次のうち、現在進行形が表す内容として最も自然なものはどれか。",choices:["毎週日曜の習慣","今この瞬間に進行中の動作","過去に終わった出来事","昔よくしていた習慣"],a:1,time:30,exp:"現在進行形は、基本的に今進行中の動作を表します。習慣なら現在形、過去の出来事なら過去形を使います。",hint:"be + ing は「今している」。"},
 {type:"yon",lv:"基礎",q:"英文 Look! The cat（　）under the table. に入る最も自然な語句はどれか。",choices:["sleep","sleeps","is sleeping","slept"],a:2,time:30,exp:"Look! は今見ている場面を表す合図です。The cat is sleeping が現在進行形です。",hint:"今している動作なので is + ing。"},
 {type:"ana",lv:"基礎",q:"英文 I am（　）a letter now. に入る語はどれか。",choices:["write","writes","writing","wrote"],a:2,time:30,exp:"現在進行形は be動詞＋動詞のing形です。write は e を落として writing になります。",hint:"am の後ろは ing形です。"},
 {type:"maru",lv:"基礎",q:"She is study English now. は現在進行形として正しい。",a:false,exp:"誤りです。現在進行形では be動詞の後ろを ing形にするので、She is studying English now. が正しい形です。",hint:"study を ing形にしよう。"},
 {type:"yon",lv:"標準",q:"否定文として正しいものはどれか。「彼らは今、走っていません。」",choices:["They are not running now.","They do not running now.","They are not run now.","They not are running now."],a:0,time:30,exp:"現在進行形の否定は be動詞の後ろに not を置きます。They are not running now. が正しいです。",hint:"are not + ing の形です。"},
 {type:"kumi",lv:"標準",q:"主語と現在進行形のbe動詞を対応させよう。",pairs:[
    {l:"I", r:"am"},
    {l:"You / We / They", r:"are"},
    {l:"He / She / It", r:"is"}
  ],exp:"現在進行形では主語に合わせて am / are / is を選び、その後ろに動詞のing形を置きます。"}
  ],
  cards: []
});

HQ.registerUnit({
  id: "e2s3",
  subject: "🇬🇧 総合英語 Harmony",
  group: "時制",
  title: "過去形",
  desc: "過去に起こったことを表す",
  order: 26,
  questions: [
 {type:"yon",lv:"基礎",q:"次の日本語に合う英文はどれか。「私は昨日、図書館へ行きました。」",choices:["I go to the library yesterday.","I went to the library yesterday.","I will go to the library yesterday.","I am going to the library yesterday."],a:1,time:30,exp:"yesterday は過去を表すので、go の過去形 went を使います。",hint:"go の過去形は？"},
 {type:"ana",lv:"基礎",q:"英文 She（　）tennis last Sunday. に入る最も自然な語はどれか。",choices:["play","plays","played","is playing"],a:2,time:30,exp:"last Sunday は過去の時を表すので、過去形 played を使います。",hint:"last Sunday は過去を示す語です。"},
 {type:"maru",lv:"基礎",q:"過去形は、過去のある時点で起こったことを表す。",a:true,exp:"正しいです。yesterday, last night, two days ago などと一緒に使われることが多いです。",hint:"「昨日」「昨夜」「前に」と相性がよい形です。"},
 {type:"yon",lv:"基礎",q:"次のうち、過去形の文はどれか。",choices:["He watches TV every day.","He watched TV last night.","He is watching TV now.","He will watch TV tomorrow."],a:1,time:30,exp:"watched と last night から、過去にしたことを表す文だとわかります。",hint:"last night に合う動詞の形を探そう。"},
 {type:"yon",lv:"標準",q:"疑問文として正しいものはどれか。「あなたは昨日、その映画を見ましたか。」",choices:["Did you saw the movie yesterday?","Did you see the movie yesterday?","Do you saw the movie yesterday?","Were you see the movie yesterday?"],a:1,time:30,exp:"過去の一般動詞の疑問文は Did＋主語＋動詞の原形 です。Did を使うと、saw ではなく see になります。",hint:"Did の後ろは動詞の原形です。"},
 {type:"yon",lv:"基礎",q:"英文 We（　）at home last night. に入る最も自然な語はどれか。",choices:["are","were","was","be"],a:1,time:30,exp:"last night は過去を表します。主語 We に合う be動詞の過去形は were です。",hint:"We の過去の be動詞です。"},
 {type:"ana",lv:"基礎",q:"英文 I（　）my room yesterday. に入る語はどれか。",choices:["clean","cleans","cleaned","am cleaning"],a:2,time:30,exp:"yesterday があるので過去形 cleaned を使います。clean は規則動詞なので -ed をつけます。",hint:"昨日したことなので過去形です。"},
 {type:"maru",lv:"基礎",q:"go の過去形は went である。",a:true,exp:"正しいです。go は不規則動詞で、過去形は went です。goed とはしません。",hint:"不規則動詞の代表例です。"},
 {type:"yon",lv:"標準",q:"否定文として正しいものはどれか。「私は昨日、彼に会いませんでした。」",choices:["I didn't met him yesterday.","I didn't meet him yesterday.","I wasn't meet him yesterday.","I don't met him yesterday."],a:1,time:30,exp:"過去の一般動詞の否定は didn't＋動詞の原形 です。didn't の後ろは met ではなく meet です。",hint:"didn't の後ろは原形です。"},
 {type:"kumi",lv:"標準",q:"動詞の原形と過去形を対応させよう。",pairs:[
    {l:"go", r:"went"},
    {l:"make", r:"made"},
    {l:"visit", r:"visited"}
  ],exp:"過去形には visited のような規則変化と、went / made のような不規則変化があります。"}
  ],
  cards: []
});

HQ.registerUnit({
  id: "e2s4",
  subject: "🇬🇧 総合英語 Harmony",
  group: "時制",
  title: "過去進行形",
  desc: "過去のある時点で進行中だった動作を表す",
  order: 27,
  questions: [
 {type:"yon",lv:"基礎",q:"過去進行形の形として正しいものはどれか。",choices:["主語＋was/were＋動詞のing形","主語＋is/am/are＋動詞のing形","主語＋will＋動詞の原形","主語＋used to＋動詞の原形"],a:0,time:30,exp:"過去進行形は was/were＋動詞のing形 で作ります。I was studying. / They were studying. の形です。",hint:"過去の be動詞と -ing を使います。"},
 {type:"ana",lv:"基礎",q:"英文 I（　）TV at eight last night. に入る最も自然な語句はどれか。",choices:["watch","watched","was watching","am watching"],a:2,time:30,exp:"at eight last night は過去のある時点です。その時に進行中だった動作なので was watching を使います。",hint:"「昨夜8時にしていたところ」なら過去進行形。"},
 {type:"maru",lv:"基礎",q:"They were playing basketball then. は過去進行形の文である。",a:true,exp:"正しいです。were playing が was/were＋ing形になっています。then は「その時」を表します。",hint:"were playing の形に注目しよう。"},
 {type:"yon",lv:"基礎",q:"「彼女はその時、ピアノを弾いていました。」に合う英文はどれか。",choices:["She plays the piano then.","She was playing the piano then.","She will play the piano then.","She has played the piano then."],a:1,time:30,exp:"過去のその時に進行中だった動作なので She was playing the piano then. が自然です。",hint:"She には was を使います。"},
 {type:"yon",lv:"標準",q:"次の文の下線部に入る最も自然なものはどれか。When I called Ken, he（　）dinner.",choices:["has","had","was having","will have"],a:2,time:30,exp:"電話した時、彼は夕食を食べている最中だった、という意味なので過去進行形 was having が自然です。",hint:"When I called は過去のある時点です。"},
 {type:"yon",lv:"基礎",q:"英文 They（　）English at 9 p.m. yesterday. に入る最も自然な語句はどれか。",choices:["study","studied","were studying","are studying"],a:2,time:30,exp:"過去のある時点で進行中だった動作なので were studying を使います。主語 They には were を使います。",hint:"過去の be動詞＋ing形です。"},
 {type:"ana",lv:"基礎",q:"英文 She was（　）a shower then. に入る語はどれか。",choices:["take","takes","taking","took"],a:2,time:30,exp:"was の後ろには動詞のing形 taking を置きます。take は e を落として taking になります。",hint:"was + ing の形です。"},
 {type:"maru",lv:"基礎",q:"I was doing my homework when my mother came home. は、母が帰宅した時に宿題をしている最中だったという意味を表せる。",a:true,exp:"正しいです。was doing が過去のある時点で進行中だった動作を表しています。",hint:"when 以下が過去の時点を示しています。"},
 {type:"yon",lv:"標準",q:"過去進行形の否定文として正しいものはどれか。",choices:["He was not sleeping then.","He did not sleeping then.","He was not slept then.","He not was sleeping then."],a:0,time:30,exp:"過去進行形の否定は was/were の後ろに not を置きます。He was not sleeping then. が正しいです。",hint:"was not + ing の形です。"},
 {type:"kumi",lv:"標準",q:"主語と過去進行形のbe動詞を対応させよう。",pairs:[
    {l:"I / He / She / It", r:"was"},
    {l:"You / We / They", r:"were"},
    {l:"Ken and Yuki", r:"were"}
  ],exp:"過去進行形では、主語に合わせて was / were を選び、その後ろに動詞のing形を置きます。"}
  ],
  cards: []
});

HQ.registerUnit({
  id: "e2s5",
  subject: "🇬🇧 総合英語 Harmony",
  group: "時制",
  title: "過去のことを表すused to",
  desc: "以前の習慣や状態を表す",
  order: 28,
  questions: [
 {type:"yon",lv:"基礎",q:"used to の基本的な意味として最も近いものはどれか。",choices:["今まさにしている","以前はよく〜した／以前は〜だった","これから必ず〜する","いつも現在そうである"],a:1,time:30,exp:"used to は、過去の習慣や状態を表します。今はそうではない、という含みを持つことが多いです。",hint:"「昔は〜だった」に近い表現です。"},
 {type:"ana",lv:"基礎",q:"英文 I used to（　）in Osaka. に入る語として正しいものはどれか。",choices:["live","lived","living","lives"],a:0,time:30,exp:"used to の後ろは動詞の原形です。I used to live in Osaka. で「私は以前、大阪に住んでいました」となります。",hint:"to の後ろですが、この表現では動詞の原形を使います。"},
 {type:"maru",lv:"基礎",q:"used to の後ろには、ふつう動詞の原形を置く。",a:true,exp:"正しいです。used to play, used to live, used to be のように使います。",hint:"used to played にはしません。"},
 {type:"yon",lv:"基礎",q:"「彼は以前、早起きでした。」に合う英文はどれか。",choices:["He used to be an early riser.","He used to was an early riser.","He is used to be an early riser.","He will used to be an early riser."],a:0,time:30,exp:"状態を表すときは used to be を使えます。used to の後ろは原形なので be が正しい形です。",hint:"used to の後ろは be の原形。"},
 {type:"yon",lv:"標準",q:"次の英文の意味として最も自然なものはどれか。My grandmother used to walk to school.",choices:["祖母は今、学校へ歩いている","祖母は以前、学校へ歩いて通っていた","祖母は明日、学校へ歩いて行く","祖母は学校へ歩いて行ったことがない"],a:1,time:30,exp:"used to walk は「以前は歩いていた」という過去の習慣を表します。",hint:"used to は昔の習慣です。"},
 {type:"yon",lv:"基礎",q:"「私は以前、犬を飼っていました。」に合う英文はどれか。",choices:["I used to have a dog.","I used to had a dog.","I am used to have a dog.","I use to having a dog."],a:0,time:30,exp:"used to の後ろは動詞の原形です。I used to have a dog. で、今は飼っていない可能性を含む過去の状態を表せます。",hint:"used to + 原形です。"},
 {type:"ana",lv:"基礎",q:"英文 There used to（　）a bookstore here. に入る語はどれか。",choices:["be","was","is","being"],a:0,time:30,exp:"used to の後ろは原形なので be を使います。There used to be ... で「以前は〜があった」と表せます。",hint:"used to の後ろは be の原形。"},
 {type:"maru",lv:"基礎",q:"used to は、現在も必ず同じ習慣が続いていることを強く表す。",a:false,exp:"誤りです。used to は過去の習慣や状態を表し、今はそうではない含みを持つことが多い表現です。",hint:"「以前は〜した」に近い意味です。"},
 {type:"yon",lv:"標準",q:"否定文として自然なものはどれか。「彼は以前は朝食を食べませんでした。」",choices:["He didn't use to eat breakfast.","He didn't used to ate breakfast.","He wasn't use to eat breakfast.","He doesn't used to eat breakfast."],a:0,time:30,exp:"否定文では didn't use to + 動詞の原形 がよく使われます。didn't の後ろなので used ではなく use になります。",hint:"didn't の後ろは原形 use です。"},
 {type:"kumi",lv:"標準",q:"英文と意味を対応させよう。",pairs:[
    {l:"I used to play soccer.", r:"以前はサッカーをしていた"},
    {l:"She used to be shy.", r:"以前は内気だった"},
    {l:"There used to be a park.", r:"以前は公園があった"}
  ],exp:"used to は、過去の習慣だけでなく、過去の状態や存在にも使えます。"}
  ],
  cards: []
});

HQ.registerUnit({
  id: "e2s6",
  subject: "🇬🇧 総合英語 Harmony",
  group: "時制",
  title: "未来のことを表すwill / be going to",
  desc: "未来の予定・意志・予測を表す",
  order: 29,
  questions: [
 {type:"yon",lv:"基礎",q:"will の後ろに来る動詞の形として正しいものはどれか。",choices:["原形","過去形","ing形","三単現の形"],a:0,time:30,exp:"will の後ろは動詞の原形です。will goes ではなく will go とします。",hint:"助動詞の後ろは動詞の原形です。"},
 {type:"ana",lv:"基礎",q:"英文 It（　）rain tomorrow. に入る最も自然な語はどれか。",choices:["will","was","has","used to"],a:0,time:30,exp:"tomorrow は未来の時を表すので、It will rain tomorrow. が自然です。",hint:"未来の予測に使う助動詞です。"},
 {type:"maru",lv:"基礎",q:"be going to の後ろには、ふつう動詞の原形を置く。",a:true,exp:"正しいです。am going to study, is going to visit のように使います。",hint:"going to の後ろも原形です。"},
 {type:"yon",lv:"基礎",q:"「私は今夜、宿題をするつもりです。」に合う英文はどれか。",choices:["I am going to do my homework tonight.","I going to do my homework tonight.","I was going do my homework tonight.","I am go to do my homework tonight."],a:0,time:30,exp:"be going to＋動詞の原形で予定や意図を表します。主語 I には am を使います。",hint:"I am going to + 原形。"},
 {type:"yon",lv:"標準",q:"次のうち、未来の表現として文法的に正しいものはどれか。",choices:["She will visits Kyoto.","She is going to visit Kyoto.","She going to visits Kyoto.","She was visit Kyoto tomorrow."],a:1,time:30,exp:"She is going to visit Kyoto. が正しい形です。be going to の be動詞と、後ろの動詞の原形 visit が必要です。",hint:"be going to + 動詞の原形を探そう。"},
 {type:"yon",lv:"基礎",q:"「私はあなたを手伝います。」とその場で決めて言うとき、自然な英文はどれか。",choices:["I will help you.","I helped you yesterday.","I used to help you.","I am help you."],a:0,time:30,exp:"その場での意志や申し出には will を使えます。will の後ろは help の原形です。",hint:"助けるよ、と今決める感じです。"},
 {type:"ana",lv:"基礎",q:"英文 She is going to（　）a cake this afternoon. に入る語はどれか。",choices:["make","makes","made","making"],a:0,time:30,exp:"be going to の後ろは動詞の原形です。She is going to make a cake. となります。",hint:"going to の後ろは原形です。"},
 {type:"maru",lv:"基礎",q:"will と be going to は、どちらも未来のことを表す表現として使われる。",a:true,exp:"正しいです。will は意志や予測、be going to は予定やすでに考えている意図を表すことが多いです。",hint:"どちらも未来表現です。"},
 {type:"yon",lv:"標準",q:"空の雲を見て「雨が降りそうだ」と言うとき、自然な英文はどれか。",choices:["It is going to rain.","It used to rain.","It was raining yesterday.","It rains every day now."],a:0,time:30,exp:"今ある状況から近い未来を予測するとき、be going to が自然です。雲を見て判断している場面です。",hint:"今の様子から未来を予測しています。"},
 {type:"kumi",lv:"標準",q:"英文と未来表現の形を対応させよう。",pairs:[
    {l:"I will call you.", r:"will + 動詞の原形"},
    {l:"They are going to move.", r:"be going to + 動詞の原形"},
    {l:"She will be busy.", r:"will + be"}
  ],exp:"will も be going to も、後ろには動詞の原形を置きます。be を使うときも原形 be のままです。"}
  ],
  cards: []
});

HQ.registerUnit({
  id: "e2s7",
  subject: "🇬🇧 総合英語 Harmony",
  group: "時制",
  title: "現在形で未来の時や条件を表す",
  desc: "時・条件の副詞節では現在形を使う",
  order: 30,
  questions: [
 {type:"yon",lv:"基礎",q:"次の文の空所に入る最も自然な語はどれか。I will call you when I（　）home.",choices:["get","will get","got","am got"],a:0,time:30,exp:"when が作る時を表す節では、未来の内容でも現在形を使います。I will call you when I get home. となります。",hint:"when の中は未来でも現在形。"},
 {type:"ana",lv:"基礎",q:"英文 If it（　）tomorrow, we will stay home. に入る語はどれか。",choices:["rain","rains","will rain","rained"],a:1,time:30,exp:"if が作る条件の節では、未来のことでも現在形を使います。主語 it なので rains が正しいです。",hint:"if の中は will を使わず現在形。it に合う形にしよう。"},
 {type:"maru",lv:"基礎",q:"時や条件を表す when / if の節では、未来の内容でも現在形を使うことがある。",a:true,exp:"正しいです。I will help you if you need me. のように、if 節では現在形 need を使います。",hint:"主節は will、when/if 節は現在形が基本です。"},
 {type:"yon",lv:"基礎",q:"正しい英文はどれか。",choices:["I will tell him when he will come.","I will tell him when he comes.","I tell him when he will comes.","I told him when he will come tomorrow."],a:1,time:30,exp:"未来のことでも、時を表す when 節では現在形 comes を使います。主節には will を置けます。",hint:"when の中の will に注意。"},
 {type:"yon",lv:"標準",q:"次のうち、時・条件の副詞節のルールに合う文はどれか。",choices:["If she will be free, she will join us.","If she is free, she will join us.","If she was free tomorrow, she will join us.","If she be free, she will join us."],a:1,time:30,exp:"条件を表す if 節では未来の内容でも現在形を使うため、If she is free, she will join us. が正しいです。",hint:"if 節の中は現在形 is。"},
 {type:"yon",lv:"基礎",q:"英文 I will start dinner before my father（　）home. に入る語はどれか。",choices:["comes","will come","came","coming"],a:0,time:30,exp:"before が作る時を表す節では、未来の内容でも現在形を使います。my father は三人称単数なので comes です。",hint:"before の中は現在形です。"},
 {type:"ana",lv:"基礎",q:"英文 We will go out if it（　）sunny tomorrow. に入る語はどれか。",choices:["is","will be","was","be"],a:0,time:30,exp:"if 節では未来の内容でも現在形を使います。it is sunny tomorrow が条件を表します。",hint:"if の中は will be ではなく現在形。"},
 {type:"maru",lv:"基礎",q:"I will wait here until you come back. では、come が未来の内容を現在形で表している。",a:true,exp:"正しいです。until が作る時を表す節では、未来の内容でも現在形 come を使います。",hint:"until の中に will はありません。"},
 {type:"yon",lv:"標準",q:"正しい英文はどれか。",choices:["As soon as I will finish homework, I will call you.","As soon as I finish homework, I will call you.","As soon as I finished homework tomorrow, I will call you.","As soon as I am finish homework, I will call you."],a:1,time:30,exp:"as soon as が作る時の節では、未来の内容でも現在形 finish を使います。主節には will call を使えます。",hint:"as soon as の中は現在形です。"},
 {type:"kumi",lv:"標準",q:"接続詞と、文の中での働きを対応させよう。",pairs:[
    {l:"when", r:"時を表す節を作る"},
    {l:"if", r:"条件を表す節を作る"},
    {l:"until", r:"〜するまでを表す節を作る"}
  ],exp:"when / if / until などの節では、未来の内容でも現在形を使うことがあります。"}
  ],
  cards: []
});

HQ.registerUnit({
  id: "e2s8",
  subject: "🇬🇧 総合英語 Harmony",
  group: "時制",
  title: "現在形や現在進行形で予定を表す",
  desc: "確定した予定・個人の近い予定を表す",
  order: 31,
  questions: [
 {type:"yon",lv:"基礎",q:"時刻表や予定表のような確定した予定を表す文として自然なものはどれか。",choices:["The train leaves at six tomorrow.","The train is leaving at six every day yesterday.","The train left at six tomorrow.","The train used to leave at six tomorrow."],a:0,time:30,exp:"交通機関の時刻表など、決まっている予定は現在形で未来を表せます。tomorrow があっても leaves を使えます。",hint:"時刻表は現在形で表せます。"},
 {type:"ana",lv:"基礎",q:"英文 I（　）my friend after school today. は、個人の近い予定を表す文として自然である。",choices:["meet","am meeting","met","used to meet"],a:1,time:30,exp:"近い個人的な予定は現在進行形で表せます。I am meeting my friend after school today. が自然です。",hint:"予定がもう決まっている感じを出す現在進行形です。"},
 {type:"maru",lv:"基礎",q:"現在進行形は、今していることだけでなく、近い予定を表すことがある。",a:true,exp:"正しいです。I am visiting my aunt this weekend. のように、予定が決まっている未来にも使えます。",hint:"this weekend など未来の語と一緒に使うことがあります。"},
 {type:"yon",lv:"基礎",q:"「映画は午後7時に始まります。」という予定表の内容を表す文として正しいものはどれか。",choices:["The movie starts at 7 p.m.","The movie start at 7 p.m.","The movie is start at 7 p.m.","The movie used to start at 7 p.m."],a:0,time:30,exp:"映画の上映予定のような決まった予定は現在形で表せます。主語 The movie は三人称単数なので starts です。",hint:"The movie に合う現在形を選ぼう。"},
 {type:"yon",lv:"標準",q:"次のうち「すでに決まっている近い予定」を現在進行形で表している文はどれか。",choices:["I usually eat breakfast at seven.","I am having dinner with Emi tonight.","I had dinner with Emi last night.","I used to have dinner early."],a:1,time:30,exp:"tonight という未来の予定を、am having という現在進行形で表しています。すでに約束している感じが出ます。",hint:"未来を表す語と am/is/are + ing の組み合わせを探そう。"},
 {type:"yon",lv:"基礎",q:"バスの時刻表について「バスは8時に出ます。」と言う文として自然なものはどれか。",choices:["The bus leaves at eight.","The bus is leave at eight.","The bus leaving at eight.","The bus left at eight tomorrow."],a:0,time:30,exp:"時刻表のような決まった予定は現在形で表せます。主語 The bus は三人称単数なので leaves です。",hint:"時刻表は現在形で表せます。"},
 {type:"ana",lv:"基礎",q:"英文 We（　）for Okinawa next Monday. は、すでに決まっている予定として自然である。",choices:["leave","are leaving","left","used to leave"],a:1,time:30,exp:"すでに決まっている近い予定は現在進行形で表せます。We are leaving for Okinawa next Monday. が自然です。",hint:"予定を表す are + ing です。"},
 {type:"maru",lv:"基礎",q:"The ceremony begins at ten tomorrow. は、決まった予定を現在形で表している。",a:true,exp:"正しいです。式典などの予定表にある内容は、tomorrow があっても現在形 begins で表せます。",hint:"予定表の内容を表しています。"},
 {type:"yon",lv:"標準",q:"次のうち、予定表・時刻表の未来を現在形で表している文はどれか。",choices:["The museum opens at nine tomorrow.","I am opening my bag now.","The museum opened yesterday.","I used to open the shop."],a:0,time:30,exp:"The museum opens at nine tomorrow. は、開館予定という決まった予定を現在形で表しています。",hint:"施設の予定として決まっている内容です。"},
 {type:"kumi",lv:"標準",q:"未来を表す現在形・現在進行形の使い方を対応させよう。",pairs:[
    {l:"The train arrives at noon.", r:"時刻表・予定表の内容"},
    {l:"I am seeing my dentist tomorrow.", r:"個人的に決まっている予定"},
    {l:"The class starts at nine.", r:"決まった開始時刻"}
  ],exp:"現在形は時刻表や予定表、現在進行形は個人的にすでに決まっている近い予定を表すときによく使われます。"}
  ],
  cards: []
});
export const units = HQ.units;
export const cards = HQ.cards;
