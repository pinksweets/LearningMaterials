import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 提供写真の Lesson 6〜10（p.20〜29）をもとにしたオリジナル問題。
function choice(q, answer, wrong, exp) {
  return {type:'yon', lv:'基礎', q, choices:[answer, ...wrong], a:0, exp, examPractice:true};
}

function input(q, answer, exp, accept = []) {
  return {type:'ana', lv:'標準', q, choices:[answer], a:0, exp, forceInput:true, examPractice:true, accept};
}

function order(ja, words, answer, exp) {
  return input(`語順｜「${ja}」［${words}］を並べて英文を入力しよう。`, answer, exp, [answer.slice(0, -1)]);
}

function register(n, title, page, desc, rule, example, check, questions) {
  HQ.registerUnit({
    id:`efs${n}`, subject:'🇬🇧 英語 期末テスト対策', group:'期末テスト対策｜英語',
    title:`Lesson ${n + 5}｜${title}`, page, desc, order:11100 + n,
    lesson:[
      {kind:'要点', title:'使い分け', body:rule},
      {kind:'例文', title:'形と意味を確認', body:example},
      {kind:'注意点', title:'よくある間違い', body:check}
    ],
    questions, cards:[]
  });
}

register(1, '現在完了の完了・結果', '20〜21', 'just・already・yet の位置と、過去形との使い分けを確かめよう。',
  'have / has＋過去分詞で、過去の出来事を今の状況と結びつけるよ。完了は「もう済んだ」、結果は「その結果、今こうなっている」と考えよう。',
  'The guests have just arrived.（お客さんがちょうど着いたところです。）\nNana has lost her umbrella.（ナナは傘をなくして、今も手元にありません。）\nHave you packed yet?（もう荷造りした？）／ I have not packed yet.（まだ荷造りしていないよ。）',
  'just（ちょうど）と already（すでに）はふつう have / has の後ろ、yet（疑問文では「もう」、否定文では「まだ」）はふつう文末だよ。yesterday や an hour ago で過去の時点を示すときや、When ...? で出来事の時点を尋ねるときは、過去形を使おう。', [
  choice('「ユイはちょうど窓を開けたところだ。」Yui (　) just opened the window.', 'has', ['have','is','does'], '主語 Yui は三人称単数。has just opened の順で「ちょうど開けたところ」だよ。'),
  choice('「私は昨日、自転車を修理した。」I (　) my bike yesterday.', 'fixed', ['have fixed','am fixing','fix'], 'yesterday が過去の時点を示すから、過去形 fixed を使うよ。'),
  choice('「生徒たちはもう到着しましたか。」Have the students arrived (　)?', 'yet', ['ago','yesterday','then'], '「もう〜しましたか」と尋ねる現在完了の疑問文では、yet を文末に置けるよ。'),
  input('「私はまだ荷造りを終えていない。」I (　) packing yet. ［finish］を使って空所だけ入力。短縮形は使わないでね。', 'have not finished', '否定は have not＋過去分詞。yet が「まだ」を表すよ。'),
  input('「いつその店は閉まりましたか。」When (　) close? ［the store］を含め、空所だけ入力。', 'did the store', '過去の出来事の時点を尋ねる形は When did＋主語＋動詞の原形 ...? だよ。'),
  choice('「ミナは鍵をなくして、今も持っていない。」Mina has lost her key. この現在完了の用法は？', '結果', ['経験','継続','過去の時点の指定'], '鍵をなくした結果として、今も手元にないことを表す「結果」の用法だよ。'),
  input('「私はもうそのメールを書いた。」I have already (　) the email. ［write］を変化させて入力。', 'written', 'write の変化は write → wrote → written。have の後ろには過去分詞 written を置こう。'),
  choice('「その荷物はすでに届きました。」に合う英文は？', 'The package has already arrived.', ['The package have already arrived.','The package has already arrive.','The package is already arrive.'], 'The package は単数なので has。already を has と過去分詞 arrived の間に置いているね。'),
  choice('The shop opened when I arrived. の意味は？', '私が着いたとき、その店は開いた。', ['私が着くまで、その店は開かない。','その店はすでに閉まっている。','私はその店が開く時刻を知らない。'], 'when I arrived が過去の時点を示しているよ。opened は過去形だね。'),
  order('フェリーはすでに出発してしまいました。', 'already / left / the ferry / has', 'The ferry has already left.', 'The ferry＋has＋already＋left の順。leave の過去分詞は left だよ。')
]);

