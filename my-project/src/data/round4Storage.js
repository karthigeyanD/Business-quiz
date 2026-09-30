/**
 * Round 4 — Storage Layer
 *
 * Metadata (questions config, active question, submissions, scores) ➜ localStorage ('bq_round4')
 * Clue images (binary blobs as data-URLs) ➜ IndexedDB ('bq_round4_images')
 *
 * Self-contained module so Round 4 operates reliably and independently.
 */

import { ROUND4_QUESTIONS, ROUND4_META } from './round4Data.js';

// ─── localStorage key ────────────────────────────────────────────────────────
const R4_KEY = 'bq_round4';

// ─── IndexedDB constants ─────────────────────────────────────────────────────
const IDB_NAME = 'bq_round4_images';
const IDB_STORE = 'images';
const IDB_VERSION = 1;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function read() {
  try {
    const raw = localStorage.getItem(R4_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(value) {
  localStorage.setItem(R4_KEY, JSON.stringify(value));
}

function uid() {
  return crypto.randomUUID();
}

function ts() {
  return new Date().toISOString();
}

// ─── Text Normalization & Answer Evaluation ─────────────────────────────────

export function normalizeText(str) {
  if (!str) return '';
  return str
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a submitted answer is correct based on correct answer and aliases.
 */
export function evaluateAnswer(submittedText, correctAnswer, aliases = []) {
  const normSubmitted = normalizeText(submittedText);
  if (!normSubmitted) return false;

  const normCorrect = normalizeText(correctAnswer);
  if (normSubmitted === normCorrect) return true;

  for (const alias of aliases) {
    if (normSubmitted === normalizeText(alias)) return true;
  }

  // Check key surname/first name if long enough (e.g. "Jobs", "Ambani", "Gates", "Tata", "Pichai", "Sanders")
  const words = normSubmitted.split(' ');
  const correctWords = normCorrect.split(' ');
  const mainSurname = correctWords[correctWords.length - 1];

  if (mainSurname && mainSurname.length >= 4) {
    if (words.includes(mainSurname)) return true;
  }

  return false;
}

// ─── Default State ───────────────────────────────────────────────────────────

function buildDefaultQuestions() {
  const obj = {};
  ROUND4_QUESTIONS.forEach((q) => {
    obj[q.id] = {
      id: q.id,
      personality: q.personality,
      clueType: q.clueType,
      isPuzzle: q.isPuzzle,
      puzzleMode: q.isPuzzle ? 'tiles' : 'full', // 'tiles' | 'full'
      aliases: [...q.defaultAliases],
      description: q.description,
      marks: ROUND4_META.marksPerQuestion,
      enabled: true,
    };
  });
  return obj;
}

function defaultState() {
  return {
    status: 'draft', // draft | active | paused | completed
    currentQuestionId: 1, // 1 to 6
    timerEnabled: false,
    timerSeconds: ROUND4_META.defaultTimerSeconds,
    marksPerQuestion: ROUND4_META.marksPerQuestion,
    allowRetries: false,
    answersRevealed: false,
    startedAt: null,
    pausedAt: null,
    completedAt: null,
    questions: buildDefaultQuestions(),
    submissions: {}, // { [teamId]: { [qId]: { answer, submittedAt, isCorrect, score } } }
    auditLog: [],
  };
}

// ─── State CRUD ──────────────────────────────────────────────────────────────

export function getRound4State() {
  const saved = read();
  if (!saved) {
    const def = defaultState();
    write(def);
    return def;
  }
  if (!saved.questions) saved.questions = buildDefaultQuestions();
  ROUND4_QUESTIONS.forEach((q) => {
    if (!saved.questions[q.id]) {
      saved.questions[q.id] = buildDefaultQuestions()[q.id];
    }
  });
  if (!saved.submissions) saved.submissions = {};
  if (!saved.auditLog) saved.auditLog = [];
  return saved;
}

export function saveRound4State(state) {
  write(state);
}

export function resetRound4() {
  const def = defaultState();
  write(def);
  return def;
}

// ─── Round Controls ──────────────────────────────────────────────────────────

export function setRound4Status(status) {
  const state = getRound4State();
  state.status = status;
  if (status === 'active' && !state.startedAt) state.startedAt = ts();
  if (status === 'paused') state.pausedAt = ts();
  if (status === 'completed') state.completedAt = ts();
  if (status === 'active') state.pausedAt = null;
  saveRound4State(state);
  return state;
}

export function setActiveQuestion(questionId) {
  const state = getRound4State();
  state.currentQuestionId = Number(questionId);
  state.answersRevealed = false; // Reset reveal on question change
  saveRound4State(state);
  return state;
}

export function updateRound4Config(patch) {
  const state = getRound4State();
  Object.assign(state, patch);
  saveRound4State(state);
  return state;
}

export function updateQuestionConfig(qId, patch) {
  const state = getRound4State();
  if (!state.questions[qId]) return state;
  state.questions[qId] = { ...state.questions[qId], ...patch };
  saveRound4State(state);
  return state;
}

export function setAnswersRevealed(revealed) {
  const state = getRound4State();
  state.answersRevealed = Boolean(revealed);
  saveRound4State(state);
  return state;
}

// ─── Submissions & Evaluation ────────────────────────────────────────────────

export function submitAnswer(teamId, questionId, textAnswer) {
  const state = getRound4State();
  if (!state.submissions[teamId]) state.submissions[teamId] = {};
  const teamSubs = state.submissions[teamId];

  const existing = teamSubs[questionId];
  if (existing?.submittedAt && !state.allowRetries) {
    return { ok: false, error: 'Answer already submitted for this question' };
  }

  const q = state.questions[questionId];
  const isCorrect = q ? evaluateAnswer(textAnswer, q.personality, q.aliases) : false;
  const score = isCorrect ? (q?.marks || state.marksPerQuestion) : 0;

  teamSubs[questionId] = {
    answer: textAnswer,
    submittedAt: ts(),
    isCorrect,
    score,
    manualOverride: false,
  };

  saveRound4State(state);
  return { ok: true, isCorrect, score };
}

export function markAnswer(teamId, questionId, isCorrect) {
  const state = getRound4State();
  if (!state.submissions[teamId]) state.submissions[teamId] = {};
  const teamSubs = state.submissions[teamId];

  const q = state.questions[questionId];
  const score = isCorrect ? (q?.marks || state.marksPerQuestion) : 0;

  const prev = teamSubs[questionId] || {};
  teamSubs[questionId] = {
    ...prev,
    isCorrect,
    score,
    manualOverride: true,
    scoredAt: ts(),
  };

  state.auditLog.push({
    id: uid(),
    timestamp: ts(),
    type: 'round4_mark_change',
    teamId,
    questionId,
    oldScore: prev.score || 0,
    newScore: score,
    isCorrect,
  });

  saveRound4State(state);
  return state;
}

export function overrideScore(teamId, questionId, customScore, reason = '') {
  const state = getRound4State();
  if (!state.submissions[teamId]) state.submissions[teamId] = {};
  const teamSubs = state.submissions[teamId];

  const prev = teamSubs[questionId] || {};
  const newScore = Number(customScore) || 0;

  teamSubs[questionId] = {
    ...prev,
    score: newScore,
    isCorrect: newScore > 0,
    manualOverride: true,
    scoredAt: ts(),
  };

  state.auditLog.push({
    id: uid(),
    timestamp: ts(),
    type: 'round4_score_override',
    teamId,
    questionId,
    oldScore: prev.score || 0,
    newScore,
    reason,
  });

  saveRound4State(state);
  return state;
}

export function getTeamTotalScore(teamId) {
  const state = getRound4State();
  const teamSubs = state.submissions[teamId] || {};
  let total = 0;
  Object.values(teamSubs).forEach((sub) => {
    if (sub && typeof sub.score === 'number') {
      total += sub.score;
    }
  });
  return total;
}

// ─── IndexedDB for Question Images ─────────────────────────────────────────

function openImageDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function saveClueImage(qId, dataUrl, label = '') {
  return saveQuestionImage(qId, 'clue', dataUrl, label);
}

export async function getClueImage(qId) {
  return getQuestionImage(qId, 'clue');
}

export async function deleteClueImage(qId) {
  return deleteQuestionImage(qId, 'clue');
}

export async function saveAnswerPreviewImage(qId, dataUrl, label = '') {
  return saveQuestionImage(qId, 'preview', dataUrl, label);
}

export async function getAnswerPreviewImage(qId) {
  return getQuestionImage(qId, 'preview');
}

export async function deleteAnswerPreviewImage(qId) {
  return deleteQuestionImage(qId, 'preview');
}

export async function saveQuestionImage(qId, type, dataUrl, label = '') {
  const db = await openImageDB();
  const key = `q-${qId}-${type}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(
      { data: dataUrl, label, type, uploadedAt: ts() },
      key
    );
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getQuestionImage(qId, type = 'clue') {
  const db = await openImageDB();
  const key = `q-${qId}-${type}`;
  const legacyKey = `q-${qId}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const req = store.get(key);
    req.onsuccess = () => {
      if (req.result) {
        resolve(req.result);
      } else if (type === 'clue') {
        // Fallback to legacy key for clue image if present
        const legReq = store.get(legacyKey);
        legReq.onsuccess = () => resolve(legReq.result || null);
        legReq.onerror = () => resolve(null);
      } else {
        resolve(null);
      }
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function deleteQuestionImage(qId, type = 'clue') {
  const db = await openImageDB();
  const key = `q-${qId}-${type}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getAllQuestionImages() {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const allKeys = store.getAllKeys();
    allKeys.onsuccess = async () => {
      const keys = allKeys.result;
      const images = {};
      for (const key of keys) {
        const img = await new Promise((res) => {
          const r = store.get(key);
          r.onsuccess = () => res(r.result);
          r.onerror = () => res(null);
        });
        if (img) images[key] = img;
      }
      resolve(images);
    };
    allKeys.onerror = (e) => reject(e.target.error);
  });
}

export async function validateRound4Readiness() {
  const allImages = await getAllQuestionImages();
  const state = getRound4State();
  const missingList = [];
  let clueCount = 0;
  let previewCount = 0;

  for (let i = 1; i <= 6; i++) {
    const clueImg = allImages[`q-${i}-clue`] || allImages[`q-${i}`];
    const previewImg = allImages[`q-${i}-preview`];
    const qCfg = state.questions[i];

    if (clueImg?.data) {
      clueCount++;
    } else {
      missingList.push(`❌ Question ${i} — Clue Image`);
    }

    if (previewImg?.data) {
      previewCount++;
    } else {
      missingList.push(`❌ Question ${i} — Answer / Preview Image`);
    }

    if (!qCfg?.personality?.trim()) {
      missingList.push(`❌ Question ${i} — Answer Key Personality Name`);
    }
  }

  const isReady = missingList.length === 0;
  return { isReady, missingList, clueCount, previewCount };
}

export async function clearAllQuestionImages() {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

