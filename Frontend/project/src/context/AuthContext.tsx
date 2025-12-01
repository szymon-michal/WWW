import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/api';
import { apiClient } from '../lib/api';
import { PatientProfile } from '../types/api';



function toUserFromPatient(me: PatientProfile): User {
  return {
    id: me.id,
    email: me.email,
    role: 'PATIENT',                 // guard tego oczekuje
    firstName: me.firstName,
    lastName: me.lastName,
    createdAt: me.createdAt,         // ← DODANE
   // updatedAt: me.updatedAt,         // ← DODANE

    // jeśli w Twoim User są jeszcze wymagane pola – dodaj je tutaj:
    // phone: me.phone ?? '',
    // avatarUrl: me.avatarUrl ?? '',
    // status: 'ACTIVE',
  };
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  (async () => {
    try {
      // jeśli masz token w LS, podaj go klientowi
      const token = localStorage.getItem('auth_token');
      if (token) apiClient.setAuthToken(token);

      // Try to restore user from localStorage first
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const u = JSON.parse(userData);
        setUser(u);
        setIsLoading(false);
        return;
      }

      // If no cached user, try to fetch patient profile (only works for patients)
      try {
        const me = await apiClient.getMyProfile();
        const u = toUserFromPatient(me);
        setUser(u);
        localStorage.setItem('user_data', JSON.stringify(u));
      } catch {
        // Not a patient or no profile endpoint access
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  })();
}, []);


const login = async (username: string, password: string) => {
  try {
    const resp: any = await apiClient.login({ username, password });
console.log('login resp', resp);

    // Save user ID regardless of role
    if (resp?.id) {
      apiClient.setUserId(resp.id);
    }

    // Check if user is a patient by looking at roles
    const roles = resp?.roles || [];
    const isPatient = roles.includes('ROLE_PATIENT');

    if (isPatient) {
      // Only fetch patient profile for patients
      const me = await apiClient.getMyProfile();
      const u = toUserFromPatient(me);
      setUser(u);
      localStorage.setItem('user_data', JSON.stringify(u));
    } else {
      // For non-patients (dentists, admins), create a basic user object from login response
      const u: User = {
        id: resp.id,
        email: resp.email,
        role: roles.includes('ROLE_ADMIN') ? 'ADMIN' : roles.includes('ROLE_DENTIST') ? 'DENTIST' : 'STAFF',
        firstName: resp.firstName || '',
        lastName: resp.lastName || '',
        createdAt: resp.createdAt || new Date().toISOString(),
      };
      setUser(u);
      localStorage.setItem('user_data', JSON.stringify(u));
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};


  const logout = () => {
    setUser(null);
    apiClient.setAuthToken(null);
    apiClient.setUserId(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};