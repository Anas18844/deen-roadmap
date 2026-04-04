import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Level1 from './pages/Level1';
import LearningPage from './pages/LearningPage';
import TazkiyahPage from './pages/TazkiyahPage';
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
        <Route path="/" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/level-1" element={
          <ProtectedRoute><Level1 /></ProtectedRoute>
        } />
        <Route path="/level-1/learning" element={
          <ProtectedRoute><LearningPage /></ProtectedRoute>
        } />
        <Route path="/level-1/tazkiyah" element={
          <ProtectedRoute><TazkiyahPage /></ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
