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
        width={compact ? 240 : 320}
        height={compact ? 96 : 128}
        priority
        className={cn(
          'object-contain',
          compact ? 'h-[72px] w-auto' : 'h-[96px] w-auto',
          'brightness-[0.3] contrast-[1.2]',
        )}
      />
    </div>
  );
}
