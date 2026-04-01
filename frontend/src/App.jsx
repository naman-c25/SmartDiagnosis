import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';

export default function App() {
  // current URL track karne ke liye — page transition animation ke liye chahiye
  const location = useLocation();

  return (
    <div className="app">
      {/* upar wala navigation bar */}
      <Navbar />
      <main className="main-content">
        {/* AnimatePresence se page change hone par smooth animation hoti hai */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
