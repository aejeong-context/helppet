import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  compact?: boolean;
};

export function Logo({ className, compact = false }: LogoProps) {
  const iconSize = compact ? 32 : 40;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {/* 심볼만 크롭: 이미지 상단 50%만 보여줌 */}
      <div
        className="relative overflow-hidden"
        style={{ width: iconSize, height: iconSize }}
      >
        <Image
          src="/oreore-logo.png"
          alt="오래오래"
          width={320}
          height={320}
          priority
          className="absolute top-0 left-1/2 -translate-x-1/2 w-auto brightness-[0.3] contrast-[1.2]"
          style={{ height: `${iconSize * 2.8}px` }}
        />
      </div>
      <span className={cn(
        'font-semibold tracking-tight text-primary-500',
        compact ? 'text-base' : 'text-lg',
      )}>
        오래오래
      </span>
    </div>
  );
}
