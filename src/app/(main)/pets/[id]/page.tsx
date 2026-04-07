'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePet } from '@/hooks/use-pets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { calculateAge } from '@/lib/utils';

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: pet, isLoading } = usePet(id);

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!pet) return <p className="text-center mt-20 text-gray-500">반려동물을 찾을 수 없습니다</p>;

  return (
    <div className="max-w-md mx-auto space-y-5">
      {/* 프로필 */}
      <Card padding="lg">
        <div className="text-center">
          {pet.profileImage ? (
            <OptimizedImage
              src={pet.profileImage}
              alt={pet.name}
              width={300}
              height={300}
              className="w-24 h-24 rounded-full mx-auto mb-3"
              fallback={pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
            />
          ) : (
            <div className="text-5xl mb-3">
              {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
            </div>
          )}
          <h1 className="text-2xl font-bold">{pet.name}</h1>
          {pet.isSenior && (
            <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              🧓 노견
            </span>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {pet.breed} · {calculateAge(pet.birthDate)} · {pet.weight}kg
          </p>
          {pet.conditions.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {pet.conditions.map((c) => (
                <ConditionBadge key={c} condition={c} size="md" />
              ))}
            </div>
          )}
          {pet.specialNotes && (
            <p className="text-sm text-gray-500 mt-3 bg-warm-100 rounded-lg p-2">{pet.specialNotes}</p>
          )}
        </div>
      </Card>

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-3 gap-3">
        <Link href={`/pets/${id}/medications`}>
          <Card className="text-center hover:border-primary-300 cursor-pointer">
            <span className="text-2xl">💊</span>
            <p className="text-xs font-medium mt-1">투약 관리</p>
          </Card>
        </Link>
        <Link href={`/pets/${id}/health`}>
          <Card className="text-center hover:border-primary-300 cursor-pointer">
            <span className="text-2xl">🩺</span>
            <p className="text-xs font-medium mt-1">건강기록</p>
          </Card>
        </Link>
        <Link href={`/pets/${id}/condition`}>
          <Card className="text-center hover:border-primary-300 cursor-pointer">
            <span className="text-2xl">📊</span>
            <p className="text-xs font-medium mt-1">컨디션 일지</p>
          </Card>
        </Link>
      </div>

      <div className="flex gap-3">
        <Link href={`/pets/${id}/edit`} className="flex-1">
          <Button variant="outline" className="w-full">편집</Button>
        </Link>
        <Link href="/pets" className="flex-1">
          <Button variant="outline" className="w-full">← 목록으로</Button>
        </Link>
      </div>
    </div>
  );
}
