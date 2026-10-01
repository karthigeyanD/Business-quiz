import React from 'react';
import { Maximize, HelpCircle, Sparkles } from 'lucide-react';
import ModeSwitcher from './ModeSwitcher';

export default function Header({
  appMode,
  onSelectAppMode,
  quizSubMode,
  onSelectQuizSubMode,
  brandInImageSubMode,
  onSelectBrandInImageSubMode,
  personalitySubMode,
  onSelectPersonalitySubMode,
  onToggleFullscreen,
  onOpenHelp,
  onGoToOpeningPage
}) {
  return (
    <header className="header-bar">
      {/* Brand & Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="brand-logo">
          <div className="brand-icon-wrapper">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">BUSINESS QUIZ</span>
              <span className="header-tag">AMCET</span>
            </div>
          </div>
        </div>

        {/* Mode Switcher Pills */}
        <ModeSwitcher
          currentMode={appMode}
          onSelectMode={onSelectAppMode}
          quizSubMode={quizSubMode}
          onSelectQuizSubMode={onSelectQuizSubMode}
          brandInImageSubMode={brandInImageSubMode}
          onSelectBrandInImageSubMode={onSelectBrandInImageSubMode}
          personalitySubMode={personalitySubMode}
          onSelectPersonalitySubMode={onSelectPersonalitySubMode}
          onGoToOpeningPage={onGoToOpeningPage}
        />
      </div>

      {/* Right Header Actions */}
      <div className="header-actions">
        {appMode === 'quiz' ? (
          /* Logo Quiz Mode Quick Action */
          <button
            className="btn-glow"
            onClick={() => onSelectQuizSubMode(quizSubMode === 'present' ? 'dashboard' : 'present')}
          >
            <span>{quizSubMode === 'present' ? 'Organizer Dashboard' : 'Start Quiz Presentation'}</span>
          </button>
        ) : appMode === 'brandInImage' ? (
          /* Brand in Image Mode Quick Action */
          <button
            className="btn-glow"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}
            onClick={() => onSelectBrandInImageSubMode(brandInImageSubMode === 'present' ? 'dashboard' : 'present')}
          >
            <span>{brandInImageSubMode === 'present' ? 'Organizer Dashboard' : 'Start Presentation'}</span>
          </button>
        ) : appMode === 'personality' ? (
          /* Personality Identification Mode Quick Action */
          <button
            className="btn-glow"
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)' }}
            onClick={() => onSelectPersonalitySubMode(personalitySubMode === 'present' ? 'dashboard' : 'present')}
          >
            <span>{personalitySubMode === 'present' ? 'Organizer Dashboard' : 'Start Presentation'}</span>
          </button>
        ) : (
          /* Egg Timer Mode Quick Action */
          <button
            className="btn-glow"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
            onClick={onToggleFullscreen}
          >
            <span>Full Screen Projector View</span>
          </button>
        )}

        <button className="btn-secondary" onClick={onToggleFullscreen} title="Full Screen Presentation Mode (F)">
          <Maximize size={18} />
        </button>

        <button className="btn-secondary" onClick={onOpenHelp} title="Keyboard Shortcuts &amp; Guide">
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
}
