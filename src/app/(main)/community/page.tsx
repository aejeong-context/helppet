'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePosts } from '@/hooks/use-posts';
import { PostCard } from '@/components/features/post-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CONDITION_CATEGORIES, cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'all', label: '전체' },
  ...Object.entries(CONDITION_CATEGORIES).map(([key, label]) => ({ key, label })),
];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: posts, isLoading } = usePosts(selectedCategory);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">💬 커뮤니티</h1>
        <Link href="/community/new">
          <Button size="sm">글쓰기</Button>
        </Link>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              selectedCategory === cat.key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" className="mt-10" />
      ) : !posts || posts.length === 0 ? (
        <EmptyState
          icon="💬"
          title="아직 게시글이 없습니다"
          description="첫 번째 글을 작성해보세요"
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
