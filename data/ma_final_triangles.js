import { createRegistry } from './_registry.js';
const HQ = createRegistry();

// 添付写真p.53〜56の学習内容をもとにしたオリジナル練習。
function n(q,a,exp,maDiagram){return {type:'suji',lv:'標準',q,a:[String(a)],exp,examPractice:true,...(maDiagram?{maDiagram}:{})};}
function c(q,answer,others,exp,maDiagram){return {type:'yon',lv:'標準',q,choices:[answer,...others],a:0,exp,examPractice:true,...(maDiagram?{maDiagram}:{})};}
function m(q,a,exp,maDiagram){return {type:'maru',lv:'基礎',q,a,exp,examPractice:true,...(maDiagram?{maDiagram}:{})};}
function unit(id,title,page,desc,lesson,questions){HQ.registerUnit({id,subject:'📐 数学A',group:'期末テスト対策｜図形の性質',title,page,desc,order:176.20+HQ.units.length/100,lesson,questions,cards:[]});}
function geometry(points,segments,labels){return {kind:'geometry',points,segments,labels};}
function inner(labels){return geometry({A:[270,35],B:[65,250],C:[440,250],I:[263,175]},[['A','B'],['B','C'],['C','A'],['A','I'],['B','I'],['C','I']],['I：内心',...labels]);}
function centroid(labels,kind='median'){
  const points={A:[250,35],B:[65,250],C:[440,250],F:[252.5,250],G:[251.7,178.3]};
  const segments=[['A','B'],['B','C'],['C','A'],['A','F']];
  if(kind==='throughG'){points.D=[126.7,178.3];points.E=[376.7,178.3];segments.push(['D','E']);}
  if(kind==='midline'){points.D=[157.5,142.5];points.E=[251.25,142.5];segments.push(['D','E']);}
  return geometry(points,segments,['G：重心',...labels]);
}
function mix(P,Q,t){return [P[0]+(Q[0]-P[0])*t,P[1]+(Q[1]-P[1])*t];}
function intersect(A,B,C,D){const ux=B[0]-A[0],uy=B[1]-A[1],vx=D[0]-C[0],vy=D[1]-C[1],wx=C[0]-A[0],wy=C[1]-A[1];return mix(A,B,(wx*vy-wy*vx)/(ux*vy-uy*vx));}
function ceva(bp,pc,cq,qa,labels){
  const A=[250,30],B=[65,250],C=[440,250],P=mix(B,C,bp/(bp+pc)),Q=mix(C,A,cq/(cq+qa));
  const R=mix(A,B,pc*qa/(pc*qa+bp*cq)),O=intersect(A,P,B,Q);
  return geometry({A,B,C,P,Q,R,O},[['A','B'],['B','C'],['C','A'],['A','P'],['B','Q'],['C','R']],['AP・BQ・CRは1点Oで交わる',...labels]);
}
function menelaus(bc,cp,ar,rb,labels){
  const A=[220,30],B=[60,235],P=[450,235],C=mix(B,P,bc/(bc+cp)),R=mix(A,B,ar/(ar+rb)),Q=intersect(P,R,A,C);
  return geometry({A,B,C,P,Q,R},[['A','B'],['B','P'],['C','A'],['R','P']],['B・C・Pはこの順に一直線','R・Q・Pは一直線',...labels]);
}
function transversal(pb,bc,cr,ra,labels){
  const P=[45,245],B=[45+390*pb/(pb+bc),245],C=[435,245],A=[200,30],R=mix(C,A,cr/(cr+ra)),Q=intersect(P,R,A,B);
  return geometry({A,B,C,P,Q,R},[['A','B'],['B','C'],['C','A'],['P','C'],['P','R']],['P・B・Cはこの順に一直線','P・Q・Rは一直線',...labels]);
}

