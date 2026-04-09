import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  compact?: boolean;
};

export function Logo({ className, compact = false }: LogoProps) {
  const h = compact ? 60 : 72;

  return (
    <div className={cn('inline-flex items-center', className)}>
      <Image
        src="/oreore-symbol.png"
        alt="오래오래"
        width={240}
        height={131}
        priority
        className="object-contain brightness-[0.35] contrast-[1.3]"
        style={{ height: h, width: 'auto', margin: `0 -${h * 0.35}px` }}
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
