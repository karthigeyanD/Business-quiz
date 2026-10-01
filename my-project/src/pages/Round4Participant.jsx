/**
 * Round4Participant — Participant Quiz Interface for Round 4:
 * "Personality Identification"
 *
 * Standalone student view supporting live question updates, puzzle interactive display,
 * submission locking, timer countdown, and host answer reveals.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ROUND4_META } from '../data/round4Data';
import {
  getRound4State,
  getQuestionImage,
  submitAnswer,
  getTeamTotalScore,
} from '../data/round4Storage';
import { getTeams } from '../data/storage';
import PuzzleImageDisplay from '../components/PuzzleImageDisplay';

const SESSION_KEY = 'bq_r4_participant';

function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function saveSession(data) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export default function Round4Participant() {
  const [phase, setPhase] = useState('select'); // 'select' | 'quiz'
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [r4State, setR4State] = useState(() => getRound4State());
  const [teams, setTeamsList] = useState(() => getTeams());
  const [currentImage, setCurrentImage] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionMsg, setSubmissionMsg] = useState('');
  const [timerRemaining, setTimerRemaining] = useState(null);
  const timerRef = useRef(null);

  // Restore session on mount
  useEffect(() => {
    const session = loadSession();
    if (session?.teamId) {
      setSelectedTeamId(session.teamId);
      setPhase('quiz');
    }
  }, []);

  // Poll state changes every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const latestState = getRound4State();
      setR4State(latestState);
      setTeamsList(getTeams());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeQId = r4State.currentQuestionId || 1;
  const currentQConfig = r4State.questions[activeQId] || {};

  // Load current image when question changes
  useEffect(() => {
    if (activeQId) {
      getQuestionImage(activeQId).then((img) => setCurrentImage(img?.data || null));
    }
  }, [activeQId]);

  // Check if current team already submitted for current question
  useEffect(() => {
    if (selectedTeamId && activeQId) {
      const teamSubs = r4State.submissions[selectedTeamId] || {};
      const sub = teamSubs[activeQId];
      if (sub?.submittedAt) {
        setIsSubmitted(true);
        setTextAnswer(sub.answer || '');
      } else {
        setIsSubmitted(false);
        setTextAnswer('');
      }
    }
  }, [selectedTeamId, activeQId, r4State]);

  // Handle team selection
  const handleSelectTeam = (teamId) => {
    if (!teamId) return;
    setSelectedTeamId(teamId);
    saveSession({ teamId });
    setPhase('quiz');
  };

  // Submit answer
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!textAnswer.trim() || !selectedTeamId) return;

    const res = submitAnswer(selectedTeamId, activeQId, textAnswer.trim());
    if (res.ok) {
      setIsSubmitted(true);
      setSubmissionMsg('✅ Answer submitted successfully!');
      setTimeout(() => setSubmissionMsg(''), 4000);
    } else {
      setSubmissionMsg(`⚠️ ${res.error}`);
    }
  };

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const teamTotalScore = selectedTeamId ? getTeamTotalScore(selectedTeamId) : 0;

  if (phase === 'select' || !selectedTeam) {
    return (
      <div className="page standalone-quiz-page flex items-center justify-center min-h-screen">
        <div className="card modal-content modal-md" style={{ width: '100%', maxWidth: 480 }}>
          <div className="text-center" style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '3rem' }}>👤</span>
            <h2>Round 4 — Personality Identification</h2>
            <p className="subtitle">Select your team to enter the quiz screen</p>
          </div>

          <div className="form-group">
            <label className="input-label">Choose Your Team:</label>
            <select
              className="input lg"
              value={selectedTeamId}
              onChange={(e) => handleSelectTeam(e.target.value)}
            >
              <option value="">-- Select Team --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  Team {t.teamNumber}: {t.name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-muted text-center" style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
            Ensure you select your assigned team before answering.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page standalone-quiz-page r4-participant-page">
      {/* Quiz Top Header */}
      <header className="r4-participant-header flex-between">
        <div>
          <span className="r4-round-tag">ROUND 4 · PERSONALITY IDENTIFICATION</span>
          <h1 style={{ margin: 0 }}>Team: {selectedTeam.name}</h1>
        </div>
        <div className="r4-team-score-badge">
          <span>Score: <strong>{teamTotalScore}</strong> / 6</span>
        </div>
      </header>

      {/* Main Quiz Area */}
      <div className="r4-quiz-body" style={{ maxWidth: 840, margin: '2rem auto 0' }}>
        <div className="card r4-quiz-card">
          {/* Question Indicator & Host Status */}
          <div className="flex-between items-center" style={{ marginBottom: '1rem' }}>
            <span className="r4-q-badge lg">
              Question {activeQId} of {ROUND4_META.totalQuestions}
            </span>
            <span className={`round-status-badge ${r4State.status}`}>
              {r4State.status === 'active' ? '🟢 Live Question' : r4State.status === 'paused' ? '⏸️ Paused' : '⏳ Waiting for Host'}
            </span>
          </div>

          {/* Clue Image & Puzzle Display */}
          <div className="r4-image-display-area" style={{ marginBottom: '1.5rem' }}>
            <PuzzleImageDisplay
              src={currentImage}
              alt={`Clue for Question ${activeQId}`}
              isPuzzle={currentQConfig.isPuzzle}
              puzzleMode={currentQConfig.puzzleMode}
            />
          </div>

          {/* Question Prompt */}
          <div className="r4-question-prompt text-center" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--accent)' }}>Who is this?</h2>
            <p className="text-muted">Identify the famous business personality shown in the clue above.</p>
          </div>

          {/* Submission Feedback */}
          {submissionMsg && (
            <div className="alert success-alert" style={{ marginBottom: '1rem', textAlign: 'center' }}>
              {submissionMsg}
            </div>
          )}

          {/* Participant Answer Form */}
          {!r4State.answersRevealed ? (
            <form onSubmit={handleSubmit} className="r4-answer-form">
              <div className="form-group">
                <input
                  type="text"
                  className="input lg text-center"
                  placeholder="Type personality name here…"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  disabled={isSubmitted && !r4State.allowRetries}
                  autoFocus
                />
              </div>

              <div className="flex justify-center" style={{ marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn primary lg"
                  disabled={!textAnswer.trim() || (isSubmitted && !r4State.allowRetries)}
                  style={{ minWidth: 200 }}
                >
                  {isSubmitted ? '✓ Answer Submitted' : 'Submit Answer'}
                </button>
              </div>

              {isSubmitted && (
                <p className="text-center text-muted" style={{ marginTop: '1rem' }}>
                  🔒 Your answer is locked. Waiting for the host to reveal the correct personality!
                </p>
              )}
            </form>
          ) : (
            /* Host Answer Reveal View */
            <div className="r4-reveal-container card ghost text-center" style={{ padding: '2rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🎉</span>
              <h2 style={{ color: 'var(--success)', marginTop: '0.5rem' }}>
                Correct Answer: {currentQConfig.personality}
              </h2>
              {currentQConfig.description && (
                <p className="r4-reveal-desc" style={{ fontSize: '1.1rem', marginTop: '1rem', fontStyle: 'italic' }}>
                  "{currentQConfig.description}"
                </p>
              )}

              <div className="r4-team-result-box" style={{ marginTop: '1.5rem' }}>
                {isSubmitted ? (
                  <p>
                    Your submitted answer was: <strong>"{textAnswer}"</strong>
                  </p>
                ) : (
                  <p className="text-muted">Your team did not submit an answer for this question.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
