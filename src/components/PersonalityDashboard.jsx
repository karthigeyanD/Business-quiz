import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Upload,
  Check,
  Eye,
  Save,
  RotateCcw,
  GripVertical,
  Image as ImageIcon,
  Copy,
  Clipboard,
  X,
  Maximize2,
  UserCheck
} from 'lucide-react';
import RoundNavigationCards from './RoundNavigationCards';

export default function PersonalityDashboard({
  questions,
  onSaveQuestions,
  onResetToDemo,
  onStartPresentation,
  currentMode,
  onSelectMode,
  onGoToOpeningPage
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [draftQ, setDraftQ] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null); // 'clue' | 'answer' | null
  const [activeUploadTarget, setActiveUploadTarget] = useState('clue'); // 'clue' | 'answer'
  const [toastMessage, setToastMessage] = useState(null);

  const fileInputRef = useRef(null);

  // Drag reorder state for question list
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startEdit = (index) => {
    const qToEdit = JSON.parse(JSON.stringify(questions[index]));
    setEditingIndex(index);
    setDraftQ(qToEdit);
    draftQRef.current = qToEdit;
    setActiveUploadTarget('clue');
    activeUploadTargetRef.current = 'clue';
  };

  const createNewQuestion = () => {
    const newQ = {
      id: `pers-custom-${Date.now()}`,
      questionNumber: questions.length + 1,
      title: `Question ${questions.length + 1}: Identify this business personality`,
      clueImage: '',
      answerImage: '',
      name: 'Personality Name',
      explanation: 'Background detail or biography note.'
    };
    const updated = [...questions, newQ];
    onSaveQuestions(updated);
    startEdit(questions.length);
    showToast('New personality question created!');
  };

  const duplicateQuestion = (index, e) => {
    e.stopPropagation();
    const sourceQ = questions[index];
    const cloned = JSON.parse(JSON.stringify(sourceQ));
    cloned.id = `pers-custom-${Date.now()}`;
    cloned.title = `${sourceQ.title} (Copy)`;

    const updated = [...questions];
    updated.splice(index + 1, 0, cloned);
    const reindexed = updated.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    onSaveQuestions(reindexed);
    showToast(`Duplicated Question #${index + 1}`);
  };

  const saveDraft = () => {
    if (editingIndex === null || !draftQ) return;
    const copy = [...questions];
    copy[editingIndex] = draftQ;
    const reindexed = copy.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    onSaveQuestions(reindexed);
    setEditingIndex(null);
    setDraftQ(null);
    draftQRef.current = null;
    showToast('Question saved!');
  };

  const deleteQuestion = (index, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Delete Question #${index + 1}?`)) {
      const copy = questions.filter((_, i) => i !== index);
      const reindexed = copy.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
      onSaveQuestions(reindexed);
      if (editingIndex === index) {
        setEditingIndex(null);
        setDraftQ(null);
        draftQRef.current = null;
      }
      showToast('Question deleted');
    }
  };

  const moveUp = (index, e) => {
    e.stopPropagation();
    if (index === 0) return;
    const copy = [...questions];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    const reindexed = copy.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    onSaveQuestions(reindexed);
  };

  const moveDown = (index, e) => {
    e.stopPropagation();
    if (index === questions.length - 1) return;
    const copy = [...questions];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    const reindexed = copy.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    onSaveQuestions(reindexed);
  };

  // Drag reordering for questions list
  const handleSortStart = (index) => {
    dragItemRef.current = index;
  };

  const handleSortEnter = (index) => {
    dragOverItemRef.current = index;
  };

  const handleSortEnd = () => {
    if (dragItemRef.current !== null && dragOverItemRef.current !== null && dragItemRef.current !== dragOverItemRef.current) {
      const copy = [...questions];
      const draggedItemContent = copy[dragItemRef.current];
      copy.splice(dragItemRef.current, 1);
      copy.splice(dragOverItemRef.current, 0, draggedItemContent);
      const reindexed = copy.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
      onSaveQuestions(reindexed);
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const activeUploadTargetRef = useRef(activeUploadTarget);
  const draftQRef = useRef(draftQ);
  const questionsRef = useRef(questions);

  useEffect(() => {
    activeUploadTargetRef.current = activeUploadTarget;
  }, [activeUploadTarget]);

  useEffect(() => {
    draftQRef.current = draftQ;
  }, [draftQ]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  // Image File & Paste processing
  const processImageFileForTarget = useCallback((file, targetField = activeUploadTargetRef.current || 'clue') => {
    if (!file) return false;
    const isImg = file.type.startsWith('image/') || file.type.includes('image') || file.type.includes('svg');
    if (!isImg) return false;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      setDraftQ((prev) => {
        const target = prev || draftQRef.current;
        if (!target) return prev;
        const updated = targetField === 'clue'
          ? { ...target, clueImage: dataUrl }
          : { ...target, answerImage: dataUrl };
        draftQRef.current = updated;
        return updated;
      });
      const nextTarget = targetField === 'clue' ? 'answer' : 'clue';
      setActiveUploadTarget(nextTarget);
      activeUploadTargetRef.current = nextTarget;
      showToast(`✅ Uploaded ${targetField === 'clue' ? 'Clue' : 'Answer'} Image! (${nextTarget === 'answer' ? 'Answer' : 'Clue'} slot active for next Ctrl+V)`);
    };
    reader.readAsDataURL(file);
    return true;
  }, [showToast]);

  const processImageUrlStringForTarget = useCallback((text, targetField = activeUploadTargetRef.current || 'clue') => {
    if (!text) return false;
    const trimmed = text.trim().replace(/^["']|["']$/g, '');
    const isImageBase64 = trimmed.startsWith('data:image/') || trimmed.startsWith('blob:');
    const isHttpUrl = /^https?:\/\/.+/i.test(trimmed);

    if (isImageBase64 || isHttpUrl) {
      setDraftQ((prev) => {
        const target = prev || draftQRef.current;
        if (!target) return prev;
        const updated = targetField === 'clue'
          ? { ...target, clueImage: trimmed }
          : { ...target, answerImage: trimmed };
        draftQRef.current = updated;
        return updated;
      });
      const nextTarget = targetField === 'clue' ? 'answer' : 'clue';
      setActiveUploadTarget(nextTarget);
      activeUploadTargetRef.current = nextTarget;
      showToast(`✅ Pasted URL into ${targetField === 'clue' ? 'Clue' : 'Answer'} Image! (${nextTarget === 'answer' ? 'Answer' : 'Clue'} slot active for next Ctrl+V)`);
      return true;
    }
    return false;
  }, [showToast]);

  const triggerFileInput = (targetField) => {
    setActiveUploadTarget(targetField);
    activeUploadTargetRef.current = targetField;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFileForTarget(file, activeUploadTargetRef.current || 'clue');
    }
    if (e.target) e.target.value = '';
  };

  // Global & Container Ctrl+V paste listener
  const handlePaste = useCallback((e) => {
    const targetField = activeUploadTargetRef.current || 'clue';
    let handled = false;

    const activeEl = document.activeElement;
    const isTextInput = activeEl && (
      activeEl.tagName === 'TEXTAREA' ||
      (activeEl.tagName === 'INPUT' && (activeEl.type === 'text' || activeEl.type === 'search' || !activeEl.type))
    );

    // 1. Files in clipboard
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/') || files[i].type.includes('image') || files[i].type.includes('svg')) {
          e.preventDefault();
          processImageFileForTarget(files[i], targetField);
          handled = true;
          return;
        }
      }
    }

    // 2. Clipboard items (copied screenshots or image snippets)
    const items = e.clipboardData?.items;
    if (!handled && items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/') || items[i].type.includes('image') || items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFileForTarget(file, targetField);
            handled = true;
            return;
          }
        }
      }
    }

    // 3. Text image URL or Base64 string
    const text = e.clipboardData?.getData('text') || e.clipboardData?.getData('text/plain');
    if (!handled && text) {
      const trimmed = text.trim().replace(/^["']|["']$/g, '');
      const isImageBase64 = trimmed.startsWith('data:image/') || trimmed.startsWith('blob:');
      const isHttpUrl = /^https?:\/\/.+/i.test(trimmed);
      const isImageExtension = /\.(jpeg|jpg|gif|png|webp|svg|bmp|avif)($|\?)/i.test(trimmed);

      const shouldInterceptAsImage = isImageBase64 || (isTextInput ? (isHttpUrl && isImageExtension) : isHttpUrl);

      if (shouldInterceptAsImage) {
        if (processImageUrlStringForTarget(text, targetField)) {
          e.preventDefault();
          handled = true;
        }
      }
    }
  }, [processImageFileForTarget, processImageUrlStringForTarget]);

  useEffect(() => {
    const handleGlobalPaste = (e) => {
      let currentDraft = draftQRef.current;

      // Auto-open Question #1 for edit if Ctrl+V is pressed while drawer is closed
      if (!currentDraft) {
        if (questionsRef.current && questionsRef.current.length > 0) {
          const qToEdit = JSON.parse(JSON.stringify(questionsRef.current[0]));
          setEditingIndex(0);
          setDraftQ(qToEdit);
          currentDraft = qToEdit;
          draftQRef.current = qToEdit;
        } else {
          return;
        }
      }

      handlePaste(e);
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [handlePaste]);

  const handleClipboardButtonClick = async (targetField, e) => {
    e.stopPropagation();
    setActiveUploadTarget(targetField);
    activeUploadTargetRef.current = targetField;
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/') || t.includes('image'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], `pasted-${targetField}-image.png`, { type: imageType });
            processImageFileForTarget(file, targetField);
            return;
          }
        }
      }
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && processImageUrlStringForTarget(text, targetField)) {
          return;
        }
      }
      const promptVal = window.prompt(`Paste image URL or Base64 string for ${targetField === 'clue' ? 'Clue' : 'Answer'} image:`);
      if (promptVal && processImageUrlStringForTarget(promptVal, targetField)) {
        return;
      }
    } catch (err) {
      console.warn('Clipboard read notice:', err);
      const promptVal = window.prompt(`Paste image URL or Base64 string for ${targetField === 'clue' ? 'Clue' : 'Answer'} image (or press Ctrl+V):`);
      if (promptVal && processImageUrlStringForTarget(promptVal, targetField)) {
        return;
      }
    }
  };

  return (
    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--bg-app)' }}>
      {/* Round Navigation Deck */}
      <RoundNavigationCards
        currentMode={currentMode}
        onSelectMode={onSelectMode}
        onGoToOpeningPage={onGoToOpeningPage}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', background: 'var(--bg-glass)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="header-tag" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
              PERSONALITY IDENTIFICATION
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              Organizer Dashboard
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage {questions.length} Questions • Upload 2 images per question (Clue Image + Answer Image) • Set Personality Name &amp; Clues
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={onResetToDemo} title="Reload default demo personality questions">
            <RotateCcw size={16} />
            <span>Reset Demo Quiz</span>
          </button>
          <button className="btn-secondary" onClick={createNewQuestion}>
            <Plus size={16} />
            <span>Add Question</span>
          </button>
          <button className="btn-glow" onClick={onStartPresentation} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)' }}>
            <Eye size={18} />
            <span>Start Presentation</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Question Cards List + Question Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: draftQ ? '1fr 1fr' : '1fr', gap: '24px' }}>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {questions.map((q, idx) => {
            const isEditing = editingIndex === idx;

            return (
              <div
                key={q.id || idx}
                className={`thumb-card ${isEditing ? 'active-slide' : ''}`}
                draggable
                onDragStart={() => handleSortStart(idx)}
                onDragEnter={() => handleSortEnter(idx)}
                onDragEnd={handleSortEnd}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => startEdit(idx)}
                style={{ padding: '16px', borderRadius: '14px', cursor: 'pointer' }}
              >
                {/* Drag Handle */}
                <div style={{ color: 'var(--text-muted)', cursor: 'grab' }}>
                  <GripVertical size={18} />
                </div>

                {/* Dual Image Thumbnails Preview (Clue + Answer) */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <div style={{ width: '60px', height: '55px', background: '#000', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)', position: 'relative' }}>
                    {q.clueImage ? (
                      <img src={q.clueImage} alt="Clue" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <ImageIcon size={16} style={{ opacity: 0.3 }} />
                    )}
                    <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(0,0,0,0.7)', fontSize: '0.55rem', padding: '1px 3px', borderRadius: '3px', color: '#38bdf8', fontWeight: 800 }}>CLUE</span>
                  </div>

                  <div style={{ width: '60px', height: '55px', background: '#000', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)', position: 'relative' }}>
                    {q.answerImage ? (
                      <img src={q.answerImage} alt="Answer" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <ImageIcon size={16} style={{ opacity: 0.3 }} />
                    )}
                    <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(0,0,0,0.7)', fontSize: '0.55rem', padding: '1px 3px', borderRadius: '3px', color: '#4ade80', fontWeight: 800 }}>ANS</span>
                  </div>
                </div>

                {/* Question Info */}
                <div style={{ flex: 1, minWidth: 0, marginLeft: '12px' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    Q{q.questionNumber}: {q.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={14} />
                    <span>Personality: {q.name || 'Not specified'}</span>
                  </div>
                  {q.explanation && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.explanation}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button className="action-icon-btn" onClick={(e) => { e.stopPropagation(); startEdit(idx); }} title="Edit Question">
                    <Edit3 size={15} />
                  </button>
                  <button className="action-icon-btn" onClick={(e) => duplicateQuestion(idx, e)} title="Duplicate Question">
                    <Copy size={15} />
                  </button>
                  <button className="action-icon-btn" onClick={(e) => moveUp(idx, e)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.3 : 1 }} title="Move Up">
                    <ArrowUp size={15} />
                  </button>
                  <button className="action-icon-btn" onClick={(e) => moveDown(idx, e)} disabled={idx === questions.length - 1} style={{ opacity: idx === questions.length - 1 ? 0.3 : 1 }} title="Move Down">
                    <ArrowDown size={15} />
                  </button>
                  <button className="action-icon-btn danger" onClick={(e) => deleteQuestion(idx, e)} title="Delete Question">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Question Editor Panel */}
        {draftQ && (
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800 }}>
                Edit Personality Question #{draftQ.questionNumber}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-glow" onClick={saveDraft} style={{ padding: '6px 14px', fontSize: '0.82rem', background: 'linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)' }}>
                  <Save size={14} /> Save Question
                </button>
                <button className="btn-secondary" onClick={() => setDraftQ(null)} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                  Cancel
                </button>
              </div>
            </div>

            {/* Prompt / Title */}
            <div>
              <label className="setting-name" style={{ display: 'block', marginBottom: '6px' }}>Question Title / Prompt</label>
              <input
                type="text"
                className="custom-select"
                style={{ width: '100%', fontSize: '0.95rem' }}
                value={draftQ.title}
                onChange={(e) => setDraftQ((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                placeholder="e.g. Question 1: Identify this business personality"
              />
            </div>

            {/* Personality Name Field */}
            <div>
              <label className="setting-name" style={{ display: 'block', marginBottom: '6px', color: '#38bdf8', fontWeight: 700 }}>
                Personality's Name (Revealed when "Show Answer" is pressed)
              </label>
              <input
                type="text"
                className="custom-select"
                style={{ width: '100%', fontSize: '1.05rem', fontWeight: 700, color: '#fff', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                value={draftQ.name}
                onChange={(e) => setDraftQ((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                placeholder="e.g. Ratan Tata"
              />
            </div>

            {/* Dual Image Uploaders: Clue Image & Answer Image */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* 1. Clue Image Upload Box */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="setting-name" style={{ fontSize: '0.82rem', color: '#7dd3fc', fontWeight: 700, marginBottom: 0 }}>
                    1. Clue Image (Visible)
                  </label>
                  {activeUploadTarget === 'clue' && (
                    <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700, background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                      🎯 Active for Ctrl+V
                    </span>
                  )}
                </div>

                <div
                  tabIndex={0}
                  onClick={() => {
                    setActiveUploadTarget('clue');
                    activeUploadTargetRef.current = 'clue';
                  }}
                  onFocus={() => {
                    setActiveUploadTarget('clue');
                    activeUploadTargetRef.current = 'clue';
                  }}
                  onPaste={(e) => {
                    e.stopPropagation();
                    handlePaste(e);
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverTarget('clue'); }}
                  onDragLeave={() => setDragOverTarget(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverTarget(null);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processImageFileForTarget(file, 'clue');
                  }}
                  style={{
                    height: '160px',
                    background: dragOverTarget === 'clue' ? '#0369a1' : '#090d16',
                    border: activeUploadTarget === 'clue'
                      ? '2px solid #38bdf8'
                      : draftQ.clueImage
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '2px dashed rgba(255, 255, 255, 0.18)',
                    boxShadow: activeUploadTarget === 'clue' ? '0 0 14px rgba(56, 189, 248, 0.3)' : 'none',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {draftQ.clueImage ? (
                    <>
                      <img src={draftQ.clueImage} alt="Clue" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
                      <div
                        className="logo-hover-overlay"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(8, 12, 20, 0.85)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          opacity: 0,
                          transition: 'opacity 0.2s ease'
                        }}
                      >
                        <button
                          type="button"
                          className="btn-glow"
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          onClick={() => triggerFileInput('clue')}
                        >
                          <Upload size={12} /> Replace
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          onClick={() => setPreviewImageUrl(draftQ.clueImage)}
                        >
                          <Maximize2 size={12} /> View
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn danger"
                          onClick={(e) => { e.stopPropagation(); setDraftQ((prev) => (prev ? { ...prev, clueImage: '' } : prev)); }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px', textAlign: 'center' }}>
                      <Upload size={20} className="text-sky-400" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Upload Clue Image</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Browse or Ctrl+V</span>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        <button type="button" className="btn-secondary" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={() => triggerFileInput('clue')}>
                          Browse
                        </button>
                        <button type="button" className="btn-secondary" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={(e) => handleClipboardButtonClick('clue', e)}>
                          Paste
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Answer Image Upload Box */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="setting-name" style={{ fontSize: '0.82rem', color: '#4ade80', fontWeight: 700, marginBottom: 0 }}>
                    2. Answer Image (Blurred Initially)
                  </label>
                  {activeUploadTarget === 'answer' && (
                    <span style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 700, background: 'rgba(74, 222, 128, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                      🎯 Active for Ctrl+V
                    </span>
                  )}
                </div>

                <div
                  tabIndex={0}
                  onClick={() => {
                    setActiveUploadTarget('answer');
                    activeUploadTargetRef.current = 'answer';
                  }}
                  onFocus={() => {
                    setActiveUploadTarget('answer');
                    activeUploadTargetRef.current = 'answer';
                  }}
                  onPaste={(e) => {
                    e.stopPropagation();
                    handlePaste(e);
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverTarget('answer'); }}
                  onDragLeave={() => setDragOverTarget(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverTarget(null);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processImageFileForTarget(file, 'answer');
                  }}
                  style={{
                    height: '160px',
                    background: dragOverTarget === 'answer' ? '#15803d' : '#090d16',
                    border: activeUploadTarget === 'answer'
                      ? '2px solid #4ade80'
                      : draftQ.answerImage
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '2px dashed rgba(255, 255, 255, 0.18)',
                    boxShadow: activeUploadTarget === 'answer' ? '0 0 14px rgba(74, 222, 128, 0.3)' : 'none',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {draftQ.answerImage ? (
                    <>
                      <img src={draftQ.answerImage} alt="Answer Portrait" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
                      <div
                        className="logo-hover-overlay"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(8, 12, 20, 0.85)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          opacity: 0,
                          transition: 'opacity 0.2s ease'
                        }}
                      >
                        <button
                          type="button"
                          className="btn-glow"
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          onClick={() => triggerFileInput('answer')}
                        >
                          <Upload size={12} /> Replace
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                          onClick={() => setPreviewImageUrl(draftQ.answerImage)}
                        >
                          <Maximize2 size={12} /> View
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn danger"
                          onClick={(e) => { e.stopPropagation(); setDraftQ((prev) => (prev ? { ...prev, answerImage: '' } : prev)); }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px', textAlign: 'center' }}>
                      <Upload size={20} className="text-emerald-400" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Upload Answer Image</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Browse or Ctrl+V</span>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        <button type="button" className="btn-secondary" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={() => triggerFileInput('answer')}>
                          Browse
                        </button>
                        <button type="button" className="btn-secondary" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={(e) => handleClipboardButtonClick('answer', e)}>
                          Paste
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Explanation / Notes */}
            <div>
              <label className="setting-name" style={{ display: 'block', marginBottom: '6px' }}>Explanation Notes / Clues Detail</label>
              <textarea
                className="custom-select"
                style={{ width: '100%', height: '60px', resize: 'none' }}
                value={draftQ.explanation || ''}
                onChange={(e) => setDraftQ((prev) => (prev ? { ...prev, explanation: e.target.value } : prev))}
                placeholder="Details revealed along with the personality's name..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={previewImageUrl}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
            />
            <button
              onClick={() => setPreviewImageUrl(null)}
              style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                background: '#dc2626',
                color: '#fff',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 20px',
          background: 'rgba(16, 185, 129, 0.9)',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 999
        }}>
          <Check size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
