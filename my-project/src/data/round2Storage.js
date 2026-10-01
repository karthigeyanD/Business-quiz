/**
 * Round 2 — Storage Layer
 *
 * Metadata (question sets, assignments, submissions, scores) ➜ localStorage
 * Logo images (binary blobs as data-URLs) ➜ IndexedDB
 *
 * This module mirrors the conventions of the main storage.js but keeps
 * Round 2 state self-contained so it never interferes with other rounds.
 */

import { ROUND2_QUESTION_SETS, ROUND2_META } from './round2Data.js';

// ─── localStorage key ────────────────────────────────────────────────────────
const R2_KEY = 'bq_round2';

// ─── IndexedDB constants ─────────────────────────────────────────────────────
const IDB_NAME = 'bq_round2_images';
const IDB_STORE = 'images';
const IDB_VERSION = 1;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function read() {
  try {
    const raw = localStorage.getItem(R2_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(value) {
  localStorage.setItem(R2_KEY, JSON.stringify(value));
}

function uid() {
  return crypto.randomUUID();
}

function ts() {
  return new Date().toISOString();
}

// ─── Default State ───────────────────────────────────────────────────────────

function buildDefaultQuestionSets() {
  const sets = {};
  ROUND2_QUESTION_SETS.forEach((s) => {
    sets[s.setId] = {
      id: s.setId,
      label: s.label,
      logoQuestion: {
        options: [...s.logoQuestion.options],
        sourceAnswerKey: s.logoQuestion.sourceAnswerKey,
        sourceAnswerText: s.logoQuestion.sourceAnswerText,
        approvedAnswer: s.logoQuestion.warning ? null : s.logoQuestion.sourceAnswerKey,
        warning: s.logoQuestion.warning,
        verificationStatus: s.logoQuestion.warning ? 'needs_verification' : 'verified',
        hostConfirmedAt: s.logoQuestion.warning ? null : ts(),
        imageLabels: ['', '', '', ''],
      },
      taglineQuestion: {
        words: [...s.taglineQuestion.words],
        correctTagline: s.taglineQuestion.correctTagline,
        approvedTagline: s.taglineQuestion.correctTagline,
      },
      published: false,
    };
  });
  return sets;
}

function defaultState() {
  return {
    status: 'draft', // draft | active | paused | completed
    timerEnabled: false,
    timerSeconds: ROUND2_META.defaultTimerSeconds,
    marksPerLogo: ROUND2_META.marksPerLogo,
    marksPerTagline: ROUND2_META.marksPerTagline,
    requireExactPunctuation: false,
    allowRetries: false,
    answersRevealed: false,
    startedAt: null,
    pausedAt: null,
    completedAt: null,
    teamAssignments: {},   // { [teamId]: setId }
    questionSets: buildDefaultQuestionSets(),
    submissions: {},       // { [teamId]: { logoAnswer, taglineAnswer, ... } }
    auditLog: [],          // score change audit entries
  };
}

// ─── State CRUD ──────────────────────────────────────────────────────────────

export function getRound2State() {
  const saved = read();
  if (!saved) {
    const def = defaultState();
    write(def);
    return def;
  }
  // Ensure all sets exist (in case sets were added after initial save)
  if (!saved.questionSets) saved.questionSets = buildDefaultQuestionSets();
  ROUND2_QUESTION_SETS.forEach((s) => {
    if (!saved.questionSets[s.setId]) {
      saved.questionSets[s.setId] = buildDefaultQuestionSets()[s.setId];
    }
  });
  if (!saved.submissions) saved.submissions = {};
  if (!saved.auditLog) saved.auditLog = [];
  if (!saved.teamAssignments) saved.teamAssignments = {};
  return saved;
}

export function saveRound2State(state) {
  write(state);
}

export function resetRound2() {
  const def = defaultState();
  write(def);
  return def;
}

// ─── Round Status ────────────────────────────────────────────────────────────

export function setRound2Status(status) {
  const state = getRound2State();
  state.status = status;
  if (status === 'active' && !state.startedAt) state.startedAt = ts();
  if (status === 'paused') state.pausedAt = ts();
  if (status === 'completed') state.completedAt = ts();
  if (status === 'active') state.pausedAt = null;
  saveRound2State(state);
  return state;
}

// ─── Config ──────────────────────────────────────────────────────────────────

export function updateRound2Config(patch) {
  const state = getRound2State();
  Object.assign(state, patch);
  saveRound2State(state);
  return state;
}

// ─── Team Assignments ────────────────────────────────────────────────────────

export function assignQuestionSet(teamId, setId) {
  const state = getRound2State();
  state.teamAssignments[teamId] = setId;
  saveRound2State(state);
  return state;
}

export function unassignTeam(teamId) {
  const state = getRound2State();
  delete state.teamAssignments[teamId];
  saveRound2State(state);
  return state;
}

export function getTeamAssignment(teamId) {
  const state = getRound2State();
  return state.teamAssignments[teamId] || null;
}

// ─── Question Set Updates ────────────────────────────────────────────────────

export function updateQuestionSet(setId, patch) {
  const state = getRound2State();
  if (!state.questionSets[setId]) return state;
  state.questionSets[setId] = { ...state.questionSets[setId], ...patch };
  saveRound2State(state);
  return state;
}

export function updateLogoQuestion(setId, patch) {
  const state = getRound2State();
  const qs = state.questionSets[setId];
  if (!qs) return state;
  qs.logoQuestion = { ...qs.logoQuestion, ...patch };
  saveRound2State(state);
  return state;
}

export function updateTaglineQuestion(setId, patch) {
  const state = getRound2State();
  const qs = state.questionSets[setId];
  if (!qs) return state;
  qs.taglineQuestion = { ...qs.taglineQuestion, ...patch };
  saveRound2State(state);
  return state;
}

export function approveAnswer(setId, approvedOption) {
  const state = getRound2State();
  const qs = state.questionSets[setId];
  if (!qs) return state;
  qs.logoQuestion.approvedAnswer = approvedOption;
  qs.logoQuestion.verificationStatus = 'verified';
  qs.logoQuestion.hostConfirmedAt = ts();
  saveRound2State(state);
  return state;
}

export function publishQuestionSet(setId) {
  const state = getRound2State();
  const qs = state.questionSets[setId];
  if (!qs) return { ok: false, error: 'Set not found' };
  if (qs.logoQuestion.verificationStatus !== 'verified') {
    return { ok: false, error: 'Answer key must be verified before publishing' };
  }
  qs.published = true;
  saveRound2State(state);
  return { ok: true };
}

export function unpublishQuestionSet(setId) {
  const state = getRound2State();
  const qs = state.questionSets[setId];
  if (!qs) return state;
  qs.published = false;
  saveRound2State(state);
  return state;
}

// ─── Submissions ─────────────────────────────────────────────────────────────

function emptySubmission() {
  return {
    logoAnswer: null,
    logoSubmittedAt: null,
    taglineAnswer: null,
    taglineSubmittedAt: null,
    logoScore: null,
    taglineScore: null,
    totalScore: null,
    scoredAt: null,
    manualOverride: false,
  };
}

export function submitLogoAnswer(teamId, answer) {
  const state = getRound2State();
  if (!state.submissions[teamId]) state.submissions[teamId] = emptySubmission();
  const sub = state.submissions[teamId];

  // Prevent duplicate submissions unless retries are allowed
  if (sub.logoSubmittedAt && !state.allowRetries) {
    return { ok: false, error: 'Already submitted' };
  }

  sub.logoAnswer = answer;
  sub.logoSubmittedAt = ts();

  // Auto-score if possible
  const setId = state.teamAssignments[teamId];
  if (setId) {
    const qs = state.questionSets[setId];
    if (qs && qs.logoQuestion.approvedAnswer) {
      sub.logoScore = answer === qs.logoQuestion.approvedAnswer
        ? state.marksPerLogo
        : 0;
    }
  }

  sub.totalScore = (sub.logoScore || 0) + (sub.taglineScore || 0);
  sub.scoredAt = ts();
  saveRound2State(state);
  return { ok: true };
}

export function submitTaglineAnswer(teamId, orderedWords) {
  const state = getRound2State();
  if (!state.submissions[teamId]) state.submissions[teamId] = emptySubmission();
  const sub = state.submissions[teamId];

  if (sub.taglineSubmittedAt && !state.allowRetries) {
    return { ok: false, error: 'Already submitted' };
  }

  sub.taglineAnswer = orderedWords;
  sub.taglineSubmittedAt = ts();

  // Auto-score
  const setId = state.teamAssignments[teamId];
  if (setId) {
    const qs = state.questionSets[setId];
    if (qs) {
      const submitted = orderedWords.join(' ');
      const correct = qs.taglineQuestion.approvedTagline || qs.taglineQuestion.correctTagline;

      let match;
      if (state.requireExactPunctuation) {
        match = submitted.trim().toUpperCase() === correct.trim().toUpperCase();
      } else {
        // Normalize: strip trailing punctuation from each word, collapse whitespace
        const normalize = (s) =>
          s.toUpperCase().replace(/[^A-Z0-9' ]/g, '').replace(/\s+/g, ' ').trim();
        match = normalize(submitted) === normalize(correct);
      }

      sub.taglineScore = match ? state.marksPerTagline : 0;
    }
  }

  sub.totalScore = (sub.logoScore || 0) + (sub.taglineScore || 0);
  sub.scoredAt = ts();
  saveRound2State(state);
  return { ok: true };
}

export function getSubmission(teamId) {
  const state = getRound2State();
  return state.submissions[teamId] || null;
}

// ─── Manual Score Override ───────────────────────────────────────────────────

export function overrideScore(teamId, field, value, reason = '') {
  const state = getRound2State();
  if (!state.submissions[teamId]) state.submissions[teamId] = emptySubmission();
  const sub = state.submissions[teamId];
  const oldValue = sub[field];

  sub[field] = value;
  sub.manualOverride = true;
  sub.totalScore = (sub.logoScore || 0) + (sub.taglineScore || 0);
  sub.scoredAt = ts();

  // Audit
  state.auditLog.push({
    id: uid(),
    timestamp: ts(),
    type: 'round2_score_override',
    teamId,
    field,
    oldValue,
    newValue: value,
    reason,
  });

  // Keep last 200 audit entries
  if (state.auditLog.length > 200) {
    state.auditLog = state.auditLog.slice(-200);
  }

  saveRound2State(state);
  return state;
}

export function markAnswer(teamId, field, status) {
  // field: 'logoScore' or 'taglineScore'
  // status: 0 (incorrect) | 1 (correct) | null (pending)
  const state = getRound2State();
  if (!state.submissions[teamId]) state.submissions[teamId] = emptySubmission();
  state.submissions[teamId][field] = status;
  state.submissions[teamId].totalScore =
    (state.submissions[teamId].logoScore || 0) +
    (state.submissions[teamId].taglineScore || 0);
  state.submissions[teamId].scoredAt = ts();
  saveRound2State(state);
  return state;
}

// ─── Reveal answers ──────────────────────────────────────────────────────────

export function setAnswersRevealed(revealed) {
  const state = getRound2State();
  state.answersRevealed = revealed;
  saveRound2State(state);
  return state;
}

// ─── IndexedDB for images ────────────────────────────────────────────────────

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

/**
 * Save a logo image.
 * @param {number} setId  Question set ID (1-12)
 * @param {number} logoIndex  Logo index (0-3)
 * @param {string} dataUrl  Base64 data-URL of the image
 * @param {string} label  Optional internal label
 */
export async function saveLogoImage(setId, logoIndex, dataUrl, label = '') {
  const db = await openImageDB();
  const key = `set-${setId}-logo-${logoIndex}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(
      { data: dataUrl, label, uploadedAt: ts() },
      key
    );
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Get a single logo image.
 * @returns {{ data: string, label: string, uploadedAt: string } | null}
 */
export async function getLogoImage(setId, logoIndex) {
  const db = await openImageDB();
  const key = `set-${setId}-logo-${logoIndex}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Delete a logo image.
 */
export async function deleteLogoImage(setId, logoIndex) {
  const db = await openImageDB();
  const key = `set-${setId}-logo-${logoIndex}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Get all 4 logo images for a question set.
 * @returns {Array<{ data: string, label: string, uploadedAt: string } | null>}
 */
export async function getSetImages(setId) {
  const results = [];
  for (let i = 0; i < 4; i++) {
    results.push(await getLogoImage(setId, i));
  }
  return results;
}

/**
 * Get all images across all sets.
 * @returns {{ [key: string]: { data, label, uploadedAt } }}
 */
export async function getAllImages() {
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

/**
 * Clear all Round 2 images from IndexedDB.
 */
export async function clearAllImages() {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

// ─── Utility: file/blob → data-URL ──────────────────────────────────────────

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
