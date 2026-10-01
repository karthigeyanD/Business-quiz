import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  CheckCircle2,
  Eye,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import CustomTimerControl from './CustomTimerControl';
import TimesUpOverlay from './TimesUpOverlay';

export default function BrandInImagePresentationStage({
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
    const saved = localStorage.getItem('proshow_brand_in_image_timer');
    return saved ? parseInt(saved, 10) : 30;
  });
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const hideTimeoutRef = useRef(null);
  const currentQ = questions[currentIndex];

  useEffect(() => {
    localStorage.setItem('proshow_brand_in_image_timer', timerDuration.toString());
  }, [timerDuration]);

  // Reset answer reveal & timer when changing questions
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

  // Timer Countdown Logic
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
    if (isAnswerRevealed) return;
    setIsAnswerRevealed(true);
    setIsTimerRunning(false);
    confetti({
      particleCount: 100,
      spread: 70,
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
      <div className="empty-stage" style={{ textAlign: 'center', padding: '60px' }}>
        <h2>No Brand Questions Configured</h2>
        <p>Please open the Organizer Dashboard tab to create or reset questions.</p>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];

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
        background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #080c14 80%)'
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
          <span className="header-tag" style={{ fontSize: '0.85rem', padding: '6px 14px', background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.4)' }}>
            ROUND 5 — BRAND IN IMAGE
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: 700, letterSpacing: '0.5px' }}>
              QUESTION {currentIndex + 1} OF {questions.length}
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isFullscreen ? '1.7rem' : '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              {currentQ.title}
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
          accentColor="#c084fc"
        />
      </div>

      {/* Main Content Workspace: Large Image + 2x2 Options Grid */}
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isFullscreen ? '20px' : '16px',
          zIndex: 5,
          minHeight: 0
        }}
      >
        {/* Large Image Frame (Aspect ratio preserved, contain fit, non-distorted) */}
        <div
          style={{
            flex: '1 1 auto',
            width: '100%',
            maxWidth: '1100px',
            maxHeight: isFullscreen ? '52vh' : '44vh',
            minHeight: '220px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-glass)',
            borderRadius: '20px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {currentQ.image ? (
            <img
              src={currentQ.image}
              alt="Brand in Image"
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <ImageIcon size={48} />
              <span>No image uploaded for this question</span>
            </div>
          )}
        </div>

        {/* 2x2 Multiple Choice Options Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: isFullscreen ? '16px' : '12px',
            width: '100%',
            maxWidth: '1100px',
            flexShrink: 0
          }}
        >
          {currentQ.options.map((optText, optIdx) => {
            const letter = optionLetters[optIdx];
            const isCorrect = currentQ.correctOption === letter;
            
            // Format text: ensure letter A. B. C. D. display
            let displayText = optText;
            if (!optText.startsWith(`${letter}.`) && !optText.startsWith(`${letter})`)) {
              displayText = `${letter}. ${optText}`;
            } else if (optText.startsWith(`${letter})`)) {
              displayText = `${letter}.${optText.substring(2)}`;
            }

            // Card Styling depending on Answer Reveal state
            let cardBackground = 'rgba(15, 23, 42, 0.75)';
            let cardBorder = '1px solid var(--border-glass)';
            let cardBoxShadow = '0 6px 16px rgba(0,0,0,0.3)';
            let textColor = '#ffffff';
            let opacity = 1;

            if (isAnswerRevealed) {
              if (isCorrect) {
                cardBackground = 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.4) 100%)';
                cardBorder = '2px solid #10b981';
                cardBoxShadow = '0 0 30px rgba(16, 185, 129, 0.5)';
                textColor = '#ffffff';
              } else {
                opacity = 0.45;
              }
            }

            return (
              <div
                key={letter}
                style={{
                  background: cardBackground,
                  backdropFilter: 'blur(12px)',
                  border: cardBorder,
                  boxShadow: cardBoxShadow,
                  borderRadius: '16px',
                  padding: isFullscreen ? '18px 24px' : '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: opacity,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      width: isFullscreen ? '42px' : '36px',
                      height: isFullscreen ? '42px' : '36px',
                      borderRadius: '10px',
                      background: isAnswerRevealed && isCorrect ? '#10b981' : 'rgba(168, 85, 247, 0.2)',
                      color: isAnswerRevealed && isCorrect ? '#000' : '#d8b4fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-heading)',
                      fontSize: isFullscreen ? '1.3rem' : '1.1rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {letter}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: isFullscreen ? '1.45rem' : '1.15rem',
                      fontWeight: 700,
                      color: textColor,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {displayText.replace(/^[A-D][\.\)]\s*/, '')}
                  </span>
                </div>

                {isAnswerRevealed && isCorrect && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: '#000', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800 }}>
                    <CheckCircle2 size={16} />
                    <span>CORRECT</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer Detail Note Box (Appears when Revealed) */}
      {isAnswerRevealed && (
        <div
          style={{
            width: '100%',
            maxWidth: '1100px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '14px',
            padding: '12px 20px',
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={20} className="text-emerald-400" />
            <div>
              <span style={{ fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>
                Correct Brand: {currentQ.brandName || currentQ.options[letterToIdx(currentQ.correctOption)]} (Option {currentQ.correctOption})
              </span>
              {currentQ.explanation && (
                <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '2px' }}>
                  {currentQ.explanation}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Stage Toolbar Controls */}
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
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
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)', padding: '8px 22px' }}
            >
              <span>ROUND 5 COMPLETE → RETURN TO DASHBOARD</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              className="btn-secondary"
              onClick={onNextQuestion}
              disabled={currentIndex === questions.length - 1}
              style={{ opacity: currentIndex === questions.length - 1 ? 0.4 : 1 }}
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Reveal Answer Button */}
        <button
          className="btn-glow"
          onClick={handleRevealAnswer}
          disabled={isAnswerRevealed}
          style={{
            padding: '10px 24px',
            fontSize: '1rem',
            background: isAnswerRevealed ? 'rgba(16, 185, 129, 0.2)' : undefined,
            borderColor: isAnswerRevealed ? '#10b981' : undefined
          }}
        >
          <Eye size={18} />
          <span>{isAnswerRevealed ? 'Answer Revealed' : 'Reveal Answer'}</span>
        </button>

        {/* Question Selector & Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            className="custom-select"
            value={currentIndex}
            onChange={(e) => onJumpToQuestion(Number(e.target.value))}
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
          >
            {questions.map((q, idx) => (
              <option key={q.id || idx} value={idx}>
                Q{idx + 1}: {q.brandName || `Question ${idx + 1}`}
              </option>
            ))}
          </select>

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

function letterToIdx(letter) {
  switch (letter) {
    case 'A': return 0;
    case 'B': return 1;
    case 'C': return 2;
    case 'D': return 3;
    default: return 0;
  }
}
