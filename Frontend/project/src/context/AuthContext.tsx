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
  login: (email: string, password: string) => Promise<void>;
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

      // zawsze spróbuj pobrać profil (token lub cookie)
      const me = await apiClient.getMyProfile();
      const u =toUserFromPatient(me);

      setUser(u);
      localStorage.setItem('user_data', JSON.stringify(u));
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  })();
}, []);


const login = async (email: string, password: string) => {
  try {
    const resp: any = await apiClient.login({ email, password }); // mapuje username=email
console.log('login resp', resp);


    // jeśli backend zwraca token w JSON – zapisz go
    if (resp?.token)         apiClient.setAuthToken(resp.token);
    if (resp?.accessToken)   apiClient.setAuthToken(resp.accessToken);

    // niezależnie od tokenu – dociągnij profil (token albo cookie)
    const me = await apiClient.getMyProfile();
    const u = toUserFromPatient(me);
    setUser(u);
    localStorage.setItem('user_data', JSON.stringify(u));
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