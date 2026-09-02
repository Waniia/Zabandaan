import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('zabandaan_token');
    const savedUser = localStorage.getItem('zabandaan_user');
    const guestMode = localStorage.getItem('zabandaan_guest');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch { /* ignore */ }
    } else if (guestMode === 'true') {
      setIsGuest(true);
      const guestData = localStorage.getItem('zabandaan_guest_data');
      if (guestData) {
        try { setUser(JSON.parse(guestData)); } catch { /* ignore */ }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('zabandaan_token', token);
    localStorage.setItem('zabandaan_user', JSON.stringify(userData));
    localStorage.removeItem('zabandaan_guest');
    localStorage.removeItem('zabandaan_guest_data');
    setUser(userData);
    setIsGuest(false);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('zabandaan_token', token);
    localStorage.setItem('zabandaan_user', JSON.stringify(userData));
    localStorage.removeItem('zabandaan_guest');
    localStorage.removeItem('zabandaan_guest_data');
    setUser(userData);
    setIsGuest(false);
    return userData;
  };

  const continueAsGuest = (name) => {
    const guestUser = { name: name || 'Guest', id: 'guest_' + Date.now(), isGuest: true };
    localStorage.setItem('zabandaan_guest', 'true');
    localStorage.setItem('zabandaan_guest_data', JSON.stringify(guestUser));
    setUser(guestUser);
    setIsGuest(true);
    return guestUser;
  };

  const convertGuest = async (name, email, password, progress) => {
    const res = await api.post('/auth/convert-guest', { name, email, password, progress });
    const { token, user: userData } = res.data;
    localStorage.setItem('zabandaan_token', token);
    localStorage.setItem('zabandaan_user', JSON.stringify(userData));
    localStorage.removeItem('zabandaan_guest');
    localStorage.removeItem('zabandaan_guest_data');
    setUser(userData);
    setIsGuest(false);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('zabandaan_token');
    localStorage.removeItem('zabandaan_user');
    localStorage.removeItem('zabandaan_guest');
    localStorage.removeItem('zabandaan_guest_data');
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, login, register, continueAsGuest, convertGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
