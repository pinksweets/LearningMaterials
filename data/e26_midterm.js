import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 出典：提供写真の p.70/72/80/82/90/92 と、英語.zip の4枚に載る40項目のみ。
// 右ページの見切れた設問や、LEAPの未提供ページからは補完しない。
function choice(q, answer, others, exp) {
  return {type:'yon',lv:'基礎',q,choices:[answer,...others],a:0,examPractice:true,exp};
}
function input(q, answer, exp) {
  return {type:'ana',lv:'基礎',q,choices:[answer],a:0,forceInput:true,examPractice:true,exp};
}
function stage(id, group, title, desc, questions) {
  HQ.registerUnit({id,subject:'🇬🇧 中間テスト英語',group,title,desc,
    order:10400+HQ.units.length,questions,cards:[]});
}

stage('e26s1','教科書｜コンビニ','p.70 コンビニ①｜商品の配置','重要語句・店の奥に商品を置く理由｜10問・時間制限なし',[
  choice('本文の convenience stores は、どんな店？','コンビニエンスストア',['書店','病院','農場'],'convenience store はコンビニだよ。本文はコンビニの成功のかぎを説明しているね。'),
  choice('three keys to their success の意味は？','成功への3つのかぎ',['3個の店の鍵','3人の店員','3種類の飲み物'],'key は「かぎ」。ここでは成功するための重要なポイントを表すよ。'),
  choice('コンビニの成功の1つ目のかぎは？','商品の陳列',['営業時間の短さ','商品の少なさ','店の屋根の色'],'The first is the display of goods. は「1つ目は商品の陳列です」。display＝陳列、goods＝商品だよ。'),
  choice('本文では、飲み物や弁当は普通どこにある？','店の奥',['必ず入口の外','店の屋上','レジの下'],'at the back of the store は「店の奥で」。配置と表現を一緒に覚えよう。'),
  choice('飲み物などを店の奥に置くと、お客さんはどうする？','店の中を通って歩く',['店に入らず帰る','必ず店員になる','何も見ずに眠る'],'walk through the store は「店の中を通って歩く」。その途中でほかの商品が目に入るんだ。'),
  choice('along the way の意味は？','途中で',['初めて','何年もの間','自分自身で'],'along the way＝途中で。お客さんは店内を歩く途中で多くの商品を見るよ。'),
  choice('As a result, they feel like buying more. の内容は？','その結果、もっと買いたくなる',['その結果、何も買えなくなる','最初は、店を建てたくなる','最初は、すぐ眠くなる'],'as a result は「その結果」。商品の配置が、もっと買いたい気持ちにつながるよ。'),
  choice('「買いたい気がする」feel like (　) の正しい形は？','buying',['buy','bought','buys'],'feel like の後ろで動作を表すときは動詞の -ing 形。feel like buying で「買いたい気がする」だよ。'),
  input('「商品」を表す英単語を1語で書こう。the display of (　)','goods','goods＝商品。the display of goods は「商品の陳列」だよ。最後の s も忘れずに。'),
  input('「客」を表す英単語を1語で書こう。a (　)','customer','customer＝客。本文の customers は複数形だよ。ここは a があるので customer と書こう。'),
]);

