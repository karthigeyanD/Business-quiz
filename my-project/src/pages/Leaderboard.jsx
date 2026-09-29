import { useQuiz } from '../context/QuizContext';

export default function Leaderboard() {
  const { teams, rounds, scores, leaderboard, competition, activeTeams, eliminatedTeams } = useQuiz();

  const isCompleted = competition.status === 'completed';

  return (
    <div className="page leaderboard-page">
      <header className="page-header">
        <h1>🏆 Leaderboard</h1>
        <p className="subtitle">
          Live team rankings — {activeTeams.length} active, {eliminatedTeams.length} eliminated
        </p>
      </header>

      {/* Summary stats */}
      <div className="stat-grid leaderboard-stats">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <span className="stat-value">{teams.length}</span>
          <span className="stat-label">Total Teams</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>{activeTeams.length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🚫</span>
          <span className="stat-value" style={{ color: 'var(--danger)' }}>{eliminatedTeams.length}</span>
          <span className="stat-label">Eliminated</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔄</span>
          <span className="stat-value" style={{ color: 'var(--warn)' }}>
            {competition.currentRound || '—'}
          </span>
          <span className="stat-label">Current Round</span>
        </div>
      </div>

      {/* Main leaderboard */}
      <section className="card" id="full-leaderboard">
        <h2>Complete Rankings</h2>
        {leaderboard.length === 0 ? (
          <p className="empty-state">Register teams to see the leaderboard.</p>
        ) : (
          <div className="table-wrap">
            <table className="leaderboard-table full-leaderboard-table" id="full-leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team</th>
                  <th>College</th>
                  {rounds.map((r, i) => (
                    <th key={r.id} className="num">R{i + 1}</th>
                  ))}
                  <th className="num total-col">Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`${i < 3 ? `rank-${i + 1}` : ''} ${t.qualificationStatus === 'eliminated' ? 'row-eliminated' : ''}`}
                  >
                    <td className="rank-cell">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td className="team-name-cell">
                      <div>
                        <strong>{t.name}</strong>
                        <small className="member-cell" style={{ display: 'block' }}>
                          {t.member1} & {t.member2}
                        </small>
                      </div>
                    </td>
                    <td className="member-cell">{t.college || '—'}</td>
                    {rounds.map((r) => (
                      <td key={r.id} className="num">
                        {t.byRound[r.id] || 0}
                      </td>
                    ))}
                    <td className="num total-col score-cell">{t.total}</td>
                    <td>
                      <span className={`qual-badge qual-${t.qualificationStatus}`}>
                        {t.qualificationStatus === 'eliminated'
                          ? `🚫 R${t.eliminatedAfterRound}`
                          : t.qualificationStatus === 'qualified'
                          ? '✅ Qualified'
                          : '🔵 Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Winner highlight */}
      {isCompleted && competition.winner && (
        <section className="card winner-card" id="winner-highlight">
          <div className="winner-content">
            <span className="winner-trophy">🏆</span>
            <h2>Winner: {competition.winner.name}</h2>
            <p className="winner-score">{competition.winner.total} points</p>
            {competition.runnerUp && (
              <p className="runner-up">
                🥈 Runner-up: {competition.runnerUp.name} ({competition.runnerUp.total} points)
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
