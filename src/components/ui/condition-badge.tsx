import { cn } from '@/lib/utils';

interface ConditionBadgeProps {
  condition: string;
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
}

export function ConditionBadge({ condition, size = 'sm', removable, onRemove }: ConditionBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-red-50 text-red-600 font-semibold tracking-wide',
        {
          'px-2 py-0.5 text-[11px]': size === 'sm',
          'px-2.5 py-0.5 text-xs': size === 'md',
        },
      )}
    >
      {condition}
      {removable && (
        <button onClick={onRemove} className="ml-1 text-red-300 hover:text-red-500">
          &times;
        </button>
      )}
    </span>
  );
}
