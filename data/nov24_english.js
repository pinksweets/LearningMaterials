import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 出典：提供写真3枚、p.84〜89のNo.245〜265（21項目）。
// 写真で確認できる意味・語法をもとにしたオリジナルの英→日問題。
// 学校の細かな出題形式は未確認。英語のつづり・穴埋めは出題しない。
const vocabulary = [
  [245,'quiet','静かな・物静かな','quietは音が少なく「静かな」、人なら「物静かな」。keep quietで「静かにしている」だよ。'],
  [246,'safe','安全な','safeは「安全な」。come home safeなら「無事に帰宅する」。safetyは「安全」という名詞だよ。'],
  [247,'true','真実である・当てはまる','trueは「真実である」。The same is true for〜は「同じことが〜にも当てはまる」だよ。'],
  [248,'wrong','間違っている・具合がおかしい','考えがwrongなら「間違っている」。Something is wrong with〜は「〜の具合がおかしい」。go wrongは「うまくいかない」だよ。'],
  [249,'different','異なる・さまざまな','different from〜は「〜と異なる」。複数の場所などを表すときには「さまざまな」という意味もあるよ。'],
  [250,'be covered with〜','〜で覆われている','be covered with＋名詞は「〜で覆われている」。何で覆われているかをwithの後ろで確かめよう。'],
  [251,'be full of〜','〜でいっぱいだ','be full of＋名詞は「〜でいっぱいだ」。be filled withも近い意味になるよ。'],
  [252,'important','重要な','importantは「重要な・大切な」。an important gameは「重要な試合」だよ。'],
  [253,'necessary','必要な','necessaryは「必要な」。be necessary for〜で「〜に必要だ」、if necessaryで「必要ならば」だよ。'],
  [254,'large','大きい・数や量が多い','largeは大きさや数量を表すよ。a large familyは「人数の多い家族」、a large populationは「多い人口」だよ。'],
  [255,'small','小さい','smallは「小さい」。a small countryなら「面積の小さい国」。littleには気持ちを込めた「小さい」の用法もあるよ。'],
  [256,'tall','背が高い・身長が〜ある','tallは人・木・建物などの背の高さを表すよ。170 cm tallは「身長170センチ」。高い位置を表すhighと区別しよう。'],
  [257,'short','短い・背が低い','shortは「短い」、人なら「背が低い」。be short of〜は「〜が不足している」だよ。'],
  [258,'only','ただ〜にすぎない・唯一の','onlyは「ただ〜にすぎない」、the onlyなら「唯一の」。only a childは「ただの子ども」、an only childは「一人っ子」だよ。'],
  [259,'even','〜でさえも・さらに','evenは意外さを込めた「〜でさえも」。比較級の前では「さらに」を表すよ。'],
  [260,'each','それぞれ・各々の','eachは一人ひとり・一つひとつに注目する言葉。each studentなら「生徒一人ひとり」だよ。'],
  [261,'other','ほかの・ほかの人や物','otherは「ほかの」。othersは「ほかの人や物」、the otherは2つのうちの「もう一方」を表すよ。'],
  [262,'another','もう1つ・別の1つ','anotherは「もう1つ・別の1つ」。another languageなら「別の言語」、one after anotherなら「次々と」だよ。'],
  [263,'each other','お互い','each otherは「お互い」。2人だけでなく、3人以上が互いに何かをする場合にも使えるよ。'],
  [264,'either A or B','AかBのどちらか','either A or Bは「AかBのどちらか」。否定文の文末に置くeitherは「〜もまた…ない」という意味だよ。'],
  [265,'neither A nor B','AもBも〜ない','neither A nor Bは「AもBも〜ない」。not bothの「両方とも〜というわけではない」と区別しよう。']
];

function choice(q,answer,others,exp,sourceNo,lv='基礎'){
  return {type:'yon',lv,q,choices:[answer,...others],a:0,examPractice:true,exp,sourceNo};
}
function stage(n,title,desc,questions,group){
  HQ.registerUnit({id:`nov24e${n}`,subject:'📅 11/24 英語小テスト対策',group,title,desc,order:10900+n,questions,cards:[]});
}

const spreads = [
  {page:'84〜85',start:0,end:7},
  {page:'86〜87',start:7,end:14},
  {page:'88〜89',start:14,end:21}
];
spreads.forEach(({page,start,end},index)=>{
  const rows=vocabulary.slice(start,end);
  stage(index+1,`意味｜p.${page}・No.${rows[0][0]}〜${rows.at(-1)[0]}`,
    '英語を見て、日本語の意味を7問で確かめよう。選ぶ前に自分でも意味を思い出してね。',
    rows.map(([no,en,ja,exp],i)=>choice(`No.${no}「${en}」の意味として最も適切なものは？`,ja,
      [5,10,15].map(offset=>vocabulary[(start+i+offset)%vocabulary.length][2]),exp,no)),
    '① 英語→日本語｜単語・熟語21問');
});

