'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: '대시보드', icon: '🏠' },
  { href: '/pets', label: '내 반려동물', icon: '🐾' },
  { href: '/community', label: '커뮤니티', icon: '💬' },
  { href: '/adoption', label: '입양/임보', icon: '🏡' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, hasHydrated, initAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  useEffect(() => {
    if (hasHydrated && !isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hasHydrated, isLoading, isAuthenticated, router]);

  if (!hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen pb-16 sm:pb-0">
      {/* Desktop Header */}
      <header className="hidden sm:block border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 flex items-center justify-between h-14">
          <Link href="/dashboard" className="text-xl font-bold text-primary-600">
            오래오래
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700">
            설정
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      {/* Mobile Bottom Tab */}
      <nav className="fixed bottom-0 left-0 right-0 sm:hidden border-t border-gray-200 bg-white">
        <div className="flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center py-2 text-xs',
                pathname.startsWith(item.href)
                  ? 'text-primary-600'
                  : 'text-gray-400',
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
