import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

// ── Types ──────────────────────────────────────────────────────────────────────
interface AdminUser {
  name: string;
  role: string;
  token?: string;
  email?: string;
}

interface AuthContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  login: (email: string, password: string) => Promise<string | null>; // Returns error message or null if success
  logout: () => void;
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'sevabhavi_admin_session';

// ── Provider ───────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AdminUser;
        setIsAdmin(true);
        setAdminUser(parsed);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  /** Real login — calls backend auth API */
  const login = async (email: string, password: string): Promise<string | null> => {
    if (!email.trim() || !password.trim()) {
      return 'कृपया ईमेल आणि पासवर्ड भरा.';
    }

    try {
      const data = await api.login(email.trim(), password.trim());
      const user: AdminUser = {
        name: data.name || email.split('@')[0],
        role: data.role || 'प्रशासक',
        token: data.token,
        email: data.email || email,
      };

      setIsAdmin(true);
      setAdminUser(user);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return null; // No error = success
    } catch (err: any) {
      return err.message || 'युझरनेम किंवा पासवर्ड चुकीचा आहे. पुन्हा प्रयत्न करा.';
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, adminUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