unit('mafs1','① 内心｜二等分した角を使う','53','内心の意味 → 角の二等分 → 90°＋半分',[
  {title:'「内心」なら、まず角を半分に',body:'内心Iは、3つの内角の二等分線が交わる点だよ。\nIと頂点を結んだら、同じ頂点の2つの角に同じ印を書こう。∠ABI＝∠IBC、∠ACI＝∠ICBになるよ。'},
  {title:'内心の角を求める3つの手順',body:'例：∠A＝48°のとき、∠BICを求めよう。\n① △ABCで、∠B＋∠C＝180°−48°＝132°。\n② どちらも二等分されるので、∠IBC＋∠ICB＝132°÷2＝66°。\n③ △IBCで、∠BIC＝180°−66°＝114°。',formula:'∠BIC＝90°＋∠A÷2'},
  {title:'半分にする角を取り違えないで',body:'∠BICなら、残った頂点Aの角を半分にして90°に足すよ。∠AICなら頂点Bに注目しよう。\n内心は「3辺からの距離」が等しい点。3頂点からの距離が等しい外心とは違うよ。距離は辺に垂直な線分の長さだよ。'}
],[
  n('Iは△ABCの内心。∠A＝48°のとき、∠BICは何度？ 数字で答えよう。',114,'① 内心からB・Cを結ぶ線は、それぞれの角の二等分線だよ。② ∠B＋∠C＝180°−48°＝132°なので、∠IBC＋∠ICB＝66°。③ ∠BIC＝180°−66°＝114°。90°＋48°÷2でも確かめられるよ。',inner(['∠A＝48°','求める角：∠BIC'])),
  n('Iは△ABCの内心。∠BIC＝128°のとき、∠Aは何度？',76,'① 内心の角は∠BIC＝90°＋∠A÷2。② 128°−90°＝38°が∠Aの半分だよ。③ ∠A＝38°×2＝76°。最後に2倍するのを忘れないでね。',inner(['∠BIC＝128°','求める角：∠A'])),
  n('Iは△ABCの内心。∠B＝64°のとき、∠AICは何度？',122,'① ∠AICの向かいにある頂点はBだから、∠AIC＝90°＋∠B÷2。② 64°÷2＝32°。③ 90°＋32°＝122°だよ。∠Aを使う式と混同しないようにしよう。',inner(['∠B＝64°','求める角：∠AIC'])),
  n('Iは△ABCの内心。∠ABI＝22°、∠ACI＝31°のとき、∠BICは何度？',127,'① BI・CIは角の二等分線なので、∠IBC＝22°、∠ICB＝31°。② △IBCの内角の和を使って、∠BIC＋22°＋31°＝180°。③ ∠BIC＝127°。すでに半分の角が与えられているので、もう一度半分にはしないよ。',inner(['∠ABI＝22°','∠ACI＝31°'])),
  n('Iは△ABCの内心。∠A＝54°、∠ABI＝28°のとき、∠ACIは何度？',35,'① BIは∠Bを二等分するから、∠B＝28°×2＝56°。② ∠C＝180°−54°−56°＝70°。③ CIも二等分線なので、∠ACI＝70°÷2＝35°だよ。',inner(['∠A＝54°','∠ABI＝28°'])),
  n('Iは△ABCの内心。∠A＝72°、∠C＝46°のとき、∠IBCは何度？',31,'① 三角形の内角の和から、∠B＝180°−72°−46°＝62°。② BIは∠Bの二等分線なので、∠IBC＝62°÷2。③ 答えは31°。まず頂点Bの角全体を求めよう。',inner(['∠A＝72°','∠C＝46°'])),
  n('Iは△ABCの内心。Iから辺AB・BCへ下ろした垂線の足をF・Gとする。IF＝3.5 cmのとき、IGは何cm？',3.5,'① 内心から3辺に下ろした垂線の長さは、内接円の半径で等しいよ。② IF＝IGだから、IG＝3.5 cm。③ 答えは3.5。頂点までの距離ではなく、辺への垂直な距離を比べているよ。'),
  n('Iは△ABCの内心。∠BIC＝116°のとき、∠BAIは何度？',26,'① ∠BIC＝90°＋∠A÷2だから、∠A÷2＝116°−90°＝26°。② AIは∠Aの二等分線なので、∠BAI＝∠A÷2。③ 答えは26°。ここでは∠A全体を答えないようにしよう。',inner(['∠BIC＝116°','求める角：∠BAI'])),
  c('三角形の内心は、どの3本の線が交わる点？','3つの内角の二等分線',['3辺の垂直二等分線','3本の中線','3本の高さ'],'① 内心は内接円の中心だよ。② 角の二等分線上の点は、その角をつくる2辺への距離が等しい。③ 3つの内角の二等分線の交点なら3辺への距離が等しくなり、内心になるよ。'),
  m('三角形の内心は、3つの頂点からの距離が必ず等しい。',false,'① 内心の性質は、3辺からの距離が等しいことだよ。② 3頂点からの距離が等しいのは外心。③ この文は×。内心と外心で「どこまでの距離か」を区別しよう。')
]);

