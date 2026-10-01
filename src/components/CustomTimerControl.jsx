import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, Edit2, Check } from 'lucide-react';

export default function CustomTimerControl({
  timerDuration,
  onUpdateTimerDuration,
  timeLeft,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  accentColor = '#06b6d4'
}) {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customInputValue, setCustomInputValue] = useState(timerDuration || 30);

  // Synchronize custom input with prop
  useEffect(() => {
    setCustomInputValue(timerDuration);
  }, [timerDuration]);

  const presetValues = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120, 0];

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsEditingCustom(true);
    } else {
      setIsEditingCustom(false);
      onUpdateTimerDuration(Number(val));
    }
  };

  const handleCustomSubmit = (e) => {
    if (e) e.preventDefault();
    const num = Math.max(1, Math.min(600, parseInt(customInputValue, 10) || 30));
    onUpdateTimerDuration(num);
    setIsEditingCustom(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Duration Selector or Custom Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '4px 10px',
          borderRadius: '10px',
          border: '1px solid var(--border-glass)'
        }}
      >
        <Clock size={16} style={{ color: accentColor }} />

        {isEditingCustom ? (
          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              min="1"
              max="600"
              value={customInputValue}
              onChange={(e) => setCustomInputValue(e.target.value)}
              style={{
                width: '54px',
                background: 'rgba(0,0,0,0.5)',
                border: `1px solid ${accentColor}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '2px 4px',
                textAlign: 'center',
                outline: 'none'
              }}
              autoFocus
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>s</span>
            <button
              type="submit"
              className="action-icon-btn"
              style={{ padding: '2px', color: '#4ade80' }}
              title="Apply Custom Timer"
            >
              <Check size={14} />
            </button>
          </form>
        ) : (
          <select
            value={presetValues.includes(timerDuration) ? timerDuration : 'custom'}
            onChange={handleSelectChange}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
            title="Configure Timer Duration"
          >
            <option value={5} style={{ background: '#0f172a' }}>5s Timer</option>
            <option value={10} style={{ background: '#0f172a' }}>10s Timer</option>
            <option value={15} style={{ background: '#0f172a' }}>15s Timer</option>
            <option value={20} style={{ background: '#0f172a' }}>20s Timer</option>
            <option value={25} style={{ background: '#0f172a' }}>25s Timer</option>
            <option value={30} style={{ background: '#0f172a' }}>30s Timer</option>
            <option value={45} style={{ background: '#0f172a' }}>45s Timer</option>
            <option value={60} style={{ background: '#0f172a' }}>60s Timer (1m)</option>
            <option value={90} style={{ background: '#0f172a' }}>90s Timer (1.5m)</option>
            <option value={120} style={{ background: '#0f172a' }}>120s Timer (2m)</option>
            {!presetValues.includes(timerDuration) && (
              <option value="custom" style={{ background: '#0f172a' }}>
                Custom ({timerDuration}s)
              </option>
            )}
            <option value="custom" style={{ background: '#0f172a' }}>✏️ Custom Duration...</option>
            <option value={0} style={{ background: '#0f172a' }}>Timer Off</option>
          </select>
        )}

        {!isEditingCustom && (
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => setIsEditingCustom(true)}
            title="Set Custom Seconds"
            style={{ padding: '2px', opacity: 0.7 }}
          >
            <Edit2 size={12} />
          </button>
        )}
      </div>

      {/* Live Timer Countdown Display & Controls */}
      {timerDuration > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.85)',
            padding: '4px 12px',
            borderRadius: '999px',
            border: '1px solid var(--border-glass)'
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: timeLeft <= 5 && timeLeft > 0 ? '#f43f5e' : accentColor
            }}
            className={timeLeft <= 5 && timeLeft > 0 ? 'animate-pulse' : ''}
          >
            {timeLeft}s
          </span>

          <button
            type="button"
            className="action-icon-btn"
            onClick={onToggleTimer}
            title={isTimerRunning ? "Pause Timer" : "Start Timer"}
          >
            {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {onResetTimer && (
            <button
              type="button"
              className="action-icon-btn"
              onClick={onResetTimer}
              title="Reset Timer"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
