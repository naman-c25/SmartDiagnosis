import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="20" fill="#0ea5e9" />
            <path d="M50 20 L50 80 M20 50 L80 50" stroke="white" strokeWidth="14" strokeLinecap="round" />
          </svg>
          <span className="logo-text">SmartDiagnosis</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            Diagnose
            {pathname === '/' && <motion.span className="nav-underline" layoutId="underline" />}
          </Link>
          <Link to="/history" className={`nav-link ${pathname === '/history' ? 'active' : ''}`}>
            History
            {pathname === '/history' && <motion.span className="nav-underline" layoutId="underline" />}
          </Link>
        </div>
      </div>
    </nav>
  );
}
