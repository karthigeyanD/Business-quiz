import { useState } from 'react';
import { useQuiz } from '../context/QuizContext';

export default function Scoring() {
  const {
    teams, rounds, leaderboard, scores,
    setScore, setScoreDirect, scoringConfig, saveScoringConfig,
  } = useQuiz();

  const [selectedRound, setSelectedRound] = useState(rounds[0]?.id || '');
  const [customPoints, setCustomPoints] = useState({});
  const [directScores, setDirectScores] = useState({});
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState({ ...scoringConfig });

  if (teams.length === 0) {
    return (
      <div className="page scoring-page">
        <header className="page-header">
          <h1>Scoring</h1>
          <p className="subtitle">Register teams first to start scoring.</p>
        </header>
      </div>
    );
  }

  const handleAward = (teamId, pts) => {
    if (!selectedRound) return;
    setScore(teamId, selectedRound, pts);
  };

  const handleCustom = (teamId) => {
    const pts = Number(customPoints[teamId]);
    if (!pts || !selectedRound) return;
    setScore(teamId, selectedRound, pts);
    setCustomPoints({ ...customPoints, [teamId]: '' });
  };

  const handleDirectSet = (teamId) => {
    const val = Number(directScores[teamId]);
    if (isNaN(val) || !selectedRound) return;
    if (window.confirm(`Set ${teams.find((t) => t.id === teamId)?.name}'s score for this round to ${val}?`)) {
      setScoreDirect(teamId, selectedRound, val);
      setDirectScores({ ...directScores, [teamId]: '' });
    }
  };

  const handleSaveConfig = () => {
    saveScoringConfig(configForm);
    setShowConfig(false);
  };

  const activeRound = rounds.find((r) => r.id === selectedRound);
  const activeRoundIdx = rounds.findIndex((r) => r.id === selectedRound);

  return (
    <div className="page scoring-page">
      <header className="page-header">
        <h1>Scoring</h1>
        <p className="subtitle">Award, deduct, or set points for each team</p>
      </header>

      {/* Scoring Config */}
      <div className="card-header-row" style={{ marginBottom: 16 }}>
        <div></div>
        <button className="btn ghost small" onClick={() => setShowConfig(!showConfig)}>
          ⚙️ {showConfig ? 'Hide' : 'Scoring'} Configuration
        </button>
      </div>

      {showConfig && (
        <section className="card" id="scoring-config">
          <h2>⚙️ Scoring Configuration</h2>
          <div className="config-grid">
            <div className="form-group">
              <label>Correct Answer Points</label>
              <input
                type="number"
                value={configForm.correctPoints}
                onChange={(e) => setConfigForm({ ...configForm, correctPoints: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Negative Marking</label>
              <select
                value={configForm.negativeMarking ? 'yes' : 'no'}
                onChange={(e) => setConfigForm({ ...configForm, negativeMarking: e.target.value === 'yes' })}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            {configForm.negativeMarking && (
              <div className="form-group">
                <label>Negative Points</label>
                <input
                  type="number"
                  value={configForm.negativePoints}
                  onChange={(e) => setConfigForm({ ...configForm, negativePoints: Number(e.target.value) })}
                />
              </div>
            )}
            <div className="form-group">
              <label>Bonus Points</label>
              <input
                type="number"
                value={configForm.bonusPoints}
                onChange={(e) => setConfigForm({ ...configForm, bonusPoints: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Qualification Basis</label>
              <select
                value={configForm.qualificationBasis}
                onChange={(e) => setConfigForm({ ...configForm, qualificationBasis: e.target.value })}
              >
                <option value="cumulative">Cumulative Score</option>
                <option value="round">Current Round Score</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tie-Breaking Rule</label>
              <select
                value={configForm.tieBreaker}
                onChange={(e) => setConfigForm({ ...configForm, tieBreaker: e.target.value })}
              >
                <option value="higher-recent">Higher Score in Recent Round</option>
                <option value="head-to-head">Head-to-Head</option>
                <option value="manual">Manual Decision</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn primary small" onClick={handleSaveConfig}>Save Configuration</button>
            <button className="btn ghost small" onClick={() => setShowConfig(false)}>Cancel</button>
          </div>
        </section>
      )}

      {/* Round selector */}
      <div className="card round-selector" id="round-selector">
        <label htmlFor="score-round-select">Select Round:</label>
        <select
          id="score-round-select"
          value={selectedRound}
          onChange={(e) => setSelectedRound(e.target.value)}
        >
          {rounds.map((r, i) => (
            <option key={r.id} value={r.id}>
              {r.name} {r.status === 'completed' ? '✓' : r.status === 'active' ? '▶' : ''}
            </option>
          ))}
        </select>
        {activeRound && (
          <span className={`round-badge ${activeRound.status}`}>
            {activeRound.status === 'active' ? '🟢 Active' :
             activeRound.status === 'completed' ? '✅ Done' : '⏳ Pending'}
          </span>
        )}
      </div>

      {/* Scoring table */}
      <section className="card" id="scoring-section">
        <div className="table-wrap">
          <table className="scoring-table" id="scoring-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                {rounds.map((r, i) => (
                  <th key={r.id} className={`num ${r.id === selectedRound ? 'active-col' : ''}`}>
                    R{i + 1}
                  </th>
                ))}
                <th className="num total-col">Total</th>
                <th>Status</th>
                <th className="actions-col">Quick Score</th>
                <th className="actions-col">Direct Set</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((t, idx) => (
                <tr key={t.id} className={t.qualificationStatus === 'eliminated' ? 'row-eliminated' : ''}>
                  <td>{idx + 1}</td>
                  <td className="team-name-cell">{t.name}</td>
                  {rounds.map((r) => (
                    <td
                      key={r.id}
                      className={`num ${r.id === selectedRound ? 'active-col' : ''}`}
                    >
                      {t.byRound[r.id] || 0}
                    </td>
                  ))}
                  <td className="num total-col">{t.total}</td>
                  <td>
                    <span className={`qual-badge qual-${t.qualificationStatus}`}>
                      {t.qualificationStatus === 'eliminated' ? '🚫' :
                       t.qualificationStatus === 'qualified' ? '✅' : '🔵'}
                    </span>
                  </td>
                  <td className="scoring-actions">
                    <div className="scoring-btn-group">
                      <button className="btn small success" onClick={() => handleAward(t.id, 10)} title="+10">+10</button>
                      <button className="btn small success" onClick={() => handleAward(t.id, 5)} title="+5">+5</button>
                      <button className="btn small danger" onClick={() => handleAward(t.id, -5)} title="−5">−5</button>
                      <div className="custom-score">
                        <input
                          type="number"
                          className="input-xs"
                          placeholder="±"
                          value={customPoints[t.id] || ''}
                          onChange={(e) => setCustomPoints({ ...customPoints, [t.id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleCustom(t.id); }}
                        />
                        <button className="btn small primary" onClick={() => handleCustom(t.id)}>Go</button>
                      </div>
                    </div>
                  </td>
                  <td className="scoring-actions">
                    <div className="custom-score">
                      <input
                        type="number"
                        className="input-xs"
                        placeholder="Set"
                        value={directScores[t.id] || ''}
                        onChange={(e) => setDirectScores({ ...directScores, [t.id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleDirectSet(t.id); }}
                      />
                      <button className="btn small warn" onClick={() => handleDirectSet(t.id)}>Set</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
