/**
 * Round2Admin — Admin dashboard for Round 2:
 * "Identify the Logos & Rearrange the Business Tagline"
 *
 * Tabs:
 *   1. Questions & Images — manage 12 question sets with image upload
 *   2. Team Assignments — assign sets to teams
 *   3. Round Controls — start/pause/end, timer, answer reveal
 *   4. Submissions & Scoring — monitor, auto-score, override
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { ROUND2_META } from '../data/round2Data';
import {
  getRound2State,
  saveRound2State,
  setRound2Status,
  updateRound2Config,
  assignQuestionSet,
  unassignTeam,
  approveAnswer,
  publishQuestionSet,
  unpublishQuestionSet,
  updateLogoQuestion,
  updateTaglineQuestion,
  overrideScore,
  markAnswer,
  setAnswersRevealed,
  resetRound2,
  saveLogoImage,
  getLogoImage,
  deleteLogoImage,
  getSetImages,
  fileToDataURL,
} from '../data/round2Storage';
import ImageSlot from '../components/ImageSlot';

const TABS = [
  { id: 'questions', label: 'Questions & Images', icon: '🖼️' },
  { id: 'assignments', label: 'Team Assignments', icon: '👥' },
  { id: 'controls', label: 'Round Controls', icon: '🎛️' },
  { id: 'submissions', label: 'Submissions & Scoring', icon: '📊' },
];

export default function Round2Admin() {
  const { teams, setScoreDirect, refreshScores, refreshAudit, scores } = useQuiz();

  const [r2, setR2] = useState(() => getRound2State());
  const [activeTab, setActiveTab] = useState('questions');
  const [expandedSet, setExpandedSet] = useState(null);
  const [imageCache, setImageCache] = useState({}); // { 'set-1-logo-0': {data,label,...} }
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingOptions, setEditingOptions] = useState(null); // { setId, options, ... }

  // Refresh local state from storage
  const refresh = useCallback(() => {
    setR2(getRound2State());
  }, []);

  // Load images for an expanded question set
  const loadSetImages = useCallback(async (setId) => {
    const imgs = await getSetImages(setId);
    const patch = {};
    imgs.forEach((img, i) => {
      const key = `set-${setId}-logo-${i}`;
      patch[key] = img;
    });
    setImageCache((prev) => ({ ...prev, ...patch }));
  }, []);

  // When a set is expanded, load its images
  useEffect(() => {
    if (expandedSet !== null) {
      loadSetImages(expandedSet);
    }
  }, [expandedSet, loadSetImages]);

  // ── Image handlers ─────────────────────────────────────────────────────────
  const handleImageUpload = useCallback(
    async (setId, logoIndex, dataUrl) => {
      await saveLogoImage(setId, logoIndex, dataUrl, '');
      const key = `set-${setId}-logo-${logoIndex}`;
      setImageCache((prev) => ({
        ...prev,
        [key]: { data: dataUrl, label: '', uploadedAt: new Date().toISOString() },
      }));
    },
    []
  );

  const handleImageRemove = useCallback(async (setId, logoIndex) => {
    await deleteLogoImage(setId, logoIndex);
    const key = `set-${setId}-logo-${logoIndex}`;
    setImageCache((prev) => ({ ...prev, [key]: null }));
  }, []);

  const handleImageLabel = useCallback(async (setId, logoIndex, label) => {
    const key = `set-${setId}-logo-${logoIndex}`;
    const existing = imageCache[key];
    if (existing) {
      await saveLogoImage(setId, logoIndex, existing.data, label);
      setImageCache((prev) => ({
        ...prev,
        [key]: { ...existing, label },
      }));
    }
  }, [imageCache]);

  // ── Answer key verification ────────────────────────────────────────────────
  const handleApproveAnswer = useCallback(
    (setId, option) => {
      approveAnswer(setId, option);
      refresh();
    },
    [refresh]
  );

  const handlePublish = useCallback(
    (setId) => {
      const result = publishQuestionSet(setId);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      refresh();
    },
    [refresh]
  );

  const handleUnpublish = useCallback(
    (setId) => {
      unpublishQuestionSet(setId);
      refresh();
    },
    [refresh]
  );

  // ── Team assignment ────────────────────────────────────────────────────────
  const handleAssign = useCallback(
    (teamId, setId) => {
      if (setId === '') {
        unassignTeam(teamId);
      } else {
        assignQuestionSet(teamId, Number(setId));
      }
      refresh();
    },
    [refresh]
  );

  // ── Round controls ─────────────────────────────────────────────────────────
  const handleStatusChange = useCallback(
    (status) => {
      setRound2Status(status);
      refresh();
    },
    [refresh]
  );

  const handleConfigChange = useCallback(
    (patch) => {
      updateRound2Config(patch);
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

  // ── Scoring ────────────────────────────────────────────────────────────────
  const handleOverrideScore = useCallback(
    (teamId, field, value) => {
      overrideScore(teamId, field, value, 'Manual override by host');
      refresh();
    },
    [refresh]
  );

  const handleSyncScoresToMain = useCallback(() => {
    const state = getRound2State();
    Object.entries(state.submissions).forEach(([teamId, sub]) => {
      if (sub.totalScore != null) {
        setScoreDirect(teamId, 'round-2', sub.totalScore);
      }
    });
    refreshScores();
    refreshAudit();
  }, [setScoreDirect, refreshScores, refreshAudit]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    resetRound2();
    // Also reset Round 2 scores in main scoring system
    teams.forEach((t) => {
      setScoreDirect(t.id, 'round-2', 0);
    });
    refreshScores();
    refresh();
    setShowResetConfirm(false);
  }, [teams, setScoreDirect, refreshScores, refresh]);

  // ── Option editing helpers ─────────────────────────────────────────────────
  const handleSaveOptions = useCallback(
    (setId) => {
      if (!editingOptions) return;
      updateLogoQuestion(setId, { options: editingOptions.options });
      setEditingOptions(null);
      refresh();
    },
    [editingOptions, refresh]
  );

  // ── Computed ───────────────────────────────────────────────────────────────
  const assignedSets = useMemo(() => {
    const used = new Set();
    Object.values(r2.teamAssignments).forEach((sid) => used.add(sid));
    return used;
  }, [r2.teamAssignments]);

  const sets = Object.values(r2.questionSets).sort((a, b) => a.id - b.id);

  const statusColors = {
    draft: 'var(--text-muted)',
    active: 'var(--success)',
    paused: 'var(--warn)',
    completed: 'var(--accent)',
  };

  const statusLabels = {
    draft: '⏳ Draft',
    active: '🟢 Active',
    paused: '⏸️ Paused',
    completed: '✅ Completed',
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="page r2-admin-page">
      <header className="page-header">
        <h1>🖼️ {ROUND2_META.title}</h1>
        <p className="subtitle">
          Admin — Question & Image Manager
          <span
            className="r2-status-pill"
            style={{ background: statusColors[r2.status], marginLeft: 12 }}
          >
            {statusLabels[r2.status]}
          </span>
        </p>
      </header>

      {/* ── Tab Navigation ────────────────────────────────────────────────── */}
      <div className="r2-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`r2-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="r2-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: Questions & Images                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'questions' && (
        <div className="r2-tab-content">
          <p className="text-muted" style={{ marginBottom: 16 }}>
            Manage all 12 question sets. Upload logo images, verify answer keys,
            and publish approved questions.
          </p>

          {sets.map((qs) => {
            const isExpanded = expandedSet === qs.id;
            const hasWarning = qs.logoQuestion.verificationStatus === 'needs_verification';
            const imgKeys = [0, 1, 2, 3].map(
              (i) => `set-${qs.id}-logo-${i}`
            );
            const images = imgKeys.map((k) => imageCache[k] || null);
            const uploadedCount = images.filter(Boolean).length;

            return (
              <div
                className={`card r2-set-card ${hasWarning ? 'r2-set-warning' : ''} ${qs.published ? 'r2-set-published' : ''}`}
                key={qs.id}
              >
                {/* Set header */}
                <div
                  className="r2-set-header"
                  onClick={() => setExpandedSet(isExpanded ? null : qs.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      setExpandedSet(isExpanded ? null : qs.id);
                  }}
                >
                  <div className="r2-set-header-left">
                    <span className="r2-set-expand-icon">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <h3>Set {qs.id} — {qs.label}</h3>
                    <span className="r2-image-count">
                      🖼️ {uploadedCount}/4
                    </span>
                  </div>
                  <div className="r2-set-header-right">
                    {hasWarning && (
                      <span className="r2-badge r2-badge-warning">
                        ⚠️ Needs Verification
                      </span>
                    )}
                    {qs.published ? (
                      <span className="r2-badge r2-badge-published">
                        ✅ Published
                      </span>
                    ) : (
                      <span className="r2-badge r2-badge-draft">Draft</span>
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="r2-set-body">
                    {/* Warning banner */}
                    {hasWarning && (
                      <div className="r2-warning-banner">
                        <strong>⚠️ Answer Key Discrepancy</strong>
                        <p>{qs.logoQuestion.warning}</p>
                        <p>
                          <strong>Source says:</strong> {qs.logoQuestion.sourceAnswerKey || '(none)'})
                          {' '}{qs.logoQuestion.sourceAnswerText}
                        </p>
                      </div>
                    )}

                    {/* Logo Images Grid */}
                    <div className="r2-section">
                      <h4>Logo Images</h4>
                      <div className="r2-image-grid">
                        {[0, 1, 2, 3].map((i) => (
                          <ImageSlot
                            key={i}
                            image={images[i]}
                            slotIndex={i}
                            onUpload={(dataUrl) =>
                              handleImageUpload(qs.id, i, dataUrl)
                            }
                            onRemove={() => handleImageRemove(qs.id, i)}
                            onLabelChange={(label) =>
                              handleImageLabel(qs.id, i, label)
                            }
                            disabled={false}
                          />
                        ))}
                      </div>
                    </div>

                    {/* MCQ Options */}
                    <div className="r2-section">
                      <h4>Multiple-Choice Options</h4>
                      {editingOptions?.setId === qs.id ? (
                        <div className="r2-options-edit">
                          {editingOptions.options.map((opt, oi) => (
                            <input
                              key={oi}
                              type="text"
                              className="r2-option-input"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...editingOptions.options];
                                newOpts[oi] = e.target.value;
                                setEditingOptions({ ...editingOptions, options: newOpts });
                              }}
                            />
                          ))}
                          <div className="form-actions">
                            <button className="btn small primary" onClick={() => handleSaveOptions(qs.id)}>Save</button>
                            <button className="btn small ghost" onClick={() => setEditingOptions(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="r2-options-list">
                          {qs.logoQuestion.options.map((opt, oi) => {
                            const letter = opt.charAt(0);
                            const isApproved = qs.logoQuestion.approvedAnswer === letter;
                            return (
                              <div
                                key={oi}
                                className={`r2-option ${isApproved ? 'r2-option-approved' : ''}`}
                              >
                                <span className="r2-option-text">{opt}</span>
                                {isApproved && <span className="r2-option-check">✅</span>}
                              </div>
                            );
                          })}
                          <button
                            className="btn small ghost"
                            onClick={() =>
                              setEditingOptions({
                                setId: qs.id,
                                options: [...qs.logoQuestion.options],
                              })
                            }
                          >
                            ✏️ Edit Options
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Answer Verification */}
                    <div className="r2-section">
                      <h4>Approved Answer</h4>
                      <div className="r2-answer-verify">
                        <div className="r2-answer-buttons">
                          {['A', 'B', 'C', 'D'].map((letter) => (
                            <button
                              key={letter}
                              className={`btn small ${
                                qs.logoQuestion.approvedAnswer === letter
                                  ? 'primary'
                                  : 'ghost'
                              }`}
                              onClick={() => handleApproveAnswer(qs.id, letter)}
                            >
                              {letter}
                            </button>
                          ))}
                        </div>
                        {qs.logoQuestion.approvedAnswer && (
                          <p className="r2-approved-info">
                            ✅ Approved: <strong>{qs.logoQuestion.approvedAnswer}</strong>
                            {qs.logoQuestion.hostConfirmedAt && (
                              <> — confirmed at {new Date(qs.logoQuestion.hostConfirmedAt).toLocaleTimeString()}</>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tagline Question */}
                    <div className="r2-section">
                      <h4>Tagline Rearrangement</h4>
                      <div className="r2-tagline-info">
                        <p>
                          <strong>Words:</strong>{' '}
                          {qs.taglineQuestion.words.map((w, wi) => (
                            <span className="r2-word-chip" key={wi}>
                              {w}
                            </span>
                          ))}
                        </p>
                        <p>
                          <strong>Correct tagline:</strong>{' '}
                          <em>{qs.taglineQuestion.correctTagline}</em>
                        </p>
                      </div>
                    </div>

                    {/* Publish / Unpublish */}
                    <div className="r2-section r2-publish-section">
                      {qs.published ? (
                        <button
                          className="btn small warn"
                          onClick={() => handleUnpublish(qs.id)}
                        >
                          📤 Unpublish
                        </button>
                      ) : (
                        <button
                          className="btn small primary"
                          onClick={() => handlePublish(qs.id)}
                          disabled={hasWarning && !qs.logoQuestion.approvedAnswer}
                        >
                          📢 Publish
                        </button>
                      )}
                      {hasWarning && !qs.logoQuestion.approvedAnswer && (
                        <span className="text-muted" style={{ marginLeft: 8 }}>
                          Verify the answer key to enable publishing
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: Team Assignments                                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'assignments' && (
        <div className="r2-tab-content">
          <div className="card">
            <h3>Assign Question Sets to Teams</h3>
            <p className="text-muted">
              Each team receives one question set. A set can only be assigned to
              one team at a time.
            </p>

            {teams.length === 0 ? (
              <p className="empty-state">No teams registered yet. Add teams first.</p>
            ) : (
              <div className="table-wrap">
                <table className="r2-assign-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team</th>
                      <th>Members</th>
                      <th>Assigned Set</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((t, i) => {
                      const currentSet = r2.teamAssignments[t.id];
                      const setData = currentSet ? r2.questionSets[currentSet] : null;
                      return (
                        <tr key={t.id}>
                          <td>{i + 1}</td>
                          <td className="team-name-cell">{t.name}</td>
                          <td>
                            {t.member1}
                            {t.member2 ? `, ${t.member2}` : ''}
                          </td>
                          <td>
                            <select
                              value={currentSet || ''}
                              onChange={(e) => handleAssign(t.id, e.target.value)}
                              className="r2-assign-select"
                            >
                              <option value="">— Not assigned —</option>
                              {sets.map((s) => {
                                const isUsed = assignedSets.has(s.id) && r2.teamAssignments[t.id] !== s.id;
                                return (
                                  <option
                                    key={s.id}
                                    value={s.id}
                                    disabled={isUsed}
                                  >
                                    Set {s.id}{' '}
                                    {s.published ? '✅' : ''}
                                    {isUsed ? ' (assigned)' : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </td>
                          <td>
                            {setData ? (
                              setData.published ? (
                                <span className="r2-badge r2-badge-published">Ready</span>
                              ) : (
                                <span className="r2-badge r2-badge-draft">Draft</span>
                              )
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: Round Controls                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'controls' && (
        <div className="r2-tab-content">
          {/* Status & Lifecycle */}
          <div className="card">
            <h3>🎛️ Round Status</h3>
            <div className="r2-status-current">
              <span
                className="r2-status-pill large"
                style={{ background: statusColors[r2.status] }}
              >
                {statusLabels[r2.status]}
              </span>
            </div>
            <div className="r2-control-buttons">
              {r2.status === 'draft' && (
                <button
                  className="btn primary"
                  onClick={() => handleStatusChange('active')}
                >
                  ▶ Start Round
                </button>
              )}
              {r2.status === 'active' && (
                <>
                  <button
                    className="btn warn"
                    onClick={() => handleStatusChange('paused')}
                  >
                    ⏸️ Pause Round
                  </button>
                  <button
                    className="btn success"
                    onClick={() => handleStatusChange('completed')}
                  >
                    ✅ End Round
                  </button>
                </>
              )}
              {r2.status === 'paused' && (
                <>
                  <button
                    className="btn primary"
                    onClick={() => handleStatusChange('active')}
                  >
                    ▶ Resume Round
                  </button>
                  <button
                    className="btn success"
                    onClick={() => handleStatusChange('completed')}
                  >
                    ✅ End Round
                  </button>
                </>
              )}
              {r2.status === 'completed' && (
                <button
                  className="btn ghost"
                  onClick={() => handleStatusChange('draft')}
                >
                  🔄 Reopen as Draft
                </button>
              )}
            </div>
          </div>

          {/* Timer */}
          <div className="card">
            <h3>⏱ Timer</h3>
            <div className="r2-timer-config">
              <label className="r2-toggle-row">
                <input
                  type="checkbox"
                  checked={r2.timerEnabled}
                  onChange={(e) =>
                    handleConfigChange({ timerEnabled: e.target.checked })
                  }
                />
                <span>Enable timer for participants</span>
              </label>
              {r2.timerEnabled && (
                <div className="r2-timer-input">
                  <label>
                    Time limit (seconds):
                    <input
                      type="number"
                      min={10}
                      max={600}
                      value={r2.timerSeconds}
                      onChange={(e) =>
                        handleConfigChange({
                          timerSeconds: Math.max(10, Number(e.target.value) || 120),
                        })
                      }
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Scoring Config */}
          <div className="card">
            <h3>🎯 Scoring</h3>
            <div className="r2-scoring-config">
              <label>
                Marks per correct logo:
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={r2.marksPerLogo}
                  onChange={(e) =>
                    handleConfigChange({ marksPerLogo: Number(e.target.value) || 1 })
                  }
                />
              </label>
              <label>
                Marks per correct tagline:
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={r2.marksPerTagline}
                  onChange={(e) =>
                    handleConfigChange({ marksPerTagline: Number(e.target.value) || 1 })
                  }
                />
              </label>
              <label className="r2-toggle-row">
                <input
                  type="checkbox"
                  checked={r2.requireExactPunctuation}
                  onChange={(e) =>
                    handleConfigChange({
                      requireExactPunctuation: e.target.checked,
                    })
                  }
                />
                <span>Require exact punctuation for tagline</span>
              </label>
              <label className="r2-toggle-row">
                <input
                  type="checkbox"
                  checked={r2.allowRetries}
                  onChange={(e) =>
                    handleConfigChange({ allowRetries: e.target.checked })
                  }
                />
                <span>Allow participants to resubmit answers</span>
              </label>
            </div>
          </div>

          {/* Answer Reveal */}
          <div className="card">
            <h3>👁️ Answer Reveal</h3>
            <label className="r2-toggle-row">
              <input
                type="checkbox"
                checked={r2.answersRevealed}
                onChange={(e) => handleRevealAnswers(e.target.checked)}
              />
              <span>
                {r2.answersRevealed
                  ? 'Answers are VISIBLE to participants'
                  : 'Answers are HIDDEN from participants'}
              </span>
            </label>
          </div>

          {/* Sync Scores */}
          <div className="card">
            <h3>📤 Sync to Leaderboard</h3>
            <p className="text-muted">
              Push Round 2 scores into the main quiz scoring system. This updates
              the overall leaderboard.
            </p>
            <button className="btn primary" onClick={handleSyncScoresToMain}>
              🔄 Sync Round 2 Scores to Main Leaderboard
            </button>
          </div>

          {/* Reset */}
          <div className="card">
            <h3>🔄 Reset Round 2</h3>
            <p className="text-muted">
              This will clear all Round 2 data including submissions and scores.
              This action cannot be undone.
            </p>
            {!showResetConfirm ? (
              <button
                className="btn danger"
                onClick={() => setShowResetConfirm(true)}
              >
                🗑️ Reset Round 2
              </button>
            ) : (
              <div className="r2-reset-confirm">
                <p>
                  <strong>Are you sure?</strong> All Round 2 submissions,
                  scores, and assignments will be deleted.
                </p>
                <div className="form-actions">
                  <button className="btn danger" onClick={handleReset}>
                    Yes, Reset Everything
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: Submissions & Scoring                                     */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'submissions' && (
        <div className="r2-tab-content">
          <div className="card">
            <div className="r2-submissions-header">
              <h3>📊 Team Submissions</h3>
              <button className="btn small primary" onClick={handleSyncScoresToMain}>
                🔄 Sync Scores
              </button>
            </div>

            {teams.length === 0 ? (
              <p className="empty-state">No teams registered.</p>
            ) : (
              <div className="table-wrap">
                <table className="r2-submissions-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team</th>
                      <th>Set</th>
                      <th>Logo Answer</th>
                      <th>Logo Score</th>
                      <th>Tagline Answer</th>
                      <th>Tagline Score</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((t, i) => {
                      const setId = r2.teamAssignments[t.id];
                      const sub = r2.submissions[t.id];
                      const qs = setId ? r2.questionSets[setId] : null;

                      return (
                        <tr key={t.id}>
                          <td>{i + 1}</td>
                          <td className="team-name-cell">{t.name}</td>
                          <td>{setId || '—'}</td>
                          <td>
                            {sub?.logoAnswer ? (
                              <span className="r2-answer-display">
                                {sub.logoAnswer}
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            <div className="r2-score-cell">
                              {sub?.logoScore != null ? (
                                <span
                                  className={`r2-score-badge ${
                                    sub.logoScore > 0 ? 'correct' : 'incorrect'
                                  }`}
                                >
                                  {sub.logoScore}
                                </span>
                              ) : (
                                <span className="r2-score-badge pending">?</span>
                              )}
                              <div className="r2-score-override-btns">
                                <button
                                  className="btn small success"
                                  onClick={() =>
                                    handleOverrideScore(
                                      t.id,
                                      'logoScore',
                                      r2.marksPerLogo
                                    )
                                  }
                                  title="Mark correct"
                                >
                                  ✓
                                </button>
                                <button
                                  className="btn small danger"
                                  onClick={() =>
                                    handleOverrideScore(t.id, 'logoScore', 0)
                                  }
                                  title="Mark incorrect"
                                >
                                  ✗
                                </button>
                              </div>
                            </div>
                          </td>
                          <td>
                            {sub?.taglineAnswer ? (
                              <span className="r2-tagline-preview">
                                {sub.taglineAnswer.join(' ')}
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            <div className="r2-score-cell">
                              {sub?.taglineScore != null ? (
                                <span
                                  className={`r2-score-badge ${
                                    sub.taglineScore > 0 ? 'correct' : 'incorrect'
                                  }`}
                                >
                                  {sub.taglineScore}
                                </span>
                              ) : (
                                <span className="r2-score-badge pending">?</span>
                              )}
                              <div className="r2-score-override-btns">
                                <button
                                  className="btn small success"
                                  onClick={() =>
                                    handleOverrideScore(
                                      t.id,
                                      'taglineScore',
                                      r2.marksPerTagline
                                    )
                                  }
                                  title="Mark correct"
                                >
                                  ✓
                                </button>
                                <button
                                  className="btn small danger"
                                  onClick={() =>
                                    handleOverrideScore(t.id, 'taglineScore', 0)
                                  }
                                  title="Mark incorrect"
                                >
                                  ✗
                                </button>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="r2-total-score">
                              {sub?.totalScore != null ? sub.totalScore : '—'}
                            </span>
                          </td>
                          <td>
                            {sub?.manualOverride && (
                              <span className="r2-badge r2-badge-warning" title="Manually overridden">
                                🔧
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Audit Log */}
          {r2.auditLog.length > 0 && (
            <div className="card">
              <h3>📋 Audit Log</h3>
              <div className="r2-audit-log">
                {r2.auditLog
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map((entry) => {
                    const team = teams.find((t) => t.id === entry.teamId);
                    return (
                      <div className="r2-audit-entry" key={entry.id}>
                        <span className="r2-audit-time">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="r2-audit-text">
                          {team?.name || entry.teamId}: {entry.field}{' '}
                          {entry.oldValue} → {entry.newValue}
                          {entry.reason && ` (${entry.reason})`}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
