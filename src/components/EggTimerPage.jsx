import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, Timer } from 'lucide-react';
import { playTickSound, playCrackSound } from '../utils/eggSound';

export default function EggTimerPage() {
  // Preset and custom duration state
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [customDurationInput, setCustomDurationInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Active duration calculation
  const activeDuration = isCustomMode ? (parseInt(customDurationInput, 10) || 15) : selectedDuration;

  // Explicit Application State: 'idle' | 'running' | 'paused' | 'breaking' | 'broken'
  const [timerState, setTimerState] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Timers and references
  const timerRef = useRef(null);
  const breakTimeoutRef = useRef(null);
  const lastTickSecRef = useRef(null);

  // Helper to clear all active intervals and timeouts safely
  const clearAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (breakTimeoutRef.current) {
      clearTimeout(breakTimeoutRef.current);
      breakTimeoutRef.current = null;
    }
  };

  // Clean up timers on component unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Handle preset duration change
  const handleSelectPreset = (seconds) => {
    clearAllTimers();
    setIsCustomMode(false);
    setSelectedDuration(seconds);
    setTimeLeft(seconds);
    setTimerState('idle');
    lastTickSecRef.current = null;
  };

  // Handle custom input change
  const handleCustomInputChange = (e) => {
    const val = e.target.value;
    setCustomDurationInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      clearAllTimers();
      setTimeLeft(parsed);
      setTimerState('idle');
      lastTickSecRef.current = null;
    }
  };

  const handleEnableCustom = () => {
    clearAllTimers();
    setIsCustomMode(true);
    const parsed = parseInt(customDurationInput, 10) || 15;
    setTimeLeft(parsed);
    setTimerState('idle');
    lastTickSecRef.current = null;
  };

  // Start Timer Handler
  const handleStart = () => {
    clearAllTimers();

    let initialTime = timeLeft;
    if (timerState === 'idle' || timerState === 'broken' || timeLeft <= 0) {
      initialTime = activeDuration;
      setTimeLeft(activeDuration);
    }

    setTimerState('running');
    lastTickSecRef.current = null;

    // Start single reliable 1-second interval
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer reached exactly 0!
          clearAllTimers();
          
          // Sound effect on break
          if (soundEnabled) {
            playCrackSound();
          }

          // Transition to 'breaking' state for heavy final shake
          setTimerState('breaking');

          // After 450ms heavy shake, transition permanently to 'broken' state
          breakTimeoutRef.current = setTimeout(() => {
            setTimerState('broken');
          }, 450);

          return 0;
        }

        const nextTime = prev - 1;

        // Play subtle tick during final 5 seconds
        if (soundEnabled && nextTime <= 5 && nextTime > 0 && nextTime !== lastTickSecRef.current) {
          playTickSound();
          lastTickSecRef.current = nextTime;
        }

        return nextTime;
      });
    }, 1000);
  };

  // Pause Handler
  const handlePause = () => {
    if (timerState === 'running') {
      clearAllTimers();
      setTimerState('paused');
    }
  };

  // Resume Handler
  const handleResume = () => {
    if (timerState === 'paused' && timeLeft > 0) {
      clearAllTimers();
      setTimerState('running');

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearAllTimers();
            if (soundEnabled) {
              playCrackSound();
            }
            setTimerState('breaking');

            breakTimeoutRef.current = setTimeout(() => {
              setTimerState('broken');
            }, 450);

            return 0;
          }

          const nextTime = prev - 1;
          if (soundEnabled && nextTime <= 5 && nextTime > 0 && nextTime !== lastTickSecRef.current) {
            playTickSound();
            lastTickSecRef.current = nextTime;
          }

          return nextTime;
        });
      }, 1000);
    }
  };

  // Reset Handler
  const handleReset = () => {
    clearAllTimers();
    setTimerState('idle');
    setTimeLeft(activeDuration);
    lastTickSecRef.current = null;
  };

  // Calculate percentage remaining (100% down to 0%)
  const percentRemaining = activeDuration > 0 ? (timeLeft / activeDuration) * 100 : 0;

  // Tremble Level Determination (0 to 5)
  // 100 - 60% => level 0 (almost still)
  // 60 - 40%  => level 1 (gentle shake)
  // 40 - 20%  => level 2 (noticeable trembling)
  // 20 - 10%  => level 3 (strong trembling)
  // 10 - 0%   => level 4 (intense trembling)
  // breaking  => level 5 (heavy final shake at t=0)
  let shakeLevel = 0;
  if (timerState === 'idle' || timerState === 'broken') {
    shakeLevel = 0;
  } else if (timerState === 'breaking') {
    shakeLevel = 5;
  } else if (timerState === 'running' || timerState === 'paused') {
    if (percentRemaining >= 60) shakeLevel = 0;
    else if (percentRemaining >= 40) shakeLevel = 1;
    else if (percentRemaining >= 20) shakeLevel = 2;
    else if (percentRemaining >= 10) shakeLevel = 3;
    else shakeLevel = 4;
  }

  // Crack Level Determination (0 to 4)
  // > 30% => 0 (no cracks)
  // 20 - 30% => 1 (first small crack)
  // 10 - 20% => 2 (additional cracks)
  // 0 - 10%  => 3 (multiple visible cracks)
  // final 3s or breaking/broken => 4 (heavy cracking effect)
  let crackLevel = 0;
  if (timerState === 'idle') {
    crackLevel = 0;
  } else if (timerState === 'breaking' || timerState === 'broken' || timeLeft <= 3) {
    crackLevel = 4;
  } else if (timerState === 'running' || timerState === 'paused') {
    if (percentRemaining > 30) crackLevel = 0;
    else if (percentRemaining > 20) crackLevel = 1;
    else if (percentRemaining > 10) crackLevel = 2;
    else crackLevel = 3;
  }

  return (
    <div className={`egg-timer-page ${isPresentationMode ? 'presentation-mode' : ''}`}>
      {/* Controls Bar (Organizer Control Panel) */}
      {!isPresentationMode && (
        <div className="egg-controls-card glass-panel">
          <div className="controls-row">
            {/* Presets & Custom Duration */}
            <div className="control-group">
              <label className="control-label">
                <Timer size={16} /> Timer Duration:
              </label>
              <div className="preset-buttons">
                {[10, 15, 20, 30].map((sec) => (
                  <button
                    key={sec}
                    className={`pill-btn ${!isCustomMode && selectedDuration === sec ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(sec)}
                    disabled={timerState === 'running' || timerState === 'breaking'}
                  >
                    {sec}s
                  </button>
                ))}
                <button
                  className={`pill-btn ${isCustomMode ? 'active' : ''}`}
                  onClick={handleEnableCustom}
                  disabled={timerState === 'running' || timerState === 'breaking'}
                >
                  Custom
                </button>
              </div>

              {isCustomMode && (
                <div className="custom-input-wrapper">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    placeholder="Secs"
                    value={customDurationInput}
                    onChange={handleCustomInputChange}
                    className="custom-sec-input"
                    disabled={timerState === 'running' || timerState === 'breaking'}
                  />
                  <span className="input-unit">sec</span>
                </div>
              )}
            </div>

            {/* Actions: Start, Pause, Resume, Reset, Sound, Presentation */}
            <div className="control-group actions-group">
              {timerState === 'idle' || timerState === 'broken' ? (
                <button className="btn-action btn-start" onClick={handleStart}>
                  <Play size={18} /> Start
                </button>
              ) : timerState === 'running' ? (
                <button className="btn-action btn-pause" onClick={handlePause}>
                  <Pause size={18} /> Pause
                </button>
              ) : timerState === 'paused' ? (
                <button className="btn-action btn-start" onClick={handleResume}>
                  <Play size={18} /> Resume
                </button>
              ) : (
                <button className="btn-action btn-start" disabled>
                  <Play size={18} /> Starting...
                </button>
              )}

              <button className="btn-action btn-reset" onClick={handleReset}>
                <RotateCcw size={18} /> Reset
              </button>

              {/* Sound Toggle */}
              <button
                className={`btn-action btn-sound ${soundEnabled ? 'sound-on' : 'sound-off'}`}
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <span>{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
              </button>

              {/* Presentation Toggle */}
              <button
                className="btn-action btn-present"
                onClick={() => setIsPresentationMode(true)}
              >
                <Maximize2 size={18} /> Presentation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Stage Presentation Area */}
      <div className="egg-stage-container">
        {/* Floating Exit Button in Presentation Mode */}
        {isPresentationMode && (
          <button
            className="floating-exit-btn"
            onClick={() => setIsPresentationMode(false)}
            title="Exit Presentation Mode"
          >
            <Minimize2 size={20} /> Exit Presentation
          </button>
        )}

        {/* Header Title & Badge */}
        <div className="stage-header">
          <span className="stage-badge">EGG TIMER</span>
          <h2 className="time-left-title">TIME LEFT</h2>
        </div>

        {/* Large Countdown Seconds Display */}
        <div
          className={`countdown-display ${
            timeLeft <= 5 && timeLeft > 0 ? 'pulse-danger' : ''
          } ${timerState === 'broken' ? 'time-up' : ''}`}
        >
          {timeLeft}
        </div>

        {/* Realistic Interactive SVG Egg Element */}
        <div className="egg-wrapper">
          <div className={`egg-element tremble-level-${shakeLevel}`}>
            {timerState !== 'broken' ? (
              /* Whole Egg with Progressive Visual Cracks (idle, running, paused, breaking) */
              <svg
                viewBox="0 0 240 320"
                className="egg-svg"
                aria-label="Realistic countdown egg"
              >
                <defs>
                  {/* Realistic Egg Shell Gradient */}
                  <radialGradient id="eggShellGrad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="25%" stopColor="#fff8ee" />
                    <stop offset="65%" stopColor="#f3e3ca" />
                    <stop offset="100%" stopColor="#d5ba94" />
                  </radialGradient>

                  {/* Egg Drop Shadow */}
                  <filter id="eggShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#000000" floodOpacity="0.5" />
                  </filter>
                </defs>

                {/* Base Egg Shape */}
                <path
                  d="M 120 20 
                     C 185 20, 220 100, 220 190 
                     C 220 265, 175 300, 120 300 
                     C 65 300, 20 265, 20 190 
                     C 20 100, 55 20, 120 20 Z"
                  fill="url(#eggShellGrad)"
                  filter="url(#eggShadow)"
                />

                {/* Egg Specular Highlight */}
                <path
                  d="M 100 45 C 130 45, 160 80, 160 120 C 140 80, 110 55, 85 55 C 90 48, 95 45, 100 45 Z"
                  fill="#ffffff"
                  opacity="0.6"
                />

                {/* PROGRESSIVE VISUAL SVG CRACKS */}
                {crackLevel >= 1 && (
                  <g className="cracks-group">
                    {/* Crack 1: Main top-center zigzag line */}
                    <path
                      d="M 120 110 L 132 130 L 115 145 L 138 165 L 122 185"
                      fill="none"
                      stroke="#3b200b"
                      strokeWidth={crackLevel >= 4 ? '4' : '3'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Crack 2: Side branch 1 (appears at crackLevel >= 2) */}
                    {crackLevel >= 2 && (
                      <path
                        d="M 132 130 L 158 122 M 115 145 L 90 152"
                        fill="none"
                        stroke="#3b200b"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Crack 3: Lower shell fracture (appears at crackLevel >= 3) */}
                    {crackLevel >= 3 && (
                      <path
                        d="M 138 165 L 165 175 M 122 185 L 105 205 L 130 220"
                        fill="none"
                        stroke="#3b200b"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Crack 4: Heavy stress hairline fractures (appears at crackLevel >= 4) */}
                    {crackLevel >= 4 && (
                      <g opacity="0.9">
                        <path
                          d="M 90 152 L 72 170 M 158 122 L 180 135 M 165 175 L 190 190"
                          fill="none"
                          stroke="#2a1506"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </g>
                    )}
                  </g>
                )}
              </svg>
            ) : (
              /* Broken Egg State (At t=0 after breaking animation) */
              <div className="broken-egg-wrapper">
                {/* Revealed Interior: Yolk & Albumen */}
                <div className="egg-interior">
                  <div className="egg-white"></div>
                  <div className="egg-yolk"></div>
                </div>

                {/* Top Shell Fragment */}
                <svg viewBox="0 0 240 320" className="shell-half shell-top">
                  <defs>
                    <radialGradient id="eggShellGradTop" cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="25%" stopColor="#fff8ee" />
                      <stop offset="65%" stopColor="#f3e3ca" />
                      <stop offset="100%" stopColor="#d5ba94" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M 120 20 
                       C 185 20, 220 100, 220 150
                       L 158 140 L 132 145 L 138 130 L 120 135 L 90 120
                       L 20 150
                       C 20 100, 55 20, 120 20 Z"
                    fill="url(#eggShellGradTop)"
                  />
                </svg>

                {/* Bottom Shell Fragment */}
                <svg viewBox="0 0 240 320" className="shell-half shell-bottom">
                  <defs>
                    <radialGradient id="eggShellGradBtm" cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="25%" stopColor="#fff8ee" />
                      <stop offset="65%" stopColor="#f3e3ca" />
                      <stop offset="100%" stopColor="#d5ba94" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M 220 150
                       C 220 265, 175 300, 120 300 
                       C 65 300, 20 265, 20 190 
                       L 90 160 L 120 165 L 138 150 L 158 160 Z"
                    fill="url(#eggShellGradBtm)"
                  />
                </svg>

                {/* Splattered Shell Fragments Bursting Outward */}
                <div className="particles-container">
                  <span className="fragment frag-1"></span>
                  <span className="fragment frag-2"></span>
                  <span className="fragment frag-3"></span>
                  <span className="fragment frag-4"></span>
                  <span className="fragment frag-5"></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Time Up Banner */}
        {timerState === 'broken' && (
          <div className="time-up-banner">
            <span>TIME'S UP!</span>
          </div>
        )}
      </div>
    </div>
  );
}
