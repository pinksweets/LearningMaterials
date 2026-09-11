/* ============================================================
   起動エントリ
============================================================ */
import { load, touchStreak } from "./state.js";
import { renderHome } from "./views/home.js";
import { renderSeptemberHome } from "./views/september.js";
import { renderSeptember15Home } from "./views/september15.js";
import { testPrepRoute } from "./utils.js";

export function renderUrlScreen(){
  const route=testPrepRoute(window.location.hash);
  if(route==='september15')renderSeptember15Home(true);
  else if(route==='september')renderSeptemberHome(true);
  else renderHome();
}

document.addEventListener('DOMContentLoaded', function () {
  load();
  touchStreak();
  renderUrlScreen();
  window.addEventListener('hashchange',renderUrlScreen);
});

/* Service Worker 登録（https または localhost のみ。GitHub Pages のサブパス配信でも
   ドキュメント基準の相対 URL で正しいスコープに解決される） */
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator &&
    typeof location !== 'undefined' &&
    (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
