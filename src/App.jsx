import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Level1 from './pages/Level1';
import LearningPage from './pages/LearningPage';
import TazkiyahPage from './pages/TazkiyahPage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/level-1" element={<Level1 />} />
        <Route path="/level-1/learning" element={<LearningPage />} />
        <Route path="/level-1/tazkiyah" element={<TazkiyahPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
