// Paste into Apps Script. Deploy as owner, accessible to Anyone.
const SPREADSHEET_ID = '1-IrnMRAI7-Czu4LR5iAWc-AaGn76Q5vx74SbdqmYw6A';
const SHEET_NAME = '学習実績';
const HEADERS = ['実績ID','受信日時','完了日時','タイムゾーン','学習者コード','モード','単元ID','タイトル','教科','終了状態','途中からの練習','回答・判定数','正解数','正答率','得点','覚えた語数（自己判定）','学習秒数（LEAP）'];

function setup() {
  const book = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#e8f0fe');
  }
  const actual = sheet.getRange(1,1,1,HEADERS.length).getValues()[0];
  if (JSON.stringify(actual) !== JSON.stringify(HEADERS)) throw new Error('学習実績タブの列が一致しません。既存タブを別名にしてからsetupを実行してください。');
  return sheet;
}

function validateReport(p) {
  const count = n => Number.isInteger(n) && n >= 0 && n <= 1000000;
  if (!p || p.version !== 1 || !/^[0-9a-f-]{36}$/i.test(p.id) || !/^[-A-Za-z0-9_]{1,64}$/.test(p.learner)) throw new Error('invalid identity');
  if (!['stage','review','boss','leap-speed'].includes(p.mode) || !['normal','victory','defeat','time','complete'].includes(p.outcome)) throw new Error('invalid mode');
  if (!count(p.answered) || p.answered === 0 || typeof p.partial !== 'boolean') throw new Error('invalid count');
  if (!Number.isSafeInteger(p.completedAt) || p.completedAt < 0 || p.completedAt > Date.now()+86400000) throw new Error('invalid time');
  for (const key of ['stage','title','subject','timezone']) if (typeof p[key] !== 'string' || p[key].length > 300) throw new Error('invalid text');
  if (p.mode === 'leap-speed') {
    if (p.correct !== null || p.score !== null || !count(p.learned) || p.learned > p.answered || !count(p.elapsedSeconds) || !['time','complete'].includes(p.outcome)) throw new Error('invalid leap');
  } else if (!count(p.correct) || p.correct > p.answered || !count(p.score) || p.learned !== null || p.elapsedSeconds !== null || !['normal','victory','defeat'].includes(p.outcome)) throw new Error('invalid quiz');
  return p;
}

function safeText(value) {
  // Treat learner-controlled strings as literal text, never spreadsheet formulas.
  return /^[\s]*[=+@-]/.test(value) ? "'" + value : value;
}

function storeReport(p) {
  validateReport(p);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = setup();
    const last = sheet.getLastRow();
    const duplicate = last > 1 && sheet.getRange(2,1,last-1,1).createTextFinder(p.id).matchEntireCell(true).findNext();
    if (!duplicate) {
      sheet.appendRow([p.id,new Date(),new Date(p.completedAt),safeText(p.timezone),safeText(p.learner),p.mode,safeText(p.stage),safeText(p.title),safeText(p.subject),p.outcome,p.partial,p.answered,p.correct === null ? '' : p.correct,p.correct === null ? '' : Math.round(p.correct/p.answered*100),p.score === null ? '' : p.score,p.learned === null ? '' : p.learned,p.elapsedSeconds === null ? '' : p.elapsedSeconds]);
      SpreadsheetApp.flush();
    }
    return {ok:true,id:p.id};
  } finally { lock.releaseLock(); }
}

function doPost(e) {
  let receipt;
  try {
    if (!e.postData || e.postData.contents.length > 10000) throw new Error('invalid size');
    receipt = storeReport(JSON.parse(e.postData.contents));
  } catch (error) {
    receipt = {ok:false,error:'記録できませんでした。管理者に確認してください。'};
  }
  return ContentService.createTextOutput(JSON.stringify(receipt)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  // No records or student information are exposed by this endpoint.
  return ContentService.createTextOutput(JSON.stringify({service:'learning-quest-reporting',version:1})).setMimeType(ContentService.MimeType.JSON);
}