unit('mafs2','② 重心｜2：1と相似をつなぐ','54','中線の比 → 全体の長さ → 平行線を使う応用',[
  {title:'中線は頂点と向かいの辺の中点を結ぶ',body:'三角形の3本の中線は1点Gで交わり、この点を重心というよ。\nFがBCの中点ならAFは中線。重心GはAFを、頂点A側から2：1に分けるよ。'},
  {title:'2：1を、全体3つ分で考える',body:'例：AF＝21 cmなら、2：1の合計は3つ分。\n① 1つ分は21÷3＝7 cm。\n② AGは2つ分なので14 cm、GFは1つ分なので7 cm。\n③ 平行線が出たら、相似な三角形の対応する辺を比べよう。',formula:'AG：GF＝2：1 ／ AG：AF＝2：3'},
  {title:'「2：1」をどこに使うか確認',body:'重心は中線を2：1に分けるよ。三角形の辺そのものが必ず2：1になるわけではないよ。\nGを通るDEがBCに平行なら、△ADEと△ABCの相似比はAG：AF＝2：3。\nDがABの中点で、DE∥BC、EがAF上ならAE＝AF÷2。この場合AE：EG＝3：1になるよ。'}
],[
  n('Gは△ABCの重心、Fは辺BCの中点。AG＝12 cmのとき、GFは何cm？',6,'① 重心は中線を頂点側から2：1に分けるので、AG：GF＝2：1。② AGの12 cmが2つ分だから、1つ分は12÷2＝6 cm。③ GF＝6 cmだよ。',centroid(['F：BCの中点','AG＝12 cm'])),
  n('Gは△ABCの重心、Fは辺BCの中点。GF＝4 cmのとき、AGは何cm？',8,'① AG：GF＝2：1。② GFの4 cmが1つ分なので、AGは4×2。③ AG＝8 cm。頂点側の線分AGのほうが長いよ。',centroid(['F：BCの中点','GF＝4 cm'])),
  n('Gは△ABCの重心、Fは辺BCの中点。中線AF＝21 cmのとき、AGは何cm？',14,'① AG：GF＝2：1だから、AF全体は3つ分。② 1つ分は21÷3＝7 cm。③ AGは2つ分なので7×2＝14 cmだよ。',centroid(['F：BCの中点','AF＝21 cm'])),
  n('Gは△ABCの重心、Fは辺BCの中点。AG＝10 cmのとき、AF全体は何cm？',15,'① AGは中線AFの2/3に当たるよ。② GF＝10÷2＝5 cm。③ AF＝AG＋GF＝10＋5＝15 cm。AGをそのまま3倍にはしないよ。',centroid(['F：BCの中点','AG＝10 cm'])),
  n('Gは△ABCの重心。直線AGと辺BCの交点をFとする。BC＝18 cmのとき、BFは何cm？',9,'① 頂点Aと重心Gを通る直線は中線だから、FはBCの中点。② BF＝BC÷2＝18÷2。③ BF＝9 cm。重心の2：1ではなく、辺の中点の1：1を使うよ。',centroid(['BC＝18 cm'])),
  c('Gは△ABCの重心。Gを通りBCに平行な直線が、AB・ACとそれぞれD・Eで交わる。AD：DBは？','2：1',['1：2','1：1','2：3'],'① FをBCの中点とすると、AG：AF＝2：3。② DE∥BCだから△ADE∽△ABC、AD：AB＝2：3。③ DBは残り1つ分なので、AD：DB＝2：1。AD：ABと区別しよう。',centroid(['DE ∥ BC','DはAB上、EはAC上'],'throughG')),
  n('Gは△ABCの重心。Gを通りBCに平行な直線がAB・ACとD・Eで交わる。BC＝24 cmのとき、DEは何cm？',16,'① 重心よりAG：AF＝2：3（FはBCの中点）。② DE∥BCなので、相似比AD：AB＝DE：BC＝2：3。③ DE＝24×2÷3＝16 cmだよ。',centroid(['DE ∥ BC','BC＝24 cm'],'throughG')),
  n('Gは△ABCの重心、FはBCの中点、DはABの中点。Dを通りBCに平行な直線とAFの交点をEとする。AG＝12 cmのとき、EGは何cm？',3,'① 重心の比よりAF＝12×3÷2＝18 cm。② △ADE∽△ABFでAD：AB＝1：2だから、AE＝AF÷2＝9 cm。③ A・E・G・Fの順に並ぶので、EG＝AG−AE＝12−9＝3 cmだよ。',centroid(['D：ABの中点','DE ∥ BC','AG＝12 cm'],'midline')),
  c('Gは△ABCの重心、FはBCの中点、DはABの中点。Dを通りBCに平行な直線とAFの交点をEとする。AE：EGは？','3：1',['2：1','1：1','1：3'],'① AFを6つ分とすると、重心よりAGは4つ分。② △ADE∽△ABFでAD：AB＝1：2だからAEは3つ分。③ EG＝AG−AE＝1つ分なので、AE：EG＝3：1になるよ。',centroid(['D：ABの中点','DE ∥ BC','EはAF上'],'midline')),
  c('三角形の重心は、どの3本の線が交わる点？','3本の中線',['3つの内角の二等分線','3辺の垂直二等分線','3本の高さ'],'① 中線は頂点と向かいの辺の中点を結ぶ線分だよ。② 3本の中線は1点で交わる。③ その交点が重心。内心の「角の二等分線」と分けて覚えよう。')
]);

