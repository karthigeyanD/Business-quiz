import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  addTeam,
  addQuestion,
  addQualificationOverride,
  advanceRound,
  applyElimination,
  completeCompetition,
  confirmRoundResults,
  getAuditLog,
  getCompetition,
  getLeaderboard,
  getLiveState,
  getQualification,
  getQualificationSchedule,
  getRounds,
  getScores,
  getScoringConfig,
  getTeams,
  removeQuestion,
  removeQualificationOverride,
  removeTeam,
  resetAll,
  resetCompetition,
  saveCompetition,
  saveLiveState,
  saveQualification,
  saveRounds,
  saveScores,
  saveScoringConfig,
  saveTeams,
  setScore,
  setScoreDirect,
  startCompetition,
  updateQuestion,
  updateRound,
  updateTeam,
} from '../data/storage';

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  // Hydrate from storage on mount
  const [teams, _setTeams] = useState(() => getTeams());
  const [rounds, _setRounds] = useState(() => getRounds());
  const [scores, _setScores] = useState(() => getScores());
  const [live, _setLive] = useState(() => getLiveState());
  const [competition, _setCompetition] = useState(() => getCompetition());
  const [qualification, _setQualification] = useState(() => getQualification());
  const [scoringConfig, _setScoringConfig] = useState(() => getScoringConfig());
  const [auditLog, _setAuditLog] = useState(() => getAuditLog());

  // --- Refresh helpers ---

  const refreshTeams = useCallback(() => {
    const t = getTeams(); _setTeams(t); return t;
  }, []);

  const refreshRounds = useCallback(() => {
    const r = getRounds(); _setRounds(r); return r;
  }, []);

  const refreshScores = useCallback(() => {
    const s = getScores(); _setScores(s); return s;
  }, []);

  const refreshLive = useCallback(() => {
    const l = getLiveState(); _setLive(l); return l;
  }, []);

  const refreshCompetition = useCallback(() => {
    const c = getCompetition(); _setCompetition(c); return c;
  }, []);

  const refreshQualification = useCallback(() => {
    const q = getQualification(); _setQualification(q); return q;
  }, []);

  const refreshScoringConfig = useCallback(() => {
    const s = getScoringConfig(); _setScoringConfig(s); return s;
  }, []);

  const refreshAudit = useCallback(() => {
    const a = getAuditLog(); _setAuditLog(a); return a;
  }, []);

  const refreshAll = useCallback(() => {
    refreshTeams();
    refreshRounds();
    refreshScores();
    refreshCompetition();
    refreshQualification();
    refreshScoringConfig();
    refreshAudit();
    refreshLive();
  }, [refreshTeams, refreshRounds, refreshScores, refreshCompetition, refreshQualification, refreshScoringConfig, refreshAudit, refreshLive]);

  // --- Team actions ---

  const handleAddTeam = useCallback(
    (name, m1, m2, college) => {
      addTeam(name, m1, m2, college);
      refreshTeams();
    },
    [refreshTeams]
  );

  const handleUpdateTeam = useCallback(
    (id, data) => {
      updateTeam(id, data);
      refreshTeams();
    },
    [refreshTeams]
  );

  const handleRemoveTeam = useCallback(
    (id) => {
      removeTeam(id);
      refreshTeams();
      refreshScores();
    },
    [refreshTeams, refreshScores]
  );

  // --- Round / question actions ---

  const handleUpdateRound = useCallback(
    (roundId, data) => {
      updateRound(roundId, data);
      refreshRounds();
    },
    [refreshRounds]
  );

  const handleAddQuestion = useCallback(
    (roundId, q, a) => {
      addQuestion(roundId, q, a);
      refreshRounds();
    },
    [refreshRounds]
  );

  const handleUpdateQuestion = useCallback(
    (roundId, qId, data) => {
      updateQuestion(roundId, qId, data);
      refreshRounds();
    },
    [refreshRounds]
  );

  const handleRemoveQuestion = useCallback(
    (roundId, qId) => {
      removeQuestion(roundId, qId);
      refreshRounds();
    },
    [refreshRounds]
  );

  // --- Scoring ---

  const handleSetScore = useCallback(
    (teamId, roundId, points) => {
      setScore(teamId, roundId, points);
      refreshScores();
      refreshAudit();
    },
    [refreshScores, refreshAudit]
  );

  const handleSetScoreDirect = useCallback(
    (teamId, roundId, value) => {
      setScoreDirect(teamId, roundId, value);
      refreshScores();
      refreshAudit();
    },
    [refreshScores, refreshAudit]
  );

  // --- Competition lifecycle ---

  const handleStartCompetition = useCallback(() => {
    startCompetition();
    refreshCompetition();
    refreshRounds();
    refreshTeams();
  }, [refreshCompetition, refreshRounds, refreshTeams]);

  const handleAdvanceRound = useCallback(() => {
    advanceRound();
    refreshCompetition();
    refreshRounds();
  }, [refreshCompetition, refreshRounds]);

  const handleCompleteCompetition = useCallback(() => {
    completeCompetition();
    refreshCompetition();
    refreshRounds();
  }, [refreshCompetition, refreshRounds]);

  const handleConfirmRoundResults = useCallback((roundNumber) => {
    const result = confirmRoundResults(roundNumber);
    refreshTeams();
    refreshQualification();
    refreshAudit();
    return result;
  }, [refreshTeams, refreshQualification, refreshAudit]);

  const handleApplyElimination = useCallback((roundNumber) => {
    return applyElimination(roundNumber);
  }, []);

  // --- Qualification overrides ---

  const handleAddOverride = useCallback((teamId, roundNumber, action, reason) => {
    addQualificationOverride(teamId, roundNumber, action, reason);
    refreshQualification();
    refreshAudit();
  }, [refreshQualification, refreshAudit]);

  const handleRemoveOverride = useCallback((teamId) => {
    removeQualificationOverride(teamId);
    refreshQualification();
  }, [refreshQualification]);

  // --- Scoring config ---

  const handleSaveScoringConfig = useCallback((cfg) => {
    saveScoringConfig(cfg);
    refreshScoringConfig();
  }, [refreshScoringConfig]);

  // --- Live state ---

  const handleSetLive = useCallback(
    (patch) => {
      const next = { ...getLiveState(), ...patch };
      saveLiveState(next);
      _setLive(next);
    },
    []
  );

  // --- Reset ---

  const handleResetCompetition = useCallback(() => {
    resetCompetition();
    refreshAll();
  }, [refreshAll]);

  const handleResetAll = useCallback(() => {
    resetAll();
    refreshAll();
  }, [refreshAll]);

  // --- Derived ---

  const leaderboard = useMemo(() => getLeaderboard(), [teams, scores]);

  const totalQuestions = useMemo(
    () => rounds.reduce((s, r) => s + r.questions.length, 0),
    [rounds]
  );

  const activeTeams = useMemo(
    () => teams.filter((t) => t.qualificationStatus !== 'eliminated'),
    [teams]
  );

  const eliminatedTeams = useMemo(
    () => teams.filter((t) => t.qualificationStatus === 'eliminated'),
    [teams]
  );

  const currentSchedule = useMemo(() => {
    const count = teams.filter((t) => t.registrationStatus === 'registered').length;
    return getQualificationSchedule(count);
  }, [teams, qualification]);

  const value = useMemo(
    () => ({
      // Data
      teams,
      rounds,
      scores,
      live,
      competition,
      qualification,
      scoringConfig,
      auditLog,
      leaderboard,
      totalQuestions,
      activeTeams,
      eliminatedTeams,
      currentSchedule,

      // Refresh
      refreshTeams,
      refreshRounds,
      refreshScores,
      refreshLive,
      refreshCompetition,
      refreshQualification,
      refreshAll,

      // Team actions
      addTeam: handleAddTeam,
      updateTeam: handleUpdateTeam,
      removeTeam: handleRemoveTeam,

      // Round/question actions
      updateRound: handleUpdateRound,
      addQuestion: handleAddQuestion,
      updateQuestion: handleUpdateQuestion,
      removeQuestion: handleRemoveQuestion,

      // Scoring
      setScore: handleSetScore,
      setScoreDirect: handleSetScoreDirect,
      saveScoringConfig: handleSaveScoringConfig,

      // Competition lifecycle
      startCompetition: handleStartCompetition,
      advanceRound: handleAdvanceRound,
      completeCompetition: handleCompleteCompetition,
      confirmRoundResults: handleConfirmRoundResults,
      previewElimination: handleApplyElimination,

      // Qualification
      addOverride: handleAddOverride,
      removeOverride: handleRemoveOverride,
      saveQualification: (q) => { saveQualification(q); refreshQualification(); },

      // Live
      setLive: handleSetLive,

      // Direct save (for backwards compat)
      saveTeams: (t) => { saveTeams(t); _setTeams(t); },
      saveRounds: (r) => { saveRounds(r); _setRounds(r); },
      saveScores: (s) => { saveScores(s); _setScores(s); },
      saveCompetition: (c) => { saveCompetition(c); _setCompetition(c); },

      // Reset
      resetCompetition: handleResetCompetition,
      resetAll: handleResetAll,
    }),
    [
      teams, rounds, scores, live, competition, qualification, scoringConfig, auditLog,
      leaderboard, totalQuestions, activeTeams, eliminatedTeams, currentSchedule,
      refreshTeams, refreshRounds, refreshScores, refreshLive, refreshCompetition,
      refreshQualification, refreshAll,
      handleAddTeam, handleUpdateTeam, handleRemoveTeam,
      handleUpdateRound, handleAddQuestion, handleUpdateQuestion, handleRemoveQuestion,
      handleSetScore, handleSetScoreDirect, handleSaveScoringConfig,
      handleStartCompetition, handleAdvanceRound, handleCompleteCompetition,
      handleConfirmRoundResults, handleApplyElimination,
      handleAddOverride, handleRemoveOverride,
      handleSetLive,
      handleResetCompetition, handleResetAll,
    ]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside <QuizProvider>');
  return ctx;
}