stage('e26s2','教科書｜コンビニ','p.72 コンビニ②｜照明と棚','明るい照明・大きさの違う棚｜10問・時間制限なし',[
  choice('成功の2つ目のかぎは？','明るい照明',['大きな駐車場','暗い入口','店内の音楽'],'The second key is the bright lights. は「2つ目のかぎは明るい照明です」。bright＝明るい、だよ。'),
  choice('Thanks to these lights の意味は？','これらの照明のおかげで',['これらの照明の代わりに','これらの照明を消すために','これらの照明と違って'],'thanks to ～ は「～のおかげで」。照明がよい効果をもたらしているね。'),
  choice('明るい照明のおかげで、お客さんは店をどう感じる？','清潔で安全だと感じる',['危険で汚いと感じる','閉店していると感じる','商品がないと感じる'],'clean and safe＝清潔で安全。照明のよい点として本文に挙がっているよ。'),
  choice('照明が明るいと、夜でもどうなる？','店を簡単に見つけられる',['商品の数が必ず減る','店が必ず閉まる','棚がなくなる'],'They can find the stores easily, even at night. は「夜でさえ店を簡単に見つけられる」だよ。'),
  choice('成功の3つ目のかぎは？','棚',['弁当の値段','制服','駐車券'],'The third key is the shelves. は「3つ目のかぎは棚です」。shelves は shelf の複数形だよ。'),
  choice('本文の写真の棚には、どんな特徴がある？','大きさが異なる',['すべて商品が隠れている','すべて同じ大きさ','入口を完全にふさいでいる'],'the shelves are different sizes＝棚の大きさが異なる。商品を見やすくする工夫なんだ。'),
  choice('from top to bottom の意味は？','上から下まで',['朝から夜まで','右から左まで','店の外から中まで'],'from A to B＝AからBまで。top＝上、bottom＝下だよ。'),
  choice('Why don’t you find out for yourself? はどんな呼びかけ？','自分で調べてみてはどうですか',['自分で調べてはいけません','私は昨日調べました','誰も調べられません'],'Why don’t you ～? は提案の表現。find out＝調べる、for yourself＝自分で、だよ。'),
  input('「明るい」を英語1語で書こう。(　) lights','bright','bright lights＝明るい照明。本文の2つ目のかぎだよ。'),
  input('shelf（棚）の複数形を1語で書こう。','shelves','shelf の複数形は shelves。f が v に変わって -es が付くよ。'),
]);

stage('e26s3','教科書｜養蜂','p.80 養蜂①｜はちみつの収穫','初めての収穫・どら焼き・現在完了｜10問・時間制限なし',[
  choice('for the first time の意味は？','初めて',['毎日','何年もの間','最後まで'],'Today, I harvested honey for the first time. は「今日、初めてはちみつを収穫した」だよ。'),
  choice('はちみつを巣から集めるために、何を使った？','特別な道具',['スマートフォン','照明','肥料'],'We used a special tool to collect it. は「それを集めるために特別な道具を使った」。tool＝道具だよ。'),
  choice('honeycomb は何を表す？','ハチの巣（巣板）',['花粉','和菓子屋','学校祭'],'honeycomb はハチの巣の巣板だよ。本文ではここからはちみつを取り出したね。'),
  choice('採れたてのはちみつは、どのように描かれている？','輝いていて金色だった',['青くて冷たかった','黒くて固かった','白くて乾いていた'],'shiny and golden＝輝いていて金色の。見た目を表す2語を覚えよう。'),
  choice('I was fascinated by its beauty. の意味は？','私はその美しさに魅了された',['私はその道具を壊した','私はその味を忘れた','私はその値段を下げた'],'be fascinated by ～ は「～に魅了される」。its は、はちみつのことを指すよ。'),
  choice('養蜂部は、何年もはちみつをどこに売っている？','和菓子屋',['病院','図書館','駅の案内所'],'a Japanese sweets shop＝和菓子屋。for years は「何年もの間」だよ。'),
  choice('We have sold our honey ... for years. の have sold はどんな形？','have＋過去分詞の現在完了',['be＋動詞の -ing 形','will＋動詞の原形','動詞の現在形だけ'],'sell の過去分詞は sold。現在完了と for years で、何年も続いていることを伝えているよ。'),
  choice('次の学校祭で売る予定なのは？','はちみつどら焼き',['トマトジュース','花の種','弁当だけ'],'We plan to sell ... at our next school festival. は「次の学校祭で～を売る予定です」。plan to＋動詞の原形だよ。'),
  input('「はちみつ」を表す英単語を1語で書こう。','honey','honey＝はちみつ。honey dorayaki は「はちみつどら焼き」だよ。'),
  input('「道具」を表す英単語を1語で書こう。a special (　)','tool','tool＝道具。a special tool は「特別な道具」だよ。'),
]);

