import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { Member } from '../types';

interface RegisterData {
  name: string;
  phone: string;
  password: string;
  email?: string;
  birthday?: string;
  referralCode?: string;
}

interface AuthContextType {
  member: Member | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requestOtp: (phone: string) => Promise<string>;
  verifyOtp: (phone: string, code: string) => Promise<{ needsPassword: boolean }>;
  setPassword: (password: string) => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; email?: string; birthday?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.data?.member) {
        setMember(res.data.data.member);
      } else {
        setMember(null);
      }
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (identifier: string, password: string) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data?.success && res.data?.data?.member) {
      setMember(res.data.data.member);
    }
  };

  const register = async (data: RegisterData) => {
    const res = await api.post('/auth/register', data);
    if (res.data?.success && res.data?.data?.member) {
      setMember(res.data.data.member);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setMember(null);
    }
  };

  const requestOtp = async (phone: string): Promise<string> => {
    const res = await api.post('/auth/otp/request', { phone });
    return res.data?.message || 'Verification code sent';
  };

  const verifyOtp = async (phone: string, code: string): Promise<{ needsPassword: boolean }> => {
    const res = await api.post('/auth/otp/verify', { phone, code });
    if (res.data?.success && res.data?.data?.member) {
      setMember(res.data.data.member);
      return { needsPassword: !!res.data.data.needsPassword };
    }
    return { needsPassword: false };
  };

  const setPassword = async (password: string) => {
    await api.post('/auth/set-password', { password });
    await fetchProfile();
  };

  const updateProfile = async (data: { name?: string; phone?: string; email?: string; birthday?: string }) => {
    const res = await api.put('/auth/profile', data);
    if (res.data?.success && res.data?.data?.member) {
      setMember(res.data.data.member);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        member,
        loading,
        isAuthenticated: !!member,
        isAdmin: member?.role === 'admin',
        login,
        register,
        logout,
        refreshUser: fetchProfile,
        requestOtp,
        verifyOtp,
        setPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
