import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  compact?: boolean;
};

export function Logo({ className, compact = false }: LogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Image
        src="/oreore-logo.png"
        alt="오래오래 로고"
        width={compact ? 32 : 40}
        height={compact ? 18 : 22}
        priority
        className={cn(
          'object-contain',
          compact ? 'h-[18px] w-auto' : 'h-[22px] w-auto',
        )}
      />
      <span className={cn(
        'font-semibold tracking-tight text-primary-500',
        compact ? 'text-base' : 'text-lg',
      )}>
        오래오래
      </span>
    </div>
  );
}
