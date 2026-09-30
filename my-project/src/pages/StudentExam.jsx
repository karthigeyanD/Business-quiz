/**
 * StudentExam — Interactive Online MCQ Examination Page
 *
 * Supports both LAN Server connection (Express + WebSockets)
 * and standalone client fallback when server is unavailable.
 */
import { useEffect, useRef, useState } from 'react';
import { ROUND1_QUESTIONS, ROUND1_META } from '../data/questions';
import { getApiUrl, getWsUrl } from '../utils/api';

const API = getApiUrl();
const TOTAL_SECONDS = ROUND1_META.defaultDuration;        // 900 s = 15 min
const PER_Q_SECONDS = ROUND1_META.perQuestionDuration;    // 60 s  =  1 min

const PHASES = {
  LOGIN: 'login',
  EXAM: 'exam',
  SUBMITTED: 'submitted',
  TIME_UP: 'time_up',
};

export default function StudentExam() {
  const [phase, setPhase] = useState(PHASES.LOGIN);
  const [teamName, setTeamName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [member1, setMember1] = useState('');
  const [member2, setMember2] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(() => sessionStorage.getItem('bq_exam_token') || '');
  const [serverConnected, setServerConnected] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // checking | online | offline

  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [totalTime, setTotalTime] = useState(TOTAL_SECONDS);
  const [questionTime, setQuestionTime] = useState(PER_Q_SECONDS);

  const totalTimerRef = useRef(null);
  const qTimerRef = useRef(null);
  const wsRef = useRef(null);

  const questions = ROUND1_QUESTIONS;
  const totalQuestions = questions.length;

  // ── Check server health & restore session on mount ────────────────────────
  useEffect(() => {
    async function checkServer() {
      try {
        const res = await fetch(`${API}/api/health`);
        const data = await res.json();
        if (data.ok) {
          setServerStatus('online');
          setServerConnected(true);

          // Restore existing session if token exists
          if (token) {
            try {
              const sRes = await fetch(`${API}/api/exam/session`, {
                headers: { 'X-Team-Token': token },
              });
              const sData = await sRes.json();
              if (sData.ok) {
                if (sData.team) {
                  setTeamName(sData.team.name);
                  setMember1(sData.team.member1 || '');
                  setMember2(sData.team.member2 || '');
                }
                if (sData.answers) setAnswers(sData.answers);
                if (sData.timeRemaining != null && sData.timeRemaining > 0) {
                  setTotalTime(sData.timeRemaining);
                } else if (sData.sessionStatus !== 'submitted' && sData.sessionStatus !== 'time_expired') {
                  setTotalTime(TOTAL_SECONDS);
                }

                if (sData.sessionStatus === 'submitted') {
                  setPhase(PHASES.SUBMITTED);
                } else if (sData.sessionStatus === 'time_expired') {
                  setPhase(PHASES.TIME_UP);
                } else if (sData.sessionStatus === 'in_progress' || sData.sessionStatus === 'logged_in' || sData.examStatus === 'active') {
                  setPhase(PHASES.EXAM);
                }
              }
            } catch {}
          }
        } else {
          setServerStatus('offline');
        }
      } catch {
        setServerStatus('offline');
      }
    }
    checkServer();
  }, [token]);

  // ── WebSocket connection for active exam ──────────────────────────────────
  useEffect(() => {
    if (phase !== PHASES.EXAM || !token || serverStatus !== 'online') return;

    try {
      const wsUrl = getWsUrl(API);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'auth', role: 'participant', token }));
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'timer_sync' && msg.remaining != null && msg.remaining > 0) {
            setTotalTime(msg.remaining);
          } else if (msg.type === 'exam_ended') {
            setPhase(PHASES.SUBMITTED);
          }
        } catch {}
      };

      // Heartbeat interval
      const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 5000);

      return () => {
        clearInterval(heartbeat);
        ws.close();
      };
    } catch {}
  }, [phase, token, serverStatus]);

  // ── Login Handler ─────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!teamName.trim()) {
      setError('Please enter your team name.');
      return;
    }

    // Attempt Server Login if Server is Online
    if (serverStatus === 'online') {
      try {
        const res = await fetch(`${API}/api/exam/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamName: teamName.trim(), accessCode: accessCode.trim() }),
        });
        const data = await res.json();
        if (data.ok) {
          setToken(data.token);
          sessionStorage.setItem('bq_exam_token', data.token);
          if (data.team) {
            setMember1(data.team.member1);
            setMember2(data.team.member2);
          }
          if (data.timeRemaining != null && data.timeRemaining > 0) {
            setTotalTime(data.timeRemaining);
          } else {
            setTotalTime(TOTAL_SECONDS);
          }
          setQuestionTime(PER_Q_SECONDS);
          setPhase(PHASES.EXAM);
          return;
        } else {
          // If server returned an error (e.g. invalid credentials)
          setError(data.error || 'Login failed.');
          return;
        }
      } catch (err) {
        // Fall back to client mode if connection failed
        setServerConnected(false);
      }
    }

    // Client-side Fallback Login
    if (!member1.trim() || !member2.trim()) {
      setError('Please enter both member names.');
      return;
    }
    setPhase(PHASES.EXAM);
  };

  // ── Total timer (15 min) ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== PHASES.EXAM) return;

    totalTimerRef.current = setInterval(() => {
      setTotalTime((prev) => {
        if (prev <= 1) {
          clearInterval(totalTimerRef.current);
          setPhase(PHASES.TIME_UP);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(totalTimerRef.current);
  }, [phase]);

  // ── Per-question timer (1 min) ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== PHASES.EXAM) return;

    setQuestionTime(PER_Q_SECONDS);

    qTimerRef.current = setInterval(() => {
      setQuestionTime((prev) => {
        if (prev <= 1) {
          clearInterval(qTimerRef.current);
          setCurrentQ((q) => (q < totalQuestions - 1 ? q + 1 : q));
          return PER_Q_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(qTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQ]);

  // ── Select / clear answers ────────────────────────────────────────────────
  const selectAnswer = async (questionNumber, option) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: option }));

    if (serverConnected && token) {
      try {
        await fetch(`${API}/api/exam/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Team-Token': token,
          },
          body: JSON.stringify({ questionNumber, answer: option }),
        });
      } catch {}
    }
  };

  const clearAnswer = async (questionNumber) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionNumber];
      return next;
    });

    if (serverConnected && token) {
      try {
        await fetch(`${API}/api/exam/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Team-Token': token,
          },
          body: JSON.stringify({ questionNumber, answer: null }),
        });
      } catch {}
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit your exam? You cannot change answers after submission.')) return;
    clearInterval(totalTimerRef.current);
    clearInterval(qTimerRef.current);

    if (serverConnected && token) {
      try {
        await fetch(`${API}/api/exam/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Team-Token': token,
          },
        });
      } catch {}
    }
    setPhase(PHASES.SUBMITTED);
  };

  // ── Tab-switch / Visibility tracking ──────────────────────────────────────
  useEffect(() => {
    if (phase !== PHASES.EXAM) return;
    const handler = () => {
      if (document.hidden) {
        alert('⚠️ Warning: Leaving or switching tabs during the exam is recorded.');
        if (serverConnected && token) {
          fetch(`${API}/api/exam/activity`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Team-Token': token,
            },
            body: JSON.stringify({ eventType: 'tab_switch', details: 'User switched tab/window' }),
          }).catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [phase, token, serverConnected]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const answeredCount = Object.keys(answers).length;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if (phase === PHASES.LOGIN) {
    return (
      <div className="student-exam" id="student-exam">
        <div className="exam-login-page">
          <div className="exam-login-card">
            <div className="exam-login-header">
              <span className="exam-login-icon">📝</span>
              <h1>Business Quiz</h1>
              <p className="exam-login-subtitle">Round 1 — Online MCQ Examination</p>
              <p className="exam-login-institution">{ROUND1_META.institution}</p>
              <div style={{ marginTop: 8 }}>
                {serverStatus === 'online' ? (
                  <span className="qual-badge qual-qualified" style={{ fontSize: '0.8rem' }}>🟢 Exam Server Connected</span>
                ) : (
                  <span className="qual-badge qual-active" style={{ fontSize: '0.8rem' }}>💻 Standalone Client Mode</span>
                )}
              </div>
            </div>

            <form onSubmit={handleLogin} className="exam-login-form">
              <div className="form-group">
                <label htmlFor="teamName">Team Name *</label>
                <input
                  id="teamName"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {serverStatus === 'online' ? (
                <div className="form-group">
                  <label htmlFor="accessCode">Access Code (Optional)</label>
                  <input
                    id="accessCode"
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    placeholder="Provided by administrator (e.g. A1B2)"
                    autoComplete="off"
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="member1">Member 1 Name *</label>
                    <input
                      id="member1"
                      type="text"
                      value={member1}
                      onChange={(e) => setMember1(e.target.value)}
                      placeholder="First member's name"
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="member2">Member 2 Name *</label>
                    <input
                      id="member2"
                      type="text"
                      value={member2}
                      onChange={(e) => setMember2(e.target.value)}
                      placeholder="Second member's name"
                      autoComplete="off"
                    />
                  </div>
                </>
              )}

              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" className="btn primary exam-login-btn">
                🚀 Start Exam
              </button>
            </form>

            <div className="exam-login-footer">
              <p>{ROUND1_META.totalQuestions} Questions · 1 Minute per Question · {TOTAL_SECONDS / 60} Minutes Total</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── EXAM ──────────────────────────────────────────────────────────────────
  if (phase === PHASES.EXAM) {
    const q = questions[currentQ];
    const timerDanger = totalTime <= 60;
    const timerWarn = totalTime <= 180 && !timerDanger;
    const qTimerDanger = questionTime <= 10;
    const qTimerWarn = questionTime <= 20 && !qTimerDanger;

    return (
      <div className="student-exam" id="student-exam">
        {/* Top Bar */}
        <div className="exam-topbar">
          <div className="exam-topbar-left">
            <span className="exam-team-badge">{teamName}</span>
          </div>
          <div className="exam-topbar-center">
            <div className={`exam-total-timer ${timerDanger ? 'danger' : timerWarn ? 'warn' : ''}`}>
              <span className="timer-label">Total</span>
              <span className="timer-value">{fmt(totalTime)}</span>
            </div>
          </div>
          <div className="exam-topbar-right">
            <span className="exam-progress-badge">
              {answeredCount}/{totalQuestions} answered
            </span>
          </div>
        </div>

        {/* Question Area */}
        <div className="exam-question-area">
          {/* Per-question Timer Bar */}
          <div className={`exam-q-timer ${qTimerDanger ? 'danger' : qTimerWarn ? 'warn' : ''}`}>
            <div className="q-timer-bar" style={{ width: `${(questionTime / PER_Q_SECONDS) * 100}%` }} />
            <span className="q-timer-text">⏱ {fmt(questionTime)}</span>
          </div>

          {/* Question Card */}
          <div className="exam-question-card">
            <div className="exam-q-header">
              <span className="exam-q-number">Question {currentQ + 1} of {totalQuestions}</span>
            </div>
            <h2 className="exam-q-text">{q.question}</h2>

            <div className="exam-options">
              {Object.entries(q.options).map(([key, value]) => (
                <button
                  key={key}
                  className={`exam-option ${answers[q.number] === key ? 'selected' : ''}`}
                  onClick={() => selectAnswer(q.number, key)}
                >
                  <span className="option-key">{key}</span>
                  <span className="option-text">{value}</span>
                </button>
              ))}
            </div>

            {answers[q.number] && (
              <button className="btn ghost small" onClick={() => clearAnswer(q.number)} style={{ marginTop: 12 }}>
                ✕ Clear Selection
              </button>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="exam-nav">
          <button
            className="btn exam-nav-btn"
            onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
            disabled={currentQ === 0}
          >
            ◀ Prev
          </button>

          <div className="exam-q-nav-dots">
            {questions.map((qq, i) => (
              <button
                key={qq.number}
                className={`q-dot ${i === currentQ ? 'current' : ''} ${answers[qq.number] ? 'answered' : ''}`}
                onClick={() => setCurrentQ(i)}
                title={`Q${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentQ < totalQuestions - 1 ? (
            <button
              className="btn exam-nav-btn primary"
              onClick={() => setCurrentQ((p) => Math.min(totalQuestions - 1, p + 1))}
            >
              Next ▶
            </button>
          ) : (
            <button className="btn exam-nav-btn submit-btn" onClick={handleSubmit}>
              📤 Submit
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── SUBMITTED ─────────────────────────────────────────────────────────────
  if (phase === PHASES.SUBMITTED) {
    return (
      <div className="student-exam" id="student-exam">
        <div className="exam-result-page">
          <div className="exam-result-card">
            <div className="exam-result-icon">✅</div>
            <h1>Exam Submitted!</h1>
            <p className="exam-result-team">{teamName}</p>
            {member1 && <p className="exam-result-members">{member1} & {member2}</p>}
            <div className="exam-result-stats">
              <div className="result-stat">
                <span className="result-stat-value">{answeredCount}</span>
                <span className="result-stat-label">Answered</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-value">{totalQuestions}</span>
                <span className="result-stat-label">Total</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-value">{totalQuestions - answeredCount}</span>
                <span className="result-stat-label">Skipped</span>
              </div>
            </div>
            <p className="exam-result-message">
              Your answers have been recorded. Results will be announced by the examiner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── TIME UP ───────────────────────────────────────────────────────────────
  if (phase === PHASES.TIME_UP) {
    return (
      <div className="student-exam" id="student-exam">
        <div className="exam-result-page">
          <div className="exam-result-card time-up">
            <div className="exam-result-icon">⏰</div>
            <h1>Time's Up!</h1>
            <p className="exam-result-team">{teamName}</p>
            <p className="exam-result-message">
              The exam has ended. Your answers have been recorded.
            </p>
            <div className="exam-result-stats">
              <div className="result-stat">
                <span className="result-stat-value">{answeredCount}</span>
                <span className="result-stat-label">Answered</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-value">{totalQuestions}</span>
                <span className="result-stat-label">Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
