/* ============================================================
   総合英語 Harmony：英語の語順（文型）
   小カテゴリ5つ・各10問・計50問
   type: yon(4択) / ana(穴埋め) / maru(○×) / kumi(組み合わせ)
============================================================ */

HQ.registerUnit({
  id: "e1s1",
  subject: "🇬🇧 総合英語 Harmony",
  group: "英語の語順（文型）",
  title: "主語＋動詞（SV）",
  desc: "主語と動詞だけで文の中心を作る",
  order: 19,
  questions: [
 {type:"yon",lv:"基礎",q:"次の英文の文型はどれか。Birds fly.",choices:["SV","SVO","SVC","SVOO"],a:0,time:30,exp:"Birds が主語、fly が動詞です。目的語や補語はないので SV の文です。短い文でも、主語と動詞を先に見つけるのが基本です。",hint:"「何が」「どうする」だけで文が終わっています。"},
 {type:"ana",lv:"基礎",q:"英文 The baby cried. の動詞は（　）である。",choices:["The baby","cried","baby","The"],a:1,time:30,exp:"cried が動詞です。The baby が主語で、「赤ちゃんが泣いた」という SV の文です。",hint:"動作を表す語を選ぼう。"},
 {type:"yon",lv:"基礎",q:"SV の文として最も自然なものはどれか。",choices:["My sister laughed.","My sister likes music.","My sister is kind.","My sister gave me a pen."],a:0,time:30,exp:"My sister laughed. は「姉／妹が笑った」で、主語＋動詞だけの SV です。likes music は SVO、is kind は SVC、gave me a pen は SVOO です。",hint:"動詞のあとに目的語や補語が続かない文を探そう。"},
 {type:"maru",lv:"基礎",q:"英文 The sun rises. は SV の文である。",a:true,exp:"正しいです。The sun が主語、rises が動詞で、目的語や補語はありません。",hint:"The sun / rises に分けて考えよう。"},
 {type:"kumi",lv:"標準",q:"次の英文と、主語・動詞の組み合わせを対応させよう。",pairs:[
    {l:"Dogs bark.", r:"S=Dogs / V=bark"},
    {l:"The door opened.", r:"S=The door / V=opened"},
    {l:"He sleeps.", r:"S=He / V=sleeps"}
  ],exp:"SV では、まず主語Sと動詞Vを見つけます。動詞のあとに目的語や補語が続かなくても、文として成り立ちます。"},
 {type:"yon",lv:"基礎",q:"次の英文の文型はどれか。The stars shine.",choices:["SV","SVO","SVC","SVOC"],a:0,time:30,exp:"The stars が主語、shine が動詞です。動詞のあとに目的語や補語がないので SV です。",hint:"「星が輝く」で文が完結しています。"},
 {type:"ana",lv:"基礎",q:"英文 A big dog ran. の主語Sは（　）である。",choices:["A big dog","big","ran","dog ran"],a:0,time:30,exp:"A big dog が主語です。ran が動詞で、「大きな犬が走った」という SV の文です。",hint:"何が走ったのかを考えよう。"},
 {type:"maru",lv:"基礎",q:"英文 She arrived at school early. は、arrived のあとに場所や時の説明があるが、基本の文型は SV である。",a:true,exp:"正しいです。at school や early は場所・時の説明で、目的語ではありません。She arrived が文の中心なので SV です。",hint:"arrive は目的語を直接とらない動詞です。"},
 {type:"yon",lv:"標準",q:"次のうち SV の文はどれか。",choices:["He became famous.","The phone rang.","She bought a ticket.","We call her Miki."],a:1,time:30,exp:"The phone rang. は The phone が主語、rang が動詞で、目的語や補語がありません。became famous は SVC、bought a ticket は SVO、call her Miki は SVOC です。",hint:"動詞のあとに名詞や形容詞が必要ない文を探そう。"},
 {type:"kumi",lv:"標準",q:"次の英文と文型を対応させよう。",pairs:[
    {l:"The baby smiled.", r:"SV"},
    {l:"I like music.", r:"SVO"},
    {l:"She looks tired.", r:"SVC"}
  ],exp:"SV は主語と動詞だけで中心が完結します。SVO は目的語、SVC は主語を説明する補語が続きます。"}
  ],
  cards: []
});

