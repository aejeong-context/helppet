'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdoptions } from '@/hooks/use-adoptions';
import { AdoptionCard } from '@/components/features/adoption-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'adoption', label: '입양' },
  { key: 'foster', label: '임시보호' },
];

export default function AdoptionPage() {
  const [activeTab, setActiveTab] = useState('all');
  const filters: Record<string, string> = activeTab !== 'all'
    ? { type: activeTab, status: 'available' }
    : { status: 'available' };
  const { data: adoptions, isLoading } = useAdoptions(filters);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🏡 입양/임시보호</h1>
        <Link href="/adoption/new">
          <Button size="sm">공고 등록</Button>
        </Link>
      </div>

      {/* 탭 필터 */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" className="mt-10" />
      ) : !adoptions || adoptions.length === 0 ? (
        <EmptyState
          icon="🏡"
          title="등록된 공고가 없습니다"
          description="노견/환견에게 새 가족을 찾아주세요"
        />
      ) : (
        <div className="space-y-3">
          {adoptions.map((adoption) => (
            <AdoptionCard key={adoption._id} adoption={adoption} />
          ))}
        </div>
      )}
    </div>
  );
}
