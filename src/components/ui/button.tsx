'use client';

import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-accent-focus/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        {
          'bg-primary-500 text-white shadow-cal-btn hover:opacity-70': variant === 'primary',
          'bg-white text-primary-500 shadow-cal hover:bg-warm-100': variant === 'secondary',
          'bg-white text-primary-500 shadow-cal hover:bg-warm-50': variant === 'outline',
          'text-warm-400 hover:bg-warm-100 hover:text-warm-700': variant === 'ghost',
          'bg-red-500 text-white shadow-cal-btn hover:opacity-70': variant === 'danger',
        },
        {
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-2.5 text-[15px]': size === 'lg',
        },
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
