/**
 * Engine API: startSession opens the first unfinished stage in quests of at most
 * 10 NEW words. queue[index] is the current ID; queue/index reset at each phase.
 * Every quest reviews up to 20 due/recent words, then learns and quizzes newWords.
 * Only a finished challenge commits new words. `stageComplete` distinguishes a
 * finished quest from a finished stage; `earnedXp` counts newly committed words.
 * Persist state after every answer/learnNext. An interrupted quest can safely be
 * restarted: reviewed metadata survives, uncommitted new words remain unlearned.
 * loadState rebuilds XP/history/completed from valid sequential quest records.
 * Optional loadState(raw, {strict:true}) rejects a backup needing any repair.
 * createEngine(stageData) exposes the same API for isolated fixture testing.
 */
import { stages } from './data.js';

const DAY = 86_400_000;
const INTERVALS = [600_000, DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];
const MAX_DATE = 8_640_000_000_000_000;
const QUEST_SIZE = 10;
const REVIEW_SIZE = 20;
const REVIEW_HISTORY_LIMIT = 100;
const QUESTION_TYPES = ['recognition', 'recall', 'copy'];
const reviewId = () => globalThis.crypto?.randomUUID?.() ?? `review-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isDate = value => Number.isFinite(value) && value >= 0 && value <= MAX_DATE;
const count = (value, fallback = 0, max = 1_000_000_000) =>
  Number.isSafeInteger(value) && value >= 0 ? Math.min(value, max) : fallback;
const timestamp = now => isDate(now) ? now : Date.now();
const dueAt = (time, mastery) => Math.min(MAX_DATE, time + INTERVALS[mastery]);
const equal = (left, right) => {
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right)) return left.length === right.length && left.every((item, i) => equal(item, right[i]));
  if (!isRecord(left) || !isRecord(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every(key => owns(right, key) && equal(left[key], right[key]));
};

export function createEngine(stageData) {
  if (!Array.isArray(stageData) || !stageData.length) throw new TypeError('關卡資料不得為空。');
  const byId = new Map();
  const spellings = new Set();
  const catalog = stageData.map((stage, index) => {
    const quota = stage.quota ?? stage.words?.length;
    if (stage.id !== index + 1 || !Array.isArray(stage.words) || !Number.isInteger(quota) || quota < 1 || stage.words.length > quota) {
      throw new TypeError('關卡順序或單字配額不正確。');
    }
    for (const word of stage.words) {
      if (typeof word.id !== 'string' || !word.id.trim() || ['__proto__', 'constructor'].includes(word.id) || byId.has(word.id)) {
        throw new TypeError('單字識別碼必須有效且不重複。');
      }
      const spelling = typeof word.word === 'string' ? word.word.trim().toLowerCase() : '';
      if (!spelling || spellings.has(spelling)) throw new TypeError('單字必須有效且不重複。');
      spellings.add(spelling);
      byId.set(word.id, { ...word, stageId: stage.id });
    }
    return { id: stage.id, quota, ids: stage.words.map(word => word.id) };
  });
  const allIds = [...byId.keys()];
  const learnedIds = state => allIds.filter(id => owns(state.words, id));
  const stageDone = (state, stage) => stage.ids.length === stage.quota && stage.ids.every(id => owns(state.words, id));
  const currentStage = state => catalog.find(stage => !stageDone(state, stage));

  function createState() {
    return { version: 2, completed: [], words: {}, xp: 0, history: [], reviewHistory: [] };
  }

  function historyItem(stage, ids, completedAt) {
    return {
      stageId: stage.id, quest: Math.floor(stage.ids.indexOf(ids[0]) / QUEST_SIZE) + 1,
      wordIds: [...ids], completedAt, xp: ids.length * 10,
      stageComplete: ids.at(-1) === stage.ids[stage.quota - 1],
    };
  }

  function restoreWord(entry, stageId) {
    // Missing acquisition evidence cannot create a learned word or unlock a stage.
    if (!isRecord(entry) || entry.stageId !== stageId || !isDate(entry.learnedAt) ||
        !Number.isSafeInteger(entry.correct) || entry.correct < 1) return null;
    const correct = count(entry.correct);
    const reviewCount = Math.min(count(entry.reviewCount), correct - 1);
    const mastery = Number.isInteger(entry.mastery) && entry.mastery >= 0 && entry.mastery <= 5 ? entry.mastery : 0;
    const lastReviewed = isDate(entry.lastReviewed) && entry.lastReviewed >= entry.learnedAt ? entry.lastReviewed : entry.learnedAt;
    return {
      stageId, learnedAt: entry.learnedAt, lastReviewed, correct,
      incorrect: count(entry.incorrect), streak: Math.min(count(entry.streak), correct),
      reviewCount, mastery: Math.min(mastery, reviewCount),
      recallCount: Math.min(count(entry.recallCount), reviewCount),
      nextReviewMode: entry.nextReviewMode === 'recognition' ? 'recognition' : 'recall',
      nextDue: isDate(entry.nextDue) && entry.nextDue >= lastReviewed ? entry.nextDue : lastReviewed,
    };
  }

  function loadState(raw, { strict = false } = {}) {
    let source;
    try { source = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { source = null; }
    const state = createState();
    const validEnvelope = isRecord(source) && source.version === 2 && isRecord(source.words);
    if (validEnvelope) {
      for (const stage of catalog) {
        const prefix = [];
        for (const id of stage.ids) {
          if (!owns(source.words, id)) break;
          const entry = restoreWord(source.words[id], stage.id);
          if (!entry) break;
          prefix.push([id, entry]);
        }
        // Acquisition is atomic per quest; truncated backups do not grant a
        // fraction of an unfinished challenge. Later stages cannot leap the gap.
        const full = stage.ids.length === stage.quota && prefix.length === stage.quota;
        const keep = full ? prefix.length : Math.floor(prefix.length / QUEST_SIZE) * QUEST_SIZE;
        for (const [id, entry] of prefix.slice(0, keep)) state.words[id] = entry;
        for (let offset = 0; offset < keep; offset += QUEST_SIZE) {
          const ids = prefix.slice(offset, Math.min(offset + QUEST_SIZE, keep)).map(([id]) => id);
          state.history.push(historyItem(stage, ids, Math.max(...ids.map(id => state.words[id].learnedAt))));
        }
        if (!full) break;
        state.completed.push(stage.id);
      }
      state.xp = Object.keys(state.words).length * 10;
      if (state.xp && Array.isArray(source.reviewHistory)) {
        state.reviewHistory = source.reviewHistory.filter(item => isRecord(item) &&
          typeof item.id === 'string' && /^[a-zA-Z0-9-]{8,80}$/.test(item.id) &&
          isDate(item.startedAt) && isDate(item.date) && item.date >= item.startedAt &&
          Number.isInteger(item.count) && item.count > 0 && item.count <= REVIEW_SIZE &&
          Number.isInteger(item.firstAttempts) && item.firstAttempts > 0 && item.firstAttempts <= item.count &&
          Number.isInteger(item.firstCorrect) && item.firstCorrect >= 0 && item.firstCorrect <= item.firstAttempts &&
          Number.isSafeInteger(item.retries) && item.retries >= 0 && item.retries <= 1_000_000_000 &&
          typeof item.completed === 'boolean' && (!item.completed || item.firstAttempts === item.count))
          .slice(-REVIEW_HISTORY_LIMIT)
          .filter((item, index, items) => items.findIndex(other => other.id === item.id) === index)
          .map(({id, startedAt, date, count, firstAttempts, firstCorrect, retries, completed}) =>
            ({id, startedAt, date, count, firstAttempts, firstCorrect, retries, completed}));
      }
    }
    // Version 2 backups before retrieval tracking remain valid. Only absent new
    // fields receive defaults; invalid values or missing original fields fail strict import.
    const comparable = validEnvelope ? { ...source, reviewHistory: owns(source, 'reviewHistory') ? source.reviewHistory : [] } : source;
    if (validEnvelope) comparable.words = Object.fromEntries(Object.entries(source.words).map(([id, entry]) => [id,
      isRecord(entry) ? { ...entry, recallCount: owns(entry, 'recallCount') ? entry.recallCount : 0,
        nextReviewMode: owns(entry, 'nextReviewMode') ? entry.nextReviewMode : 'recall' } : entry]));
    if (strict && (!validEnvelope || !equal(comparable, state))) {
      throw new TypeError('備份資料不完整、版本不符或進度不一致，尚未匯入。');
    }
    return state;
  }

  function reviewIds(state, now, includeRecent) {
    const due = learnedIds(state).filter(id => state.words[id].nextDue <= now)
      .sort((a, b) => state.words[a].nextDue - state.words[b].nextDue);
    const recent = state.history.at(-1)?.wordIds ?? learnedIds(state).slice(-QUEST_SIZE);
    const previous = recent.filter(id => owns(state.words, id)).slice(-QUEST_SIZE);
    return includeRecent ? [...new Set([...previous, ...due])].slice(0, REVIEW_SIZE)
      : (due.length ? due : previous).slice(0, REVIEW_SIZE);
  }

  function sessionFor(state, stageId, mode, phase, queue, newWords, now) {
    return {
      stageId, mode, phase, queue: [...queue], index: 0, newWords: [...newWords],
      startedAt: now, correctCount: 0, wrongCount: 0, earnedXp: 0,
      stageComplete: false, attempts: {}, reviewAttempts: {}, phaseTotal: queue.length,
      reviewModes: Object.fromEntries(queue.filter(id => owns(state.words, id)).map(id => [id, state.words[id].nextReviewMode])),
    };
  }

  function startSession(state, stageId, now = Date.now()) {
    const stage = currentStage(state);
    if (!Number.isInteger(stageId) || !stage || stageId !== stage.id) {
      throw new RangeError('請從目前已解鎖、尚未完成的旅程開始。');
    }
    if (stage.ids.length !== stage.quota) throw new RangeError('本關單字資料尚未完整，請稍後再開始。');
    const time = timestamp(now);
    const newWords = stage.ids.filter(id => !owns(state.words, id)).slice(0, QUEST_SIZE);
    const review = reviewIds(state, time, true);
    return sessionFor(state, stageId, 'stage', review.length ? 'review' : 'learn', review.length ? review : newWords, newWords, time);
  }

  function reviewSession(state, now = Date.now()) {
    const time = timestamp(now);
    const queue = reviewIds(state, time, false);
    return sessionFor(state, null, 'review', queue.length ? 'review' : 'complete', queue, [], time);
  }

  function setPhase(session, phase, queue = []) {
    session.phase = phase;
    session.queue = [...queue];
    session.index = 0;
    session.phaseTotal = queue.length;
  }

  function questionType(state, session, wordId = session.queue[session.index]) {
    const attempts = session.phase === 'review' ? session.reviewAttempts : session.attempts;
    if (owns(attempts, wordId)) return attempts[wordId].type;
    return session.phase === 'review' ? session.reviewModes[wordId] ?? 'recall' : 'recognition';
  }

  function masteryLevel(entry) {
    return Math.min(3, entry.mastery, entry.reviewCount, entry.recallCount > 0 ? 3 : 2);
  }

  function updateReview(entry, correct, now, firstAttempt, attempt) {
    const time = Math.max(now, entry.lastReviewed);
    const due = entry.nextDue <= time;
    entry.lastReviewed = time;
    if (firstAttempt && attempt.type !== 'copy') entry.nextReviewMode = attempt.type === 'recall' ? 'recognition' : 'recall';
    if (correct) {
      entry.correct += 1;
      entry.streak += 1;
      // Only a spaced, first-attempt retrieval earns mastery. A retry or an
      // immediate spiral review still practices the word, without farming it.
      if (firstAttempt && due && attempt.type !== 'copy') {
        entry.reviewCount += 1;
        if (attempt.type === 'recall') entry.recallCount += 1;
        entry.mastery = Math.min(5, entry.mastery + 1);
        entry.nextDue = dueAt(time, entry.mastery);
      } else if (!firstAttempt) entry.nextDue = dueAt(time, 0);
    } else {
      entry.incorrect += 1;
      entry.streak = 0;
      if (attempt.incorrect === 1) entry.mastery = Math.max(0, entry.mastery - 1);
      entry.nextDue = dueAt(time, 0);
    }
  }

  function completeQuest(state, session, now) {
    const stage = catalog[session.stageId - 1];
    const unseen = session.newWords.filter(id => !owns(state.words, id));
    if (unseen.length && currentStage(state)?.id !== stage.id) {
      throw new RangeError('旅程進度已改變，請重新開啟目前關卡。');
    }
    if (unseen.some(id => !session.attempts[id]?.correct)) throw new RangeError('還有新單字尚未通過試煉。');
    for (const id of unseen) {
      const attempts = session.attempts[id];
      state.words[id] = {
        stageId: stage.id, learnedAt: now, lastReviewed: now,
        correct: attempts.correct, incorrect: attempts.incorrect,
        streak: 1, reviewCount: 0, mastery: 0, nextDue: dueAt(now, 0),
        recallCount: 0, nextReviewMode: attempts.type === 'recall' ? 'recognition' : 'recall',
      };
    }
    session.earnedXp = unseen.length * 10;
    state.xp += session.earnedXp;
    session.stageComplete = stageDone(state, stage);
    if (session.stageComplete && !state.completed.includes(stage.id)) state.completed.push(stage.id);
    if (unseen.length) state.history.push(historyItem(stage, unseen, now));
    setPhase(session, 'complete');
  }

  function learnNext(state, session) {
    if (session.phase !== 'learn') return session;
    session.index += 1;
    if (session.index >= session.queue.length) setPhase(session, 'challenge', session.newWords);
    return session;
  }

  function answer(state, session, correct, now = Date.now(), { type = questionType(state, session) } = {}) {
    if (session.phase !== 'review' && session.phase !== 'challenge') return session;
    if (typeof correct !== 'boolean') throw new TypeError('答案結果必須是布林值。');
    if (!QUESTION_TYPES.includes(type)) throw new TypeError('練習類型不正確。');
    const wordId = session.queue[session.index];
    if (!byId.has(wordId)) throw new RangeError('找不到這個單字，請重新開始本次練習。');
    const time = timestamp(now);
    const attempts = (session.phase === 'review' ? session.reviewAttempts : session.attempts);
    const firstAttempt = !owns(attempts, wordId);
    const attempt = firstAttempt ? (attempts[wordId] = { correct: 0, incorrect: 0, type }) : attempts[wordId];
    attempt[correct ? 'correct' : 'incorrect'] += 1;
    if (session.phase === 'review') {
      if (!owns(state.words, wordId)) throw new RangeError('這個單字尚未完成學習。');
      updateReview(state.words[wordId], correct, time, firstAttempt, attempt);
      if (!session.reviewSummary) {
        session.reviewSummary = { id: reviewId(), startedAt: session.startedAt, date: Math.max(time, session.startedAt), count: session.phaseTotal,
          firstAttempts: 0, firstCorrect: 0, retries: 0, completed: false };
        state.reviewHistory.push(session.reviewSummary);
        if (state.reviewHistory.length > REVIEW_HISTORY_LIMIT) state.reviewHistory.splice(0, state.reviewHistory.length - REVIEW_HISTORY_LIMIT);
      }
      const summary = session.reviewSummary;
      summary.date = Math.max(summary.date, time);
      if (firstAttempt) { summary.firstAttempts += 1; if (correct) summary.firstCorrect += 1; }
      else summary.retries += 1;
    }
    session[correct ? 'correctCount' : 'wrongCount'] += 1;
    if (!correct) session.queue.push(wordId);
    session.index += 1;
    if (session.index < session.queue.length) return session;
    if (session.phase === 'review') {
      session.reviewSummary.completed = true;
      if (session.mode === 'review') setPhase(session, 'complete');
      else setPhase(session, 'learn', session.newWords);
    } else completeQuest(state, session, time);
    return session;
  }

  function getStats(state, now = Date.now()) {
    const entries = learnedIds(state).map(id => state.words[id]);
    const time = timestamp(now);
    return {
      learned: entries.length, mastered: entries.filter(entry => masteryLevel(entry) >= 3).length,
      due: entries.filter(entry => entry.nextDue <= time).length,
      xp: state.xp, level: Math.floor(state.xp / 1000) + 1, completed: state.completed.length,
    };
  }

  return { createState, loadState, startSession, reviewSession, answer, learnNext, questionType, masteryLevel, getStats };
}

const engine = createEngine(stages);
export const { createState, loadState, startSession, reviewSession, answer, learnNext, questionType, masteryLevel, getStats } = engine;
