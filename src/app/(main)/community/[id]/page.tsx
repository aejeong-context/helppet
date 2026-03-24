'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePost, useLikePost } from '@/hooks/use-posts';
import { CommentList } from '@/components/features/comment-list';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { CONDITION_CATEGORIES, formatDate } from '@/lib/utils';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: post, isLoading } = usePost(id);
  const likePost = useLikePost();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const likedPosts: string[] = JSON.parse(localStorage.getItem('liked_posts') || '[]');
    setLiked(likedPosts.includes(id));
  }, [id]);

  const handleLike = () => {
    if (!post) return;
    likePost.mutate(
      { id, currentCount: post.likeCount, liked },
      {
        onSuccess: () => {
          const likedPosts: string[] = JSON.parse(localStorage.getItem('liked_posts') || '[]');
          if (liked) {
            localStorage.setItem('liked_posts', JSON.stringify(likedPosts.filter((p) => p !== id)));
          } else {
            localStorage.setItem('liked_posts', JSON.stringify([...likedPosts, id]));
          }
          setLiked(!liked);
        },
      },
    );
  };

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!post) return <p className="text-center mt-20 text-gray-500">게시글을 찾을 수 없습니다</p>;

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>← 목록</Button>

      <Card padding="lg">
        <div className="mb-4">
          <span className="text-xs text-primary-600 font-medium">
            {CONDITION_CATEGORIES[post.category as keyof typeof CONDITION_CATEGORIES] || post.category}
          </span>
          <h1 className="text-xl font-bold mt-1">{post.title}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
            <span>{formatDate(post.createdAt)}</span>
            <button
              onClick={handleLike}
              disabled={likePost.isPending}
              className="flex items-center gap-0.5 hover:text-red-500 transition-colors"
            >
              {liked ? '❤️' : '🤍'} {post.likeCount}
            </button>
            <span>💬 {post.commentCount}</span>
          </div>
        </div>
        <div className="border-t pt-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
        {post.images && post.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.images.map((img, i) => (
              <OptimizedImage
                key={i}
                src={img}
                alt={`${post.title}-${i + 1}`}
                width={600}
                height={400}
                className="w-full rounded-lg max-h-80"
              />
            ))}
          </div>
        )}
        {post.tags.length > 0 && (
          <div className="flex gap-1.5 mt-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Card>

      <CommentList postId={id} />
    </div>
  );
}
