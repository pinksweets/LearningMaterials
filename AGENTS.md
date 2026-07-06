# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## プロジェクト概要

「学習クエスト」— 高校生向けのゲーミフィケーション・クイズ教材（歴史総合＋数学Ⅰ）。純粋なフロントエンドで、ビルド・サーバー・外部依存が一切ない。`index.html` をダブルクリック（`file://`）で開いて動くことが最重要の制約。

## 実行・検証コマンド

ビルド・lint・テストフレームワークは無い。検証はこのプロジェクトの慣行として以下で行う：

```powershell
# 構文チェック（読み込み順どおりに全ファイル）
node --check js/registry.js; node --check js/app.js
Get-ChildItem data/*.js | ForEach-Object { node --check $_.FullName }

# 動作確認：index.html をブラウザで開く（file:// で可、サーバー不要）
```

機能テストは node で registry.js → data/*.js（index.html の記載順）→ app.js を連結評価し、`document`/`localStorage` のスタブを与えて採点関数・SRS・保存復元を直接呼ぶ方式が実績あり。DOM 込みの検証は jsdom か Codex Preview（http 配信でも壊れない設計）を使う。

## 絶対に壊してはいけない制約

1. **file:// 互換**：`fetch` / `XMLHttpRequest` / ES Modules（`import`・`type="module"`）/ 外部CDN・フォントは使用禁止。データ読み込みは classic `<script src>` の自己登録方式のみ。
2. **セーブデータ互換**：`SAVE_KEY = 'rekishi-quest-v1'`（js/app.js）は改名しない。`state` に新フィールドを足すときは `load()` で旧データ（フィールド欠落）をデフォルト値でマージする。
3. **qStats キーは位置ベース**：学習履歴は `"単元ID-配列インデックス"`（例 `"m1s1-0"`）で保存される。**既存問題の並び替え・途中挿入は禁止、追加は必ず配列末尾**。単元IDにはハイフンを使わない。単元ID変更時は `cleanupStaleQStats()`（load 時に現存キーでフィルタ）が残留キーを掃除する。
4. **既存の問題データ（問題文・選択肢・正解・解説）は改変しない**。移植・リファクタ時は元データとの全件突合で無改変を検証するのが慣行。

## アーキテクチャ

### データ自己登録（registry パターン）

読み込み順が仕様：`js/registry.js`（`window.HQ` 定義）→ `data/*.js`（各ファイルが `HQ.registerUnit({id, subject, group, title, desc, order, questions, cards})` を呼ぶ）→ `js/app.js`（起動時に `HQ.units` から `QUESTIONS` / `STAGE_ORDER`（order 昇順のフラット配列）/ `CARDS` を組み立て）。単元・教科を追加してもエンジンは無変更で自動追従する（教科カード・称号閾値・図鑑総数・「全◯問」表示はすべて動的算出）。

### 画面遷移（2階層ナビゲーション）

`renderHome()`＝教科選択画面（教科カード・グローバルHUD・今日の復習・図鑑・設定）→ `renderSubjectHome(subject)`＝教科ホーム（その教科のステージのみ、`group` 変化点に `.groupHead`）→ `renderQuestion()` → `renderResult()`。モジュール変数 `currentSubject` が戻り先を保持：stage/boss の結果・中断は直前の教科ホームへ、review・図鑑は教科選択画面へ戻る。

### 問題タイプ（8種）と採点

`yon`(4択) / `maru`(○×・スワイプ対応) / `ana`(穴埋め・記述モード設定で入力式化) / `kumi`(組み合わせ) / `nenpyo`(年表・year昇順) / `suji`(数値入力・常時入力式) / `fill`(複数穴埋め) / `junban`(手順並べ替え・`a`の順序基準)。書式例は README.md 参照。採点は各 `check*` 関数 → 共通 `finishQuestion(isCorrect, q, opts)`。文字列比較は `normalizeAnswer`（全角半角・記号ゆらぎ吸収）＋ suji/fill は `parseFloat` 数値フォールバック。

### 守るべきガード機構（バグ修正の歴史）

- **`_locked`**（finishQuestion 冒頭）：スワイプ＋クリック等の二重発火による二重採点を防ぐ。`renderQuestion` 冒頭で解除＋`c.i` 範囲外なら `renderResult()` へ逃がす。
- **「次へ」ボタン**：`nextWrap.innerHTML=''` でクリアしてから生成要素に直接バインド（`getElementById` は同 id 重複時に最初の要素しか返さないため）。次問へ進む際に `delete c._nenpyoOrder` / `delete c._forceChoice`（前問の一時状態を持ち越さない）。
- **タイマー**：単一ハンドル `TIMER` を `stopTimer()` で管理。回答確定・次へ・中断・ボス勝敗・再描画のすべての離脱経路で停止する。新しい画面遷移を足すときは stopTimer 漏れに注意。
- **日付**：`toISOString()` は UTC ずれするため使わない。`todayStr()`/`addDays()`（ローカル日付の "YYYY-MM-DD"）を使う。

### 進捗・モチベーション系

SRS は Leitner 方式（`box` 0–5、間隔 `[0,1,3,7,14,30]` 日、`box>=3` でマスター）。`dueList()` が教科横断の「今日の復習」を生成。ストリークは `touchStreak()`（同日不変/前日+1/それ以外1）。称号（`TITLES`/`evalTitle`）・図鑑（`card` タグ→ `unlockCard`）・ボス戦（stage クリアで解放、lives=3・タイムアタック強制ON）。

## コンテンツ運用ルール

- UI 文言・解説は生徒への優しい語りかけ調（既存の `exp`/トーストのトーンに合わせる）。数式は Unicode テキスト（x², √, ＋−）で表現し、数式ライブラリは入れない。
- 数学Ⅰは「小カテゴリ＝1ステージ＝ちょうど10問」の運用（技術的制約ではなく運用ルール）。新規の数学問題は正答を機械検証（乱数代入・境界値チェック等）してから追加するのが慣行。
- `高校数学Ⅰ/` フォルダは移植元アーカイブ（動作には不使用）。触らない。
- 進捗リセット：ブラウザコンソールで `localStorage.removeItem('rekishi-quest-v1')`。
