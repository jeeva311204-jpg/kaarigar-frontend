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
  cluster?: string;
}

export interface LoginDetails {
  role: UserRole;
  name: string;
  phone: string;
  otp: string;
  email?: string;
  clusterOrLocation?: string;
  craftOrSpecialty?: string;
  designationOrOrganization?: string;
}

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  isAuthenticated: boolean;
  loginWithPhone: (phone: string, otp: string, targetRole?: UserRole, customName?: string) => Promise<boolean>;
  loginWithDetails: (details: LoginDetails) => Promise<boolean>;
  logout: () => void;
}

export const defaultProfiles: Record<UserRole, UserProfile> = {
  artisan: {
    id: 'artisan-ramswaroop',
    name: 'Ramswaroop Sharma',
    phone: '+91 98290 44211',
    role: 'artisan',
    cluster: 'Jaipur Blue Pottery Cluster, Rajasthan',
    avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
    artisanData: initialArtisan
  },
  buyer: {
    id: 'buyer-anita',
    name: 'Anita Deshmukh',
    phone: '+91 98201 54321',
    email: 'anita.deshmukh@craftstudio.in',
    role: 'buyer',
    cluster: 'Patron & Collector, Mumbai Studio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  admin: {
    id: 'admin-civicsync',
    name: 'Savitri Bai',
    phone: '+91 98110 99882',
    email: 'coordinator@civicsync.org',
    role: 'admin',
    cluster: 'State Cluster Lead, Rajasthan Craft Mission',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('kaarigar_role') as UserRole;
    return (saved === 'artisan' || saved === 'buyer' || saved === 'admin') ? saved : 'artisan';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('kaarigar_authenticated');
    // Default to true for smooth first-time exploration, or restore saved state
    return saved !== null ? saved === 'true' : true;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem('kaarigar_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
    }
    const savedRole = (localStorage.getItem('kaarigar_role') as UserRole) || 'artisan';
    return defaultProfiles[savedRole] || defaultProfiles.artisan;
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('kaarigar_role', newRole);
    const updatedUser = { ...defaultProfiles[newRole] };
    setCurrentUser(updatedUser);
    localStorage.setItem('kaarigar_user', JSON.stringify(updatedUser));
  };

  const loginWithPhone = async (
    phone: string,
    otp: string,
    targetRole?: UserRole,
    customName?: string
  ): Promise<boolean> => {
    // In mock/demo mode, any valid 4-digit or 6-digit OTP succeeds
    if (otp.length >= 4) {
      const cleanPhone = phone.replace(/\D/g, '');
      const selectedRole = targetRole || role;

      // Check if phone matches any default profile
      let matchedProfile: UserProfile = { ...defaultProfiles[selectedRole] };
      const defaultForRole = defaultProfiles[selectedRole];
      const defaultClean = defaultForRole.phone.replace(/\D/g, '');

      if (cleanPhone === defaultClean) {
        matchedProfile = { ...defaultForRole };
      } else {
        // Create custom user profile for this phone number
        matchedProfile = {
          id: `${selectedRole}-${cleanPhone.slice(-6) || Date.now().toString(36)}`,
          name: customName || (selectedRole === 'artisan' ? `Artisan (${cleanPhone.slice(-4)})` : selectedRole === 'admin' ? `Admin Lead (${cleanPhone.slice(-4)})` : `Patron (${cleanPhone.slice(-4)})`),
          phone: `+91 ${cleanPhone.slice(-10)}`,
          role: selectedRole,
          cluster: selectedRole === 'artisan' ? 'Verified Craft Artisan' : selectedRole === 'admin' ? 'Regional Cluster Coordinator' : 'Craft Patron',
          avatar: defaultForRole.avatar,
          artisanData: selectedRole === 'artisan' ? initialArtisan : undefined
        };
      }

      setRoleState(selectedRole);
      setCurrentUser(matchedProfile);
      setIsAuthenticated(true);

      localStorage.setItem('kaarigar_role', selectedRole);
      localStorage.setItem('kaarigar_user', JSON.stringify(matchedProfile));
      localStorage.setItem('kaarigar_authenticated', 'true');
      return true;
    }
    return false;
  };

  const loginWithDetails = async (details: LoginDetails): Promise<boolean> => {
    if (details.otp.length >= 4) {
      const cleanPhone = details.phone.replace(/\D/g, '');
      const selectedRole = details.role;
      const defaultForRole = defaultProfiles[selectedRole];

      const userProfile: UserProfile = {
        id: `${selectedRole}-${cleanPhone.slice(-6) || Date.now().toString(36)}`,
        name: details.name.trim() || defaultForRole.name,
        phone: `+91 ${cleanPhone.slice(-10)}`,
        email: details.email || defaultForRole.email,
        role: selectedRole,
        cluster: details.clusterOrLocation || details.designationOrOrganization || defaultForRole.cluster,
        avatar: defaultForRole.avatar,
        artisanData: selectedRole === 'artisan' ? {
          ...initialArtisan,
          name: details.name.trim() || initialArtisan.name,
          phone: `+91 ${cleanPhone.slice(-10)}`,
          craftSpecialty: details.craftOrSpecialty || initialArtisan.craftSpecialty,
          location: details.clusterOrLocation || initialArtisan.location
        } : undefined
      };

      setRoleState(selectedRole);
      setCurrentUser(userProfile);
      setIsAuthenticated(true);

      localStorage.setItem('kaarigar_role', selectedRole);
      localStorage.setItem('kaarigar_user', JSON.stringify(userProfile));
      localStorage.setItem('kaarigar_authenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('kaarigar_authenticated', 'false');
  };

  return (
    <AuthContext.Provider value={{ role, setRole, currentUser, isAuthenticated, loginWithPhone, loginWithDetails, logout }}>
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
