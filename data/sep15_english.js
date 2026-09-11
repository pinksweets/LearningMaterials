import { createRegistry } from "./_registry.js";
const HQ = createRegistry();

// 添付写真 p.48〜53・No.123〜142。例文はこの教材向けのオリジナル。
const entries = [
  [123,'turn on','ターン オン','電気などをつける','Please turn on the light in the hall.','廊下の明かりを（　）ください。','つけて',['付けて','点けて'],'turn on は電気や機器をつけること。反対は turn off だよ。'],
  [124,'clean','クリーン','～をきれいにする・きれいな','We clean our classroom every day.','私たちは毎日、教室を（　）。','きれいにする',['綺麗にする','掃除する','そうじする','きれいにします'],'clean は動詞なら「きれいにする」、形容詞なら「きれいな」。'],
  [125,'brush','ブラッシュ','～を磨く','I brush my teeth before bed.','私は寝る前に歯を（　）。','磨く',['みがく','磨きます','みがきます'],'brush はブラシなどで磨くこと。brush my teeth で「歯を磨く」。'],
  [126,'put ～ away','プット アウェイ','～を片付ける','Please put away your books.','本を（　）ください。','片付けて',['片づけて','かたづけて'],'put away は使ったものをしまうこと。代名詞なら put them away の順だよ。'],
  [127,'throw ～ away','スロウ アウェイ','～を捨てる','Do not throw away this letter.','この手紙を（　）でください。','捨てない',['すてない'],'throw away は「捨てる」。Do not があるので、ここでは否定で答えよう。'],
  [128,'clothes','クロウズ','衣服','His clothes are wet.','彼の（　）はぬれています。','服',['衣服','ふく','いふく'],'clothes は衣服全般を表し、複数扱い。cloth「布」と区別しよう。'],
  [129,'wear','ウェア','～を身につけている','She is wearing a blue scarf.','彼女は青いスカーフを（　）。','身につけている',['身に着けている','みにつけている','着けている','つけている','巻いている'],'wear は身につけている状態。衣服だけでなく眼鏡などにも使えるよ。'],
  [130,'put ～ on','プット オン','～を身につける','Please put on your coat.','コートを（　）ください。','着て',['きて','身につけて','身に着けて'],'put on は着る動作。wear は着ている状態だよ。'],
  [131,'take ～ off','テイク オフ','～を脱ぐ','Please take off your shoes here.','ここで靴を（　）ください。','脱いで',['ぬいで'],'take off は衣服などを脱ぐこと。put on と対で覚えよう。'],
  [132,'get dressed','ゲット ドレスト','服を着る','I get dressed before breakfast.','私は朝食の前に（　）。','服を着る',['ふくをきる','着替える','きがえる','服を着ます'],'get dressed は服を着る動作。後ろに服の名前を直接置かないよ。'],
  [133,'put','プット','～を置く・入れる','Put the keys in this box.','この箱に鍵を（　）ください。','入れて',['いれて'],'put は置く場所と一緒に使うよ。in this box なので「箱に入れる」。'],
  [134,'set','セット','～を置く','Please set the cups on the tray.','トレーにカップを（　）ください。','置いて',['おいて','並べて','ならべて'],'set は、ものをきちんと置くこと。過去形も過去分詞も set。'],
  [135,'close','クロウズ／クロウス','～を閉める・近い','Please close the window quietly.','静かに窓を（　）ください。','閉めて',['しめて','閉じて','とじて'],'動詞 close は「閉める」。形容詞 close は「近い」で、発音も違うよ。'],
  [136,'hit','ヒット','～を打つ・ぶつける','I hit my knee on the desk.','私は机に膝を（　）。','ぶつけた',['ぶつけました'],'hit A on B は「AをBにぶつける」。hit は過去形も hit。'],
  [137,'turn ～ over','ターン オウヴァー','～をひっくり返す・めくる','Please turn over the card.','カードを（　）ください。','ひっくり返して',['ひっくりかえして','裏返して','うらがえして','めくって'],'turn over は裏側が見えるようにすること。ページをめくるときにも使うよ。'],
  [138,'build','ビルド','～を建てる・築く','They built a small library.','彼らは小さな図書館を（　）。','建てた',['たてた','建てました'],'build の過去形・過去分詞は built。建物や仕組みを作るときに使うよ。'],
  [139,'be made of ～','ビー メイド オヴ','～で作られている','This chair is made of wood.','この椅子は木で（　）。','作られている',['つくられている','できている','出来ている'],'be made of は、見て素材がわかるものに使うよ。'],
  [140,'put ～ together','プット トゥゲザー','～を組み立てる・まとめる','We put a shelf together yesterday.','私たちは昨日、棚を（　）。','組み立てた',['くみたてた','組みたてた'],'put together は部品を組み立てたり、考えをまとめたりすること。'],
  [141,'want to do','ウォント トゥ ドゥー','～したい','I want to visit Kyoto.','私は京都を（　）。','訪れたい',['おとずれたい','訪問したい'],'want to の後ろは動詞の原形。visit は「訪れる」。'],
  [142,'would like to do','ウッド ライク トゥ ドゥー','～したいのですが','I would like to ask a question.','質問を（　）。','したいのですが',['したいのです','したいです','したいと思います'],'would like to は want to より丁寧に希望を伝える表現だよ。']
];
const extras = [
  ['turn off','Please turn off the radio.','ラジオを（　）ください。','消して',['けして'],'turn on「つける」の反対だよ。'],
  ['clean','I need a clean towel.','私は（　）タオルが必要です。','きれいな',['綺麗な','清潔な','せいけつな'],'名詞の前の clean は形容詞「きれいな」。'],
  ['brush up on','I will brush up on my English.','私は英語を（　）つもりです。','磨き直す',['磨きなおす','みがきなおす','学び直す','復習する'],'brush up on は知識などを磨き直すこと。'],
  ['put away','She puts some money away every month.','彼女は毎月少し（　）。','貯金する',['ちょきんする','お金を貯める','貯金します'],'put money away は「お金を取っておく・貯金する」。'],
  ['throw away','Do not throw away your chance.','チャンスを（　）でください。','無駄にしない',['むだにしない','捨てない','すてない'],'throw away は機会など抽象的なものにも使えるよ。'],
  ['cloth','This cloth is soft.','この（　）は柔らかいです。','布',['ぬの'],'cloth は布。衣服は clothes だよ。'],
  ['wear','My brother wears glasses.','兄は眼鏡を（　）。','かけている',['掛けている','かけています'],'wear は眼鏡などを身につけている状態にも使うよ。'],
  ['try on','May I try on this sweater?','このセーターを（　）もいいですか。','試着して',['しちゃくして','着てみて'],'try on は「試着する」。'],
  ['take off','The plane took off at noon.','飛行機は正午に（　）。','離陸した',['りりくした','離陸しました'],'take off は飛行機が離陸するときにも使うよ。'],
  ['be dressed','He is dressed in black.','彼は黒い服を（　）。','着ている',['きている','着ています'],'be dressed は服を着ている状態。get dressed は着る動作だよ。'],
  ['put','Let me put it simply.','それを簡単に（　）ください。','言わせて',['いわせて','説明させて'],'put は言葉で表現する意味にもなるよ。'],
  ['set aside','We set aside money for a new bike.','私たちは新しい自転車のためにお金を（　）。','取っておく',['とっておく','貯めておく','ためておく'],'set aside は後のために取っておくこと。'],
  ['close to','Our school is close to the park.','私たちの学校は公園に（　）。','近い',['ちかい','近いです'],'close to は「～に近い」。動詞「閉める」と区別しよう。'],
  ['hit','She hit the ball with a racket.','彼女はラケットでボールを（　）。','打った',['うった','打ちました'],'hit A with B は「BでAを打つ」。'],
  ['turn over','He turned over the pages slowly.','彼はゆっくりページを（　）。','めくった',['捲った','めくりました'],'turn over はページをめくる意味にもなるよ。'],
  ['build','We want to build a new system.','私たちは新しい仕組みを（　）。','作りたい',['つくりたい','構築したい','築きたい'],'build は建物だけでなく仕組みなどにも使えるよ。'],
  ['be made from','This paper is made from wood.','この紙は木を原料に（　）。','作られている',['つくられている','できている'],'原料の姿が変わっている場合は made from を使うよ。'],
  ['take apart','He took the clock apart.','彼は時計を（　）。','分解した',['ぶんかいした'],'take apart は put together「組み立てる」の反対。'],
  ["That's a good question.","That's a good question.",'質問を受けて「（　）」。','良い質問ですね',['よい質問ですね','いい質問ですね','いい質問です','良い質問です'],'相手の質問を受け止め、考える時間が欲しいときにも使うよ。'],
  ['What a good idea!','What a good idea!','提案に賛成して「（　）！」','なんて良い考えなんだ',['なんていい考えなんだ','いい考えだね','良い考えですね','なんてすばらしい考えだ'],'良い提案への感嘆を表すフレーズだよ。']
];
function question(e, mode){
  const [no,word,reading,meaning,en,ja,answer,aliases,note]=e;
  const choices=mode==='choice'?[meaning,...entries.filter(x=>x[0]!==no).map(x=>x[3]).filter(x=>x!==meaning).slice(0,3)]:[answer];
  return {type:mode==='choice'?'yon':'ana',lv:mode==='choice'?'基礎':'本番形式',q:mode==='choice'?`<span lang="en">${word}</span><br>日本語の意味を選ぼう。`:`<span lang="en">${en}</span><br>${ja}`,choices,a:0,accept:aliases,forceInput:mode!=='choice',examPractice:true,speech:mode==='choice'?word:en,reading:mode==='choice'?reading:'',learn:{no,word,reading,meaning},exp:`${word}：${meaning}。${note}`,hint:mode==='choice'?'先に声に出してから、意味を思い出してみよう。':note};
}
function unit(id,group,title,questions){
  HQ.registerUnit({id,subject:'📅 9/15 英語小テスト対策',group,title,desc:'英語｜p.48〜53・No.123〜142',page:'48〜53',order:10100+HQ.units.length,questions,cards:[]});
}
for(let i=0;i<4;i++)unit(`sep15EnChoose${i+1}`,'英語① 意味を選ぶ（5問ずつ）',`意味チェック ${i+1}｜No.${123+i*5}〜${127+i*5}`,entries.slice(i*5,i*5+5).map(e=>question(e,'choice')));
for(let i=0;i<4;i++)unit(`sep15EnWrite${i+1}`,'英語② 日本語の空欄を埋める（5問ずつ）',`空欄練習 ${i+1}｜No.${123+i*5}〜${127+i*5}`,entries.slice(i*5,i*5+5).map(e=>question(e,'write')));
for(let i=0;i<2;i++)unit(`sep15EnMock${i+1}`,'英語③ 10問で仕上げる',`本番形式 ${i?'B':'A'}｜日本語で答える`,entries.filter((_,n)=>n%2===i).map(e=>({...question(e,'write'),hint:''})));
for(let i=0;i<4;i++)unit(`sep15EnExtra${i+1}`,'英語④ 余裕があれば（別の意味・関連表現）',`発展 ${i+1}｜意味の使い分け`,extras.slice(i*5,i*5+5).map(([word,en,ja,answer,accept,note])=>({type:'ana',lv:'発展',q:`<span lang="en">${en}</span><br>${ja}`,choices:[answer],a:0,accept,forceInput:true,examPractice:true,speech:en,exp:`${word}：${note}`,hint:note})));

export const units = HQ.units;
export const cards = HQ.cards;