register(2, '現在完了の経験・継続', '22〜23', 'ever・never、since・for、現在完了進行形を練習しよう。',
  '経験は「今までに〜したことがある」。疑問文で ever（これまでに）、否定の意味で never（一度も〜ない）、回数を表す once や twice が使えるよ。継続は「過去から今までずっと〜」。',
  'Have you ever grown tomatoes?（トマトを育てたことはありますか。）\nI have known him for six years.（私は彼と6年前からの知り合いです。）\nIt has been snowing since this morning.（今朝からずっと雪が降っています。）',
  'since の後ろには始まった時点、for の後ろには続いた期間を置くよ。know や want のように状態を表す動詞は現在完了を使い、続いている動作を強調するときは have / has been＋動詞の ing 形を使おう。', [
  choice('「これまでに馬に乗ったことがありますか。」Have you (　) ridden a horse?', 'ever', ['for','ago','twice'], '経験を尋ねる疑問文では、ever が「これまでに」を表すよ。ride の過去分詞は ridden だよ。'),
  choice('「彼女は3年間ここに住んでいる。」She has lived here (　) three years.', 'for', ['since','ago','at'], 'three years は期間。期間には for、始まった時点には since を使うよ。'),
  input('「私はその映画を2回見たことがある。」I have (　) the film twice. ［see］を変化させて入力。', 'seen', 'see → saw → seen。have の後ろには見た経験を表す過去分詞 seen が入るよ。'),
  input('「リクは一度もスキーをしたことがない。」Riku (　) skied. never を使って、空所だけ入力。', 'has never', '三人称単数の Riku だから has。never を has と過去分詞 skied の間に置くよ。'),
  input('「正午からずっと雨が降り続いている。」It (　) since noon. ［rain］を現在完了進行形にして、空所だけ入力。', 'has been raining', '今まで続いている動作は has been＋動詞の ing 形で表せるよ。'),
  choice('「私は小学生のころから彼女を知っています。」I have known her (　) I was in elementary school.', 'since', ['for','ago','yet'], 'I was in elementary school が継続の起点。「〜のころから」は since を使おう。'),
  choice('「私たちは2年間知り合いだ。」に合う英文は？', 'We have known each other for two years.', ['We have been knowing each other for two years.','We have knew each other for two years.','We have known each other since two years.'], 'know は状態を表すので have known。two years は期間だから for を使おう。'),
  choice('Ken has been cleaning his room since ten. の意味は？', 'ケンは10時からずっと自分の部屋を掃除している。', ['ケンは10時に部屋の掃除を終えた。','ケンは10時間前に部屋を掃除した。','ケンは自分の部屋を掃除したことがない。'], 'has been cleaning は続いている動作。since ten は「10時から」だよ。'),
  choice('「ナナは一度、沖縄に行ったことがあります。」に合う英文は？', 'Nana has been to Okinawa once.', ['Nana has gone to Okinawa once.','Nana has been to Okinawa since once.','Nana has be to Okinawa once.'], '訪れた経験は has been to、once は「一度」だよ。has gone to はふつう「行って今ここにいない」という結果を表すよ。'),
  order('私たちは20分間ずっとバスを待っています。', 'the bus / have / twenty minutes / for / we / been / waiting for', 'We have been waiting for the bus for twenty minutes.', 'have been waiting で続く動作。wait for the bus が「バスを待つ」、for twenty minutes が続いた期間だよ。')
]);

