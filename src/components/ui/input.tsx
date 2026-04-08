'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-warm-700">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'block w-full rounded border border-[#dddddd] bg-white px-3 py-2 text-sm text-[rgba(0,0,0,0.9)] placeholder:text-warm-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/20',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
