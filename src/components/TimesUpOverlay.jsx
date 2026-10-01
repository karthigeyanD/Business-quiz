import React from 'react';
import { ChevronRight, RotateCcw, Eye, Clock } from 'lucide-react';

export default function TimesUpOverlay({
  isVisible,
  onDismiss,
  onNextQuestion,
  onRestartTimer
}) {
  if (!isVisible) return null;

  return (
    <div className="times-up-stage-overlay" onClick={onDismiss}>
      <div className="times-up-banner-stage" onClick={(e) => e.stopPropagation()}>
        {/* Pulsing Clock Icon */}
        <div className="times-up-clock-icon">
          <Clock size={56} className="text-amber-400" />
        </div>

        {/* Time is Over Badge */}
        <div className="stage-time-badge">TIME IS OVER!</div>

        {/* TIME'S UP Bold Heading */}
        <h1 className="stage-time-title">TIME'S UP!</h1>
        <p className="stage-time-subtext">
          Question time has expired for this round.
        </p>

        {/* Organizer Action Buttons */}
        <div className="stage-action-buttons">
          {onNextQuestion && (
            <button className="btn-glow btn-stage-next" onClick={onNextQuestion}>
              <span>Next Question</span>
              <ChevronRight size={20} />
            </button>
          )}

          {onRestartTimer && (
            <button className="btn-stage-action btn-stage-reset" onClick={onRestartTimer}>
              <RotateCcw size={16} />
              <span>Restart Timer</span>
            </button>
          )}

          <button className="btn-stage-action btn-stage-dismiss" onClick={onDismiss}>
            <Eye size={16} />
            <span>Show Question</span>
          </button>
        </div>
      </div>
    </div>
  );
}
