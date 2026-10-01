/**
 * Round4Admin — Dedicated Host / Admin Control Panel for Round 4:
 * "Personality Identification"
 *
 * Features:
 *   1. Questions & Image Uploads — Dedicated slots for all 6 questions with drag-and-drop,
 *      preview, replace, remove, puzzle mode options (tiles vs full), and answer key editing.
 *   2. Round Controls — Start/pause/resume/reset round, question sequence selector (Q1–Q6),
 *      timer settings, answer reveal toggle.
 *   3. Submissions & Scoring — Real-time submission monitoring, auto-evaluation with alias matching,
 *      manual correct/incorrect override, audit trail, and "Sync Round 4 Scores to Leaderboard" button.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { ROUND4_META, ROUND4_QUESTIONS } from '../data/round4Data';
import {
  getRound4State,
  saveRound4State,
  setRound4Status,
  updateRound4Config,
  setActiveQuestion,
  updateQuestionConfig,
  setAnswersRevealed,
  overrideScore,
  markAnswer,
  resetRound4,
  saveQuestionImage,
  getQuestionImage,
  deleteQuestionImage,
  getAllQuestionImages,
  getTeamTotalScore,
} from '../data/round4Storage';
import ImageSlot from '../components/ImageSlot';
import PuzzleImageDisplay from '../components/PuzzleImageDisplay';

const TABS = [
  { id: 'questions', label: 'Questions & Image Uploads', icon: '🖼️' },
  { id: 'controls', label: 'Round Controls & Sequence', icon: '🎛️' },
  { id: 'submissions', label: 'Submissions & Scoring', icon: '📊' },
];

export default function Round4Admin() {
  const { teams, setScoreDirect, refreshScores, refreshAudit } = useQuiz();

  const [r4, setR4] = useState(() => getRound4State());
  const [activeTab, setActiveTab] = useState('questions');
  const [imageCache, setImageCache] = useState({}); // { 'q-1': {data, label, uploadedAt} }
  const [expandedQ, setExpandedQ] = useState(1);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [filterQuestion, setFilterQuestion] = useState('all'); // 'all' | 1 | 2 | 3 | 4 | 5 | 6

  // Refresh local state from storage
  const refresh = useCallback(() => {
    setR4(getRound4State());
  }, []);

  // Load all images from IndexedDB
  const loadImages = useCallback(async () => {
    try {
      const all = await getAllQuestionImages();
      setImageCache(all || {});
    } catch (e) {
      console.error('Failed to load Round 4 images:', e);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // ── Image Handlers ──────────────────────────────────────────────────────────
  const handleImageUpload = useCallback(
    async (qId, dataUrl) => {
      await saveQuestionImage(qId, dataUrl, `Question ${qId}`);
      setImageCache((prev) => ({
        ...prev,
        [`q-${qId}`]: { data: dataUrl, label: `Question ${qId}`, uploadedAt: new Date().toISOString() },
      }));
    },
    []
  );

  const handleImageRemove = useCallback(async (qId) => {
    await deleteQuestionImage(qId);
    setImageCache((prev) => ({ ...prev, [`q-${qId}`]: null }));
  }, []);

  // ── Question Config Handlers ────────────────────────────────────────────────
  const handleUpdateQuestion = useCallback(
    (qId, patch) => {
      updateQuestionConfig(qId, patch);
      refresh();
    },
    [refresh]
  );

  // ── Round Controls ──────────────────────────────────────────────────────────
  const handleStatusChange = useCallback(
    (status) => {
      setRound4Status(status);
      refresh();
    },
    [refresh]
  );

  const handleSelectQuestion = useCallback(
    (qId) => {
      setActiveQuestion(qId);
      refresh();
    },
    [refresh]
  );

  const handleConfigChange = useCallback(
    (patch) => {
      updateRound4Config(patch);
      refresh();
    },
    [refresh]
  );

  const handleRevealAnswers = useCallback(
    (revealed) => {
      setAnswersRevealed(revealed);
      refresh();
    },
    [refresh]
  );

  // ── Scoring & Sync ──────────────────────────────────────────────────────────
  const handleMarkAnswer = useCallback(
    (teamId, qId, isCorrect) => {
      markAnswer(teamId, qId, isCorrect);
      refresh();
    },
    [refresh]
  );

  const handleOverrideScore = useCallback(
    (teamId, qId, score) => {
      overrideScore(teamId, qId, score, 'Manual override by host');
      refresh();
    },
    [refresh]
  );

  const handleSyncScoresToMain = useCallback(() => {
    teams.forEach((team) => {
      const total = getTeamTotalScore(team.id);
      setScoreDirect(team.id, 'round-4', total);
    });
    refreshScores();
    refreshAudit();
    alert('✅ Round 4 scores successfully synced to the overall competition leaderboard!');
  }, [teams, setScoreDirect, refreshScores, refreshAudit]);

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    resetRound4();
    teams.forEach((team) => {
      setScoreDirect(team.id, 'round-4', 0);
    });
    refreshScores();
    refreshAudit();
    refresh();
    setShowResetConfirm(false);
  }, [teams, setScoreDirect, refreshScores, refreshAudit, refresh]);

  // Count uploaded images
  const uploadedCount = useMemo(() => {
    let count = 0;
    for (let i = 1; i <= 6; i++) {
      if (imageCache[`q-${i}`]?.data) count++;
    }
    return count;
  }, [imageCache]);

  return (
    <div className="page r4-admin-page">
      <header className="page-header flex-between">
        <div>
          <h1>Round 4 — Host Control Panel</h1>
          <p className="subtitle">Personality Identification · Image Clues & Answer Verification</p>
        </div>
        <div className="r4-header-actions">
          <button className="btn primary" onClick={handleSyncScoresToMain}>
            🏆 Sync Round 4 Scores to Leaderboard
          </button>
        </div>
      </header>

      {/* Upload Readiness Banner */}
      <div className={`card r4-status-banner ${uploadedCount === 6 ? 'ready' : 'warning'}`}>
        <div className="r4-banner-content">
          <span className="r4-banner-icon">{uploadedCount === 6 ? '✅' : '⚠️'}</span>
          <div>
            <strong>Image Upload Status: {uploadedCount} of 6 clue images uploaded</strong>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              {uploadedCount === 6
                ? 'All clue images are uploaded and persistent. Ready to start Round 4!'
                : 'Upload images for all 6 questions before starting the round.'}
            </p>
          </div>
        </div>
        <div className="r4-banner-controls">
          <span className={`round-status-badge ${r4.status}`}>
            Status: {r4.status.toUpperCase()}
          </span>
          {r4.answersRevealed && <span className="tag success">👁️ Answers Revealed</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="round-tabs" style={{ marginBottom: '1.5rem' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`round-tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="round-tab-num">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: QUESTIONS & IMAGE UPLOADS */}
      {activeTab === 'questions' && (
        <div className="r4-questions-container">
          <div className="card">
            <h3>🖼️ Round 4 Questions & Clue Image Uploads</h3>
            <p className="text-muted">
              Upload the specific clue image for each personality. For puzzle questions (Questions 2, 4, and 6), you can toggle between displaying 4 puzzle tiles or the complete image.
            </p>

            <div className="r4-question-accordion">
              {ROUND4_QUESTIONS.map((qDef) => {
                const qId = qDef.id;
                const qCfg = r4.questions[qId] || {};
                const imgObj = imageCache[`q-${qId}`];
                const hasImage = Boolean(imgObj?.data);

                return (
                  <details
                    key={qId}
                    className={`card r4-q-card ${hasImage ? 'has-img' : 'missing-img'}`}
                    open={expandedQ === qId}
                    onToggle={(e) => { if (e.target.open) setExpandedQ(qId); }}
                  >
                    <summary className="r4-q-summary">
                      <div className="r4-q-title">
                        <span className="r4-q-num">Q{qId}</span>
                        <strong>{qCfg.personality || qDef.personality}</strong>
                        <span className="r4-clue-badge">{qCfg.clueType || qDef.clueType}</span>
                      </div>
                      <div className="r4-q-summary-meta">
                        {hasImage ? (
                          <span className="tag success">✓ Image Uploaded</span>
                        ) : (
                          <span className="tag danger">⚠️ Image Required</span>
                        )}
                        {qCfg.isPuzzle && (
                          <span className="tag info">
                            🧩 Puzzle Mode: {qCfg.puzzleMode === 'tiles' ? '4 Tiles' : 'Full Image'}
                          </span>
                        )}
                      </div>
                    </summary>

                    <div className="r4-q-details-grid">
                      {/* Image Upload Slot */}
                      <div className="r4-q-upload-col">
                        <label className="input-label">Clue Image Upload Slot (Q{qId}):</label>
                        <ImageSlot
                          image={imgObj}
                          slotIndex={qId - 1}
                          onUpload={(dataUrl) => handleImageUpload(qId, dataUrl)}
                          onRemove={() => handleImageRemove(qId)}
                          onLabelChange={() => {}}
                          disabled={false}
                        />

                        {qCfg.isPuzzle && (
                          <div className="r4-puzzle-mode-select" style={{ marginTop: '1rem' }}>
                            <label className="input-label">Participant Display Mode for Puzzle:</label>
                            <div className="radio-group flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`puzzleMode-${qId}`}
                                  checked={qCfg.puzzleMode === 'tiles'}
                                  onChange={() => handleUpdateQuestion(qId, { puzzleMode: 'tiles' })}
                                />
                                🧩 4 Interactive Puzzle Tiles
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`puzzleMode-${qId}`}
                                  checked={qCfg.puzzleMode === 'full'}
                                  onChange={() => handleUpdateQuestion(qId, { puzzleMode: 'full' })}
                                />
                                🖼️ Complete Image View
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Preview / Details Editing */}
                      <div className="r4-q-config-col">
                        <h4>Preview & Configuration</h4>

                        <div className="r4-preview-box card ghost">
                          <PuzzleImageDisplay
                            src={imgObj?.data}
                            alt={qCfg.personality}
                            isPuzzle={qCfg.isPuzzle}
                            puzzleMode={qCfg.puzzleMode}
                          />
                        </div>

                        <div className="r4-q-inputs" style={{ marginTop: '1rem' }}>
                          <div className="form-group">
                            <label className="input-label">Personality Answer Key:</label>
                            <input
                              type="text"
                              className="input"
                              value={qCfg.personality || ''}
                              onChange={(e) => handleUpdateQuestion(qId, { personality: e.target.value })}
                            />
                          </div>

                          <div className="form-group">
                            <label className="input-label">
                              Acceptable Aliases / Spellings (comma-separated):
                            </label>
                            <input
                              type="text"
                              className="input"
                              value={qCfg.aliases ? qCfg.aliases.join(', ') : ''}
                              onChange={(e) =>
                                handleUpdateQuestion(qId, {
                                  aliases: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                                })
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label className="input-label">Reveal Description (PowerPoint Source Text):</label>
                            <textarea
                              className="input"
                              rows={3}
                              value={qCfg.description || ''}
                              onChange={(e) => handleUpdateQuestion(qId, { description: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROUND CONTROLS & SEQUENCE */}
      {activeTab === 'controls' && (
        <div className="r4-controls-container">
          <div className="grid grid-2 gap-4">
            {/* Round Status & Timer Settings */}
            <div className="card">
              <h3>🎛️ Round Lifecycle & Settings</h3>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="input-label">Round Status:</label>
                <div className="button-group flex gap-2">
                  <button
                    className={`btn ${r4.status === 'active' ? 'success' : 'ghost'}`}
                    onClick={() => handleStatusChange('active')}
                  >
                    ▶️ Start / Resume Round
                  </button>
                  <button
                    className={`btn ${r4.status === 'paused' ? 'warn' : 'ghost'}`}
                    onClick={() => handleStatusChange('paused')}
                  >
                    ⏸️ Pause Round
                  </button>
                  <button
                    className={`btn ${r4.status === 'completed' ? 'primary' : 'ghost'}`}
                    onClick={() => handleStatusChange('completed')}
                  >
                    🏁 Complete Round
                  </button>
                </div>
              </div>

              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />

              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={r4.timerEnabled}
                    onChange={(e) => handleConfigChange({ timerEnabled: e.target.checked })}
                  />
                  ⏱️ Enable Countdown Timer per Question
                </label>
              </div>

              {r4.timerEnabled && (
                <div className="form-group">
                  <label className="input-label">Timer Duration per Question (seconds):</label>
                  <input
                    type="number"
                    className="input-sm"
                    min={10}
                    max={300}
                    value={r4.timerSeconds}
                    onChange={(e) => handleConfigChange({ timerSeconds: Number(e.target.value) || 60 })}
                  />
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={r4.allowRetries}
                    onChange={(e) => handleConfigChange({ allowRetries: e.target.checked })}
                  />
                  🔄 Allow Teams to Resubmit Answer before Reveal
                </label>
              </div>

              <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />

              <button className="btn danger small" onClick={() => setShowResetConfirm(true)}>
                ↺ Reset Round 4 State
              </button>
            </div>

            {/* Question Sequence & Live Reveal Controller */}
            <div className="card">
              <h3>🎯 Question Sequence & Reveal Control</h3>
              <p className="text-muted">
                Select which question participants currently see and toggle answer reveal.
              </p>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="input-label">Current Active Question:</label>
                <div className="q-sequence-buttons flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((qId) => (
                    <button
                      key={qId}
                      className={`btn ${r4.currentQuestionId === qId ? 'primary' : 'ghost'}`}
                      onClick={() => handleSelectQuestion(qId)}
                    >
                      Q{qId}: {r4.questions[qId]?.personality}
                    </button>
                  ))}
                </div>
              </div>

              <div className="q-active-card card ghost" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <h2>Question {r4.currentQuestionId} of 6</h2>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  Personality: {r4.questions[r4.currentQuestionId]?.personality}
                </p>
                <p className="text-muted">
                  Clue Type: {r4.questions[r4.currentQuestionId]?.clueType}
                </p>

                <div className="flex justify-center gap-4" style={{ marginTop: '1.5rem' }}>
                  <button
                    className={`btn ${r4.answersRevealed ? 'warn' : 'success'} lg`}
                    onClick={() => handleRevealAnswers(!r4.answersRevealed)}
                  >
                    {r4.answersRevealed ? '🙈 Hide Answer' : '👁️ Reveal Correct Answer to Teams'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between" style={{ marginTop: '1.5rem' }}>
                <button
                  className="btn ghost"
                  disabled={r4.currentQuestionId <= 1}
                  onClick={() => handleSelectQuestion(r4.currentQuestionId - 1)}
                >
                  ⬅️ Previous Question
                </button>
                <button
                  className="btn ghost"
                  disabled={r4.currentQuestionId >= 6}
                  onClick={() => handleSelectQuestion(r4.currentQuestionId + 1)}
                >
                  Next Question ➡️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUBMISSIONS & SCORING */}
      {activeTab === 'submissions' && (
        <div className="r4-submissions-container">
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div>
                <h3>📊 Submissions & Score Evaluation</h3>
                <p className="text-muted">
                  Review team answers, verify auto-evaluation, and override scores if necessary.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="input-label" style={{ margin: 0 }}>Filter Question:</label>
                <select
                  className="input-sm"
                  value={filterQuestion}
                  onChange={(e) => setFilterQuestion(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                >
                  <option value="all">All Questions (Q1–Q6)</option>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>Q{num}: {r4.questions[num]?.personality}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-wrap">
              <table className="score-entry-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Team Name</th>
                    <th>Question</th>
                    <th>Submitted Answer</th>
                    <th>Correct Personality</th>
                    <th>Evaluation</th>
                    <th>Awarded Mark</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, idx) => {
                    const teamSubs = r4.submissions[team.id] || {};
                    const questionsToDisplay = filterQuestion === 'all' ? [1, 2, 3, 4, 5, 6] : [filterQuestion];

                    return questionsToDisplay.map((qId) => {
                      const sub = teamSubs[qId];
                      const qCfg = r4.questions[qId];
                      const isSubmitted = Boolean(sub?.submittedAt);

                      return (
                        <tr key={`${team.id}-q${qId}`}>
                          <td>{idx + 1}</td>
                          <td className="team-name-cell">{team.name}</td>
                          <td><strong>Q{qId}</strong></td>
                          <td>
                            {isSubmitted ? (
                              <span className="user-answer-text">"{sub.answer}"</span>
                            ) : (
                              <span className="text-muted">Not submitted</span>
                            )}
                          </td>
                          <td>{qCfg?.personality}</td>
                          <td>
                            {isSubmitted ? (
                              sub.isCorrect ? (
                                <span className="qual-badge qual-qualified">✅ Correct</span>
                              ) : (
                                <span className="qual-badge qual-eliminated">❌ Incorrect</span>
                              )
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="num">
                            <strong>{sub?.score ?? 0}</strong> / {qCfg?.marks || 1}
                          </td>
                          <td>
                            <div className="scoring-btn-group flex gap-1">
                              <button
                                className="btn small success"
                                title="Mark as Correct (1 mark)"
                                onClick={() => handleMarkAnswer(team.id, qId, true)}
                              >
                                ✓ Correct
                              </button>
                              <button
                                className="btn small danger"
                                title="Mark as Incorrect (0 marks)"
                                onClick={() => handleMarkAnswer(team.id, qId, false)}
                              >
                                ✗ Incorrect
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="btn primary lg" onClick={handleSyncScoresToMain}>
                🏆 Update Leaderboard with Round 4 Scores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Reset Round 4?</h2>
            <p>This will reset all submitted answers, scores, and round settings for Round 4. Uploaded images will be preserved.</p>
            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn danger" onClick={handleReset}>
                Yes, Reset Round 4
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
