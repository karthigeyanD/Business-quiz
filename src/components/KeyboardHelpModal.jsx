import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function KeyboardHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Left Arrow (←)', desc: 'Previous Question' },
    { key: 'Right Arrow (→)', desc: 'Next Question' },
    { key: 'Spacebar', desc: 'Show Answer / Reveal' },
    { key: 'F / F11', desc: 'Toggle Full-Screen Projector Mode' },
    { key: 'Esc', desc: 'Exit Fullscreen' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Keyboard size={22} className="text-indigo-400" />
            <h3 className="modal-title">Keyboard Shortcuts &amp; Controls</h3>
          </div>
          <button className="action-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="shortcut-grid">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="shortcut-item">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.desc}</span>
              <span className="kbd-badge">{s.key}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          💡 <strong>Projector Tip:</strong> Navigation and answer reveal controls are fully accessible via keyboard. During full-screen presentation mode, controls hide automatically after mouse inactivity.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-glow" onClick={onClose} style={{ padding: '8px 20px' }}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
