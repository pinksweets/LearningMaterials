# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## プロジェクト概要

「学習クエスト」— 高校生向けのゲーミフィケーション・クイズ教材（歴史総合・数学Ⅰ・総合英語 Harmony・生物基礎 visual・電気回路１・数学A・LEAP Basic 必携英単語の7教科カード）。**GitHub Pages（https://pinksweets.github.io/LearningMaterials/）での公開が前提**の純フロントエンド ESM アプリで、ビルドステップ・サーバーサイド処理・npm 依存・外部CDNは一切ない。PWA 化されており、一度開けばオフラインでも学習できる。ローカルで確認する場合は ES Modules（`import`）を使っているため `file://` の直開きは不可で、簡易HTTPサーバー（`python3 -m http.server` など）経由で開く必要がある。

## 実行・検証コマンド

ビルド・lintは無い。検証はこのプロジェクトの慣行として以下で行う：

```bash
# ローカル動作確認（ESM import のため file:// 直開きは不可。必ずHTTPサーバー越しに開く）
python3 -m http.server 8000
# → ブラウザで http://localhost:8000 を開く

# テスト一式（node:test。依存ゼロ・npm install不要）
node --test tests/*.test.js

# 構文チェック（package.json の "type":"module" によりESMとして検証される）
node --check js/main.js
node --check data/index.js
# 他ファイルも同様に1本ずつ、または find/ForEach-Object でループしてチェックする。

# data/ 移行・改修時の突合検証（旧アーキテクチャとの完全一致を検証。恒久スクリプト）
node tools/verify-data-migration.mjs
node tools/verify-data-migration.mjs <ベースgit ref>   # 省略時は origin/main
```

機能テストは `tests/`（`node:test`）に集約されている。DOM込みの検証は jsdom か Codex Preview（http 配信でも壊れない設計）を使う。

## 絶対に壊してはいけない制約

1. **ビルド不要・相対パスのみ**：ビルドステップ・npm依存・外部CDN・外部フォントは使用禁止。ソースファイルをそのまま配信する。**全参照は相対パス**にすること（GitHub Pages はサブパス `/LearningMaterials/` 配信のため、絶対パス `/js/...` 等は本番で壊れる。Service Worker のスコープや `manifest.webmanifest` の `start_url`/アイコンパスも同様に相対で書く）。
2. **セーブデータ互換**：`SAVE_KEY = 'rekishi-quest-v1'`（`js/state.js`）は改名しない。`state` に新フィールドを足すときは `load()` で旧データ（フィールド欠落）をデフォルト値でマージする。
3. **qStats キーは位置ベース**：学習履歴は `"単元ID-配列インデックス"`（例 `"m1s1-0"`）で保存される。**既存問題の並び替え・途中挿入は禁止、追加は必ず配列末尾**。単元IDにはハイフンを使わない。単元ID変更時は `cleanupStaleQStats()`（load 時に現存キーでフィルタ）が残留キーを掃除する。
4. **既存の問題データ（問題文・選択肢・正解・解説）は改変しない**。移植・リファクタ時は元データとの全件突合で無改変を検証するのが慣行（`tools/verify-data-migration.mjs` 参照）。
5. **モジュール層規約**：依存は一方向 `data/*` → `js/content.js` → `js/state.js` → `js/audio.js` → `js/views/*` → `js/main.js`。`js/utils.js` / `js/answers.js` / `js/timer.js` / `js/fever.js` は他モジュールを import しない葉（leaf）モジュール。`js/views/*.js` は「import と `export function` 宣言のみ」で構成し、トップレベルの実行文・`const` は書かない（view 同士が循環 import し合う構造を、関数宣言の巻き上げで安全に成立させるための規約）。モジュール横断で共有する可変状態（`state`／`TIMER`／`AUDIO`／`BGM` など）は必ずコンテナオブジェクトの**プロパティ**を書き換える形にする（`import` した束縛そのものへの再代入はESM仕様上 `TypeError` になる）。

## アーキテクチャ

### データ自己登録（registry パターン、ESM版）

各 `data/*.js` は先頭2行で `data/_registry.js` の `createRegistry()` を呼び、自分専用の `HQ`（`{units:[], cards:[]}`）を生成する。本体（`HQ.registerUnit({id, subject, group, title, desc, order, questions, cards})` の呼び出し）は classic-script 時代からバイト単位で無改変。末尾2行で `export const units = HQ.units; export const cards = HQ.cards;` として自分の登録内容を公開する。`data/index.js` が旧 `index.html` の `<script>` 読み込み順のまま12ファイルを `import * as ...` で集約し、`units`（全単元の結合）と `sharedCards`（`HQ.registerCards` による共有カード）をエクスポートする。`js/content.js` がこれを読み込み、起動時に `QUESTIONS` / `STAGE_ORDER`（order 昇順のフラット配列）/ `CARDS` を組み立てる。単元・教科を追加してもこの下のロジックは無変更で自動追従する（教科カード・称号閾値・図鑑総数・「全◯問」表示はすべて動的算出）。新しい data ファイルを追加したら `data/index.js` に import を1行足す（`js/main.js` 側の変更は不要）。

