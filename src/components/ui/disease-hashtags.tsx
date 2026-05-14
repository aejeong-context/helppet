import { cn } from '@/lib/utils';

export interface DiseaseHashtagsProps {
  tags: string[];
  className?: string;
  emptyState?: 'hidden' | 'placeholder';
  emptyPlaceholder?: string;
}

const SEPARATORS = /[\s/,&]+/g;

function formatTag(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const stripped = trimmed.replace(/^#+/, '');
  const normalized = stripped.replace(SEPARATORS, '_');
  return `#${normalized}`;
}

export function DiseaseHashtags({
  tags,
  className,
  emptyState = 'hidden',
  emptyPlaceholder = '등록된 질환이 없습니다',
}: DiseaseHashtagsProps) {
  const formatted = tags
    .map(formatTag)
    .filter((t): t is string => t !== null);

  if (formatted.length === 0) {
    if (emptyState === 'hidden') return null;
    return (
      <p className={cn('text-xs text-gray-400', className)}>
        {emptyPlaceholder}
      </p>
    );
  }

  return (
    <ul
      role="list"
      aria-label="보유 질환"
      className={cn(
        'flex flex-wrap gap-x-1.5 gap-y-0.5 text-sm text-rose-700/90',
        className,
      )}
    >
      {formatted.map((tag, idx) => (
        <li key={`${tag}-${idx}`}>{tag}</li>
      ))}
    </ul>
  );
}
