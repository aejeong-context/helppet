'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, isLoading, isAuthenticated, login, signup, logout, fetchMe } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    router.push('/dashboard');
  };

  const handleSignup = async (email: string, password: string, nickname: string) => {
    await signup(email, password, nickname);
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    fetchMe,
  };
}
