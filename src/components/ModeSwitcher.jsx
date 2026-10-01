import React from 'react';
import { LayoutDashboard, PlayCircle, Sparkles, Layers, UserCheck, Timer, Home } from 'lucide-react';

export default function ModeSwitcher({
  currentMode,
  onSelectMode,
  quizSubMode,
  onSelectQuizSubMode,
  brandInImageSubMode,
  onSelectBrandInImageSubMode,
  personalitySubMode,
  onSelectPersonalitySubMode,
  onGoToOpeningPage
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 0, 0, 0.4)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      {/* 0. Opening Page Button */}
      <button
        className="pill-btn"
        onClick={onGoToOpeningPage}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
        title="Return to Opening Page"
      >
        <Home size={15} style={{ color: '#38bdf8' }} />
        <span>Opening Page</span>
      </button>

      <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

      {/* 1. Round 2 — Logo Identification */}
      <button
        className={`pill-btn ${currentMode === 'quiz' ? 'active' : ''}`}
        onClick={() => onSelectMode('quiz')}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
      >
        <Sparkles size={15} style={{ color: '#06b6d4' }} />
        <span>Round 2: Logo ID</span>
      </button>

      {/* Sub-tabs for Round 2 */}
      {currentMode === 'quiz' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '2px', paddingRight: '4px', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <button
            className={`pill-btn ${quizSubMode === 'present' ? 'active' : ''}`}
            onClick={() => onSelectQuizSubMode('present')}
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            <PlayCircle size={13} style={{ marginRight: '4px' }} />
            <span>Stage</span>
          </button>
          <button
            className={`pill-btn ${quizSubMode === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectQuizSubMode('dashboard')}
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            <LayoutDashboard size={13} style={{ marginRight: '4px' }} />
            <span>Dashboard</span>
          </button>
        </div>
      )}

      {/* 2. Round 4 — Personality Identification */}
      <button
        className={`pill-btn ${currentMode === 'personality' ? 'active' : ''}`}
        onClick={() => onSelectMode('personality')}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
      >
        <UserCheck size={15} style={{ color: '#818cf8' }} />
        <span>Round 4: Personality ID</span>
      </button>

      {/* Sub-tabs for Round 4 */}
      {currentMode === 'personality' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '2px', paddingRight: '4px', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <button
            className={`pill-btn ${personalitySubMode === 'present' ? 'active' : ''}`}
            onClick={() => onSelectPersonalitySubMode('present')}
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            <PlayCircle size={13} style={{ marginRight: '4px' }} />
            <span>Stage</span>
          </button>
          <button
            className={`pill-btn ${personalitySubMode === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectPersonalitySubMode('dashboard')}
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            <LayoutDashboard size={13} style={{ marginRight: '4px' }} />
            <span>Dashboard</span>
          </button>
        </div>
      )}

      {/* 3. Round 5 — Brand in Image */}
      <button
        className={`pill-btn ${currentMode === 'brandInImage' ? 'active' : ''}`}
        onClick={() => onSelectMode('brandInImage')}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
      >
        <Layers size={15} style={{ color: '#c084fc' }} />
        <span>Round 5: Brand in Image</span>
      </button>

      {/* Sub-tabs for Round 3 */}
      {currentMode === 'brandInImage' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '2px', paddingRight: '4px', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <button
            className={`pill-btn ${brandInImageSubMode === 'present' ? 'active' : ''}`}
            onClick={() => onSelectBrandInImageSubMode('present')}
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            <PlayCircle size={13} style={{ marginRight: '4px' }} />
            <span>Stage</span>
          </button>
          <button
            className={`pill-btn ${brandInImageSubMode === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectBrandInImageSubMode('dashboard')}
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            <LayoutDashboard size={13} style={{ marginRight: '4px' }} />
            <span>Dashboard</span>
          </button>
        </div>
      )}

      <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

      {/* 4. Egg Timer Tool */}
      <button
        className={`pill-btn ${currentMode === 'eggTimer' ? 'active' : ''}`}
        onClick={() => onSelectMode('eggTimer')}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
      >
        <Timer size={15} style={{ color: '#fbbf24' }} />
        <span>Egg Timer</span>
      </button>
    </div>
  );
}
