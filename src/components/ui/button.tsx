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
        'inline-flex items-center justify-center rounded font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        {
          'bg-primary-500 text-white hover:bg-primary-600': variant === 'primary',
          'bg-[rgba(0,0,0,0.05)] text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.08)]': variant === 'secondary',
          'border border-[rgba(0,0,0,0.1)] bg-white text-warm-700 hover:bg-warm-100': variant === 'outline',
          'text-warm-500 hover:bg-warm-100': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
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