stage('e26s4','教科書｜養蜂','p.82 養蜂②｜花とミツバチの世話','花を植える理由・自分たちで世話｜10問・時間制限なし',[
  choice('12月8日の日記で、学校でしたことは？','花を植えた',['店の棚を作った','トマトを収穫した','弁当を売った'],'I planted some flowers at school. は「学校で花を植えた」。planted は plant の過去形だよ。'),
  choice('At first の意味は？','最初は',['その結果','夜でさえ','途中で'],'At first＝最初は。最初の考えと、今の考えを比べて読もう。'),
  choice('最初、ナナミは園芸についてどう思っていた？','自分たちの仕事だとは思っていなかった',['自分たちの唯一の仕事だと思っていた','ミツバチに花は不要だと学んだ','学校では禁止されていると思っていた'],'I didn’t think that gardening was our job. は「園芸が私たちの仕事だとは思わなかった」だよ。'),
  choice('But now, I have learned its importance. の its は何の重要性？','園芸の重要性',['照明の重要性','弁当の重要性','ドローンの重要性'],'直前の gardening（園芸）を指しているよ。花を育てる大切さがわかったんだね。'),
  choice('ミツバチが食べるものは？','花粉と花の蜜',['米と肥料','弁当と飲み物','葉と土だけ'],'pollen and nectar＝花粉と花の蜜。ミツバチが生きるために花が必要なんだ。'),
  choice('ナナミがミツバチのために作りたいものは？','よい環境',['新しい病院','大きなコンビニ','冷たい水田'],'I want to make a good environment for our bees. は「ミツバチのためによい環境を作りたい」だよ。'),
  choice('巣箱を確認したとき、ミツバチの様子は？','元気そうではなかった',['とても元気そうだった','全員いなくなっていた','全員眠っていると書いてある'],'The bees didn’t look well. は「ミツバチは元気そうではなかった」。look＋形容詞で様子を表すよ。'),
  choice('自分たちでミツバチの世話をする理由は？','ミツバチの医者がいないから',['花が絶対にいらないから','はちみつを買うためだけ','学校祭が終わったから'],'there are no doctors for honeybees＝ミツバチの医者はいない。by ourselves は「自分たち自身で」だよ。'),
  input('「花粉」を表す英単語を1語で書こう。','pollen','pollen＝花粉。nectar（花の蜜）とセットで覚えよう。'),
  input('「～の世話をする」(　) for ～ の空所を1語で書こう。','care','care for ～＝～の世話をする。プリントの take care of ～ も同じ意味で使えるよ。'),
]);

stage('e26s5','教科書｜スマート農業','p.90 スマート農業①｜技術の活用','ロボット・スマホ・ドローン｜10問・時間制限なし',[
  choice('本文のロボットは、何を収穫している？','赤いトマトだけ',['青いトマトだけ','すべての花','はちみつ'],'It picks only red tomatoes. は「赤いトマトだけを摘み取る」。only＝～だけ、に注目しよう。'),
  choice('トマトを選んで収穫するために使うものは？','カメラとセンサー',['棚と照明だけ','弁当と飲み物','花粉と蜜'],'With cameras and sensors は「カメラとセンサーを使って」。with は道具・手段も表すよ。'),
  choice('スマート農業とは、どんな農業？','ロボットやICTなどの技術を使う農業',['技術を一切使わない農業','花だけを育てる農業','夜だけ行う農業'],'本文では robots and ICT などの smart technology を使う農業として説明しているよ。'),
  choice('technology such as robots and ICT の such as は？','～のような（例を挙げる）',['～のせいで','～の代わりに','～にもかかわらず'],'A such as B は「BのようなA」。ロボットやICTは技術の例だね。'),
  choice('千葉の一部の農家は、何で畑を見守っている？','スマートフォン',['紙の地図だけ','望遠鏡だけ','店のレジ'],'monitor their fields with their smartphones＝スマートフォンで畑を監視する、だよ。'),
  choice('千葉の農家は、自宅から何を確認できる？','作物の状態',['店の売上だけ','学校祭の売上だけ','客の人数だけ'],'check the condition of their crops＝作物の状態を確認する。condition＝状態、crop＝作物だよ。'),
  choice('北海道の一部の農場では、ドローンで何をまく？','肥料',['はちみつ','弁当','花の蜜'],'spray fertilizer on the rice fields＝水田に肥料をまく。fertilizer＝肥料だよ。'),
  choice('drones are used の意味は？','ドローンが使われる',['ドローンが使った','ドローンが売り切れた','ドローンが使っている'],'be動詞＋過去分詞で受動態。「～される」という意味だよ。use の過去分詞は used。'),
  choice('rice fields の意味は？','水田',['和菓子屋','巣箱','商品棚'],'rice field は水田。field は畑や田などの土地を表すよ。'),
  input('「データ」を英語1語で書こう。collect (　)','data','collect data＝データを集める。スマート農業で作物の状態を知る手がかりになるよ。'),
]);