unit('mafs3','③ チェバの定理｜3本が1点で交わる','55','比を一周してかける → 未知の比 → 長さへ',[
  {title:'3本が1点で交わる図を見つけよう',body:'PはBC上、QはCA上、RはAB上にあるとしよう。AP・BQ・CRが1点で交わるとき、チェバの定理を使えるよ。\n頂点BからP、頂点CからQ、頂点AからRへと、三角形を一周する順番で比を書こう。'},
  {title:'一周する比の積は1',body:'例：CQ：QA＝3：2、AR：RB＝2：5なら、BP：PCを求めよう。\n① (BP/PC)×(CQ/QA)×(AR/RB)＝1。\n② (BP/PC)×(3/2)×(2/5)＝1だから、(BP/PC)×(3/5)＝1。\n③ BP/PC＝5/3なので、BP：PC＝5：3。',formula:'(BP/PC)×(CQ/QA)×(AR/RB)＝1'},
  {title:'分子と分母を途中で逆にしない',body:'CQ：QAが与えられたらCQ/QA＝そのままの順。AQ：QCなら逆数に直してから代入しよう。\n最後にBC全体の長さが必要なら、BP：PCの合計を使うよ。BP：PC＝2：1、BC＝21ならBP＝21×2÷3＝14だね。'}
],[
  c('△ABCでPはBC上、QはCA上、RはAB上。AP・BQ・CRは1点で交わる。CQ：QA＝3：2、AR：RB＝2：5のとき、BP：PCは？','5：3',['3：5','5：2','3：2'],'① チェバの定理より(BP/PC)×(CQ/QA)×(AR/RB)＝1。② (BP/PC)×(3/2)×(2/5)＝1から、BP/PC＝5/3。③ BP：PC＝5：3。積が1に戻るか確かめよう。',ceva(5,3,3,2,['CQ：QA＝3：2','AR：RB＝2：5'])),
  c('△ABCでP・Q・RはそれぞれBC・CA・AB上、AP・BQ・CRは1点で交わる。BP：PC＝2：3、CQ：QA＝3：4のとき、AR：RBは？','2：1',['1：2','3：2','4：3'],'① チェバの定理を使って(2/3)×(3/4)×(AR/RB)＝1。② はじめの2つの積は1/2だから、AR/RB＝2。③ AR：RB＝2：1だよ。',ceva(2,3,3,4,['BP：PC＝2：3','CQ：QA＝3：4'])),
  c('△ABCでP・Q・RはそれぞれBC・CA・AB上、AP・BQ・CRは1点で交わる。AR：RB＝3：5、AQ＝QCのとき、BP：PCは？','5：3',['3：5','5：8','1：1'],'① AQ＝QCよりCQ/QA＝1。② チェバの定理から(BP/PC)×1×(3/5)＝1。③ BP/PC＝5/3なので、BP：PC＝5：3。中点の比は1として代入しよう。',ceva(5,3,1,1,['AR：RB＝3：5','AQ＝QC'])),
  c('△ABCでP・Q・RはそれぞれBC・CA・AB上、AP・BQ・CRは1点で交わる。BP：PC＝4：5、AR：RB＝5：6のとき、CQ：QAは？','3：2',['2：3','4：5','6：5'],'① チェバの定理から(4/5)×(CQ/QA)×(5/6)＝1。② 既知の比の積は2/3だから、CQ/QA＝3/2。③ CQ：QA＝3：2だよ。',ceva(4,5,3,2,['BP：PC＝4：5','AR：RB＝5：6'])),
  n('△ABCでP・Q・RはそれぞれBC・CA・AB上、AP・BQ・CRは1点で交わる。BP＝6、PC＝9、CQ＝4、QA＝8、AR＝3のとき、RBは？',1,'① チェバの定理に長さを代入して、(6/9)×(4/8)×(3/RB)＝1。② (2/3)×(1/2)×(3/RB)＝1なので、1/RB＝1。③ RB＝1。長さの単位はすべてそろえて考えよう。',ceva(6,9,4,8,['BP＝6、PC＝9','CQ＝4、QA＝8','AR＝3'])),
  n('△ABCでP・Q・RはそれぞれBC・CA・AB上、AP・BQ・CRは1点で交わる。CQ：QA＝2：3、AR：RB＝3：4、BC＝21のとき、BPは？',14,'① チェバの定理より(BP/PC)×(2/3)×(3/4)＝1だから、BP：PC＝2：1。② BC全体は比の合計3つ分なので、1つ分は21÷3＝7。③ BP＝7×2＝14だよ。',ceva(2,1,2,3,['CQ：QA＝2：3','AR：RB＝3：4','BC＝21'])),
  n('△ABCでP・Q・RはそれぞれBC・CA・AB上、AP・BQ・CRは1点で交わる。BP：PC＝3：2、CQ：QA＝4：5、AB＝22のとき、ARは？',10,'① チェバの定理より(3/2)×(4/5)×(AR/RB)＝1だから、AR：RB＝5：6。② AB全体は比の合計11に当たるので、1つ分は22÷11＝2。③ AR＝2×5＝10。ARとRBを逆にしないようにしよう。',ceva(3,2,4,5,['BP：PC＝3：2','CQ：QA＝4：5','AB＝22'])),
  m('P・Q・Rはそれぞれ△ABCの辺BC・CA・AB上にあり、AP・BQ・CRは1点で交わる。BP：PC＝2：3、CQ：QA＝3：4なら、AR：RB＝2：1である。',true,'① チェバの定理で、3つの比の積が1になるか調べよう。② (2/3)×(3/4)×(2/1)＝1。③ この文は○。与えられた2つの比からもAR：RB＝2：1と求められるよ。',ceva(2,3,3,4,['BP：PC＝2：3','CQ：QA＝3：4'])),
  c('P・Q・Rはそれぞれ△ABCの辺BC・CA・AB上、AP・BQ・CRは1点で交わる。チェバの定理を正しく表した式は？','(BP/PC)×(CQ/QA)×(AR/RB)＝1',['(BP/PC)×(QA/CQ)×(AR/RB)＝1','(BP/PC)＋(CQ/QA)＋(AR/RB)＝1','(BP/BC)×(CQ/CA)×(AR/AB)＝1'],'① 三角形の辺をB→C→A→Bの順に一周しよう。② 各辺で「進む向きの手前の線分／先の線分」を書くと、BP/PC、CQ/QA、AR/RB。③ この3つをかけた積が1だよ。1つだけ逆数にしないでね。',ceva(1,1,1,1,[])),
  c('△ABCでP・Q・RはそれぞれBC・CA・AB上、AP・BQ・CRは1点で交わる。BP：PC＝4：5、CQ：QA＝5：6のとき、AR：RBは？','3：2',['2：3','4：3','5：6'],'① チェバの定理より(4/5)×(5/6)×(AR/RB)＝1。② 最初の2つの積は2/3なので、AR/RB＝3/2。③ AR：RB＝3：2。約分を先にすると計算しやすいよ。',ceva(4,5,5,6,['BP：PC＝4：5','CQ：QA＝5：6']))
]);

