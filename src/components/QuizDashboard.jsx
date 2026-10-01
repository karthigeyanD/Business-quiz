import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, ArrowUp, ArrowDown, Upload, Check, Eye, Save, RotateCcw, HelpCircle, GripVertical, Image as ImageIcon, Clipboard, X } from 'lucide-react';
import RoundNavigationCards from './RoundNavigationCards';

export default function QuizDashboard({
  questions,
  onSaveQuestions,
  onResetToDemo,
  onStartQuizPresentation,
  currentMode,
  onSelectMode,
  onGoToOpeningPage
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [draftQ, setDraftQ] = useState(null);

  const logoInputRef = useRef(null);
  const [activeLogoIndex, setActiveLogoIndex] = useState(0);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [pasteToast, setPasteToast] = useState(null);

  const startEdit = (index) => {
    setEditingIndex(index);
    setDraftQ(JSON.parse(JSON.stringify(questions[index])));
    setActiveLogoIndex(0);
  };

  const createNewQuestion = () => {
    const newQ = {
      id: `q-custom-${Date.now()}`,
      questionNumber: questions.length + 1,
      title: `Question ${questions.length + 1}: Identify the brand logo`,
      logos: ['', '', '', ''],
      options: ['A) Option A', 'B) Option B', 'C) Option C', 'D) Option D'],
      correctOption: 'A',
      explanation: 'Explanation for correct answer.'
    };
    const updated = [...questions, newQ];
    onSaveQuestions(updated);
    startEdit(questions.length);
  };

  const saveDraft = () => {
    if (editingIndex === null || !draftQ) return;
    const copy = [...questions];
    copy[editingIndex] = draftQ;
    const reindexed = copy.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    onSaveQuestions(reindexed);
    setEditingIndex(null);
    setDraftQ(null);
  };

  const deleteQuestion = (index) => {
    if (window.confirm(`Delete Question #${index + 1}?`)) {
      const copy = questions.filter((_, i) => i !== index);
      const reindexed = copy.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
      onSaveQuestions(reindexed);
      if (editingIndex === index) {
        setEditingIndex(null);
        setDraftQ(null);
      }
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const copy = [...questions];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    const reindexed = copy.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    onSaveQuestions(reindexed);
  };

  const moveDown = (index) => {
    if (index === questions.length - 1) return;
    const copy = [...questions];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    const reindexed = copy.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    onSaveQuestions(reindexed);
  };

  const triggerLogoUpload = (logoIdx) => {
    setActiveLogoIndex(logoIdx);
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && draftQ) {
      processImageFile(file, activeLogoIndex);
    }
    // Reset file input so re-selecting the same file triggers onChange
    if (e.target) e.target.value = '';
  };

  const processImageFile = useCallback((file, logoIdx) => {
    if (!file || (!file.type.startsWith('image/') && !file.type.includes('svg'))) return false;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      setDraftQ((prev) => {
        if (!prev) return prev;
        const newLogos = [...prev.logos];
        newLogos[logoIdx] = dataUrl;
        return { ...prev, logos: newLogos };
      });
      setActiveLogoIndex((logoIdx + 1) % 4);
      setPasteToast(`Image set for Logo #${logoIdx + 1}`);
      setTimeout(() => setPasteToast(null), 3000);
    };
    reader.readAsDataURL(file);
    return true;
  }, []);

  const processImageUrlString = useCallback((text, logoIdx) => {
    if (!text) return false;
    const trimmed = text.trim();
    if (
      trimmed.startsWith('data:image/') ||
      trimmed.startsWith('blob:') ||
      /^https?:\/\/.*\.(png|jpg|jpeg|webp|svg|gif)(\?.*)?$/i.test(trimmed)
    ) {
      setDraftQ((prev) => {
        if (!prev) return prev;
        const newLogos = [...prev.logos];
        newLogos[logoIdx] = trimmed;
        return { ...prev, logos: newLogos };
      });
      setActiveLogoIndex((logoIdx + 1) % 4);
      setPasteToast(`Pasted image URL into Logo #${logoIdx + 1}`);
      setTimeout(() => setPasteToast(null), 3000);
      return true;
    }
    return false;
  }, []);

  const handleLogoPaste = useCallback((e, targetIdx = activeLogoIndex) => {
    // 1. Files in clipboard
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          e.preventDefault();
          processImageFile(files[i], targetIdx);
          return;
        }
      }
    }

    // 2. Clipboard items (e.g. copied image snippets/screenshots)
    const items = e.clipboardData?.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file, targetIdx);
            return;
          }
        }
      }
    }

    // 3. Text image URL
    const text = e.clipboardData?.getData('text');
    if (text && processImageUrlString(text, targetIdx)) {
      e.preventDefault();
    }
  }, [activeLogoIndex, processImageFile, processImageUrlString]);

  // Global paste handler when draftQ (question editor drawer) is active
  useEffect(() => {
    if (!draftQ) return;

    const handleGlobalPaste = (e) => {
      const activeEl = document.activeElement;
      const isTextInput = activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName);

      // Check if clipboard contains an image file or item
      const files = e.clipboardData?.files;
      const items = e.clipboardData?.items;
      let hasImageFile = false;

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          if (files[i].type.startsWith('image/')) {
            hasImageFile = true;
            break;
          }
        }
      }
      if (!hasImageFile && items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            hasImageFile = true;
            break;
          }
        }
      }

      // If clipboard has an actual image file, process it into active logo slot even if focused on a text input
      if (hasImageFile) {
        handleLogoPaste(e, activeLogoIndex);
        return;
      }

      // If plain text was pasted and user is NOT typing in a text field, check if text is an image URL
      if (!isTextInput) {
        handleLogoPaste(e, activeLogoIndex);
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [draftQ, activeLogoIndex, handleLogoPaste]);

  const handleClipboardButtonClick = async (logoIdx, e) => {
    e.stopPropagation();
    setActiveLogoIndex(logoIdx);
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], 'pasted-image.png', { type: imageType });
            processImageFile(file, logoIdx);
            return;
          }
        }
      }
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && processImageUrlString(text, logoIdx)) {
          return;
        }
      }
      alert('No image found in your clipboard. Copy an image (Ctrl+C) and press Ctrl+V to paste into the selected slot.');
    } catch (err) {
      console.warn('Clipboard API read error:', err);
      alert('To paste an image, press Ctrl+V on your keyboard while selecting this logo slot.');
    }
  };

  const removeLogo = (logoIdx, e) => {
    e.stopPropagation();
    if (!draftQ) return;
    const newLogos = [...draftQ.logos];
    newLogos[logoIdx] = '';
    setDraftQ({ ...draftQ, logos: newLogos });
    setActiveLogoIndex(logoIdx);
  };

  return (
    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--bg-app)' }}>
      {/* Round Navigation Deck */}
      <RoundNavigationCards
        currentMode={currentMode}
        onSelectMode={onSelectMode}
        onGoToOpeningPage={onGoToOpeningPage}
      />

      <input
        ref={logoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleLogoFileChange}
      />

      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', background: 'var(--bg-glass)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
            🎯 Logo Identification Quiz Organizer Dashboard
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage {questions.length} Quiz Questions • Upload or paste (Ctrl+V) 4 logos per question • Set Options &amp; Correct Answer
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={onResetToDemo} title="Reload default 12-question quiz set">
            <RotateCcw size={16} />
            <span>Reset Demo Quiz</span>
          </button>
          <button className="btn-secondary" onClick={createNewQuestion}>
            <Plus size={16} />
            <span>Add Question</span>
          </button>
          <button className="btn-glow" onClick={onStartQuizPresentation}>
            <Eye size={18} />
            <span>Start Quiz Presentation</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Questions List + Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: draftQ ? '1fr 1fr' : '1fr', gap: '24px' }}>
        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {questions.map((q, idx) => {
            const isEditing = editingIndex === idx;

            return (
              <div
                key={q.id || idx}
                className={`thumb-card ${isEditing ? 'active-slide' : ''}`}
                style={{ padding: '16px', borderRadius: '14px' }}
              >
                <div style={{ color: 'var(--text-muted)' }}>
                  <GripVertical size={18} />
                </div>

                {/* 2x2 Thumbnail Grid Preview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', width: '70px', height: '55px', background: '#000', borderRadius: '8px', padding: '3px', flexShrink: 0 }}>
                  {q.logos.slice(0, 4).map((logoUrl, lIdx) => (
                    <div key={lIdx} style={{ background: '#1e293b', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <ImageIcon size={10} style={{ opacity: 0.4 }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Question Metadata */}
                <div style={{ flex: 1, minWidth: 0, marginLeft: '12px' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    Q{q.questionNumber}: {q.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Options: {q.options.join(' • ')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
                    Correct Answer: Option {q.correctOption}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button className="action-icon-btn" onClick={() => startEdit(idx)} title="Edit Question">
                    <Edit3 size={16} />
                  </button>
                  <button className="action-icon-btn" onClick={() => moveUp(idx)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.3 : 1 }} title="Move Up">
                    <ArrowUp size={16} />
                  </button>
                  <button className="action-icon-btn" onClick={() => moveDown(idx)} disabled={idx === questions.length - 1} style={{ opacity: idx === questions.length - 1 ? 0.3 : 1 }} title="Move Down">
                    <ArrowDown size={16} />
                  </button>
                  <button className="action-icon-btn danger" onClick={() => deleteQuestion(idx)} title="Delete Question">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Question Editor Drawer */}
        {draftQ && (
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800 }}>
                Edit Question #{draftQ.questionNumber}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-glow" onClick={saveDraft} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                  <Save size={14} /> Save Question
                </button>
                <button className="btn-secondary" onClick={() => setDraftQ(null)} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                  Cancel
                </button>
              </div>
            </div>

            <div>
              <label className="setting-name" style={{ display: 'block', marginBottom: '6px' }}>Question Title / Prompt</label>
              <input
                type="text"
                className="custom-select"
                style={{ width: '100%', fontSize: '0.95rem' }}
                value={draftQ.title}
                onChange={(e) => setDraftQ({ ...draftQ, title: e.target.value })}
                placeholder="e.g. Which tech giant is represented by logo #2?"
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="setting-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 0 }}>
                  <ImageIcon size={16} className="text-cyan-400" />
                  <span>4 Grid Logos</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Select box &amp; press</span>
                  <kbd style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', color: '#67e8f9', fontWeight: 700 }}>
                    Ctrl + V
                  </kbd>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[0, 1, 2, 3].map((logoIdx) => {
                  const logoUrl = draftQ.logos[logoIdx];
                  const isActive = activeLogoIndex === logoIdx;
                  const isDragOver = dragOverIdx === logoIdx;

                  return (
                    <div
                      key={logoIdx}
                      tabIndex={0}
                      onClick={() => setActiveLogoIndex(logoIdx)}
                      onFocus={() => setActiveLogoIndex(logoIdx)}
                      onPaste={(e) => handleLogoPaste(e, logoIdx)}
                      onDragOver={(e) => { e.preventDefault(); setDragOverIdx(logoIdx); }}
                      onDragLeave={() => setDragOverIdx(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverIdx(null);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processImageFile(file, logoIdx);
                      }}
                      style={{
                        height: '125px',
                        background: isActive ? '#0f172a' : '#090d16',
                        border: isDragOver
                          ? '2px dashed var(--accent-cyan)'
                          : isActive
                          ? '2px solid var(--accent-cyan)'
                          : '2px dashed rgba(255, 255, 255, 0.18)',
                        boxShadow: isActive ? '0 0 16px rgba(6, 182, 212, 0.35)' : 'none',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Slot Header Tag */}
                      <div style={{
                        position: 'absolute',
                        top: '6px',
                        left: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 3
                      }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                          color: isActive ? '#080c14' : 'var(--text-muted)'
                        }}>
                          Logo #{logoIdx + 1} {isActive ? '• Active Slot' : ''}
                        </span>
                      </div>

                      {logoUrl ? (
                        <>
                          <img
                            src={logoUrl}
                            alt={`Logo ${logoIdx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '24px 12px 12px 12px' }}
                          />
                          <div
                            className="logo-hover-overlay"
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(8, 12, 20, 0.85)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              opacity: 0,
                              transition: 'opacity 0.2s ease',
                              zIndex: 4
                            }}
                          >
                            <button
                              type="button"
                              className="btn-glow"
                              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                              onClick={() => triggerLogoUpload(logoIdx)}
                              title="Browse image file"
                            >
                              <Upload size={12} /> Replace
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                              onClick={(e) => handleClipboardButtonClick(logoIdx, e)}
                              title="Paste image from clipboard (Ctrl+V)"
                            >
                              <Clipboard size={12} /> Paste
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn danger"
                              style={{ padding: '4px' }}
                              onClick={(e) => removeLogo(logoIdx, e)}
                              title="Remove image"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', paddingTop: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Upload size={18} className={isActive ? "text-cyan-400" : "text-indigo-400"} />
                            <Clipboard size={16} className={isActive ? "text-cyan-400" : "text-muted"} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: isActive ? '#67e8f9' : 'var(--text-muted)', fontWeight: isActive ? 700 : 400 }}>
                            {isActive ? 'Press Ctrl+V to Paste' : `Upload or Paste Logo #${logoIdx + 1}`}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '2px 8px', fontSize: '0.68rem' }}
                              onClick={() => triggerLogoUpload(logoIdx)}
                            >
                              Browse...
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: '2px 8px', fontSize: '0.68rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}
                              onClick={(e) => handleClipboardButtonClick(logoIdx, e)}
                            >
                              Paste (Ctrl+V)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {pasteToast && (
                <div style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '8px',
                  color: '#34d399',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Check size={14} />
                  <span>{pasteToast}</span>
                </div>
              )}
            </div>

            <div>
              <label className="setting-name" style={{ display: 'block', marginBottom: '8px' }}>
                Answer Options (A, B, C, D)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                  <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '24px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{letter})</span>
                    <input
                      type="text"
                      className="custom-select"
                      style={{ flex: 1 }}
                      value={draftQ.options[optIdx] || ''}
                      onChange={(e) => {
                        const newOpts = [...draftQ.options];
                        newOpts[optIdx] = e.target.value;
                        setDraftQ({ ...draftQ, options: newOpts });
                      }}
                      placeholder={`Option ${letter}`}
                    />
                    <input
                      type="radio"
                      name="correctOptionRadio"
                      checked={draftQ.correctOption === letter}
                      onChange={() => setDraftQ({ ...draftQ, correctOption: letter })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      title={`Set Option ${letter} as Correct Answer`}
                    />
                    <span style={{ fontSize: '0.75rem', color: draftQ.correctOption === letter ? '#10b981' : 'var(--text-muted)' }}>
                      {draftQ.correctOption === letter ? 'Correct' : 'Mark Correct'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="setting-name" style={{ display: 'block', marginBottom: '6px' }}>Answer Explanation / Brand Detail</label>
              <textarea
                className="custom-select"
                style={{ width: '100%', height: '60px', resize: 'none' }}
                value={draftQ.explanation || ''}
                onChange={(e) => setDraftQ({ ...draftQ, explanation: e.target.value })}
                placeholder="Background notes revealed when 'Reveal Answer' is clicked during presentation..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

