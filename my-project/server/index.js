/**
 * Business Quiz — Round 1 Examination Server
 *
 * Local-network Express + WebSocket server for the online MCQ examination.
 * Provides server-authoritative timer, session management, real-time monitoring,
 * and QR code generation for LAN access.
 *
 * Usage:
 *   node server/index.js              (default port 3001)
 *   PORT=8080 node server/index.js    (custom port)
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { networkInterfaces } from 'os';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID, randomBytes } from 'crypto';
import { ROUND1_QUESTIONS, ROUND1_META } from '../src/data/questions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = parseInt(process.env.PORT || '3001', 10);
const DATA_DIR = join(__dirname, 'data');
const STATE_FILE = join(DATA_DIR, 'exam-state.json');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'bq-admin-2024';

// ─── Ensure data directory ────────────────────────────────────────────────────
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

// ─── State Management ─────────────────────────────────────────────────────────

const DEFAULT_ANSWER_KEY = {
  1: 'B', 2: 'B', 3: 'A', 4: 'A', 5: 'B',
  6: 'A', 7: 'D', 8: 'A', 9: 'A', 10: 'B',
  11: 'B', 12: 'B', 13: 'B', 14: 'B', 15: 'A',
};

function defaultState() {
  return {
    config: {
      status: 'setup',          // setup | ready | active | paused | completed
      duration: ROUND1_META.defaultDuration,
      startTime: null,
      pauseTime: null,
      pausedDuration: 0,
      answerKeySet: true,
      registrationOpen: false,
      examAccessEnabled: true,
      deviceLimit: 1,
      randomizeQuestions: false,
      randomizeOptions: false,
      negativeMarking: false,
      negativePoints: 0,
      startMode: 'synchronized', // synchronized | individual
    },
    answerKey: { ...DEFAULT_ANSWER_KEY },
    teams: [],
    sessions: {},
    activityLog: [],
    graded: true,
  };
}

function loadState() {
  try {
    if (existsSync(STATE_FILE)) {
      const raw = readFileSync(STATE_FILE, 'utf-8');
      const saved = JSON.parse(raw);
      return { ...defaultState(), ...saved };
    }
  } catch (e) {
    console.error('Failed to load state, using defaults:', e.message);
  }
  return defaultState();
}

function saveState() {
  try {
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save state:', e.message);
  }
}

let state = loadState();

// ─── Network Utilities ────────────────────────────────────────────────────────

function getLanAddresses() {
  const ifaces = networkInterfaces();
  const addresses = [];
  for (const [name, nets] of Object.entries(ifaces)) {
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({ name, address: net.address });
      }
    }
  }
  return addresses;
}

function getExamUrl(port, address) {
  return `http://${address}:${port}/exam`;
}

// ─── Express App ──────────────────────────────────────────────────────────────

const app = express();
const server = createServer(app);
app.use(express.json({ limit: '5mb' }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Team-Token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ─── Helper: get time remaining ───────────────────────────────────────────────

function getTimeRemaining(session) {
  if (state.config.status === 'completed') return 0;

  if (state.config.status !== 'active' && state.config.status !== 'paused') {
    return state.config.duration || ROUND1_META.defaultDuration;
  }

  const startTime = state.config.startMode === 'synchronized'
    ? state.config.startTime
    : (session?.examStartTime || state.config.startTime);

  if (!startTime) return state.config.duration || ROUND1_META.defaultDuration;

  const elapsed = (Date.now() - new Date(startTime).getTime()) / 1000;
  const pausedTime = state.config.pausedDuration || 0;
  const extraTime = session?.extraTime || 0;
  const remaining = (state.config.duration || ROUND1_META.defaultDuration) + extraTime - elapsed + pausedTime;

  if (state.config.status === 'paused') {
    const pauseElapsed = (Date.now() - new Date(state.config.pauseTime).getTime()) / 1000;
    return Math.max(0, Math.ceil(remaining + pauseElapsed));
  }

  return Math.max(0, Math.ceil(remaining));
}

function getGlobalTimeRemaining() {
  if (state.config.status === 'completed') return 0;
  if (!state.config.startTime || (state.config.status !== 'active' && state.config.status !== 'paused')) {
    return state.config.duration || ROUND1_META.defaultDuration;
  }

  const elapsed = (Date.now() - new Date(state.config.startTime).getTime()) / 1000;
  const pausedTime = state.config.pausedDuration || 0;
  const remaining = (state.config.duration || ROUND1_META.defaultDuration) - elapsed + pausedTime;

  if (state.config.status === 'paused') {
    const pauseElapsed = (Date.now() - new Date(state.config.pauseTime).getTime()) / 1000;
    return Math.max(0, Math.ceil(remaining + pauseElapsed));
  }

  return Math.max(0, Math.ceil(remaining));
}

// ─── Helper: generate access code ────────────────────────────────────────────

function generateAccessCode() {
  return randomBytes(3).toString('hex').toUpperCase();
}

// ─── Helper: grade a team ─────────────────────────────────────────────────────

function gradeTeam(teamId) {
  const session = state.sessions[teamId];
  if (!session) return null;

  const answers = session.answers || {};
  let correct = 0, incorrect = 0, unanswered = 0;

  for (const q of ROUND1_QUESTIONS) {
    const teamAnswer = answers[q.number];
    const correctAnswer = state.answerKey[q.number];
    if (!teamAnswer) {
      unanswered++;
    } else if (teamAnswer === correctAnswer) {
      correct++;
    } else {
      incorrect++;
    }
  }

  let score = correct * ROUND1_META.marksPerQuestion;
  if (state.config.negativeMarking) {
    score -= incorrect * (state.config.negativePoints || 0);
  }
  score = Math.max(0, score);

  session.score = score;
  session.correctCount = correct;
  session.incorrectCount = incorrect;
  session.unansweredCount = unanswered;

  return { score, correct, incorrect, unanswered };
}

// ─── Middleware: admin auth ───────────────────────────────────────────────────

function adminAuth(req, res, next) {
  // For local network, use a simple token check
  const auth = req.headers.authorization;
  if (auth === `Bearer ${ADMIN_TOKEN}`) return next();
  // Also allow without auth for local development
  return next();
}

// ─── Middleware: participant auth ──────────────────────────────────────────────

function participantAuth(req, res, next) {
  const token = req.headers['x-team-token'];
  if (!token) return res.status(401).json({ error: 'No session token' });

  const teamId = Object.keys(state.sessions).find(
    (id) => state.sessions[id].token === token
  );
  if (!teamId) return res.status(401).json({ error: 'Invalid session token' });

  req.teamId = teamId;
  req.session = state.sessions[teamId];
  next();
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH & NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: state.config.status, time: new Date().toISOString() });
});

app.get('/api/network', async (req, res) => {
  const addresses = getLanAddresses();
  const primary = addresses[0]?.address || 'localhost';
  const examUrl = getExamUrl(PORT, primary);

  let qrDataUrl = null;
  try {
    const QRCode = await import('qrcode');
    qrDataUrl = await QRCode.default.toDataURL(examUrl, {
      width: 400, margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
  } catch {
    // qrcode not available — client will generate
  }

  res.json({ addresses, primary, port: PORT, examUrl, qrDataUrl });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN API
// ═══════════════════════════════════════════════════════════════════════════════

// Sync teams from admin localStorage
app.post('/api/admin/sync-teams', adminAuth, (req, res) => {
  const { teams } = req.body;
  if (!Array.isArray(teams)) return res.status(400).json({ error: 'Invalid teams data' });

  state.teams = teams.map((t) => ({
    id: t.id,
    teamNumber: t.teamNumber,
    name: t.name,
    member1: t.member1,
    member2: t.member2,
    college: t.college || '',
    accessCode: state.sessions[t.id]?.accessCode || generateAccessCode(),
  }));

  // Create sessions for new teams
  for (const t of state.teams) {
    if (!state.sessions[t.id]) {
      state.sessions[t.id] = {
        teamId: t.id,
        teamNumber: t.teamNumber,
        teamName: t.name,
        accessCode: t.accessCode,
        token: null,
        status: 'not_started',
        loginTime: null,
        examStartTime: null,
        submitTime: null,
        answers: {},
        score: null,
        correctCount: null,
        incorrectCount: null,
        unansweredCount: null,
        deviceInfo: null,
        lastSeen: null,
        isConnected: false,
        alertCount: 0,
        extraTime: 0,
        reviewStatus: 'none',
      };
    } else {
      // Update team info but preserve session
      state.sessions[t.id].teamNumber = t.teamNumber;
      state.sessions[t.id].teamName = t.name;
      state.sessions[t.id].accessCode = t.accessCode;
    }
  }

  // Remove sessions for teams that no longer exist
  const teamIds = new Set(state.teams.map((t) => t.id));
  for (const id of Object.keys(state.sessions)) {
    if (!teamIds.has(id)) delete state.sessions[id];
  }

  saveState();
  broadcastAdmin();
  res.json({ ok: true, teams: state.teams });
});

// Get questions with answers (admin only)
app.get('/api/admin/questions', adminAuth, (req, res) => {
  res.json({
    questions: ROUND1_QUESTIONS,
    answerKey: state.answerKey,
    answerKeySet: state.config.answerKeySet,
    meta: ROUND1_META,
  });
});

// Set answer key
app.post('/api/admin/answer-key', adminAuth, (req, res) => {
  const { answerKey } = req.body;
  if (!answerKey || typeof answerKey !== 'object') {
    return res.status(400).json({ error: 'Invalid answer key' });
  }

  // Validate all 15 questions have answers
  const missing = [];
  for (const q of ROUND1_QUESTIONS) {
    if (!answerKey[q.number] || !['A', 'B', 'C', 'D'].includes(answerKey[q.number])) {
      missing.push(q.number);
    }
  }

  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing or invalid answers for questions: ${missing.join(', ')}` });
  }

  state.answerKey = answerKey;
  state.config.answerKeySet = true;
  saveState();
  res.json({ ok: true });
});

// Get exam config
app.get('/api/admin/config', adminAuth, (req, res) => {
  res.json({
    config: state.config,
    teamCount: state.teams.length,
    timeRemaining: getGlobalTimeRemaining(),
  });
});

// Update exam config
app.post('/api/admin/config', adminAuth, (req, res) => {
  const allowed = [
    'duration', 'registrationOpen', 'examAccessEnabled', 'deviceLimit',
    'randomizeQuestions', 'randomizeOptions', 'negativeMarking',
    'negativePoints', 'startMode',
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) state.config[key] = req.body[key];
  }
  saveState();
  broadcastAdmin();
  res.json({ ok: true, config: state.config });
});

// Start exam
app.post('/api/admin/exam/start', adminAuth, (req, res) => {
  if (!state.config.answerKeySet) {
    return res.status(400).json({ error: 'Answer key must be set before starting the exam' });
  }
  if (state.teams.length === 0) {
    return res.status(400).json({ error: 'No teams synced — sync teams first' });
  }
  if (state.config.status === 'active') {
    return res.status(400).json({ error: 'Exam is already active' });
  }

  state.config.status = 'active';
  state.config.startTime = new Date().toISOString();
  state.config.pauseTime = null;
  state.config.pausedDuration = 0;
  state.graded = false;

  // Mark logged-in teams as in_progress
  for (const session of Object.values(state.sessions)) {
    if (session.status === 'logged_in') {
      session.status = 'in_progress';
      session.examStartTime = state.config.startTime;
    }
  }

  saveState();
  broadcastAll({ type: 'exam_started', startTime: state.config.startTime, duration: state.config.duration });
  broadcastAdmin();
  startTimerBroadcast();
  res.json({ ok: true });
});

// Pause exam
app.post('/api/admin/exam/pause', adminAuth, (req, res) => {
  if (state.config.status !== 'active') {
    return res.status(400).json({ error: 'Exam is not active' });
  }
  state.config.status = 'paused';
  state.config.pauseTime = new Date().toISOString();
  saveState();
  broadcastAll({ type: 'exam_paused' });
  broadcastAdmin();
  res.json({ ok: true });
});

// Resume exam
app.post('/api/admin/exam/resume', adminAuth, (req, res) => {
  if (state.config.status !== 'paused') {
    return res.status(400).json({ error: 'Exam is not paused' });
  }
  const pauseElapsed = (Date.now() - new Date(state.config.pauseTime).getTime()) / 1000;
  state.config.pausedDuration = (state.config.pausedDuration || 0) + pauseElapsed;
  state.config.status = 'active';
  state.config.pauseTime = null;
  saveState();
  broadcastAll({ type: 'exam_resumed' });
  broadcastAdmin();
  startTimerBroadcast();
  res.json({ ok: true });
});

// Stop/close exam
app.post('/api/admin/exam/stop', adminAuth, (req, res) => {
  state.config.status = 'completed';

  // Auto-submit any in-progress sessions
  for (const session of Object.values(state.sessions)) {
    if (session.status === 'in_progress' || session.status === 'logged_in') {
      session.status = 'time_expired';
      session.submitTime = new Date().toISOString();
    }
  }

  // Auto-grade all
  if (state.config.answerKeySet) {
    for (const teamId of Object.keys(state.sessions)) {
      gradeTeam(teamId);
    }
    state.graded = true;
  }

  saveState();
  broadcastAll({ type: 'exam_ended' });
  broadcastAdmin();
  res.json({ ok: true });
});

// Reset a team's session
app.post('/api/admin/exam/reset-session', adminAuth, (req, res) => {
  const { teamId } = req.body;
  if (!state.sessions[teamId]) return res.status(404).json({ error: 'Team not found' });

  const team = state.teams.find((t) => t.id === teamId);
  state.sessions[teamId] = {
    ...state.sessions[teamId],
    token: null,
    status: 'not_started',
    loginTime: null,
    examStartTime: null,
    submitTime: null,
    answers: {},
    score: null,
    correctCount: null,
    incorrectCount: null,
    unansweredCount: null,
    deviceInfo: null,
    lastSeen: null,
    isConnected: false,
    alertCount: 0,
    extraTime: 0,
    reviewStatus: 'none',
  };

  state.activityLog.push({
    id: randomUUID(),
    teamId,
    teamName: team?.name || 'Unknown',
    eventType: 'session_reset',
    timestamp: new Date().toISOString(),
    details: 'Session reset by administrator',
    reviewStatus: 'resolved',
  });

  saveState();
  broadcastAdmin();
  res.json({ ok: true });
});

// Extend time for a team
app.post('/api/admin/exam/extend-time', adminAuth, (req, res) => {
  const { teamId, extraSeconds } = req.body;
  if (!state.sessions[teamId]) return res.status(404).json({ error: 'Team not found' });

  state.sessions[teamId].extraTime = (state.sessions[teamId].extraTime || 0) + (extraSeconds || 0);

  state.activityLog.push({
    id: randomUUID(),
    teamId,
    teamName: state.sessions[teamId].teamName,
    eventType: 'time_extended',
    timestamp: new Date().toISOString(),
    details: `Extended by ${extraSeconds}s (total extra: ${state.sessions[teamId].extraTime}s)`,
    reviewStatus: 'resolved',
  });

  saveState();
  broadcastAdmin();
  res.json({ ok: true });
});

// Get monitoring data
app.get('/api/admin/monitor', adminAuth, (req, res) => {
  const sessions = Object.values(state.sessions).map((s) => ({
    ...s,
    accessCode: s.accessCode,
    timeRemaining: getTimeRemaining(s),
    answeredCount: Object.keys(s.answers || {}).length,
    token: undefined, // Don't expose tokens
  }));

  const stats = {
    totalTeams: state.teams.length,
    loggedIn: sessions.filter((s) => s.status !== 'not_started').length,
    inProgress: sessions.filter((s) => s.status === 'in_progress').length,
    submitted: sessions.filter((s) => s.status === 'submitted').length,
    timeExpired: sessions.filter((s) => s.status === 'time_expired').length,
    disconnected: sessions.filter((s) => !s.isConnected && s.status === 'in_progress').length,
    alertCount: state.activityLog.filter((a) => a.reviewStatus === 'unreviewed').length,
    examStatus: state.config.status,
    timeRemaining: getGlobalTimeRemaining(),
  };

  res.json({ sessions, stats, config: state.config });
});

// Get activity log
app.get('/api/admin/activity-log', adminAuth, (req, res) => {
  res.json({ log: state.activityLog });
});

// Resolve/annotate alert
app.post('/api/admin/resolve-alert', adminAuth, (req, res) => {
  const { alertId, reviewStatus, annotation } = req.body;
  const entry = state.activityLog.find((a) => a.id === alertId);
  if (!entry) return res.status(404).json({ error: 'Alert not found' });

  entry.reviewStatus = reviewStatus || 'reviewed';
  if (annotation) entry.annotation = annotation;
  saveState();
  broadcastAdmin();
  res.json({ ok: true });
});

// Grade all teams
app.post('/api/admin/grade', adminAuth, (req, res) => {
  if (!state.config.answerKeySet) {
    return res.status(400).json({ error: 'Answer key not set' });
  }

  const results = {};
  for (const teamId of Object.keys(state.sessions)) {
    results[teamId] = gradeTeam(teamId);
  }

  state.graded = true;
  saveState();
  broadcastAdmin();
  res.json({ ok: true, results });
});

// Get results
app.get('/api/admin/results', adminAuth, (req, res) => {
  const results = Object.entries(state.sessions).map(([teamId, s]) => {
    const team = state.teams.find((t) => t.id === teamId);
    return {
      teamId,
      teamNumber: team?.teamNumber || s.teamNumber,
      teamName: team?.name || s.teamName,
      member1: team?.member1 || '',
      member2: team?.member2 || '',
      college: team?.college || '',
      status: s.status,
      answers: s.answers,
      score: s.score,
      correctCount: s.correctCount,
      incorrectCount: s.incorrectCount,
      unansweredCount: s.unansweredCount,
      submitTime: s.submitTime,
      loginTime: s.loginTime,
      alertCount: s.alertCount,
      reviewStatus: s.reviewStatus,
      extraTime: s.extraTime,
    };
  });

  results.sort((a, b) => (b.score || 0) - (a.score || 0));
  res.json({ results, answerKey: state.answerKey, graded: state.graded, questions: ROUND1_QUESTIONS });
});

// Export results as CSV
app.get('/api/admin/export', adminAuth, (req, res) => {
  const rows = [['Rank', 'Team #', 'Team Name', 'Member 1', 'Member 2', 'College', 'Score', 'Correct', 'Incorrect', 'Unanswered', 'Status', 'Alerts', 'Submitted At']];

  const results = Object.entries(state.sessions)
    .map(([teamId, s]) => {
      const team = state.teams.find((t) => t.id === teamId);
      return { teamId, team, session: s };
    })
    .sort((a, b) => (b.session.score || 0) - (a.session.score || 0));

  results.forEach(({ team, session }, idx) => {
    rows.push([
      idx + 1,
      team?.teamNumber || '',
      team?.name || session.teamName,
      team?.member1 || '',
      team?.member2 || '',
      team?.college || '',
      session.score ?? '',
      session.correctCount ?? '',
      session.incorrectCount ?? '',
      session.unansweredCount ?? '',
      session.status,
      session.alertCount,
      session.submitTime || '',
    ]);
  });

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="round1-results.csv"');
  res.send(csv);
});

// Reset exam state completely
app.post('/api/admin/reset', adminAuth, (req, res) => {
  state = defaultState();
  saveState();
  broadcastAdmin();
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICIPANT API
// ═══════════════════════════════════════════════════════════════════════════════

// Login
app.post('/api/exam/login', (req, res) => {
  const { teamName, accessCode } = req.body;

  if (!teamName) {
    return res.status(400).json({ error: 'Team name is required' });
  }

  // Find the team
  let team = null;
  if (accessCode && accessCode.trim()) {
    team = state.teams.find(
      (t) => t.name.toLowerCase().trim() === teamName.toLowerCase().trim()
          && t.accessCode === accessCode.toUpperCase().trim()
    );
  }
  if (!team) {
    team = state.teams.find(
      (t) => t.name.toLowerCase().trim() === teamName.toLowerCase().trim()
    );
  }

  if (!team) {
    return res.status(401).json({ error: 'Team not registered. Please check team name or ask admin to sync teams.' });
  }

  const session = state.sessions[team.id];
  if (!session) {
    return res.status(500).json({ error: 'Session not found. Contact the administrator.' });
  }

  // Check device limit
  if (session.token && session.isConnected && state.config.deviceLimit === 1) {
    return res.status(409).json({
      error: 'This team is already logged in from another device. Contact the administrator if this is an error.',
    });
  }

  // Generate new session token
  const token = randomUUID();
  session.token = token;
  session.status = state.config.status === 'active' ? 'in_progress' : 'logged_in';
  session.loginTime = session.loginTime || new Date().toISOString();
  session.deviceInfo = req.headers['user-agent'] || '';
  session.lastSeen = new Date().toISOString();
  session.isConnected = true;

  if (state.config.status === 'active' && !session.examStartTime) {
    session.examStartTime = state.config.startTime;
  }

  saveState();
  broadcastAdmin();

  res.json({
    ok: true,
    token,
    team: { id: team.id, name: team.name, teamNumber: team.teamNumber, member1: team.member1, member2: team.member2 },
    examStatus: state.config.status,
    timeRemaining: getTimeRemaining(session),
    duration: state.config.duration,
  });
});

// Restore session (on refresh/reconnect)
app.get('/api/exam/session', participantAuth, (req, res) => {
  const session = req.session;
  const team = state.teams.find((t) => t.id === req.teamId);

  session.lastSeen = new Date().toISOString();
  session.isConnected = true;

  res.json({
    ok: true,
    team: team ? { id: team.id, name: team.name, teamNumber: team.teamNumber, member1: team.member1, member2: team.member2 } : null,
    examStatus: state.config.status,
    sessionStatus: session.status,
    answers: session.answers || {},
    timeRemaining: getTimeRemaining(session),
    duration: state.config.duration,
    startTime: state.config.startTime,
  });
});

// Get questions (without correct answers)
app.get('/api/exam/questions', participantAuth, (req, res) => {
  if (!state.config.examAccessEnabled && state.config.status !== 'active') {
    return res.status(403).json({ error: 'Exam access is not yet enabled' });
  }

  // Return questions without answers
  const questions = ROUND1_QUESTIONS.map((q) => ({
    number: q.number,
    question: q.question,
    options: q.options,
  }));

  res.json({ questions, meta: ROUND1_META, totalQuestions: ROUND1_QUESTIONS.length });
});

// Save an answer
app.post('/api/exam/answer', participantAuth, (req, res) => {
  const session = req.session;
  const { questionNumber, answer } = req.body;

  if (session.status === 'submitted' || session.status === 'time_expired') {
    return res.status(403).json({ error: 'Exam already submitted' });
  }

  if (state.config.status === 'paused') {
    return res.status(403).json({ error: 'Exam is currently paused by administrator' });
  }
  if (state.config.status === 'completed') {
    return res.status(403).json({ error: 'Exam has ended' });
  }

  // Check time
  const remaining = getTimeRemaining(session);
  if (remaining <= 0) {
    session.status = 'time_expired';
    session.submitTime = new Date().toISOString();
    gradeTeam(req.teamId);
    saveState();
    broadcastAdmin();
    return res.status(403).json({ error: 'Time expired' });
  }

  if (!questionNumber || questionNumber < 1 || questionNumber > ROUND1_QUESTIONS.length) {
    return res.status(400).json({ error: 'Invalid question number' });
  }
  if (answer && !['A', 'B', 'C', 'D'].includes(answer)) {
    return res.status(400).json({ error: 'Invalid answer option' });
  }

  if (!session.answers) session.answers = {};
  if (answer) {
    session.answers[questionNumber] = answer;
  } else {
    delete session.answers[questionNumber];
  }

  session.lastSeen = new Date().toISOString();
  if (session.status === 'logged_in') session.status = 'in_progress';

  // Auto-grade team session live
  if (state.config.answerKeySet || Object.keys(state.answerKey || {}).length > 0) {
    gradeTeam(req.teamId);
  }

  saveState();
  broadcastAdmin();
  res.json({ ok: true, answeredCount: Object.keys(session.answers).length, score: session.score });
});

// Submit exam
app.post('/api/exam/submit', participantAuth, (req, res) => {
  const session = req.session;

  if (session.status === 'submitted' || session.status === 'time_expired') {
    return res.status(400).json({ error: 'Already submitted' });
  }

  session.status = 'submitted';
  session.submitTime = new Date().toISOString();

  // Grade team on submission
  if (state.config.answerKeySet || Object.keys(state.answerKey || {}).length > 0) {
    gradeTeam(req.teamId);
  }

  saveState();
  broadcastAdmin();
  res.json({
    ok: true,
    message: 'Exam submitted successfully',
    answeredCount: Object.keys(session.answers || {}).length,
    totalQuestions: ROUND1_QUESTIONS.length,
  });
});

// Log suspicious activity
app.post('/api/exam/activity', participantAuth, (req, res) => {
  const { eventType, details } = req.body;
  const session = req.session;
  const team = state.teams.find((t) => t.id === req.teamId);

  session.alertCount = (session.alertCount || 0) + 1;
  session.lastSeen = new Date().toISOString();

  // Determine review priority
  let reviewStatus = 'unreviewed';
  if (session.alertCount >= 5) {
    session.reviewStatus = 'flagged';
  }

  const entry = {
    id: randomUUID(),
    teamId: req.teamId,
    teamNumber: team?.teamNumber || session.teamNumber,
    teamName: team?.name || session.teamName,
    eventType: eventType || 'unknown',
    timestamp: new Date().toISOString(),
    details: details || '',
    eventCount: session.alertCount,
    examStatus: session.status,
    reviewStatus,
  };

  state.activityLog.push(entry);

  // Keep last 1000 entries
  if (state.activityLog.length > 1000) {
    state.activityLog = state.activityLog.slice(-1000);
  }

  saveState();

  // Broadcast alert to admin
  broadcastAdminAlert(entry);

  res.json({ ok: true, alertCount: session.alertCount });
});

// ═══════════════════════════════════════════════════════════════════════════════
// WEBSOCKET
// ═══════════════════════════════════════════════════════════════════════════════

const adminClients = new Set();
const participantClients = new Map(); // token -> ws

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  let role = null;
  let teamId = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'auth') {
        if (msg.role === 'admin') {
          role = 'admin';
          adminClients.add(ws);
          // Send initial state
          ws.send(JSON.stringify({ type: 'monitor_update', data: getMonitorData() }));
        } else if (msg.role === 'participant' && msg.token) {
          role = 'participant';
          const tid = Object.keys(state.sessions).find(
            (id) => state.sessions[id].token === msg.token
          );
          if (tid) {
            teamId = tid;
            participantClients.set(msg.token, ws);
            state.sessions[tid].isConnected = true;
            state.sessions[tid].lastSeen = new Date().toISOString();
            broadcastAdmin();
          }
        }
      }

      if (msg.type === 'heartbeat' && teamId) {
        state.sessions[teamId].lastSeen = new Date().toISOString();
        state.sessions[teamId].isConnected = true;
      }
    } catch {}
  });

  ws.on('close', () => {
    if (role === 'admin') {
      adminClients.delete(ws);
    } else if (role === 'participant' && teamId) {
      const session = state.sessions[teamId];
      if (session) {
        session.isConnected = false;
        if (session.status === 'in_progress') {
          state.activityLog.push({
            id: randomUUID(),
            teamId,
            teamName: session.teamName,
            eventType: 'disconnected',
            timestamp: new Date().toISOString(),
            details: 'WebSocket connection lost',
            reviewStatus: 'unreviewed',
          });
        }
        saveState();
        broadcastAdmin();
      }
      for (const [token, client] of participantClients) {
        if (client === ws) { participantClients.delete(token); break; }
      }
    }
  });

  ws.on('error', () => {});
});

function getMonitorData() {
  const sessions = Object.values(state.sessions).map((s) => ({
    teamId: s.teamId,
    teamNumber: s.teamNumber,
    teamName: s.teamName,
    accessCode: s.accessCode,
    status: s.status,
    loginTime: s.loginTime,
    submitTime: s.submitTime,
    isConnected: s.isConnected,
    answeredCount: Object.keys(s.answers || {}).length,
    score: s.score,
    alertCount: s.alertCount,
    reviewStatus: s.reviewStatus,
    timeRemaining: getTimeRemaining(s),
    lastSeen: s.lastSeen,
  }));

  return {
    sessions,
    config: state.config,
    timeRemaining: getGlobalTimeRemaining(),
    totalTeams: state.teams.length,
    alertCount: state.activityLog.filter((a) => a.reviewStatus === 'unreviewed').length,
  };
}

function broadcastAdmin() {
  const data = JSON.stringify({ type: 'monitor_update', data: getMonitorData() });
  for (const ws of adminClients) {
    if (ws.readyState === 1) ws.send(data);
  }
}

function broadcastAdminAlert(alert) {
  const data = JSON.stringify({ type: 'alert', data: alert });
  for (const ws of adminClients) {
    if (ws.readyState === 1) ws.send(data);
  }
}

function broadcastAll(message) {
  const data = JSON.stringify(message);
  for (const ws of adminClients) {
    if (ws.readyState === 1) ws.send(data);
  }
  for (const ws of participantClients.values()) {
    if (ws.readyState === 1) ws.send(data);
  }
}

// ─── Timer Broadcast ──────────────────────────────────────────────────────────

let timerInterval = null;

function startTimerBroadcast() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (state.config.status !== 'active') {
      clearInterval(timerInterval);
      timerInterval = null;
      return;
    }

    const remaining = getGlobalTimeRemaining();

    // Broadcast to all participants
    const timerMsg = JSON.stringify({ type: 'timer_sync', remaining });
    for (const ws of participantClients.values()) {
      if (ws.readyState === 1) ws.send(timerMsg);
    }

    // Broadcast to admins
    broadcastAdmin();

    // Auto-end exam when time expires
    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;

      state.config.status = 'completed';

      for (const session of Object.values(state.sessions)) {
        if (session.status === 'in_progress' || session.status === 'logged_in') {
          session.status = 'time_expired';
          session.submitTime = new Date().toISOString();
        }
      }

      if (state.config.answerKeySet) {
        for (const teamId of Object.keys(state.sessions)) {
          gradeTeam(teamId);
        }
        state.graded = true;
      }

      saveState();
      broadcastAll({ type: 'exam_ended' });
      broadcastAdmin();
    }
  }, 1000);
}

// Resume timer on server restart if exam was active
if (state.config.status === 'active') {
  startTimerBroadcast();
}

// ─── Static Files & SPA Fallback ──────────────────────────────────────────────

const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// ─── Start Server ─────────────────────────────────────────────────────────────

server.listen(PORT, '0.0.0.0', () => {
  const addresses = getLanAddresses();
  const primary = addresses[0]?.address || 'localhost';

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   Business Quiz — Round 1 Examination Server');
  console.log('   Annaimira College of Engineering and Technology');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`   Server running on port ${PORT}`);
  console.log('');
  console.log('   Network addresses:');
  addresses.forEach((a) => {
    console.log(`     ${a.name}: http://${a.address}:${PORT}`);
  });
  console.log('');
  console.log(`   📱 Participant exam URL: ${getExamUrl(PORT, primary)}`);
  console.log(`   🖥️  Admin dashboard:     http://${primary}:${PORT}/`);
  console.log('');
  console.log('   Make sure all devices are on the same Wi-Fi network.');
  console.log('   Windows Firewall: allow Node.js through for Private networks.');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  saveState();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  saveState();
  server.close();
  process.exit(0);
});
