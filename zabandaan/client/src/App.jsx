import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PointsProvider } from './context/PointsContext';
import Login from './pages/Login';
import Home from './pages/Home';
import DifficultySelect from './pages/DifficultySelect';
import AlphabetMap from './pages/alphabets/AlphabetMap';
import NumberMap from './pages/numbers/NumberMap';
import AdjectivesGame from './pages/adjectives/AdjectivesGame';
import IdiomsGame from './pages/idioms/IdiomsGame';
import WordSearchGame from './pages/wordsearch/WordSearchGame';
import PoetryPage from './pages/poetry/PoetryPage';
import Profile from './pages/Profile';
import { LanguageProvider } from './context/LanguageContext';
import './styles/global.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFF8E1',
        color: '#888',
        fontSize: 18,
      }}>
        Loading Zabandaan...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/difficulty/wordsearch" element={<Navigate to="/wordsearch" replace />} />
      <Route path="/difficulty/:module" element={<ProtectedRoute><DifficultySelect /></ProtectedRoute>} />
      <Route path="/alphabets" element={<ProtectedRoute><AlphabetMap /></ProtectedRoute>} />
      <Route path="/numbers" element={<ProtectedRoute><NumberMap /></ProtectedRoute>} />
      <Route path="/adjectives" element={<ProtectedRoute><AdjectivesGame /></ProtectedRoute>} />
      <Route path="/idioms/:difficulty" element={<ProtectedRoute><IdiomsGame /></ProtectedRoute>} />
      <Route path="/wordsearch" element={<ProtectedRoute><WordSearchGame /></ProtectedRoute>} />
      <Route path="/wordsearch/custom" element={<ProtectedRoute><WordSearchGame /></ProtectedRoute>} />
      <Route path="/poetry" element={<ProtectedRoute><PoetryPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <PointsProvider>
            <AppRoutes />
          </PointsProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
