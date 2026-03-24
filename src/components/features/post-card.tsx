import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { CONDITION_CATEGORIES, formatDate } from '@/lib/utils';

import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/community/${post._id}`}>
      <Card className="hover:border-primary-300 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-xs text-primary-600 font-medium">
              {CONDITION_CATEGORIES[post.category as keyof typeof CONDITION_CATEGORIES] || post.category}
            </span>
            <h3 className="font-medium mt-1 line-clamp-1">{post.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
          </div>
          {post.images && post.images.length > 0 && (
            <OptimizedImage
              src={post.images[0]}
              alt={post.title}
              thumbnail
              thumbnailSize={80}
              className="w-16 h-16 rounded-lg flex-shrink-0"
            />
          )}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span>{formatDate(post.createdAt)}</span>
          <span>❤️ {post.likeCount}</span>
          <span>💬 {post.commentCount}</span>
        </div>
      </Card>
    </Link>
  );
}
