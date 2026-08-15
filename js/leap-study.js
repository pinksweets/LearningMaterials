/* LEAP Basic 高速周回の表示データ抽出とキュー制御。
   DOM・state・時計に依存しないため、ブラウザと node:test の両方で検証できる。 */

export const LEAP_BASIC_SUBJECT = "📘 LEAP Basic 必携英単語";
export const LEAP_SESSION_SECONDS = 180;
export const LEAP_DAILY_TARGET = 3;

export function countsAsLeapDailySession(reason) {
  return reason === "time" || reason === "complete";
}

function quotedValues(text) {
  const values = [];
  const re = /「([^」]+)」/g;
  let match;
  while ((match = re.exec(String(text || "")))) values.push(match[1]);
  return values;
}

function splitMeaning(value) {
  const text = String(value || "").trim();
  if (!text) return { firstMeaning: "", additionalMeanings: "" };
  // 「ほかの物・人」のように中黒が語義の一部になるため、中黒では分割しない。
  const parts = text.split(/[、／/]/).map((part) => part.trim()).filter(Boolean);
  return {
    firstMeaning: parts[0] || text,
    additionalMeanings: parts.slice(1).join(" / ")
  };
}

function nuanceText(exp, headword, meaning) {
  let text=String(exp||'').trim();
  if(headword&&meaning){
    const first=`「${headword}」は「${meaning}」を表します。`;
    if(text.startsWith(first))return text.slice(first.length).trim();
    const answerPrefix=`答えは「${headword}」。`;
    if(text.startsWith(answerPrefix))return text.slice(answerPrefix.length).trim();
  }
  const completedPrefix=text.match(/^完成例：.*?。/);
  if(completedPrefix)return text.slice(completedPrefix[0].length).trim();
  return text;
}

/*
  3コースの q/exp 形式から、学習カードに必要な見出語と意味だけを抜き出す。
  Course 1 は q に見出語・choices に意味、Course 2/3 は q に意味・exp に見出語が
  入るため、文字列の位置ではなく文型を優先して判定する。
*/
export function extractLeapEntry(question) {
  const q = String(question && question.q || "");
  const exp = String(question && question.exp || "");
  const hint = String(question && question.hint || "");
  const qQuotes = quotedValues(q);
  const expQuotes = quotedValues(exp);
  const courseOne = /の基本的な意味/.test(q);
  const meaningQuestion = /を表す見出語|に当たる見出語/.test(q);

  let headword = "";
  if (expQuotes.length) headword = expQuotes[0];
  if (!headword && courseOne) headword = qQuotes[0] || "";
  if (!headword && question && Array.isArray(question.choices) && Number.isInteger(question.a)) {
    headword = meaningQuestion ? "" : String(question.choices[question.a] || "");
  }

  let meaning = "";
  const courseOneMeaning = exp.match(/」は「([^」]+)」を表/);
  const escapedHeadword = headword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const usageMeaning = headword
    ? exp.match(new RegExp("「" + escapedHeadword + "」を「([^」]+)」の意味"))
    : null;
  if (courseOneMeaning) meaning = courseOneMeaning[1];
  else if (usageMeaning) meaning = usageMeaning[1];
  else if (meaningQuestion) meaning = qQuotes[0] || "";
  else if (courseOne && question && Array.isArray(question.choices) && Number.isInteger(question.a)) {
    meaning = String(question.choices[question.a] || "");
  }

  const meaningParts = splitMeaning(meaning);
  return {
    headword: headword.trim(),
    meaning: meaning.trim(),
    firstMeaning: meaningParts.firstMeaning,
    additionalMeanings: meaningParts.additionalMeanings,
    nuance: nuanceText(exp, headword.trim(), meaning.trim()),
    hint
  };
}

export function isLeapSubject(subject) {
  return String(subject || "") === LEAP_BASIC_SUBJECT;
}

export function isLeapCourseOneQuestion(question) {
  return /の基本的な意味/.test(String(question && question.q || ""));
}

export function shouldShowLeapWordBeforeAnswer(question) {
  return isLeapCourseOneQuestion(question);
}

