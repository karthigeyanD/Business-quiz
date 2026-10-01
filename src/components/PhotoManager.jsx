import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, ArrowUp, ArrowDown, RotateCw, Edit3, Image as ImageIcon, GripVertical, Check, X, Sparkles } from 'lucide-react';

export default function PhotoManager({
  slides,
  currentIndex,
  onSelectSlide,
  onAddPhotos,
  onRemovePhoto,
  onReorderPhotos,
  onRotatePhoto,
  onUpdateCaption,
  onClearAll,
  fileInputRef
}) {
  const [dragActive, setDragActive] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  
  // Drag reorder state
  const dragItemRef = useRef(null);
  const dragOverItemRef = useRef(null);

  // Clipboard Ctrl+V Paste Handler for Photo Manager
  useEffect(() => {
    const handlePaste = (e) => {
      // Ignore if user is editing text in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }
      const files = e.clipboardData?.files;
      const items = e.clipboardData?.items;
      const imageFiles = [];

      if (files && files.length > 0) {
        Array.from(files).forEach((f) => {
          if (f.type.startsWith('image/')) imageFiles.push(f);
        });
      }
      if (imageFiles.length === 0 && items && items.length > 0) {
        Array.from(items).forEach((item) => {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) imageFiles.push(file);
          }
        });
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        onAddPhotos(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onAddPhotos]);

  // File Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddPhotos(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddPhotos(e.target.files);
    }
  };

  // Thumbnail Reordering via Drag
  const handleSortStart = (index) => {
    dragItemRef.current = index;
  };

  const handleSortEnter = (index) => {
    dragOverItemRef.current = index;
  };

  const handleSortEnd = () => {
    if (dragItemRef.current !== null && dragOverItemRef.current !== null && dragItemRef.current !== dragOverItemRef.current) {
      const copy = [...slides];
      const draggedItemContent = copy[dragItemRef.current];
      copy.splice(dragItemRef.current, 1);
      copy.splice(dragOverItemRef.current, 0, draggedItemContent);
      onReorderPhotos(copy);
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  const moveUp = (e, index) => {
    e.stopPropagation();
    if (index > 0) {
      const copy = [...slides];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      onReorderPhotos(copy);
    }
  };

  const moveDown = (e, index) => {
    e.stopPropagation();
    if (index < slides.length - 1) {
      const copy = [...slides];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      onReorderPhotos(copy);
    }
  };

  const startEditing = (e, slide) => {
    e.stopPropagation();
    setEditingId(slide.id);
    setEditTitle(slide.title || '');
    setEditCaption(slide.caption || '');
  };

  const saveEditing = (e, id) => {
    e.stopPropagation();
    onUpdateCaption(id, editTitle, editCaption);
    setEditingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Drag & Drop Upload Zone */}
      <div
        className={`dropzone-box ${dragActive ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="dropzone-icon">
          <Upload size={24} />
        </div>
        <div>
          <div className="dropzone-title">Upload Photos</div>
          <div className="dropzone-sub">Drag &amp; drop images here or click to browse</div>
        </div>
        <div className="header-tag" style={{ fontSize: '0.7rem' }}>JPG, PNG, WEBP</div>
      </div>

      {/* Slide Count & Header */}
      <div className="section-header">
        <div className="section-title">
          <ImageIcon size={18} className="text-indigo-400" />
          <span>Photos List ({slides.length})</span>
        </div>
        {slides.length > 0 && (
          <button
            className="action-icon-btn danger"
            onClick={onClearAll}
            title="Clear all photos"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Thumbnail List */}
      <div className="thumb-list">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const isEditing = slide.id === editingId;

          return (
            <div
              key={slide.id}
              className={`thumb-card ${isActive ? 'active-slide' : ''}`}
              draggable
              onDragStart={() => handleSortStart(idx)}
              onDragEnter={() => handleSortEnter(idx)}
              onDragEnd={handleSortEnd}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => onSelectSlide(idx)}
              style={{ cursor: 'pointer' }}
            >
              {/* Drag Handle Icon */}
              <div style={{ color: 'var(--text-muted)', cursor: 'grab' }}>
                <GripVertical size={16} />
              </div>

              {/* Thumbnail Image */}
              <div className="thumb-img-wrapper">
                <img
                  src={slide.url}
                  alt={slide.name}
                  className="thumb-img"
                  style={{ transform: slide.rotation ? `rotate(${slide.rotation}deg)` : undefined }}
                />
              </div>

              {/* Info & inline editor */}
              <div className="thumb-info">
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      className="custom-select"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Slide Title / Question..."
                      autoFocus
                    />
                    <input
                      type="text"
                      className="custom-select"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Subtitle / Presenter Note..."
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-glow" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={(e) => saveEditing(e, slide.id)}>
                        <Check size={14} /> Save
                      </button>
                      <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="thumb-name">{slide.title || slide.name}</div>
                    <div className="thumb-meta">
                      {slide.caption ? slide.caption : `Slide #${idx + 1}`}
                    </div>
                  </>
                )}
              </div>

              {/* Slide Actions */}
              {!isEditing && (
                <div className="thumb-actions">
                  {/* Edit Title/Caption */}
                  <button
                    className="action-icon-btn"
                    onClick={(e) => startEditing(e, slide)}
                    title="Edit Title &amp; Presenter Note"
                  >
                    <Edit3 size={15} />
                  </button>

                  {/* Rotate 90deg */}
                  <button
                    className="action-icon-btn"
                    onClick={(e) => { e.stopPropagation(); onRotatePhoto(slide.id); }}
                    title="Rotate 90°"
                  >
                    <RotateCw size={15} />
                  </button>

                  {/* Move Up */}
                  <button
                    className="action-icon-btn"
                    onClick={(e) => moveUp(e, idx)}
                    disabled={idx === 0}
                    style={{ opacity: idx === 0 ? 0.3 : 1 }}
                    title="Move Up"
                  >
                    <ArrowUp size={15} />
                  </button>

                  {/* Move Down */}
                  <button
                    className="action-icon-btn"
                    onClick={(e) => moveDown(e, idx)}
                    disabled={idx === slides.length - 1}
                    style={{ opacity: idx === slides.length - 1 ? 0.3 : 1 }}
                    title="Move Down"
                  >
                    <ArrowDown size={15} />
                  </button>

                  {/* Delete */}
                  <button
                    className="action-icon-btn danger"
                    onClick={(e) => { e.stopPropagation(); onRemovePhoto(slide.id); }}
                    title="Remove Photo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