register(3, '過去完了と過去完了進行形', '24〜25', '過去の基準時点を見つけ、そのときまでに起きたことを表そう。',
  'had＋過去分詞は、過去のある時点までの完了・結果・経験・継続を表すよ。「過去のいつが基準か」を先に見つけよう。',
  'The movie had already started when we sat down.（座ったときには、映画はすでに始まっていました。）\nI had been walking for an hour when it began to rain.（雨が降り始めたとき、私は1時間ずっと歩いていました。）',
  '過去の基準まで続いていた動作を強調するなら had been＋動詞の ing 形。状態なら過去完了を使うよ。had は I、she、they など、どの主語でも同じだよ。', [
  choice('「私たちが駅に着いたとき、電車はすでに発車していた。」The train (　) already left when we got to the station.', 'had', ['has','have','was'], '駅に着いたときが過去の基準。その時点までに発車していたから had already left だよ。'),
  choice('I noticed that I had dropped my ticket. 先に起きたのは？', '切符を落とした。', ['切符を落としたことに気づいた。','切符を買い直した。','二つの出来事は同時に起きた。'], 'noticed が過去の基準。had dropped が、それより前に起きたことを示しているよ。'),
  input('「私たちが劇場に着いたとき、ショーはちょうど始まったところだった。」The show had just (　) when we arrived. ［begin］を変化させて入力。', 'begun', 'begin → began → begun。had の後ろは過去分詞 begun を使おう。'),
  input('「転校するまで、私は海で泳いだことが一度もなかった。」I (　) in the sea before I changed schools. ［never と swim］を過去完了で使い、空所だけ入力。', 'had never swum', '転校した時点までの経験だから had never＋過去分詞。swim → swam → swum だよ。'),
  choice('「去年まで、彼女はそのクラブの会員を5年間続けていた。」She (　) a member of the club for five years until last year.', 'had been', ['has been','had being','has being'], '去年まで続いた状態は過去完了。had＋be の過去分詞 been だよ。'),
  input('「私が電話したとき、彼女は30分ずっと料理をしていた。」She (　) for thirty minutes when I called. ［cook］を過去完了進行形にして、空所だけ入力。', 'had been cooking', '電話したときまで続いていた動作を had been cooking と表そう。for thirty minutes は期間だよ。'),
  choice('「私は間違った電車に乗ったことに気づいた。」I realized that I (　) the wrong train.', 'had taken', ['have taken','had took','am taking'], '気づくより前に電車に乗っているね。had＋take の過去分詞 taken を使うよ。'),
  choice('Aya had visited Nara twice before she moved there. の意味は？', 'アヤは奈良に引っ越す前に、奈良を2回訪れたことがあった。', ['アヤは奈良に引っ越してから、奈良を2回訪れた。','アヤは奈良への引っ越しを2回経験した。','アヤは奈良に引っ越すまで、奈良を訪れたことがなかった。'], '引っ越しが基準。had visited twice は、その前までに2度訪れた経験を表すよ。'),
  input('「彼が引っ越した時点で、ジンと知り合って6年がたっていた。」He (　) Jin for six years before he moved. ［know］を過去完了にして入力。', 'had known', 'know は状態を表すよ。過去の基準までの継続には had known を使おう。'),
  order('私が学校に着いたとき、雪は2時間ずっと降り続いていた。', 'for / when I got to school / had / snowing / two hours / it / been', 'It had been snowing for two hours when I got to school.', 'It had been snowing で続いていた動作。for two hours が期間、when I got to school が過去の基準だよ。')
]);

register(4, '助動詞の能力・許可・義務・助言', '26〜27', 'can・may・must・have to と、助言の表現を使い分けよう。',
  '能力は can / be able to、過去の能力は could / was（were）able to、未来は will be able to。許可は can / may、少しかしこまって尋ねるなら May I ...? を使えるよ。',
  'She had to leave early.（彼女は早く出なければなりませんでした。）\nYou must not enter this room.（この部屋に入ってはいけません。）\nYou do not have to bring a towel.（タオルを持ってくる必要はありません。）',
  '義務の過去は had to、未来は will have to。助言では should＋原形、ought to＋原形、had better＋原形を使うよ。否定は ought not to、had better not の順。許可しないときは cannot / may not も使えるよ。', [
  choice('「3週間後には、一人で泳げるようになるだろう。」She will (　) swim on her own in three weeks.', 'be able to', ['can','could','able to'], 'will の後ろは動詞の原形。未来の能力は will be able to で表そう。'),
  choice('「ここでは携帯電話を使ってはいけません。」You (　) use your phone here.', 'must not', ['do not have to','should','can'], '「〜してはいけない」は禁止の must not。「〜しなくてもよい」は do not have to だよ。'),
  choice('「子どものころ、私は5キロ走ることができた。」I (　) run five kilometers when I was a child.', 'could', ['can','will be able to','may'], '過去の一般的な能力には could を使えるよ。後ろは run のように原形だよ。'),
  input('「昨日、私は制服を着なければならなかった。」I (　) wear my uniform yesterday. ［have to］を過去形にして、空所だけ入力。', 'had to', '過去の義務は had to＋原形。yesterday が過去の目印だよ。'),
  choice('先生に「ここに座ってもよろしいですか」と、may を使って許可を求める文は？', 'May I sit here?', ['May you sit here?','I may sit here.','Do I have to sit here?'], '自分が座る許可を求めるから、May I＋動詞の原形 ...? の順だよ。'),
  choice('「この用紙に名前を書く必要はありません。」You (　) write your name on this sheet.', 'do not have to', ['must not','have to','ought to'], 'do not have to は「〜する必要がない」。この文では、名前を書くかどうかは自由だよ。'),
  choice('係員が You may not touch the paintings. と伝えました。ここでの意味は？', '絵に触れてはいけません。', ['絵に触れなくてもかまいません。','絵に触るべきです。','絵に触るつもりはありません。'], '係員の指示なので、ここでの may not は不許可の「〜してはいけない」だよ。'),
  choice('「明日、君はこの用紙を出さなければならないだろう。」You will (　) hand in this form tomorrow.', 'have to', ['must','had to','has to'], '未来の義務は will have to＋原形。will の直後には原形の have を置くよ。'),
  choice('「もう少し早く出発すべきです。」We (　) leave a little earlier.', 'should', ['should to','ought','had better to'], 'should の直後は原形。ought to leave や had better leave も形を覚えておこう。'),
  order('そこに車を止めないほうがいいです。', 'park / not / had / you / there / better', 'You had better not park there.', '否定の助言は had better not＋原形の順。ここでは動詞の原形は park だよ。')
]);

