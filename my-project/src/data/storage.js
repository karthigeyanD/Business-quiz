/**
 * Data storage layer — localStorage for v1.
 * Every public function returns values directly now,
 * but the signature makes swapping to an API trivial.
 *
 * Keys used in localStorage:
 *   bq_teams        — array of team objects
 *   bq_rounds       — array of round objects (each contains questions[])
 *   bq_scores       — { [teamId]: { [roundIndex]: number } }
 *   bq_live         — live-display state
 *   bq_competition  — competition state (status, current round, etc.)
 *   bq_qualification— qualification matrix & settings
 *   bq_scoring_cfg  — scoring configuration
 *   bq_audit        — audit log for score changes & overrides
 */

const KEYS = {
  teams: 'bq_teams',
  rounds: 'bq_rounds',
  scores: 'bq_scores',
  live: 'bq_live',
  competition: 'bq_competition',
  qualification: 'bq_qualification',
  scoringConfig: 'bq_scoring_cfg',
  audit: 'bq_audit',
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

function timestamp() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Qualification Matrix (5–20 teams) — exact provisional rules
// Each row: [R1 participants, R2 participants, R3 participants, R4 participants, R5 participants]
// ---------------------------------------------------------------------------

export const DEFAULT_QUALIFICATION_MATRIX = {
  5:  [5, 5, 5, 5, 5],
  6:  [6, 6, 6, 6, 5],
  7:  [7, 7, 7, 6, 5],
  8:  [8, 8, 8, 6, 5],
  9:  [9, 9, 9, 6, 5],
  10: [10, 10, 9, 6, 5],
  11: [11, 11, 9, 6, 5],
  12: [12, 12, 9, 6, 5],
  13: [13, 12, 9, 6, 5],
  14: [14, 12, 9, 6, 5],
  15: [15, 12, 9, 6, 5],
  16: [16, 12, 9, 6, 5],
  17: [17, 12, 9, 6, 5],
  18: [18, 12, 9, 6, 5],
  19: [19, 12, 9, 6, 5],
  20: [20, 12, 9, 6, 5],
};

// ---------------------------------------------------------------------------
// Default data
// ---------------------------------------------------------------------------

function defaultRounds() {
  return [
    {
      id: 'round-1',
      name: 'Round 1',
      roundNumber: 1,
      timerSeconds: 30,
      status: 'pending',      // pending | active | completed
      questions: [],
      description: 'Placeholder — content to be provided by organizer',
    },
    {
      id: 'round-2',
      name: 'Round 2',
      roundNumber: 2,
      timerSeconds: 30,
      status: 'pending',
      questions: [],
      description: 'Placeholder — content to be provided by organizer',
    },
    {
      id: 'round-3',
      name: 'Round 3',
      roundNumber: 3,
      timerSeconds: 45,
      status: 'pending',
      questions: [],
      description: 'Placeholder — content to be provided by organizer',
    },
    {
      id: 'round-4',
      name: 'Round 4',
      roundNumber: 4,
      timerSeconds: 45,
      status: 'pending',
      questions: [],
      description: 'Placeholder — content to be provided by organizer',
    },
    {
      id: 'round-5',
      name: 'Round 5',
      roundNumber: 5,
      timerSeconds: 15,
      status: 'pending',
      questions: [],
      description: 'Placeholder — content to be provided by organizer',
    },
  ];
}

function defaultCompetition() {
  return {
    status: 'registration',    // registration | started | completed
    currentRound: 0,           // 0 = not started, 1–5 = active round
    startedAt: null,
    completedAt: null,
    winner: null,
    runnerUp: null,
  };
}

function defaultScoringConfig() {
  return {
    correctPoints: 10,
    negativeMarking: false,
    negativePoints: 0,
    bonusPoints: 0,
    qualificationBasis: 'cumulative',  // 'cumulative' | 'round'
    tieBreaker: 'higher-recent',       // 'higher-recent' | 'head-to-head' | 'manual'
  };
}

function defaultQualification() {
  return {
    matrix: { ...DEFAULT_QUALIFICATION_MATRIX },
    isProvisional: true,
    confirmedRounds: [],  // round IDs whose results have been confirmed
    overrides: {},        // { [teamId]: { round: number, action: 'qualify' | 'eliminate', reason: '' } }
  };
}

// ---------------------------------------------------------------------------
// Teams  (min 5, max 20, each has 2 members)
// ---------------------------------------------------------------------------

export function getTeams() {
  return read(KEYS.teams) || [];
}

export function saveTeams(teams) {
  write(KEYS.teams, teams);
}

export function addTeam(name, member1, member2, college = '') {
  const teams = getTeams();
  if (teams.length >= 20) throw new Error('Maximum 20 teams reached');
  const teamNumber = teams.length + 1;
  const team = {
    id: uid(),
    teamNumber,
    name,
    member1,
    member2,
    college,
    registrationStatus: 'registered',
    qualificationStatus: 'active',       // active | qualified | eliminated
    eliminatedAfterRound: null,
    createdAt: timestamp(),
  };
  teams.push(team);
  saveTeams(teams);
  return team;
}

export function updateTeam(id, data) {
  const teams = getTeams().map((t) => (t.id === id ? { ...t, ...data } : t));
  saveTeams(teams);
}

export function removeTeam(id) {
  const teams = getTeams().filter((t) => t.id !== id);
  // Renumber
  teams.forEach((t, i) => { t.teamNumber = i + 1; });
  saveTeams(teams);
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
  const oldValue = scores[teamId][roundId] || 0;
  scores[teamId][roundId] = oldValue + points;
  saveScores(scores);

  // Audit log
  addAuditEntry({
    type: 'score_change',
    teamId,
    roundId,
    oldValue,
    newValue: scores[teamId][roundId],
    delta: points,
  });

  return scores;
}

export function setScoreDirect(teamId, roundId, value) {
  const scores = getScores();
  if (!scores[teamId]) scores[teamId] = {};
  const oldValue = scores[teamId][roundId] || 0;
  scores[teamId][roundId] = value;
  saveScores(scores);

  addAuditEntry({
    type: 'score_direct_set',
    teamId,
    roundId,
    oldValue,
    newValue: value,
  });

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
  const rounds = getRounds();
  return teams
    .map((t) => ({
      ...t,
      total: scores[t.id]
        ? Object.values(scores[t.id]).reduce((s, v) => s + v, 0)
        : 0,
      byRound: scores[t.id] || {},
      roundScores: rounds.map((r) => (scores[t.id] ? scores[t.id][r.id] || 0 : 0)),
    }))
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      // Tie-break: higher score in most recent round wins
      for (let i = rounds.length - 1; i >= 0; i--) {
        const aScore = a.roundScores[i] || 0;
        const bScore = b.roundScores[i] || 0;
        if (bScore !== aScore) return bScore - aScore;
      }
      return 0;
    });
}