### 画面遷移（2階層ナビゲーション）

`renderHome()`（`js/views/home.js`）＝教科選択画面（教科カード・グローバルHUD・今日の復習・図鑑・設定）→ `renderSubjectHome(subject)`（`js/views/subject.js`）＝教科ホーム（その教科のステージのみ、`group` 変化点に `.groupHead`）→ `renderQuestion()`（`js/views/quiz.js`）→ `renderResult()`（`js/views/results.js`）。戻り先の教科は専用のモジュール変数では保持せず、その場で `QUESTIONS[c.sid].subject`（`c` は現在のプレイセッション `state.cur`）から都度導出する：stage/boss の結果・中断は直前の教科ホームへ、review・図鑑は教科選択画面へ戻る。

### 問題タイプ（8種）と採点

`yon`(4択) / `maru`(○×・スワイプ対応) / `ana`(穴埋め・記述モード設定で入力式化) / `kumi`(組み合わせ) / `nenpyo`(年表・year昇順) / `suji`(数値入力・常時入力式) / `fill`(複数穴埋め) / `junban`(手順並べ替え・`a`の順序基準)。書式例は README.md 参照。採点は各 `check*` 関数（`js/views/quiz.js`）→ 共通 `finishQuestion(isCorrect, q, opts)`（同ファイル）。文字列比較は `normalizeAnswer`／`isAnswerMatch`／`isAnyAnswerMatch`（`js/answers.js`。全角半角・記号ゆらぎ吸収）＋ suji/fill は `parseFloat` 数値フォールバック。

### 守るべきガード機構（バグ修正の歴史・すべて js/views/quiz.js）

- **`c._locked`**（`finishQuestion` 冒頭）：スワイプ＋クリック等の二重発火による二重採点を防ぐ。`renderQuestion` 冒頭で解除＋`c.i` 範囲外なら `renderResult()` へ逃がす。
- **「次へ」ボタン**：`nextWrap.innerHTML=''` でクリアしてから生成要素に直接バインド（`getElementById` は同 id 重複時に最初の要素しか返さないため）。次問へ進む際に `delete c._nenpyoOrder` / `delete c._forceChoice`（前問の一時状態を持ち越さない）。
- **タイマー**：単一ハンドルの `TIMER`（`js/timer.js`）を `stopTimer()` で管理。回答確定・次へ・中断・ボス勝敗・再描画のすべての離脱経路で停止する。新しい画面遷移を足すときは stopTimer 漏れに注意。
- **日付**：`toISOString()` は UTC ずれするため使わない。`todayStr()`/`addDays()`（`js/utils.js`。ローカル日付の "YYYY-MM-DD"）を使う。

### 進捗・モチベーション系（主に js/state.js・js/fever.js）

SRS は Leitner 方式（`box` 0–5、間隔 `[0,1,3,7,14,30]` 日、`box>=3` でマスター）。`dueList()` が教科横断の「今日の復習」を生成。ストリークは `touchStreak()`（同日不変/前日+1/それ以外1）。称号（`TITLES`/`evalTitle`）・図鑑（`card` タグ→ `unlockCard`）・ボス戦（stage クリアで解放、lives=3・タイムアタック強制ON）・連続正解フィーバー（`js/fever.js`）。

## PWA 運用

`sw.js` は network-first（オンライン時は常に最新を取得し、オフライン時はキャッシュへフォールバック）。**`js`/`data`/`css`/`icons` 配下のアセットを追加・削除したら、`sw.js` の `ASSETS` 一覧を更新し、`CACHE_NAME` を必ずバンプする**こと（バンプを忘れると古いキャッシュが残り続ける）。`tests/` の sw-assets 系テストが、この更新漏れ（`ASSETS` に存在しないファイル／存在するのに載っていないファイル）を検出する。

## コンテンツ運用ルール

- UI 文言・解説は生徒への優しい語りかけ調（既存の `exp`/トーストのトーンに合わせる）。数式は Unicode テキスト（x², √, ＋−）で表現し、数式ライブラリは入れない。
- 数学Ⅰは「小カテゴリ＝1ステージ＝ちょうど10問」の運用（技術的制約ではなく運用ルール）。新規の数学問題は正答を機械検証（乱数代入・境界値チェック等）してから追加するのが慣行。
- 単元ファイルを新規追加する手順：① `data/xxx.js` を新設（先頭2行のシム＋本体の `HQ.registerUnit` 呼び出し＋末尾2行の export、書式は既存ファイル参照）→ ② `data/index.js` に import を1行追加 → ③ `sw.js` の `ASSETS` に追加し `CACHE_NAME` をバンプ → ④ `tests/fixtures/question-digests.json` に**末尾追加のみ**で反映（既存エントリの並び替え・削除はしない）→ ⑤ `node --test tests/*.test.js` が緑になることを確認。
- 進捗リセット：ブラウザコンソールで `localStorage.removeItem('rekishi-quest-v1')`。
