import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import KeyboardHelpModal from './components/KeyboardHelpModal';

// 1. Logo Quiz components & storage
import QuizPresentationStage from './components/QuizPresentationStage';
import QuizDashboard from './components/QuizDashboard';
import { DEFAULT_QUIZ_QUESTIONS } from './utils/demoQuiz';
import { saveQuizToDB, loadQuizFromDB } from './utils/quizStorage';

// 2. Brand in Image Quiz components & storage
import BrandInImagePresentationStage from './components/BrandInImagePresentationStage';
import BrandInImageDashboard from './components/BrandInImageDashboard';
import { DEFAULT_BRAND_IN_IMAGE_QUESTIONS } from './utils/demoBrandInImage';
import { saveBrandInImageQuizToDB, loadBrandInImageQuizFromDB } from './utils/brandInImageStorage';

// 3. Personality Identification Quiz components & storage
import PersonalityPresentationStage from './components/PersonalityPresentationStage';
import PersonalityDashboard from './components/PersonalityDashboard';
import { DEFAULT_PERSONALITY_QUESTIONS } from './utils/demoPersonality';
import { savePersonalityQuizToDB, loadPersonalityQuizFromDB } from './utils/personalityStorage';

// 4. Egg Timer page component
import EggTimerPage from './components/EggTimerPage';

// Opening Screen component
import OpeningScreen from './components/OpeningScreen';

