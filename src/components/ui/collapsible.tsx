'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Collapsible({ title, defaultOpen = false, right, children, className }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={className}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-2"
      >
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-[10px] text-warm-300 transition-transform',
            open ? 'rotate-90' : '',
          )}>
            ▶
          </span>
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        </div>
        {right && <div onClick={(e) => e.stopPropagation()}>{right}</div>}
      </button>
      {open && children}
    </section>
  );
}
