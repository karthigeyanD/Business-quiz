import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Lock,
  UserCheck,
  ImageIcon,
  Eye
} from 'lucide-react';
import CustomTimerControl from './CustomTimerControl';
import TimesUpOverlay from './TimesUpOverlay';

export default function PersonalityPresentationStage({
  questions,
  currentIndex,
  onPrevQuestion,
  onNextQuestion,
  onJumpToQuestion,
  onToggleFullscreen,
  isFullscreen,
  onRestartQuiz,
  onGoToNextRound
}) {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timerDuration, setTimerDuration] = useState(() => {
    const saved = localStorage.getItem('proshow_personality_quiz_timer');
    return saved ? parseInt(saved, 10) : 30;
  });
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const hideTimeoutRef = useRef(null);
  const currentQ = questions[currentIndex];

  useEffect(() => {
    localStorage.setItem('proshow_personality_quiz_timer', timerDuration.toString());
  }, [timerDuration]);

  // CRITICAL REQUIREMENT: Reset answer reveal & timer immediately when question index changes!
  useEffect(() => {
    setIsAnswerRevealed(false);
    setIsTimeUp(false);
    if (timerDuration > 0) {
      setTimeLeft(timerDuration);
      setIsTimerRunning(true);
    } else {
      setTimeLeft(0);
      setIsTimerRunning(false);
    }
  }, [currentIndex, timerDuration]);

  // Timer Countdown Logic (Reaching 0 DOES NOT reveal answer; organizer must press SHOW ANSWER)
  useEffect(() => {
    if (!isTimerRunning || timerDuration === 0 || timeLeft <= 0 || isAnswerRevealed) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, timerDuration, timeLeft, isAnswerRevealed]);

  // Keyboard shortcut listener: Spacebar triggers "Show Answer"
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!isAnswerRevealed) {
          handleShowAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerRevealed, currentIndex]);

  const handleShowAnswer = () => {
    if (isAnswerRevealed) return;
    setIsAnswerRevealed(true);
    setIsTimerRunning(false);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.65 }
    });
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (isFullscreen) {
        setControlsVisible(false);
      }
    }, 3500);
  };

  if (!currentQ) {
    return (
      <div className="empty-stage" style={{ textAlign: 'center', padding: '60px' }}>
        <h2>No Personality Questions Configured</h2>
        <p>Please open the Organizer Dashboard tab to create or reset questions.</p>
      </div>
    );
  }

  return (
    <div
      className="stage-container theme-glow"
      onMouseMove={handleMouseMove}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isFullscreen ? '20px 40px' : '20px 32px',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 0%, #0369a1 0%, #080c14 80%)'
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          marginBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span className="header-tag" style={{ fontSize: '0.85rem', padding: '6px 14px', background: 'rgba(129, 140, 248, 0.2)', color: '#818cf8', borderColor: 'rgba(129, 140, 248, 0.4)' }}>
            ROUND 4 — PERSONALITY IDENTIFICATION
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', color: '#7dd3fc', fontWeight: 800, letterSpacing: '0.5px' }}>
              QUESTION {currentIndex + 1} OF {questions.length}
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isFullscreen ? '1.7rem' : '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              WHO IS THIS PERSONALITY?
            </h2>
          </div>
        </div>

        {/* Custom Timer Controls */}
        <CustomTimerControl
          timerDuration={timerDuration}
          onUpdateTimerDuration={(newDur) => setTimerDuration(newDur)}
          timeLeft={timeLeft}
          isTimerRunning={isTimerRunning}
          onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
          onResetTimer={() => setTimeLeft(timerDuration)}
          accentColor="#38bdf8"
        />
      </div>

      {/* Main Content Stage: 2 Large Side-by-Side Frames (Clue Image + Answer Image) */}
      <div
        style={{
          flex: '1 1 auto',
          width: '100%',
          maxWidth: '1200px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: isFullscreen ? '24px' : '18px',
          alignItems: 'stretch',
          zIndex: 5,
          minHeight: 0
        }}
      >
        {/* LEFT FRAME: CLUE IMAGE (Always 100% Clear) */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-glass)',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ position: 'absolute', top: '12px', left: '16px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(3, 105, 161, 0.8)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, color: '#e0f2fe', zIndex: 10 }}>
            <Sparkles size={14} />
            <span>CLUE IMAGE</span>
          </div>

          {currentQ.clueImage ? (
            <img
              src={currentQ.clueImage}
              alt="Personality Clue"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
              }}
            />
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
              <ImageIcon size={44} />
              <div>No Clue Image uploaded</div>
            </div>
          )}
        </div>

        {/* RIGHT FRAME: ANSWER IMAGE (Heavily Blurred until SHOW ANSWER is clicked) */}
        <div
          style={{
            background: isAnswerRevealed ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: isAnswerRevealed ? '2px solid #4ade80' : '1px solid var(--border-glass)',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isAnswerRevealed ? '0 0 35px rgba(74, 222, 128, 0.35)' : '0 20px 40px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.4s ease'
          }}
        >
          {/* Header Tag */}
          <div style={{ position: 'absolute', top: '12px', left: '16px', display: 'flex', alignItems: 'center', gap: '6px', background: isAnswerRevealed ? '#10b981' : 'rgba(239, 68, 68, 0.8)', color: isAnswerRevealed ? '#000' : '#fee2e2', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, zIndex: 10 }}>
            {isAnswerRevealed ? <CheckCircle2 size={14} /> : <Lock size={14} />}
            <span>{isAnswerRevealed ? 'ANSWER REVEALED' : 'ANSWER BLURRED'}</span>
          </div>

          {currentQ.answerImage ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {/* THE ACTUAL ANSWER IMAGE: HEAVILY BLURRED WITH HEAVY CSS FILTER & NO LEAKS */}
              <img
                src={currentQ.answerImage}
                alt="Answer Portrait"
                style={{
                  maxWidth: '100%',
                  maxHeight: isAnswerRevealed ? '75%' : '90%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: isAnswerRevealed ? 'blur(0px) scale(1)' : 'blur(32px) brightness(0.6) contrast(1.2) scale(1.1)',
                  transition: 'filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />

              {/* Blur Shield Badge Overlay when NOT revealed */}
              {!isAnswerRevealed && (
                <div
                  onClick={handleShowAnswer}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'rgba(9, 13, 22, 0.4)',
                    cursor: 'pointer',
                    zIndex: 5
                  }}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                    <Lock size={26} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                    CLICK "SHOW ANSWER" TO REVEAL
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
              <ImageIcon size={44} />
              <div>No Answer Image uploaded</div>
            </div>
          )}

          {/* PERSONALITY NAME REVEALED UNDERNEATH ANSWER IMAGE */}
          {isAnswerRevealed && (
            <div
              style={{
                marginTop: '12px',
                textAlign: 'center',
                animation: 'fadeIn 0.5s ease-out'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isFullscreen ? '1.9rem' : '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
                {currentQ.name}
              </h3>
              {currentQ.explanation && (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px', maxWidth: '480px' }}>
                  {currentQ.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stage Toolbar Controls */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '14px',
          zIndex: 10,
          opacity: controlsVisible ? 1 : 0.2,
          transition: 'opacity 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary"
            onClick={onPrevQuestion}
            disabled={currentIndex === 0}
            style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>

          {currentIndex === questions.length - 1 && isAnswerRevealed ? (
            <button
              className="btn-glow"
              onClick={onGoToNextRound}
              style={{ background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)', boxShadow: '0 0 25px rgba(192, 132, 252, 0.6)', padding: '8px 22px' }}
            >
              <span>ROUND 4 COMPLETE → GO TO ROUND 5</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              className="btn-secondary"
              onClick={onNextQuestion}
              disabled={currentIndex === questions.length - 1}
              style={{ opacity: currentIndex === questions.length - 1 ? 0.4 : 1 }}
            >
              <span>Next Question</span>
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* SHOW ANSWER BUTTON */}
        <button
          className="btn-glow"
          onClick={handleShowAnswer}
          disabled={isAnswerRevealed}
          style={{
            padding: '12px 32px',
            fontSize: '1.1rem',
            fontWeight: 800,
            background: isAnswerRevealed ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #0284c7 0%, #3b82f6 100%)',
            borderColor: isAnswerRevealed ? '#10b981' : undefined,
            boxShadow: isAnswerRevealed ? 'none' : '0 0 25px rgba(56, 189, 248, 0.5)'
          }}
        >
          {isAnswerRevealed ? <UserCheck size={20} /> : <Eye size={20} />}
          <span>{isAnswerRevealed ? 'ANSWER SHOWN' : 'SHOW ANSWER'}</span>
        </button>

        {/* Question Selector, Restart & Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            className="custom-select"
            value={currentIndex}
            onChange={(e) => onJumpToQuestion(Number(e.target.value))}
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
          >
            {questions.map((q, idx) => (
              <option key={q.id || idx} value={idx}>
                Q{idx + 1}: {q.name || `Question ${idx + 1}`}
              </option>
            ))}
          </select>

          <button className="btn-secondary" onClick={onRestartQuiz} title="Restart Quiz from Q1">
            <RotateCcw size={16} />
          </button>

          <button
            className="btn-secondary"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen Mode (F)"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* Time's Up Visual Overlay */}
      <TimesUpOverlay
        isVisible={isTimeUp}
        onDismiss={() => setIsTimeUp(false)}
        onNextQuestion={
          currentIndex < questions.length - 1
            ? () => {
                setIsTimeUp(false);
                onNextQuestion();
              }
            : null
        }
        onRestartTimer={() => {
          setIsTimeUp(false);
          setTimeLeft(timerDuration);
          setIsTimerRunning(true);
        }}
      />
    </div>
  );
}
