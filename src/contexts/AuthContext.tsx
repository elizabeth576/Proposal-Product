'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/api/supabaseClient';
import { authApi } from '@/lib/api';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface ProductUser {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  role_id: number;
}

interface AuthContextValue {
  user: SupabaseUser | null;
  productUser: ProductUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; organization_name: string; organization_size: string }) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [productUser, setProductUser] = useState<ProductUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  const isAuthenticated = !!session;

  // Fetch product_user data
  const fetchProductUser = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('product_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setProductUser(data);
    }
  }, []);

  // Initialize auth state and subscribe to changes
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchProductUser(initialSession.user.id);
        }
      } catch (err) {
        console.error('Failed to get initial session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProductUser(newSession.user.id);
        } else {
          setProductUser(null);
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setProductUser(null);
          router.push('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProductUser, router]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await authApi.login({ email, password });
      // Session will be set by onAuthStateChange listener
      // Wait briefly to ensure session is propagated
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to login';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    full_name: string;
    organization_name: string;
    organization_size: string;
  }) => {
    setError(null);
    setIsLoading(true);

    try {
      await authApi.register(data);
      // Session will be set by onAuthStateChange listener
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await authApi.logout();
      // Redirect handled by onAuthStateChange
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to logout';
      setError(message);
    }
  }, []);

  // Map role_id to UserRole enum
  const getRoleFromId = useCallback((roleId: number): UserRole | null => {
    const roleMap: Record<number, UserRole> = {
      1: UserRole.SUPER_ADMIN,
      2: UserRole.ADMIN,
      3: UserRole.MANAGER,
      4: UserRole.MEMBER,
      5: UserRole.VIEWER,
    };
    return roleMap[roleId] || null;
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!productUser) return false;
    const userRole = getRoleFromId(productUser.role_id);
    if (!userRole) return false;
    return roles.includes(userRole);
  }, [productUser, getRoleFromId]);

  const value: AuthContextValue = {
    user,
    productUser,
    session,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// Auth Guard Component
// ============================================================================

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
