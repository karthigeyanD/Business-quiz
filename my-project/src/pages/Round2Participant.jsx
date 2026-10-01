/**
 * Round2Participant — Participant interface for Round 2:
 * "Identify the Logos & Rearrange the Business Tagline"
 *
 * Features:
 *   - Team selection
 *   - Logo MCQ display with 4 images
 *   - Tagline word rearrangement (drag-and-drop + tap-to-select)
 *   - Timer (if enabled)
 *   - Submission with duplicate prevention
 *   - localStorage persistence for reload recovery
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ROUND2_META } from '../data/round2Data';
import {
  getRound2State,
  getSetImages,
  submitLogoAnswer,
  submitTaglineAnswer,
  getSubmission,
} from '../data/round2Storage';
import { getTeams } from '../data/storage';

const SESSION_KEY = 'bq_r2_participant';

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

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Round2Participant() {
  const [phase, setPhase] = useState('select'); // select | quiz | submitted
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [r2State, setR2State] = useState(() => getRound2State());
  const [teams, setTeamsList] = useState(() => getTeams());
  const [images, setImages] = useState([null, null, null, null]);
  const [logoAnswer, setLogoAnswer] = useState(null);
  const [taglineWords, setTaglineWords] = useState([]);
  const [arrangedWords, setArrangedWords] = useState([]);
  const [logoSubmitted, setLogoSubmitted] = useState(false);
  const [taglineSubmitted, setTaglineSubmitted] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(null);
  const [error, setError] = useState('');
  const [submissionMsg, setSubmissionMsg] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  const timerRef = useRef(null);

  // Restore session on mount
  useEffect(() => {
    const session = loadSession();
    if (session?.teamId) {
      setSelectedTeamId(session.teamId);
      const r2 = getRound2State();
      setR2State(r2);
      if (session.logoAnswer) setLogoAnswer(session.logoAnswer);
      if (session.arrangedWords?.length > 0) setArrangedWords(session.arrangedWords);
      if (session.logoSubmitted) setLogoSubmitted(true);
      if (session.taglineSubmitted) setTaglineSubmitted(true);

      // Check existing submissions
      const sub = getSubmission(session.teamId);
      if (sub?.logoSubmittedAt && sub?.taglineSubmittedAt && !r2.allowRetries) {
        setPhase('submitted');
      } else if (r2.status === 'active' || r2.status === 'paused') {
        setPhase('quiz');
      }
    }
  }, []);

  // Refresh state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setR2State(getRound2State());
      setTeamsList(getTeams());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Get current question set
  const assignedSetId = r2State.teamAssignments[selectedTeamId];
  const questionSet = assignedSetId ? r2State.questionSets[assignedSetId] : null;

  // Load images when question set is available
  useEffect(() => {
    if (assignedSetId) {
      getSetImages(assignedSetId).then((imgs) => setImages(imgs));
    }
  }, [assignedSetId]);

  // Initialize tagline words (shuffled) when entering quiz
  useEffect(() => {
    if (questionSet && taglineWords.length === 0) {
      const session = loadSession();
      if (session?.taglineWords?.length > 0) {
        setTaglineWords(session.taglineWords);
        if (!session.arrangedWords?.length) {
          setArrangedWords([]);
        }
      } else {
        const shuffled = shuffleArray(
          questionSet.taglineQuestion.words.map((w, i) => ({ word: w, id: `w-${i}` }))
        );
        setTaglineWords(shuffled);
        setArrangedWords([]);
      }
    }
  }, [questionSet, taglineWords.length]);

  // Persist session
  useEffect(() => {
    if (selectedTeamId) {
      saveSession({
        teamId: selectedTeamId,
        logoAnswer,
        taglineWords,
        arrangedWords,
        logoSubmitted,
        taglineSubmitted,
      });
    }
  }, [selectedTeamId, logoAnswer, taglineWords, arrangedWords, logoSubmitted, taglineSubmitted]);

  // Timer
  useEffect(() => {
    if (
      phase === 'quiz' &&
      r2State.timerEnabled &&
      r2State.status === 'active' &&
      !logoSubmitted &&
      !taglineSubmitted
    ) {
      const remaining = r2State.timerSeconds;
      setTimerRemaining(remaining);

      timerRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [phase, r2State.timerEnabled, r2State.status, r2State.timerSeconds, logoSubmitted, taglineSubmitted]);

  // ── Team selection ─────────────────────────────────────────────────────────
  const handleJoin = useCallback(() => {
    if (!selectedTeamId) {
      setError('Please select your team');
      return;
    }
    const r2 = getRound2State();
    setR2State(r2);

    if (r2.status !== 'active') {
      setError('Round 2 is not currently active. Please wait for the host.');
      return;
    }

    const setId = r2.teamAssignments[selectedTeamId];
    if (!setId) {
      setError('Your team has no question set assigned. Contact the host.');
      return;
    }

    const qs = r2.questionSets[setId];
    if (!qs?.published) {
      setError('Your question set is not yet published. Contact the host.');
      return;
    }

    // Check if already fully submitted
    const sub = getSubmission(selectedTeamId);
    if (sub?.logoSubmittedAt && sub?.taglineSubmittedAt && !r2.allowRetries) {
      setPhase('submitted');
      return;
    }
    if (sub?.logoSubmittedAt) {
      setLogoSubmitted(true);
      setLogoAnswer(sub.logoAnswer);
    }
    if (sub?.taglineSubmittedAt) {
      setTaglineSubmitted(true);
    }

    setError('');
    setPhase('quiz');
  }, [selectedTeamId]);

  // ── Submit logo answer ─────────────────────────────────────────────────────
  const handleSubmitLogo = useCallback(() => {
    if (!logoAnswer) {
      setSubmissionMsg('Please select an answer');
      return;
    }
    const result = submitLogoAnswer(selectedTeamId, logoAnswer);
    if (!result.ok) {
      setSubmissionMsg(result.error);
      return;
    }
    setLogoSubmitted(true);
    setSubmissionMsg('Logo answer submitted!');
    setR2State(getRound2State());
  }, [selectedTeamId, logoAnswer]);

  // ── Submit tagline answer ──────────────────────────────────────────────────
  const handleSubmitTagline = useCallback(() => {
    if (arrangedWords.length === 0) {
      setSubmissionMsg('Please arrange the words first');
      return;
    }
    if (arrangedWords.length !== taglineWords.length) {
      setSubmissionMsg('Please use all words');
      return;
    }
    const result = submitTaglineAnswer(
      selectedTeamId,
      arrangedWords.map((w) => w.word)
    );
    if (!result.ok) {
      setSubmissionMsg(result.error);
      return;
    }
    setTaglineSubmitted(true);
    setSubmissionMsg('Tagline answer submitted!');
    setR2State(getRound2State());

    if (logoSubmitted) {
      setPhase('submitted');
    }
  }, [selectedTeamId, arrangedWords, taglineWords, logoSubmitted]);

  // ── Tagline word interaction ───────────────────────────────────────────────
  const handleWordTap = useCallback(
    (wordObj) => {
      if (taglineSubmitted && !r2State.allowRetries) return;
      // Move from available to arranged
      setArrangedWords((prev) => [...prev, wordObj]);
      setTaglineWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    },
    [taglineSubmitted, r2State.allowRetries]
  );

  const handleRemoveArranged = useCallback(
    (wordObj) => {
      if (taglineSubmitted && !r2State.allowRetries) return;
      setArrangedWords((prev) => prev.filter((w) => w.id !== wordObj.id));
      setTaglineWords((prev) => [...prev, wordObj]);
    },
    [taglineSubmitted, r2State.allowRetries]
  );

  const handleResetTagline = useCallback(() => {
    if (questionSet) {
      const shuffled = shuffleArray(
        questionSet.taglineQuestion.words.map((w, i) => ({
          word: w,
          id: `w-${i}`,
        }))
      );
      setTaglineWords(shuffled);
      setArrangedWords([]);
    }
  }, [questionSet]);

  // ── Drag-and-drop for reordering arranged words ────────────────────────────
  const handleDragStart = useCallback((e, idx) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDropReorder = useCallback(
    (e, targetIdx) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === targetIdx) return;
      setArrangedWords((prev) => {
        const arr = [...prev];
        const [moved] = arr.splice(dragIndex, 1);
        arr.splice(targetIdx, 0, moved);
        return arr;
      });
      setDragIndex(null);
    },
    [dragIndex]
  );

  // ── Get team and submission data ───────────────────────────────────────────
  const currentTeam = teams.find((t) => t.id === selectedTeamId);
  const submission = r2State.submissions[selectedTeamId];

  // ── Assigned teams list for selection ───────────────────────────────────────
  const assignedTeams = useMemo(() => {
    return teams.filter((t) => r2State.teamAssignments[t.id]);
  }, [teams, r2State.teamAssignments]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  // ── Select Team ────────────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="r2-participant-page">
        <div className="r2-participant-container">
          <div className="r2-login-card">
            <div className="r2-login-header">
              <span className="r2-login-icon">🖼️</span>
              <h1>{ROUND2_META.shortTitle}</h1>
              <p>{ROUND2_META.title}</p>
            </div>

            <div className="r2-login-form">
              <label htmlFor="r2-team-select">Select Your Team</label>
              <select
                id="r2-team-select"
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  setError('');
                }}
              >
                <option value="">— Choose team —</option>
                {assignedTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {error && <div className="r2-error-msg">{error}</div>}

              <button className="btn primary r2-join-btn" onClick={handleJoin}>
                Enter Round 2
              </button>
            </div>

            {r2State.status !== 'active' && (
              <div className="r2-wait-notice">
                ⏳ Round 2 is not active yet. Please wait for the host to start.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Submitted ──────────────────────────────────────────────────────────────
  if (phase === 'submitted') {
    return (
      <div className="r2-participant-page">
        <div className="r2-participant-container">
          <div className="r2-submitted-card">
            <div className="r2-submitted-icon">✅</div>
            <h2>Answers Submitted!</h2>
            <p className="r2-team-label">{currentTeam?.name}</p>
            <p className="text-muted">
              Your answers have been recorded. Wait for the host to reveal
              results.
            </p>

            {r2State.answersRevealed && submission && (
              <div className="r2-results-reveal">
                <h3>Results</h3>
                <div className="r2-result-row">
                  <span>Logo Question:</span>
                  <span
                    className={`r2-result-badge ${
                      submission.logoScore > 0 ? 'correct' : 'incorrect'
                    }`}
                  >
                    {submission.logoScore > 0 ? '✅ Correct' : '❌ Incorrect'}
                  </span>
                </div>
                <div className="r2-result-row">
                  <span>Tagline Question:</span>
                  <span
                    className={`r2-result-badge ${
                      submission.taglineScore > 0 ? 'correct' : 'incorrect'
                    }`}
                  >
                    {submission.taglineScore > 0 ? '✅ Correct' : '❌ Incorrect'}
                  </span>
                </div>
                <div className="r2-result-total">
                  Total: {submission.totalScore || 0} / {r2State.marksPerLogo + r2State.marksPerTagline}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  if (!questionSet) {
    return (
      <div className="r2-participant-page">
        <div className="r2-participant-container">
          <div className="r2-login-card">
            <p className="text-muted">Question set not found. Please contact the host.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="r2-participant-page">
      <div className="r2-participant-container">
        {/* Header */}
        <div className="r2-quiz-header">
          <div className="r2-quiz-header-left">
            <h2>{ROUND2_META.shortTitle}</h2>
            <span className="r2-team-label">{currentTeam?.name}</span>
          </div>
          {r2State.timerEnabled && timerRemaining != null && (
            <div
              className={`r2-timer ${timerRemaining <= 30 ? 'r2-timer-urgent' : ''}`}
            >
              ⏱ {formatTime(timerRemaining)}
            </div>
          )}
        </div>

        {submissionMsg && (
          <div className="r2-submission-msg">{submissionMsg}</div>
        )}

        {/* ── Question 1: Logo Identification ──────────────────────────── */}
        <div className={`card r2-question-card ${logoSubmitted ? 'r2-submitted-q' : ''}`}>
          <h3>Question 1: Identify the Logos</h3>
          <p className="text-muted">
            Look at the four logos below and choose the correct identification.
          </p>

          {/* Logo Grid */}
          <div className="r2-logo-grid">
            {[0, 1, 2, 3].map((i) => (
              <div className="r2-logo-display" key={i}>
                <div className="r2-logo-number">Logo {i + 1}</div>
                {images[i] ? (
                  <img
                    src={images[i].data}
                    alt={`Logo ${i + 1}`}
                    className="r2-logo-img"
                  />
                ) : (
                  <div className="r2-logo-placeholder">
                    <span>🖼️</span>
                    <small>Image not uploaded</small>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* MCQ Options */}
          <div className="r2-mcq-options">
            {questionSet.logoQuestion.options.map((opt, oi) => {
              const letter = opt.charAt(0);
              const isSelected = logoAnswer === letter;
              return (
                <button
                  key={oi}
                  className={`r2-mcq-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (!logoSubmitted || r2State.allowRetries) {
                      setLogoAnswer(letter);
                      setSubmissionMsg('');
                    }
                  }}
                  disabled={logoSubmitted && !r2State.allowRetries}
                >
                  <span className="r2-mcq-letter">{letter}</span>
                  <span className="r2-mcq-text">{opt.substring(3)}</span>
                </button>
              );
            })}
          </div>

          {(!logoSubmitted || r2State.allowRetries) && (
            <button
              className="btn primary r2-submit-btn"
              onClick={handleSubmitLogo}
              disabled={!logoAnswer}
            >
              Submit Logo Answer
            </button>
          )}

          {logoSubmitted && (
            <div className="r2-submitted-notice">
              ✅ Logo answer submitted
            </div>
          )}
        </div>

        {/* ── Question 2: Tagline Rearrangement ────────────────────────── */}
        <div className={`card r2-question-card ${taglineSubmitted ? 'r2-submitted-q' : ''}`}>
          <h3>Question 2: Rearrange the Business Tagline</h3>
          <p className="text-muted">
            Tap the words in the correct order to form the business tagline, or
            drag to rearrange.
          </p>

          {/* Arranged words area */}
          <div className="r2-arranged-area">
            <div className="r2-arranged-label">Your tagline:</div>
            <div className="r2-arranged-words">
              {arrangedWords.length === 0 ? (
                <span className="r2-arranged-placeholder">
                  Tap words below to build the tagline…
                </span>
              ) : (
                arrangedWords.map((w, i) => (
                  <span
                    key={w.id}
                    className="r2-word-tile arranged"
                    draggable={!taglineSubmitted || r2State.allowRetries}
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropReorder(e, i)}
                    onClick={() => handleRemoveArranged(w)}
                    title="Click to remove"
                  >
                    {w.word}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Available words */}
          <div className="r2-available-area">
            <div className="r2-available-label">Available words:</div>
            <div className="r2-available-words">
              {taglineWords.map((w) => (
                <button
                  key={w.id}
                  className="r2-word-tile available"
                  onClick={() => handleWordTap(w)}
                  disabled={taglineSubmitted && !r2State.allowRetries}
                >
                  {w.word}
                </button>
              ))}
              {taglineWords.length === 0 && arrangedWords.length > 0 && (
                <span className="text-muted">All words used ✓</span>
              )}
            </div>
          </div>

          <div className="r2-tagline-actions">
            {(!taglineSubmitted || r2State.allowRetries) && (
              <>
                <button
                  className="btn ghost small"
                  onClick={handleResetTagline}
                >
                  🔄 Reset
                </button>
                <button
                  className="btn primary r2-submit-btn"
                  onClick={handleSubmitTagline}
                  disabled={arrangedWords.length === 0}
                >
                  Submit Tagline
                </button>
              </>
            )}
          </div>

          {taglineSubmitted && (
            <div className="r2-submitted-notice">
              ✅ Tagline answer submitted
            </div>
          )}
        </div>

        {/* Both submitted → go to results */}
        {logoSubmitted && taglineSubmitted && (
          <div className="r2-all-done">
            <button
              className="btn primary"
              onClick={() => setPhase('submitted')}
            >
              View Submission Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
