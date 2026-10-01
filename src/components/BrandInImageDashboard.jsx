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
  Maximize2
} from 'lucide-react';
import RoundNavigationCards from './RoundNavigationCards';

export default function BrandInImageDashboard({
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
  const [dragOverDropzone, setDragOverDropzone] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const imageFileInputRef = useRef(null);

  // Drag reorder state
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setDraftQ(JSON.parse(JSON.stringify(questions[index])));
  };

  const createNewQuestion = () => {
    const newQ = {
      id: `bii-custom-${Date.now()}`,
      questionNumber: questions.length + 1,
      title: `Question ${questions.length + 1}: Identify the brand in this image`,
      image: '',
      options: ['Starbucks', "Dunkin'", 'Costa Coffee', 'Tim Hortons'],
      correctOption: 'A',
      brandName: 'Starbucks',
      explanation: 'Explanation for correct brand answer.'
    };
    const updated = [...questions, newQ];
    onSaveQuestions(updated);
    startEdit(questions.length);
    showToast('New question created!');
  };

  const duplicateQuestion = (index, e) => {
    e.stopPropagation();
    const sourceQ = questions[index];
    const cloned = JSON.parse(JSON.stringify(sourceQ));
    cloned.id = `bii-custom-${Date.now()}`;
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

  const draftQRef = useRef(draftQ);
  const questionsRef = useRef(questions);

  useEffect(() => {
    draftQRef.current = draftQ;
  }, [draftQ]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  // Image processing (File or Data URL)
  const processImageFile = useCallback((file) => {
    if (!file) return false;
    const isImg = file.type.startsWith('image/') || file.type.includes('image') || file.type.includes('svg');
    if (!isImg) return false;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      setDraftQ((prev) => (prev ? { ...prev, image: dataUrl } : prev));
      showToast('✅ Brand Image file pasted successfully!');
    };
    reader.readAsDataURL(file);
    return true;
  }, [showToast]);

  const processImageUrlString = useCallback((text) => {
    if (!text) return false;
    const trimmed = text.trim().replace(/^["']|["']$/g, '');
    const isImageBase64 = trimmed.startsWith('data:image/') || trimmed.startsWith('blob:');
    const isHttpUrl = /^https?:\/\/.+/i.test(trimmed);

    if (isImageBase64 || isHttpUrl) {
      setDraftQ((prev) => (prev ? { ...prev, image: trimmed } : prev));
      showToast('✅ Pasted image URL successfully!');
      return true;
    }
    return false;
  }, [showToast]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (e.target) e.target.value = '';
  };

  // Clipboard paste (Ctrl+V) listener
  const handlePaste = useCallback((e) => {
    let handled = false;

    // 1. Files in clipboard
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/') || files[i].type.includes('image') || files[i].type.includes('svg')) {
          e.preventDefault();
          processImageFile(files[i]);
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
            processImageFile(file);
            handled = true;
            return;
          }
        }
      }
    }

    // 3. Text image URL
    const text = e.clipboardData?.getData('text') || e.clipboardData?.getData('text/plain');
    if (!handled && text) {
      const activeEl = document.activeElement;
      const isFocusedOnOptionInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && activeEl.placeholder?.includes('Option');

      if (!isFocusedOnOptionInput || text.startsWith('data:image/') || /^https?:\/\/.+/i.test(text.trim())) {
        if (processImageUrlString(text)) {
          e.preventDefault();
          handled = true;
        }
      }
    }
  }, [processImageFile, processImageUrlString]);

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

  const handleClipboardButtonClick = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/') || t.includes('image'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], 'pasted-brand-image.png', { type: imageType });
            processImageFile(file);
            return;
          }
        }
      }
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && processImageUrlString(text)) {
          return;
        }
      }
      const promptVal = window.prompt('Paste image URL or Base64 string for Brand image:');
      if (promptVal && processImageUrlString(promptVal)) {
        return;
      }
    } catch (err) {
      console.warn('Clipboard read notice:', err);
      const promptVal = window.prompt('Paste image URL or Base64 string for Brand image (or press Ctrl+V):');
      if (promptVal && processImageUrlString(promptVal)) {
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
        ref={imageFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', background: 'var(--bg-glass)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="header-tag" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', borderColor: 'rgba(168, 85, 247, 0.4)' }}>
              BRAND IN IMAGE
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              Organizer Dashboard
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage {questions.length} Questions • Upload 1 large brand image per question • Set A/B/C/D choices &amp; correct brand
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={onResetToDemo} title="Reload default demo brand questions">
            <RotateCcw size={16} />
            <span>Reset Demo Quiz</span>
          </button>
          <button className="btn-secondary" onClick={createNewQuestion}>
            <Plus size={16} />
            <span>Add Question</span>
          </button>
          <button className="btn-glow" onClick={onStartPresentation}>
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

                {/* Single Image Thumbnail Preview */}
                <div style={{ width: '80px', height: '60px', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-glass)' }}>
                  {q.image ? (
                    <img src={q.image} alt="Brand" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <ImageIcon size={20} style={{ opacity: 0.3 }} />
                  )}
                </div>

                {/* Question Info */}
                <div style={{ flex: 1, minWidth: 0, marginLeft: '14px' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    Q{q.questionNumber}: {q.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Choices: {q.options.join(' • ')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
                    Correct: Option {q.correctOption} ({q.brandName || q.options[letterToIdx(q.correctOption)]})
                  </div>
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
                Edit Brand Question #{draftQ.questionNumber}
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

            {/* Title / Prompt */}
            <div>
              <label className="setting-name" style={{ display: 'block', marginBottom: '6px' }}>Question Prompt / Title</label>
              <input
                type="text"
                className="custom-select"
                style={{ width: '100%', fontSize: '0.95rem' }}
                value={draftQ.title}
                onChange={(e) => setDraftQ({ ...draftQ, title: e.target.value })}
                placeholder="e.g. Question 1: Identify the brand featured in this image"
              />
            </div>

            {/* Single Large Image Upload Dropzone */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="setting-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 0 }}>
                  <ImageIcon size={16} className="text-purple-400" />
                  <span>Question Image (1 Large Brand Image)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Drop file or press</span>
                  <kbd style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', color: '#c084fc', fontWeight: 700 }}>
                    Ctrl + V
                  </kbd>
                </div>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverDropzone(true); }}
                onDragLeave={() => setDragOverDropzone(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverDropzone(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processImageFile(file);
                }}
                style={{
                  height: '200px',
                  background: dragOverDropzone ? '#1e1b4b' : '#090d16',
                  border: dragOverDropzone
                    ? '2px dashed #a855f7'
                    : draftQ.image
                    ? '2px solid rgba(168, 85, 247, 0.5)'
                    : '2px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {draftQ.image ? (
                  <>
                    <img
                      src={draftQ.image}
                      alt="Question Brand"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }}
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
                        gap: '10px',
                        opacity: 0,
                        transition: 'opacity 0.2s ease'
                      }}
                    >
                      <button
                        type="button"
                        className="btn-glow"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => imageFileInputRef.current?.click()}
                      >
                        <Upload size={14} /> Replace Image
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => setPreviewImageUrl(draftQ.image)}
                      >
                        <Maximize2 size={14} /> Preview
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={handleClipboardButtonClick}
                      >
                        <Clipboard size={14} /> Paste (Ctrl+V)
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn danger"
                        onClick={() => setDraftQ({ ...draftQ, image: '' })}
                        title="Remove Image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                      <Upload size={24} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Upload Brand Image</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Drag &amp; drop file here, browse, or press Ctrl+V to paste
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                        onClick={() => imageFileInputRef.current?.click()}
                      >
                        Browse File...
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '0.75rem', borderColor: 'rgba(168, 85, 247, 0.4)' }}
                        onClick={handleClipboardButtonClick}
                      >
                        Paste (Ctrl+V)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Answer Options A, B, C, D */}
            <div>
              <label className="setting-name" style={{ display: 'block', marginBottom: '8px' }}>
                4 Brand Options (Select Radio for Correct Answer)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                  <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '24px', fontWeight: 800, color: '#c084fc', fontSize: '1rem' }}>{letter})</span>
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
                      placeholder={`Option ${letter} Brand Name`}
                    />
                    <input
                      type="radio"
                      name="correctBrandRadio"
                      checked={draftQ.correctOption === letter}
                      onChange={() => setDraftQ({ ...draftQ, correctOption: letter })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
                      title={`Set Option ${letter} as Correct Answer`}
                    />
                    <span style={{ fontSize: '0.78rem', color: draftQ.correctOption === letter ? '#10b981' : 'var(--text-muted)', fontWeight: draftQ.correctOption === letter ? 700 : 400 }}>
                      {draftQ.correctOption === letter ? 'Correct Answer' : 'Mark Correct'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Name & Explanation Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="setting-name" style={{ display: 'block', marginBottom: '6px' }}>Brand Name Revealed</label>
                <input
                  type="text"
                  className="custom-select"
                  style={{ width: '100%' }}
                  value={draftQ.brandName || ''}
                  onChange={(e) => setDraftQ({ ...draftQ, brandName: e.target.value })}
                  placeholder="e.g. Starbucks"
                />
              </div>
              <div>
                <label className="setting-name" style={{ display: 'block', marginBottom: '6px' }}>Explanation Notes</label>
                <input
                  type="text"
                  className="custom-select"
                  style={{ width: '100%' }}
                  value={draftQ.explanation || ''}
                  onChange={(e) => setDraftQ({ ...draftQ, explanation: e.target.value })}
                  placeholder="Revealed when 'Reveal Answer' is clicked..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Full-Size Preview Modal */}
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
              alt="Brand Preview"
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

function letterToIdx(letter) {
  switch (letter) {
    case 'A': return 0;
    case 'B': return 1;
    case 'C': return 2;
    case 'D': return 3;
    default: return 0;
  }
}
