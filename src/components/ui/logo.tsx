import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  compact?: boolean;
};

export function Logo({ className, compact = false }: LogoProps) {
  if (compact) {
    return <LogoMark className={className} />;
  }

  return (
    <div className={cn('inline-flex', className)}>
      <Image
        src="/oreore-logo.png"
        alt="ORE-ORE 로고"
        width={1408}
        height={792}
        priority
        className="h-auto w-[280px]"
      />
    </div>
  );
}

type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <Image
      src="/oreore-logo.png"
      alt="ORE-ORE 로고"
      width={1408}
      height={792}
      priority
      className={cn('h-auto w-[120px]', className)}
    />
  );
}
