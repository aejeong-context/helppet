import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  compact?: boolean;
};

export function Logo({ className, compact = false }: LogoProps) {
  const iconSize = compact ? 28 : 36;

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <Image
        src="/oreore-symbol.png"
        alt="오래오래"
        width={iconSize}
        height={iconSize}
        priority
        className="object-contain brightness-[0.35] contrast-[1.3]"
        style={{ height: iconSize, width: 'auto' }}
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
