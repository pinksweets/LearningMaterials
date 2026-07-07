/* ============================================================
   起動エントリ
============================================================ */
import { load, touchStreak } from "./state.js";
import { renderHome } from "./views/home.js";

document.addEventListener('DOMContentLoaded', function () {
  load();
  touchStreak();
  renderHome();
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
