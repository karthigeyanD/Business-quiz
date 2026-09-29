import { useMemo, useState } from 'react';
import { useQuiz } from '../context/QuizContext';

export default function Rounds() {
  const {
    teams, rounds, scores, competition, activeTeams, currentSchedule,
    updateRound, addQuestion, updateQuestion, removeQuestion,
    setScore, setScoreDirect,
    advanceRound, confirmRoundResults, previewElimination, completeCompetition,
    leaderboard,
  } = useQuiz();

  const [activePanel, setActivePanel] = useState(
    competition.currentRound > 0 ? competition.currentRound - 1 : 0
  );
  const [editingRound, setEditingRound] = useState(null);
  const [roundForm, setRoundForm] = useState({ name: '', timerSeconds: 30 });
  const [qForm, setQForm] = useState({ roundId: null, id: null, question: '', answer: '' });
  const [scoreInputs, setScoreInputs] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [eliminationPreview, setEliminationPreview] = useState(null);
  const [overrideTeamId, setOverrideTeamId] = useState(null);

  const isStarted = competition.status === 'started';
  const isCompleted = competition.status === 'completed';

  // --- Round editing ---
  const startEditRound = (r) => {
    setEditingRound(r.id);
    setRoundForm({ name: r.name, timerSeconds: r.timerSeconds });
  };

  const saveRound = (id) => {
    updateRound(id, {
      name: roundForm.name.trim() || `Round ${id}`,
      timerSeconds: Math.max(5, Number(roundForm.timerSeconds) || 30),
    });
    setEditingRound(null);
  };

  // --- Question editing ---
  const resetQForm = () =>
    setQForm({ roundId: null, id: null, question: '', answer: '' });

  const startEditQuestion = (roundId, q) => {
    setQForm({ roundId, id: q.id, question: q.question, answer: q.answer });
  };

  const saveQuestion = (roundId) => {
    if (!qForm.question.trim()) return;
    if (qForm.id) {
      updateQuestion(roundId, qForm.id, {
        question: qForm.question.trim(),
        answer: qForm.answer.trim(),
      });
    } else {
      addQuestion(roundId, qForm.question.trim(), qForm.answer.trim());
    }
    resetQForm();
  };

  const handleRemoveQ = (roundId, qId) => {
    if (window.confirm('Remove this question?')) {
      removeQuestion(roundId, qId);
      if (qForm.id === qId) resetQForm();
    }
  };

  // --- Scoring ---
  const handleScoreInput = (teamId, roundId, value) => {
    setScoreInputs((prev) => ({
      ...prev,
      [`${teamId}-${roundId}`]: value,
    }));
  };

  const handleSaveScore = (teamId, roundId) => {
    const key = `${teamId}-${roundId}`;
    const value = Number(scoreInputs[key]);
    if (isNaN(value)) return;
    setScoreDirect(teamId, roundId, value);
    setScoreInputs((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleQuickScore = (teamId, roundId, pts) => {
    setScore(teamId, roundId, pts);
  };

  // --- Round lifecycle ---
  const handlePreviewElimination = (roundNumber) => {
    const preview = previewElimination(roundNumber);
    setEliminationPreview({ roundNumber, ...preview });
    setShowConfirmDialog(true);
  };

  const handleConfirmResults = () => {
    if (!eliminationPreview) return;
    confirmRoundResults(eliminationPreview.roundNumber);

    if (eliminationPreview.roundNumber >= 5) {
      completeCompetition();
    } else {
      advanceRound();
    }

    setShowConfirmDialog(false);
    setEliminationPreview(null);
    // Move to next panel
    if (eliminationPreview.roundNumber < 5) {
      setActivePanel(eliminationPreview.roundNumber);
    }
  };

  // --- Participating teams for a round ---
  const getTeamsForRound = (roundIndex) => {
    if (roundIndex === 0) return teams.filter((t) => t.registrationStatus === 'registered');
    // Teams that haven't been eliminated before this round
    return teams.filter((t) => {
      if (t.qualificationStatus === 'eliminated' && t.eliminatedAfterRound !== null) {
        return t.eliminatedAfterRound >= roundIndex;
      }
      return t.qualificationStatus !== 'eliminated' || t.eliminatedAfterRound >= roundIndex;
    });
  };

  // --- Round leaderboard ---
  const getRoundLeaderboard = (roundId, roundTeams) => {
    return roundTeams
      .map((t) => ({
        ...t,
        roundScore: scores[t.id]?.[roundId] || 0,
        total: scores[t.id]
          ? Object.values(scores[t.id]).reduce((s, v) => s + v, 0)
          : 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  return (
    <div className="page rounds-page">
      <header className="page-header">
        <h1>Round Management</h1>
        <p className="subtitle">
          {isStarted ? `Round ${competition.currentRound} in progress` :
           isCompleted ? 'Competition completed' :
           'Competition not started — rounds are in preview mode'}
        </p>
      </header>

      {/* Round tabs */}
      <div className="round-tabs" id="round-tabs">
        {rounds.map((r, i) => {
          const teamsInRound = currentSchedule?.[i] || '—';
          return (
            <button
              key={r.id}
              className={`round-tab-btn ${activePanel === i ? 'active' : ''} ${r.status}`}
              onClick={() => setActivePanel(i)}
            >
              <span className="round-tab-num">R{i + 1}</span>
              <span className="round-tab-status">
                {r.status === 'completed' ? '✓' : r.status === 'active' ? '▶' : '○'}
              </span>
              <span className="round-tab-teams">{teamsInRound} teams</span>
            </button>
          );
        })}
      </div>

      {/* Active Round Panel */}
      {rounds.map((r, ri) => {
        if (ri !== activePanel) return null;

        const roundTeams = getTeamsForRound(ri);
        const roundLeaderboard = getRoundLeaderboard(r.id, roundTeams);
        const isActive = r.status === 'active';
        const isDone = r.status === 'completed';
        const isPending = r.status === 'pending';
        const isCurrentRound = competition.currentRound === ri + 1;
        const schedule = currentSchedule || [];
        const nextRoundTeams = schedule[ri + 1] || null;
        const eliminationsNeeded = nextRoundTeams !== null ? roundTeams.length - nextRoundTeams : 0;

        return (
          <div className="round-panel-full" key={r.id} id={`round-panel-${ri + 1}`}>
            {/* Round Header */}
            <div className="round-panel-header">
              <div className="round-panel-title">
                <h2>{r.name}</h2>
                <span className={`round-status-badge ${r.status}`}>
                  {isDone ? '✅ Completed' : isActive ? '🟢 In Progress' : '⏳ Pending'}
                </span>
              </div>
              <div className="round-panel-meta">
                <span>📋 {roundTeams.length} teams participating</span>
                <span>❓ {r.questions.length} questions</span>
                <span>⏱ {r.timerSeconds}s per question</span>
                {eliminationsNeeded > 0 && !isDone && (
                  <span className="elim-info">🔻 {eliminationsNeeded} to be eliminated</span>
                )}
              </div>
            </div>

            {/* Round description / placeholder */}
            <div className="card round-content-card">
              <div className="round-content-placeholder">
                <h3>📖 Round Content</h3>
                <p className="text-muted">
                  {r.description || 'Content placeholder — to be configured by the organizer.'}
                </p>
                {!editingRound && (
                  <button className="btn ghost small" onClick={() => startEditRound(r)} style={{ marginTop: 8 }}>
                    ✏️ Edit Round Settings
                  </button>
                )}
                {editingRound === r.id && (
                  <div className="inline-form" style={{ marginTop: 12 }}>
                    <input
                      value={roundForm.name}
                      onChange={(e) => setRoundForm({ ...roundForm, name: e.target.value })}
                      placeholder="Round name"
                      className="input-sm"
                    />
                    <label className="timer-label">
                      Timer (s):
                      <input
                        type="number"
                        min={5}
                        value={roundForm.timerSeconds}
                        onChange={(e) => setRoundForm({ ...roundForm, timerSeconds: e.target.value })}
                        className="input-xs"
                      />
                    </label>
                    <button className="btn small primary" onClick={() => saveRound(r.id)}>Save</button>
                    <button className="btn small ghost" onClick={() => setEditingRound(null)}>Cancel</button>
                  </div>
                )}
              </div>
            </div>

            {/* Questions (collapsible) */}
            <details className="card">
              <summary className="card-summary">
                <h3>Questions ({r.questions.length})</h3>
              </summary>
              <div className="question-list">
                {r.questions.length === 0 && (
                  <p className="empty-state">No questions added yet.</p>
                )}
                {r.questions.map((q, qi) => (
                  <div className="question-row" key={q.id}>
                    {qForm.id === q.id && qForm.roundId === r.id ? (
                      <div className="q-edit-form">
                        <textarea
                          value={qForm.question}
                          onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
                          placeholder="Question"
                          rows={2}
                        />
                        <textarea
                          value={qForm.answer}
                          onChange={(e) => setQForm({ ...qForm, answer: e.target.value })}
                          placeholder="Answer"
                          rows={2}
                        />
                        <div className="form-actions">
                          <button className="btn small primary" onClick={() => saveQuestion(r.id)}>Save</button>
                          <button className="btn small ghost" onClick={resetQForm}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="q-number">Q{qi + 1}</span>
                        <div className="q-content">
                          <p className="q-text">{q.question}</p>
                          <p className="q-answer"><strong>A:</strong> {q.answer || '—'}</p>
                        </div>
                        <div className="q-actions">
                          <button className="btn small ghost" onClick={() => startEditQuestion(r.id, q)}>✏️</button>
                          <button className="btn small danger" onClick={() => handleRemoveQ(r.id, q.id)}>🗑️</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {!(qForm.roundId === r.id && !qForm.id) ? (
                <button
                  className="btn ghost add-q-btn"
                  onClick={() => setQForm({ roundId: r.id, id: null, question: '', answer: '' })}
                >
                  + Add Question
                </button>
              ) : (
                <div className="q-edit-form new-q-form">
                  <textarea
                    value={qForm.question}
                    onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
                    placeholder="Type the question…"
                    rows={2}
                    autoFocus
                  />
                  <textarea
                    value={qForm.answer}
                    onChange={(e) => setQForm({ ...qForm, answer: e.target.value })}
                    placeholder="Type the answer…"
                    rows={2}
                  />
                  <div className="form-actions">
                    <button className="btn small primary" onClick={() => saveQuestion(r.id)}>Add</button>
                    <button className="btn small ghost" onClick={resetQForm}>Cancel</button>
                  </div>
                </div>
              )}
            </details>

            {/* Score Entry */}
            <div className="card" id={`score-entry-${ri + 1}`}>
              <h3>🎯 Score Entry — {r.name}</h3>
              {roundTeams.length === 0 ? (
                <p className="empty-state">No teams participating in this round.</p>
              ) : (
                <div className="table-wrap">
                  <table className="score-entry-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Team</th>
                        <th className="num">Round Score</th>
                        <th className="num">Total Score</th>
                        <th>Quick Actions</th>
                        <th>Set Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roundLeaderboard.map((t, idx) => {
                        const key = `${t.id}-${r.id}`;
                        return (
                          <tr key={t.id} className={idx < 3 ? `rank-${idx + 1}` : ''}>
                            <td>{idx + 1}</td>
                            <td className="team-name-cell">{t.name}</td>
                            <td className="num">{t.roundScore}</td>
                            <td className="num total-col">{t.total}</td>
                            <td>
                              <div className="scoring-btn-group">
                                <button className="btn small success" onClick={() => handleQuickScore(t.id, r.id, 10)}>+10</button>
                                <button className="btn small success" onClick={() => handleQuickScore(t.id, r.id, 5)}>+5</button>
                                <button className="btn small danger" onClick={() => handleQuickScore(t.id, r.id, -5)}>−5</button>
                              </div>
                            </td>
                            <td>
                              <div className="custom-score">
                                <input
                                  type="number"
                                  className="input-xs"
                                  placeholder="Score"
                                  value={scoreInputs[key] ?? ''}
                                  onChange={(e) => handleScoreInput(t.id, r.id, e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveScore(t.id, r.id); }}
                                />
                                <button className="btn small primary" onClick={() => handleSaveScore(t.id, r.id)}>Set</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Live Leaderboard */}
            <div className="card" id={`round-leaderboard-${ri + 1}`}>
              <h3>🏆 Leaderboard — {r.name}</h3>
              <div className="table-wrap">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team</th>
                      <th className="num">R{ri + 1} Score</th>
                      <th className="num">Cumulative</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roundLeaderboard.map((t, idx) => {
                      const willBeEliminated = nextRoundTeams !== null && idx >= nextRoundTeams && !isDone;
                      return (
                        <tr key={t.id} className={`${idx < 3 ? `rank-${idx + 1}` : ''} ${willBeEliminated ? 'row-at-risk' : ''}`}>
                          <td className="rank-cell">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                          </td>
                          <td className="team-name-cell">{t.name}</td>
                          <td className="num">{t.roundScore}</td>
                          <td className="num total-col">{t.total}</td>
                          <td>
                            {willBeEliminated ? (
                              <span className="qual-badge qual-eliminated">🔻 At risk</span>
                            ) : (
                              <span className="qual-badge qual-qualified">✅ Safe</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Round Controls */}
            <div className="card round-controls-card" id={`round-controls-${ri + 1}`}>
              <h3>🎛️ Round Controls</h3>
              <div className="round-control-actions">
                {isActive && isCurrentRound && (
                  <>
                    <button
                      className="btn primary"
                      onClick={() => handlePreviewElimination(ri + 1)}
                    >
                      ✅ Confirm Results & {ri + 1 < 5 ? 'Advance to Next Round' : 'Complete Competition'}
                    </button>
                    <p className="text-muted" style={{ marginTop: 8 }}>
                      This will finalize scores, apply eliminations, and advance qualified teams.
                    </p>
                  </>
                )}
                {isDone && (
                  <p className="text-muted">✅ This round has been completed and results confirmed.</p>
                )}
                {isPending && !isCurrentRound && (
                  <p className="text-muted">⏳ This round is pending. Complete the previous round first.</p>
                )}
                {!isStarted && !isCompleted && (
                  <p className="text-muted">⚠️ Start the competition from the Dashboard to begin this round.</p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Confirm Results Dialog */}
      {showConfirmDialog && eliminationPreview && (
        <div className="modal-overlay" id="confirm-results-modal">
          <div className="modal-content modal-lg">
            <h2>Confirm Round {eliminationPreview.roundNumber} Results</h2>
            <p>The following teams will be advanced or eliminated based on cumulative scores:</p>

            {eliminationPreview.qualified.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ color: 'var(--success)' }}>✅ Qualified ({eliminationPreview.qualified.length})</h3>
                <div className="confirm-team-list">
                  {eliminationPreview.qualified.map((id) => {
                    const team = teams.find((t) => t.id === id);
                    return team ? (
                      <span className="confirm-chip qualified" key={id}>{team.name}</span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {eliminationPreview.eliminated.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ color: 'var(--danger)' }}>🚫 Eliminated ({eliminationPreview.eliminated.length})</h3>
                <div className="confirm-team-list">
                  {eliminationPreview.eliminated.map((id) => {
                    const team = teams.find((t) => t.id === id);
                    return team ? (
                      <span className="confirm-chip eliminated" key={id}>{team.name}</span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {eliminationPreview.eliminated.length === 0 && (
              <p className="text-muted" style={{ marginTop: 12 }}>
                No eliminations this round — all teams advance.
              </p>
            )}

            <div className="form-actions" style={{ marginTop: 24 }}>
              <button className="btn primary" onClick={handleConfirmResults}>
                ✅ Confirm & {eliminationPreview.roundNumber < 5 ? 'Advance' : 'Complete'}
              </button>
              <button className="btn ghost" onClick={() => { setShowConfirmDialog(false); setEliminationPreview(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
