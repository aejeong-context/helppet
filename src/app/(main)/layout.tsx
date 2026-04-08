'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: '대시보드', icon: '🏠' },
  { href: '/pets', label: '내 반려동물', icon: '🐾' },
  { href: '/community', label: '커뮤니티', icon: '💬' },
  { href: '/adoption', label: '입양/임보', icon: '🏡' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // TODO: 개발 완료 후 인증 로직 복원

  return (
    <div className="min-h-screen bg-white pb-16 sm:pb-0">
      {/* Desktop Header */}
      <header className="hidden sm:block bg-white shadow-cal">
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between h-14">
          <Link href="/dashboard" className="text-lg font-semibold text-primary-500 tracking-tight">
            오래오래
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-semibold transition-all',
                  pathname.startsWith(item.href)
                    ? 'bg-primary-500 text-white shadow-cal-btn'
                    : 'text-warm-400 hover:text-primary-500 hover:bg-warm-100',
                )}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/settings" className="text-sm font-medium text-warm-300 hover:text-primary-500 transition-colors">
            설정
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>

      {/* Mobile Bottom Tab */}
      <nav className="fixed bottom-0 left-0 right-0 sm:hidden bg-white shadow-cal">
        <div className="flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center py-2.5 text-xs font-semibold transition-colors',
                pathname.startsWith(item.href)
                  ? 'text-primary-500'
                  : 'text-warm-300',
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
