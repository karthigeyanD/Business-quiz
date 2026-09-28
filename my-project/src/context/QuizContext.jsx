import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  addQuestion,
  addTeam,
  getLeaderboard,
  getLiveState,
  getRounds,
  getScores,
  getTeams,
  removeQuestion,
  removeTeam,
  saveLiveState,
  saveRounds,
  saveScores,
  saveTeams,
  setScore,
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

  // Convenience: persist + set state in one step

  const refreshTeams = useCallback(() => {
    const t = getTeams();
    _setTeams(t);
    return t;
  }, []);

  const refreshRounds = useCallback(() => {
    const r = getRounds();
    _setRounds(r);
    return r;
  }, []);

  const refreshScores = useCallback(() => {
    const s = getScores();
    _setScores(s);
    return s;
  }, []);

  const refreshLive = useCallback(() => {
    const l = getLiveState();
    _setLive(l);
    return l;
  }, []);

  // --- Team actions ---------------------------------------------------------

  const handleAddTeam = useCallback(
    (name, m1, m2) => {
      addTeam(name, m1, m2);
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

  // --- Round / question actions ---------------------------------------------

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

  // --- Scoring --------------------------------------------------------------

  const handleSetScore = useCallback(
    (teamId, roundId, points) => {
      setScore(teamId, roundId, points);
      refreshScores();
    },
    [refreshScores]
  );

  // --- Live state -----------------------------------------------------------

  const handleSetLive = useCallback(
    (patch) => {
      const next = { ...getLiveState(), ...patch };
      saveLiveState(next);
      _setLive(next);
    },
    []
  );

  // --- Derived --------------------------------------------------------------

  const leaderboard = useMemo(() => getLeaderboard(), [teams, scores]);
  const totalQuestions = useMemo(
    () => rounds.reduce((s, r) => s + r.questions.length, 0),
    [rounds]
  );

  const value = useMemo(
    () => ({
      teams,
      rounds,
      scores,
      live,
      leaderboard,
      totalQuestions,
      refreshTeams,
      refreshRounds,
      refreshScores,
      refreshLive,
      addTeam: handleAddTeam,
      updateTeam: handleUpdateTeam,
      removeTeam: handleRemoveTeam,
      updateRound: handleUpdateRound,
      addQuestion: handleAddQuestion,
      updateQuestion: handleUpdateQuestion,
      removeQuestion: handleRemoveQuestion,
      setScore: handleSetScore,
      setLive: handleSetLive,
      saveTeams: (t) => { saveTeams(t); _setTeams(t); },
      saveRounds: (r) => { saveRounds(r); _setRounds(r); },
      saveScores: (s) => { saveScores(s); _setScores(s); },
    }),
    [
      teams, rounds, scores, live, leaderboard, totalQuestions,
      refreshTeams, refreshRounds, refreshScores, refreshLive,
      handleAddTeam, handleUpdateTeam, handleRemoveTeam,
      handleUpdateRound, handleAddQuestion, handleUpdateQuestion,
      handleRemoveQuestion, handleSetScore, handleSetLive,
    ]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside <QuizProvider>');
  return ctx;
}
