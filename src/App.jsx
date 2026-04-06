import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Level1 from './pages/Level1';
import LearningPage from './pages/LearningPage';
import TazkiyahPage from './pages/TazkiyahPage';
import Level2 from './pages/Level2';
import Tazkiyah3Page from './pages/Tazkiyah3Page';
import WaayPage from './pages/WaayPage';
import IbadahPage from './pages/IbadahPage';
import UserForm from './components/UserForm';
import { useAuth } from './context/AuthContext';

function App() {
  const { needsProfile, loading } = useAuth();

  if (loading) return null;

  return (
    <>
      <Navbar />
      {needsProfile && <UserForm />}
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        {/* Level 1 */}
        <Route path="/level-1" element={<ProtectedRoute><Level1 /></ProtectedRoute>} />
        <Route path="/level-1/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
        <Route path="/level-1/tazkiyah" element={<ProtectedRoute><TazkiyahPage /></ProtectedRoute>} />

        {/* Level 2 */}
        <Route path="/level-2" element={<ProtectedRoute><Level2 /></ProtectedRoute>} />
        <Route path="/level-2/tazkiyah-3" element={<ProtectedRoute><Tazkiyah3Page /></ProtectedRoute>} />
        <Route path="/level-2/waay" element={<ProtectedRoute><WaayPage /></ProtectedRoute>} />
        <Route path="/level-2/ibadah" element={<ProtectedRoute><IbadahPage /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