HQ.registerUnit({
  id: "e1s2",
  subject: "🇬🇧 総合英語 Harmony",
  group: "英語の語順（文型）",
  title: "主語＋動詞＋名詞（SVO）",
  desc: "動詞のあとに目的語を置く",
  order: 20,
  questions: [
 {type:"yon",lv:"基礎",q:"次の英文の文型はどれか。I play tennis.",choices:["SV","SVO","SVC","SVOC"],a:1,time:30,exp:"I が主語、play が動詞、tennis が目的語です。「何をするか」を表す名詞が動詞のあとに来るので SVO です。",hint:"play のあとに「何を」に当たる語があります。"},
 {type:"ana",lv:"基礎",q:"英文 She reads books. の目的語Oは（　）である。",choices:["She","reads","books","reads books"],a:2,time:30,exp:"books が目的語です。She reads books. は「彼女は本を読む」で、books が「何を読むか」を表しています。",hint:"「何を読むか」を答えよう。"},
 {type:"yon",lv:"基礎",q:"SVO の語順として正しいものはどれか。",choices:["English studies he.","He studies English.","Studies he English.","He English studies."],a:1,time:30,exp:"英語の基本語順は、主語 He → 動詞 studies → 目的語 English です。日本語の語順に引きずられないようにしましょう。",hint:"主語のあとに動詞、そのあとに「何を」。"},
 {type:"maru",lv:"基礎",q:"英文 We visited Kyoto. の Kyoto は目的語である。",a:true,exp:"正しいです。visited のあとに「どこを訪れたか」を表す Kyoto が続くので、SVO の O です。",hint:"visited のあとに来る名詞の役割を考えよう。"},
 {type:"yon",lv:"標準",q:"次のうち SVO ではない文はどれか。",choices:["They made lunch.","Ken likes soccer.","The cake tastes sweet.","I opened the window."],a:2,time:30,exp:"The cake tastes sweet. は「ケーキ＝甘い」という説明になっているので SVC です。sweet は名詞ではなく補語として働く形容詞です。",hint:"SVO は動詞のあとに「何を」に当たる名詞が来ます。"},
 {type:"yon",lv:"基礎",q:"英文 Emi has a camera. の文型はどれか。",choices:["SV","SVO","SVC","SVOO"],a:1,time:30,exp:"Emi が主語、has が動詞、a camera が目的語です。「何を持っているか」を表す名詞が続くので SVO です。",hint:"has のあとに「何を」があります。"},
 {type:"ana",lv:"基礎",q:"英文 We need water. の目的語Oは（　）である。",choices:["We","need","water","need water"],a:2,time:30,exp:"water が目的語です。need のあとに「何を必要とするか」を表す名詞が続いています。",hint:"「何を必要とするか」を選ぼう。"},
 {type:"maru",lv:"基礎",q:"英文 I enjoyed the concert. の the concert は目的語である。",a:true,exp:"正しいです。enjoyed の対象が the concert なので、SVO の O です。",hint:"何を楽しんだのかを考えよう。"},
 {type:"yon",lv:"標準",q:"次の英文で SVO の O に当たる語句はどれか。Mika answered the question quickly.",choices:["Mika","answered","the question","quickly"],a:2,time:30,exp:"the question が目的語です。quickly は動作の様子を説明する副詞で、目的語ではありません。",hint:"answered の対象になっている語句です。"},
 {type:"kumi",lv:"標準",q:"次の英文と、目的語Oを対応させよう。",pairs:[
    {l:"He closed the door.", r:"O=the door"},
    {l:"I found my notebook.", r:"O=my notebook"},
    {l:"They built a bridge.", r:"O=a bridge"}
  ],exp:"SVO では、動詞のあとに「何を」に当たる目的語が置かれます。副詞や場所の説明とは区別しましょう。"}
  ],
  cards: []
});

