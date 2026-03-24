import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { OptimizedImage } from '@/components/ui/optimized-image';

import type { Adoption } from '@/types';

interface AdoptionCardProps {
  adoption: Adoption;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  available: { text: '입양 가능', color: 'bg-green-100 text-green-700' },
  pending: { text: '진행 중', color: 'bg-yellow-100 text-yellow-700' },
  completed: { text: '완료', color: 'bg-gray-100 text-gray-500' },
};

export function AdoptionCard({ adoption }: AdoptionCardProps) {
  const status = STATUS_LABELS[adoption.status] || STATUS_LABELS.available;

  return (
    <Link href={`/adoption/${adoption._id}`}>
      <Card className="hover:border-primary-300 transition-colors cursor-pointer">
        <div className="flex items-start gap-3">
          {adoption.images && adoption.images.length > 0 ? (
            <OptimizedImage
              src={adoption.images[0]}
              alt={adoption.petName}
              thumbnail
              thumbnailSize={80}
              className="w-14 h-14 rounded-lg flex-shrink-0"
              fallback={adoption.species === 'dog' ? '🐕' : adoption.species === 'cat' ? '🐈' : '🐾'}
            />
          ) : (
            <div className="text-3xl">
              {adoption.species === 'dog' ? '🐕' : adoption.species === 'cat' ? '🐈' : '🐾'}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{adoption.petName}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                {adoption.type === 'foster' ? '임시보호' : status.text}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {adoption.breed} · {adoption.age} · {adoption.location}
            </p>
            {adoption.conditions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {adoption.conditions.map((cond) => (
                  <ConditionBadge key={cond} condition={cond} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
