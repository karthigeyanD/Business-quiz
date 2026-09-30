/**
 * ImageSlot — Reusable logo-image upload slot for Round 2 admin.
 *
 * Supports: click-to-upload, drag-and-drop, clipboard paste,
 * preview, replace, remove, and optional internal label.
 */
import { useCallback, useRef, useState } from 'react';

export default function ImageSlot({
  image,          // { data, label, uploadedAt } | null
  slotIndex,      // 0–3
  onUpload,       // (dataUrl: string) => void
  onRemove,       // () => void
  onLabelChange,  // (label: string) => void
  disabled,
}) {
  const fileRef = useRef(null);
  const dropRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => onUpload(reader.result);
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handlePaste = useCallback(
    (e) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          handleFile(item.getAsFile());
          return;
        }
      }
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  return (
    <div
      className={`r2-image-slot ${dragging ? 'dragging' : ''} ${image ? 'has-image' : ''}`}
      ref={dropRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div className="r2-slot-label">Logo {slotIndex + 1}</div>

      {image ? (
        <div className="r2-slot-preview">
          <img
            src={image.data}
            alt={image.label || `Logo ${slotIndex + 1}`}
            className="r2-slot-img"
          />
          <div className="r2-slot-actions">
            <button
              className="btn small ghost"
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
              title="Replace image"
            >
              🔄
            </button>
            <button
              className="btn small danger"
              onClick={onRemove}
              disabled={disabled}
              title="Remove image"
            >
              🗑️
            </button>
          </div>
          <input
            type="text"
            className="r2-slot-internal-label"
            placeholder="Internal label (host only)"
            value={image.label || ''}
            onChange={(e) => onLabelChange?.(e.target.value)}
            disabled={disabled}
          />
        </div>
      ) : (
        <div
          className="r2-slot-empty"
          onClick={() => !disabled && fileRef.current?.click()}
        >
          <span className="r2-slot-icon">🖼️</span>
          <span className="r2-slot-hint">
            Click, drag & drop,<br />or paste an image
          </span>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
