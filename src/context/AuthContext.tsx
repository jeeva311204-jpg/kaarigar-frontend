import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Artisan } from '../types';
import { initialArtisan } from '../lib/mockData';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  artisanData?: Artisan;
}

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  isAuthenticated: boolean;
  loginWithPhone: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
}

const defaultProfiles: Record<UserRole, UserProfile> = {
  artisan: {
    id: 'artisan-ramswaroop',
    name: 'Ramswaroop Sharma',
    phone: '+91 98290 44211',
    role: 'artisan',
    avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
    artisanData: initialArtisan
  },
  buyer: {
    id: 'buyer-anita',
    name: 'Anita Deshmukh',
    phone: '+91 98201 54321',
    email: 'anita.deshmukh@craftstudio.in',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  admin: {
    id: 'admin-civicsync',
    name: 'Savitri Bai Cluster Lead',
    phone: '+91 98110 99882',
    email: 'coordinator@civicsync.org',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('kaarigar_role') as UserRole;
    return (saved === 'artisan' || saved === 'buyer' || saved === 'admin') ? saved : 'artisan';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('kaarigar_role', newRole);
  };

  const currentUser = defaultProfiles[role];

  const loginWithPhone = async (phone: string, otp: string): Promise<boolean> => {
    // In mock/fallback mode, any 4-digit or 6-digit OTP succeeds
    if (otp.length >= 4) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ role, setRole, currentUser, isAuthenticated, loginWithPhone, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
