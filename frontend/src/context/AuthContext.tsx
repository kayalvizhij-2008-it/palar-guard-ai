import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const DEFAULT_USER: User = {
  id: 1,
  email: "admin@palarguard.ai",
  full_name: "Kayalvizhi J",
  role: "Administrator",
  is_active: true
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);

  const login = (email: string, role: UserRole = "Administrator") => {
    const newUser: User = {
      id: Math.floor(Math.random() * 1000) + 1,
      email,
      full_name: email.split('@')[0].toUpperCase(),
      role,
      is_active: true
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || "Viewer",
      isAuthenticated: !!user,
      login,
      logout,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
