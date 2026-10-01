import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuiz } from '../context/QuizContext';

export default function LiveDisplay() {
  const { rounds, leaderboard, live, setLive } = useQuiz();

  // Active round / question (computed first so we can use them for init)
  const activeRoundId = live.activeRoundId || rounds[0]?.id;
  const activeRound = rounds.find((r) => r.id === activeRoundId) || rounds[0];
  const qIndex = live.activeQuestionIndex || 0;
  const activeQ = activeRound?.questions[qIndex];

  // Local timer state (not persisted every tick — just on pause / reset)
  const [timerLeft, setTimerLeft] = useState(
    () => live.timerRemaining ?? activeRound?.timerSeconds ?? 30
  );
  const [running, setRunning] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(live.answerRevealed);
  const intervalRef = useRef(null);

  // Tick
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimerLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Persist live state on meaningful changes
  useEffect(() => {
    setLive({
      activeRoundId: activeRoundId,
      activeQuestionIndex: qIndex,
      answerRevealed,
      timerRunning: running,
      timerRemaining: timerLeft,
    });
    // eslint-disable-next-line
  }, [activeRoundId, qIndex, answerRevealed, running, timerLeft]);

  // --- Controls ---

  const startTimer = () => setRunning(true);
  const pauseTimer = () => setRunning(false);
  const resetTimer = () => {
    setRunning(false);
    setTimerLeft(activeRound?.timerSeconds || 30);
  };

  const goToQuestion = useCallback(
    (idx) => {
      setRunning(false);
      setAnswerRevealed(false);
      setTimerLeft(activeRound?.timerSeconds || 30);
      setLive({ activeQuestionIndex: idx, answerRevealed: false });
    },
    [activeRound, setLive]
  );

  const prevQuestion = () => {
    if (qIndex > 0) goToQuestion(qIndex - 1);
  };
  const nextQuestion = () => {
    if (activeRound && qIndex < activeRound.questions.length - 1) goToQuestion(qIndex + 1);
  };

  const changeRound = (roundId) => {
    setRunning(false);
    setAnswerRevealed(false);
    const r = rounds.find((x) => x.id === roundId);
    setTimerLeft(r?.timerSeconds || 30);
    setLive({
      activeRoundId: roundId,
      activeQuestionIndex: 0,
      answerRevealed: false,
    });
  };

  const toggleAnswer = () => setAnswerRevealed((v) => !v);

  // Timer display helpers
  const timerDisplay = timerLeft != null ? timerLeft : (activeRound?.timerSeconds || 0);
  const mins = String(Math.floor(timerDisplay / 60)).padStart(2, '0');
  const secs = String(timerDisplay % 60).padStart(2, '0');
  const timerPct = activeRound
    ? (timerDisplay / activeRound.timerSeconds) * 100
    : 100;
  const timerDanger = timerPct <= 20;
  const timerWarn = timerPct <= 40 && !timerDanger;

  return (
    <div className="live-display" id="live-display">
      {/* Top bar */}
      <div className="live-topbar">
        <div className="live-round-selector">
          {rounds.map((r, i) => (
            <button
              key={r.id}
              className={`round-tab ${r.id === activeRoundId ? 'active' : ''}`}
              onClick={() => changeRound(r.id)}
            >
              R{i + 1}
            </button>
          ))}
        </div>
        <h2 className="live-round-name">{activeRound?.name}</h2>
      </div>

      {/* Main area */}
      <div className="live-main">
        {/* Question area */}
        <div className="live-question-area">
          {activeQ ? (
            <>
              <span className="live-q-badge">
                Question {qIndex + 1} of {activeRound.questions.length}
              </span>
              <h1 className="live-q-text" id="live-question-text">
                {activeQ.question}
              </h1>
              <div className={`live-answer-area ${answerRevealed ? 'revealed' : ''}`}>
                {answerRevealed ? (
                  <div className="live-answer" id="live-answer">
                    <span className="answer-label">Answer</span>
                    <p>{activeQ.answer || '—'}</p>
                  </div>
                ) : (
                  <p className="answer-hidden">Answer hidden</p>
                )}
              </div>
            </>
          ) : (
            <div className="live-empty">
              <p>No questions in this round yet.</p>
              <p className="hint">Add questions from the Rounds &amp; Questions page.</p>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className={`live-timer ${timerDanger ? 'danger' : timerWarn ? 'warn' : ''}`} id="live-timer">
          <svg className="timer-ring" viewBox="0 0 120 120">
            <circle className="timer-track" cx="60" cy="60" r="54" />
            <circle
              className="timer-fill"
              cx="60"
              cy="60"
              r="54"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - timerPct / 100)}`}
            />
          </svg>
          <span className="timer-digits">
            {mins}:{secs}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="live-controls" id="live-controls">
        <div className="control-group">
          <button className="btn live-btn" onClick={prevQuestion} disabled={qIndex === 0}>
            ◀ Prev
          </button>
          <button className="btn live-btn" onClick={nextQuestion} disabled={!activeRound || qIndex >= activeRound.questions.length - 1}>
            Next ▶
          </button>
        </div>

        <div className="control-group timer-controls">
          {!running ? (
            <button className="btn live-btn success" onClick={startTimer}>
              ▶ Start
            </button>
          ) : (
            <button className="btn live-btn warn" onClick={pauseTimer}>
              ⏸ Pause
            </button>
          )}
          <button className="btn live-btn" onClick={resetTimer}>
            ↺ Reset
          </button>
        </div>

        <div className="control-group">
          <button
            className={`btn live-btn ${answerRevealed ? 'danger' : 'primary'}`}
            onClick={toggleAnswer}
            id="toggle-answer-btn"
          >
            {answerRevealed ? '🙈 Hide Answer' : '👁️ Reveal Answer'}
          </button>
        </div>
      </div>

      {/* Standings strip */}
      <div className="live-standings" id="live-standings">
        {leaderboard.slice(0, 10).map((t, i) => (
          <div className={`standing-chip ${i < 3 ? `top-${i + 1}` : ''}`} key={t.id}>
            <span className="chip-rank">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </span>
            <span className="chip-name">{t.name}</span>
            <span className="chip-score">{t.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
