import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

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
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  switchOrganization: (orgId: string) => void;
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
  const [organization, setOrganization] = useState<Organization>(AVAILABLE_ORGANIZATIONS[0]);

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

  const switchOrganization = (orgId: string) => {
    const found = AVAILABLE_ORGANIZATIONS.find(o => o.id === orgId);
    if (found) setOrganization(found);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || "Viewer",
      organization,
      isAuthenticated: !!user,
      login,
      logout,
      switchRole,
      switchOrganization
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
