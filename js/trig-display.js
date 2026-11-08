import { escapeHtml } from './utils.js';

// 図は位置関係を示す模式図。長さ・角度の条件はラベルと問題文で示す。
export function trigDiagram(d) {
  if (!d) return '';
  const t=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="20" fill="#18354a">${escapeHtml(s)}</text>`;
  let drawing;
  if(d.kind==='circle') {
    drawing='<path d="M80 210 A160 160 0 0 1 400 210 M50 210 H430 M240 235 V25" fill="none" stroke="#456478" stroke-width="2"/>'+
      '<path d="M240 210 L160 71 L160 210" fill="none" stroke="#247b83" stroke-width="3"/>'+
      '<path d="M285 210 A45 45 0 0 0 217.5 171" fill="none" stroke="#b44836" stroke-width="3"/>'+
      t(270,162,'120°')+t(125,55,'P(−1/2, √3/2)')+t(263,237,'O')+t(420,237,'x')+t(261,25,'y')+t(317,237,'1')+t(200,125,'1');
  } else {
    const general=d.kind==='general';
    drawing=`<path d="M70 235 L400 235 L${general?240:400} 55 Z" fill="#eef8f8" stroke="#247b83" stroke-width="3"/>`+
      t(50,258,'A')+t(423,258,'B')+t(general?240:420,40,'C')+
      t(235,264,d.base||'4')+t(general?353:445,150,d.vertical||'3')+t(general?132:215,130,d.slope||'5');
    if(!general) drawing+='<path d="M380 235 V215 H400" fill="none" stroke="#456478" stroke-width="2"/>'+
      (d.theta==='C'?'<path d="M400 100 A45 45 0 0 1 360 77" fill="none" stroke="#b44836" stroke-width="3"/>'+t(375,117,'θ'):
        '<path d="M115 235 A45 45 0 0 0 110 213" fill="none" stroke="#b44836" stroke-width="3"/>'+t(133,220,d.angle||'θ'));
  }
  const caption=d.caption||(d.kind==='circle'?'半径1の半円：横座標がcos θ、縦座標がsin θ。':'∠B＝90°。斜辺はAC。θの位置を確かめよう。');
  return `<figure class="trigFigure" style="margin:1em 0"><svg viewBox="0 0 500 290" role="img" aria-label="${escapeHtml(caption)}" style="width:100%;max-width:560px;background:#fff;border-radius:12px"><title>${escapeHtml(caption)}</title>${drawing}</svg><figcaption>${escapeHtml(caption)}（模式図）</figcaption></figure>`;
}
