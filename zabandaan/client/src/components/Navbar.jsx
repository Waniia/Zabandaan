import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';
import PointsBadge from './PointsBadge';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <img src="/images/zabandaan-logo.png" alt="Zabandaan" style={styles.logoIcon} />
          <span style={styles.logoText}>Zabandaan</span>
        </Link>

        <PointsBadge />
        <LanguageToggle compact />

        <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div style={{
          ...styles.links,
          ...(menuOpen ? styles.linksOpen : {})
        }}>
          <Link to="/" style={styles.link} onClick={() => setMenuOpen(false)}>{t('home', 'Home')}</Link>
          <Link to="/profile" style={styles.link} onClick={() => setMenuOpen(false)}>{t('profile', 'Profile')}</Link>
          {isGuest && (
            <Link to="/profile" style={{ ...styles.link, ...styles.saveBtn }} onClick={() => setMenuOpen(false)}>
              {t('saveProgress', 'Save Progress')}
            </Link>
          )}
          <button style={styles.logoutBtn} onClick={() => { setMenuOpen(false); handleLogout(); }}>
            {t('logout', 'Logout')}
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: '#fffdf7',
    borderBottom: '1px solid #dfd5be',
    boxShadow: '0 3px 0 rgba(38, 59, 58, 0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1040,
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    height: 68,
    position: 'relative',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    marginRight: 'auto',
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    objectFit: 'cover',
    boxShadow: 'none',
  },
  logoText: {
    fontWeight: 700,
    fontSize: 21,
    color: '#263b3a',
    letterSpacing: '-0.3px',
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    padding: 8,
    color: '#333',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  linksOpen: {},
  link: {
    color: '#526361',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 15,
    padding: '8px 4px',
  },
  saveBtn: {
    color: '#d86f45',
    fontWeight: 600,
  },
  logoutBtn: {
    background: 'none',
    border: '2px solid #c9574d',
    borderRadius: 8,
    color: '#c9574d',
    padding: '6px 16px',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
};

// Add responsive styles via a style tag injected once
if (typeof document !== 'undefined' && !document.getElementById('navbar-styles')) {
  const style = document.createElement('style');
  style.id = 'navbar-styles';
  style.textContent = `
    @media (max-width: 600px) {
      nav button[style] { /* hamburger */ }
    }
  `;
  document.head.appendChild(style);
}
