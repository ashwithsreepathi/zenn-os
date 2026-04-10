'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { OSUser, UserRole } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextValue {
  user: OSUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo: string; error?: string }>;
  logout: () => void;
  impersonating: UserRole | null;
  impersonatingUserId: string | null;
  startImpersonation: (role: UserRole, userId?: string) => void;
  stopImpersonation: () => void;
  detectEmailDomain: (email: string) => { role: UserRole | null; isAdmin: boolean };
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Simulated email → role mapping
const EMAIL_ROLE_MAP: Record<string, UserRole> = {
  'ash@zennstudios.ca': 'admin',
  'sam.ko@zennstudios.ca': 'employee',
  'jordan@freelance.io': 'affiliate',
  'mia.chen@design.co': 'affiliate',
  'rex.audio@studio.com': 'affiliate',
  'info@montax.ca': 'client',
  'team@blackfridaybins.ca': 'client',
};

const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: '/admin/executive-dashboard',
  employee: '/team/assigned-board',
  affiliate: '/team/assigned-board',
  client: '/portal/client-dashboard',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<OSUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [impersonating, setImpersonating] = useState<UserRole | null>(null);
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(null);

  const detectEmailDomain = useCallback((email: string) => {
    const role = EMAIL_ROLE_MAP[email.toLowerCase()] ?? null;
    return { role, isAdmin: role === 'admin' };
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 900));

    const foundUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      setIsLoading(false);
      return { success: false, redirectTo: '/login', error: 'No account found for this email address.' };
    }

    // Check onboarding gate
    if (!foundUser.isOnboarded) {
      setUser(foundUser);
      setIsLoading(false);
      return { success: true, redirectTo: '/onboard' };
    }

    setUser(foundUser);
    setIsLoading(false);

    const redirectTo = ROLE_REDIRECTS[foundUser.role];
    return { success: true, redirectTo };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setImpersonating(null);
  }, []);

  const startImpersonation = useCallback((role: UserRole, userId?: string) => {
    setImpersonating(role);
    // If no specific userId provided, pick the first user with that role
    const targetUser = userId
      ? mockUsers.find(u => u.id === userId)
      : mockUsers.find(u => u.role === role);
    setImpersonatingUserId(targetUser?.id ?? null);
  }, []);

  const stopImpersonation = useCallback(() => {
    setImpersonating(null);
    setImpersonatingUserId(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        impersonating,
        impersonatingUserId,
        startImpersonation,
        stopImpersonation,
        detectEmailDomain,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