// ---------------------------------------------------------------------------
// Competition state
// ---------------------------------------------------------------------------

export function getCompetition() {
  return read(KEYS.competition) || defaultCompetition();
}

export function saveCompetition(comp) {
  write(KEYS.competition, comp);
}

export function startCompetition() {
  const teams = getTeams();
  if (teams.length < 5) throw new Error('Minimum 5 teams required to start');
  if (teams.length > 20) throw new Error('Maximum 20 teams allowed');

  const comp = getCompetition();
  comp.status = 'started';
  comp.currentRound = 1;
  comp.startedAt = timestamp();
  saveCompetition(comp);

  // Mark round 1 as active
  const rounds = getRounds();
  if (rounds[0]) {
    rounds[0].status = 'active';
    saveRounds(rounds);
  }

  return comp;
}

export function advanceRound() {
  const comp = getCompetition();
  if (comp.currentRound >= 5) {
    comp.status = 'completed';
    comp.completedAt = timestamp();
    // Determine winner and runner-up
    const lb = getLeaderboard().filter((t) => t.qualificationStatus !== 'eliminated');
    if (lb.length >= 1) comp.winner = { id: lb[0].id, name: lb[0].name, total: lb[0].total };
    if (lb.length >= 2) comp.runnerUp = { id: lb[1].id, name: lb[1].name, total: lb[1].total };
    saveCompetition(comp);
    return comp;
  }

  // Mark current round as completed
  const rounds = getRounds();
  const currentRoundIdx = comp.currentRound - 1;
  if (rounds[currentRoundIdx]) {
    rounds[currentRoundIdx].status = 'completed';
  }

  comp.currentRound += 1;

  // Mark next round as active
  const nextRoundIdx = comp.currentRound - 1;
  if (rounds[nextRoundIdx]) {
    rounds[nextRoundIdx].status = 'active';
  }

  saveRounds(rounds);
  saveCompetition(comp);
  return comp;
}

export function completeCompetition() {
  const comp = getCompetition();
  comp.status = 'completed';
  comp.completedAt = timestamp();

  const lb = getLeaderboard().filter((t) => t.qualificationStatus !== 'eliminated');
  if (lb.length >= 1) comp.winner = { id: lb[0].id, name: lb[0].name, total: lb[0].total };
  if (lb.length >= 2) comp.runnerUp = { id: lb[1].id, name: lb[1].name, total: lb[1].total };

  // Mark final round as completed
  const rounds = getRounds();
  const lastRound = rounds[comp.currentRound - 1];
  if (lastRound) lastRound.status = 'completed';
  saveRounds(rounds);

  saveCompetition(comp);
  return comp;
}

// ---------------------------------------------------------------------------
// Qualification
// ---------------------------------------------------------------------------

export function getQualification() {
  return read(KEYS.qualification) || defaultQualification();
}

export function saveQualification(q) {
  write(KEYS.qualification, q);
}

export function getQualificationSchedule(teamCount) {
  const qual = getQualification();
  return qual.matrix[teamCount] || qual.matrix[Math.min(Math.max(teamCount, 5), 20)];
}

/**
 * After a round is confirmed, eliminate teams that didn't qualify.
 * Returns { qualified: [], eliminated: [] }
 */
