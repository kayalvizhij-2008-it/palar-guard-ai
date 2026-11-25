import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/api';

export interface Organization {
  id: string;
  name: string;
  category: 'Government' | 'Academic' | 'NGO' | 'Community';
  domain: string;
}

export const AVAILABLE_ORGANIZATIONS: Organization[] = [
  { id: 'org-wrd', name: 'Tamil Nadu Water Resources Dept (WRD)', category: 'Government', domain: 'wrd.tn.gov.in' },
  { id: 'org-cit', name: 'Chennai Institute of Technology Research Group', category: 'Academic', domain: 'citchennai.edu.in' },
  { id: 'org-ngo', name: 'Palar River Basin Watch (Citizen NGO)', category: 'NGO', domain: 'palarwatch.org' },
  { id: 'org-fed', name: 'Ranipet Farmers Water Federation', category: 'Community', domain: 'ranipetfarmers.org' },
];

interface AuthContextType {
  user: User | null;
  role: UserRole;
  organization: Organization;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<User>;
  registerAccount: (fullName: string, email: string, password: string, role?: 'Community Reporter' | 'Viewer') => Promise<User>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  const [organization, setOrganization] = useState<Organization>(AVAILABLE_ORGANIZATIONS[0]);

  const refreshSession = async () => {
    const token = localStorage.getItem('palar_token');
    if (!token) {
      setUser(null);
      setIsLoadingSession(false);
      return;
    }
    try {
      const me = await apiService.getMe();
      setUser(me);
      localStorage.setItem('palar_user', JSON.stringify(me));
    } catch {
      localStorage.removeItem('palar_token');
      localStorage.removeItem('palar_user');
      setUser(null);
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const loginWithCredentials = async (email: string, password: string): Promise<User> => {
    const res = await apiService.login(email, password);
    setUser(res.user);
    return res.user;
  };

  const registerAccount = async (
    fullName: string,
    email: string,
    password: string,
    role: 'Community Reporter' | 'Viewer' = 'Community Reporter'
  ): Promise<User> => {
    await apiService.register(fullName, email, password, role);
    const loginRes = await apiService.login(email, password);
    setUser(loginRes.user);
    return loginRes.user;
  };

  const logout = () => {
    localStorage.removeItem('palar_token');
    localStorage.removeItem('palar_user');
    setUser(null);
  };

  const switchOrganization = (orgId: string) => {
    const found = AVAILABLE_ORGANIZATIONS.find((o) => o.id === orgId);
    if (found) setOrganization(found);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: (user?.role as UserRole) || 'Viewer',
        organization,
        isAuthenticated: !!user,
        isLoadingSession,
        loginWithCredentials,
        registerAccount,
        logout,
        refreshSession,
        switchOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