HQ.registerUnit({
  id: "e1s3",
  subject: "🇬🇧 総合英語 Harmony",
  group: "英語の語順（文型）",
  title: "主語＋動詞＋名詞＋名詞（SVOO）",
  desc: "人に物を与える形を読む",
  order: 21,
  questions: [
 {type:"yon",lv:"基礎",q:"次の英文の文型はどれか。My aunt sent me a card.",choices:["SVO","SVC","SVOO","SVOC"],a:2,time:30,exp:"My aunt が主語、sent が動詞、me と a card が2つの目的語です。「私に」「カードを」と名詞が2つ続くので SVOO です。",hint:"動詞のあとに名詞が2つ並んでいます。"},
 {type:"ana",lv:"基礎",q:"英文 He gave his sister a present. で「だれに」に当たる語句は（　）である。",choices:["He","gave","his sister","a present"],a:2,time:30,exp:"his sister が「だれに」に当たる目的語です。a present は「何を」に当たる目的語です。",hint:"gave のあとに、人→物の順で並んでいます。"},
 {type:"yon",lv:"基礎",q:"SVOO の文として正しいものはどれか。",choices:["She bought a bag.","She bought me a bag.","She is a student.","She kept the room clean."],a:1,time:30,exp:"She bought me a bag. は「彼女は私にバッグを買った」で、me と a bag の2つの目的語があります。",hint:"動詞のあとに「人」と「物」が続く文を探そう。"},
 {type:"maru",lv:"基礎",q:"英文 Tom taught us English. は SVOO の文である。",a:true,exp:"正しいです。us が「私たちに」、English が「英語を」で、teach は SVOO を作れる動詞です。",hint:"us と English の2つの目的語があります。"},
 {type:"kumi",lv:"標準",q:"次の SVOO 文で、2つの目的語の役割を対応させよう。",pairs:[
    {l:"I showed her my photos.", r:"O1=her / O2=my photos"},
    {l:"Dad made me breakfast.", r:"O1=me / O2=breakfast"},
    {l:"They asked him a question.", r:"O1=him / O2=a question"}
  ],exp:"SVOO では、多くの場合「人に」当たる目的語が先、「物・内容を」当たる目的語が後に来ます。"},
 {type:"yon",lv:"基礎",q:"英文 She gave me some advice. の文型はどれか。",choices:["SVO","SVC","SVOO","SVOC"],a:2,time:30,exp:"She が主語、gave が動詞、me と some advice が目的語です。「私に」「助言を」と2つの目的語が続くので SVOO です。",hint:"gave のあとに名詞が2つ続いています。"},
 {type:"ana",lv:"基礎",q:"英文 My uncle bought us lunch. で「何を」に当たる目的語は（　）である。",choices:["My uncle","us","lunch","bought"],a:2,time:30,exp:"lunch が「何を」に当たる目的語です。us は「だれに」に当たる目的語です。",hint:"人に当たる語と物に当たる語を分けよう。"},
 {type:"maru",lv:"基礎",q:"英文 The teacher told us a story. は SVOO の文である。",a:true,exp:"正しいです。us が「私たちに」、a story が「話を」で、目的語が2つあります。",hint:"told のあとに人と内容が続きます。"},
 {type:"yon",lv:"標準",q:"次のうち SVOO の文はどれか。",choices:["I sent a letter yesterday.","I sent my friend a letter.","I was happy.","I kept the letter safe."],a:1,time:30,exp:"I sent my friend a letter. は my friend と a letter の2つの目的語があります。sent a letter yesterday は SVO です。",hint:"人＋物の目的語が2つ並ぶ文を探そう。"},
 {type:"yon",lv:"標準",q:"SVOO の文 Dad cooked me dinner. を、ほぼ同じ意味の SVO に近い形へ書き換えたものはどれか。",choices:["Dad cooked dinner for me.","Dad cooked me for dinner.","Dad was dinner for me.","Dad cooked dinner me."],a:0,time:30,exp:"cook や buy などでは「人に」の意味を for + 人 で後ろに置けます。Dad cooked dinner for me. が自然です。",hint:"「私のために夕食を作った」と考えよう。"}
  ],
  cards: []
});

