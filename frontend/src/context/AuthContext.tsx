import React, { createContext, useContext, useState, useEffect } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface AdminUser {
  name: string;
  role: string;
}

interface AuthContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
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

  /** Mock login — accepts any non-empty username + password */
  const login = async (username: string, password: string): Promise<boolean> => {
    if (!username.trim() || !password.trim()) return false;

    const user: AdminUser = {
      name: username.includes('@') ? username.split('@')[0] : username,
      role: 'प्रशासक',
    };

    setIsAdmin(true);
    setAdminUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return true;
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
