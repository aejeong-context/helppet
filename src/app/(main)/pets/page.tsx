'use client';

import Link from 'next/link';
import { usePets } from '@/hooks/use-pets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { calculateAge } from '@/lib/utils';

export default function PetsPage() {
  const { data: pets, isLoading } = usePets();

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🐾 내 반려동물</h1>
        <Link href="/pets/new">
          <Button size="sm">+ 등록</Button>
        </Link>
      </div>

      {!pets || pets.length === 0 ? (
        <EmptyState
          icon="🐾"
          title="등록된 반려동물이 없습니다"
          description="반려동물을 등록하여 건강관리를 시작하세요"
          action={
            <Link href="/pets/new">
              <Button>반려동물 등록하기</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pets.map((pet) => (
            <Link key={pet._id} href={`/pets/${pet._id}`}>
              <Card className="hover:border-primary-300 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">
                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{pet.name}</h3>
                      {pet.isSenior && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          노견
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {pet.breed} · {calculateAge(pet.birthDate)} · {pet.weight}kg
                    </p>
                    {pet.conditions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pet.conditions.map((cond) => (
                          <ConditionBadge key={cond} condition={cond} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