HQ.registerUnit({
  id: "e1s4",
  subject: "🇬🇧 総合英語 Harmony",
  group: "英語の語順（文型）",
  title: "主語＋動詞＋名詞／形容詞（SVC）",
  desc: "主語を説明する補語を見つける",
  order: 22,
  questions: [
 {type:"yon",lv:"基礎",q:"次の英文の文型はどれか。My brother is a doctor.",choices:["SV","SVO","SVC","SVOO"],a:2,time:30,exp:"My brother が主語、is が動詞、a doctor が補語です。「兄／弟＝医者」と主語を説明しているので SVC です。",hint:"S と C がイコールに近い関係です。"},
 {type:"ana",lv:"基礎",q:"英文 The soup smells good. の補語Cは（　）である。",choices:["The soup","smells","good","soup"],a:2,time:30,exp:"good が補語です。The soup＝good という説明になっていて、smells のあとで主語の状態を表しています。",hint:"主語の様子を説明する語を選ぼう。"},
 {type:"yon",lv:"基礎",q:"SVC の文として正しいものはどれか。",choices:["I know the answer.","The sky became dark.","She gave him advice.","They opened the door."],a:1,time:30,exp:"The sky became dark. は「空が暗くなった」で、dark が主語 The sky の状態を表す補語です。",hint:"主語がどんな状態かを説明する文を探そう。"},
 {type:"maru",lv:"基礎",q:"英文 This flower is beautiful. の beautiful は目的語である。",a:false,exp:"誤りです。beautiful は「この花が美しい」と主語を説明する補語です。目的語ではありません。",hint:"beautiful は名詞ではなく形容詞です。"},
 {type:"yon",lv:"標準",q:"次のうち SVC ではなく SVO の文はどれか。",choices:["She looks happy.","He became a teacher.","I found my key.","The story sounds strange."],a:2,time:30,exp:"I found my key. は「私は鍵を見つけた」で、my key は目的語です。主語 I を説明しているわけではないので SVO です。",hint:"「主語＝後ろの語」になるかを試そう。"},
 {type:"yon",lv:"基礎",q:"英文 The water is cold. の文型はどれか。",choices:["SV","SVO","SVC","SVOO"],a:2,time:30,exp:"The water が主語、is が動詞、cold が補語です。cold は水の状態を説明しています。",hint:"The water＝cold と考えられます。"},
 {type:"ana",lv:"基礎",q:"英文 Ken became a doctor. の補語Cは（　）である。",choices:["Ken","became","a doctor","doctor became"],a:2,time:30,exp:"a doctor が補語です。Ken がどのような人になったかを説明しています。",hint:"Ken＝a doctor の関係です。"},
 {type:"maru",lv:"基礎",q:"英文 The music sounds beautiful. の beautiful は主語 The music を説明する補語である。",a:true,exp:"正しいです。sounds のあとで beautiful が主語の様子を説明しているので SVC です。",hint:"音楽がどんなふうに聞こえるかを表しています。"},
 {type:"yon",lv:"標準",q:"次のうち SVC の文はどれか。",choices:["They watched the game.","The game was exciting.","She gave me a ticket.","We painted the wall white."],a:1,time:30,exp:"The game was exciting. は The game＝exciting の関係で、SVC です。painted the wall white は SVOC です。",hint:"主語を説明する形容詞・名詞が続く文を探そう。"},
 {type:"kumi",lv:"標準",q:"次の英文と補語Cを対応させよう。",pairs:[
    {l:"The leaves turned red.", r:"C=red"},
    {l:"He is a singer.", r:"C=a singer"},
    {l:"This plan seems useful.", r:"C=useful"}
  ],exp:"SVC の補語は、主語の状態・身分・様子を説明します。S=C の関係が作れるかを確認しましょう。"}
  ],
  cards: []
});

