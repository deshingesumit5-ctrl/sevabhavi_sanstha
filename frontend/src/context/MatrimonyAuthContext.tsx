import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, type MatrimonyAuthResponse, type MatrimonyQuotaData } from '../services/api';

interface MatrimonyAuthContextType {
  matrimonyUser: MatrimonyAuthResponse | null;
  isLoggedIn: boolean;
  favorites: number[];
  quota: MatrimonyQuotaData | null;
  login: (identifier: string, password: string) => Promise<string | null>;
  logout: () => void;
  toggleFavorite: (profileId: number) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
  refreshQuota: () => Promise<void>;
}

const MatrimonyAuthContext = createContext<MatrimonyAuthContextType | undefined>(undefined);

const SESSION_KEY = 'sevabhavi_matrimony_session';

export const MatrimonyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matrimonyUser, setMatrimonyUser] = useState<MatrimonyAuthResponse | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [quota, setQuota] = useState<MatrimonyQuotaData | null>(null);

  const refreshFavorites = useCallback(async () => {
    try {
      const favs = await api.getMatrimonyFavorites();
      setFavorites(favs);
    } catch {
      // not logged in or network error
    }
  }, []);

  const refreshQuota = useCallback(async () => {
    try {
      const q = await api.getMatrimonyQuota();
      setQuota(q);
    } catch {
      // ignore if unauthenticated
    }
  }, []);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MatrimonyAuthResponse;
        setMatrimonyUser(parsed);
        refreshFavorites();
        refreshQuota();
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [refreshFavorites, refreshQuota]);

  const login = async (identifier: string, password: string): Promise<string | null> => {
    if (!identifier.trim() || !password.trim()) {
      return 'कृपया मोबाईल किंवा ईमेल आणि पासवर्ड भरा.';
    }

    try {
      const data = await api.matrimonyLogin(identifier.trim(), password.trim());
      setMatrimonyUser(data);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      await Promise.all([refreshFavorites(), refreshQuota()]);
      return null;
    } catch (err: any) {
      return err.message || 'लॉगिन अयशस्वी झाले.';
    }
  };

  const logout = () => {
    setMatrimonyUser(null);
    setFavorites([]);
    setQuota(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const toggleFavorite = async (profileId: number): Promise<boolean> => {
    if (!matrimonyUser) {
      throw new Error('कृपया आवडीची प्रोफाइल जोडण्यासाठी प्रथम लॉगिन करा.');
    }
    const res = await api.toggleMatrimonyFavorite(profileId);
    if (res.favorite) {
      setFavorites((prev) => [...prev.filter((id) => id !== profileId), profileId]);
    } else {
      setFavorites((prev) => prev.filter((id) => id !== profileId));
    }
    return res.favorite;
  };

  return (
    <MatrimonyAuthContext.Provider
      value={{
        matrimonyUser,
        isLoggedIn: !!matrimonyUser,
        favorites,
        quota,
        login,
        logout,
        toggleFavorite,
        refreshFavorites,
        refreshQuota,
      }}
    >
      {children}
    </MatrimonyAuthContext.Provider>
  );
};

export const useMatrimonyAuth = (): MatrimonyAuthContextType => {
  const ctx = useContext(MatrimonyAuthContext);
  if (!ctx) throw new Error('useMatrimonyAuth must be used inside <MatrimonyAuthProvider>');
  return ctx;
};

export default MatrimonyAuthContext;
