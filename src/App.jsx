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
import Level3 from './pages/Level3';
import TazkiyahLevel3Page from './pages/TazkiyahLevel3Page';
import DawahPage from './pages/DawahPage';
import Level4 from './pages/Level4';
import Level4LessonsPage from './pages/Level4LessonsPage';
import Level4PlaylistsPage from './pages/Level4PlaylistsPage';
import Level4BooksPage from './pages/Level4BooksPage';
import AdminDashboard from './pages/AdminDashboard';
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

        {/* Level 3 */}
        <Route path="/level-3" element={<ProtectedRoute><Level3 /></ProtectedRoute>} />
        <Route path="/level-3/tazkiyah" element={<ProtectedRoute><TazkiyahLevel3Page /></ProtectedRoute>} />
        <Route path="/level-3/dawah" element={<ProtectedRoute><DawahPage /></ProtectedRoute>} />

        {/* Level 4 */}
        <Route path="/level-4" element={<ProtectedRoute><Level4 /></ProtectedRoute>} />
        <Route path="/level-4/lessons" element={<ProtectedRoute><Level4LessonsPage /></ProtectedRoute>} />
        <Route path="/level-4/playlists" element={<ProtectedRoute><Level4PlaylistsPage /></ProtectedRoute>} />
        <Route path="/level-4/books" element={<ProtectedRoute><Level4BooksPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
