import { useState } from 'react';
import { useQuiz } from '../context/QuizContext';

export default function Rounds() {
  const {
    rounds,
    updateRound,
    addQuestion,
    updateQuestion,
    removeQuestion,
  } = useQuiz();

  const [expandedRound, setExpandedRound] = useState(rounds[0]?.id || null);
  const [editingRound, setEditingRound] = useState(null);
  const [roundForm, setRoundForm] = useState({ name: '', timerSeconds: 30 });
  const [qForm, setQForm] = useState({ roundId: null, id: null, question: '', answer: '' });

  // --- Round editing ---------------------------------------------------------

  const startEditRound = (r) => {
    setEditingRound(r.id);
    setRoundForm({ name: r.name, timerSeconds: r.timerSeconds });
  };

  const saveRound = (id) => {
    updateRound(id, {
      name: roundForm.name.trim() || `Round ${id}`,
      timerSeconds: Math.max(5, Number(roundForm.timerSeconds) || 30),
    });
    setEditingRound(null);
  };

  // --- Question editing ------------------------------------------------------

  const resetQForm = () =>
    setQForm({ roundId: null, id: null, question: '', answer: '' });

  const startEditQuestion = (roundId, q) => {
    setQForm({ roundId, id: q.id, question: q.question, answer: q.answer });
  };

  const saveQuestion = (roundId) => {
    if (!qForm.question.trim()) return;
    if (qForm.id) {
      updateQuestion(roundId, qForm.id, {
        question: qForm.question.trim(),
        answer: qForm.answer.trim(),
      });
    } else {
      addQuestion(roundId, qForm.question.trim(), qForm.answer.trim());
    }
    resetQForm();
  };

  const handleRemoveQ = (roundId, qId) => {
    if (window.confirm('Remove this question?')) {
      removeQuestion(roundId, qId);
      if (qForm.id === qId) resetQForm();
    }
  };

  return (
    <div className="page rounds-page">
      <header className="page-header">
        <h1>Rounds &amp; Questions</h1>
        <p className="subtitle">{rounds.length} rounds configured</p>
      </header>

      <div className="rounds-accordion" id="rounds-accordion">
        {rounds.map((r, ri) => {
          const isExpanded = expandedRound === r.id;
          const isEditing = editingRound === r.id;

          return (
            <section className={`round-panel ${isExpanded ? 'open' : ''}`} key={r.id}>
              {/* Round header */}
              <button
                className="round-header"
                onClick={() => setExpandedRound(isExpanded ? null : r.id)}
                aria-expanded={isExpanded}
                id={`round-header-${ri}`}
              >
                <span className="round-number">R{ri + 1}</span>
                <span className="round-name">{r.name}</span>
                <span className="round-meta">
                  ⏱ {r.timerSeconds}s &middot; {r.questions.length} Q
                </span>
                <span className="chevron">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <div className="round-body">
                  {/* Round settings */}
                  <div className="round-settings">
                    {isEditing ? (
                      <div className="inline-form">
                        <input
                          value={roundForm.name}
                          onChange={(e) =>
                            setRoundForm({ ...roundForm, name: e.target.value })
                          }
                          placeholder="Round name"
                          className="input-sm"
                        />
                        <label className="timer-label">
                          Timer (s):
                          <input
                            type="number"
                            min={5}
                            value={roundForm.timerSeconds}
                            onChange={(e) =>
                              setRoundForm({ ...roundForm, timerSeconds: e.target.value })
                            }
                            className="input-xs"
                          />
                        </label>
                        <button className="btn small primary" onClick={() => saveRound(r.id)}>
                          Save
                        </button>
                        <button className="btn small ghost" onClick={() => setEditingRound(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="round-info-bar">
                        <span>⏱ {r.timerSeconds} seconds per question</span>
                        <button className="btn small ghost" onClick={() => startEditRound(r)}>
                          ✏️ Edit Round
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Question list */}
                  <div className="question-list">
                    {r.questions.length === 0 && (
                      <p className="empty-state">No questions added yet.</p>
                    )}
                    {r.questions.map((q, qi) => (
                      <div className="question-row" key={q.id}>
                        {qForm.id === q.id && qForm.roundId === r.id ? (
                          <div className="q-edit-form">
                            <textarea
                              value={qForm.question}
                              onChange={(e) =>
                                setQForm({ ...qForm, question: e.target.value })
                              }
                              placeholder="Question"
                              rows={2}
                            />
                            <textarea
                              value={qForm.answer}
                              onChange={(e) =>
                                setQForm({ ...qForm, answer: e.target.value })
                              }
                              placeholder="Answer"
                              rows={2}
                            />
                            <div className="form-actions">
                              <button
                                className="btn small primary"
                                onClick={() => saveQuestion(r.id)}
                              >
                                Save
                              </button>
                              <button className="btn small ghost" onClick={resetQForm}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="q-number">Q{qi + 1}</span>
                            <div className="q-content">
                              <p className="q-text">{q.question}</p>
                              <p className="q-answer">
                                <strong>A:</strong> {q.answer || '—'}
                              </p>
                            </div>
                            <div className="q-actions">
                              <button
                                className="btn small ghost"
                                onClick={() => startEditQuestion(r.id, q)}
                              >
                                ✏️
                              </button>
                              <button
                                className="btn small danger"
                                onClick={() => handleRemoveQ(r.id, q.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add question form */}
                  {!(qForm.roundId === r.id && !qForm.id) ? (
                    <button
                      className="btn ghost add-q-btn"
                      onClick={() =>
                        setQForm({ roundId: r.id, id: null, question: '', answer: '' })
                      }
                    >
                      + Add Question
                    </button>
                  ) : (
                    <div className="q-edit-form new-q-form">
                      <textarea
                        value={qForm.question}
                        onChange={(e) =>
                          setQForm({ ...qForm, question: e.target.value })
                        }
                        placeholder="Type the question…"
                        rows={2}
                        autoFocus
                      />
                      <textarea
                        value={qForm.answer}
                        onChange={(e) =>
                          setQForm({ ...qForm, answer: e.target.value })
                        }
                        placeholder="Type the answer…"
                        rows={2}
                      />
                      <div className="form-actions">
                        <button
                          className="btn small primary"
                          onClick={() => saveQuestion(r.id)}
                        >
                          Add
                        </button>
                        <button className="btn small ghost" onClick={resetQForm}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