stage('e26s6','教科書｜スマート農業','p.92 スマート農業②｜時間と労力','農業の課題・質と量の改善｜10問・時間制限なし',[
  choice('Farming is important for our lives. の意味は？','農業は私たちの生活に重要だ',['農業は私たちの生活に無関係だ','農業はいつも簡単だ','農業は食べ物を必要としない'],'our lives＝私たちの生活。lives は life の複数形だよ。'),
  choice('work long hard hours は、どんな働き方？','長時間、一生懸命働く',['短時間だけ楽に働く','家で眠る','仕事をしない'],'long は時間の長さ、hard は大変さを表しているよ。農業が楽な仕事ではないことを説明しているね。'),
  choice('本文で、収穫に影響を与えるものは？','悪天候',['教室の広さ','店の明るさ','学校祭の日付'],'harvests are affected by bad weather＝収穫が悪天候に影響される。be affected by＝～に影響される、だよ。'),
  choice('Smart farming is changing this situation. の is changing は？','変えつつある',['変え終えて二度と変えない','変えなかった','必ず変えられない'],'be動詞＋動詞の -ing 形で進行形。今、状況を変えつつあるということだよ。'),
  choice('By using advanced technology の意味は？','先進的な技術を使うことによって',['先進的な技術を使う前に','先進的な技術を使わずに','先進的な技術を忘れたため'],'by＋動詞の -ing 形で「～することによって」。advanced＝先進的な、だよ。'),
  choice('技術を使うことで節約できるのは？','時間と労力',['花粉と蜜','棚と照明','学校と教室'],'save time and effort＝時間と労力を節約する。農家の負担を減らす効果だね。'),
  choice('both crop quality and quantity の意味は？','作物の質と量の両方',['作物の質だけ','作物の量だけ','作物の色と形だけ'],'both A and B＝AとBの両方。quality は質、quantity は量。似たつづりを区別しよう。'),
  choice('more and more people の意味は？','ますます多くの人々',['ますます少ない人々','たった1人','以前と同じ人数だけ'],'more and more＝ますます多くの。農業に興味を持つ人が増えていると書かれているよ。'),
  choice('本文のまとめとして合うものは？','スマート農業は今日の農業の重要なかぎだ',['スマート農業は農業と無関係だ','農業では技術が全く使えない','スマート農業で天候の影響が必ずゼロになる'],'an important key to today’s agriculture＝今日の農業の重要なかぎ。天候の影響が完全になくなるとは書かれていないよ。'),
  input('「質」を英語1語で書こう。crop (　) and quantity','quality','quality＝質、quantity＝量。「質と量」の順でセットにして覚えよう。'),
]);

// 各プリントの掲載順のまま、40項目をすべて意味の選択問題として練習する。
stage('e26s7','プリント｜重要表現40','プリント①｜出来事と滞在','現れる・続く・泊まるなど｜英語→日本語',[
  choice('There was a fire yesterday. の意味は？','昨日、火事があった',['昨日、火を消した','明日、火事がある','昨日、花を植えた'],'There was ～ は「～があった」。a fire＝火事、yesterday＝昨日だよ。'),
  choice('The singer appeared on the stage. の appeared は？','現れた',['眠った','料理した','逃げた'],'appear＝現れる。文全体は「その歌手がステージに現れた」だよ。'),
  choice('Tom showed up late. の showed up は？','現れた',['片付けた','着替えた','笑った'],'show up＝現れる。showed は過去形で、「トムは遅れて現れた」だよ。'),
  choice('have an accident at work の意味は？','仕事中に事故に遭う',['仕事中に休憩する','仕事を見つける','仕事で成功する'],'have an accident＝事故に遭う。at work は「仕事中に」だよ。'),
  choice('The meeting continued for three hours. の continued は？','続いた',['始まった','中止された','忘れられた'],'continue＝続く。会議が3時間続いた、という意味だよ。'),
  choice('stop talking の意味は？','話すのをやめる',['話すために立ち止まる','話し始める','話すのを楽しみにする'],'stop＋動詞の -ing 形は「～するのをやめる」。stop to talk（話すために立ち止まる）とは区別しよう。'),
  choice('My office is on the tenth floor. の floor は？','階',['庭','隣人','服'],'ここでは floor＝階。「私のオフィスは10階にあります」だよ。'),
  choice('during my stay in Fukuoka の意味は？','私の福岡滞在中',['福岡を去った後','福岡へ行く前','福岡での事故'],'stay はここでは名詞で「滞在」。during は「～の間に」だよ。'),
  choice('stay with Bob for two days の意味は？','2日間、ボブの家に泊めてもらう',['2日間、ボブを待つ','2日間、ボブと働く','2日間、ボブを探す'],'stay with 人 は「人の家に泊まる」。for two days は期間の2日間だよ。'),
  choice('take a bath before going out の意味は？','出かける前にお風呂に入る',['出かけた後に歯を磨く','寝る前に服を買う','出かける前に料理する'],'take a bath＝お風呂に入る。before going out＝出かける前に、だよ。'),
]);

