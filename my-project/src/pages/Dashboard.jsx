import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { DEFAULT_QUALIFICATION_MATRIX } from '../data/storage';

export default function Dashboard() {
  const {
    teams, rounds, totalQuestions, leaderboard,
    competition, activeTeams, eliminatedTeams, currentSchedule,
    startCompetition, resetCompetition,
  } = useQuiz();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  const isRegistration = competition.status === 'registration';
  const isStarted = competition.status === 'started';
  const isCompleted = competition.status === 'completed';
  const teamCount = teams.length;

  const handleStart = () => {
    setError('');
    try {
      startCompetition();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    resetCompetition();
    setShowResetConfirm(false);
  };

  const stats = [
    { label: 'Registered', value: teamCount, icon: '👥', sub: `/ 20 max`, color: 'var(--accent)' },
    { label: 'Active', value: activeTeams.length, icon: '✅', color: 'var(--success)' },
    { label: 'Eliminated', value: eliminatedTeams.length, icon: '🚫', color: 'var(--danger)' },
    { label: 'Current Round', value: competition.currentRound || '—', icon: '🔄', sub: '/ 5', color: 'var(--warn)' },
  ];

  const statusLabel = {
    registration: '📋 Registration Open',
    started: '🟢 Competition In Progress',
    completed: '🏁 Competition Completed',
  };

  return (
    <div className="page dashboard">
      <header className="page-header">
        <h1>Competition Control Center</h1>
        <p className="subtitle">Business Quiz Management Dashboard</p>
      </header>

      {/* Competition Status Banner */}
      <div className={`status-banner status-${competition.status}`} id="competition-status">
        <div className="status-info">
          <span className="status-label">{statusLabel[competition.status]}</span>
          {isStarted && (
            <span className="status-detail">
              Round {competition.currentRound} of 5 · {activeTeams.length} teams competing
            </span>
          )}
          {isCompleted && competition.winner && (
            <span className="status-detail">
              Winner: {competition.winner.name} 🎉
            </span>
          )}
        </div>
        <div className="status-actions">
          {isRegistration && teamCount >= 5 && (
            <button className="btn primary" onClick={handleStart} id="start-competition-btn">
              🚀 Start Competition
            </button>
          )}
          {isRegistration && teamCount < 5 && (
            <span className="status-detail warn-text">
              Need {5 - teamCount} more team{5 - teamCount > 1 ? 's' : ''} to start
            </span>
          )}
          {(isStarted || isCompleted) && (
            <button
              className="btn danger small"
              onClick={() => setShowResetConfirm(true)}
              id="reset-competition-btn"
            >
              ↺ Reset Competition
            </button>
          )}
        </div>
      </div>

      {error && <p className="form-error" role="alert" style={{ marginBottom: 16 }}>{error}</p>}

      {/* Stat cards */}
      <section className="stat-grid" id="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value" style={{ color: s.color }}>
              {s.value}
              {s.sub && <small className="stat-max">{s.sub}</small>}
            </span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Round Progress */}
      <section className="card" id="round-progress">
        <h2>Round Progress</h2>
        <div className="round-progress-bar">
          {rounds.map((r, i) => {
            const status = r.status;
            const schedule = currentSchedule || [];
            const teamsInRound = schedule[i] || '—';
            return (
              <div className={`round-step ${status}`} key={r.id}>
                <div className="round-step-circle">
                  {status === 'completed' ? '✓' : status === 'active' ? '▶' : i + 1}
                </div>
                <div className="round-step-info">
                  <span className="round-step-name">{r.name}</span>
                  <span className="round-step-meta">
                    {teamsInRound} teams
                    {status === 'completed' && ' · Done'}
                    {status === 'active' && ' · In Progress'}
                  </span>
                </div>
                {i < rounds.length - 1 && <div className="round-step-line" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* Qualification Preview */}
      <section className="card" id="qualification-preview">
        <div className="card-header-row">
          <h2>Qualification Preview</h2>
          <button className="btn ghost small" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Hide Matrix' : 'Show Full Matrix'}
          </button>
        </div>
        {teamCount >= 5 && (
          <div className="qual-preview-current">
            <p className="qual-preview-label">
              With <strong>{teamCount} teams</strong>, the qualification schedule is:
            </p>
            <div className="qual-preview-chips">
              {currentSchedule.map((count, i) => (
                <div className={`qual-chip ${i === (competition.currentRound - 1) ? 'active' : ''}`} key={i}>
                  <span className="qual-chip-round">R{i + 1}</span>
                  <span className="qual-chip-count">{count}</span>
                  <span className="qual-chip-label">teams</span>
                </div>
              ))}
            </div>
            <p className="provisional-badge">⚠ Provisional — editable in Settings</p>
          </div>
        )}
        {teamCount < 5 && (
          <p className="empty-state">Register at least 5 teams to see the qualification schedule.</p>
        )}
        {showPreview && (
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table className="qual-matrix-table" id="qual-matrix-table">
              <thead>
                <tr>
                  <th>Teams</th>
                  <th className="num">R1</th>
                  <th className="num">R2</th>
                  <th className="num">R3</th>
                  <th className="num">R4</th>
                  <th className="num">R5</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(DEFAULT_QUALIFICATION_MATRIX).map(([count, schedule]) => (
                  <tr key={count} className={Number(count) === teamCount ? 'highlight-row' : ''}>
                    <td><strong>{count}</strong></td>
                    {schedule.map((v, i) => (
                      <td key={i} className="num">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick nav */}
      <section className="quick-nav" id="quick-nav">
        <NavLink to="/teams" className="nav-card" id="nav-teams">
          <span className="nav-icon">📋</span>
          <div>
            <h3>Team Registration</h3>
            <p>{teamCount} teams registered</p>
          </div>
        </NavLink>
        <NavLink to="/rounds" className="nav-card" id="nav-rounds">
          <span className="nav-icon">📝</span>
          <div>
            <h3>Round Management</h3>
            <p>Manage rounds, scores & qualifications</p>
          </div>
        </NavLink>
        <NavLink to="/scoring" className="nav-card" id="nav-scoring">
          <span className="nav-icon">🎯</span>
          <div>
            <h3>Scoring</h3>
            <p>Award or deduct points by round</p>
          </div>
        </NavLink>
        <NavLink to="/leaderboard" className="nav-card" id="nav-leaderboard">
          <span className="nav-icon">🏆</span>
          <div>
            <h3>Leaderboard</h3>
            <p>Live team rankings</p>
          </div>
        </NavLink>
        <NavLink to="/settings" className="nav-card" id="nav-settings">
          <span className="nav-icon">⚙️</span>
          <div>
            <h3>Settings</h3>
            <p>Qualification matrix & scoring rules</p>
          </div>
        </NavLink>
        <NavLink to="/live" className="nav-card highlight" id="nav-live">
          <span className="nav-icon">📺</span>
          <div>
            <h3>Live Display</h3>
            <p>Launch the projector-friendly view</p>
          </div>
        </NavLink>
      </section>

      {/* Quick leaderboard */}
      <section className="card" id="leaderboard-section">
        <h2>Top Teams</h2>
        {leaderboard.length === 0 ? (
          <p className="empty-state">Register teams to see the leaderboard.</p>
        ) : (
          <div className="table-wrap">
            <table className="leaderboard-table" id="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th className="num">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 10).map((t, i) => (
                  <tr key={t.id} className={i < 3 ? `rank-${i + 1}` : ''}>
                    <td className="rank-cell">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td className="team-name-cell">{t.name}</td>
                    <td className="member-cell">{t.member1}, {t.member2}</td>
                    <td>
                      <span className={`qual-badge qual-${t.qualificationStatus}`}>
                        {t.qualificationStatus === 'eliminated' ? '🚫 Eliminated' :
                         t.qualificationStatus === 'qualified' ? '✅ Qualified' : '🔵 Active'}
                      </span>
                    </td>
                    <td className="num score-cell">{t.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="modal-overlay" id="reset-modal">
          <div className="modal-content">
            <h2>⚠️ Reset Competition?</h2>
            <p>This will reset all scores, round progress, qualifications, and competition status.</p>
            <p><strong>Team registrations will be preserved.</strong></p>
            <div className="form-actions" style={{ marginTop: 20 }}>
              <button className="btn danger" onClick={handleReset}>
                Yes, Reset Everything
              </button>
              <button className="btn ghost" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
