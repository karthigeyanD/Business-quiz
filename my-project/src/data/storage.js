/**
 * Data storage layer — localStorage for v1.
 * Every public function is async-shaped (returns values directly now,
 * but the signature makes swapping to an API trivial).
 *
 * Keys used in localStorage:
 *   bq_teams       — array of team objects
 *   bq_rounds      — array of round objects (each contains questions[])
 *   bq_scores      — { [teamId]: { [roundId]: number } }
 *   bq_live        — live-display state
 */

const KEYS = {
  teams: 'bq_teams',
  rounds: 'bq_rounds',
  scores: 'bq_scores',
  live: 'bq_live',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Default data (clearly marked as example / starter content)
// ---------------------------------------------------------------------------

function defaultRounds() {
  return [
    { id: uid(), name: 'Round 1 — General Business', timerSeconds: 30, questions: [] },
    { id: uid(), name: 'Round 2 — Marketing', timerSeconds: 30, questions: [] },
    { id: uid(), name: 'Round 3 — Finance', timerSeconds: 45, questions: [] },
    { id: uid(), name: 'Round 4 — Strategy', timerSeconds: 45, questions: [] },
    { id: uid(), name: 'Round 5 — Rapid Fire', timerSeconds: 15, questions: [] },
  ];
}

// ---------------------------------------------------------------------------
// Teams  (max 20, each has 2 members)
// ---------------------------------------------------------------------------

export function getTeams() {
  return read(KEYS.teams) || [];
}

export function saveTeams(teams) {
  write(KEYS.teams, teams);
}

export function addTeam(name, member1, member2) {
  const teams = getTeams();
  if (teams.length >= 20) throw new Error('Maximum 20 teams reached');
  const team = { id: uid(), name, member1, member2 };
  teams.push(team);
  saveTeams(teams);
  return team;
}

export function updateTeam(id, data) {
  const teams = getTeams().map((t) => (t.id === id ? { ...t, ...data } : t));
  saveTeams(teams);
}

export function removeTeam(id) {
  saveTeams(getTeams().filter((t) => t.id !== id));
  // Also clean up scores for this team
  const scores = getScores();
  delete scores[id];
  saveScores(scores);
}

// ---------------------------------------------------------------------------
// Rounds & Questions
// ---------------------------------------------------------------------------

export function getRounds() {
  let rounds = read(KEYS.rounds);
  if (!rounds || rounds.length === 0) {
    rounds = defaultRounds();
    write(KEYS.rounds, rounds);
  }
  return rounds;
}

export function saveRounds(rounds) {
  write(KEYS.rounds, rounds);
}

export function updateRound(roundId, data) {
  const rounds = getRounds().map((r) =>
    r.id === roundId ? { ...r, ...data } : r
  );
  saveRounds(rounds);
}

export function addQuestion(roundId, questionText, answerText) {
  const rounds = getRounds();
  const round = rounds.find((r) => r.id === roundId);
  if (!round) return;
  round.questions.push({ id: uid(), question: questionText, answer: answerText });
  saveRounds(rounds);
}

export function updateQuestion(roundId, questionId, data) {
  const rounds = getRounds();
  const round = rounds.find((r) => r.id === roundId);
  if (!round) return;
  round.questions = round.questions.map((q) =>
    q.id === questionId ? { ...q, ...data } : q
  );
  saveRounds(rounds);
}

export function removeQuestion(roundId, questionId) {
  const rounds = getRounds();
  const round = rounds.find((r) => r.id === roundId);
  if (!round) return;
  round.questions = round.questions.filter((q) => q.id !== questionId);
  saveRounds(rounds);
}

// ---------------------------------------------------------------------------
// Scores   { [teamId]: { [roundId]: number } }
// ---------------------------------------------------------------------------

export function getScores() {
  return read(KEYS.scores) || {};
}

export function saveScores(scores) {
  write(KEYS.scores, scores);
}

export function setScore(teamId, roundId, points) {
  const scores = getScores();
  if (!scores[teamId]) scores[teamId] = {};
  scores[teamId][roundId] = (scores[teamId][roundId] || 0) + points;
  saveScores(scores);
  return scores;
}

export function getTeamTotal(teamId) {
  const scores = getScores();
  if (!scores[teamId]) return 0;
  return Object.values(scores[teamId]).reduce((sum, v) => sum + v, 0);
}

export function getLeaderboard() {
  const teams = getTeams();
  const scores = getScores();
  return teams
    .map((t) => ({
      ...t,
      total: scores[t.id]
        ? Object.values(scores[t.id]).reduce((s, v) => s + v, 0)
        : 0,
      byRound: scores[t.id] || {},
    }))
    .sort((a, b) => b.total - a.total);
}

// ---------------------------------------------------------------------------
// Live display state
// ---------------------------------------------------------------------------

const defaultLive = () => ({
  activeRoundId: null,
  activeQuestionIndex: 0,
  answerRevealed: false,
  timerRunning: false,
  timerRemaining: null,
});

export function getLiveState() {
  return read(KEYS.live) || defaultLive();
}

export function saveLiveState(state) {
  write(KEYS.live, state);
}

// ---------------------------------------------------------------------------
// Reset everything (useful for dev / demo)
// ---------------------------------------------------------------------------

export function resetAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