stage('e26s8','プリント｜重要表現40','プリント②｜日常の動作','つける・片付ける・着るなど｜LEAP確認プリントの10項目',[
  choice('turn on the air conditioner の意味は？','エアコンの電源を入れる',['エアコンを片付ける','エアコンを組み立てる','エアコンの電源を切る'],'turn on＝電源を入れる・つける。反対の turn off と区別しよう。'),
  choice('put away the dishes の意味は？','皿を片付ける',['皿を割る','皿を買う','皿を洗う'],'put away＝片付ける。dishes はここでは皿のことだよ。'),
  choice('brush my teeth after dinner の意味は？','夕食後に歯を磨く',['夕食前に手を洗う','夕食後に服を着る','夕食前に風呂に入る'],'brush my teeth＝歯を磨く。teeth は tooth（歯）の複数形だよ。'),
  choice('buy clothes の意味は？','服を買う',['皿を買う','靴だけを脱ぐ','目を閉じる'],'clothes＝服。buy＝買う、と一緒に覚えよう。'),
  choice('take off my hat の意味は？','帽子を脱ぐ',['帽子をかぶる','帽子を買う','帽子を洗う'],'身につけた物を take off で「脱ぐ・外す」。ここでは帽子を脱ぐことだよ。'),
  choice('Close your eyes. の意味は？','目を閉じてください',['目を開けてください','目をこすってください','上着を着てください'],'close＝閉じる、eyes＝目。命令文は動詞の原形で始まるよ。'),
  choice('put on a jacket の意味は？','上着を着る',['上着を脱ぐ','上着を捨てる','上着を洗う'],'put on＝身につける。a jacket は上着。take off と反対の動作だよ。'),
  choice('turn over the steak の意味は？','ステーキをひっくり返す',['ステーキを買う','ステーキを捨てる','ステーキを切る'],'turn over＝ひっくり返す。turn on（電源を入れる）と区別しよう。'),
  choice('put a table together の意味は？','テーブルを組み立てる',['テーブルを捨てる','テーブルを拭く','テーブルを売る'],'put ～ together＝～を組み立てる。部品を一緒にするイメージだよ。'),
  choice('throw away old clothes の意味は？','古着を捨てる',['古着を着る','古着を買う','古着を片付ける'],'throw away＝捨てる。put away（片付ける）との違いに注意しよう。'),
]);

