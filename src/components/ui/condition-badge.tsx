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
        'inline-flex items-center rounded-full bg-red-50 text-red-700 font-medium',
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        },
      )}
    >
      {condition}
      {removable && (
        <button onClick={onRemove} className="ml-1 text-red-400 hover:text-red-600">
          &times;
        </button>
      )}
    </span>
  );
}
