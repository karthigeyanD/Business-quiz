import { NavLink } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';

export default function Dashboard() {
  const { teams, rounds, totalQuestions, leaderboard } = useQuiz();

  const stats = [
    { label: 'Teams', value: teams.length, icon: '👥', max: '/ 20' },
    { label: 'Players', value: teams.length * 2, icon: '🧑' },
    { label: 'Rounds', value: rounds.length, icon: '🔄' },
    { label: 'Questions', value: totalQuestions, icon: '❓' },
  ];

  return (
    <div className="page dashboard">
      <header className="page-header">
        <h1>Organizer Dashboard</h1>
        <p className="subtitle">Manage your Business Quiz competition</p>
      </header>

      {/* Stat cards */}
      <section className="stat-grid" id="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">
              {s.value}
              {s.max && <small className="stat-max">{s.max}</small>}
            </span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Quick nav */}
      <section className="quick-nav" id="quick-nav">
        <NavLink to="/teams" className="nav-card" id="nav-teams">
          <span className="nav-icon">📋</span>
          <div>
            <h3>Team Registration</h3>
            <p>Register, edit, or remove teams</p>
          </div>
        </NavLink>
        <NavLink to="/rounds" className="nav-card" id="nav-rounds">
          <span className="nav-icon">📝</span>
          <div>
            <h3>Rounds &amp; Questions</h3>
            <p>Manage rounds, timers, and questions</p>
          </div>
        </NavLink>
        <NavLink to="/scoring" className="nav-card" id="nav-scoring">
          <span className="nav-icon">🏆</span>
          <div>
            <h3>Scoring</h3>
            <p>Award or deduct points by round</p>
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

      {/* Leaderboard */}
      <section className="card" id="leaderboard-section">
        <h2>Leaderboard</h2>
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
                  <th className="num">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((t, i) => (
                  <tr key={t.id} className={i < 3 ? `rank-${i + 1}` : ''}>
                    <td className="rank-cell">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td className="team-name-cell">{t.name}</td>
                    <td className="member-cell">{t.member1}, {t.member2}</td>
                    <td className="num score-cell">{t.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
