import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api';

const PointsContext = createContext(null);

export function PointsProvider({ children }) {
  const { user, isGuest } = useAuth();
  const [points, setPoints] = useState(0);
  const [animating, setAnimating] = useState(false);

  const addPoints = useCallback(async (category, difficulty, levelId) => {
    // Points only ever increase
    if (isGuest || !user) {
      // Guest mode: track locally
      const key = `guest_progress_${category}_${difficulty || 'none'}`;
      const stored = JSON.parse(localStorage.getItem(key) || '{"completed":[]}');
      if (!stored.completed.includes(levelId)) {
        stored.completed.push(levelId);
        localStorage.setItem(key, JSON.stringify(stored));
        setPoints(prev => {
          const next = prev + 1;
          setAnimating(true);
          setTimeout(() => setAnimating(false), 400);
          return next;
        });
      }
      return;
    }

    try {
      const res = await api.post('/points', { category, difficulty, level_id: levelId });
      if (res.data.points !== undefined) {
        setPoints(prev => {
          const newPoints = res.data.points;
          if (newPoints > prev) {
            setAnimating(true);
            setTimeout(() => setAnimating(false), 400);
          }
          return Math.max(prev, newPoints);
        });
      }
    } catch (err) {
      console.error('Add points error:', err);
    }
  }, [isGuest, user]);

  const setTotalPoints = useCallback((total) => {
    setPoints(Math.max(points, total));
  }, [points]);

  const loadPoints = useCallback(async () => {
    if (isGuest || !user) {
      // Sum up guest progress from localStorage
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('guest_progress_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            total += (data.completed || []).length;
          } catch { /* ignore */ }
        }
      }
      setPoints(total);
      return;
    }

    try {
      const res = await api.get('/points');
      setPoints(res.data.points || 0);
    } catch (err) {
      console.error('Load points error:', err);
    }
  }, [isGuest, user]);

  const getGuestProgress = useCallback((category, difficulty) => {
    const key = `guest_progress_${category}_${difficulty || 'none'}`;
    const stored = JSON.parse(localStorage.getItem(key) || '{"completed":[]}');
    return stored.completed || [];
  }, []);

  const getAllGuestProgress = useCallback(() => {
    const progress = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('guest_progress_')) {
        try {
          const parts = key.replace('guest_progress_', '').split('_');
          const data = JSON.parse(localStorage.getItem(key));
          progress.push({
            category: parts[0],
            difficulty: parts[1] === 'none' ? null : parts[1],
            completed_levels: data.completed || []
          });
        } catch { /* ignore */ }
      }
    }
    return progress;
  }, []);

  return (
    <PointsContext.Provider value={{ points, animating, addPoints, setTotalPoints, loadPoints, getGuestProgress, getAllGuestProgress }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const ctx = useContext(PointsContext);
  if (!ctx) throw new Error('usePoints must be used within PointsProvider');
  return ctx;
}