stage('e26s9','プリント｜重要表現40','プリント③｜気持ちと反応','うれしい・楽しみにする・誇りに思うなど｜英語→日本語',[
  choice('I am glad to hear that. の意味は？','それを聞いてうれしいです',['それを聞いて悲しいです','それを聞いて怒っています','それを聞いて退屈です'],'glad＝うれしい。be glad to ～ は「～してうれしい」だよ。'),
  choice('I am interested in cooking. の意味は？','料理に興味があります',['料理が怖いです','料理に飽きました','料理をやめました'],'be interested in ～＝～に興味がある。in の後ろの cooking は「料理すること」だよ。'),
  choice('laugh at his jokes の意味は？','彼の冗談に笑う',['彼の冗談を心配する','彼の冗談を忘れる','彼の冗談を書く'],'laugh at ～＝～を聞いて笑う・～を笑う。ここは jokes（冗談）に笑っているよ。'),
  choice('ask him to help me の意味は？','彼に私を手伝うように頼む',['彼が私に手伝ってくれる','彼を手伝うのを断る','彼に私の名前を教える'],'ask 人 to ～＝人に～するように頼む。頼まれる人は him だよ。'),
  choice('I am sad to hear that. の意味は？','それを聞いて悲しいです',['それを聞いてうれしいです','それを聞いて安心しています','それを聞いて誇りに思います'],'sad＝悲しい。glad（うれしい）と対にして覚えよう。'),
  choice('I am afraid that it will snow. の意味は？','雪になるかもしれないと心配しています',['雪になるのを楽しみにしています','雪が降ったことを喜んでいます','雪になると誇りに思います'],'be afraid that ～ は、ここでは「～ではないかと心配している」。that の後ろが心配の内容だよ。'),
  choice('I am looking forward to seeing you again. の意味は？','また会えるのを楽しみにしています',['また会うのを避けています','また会うのを忘れました','また会うのが怖いです'],'look forward to ～＝～を楽しみにする。to の後ろは seeing のような -ing 形だよ。'),
  choice('I was surprised at the news. の意味は？','そのニュースに驚いた',['そのニュースを伝えた','そのニュースを忘れた','そのニュースを待った'],'be surprised at ～＝～に驚く。was なので過去のことだよ。'),
  choice('Don’t worry about it. の意味は？','そんなことを気にするな',['そんなことを忘れるな','そんなことを笑うな','そんなことを話すな'],'worry about ～＝～を心配する。Don’t ～ で「～するな・しないで」だよ。'),
  choice('I am proud of my team. の意味は？','自分のチームを誇りに思っている',['自分のチームを怖がっている','自分のチームを忘れている','自分のチームを探している'],'be proud of ～＝～を誇りに思う。of までセットで覚えよう。'),
]);

stage('e26s10','プリント｜重要表現40','プリント④｜人生と人々','生まれる・回復する・世話をするなど｜英語→日本語',[
  choice('Life is short. の意味は？','人生は短い',['授業は短い','休暇は短い','道は短い'],'life はここでは「人生」。文の内容に合わせて意味を選ぼう。'),
  choice('get married to an actor の意味は？','俳優と結婚する',['俳優を手伝う','俳優と話す','俳優を探す'],'get married to 人＝人と結婚する。to まで一緒に覚えよう。'),
  choice('I was born in India. の意味は？','私はインドで生まれた',['私はインドに引っ越した','私はインドで結婚した','私はインドを旅行した'],'be born＝生まれる。was born で「生まれた」だよ。'),
  choice('get sick in class の意味は？','授業中に気分が悪くなる',['授業中に笑う','授業中に元気になる','授業中に眠る'],'get sick＝気分が悪くなる・病気になる。in class は「授業中に」だよ。'),
  choice('win the match の意味は？','その試合に勝つ',['その試合に負ける','その試合を見る','その試合をやめる'],'win＝勝つ。the match は「その試合」だよ。'),
  choice('get well soon の意味は？','すぐに良くなる',['すぐに結婚する','すぐに到着する','すぐに病気になる'],'get well＝元気になる・回復する。Get well soon. はお見舞いで「早く良くなってね」とも使うよ。'),
  choice('Only humans can use fire. の humans は？','人間',['動物','植物','隣人だけ'],'humans＝人間。文全体は「人間だけが火を使うことができる」だよ。'),
  choice('Many people were dancing. の people は？','人々',['道具','作物','店'],'people＝人々。文全体は「多くの人々が踊っていた」だよ。'),
  choice('chat with a next-door neighbor の意味は？','隣の家の人とおしゃべりする',['遠くの友達に手紙を書く','家族と料理する','店員に値段を尋ねる'],'next-door neighbor＝隣の家の人。chat with ～ は「～とおしゃべりする」だよ。'),
  choice('take care of my tortoise の意味は？','私の亀の世話をする',['私の亀を探す','私の亀を買う','私の亀の絵を描く'],'take care of ～＝～の世話をする。教科書の care for ～ と結びつけて覚えよう。'),
]);

export const units = HQ.units;
export const cards = HQ.cards;