export function applyElimination(roundNumber) {
  const teams = getTeams();
  const teamCount = teams.filter((t) => t.registrationStatus === 'registered').length;
  const schedule = getQualificationSchedule(teamCount);
  const qual = getQualification();

  // How many teams should qualify for the next round
  const nextRoundIdx = roundNumber; // roundNumber is 1-based, so index for next round = roundNumber
  if (nextRoundIdx >= 5) {
    // After round 5, no elimination needed — competition ends
    return { qualified: [], eliminated: [] };
  }

  const targetForNextRound = schedule[nextRoundIdx]; // participants for round (roundNumber+1)

  // Get active teams (not already eliminated)
  const activeTeams = teams.filter((t) => t.qualificationStatus !== 'eliminated');

  // No elimination needed if active teams <= target
  if (activeTeams.length <= targetForNextRound) {
    return { qualified: activeTeams.map((t) => t.id), eliminated: [] };
  }

  // Rank active teams by cumulative score
  const leaderboard = getLeaderboard().filter((t) => t.qualificationStatus !== 'eliminated');

  // Check for overrides
  const overrides = qual.overrides || {};

  const qualified = [];
  const eliminated = [];

  leaderboard.forEach((team, idx) => {
    const override = overrides[team.id];
    if (override && override.round === roundNumber) {
      if (override.action === 'qualify') {
        qualified.push(team.id);
      } else if (override.action === 'eliminate') {
        eliminated.push(team.id);
      }
    } else if (idx < targetForNextRound) {
      qualified.push(team.id);
    } else {
      eliminated.push(team.id);
    }
  });

  return { qualified, eliminated };
}

/**
 * Confirm results and apply elimination for a round.
 */
export function confirmRoundResults(roundNumber) {
  const { qualified, eliminated } = applyElimination(roundNumber);

  // Update team statuses
  const teams = getTeams();
  teams.forEach((t) => {
    if (eliminated.includes(t.id)) {
      t.qualificationStatus = 'eliminated';
      t.eliminatedAfterRound = roundNumber;
    } else if (qualified.includes(t.id)) {
      t.qualificationStatus = 'qualified';
    }
  });
  saveTeams(teams);

  // Mark round as confirmed in qualification
  const qual = getQualification();
  if (!qual.confirmedRounds.includes(`round-${roundNumber}`)) {
    qual.confirmedRounds.push(`round-${roundNumber}`);
  }
  saveQualification(qual);

  // Audit
  addAuditEntry({
    type: 'round_confirmed',
    roundNumber,
    qualified,
    eliminated,
  });

  return { qualified, eliminated };
}

/**
 * Add a manual override for a team's qualification.
 */
export function addQualificationOverride(teamId, roundNumber, action, reason) {
  const qual = getQualification();
  qual.overrides[teamId] = {
    round: roundNumber,
    action, // 'qualify' | 'eliminate'
    reason,
    createdAt: timestamp(),
  };
  saveQualification(qual);

  addAuditEntry({
    type: 'qualification_override',
    teamId,
    roundNumber,
    action,
    reason,
  });
}

export function removeQualificationOverride(teamId) {
  const qual = getQualification();
  delete qual.overrides[teamId];
  saveQualification(qual);
}

// ---------------------------------------------------------------------------
// Scoring Configuration
// ---------------------------------------------------------------------------

export function getScoringConfig() {
  return read(KEYS.scoringConfig) || defaultScoringConfig();
}

export function saveScoringConfig(cfg) {
  write(KEYS.scoringConfig, cfg);
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export function getAuditLog() {
  return read(KEYS.audit) || [];
}

function addAuditEntry(entry) {
  const log = getAuditLog();
  log.push({
    id: uid(),
    timestamp: timestamp(),
    ...entry,
  });
  // Keep last 500 entries
  if (log.length > 500) log.splice(0, log.length - 500);
  write(KEYS.audit, log);
}

export function clearAuditLog() {
  write(KEYS.audit, []);
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
  showLeaderboard: false,
  showWinner: false,
});

export function getLiveState() {
  return read(KEYS.live) || defaultLive();
}

export function saveLiveState(state) {
  write(KEYS.live, state);
}

// ---------------------------------------------------------------------------
// Reset everything
// ---------------------------------------------------------------------------

export function resetAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

export function resetCompetition() {
  // Reset competition state, scores, qualification, and round statuses
  // but keep teams and round definitions
  write(KEYS.competition, defaultCompetition());
  write(KEYS.scores, {});
  write(KEYS.audit, []);

  const qual = defaultQualification();
  write(KEYS.qualification, qual);

  // Reset all round statuses to pending
  const rounds = getRounds();
  rounds.forEach((r) => { r.status = 'pending'; });
  saveRounds(rounds);

  // Reset all team qualification statuses
  const teams = getTeams();
  teams.forEach((t) => {
    t.qualificationStatus = 'active';
    t.eliminatedAfterRound = null;
  });
  saveTeams(teams);

  write(KEYS.live, defaultLive());
}
