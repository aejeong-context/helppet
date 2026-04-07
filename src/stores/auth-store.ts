'use client';

import { create } from 'zustand';
import { bkend, supabase } from '@/lib/bkend';

import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  signup: (email: string, password: string, nickname: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  initAuth: () => () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  hasHydrated: false,

  signup: async (email, password, nickname) => {
    set({ isLoading: true });
    try {
      const res = await bkend.auth.signup({ email, password, name: nickname });
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await bkend.auth.signin({ email, password });
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await bkend.auth.signout();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const res = await bkend.auth.me();
      set({ user: res, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  initAuth: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const res = await bkend.auth.me();
            set({ user: res, isAuthenticated: true, isLoading: false, hasHydrated: true });
          } catch {
            set({ user: null, isAuthenticated: false, isLoading: false, hasHydrated: true });
          }
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false, hasHydrated: true });
        }
      },
    );
    return () => subscription.unsubscribe();
  },
}));
