/* ============================================================
   学習クエスト Service Worker

   戦略: network-first
   - オンライン時は常にネットワークから最新のファイルを取得する
     （キャッシュだけを見て古い問題データや修正前のコードが
     表示され続ける事故を防ぐ）。
   - オフライン時（電波が悪い場所・機内モードなど）はキャッシュに
     フォールバックし、一度開いたことがあれば学習を継続できる。

   運用ルール:
   - js/ data/ css/ icons/ 配下のアセットを追加・削除したら、
     このファイルの ASSETS を必ず更新すること。
   - ASSETS を更新したら CACHE_NAME を必ずバンプすること
     （バンプを忘れると古いキャッシュがいつまでも残り続ける）。
============================================================ */

const CACHE_NAME = 'gakushu-quest-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './js/main.js',
  './js/content.js',
  './js/utils.js',
  './js/answers.js',
  './js/state.js',
  './js/audio.js',
  './js/timer.js',
  './js/fever.js',
  './js/views/home.js',
  './js/views/subject.js',
  './js/views/collection.js',
  './js/views/quiz.js',
  './js/views/results.js',
  './data/_registry.js',
  './data/index.js',
  './data/s1_versailles.js',
  './data/s2_asia.js',
  './data/s3_eastasia.js',
  './data/m1_suushiki.js',
  './data/m2_shuugou.js',
  './data/m3_nijikansuu.js',
  './data/e1_harmony_wordorder.js',
  './data/e2_harmony_tense.js',
  './data/b1_visual_metabolism.js',
  './data/b2_visual_enzymes.js',
  './data/ec1_denki_kairo1.js',
  './data/ma1_suugaku_a.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GET 以外（POST等）は対象外。クロスオリジン（YouTube 等）も素通しする。
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') return caches.match('./');
          return undefined;
        })
      )
  );
});