export default function App() {
  // Opening Screen state: defaults to true on initial startup
  const [showOpeningScreen, setShowOpeningScreen] = useState(true);

  // App Mode State: 'quiz' | 'brandInImage' | 'personality' | 'eggTimer'
  const [appMode, setAppMode] = useState('quiz');

  // Sub-mode states ('present' | 'dashboard') for each quiz round
  const [quizSubMode, setQuizSubMode] = useState('present');
  const [brandInImageSubMode, setBrandInImageSubMode] = useState('present');
  const [personalitySubMode, setPersonalitySubMode] = useState('present');

  // 1. Logo Quiz State
  const [quizQuestions, setQuizQuestions] = useState(DEFAULT_QUIZ_QUESTIONS);
  const [quizIndex, setQuizIndex] = useState(0);

  // 2. Brand in Image Quiz State
  const [brandInImageQuestions, setBrandInImageQuestions] = useState(DEFAULT_BRAND_IN_IMAGE_QUESTIONS);
  const [brandInImageIndex, setBrandInImageIndex] = useState(0);

  // 3. Personality Identification Quiz State
  const [personalityQuestions, setPersonalityQuestions] = useState(DEFAULT_PERSONALITY_QUESTIONS);
  const [personalityIndex, setPersonalityIndex] = useState(0);

  // Shared UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Load saved Logo Quiz Questions on startup
  useEffect(() => {
    async function loadQuiz() {
      const saved = await loadQuizFromDB();
      if (saved && saved.length > 0) {
        setQuizQuestions(saved);
      }
    }
    loadQuiz();
  }, []);

  // Load saved Brand in Image Questions on startup
  useEffect(() => {
    async function loadBrandQuiz() {
      const saved = await loadBrandInImageQuizFromDB();
      if (saved && saved.length > 0) {
        setBrandInImageQuestions(saved);
      }
    }
    loadBrandQuiz();
  }, []);

  // Load saved Personality Questions on startup
  useEffect(() => {
    async function loadPersonalityQuiz() {
      const saved = await loadPersonalityQuizFromDB();
      if (saved && saved.length > 0) {
        setPersonalityQuestions(saved);
      }
    }
    loadPersonalityQuiz();
  }, []);

  // 1. Logo Quiz Persistence Handlers
  const handleSaveQuizQuestions = async (updatedQuestions) => {
    setQuizQuestions(updatedQuestions);
    await saveQuizToDB(updatedQuestions);
  };

  const handleResetQuizToDemo = async () => {
    if (window.confirm('Reset Logo Quiz questions to default demo set?')) {
      setQuizQuestions(DEFAULT_QUIZ_QUESTIONS);
      setQuizIndex(0);
      await saveQuizToDB(DEFAULT_QUIZ_QUESTIONS);
    }
  };

  // 2. Brand in Image Persistence Handlers
  const handleSaveBrandInImageQuestions = async (updatedQuestions) => {
    setBrandInImageQuestions(updatedQuestions);
    await saveBrandInImageQuizToDB(updatedQuestions);
  };

  const handleResetBrandInImageToDemo = async () => {
    if (window.confirm('Reset Brand in Image questions to default demo set?')) {
      setBrandInImageQuestions(DEFAULT_BRAND_IN_IMAGE_QUESTIONS);
      setBrandInImageIndex(0);
      await saveBrandInImageQuizToDB(DEFAULT_BRAND_IN_IMAGE_QUESTIONS);
    }
  };

  // 3. Personality Identification Persistence Handlers
  const handleSavePersonalityQuestions = async (updatedQuestions) => {
    setPersonalityQuestions(updatedQuestions);
    await savePersonalityQuizToDB(updatedQuestions);
  };

  const handleResetPersonalityToDemo = async () => {
    if (window.confirm('Reset Personality Identification questions to default demo set?')) {
      setPersonalityQuestions(DEFAULT_PERSONALITY_QUESTIONS);
      setPersonalityIndex(0);
      await savePersonalityQuizToDB(DEFAULT_PERSONALITY_QUESTIONS);
    }
  };

  // Navigation Callbacks for each mode
  const nextQuizQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const prevQuizQuestion = () => {
    if (quizIndex > 0) {
      setQuizIndex((prev) => prev - 1);
    }
  };

  const nextBrandInImageQuestion = () => {
    if (brandInImageIndex < brandInImageQuestions.length - 1) {
      setBrandInImageIndex((prev) => prev + 1);
    } else {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const prevBrandInImageQuestion = () => {
    if (brandInImageIndex > 0) {
      setBrandInImageIndex((prev) => prev - 1);
    }
  };

  const nextPersonalityQuestion = () => {
    if (personalityIndex < personalityQuestions.length - 1) {
      setPersonalityIndex((prev) => prev + 1);
    } else {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const prevPersonalityQuestion = () => {
    if (personalityIndex > 0) {
      setPersonalityIndex((prev) => prev - 1);
    }
  };

  // Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  };

  // Keyboard Navigation Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (appMode === 'quiz' && quizSubMode === 'present') nextQuizQuestion();
          else if (appMode === 'brandInImage' && brandInImageSubMode === 'present') nextBrandInImageQuestion();
          else if (appMode === 'personality' && personalitySubMode === 'present') nextPersonalityQuestion();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (appMode === 'quiz' && quizSubMode === 'present') prevQuizQuestion();
          else if (appMode === 'brandInImage' && brandInImageSubMode === 'present') prevBrandInImageQuestion();
          else if (appMode === 'personality' && personalitySubMode === 'present') prevPersonalityQuestion();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    appMode,
    quizSubMode,
    brandInImageSubMode,
    personalitySubMode,
    quizIndex,
    quizQuestions.length,
    brandInImageIndex,
    brandInImageQuestions.length,
    personalityIndex,
    personalityQuestions.length
  ]);

  // Render Opening Screen on initial startup
  // Render Opening Screen on initial startup
  if (showOpeningScreen) {
    return (
      <OpeningScreen
        onSelectRound={(roundId) => {
          setShowOpeningScreen(false);
          setAppMode(roundId);
          if (roundId === 'quiz') {
            setQuizSubMode('present');
            setQuizIndex(0);
          } else if (roundId === 'personality') {
            setPersonalitySubMode('present');
            setPersonalityIndex(0);
          } else if (roundId === 'brandInImage') {
            setBrandInImageSubMode('present');
            setBrandInImageIndex(0);
          }
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Top Header Navigation Bar */}
      <Header
        appMode={appMode}
        onSelectAppMode={setAppMode}
        quizSubMode={quizSubMode}
        onSelectQuizSubMode={setQuizSubMode}
        brandInImageSubMode={brandInImageSubMode}
        onSelectBrandInImageSubMode={setBrandInImageSubMode}
        personalitySubMode={personalitySubMode}
        onSelectPersonalitySubMode={setPersonalitySubMode}
        onToggleFullscreen={toggleFullscreen}
        onOpenHelp={() => setHelpOpen(true)}
        onGoToOpeningPage={() => setShowOpeningScreen(true)}
      />

      {/* Main Content Workspace */}
      <div className="main-workspace">
        {appMode === 'quiz' ? (
          /* 1. Round 1 — Logo Identification */
          quizSubMode === 'present' ? (
            <QuizPresentationStage
              questions={quizQuestions}
              currentIndex={quizIndex}
              onPrevQuestion={prevQuizQuestion}
              onNextQuestion={nextQuizQuestion}
              onJumpToQuestion={(idx) => setQuizIndex(idx)}
              onToggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
              onRestartQuiz={() => setQuizIndex(0)}
              onGoToNextRound={() => {
                setAppMode('personality');
                setPersonalitySubMode('present');
                setPersonalityIndex(0);
              }}
            />
          ) : (
            <QuizDashboard
              questions={quizQuestions}
              onSaveQuestions={handleSaveQuizQuestions}
              onResetToDemo={handleResetQuizToDemo}
              onStartQuizPresentation={() => setQuizSubMode('present')}
              currentMode={appMode}
              onSelectMode={setAppMode}
              onGoToOpeningPage={() => setShowOpeningScreen(true)}
            />
          )
        ) : appMode === 'personality' ? (
          /* 2. Round 2 — Personality Identification */
          personalitySubMode === 'present' ? (
            <PersonalityPresentationStage
              questions={personalityQuestions}
              currentIndex={personalityIndex}
              onPrevQuestion={prevPersonalityQuestion}
              onNextQuestion={nextPersonalityQuestion}
              onJumpToQuestion={(idx) => setPersonalityIndex(idx)}
              onToggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
              onRestartQuiz={() => setPersonalityIndex(0)}
              onGoToNextRound={() => {
                setAppMode('brandInImage');
                setBrandInImageSubMode('present');
                setBrandInImageIndex(0);
              }}
            />
          ) : (
            <PersonalityDashboard
              questions={personalityQuestions}
              onSaveQuestions={handleSavePersonalityQuestions}
              onResetToDemo={handleResetPersonalityToDemo}
              onStartPresentation={() => setPersonalitySubMode('present')}
              currentMode={appMode}
              onSelectMode={setAppMode}
              onGoToOpeningPage={() => setShowOpeningScreen(true)}
            />
          )
        ) : appMode === 'brandInImage' ? (
          /* 3. Round 3 — Brand in Image */
          brandInImageSubMode === 'present' ? (
            <BrandInImagePresentationStage
              questions={brandInImageQuestions}
              currentIndex={brandInImageIndex}
              onPrevQuestion={prevBrandInImageQuestion}
              onNextQuestion={nextBrandInImageQuestion}
              onJumpToQuestion={(idx) => setBrandInImageIndex(idx)}
              onToggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
              onRestartQuiz={() => setBrandInImageIndex(0)}
              onGoToNextRound={() => {
                setAppMode('quiz');
                setQuizSubMode('dashboard');
              }}
            />
          ) : (
            <BrandInImageDashboard
              questions={brandInImageQuestions}
              onSaveQuestions={handleSaveBrandInImageQuestions}
              onResetToDemo={handleResetBrandInImageToDemo}
              onStartPresentation={() => setBrandInImageSubMode('present')}
              currentMode={appMode}
              onSelectMode={setAppMode}
              onGoToOpeningPage={() => setShowOpeningScreen(true)}
            />
          )
        ) : (
          /* 4. Egg Timer Mode */
          <EggTimerPage />
        )}
      </div>

      {/* Keyboard Shortcuts Guide Modal */}
      <KeyboardHelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </div>
  );
}