function entryId(entry, index) {
  return String(entry && entry._key || entry && entry.id || index);
}

/* 初回キューを作り、現在カードを1枚だけ取り出す。DOMを一括生成しない。 */
export function createLeapSession(items, options = {}) {
  const now = Number.isFinite(options.now) ? options.now : Date.now();
  const duration = Number.isFinite(options.durationSeconds) ? Math.max(1, options.durationSeconds) : LEAP_SESSION_SECONDS;
  const entries = Array.from(items || []).map((question, index) => ({
    question,
    id: entryId(question, index),
    index
  }));
  const pending = entries.slice();
  return {
    startedAt: now,
    endsAt: now + duration * 1000,
    durationSeconds: duration,
    pending,
    retry: [],
    current: pending.shift() || null,
    round: 1,
    rounds: 1,
    judged: 0,
    learned: new Set(),
    history: [],
    finished: !entries.length,
    endedReason: entries.length ? "" : "empty",
    completedAt: entries.length ? 0 : now
  };
}

export function remainingLeapCount(session) {
  if (!session) return 0;
  return (session.current ? 1 : 0) + (session.pending ? session.pending.length : 0) + (session.retry ? session.retry.length : 0);
}

function advanceLeapCard(session) {
  if (session.pending.length) {
    session.current = session.pending.shift();
    return;
  }
  if (session.retry.length) {
    session.pending = session.retry;
    session.retry = [];
    session.round += 1;
    session.rounds = Math.max(session.rounds, session.round);
    session.current = session.pending.shift();
    return;
  }
  session.current = null;
  session.finished = true;
  session.endedReason = "complete";
}

/*
  わかった=true なら次周回へ送らず、false なら現在周回の末尾に再キューする。
  1回の呼び出しで必ず1枚だけ進むため、再周回はイベント駆動で無限同期ループにならない。
*/
export function judgeLeapCard(session, knew, now = Date.now()) {
  if (!session || session.finished || !session.current) return { accepted: false, finished: !!(session && session.finished) };
  if (Number.isFinite(session.endsAt) && now >= session.endsAt) {
    finishLeapSession(session, now, "time");
    return {
      accepted: false,
      finished: true,
      expired: true,
      remaining: remainingLeapCount(session)
    };
  }
  const card = session.current;
  session.judged += 1;
  const remembered = !!knew;
  if (remembered) session.learned.add(card.id);
  else session.retry.push(card);
  session.history.push({ id: card.id, knew: remembered, round: session.round, at: now });
  session.current = null;
  advanceLeapCard(session);
  if (session.finished) session.completedAt = now;
  return {
    accepted: true,
    knew: remembered,
    finished: session.finished,
    next: session.current,
    round: session.round,
    remaining: remainingLeapCount(session)
  };
}

export function finishLeapSession(session, now = Date.now(), reason = "quit") {
  if (!session) return null;
  if (!session.finished) {
    session.finished = true;
    session.endedReason = reason;
    session.completedAt = now;
  }
  return getLeapStats(session, now);
}

export function getLeapStats(session, now = Date.now()) {
  if (!session) {
    return { elapsedSeconds: 0, judged: 0, learned: 0, remainingUncertain: 0, rounds: 0, averageSeconds: 0, endedReason: "" };
  }
  const end = session.finished && Number.isFinite(session.completedAt) ? session.completedAt : now;
  const elapsedSeconds = Math.min(session.durationSeconds || LEAP_SESSION_SECONDS, Math.max(0, (end - session.startedAt) / 1000));
  const averageSeconds = session.judged ? Math.round(elapsedSeconds / session.judged * 10) / 10 : 0;
  return {
    elapsedSeconds,
    judged: session.judged,
    learned: session.learned ? session.learned.size : 0,
    remainingUncertain: remainingLeapCount(session),
    rounds: session.rounds || session.round || 1,
    averageSeconds,
    endedReason: session.endedReason || ""
  };
}

/* テストや小さな導入画面から使いやすい別名。 */
export const createFastRoundSession = createLeapSession;
export const judgeFastRound = judgeLeapCard;
export const getFastRoundStats = getLeapStats;
