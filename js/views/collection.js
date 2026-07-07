import { el, app } from "../utils.js";
import { stopBossTension } from "../audio.js";
import { CARDS } from "../content.js";
import { state } from "../state.js";
import { renderHome } from "./home.js";

/* ============================================================
   コレクション図鑑
============================================================ */
export function renderCollection(){
  stopBossTension();
  const cardsHtml = CARDS.map(c=>{
    const owned=state.cards.has(c.id);
    return owned
      ? `<div class="collCard"><div class="emoji">${c.emoji}</div><div class="name">${c.name}</div><div class="kind">${c.kind}</div><div class="desc">${c.desc}</div></div>`
      : `<div class="collCard locked"><div class="emoji">🔒</div><div class="name">？？？</div><div class="kind">${c.kind}</div><div class="desc">問題に正解すると解放</div></div>`;
  }).join("");

  app().innerHTML="";
  app().appendChild(el(`<div>
    <h1>📖 学習図鑑</h1>
    <div class="sub">問題に正解して、重要人物・条約・できごと・公式を集めよう！</div>
    <div class="card">
      <div class="hud">
        <span class="chip">解放 <span class="em">${state.cards.size}</span>/${CARDS.length}</span>
      </div>
      <div class="collGrid">${cardsHtml}</div>
      <button class="btn secondary small" id="collHome" style="margin-top:14px">← ホームにもどる</button>
    </div>
  </div>`));
  document.getElementById('collHome').addEventListener('click',renderHome);
}
