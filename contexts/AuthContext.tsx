'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { OSUser, UserRole } from '@/lib/types';

interface AuthContextValue {
  user: OSUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo: string; error?: string }>;
  logout: () => Promise<void>;
  impersonating: UserRole | null;
  impersonatingUserId: string | null;
  startImpersonation: (role: UserRole, userId?: string) => void;
  stopImpersonation: () => void;
  detectEmailDomain: (email: string) => { role: UserRole | null; isAdmin: boolean };
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: '/admin/executive-dashboard',
  employee: '/team/assigned-board',
  affiliate: '/team/assigned-board',
  client: '/portal/client-dashboard',
};

// Map supabase os_users row → OSUser shape used throughout the app
function mapDbUser(row: Record<string, unknown>): OSUser {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as UserRole,
    title: (row.title as string) ?? '',
    avatar: (row.avatar_url as string) ?? '',
    status: (row.status as 'active' | 'limited' | 'ooo' | 'blacklisted') ?? 'active',
    isOnboarded: (row.is_onboarded as boolean) ?? false,
    skills: (row.skills as string[]) ?? [],
    joinedAt: (row.joined_at as string) ?? new Date().toISOString(),
    reliabilityScore: (row.reliability_score as number) ?? 100,
    nudgeCount: (row.nudge_count as number) ?? 0,
    currentLoad: (row.current_load as number) ?? 0,
    company: (row.company as string) ?? '',
    timezone: (row.timezone as string) ?? 'America/Toronto',
    serviceSubscriptions: (row.service_subscriptions as unknown as import('@/lib/types').ServiceSubscription[]) ?? [],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<OSUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true on mount until session check
  const [impersonating, setImpersonating] = useState<UserRole | null>(null);
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(null);

  // ─── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        const { data } = await supabase
          .from('os_users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data && mounted) setUser(mapDbUser(data));
      }
      if (mounted) setIsLoading(false);
    }

    loadSession();

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setImpersonating(null);
        setImpersonatingUserId(null);
        return;
      }
      if (session?.user) {
        const { data } = await supabase
          .from('os_users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) setUser(mapDbUser(data));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        setIsLoading(false);
        return {
          success: false,
          redirectTo: '/login',
          error: error?.message ?? 'Authentication failed.',
        };
      }

      // Fetch profile from os_users
      const { data: profile, error: profileError } = await supabase
        .from('os_users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        // User exists in auth but not in os_users yet — redirect to onboard
        setIsLoading(false);
        return { success: true, redirectTo: '/onboard' };
      }

      const osUser = mapDbUser(profile);
      setUser(osUser);
      setIsLoading(false);

      if (!osUser.isOnboarded) return { success: true, redirectTo: '/onboard' };
      return { success: true, redirectTo: ROLE_REDIRECTS[osUser.role] };
    } catch {
      setIsLoading(false);
      return { success: false, redirectTo: '/login', error: 'Unexpected error. Please try again.' };
    }
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setImpersonating(null);
    setImpersonatingUserId(null);
  }, []);

  // ─── Impersonation (admin-only) ────────────────────────────────────────────
  const startImpersonation = useCallback((role: UserRole, userId?: string) => {
    setImpersonating(role);
    setImpersonatingUserId(userId ?? null);
  }, []);

  const stopImpersonation = useCallback(() => {
    setImpersonating(null);
    setImpersonatingUserId(null);
  }, []);

  // ─── Email domain sniff (UI hint on login page) ────────────────────────────
  const detectEmailDomain = useCallback((email: string) => {
    const domain = email.split('@')[1]?.toLowerCase() ?? '';
    const isAdmin = domain === 'zennstudios.com' || domain === 'zennstudios.ca';
    // We can't know the role from domain alone with real auth, but keep the UX hint
    const role: UserRole | null = isAdmin ? 'admin' : null;
    return { role, isAdmin };
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