// 各項目につき2問。選択肢は日本語のみで、文全体の意味を確認する。
const sentences = [
  [245,'This engine is quiet.','このエンジンは静かだ。',['このエンジンは危険だ。','このエンジンは大きい。','このエンジンは新しい。'],'quietは音が小さく「静かな」。エンジンの音について述べているよ。'],
  [245,'My brother is a quiet person.','私の兄は物静かな人だ。',['私の兄は背が低い人だ。','私の兄は忙しい人だ。','私の兄は騒がしい人だ。'],'人についてのquietは「物静かな」。恥ずかしがりとは限らないよ。'],
  [246,'This is a safe place to play.','ここは遊ぶのに安全な場所だ。',['ここは遊ぶのに危険な場所だ。','ここは遊んではいけない場所だ。','ここは遊ぶのにうるさい場所だ。'],'safe placeは「安全な場所」。to playが「遊ぶための」と場所を説明しているよ。'],
  [246,'They came home safe.','彼らは無事に帰宅した。',['彼らは金庫を家に運んだ。','彼らは家に帰らなかった。','彼らは家で道に迷った。'],'come home safeは「無事に帰宅する」。このsafeは人の無事な状態を表しているよ。'],
  [247,'The story is true.','その話は本当だ。',['その話は間違っている。','その話は長い。','その話は必要ない。'],'trueは「真実である」。その話が事実だと言っているよ。'],
  [247,'The same is true for our school.','同じことが私たちの学校にも当てはまる。',['私たちの学校だけが正しい。','私たちの学校には当てはまらない。','私たちの学校は同じ名前だ。'],'The same is true for〜は「同じことが〜にも当てはまる」。学校の正しさを評価する文ではないよ。'],
  [248,'You are wrong about the date.','あなたは日付について間違っている。',['あなたは日付を正しく覚えている。','あなたはその日が嫌いだ。','あなたはその日に具合が悪くなる。'],'wrong about〜は「〜について間違っている」。ここではdateについての考えが違うという意味だよ。'],
  [248,'Something is wrong with my phone.','私の電話はどこか調子がおかしい。',['私の電話には何の問題もない。','私の電話には間違い電話がかかってきた。','私は電話をなくしてしまった。'],'Something is wrong with〜は「〜のどこかがおかしい」。故障などで調子が悪いことを表すよ。'],
  [249,'My answer is different from yours.','私の答えはあなたの答えと異なる。',['私の答えはあなたの答えと同じだ。','私の答えはあなたの答えより短い。','私の答えは必ず正しい。'],'different from〜は「〜と異なる」。yoursはここではyour answerを表しているよ。'],
  [249,'People came from different parts of the world.','人々は世界のさまざまな地域から来た。',['人々は世界の同じ地域から来た。','人々は世界の一つの国だけから来た。','人々は世界のどこからも来なかった。'],'different partsは「さまざまな地域」。異なる複数の地域から来たことを表すよ。'],
  [250,'The road is covered with leaves.','その道は葉で覆われている。',['その道には葉が一枚もない。','その道は葉から作られている。','その道の下に葉が埋まっている。'],'be covered with leavesは「葉で覆われている」。withの後ろが覆っているものだよ。'],
  [250,'The roof was covered with snow.','その屋根は雪で覆われていた。',['その屋根は雪でいっぱいの箱だった。','その屋根は雪から作られていた。','その屋根の雪はすべて取り除かれていた。'],'covered with snowは「雪で覆われた」。雪を材料にしたという意味ではないよ。'],
  [251,'The bus was full of people.','そのバスは人でいっぱいだった。',['そのバスには人がいなかった。','そのバスには人が一人だけいた。','そのバスは人を乗せられなかった。'],'be full of peopleは「人でいっぱいだ」。full ofで一つの表現として覚えよう。'],
  [251,'The children were full of excitement.','子どもたちはわくわくする気持ちでいっぱいだった。',['子どもたちは退屈していた。','子どもたちは食事でおなかがいっぱいだった。','子どもたちは静かに眠っていた。'],'full ofは気持ちにも使えるよ。excitementは「興奮・わくわくする気持ち」で、満腹とは違うよ。'],
  [252,'Tomorrow is an important day for me.','明日は私にとって大切な日だ。',['明日は私にとって必要のない日だ。','明日は私にとって退屈な日だ。','明日は私にとって短い日だ。'],'importantは「重要な・大切な」。for meは「私にとって」だよ。'],
  [252,'It is important to get enough sleep.','十分な睡眠をとることは大切だ。',['十分な睡眠をとることは危険だ。','十分な睡眠をとることは不可能だ。','十分な睡眠をとることは無意味だ。'],'It is important to〜は「〜することは大切だ」。enough sleepは「十分な睡眠」だよ。'],
  [253,'Water is necessary for life.','水は生命に必要だ。',['水は生命に有害だ。','水は生命には不要だ。','水は生命と無関係だ。'],'be necessary for〜は「〜に必要だ」。necessaryは「必要な」という意味だよ。'],
  [253,'Please call me if necessary.','必要ならば私に電話してください。',['必ず毎日私に電話してください。','必要でも私には電話しないでください。','電話の前に必ず私に会ってください。'],'if necessaryは「必要ならば」。いつでも必ず電話する、という指示ではないよ。'],
  [254,'Mika has a large family.','ミカの家族は人数が多い。',['ミカの家族は全員体が大きい。','ミカの家族は全員背が高い。','ミカの家族は人数が少ない。'],'a large familyは「人数の多い家族」。家族一人ひとりの体の大きさではないよ。'],
  [254,'This city has a large population.','この都市は人口が多い。',['この都市の住民は全員体が大きい。','この都市は人口が少ない。','この都市には住民がいない。'],'a large populationは「多い人口」。largeは数や量の大きさも表すよ。'],
  [255,'It is a small country.','それは面積の小さい国だ。',['それは面積の大きい国だ。','それは人口のない国だ。','それは新しくできた国だ。'],'small countryは国の大きさが小さいということ。smallだけで人口がないとは言えないよ。'],
  [255,'A small dog is sleeping by the door.','小さな犬がドアのそばで眠っている。',['大きな犬がドアのそばで眠っている。','小さな犬がドアのそばで走っている。','小さな猫がドアのそばで眠っている。'],'small dogは「小さな犬」。by the doorは「ドアのそばで」だよ。'],
  [256,'That tree is very tall.','あの木はとても背が高い。',['あの木はとても低い。','あの木はとても若い。','あの木はとても太い。'],'木の地面から上への背の高さにはtallを使えるよ。太さを表しているのではないよ。'],
  [256,'Ken is 175 cm tall.','ケンの身長は175センチだ。',['ケンは高さ175センチの場所にいる。','ケンは175センチ跳んだ。','ケンは175センチの距離を歩いた。'],'数値＋tallは「身長が〜ある」。位置の高さや移動距離ではないよ。'],
  [257,'This pencil is short.','この鉛筆は短い。',['この鉛筆は長い。','この鉛筆は高価だ。','この鉛筆は重い。'],'物の長さについてのshortは「短い」。人に使うと「背が低い」という意味もあるよ。'],
  [257,'We are short of time.','私たちは時間が足りない。',['私たちには時間が十分にある。','私たちの身長は低い。','私たちは短い時間だけ眠った。'],'be short of〜は「〜が不足している」。timeが足りないので、急ぐ必要がある場面だよ。'],
  [258,'He is only twelve.','彼はまだ12歳にすぎない。',['彼だけが12人いる。','彼はもうすぐ20歳になる。','彼は12歳ではない。'],'only twelveは「12歳にすぎない」。onlyが年齢の若さ・少なさを表しているよ。'],
  [258,'This is the only way to the station.','これが駅へ行く唯一の道だ。',['これは駅へ行く多くの道の一つだ。','この道から駅へは行けない。','駅へ行く道はほかにも必ずある。'],'the only wayは「唯一の道・方法」。ほかにないことを表すonlyだよ。'],
  [259,'It is cold here even in July.','ここは7月でさえ寒い。',['ここは7月だけ暖かい。','ここは7月には必ず暑い。','ここは7月には寒くない。'],'even in Julyは「7月でさえ」。夏なのに寒いという意外さを表しているよ。'],
  [259,'The second question was even more difficult.','2問目はさらに難しかった。',['2問目は少しも難しくなかった。','2問目は1問目より簡単だった。','2問目だけが同じ難しさだった。'],'比較級more difficultの前のevenは「さらに」。難しさの程度を強めているよ。'],
  [260,'Each of us has a notebook.','私たちは一人ひとりノートを持っている。',['私たちは全員で1冊のノートを共有している。','私たちの一人だけがノートを持っている。','私たちは誰もノートを持っていない。'],'Each of usは「私たち一人ひとり」。全員がそれぞれ持っていることに注目しよう。'],
  [260,'Each student has a different book.','生徒はそれぞれ異なる本を持っている。',['生徒は全員同じ本を持っている。','生徒は全員で1冊の本を共有している。','どの生徒も本を持っていない。'],'each studentは「生徒一人ひとり」。differentもあるので、それぞれの本が異なると読もう。'],
  [261,'Some students are reading, and others are drawing.','読書している生徒もいれば、絵を描いている生徒もいる。',['生徒は全員読書だけをしている。','生徒は全員絵だけを描いている。','読書している生徒は一人もいない。'],'othersは「ほかの人たち」。ここではほかの生徒たちで、other studentsをまとめた形だよ。'],
  [261,'The shop is on the other side of the street.','その店は通りの向かい側にある。',['その店は通りのこちら側にある。','その店は通りの真ん中にある。','その店は別の町にある。'],'the other sideは「もう一方の側」。通りなら「向かい側」になるよ。'],
  [262,'May I have another cup of tea?','お茶をもう1杯いただけますか。',['お茶を1杯も飲んではいけませんか。','お茶以外のものは何もありませんか。','お茶を入れるカップはもう不要ですか。'],'another cupは「もう1杯」。an＋otherのイメージで、追加の一つに注目しよう。'],
  [262,'The students entered the room one after another.','生徒たちは次々と部屋に入った。',['生徒たちは全員同時に部屋に入った。','生徒たちは誰も部屋に入らなかった。','生徒たちは部屋から次々と出ていった。'],'one after anotherは「次々と」。一人が入った後に、また別の一人が入る様子だよ。'],
  [263,'We help each other with our homework.','私たちは宿題をするとき、お互いに助け合う。',['私たちは自分の宿題だけをして助け合わない。','私たちは先生だけに宿題を手伝ってもらう。','私たちはお互いの宿題を隠す。'],'each otherは「お互い」。一方だけが助けるのではなく、互いに助け合っているよ。'],
  [263,'The three players looked at each other.','その3人の選手はお互いを見た。',['その3人の選手は全員別の方向を見た。','その3人の選手は誰もほかの選手を見なかった。','その3人の選手は観客だけを見た。'],'each otherは3人以上にも使えるよ。「お互いを見る」と読み、必ず2人だけとは考えないでね。'],
  [264,'You can choose either tea or coffee.','紅茶かコーヒーのどちらかを選べる。',['紅茶もコーヒーも選べない。','紅茶とコーヒーの両方を選ばなければならない。','紅茶しか選べない。'],'either A or Bは「AかBのどちらか」。neither A nor Bの「どちらも〜ない」と区別しよう。'],
  [264,'I do not like cats. My sister does not like them either.','私は猫が好きではなく、妹も猫が好きではない。',['私は猫が好きではないが、妹は猫が好きだ。','私は猫が好きで、妹も猫が好きだ。','私も妹も猫だけが好きだ。'],'否定文の文末のeitherは「〜もまた…ない」。themは前のcatsを指しているよ。'],
  [265,'She likes neither tea nor coffee.','彼女は紅茶もコーヒーも好きではない。',['彼女は紅茶かコーヒーのどちらかが好きだ。','彼女は紅茶もコーヒーも好きだ。','彼女は紅茶だけが好きだ。'],'neither A nor Bは「AもBも〜ない」。どちらも好きではないという全体の否定だよ。'],
  [265,'I speak neither French nor German.','私はフランス語もドイツ語も話さない。',['私はフランス語かドイツ語のどちらかを話す。','私はフランス語もドイツ語も話す。','私はフランス語だけを話す。'],'neither〜nor〜は両方を否定するよ。not bothの「両方とも〜というわけではない」とは意味が違うよ。']
];

spreads.forEach(({page,start,end},index)=>{
  const first=vocabulary[start][0],last=vocabulary[end-1][0];
  stage(index+4,`英文理解｜p.${page}・No.${first}〜${last}`,
    '短い英文を読み、日本語訳を14問で選ぼう。同じ語でも文によって意味が変わるところを確かめてね。',
    sentences.filter(([no])=>no>=first&&no<=last).map(([no,en,ja,others,exp])=>
      choice(`No.${no} 次の英文の意味として最も適切なものは？<br>${en}`,ja,others,exp,no,'標準')),
    '② 英語→日本語｜英文理解42問');
});

export const units = HQ.units;
export const cards = HQ.cards;
