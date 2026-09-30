import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { ROUND1_QUESTIONS, ROUND1_META } from '../data/questions';
import { getApiUrl, getWsUrl } from '../utils/api';

const API = getApiUrl();

export default function ExamSetup() {
  const { teams, rounds, setScoreDirect } = useQuiz();

  const [network, setNetwork] = useState(null);
  const [config, setConfig] = useState(null);
  const [monitor, setMonitor] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [answerKey, setAnswerKey] = useState({});
  const [answerKeySet, setAnswerKeySet] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('setup'); // setup | monitor | activity | results
  const [results, setResults] = useState(null);

  const wsRef = useRef(null);
  const pollRef = useRef(null);

  // --- Fetch network info (QR code & LAN links) ---
  const fetchNetwork = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/network`);
      if (res.ok) {
        const data = await res.json();
        setNetwork(data);
        setServerOnline(true);
      } else {
        setServerOnline(false);
      }
    } catch {
      setServerOnline(false);
    }
  }, []);

  // --- Fetch config ---
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/config`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      }
    } catch {}
  }, []);

  // --- Fetch monitor ---
  const fetchMonitor = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/monitor`);
      if (res.ok) {
        const data = await res.json();
        setMonitor(data);
      }
    } catch {}
  }, []);

  // --- Fetch activity log ---
  const fetchActivityLog = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/activity-log`);
      if (res.ok) {
        const data = await res.json();
        setActivityLog(data.log || []);
      }
    } catch {}
  }, []);

  // --- Fetch questions & answer key ---
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/questions`);
      if (res.ok) {
        const data = await res.json();
        if (data.answerKey) setAnswerKey(data.answerKey);
        setAnswerKeySet(data.answerKeySet);
      }
    } catch {}
  }, []);

  // --- Fetch results ---
  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/results`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {}
  }, []);

  // --- Initial load & Polling ---
  useEffect(() => {
    fetchNetwork();
    fetchConfig();
    fetchQuestions();
    fetchMonitor();
    fetchActivityLog();

    pollRef.current = setInterval(() => {
      fetchNetwork();
      fetchMonitor();
      fetchConfig();
      fetchActivityLog();
    }, 3000);

    return () => {
      clearInterval(pollRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchNetwork, fetchConfig, fetchQuestions, fetchMonitor, fetchActivityLog]);

  // --- WebSocket for real-time updates ---
  useEffect(() => {
    try {
      const wsUrl = getWsUrl(API);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'auth', role: 'admin' }));
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'monitor_update') {
            setMonitor((prev) => ({ ...prev, ...msg.data }));
            if (msg.data.config) setConfig(msg.data.config);
          } else if (msg.type === 'alert') {
            setActivityLog((prev) => [msg.data, ...prev]);
          }
        } catch {}
      };

      ws.onerror = () => {};
      ws.onclose = () => {};

      return () => ws.close();
    } catch {}
  }, []);

  // --- Sync teams to server ---
  const syncTeams = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/admin/sync-teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(`✅ ${teams.length} teams synced to exam server successfully!`);
        fetchMonitor();
      } else {
        setError(data.error || 'Failed to sync teams');
      }
    } catch {
      setError('Cannot connect to exam server. Please start the server using `npm run server`.');
    }
  };

  // --- Save answer key ---
  const saveAnswerKey = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/admin/answer-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerKey }),
      });
      const data = await res.json();
      if (data.ok) {
        setAnswerKeySet(true);
        setSuccess('✅ Answer key saved successfully');
      } else {
        setError(data.error);
      }
    } catch {
      setError('Cannot connect to exam server');
    }
  };

  // Auto-fill default sample answer key
  const prefillDefaultKey = () => {
    const key = {};
    const sampleAnswers = ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C'];
    ROUND1_QUESTIONS.forEach((q, idx) => {
      key[q.number] = sampleAnswers[idx % 4];
    });
    setAnswerKey(key);
    setSuccess('⚡ Default sample key populated! Click "Save Answer Key" to confirm.');
  };

  // --- Exam action controls ---
  const examAction = async (action) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/admin/exam/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(`✅ Exam ${action} operation successful`);
        fetchConfig();
        fetchMonitor();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Cannot connect to exam server');
    }
  };

  // --- Session Reset ---
  const resetTeamSession = async (teamId, teamName) => {
    if (!window.confirm(`Reset exam session for ${teamName}? This clears their current answers and allows re-login.`)) return;
    try {
      const res = await fetch(`${API}/api/admin/exam/reset-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(`Session reset for ${teamName}`);
        fetchMonitor();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to connect to exam server');
    }
  };

  // --- Extend Time ---
  const extendTime = async (teamId, extraSeconds) => {
    try {
      const res = await fetch(`${API}/api/admin/exam/extend-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, extraSeconds }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(`Added +${extraSeconds / 60} min extra time for team.`);
        fetchMonitor();
      }
    } catch {
      setError('Failed to extend time');
    }
  };

  // --- Resolve Alert ---
  const resolveAlert = async (alertId, reviewStatus) => {
    try {
      const res = await fetch(`${API}/api/admin/resolve-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, reviewStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchActivityLog();
        fetchMonitor();
      }
    } catch {}
  };

  // --- Reset Server State ---
  const resetExamState = async () => {
    if (!window.confirm('Reset all server exam sessions and timer state back to fresh setup mode?')) return;
    try {
      const res = await fetch(`${API}/api/admin/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setSuccess('↺ Exam server reset to fresh setup mode.');
        fetchConfig();
        fetchMonitor();
      }
    } catch {
      setError('Failed to reset exam server.');
    }
  };

  // --- Grade all ---
  const gradeAll = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/admin/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess('✅ All team submissions graded!');
        fetchResults();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Cannot connect to exam server');
    }
  };

  // --- Sync Results to Main Competition ---
  const syncResultsToCompetition = () => {
    if (!results || !results.results || results.results.length === 0) {
      setError('No exam results available to sync. Grade teams first.');
      return;
    }

    const round1Id = rounds[0]?.id || 'round-1';
    let count = 0;

    results.results.forEach((r) => {
      if (r.score != null) {
        setScoreDirect(r.teamId, round1Id, r.score);
        count++;
      }
    });

    setSuccess(`🏆 ${count} team scores pushed into Round 1 of Main Competition!`);
  };

  // --- Export CSV ---
  const handleExportCsv = () => {
    window.open(`${API}/api/admin/export`, '_blank');
  };

  const status = config?.status || 'setup';
  const timeRemaining = monitor?.stats?.timeRemaining || 0;
  const mins = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
  const secs = String(Math.floor(timeRemaining % 60)).padStart(2, '0');

  return (
    <div className="page exam-setup" id="admin-exam-page">
      <header className="page-header card-header-row">
        <div>
          <h1>⚡ Admin Control Center — Online Exam</h1>
          <p className="subtitle">
            {ROUND1_META.title} · {ROUND1_META.totalQuestions} MCQs · {ROUND1_META.defaultDuration / 60} Minutes Total
          </p>
        </div>
        <div>
          {serverOnline ? (
            <span className="qual-badge qual-qualified" style={{ padding: '8px 14px', fontSize: '0.9rem' }}>
              🟢 Server Active (Port 3001)
            </span>
          ) : (
            <button className="btn danger small" onClick={fetchNetwork}>
              🔴 Server Offline — Click to Retry
            </button>
          )}
        </div>
      </header>

      {/* Status Banner */}
      <div className={`status-banner status-${status === 'active' ? 'started' : status === 'completed' ? 'completed' : 'registration'}`}>
        <div className="status-info">
          <span className="status-label">
            {status === 'setup' && '⚙️ Setup Mode'}
            {status === 'ready' && '✅ Ready to Start'}
            {status === 'active' && '🟢 Exam In Progress'}
            {status === 'paused' && '⏸️ Exam Paused'}
            {status === 'completed' && '🏁 Exam Completed'}
          </span>
          {(status === 'active' || status === 'paused') && (
            <span className="status-detail">
              ⏱ {mins}:{secs} remaining · {monitor?.stats?.inProgress || 0} teams currently active
            </span>
          )}
        </div>
      </div>

      {error && <p className="form-error" role="alert" style={{ margin: '12px 0' }}>{error}</p>}
      {success && <p className="form-success" role="status" style={{ margin: '12px 0', color: 'var(--success)' }}>{success}</p>}

      {/* Tabs */}
      <div className="round-tabs" id="admin-exam-tabs">
        <button className={`round-tab-btn ${tab === 'setup' ? 'active' : ''}`} onClick={() => setTab('setup')}>
          <span className="round-tab-num">⚙️</span> Setup & Control
        </button>
        <button className={`round-tab-btn ${tab === 'monitor' ? 'active' : ''}`} onClick={() => { setTab('monitor'); fetchMonitor(); }}>
          <span className="round-tab-num">📡</span> Live Monitor ({monitor?.stats?.loggedIn || 0})
        </button>
        <button className={`round-tab-btn ${tab === 'activity' ? 'active' : ''}`} onClick={() => { setTab('activity'); fetchActivityLog(); }}>
          <span className="round-tab-num">⚠️</span> Alerts & Logs ({activityLog.filter((a) => a.reviewStatus === 'unreviewed').length})
        </button>
        <button className={`round-tab-btn ${tab === 'results' ? 'active' : ''}`} onClick={() => { setTab('results'); fetchResults(); }}>
          <span className="round-tab-num">🏆</span> Results & Grading
        </button>
      </div>

      {/* ===== SETUP TAB ===== */}
      {tab === 'setup' && (
        <div className="exam-setup-content">
          {/* Step 1: QR Code & Access Link */}
          <section className="card" id="qr-section">
            <h2>📱 Step 1 — QR Code & Participant Access Link</h2>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Provide this QR code or URL to students on the local Wi-Fi network to access the examination.
            </p>
            {network ? (
              <div className="qr-display">
                {network.qrDataUrl && (
                  <div className="qr-code-wrap">
                    <img src={network.qrDataUrl} alt="Exam QR Code" className="qr-code-img" />
                  </div>
                )}
                <div className="qr-info">
                  <p><strong>Exam URL for Students:</strong></p>
                  <code className="exam-url" style={{ fontSize: '1.1rem', padding: '8px 12px' }}>{network.examUrl}</code>
                  <p className="text-muted" style={{ marginTop: 12 }}>
                    📡 Server IP: {network.primary}:{network.port}
                  </p>
                  <p className="text-muted">
                    Ensure all student smartphones/tablets are connected to the same Wi-Fi.
                  </p>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>❌ Cannot connect to exam server.</p>
                <p>Run <code>npm run server</code> in terminal to start the Express server on port 3001.</p>
              </div>
            )}
          </section>

          {/* Step 2: Sync Teams & Access Codes */}
          <section className="card" id="sync-section">
            <div className="card-header-row">
              <h2>👥 Step 2 — Sync Teams & Access Codes</h2>
              <button className="btn primary" onClick={syncTeams}>
                🔄 Sync {teams.length} Teams to Server
              </button>
            </div>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Push registered teams to the server so students can log in. Each team is assigned an Access Code.
            </p>

            {monitor?.sessions && monitor.sessions.length > 0 ? (
              <div className="table-wrap">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team Name</th>
                      <th>Access Code</th>
                      <th>Members</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monitor.sessions.map((s, idx) => (
                      <tr key={s.teamId}>
                        <td>{s.teamNumber || idx + 1}</td>
                        <td className="team-name-cell"><strong>{s.teamName}</strong></td>
                        <td>
                          <code style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                            {s.accessCode || '—'}
                          </code>
                        </td>
                        <td>{s.member1} {s.member2 ? `& ${s.member2}` : ''}</td>
                        <td>
                          <span className={`qual-badge qual-${s.status === 'submitted' ? 'qualified' : s.status === 'in_progress' ? 'active' : 'eliminated'}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">Click "Sync Teams" above to sync registered teams to the server.</p>
            )}
          </section>

          {/* Step 3: Answer Key */}
          <section className="card" id="answer-key-section">
            <div className="card-header-row">
              <h2>🔑 Step 3 — Answer Key Setup</h2>
              <button className="btn ghost small" onClick={prefillDefaultKey}>
                ⚡ Auto-Fill Default Key
              </button>
            </div>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Select the correct answer (A, B, C, or D) for each of the {ROUND1_QUESTIONS.length} questions.
            </p>
            <div className="answer-key-grid">
              {ROUND1_QUESTIONS.map((q) => (
                <div className="answer-key-row" key={q.number}>
                  <span className="ak-number">Q{q.number}</span>
                  <span className="ak-question">{q.question.substring(0, 60)}…</span>
                  <div className="ak-options">
                    {Object.keys(q.options).map((opt) => (
                      <button
                        key={opt}
                        className={`btn small ${answerKey[q.number] === opt ? 'primary' : 'ghost'}`}
                        onClick={() => setAnswerKey((prev) => ({ ...prev, [q.number]: opt }))}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="form-actions" style={{ marginTop: 20 }}>
              <button className="btn primary" onClick={saveAnswerKey}>
                💾 Save Answer Key ({Object.keys(answerKey).length}/{ROUND1_QUESTIONS.length})
              </button>
              {answerKeySet && <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✅ Answer Key Configured</span>}
            </div>
          </section>

          {/* Step 4: Exam Controls */}
          <section className="card" id="exam-controls">
            <h2>🎛️ Step 4 — Exam Lifecycle Controls</h2>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Control global timer and access for all participant devices.
            </p>
            <div className="round-control-actions">
              {(status === 'setup' || status === 'ready') && (
                <button className="btn primary" onClick={() => examAction('start')} style={{ fontSize: '1.1rem', padding: '12px 24px' }}>
                  🚀 Start Exam Broadcast
                </button>
              )}
              {status === 'active' && (
                <>
                  <button className="btn warn" onClick={() => examAction('pause')}>
                    ⏸️ Pause Exam
                  </button>
                  <button className="btn danger" onClick={() => examAction('stop')}>
                    ⏹️ Stop & Close Exam
                  </button>
                </>
              )}
              {status === 'paused' && (
                <>
                  <button className="btn primary" onClick={() => examAction('resume')}>
                    ▶️ Resume Exam
                  </button>
                  <button className="btn danger" onClick={() => examAction('stop')}>
                    ⏹️ Stop & Close Exam
                  </button>
                </>
              )}
              {status === 'completed' && (
                <>
                  <button className="btn primary" onClick={gradeAll}>
                    📊 Auto-Grade All Submissions
                  </button>
                  <button className="btn danger" onClick={resetExamState}>
                    ↺ Reset Server for New Exam
                  </button>
                </>
              )}
              {status !== 'completed' && (
                <button className="btn ghost small" onClick={resetExamState} style={{ marginLeft: 12 }}>
                  ↺ Reset Server State
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ===== MONITOR TAB ===== */}
      {tab === 'monitor' && (
        <div className="exam-monitor-content">
          {/* Stats */}
          <section className="stat-grid" id="exam-stat-grid">
            {[
              { label: 'Total Teams', value: monitor?.stats?.totalTeams || 0, icon: '👥', color: 'var(--accent)' },
              { label: 'Logged In', value: monitor?.stats?.loggedIn || 0, icon: '🔑', color: 'var(--success)' },
              { label: 'In Progress', value: monitor?.stats?.inProgress || 0, icon: '📝', color: 'var(--warn)' },
              { label: 'Submitted', value: monitor?.stats?.submitted || 0, icon: '✅', color: 'var(--success)' },
              { label: 'Time Expired', value: monitor?.stats?.timeExpired || 0, icon: '⏰', color: 'var(--danger)' },
              { label: 'Unreviewed Alerts', value: monitor?.stats?.alertCount || 0, icon: '⚠️', color: 'var(--danger)' },
            ].map((s) => (
              <div className="stat-card" key={s.label}>
                <span className="stat-icon">{s.icon}</span>
                <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </section>

          {/* Session Table */}
          <section className="card">
            <div className="card-header-row">
              <h2>📋 Active Team Sessions & Monitoring</h2>
              <button className="btn ghost small" onClick={fetchMonitor}>
                🔄 Refresh Monitor
              </button>
            </div>
            <div className="table-wrap">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Team Name</th>
                    <th>Access Code</th>
                    <th>Status</th>
                    <th className="num">Answered</th>
                    <th>Connected</th>
                    <th className="num">Time Left</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(monitor?.sessions || []).map((s, i) => (
                    <tr key={s.teamId}>
                      <td>{s.teamNumber || i + 1}</td>
                      <td className="team-name-cell"><strong>{s.teamName}</strong></td>
                      <td>
                        <code>{s.accessCode || '—'}</code>
                      </td>
                      <td>
                        <span className={`qual-badge qual-${s.status === 'submitted' ? 'qualified' : s.status === 'in_progress' ? 'active' : 'eliminated'}`}>
                          {s.status === 'not_started' && '⏳ Not Started'}
                          {s.status === 'logged_in' && '🔑 Logged In'}
                          {s.status === 'in_progress' && '📝 In Progress'}
                          {s.status === 'submitted' && '✅ Submitted'}
                          {s.status === 'time_expired' && '⏰ Time Expired'}
                        </span>
                      </td>
                      <td className="num">{s.answeredCount}/{ROUND1_QUESTIONS.length}</td>
                      <td>{s.isConnected ? '🟢 Online' : '🔴 Offline'}</td>
                      <td className="num">
                        {Math.floor((s.timeRemaining || 0) / 60)}:{String(Math.floor((s.timeRemaining || 0) % 60)).padStart(2, '0')}
                      </td>
                      <td>
                        <div className="form-actions" style={{ margin: 0 }}>
                          <button
                            className="btn small success"
                            onClick={() => extendTime(s.teamId, 60)}
                            title="Add +1 minute extra time"
                          >
                            +1m
                          </button>
                          <button
                            className="btn small ghost"
                            onClick={() => resetTeamSession(s.teamId, s.teamName)}
                            title="Reset team session"
                          >
                            ↺ Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ===== ACTIVITY / ALERTS TAB ===== */}
      {tab === 'activity' && (
        <div className="exam-activity-content">
          <section className="card">
            <div className="card-header-row">
              <h2>⚠️ Proctoring Alerts & Event Logs</h2>
              <button className="btn ghost small" onClick={fetchActivityLog}>
                🔄 Refresh Logs
              </button>
            </div>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Tracks tab switching, disconnects, and session resets during the online exam.
            </p>

            {activityLog.length === 0 ? (
              <p className="empty-state">No security alerts recorded.</p>
            ) : (
              <div className="table-wrap">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Team</th>
                      <th>Event</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.map((log) => (
                      <tr key={log.id} className={log.reviewStatus === 'unreviewed' ? 'row-at-risk' : ''}>
                        <td className="audit-time">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="team-name-cell"><strong>{log.teamName}</strong></td>
                        <td>
                          <span className={`qual-badge ${log.eventType === 'tab_switch' ? 'qual-eliminated' : 'qual-active'}`}>
                            {log.eventType}
                          </span>
                        </td>
                        <td>{log.details || '—'}</td>
                        <td>{log.reviewStatus}</td>
                        <td>
                          {log.reviewStatus === 'unreviewed' && (
                            <button className="btn small primary" onClick={() => resolveAlert(log.id, 'reviewed')}>
                              Mark Reviewed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ===== RESULTS TAB ===== */}
      {tab === 'results' && (
        <div className="exam-results-content">
          <section className="card">
            <div className="card-header-row">
              <h2>🏆 Exam Results & Grading</h2>
              <div className="form-actions" style={{ margin: 0 }}>
                <button className="btn primary small" onClick={gradeAll}>
                  📊 Auto-Grade All
                </button>
                <button className="btn success small" onClick={syncResultsToCompetition}>
                  🏆 Sync to Main Competition
                </button>
                <button className="btn ghost small" onClick={handleExportCsv}>
                  📥 Export CSV
                </button>
              </div>
            </div>

            {results?.results ? (
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team Name</th>
                      <th>Members</th>
                      <th className="num">Score</th>
                      <th className="num">Correct</th>
                      <th className="num">Incorrect</th>
                      <th className="num">Unanswered</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((r, i) => (
                      <tr key={r.teamId} className={i < 3 ? `rank-${i + 1}` : ''}>
                        <td className="rank-cell">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </td>
                        <td className="team-name-cell"><strong>{r.teamName}</strong></td>
                        <td>{r.member1} {r.member2 ? `& ${r.member2}` : ''}</td>
                        <td className="num score-cell">{r.score ?? '—'}</td>
                        <td className="num" style={{ color: 'var(--success)' }}>{r.correctCount ?? '—'}</td>
                        <td className="num" style={{ color: 'var(--danger)' }}>{r.incorrectCount ?? '—'}</td>
                        <td className="num">{r.unansweredCount ?? '—'}</td>
                        <td>
                          <span className={`qual-badge qual-${r.status === 'submitted' ? 'qualified' : 'active'}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">No results calculated yet. Click "Auto-Grade All" to calculate scores.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
