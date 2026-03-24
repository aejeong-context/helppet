'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { bkend } from '@/lib/bkend';

import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, password: string, nickname: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      signup: async (email, password, _nickname) => {
        set({ isLoading: true });
        try {
          const res = await bkend.auth.signup({ email, password });
          if (res.accessToken) {
            localStorage.setItem('bkend_access_token', res.accessToken);
            localStorage.setItem('bkend_refresh_token', res.refreshToken);
          }
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
          if (res.accessToken) {
            localStorage.setItem('bkend_access_token', res.accessToken);
            localStorage.setItem('bkend_refresh_token', res.refreshToken);
          }
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
          localStorage.removeItem('bkend_access_token');
          localStorage.removeItem('bkend_refresh_token');
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
    }),
    {
      name: 'helppet-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
