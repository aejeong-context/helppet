'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAdoption } from '@/hooks/use-adoptions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const STATUS_LABELS: Record<string, string> = {
  available: '입양 가능',
  pending: '진행 중',
  completed: '완료',
};

export default function AdoptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: adoption, isLoading } = useAdoption(id);

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!adoption) return <p className="text-center mt-20 text-gray-500">공고를 찾을 수 없습니다</p>;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>← 목록</Button>

      {adoption.images && adoption.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {adoption.images.map((img, i) => (
            <OptimizedImage
              key={i}
              src={img}
              alt={`${adoption.petName}-${i + 1}`}
              width={400}
              height={300}
              className="w-64 h-48 rounded-lg flex-shrink-0"
            />
          ))}
        </div>
      )}

      <Card padding="lg">
        <div className="text-center mb-4">
          {!(adoption.images && adoption.images.length > 0) && (
            <div className="text-5xl mb-2">
              {adoption.species === 'dog' ? '🐕' : adoption.species === 'cat' ? '🐈' : '🐾'}
            </div>
          )}
          <h1 className="text-2xl font-bold">{adoption.petName}</h1>
          <span className="inline-block mt-1 text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
            {adoption.type === 'foster' ? '임시보호' : STATUS_LABELS[adoption.status]}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">품종</span>
            <span>{adoption.breed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">나이</span>
            <span>{adoption.age}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">지역</span>
            <span>{adoption.location}</span>
          </div>
          {adoption.conditions.length > 0 && (
            <div>
              <span className="text-gray-500 block mb-1">질병/상태</span>
              <div className="flex flex-wrap gap-1">
                {adoption.conditions.map((c) => (
                  <ConditionBadge key={c} condition={c} size="md" />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="font-semibold mb-2">상세 설명</h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{adoption.description}</p>
      </Card>

      {adoption.medicalHistory && (
        <Card padding="lg">
          <h2 className="font-semibold mb-2">의료 이력</h2>
          <p className="text-sm leading-relaxed">{adoption.medicalHistory}</p>
        </Card>
      )}

      <Card padding="lg" className="bg-primary-50 border-primary-200">
        <h2 className="font-semibold mb-1">연락처</h2>
        <p className="text-sm">{adoption.contactInfo}</p>
      </Card>
    </div>
  );
}