register(5, '助動詞の意志・依頼・提案・推量', '28〜29', 'will・would・shall と、確かさの違いを表す助動詞を練習しよう。',
  'will は意志、will not（won’t）は「しないつもり」「しようとしない」。would は「昔よく〜したものだ」という習慣も表すよ。Will / Can you ...? と Would / Could you ...? は依頼に使えるよ。',
  'Shall I carry this box?（この箱を運びましょうか。）\nShall we take a break?（休憩しませんか。）\nThe lights are on. She must be home.（明かりがついています。彼女は家にいるにちがいありません。）',
  '推量では can が一般的な可能性、may / might / could が「かもしれない」、must が「にちがいない」、should が「〜のはず」、cannot が「〜のはずがない」。文の状況から、意志や義務などの意味と見分けよう。', [
  choice('「私たちは昔、放課後によくこの公園で遊んだものだ。」We (　) often play in this park after school when we were children.', 'would', ['shall','may','must'], '子どものころによくした動作。過去の習慣は would often＋原形で表せるよ。'),
  choice('「私が窓を閉めましょうか」「いっしょに昼食をとりませんか」の書き出しの組は？', 'Shall I / Shall we', ['Shall we / Shall I','Will you / Shall I','Could you / Shall we'], '自分がする申し出は Shall I ...?。いっしょにしようという提案は Shall we ...? を使うよ。'),
  input('「私は今度こそあきらめないつもりです。」I (　) give up this time. ［will］を使い、空所だけ入力。短縮形は使わないでね。', 'will not', '「〜しないつもり」は will not＋原形。短縮すると won’t だよ。'),
  choice('店員に「この住所を書いていただけますか」と would を使って頼む文は？', 'Would you write this address?', ['Shall I write this address?','Shall we write this address?','I would write this address.'], '相手にていねいに頼むなら Would you＋原形 ...?。Could you ...? もていねいな依頼に使えるよ。'),
  choice('「あれは新しい体育館かもしれない」「予定どおりなら、今ごろユキは駅にいるはずだ」。二つの推量に合う組は？', 'might / should', ['must / might','cannot / should','should / cannot'], '「かもしれない」は might。may や could も同様の推量に使えるよ。「予定どおりなら〜のはず」には should が合うね。'),
  choice('「彼は長い距離を走った。疲れているにちがいない。」He ran a long way. He (　) be tired.', 'must', ['may','cannot','can'], '走った事実を根拠に強い確信を表す must だよ。この be tired は義務ではないね。'),
  choice('「天気は山では急に変わることがある。」The weather (　) change suddenly in the mountains.', 'can', ['ought to','had better','must not'], '一般に起こりうることを can で表せるよ。can change は「変わることがある」。'),
  choice('「予定どおりなら、今ごろバスは空港に着いているはずだ。」The bus (　) be at the airport by now.', 'should', ['cannot','had better','would often'], '予定を根拠に「今ごろ〜のはずだ」と推量するとき、should を使えるよ。'),
  choice('「いっしょに昼食をとりませんか。」(　) have lunch together?', 'Shall we', ['Shall I','May I','Must I'], '相手を誘っていっしょに何かをするときは Shall we ...? だよ。'),
  order('その話は本当のはずがありません。', 'true / cannot / that story / be', 'That story cannot be true.', '強い否定の推量は cannot＋原形。That story cannot be true. で、その話が本当だとは考えられないという意味だよ。')
]);

export const units = HQ.units;
export const cards = HQ.cards;
