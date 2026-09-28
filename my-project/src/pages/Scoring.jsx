import { useState } from 'react';
import { useQuiz } from '../context/QuizContext';

export default function Scoring() {
  const { teams, rounds, leaderboard, setScore } = useQuiz();
  const [selectedRound, setSelectedRound] = useState(rounds[0]?.id || '');
  const [customPoints, setCustomPoints] = useState({});

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

  const activeRound = rounds.find((r) => r.id === selectedRound);

  return (
    <div className="page scoring-page">
      <header className="page-header">
        <h1>Scoring</h1>
        <p className="subtitle">Award or deduct points for each team</p>
      </header>

      {/* Round selector */}
      <div className="card round-selector" id="round-selector">
        <label htmlFor="score-round-select">Select Round:</label>
        <select
          id="score-round-select"
          value={selectedRound}
          onChange={(e) => setSelectedRound(e.target.value)}
        >
          {rounds.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {activeRound && (
          <span className="round-badge">{activeRound.questions.length} questions</span>
        )}
      </div>

      {/* Scoring table */}
      <section className="card" id="scoring-section">
        <div className="table-wrap">
          <table className="scoring-table" id="scoring-table">
            <thead>
              <tr>
                <th>Team</th>
                {rounds.map((r, i) => (
                  <th key={r.id} className={`num ${r.id === selectedRound ? 'active-col' : ''}`}>
                    R{i + 1}
                  </th>
                ))}
                <th className="num total-col">Total</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((t) => (
                <tr key={t.id}>
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
                  <td className="scoring-actions">
                    <div className="scoring-btn-group">
                      <button
                        className="btn small success"
                        onClick={() => handleAward(t.id, 10)}
                        title="+10"
                      >
                        +10
                      </button>
                      <button
                        className="btn small success"
                        onClick={() => handleAward(t.id, 5)}
                        title="+5"
                      >
                        +5
                      </button>
                      <button
                        className="btn small danger"
                        onClick={() => handleAward(t.id, -5)}
                        title="-5"
                      >
                        −5
                      </button>
                      <div className="custom-score">
                        <input
                          type="number"
                          className="input-xs"
                          placeholder="±"
                          value={customPoints[t.id] || ''}
                          onChange={(e) =>
                            setCustomPoints({ ...customPoints, [t.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCustom(t.id);
                          }}
                        />
                        <button className="btn small primary" onClick={() => handleCustom(t.id)}>
                          Go
                        </button>
                      </div>
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
