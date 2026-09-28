import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { QuizProvider } from './context/QuizContext';
import Dashboard from './pages/Dashboard';
import LiveDisplay from './pages/LiveDisplay';
import Rounds from './pages/Rounds';
import Scoring from './pages/Scoring';
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
            <Route path="scoring" element={<Scoring />} />
            <Route path="live" element={<LiveDisplay />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QuizProvider>
  );
}
