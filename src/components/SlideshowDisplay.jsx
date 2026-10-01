import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize, Minimize, Shuffle, Repeat, Image as ImageIcon, Film, MessageSquare, Sparkles, Upload } from 'lucide-react';

export default function SlideshowDisplay({
  slides,
  currentIndex,
  isPlaying,
  settings,
  onPrev,
  onNext,
  onTogglePlay,
  onToggleFullscreen,
  isFullscreen,
  onUpdateSettings,
  onJumpToSlide,
  onOpenFileSelect,
  onLoadDemo,
  progressPercent
}) {
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Transition direction state for smooth slide animations
  const [transitionState, setTransitionState] = useState('active'); // enter, active, exit
  const [prevSlideIndex, setPrevSlideIndex] = useState(currentIndex);
  const [direction, setDirection] = useState('next'); // 'next' or 'prev'

  // Handle slide index changes with transition class assignment
  useEffect(() => {
    if (currentIndex !== prevSlideIndex) {
      const isForward = currentIndex > prevSlideIndex || (prevSlideIndex === slides.length - 1 && currentIndex === 0);
      setDirection(isForward ? 'next' : 'prev');
      setTransitionState('enter');

      const timer = setTimeout(() => {
        setTransitionState('active');
        setPrevSlideIndex(currentIndex);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, prevSlideIndex, slides.length]);

  // Mouse inactivity timer for autohiding floating dock during presentation
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    
    if (settings.autoHideControls || isFullscreen) {
      hideTimeoutRef.current = setTimeout(() => {
        if (isPlaying || isFullscreen) {
          setControlsVisible(false);
        }
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const currentSlide = slides[currentIndex];

  // Calculate CSS transition classes
  const getTransitionClass = () => {
    const t = settings.transition;
    if (t === 'none') return '';
    if (t === 'fade') return `transition-fade-${transitionState}`;
    if (t === 'slide') return transitionState === 'enter' ? `transition-slide-enter-${direction}` : 'transition-slide-active';
    if (t === 'slide-up') return `transition-slide-up-${transitionState}`;
    if (t === 'zoom') return `transition-zoom-${transitionState}`;
    if (t === 'flip') return `transition-flip-${transitionState}`;
    if (t === 'blur') return `transition-blur-${transitionState}`;
    return `transition-fade-${transitionState}`;
  };

  return (
    <div
      ref={containerRef}
      className={`stage-container theme-${settings.bgTheme}`}
      onMouseMove={handleMouseMove}
      style={{ cursor: (!controlsVisible && isFullscreen) ? 'none' : 'default' }}
    >
      {/* Background Image Blur Atmosphere */}
      {settings.bgTheme === 'blur' && currentSlide && (
        <img
          src={currentSlide.url}
          alt="Backdrop blur"
          className="backdrop-blur-img"
        />
      )}

      {/* Progress Bar at top of stage */}
      {settings.showProgressBar && isPlaying && slides.length > 0 && (
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Main Viewport Presentation Canvas */}
      <div className="viewport-frame">
        {slides.length === 0 ? (
          <div className="empty-stage">
            <div className="empty-icon-circle">
              <ImageIcon size={36} />
            </div>
            <h2 className="empty-title">No Photos Loaded</h2>
            <p className="empty-desc">
              Upload high-resolution photos (JPG, PNG, WEBP) from your computer or load our pre-configured Quiz Presentation preset.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button className="btn-glow" onClick={onOpenFileSelect}>
                <Upload size={18} />
                <span>Upload Photos</span>
              </button>
              <button className="btn-secondary" onClick={onLoadDemo}>
                <Sparkles size={18} style={{ color: '#a855f7' }} />
                <span>Load Sample Quiz</span>
              </button>
            </div>
          </div>
        ) : currentSlide ? (
          <div
            className={`slide-wrapper ${getTransitionClass()}`}
            style={{
              transform: currentSlide.rotation ? `rotate(${currentSlide.rotation}deg)` : undefined
            }}
          >
            <img
              src={currentSlide.url}
              alt={currentSlide.title || currentSlide.name}
              className={`slide-img fit-${settings.fitMode}`}
            />
          </div>
        ) : null}

        {/* Caption Overlay */}
        {settings.showCaptions && currentSlide && (currentSlide.title || currentSlide.caption) && (
          <div className="caption-banner">
            {currentSlide.title && <div className="caption-title">{currentSlide.title}</div>}
            {currentSlide.caption && <div className="caption-text">{currentSlide.caption}</div>}
          </div>
        )}
      </div>

      {/* Floating Presenter Control Bar */}
      {slides.length > 0 && (
        <div className={`floating-controls ${!controlsVisible ? 'hidden-autohide' : ''}`}>
          {/* Previous Slide */}
          <button
            className="control-btn"
            onClick={onPrev}
            title="Previous Photo (Left Arrow)"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Main Play / Pause */}
          <button
            className="control-btn primary-play"
            onClick={onTogglePlay}
            title={isPlaying ? "Pause Autoplay (Spacebar)" : "Start Autoplay (Spacebar)"}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '3px' }} />}
          </button>

          {/* Next Slide */}
          <button
            className="control-btn"
            onClick={onNext}
            title="Next Photo (Right Arrow)"
          >
            <ChevronRight size={22} />
          </button>

          <div className="divider-vert" />

          {/* Slide Count Indicator */}
          <div className="slide-counter-badge">
            {currentIndex + 1} <span>/ {slides.length}</span>
          </div>

          <div className="divider-vert" />

          {/* Shuffle Toggle */}
          <button
            className="control-btn"
            onClick={() => onUpdateSettings({ shuffle: !settings.shuffle })}
            title={`Shuffle Order (S): ${settings.shuffle ? 'ON' : 'OFF'}`}
            style={{ color: settings.shuffle ? '#06b6d4' : undefined, background: settings.shuffle ? 'rgba(6, 182, 212, 0.15)' : undefined }}
          >
            <Shuffle size={18} />
          </button>

          {/* Loop Toggle */}
          <button
            className="control-btn"
            onClick={() => onUpdateSettings({ loop: !settings.loop })}
            title={`Loop Slideshow (L): ${settings.loop ? 'ON' : 'OFF'}`}
            style={{ color: settings.loop ? '#a855f7' : undefined, background: settings.loop ? 'rgba(168, 85, 247, 0.15)' : undefined }}
          >
            <Repeat size={18} />
          </button>

          {/* Toggle Fullscreen */}
          <button
            className="control-btn"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Projector Fullscreen (F)"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}
