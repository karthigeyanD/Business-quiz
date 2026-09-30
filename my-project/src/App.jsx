import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { QuizProvider } from './context/QuizContext';
import Dashboard from './pages/Dashboard';
import ExamSetup from './pages/ExamSetup';
import Leaderboard from './pages/Leaderboard';
import LiveDisplay from './pages/LiveDisplay';
import Results from './pages/Results';
import Rounds from './pages/Rounds';
import Round2Admin from './pages/Round2Admin';
import Round4Admin from './pages/Round4Admin';
import Scoring from './pages/Scoring';
import Settings from './pages/Settings';
import StudentExam from './pages/StudentExam';
import Round2Participant from './pages/Round2Participant';
import Round4Participant from './pages/Round4Participant';
import Teams from './pages/Teams';

export default function App() {
  return (
    <QuizProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="teams" element={<Teams />} />
            <Route path="rounds" element={<Rounds />} />
            <Route path="round2-admin" element={<Round2Admin />} />
            <Route path="round4-admin" element={<Round4Admin />} />
            <Route path="scoring" element={<Scoring />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="results" element={<Results />} />
            <Route path="live" element={<LiveDisplay />} />
            <Route path="exam-setup" element={<ExamSetup />} />
            <Route path="admin" element={<ExamSetup />} />
            <Route path="admin/*" element={<ExamSetup />} />
          </Route>
          {/* Student exam — standalone (no admin sidebar) */}
          <Route path="exam" element={<StudentExam />} />
          {/* Round 2 participant — standalone (no admin sidebar) */}
          <Route path="round2" element={<Round2Participant />} />
          {/* Round 4 participant — standalone (no admin sidebar) */}
          <Route path="round4" element={<Round4Participant />} />
          <Route path="*" element={<ExamSetup />} />
        </Routes>
      </BrowserRouter>
    </QuizProvider>
  );
}

