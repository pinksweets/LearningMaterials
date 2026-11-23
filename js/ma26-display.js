// 数学A対策の問題条件だけを描く模式図。解答値は含めない。
export function mathADiagram(spec){
  if(spec?.kind==='geometry')return geometryDiagram(spec);
  if(!spec || !['internal','external','parallel','inner','outer','circum','right'].includes(spec.kind))return '';
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const t=(x,y,v)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="18">${esc(v)}</text>`;
  const path=d=>`<path d="${d}" fill="none" stroke="#344968" stroke-width="2.5"/>`;
  let drawing='';
  if(spec.kind==='internal')drawing=path('M50 130 H450')+t(50,155,'A')+t(285,155,'P')+t(450,155,'B')+path('M50 123 V137 M285 123 V137 M450 123 V137');
  if(spec.kind==='external')drawing=path('M40 130 H460')+t(40,155,'A')+t(250,155,'B')+t(460,155,'Q')+path('M40 123 V137 M250 123 V137 M460 123 V137');
  if(spec.kind==='parallel')drawing=path('M240 35 L70 205 L430 205 Z M185 90 H300')+t(240,25,'A')+t(55,215,'B')+t(445,215,'C')+t(170,92,'P')+t(315,92,'Q')+t(240,128,'PQ ∥ BC');
  if(spec.kind==='inner')drawing=path('M210 35 L60 210 L440 210 Z M210 35 L230 210')+t(210,25,'A')+t(45,218,'B')+t(455,218,'C')+t(230,232,'D')+t(205,105,'∠BAD = ∠DAC');
  if(spec.kind==='outer')drawing=path('M210 60 L45 210 L315 210 Z M45 210 H465 M210 60 L465 210 M210 60 L265 10')+t(205,45,'A')+t(30,218,'B')+t(315,235,'C')+t(465,232,'D')+t(365,65,'AD：外角二等分線');
  if(spec.kind==='right')drawing=path('M250 25 L70 205 L430 205 Z M250 25 L250 205 M235 40 L250 55 L265 40')+t(250,18,'A')+t(55,213,'B')+t(445,213,'C')+t(250,230,'O')+t(320,170,'BO = OC');
  if(spec.kind==='circum'){
    let A=[250,35],B=[75,205],C=[425,205],O=[250,145];
    if(Number.isFinite(spec.b)&&Number.isFinite(spec.c)){
      // 円周上の3点から外心が内側にある正確な図を作る。
      const angleB=spec.b+spec.c,angleC=90-spec.b;
      const pt=deg=>{const r=deg*Math.PI/180;return [250+95*Math.cos(r),135+95*Math.sin(r)];};
      A=pt(270);B=pt(270-2*angleC);C=pt(270+2*angleB);O=[250,135];
    }
    const xy=p=>p.join(' ');
    drawing=path(`M${xy(A)} L${xy(B)} L${xy(C)} Z M${xy(A)} L${xy(O)} L${xy(B)} M${xy(O)} L${xy(C)}`)+`<circle cx="${O[0]}" cy="${O[1]}" r="95" fill="none" stroke="#9babc4" stroke-dasharray="4 4"/>`;
    for(const [name,p,dy] of [['A',A,-9],['B',B,20],['C',C,20],['O',O,-7]])drawing+=t(p[0],p[1]+dy,name);
  }
  const labels=(spec.labels||[]).map(esc).join(' ／ ');
  return `<figure data-ma-diagram="${spec.kind}" style="margin:12px 0;background:#f4f7fc;color:#243650;border-radius:12px;padding:8px"><svg viewBox="0 0 500 260" role="img" aria-label="${labels}" style="width:100%;max-width:500px;display:block;margin:auto"><title>${labels}</title><g fill="#243650">${drawing}</g></svg><figcaption style="text-align:center;font-size:.85rem">${labels}<br>位置関係を示す図だよ。長さ・角度は問題の条件を使おう。</figcaption></figure>`;
}

// 点と線分を指定する図形教材用。描くのは位置関係と問題の条件だけ。
function geometryDiagram(spec){
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pair=value=>Array.isArray(value)&&value.length===2&&value.every(Number.isFinite);
  if(!spec.points || typeof spec.points!=='object' || Array.isArray(spec.points))return '';
  const points=new Map(Object.entries(spec.points).filter(([,p])=>pair(p)));
  if(points.size<2)return '';
  const labels=Array.isArray(spec.labels)?spec.labels.filter(value=>['string','number'].includes(typeof value)).map(esc):[];
  const caption=labels.join(' ／ ');
  const description=caption || '問題の点と線分の位置関係';
  const circles=(Array.isArray(spec.circles)?spec.circles:[])
    .filter(c=>c&&[c.cx,c.cy,c.r].every(Number.isFinite)&&c.r>0)
    .map(c=>`<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="none" stroke="#7287a6" stroke-width="2"/>`).join('');
  const segments=(Array.isArray(spec.segments)?spec.segments:[])
    .filter(s=>Array.isArray(s)&&s.length===2&&s.every(name=>points.has(name)))
    .map(([a,b])=>{const p=points.get(a),q=points.get(b);return `<path d="M${p[0]} ${p[1]} L${q[0]} ${q[1]}" fill="none" stroke="#344968" stroke-width="2.5"/>`;}).join('');
  const vertices=[...points].map(([name,[x,y]])=>{
    const offset=spec.pointOffsets?.[name];
    const [dx,dy]=pair(offset)?offset:[x<250?-14:14,y<150?-12:22];
    const tx=Math.max(12,Math.min(488,x+dx)),ty=Math.max(22,Math.min(288,y+dy));
    return `<circle cx="${x}" cy="${y}" r="3" fill="#243650"/><text x="${tx}" y="${ty}" text-anchor="middle" font-size="20" fill="#243650" stroke="#f4f7fc" stroke-width="4" paint-order="stroke">${esc(name)}</text>`;
  }).join('');
  return `<figure data-ma-diagram="geometry" style="margin:12px 0;background:#f4f7fc;color:#243650;border-radius:12px;padding:8px"><svg viewBox="0 0 500 300" role="img" aria-label="${description}" style="width:100%;max-width:500px;display:block;margin:auto"><title>${description}</title><desc>点の位置と線分のつながりを示す模式図。長さや角度は問題文の条件を使います。</desc>${circles}${segments}${vertices}</svg><figcaption style="text-align:center;font-size:.85rem">${caption?caption+'<br>':''}位置関係を示す図だよ。長さ・角度は問題の条件を使おう。</figcaption></figure>`;
}
