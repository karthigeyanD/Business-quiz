import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight, Maximize, Minimize, Eye, RotateCcw, CheckCircle2 } from 'lucide-react';
import CustomTimerControl from './CustomTimerControl';
import TimesUpOverlay from './TimesUpOverlay';

export default function QuizPresentationStage({
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
    const saved = localStorage.getItem('proshow_logo_quiz_timer');
    return saved ? parseInt(saved, 10) : 30;
  });
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeoutRef = useRef(null);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    localStorage.setItem('proshow_logo_quiz_timer', timerDuration.toString());
  }, [timerDuration]);

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

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
    setIsTimerRunning(false);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
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
      <div className="empty-stage">
        <h2>No Quiz Questions Configured</h2>
        <p>Please open the Dashboard tab to create or reset questions.</p>
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
        padding: isFullscreen ? '20px 40px' : '24px 32px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Question Header Bar */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="header-tag" style={{ fontSize: '0.9rem', padding: '6px 14px', background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
            ROUND 2 — LOGO IDENTIFICATION
          </span>
          <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 800 }}>
            QUESTION {currentIndex + 1} OF {questions.length}
          </span>
        </div>

        {/* Custom Timer Controls */}
        <CustomTimerControl
          timerDuration={timerDuration}
          onUpdateTimerDuration={(newDur) => setTimerDuration(newDur)}
          timeLeft={timeLeft}
          isTimerRunning={isTimerRunning}
          onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
          onResetTimer={() => setTimeLeft(timerDuration)}
          accentColor="#06b6d4"
        />
      </div>

      {/* Main Content Area: 2x2 Logo Grid + 4 Option Cards */}
      <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', zIndex: 5 }}>
        
        {/* 2x2 Logo Grid Frame */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            maxHeight: isFullscreen ? '50vh' : '40vh',
            minHeight: '280px',
            width: '100%',
            maxWidth: '1100px',
            margin: '0 auto'
          }}
        >
          {currentQ.logos.map((logoUrl, lIdx) => (
            <div
              key={lIdx}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ position: 'absolute', top: '10px', left: '14px', fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.4)' }}>
                LOGO #{lIdx + 1}
              </div>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`Logo ${lIdx + 1}`}
                  style={{
                    maxWidth: '85%',
                    maxHeight: '85%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))'
                  }}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Logo placeholder</div>
              )}
            </div>
          ))}
        </div>

        {/* 4 Answer Options (A, B, C, D) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            width: '100%',
            maxWidth: '1100px',
            margin: '0 auto'
          }}
        >
          {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
            const isCorrect = currentQ.correctOption === letter;
            const optionText = currentQ.options[optIdx] || `Option ${letter}`;

            let cardBg = 'rgba(15, 23, 42, 0.85)';
            let borderColor = 'var(--border-glass)';
            let textColor = '#f8fafc';
            let badgeBg = 'rgba(99, 102, 241, 0.2)';
            let cardOpacity = 1;

            if (isAnswerRevealed) {
              if (isCorrect) {
                cardBg = 'rgba(16, 185, 129, 0.25)';
                borderColor = '#10b981';
                textColor = '#ffffff';
                badgeBg = '#10b981';
              } else {
                cardBg = 'rgba(15, 23, 42, 0.4)';
                cardOpacity = 0.5;
              }
            }

            return (
              <div
                key={letter}
                style={{
                  background: cardBg,
                  backdropFilter: 'blur(16px)',
                  border: `2px solid ${borderColor}`,
                  borderRadius: '16px',
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  opacity: cardOpacity,
                  boxShadow: isAnswerRevealed && isCorrect ? '0 0 30px rgba(16, 185, 129, 0.5)' : '0 10px 20px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isAnswerRevealed && isCorrect ? 'scale(1.02)' : 'none'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: badgeBg,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    flexShrink: 0
                  }}
                >
                  {letter}
                </div>
                <div style={{ fontSize: isFullscreen ? '1.35rem' : '1.1rem', fontWeight: 700, color: textColor, flex: 1 }}>
                  {optionText}
                </div>

                {isAnswerRevealed && isCorrect && (
                  <CheckCircle2 size={28} className="text-emerald-400" />
                )}
              </div>
            );
          })}
        </div>

        {/* Revealed Answer Banner & Explanation */}
        {isAnswerRevealed && currentQ.explanation && (
          <div
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
              width: '100%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '14px',
              padding: '12px 24px',
              textAlign: 'center',
              color: '#a7f3d0',
              fontSize: '1rem',
              fontWeight: 500,
              animation: 'slideUpFade 0.3s ease'
            }}
          >
            💡 <strong>Answer Detail:</strong> {currentQ.explanation}
          </div>
        )}
      </div>

      {/* Floating Organizer Presentation Controls */}
      <div className={`floating-controls ${!controlsVisible ? 'hidden-autohide' : ''}`} style={{ bottom: '18px' }}>
        <button
          className="control-btn"
          onClick={onPrevQuestion}
          disabled={currentIndex === 0}
          title="Previous Question (Left Arrow)"
          style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
        >
          <ChevronLeft size={22} />
        </button>

        {!isAnswerRevealed ? (
          <button
            className="btn-glow"
            onClick={handleRevealAnswer}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)', padding: '8px 20px' }}
          >
            <Eye size={18} />
            <span>Reveal Answer</span>
          </button>
        ) : currentIndex === questions.length - 1 ? (
          <button
            className="btn-glow"
            onClick={onGoToNextRound}
            style={{ background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)', boxShadow: '0 0 25px rgba(129, 140, 248, 0.6)', padding: '8px 22px' }}
          >
            <span>ROUND 2 COMPLETE → GO TO ROUND 4</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            className="btn-glow"
            onClick={onNextQuestion}
            style={{ padding: '8px 20px' }}
          >
            <span>Next Question</span>
            <ChevronRight size={18} />
          </button>
        )}

        <button
          className="control-btn"
          onClick={onNextQuestion}
          disabled={currentIndex === questions.length - 1}
          title="Next Question (Right Arrow)"
          style={{ opacity: currentIndex === questions.length - 1 ? 0.4 : 1 }}
        >
          <ChevronRight size={22} />
        </button>

        <div className="divider-vert" />

        <button
          className="control-btn"
          onClick={onRestartQuiz}
          title="Restart Quiz from Question #1"
        >
          <RotateCcw size={18} />
        </button>

        <button
          className="control-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen Presentation Mode (F)"}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
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
