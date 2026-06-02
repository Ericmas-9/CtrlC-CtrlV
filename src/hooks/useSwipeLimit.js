import { useState, useCallback, useRef } from 'react';

const FREE_SWIPE_LIMIT = 10;
const UNLOCK_CODES = ['PREMIUM2026', 'ILIMITADO', 'VIP100'];
const STORAGE_KEY = 'swipeData';
const USED_CODES_KEY = 'usedSwipeCodes';

const todayStr = () => new Date().toISOString().slice(0, 10);

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
};

const readUsedCodes = () => {
  try {
    const raw = localStorage.getItem(USED_CODES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeUsedCodes = (codes) => {
  try {
    localStorage.setItem(USED_CODES_KEY, JSON.stringify(codes));
  } catch { /* ignore */ }
};

const getOrInitData = () => {
  const today = todayStr();
  const stored = readStorage();
  if (!stored || stored.date !== today) {
    // Reset daily counter; preserve unlocked status across days
    const unlocked = stored?.unlocked ?? false;
    const fresh = { count: 0, date: today, unlocked };
    writeStorage(fresh);
    return fresh;
  }
  return stored;
};

export const useSwipeLimit = () => {
  const [data, setData] = useState(() => {
    try {
      return getOrInitData();
    } catch {
      // localStorage unavailable — allow all swipes
      return { count: 0, date: todayStr(), unlocked: true };
    }
  });

  const swipesRemaining = data.unlocked
    ? Infinity
    : Math.max(0, FREE_SWIPE_LIMIT - data.count);

  const canSwipe = data.unlocked || data.count < FREE_SWIPE_LIMIT;

  // Guard against double-counting if animation fires twice
  const swipeInFlight = useRef(false);

  const registerSwipe = useCallback(() => {
    if (swipeInFlight.current) return;
    swipeInFlight.current = true;
    setTimeout(() => { swipeInFlight.current = false; }, 400);

    setData(prev => {
      if (prev.unlocked) return prev;
      const today = todayStr();
      // Auto-reset if day changed since last render
      const base = prev.date !== today
        ? { count: 0, date: today, unlocked: false }
        : prev;
      const next = { ...base, count: base.count + 1 };
      writeStorage(next);
      return next;
    });
  }, []);

  const unlockWithCode = useCallback((code) => {
    const trimmed = code.trim().toUpperCase();
    const usedCodes = readUsedCodes();
    if (usedCodes.includes(trimmed)) return 'already_used';
    if (!UNLOCK_CODES.includes(trimmed)) return 'invalid';

    writeUsedCodes([...usedCodes, trimmed]);
    setData(prev => {
      const next = { ...prev, unlocked: true };
      writeStorage(next);
      return next;
    });
    return 'ok';
  }, []);

  const unlockDirect = useCallback(() => {
    setData(prev => {
      const next = { ...prev, unlocked: true };
      writeStorage(next);
      return next;
    });
  }, []);

  return { swipesRemaining, canSwipe, isUnlocked: data.unlocked, registerSwipe, unlockWithCode, unlockDirect };
};
