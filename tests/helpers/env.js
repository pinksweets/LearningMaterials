/* tests/helpers/env.js — テスト用の最小スタブ（localStorage / document）
   js/state.js・js/audio.js 等は localStorage/document を「呼び出し時」に参照する
   （import 時ではない）ため、テスト側で globalThis に差し替えてから該当関数を
   呼び出せば、実装コードには一切手を入れずに検証できる。 */

/* Map ベースの localStorage スタブ。getItem は未設定キーに対し null を返す
   （本物の Web Storage 仕様どおり）。 */
export function createLocalStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
  };
}

/* 最小 document スタブ。DOM を実際には持たず、
   toast()/el() 等が「呼んでも例外にならない」程度の器を用意する。
   getElementById は仕様どおり null を返す（存在しない要素扱い）。 */
export function installDom() {
  const document = {
    addEventListener() {},
    getElementById() {
      return null;
    },
    createElement() {
      return {
        style: {},
        classList: { add() {}, remove() {} },
        appendChild() {},
        addEventListener() {},
      };
    },
    querySelectorAll() {
      return [];
    },
    body: { appendChild() {} },
  };
  globalThis.document = document;
  globalThis.window = globalThis;
  return document;
}