unit('mafs4','④ メネラウスの定理｜一直線と外側の長さ','56','辺の延長を含む比 → 全体と部分 → 横断線の比',[
  {title:'3つの交点が一直線なら',body:'三角形の辺やその延長が、1本の直線とP・Q・Rで交わる図を探そう。\nPが辺BCの延長上にあっても、長さBP・PCは正の長さとして書けるよ。チェバは「3本が1点」、メネラウスは「3点が一直線」が目印だよ。'},
  {title:'延長部分を足してから代入',body:'例：B・C・Pの順に並び、BC：CP＝4：3、AR：RB＝1：2としよう。\n① BP＝BC＋CPなのでBP：PC＝7：3。\n② メネラウスの定理から(7/3)×(CQ/QA)×(1/2)＝1。\n③ CQ/QA＝6/7だから、CQ：QA＝6：7だよ。',formula:'(BP/PC)×(CQ/QA)×(AR/RB)＝1'},
  {title:'横断線上の比は、別の三角形を見る',body:'P・B・Cの順に並び、RがAC上、QがABとPRの交点なら、PQ：QRは三角形PCRで考えられるよ。\n直線A・Q・Bを横断線にして、(PB/BC)×(CA/AR)×(RQ/QP)＝1。\nCR：RAが分かっていても、CA＝CR＋RA。全体CAと部分CRを取り違えないようにしよう。'}
],[
  c('△ABCで、PはBCをC側へ延長した直線上、RはAB上、QはCA上にあり、P・Q・Rは一直線。BC：CP＝4：3、AR：RB＝1：2のとき、CQ：QAは？','6：7',['7：6','3：2','2：3'],'① B・C・Pの順なのでBP＝BC＋CP、BP：PC＝7：3。② メネラウスの定理で(7/3)×(CQ/QA)×(1/2)＝1。③ CQ/QA＝6/7だからCQ：QA＝6：7。BC/CPをそのまま使わないでね。',menelaus(4,3,1,2,['BC：CP＝4：3','AR：RB＝1：2'])),
  c('△ABCで、PはBCをC側へ延長した直線上、RはAB上、QはCA上にあり、P・Q・Rは一直線。BC：CP＝5：2、CQ：QA＝2：7のとき、AR：RBは？','1：1',['2：5','5：2','7：2'],'① BP：PC＝(5＋2)：2＝7：2。② メネラウスの定理から(7/2)×(2/7)×(AR/RB)＝1。③ AR/RB＝1だから、AR：RB＝1：1。RはABの中点だね。',menelaus(5,2,1,1,['BC：CP＝5：2','CQ：QA＝2：7'])),
  c('△ABCで、PはBCをC側へ延長した直線上、RはAB上、QはCA上にあり、P・Q・Rは一直線。BC＝12、CP＝8、AR：RB＝2：3のとき、CQ：QAは？','3：5',['5：3','2：3','3：2'],'① BP＝12＋8＝20だからBP/PC＝20/8＝5/2。② メネラウスの定理より(5/2)×(CQ/QA)×(2/3)＝1。③ CQ/QA＝3/5だからCQ：QA＝3：5だよ。',menelaus(12,8,2,3,['BC＝12、CP＝8','AR：RB＝2：3'])),
  c('△ABCで、PはBCをC側へ延長した直線上、RはAB上、QはCA上にあり、P・Q・Rは一直線。BP＝18、PC＝6、CQ：QA＝1：2のとき、AR：RBは？','2：3',['3：2','1：3','3：1'],'① BPとPCはすでに分かっているので、その比18/6＝3を使うよ。② メネラウスの定理から3×(1/2)×(AR/RB)＝1。③ AR/RB＝2/3だからAR：RB＝2：3。ここで18と6を足す必要はないよ。',menelaus(12,6,2,3,['BP＝18、PC＝6','CQ：QA＝1：2'])),
  n('△ABCで、PはBCをC側へ延長した直線上、RはAB上、QはCA上にあり、P・Q・Rは一直線。CQ：QA＝3：4、AR：RB＝2：3、CP＝6のとき、BCは？',6,'① メネラウスの定理から(BP/PC)×(3/4)×(2/3)＝1なのでBP：PC＝2：1。② PC＝6だからBP＝12。③ B・C・Pの順なのでBC＝BP−CP＝12−6＝6だよ。',menelaus(6,6,2,3,['CQ：QA＝3：4','AR：RB＝2：3','CP＝6'])),
  c('△ABCで、PはBCをC側へ延長した直線上、RはAB上、QはCA上にあり、P・Q・Rは一直線。BC：CP＝2：1、CQ：QA＝1：2のとき、AR：RBは？','2：3',['3：2','1：2','2：1'],'① BP：PC＝(2＋1)：1＝3：1。② メネラウスの定理から3×(1/2)×(AR/RB)＝1。③ AR：RB＝2：3。外側の点PまでのBP全体を使おう。',menelaus(2,1,2,3,['BC：CP＝2：1','CQ：QA＝1：2'])),
  c('P・B・Cはこの順に一直線。Aは直線PC上にない点、Rは辺AC上、QはABとPRの交点。PB：BC＝2：3、CR：RA＝5：2のとき、PQ：QRは？','7：3',['3：7','5：2','2：5'],'① △PCRを直線BQAが横切ると見て、メネラウスの定理を使うよ。CA：AR＝(5＋2)：2＝7：2。② (PB/BC)×(CA/AR)×(RQ/QP)＝1より、(2/3)×(7/2)×(RQ/QP)＝1。③ RQ/QP＝3/7だから、求めるPQ：QR＝7：3。最後は比の順番を確認しよう。',transversal(2,3,5,2,['PB：BC＝2：3','CR：RA＝5：2'])),
  c('P・B・Cはこの順に一直線。Aは直線PC上にない点、Rは辺AC上、QはABとPRの交点。PB：BC＝1：4、CR：RA＝3：2のとき、PQ：QRは？','5：8',['8：5','3：2','1：4'],'① △PCRにメネラウスの定理を使う。CA：AR＝(3＋2)：2＝5：2だよ。② (1/4)×(5/2)×(RQ/QP)＝1から、RQ/QP＝8/5。③ PQ：QRは逆の順なので5：8になるよ。',transversal(1,4,3,2,['PB：BC＝1：4','CR：RA＝3：2'])),
  n('B・C・Pがこの順に一直線に並び、BC＝7 cm、CP＝5 cmである。メネラウスの定理のBP/PCに使うBPは何cm？',12,'① 点の順がB・C・Pなので、BPはBCとCPを合わせた長さ。② BP＝7＋5。③ BP＝12 cmだよ。外側の点があるときは、まず全体と部分を区別しよう。',geometry({B:[65,150],C:[280,150],P:[435,150]},[['B','P']],['BC＝7 cm','CP＝5 cm'])),
  c('三角形の3辺またはその延長と、頂点を通らない1本の直線との交点の比を扱う定理は？','メネラウスの定理',['チェバの定理','三平方の定理','内角の二等分線の定理'],'① 交点が3つとも1本の直線上にあることに注目しよう。② この配置ではメネラウスの定理を使えるよ。③ チェバの定理の目印は、頂点から引いた3本が1点で交わること。図の条件から使う定理を選ぼう。')
]);

export const units = HQ.units;
export const cards = HQ.cards;
