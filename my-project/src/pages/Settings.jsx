import { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { DEFAULT_QUALIFICATION_MATRIX } from '../data/storage';

export default function Settings() {
  const {
    teams, qualification, scoringConfig,
    saveScoringConfig, saveQualification,
    auditLog,
  } = useQuiz();

  const teamCount = teams.length;

  // Qualification matrix editor
  const [matrix, setMatrix] = useState(() => {
    return { ...DEFAULT_QUALIFICATION_MATRIX, ...qualification.matrix };
  });
  const [matrixSaved, setMatrixSaved] = useState(false);

  // Scoring config editor
  const [configForm, setConfigForm] = useState({ ...scoringConfig });
  const [configSaved, setConfigSaved] = useState(false);

  const handleMatrixChange = (count, roundIdx, value) => {
    const newRow = [...matrix[count]];
    newRow[roundIdx] = Math.max(1, Number(value) || 1);
    setMatrix({ ...matrix, [count]: newRow });
    setMatrixSaved(false);
  };

  const handleSaveMatrix = () => {
    const qual = { ...qualification, matrix };
    saveQualification(qual);
    setMatrixSaved(true);
    setTimeout(() => setMatrixSaved(false), 2000);
  };

  const handleResetMatrix = () => {
    setMatrix({ ...DEFAULT_QUALIFICATION_MATRIX });
    setMatrixSaved(false);
  };

  const handleSaveConfig = () => {
    saveScoringConfig(configForm);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  return (
    <div className="page settings-page">
      <header className="page-header">
        <h1>⚙️ Settings</h1>
        <p className="subtitle">Configure qualification matrix, scoring rules, and review audit log</p>
      </header>

      {/* Qualification Matrix */}
      <section className="card" id="qualification-matrix-settings">
        <div className="card-header-row">
          <h2>Qualification Matrix</h2>
          <div className="form-actions" style={{ margin: 0 }}>
            <button className="btn primary small" onClick={handleSaveMatrix}>
              {matrixSaved ? '✅ Saved!' : 'Save Matrix'}
            </button>
            <button className="btn ghost small" onClick={handleResetMatrix}>
              Reset to Default
            </button>
          </div>
        </div>
        <p className="provisional-badge" style={{ marginBottom: 12 }}>
          ⚠ Provisional — these values are editable and pending final approval
        </p>
        <p className="text-muted" style={{ marginBottom: 16 }}>
          Each cell shows the number of teams participating in that round.
          {teamCount >= 5 && (
            <strong> Currently {teamCount} teams are registered (highlighted row).</strong>
          )}
        </p>
        <div className="table-wrap">
          <table className="qual-matrix-table editable" id="qual-matrix-edit-table">
            <thead>
              <tr>
                <th>Registered Teams</th>
                <th className="num">Round 1</th>
                <th className="num">Round 2</th>
                <th className="num">Round 3</th>
                <th className="num">Round 4</th>
                <th className="num">Round 5</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(matrix).map(([count, schedule]) => (
                <tr key={count} className={Number(count) === teamCount ? 'highlight-row' : ''}>
                  <td><strong>{count} teams</strong></td>
                  {schedule.map((v, i) => (
                    <td key={i} className="num">
                      <input
                        type="number"
                        className="matrix-input"
                        value={v}
                        min={1}
                        max={Number(count)}
                        onChange={(e) => handleMatrixChange(count, i, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Scoring Configuration */}
      <section className="card" id="scoring-config-settings">
        <div className="card-header-row">
          <h2>Scoring Configuration</h2>
          <button className="btn primary small" onClick={handleSaveConfig}>
            {configSaved ? '✅ Saved!' : 'Save Config'}
          </button>
        </div>
        <div className="config-grid">
          <div className="form-group">
            <label>Default Correct Answer Points</label>
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
              <option value="no">Disabled</option>
              <option value="yes">Enabled</option>
            </select>
          </div>
          {configForm.negativeMarking && (
            <div className="form-group">
              <label>Negative Points (per wrong answer)</label>
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
            <label>Qualification Determined By</label>
            <select
              value={configForm.qualificationBasis}
              onChange={(e) => setConfigForm({ ...configForm, qualificationBasis: e.target.value })}
            >
              <option value="cumulative">Cumulative Score (all rounds)</option>
              <option value="round">Current Round Score only</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tie-Breaking Rule</label>
            <select
              value={configForm.tieBreaker}
              onChange={(e) => setConfigForm({ ...configForm, tieBreaker: e.target.value })}
            >
              <option value="higher-recent">Higher Score in Most Recent Round</option>
              <option value="head-to-head">Head-to-Head Comparison</option>
              <option value="manual">Manual Decision by Admin</option>
            </select>
          </div>
        </div>
      </section>

      {/* Audit Log */}
      <section className="card" id="audit-log">
        <h2>📋 Audit Log</h2>
        <p className="text-muted" style={{ marginBottom: 12 }}>
          Record of score changes, manual overrides, and round confirmations.
        </p>
        {auditLog.length === 0 ? (
          <p className="empty-state">No audit entries yet.</p>
        ) : (
          <div className="table-wrap" style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table className="audit-table" id="audit-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {[...auditLog].reverse().map((entry) => {
                  const team = entry.teamId ? teams.find((t) => t.id === entry.teamId) : null;
                  let details = '';
                  if (entry.type === 'score_change') {
                    details = `${team?.name || 'Unknown'}: ${entry.oldValue} → ${entry.newValue} (${entry.delta > 0 ? '+' : ''}${entry.delta})`;
                  } else if (entry.type === 'score_direct_set') {
                    details = `${team?.name || 'Unknown'}: set to ${entry.newValue} (was ${entry.oldValue})`;
                  } else if (entry.type === 'round_confirmed') {
                    details = `Round ${entry.roundNumber}: ${entry.qualified?.length || 0} qualified, ${entry.eliminated?.length || 0} eliminated`;
                  } else if (entry.type === 'qualification_override') {
                    details = `${team?.name || 'Unknown'}: ${entry.action} (Round ${entry.roundNumber}) — ${entry.reason || 'no reason'}`;
                  } else {
                    details = JSON.stringify(entry);
                  }
                  return (
                    <tr key={entry.id}>
                      <td className="audit-time">{new Date(entry.timestamp).toLocaleString()}</td>
                      <td>
                        <span className={`audit-type audit-type-${entry.type}`}>
                          {entry.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="audit-details">{details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