HQ.registerUnit({
  id: "e1s5",
  subject: "🇬🇧 総合英語 Harmony",
  group: "英語の語順（文型）",
  title: "主語＋動詞＋名詞＋名詞／形容詞（SVOC）",
  desc: "目的語を説明する補語を読む",
  order: 23,
  questions: [
 {type:"yon",lv:"基礎",q:"次の英文の文型はどれか。We call him Ken.",choices:["SVO","SVC","SVOO","SVOC"],a:3,time:30,exp:"We が主語、call が動詞、him が目的語、Ken が目的語 him を説明する補語です。「him＝Ken」なので SVOC です。",hint:"O と C がイコールに近い関係です。"},
 {type:"ana",lv:"基礎",q:"英文 The news made us happy. の補語Cは（　）である。",choices:["The news","made","us","happy"],a:3,time:30,exp:"happy が補語です。us が目的語で、happy が「私たちがどんな状態になったか」を説明しています。",hint:"目的語 us の状態を表す語を選ぼう。"},
 {type:"yon",lv:"基礎",q:"SVOC の文として正しいものはどれか。",choices:["She keeps her room clean.","She cleans her room.","She is clean.","She gave me a room."],a:0,time:30,exp:"She keeps her room clean. は、her room が目的語、clean がその状態を説明する補語です。her room＝clean の関係が見えます。",hint:"目的語のあとに、その目的語を説明する語が続きます。"},
 {type:"maru",lv:"基礎",q:"英文 They named the dog Pochi. では the dog と Pochi は同じものを指している。",a:true,exp:"正しいです。the dog が目的語、Pochi が補語で、「その犬＝ポチ」と説明しています。",hint:"name は SVOC を作りやすい動詞です。"},
 {type:"yon",lv:"標準",q:"次のうち SVOC ではなく SVOO の文はどれか。",choices:["We elected her captain.","I found the book easy.","My mother made me dinner.","The music made him calm."],a:2,time:30,exp:"My mother made me dinner. は「母は私に夕食を作った」で、me と dinner の2つの目的語をとる SVOO です。me＝dinner ではありません。",hint:"OとCがイコールになるか、人＋物の目的語2つかを比べよう。"},
 {type:"yon",lv:"基礎",q:"英文 We painted the wall white. の文型はどれか。",choices:["SVO","SVC","SVOO","SVOC"],a:3,time:30,exp:"the wall が目的語、white がその目的語の状態を説明する補語です。the wall＝white の関係があるので SVOC です。",hint:"白くなったのは何かを考えよう。"},
 {type:"ana",lv:"基礎",q:"英文 I found the test difficult. の目的語Oは（　）である。",choices:["I","found","the test","difficult"],a:2,time:30,exp:"the test が目的語です。difficult は the test を説明する補語です。",hint:"難しいと判断された対象を選ぼう。"},
 {type:"maru",lv:"基礎",q:"英文 The movie made me sleepy. では sleepy が目的語 me の状態を説明している。",a:true,exp:"正しいです。me が目的語、sleepy が補語で、「私が眠くなった」という状態を表します。",hint:"眠くなったのは me です。"},
 {type:"yon",lv:"標準",q:"次のうち SVOC の O と C の関係が正しく説明されているものはどれか。",choices:["We call the cat Tama. は the cat＝Tama","We call the cat Tama. は We＝Tama","We call the cat Tama. は call＝Tama","We call the cat Tama. は cat が動詞"],a:0,time:30,exp:"SVOC では O と C がイコールに近い関係になります。この文では the cat が目的語、Tama が補語です。",hint:"Tama と呼ばれている対象を考えよう。"},
 {type:"kumi",lv:"標準",q:"次の英文と、O=C の関係を対応させよう。",pairs:[
    {l:"They made the room bright.", r:"the room=bright"},
    {l:"We named our team Stars.", r:"our team=Stars"},
    {l:"I left the door open.", r:"the door=open"}
  ],exp:"SVOC では、目的語の状態や名前を補語が説明します。目的語と補語の関係を読むことが大切です。"}
  ],
  cards: []
});
