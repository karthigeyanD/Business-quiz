import { useState } from 'react';
import { useQuiz } from '../context/QuizContext';

export default function Results() {
  const { teams, rounds, scores, leaderboard, competition, eliminatedTeams } = useQuiz();
  const [showWinnerScreen, setShowWinnerScreen] = useState(false);

  const isCompleted = competition.status === 'completed';
  const winner = competition.winner;
  const runnerUp = competition.runnerUp;

  // Build full results with qualification history
  const fullResults = leaderboard.map((t, idx) => {
    const roundHistory = rounds.map((r, i) => ({
      round: i + 1,
      name: r.name,
      score: scores[t.id]?.[r.id] || 0,
      status: r.status,
    }));

    return {
      ...t,
      rank: idx + 1,
      roundHistory,
    };
  });

  if (!isCompleted) {
    return (
      <div className="page results-page">
        <header className="page-header">
          <h1>🏅 Results</h1>
          <p className="subtitle">Competition results will appear here once all rounds are completed.</p>
        </header>
        <div className="card">
          <div className="results-placeholder">
            <span className="results-placeholder-icon">🏁</span>
            <h2>Competition Not Yet Completed</h2>
            <p className="text-muted">
              {competition.status === 'registration'
                ? 'The competition has not started yet. Start from the Dashboard.'
                : `Round ${competition.currentRound} of 5 is in progress.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Winner announcement full-screen mode
  if (showWinnerScreen) {
    return (
      <div className="winner-fullscreen" id="winner-fullscreen" onClick={() => setShowWinnerScreen(false)}>
        <div className="winner-bg-effects">
          <div className="winner-particle p1" />
          <div className="winner-particle p2" />
          <div className="winner-particle p3" />
          <div className="winner-particle p4" />
          <div className="winner-particle p5" />
          <div className="winner-particle p6" />
        </div>

        <div className="winner-announcement">
          <div className="winner-crown">👑</div>
          <h1 className="winner-title">WINNER</h1>
          <div className="winner-name-display">{winner?.name}</div>
          <div className="winner-score-display">{winner?.total} Points</div>

          {runnerUp && (
            <div className="runner-up-display">
              <span className="runner-up-medal">🥈</span>
              <span>Runner-up: {runnerUp.name} — {runnerUp.total} Points</span>
            </div>
          )}

          <div className="winner-event-name">Business Quiz Competition</div>
          <p className="winner-close-hint">Click anywhere to close</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page results-page">
      <header className="page-header">
        <h1>🏅 Competition Results</h1>
        <p className="subtitle">
          Final results — Competition completed {competition.completedAt ? new Date(competition.completedAt).toLocaleDateString() : ''}
        </p>
      </header>

      {/* Winner / Runner-up highlight */}
      {winner && (
        <section className="results-hero" id="results-hero">
          <div className="results-winner-card">
            <span className="trophy-icon">🏆</span>
            <div>
              <span className="results-label">Winner</span>
              <h2 className="results-winner-name">{winner.name}</h2>
              <span className="results-winner-score">{winner.total} Points</span>
            </div>
          </div>
          {runnerUp && (
            <div className="results-runnerup-card">
              <span className="trophy-icon">🥈</span>
              <div>
                <span className="results-label">Runner-up</span>
                <h2 className="results-runnerup-name">{runnerUp.name}</h2>
                <span className="results-runnerup-score">{runnerUp.total} Points</span>
              </div>
            </div>
          )}
          <button
            className="btn primary winner-announce-btn"
            onClick={() => setShowWinnerScreen(true)}
            id="launch-winner-screen-btn"
          >
            🎉 Launch Winner Announcement
          </button>
        </section>
      )}

      {/* Full Results Table */}
      <section className="card" id="final-results-table">
        <h2>Final Rankings</h2>
        <div className="table-wrap">
          <table className="results-table" id="results-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>College</th>
                <th>Members</th>
                {rounds.map((r, i) => (
                  <th key={r.id} className="num">R{i + 1}</th>
                ))}
                <th className="num total-col">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fullResults.map((t) => (
                <tr key={t.id} className={`${t.rank <= 3 ? `rank-${t.rank}` : ''} ${t.qualificationStatus === 'eliminated' ? 'row-eliminated' : ''}`}>
                  <td className="rank-cell">
                    {t.rank === 1 ? '🥇' : t.rank === 2 ? '🥈' : t.rank === 3 ? '🥉' : t.rank}
                  </td>
                  <td className="team-name-cell">{t.name}</td>
                  <td className="member-cell">{t.college || '—'}</td>
                  <td className="member-cell">{t.member1} & {t.member2}</td>
                  {t.roundHistory.map((rh) => (
                    <td key={rh.round} className="num">{rh.score}</td>
                  ))}
                  <td className="num total-col score-cell">{t.total}</td>
                  <td>
                    {t.rank === 1 ? (
                      <span className="qual-badge qual-winner">🏆 Winner</span>
                    ) : t.rank === 2 ? (
                      <span className="qual-badge qual-runner-up">🥈 Runner-up</span>
                    ) : t.qualificationStatus === 'eliminated' ? (
                      <span className="qual-badge qual-eliminated">
                        🚫 Eliminated R{t.eliminatedAfterRound}
                      </span>
                    ) : (
                      <span className="qual-badge qual-qualified">✅ Finalist</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Qualification History */}
      <section className="card" id="qualification-history">
        <h2>📋 Qualification History</h2>
        <div className="table-wrap">
          <table className="qual-history-table">
            <thead>
              <tr>
                <th>Team</th>
                {rounds.map((r, i) => (
                  <th key={r.id} className="num">R{i + 1}</th>
                ))}
                <th>Final Status</th>
              </tr>
            </thead>
            <tbody>
              {fullResults.map((t) => (
                <tr key={t.id}>
                  <td className="team-name-cell">{t.name}</td>
                  {rounds.map((r, i) => {
                    const wasEliminated = t.qualificationStatus === 'eliminated' && t.eliminatedAfterRound === i + 1;
                    const wasActive = t.qualificationStatus !== 'eliminated' || (t.eliminatedAfterRound && t.eliminatedAfterRound >= i + 1);
                    return (
                      <td key={r.id} className="num">
                        {wasEliminated ? '🚫' : wasActive ? '✅' : '—'}
                      </td>
                    );
                  })}
                  <td>
                    {t.rank === 1 ? '🏆 Winner' :
                     t.rank === 2 ? '🥈 Runner-up' :
                     t.qualificationStatus === 'eliminated' ? `Eliminated after R${t.eliminatedAfterRound}` :
                     'Finalist'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Eliminated Teams */}
      {eliminatedTeams.length > 0 && (
        <section className="card" id="eliminated-teams">
          <h2>🚫 Eliminated Teams</h2>
          <div className="eliminated-list">
            {eliminatedTeams.map((t) => (
              <div className="eliminated-item" key={t.id}>
                <span className="team-number">{t.teamNumber}</span>
                <div className="team-info">
                  <strong>{t.name}</strong>
                  <span className="members">{t.member1} & {t.member2}</span>
                </div>
                <span className="elim-round">Eliminated after Round {t.eliminatedAfterRound}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
