import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  compact?: boolean;
};

export function Logo({ className, compact = false }: LogoProps) {
  return (
    <div className={cn('inline-flex items-center', className)}>
      <Image
        src="/oreore-logo.png"
        alt="오래오래 로고"
        width={compact ? 160 : 220}
        height={compact ? 64 : 88}
        priority
        className={cn(
          'object-contain',
          compact ? 'h-[48px] w-auto' : 'h-[64px] w-auto',
        )}
      />
    </div>
  );
}
